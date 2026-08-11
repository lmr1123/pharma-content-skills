#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import {spawnSync} from 'node:child_process';
import {fileURLToPath, pathToFileURL} from 'node:url';

const ENGINE_DIR = path.dirname(fileURLToPath(import.meta.url));
/** Skill-local gold (OOXML 100%). Override with --source. */
const SOURCE_PPTX = path.join(ENGINE_DIR, 'gold', '金样.pptx');
const SOURCE_SHA256 = 'b5787a64b1febca3fb32f6b6037830cb4e768a362950a96c28b76baaefd227bc';
const STYLE_PACK_ID = 'style-pack.lycopene-health-edu-cream-red-v1';
const THEME_SCHEMA = 'ingredient-health-edu-theme/v1';
const EXPECTED_SLIDES = 20;
const ENGINE_ID = 'ingredient-health-edu-ooxml-v1';

// These two files are visual chrome rather than topic/reference content.
// Every other source media object must be replaced and removed from the PPTX.
const ALLOWED_SOURCE_MEDIA_IDS = new Set([
  '/ppt/media/image2.jpeg', // neutral cream mountain texture
  '/ppt/media/image4.jpeg', // red/green line pattern used by the TOC
]);

const PLACEHOLDER_RE = /(待补|待确认|待填写|待提供|占位|placeholder|todo|tbd|xxx|示例文案)/i;
const SOURCE_IDENTITY_RE = /(康爱森)/i;
const SOURCE_TOPIC_RE = /(番茄红素|lycopene)/i;

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    if (['validate-only', 'preview-text-only', 'skip-sha-check', 'emit-image-plan'].includes(key)) {
      out[key] = true;
      continue;
    }
    const value = argv[i + 1];
    if (!value || value.startsWith('--')) throw new Error(`--${key} requires a value`);
    out[key] = value;
    i += 1;
  }
  return out;
}

function sha256Bytes(bytes) {
  return crypto.createHash('sha256').update(bytes).digest('hex');
}

async function sha256File(file) {
  return sha256Bytes(await fsp.readFile(file));
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function normalizedText(value) {
  return String(value ?? '').replace(/\s+/g, '').trim();
}

function graphemeLength(value) {
  return Array.from(String(value ?? '')).length;
}

function significantSourceFragments(value) {
  return String(value ?? '')
    .split(/[\n，。；：、,.!?！？;:()（）【】\[\]]+/)
    .map(normalizedText)
    .filter((item) => graphemeLength(item) >= 8);
}

function pngInfo(bytes) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (bytes.length < 24 || !Buffer.from(bytes.subarray(0, 8)).equals(sig)) return null;
  return {
    width: Buffer.from(bytes).readUInt32BE(16),
    height: Buffer.from(bytes).readUInt32BE(20),
  };
}

async function loadArtifactTool() {
  const envRoot = process.env.ARTIFACT_TOOL_ROOT || '';
  const candidates = [
    path.join(ENGINE_DIR, 'vendor/artifact-tool/dist/artifact_tool.mjs'),
    path.join(ENGINE_DIR, 'node_modules/@oai/artifact-tool/dist/artifact_tool.mjs'),
    envRoot ? path.join(envRoot, 'dist/artifact_tool.mjs') : '',
    // Optional: maker machine monorepo (not required for WorkBuddy if vendor linked)
    path.resolve(
      ENGINE_DIR,
      '../../../../chain-pharmacy-content-studio/production-library/engines/courseware-pptx-v1/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs',
    ),
    path.resolve(
      process.env.HOME || '',
      'Projects/chain-pharmacy-content-studio/production-library/engines/courseware-pptx-v1/node_modules/@oai/artifact-tool/dist/artifact_tool.mjs',
    ),
  ].filter(Boolean);
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return import(pathToFileURL(candidate).href);
  }
  try {
    return await import('@oai/artifact-tool');
  } catch (error) {
    throw new Error(
      `cannot load @oai/artifact-tool (vendor symlink or ARTIFACT_TOOL_ROOT). ${error.message}`,
    );
  }
}

async function writeBlob(file, blob) {
  await fsp.writeFile(file, new Uint8Array(await blob.arrayBuffer()));
}

function buildContract(presentation) {
  if (presentation.slides.items.length !== EXPECTED_SLIDES) {
    throw new Error(`source deck slide count ${presentation.slides.items.length}/${EXPECTED_SLIDES}`);
  }
  const pages = presentation.slides.items.map((slide, index) => {
    const texts = slide.shapes.items
      .filter((shape) => normalizedText(shape.text))
      .map((shape) => {
        const source = String(shape.text);
        const sourceLength = graphemeLength(source);
        return {
          id: String(shape.id),
          name: String(shape.name || ''),
          source,
          source_length: sourceLength,
          max_chars: Math.max(8, Math.ceil(sourceLength * 1.12) + 1),
        };
      });
    const images = slide.images.items
      .filter((image) => !ALLOWED_SOURCE_MEDIA_IDS.has(String(image.imageReferenceId)))
      .map((image) => ({
        id: String(image.id),
        name: String(image.name || ''),
        source_media_id: String(image.imageReferenceId),
        target: {kind: 'slide-image', slide: index + 1, id: String(image.id)},
      }));
    for (const shape of slide.shapes.items) {
      const ref = shape.data?.shape?.fill?.imageReference?.id;
      if (ref && !ALLOWED_SOURCE_MEDIA_IDS.has(String(ref))) {
        images.push({
          id: `shape-fill-${String(shape.id)}`,
          name: String(shape.name || ''),
          source_media_id: String(ref),
          target: {kind: 'slide-shape-fill', slide: index + 1, id: String(shape.id)},
        });
      }
    }
    return {slide: index + 1, texts, images};
  });

  const templateImages = [];
  for (const master of presentation.masters.items) {
    for (const image of master.images?.items || []) {
      if (ALLOWED_SOURCE_MEDIA_IDS.has(String(image.imageReferenceId))) continue;
      templateImages.push({
        key: `master:${master.id}:${String(image.id)}`,
        name: String(image.name || ''),
        source_media_id: String(image.imageReferenceId),
        target: {kind: 'master-image', owner: String(master.id), id: String(image.id)},
      });
    }
  }
  for (const layout of presentation.layouts.items) {
    const owner = String(layout.id || '');
    if (!owner.startsWith('/ppt/slideLayouts/')) continue;
    for (const image of layout.images?.items || []) {
      if (ALLOWED_SOURCE_MEDIA_IDS.has(String(image.imageReferenceId))) continue;
      templateImages.push({
        key: `layout:${owner}:${String(image.id)}`,
        name: String(image.name || ''),
        source_media_id: String(image.imageReferenceId),
        target: {kind: 'layout-image', owner, id: String(image.id)},
      });
    }
  }

  return {pages, templateImages};
}

function contractSummary(contract) {
  return {
    pages: contract.pages.length,
    text_slots: contract.pages.reduce((sum, page) => sum + page.texts.length, 0),
    slide_image_slots: contract.pages.reduce((sum, page) => sum + page.images.length, 0),
    template_image_slots: contract.templateImages.length,
  };
}

function draftTheme(contract, themeName, themeId) {
  return {
    schema: THEME_SCHEMA,
    contract_version: 'ooxml-shape-id-v1',
    theme_id: themeId || `business-theme.${Date.now()}`,
    theme_name: themeName,
    style_pack_id: STYLE_PACK_ID,
    gold_sample: false,
    asset_authorization: {
      confirmed: false,
      authorized_by: '',
      authorization_reference: '',
      scope: 'all-theme-images',
    },
    assets: {},
    template_images: Object.fromEntries(contract.templateImages.map((slot) => [slot.key, ''])),
    pages: contract.pages.map((page) => ({
      slide: page.slide,
      texts: Object.fromEntries(page.texts.map((slot, index) => [
        slot.id,
        `待补充：第${String(page.slide).padStart(2, '0')}页文字${index + 1}`,
      ])),
      images: Object.fromEntries(page.images.map((slot) => [slot.id, ''])),
    })),
  };
}

function exactKeys(actual, expected, label, errors) {
  const actualKeys = Object.keys(actual || {}).sort();
  const expectedKeys = [...expected].sort();
  for (const key of expectedKeys) if (!actualKeys.includes(key)) errors.push(`${label} missing ${key}`);
  for (const key of actualKeys) if (!expectedKeys.includes(key)) errors.push(`${label} unexpected ${key}`);
}

async function validateTheme(theme, themePath, contract, presentation) {
  const errors = [];
  if (!theme || typeof theme !== 'object' || Array.isArray(theme)) return {errors: ['theme JSON must be an object']};
  if (theme.schema !== THEME_SCHEMA) errors.push(`schema must be ${THEME_SCHEMA}`);
  if (theme.style_pack_id !== STYLE_PACK_ID) errors.push(`style_pack_id must be ${STYLE_PACK_ID}`);
  if (!String(theme.theme_id || '').trim()) errors.push('theme_id is required');
  if (!String(theme.theme_name || '').trim()) errors.push('theme_name is required');
  if (theme.gold_sample === true) errors.push('gold_sample source content is not approved for this production route');

  const auth = theme.asset_authorization || {};
  if (auth.confirmed !== true) errors.push('asset_authorization.confirmed must be true');
  if (!String(auth.authorized_by || '').trim()) errors.push('asset_authorization.authorized_by is required');
  if (!String(auth.authorization_reference || '').trim()) {
    errors.push('asset_authorization.authorization_reference is required');
  }
  if (auth.scope !== 'all-theme-images') errors.push('asset_authorization.scope must be all-theme-images');

  const pages = Array.isArray(theme.pages) ? theme.pages : [];
  if (pages.length !== EXPECTED_SLIDES) errors.push(`pages must contain exactly ${EXPECTED_SLIDES} slides`);
  const pageByNumber = new Map();
  for (const page of pages) {
    const slide = Number(page?.slide);
    if (!Number.isInteger(slide) || slide < 1 || slide > EXPECTED_SLIDES) {
      errors.push(`invalid page slide ${String(page?.slide)}`);
      continue;
    }
    if (pageByNumber.has(slide)) errors.push(`duplicate page slide ${slide}`);
    pageByNumber.set(slide, page);
  }

  const allThemeText = [];
  for (const pageContract of contract.pages) {
    const page = pageByNumber.get(pageContract.slide);
    if (!page) {
      errors.push(`missing page ${pageContract.slide}`);
      continue;
    }
    exactKeys(page.texts, pageContract.texts.map((slot) => slot.id), `slide ${pageContract.slide} texts`, errors);
    exactKeys(page.images, pageContract.images.map((slot) => slot.id), `slide ${pageContract.slide} images`, errors);
    for (const slot of pageContract.texts) {
      const value = String(page.texts?.[slot.id] ?? '').trim();
      const normalized = normalizedText(value);
      allThemeText.push(value);
      if (!normalized) {
        errors.push(`slide ${pageContract.slide} text ${slot.id} is empty`);
        continue;
      }
      if (PLACEHOLDER_RE.test(value)) errors.push(`slide ${pageContract.slide} text ${slot.id} is a placeholder`);
      if (graphemeLength(value) > slot.max_chars) {
        errors.push(`slide ${pageContract.slide} text ${slot.id} exceeds ${slot.max_chars} characters`);
      }
      const sourceNormalized = normalizedText(slot.source);
      if (graphemeLength(sourceNormalized) >= 4 && normalized === sourceNormalized) {
        errors.push(`slide ${pageContract.slide} text ${slot.id} still equals source copy`);
      }
      for (const fragment of significantSourceFragments(slot.source)) {
        if (normalized.includes(fragment)) {
          errors.push(`slide ${pageContract.slide} text ${slot.id} still contains source fragment`);
          break;
        }
      }
    }
  }
  exactKeys(
    theme.template_images,
    contract.templateImages.map((slot) => slot.key),
    'template_images',
    errors,
  );

  const textBlob = allThemeText.join('\n');
  if (!textBlob.includes(String(theme.theme_name || ''))) errors.push('theme_name must appear in the slide text');
  if (SOURCE_IDENTITY_RE.test(textBlob)) errors.push('source identity 康爱森 is forbidden in a new theme');
  if (!SOURCE_TOPIC_RE.test(String(theme.theme_name || '')) && SOURCE_TOPIC_RE.test(textBlob)) {
    errors.push('non-lycopene theme still contains 番茄红素/Lycopene source identity');
  }

  const assets = theme.assets && typeof theme.assets === 'object' && !Array.isArray(theme.assets) ? theme.assets : {};
  const referencedAssetKeys = [];
  for (const pageContract of contract.pages) {
    const page = pageByNumber.get(pageContract.slide);
    if (!page) continue;
    for (const slot of pageContract.images) referencedAssetKeys.push(String(page.images?.[slot.id] || ''));
  }
  for (const slot of contract.templateImages) {
    referencedAssetKeys.push(String(theme.template_images?.[slot.key] || ''));
  }
  if (referencedAssetKeys.some((key) => !key.trim())) errors.push('every image slot must bind an asset key');
  const referenced = new Set(referencedAssetKeys.filter(Boolean));
  for (const key of referenced) if (!Object.hasOwn(assets, key)) errors.push(`asset key ${key} is not defined`);
  for (const key of Object.keys(assets)) if (!referenced.has(key)) errors.push(`unused asset key ${key}`);

  const sourceHashes = new Set(presentation.images.items.map((item) => sha256Bytes(item.data)));
  const themeDir = path.dirname(themePath);
  const resolvedAssets = {};
  for (const key of [...referenced].sort()) {
    const raw = assets[key];
    if (typeof raw !== 'string' || !raw.trim()) continue;
    const resolved = path.resolve(themeDir, raw);
    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
      errors.push(`asset ${key} is missing: ${raw}`);
      continue;
    }
    const bytes = await fsp.readFile(resolved);
    const info = pngInfo(bytes);
    if (!info) errors.push(`asset ${key} must be a real PNG`);
    else if (info.width < 64 || info.height < 64) errors.push(`asset ${key} PNG is too small (${info.width}x${info.height})`);
    const digest = sha256Bytes(bytes);
    if (sourceHashes.has(digest)) errors.push(`asset ${key} reuses a source/gold image SHA-256`);
    resolvedAssets[key] = {path: resolved, sha256: digest, size: bytes.length, ...info};
  }

  const themeSha = await sha256File(themePath);
  const assetHashMap = Object.fromEntries(Object.keys(resolvedAssets).sort().map((key) => [key, resolvedAssets[key].sha256]));
  const contentSha = sha256Bytes(Buffer.from(stableJson({assets: assetHashMap, theme_sha256: themeSha}), 'utf8'));
  return {errors: [...new Set(errors)], resolvedAssets, contentSha};
}

function findShape(items, id, label) {
  const shape = (items || []).find((item) => String(item.id) === String(id));
  if (!shape) throw new Error(`cannot resolve ${label} shape ${id}`);
  return shape;
}

async function applyTextOnly(presentation, theme, contract) {
  /** Preview mode: replace text slots only; keep gold images/chrome for visual fidelity demo. */
  const pageByNumber = new Map(theme.pages.map((page) => [Number(page.slide), page]));
  let replaced = 0;
  for (const pageContract of contract.pages) {
    const slide = presentation.slides.items[pageContract.slide - 1];
    const page = pageByNumber.get(pageContract.slide);
    if (!page?.texts) continue;
    for (const slot of pageContract.texts) {
      const next = String(page.texts?.[slot.id] ?? '').trim();
      if (!next || PLACEHOLDER_RE.test(next)) continue;
      if (normalizedText(next) === normalizedText(slot.source)) continue;
      const shape = findShape(slide.shapes.items, slot.id, `slide ${pageContract.slide}`);
      shape.text.replace(slot.source, next);
      if (normalizedText(shape.text) !== normalizedText(next)) {
        shape.text = next;
      }
      if (normalizedText(shape.text) !== normalizedText(next)) {
        throw new Error(`text replacement did not settle at slide ${pageContract.slide} shape ${slot.id}`);
      }
      replaced += 1;
    }
  }
  return {replaced};
}

async function applyTheme(presentation, theme, contract, resolvedAssets) {
  const originalIds = new Set(presentation.images.items.map((item) => String(item.id)));
  const pageByNumber = new Map(theme.pages.map((page) => [Number(page.slide), page]));
  const bytesCache = new Map();
  async function assetBytes(key) {
    if (!bytesCache.has(key)) bytesCache.set(key, await fsp.readFile(resolvedAssets[key].path));
    return bytesCache.get(key);
  }
  async function ensureAssetReference(key) {
    const newId = `/ppt/media/business-${resolvedAssets[key].sha256.slice(0, 32)}.png`;
    if (!presentation.images.items.some((item) => String(item.id) === newId)) {
      presentation.images.add({
        id: newId,
        contentType: 'image/png',
        data: await assetBytes(key),
      });
    }
    return newId;
  }

  for (const pageContract of contract.pages) {
    const slide = presentation.slides.items[pageContract.slide - 1];
    const page = pageByNumber.get(pageContract.slide);
    for (const slot of pageContract.texts) {
      const shape = findShape(slide.shapes.items, slot.id, `slide ${pageContract.slide}`);
      shape.text.replace(slot.source, String(page.texts[slot.id]));
      // Rich-text replace cannot span multiple source paragraphs. Keep the
      // original shape/geometry and fall back to replacing its whole text body.
      if (normalizedText(shape.text) !== normalizedText(page.texts[slot.id])) {
        shape.text = String(page.texts[slot.id]);
      }
      if (normalizedText(shape.text) !== normalizedText(page.texts[slot.id])) {
        throw new Error(`text replacement did not settle at slide ${pageContract.slide} shape ${slot.id}`);
      }
    }
    for (const slot of pageContract.images) {
      const assetKey = String(page.images[slot.id]);
      if (slot.target.kind === 'slide-image') {
        const image = findShape(slide.images.items, slot.id, `slide ${pageContract.slide} image`);
        image.setImageReference(await ensureAssetReference(assetKey));
      } else if (slot.target.kind === 'slide-shape-fill') {
        const shape = findShape(slide.shapes.items, slot.target.id, `slide ${pageContract.slide} fill`);
        const oldFill = shape.data?.shape?.fill || {};
        const newId = await ensureAssetReference(assetKey);
        shape.fill = {
          type: 'image',
          imageReference: {id: newId},
          ...(oldFill.alphaModFix != null ? {alphaModFix: oldFill.alphaModFix} : {}),
          ...(oldFill.srcRect ? {srcRect: oldFill.srcRect} : {}),
          ...(oldFill.fillRect ? {fillRect: oldFill.fillRect} : {}),
          ...(oldFill.stretchFillRect ? {stretchFillRect: oldFill.stretchFillRect} : {}),
        };
      }
    }
  }

  for (const slot of contract.templateImages) {
    const assetKey = String(theme.template_images[slot.key]);
    let owner;
    if (slot.target.kind === 'master-image') {
      owner = presentation.masters.items.find((item) => String(item.id) === slot.target.owner);
    } else {
      owner = presentation.layouts.items.find((item) => String(item.id) === slot.target.owner);
    }
    if (!owner) throw new Error(`cannot resolve template owner ${slot.target.owner}`);
    const image = findShape(owner.images?.items, slot.target.id, slot.key);
    image.setImageReference(await ensureAssetReference(assetKey));
  }

  // image.replace adds approved assets before this point. Remove every unapproved
  // original media entry so unused SVG/PNG fallbacks cannot survive in the PPTX.
  const keep = presentation.images.items.filter((item) => {
    const id = String(item.id);
    return !originalIds.has(id) || ALLOWED_SOURCE_MEDIA_IDS.has(id);
  });
  presentation.images.replace(keep.map((item) => item.toProto()));

  const survivingSourceIds = presentation.images.items
    .map((item) => String(item.id))
    .filter((id) => originalIds.has(id) && !ALLOWED_SOURCE_MEDIA_IDS.has(id));
  if (survivingSourceIds.length) throw new Error(`source media survived: ${survivingSourceIds.join(', ')}`);
}

async function validateApproval(approvalPath, contentSha) {
  if (!approvalPath) throw new Error('--approval is required for formal export');
  const approval = JSON.parse(await fsp.readFile(approvalPath, 'utf8'));
  const errors = [];
  for (const gate of ['content', 'visual']) {
    const record = approval?.[gate] || {};
    if (record.approved !== true) errors.push(`${gate} approval is missing`);
    if (record.content_sha256 !== contentSha) errors.push(`${gate} approval hash does not match theme/assets`);
  }
  if (errors.length) throw new Error(errors.join('; '));
  return approval;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const source = path.resolve(args.source || SOURCE_PPTX);
  if (!fs.existsSync(source)) throw new Error(`source PPTX missing: ${source}`);
  const sourceSha = await sha256File(source);
  if (!args['skip-sha-check'] && sourceSha !== SOURCE_SHA256) {
    throw new Error(
      `source PPTX SHA-256 mismatch: ${sourceSha} (expected gold ${SOURCE_SHA256}). Use --skip-sha-check only for intentional alternate gold.`,
    );
  }

  const {FileBlob, PresentationFile} = await loadArtifactTool();
  const presentation = await PresentationFile.importPptx(await FileBlob.load(source));
  const contract = buildContract(presentation);
  const summary = contractSummary(contract);

  if (args['emit-draft']) {
    const draftPath = path.resolve(args['emit-draft']);
    const themeName = String(args['theme-name'] || '').trim();
    if (!themeName) throw new Error('--theme-name is required with --emit-draft');
    const draft = draftTheme(contract, themeName, args['theme-id']);
    await fsp.mkdir(path.dirname(draftPath), {recursive: true});
    await fsp.writeFile(draftPath, `${JSON.stringify(draft, null, 2)}\n`, 'utf8');
    if (args.report) {
      await fsp.writeFile(
        path.resolve(args.report),
        `${JSON.stringify({ok: true, engine: ENGINE_ID, source_sha256: sourceSha, contract: summary}, null, 2)}\n`,
        'utf8',
      );
    }
    console.log(JSON.stringify({ok: true, engine: ENGINE_ID, draft: draftPath, contract: summary}, null, 2));
    return;
  }

  // Image slot plan for theme extension (required before formal export)
  if (args['emit-image-plan'] || args['image-plan']) {
    const planPath = path.resolve(args['image-plan'] || args['emit-image-plan'] || 'image-plan.json');
    const themeName = String(args['theme-name'] || '新主题').trim();
    const stylePackId = STYLE_PACK_ID;
    const promptBase =
      'Flat 2D health-education illustration, magazine-clean, soft cream paper mood, ' +
      'accent tomato red #D32F2F and soft green #4CAF50 sparingly, centered subject 70% frame, ' +
      'transparent background PNG, no text, no watermark, no photo realism, no 3D render';
    const slots = [];
    for (const page of contract.pages) {
      for (const img of page.images) {
        const assetKey = `s${String(page.slide).padStart(2, '0')}_${img.id}`;
        slots.push({
          asset_key: assetKey,
          slide: page.slide,
          shape_id: img.id,
          shape_name: img.name || '',
          source_media_id: img.source_media_id,
          kind: img.target?.kind || 'slide-image',
          owner: 'system_generates',
          format: 'png',
          transparent_bg_required: true,
          style_pack_id: stylePackId,
          prompt: `${promptBase}, theme: ${themeName}, slot: slide ${page.slide} ${img.name || img.id}`,
          file_hint: `assets/${assetKey}.png`,
        });
      }
    }
    for (const img of contract.templateImages) {
      const assetKey = `tpl_${img.key.replace(/[^a-zA-Z0-9]+/g, '_').slice(0, 48)}`;
      slots.push({
        asset_key: assetKey,
        slide: null,
        shape_id: img.id,
        shape_name: img.name || img.key,
        source_media_id: img.source_media_id,
        kind: img.target?.kind || 'template-image',
        key: img.key,
        owner: 'system_generates',
        format: 'png',
        transparent_bg_required: true,
        style_pack_id: stylePackId,
        prompt: `${promptBase}, theme: ${themeName}, template chrome: ${img.name || img.key}`,
        file_hint: `assets/${assetKey}.png`,
      });
    }
    const plan = {
      schema: 'ooxml-image-plan/v1',
      engine: ENGINE_ID,
      style_pack_id: stylePackId,
      style_pack_docs: [
        'engines/ingredient-health-edu-ooxml-v1/style-pack/design.md',
        'engines/ingredient-health-edu-ooxml-v1/style-pack/ILLUSTRATION_PROMPTS.md',
        'engines/ingredient-health-edu-ooxml-v1/style-pack/tokens.json',
      ],
      theme_name: themeName,
      source_sha256: sourceSha,
      counts: {
        slide_image_slots: summary.slide_image_slots,
        template_image_slots: summary.template_image_slots,
        total: slots.length,
      },
      rules_zh: [
        '正式换题必须绑定全部图槽 PNG，禁止 preview-text-only 当交付',
        '生图必须跟 style_pack 米白番茄红，禁止 store-vitality / 全绿线稿默认',
        '透明底 PNG；禁止不透明海报底板；禁止假包装',
        '不得复用金样番茄/原商品图像素（SHA 门禁）',
      ],
      slots,
    };
    await fsp.mkdir(path.dirname(planPath), {recursive: true});
    await fsp.writeFile(planPath, `${JSON.stringify(plan, null, 2)}\n`, 'utf8');
    // human-readable checklist
    const mdPath = planPath.replace(/\.json$/i, '.md');
    const lines = [
      `# 素材计划 · ${themeName}`,
      '',
      `> pipeline: **B** · style_pack: \`${stylePackId}\` · 共 **${slots.length}** 图槽`,
      '',
      '## 硬规则',
      ...plan.rules_zh.map((r) => `- ${r}`),
      '',
      '## 画风',
      '- 读 `style-pack/ILLUSTRATION_PROMPTS.md`',
      '- 米白纸感 + 番茄红点缀 + 透明底扁平插画',
      '',
      '## 槽位清单',
      '',
      '| # | asset_key | slide | file |',
      '|---|-----------|-------|------|',
    ];
    slots.forEach((s, i) => {
      lines.push(`| ${i + 1} | \`${s.asset_key}\` | ${s.slide ?? 'template'} | \`${s.file_hint}\` |`);
    });
    lines.push('', '## 绑定', '', '生成 PNG 后写入 theme.json 的 `assets` 与各页 `images` / `template_images`，再 formal export。', '');
    await fsp.writeFile(mdPath, lines.join('\n'), 'utf8');
    console.log(JSON.stringify({ok: true, engine: ENGINE_ID, image_plan: planPath, markdown: mdPath, counts: plan.counts}, null, 2));
    return;
  }

  if (!args.theme) throw new Error('--theme is required (or --emit-draft)');
  if (!args.out) throw new Error('--out is required');
  const themePath = path.resolve(args.theme);
  const theme = JSON.parse(await fsp.readFile(themePath, 'utf8'));
  const out = path.resolve(args.out);
  await fsp.mkdir(path.dirname(out), {recursive: true});

  // ---- Preview: text-only swap, keep gold images (business can open and see shell = 100%) ----
  if (args['preview-text-only']) {
    const {replaced} = await applyTextOnly(presentation, theme, contract);
    const pptx = await PresentationFile.exportPptx(presentation);
    await pptx.save(out);
    const report = {
      ok: true,
      engine: ENGINE_ID,
      mode: 'preview-text-only',
      note_zh:
        '仅替换已填写文字槽，图片仍用金样（演示版式近100%）。正式换题须补齐图槽 PNG + approval 后走正式模式。',
      source_sha256: sourceSha,
      source_authority: 'original-ooxml-100pct',
      pptx: out,
      page_count: presentation.slides.items.length,
      text_slots_replaced: replaced,
      contract: summary,
    };
    if (args.report) {
      await fsp.mkdir(path.dirname(path.resolve(args.report)), {recursive: true});
      await fsp.writeFile(path.resolve(args.report), `${JSON.stringify(report, null, 2)}\n`, 'utf8');
    }
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  // ---- Formal: full text + image slot replace + residue validation ----
  const validation = await validateTheme(theme, themePath, contract, presentation);
  const validationPayload = {
    ok: validation.errors.length === 0,
    engine: ENGINE_ID,
    source_sha256: sourceSha,
    style_pack_id: STYLE_PACK_ID,
    contract: summary,
    content_sha256: validation.contentSha,
    asset_manifest: Object.fromEntries(
      Object.entries(validation.resolvedAssets || {}).map(([key, value]) => [
        key,
        {sha256: value.sha256, size: value.size, width: value.width, height: value.height},
      ]),
    ),
    errors: validation.errors,
  };
  if (args.report) {
    await fsp.mkdir(path.dirname(path.resolve(args.report)), {recursive: true});
    await fsp.writeFile(path.resolve(args.report), `${JSON.stringify(validationPayload, null, 2)}\n`, 'utf8');
  }
  if (validation.errors.length) {
    console.error(JSON.stringify(validationPayload, null, 2));
    process.exitCode = 2;
    return;
  }
  if (args['validate-only']) {
    console.log(JSON.stringify(validationPayload, null, 2));
    return;
  }

  if (!args.qa || !args.report) throw new Error('formal export requires --out, --qa and --report');
  await validateApproval(args.approval, validation.contentSha);
  await applyTheme(presentation, theme, contract, validation.resolvedAssets);

  const qaDir = path.resolve(args.qa);
  await fsp.mkdir(qaDir, {recursive: true});
  for (const [index, slide] of presentation.slides.items.entries()) {
    const stem = `slide-${String(index + 1).padStart(2, '0')}`;
    await writeBlob(path.join(qaDir, `${stem}.png`), await presentation.export({slide, format: 'png', scale: 1}));
    const layout = await slide.export({format: 'layout'});
    const layoutText = await layout.text();
    const layoutJson = JSON.parse(layoutText);
    if (layoutJson?.slide?.slide !== index + 1 || !Array.isArray(layoutJson?.elements)) {
      throw new Error(`invalid layout QA for slide ${index + 1}`);
    }
    await fsp.writeFile(path.join(qaDir, `${stem}.layout.json`), layoutText, 'utf8');
  }
  await writeBlob(
    path.join(qaDir, 'deck-montage.webp'),
    await presentation.export({format: 'webp', montage: true, scale: 1}),
  );
  const inspection = await presentation.inspect({
    kind: 'slide,textbox,shape,image,layout',
    maxChars: 1000000,
  });
  await fsp.writeFile(path.join(qaDir, 'inspection.ndjson'), `${inspection.ndjson || ''}\n`, 'utf8');

  const pptx = await PresentationFile.exportPptx(presentation);
  await pptx.save(out);
  const validatorReport = path.join(qaDir, 'pptx-validator.json');
  const approvedAssetsReport = path.join(qaDir, 'approved-assets.json');
  await fsp.writeFile(
    approvedAssetsReport,
    `${JSON.stringify(
      Object.fromEntries(
        Object.entries(validation.resolvedAssets).map(([key, value]) => [key, {sha256: value.sha256}]),
      ),
      null,
      2,
    )}\n`,
    'utf8',
  );
  const validator = spawnSync(
    process.env.PYTHON || 'python3',
    [
      path.join(ENGINE_DIR, 'validate_pptx.py'),
      '--source',
      source,
      '--pptx',
      out,
      '--theme-name',
      String(theme.theme_name),
      '--approved-assets',
      approvedAssetsReport,
      '--report',
      validatorReport,
    ],
    {encoding: 'utf8'},
  );
  if (validator.status !== 0) {
    throw new Error(`PPTX residue/structure validator failed: ${validator.stderr || validator.stdout}`);
  }
  const pptxValidation = JSON.parse(await fsp.readFile(validatorReport, 'utf8'));
  const finalReport = {
    ...validationPayload,
    ok: true,
    mode: 'formal',
    source_authority: 'original-ooxml-100pct',
    pptx: out,
    page_count: presentation.slides.items.length,
    editable_text_shapes: summary.text_slots,
    replaced_slide_images: summary.slide_image_slots,
    replaced_template_images: summary.template_image_slots,
    qa: {
      slide_pngs: EXPECTED_SLIDES,
      slide_layouts: EXPECTED_SLIDES,
      montage: path.join(qaDir, 'deck-montage.webp'),
      inspection: path.join(qaDir, 'inspection.ndjson'),
      pptx_validator: validatorReport,
    },
    pptx_validation: pptxValidation,
  };
  await fsp.writeFile(path.resolve(args.report), `${JSON.stringify(finalReport, null, 2)}\n`, 'utf8');
  console.log(JSON.stringify(finalReport, null, 2));
}

main().catch((error) => {
  console.error(error?.stack || String(error));
  process.exitCode = 1;
});
