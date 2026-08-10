#!/usr/bin/env node
/**
 * disease-product-scenario-pptx-v1  (self-contained for pharma-content-skills)
 *
 * Port of production-library/engines/disease-product-scenario-pptx-v1/export.mjs
 * Layout / chrome / type scale preserved from the signed production engine.
 * Rendering: pptxgenjs (no @oai/artifact-tool / monorepo path dependency).
 *
 * Required:
 *   --data <script.json>  --out <deck.pptx>
 * Optional:
 *   --style <tokens.json>  --qa <dir>  (qa optional; no PNG montage without extra tools)
 */
import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import PptxGenJS from "pptxgenjs";

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
requireArray("disease.symptoms", { min: 3, max: 4 });
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
const assetRecords = [];
function resolveAsset(relativeOrAbsolute, owner) {
  if (typeof relativeOrAbsolute !== "string" || !relativeOrAbsolute.trim()) return null;
  const resolved = path.isAbsolute(relativeOrAbsolute)
    ? relativeOrAbsolute
    : path.resolve(dataDir, relativeOrAbsolute);
  assetRecords.push({ owner, input: relativeOrAbsolute, resolved });
  return resolved;
}
function findAssetRefs(value, owner = "data", records = []) {
  if (!value || typeof value !== "object") return records;
  if (Array.isArray(value)) {
    value.forEach((item, i) => findAssetRefs(item, `${owner}[${i}]`, records));
    return records;
  }
  for (const [key, child] of Object.entries(value)) {
    if (key === "image" && typeof child === "string" && child.trim()) {
      records.push({ owner: `${owner}.${key}`, resolved: resolveAsset(child, `${owner}.${key}`) });
    } else {
      findAssetRefs(child, `${owner}.${key}`, records);
    }
  }
  return records;
}
const discoveredAssets = findAssetRefs(data);
// Soft-missing images: mark null rather than hard-fail (skill local demos use placeholders).
const missingAssets = [];
for (const rec of discoveredAssets) {
  try {
    await fs.access(rec.resolved);
  } catch {
    missingAssets.push(rec);
    rec.resolved = null;
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
  const o = {
    x: x(opts.l), y: y(opts.t), w: s(opts.w), h: s(opts.h),
    fill: opts.fill ? { color: hex(opts.fill) } : undefined,
    line: opts.line
      ? { color: hex(opts.line), width: opts.lineWidth ?? 1 }
      : { color: hex(opts.fill || C.white), width: 0 },
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
    fontSize: opts.size ?? 18,
    color: hex(opts.color || C.ink),
    bold: !!opts.bold,
    align: opts.align || "left",
    valign: opts.vAlign || "top",
    margin: 0,
    wrap: true,
  };
  if (opts.fill) {
    o.fill = { color: hex(opts.fill) };
    if (opts.radius) {
      // pptxgenjs text box fill is rect; use shape behind for rounded
      addShape(slide, {
        l: opts.l, t: opts.t, w: opts.w, h: opts.h,
        fill: opts.fill, line: opts.line, lineWidth: opts.lineWidth ?? 0, radius: opts.radius,
      });
    } else {
      o.fill = { color: hex(opts.fill) };
      if (opts.line) o.line = { color: hex(opts.line), width: opts.lineWidth ?? 1 };
    }
  } else if (opts.line) {
    o.line = { color: hex(opts.line), width: opts.lineWidth ?? 1 };
  }
  slide.addText(String(value ?? ""), o);
}

function addImageSafe(slide, inputPath, frame, fit = "contain") {
  if (!inputPath) return null;
  const resolved = path.isAbsolute(inputPath) ? inputPath : path.resolve(dataDir, inputPath);
  // check access sync via discovered list
  const hit = discoveredAssets.find((a) => a.input === inputPath || a.resolved === resolved);
  const finalPath = hit?.resolved ?? resolved;
  if (!finalPath) {
    // placeholder frame
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
    slide.addImage({
      path: finalPath,
      x: x(frame.left), y: y(frame.top), w: s(frame.width), h: s(frame.height),
      sizing: { type: fit === "cover" ? "cover" : "contain", w: s(frame.width), h: s(frame.height) },
    });
    return finalPath;
  } catch {
    addShape(slide, {
      l: frame.left, t: frame.top, w: frame.width, h: frame.height,
      fill: C.mint, line: C.line, lineWidth: 1, radius: 12,
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

function addChrome(slide, section, titleValue) {
  // white bg via slide fill
  if (section) {
    addShape(slide, { l: 32, t: 18, w: 68, h: 42, fill: C.deep, radius: 10 });
    addText(slide, section, {
      l: 32, t: 18, w: 68, h: 42, size: 16, color: C.white, bold: true,
      align: "center", vAlign: "middle",
    });
  }
  addText(slide, titleValue, {
    l: 118, t: 15, w: 830, h: 48, size: 22, bold: true, color: C.ink, vAlign: "middle",
  });
  addText(slide, data.meta.brand_label, {
    l: 1000, t: 19, w: 245, h: 38, size: 12, bold: true, color: C.secondary, align: "right", vAlign: "middle",
  });
  addShape(slide, { l: 32, t: 73, w: 1216, h: 1, fill: C.line });
  addShape(slide, { l: 118, t: 70, w: 74, h: 5, fill: C.primary, radius: 2 });
  addText(slide, data.meta.internal_notice, {
    l: 860, t: 688, w: 300, h: 20, size: 10, color: C.muted, align: "right",
  });
  addText(slide, String(pageNumber).padStart(2, "0") + " / " + String(totalPages).padStart(2, "0"), {
    l: 1174, t: 688, w: 70, h: 20, size: 11, color: C.muted, align: "right",
  });
}

function newSlide(type, page, section = null) {
  pageNumber += 1;
  const slide = pptx.addSlide();
  slide.background = { color: C.white };
  if (type !== "cover") addChrome(slide, page.section ?? section, page.title);
  slideRecords.push({ index: pageNumber, type, title: page.title });
  return slide;
}

function bulletList(slide, items, l, t, w, rowHeight, opts = {}) {
  items.forEach((item, index) => {
    const yy = t + index * rowHeight;
    addShape(slide, {
      l, t: yy + 10, w: 14, h: 14, fill: opts.dot || C.primary, type: pptx.ShapeType.ellipse,
    });
    addText(slide, item, {
      l: l + 28, t: yy, w: w - 28, h: rowHeight - 2,
      size: opts.size ?? 17, color: opts.color || C.ink, bold: !!opts.bold, vAlign: "middle",
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
  const slide = newSlide("cover", page);
  addShape(slide, { l: 0, t: 0, w: 760, h: Hpx, fill: C.teal });
  addShape(slide, { l: 760, t: 0, w: 520, h: Hpx, fill: C.blue });
  // soft decorative discs (keep subtle — no hollow-line API on all pptxgen builds)
  addShape(slide, { l: 880, t: 80, w: 360, h: 360, fill: "1F7AA0", type: pptx.ShapeType.ellipse });
  addShape(slide, { l: 940, t: 150, w: 240, h: 240, fill: "2A8BB3", type: pptx.ShapeType.ellipse });
  addShape(slide, { l: 72, t: 86, w: 72, h: 7, fill: C.white, radius: 3 });
  addText(slide, data.meta.organization, { l: 72, t: 110, w: 560, h: 42, size: 16, bold: true, color: C.white });
  addText(slide, page.eyebrow, { l: 72, t: 206, w: 590, h: 38, size: 15, color: "DFF6EC", bold: true });
  addText(slide, page.title, { l: 72, t: 252, w: 620, h: 120, size: 32, bold: true, color: C.white, vAlign: "middle" });
  addText(slide, page.subtitle, { l: 74, t: 382, w: 575, h: 78, size: 18, color: C.white });
  addText(slide, page.prepared_line, { l: 74, t: 594, w: 580, h: 36, size: 12, color: "DFF6EC" });
  addText(slide, data.meta.internal_notice, { l: 74, t: 640, w: 580, h: 30, size: 11, color: "DFF6EC" });
  addImageSafe(slide, page.image, { left: 850, top: 170, width: 330, height: 365 });
  addText(slide, data.product.name, { l: 835, t: 565, w: 360, h: 45, size: 18, bold: true, color: C.white, align: "center" });
}

// 2. Opening
{
  const page = data.pages.opening;
  const slide = newSlide("opening", page);
  addText(slide, page.kicker, { l: 70, t: 108, w: 1140, h: 40, size: 16, color: C.primary, bold: true, align: "center" });
  addText(slide, page.headline, { l: 120, t: 150, w: 1040, h: 92, size: 28, color: C.deep, bold: true, align: "center", vAlign: "middle" });
  const pillars = requireArray("pages.opening.pillars", { min: 3, max: 3 });
  pillars.forEach((pillar, index) => {
    const xx = 65 + index * 405;
    card(slide, xx, 285, 370, 190, {
      fill: index === 1 ? C.mint : C.white,
      line: index === 1 ? C.primary : C.line,
    });
    addShape(slide, { l: xx + 26, t: 310, w: 46, h: 46, fill: C.primary, type: pptx.ShapeType.ellipse });
    addText(slide, String(index + 1), { l: xx + 26, t: 310, w: 46, h: 46, size: 18, bold: true, color: C.white, align: "center", vAlign: "middle" });
    addText(slide, pillar.title, { l: xx + 90, t: 303, w: 250, h: 55, size: 18, bold: true, color: C.deep, vAlign: "middle" });
    addText(slide, pillar.body, { l: xx + 22, t: 371, w: 326, h: 88, size: 14, color: C.ink, align: "center", vAlign: "middle" });
  });
  addText(slide, page.quote, {
    l: 190, t: 530, w: 900, h: 72, size: 17, color: C.deep, bold: true, align: "center", vAlign: "middle",
    fill: C.pale, line: C.line, lineWidth: 1, radius: 14,
  });
}

// 3. Agenda
{
  const page = data.pages.agenda;
  const slide = newSlide("agenda", page);
  const items = data.agenda;
  items.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const xx = 70 + col * 600;
    const yy = 105 + row * 150;
    card(slide, xx, yy, 560, 118, { fill: index % 3 === 1 ? C.mint : C.white });
    addText(slide, item.number, { l: xx + 22, t: yy + 20, w: 64, h: 68, size: 26, bold: true, color: C.primary, align: "center", vAlign: "middle" });
    addText(slide, item.title, { l: xx + 105, t: yy + 18, w: 420, h: 42, size: 18, bold: true, color: C.deep });
    addText(slide, item.subtitle, { l: xx + 105, t: yy + 61, w: 420, h: 38, size: 14, color: C.muted });
  });
}

// 4. Disease definition
{
  const page = data.pages.disease_definition;
  const slide = newSlide("disease-definition", page);
  addImageSafe(slide, page.image, { left: 65, top: 120, width: 400, height: 410 });
  addText(slide, data.disease.name, { l: 515, t: 118, w: 680, h: 62, size: 26, bold: true, color: C.deep });
  addText(slide, data.disease.definition, {
    l: 515, t: 194, w: 680, h: 142, size: 16, color: C.ink,
    fill: C.pale, line: C.line, lineWidth: 1, radius: 14,
  });
  const tags = requireArray("disease.definition_tags", { min: 3, max: 5 });
  tags.forEach((tag, index) => {
    const xx = 515 + (index % 2) * 340;
    const yy = 370 + Math.floor(index / 2) * 82;
    addText(slide, tag, {
      l: xx, t: yy, w: 305, h: 58, size: 15, bold: true, color: C.deep,
      align: "center", vAlign: "middle", fill: C.mint, line: C.line, lineWidth: 1, radius: 12,
    });
  });
}

// 5. Symptoms
{
  const page = data.pages.symptoms;
  const slide = newSlide("symptoms", page);
  data.disease.symptoms.forEach((symptom, index) => {
    const xx = 55 + index * 300;
    card(slide, xx, 115, 275, 500, { fill: index % 2 ? C.pale : C.white });
    addImageSafe(slide, symptom.image, { left: xx + 40, top: 145, width: 195, height: 190 });
    addText(slide, symptom.name, { l: xx + 28, t: 356, w: 219, h: 52, size: 16, bold: true, color: C.deep, align: "center", vAlign: "middle" });
    addText(slide, symptom.description, { l: xx + 28, t: 420, w: 219, h: 150, size: 13, color: C.ink, align: "center" });
  });
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
  const xx = 55, yy = 112, tableWidth = 1170;
  const columnWidths = columns.map((_, i) => (i === 0 ? 210 : (tableWidth - 210) / (columns.length - 1)));
  let cursorX = xx;
  columns.forEach((column, i) => {
    tableCell(slide, column, cursorX, yy, columnWidths[i], 58, { fill: C.deep, color: C.white, bold: true, size: 16 });
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
        size: 14,
      });
      cursorX += columnWidths[ci];
    });
  });
  if (page.footer) {
    addText(slide, page.footer, {
      l: 120, t: 605, w: 1040, h: 52, size: 15, bold: true, color: C.deep,
      align: "center", vAlign: "middle", fill: C.mint, radius: 12,
    });
  }
}

// 7. Treatment
{
  const page = data.pages.treatment;
  const slide = newSlide("treatment-principles", page);
  data.disease.treatment_principles.forEach((item, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const xx = 55 + col * 405;
    const yy = 115 + row * 245;
    titleBodyCard(slide, xx, yy, 370, 210, item.title, item.body, {
      fill: row % 2 ? C.pale : C.white, titleSize: 17, bodySize: 14,
    });
  });
}

// 8. Subtypes
{
  const page = data.pages.subtypes;
  const slide = newSlide("subtypes", page);
  data.disease.subtypes.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const xx = 65 + col * 600;
    const yy = 112 + row * 250;
    card(slide, xx, yy, 550, 215, { fill: index % 2 ? C.pale : C.white });
    addText(slide, item.name, { l: xx + 24, t: yy + 20, w: 500, h: 42, size: 18, bold: true, color: C.deep });
    addText(slide, item.features_label, { l: xx + 24, t: yy + 78, w: 100, h: 30, size: 14, bold: true, color: C.primary });
    addText(slide, item.features, { l: xx + 145, t: yy + 75, w: 375, h: 55, size: 14, color: C.ink });
    addText(slide, item.approach_label, { l: xx + 24, t: yy + 143, w: 100, h: 30, size: 14, bold: true, color: C.primary });
    addText(slide, item.approach, { l: xx + 145, t: yy + 140, w: 375, h: 55, size: 14, color: C.ink });
  });
}

// 9. Product info
{
  const page = data.pages.product_info;
  const slide = newSlide("product-info", page);
  addImageSafe(slide, data.product.image, { left: 60, top: 125, width: 400, height: 360 });
  addText(slide, data.product.name, { l: 60, t: 515, w: 400, h: 58, size: 20, bold: true, color: C.deep, align: "center", vAlign: "middle" });
  data.product.information.forEach((field, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const xx = 510 + col * 355;
    const yy = 118 + row * 158;
    card(slide, xx, yy, 325, 132, { fill: row % 2 ? C.pale : C.white });
    addText(slide, field.label, { l: xx + 20, t: yy + 16, w: 285, h: 30, size: 13, bold: true, color: C.primary });
    addText(slide, field.value, { l: xx + 20, t: yy + 52, w: 285, h: 62, size: 15, bold: field.emphasis === true, color: C.ink, vAlign: "middle" });
  });
  const badges = Array.isArray(data.product.badges) ? data.product.badges : [];
  badges.slice(0, 3).forEach((badge, index) => {
    addText(slide, badge, {
      l: 510 + index * 235, t: 610, w: 205, h: 42, size: 13, bold: true, color: C.deep,
      align: "center", vAlign: "middle", fill: C.mint, radius: 10,
    });
  });
}

// 10. Advantages
{
  const page = data.pages.advantages;
  const slide = newSlide("product-advantages", page);
  data.product.advantages.forEach((item, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const xx = 65 + col * 600;
    const yy = 115 + row * 245;
    card(slide, xx, yy, 550, 210, { fill: index % 3 === 1 ? C.mint : C.white });
    addShape(slide, { l: xx + 24, t: yy + 26, w: 52, h: 52, fill: C.primary, type: pptx.ShapeType.ellipse });
    addText(slide, String(index + 1), { l: xx + 24, t: yy + 26, w: 52, h: 52, size: 18, bold: true, color: C.white, align: "center", vAlign: "middle" });
    addText(slide, item.title, { l: xx + 96, t: yy + 25, w: 420, h: 52, size: 18, bold: true, color: C.deep, vAlign: "middle" });
    addText(slide, item.body, { l: xx + 28, t: yy + 96, w: 494, h: 88, size: 14, color: C.ink });
  });
}

// 11. Product summary
{
  const page = data.pages.product_summary;
  const slide = newSlide("product-summary", page);
  addText(slide, data.product.summary.headline, {
    l: 120, t: 102, w: 1040, h: 72, size: 22, bold: true, color: C.deep,
    align: "center", vAlign: "middle", fill: C.mint, radius: 14,
  });
  const groups = data.product.summary.groups;
  const groupWidth = groups.length === 2 ? 540 : 365;
  const startX = groups.length === 2 ? 80 : 55;
  groups.forEach((group, index) => {
    if (!Array.isArray(group.items) || group.items.length < 1 || group.items.length > 4) {
      fail(`product.summary.groups[${index}].items must contain 1..4 items`);
    }
    const xx = startX + index * (groupWidth + 35);
    card(slide, xx, 215, groupWidth, 355, { fill: index === 1 ? C.pale : C.white });
    addText(slide, group.title, { l: xx + 24, t: 238, w: groupWidth - 48, h: 48, size: 18, bold: true, color: C.deep, align: "center", vAlign: "middle" });
    bulletList(slide, group.items, xx + 32, 310, groupWidth - 64, 62, { size: 15 });
  });
}

// 12. Audience
{
  const page = data.pages.audience;
  const slide = newSlide("audience", page);
  data.product.audience.forEach((item, index) => {
    const xx = 65 + index * 405;
    card(slide, xx, 115, 370, 500, { fill: index === 1 ? C.pale : C.white });
    addImageSafe(slide, item.image, { left: xx + 60, top: 145, width: 250, height: 225 });
    addText(slide, item.title, { l: xx + 30, t: 390, w: 310, h: 55, size: 18, bold: true, color: C.deep, align: "center", vAlign: "middle" });
    addText(slide, item.body, { l: xx + 30, t: 465, w: 310, h: 112, size: 14, color: C.ink, align: "center" });
  });
}

// 13. Consultation
{
  const page = data.pages.consultation;
  const slide = newSlide("consultation", page);
  data.product.consultation.forEach((item, index) => {
    const yy = 112 + index * 128;
    addShape(slide, { l: 75, t: yy + 17, w: 78, h: 78, fill: C.primary, type: pptx.ShapeType.ellipse });
    addText(slide, item.step, { l: 75, t: yy + 17, w: 78, h: 78, size: 18, bold: true, color: C.white, align: "center", vAlign: "middle" });
    card(slide, 185, yy, 1020, 112, { fill: index % 2 ? C.pale : C.white });
    addText(slide, item.title, { l: 215, t: yy + 16, w: 260, h: 34, size: 16, bold: true, color: C.deep });
    addText(slide, item.question, { l: 215, t: yy + 53, w: 950, h: 44, size: 15, color: C.ink, vAlign: "middle" });
  });
}

// 14+ Scenarios
for (const [scenarioIndex, scenario] of data.product.scenarios.entries()) {
  if (!scenario.page_title || !scenario.title || !Array.isArray(scenario.dialogues) ||
      scenario.dialogues.length < 2 || scenario.dialogues.length > 5) {
    fail(`product.scenarios[${scenarioIndex}] requires page_title, title and 2..5 dialogues`);
  }
  const page = { title: scenario.page_title, section: scenario.section };
  const slide = newSlide("scenario", page);
  addText(slide, scenario.title, { l: 65, t: 105, w: 650, h: 54, size: 20, bold: true, color: C.deep });
  titleBodyCard(slide, 65, 180, 520, 150, scenario.profile_label, scenario.profile, { fill: C.pale, bodySize: 14 });
  titleBodyCard(slide, 65, 350, 520, 145, scenario.needs_label, scenario.needs, { fill: C.white, bodySize: 14 });
  addText(slide, scenario.recommendation_label, { l: 65, t: 520, w: 520, h: 34, size: 14, bold: true, color: C.primary });
  addText(slide, scenario.recommendation, {
    l: 65, t: 556, w: 520, h: 80, size: 14, color: C.ink, fill: C.mint, radius: 10,
  });
  scenario.dialogues.forEach((dialogue, index) => {
    const yy = 120 + index * 103;
    const staff = dialogue.role === "staff";
    const xx = staff ? 650 : 720;
    addText(slide, dialogue.speaker, { l: xx, t: yy, w: 150, h: 28, size: 12, bold: true, color: staff ? C.primary : C.blue });
    addText(slide, dialogue.text, {
      l: xx, t: yy + 30, w: staff ? 520 : 455, h: 62, size: 13, color: C.ink,
      fill: staff ? C.mint : "EEF5FA", line: staff ? C.line : "D9E5ED", lineWidth: 1, radius: 12, vAlign: "middle",
    });
  });
}

// Daily care
{
  const page = data.pages.daily_care;
  const slide = newSlide("daily-care", page);
  const careColumns = data.product.daily_care.length === 4 ? 2 : 3;
  const careWidth = careColumns === 2 ? 550 : 370;
  const careStep = careColumns === 2 ? 600 : 405;
  data.product.daily_care.forEach((item, index) => {
    const col = index % careColumns;
    const row = Math.floor(index / careColumns);
    const xx = 55 + col * careStep;
    const yy = 112 + row * 260;
    card(slide, xx, yy, careWidth, 225, { fill: index % 2 ? C.pale : C.white });
    addImageSafe(slide, item.image, { left: xx + 22, top: yy + 27, width: 110, height: 110 });
    addText(slide, item.title, { l: xx + 148, t: yy + 28, w: careWidth - 172, h: 60, size: 15, bold: true, color: C.deep, vAlign: "middle" });
    addText(slide, item.body, { l: xx + 25, t: yy + 146, w: careWidth - 50, h: 60, size: 13, color: C.ink, align: "center" });
  });
}

// Weighted items
for (const [itemIndex, item] of data.weighted.items.entries()) {
  if (!item.page_title || !item.name) fail(`weighted.items[${itemIndex}] requires page_title and name`);
  const page = { title: item.page_title, section: item.section };
  const slide = newSlide("weighted-detail", page);
  addImageSafe(slide, item.image, { left: 55, top: 110, width: 420, height: 265 });
  addText(slide, item.name, { l: 55, t: 385, w: 420, h: 48, size: 18, bold: true, color: C.deep, align: "center" });
  const fields = Array.isArray(item.fields) ? item.fields : [];
  if (fields.length < 1 || fields.length > 4) fail(`weighted.items[${itemIndex}].fields must contain 1..4 items`);
  if (!Array.isArray(item.selling_points) || item.selling_points.length < 1 || item.selling_points.length > 4) {
    fail(`weighted.items[${itemIndex}].selling_points must contain 1..4 items`);
  }
  fields.forEach((field, index) => {
    const width = 420 / Math.max(fields.length, 1);
    tableCell(slide, field.label, 55 + index * width, 452, width, 40, { fill: C.deep, color: C.white, bold: true, size: 12 });
    tableCell(slide, field.value, 55 + index * width, 492, width, 60, { fill: C.white, size: 13 });
  });
  addText(slide, item.slogan, {
    l: 55, t: 575, w: 420, h: 67, size: 14, bold: true, color: C.red, align: "center", vAlign: "middle",
    fill: C.pale, radius: 10,
  });
  titleBodyCard(slide, 520, 110, 705, 220, item.selling_points_label, item.selling_points.join("\n"), {
    titleColor: C.red, bodySize: 15, fill: C.white,
  });
  const table = item.table;
  if (table?.headers?.length && table?.rows?.length) {
    const columnWidth = 650 / table.headers.length;
    table.headers.forEach((header, index) =>
      tableCell(slide, header, 548 + index * columnWidth, 355, columnWidth, 42, {
        fill: C.deep, color: C.white, bold: true, size: 13,
      }),
    );
    table.rows.forEach((row, rowIndex) =>
      row.forEach((value, colIndex) =>
        tableCell(slide, value, 548 + colIndex * columnWidth, 397 + rowIndex * 40, columnWidth, 40, {
          fill: rowIndex % 2 ? C.pale : C.white, size: 12,
        }),
      ),
    );
  }
  addText(slide, item.suitable_for_label, { l: 520, t: 535, w: 170, h: 34, size: 14, bold: true, color: C.primary });
  addText(slide, item.suitable_for, {
    l: 520, t: 570, w: 705, h: 72, size: 14, color: C.ink, fill: C.mint, radius: 10,
  });
}

// Weighted comparison
{
  const page = data.pages.weighted_comparison;
  const comparison = data.weighted.comparison;
  const slide = newSlide("weighted-comparison", page);
  const products = comparison.products;
  const xx = 45, yy = 110, labelWidth = 180;
  const productWidth = (1190 - labelWidth) / products.length;
  tableCell(slide, comparison.dimension_label, xx, yy, labelWidth, 72, { fill: C.deep, color: C.white, bold: true, size: 15 });
  products.forEach((product, index) => {
    tableCell(slide, product.name, xx + labelWidth + index * productWidth, yy, productWidth, 72, {
      fill: C.deep, color: C.white, bold: true, size: 15,
    });
  });
  const rowHeight = Math.min(100, 470 / comparison.rows.length);
  comparison.rows.forEach((row, rowIndex) => {
    if (!Array.isArray(row.values) || row.values.length !== products.length) {
      fail(`weighted.comparison.rows[${rowIndex}].values must match products`);
    }
    tableCell(slide, row.dimension, xx, yy + 72 + rowIndex * rowHeight, labelWidth, rowHeight, {
      fill: C.mint, bold: true, size: 14,
    });
    row.values.forEach((value, productIndex) => {
      tableCell(slide, value, xx + labelWidth + productIndex * productWidth, yy + 72 + rowIndex * rowHeight, productWidth, rowHeight, {
        fill: rowIndex % 2 ? C.pale : C.white, size: 13, align: "left",
      });
    });
  });
  if (comparison.footer) {
    addText(slide, comparison.footer, {
      l: 110, t: 615, w: 1060, h: 46, size: 14, color: C.deep, bold: true,
      align: "center", vAlign: "middle", fill: C.mint, radius: 10,
    });
  }
}

// Write
await fs.mkdir(path.dirname(outPath), { recursive: true });
await pptx.writeFile({ fileName: outPath });

// Font patch (Microsoft YaHei)
const fontPatch = spawnSync("python3", [FONT_PATCH, outPath, FONT], { encoding: "utf8" });
if (fontPatch.status !== 0) {
  console.warn(`WARN: font patch failed: ${fontPatch.stderr || fontPatch.stdout}`);
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
  forbidden_input_hits: inputForbiddenHits,
  font: FONT,
  font_patched: fontPatch.status === 0,
};
if (qaDir) {
  await fs.mkdir(qaDir, { recursive: true });
  await fs.writeFile(path.join(qaDir, "generate-report.json"), JSON.stringify(report, null, 2) + "\n");
}
console.log(JSON.stringify(report, null, 2));
