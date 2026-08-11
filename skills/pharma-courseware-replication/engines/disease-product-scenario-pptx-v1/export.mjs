#!/usr/bin/env node
/**
 * disease-product-scenario-pptx-v1  (self-contained for pharma-content-skills)
 *
 * Port of production-library/engines/disease-product-scenario-pptx-v1/export.mjs
 * Geometry (bbox) follows design / layout.json; **delivery type scale** follows the
 * openable gold editable PPTX (see tokens.json type_scale.ssot + design_to_delivery).
 * Rendering: pptxgenjs (no @oai/artifact-tool / monorepo path dependency).
 *
 * Required:
 *   --data <script.json>  --out <deck.pptx>
 * Optional:
 *   --style <tokens.json>  --qa <dir>  (qa optional; no PNG montage without extra tools)
 */
import fs from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import PptxGenJS from "pptxgenjs";
import sizeOf from "image-size";

const ENGINE_DIR = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_STYLE = path.join(ENGINE_DIR, "tokens.json");
const FONT_PATCH = path.join(ENGINE_DIR, "patch-pptx-font.py");

const GOLD_THEME_ID = "theme.product.andrographolide-drop-pills";
const GOLD_FORBIDDEN = [
  "穿心莲", "内酯滴丸", "风热证", "复方氨酚烷胺片", "安宫牛黄丸",
  "熊胆薄荷含片", "97%", "95%", "5–10分钟", "5-10分钟", "38℃",
];

function fail(message, code = 2) {
  console.error(`ERROR: ${message}`);
  process.exit(code);
}

function cliValue(flag) {
  const index = process.argv.indexOf(flag);
  if (index < 0) return null;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) fail(`${flag} requires a value`);
  return path.resolve(value);
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
  console.log(`disease-product-scenario-pptx-v1

Required:
  --data <script.json>
  --out  <deck.pptx>
Optional:
  --style <tokens.json>   default: ./tokens.json
  --qa    <directory>     write report.json only (no PNG QA without artifact-tool)
`);
  process.exit(0);
}

const dataPath = cliValue("--data");
const outPath = cliValue("--out");
const qaDir = cliValue("--qa");
const stylePath = cliValue("--style") ?? DEFAULT_STYLE;
if (!dataPath) fail("--data is required");
if (!outPath) fail("--out is required");

const dataBytes = await fs.readFile(dataPath).catch((e) => fail(`cannot read data: ${e.message}`));
const styleBytes = await fs.readFile(stylePath).catch((e) => fail(`cannot read style: ${e.message}`));
let data, style;
try { data = JSON.parse(dataBytes.toString("utf8")); } catch (e) { fail(`invalid data JSON: ${e.message}`); }
try { style = JSON.parse(styleBytes.toString("utf8")); } catch (e) { fail(`invalid style JSON: ${e.message}`); }

function at(object, dottedPath) {
  return dottedPath.split(".").reduce((c, k) => c?.[k], object);
}
function requireString(dottedPath) {
  const v = at(data, dottedPath);
  if (typeof v !== "string" || !v.trim()) fail(`data.${dottedPath} must be a non-empty string`);
  return v.trim();
}
function requireArray(dottedPath, { min = 1, max = Infinity } = {}) {
  const v = at(data, dottedPath);
  if (!Array.isArray(v) || v.length < min || v.length > max) {
    fail(`data.${dottedPath} must contain ${min}..${max === Infinity ? "∞" : max} items`);
  }
  return v;
}
function requireObject(dottedPath) {
  const v = at(data, dottedPath);
  if (!v || typeof v !== "object" || Array.isArray(v)) fail(`data.${dottedPath} must be an object`);
  return v;
}

if (data.schema_version !== "disease-product-scenario-script/v1") {
  fail('data.schema_version must equal "disease-product-scenario-script/v1"');
}
requireObject("meta");
requireString("meta.theme_id");
requireString("meta.organization");
requireString("meta.brand_label");
requireString("meta.internal_notice");
requireObject("pages");
requireObject("disease");
requireObject("product");
requireObject("weighted");
requireArray("agenda", { min: 3, max: 6 });
requireArray("disease.symptoms", { min: 3, max: 5 });
requireArray("disease.comparison.rows", { min: 2, max: 5 });
requireArray("disease.treatment_principles", { min: 3, max: 6 });
requireArray("disease.subtypes", { min: 2, max: 4 });
requireArray("product.information", { min: 4, max: 6 });
requireArray("product.advantages", { min: 3, max: 4 });
requireArray("product.summary.groups", { min: 2, max: 3 });
requireArray("product.audience", { min: 3, max: 3 });
requireArray("product.consultation", { min: 3, max: 4 });
requireArray("product.scenarios", { min: 1, max: 4 });
requireArray("product.daily_care", { min: 3, max: 5 });
requireArray("weighted.items", { min: 1, max: 3 });
requireArray("weighted.comparison.products", { min: 2, max: 3 });
requireArray("weighted.comparison.rows", { min: 2, max: 5 });

const isAuthorizedGold = data.meta.gold_sample === true && data.meta.theme_id === GOLD_THEME_ID;
const serializedData = JSON.stringify(data);
const inputForbiddenHits = isAuthorizedGold
  ? []
  : GOLD_FORBIDDEN.filter((t) => serializedData.includes(t));
if (inputForbiddenHits.length) {
  fail(`non-gold input contains settled gold tokens: ${inputForbiddenHits.join(", ")}`, 3);
}

const dataDir = path.dirname(dataPath);
const PLACEHOLDERS_DIR = path.join(ENGINE_DIR, "assets", "placeholders");
const SAMPLES_ASSETS_DIR = path.join(ENGINE_DIR, "samples", "assets");
const PLACEHOLDER_FILES = {
  packshot: "packshot.png",
  "cover-product": "cover-product.png",
  disease: "disease.png",
  symptom: "symptom.png",
  audience: "audience.png",
  care: "care.png",
  default: "disease.png",
};

function placeholderPath(kind = "default") {
  const file = PLACEHOLDER_FILES[kind] || PLACEHOLDER_FILES.default;
  return path.join(PLACEHOLDERS_DIR, file);
}

/** Infer semantic slot kind from JSON path / filename for placeholder fallback. */
function inferImageKind(owner = "", inputPath = "") {
  const s = `${owner} ${inputPath}`.toLowerCase();
  if (/locked_image|cover-product|pages\.cover\.image|pages\.cover\.locked/.test(s)) return "cover-product";
  if (/symptom/.test(s)) return "symptom";
  if (/audience/.test(s)) return "audience";
  if (/daily_care|care[-_]|care\.png/.test(s)) return "care";
  if (/disease|agenda|definition|building/.test(s)) return "disease";
  if (/packshot|product\.image|product_image|weighted|comparison\.products|product-summary|pages\.product_summary/.test(s)) {
    return "packshot";
  }
  if (/cover/.test(s)) return "cover-product";
  return "default";
}

/**
 * Resolve an image path against data dir, basename under data/assets,
 * engine samples/assets, then placeholders. Returns absolute path or null.
 */
function resolveExistingPath(relativeOrAbsolute) {
  if (typeof relativeOrAbsolute !== "string" || !relativeOrAbsolute.trim()) return null;
  const raw = relativeOrAbsolute.trim();
  const base = path.basename(raw);
  const candidates = [];
  if (path.isAbsolute(raw)) {
    candidates.push(raw);
  } else {
    candidates.push(path.resolve(dataDir, raw));
    candidates.push(path.resolve(dataDir, "assets", base));
    candidates.push(path.join(SAMPLES_ASSETS_DIR, base));
    candidates.push(path.join(PLACEHOLDERS_DIR, base));
  }
  // also try samples when absolute path is missing (cross-machine gold scripts)
  if (path.isAbsolute(raw)) {
    candidates.push(path.join(SAMPLES_ASSETS_DIR, base));
    candidates.push(path.join(ENGINE_DIR, "assets", "gold-sample", base));
    candidates.push(path.join(PLACEHOLDERS_DIR, base));
  }
  for (const c of candidates) {
    try {
      if (fsSync.existsSync(c)) return c;
    } catch { /* continue */ }
  }
  return null;
}

const assetRecords = [];
function resolveAsset(relativeOrAbsolute, owner) {
  if (typeof relativeOrAbsolute !== "string" || !relativeOrAbsolute.trim()) return null;
  const resolved = resolveExistingPath(relativeOrAbsolute)
    ?? (path.isAbsolute(relativeOrAbsolute)
      ? relativeOrAbsolute
      : path.resolve(dataDir, relativeOrAbsolute));
  assetRecords.push({ owner, input: relativeOrAbsolute, resolved });
  return resolved;
}

function isImageFieldKey(key) {
  return key === "image" || key === "locked_image" || key === "product_image" || key.endsWith("_image");
}

/** Owners auto-filled with engine placeholders (empty field → default image). */
const defaultImageFills = [];

/**
 * Fill empty image fields used by layouts so pages never ship blank slots.
 * Paths point at engine placeholders (absolute); real assets still preferred when set.
 */
function ensureDefaultImageFields(root) {
  const fill = (obj, key, kind, owner) => {
    if (!obj || typeof obj !== "object") return;
    const cur = obj[key];
    if (typeof cur === "string" && cur.trim()) return;
    obj[key] = placeholderPath(kind);
    defaultImageFills.push({ owner: owner || key, kind });
  };
  const pages = root.pages || {};
  fill(pages.cover, "image", "cover-product", "pages.cover.image");
  fill(pages.agenda, "image", "disease", "pages.agenda.image");
  fill(pages.disease_definition, "image", "disease", "pages.disease_definition.image");
  fill(pages.product_summary, "image", "packshot", "pages.product_summary.image");
  fill(pages.audience, "product_image", "packshot", "pages.audience.product_image");
  fill(root.product, "image", "packshot", "product.image");
  (root.disease?.symptoms || []).forEach((s, i) => fill(s, "image", "symptom", `disease.symptoms[${i}].image`));
  (root.product?.audience || []).forEach((a, i) => fill(a, "image", "audience", `product.audience[${i}].image`));
  (root.product?.scenarios || []).forEach((sc, i) => fill(sc, "image", "disease", `product.scenarios[${i}].image`));
  // daily_care：金样 5 条布局 = 前 2 有图、后 3 无图；勿强行给后 3 填图
  const care = root.product?.daily_care || [];
  const goldCareLayout = care.length === 5
    && care[0]?.image && care[1]?.image
    && care.slice(2).every((item) => !(typeof item?.image === "string" && item.image.trim()));
  if (!goldCareLayout) {
    care.forEach((c, i) => fill(c, "image", "care", `product.daily_care[${i}].image`));
  }
  (root.weighted?.items || []).forEach((w, i) => fill(w, "image", "packshot", `weighted.items[${i}].image`));
  (root.weighted?.comparison?.products || []).forEach((p, i) => {
    fill(p, "image", "packshot", `weighted.comparison.products[${i}].image`);
  });
}

ensureDefaultImageFields(data);

function findAssetRefs(value, owner = "data", records = []) {
  if (!value || typeof value !== "object") return records;
  if (Array.isArray(value)) {
    value.forEach((item, i) => findAssetRefs(item, `${owner}[${i}]`, records));
    return records;
  }
  for (const [key, child] of Object.entries(value)) {
    if (isImageFieldKey(key) && typeof child === "string" && child.trim()) {
      records.push({
        owner: `${owner}.${key}`,
        input: child,
        resolved: resolveAsset(child, `${owner}.${key}`),
      });
    } else {
      findAssetRefs(child, `${owner}.${key}`, records);
    }
  }
  return records;
}
const discoveredAssets = findAssetRefs(data);
// Missing paths → engine placeholders (never leave empty image slots).
const missingAssets = [];
const placeholderFallbacks = [];
for (const rec of discoveredAssets) {
  const exists = rec.resolved && fsSync.existsSync(rec.resolved);
  if (!exists) {
    missingAssets.push(rec);
    const kind = inferImageKind(rec.owner, rec.input);
    const ph = placeholderPath(kind);
    rec.resolved = fsSync.existsSync(ph) ? ph : null;
    rec.used_placeholder = !!rec.resolved;
    if (rec.resolved) placeholderFallbacks.push({ owner: rec.owner, kind, placeholder: rec.resolved });
  }
}

// --- tokens / canvas ---
// Production engine uses 1280×720 px. pptxgenjs uses inches; 1in = 96px.
const Wpx = style.canvas?.width_px ?? 1280;
const Hpx = style.canvas?.height_px ?? 720;
const PX = 1 / 96;
const W = Wpx * PX; // 13.333
const H = Hpx * PX; // 7.5
const FONT = style.font_family ?? "Microsoft YaHei";
/**
 * Delivery font scale SSOT = 可编辑金样 PPTX embedded sz (not layout.json alone).
 * Code/layout still use design-unit pt (chrome 27, body 21…); gold editable PPTX
 * writes those values × 0.75 (e.g. 27→20.25). All sizes pass through pt() once.
 * Override: tokens.json type_scale.design_to_delivery (default 0.75).
 */
const DESIGN_TO_DELIVERY = Number(
  style.type_scale?.design_to_delivery ?? style.design_to_delivery ?? 0.75,
);
if (!(DESIGN_TO_DELIVERY > 0 && DESIGN_TO_DELIVERY <= 2)) {
  fail(`type_scale.design_to_delivery must be in (0, 2], got ${DESIGN_TO_DELIVERY}`);
}
/** design-unit pt → delivery pt written into PPTX (OOXML hundredths). */
function pt(designPt) {
  if (designPt == null || Number.isNaN(Number(designPt))) return designPt;
  return Math.round(Number(designPt) * DESIGN_TO_DELIVERY * 100) / 100;
}
const C = {
  primary: (style.colors?.primary ?? "#009900").replace("#", ""),
  deep: (style.colors?.primary_deep ?? "#066A2F").replace("#", ""),
  secondary: (style.colors?.secondary ?? "#45A817").replace("#", ""),
  mint: (style.colors?.mint ?? "#E9F7EE").replace("#", ""),
  pale: (style.colors?.pale ?? "#F4FAF5").replace("#", ""),
  ink: (style.colors?.ink ?? "#1F2A24").replace("#", ""),
  muted: (style.colors?.muted ?? "#5A6B61").replace("#", ""),
  line: (style.colors?.line ?? "#D9E9DF").replace("#", ""),
  red: (style.colors?.red ?? "#E60012").replace("#", ""),
  white: (style.colors?.white ?? "#FFFFFF").replace("#", ""),
  teal: (style.colors?.cover_teal ?? "#006D58").replace("#", ""),
  blue: (style.colors?.cover_blue ?? "#176A91").replace("#", ""),
};

const pptx = new PptxGenJS();
pptx.defineLayout({ name: "HD", width: W, height: H });
pptx.layout = "HD";
pptx.author = data.meta.organization || "internal";
pptx.title = data.pages?.cover?.title || data.meta.theme_id;

const slideRecords = [];
let pageNumber = 0;

// helpers: px → in
const x = (px) => px * PX;
const y = (px) => px * PX;
const s = (px) => px * PX;

function hex(c) { return c.startsWith("#") ? c.replace("#","") : c; }

function addShape(slide, opts) {
  // opts: {type, px coords, fill, line, lineSize, shadow}
  // fill "none" => fully transparent fill (hollow outline shapes like cover orbits)
  const o = {
    x: x(opts.l), y: y(opts.t), w: s(opts.w), h: s(opts.h),
    fill: opts.fill === "none"
      ? { color: C.white, transparency: 100 }
      : opts.fill
        ? { color: hex(opts.fill) }
        : undefined,
    line: opts.line
      ? { color: hex(opts.line), width: opts.lineWidth ?? 1, transparency: opts.lineTransparency ?? 0 }
      : { color: hex(opts.fill && opts.fill !== "none" ? opts.fill : C.white), width: 0 },
  };
  if (opts.radius) o.rectRadius = Math.min(opts.radius / 96, 0.3);
  if (opts.shadow) {
    o.shadow = { type: "outer", color: "000000", blur: 4, offset: 1, opacity: 0.08 };
  }
  const type = opts.type || (opts.radius ? pptx.ShapeType.roundRect : pptx.ShapeType.rect);
  slide.addShape(type, o);
}

function addText(slide, value, opts) {
  const o = {
    x: x(opts.l), y: y(opts.t), w: s(opts.w), h: s(opts.h),
    fontFace: FONT,
    // Single choke point: design-unit size → delivery pt matching gold editable PPTX
    fontSize: pt(opts.size ?? 18),
    color: hex(opts.color || C.ink),
    bold: !!opts.bold,
    align: opts.align || "left",
    valign: opts.vAlign || "top",
    margin: 0,
    // 单行 chip/序号默认关 wrap，避免方框换行把居中顶偏
    wrap: opts.wrap !== undefined ? !!opts.wrap : true,
  };
  // 形状内文字（ellipse 序号点等）：比「底形 + 独立文本框」更易水平/垂直居中
  if (opts.shape) o.shape = opts.shape;
  if (opts.fill) {
    o.fill = { color: hex(opts.fill) };
    if (opts.radius && !opts.shape) {
      // pptxgenjs text box fill is rect; use shape behind for rounded
      addShape(slide, {
        l: opts.l, t: opts.t, w: opts.w, h: opts.h,
        fill: opts.fill, line: opts.line, lineWidth: opts.lineWidth ?? 0, radius: opts.radius,
      });
    } else {
      o.fill = { color: hex(opts.fill) };
      if (opts.line) o.line = { color: hex(opts.line), width: opts.lineWidth ?? 1 };
      else if (opts.shape) o.line = { color: hex(opts.fill), width: 0 };
    }
  } else if (opts.line) {
    o.line = { color: hex(opts.line), width: opts.lineWidth ?? 1 };
  }
  if (Array.isArray(value)) {
    // run 数组：[{ text, bold?, color?, breakLine?, blankLine? }]
    // breakLine = 换行；blankLine = 段后空行（对齐可编辑金样 \n\n）
    // 每段显式 bold/color，避免继承父级 bold 导致整段加粗、强调丢失
    const runs = [];
    for (const run of value) {
      if (!run || (run.text == null && !run.breakLine && !run.blankLine)) continue;
      runs.push({
        text: String(run.text ?? ""),
        options: {
          bold: run.bold === true,
          color: run.color ? hex(run.color) : hex(opts.color || C.ink),
          ...(run.breakLine || run.blankLine ? { breakLine: true } : {}),
        },
      });
      // 金样多段正文：段间空行 = 额外空段落
      if (run.blankLine) {
        runs.push({ text: "", options: { breakLine: true } });
      }
    }
    slide.addText(runs.length ? runs : [{ text: "", options: {} }], o);
    return;
  }
  slide.addText(String(value ?? ""), o);
}

/** Flatten run array or string for places that still need plain text. */
function plainText(value) {
  if (Array.isArray(value)) {
    return value.map((r) => String(r?.text ?? "")).join("");
  }
  return String(value ?? "");
}

/**
 * pptxgenjs 的 sizing.cover 用「显示框尺寸」当图尺寸，srcRect 恒为 0（等于拉伸）。
 * 真 cover/contain 用 PIL 预裁/几何放置，再无 sizing 嵌入。
 */
function materializeImageFit(srcPath, boxW, boxH, mode = "cover") {
  const key = crypto.createHash("md5").update(`${srcPath}|${boxW}x${boxH}|${mode}`).digest("hex").slice(0, 12);
  const out = path.join(os.tmpdir(), `dps-imgfit-${key}.png`);
  if (fsSync.existsSync(out)) return out;
  const py = `
from PIL import Image
src = ${JSON.stringify(srcPath)}
out = ${JSON.stringify(out)}
bw, bh = ${Math.round(boxW)}, ${Math.round(boxH)}
mode = ${JSON.stringify(mode)}
im = Image.open(src).convert("RGBA")
w, h = im.size
if mode == "contain":
    scale = min(bw / w, bh / h)
    nw, nh = max(1, int(round(w * scale))), max(1, int(round(h * scale)))
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (bw, bh), (255, 255, 255, 0))
    canvas.paste(im, ((bw - nw) // 2, (bh - nh) // 2), im)
    canvas.save(out)
else:
    scale = max(bw / w, bh / h)
    nw, nh = max(1, int(round(w * scale))), max(1, int(round(h * scale)))
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left, top = (nw - bw) // 2, (nh - bh) // 2
    im.crop((left, top, left + bw, top + bh)).save(out)
`;
  const r = spawnSync("python3", ["-c", py], { encoding: "utf8" });
  if (r.status !== 0 || !fsSync.existsSync(out)) {
    throw new Error(`image fit failed (${mode}): ${r.stderr || r.stdout || "unknown"}`);
  }
  return out;
}

/**
 * Embed an image; never leave a blank slot.
 * Resolution order: discoveredAssets → path search → kind placeholder → mint【图位】.
 * @param {string|null|undefined} inputPath
 * @param {{left:number,top:number,width:number,height:number}} frame
 * @param {"contain"|"cover"|"product-summary"} fit
 * @param {string} kind placeholder kind when path empty/missing
 */
function addImageSafe(slide, inputPath, frame, fit = "contain", kind = "default") {
  const ph = placeholderPath(kind);
  let finalPath = null;
  if (inputPath && String(inputPath).trim()) {
    const resolved = path.isAbsolute(inputPath) ? inputPath : path.resolve(dataDir, inputPath);
    const hit = discoveredAssets.find(
      (a) => a.input === inputPath || a.resolved === resolved || a.resolved === inputPath,
    );
    if (hit?.resolved && fsSync.existsSync(hit.resolved)) {
      finalPath = hit.resolved;
    } else {
      finalPath = resolveExistingPath(inputPath);
    }
  }
  if (!finalPath || !fsSync.existsSync(finalPath)) {
    finalPath = fsSync.existsSync(ph) ? ph : null;
  }
  if (!finalPath) {
    // last resort: mint box (placeholders missing from install)
    addShape(slide, {
      l: frame.left, t: frame.top, w: frame.width, h: frame.height,
      fill: C.mint, line: C.line, lineWidth: 1, radius: 12,
    });
    addText(slide, "【图位】", {
      l: frame.left, t: frame.top + frame.height / 2 - 16,
      w: frame.width, h: 32, size: 14, color: C.muted, align: "center",
    });
    return null;
  }
  try {
    let drawPath = finalPath;
    let drawFrame = frame;
    // pptxgenjs sizing.cover 用显示框当图尺寸 → srcRect 恒 0（拉伸）。
    // contain：几何信箱（对齐金样封面 24,0,1231×720）
    // cover：PIL 预裁到框再嵌入（对齐金样目录左栏）
    if (fit === "contain") {
      try {
        const dim = sizeOf(fsSync.readFileSync(finalPath));
        const scale = Math.min(frame.width / dim.width, frame.height / dim.height);
        const dw = Math.round(dim.width * scale);
        const dh = Math.round(dim.height * scale);
        drawFrame = {
          // floor 对齐金样封面 left=24（round 会得到 25）
          left: frame.left + Math.floor((frame.width - dw) / 2),
          top: frame.top + Math.floor((frame.height - dh) / 2),
          width: dw,
          height: dh,
        };
      } catch { /* keep frame */ }
    } else if (fit === "cover") {
      try {
        drawPath = materializeImageFit(finalPath, frame.width, frame.height, "cover");
      } catch { /* keep original; may stretch */ }
    }
    // "product-summary" / other: full-frame embed (same as pre-fallback behavior)
    slide.addImage({
      path: drawPath,
      x: x(drawFrame.left), y: y(drawFrame.top), w: s(drawFrame.width), h: s(drawFrame.height),
    });
    return finalPath;
  } catch {
    // embed failed → try placeholder once more, else mint box
    if (finalPath !== ph && fsSync.existsSync(ph)) {
      try {
        slide.addImage({
          path: ph,
          x: x(frame.left), y: y(frame.top), w: s(frame.width), h: s(frame.height),
        });
        return ph;
      } catch { /* fall through */ }
    }
    addShape(slide, {
      l: frame.left, t: frame.top, w: frame.width, h: frame.height,
      fill: C.mint, line: C.line, lineWidth: 1, radius: 12,
    });
    addText(slide, "【图位】", {
      l: frame.left, t: frame.top + frame.height / 2 - 16,
      w: frame.width, h: 32, size: 14, color: C.muted, align: "center",
    });
    return null;
  }
}

function card(slide, l, t, w, h, opts = {}) {
  addShape(slide, {
    l, t, w, h,
    fill: opts.fill || C.white,
    line: opts.line || C.line,
    lineWidth: opts.lineWidth ?? 1,
    radius: opts.radius ?? 12,
    shadow: opts.shadow,
  });
}

function titleBodyCard(slide, l, t, w, h, titleValue, bodyValue, opts = {}) {
  card(slide, l, t, w, h, { fill: opts.fill || C.white, line: opts.line || C.line });
  addShape(slide, { l, t, w: 7, h, fill: opts.accent || C.primary, radius: 3 });
  addText(slide, titleValue, {
    l: l + 24, t: t + 16, w: w - 44, h: 36,
    size: opts.titleSize ?? 19, bold: true, color: opts.titleColor || C.deep,
  });
  addText(slide, bodyValue, {
    l: l + 24, t: t + 56, w: w - 44, h: h - 70,
    size: opts.bodySize ?? 17, color: opts.bodyColor || C.ink,
  });
}

function tableCell(slide, value, l, t, w, h, opts = {}) {
  addShape(slide, {
    l, t, w, h,
    fill: opts.fill || C.white,
    line: opts.line || C.line,
    lineWidth: 1,
  });
  addText(slide, value, {
    l: l + 8, t: t + 6, w: w - 16, h: h - 12,
    size: opts.size ?? 16, bold: !!opts.bold, color: opts.color || C.ink,
    align: opts.align || "center", vAlign: "middle",
  });
}

// Gold surface-card idiom (from 可编辑重建版 layout.json):
// white surface + 4×26 accent at (l+10,t+14) + bold title + divider + body.
const GOLD_INK_SOFT = "33413A";
function surfaceCard(slide, l, t, w, h, titleValue, bodyValue, opts = {}) {
  card(slide, l, t, w, h, { fill: opts.fill || C.white, line: opts.line || C.line });
  addShape(slide, { l: l + 10, t: t + 14, w: 4, h: 26, fill: opts.accent || C.primary });
  addText(slide, titleValue, {
    l: l + 24, t: t + 12, w: w - 44, h: 38,
    size: opts.titleSize ?? 23, bold: true, color: opts.titleColor || GOLD_INK_SOFT, vAlign: "middle",
  });
  addShape(slide, { l: l + 24, t: t + 58, w: w - 44, h: 1, fill: C.line });
  addText(slide, bodyValue, {
    l: l + 24, t: t + 70, w: w - 44, h: h - 84,
    size: opts.bodySize ?? 21, color: opts.bodyColor || GOLD_INK_SOFT,
  });
}

function addChrome(slide, section, titleValue) {
  // white bg via slide fill
  if (section) {
    addShape(slide, { l: 32, t: 18, w: 68, h: 42, fill: C.deep, radius: 10 });
    addText(slide, section, {
      l: 32, t: 18, w: 68, h: 42, size: 20, color: C.white, bold: true,
      align: "center", vAlign: "middle",
    });
  }
  addText(slide, titleValue, {
    l: 118, t: 15, w: 830, h: 48, size: 27, bold: true, color: C.ink, vAlign: "middle",
  });
  addText(slide, data.meta.brand_label, {
    l: 1000, t: 19, w: 245, h: 38, size: 14, bold: true, color: C.secondary, align: "right", vAlign: "middle",
  });
  addShape(slide, { l: 32, t: 73, w: 1216, h: 1, fill: C.line });
  addShape(slide, { l: 118, t: 70, w: 74, h: 5, fill: C.primary, radius: 2 });
  addText(slide, data.meta.internal_notice, {
    // design 12 → delivery 9（可编辑金样页脚）
    l: 860, t: 688, w: 300, h: 20, size: 12, color: C.muted, align: "right",
  });
  // 页码对齐金样观感 `02 / 18`（生产 export 仅序号；保留 total 格式）
  addText(slide, String(pageNumber).padStart(2, "0") + " / " + String(totalPages).padStart(2, "0"), {
    l: 1174, t: 688, w: 70, h: 20, size: 12, color: C.muted, align: "right",
  });
}

function newSlide(type, page, section = null) {
  pageNumber += 1;
  const slide = pptx.addSlide();
  slide.background = { color: C.white };
  if (type !== "cover" && !page.chromeless) addChrome(slide, page.section ?? section, page.title);
  slideRecords.push({ index: pageNumber, type, title: page.title });
  return slide;
}

// 页脚（notice + 页码），chromeless 页（如金样目录）单独调用
// 金样目录页脚：notice [1010,688,160,22] + page [1180,688,64,22]
function addFooter(slide, opts = {}) {
  const notice = opts.notice || { l: 860, t: 688, w: 300, h: 20 };
  const page = opts.page || { l: 1174, t: 688, w: 70, h: 20 };
  addText(slide, data.meta.internal_notice, {
    l: notice.l, t: notice.t, w: notice.w, h: notice.h,
    size: 12, color: C.muted, align: "right",
  });
  addText(slide, String(pageNumber).padStart(2, "0") + " / " + String(totalPages).padStart(2, "0"), {
    l: page.l, t: page.t, w: page.w, h: page.h,
    size: 12, color: C.muted, align: "right",
  });
}

/**
 * 金样常见「标签：正文」：标签加粗；item 也可为 run 数组。
 * 例：全国独家：全国唯一… → 「全国独家：」bold
 */
function labelBoldRuns(item) {
  if (Array.isArray(item)) return item.map((r) => ({ ...r }));
  const s = String(item ?? "");
  const idx = s.search(/[：:]/);
  if (idx >= 0) {
    return [
      { text: s.slice(0, idx + 1), bold: true },
      { text: s.slice(idx + 1) },
    ];
  }
  return [{ text: s }];
}

/** 多条要点 → 带 • 与换行的 run 数组（surfaceCard / 整段正文用） */
function bulletRunBody(items) {
  const runs = [];
  (items || []).forEach((item, index) => {
    runs.push({ text: "• " });
    const parts = labelBoldRuns(item);
    parts.forEach((r, ri) => {
      const copy = { text: r.text, bold: r.bold === true };
      if (r.color) copy.color = r.color;
      if (ri === parts.length - 1 && index < items.length - 1) copy.breakLine = true;
      runs.push(copy);
    });
  });
  return runs;
}

function bulletList(slide, items, l, t, w, rowHeight, opts = {}) {
  items.forEach((item, index) => {
    const yy = t + index * rowHeight;
    addShape(slide, {
      l, t: yy + 10, w: 14, h: 14, fill: opts.dot || C.primary, type: pptx.ShapeType.ellipse,
    });
    // 支持 string | run[]；默认对「标签：」加粗（对齐金样 p11）
    const line = Array.isArray(item) || opts.labelBold !== false
      ? (Array.isArray(item) ? item : labelBoldRuns(item))
      : item;
    addText(slide, line, {
      l: l + 28, t: yy, w: w - 28, h: rowHeight - 2,
      size: opts.size ?? 18, color: opts.color || C.ink, bold: !!opts.bold, vAlign: "middle",
    });
  });
}

// Estimate total pages for footer (matches engine page set)
function estimateTotalPages() {
  return (
    1 + // cover
    1 + // opening
    1 + // agenda
    1 + // disease def
    1 + // symptoms
    1 + // comparison
    1 + // treatment
    1 + // subtypes
    1 + // product info
    1 + // advantages
    1 + // product summary
    1 + // audience
    1 + // consultation
    data.product.scenarios.length +
    1 + // daily care
    data.weighted.items.length +
    1 // weighted comparison
  );
}
const totalPages = estimateTotalPages();

// ========== PAGES (layout from production export.mjs) ==========

// 1. Cover
{
  const page = data.pages.cover;
  if (page.locked_image) {
    // 公司锁定封面：金样为源 PDF 整页 contain（左右信箱边），非 cover 裁切
    const slide = newSlide("cover", page);
    const fitMode = page.locked_image_fit === "cover" ? "cover" : "contain";
    addImageSafe(slide, page.locked_image, { left: 0, top: 0, width: Wpx, height: Hpx }, fitMode);
  } else {
  const slide = newSlide("cover", page);
  addShape(slide, { l: 0, t: 0, w: 760, h: Hpx, fill: C.teal });
  addShape(slide, { l: 760, t: 0, w: 520, h: Hpx, fill: C.blue });
  // 空心描边 orbit（对齐生产 export：白色半透明描边椭圆；pptxgenjs 用 line transparency 模拟 alpha）
  addShape(slide, { l: 805, t: 45, w: 450, h: 450, fill: "none", line: "FFFFFF", lineWidth: 3, lineTransparency: 67, type: pptx.ShapeType.ellipse });
  addShape(slide, { l: 900, t: 115, w: 330, h: 330, fill: "none", line: "FFFFFF", lineWidth: 2, lineTransparency: 73, type: pptx.ShapeType.ellipse });
  addShape(slide, { l: 72, t: 86, w: 72, h: 7, fill: C.white, radius: 3 });
  addText(slide, data.meta.organization, { l: 72, t: 110, w: 560, h: 42, size: 18, bold: true, color: C.white });
  addText(slide, page.eyebrow, { l: 72, t: 206, w: 590, h: 38, size: 17, color: "DFF6EC", bold: true });
  addText(slide, page.title, { l: 72, t: 252, w: 620, h: 120, size: 40, bold: true, color: C.white, vAlign: "middle" });
  addText(slide, page.subtitle, { l: 74, t: 382, w: 575, h: 78, size: 21, color: C.white });
  addText(slide, page.prepared_line, { l: 74, t: 594, w: 580, h: 36, size: 14, color: "DFF6EC" });
  addText(slide, data.meta.internal_notice, { l: 74, t: 640, w: 580, h: 30, size: 12, color: "DFF6EC" });
  addImageSafe(slide, page.image, { left: 850, top: 170, width: 330, height: 365 });
  addText(slide, data.product.name, { l: 835, t: 565, w: 360, h: 45, size: 20, bold: true, color: C.white, align: "center" });
  }
}

// 2. Opening
{
  const page = data.pages.opening;
  const slide = newSlide("opening", page);
  const pillars = requireArray("pages.opening.pillars", { min: 3, max: 3 });
  if (page.variant === "thesis") {
    // 金样穿心莲 topology：论断面 + 三张 surface 卡 + 结语条（gold slide-02 layout.json）
    addShape(slide, { l: 90, t: 112, w: 1100, h: 110, fill: C.mint, radius: 12 });
    addShape(slide, { l: 98, t: 122, w: 4, h: 90, fill: C.primary });
    addText(slide, page.headline, { l: 114, t: 122, w: 1062, h: 90, size: 22, color: C.ink, vAlign: "middle" });
    pillars.forEach((pillar, index) => {
      surfaceCard(slide, 90 + index * 380, 238, 340, 250, pillar.title, pillar.body, { titleSize: 22, bodySize: 21 });
    });
    addShape(slide, { l: 90, t: 548, w: 1100, h: 60, fill: C.mint, radius: 12 });
    addShape(slide, { l: 98, t: 558, w: 4, h: 40, fill: C.primary });
    addText(slide, page.quote, { l: 114, t: 548, w: 1062, h: 60, size: 20, color: C.ink, vAlign: "middle" });
  } else {
  addText(slide, page.kicker, { l: 70, t: 108, w: 1140, h: 40, size: 18, color: C.primary, bold: true, align: "center" });
  addText(slide, page.headline, { l: 120, t: 150, w: 1040, h: 92, size: 34, color: C.deep, bold: true, align: "center", vAlign: "middle" });
  pillars.forEach((pillar, index) => {
    const xx = 65 + index * 405;
    card(slide, xx, 285, 370, 190, {
      fill: index === 1 ? C.mint : C.white,
      line: index === 1 ? C.primary : C.line,
    });
    addShape(slide, { l: xx + 26, t: 310, w: 46, h: 46, fill: C.primary, type: pptx.ShapeType.ellipse });
    addText(slide, String(index + 1), { l: xx + 26, t: 310, w: 46, h: 46, size: 20, bold: true, color: C.white, align: "center", vAlign: "middle" });
    addText(slide, pillar.title, { l: xx + 90, t: 303, w: 250, h: 55, size: 20, bold: true, color: C.deep, vAlign: "middle" });
    addText(slide, pillar.body, { l: xx + 22, t: 371, w: 326, h: 88, size: 16, color: C.ink, align: "center", vAlign: "middle" });
  });
  addText(slide, page.quote, {
    l: 190, t: 530, w: 900, h: 72, size: 20, color: C.deep, bold: true, align: "center", vAlign: "middle",
    fill: C.pale, line: C.line, lineWidth: 1, radius: 14,
  });
  }
}

// 3. Agenda
{
  const page = data.pages.agenda;
  const items = data.agenda;
  if (page.image) {
    // 金样穿心莲 topology：左侧整幅图 cover + 右侧「目 录」+ chip 列表（gold slide-03）
    const slide = newSlide("agenda", { ...page, chromeless: true });
    // 左栏 580×720：建筑图 cover（与金样 srcRect t/b≈1763 一致）
    addImageSafe(slide, page.image, { left: 0, top: 0, width: 580, height: 720 }, "cover");
    addText(slide, page.title, {
      l: 625, t: 80, w: 400, h: 80,
      size: 58, bold: true, color: C.deep, vAlign: "middle",
    });
    addShape(slide, { l: 625, t: 175, w: 520, h: 2, fill: C.line });
    items.forEach((item, index) => {
      // 可编辑金样 build：y=220+i*70；chip 在 y+4；标题在 y
      const yBase = 220 + index * 70;
      const chipY = yBase + 4;
      // 椭圆内文字：水平/垂直居中（避免底形+文本框叠层偏移）
      addText(slide, item.number, {
        l: 625, t: chipY, w: 40, h: 40,
        size: 17, bold: true, color: C.white,
        align: "center", vAlign: "middle",
        fill: C.primary,
        shape: pptx.ShapeType.ellipse,
        wrap: false,
      });
      addText(slide, item.title, {
        l: 685, t: yBase, w: 560, h: 48,
        size: 23, bold: true, color: C.ink, vAlign: "middle",
      });
    });
    // 金样目录页脚坐标（非通用 chrome footer）
    addFooter(slide, {
      notice: { l: 1010, t: 688, w: 160, h: 22 },
      page: { l: 1180, t: 688, w: 64, h: 22 },
    });
  } else {
  const slide = newSlide("agenda", page);
  items.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const xx = 70 + col * 600;
    const yy = 105 + row * 150;
    card(slide, xx, yy, 560, 118, { fill: index % 3 === 1 ? C.mint : C.white });
    addText(slide, item.number, { l: xx + 22, t: yy + 20, w: 64, h: 68, size: 30, bold: true, color: C.primary, align: "center", vAlign: "middle" });
    addText(slide, item.title, { l: xx + 105, t: yy + 18, w: 420, h: 42, size: 21, bold: true, color: C.deep });
    addText(slide, item.subtitle, { l: xx + 105, t: yy + 61, w: 420, h: 38, size: 16, color: C.muted });
  });
  }
}

// 4. Disease definition
{
  const page = data.pages.disease_definition;
  const slide = newSlide("disease-definition", page);
  if (data.disease.cause && data.disease.pathogenesis) {
    // 金样穿心莲 topology：全宽定义面 + 病因/病机双卡 + 总结条（gold slide-04）
    surfaceCard(slide, 90, 100, 1100, 180, data.disease.definition_title || `什么是${data.disease.name}？`, data.disease.definition, { titleSize: 23, bodySize: 26 });
    surfaceCard(slide, 90, 300, 520, 280, data.disease.cause.title, data.disease.cause.body, { titleSize: 23, bodySize: 23 });
    surfaceCard(slide, 650, 300, 540, 280, data.disease.pathogenesis.title, data.disease.pathogenesis.body, { titleSize: 23, bodySize: 23 });
    if (data.disease.definition_summary) {
      addShape(slide, { l: 90, t: 600, w: 1100, h: 55, fill: C.mint, radius: 12 });
      addShape(slide, { l: 98, t: 610, w: 4, h: 35, fill: C.primary });
      addText(slide, data.disease.definition_summary, { l: 114, t: 600, w: 1062, h: 55, size: 21, bold: true, color: C.ink, vAlign: "middle" });
    }
  } else {
  addImageSafe(slide, page.image, { left: 65, top: 120, width: 400, height: 410 });
  addText(slide, data.disease.name, { l: 515, t: 118, w: 680, h: 62, size: 31, bold: true, color: C.deep });
  addText(slide, data.disease.definition, {
    l: 515, t: 194, w: 680, h: 142, size: 21, color: C.ink,
    fill: C.pale, line: C.line, lineWidth: 1, radius: 14,
  });
  const tags = requireArray("disease.definition_tags", { min: 3, max: 5 });
  tags.forEach((tag, index) => {
    const xx = 515 + (index % 2) * 340;
    const yy = 370 + Math.floor(index / 2) * 82;
    addText(slide, tag, {
      l: xx, t: yy, w: 305, h: 58, size: 18, bold: true, color: C.deep,
      align: "center", vAlign: "middle", fill: C.mint, line: C.line, lineWidth: 1, radius: 12,
    });
  });
  }
}

// 5. Symptoms
{
  const page = data.pages.symptoms;
  const slide = newSlide("symptoms", page);
  const symptoms = data.disease.symptoms;
  if (symptoms.length === 5) {
    // 金样穿心莲 topology：3 图卡 + 2 绿底小条（gold slide-05）
    symptoms.slice(0, 3).forEach((symptom, index) => {
      const xx = 70 + index * 375;
      addImageSafe(slide, symptom.image, { left: xx, top: 112, width: 320, height: 185 }, "cover");
      surfaceCard(slide, xx, 308, 320, 190, symptom.name, symptom.description, { titleSize: 20, bodySize: 18, titleColor: C.ink });
    });
    symptoms.slice(3, 5).forEach((symptom, index) => {
      const xx = 70 + index * 385;
      addShape(slide, { l: xx, t: 520, w: 350, h: 92, fill: C.primary, radius: 12 });
      // 绿底条：第一行 name（加粗）+ 第二行 description。
      // description 不得再写一遍 name（金样：口干口渴，喜冷饮\n热邪耗伤…）
      const name = String(symptom.name ?? "");
      let descRuns = Array.isArray(symptom.description)
        ? symptom.description.map((r) => ({ ...r }))
        : [{ text: plainText(symptom.description) }];
      // 防御：抽回时若 description 以 name 开头，剥掉避免「标题写两遍」
      let acc = "";
      let drop = 0;
      for (let i = 0; i < descRuns.length; i++) {
        acc += String(descRuns[i]?.text ?? "");
        if (acc === name) {
          drop = i + 1;
          break;
        }
        if (acc.length >= name.length) break;
      }
      if (drop) descRuns = descRuns.slice(drop);
      const greenBody = [
        { text: name, bold: true, breakLine: true },
        ...descRuns.map((r) => ({
          text: r.text,
          bold: r.bold === true,
          color: r.color || "FFFFFF",
        })),
      ];
      addText(slide, greenBody, {
        l: xx + 14, t: 530, w: 322, h: 72, size: 18, color: C.white, vAlign: "middle",
      });
      if (symptom.image) addImageSafe(slide, symptom.image, { left: 845, top: 505, width: 210, height: 120 }, "cover");
    });
  } else {
  symptoms.forEach((symptom, index) => {
    const xx = 55 + index * 300;
    card(slide, xx, 115, 275, 500, { fill: index % 2 ? C.pale : C.white });
    addImageSafe(slide, symptom.image, { left: xx + 40, top: 145, width: 195, height: 190 });
    addText(slide, symptom.name, { l: xx + 28, t: 356, w: 219, h: 52, size: 21, bold: true, color: C.deep, align: "center", vAlign: "middle" });
    addText(slide, symptom.description, { l: xx + 28, t: 420, w: 219, h: 150, size: 17, color: C.ink, align: "center" });
  });
  }
}

// 6. Comparison
{
  const page = data.pages.comparison;
  const slide = newSlide("disease-comparison", page);
  const columns = requireArray("disease.comparison.columns", { min: 3, max: 4 });
  const rows = data.disease.comparison.rows;
  for (const row of rows) {
    if (!Array.isArray(row) || row.length !== columns.length) fail("each disease.comparison row must match columns");
  }
  const memory = data.disease.comparison.memory;
  const changeNote = data.disease.comparison.change_note;
  if (memory || changeNote) {
    // gold 双色板拓扑（slide-06）：左右双色板 + 口诀三卡 + 病情演变条
    if (columns.length !== 3 || rows.length !== 5 || !Array.isArray(memory) || memory.length !== 3 || !changeNote) {
      fail("comparison two-panel variant requires 3 columns, 5 rows, 3 memory cards and change_note");
    }
    const panels = [
      { l: 70, header: "D9F8EE", dimColor: "00B98F" },
      { l: 660, header: "E8EEF6", dimColor: "2F8AFF" },
    ];
    panels.forEach((panel, pi) => {
      card(slide, panel.l, 105, 550, 360, { fill: C.white, line: C.line });
      addShape(slide, { l: panel.l + 1, t: 106, w: 548, h: 67, fill: panel.header, radius: 12 });
      addShape(slide, { l: panel.l + 1, t: 140, w: 548, h: 33, fill: panel.header });
      addText(slide, columns[pi + 1], { l: panel.l + 30, t: 120, w: 490, h: 44, size: 26, bold: true, color: C.ink, vAlign: "middle" });
      const dimRuns = (idxs) => idxs.flatMap((ri, i) => [
        ...(i ? [{ text: "", breakLine: true }] : []),
        // 维度名可按板拆分："左标题|右标题"（gold slide-06 行04 口渴喜饮/口渴情况）
        { text: String(rows[ri][0]).split("|")[pi] || String(rows[ri][0]).split("|")[0], bold: true, color: panel.dimColor, breakLine: true },
        { text: rows[ri][pi + 1], color: GOLD_INK_SOFT, breakLine: true },
      ]);
      addText(slide, dimRuns([0, 1]), { l: panel.l + 22, t: 205, w: 240, h: 185, size: 22 });
      addShape(slide, { l: panel.l + 274, t: 205, w: 1, h: 185, fill: "C8DDE3" });
      addText(slide, dimRuns([2, 3]), { l: panel.l + 295, t: 205, w: 230, h: 185, size: 22 });
      addText(slide, [
        { text: `${rows[4][0]}  `, bold: true, color: panel.dimColor },
        { text: rows[4][pi + 1], color: GOLD_INK_SOFT },
      ], { l: panel.l + 22, t: 390, w: 500, h: 65, size: 22, vAlign: "middle" });
    });
    memory.forEach((item, index) => {
      const xx = 70 + index * 395;
      addShape(slide, { l: xx, t: 500, w: 350, h: 95, fill: "DBFAEF", radius: 10 });
      addText(slide, [
        { text: item.title, bold: true, color: GOLD_INK_SOFT, breakLine: true },
        { text: item.body, color: GOLD_INK_SOFT },
      ], { l: xx + 14, t: 510, w: 322, h: 75, size: 18, vAlign: "middle" });
    });
    addShape(slide, { l: 70, t: 620, w: 1140, h: 42, fill: "FFF3C4", radius: 10 });
    addText(slide, changeNote, {
      l: 84, t: 620, w: 1112, h: 42, size: 20, bold: true, color: C.ink, vAlign: "middle",
    });
  } else {
  const xx = 55, yy = 112, tableWidth = 1170;
  const columnWidths = columns.map((_, i) => (i === 0 ? 210 : (tableWidth - 210) / (columns.length - 1)));
  let cursorX = xx;
  columns.forEach((column, i) => {
    tableCell(slide, column, cursorX, yy, columnWidths[i], 58, { fill: C.deep, color: C.white, bold: true, size: 18 });
    cursorX += columnWidths[i];
  });
  const rowHeight = Math.min(88, 430 / rows.length);
  rows.forEach((row, ri) => {
    cursorX = xx;
    row.forEach((value, ci) => {
      tableCell(slide, value, cursorX, yy + 58 + ri * rowHeight, columnWidths[ci], rowHeight, {
        fill: ri % 2 ? C.pale : C.white,
        bold: ci === 0,
        align: ci === 0 ? "center" : "left",
        size: 16,
      });
      cursorX += columnWidths[ci];
    });
  });
  if (page.footer) {
    addText(slide, page.footer, {
      l: 120, t: 605, w: 1040, h: 52, size: 17, bold: true, color: C.deep,
      align: "center", vAlign: "middle", fill: C.mint, radius: 12,
    });
  }
  }
}

// 7. Treatment
{
  const page = data.pages.treatment;
  const slide = newSlide("treatment-principles", page);
  if (data.disease.treatment_summary) {
    // gold 三栏 surface 卡 + 底部总结条（slide-07）
    if (data.disease.treatment_principles.length !== 3) {
      fail("treatment_summary variant requires exactly 3 treatment_principles");
    }
    data.disease.treatment_principles.forEach((item, index) => {
      surfaceCard(slide, 70 + index * 395, 140, 350, 380, item.title, item.body, {
        titleSize: 23, bodySize: 23, titleColor: C.deep,
      });
    });
    addShape(slide, { l: 70, t: 570, w: 1140, h: 58, fill: C.mint, radius: 10 });
    addShape(slide, { l: 78, t: 580, w: 4, h: 38, fill: C.primary });
    addText(slide, data.disease.treatment_summary, {
      l: 94, t: 570, w: 1102, h: 58, size: 21, bold: true, color: GOLD_INK_SOFT, vAlign: "middle",
    });
  } else {
  data.disease.treatment_principles.forEach((item, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const xx = 55 + col * 405;
    const yy = 115 + row * 245;
    titleBodyCard(slide, xx, yy, 370, 210, item.title, item.body, {
      fill: row % 2 ? C.pale : C.white, titleSize: 20, bodySize: 17,
    });
  });
  }
}

// 8. Subtypes
{
  const page = data.pages.subtypes;
  const slide = newSlide("subtypes", page);
  if (page.variant === "split-columns") {
    // gold 拓扑（slide-08）：左缘色条 + 题下 rule + 表现/治则双栏
    data.disease.subtypes.forEach((item, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const xx = 70 + col * 590;
      const yy = 110 + row * 270;
      card(slide, xx, yy, 550, 230, { fill: C.white, line: C.line });
      addShape(slide, { l: xx, t: yy, w: 6, h: 230, fill: C.primary });
      addText(slide, item.name, { l: xx + 18, t: yy + 10, w: 514, h: 44, size: 25, bold: true, color: C.primary, vAlign: "middle" });
      addShape(slide, { l: xx + 18, t: yy + 56, w: 514, h: 1, fill: "CDE9DE" });
      addText(slide, [
        { text: `${item.features_label}：`, bold: true, color: C.ink },
        { text: item.features, color: GOLD_INK_SOFT },
      ], { l: xx + 18, t: yy + 76, w: 245, h: 135, size: 23 });
      addShape(slide, { l: xx + 274, t: yy + 76, w: 1, h: 135, fill: "D5E5E7" });
      addText(slide, [
        { text: `${item.approach_label}：`, bold: true, color: C.ink },
        { text: item.approach, color: GOLD_INK_SOFT },
      ], { l: xx + 292, t: yy + 76, w: 240, h: 135, size: 23 });
    });
  } else {
  data.disease.subtypes.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const xx = 65 + col * 600;
    const yy = 112 + row * 250;
    card(slide, xx, yy, 550, 215, { fill: index % 2 ? C.pale : C.white });
    addText(slide, item.name, { l: xx + 24, t: yy + 20, w: 500, h: 42, size: 21, bold: true, color: C.deep });
    addText(slide, item.features_label, { l: xx + 24, t: yy + 78, w: 100, h: 30, size: 16, bold: true, color: C.primary });
    addText(slide, item.features, { l: xx + 145, t: yy + 75, w: 375, h: 55, size: 16, color: C.ink });
    addText(slide, item.approach_label, { l: xx + 24, t: yy + 143, w: 100, h: 30, size: 16, bold: true, color: C.primary });
    addText(slide, item.approach, { l: xx + 145, t: yy + 140, w: 375, h: 55, size: 16, color: C.ink });
  });
  }
}

// 9. Product info
{
  const page = data.pages.product_info;
  const slide = newSlide("product-info", page);
  if (page.variant === "panel") {
    // gold 单面板拓扑（slide-09）：左图 + 右大面板 label/value 六行
    if (data.product.information.length !== 6) {
      fail("product_info panel variant requires exactly 6 information items");
    }
    addImageSafe(slide, data.product.image, { left: 50, top: 220, width: 250, height: 250 });
    card(slide, 360, 135, 835, 440, { fill: C.white, line: C.deep, lineWidth: 1.5 });
    data.product.information.forEach((field, index) => {
      const yy = 170 + index * 62;
      addText(slide, field.label, { l: 400, t: yy, w: 170, h: 38, size: 22, bold: true, color: C.deep, vAlign: "middle" });
      addText(slide, field.value, {
        l: 565, t: yy, w: 590, h: 48, size: 21, vAlign: "middle",
        bold: field.emphasis === true, color: field.emphasis === true ? "E60012" : GOLD_INK_SOFT,
      });
    });
  } else {
  addImageSafe(slide, data.product.image, { left: 60, top: 125, width: 400, height: 360 });
  addText(slide, data.product.name, { l: 60, t: 515, w: 400, h: 58, size: 25, bold: true, color: C.deep, align: "center", vAlign: "middle" });
  data.product.information.forEach((field, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const xx = 510 + col * 355;
    const yy = 118 + row * 158;
    card(slide, xx, yy, 325, 132, { fill: row % 2 ? C.pale : C.white });
    addText(slide, field.label, { l: xx + 20, t: yy + 16, w: 285, h: 30, size: 15, bold: true, color: C.primary });
    addText(slide, field.value, { l: xx + 20, t: yy + 52, w: 285, h: 62, size: 18, bold: field.emphasis === true, color: C.ink, vAlign: "middle" });
  });
  const badges = Array.isArray(data.product.badges) ? data.product.badges : [];
  badges.slice(0, 3).forEach((badge, index) => {
    addText(slide, badge, {
      l: 510 + index * 235, t: 610, w: 205, h: 42, size: 15, bold: true, color: C.deep,
      align: "center", vAlign: "middle", fill: C.mint, radius: 10,
    });
  });
  }
}

// 10. Advantages
{
  const page = data.pages.advantages;
  const slide = newSlide("product-advantages", page);
  const advantages = data.product.advantages;
  if (page.core && advantages.every((item) => item.node)) {
    // 金样穿心莲 topology：中心核 + 横轴节点（gold slide-10）
    addShape(slide, { l: 535, t: 105, w: 210, h: 150, fill: C.deep, type: pptx.ShapeType.ellipse });
    addText(slide, page.core, { l: 555, t: 140, w: 170, h: 82, size: 28, bold: true, color: C.white, align: "center", vAlign: "middle" });
    addShape(slide, { l: 220, t: 365, w: 830, h: 2, fill: C.line });
    const nodeFills = [C.deep, C.primary, "2E9E5B", "43A817"];
    const nodeXs = [130, 400, 680, 960];
    advantages.slice(0, 4).forEach((item, index) => {
      const xx = nodeXs[index];
      addShape(slide, { l: xx, t: 325, w: 72, h: 72, fill: nodeFills[index], type: pptx.ShapeType.ellipse });
      addText(slide, item.node, { l: xx, t: 343, w: 72, h: 38, size: 22, bold: true, color: C.white, align: "center", vAlign: "middle" });
      addText(slide, item.title, { l: xx - 65, t: 425, w: 205, h: 58, size: 19, bold: true, color: C.deep, align: "center", vAlign: "middle" });
      addText(slide, item.body, { l: xx - 65, t: 492, w: 205, h: 120, size: 19, color: GOLD_INK_SOFT, align: "center" });
    });
  } else {
  advantages.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const xx = 65 + col * 600;
    const yy = 115 + row * 245;
    card(slide, xx, yy, 550, 210, { fill: index % 3 === 1 ? C.mint : C.white });
    addShape(slide, { l: xx + 24, t: yy + 26, w: 52, h: 52, fill: C.primary, type: pptx.ShapeType.ellipse });
    addText(slide, String(index + 1), { l: xx + 24, t: yy + 26, w: 52, h: 52, size: 21, bold: true, color: C.white, align: "center", vAlign: "middle" });
    addText(slide, item.title, { l: xx + 96, t: yy + 25, w: 420, h: 52, size: 21, bold: true, color: C.deep, vAlign: "middle" });
    addText(slide, item.body, { l: xx + 28, t: yy + 96, w: 494, h: 88, size: 17, color: C.ink });
  });
  }
}

// 11. Product summary
{
  const page = data.pages.product_summary;
  const slide = newSlide("product-summary", page);
  const groups = data.product.summary.groups;
  if (page.image) {
    // gold 拓扑：左二右一 surface 卡 + 中央产品图（无 headline 横带）
    if (groups.length !== 3) fail("product.summary image variant requires exactly 3 groups");
    const slots = [
      { l: 60, t: 130, w: 400, h: 230 },
      { l: 60, t: 390, w: 440, h: 220 },
      { l: 810, t: 220, w: 430, h: 300 },
    ];
    addImageSafe(slide, page.image, { left: 500, top: 210, width: 280, height: 260 }, "product-summary");
    groups.forEach((group, index) => {
      if (!Array.isArray(group.items) || group.items.length < 1 || group.items.length > 4) {
        fail(`product.summary.groups[${index}].items must contain 1..4 items`);
      }
      const s = slots[index];
      // 不可 join 成纯字符串，否则丢失金样「标签：」加粗
      surfaceCard(slide, s.l, s.t, s.w, s.h, group.title, bulletRunBody(group.items), {
        titleSize: 26, bodySize: 22, titleColor: C.deep,
      });
    });
  } else {
  addText(slide, data.product.summary.headline, {
    l: 120, t: 102, w: 1040, h: 72, size: 27, bold: true, color: C.deep,
    align: "center", vAlign: "middle", fill: C.mint, radius: 14,
  });
  const groupWidth = groups.length === 2 ? 540 : 365;
  const startX = groups.length === 2 ? 80 : 55;
  groups.forEach((group, index) => {
    if (!Array.isArray(group.items) || group.items.length < 1 || group.items.length > 4) {
      fail(`product.summary.groups[${index}].items must contain 1..4 items`);
    }
    const xx = startX + index * (groupWidth + 35);
    card(slide, xx, 215, groupWidth, 355, { fill: index === 1 ? C.pale : C.white });
    addText(slide, group.title, { l: xx + 24, t: 238, w: groupWidth - 48, h: 48, size: 21, bold: true, color: C.deep, align: "center", vAlign: "middle" });
    bulletList(slide, group.items, xx + 32, 310, groupWidth - 64, 62, { size: 17 });
  });
  }
}

// 12. Audience
{
  const page = data.pages.audience;
  const slide = newSlide("audience", page);
  if (page.variant === "arrow-flow") {
    // gold 拓扑（slide-12）：红色产品名 + 左产品图 + 三人群箭头链
    const audience = data.product.audience;
    if (audience.length !== 3 || !audience.every((item) => Array.isArray(item.flows) && item.flows.length)) {
      fail("audience arrow-flow variant requires exactly 3 items, each with non-empty flows");
    }
    addText(slide, `＞ ${data.product.name}`, { l: 70, t: 100, w: 430, h: 55, size: 34, bold: true, color: "E60012", vAlign: "middle" });
    addImageSafe(slide, page.product_image || data.product.image, { left: 70, top: 195, width: 260, height: 320 });
    const slots = [
      { image: [455, 140, 135, 165], chipX: 355, chipY: 225, leadArrowX: 600, leadArrowY: 214, leftX: 700, leftW: 220, leftSize: 23, arrowX: 915, arrowW: 70, arrowSize: 42, rightX: 995, rightW: 210, rightSize: 22, rowY: 215, rowStep: 43 },
      { image: [490, 315, 135, 160], chipX: 395, chipY: 368, leadArrowX: 625, leadArrowY: 372, leftX: 710, leftW: 155, leftSize: 22, arrowX: 865, arrowW: 65, arrowSize: 38, rightX: 935, rightW: 275, rightSize: 21, rowY: 320, rowStep: 43 },
      { image: [430, 505, 170, 150], chipX: 355, chipY: 550, leadArrowX: 600, leadArrowY: 552, leftX: 705, leftW: 160, leftSize: 22, arrowX: 865, arrowW: 65, arrowSize: 38, rightX: 935, rightW: 285, rightSize: 21, rowY: 525, rowStep: 43 },
    ];
    audience.forEach((item, index) => {
      const slot = slots[index];
      addImageSafe(slide, item.image, { left: slot.image[0], top: slot.image[1], width: slot.image[2], height: slot.image[3] });
      const chipW = 20 + 28 * item.title.length;
      addShape(slide, { l: slot.chipX, t: slot.chipY, w: chipW, h: 48, fill: C.primary, radius: 10 });
      addText(slide, item.title, { l: slot.chipX, t: slot.chipY, w: chipW, h: 48, size: 25, bold: true, color: C.white, align: "center", vAlign: "middle" });
      addText(slide, "→", { l: slot.leadArrowX, t: slot.leadArrowY, w: 78, h: 48, size: 42, bold: true, color: C.secondary, vAlign: "middle" });
      item.flows.forEach((flow, j) => {
        const yy = slot.rowY + j * slot.rowStep;
        const hh = flow.left.includes("\n") || flow.right.includes("\n") ? 88 : 48;
        addText(slide, flow.left, { l: slot.leftX, t: yy, w: slot.leftW, h: hh, size: slot.leftSize, bold: true, color: C.ink, vAlign: "middle" });
        addText(slide, "→", { l: slot.arrowX, t: yy + Math.round((hh - 42) / 2), w: slot.arrowW, h: 42, size: slot.arrowSize, bold: true, color: C.secondary, vAlign: "middle" });
        addText(slide, flow.right, { l: slot.rightX, t: yy, w: slot.rightW, h: hh, size: slot.rightSize, color: "777777", vAlign: "middle" });
      });
    });
  } else {
  data.product.audience.forEach((item, index) => {
    const xx = 65 + index * 405;
    card(slide, xx, 115, 370, 500, { fill: index === 1 ? C.pale : C.white });
    addImageSafe(slide, item.image, { left: xx + 60, top: 145, width: 250, height: 225 });
    addText(slide, item.title, { l: xx + 30, t: 390, w: 310, h: 55, size: 21, bold: true, color: C.deep, align: "center", vAlign: "middle" });
    addText(slide, item.body, { l: xx + 30, t: 465, w: 310, h: 112, size: 17, color: C.ink, align: "center" });
  });
  }
}

// 13. Consultation
{
  const page = data.pages.consultation;
  const slide = newSlide("consultation", page);
  if (page.thesis) {
    // gold 拓扑：论点 + 绿色分隔线 + 四列 surface 卡
    addText(slide, page.thesis, { l: 70, t: 115, w: 1100, h: 48, size: 25, bold: true, color: C.deep, vAlign: "middle" });
    addShape(slide, { l: 90, t: 190, w: 1100, h: 2, fill: C.primary });
    data.product.consultation.forEach((item, index) => {
      const xx = 70 + index * 290;
      surfaceCard(slide, xx, 245, 260, 320, `${item.step} · ${item.title}`, item.question, {
        titleSize: 23, bodySize: 20,
      });
    });
  } else {
  data.product.consultation.forEach((item, index) => {
    const yy = 112 + index * 128;
    addShape(slide, { l: 75, t: yy + 17, w: 78, h: 78, fill: C.primary, type: pptx.ShapeType.ellipse });
    addText(slide, item.step, { l: 75, t: yy + 17, w: 78, h: 78, size: 22, bold: true, color: C.white, align: "center", vAlign: "middle" });
    card(slide, 185, yy, 1020, 112, { fill: index % 2 ? C.pale : C.white });
    addText(slide, item.title, { l: 215, t: yy + 16, w: 260, h: 34, size: 19, bold: true, color: C.deep });
    addText(slide, item.question, { l: 215, t: yy + 53, w: 950, h: 44, size: 18, color: C.ink, vAlign: "middle" });
  });
  }
}

// 14+ Scenarios
for (const [scenarioIndex, scenario] of data.product.scenarios.entries()) {
  const hasBlocks = Array.isArray(scenario.blocks);
  if (!scenario.page_title || !scenario.title ||
      !(hasBlocks || (Array.isArray(scenario.dialogues) && scenario.dialogues.length >= 2 && scenario.dialogues.length <= 5))) {
    fail(`product.scenarios[${scenarioIndex}] requires page_title, title and either blocks(+summary) or 2..5 dialogues`);
  }
  const page = { title: scenario.page_title, section: scenario.section };
  const slide = newSlide("scenario", page);
  if (hasBlocks) {
    // gold 拓扑：blocks 三卡 + summary 条；带图=左图右三窄卡，无图=三宽卡+绿话术条
    if (scenario.blocks.length !== 3 || !scenario.summary) {
      fail(`product.scenarios[${scenarioIndex}] blocks variant requires exactly 3 blocks and a summary`);
    }
    if (scenario.image) {
      addText(slide, scenario.title, { l: 80, t: 90, w: 600, h: 45, size: 25, bold: true, color: C.deep, vAlign: "middle" });
      addImageSafe(slide, scenario.image, { left: 80, top: 175, width: 330, height: 340 });
      scenario.blocks.forEach((block, index) => {
        surfaceCard(slide, 455 + index * 255, 175, 230, 340, block.title, block.body, {
          titleSize: 23, bodySize: 22, titleColor: C.deep,
        });
      });
      addShape(slide, { l: 455, t: 555, w: 740, h: 55, fill: C.mint });
      addText(slide, scenario.summary, { l: 469, t: 555, w: 712, h: 55, size: 20, bold: true, color: GOLD_INK_SOFT, vAlign: "middle" });
    } else {
      addText(slide, scenario.title, { l: 80, t: 90, w: 750, h: 45, size: 25, bold: true, color: C.deep, vAlign: "middle" });
      scenario.blocks.forEach((block, index) => {
        surfaceCard(slide, 80 + index * 390, 170, 340, 360, block.title, block.body, {
          titleSize: 23, bodySize: 23, titleColor: C.deep,
        });
      });
      addShape(slide, { l: 80, t: 570, w: 1120, h: 65, fill: C.primary });
      addText(slide, scenario.summary, { l: 94, t: 570, w: 1092, h: 65, size: 20, bold: true, color: C.white, vAlign: "middle" });
    }
    continue;
  }
  addText(slide, scenario.title, { l: 65, t: 105, w: 650, h: 54, size: 25, bold: true, color: C.deep });
  titleBodyCard(slide, 65, 180, 520, 150, scenario.profile_label, scenario.profile, { fill: C.pale, bodySize: 17 });
  titleBodyCard(slide, 65, 350, 520, 145, scenario.needs_label, scenario.needs, { fill: C.white, bodySize: 17 });
  addText(slide, scenario.recommendation_label, { l: 65, t: 520, w: 520, h: 34, size: 17, bold: true, color: C.primary });
  addText(slide, scenario.recommendation, {
    l: 65, t: 556, w: 520, h: 80, size: 17, color: C.ink, fill: C.mint, radius: 10,
  });
  scenario.dialogues.forEach((dialogue, index) => {
    const yy = 120 + index * 103;
    const staff = dialogue.role === "staff";
    const xx = staff ? 650 : 720;
    addText(slide, dialogue.speaker, { l: xx, t: yy, w: 150, h: 28, size: 14, bold: true, color: staff ? C.primary : C.blue });
    addText(slide, dialogue.text, {
      l: xx, t: yy + 30, w: staff ? 520 : 455, h: 62, size: 17, color: C.ink,
      fill: staff ? C.mint : "EEF5FA", line: staff ? C.line : "D9E5ED", lineWidth: 1, radius: 12, vAlign: "middle",
    });
  });
}

// Daily care
{
  const page = data.pages.daily_care;
  const slide = newSlide("daily-care", page);
  const care = data.product.daily_care;
  if (care.length === 5 && care[0].image && care[1].image && care.slice(2).every((item) => !item.image)) {
    // gold 拓扑（slide-16）：左列 宜/忌 图+浅底色卡，右列三张 surface 卡
    const tintedFills = ["ECFFF4", "FFF1F1"];
    care.slice(0, 2).forEach((item, index) => {
      const xx = 70 + index * 265;
      addImageSafe(slide, item.image, { left: xx, top: 130, width: 245, height: 190 });
      addShape(slide, { l: xx, t: 350, w: 245, h: 190, fill: tintedFills[index], radius: 12 });
      // 金样：标题加粗 + 正文（body 可为 run 数组）
      const careBody = Array.isArray(item.body)
        ? item.body.map((r) => ({
            text: r.text,
            bold: r.bold === true,
            color: r.color,
            breakLine: r.breakLine === true,
            blankLine: r.blankLine === true,
          }))
        : [{ text: plainText(item.body) }];
      addText(slide, [
        { text: String(item.title ?? ""), bold: true, breakLine: true },
        ...careBody,
      ], { l: xx + 14, t: 360, w: 217, h: 170, size: 17, color: GOLD_INK_SOFT });
    });
    care.slice(2, 5).forEach((item, index) => {
      surfaceCard(slide, 650, 120 + index * 165, 550, 145, item.title, item.body, {
        titleSize: 23, bodySize: 21, titleColor: C.deep,
      });
    });
  } else {
  const careColumns = data.product.daily_care.length === 4 ? 2 : 3;
  const careWidth = careColumns === 2 ? 550 : 370;
  const careStep = careColumns === 2 ? 600 : 405;
  data.product.daily_care.forEach((item, index) => {
    const col = index % careColumns;
    const row = Math.floor(index / careColumns);
    const xx = 55 + col * careStep;
    const yy = 112 + row * 260;
    card(slide, xx, yy, careWidth, 225, { fill: index % 2 ? C.pale : C.white });
    if (item.image) {
      addImageSafe(slide, item.image, { left: xx + 22, top: yy + 27, width: 110, height: 110 });
      addText(slide, item.title, { l: xx + 148, t: yy + 28, w: careWidth - 172, h: 60, size: 18, bold: true, color: C.deep, vAlign: "middle" });
    } else {
      addText(slide, item.title, { l: xx + 25, t: yy + 28, w: careWidth - 50, h: 60, size: 18, bold: true, color: C.deep, vAlign: "middle" });
    }
    addText(slide, item.body, { l: xx + 25, t: yy + 146, w: careWidth - 50, h: 60, size: 16, color: C.ink, align: "center" });
  });
  }
}

// Weighted items
for (const [itemIndex, item] of data.weighted.items.entries()) {
  if (!item.page_title || !item.name) fail(`weighted.items[${itemIndex}] requires page_title and name`);
  const page = { title: item.page_title, section: item.section };
  const slide = newSlide("weighted-detail", page);
  addImageSafe(slide, item.image, { left: 45, top: 120, width: 465, height: 285 });
  const fields = Array.isArray(item.fields) ? item.fields : [];
  if (fields.length < 1 || fields.length > 4) fail(`weighted.items[${itemIndex}].fields must contain 1..4 items`);
  if (!Array.isArray(item.selling_points) || item.selling_points.length < 1 || item.selling_points.length > 4) {
    fail(`weighted.items[${itemIndex}].selling_points must contain 1..4 items`);
  }
  // 信息表（gold slide-17）：四栏宽 [90,90,160,125]，表头 y425 h48，数据行 y473 h62
  const fieldWidths = fields.length === 4 ? [90, 90, 160, 125] : fields.map(() => 465 / fields.length);
  let fieldX = 45;
  fields.forEach((field, index) => {
    tableCell(slide, field.label, fieldX, 425, fieldWidths[index], 48, { fill: C.deep, color: C.white, bold: true, size: 16 });
    tableCell(slide, field.value, fieldX, 473, fieldWidths[index], 62, { fill: C.white, size: 17 });
    fieldX += fieldWidths[index];
  });
  addShape(slide, { l: 45, t: 555, w: 465, h: 75, fill: C.pale, radius: 10 });
  addText(slide, item.slogan, { l: 59, t: 565, w: 437, h: 55, size: 17, bold: true, color: C.red, vAlign: "middle" });
  surfaceCard(slide, 550, 100, 660, 175, item.selling_points_label, item.selling_points.join("\n"), {
    titleSize: 25, bodySize: 18, titleColor: C.red,
  });
  const table = item.table;
  if (table?.headers?.length && table?.rows?.length) {
    // gold 三栏 [260,120,210] @x585 y295；其他栏数均分 590
    const columnWidths = table.headers.length === 3 ? [260, 120, 210] : table.headers.map(() => 590 / table.headers.length);
    let headerX = 585;
    table.headers.forEach((header, index) => {
      tableCell(slide, header, headerX, 295, columnWidths[index], 44, { fill: C.deep, color: C.white, bold: true, size: 16 });
      headerX += columnWidths[index];
    });
    table.rows.forEach((row, rowIndex) => {
      let cellX = 585;
      row.forEach((cellValue, colIndex) => {
        const cell = typeof cellValue === "object" && cellValue !== null ? cellValue : { text: cellValue };
        tableCell(slide, cell.text, cellX, 339 + rowIndex * 38, columnWidths[colIndex], 38, {
          fill: rowIndex % 2 ? C.pale : C.white, size: 16,
          ...(cell.emphasis ? { bold: true, color: C.red } : {}),
        });
        cellX += columnWidths[colIndex];
      });
    });
  }
  addText(slide, [
    { text: item.suitable_for_label, bold: true, color: C.red, breakLine: true },
    { text: item.suitable_for, color: GOLD_INK_SOFT },
  ], { l: 550, t: 470, w: 660, h: 160, size: 18 });
}

// Weighted comparison
{
  const page = data.pages.weighted_comparison;
  const comparison = data.weighted.comparison;
  const slide = newSlide("weighted-comparison", page);
  const products = comparison.products;
  if (products.some((product) => product.image)) {
    // gold 对照表（slide-18）：表头 y100 h66 标签栏宽 150，图片行 + 显式行高 + 同值合并单元格
    const widths = products.map((product) => product.width || Math.floor(1040 / products.length));
    const columnXs = [190];
    for (let index = 1; index < products.length; index++) columnXs.push(columnXs[index - 1] + widths[index - 1]);
    tableCell(slide, comparison.dimension_label, 40, 100, 150, 66, { fill: C.deep, color: C.white, bold: true, size: 18 });
    products.forEach((product, index) => {
      tableCell(slide, product.name, columnXs[index], 100, widths[index], 66, { fill: C.deep, color: C.white, bold: true, size: 17 });
    });
    let rowTop = 166;
    comparison.rows.forEach((row, rowIndex) => {
      const rowHeight = row.height || 100;
      tableCell(slide, row.dimension, 40, rowTop, 150, rowHeight, {
        fill: C.mint, bold: true, size: row.kind === "images" ? 16 : 18,
      });
      if (row.kind === "images") {
        products.forEach((product, productIndex) => {
          if (product.image) {
            addImageSafe(slide, product.image, {
              left: columnXs[productIndex] + 15, top: rowTop + 12,
              width: widths[productIndex] - 30, height: rowHeight - 25,
            });
          }
        });
      } else {
        if (!Array.isArray(row.values) || row.values.length !== products.length) {
          fail(`weighted.comparison.rows[${rowIndex}].values must match products`);
        }
        const merged = row.values.every((value) => value === row.values[0]);
        const fill = row.fill || (rowIndex % 2 ? C.pale : C.white);
        const cellXs = merged ? [190] : columnXs;
        const cellWidths = merged ? [1040] : widths;
        (merged ? [row.values[0]] : row.values).forEach((value, valueIndex) => {
          tableCell(slide, value, cellXs[valueIndex], rowTop, cellWidths[valueIndex], rowHeight, {
            fill, size: row.size || 16, align: "left",
            ...(row.color ? { color: row.color } : {}),
          });
        });
      }
      rowTop += rowHeight;
    });
  } else {
    const xx = 45, yy = 110, labelWidth = 180;
    const productWidth = (1190 - labelWidth) / products.length;
    tableCell(slide, comparison.dimension_label, xx, yy, labelWidth, 72, { fill: C.deep, color: C.white, bold: true, size: 17 });
    products.forEach((product, index) => {
      tableCell(slide, product.name, xx + labelWidth + index * productWidth, yy, productWidth, 72, {
        fill: C.deep, color: C.white, bold: true, size: 17,
      });
    });
    const rowHeight = Math.min(100, 470 / comparison.rows.length);
    comparison.rows.forEach((row, rowIndex) => {
      if (!Array.isArray(row.values) || row.values.length !== products.length) {
        fail(`weighted.comparison.rows[${rowIndex}].values must match products`);
      }
      tableCell(slide, row.dimension, xx, yy + 72 + rowIndex * rowHeight, labelWidth, rowHeight, {
        fill: C.mint, bold: true, size: 16,
      });
      row.values.forEach((value, productIndex) => {
        tableCell(slide, value, xx + labelWidth + productIndex * productWidth, yy + 72 + rowIndex * rowHeight, productWidth, rowHeight, {
          fill: rowIndex % 2 ? C.pale : C.white, size: 16, align: "left",
        });
      });
    });
    if (comparison.footer) {
      addText(slide, comparison.footer, {
        l: 110, t: 615, w: 1060, h: 46, size: 16, color: C.deep, bold: true,
        align: "center", vAlign: "middle", fill: C.mint, radius: 10,
      });
    }
  }
}

// Write
await fs.mkdir(path.dirname(outPath), { recursive: true });
await pptx.writeFile({ fileName: outPath });

// Font patch (Microsoft YaHei)
const skipFontPatch = !process.argv.includes("--font-patch"); // default off: WPS/mac 兼容
let fontPatch = { status: 0 };
if (!skipFontPatch) {
  fontPatch = spawnSync("python3", [FONT_PATCH, outPath, FONT], { encoding: "utf8" });
  if (fontPatch.status !== 0) {
    console.warn(`WARN: font patch failed: ${fontPatch.stderr || fontPatch.stdout}`);
  }
} else {
  console.warn("WARN: font patch skipped (default; pass --font-patch to enable)");
}

const report = {
  schema_version: "disease-product-scenario-generation-report/v1",
  ok: true,
  engine: "disease-product-scenario-pptx-v1",
  renderer: "pptxgenjs",
  provenance: "ported from chain-pharmacy-content-studio production export.mjs layouts",
  input: dataPath,
  theme_id: data.meta.theme_id,
  gold_sample: isAuthorizedGold,
  style_pack_id: style.style_pack_id || style.style_id,
  output: outPath,
  page_count: pageNumber,
  pages: slideRecords,
  input_images: discoveredAssets.length,
  missing_images: missingAssets.map((m) => m.owner),
  placeholder_fallbacks: placeholderFallbacks.map((p) => p.owner),
  default_image_fills: defaultImageFills.map((p) => p.owner),
  images_resolved: discoveredAssets.filter((a) => a.resolved && fsSync.existsSync(a.resolved)).length,
  /** true when every discovered image path resolved to an existing file (incl. placeholders) */
  all_image_slots_filled: discoveredAssets.every((a) => a.resolved && fsSync.existsSync(a.resolved)),
  forbidden_input_hits: inputForbiddenHits,
  font: FONT,
  font_patched: (!skipFontPatch) && fontPatch.status === 0,
};
if (qaDir) {
  await fs.mkdir(qaDir, { recursive: true });
  await fs.writeFile(path.join(qaDir, "generate-report.json"), JSON.stringify(report, null, 2) + "\n");
}
console.log(JSON.stringify(report, null, 2));
