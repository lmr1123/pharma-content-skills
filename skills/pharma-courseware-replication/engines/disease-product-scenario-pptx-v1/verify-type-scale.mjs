#!/usr/bin/env node
/**
 * verify-type-scale.mjs
 *
 * Guards delivery font sizes against the openable gold editable PPTX.
 * Prevents regressing to layout.json-only type scale (design units ≈ 1/0.75 larger).
 *
 * Usage:
 *   node verify-type-scale.mjs --candidate <out.pptx> [--gold <gold.pptx>] [--max-ratio-err 0.04]
 *
 * Exit 0 if candidate median size / gold median size is within tolerance of 1.0
 * and chrome-title (slide 2 first large text) is within tolerance of gold.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const ENGINE_DIR = path.dirname(fileURLToPath(import.meta.url));

function arg(flag) {
  const i = process.argv.indexOf(flag);
  if (i < 0) return null;
  const v = process.argv[i + 1];
  if (!v || v.startsWith("--")) {
    console.error(`ERROR: ${flag} requires a value`);
    process.exit(2);
  }
  return path.resolve(v);
}

const candidate = arg("--candidate");
const gold =
  arg("--gold") ||
  process.env.GOLD_EDITABLE_PPTX ||
  path.resolve(
    ENGINE_DIR,
    // engines/…/v1 → engines → skill → skills → repo → Projects
    "../../../../chain-pharmacy-content-studio/production-library/templates/settled/disease-product-scenario-v1/穿心莲内酯滴丸_商品培训课件2_可编辑重建版.pptx",
  );
const maxErrRaw = arg("--max-ratio-err");
const maxErr = maxErrRaw != null ? Number(maxErrRaw) : 0.04;

if (!candidate) {
  console.error("Usage: node verify-type-scale.mjs --candidate <out.pptx> [--gold <gold.pptx>]");
  process.exit(2);
}
if (!fs.existsSync(candidate)) {
  console.error(`ERROR: candidate not found: ${candidate}`);
  process.exit(2);
}
if (!fs.existsSync(gold)) {
  console.error(`ERROR: gold not found: ${gold}`);
  console.error("Set --gold or GOLD_EDITABLE_PPTX to the openable 可编辑重建版.pptx");
  process.exit(2);
}

const py = `
import zipfile, re, statistics, sys, json
from collections import Counter

def sizes(pptx):
    z = zipfile.ZipFile(pptx)
    all_sz = []
    by_slide = {}
    for n in z.namelist():
        m = re.match(r"ppt/slides/slide(\\d+)\\.xml$", n)
        if not m:
            continue
        xml = z.read(n).decode("utf-8", "ignore")
        sz = [int(x) / 100 for x in re.findall(r'sz="(\\d+)"', xml)]
        by_slide[int(m.group(1))] = sz
        all_sz.extend(sz)
    return all_sz, by_slide

def text_sizes(pptx, slide_no):
    z = zipfile.ZipFile(pptx)
    n = f"ppt/slides/slide{slide_no}.xml"
    xml = z.read(n).decode("utf-8", "ignore")
    pairs = []
    for m in re.finditer(r"<a:r>(.*?)</a:r>", xml, re.S):
        chunk = m.group(1)
        sz = re.search(r'sz="(\\d+)"', chunk)
        t = re.search(r"<a:t[^>]*>(.*?)</a:t>", chunk, re.S)
        if sz and t:
            text = re.sub(r"\\s+", "", t.group(1))
            if text:
                pairs.append((text[:40], int(sz.group(1)) / 100))
    return pairs

gold_path, cand_path = sys.argv[1], sys.argv[2]
g_all, _ = sizes(gold_path)
c_all, _ = sizes(cand_path)
if not g_all or not c_all:
    print(json.dumps({"ok": False, "error": "no font sizes found"}))
    sys.exit(1)

g_med = statistics.median(g_all)
c_med = statistics.median(c_all)
ratio = c_med / g_med if g_med else None

# chrome title on slide 2: first run that looks like page title (longest early text or max size among first 5)
g2 = text_sizes(gold_path, 2)
c2 = text_sizes(cand_path, 2)
g_chrome = g2[0][1] if g2 else None
c_chrome = c2[0][1] if c2 else None
chrome_ratio = (c_chrome / g_chrome) if (g_chrome and c_chrome) else None

# mode peaks
g_mode = Counter(round(s, 1) for s in g_all).most_common(3)
c_mode = Counter(round(s, 1) for s in c_all).most_common(3)

print(json.dumps({
    "gold_n": len(g_all),
    "cand_n": len(c_all),
    "gold_median": round(g_med, 3),
    "cand_median": round(c_med, 3),
    "median_ratio": round(ratio, 4) if ratio else None,
    "gold_chrome_s2": g_chrome,
    "cand_chrome_s2": c_chrome,
    "chrome_ratio": round(chrome_ratio, 4) if chrome_ratio else None,
    "gold_top": g_mode,
    "cand_top": c_mode,
}, ensure_ascii=False))
`;

const r = spawnSync("python3", ["-c", py, gold, candidate], { encoding: "utf8" });
if (r.status !== 0) {
  console.error(r.stderr || r.stdout);
  process.exit(r.status || 1);
}
let report;
try {
  report = JSON.parse(r.stdout.trim());
} catch {
  console.error("ERROR: bad verify payload", r.stdout);
  process.exit(1);
}

const ratioOk =
  report.median_ratio != null && Math.abs(report.median_ratio - 1) <= maxErr;
const chromeOk =
  report.chrome_ratio != null && Math.abs(report.chrome_ratio - 1) <= maxErr + 0.02;

console.log("type-scale verify");
console.log(`  gold:      ${gold}`);
console.log(`  candidate: ${candidate}`);
console.log(`  median:    gold ${report.gold_median} → cand ${report.cand_median}  ratio=${report.median_ratio}`);
console.log(`  chrome s2: gold ${report.gold_chrome_s2} → cand ${report.cand_chrome_s2}  ratio=${report.chrome_ratio}`);
console.log(`  gold top:  ${JSON.stringify(report.gold_top)}`);
console.log(`  cand top:  ${JSON.stringify(report.cand_top)}`);
console.log(`  tol:       median |r-1|≤${maxErr}, chrome |r-1|≤${maxErr + 0.02}`);

if (!ratioOk || !chromeOk) {
  console.error("FAIL: delivery type scale diverges from openable gold editable PPTX.");
  console.error("      Do not re-align to layout.json resolvedFontSize alone.");
  console.error("      See tokens.json type_scale.ssot / design_to_delivery.");
  process.exit(1);
}
console.log("PASS: delivery type scale matches gold editable PPTX.");
process.exit(0);
