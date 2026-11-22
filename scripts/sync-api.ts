/**
 * Синхронизация каталога с API base.sstmk.ru → PostgreSQL.
 *
 * Что делает:
 *  1. Получает дерево категорий, находит ветку MAKELSAN (бренд).
 *  2. Дочерние категории → таблица Series (серии ИБП).
 *  3. Товары по каждой категории (+ товары, привязанные к корню ветки) → Product.
 *  4. Цены USD конвертируются в ₽ по курсу ЦБ РФ (Setting: usd_rate).
 *  5. Парсит: характеристики (specs), HTML-блоки описания (blocks),
 *     таблицу модификаций (modifications), файлы документации (files),
 *     флаги применения (application).
 *  6. Товары, исчезнувшие из API, деактивируются (active=false).
 *
 * Запуск: npm run sync
 */

import { createHash } from "crypto";
import { readFileSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { BaseApiClient, type ApiCategory, type ApiGood } from "../src/lib/base-api";

// ---------- env ----------

function loadEnv(): void {
  const envPath = path.join(process.cwd(), ".env");
  try {
    const raw = readFileSync(envPath, "utf-8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
      if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2];
    }
  } catch {
    // .env отсутствует — используем переменные окружения
  }
}

loadEnv();

const prisma = new PrismaClient();

const API_URL = process.env.BASE_API_URL ?? "https://base.sstmk.ru/api/";
const API_LOGIN = process.env.BASE_API_LOGIN ?? "";
const API_PASS = process.env.BASE_API_PASS ?? "";
const BRAND_NAME = "MAKELSAN";
const BASE_HOST = "https://base.sstmk.ru";

// ---------- утилиты ----------

const TRANSLIT: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "c", ч: "ch", ш: "sh", щ: "sch",
  ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

function slugify(name: string): string {
  const lower = name.toLowerCase();
  let out = "";
  for (const ch of lower) out += TRANSLIT[ch] ?? ch;
  return (
    out
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "item"
  );
}

function uniqSlug(base: string, used: Set<string>, suffix: string): string {
  let slug = base;
  if (used.has(slug)) slug = `${base}-${suffix}`;
  if (used.has(slug)) slug = `${base}-${suffix}-${Math.random().toString(36).slice(2, 6)}`;
  used.add(slug);
  return slug;
}

const clean = (v: string | undefined): string =>
  unescapeTagEntities((v ?? "").replace(/\s+/g, " ").trim());

function num(v: string | undefined): number | null {
  const s = clean(v).replace(",", ".");
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Декодирование HTML-сущностей: API иногда отдаёт экранированный HTML (иногда в несколько слоёв) */
function unescapeTagEntities(s: string): string {
  let out = s;
  for (let i = 0; i < 5; i++) {
    if (!/&(amp;)*(lt|gt|quot|#39|apos);/.test(out)) break;
    out = out
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&apos;/g, "'")
      .replace(/&amp;/g, "&"); // &amp; — последним, чтобы не декодировать дважды
  }
  return out;
}

/** Абсолютизация ссылок в HTML-контенте API */
function normalizeHtml(html: string | undefined): string | null {
  const raw = html ?? "";
  if (!raw.trim()) return null;
  let out = unescapeTagEntities(raw)
    .replace(/\r/g, "")
    .replace(/(src|href)\s*=\s*"\/(?!\/)/gi, `$1="${BASE_HOST}/`)
    .replace(/(src|href)\s*=\s*'\/(?!\/)/gi, `$1='${BASE_HOST}/`)
    .trim();
  return out || null;
}

// ---------- разбор товара ----------

/** HTML-блоки описания: ключ в JSON → поле(я) API */
const BLOCK_SOURCES: Record<string, string[]> = {
  advantages: ["ist_besp_pit_advantages", "ist_besp_pit_advantages_1"],
  application: ["is_besp_pit_application_area", "is_besp_pit_application_area_1"],
  appearance: ["ibp_appearance", "ibp_appearance_1"],
  installation: ["ibp_installation", "ibp_installation_1"],
  instructions: ["ibp_instructions"],
  complectation: ["ibp_complectation_description", "ibp_complectation_description_1"],
  recommendations: ["ibp_recommendations"],
  features: ["ibp_features", "ibp_features_1"],
};

/** Поля-флаги "0"/"1" → "нет"/"есть" в таблице характеристик */
const BOOLEAN_FIELDS = new Set([
  "ibp_usb", "ibp_rs232", "ibp_snmp", "ibp_ethernet", "ibp_lcd_display",
  "ibp_epo", "ibp_coldstart", "ibp_bypass", "ibp_by_pass", "ibp_manual_by_pass",
  "ibp_static_by_pass", "ibp_galvanic_isolation", "ibp_hot_change_batteries",
  "ibp_change_batteries", "ibp_connecting_akb", "ibp_with_generator",
  "ibp_high_voltage_protection", "ibp_short_circuit_protection",
  "ibp_protection", "ibp_interference_filtering", "ibp_lan_security",
  "ibp_phone_protection", "ibp_antenna_security", "ibp_smart_slot",
  "ibp_more_slots", "ibp_modul", "ibp_napolnyy", "ibp_v_stoyku",
  "ibp_made_in_russia", "ibp_builtin_bat", "ibp_dry_contacts",
]);

/** Поля, не попадающие в таблицу характеристик (внутренние/HTML/дубли) */
const EXCLUDE_FIELDS = new Set([
  ...Object.values(BLOCK_SOURCES).flat(),
  "ibp_modifications", "ibp_foto", "ibp_main_modification_id", "ibp_options_ids",
  "ibp_relevance", "ibp_seriya", "ibp_brand", "ibp_brand_rus", "ibp_model",
  "is_ups", "btn_buy_market", "ibp_block_shema",
  "ibp_top_description", "ibp_top_description_1",
  "ibp_bottom_description", "ibp_bottom_description_1",
  "ibp_block_shema_1", "ibp_documentation", "trebovanija",
  "dlya_cod", "dlya_meditsiny", "dlya_servera", "dlya_stanka", "ibp_home",
  "ibp_factory", "ibp_heating", "ibp_pump", "ibp_sansitive",
  "rectifier_systems_brend", "rectifier_systems_series", "rectifier_systems_model",
  "rectifier_systems_model2", "rectifier_systems_controller",
  "rectifier_systems_warranty", "rectifier_systems_country",
]);

/** Порядок характеристик в начале таблицы */
const PRIOR_FIELDS = [
  "ibp_type", "ibp_nom_powers_kva", "ibp_nom_powers", "ibp_nom_powers_va",
  "ibp_koef_powers", "ibp_number_phase_vx", "ibp_namber_phase_vyx",
  "ibp_vx_voltage", "ibp_vyx_voltage", "ibp_diapazon_vx_voltage",
  "ibp_diapazon_vx_chastota", "ibp_waveform", "ibp_switching_time",
  "ibp_all_kpd", "ibp_output", "ibp_output_type", "ibp_all_gabarity",
  "ibp_weight", "ibp_garanty", "ibp_counry", "ibp_color",
];

type ModificationTable = {
  columns: string[];
  rows: { cells: string[]; relevant: boolean }[];
};

function parseModifications(html: string | undefined): ModificationTable | null {
  const raw = html ?? "";
  if (!raw.includes("<table")) return null;

  const columns: string[] = [];
  const theadMatch = raw.match(/<thead>([\s\S]*?)<\/thead>/i);
  if (theadMatch) {
    for (const th of theadMatch[1].matchAll(/<th[^>]*>([\s\S]*?)<\/th>/gi)) {
      columns.push(clean(th[1].replace(/<[^>]+>/g, "")));
    }
  }

  const rows: ModificationTable["rows"] = [];
  const tbodyMatch = raw.match(/<tbody>([\s\S]*?)<\/tbody>/i);
  const tbody = tbodyMatch ? tbodyMatch[1] : raw;
  for (const tr of tbody.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells: string[] = [];
    for (const td of tr[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)) {
      cells.push(clean(td[1].replace(/<[^>]+>/g, "")));
    }
    if (cells.length) {
      rows.push({
        cells,
        relevant: /relevant_good/i.test(tr[0]),
      });
    }
  }

  if (!rows.length) return null;
  return { columns, rows };
}

type GoodFile = { cat: string; title: string; path: string };

/**
 * files_titles: "instruction#-#Руководство##/uploads/files/ibp/x.pdf#;#tech#-#Описание##/uploads/...pdf#"
 */
function parseFiles(good: ApiGood): GoodFile[] {
  const out: GoodFile[] = [];
  const titlesRaw = clean(good.files_titles);

  if (titlesRaw) {
    for (const entry of titlesRaw.split(/#\s*;\s*#/)) {
      const m = entry.match(/^(.*?)\s*#-#\s*(.*?)\s*##\s*(.*)$/);
      if (m) {
        const [, cat, title, p] = m;
        const pth = clean(p);
        if (pth) out.push({ cat: clean(cat) || "other", title: clean(title) || path2title(pth), path: pth });
      }
    }
  }

  if (!out.length) {
    const paths = clean(good.files)
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);
    for (const p of paths) out.push({ cat: "other", title: path2title(p), path: p });
  }

  // уникальные пути
  const seen = new Set<string>();
  return out.filter((f) => (seen.has(f.path) ? false : (seen.add(f.path), true)));
}

function path2title(p: string): string {
  const file = p.split("/").pop() ?? p;
  return file.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " ");
}

type Application = {
  home?: boolean; server?: boolean; cod?: boolean; medical?: boolean;
  industry?: boolean; heating?: boolean; pump?: boolean; machine?: boolean;
  sensitive?: boolean; rack?: boolean; russian?: boolean;
};

function parseApplication(g: ApiGood): Application {
  const app: Application = {};
  const set = (k: keyof Application, on: boolean) => {
    if (on) app[k] = true;
  };
  set("home", g.ibp_home === "1");
  set("server", g.dlya_servera === "1" || g.ibp_v_stoyku === "1");
  set("cod", g.dlya_cod === "1");
  set("medical", g.dlya_meditsiny === "1");
  set("industry", g.ibp_factory === "1");
  set("heating", g.ibp_heating === "1");
  set("pump", g.ibp_pump === "1");
  set("machine", g.dlya_stanka === "1");
  set("sensitive", g.ibp_sansitive === "1");
  set("rack", g.ibp_v_stoyku === "1");
  set("russian", g.ibp_made_in_russia === "1" || g.minpromtorg_reestr === "1");
  return app;
}

/** Характеристики для таблицы: { label: value } в фиксированном порядке */
function parseSpecs(
  g: ApiGood,
  labels: Record<string, string>
): Record<string, string> {
  const specs: Record<string, string> = {};

  const push = (key: string) => {
    if (EXCLUDE_FIELDS.has(key) || !(key in labels)) return;
    const raw = clean(g[key]);
    if (!raw) return;
    let value: string;
    if (BOOLEAN_FIELDS.has(key)) {
      if (raw === "0" || raw === "1") value = raw === "1" ? "есть" : "нет";
      else value = raw;
    } else {
      if (raw === "0" || raw.toLowerCase() === "нет") return;
      value = raw;
    }
    const label = clean(labels[key]).replace(/\.(pdf|PDF)$/, "").trim();
    if (label && value) specs[label] = value;
  };

  for (const k of PRIOR_FIELDS) push(k);
  for (const k of Object.keys(labels).sort((a, b) => a.localeCompare(b))) push(k);

  return specs;
}

// ---------- курс валют ----------

async function fetchUsdRate(): Promise<number> {
  const fallback = Number(process.env.USD_RUB_RATE_DEFAULT ?? "90");
  try {
    const res = await fetch("https://www.cbr.ru/scripts/XML_daily.asp", {
      signal: AbortSignal.timeout(30_000),
    });
    const xml = await res.text();
    const m = xml.match(/<CharCode>USD<\/CharCode>[\s\S]*?<Value>([\d,]+)<\/Value>/);
    if (m) {
      const rate = Number(m[1].replace(",", "."));
      if (Number.isFinite(rate) && rate > 0) return rate;
    }
  } catch (e) {
    console.warn(`! Курс ЦБ недоступен (${String(e)}), используется запасной`);
  }
  return fallback;
}

// ---------- основная синхронизация ----------

async function main(): Promise<void> {
  if (!API_LOGIN || !API_PASS) {
    throw new Error("BASE_API_LOGIN / BASE_API_PASS не заданы в .env");
  }

  const client = new BaseApiClient(API_LOGIN, API_PASS, API_URL);
  const t0 = Date.now();
  console.log("== Синхронизация MAKELSAN ← base.sstmk.ru ==");

  // 0. Курс USD → RUB
  const rate = await fetchUsdRate();
  console.log(`Курс ЦБ РФ: 1 USD = ${rate.toFixed(4)} RUB`);
  await prisma.setting.upsert({
    where: { key: "usd_rate" },
    create: { key: "usd_rate", value: String(rate) },
    update: { value: String(rate) },
  });

  // 1. Категории: ветка бренда
  const categories = await client.getAllCategories();
  const brandCat = categories.find(
    (c) => c.name.trim().toUpperCase() === BRAND_NAME
  );
  if (!brandCat) throw new Error(`Категория "${BRAND_NAME}" не найдена в API`);
  const seriesCats = categories.filter((c) => c.parent === brandCat.id);
  console.log(
    `Ветка бренда: id=${brandCat.id} "${brandCat.name}", серий: ${seriesCats.length}`
  );

  // 2. Товары по каждой серии + корню ветки
  const goodsByApiId = new Map<string, { good: ApiGood; catApiId: number }>();
  let skippedArchive = 0;

  for (const cat of seriesCats) {
    const goods = await client.getGoodsByCatId(cat.id);
    let added = 0;
    for (const g of goods) {
      if (g.archive === "1") {
        skippedArchive++;
        continue;
      }
      if (!goodsByApiId.has(g.id)) {
        goodsByApiId.set(g.id, { good: g, catApiId: Number(cat.id) });
        added++;
      }
    }
    console.log(`  ${cat.name} (id=${cat.id}): ${goods.length} товаров`);
  }

  // Товары, привязанные напрямую к корню ветки (не попали в дочерние категории)
  const rootGoods = await client.getGoodsByCatId(brandCat.id);
  let rootOnly = 0;
  for (const g of rootGoods) {
    if (g.archive === "1") {
      skippedArchive++;
      continue;
    }
    if (!goodsByApiId.has(g.id)) {
      goodsByApiId.set(g.id, { good: g, catApiId: Number(brandCat.id) });
      rootOnly++;
    }
  }
  console.log(
    `Всего уникальных товаров: ${goodsByApiId.size} (в корне ветки: ${rootOnly}, архив пропущен: ${skippedArchive})`
  );

  // 3. Серии
  const usedSeriesSlugs = new Set<string>();
  const seriesByApiId = new Map<number, string>(); // apiId → prisma id
  const seriesNameByLowerName = new Map<string, string>(); // lower name → prisma id

  const powerStats = new Map<number, { min: number; max: number; count: number }>();
  for (const { good, catApiId } of goodsByApiId.values()) {
    const kva = num(good.ibp_nom_powers_kva);
    if (kva && kva > 0) {
      const s = powerStats.get(catApiId) ?? { min: kva, max: kva, count: 0 };
      s.min = Math.min(s.min, kva);
      s.max = Math.max(s.max, kva);
      s.count++;
      powerStats.set(catApiId, s);
    }
  }

  for (let i = 0; i < seriesCats.length; i++) {
    const cat = seriesCats[i];
    const apiId = Number(cat.id);
    const slug = uniqSlug(slugify(cat.name), usedSeriesSlugs, String(apiId));
    const stats = powerStats.get(apiId);

    const tagline = `ИБП MAKELSAN серии ${cat.name}`;
    const description = stats
      ? `Серия «${cat.name}» включает ${stats.count} ${stats.count === 1 ? "модель" : stats.count < 5 ? "модели" : "моделей"} ИБП MAKELSAN мощностью от ${String(stats.min).replace(".", ",")} до ${String(stats.max).replace(".", ",")} кВА.`
      : `Серия «${cat.name}» ИБП MAKELSAN. Каталог моделей обновляется — свяжитесь с нами для подбора оборудования.`;

    const series = await prisma.series.upsert({
      where: { apiId },
      create: {
        apiId,
        slug,
        name: cat.name,
        tagline,
        description,
        powerMin: stats?.min ?? null,
        powerMax: stats?.max ?? null,
        sortOrder: i,
      },
      update: {
        name: cat.name,
        tagline,
        description,
        powerMin: stats?.min ?? null,
        powerMax: stats?.max ?? null,
        sortOrder: i,
      },
    });
    seriesByApiId.set(apiId, series.id);
    seriesNameByLowerName.set(cat.name.trim().toLowerCase(), series.id);
  }

  // 4. Характеристики (справочник полей)
  const labels = await client.getFields(brandCat.id);

  // 5. Товары
  const usedProductSlugs = new Set<string>(
    (await prisma.product.findMany({ select: { slug: true } })).map((p) => p.slug)
  );
  const syncedApiIds: number[] = [];
  let pricedCount = 0;
  let noPriceCount = 0;

  for (const { good, catApiId } of goodsByApiId.values()) {
    const apiId = Number(good.id);
    const name = clean(good.name) || `Товар ${apiId}`;
    const baseSlug = clean(good.url) || slugify(name);
    const slug = uniqSlug(baseSlug, usedProductSlugs, String(apiId));

    // серия: по категории, иначе — по полю "Серия ИБП"
    let seriesId = seriesByApiId.get(catApiId) ?? null;
    if (!seriesId) {
      const sn = clean(good.ibp_seriya).toLowerCase();
      seriesId = sn ? (seriesNameByLowerName.get(sn) ?? null) : null;
    }

    const priceUsd = num(good.price);
    const saleUsd = good.sale_flag === "1" ? num(good.sale_price) : null;
    const priceKopecks =
      priceUsd && priceUsd > 0 ? Math.round(priceUsd * rate * 100) : null;
    const saleKopecks =
      saleUsd && saleUsd > 0 && priceUsd && priceUsd > 0 && saleUsd < priceUsd
        ? Math.round(saleUsd * rate * 100)
        : null;
    if (priceKopecks) pricedCount++;
    else noPriceCount++;

    const images = clean(good.images)
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean);

    const modDate = clean(good.mod_date)
      ? new Date(good.mod_date.replace(" ", "T"))
      : null;

    const blocks: Record<string, string> = {};
    for (const [key, sources] of Object.entries(BLOCK_SOURCES)) {
      for (const src of sources) {
        const html = normalizeHtml(good[src]);
        if (html) {
          blocks[key] = html;
          break;
        }
      }
    }

    const description = normalizeHtml(good.ibp_top_description) ??
      normalizeHtml(good.ibp_top_description_1);

    await prisma.product.upsert({
      where: { apiId },
      create: {
        apiId,
        slug,
        article: clean(good.articul) || null,
        name,
        seriesId,
        type: clean(good.ibp_type) || null,
        powerKva: num(good.ibp_nom_powers_kva),
        powerKw: num(good.ibp_nom_powers),
        phasesIn: num(good.ibp_number_phase_vx),
        phasesOut: num(good.ibp_namber_phase_vyx),
        priceUsd: priceUsd && priceUsd > 0 ? priceUsd : null,
        priceKopecks,
        saleKopecks,
        isSale: saleKopecks !== null,
        image: clean(good.image) || null,
        images,
        files: parseFiles(good),
        description,
        blocks,
        modifications: parseModifications(good.ibp_modifications) ?? undefined,
        specs: parseSpecs(good, labels),
        application: parseApplication(good),
        deliveryDays: num(good.delivery_days) || null,
        active: true,
        modDate,
      },
      update: {
        article: clean(good.articul) || null,
        name,
        seriesId,
        type: clean(good.ibp_type) || null,
        powerKva: num(good.ibp_nom_powers_kva),
        powerKw: num(good.ibp_nom_powers),
        phasesIn: num(good.ibp_number_phase_vx),
        phasesOut: num(good.ibp_namber_phase_vyx),
        priceUsd: priceUsd && priceUsd > 0 ? priceUsd : null,
        priceKopecks,
        saleKopecks,
        isSale: saleKopecks !== null,
        image: clean(good.image) || null,
        images,
        files: parseFiles(good),
        description,
        blocks,
        modifications: parseModifications(good.ibp_modifications) ?? undefined,
        specs: parseSpecs(good, labels),
        application: parseApplication(good),
        deliveryDays: num(good.delivery_days) || null,
        active: true,
        modDate,
      },
    });
    syncedApiIds.push(apiId);
  }

  // 6. Деактивация товаров, исчезнувших из API
  const deactivated = await prisma.product.updateMany({
    where: { apiId: { notIn: syncedApiIds }, active: true },
    data: { active: false },
  });

  await prisma.setting.upsert({
    where: { key: "synced_at" },
    create: { key: "synced_at", value: new Date().toISOString() },
    update: { value: new Date().toISOString() },
  });

  const totalProducts = await prisma.product.count();
  const totalSeries = await prisma.series.count();

  console.log("== Готово ==");
  console.log(`Серий: ${totalSeries}, товаров в базе: ${totalProducts}`);
  console.log(`С ценой: ${pricedCount}, по запросу: ${noPriceCount}`);
  console.log(`Деактивировано (исчезли из API): ${deactivated.count}`);
  console.log(`Время: ${((Date.now() - t0) / 1000).toFixed(1)} c`);
}

main()
  .catch((e) => {
    console.error("Синхронизация прервана:", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
