import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useDashboard } from '../../../context/DashboardContext';
import {
  TABLE_CONFIG,
  containsApp2cTdlZones,
  containsApp2ALiquid,
} from '../../../utils/index';
import {
  resolveApp2ADropLastColumnIndex,
  stripTableMatrixColumn,
  inferNonLiquidSubTableSection,
} from '../../../utils/app2aTableColumns';
import {
  isApp5ANotesTable,
  applyApp5ANotesColumnWidths,
} from '../../../utils/app5aTableColumns';
import {
  isApp6APercentileTopDepositorsTitle,
  applyApp6APercentileColumnWidths,
  isApp6APercentileSpacerCol,
} from '../../../utils/app6aTableColumns';
import {
  isSubTotalRow as checkIsSubTotalRow,
  removeGroupPrefix,
  isCompositeDepositsTotalLabel,
  isApp4aSummaryBoldRow,
  isExcludedTotalName,
} from '../../../utils/parseListSub';
import Metric from "./AnalyticsProps/Metrics";
import MetricHeadOffice from "./AnalyticsProps/MetricsHeadOffice"
import { containsAppFile, containsApp3M0 } from "../../../utils/index"
import { normalizeSearchQuery } from "../../../utils/tableSearch"

const ENTERPRISE_COLORS = ["#333333", "#FF4D4D", "#d62728", "#8F8C8C"];
const STICKY_BG_EVEN = ["#e2e2e2", "#fde8e8", "#fce8e8", "#e8e8e8", "#ede8e7", "#eaeaea"];
const STICKY_BG_ODD = ["#ebebeb", "#fef0f0", "#fdf0f0", "#f0f0f0", "#f2efee", "#f3f3f3"];
const APP2_BODY_GREY_EVEN = "#e8e8e8";
const APP2_BODY_GREY_ODD = "#f0f0f0";
const APP2_BODY_GREY_BOLD = "#d0d0d0";
const APP2_BODY_PINK_EVEN = "#fde8e8";
const APP2_BODY_PINK_ODD = "#fef0f0";
const APP2_BODY_PINK_BOLD = "#f5d0d0";
const BORDER_COLOR = "#9ca3af";
/** APP 6A — PERCENTILE TOP DEPOSITORS OF FUND. */
const APP_6A_PERCENTILE_LEAF_BG = "#D9D9D9";
const APP_6A_PERCENTILE_SPACER_BG = "#808080";

const normalizeApp2ColumnHeader = (hdr) =>
  String(hdr ?? "")
    .toLowerCase()
    .replace(/[_\s]+/g, " ")
    .replace(/^the\s+/, "")
    .trim();

const isApp2bPinkColumnHeader = (hdr) => {
  const n = normalizeApp2ColumnHeader(hdr);
  return (
    /wow\s+variance/.test(n) ||
    /tdl\s+variance\s+wow/.test(n) ||
    /current\s+vs\s+2025[\s-]*year/.test(n)
  );
};

const isApp2cPinkColumnHeader = (hdr) => {
  const n = normalizeApp2ColumnHeader(hdr);
  return (
    /tdl\s+variance\s+wow/.test(n) ||
    /current\s+tdl\s+vs\s+2026[\s-]*full\s+year\s+target/.test(n)
  );
};

const isApp2bcPinkColumnHeader = (fileName, hdr) => {
  const u = String(fileName ?? "").toUpperCase();
  if (u.includes("APP 2B")) return isApp2bPinkColumnHeader(hdr);
  if (u.includes("APP 2C")) return isApp2cPinkColumnHeader(hdr);
  return false;
};

const getApp2bcBodyColumnBg = (fileName, headerRows, ci, fallback, ri, bold) => {
  const isPink = columnLabelCandidates(headerRows, ci, fallback).some((label) =>
    isApp2bcPinkColumnHeader(fileName, label)
  );
  if (bold) return isPink ? APP2_BODY_PINK_BOLD : APP2_BODY_GREY_BOLD;
  if (isPink) return ri % 2 === 0 ? APP2_BODY_PINK_EVEN : APP2_BODY_PINK_ODD;
  return ri % 2 === 0 ? APP2_BODY_GREY_EVEN : APP2_BODY_GREY_ODD;
};

const normalizeHeaderTitleMatch = (s) =>
  String(s ?? "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

const isMarketReviewTableTitle = (cleanTitle) =>
  normalizeHeaderTitleMatch(cleanTitle).includes("market review");

/** ALCO subsidiary reports (London, Sierra Leone, Paris, …) — narrow Part A beside Market Review text. */
const ALCO_LONDON_PART_LABEL_COL_WIDTH_PX = 72;
const ALCO_LONDON_PART_TEXT_COL_MIN_WIDTH_PX = 520;

const isAlcoLondonSubsidiariesFile = (fileName) => {
  const u = String(fileName ?? "")
    .toUpperCase()
    .replace(/[_\s]+/g, " ");
  return u.includes("ALCO") && u.includes("SUBSIDIAR") && u.includes("LONDON");
};

/** ALCO London MARKET REVIEW — force Outlook onto its own paragraph after GDP Growth. */
const prepareAlcoLondonMarketReviewCellText = (text, fileName, tableTitle) => {
  if (!isAlcoLondonSubsidiariesFile(fileName) || !isMarketReviewTableTitle(tableTitle)) {
    return text;
  }
  return String(text ?? "").replace(
    /(•\s*GDP Growth:[\s\S]*?easing financial conditions\.)\s*(Outlook\b)/i,
    "$1\n\n$2",
  );
};

const isAlcoLondonMarketReviewSectionLine = (line, fileName, tableTitle) => {
  if (!isAlcoLondonSubsidiariesFile(fileName) || !isMarketReviewTableTitle(tableTitle)) {
    return false;
  }
  return /^outlook$/i.test(String(line ?? "").trim());
};

const isAlcoSubsidiariesPartASplitFile = (fileName) => {
  const u = String(fileName ?? "")
    .toUpperCase()
    .replace(/[_\s]+/g, " ");
  if (!u.includes("ALCO") || !u.includes("SUBSIDIAR")) return false;
  return u.includes("LONDON") || u.includes("SIERRA") || u.includes("PARIS");
};

/** ALCO REPORT FOR SUBSIDIARIES_SIERRALEONE — movement tables (deposits / risk assets). */
const ALCO_SIERRA_MOVEMENT_LABEL_COL_MIN_WIDTH_PX = 200;

const isAlcoSierraLeoneSubsidiariesFile = (fileName) => {
  const u = String(fileName ?? "")
    .toUpperCase()
    .replace(/[_\s]+/g, " ");
  if (!u.includes("ALCO") || !u.includes("SUBSIDIAR")) return false;
  return u.includes("SIERRA");
};

const buildAlcoSubsidiariesFileNameBlob = (...parts) =>
  parts
    .filter((p) => p != null && String(p).trim() !== "")
    .join("|");

const isAlcoSierraLeoneMovementTableTitle = (cleanTitle) => {
  const t = normalizeHeaderTitleMatch(cleanTitle);
  return (
    t.includes("movement in total deposit liabilit") ||
    t.includes("movement in total risk assets")
  );
};

const isAlcoSierraLeoneMovementTable = (fileName, cleanTitle) =>
  isAlcoSierraLeoneSubsidiariesFile(fileName) && isAlcoSierraLeoneMovementTableTitle(cleanTitle);

/** API sends DD/MM/YYYY — spreadsheet uses MM/DD/YYYY in column headers. */
const formatAlcoSierraLeoneDisplayDate = (cell) => {
  if (cell == null) return cell;
  const s = String(cell).trim();
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s);
  if (!m) return cell;
  const d = parseInt(m[1], 10);
  const mo = parseInt(m[2], 10);
  const y = m[3];
  if (Number.isNaN(d) || Number.isNaN(mo)) return cell;
  return `${mo}/${d}/${y}`;
};

const withAlcoSierraLeoneMovementHeaderRows = (base, fileName, cleanTitle) => {
  if (!isAlcoSierraLeoneMovementTable(fileName, cleanTitle) || !Array.isArray(base) || base.length === 0) {
    return base;
  }
  return base.map((row, ri) => {
    if (!Array.isArray(row)) return row;
    const next = [...row];
    if (ri === 0) {
      if (next[0] == null || String(next[0]).trim() === "") {
        next[0] = "SIERRA LEONE";
      }
      for (let ci = 1; ci < next.length; ci++) {
        next[ci] = formatAlcoSierraLeoneDisplayDate(next[ci]);
      }
    }
    return next;
  });
};

const prepareAlcoSierraLeoneRiskAssetsRows = (rows, fileName, cleanTitle) => {
  if (!isAlcoSierraLeoneMovementTable(fileName, cleanTitle)) return rows;
  if (!normalizeHeaderTitleMatch(cleanTitle).includes("movement in total risk assets")) return rows;
  if (!Array.isArray(rows) || rows.length === 0) return rows;

  const principalIdx = rows.findIndex(
    (r) => Array.isArray(r) && /^principal\s+loan\s+balances$/i.test(String(r[0] ?? "").trim())
  );
  if (principalIdx <= 0) return rows;

  const prevLabel = String(rows[principalIdx - 1]?.[0] ?? "").trim();
  if (!/^term\s+loan\s*-\s*fcy$/i.test(prevLabel)) return rows;

  const width = Math.max(...rows.map((r) => (Array.isArray(r) ? r.length : 0)), 1);
  const blankRow = Array.from({ length: width }, () => null);
  return [...rows.slice(0, principalIdx), blankRow, ...rows.slice(principalIdx)];
};

const applyAlcoSierraLeoneMovementColumnWidths = (widths, fileName, cleanTitle) => {
  if (!isAlcoSierraLeoneMovementTable(fileName, cleanTitle) || !Array.isArray(widths) || widths.length === 0) {
    return;
  }
  widths[0] = Math.max(widths[0] || 0, ALCO_SIERRA_MOVEMENT_LABEL_COL_MIN_WIDTH_PX);
};

const alcoSierraLeoneMovementDisplayTitle = (cleanTitle) =>
  String(cleanTitle ?? "")
    .replace(/\s*:\s*SIERRA\s+LEONE\s*$/i, "")
    .trim();

const isMarketReviewPartLabelCell = (cell) => {
  const t = String(cell ?? "").trim();
  return /^[A-Z]\.?$/.test(t);
};

/** Locate MARKET REVIEW prose column — Part A (A. + title) or ZBSL API (title in header col 0, prose in body col 1). */
const findAlcoLondonPartAColumnIndices = (headerRows, rows) => {
  const candidates = [...(headerRows || []), ...(rows || []).slice(0, 8)];
  for (const r of candidates) {
    if (!Array.isArray(r) || r.length < 2) continue;
    const c0 = r[0];
    const c1 = String(r[1] ?? "").trim().toLowerCase();
    if (
      isMarketReviewPartLabelCell(c0) &&
      (c1.includes("market review") ||
        c1.includes("outlook") ||
        c1.includes("news") ||
        c1.length >= 12)
    ) {
      return { labelIdx: 0, textIdx: 1 };
    }
  }

  const headerHasMarketReviewTitleInCol0 = (headerRows || []).some((hr) => {
    if (!Array.isArray(hr)) return false;
    const h0 = String(hr[0] ?? "").trim().toLowerCase();
    return h0.includes("market review");
  });
  const bodyHasProseInCol1 = (rows || []).some((r) => {
    if (!Array.isArray(r) || r.length < 2) return false;
    const leftEmpty = r[0] == null || String(r[0]).trim() === "";
    const prose = String(r[1] ?? "").trim();
    return leftEmpty && prose.length >= 20;
  });
  if (headerHasMarketReviewTitleInCol0 && bodyHasProseInCol1) {
    return { labelIdx: 0, textIdx: 1 };
  }

  return null;
};

/** Sierra Leone MARKET REVIEW — Part A boxed prose (A. + underlined title + bordered narrative). */
const hasMarketReviewPartALabel = (headerRows, rows) =>
  [...(headerRows || []), ...(rows || []).slice(0, 3)].some(
    (r) => Array.isArray(r) && isMarketReviewPartLabelCell(r[0])
  );

const isAlcoSierraLeoneMarketReviewTable = (fileName, cleanTitle, headerRows, rows) =>
  isAlcoSierraLeoneSubsidiariesFile(fileName) &&
  isMarketReviewTableTitle(cleanTitle) &&
  findAlcoLondonPartAColumnIndices(headerRows, rows) != null &&
  hasMarketReviewPartALabel(headerRows, rows);

const getAlcoSierraLeoneMarketReviewHeaderTitle = (headerRows, rows) => {
  const idx = findAlcoLondonPartAColumnIndices(headerRows, rows);
  if (!idx) return "MARKET REVIEW, OUTLOOK & NEWS";
  for (const hr of headerRows || []) {
    if (!Array.isArray(hr)) continue;
    const h0 = String(hr[0] ?? "").trim();
    if (h0 && /market review/i.test(h0)) return h0;
    const t = String(hr[idx.textIdx] ?? "").trim();
    if (t && /market review/i.test(t)) return t;
  }
  return "MARKET REVIEW, OUTLOOK & NEWS";
};

const collectAlcoSierraLeoneMarketReviewParagraphs = (rows, headerRows) => {
  const idx = findAlcoLondonPartAColumnIndices(headerRows, rows);
  if (!idx) return [];
  const { textIdx } = idx;
  return (rows || [])
    .map((r) => (Array.isArray(r) ? String(r[textIdx] ?? "").trim() : ""))
    .filter((t) => t.length > 0);
};

const normalizeAlcoSierraMrParagraph = (text) =>
  String(text ?? "").replace(/\s+/g, " ").trim();

/** Narrative lines in ALCO subsidiary MARKET REVIEW (Part A) — never currency cells. */
const isMarketReviewProseLine = (text) => {
  const s = normalizeAlcoSierraMrParagraph(text);
  if (s.length < 16) return false;
  if (/^nle[\d,.]+(?:bn|billion)?\s+to the\b/i.test(s)) return true;
  if (/\bto the (education|health|agriculture|food)\b/i.test(s)) return true;
  if (/key focus of the budget/i.test(s)) return true;
  if (/sierra leone/i.test(s)) return true;
  if (/banking system is stable/i.test(s)) return true;
  if (/domestic headline inflation/i.test(s)) return true;
  if (/government borrowings through its instruments/i.test(s)) return true;
  if (/forex excahanged rate|forex exchange rate/i.test(s)) return true;
  if (/cut-off increased from/i.test(s)) return true;
  return false;
};

const rowsLookLikeSierraLeoneMarketReview = (rows, headerRows) => {
  const idx = findAlcoLondonPartAColumnIndices(headerRows, rows);
  const textIdx = idx?.textIdx ?? 1;
  return (rows || []).some((r) => {
    if (!Array.isArray(r)) return false;
    const t = String(r[textIdx] ?? "").trim();
    return /sierra leone/i.test(t);
  });
};

const getMarketReviewProseColIndices = (headerRows, rows, titles = []) => {
  const found = findAlcoLondonPartAColumnIndices(headerRows, rows);
  if (found) return found;

  const titleMatch = (titles || []).some((t) => isMarketReviewTableTitle(t));
  const headerMr = (headerRows || []).some(
    (hr) => Array.isArray(hr) && /market review/i.test(String(hr[0] ?? ""))
  );
  if (!titleMatch && !headerMr) return null;

  const textIdx = 1;
  const hasBody = (rows || []).some(
    (r) => Array.isArray(r) && String(r[textIdx] ?? "").trim().length >= 16
  );
  return hasBody ? { labelIdx: 0, textIdx } : null;
};

const isMarketReviewNarrativeTableShape = (headerRows, rows, ...titles) =>
  getMarketReviewProseColIndices(headerRows, rows, titles) != null;

const isSierraLeoneMarketReviewContext = (fileNameBlob, cleanTitle, headerRows, rows) => {
  if (!isMarketReviewNarrativeTableShape(headerRows, rows, cleanTitle)) return false;
  return isAlcoSierraLeoneSubsidiariesFile(fileNameBlob) || rowsLookLikeSierraLeoneMarketReview(rows, headerRows);
};

/** MARKET REVIEW narrative body cells — never amount/currency styling. */
const isMarketReviewNarrativeBodyCell = (headerRows, rows, titles, ci, rawStr, colIndices) =>
  colIndices != null &&
  ci === colIndices.textIdx &&
  String(rawStr ?? "").trim().length > 0 &&
  isMarketReviewNarrativeTableShape(headerRows, rows, ...titles);

/** Only the Sierra Leone 2026 national budget revenue / expenditure sentence — nothing else. */
const isAlcoSierraLeoneMarketReviewBoldParagraph = (text) => {
  const s = normalizeAlcoSierraMrParagraph(text).toLowerCase();
  if (!s.includes("government of sierra leone")) return false;
  if (!s.includes("national budgeted revenue")) return false;
  if (!s.includes("total budget expenditure projected")) return false;
  if (/to the (education|health|agriculture|food)/i.test(s)) return false;
  if (/key focus of the budget/i.test(s)) return false;
  return /nle\s*27\.9\s*billion/i.test(s) && /nle\s*35\.3\s*billion/i.test(s);
};

const isAlcoLondonPartASplitTable = (fileName, headerRows, rows) =>
  isAlcoSubsidiariesPartASplitFile(fileName) &&
  findAlcoLondonPartAColumnIndices(headerRows, rows) != null;

const applyAlcoLondonPartColumnWidths = (widths, headerRows, rows) => {
  const idx = findAlcoLondonPartAColumnIndices(headerRows, rows);
  if (!idx || !Array.isArray(widths)) return;
  const { labelIdx, textIdx } = idx;
  while (widths.length <= textIdx) widths.push(100);
  widths[labelIdx] = ALCO_LONDON_PART_LABEL_COL_WIDTH_PX;
  widths[textIdx] = Math.max(widths[textIdx] || 0, ALCO_LONDON_PART_TEXT_COL_MIN_WIDTH_PX);
};

/** APP 4A PFA summary table — used for week-band colspan + optional header injection. */
const isApp4aPfaFixedCallDepositSummary = (currentFileName, cleanTitle) => {
  if (!currentFileName || !String(currentFileName).toUpperCase().includes("APP 4A")) return false;
  const t = normalizeHeaderTitleMatch(cleanTitle);
  return t.includes("summary of pfa fixed and call deposit");
};

/** APP 4A main “SUMMARY” / “Table SUMMARY” widget — not the PFA fixed/call deposit sub-table. */
const isApp4aTableSummaryTitle = (currentFileName, cleanTitle) => {
  if (!currentFileName || !String(currentFileName).toUpperCase().includes("APP 4A")) return false;
  const t = normalizeHeaderTitleMatch(cleanTitle);
  if (isApp4aPfaFixedCallDepositSummary(currentFileName, cleanTitle)) return false;
  return t === "summary" || t === "table summary";
};

/** APP 4B — SUMMARY(USD) / SUMMARY(EUR) / SUMMARY(GBP) comparison tables. */
const isApp4bCurrencySummaryTitle = (currentFileName, cleanTitle) => {
  if (!isApp4BFile(currentFileName)) return false;
  const t = normalizeHeaderTitleMatch(cleanTitle);
  if (/^summary\s*\(\s*(usd|eur|gbp)\s*\)$/.test(t)) return true;
  if (/^summary\s+(usd|eur|gbp)s?$/.test(t)) return true;
  if (/^summary\s+(euros?|dollars?|pounds?|sterling)$/.test(t)) return true;
  return false;
};


/** APP 4B currency summary leaf (API shape): SUMMARY: in col 1 + VOLUME (…) / WA × 2 + DIFFERENCE (8 cols). */
const isApp4bCurrencySummaryLeafHeaderLayout = (leaf) => {
  if (!Array.isArray(leaf) || leaf.length !== 8) return false;
  const c = (i) => String(leaf[i] ?? "").trim();
  return (
    /^summary\s*:?$/i.test(c(1)) &&
    /^volume\s*\(\s*(usd|eur|gbp)\s*\)$/i.test(c(3)) &&
    /^weighted\s+average/i.test(c(4)) &&
    /^volume$/i.test(c(5)) &&
    /^weighted\s+average/i.test(c(6)) &&
    /^difference$/i.test(c(7))
  );
};

/** After 8→6 squeeze: empty label col + VOLUME (…) / WA × 2 + DIFFERENCE (SUMMARY: lives on week-band row). */
const isApp4bSqueezedCurrencySummaryLeafLayout = (leaf) => {
  if (!Array.isArray(leaf) || leaf.length !== 6) return false;
  const c = (i) => String(leaf[i] ?? "").trim();
  return (
    c(0) === "" &&
    /^volume\s*\(\s*(usd|eur|gbp)\s*\)$/i.test(c(1)) &&
    /^weighted\s+average/i.test(c(2)) &&
    /^volume$/i.test(c(3)) &&
    /^weighted\s+average/i.test(c(4)) &&
    /^difference$/i.test(c(5))
  );
};

/** Prior squeeze placed SUMMARY: on the metric header row — re-normalize when seen. */
const isApp4bLegacySqueezedCurrencySummaryLeafLayout = (leaf) => {
  if (!Array.isArray(leaf) || leaf.length !== 6) return false;
  const c = (i) => String(leaf[i] ?? "").trim();
  return (
    /^summary\s*:?$/i.test(c(0)) &&
    /^volume\s*\(\s*(usd|eur|gbp)\s*\)$/i.test(c(1)) &&
    /^weighted\s+average/i.test(c(2)) &&
    /^volume$/i.test(c(3)) &&
    /^weighted\s+average/i.test(c(4)) &&
    /^difference$/i.test(c(5))
  );
};

const isApp4bCurrencySummaryByLayout = (matrix) =>
  Array.isArray(matrix) &&
  matrix.some(
    (r) =>
      isApp4bCurrencySummaryLeafHeaderLayout(r) ||
      isApp4bSqueezedCurrencySummaryLeafLayout(r) ||
      isApp4bLegacySqueezedCurrencySummaryLeafLayout(r)
  );

const shouldNormalizeApp4bCurrencySummaryMatrix = (matrix, currentFileName, cleanTitle) =>
  isApp4BFile(currentFileName) &&
  (isApp4bCurrencySummaryTitle(currentFileName, cleanTitle) ||
    isApp4bCurrencySummaryByLayout(matrix));

const buildApp4bCurrencySummaryWeekBandSubheaderRow = () =>
  ["SUMMARY:", "CURRENT WEEK", "", "PREVIOUS WEEK", "", "-"];

const app4bCurrencySummaryWeekBandRowMatchesIdeal = (row) => {
  if (!Array.isArray(row) || row.length !== 6) return false;
  const ideal = buildApp4bCurrencySummaryWeekBandSubheaderRow();
  return row.every((cell, i) => String(cell ?? "").trim() === String(ideal[i] ?? "").trim());
};

/** Collapse API cols 0–2 (label + spacers) into one label column; keeps volume/WA bands aligned. */
const squeezeApp4bCurrencySummaryRow = (row, { isLabelHeaderRow = false } = {}) => {
  if (Array.isArray(row) && row.length === 6 && isApp4bLegacySqueezedCurrencySummaryLeafLayout(row)) {
    return ["", row[1], row[2], row[3], row[4], row[5]];
  }
  if (!Array.isArray(row) || row.length !== 8) return row;
  if (isLabelHeaderRow && isApp4bCurrencySummaryLeafHeaderLayout(row)) {
    return ["", row[3], row[4], row[5], row[6], row[7]];
  }
  if (rowHasPfaWeekBandSubheaderShape(row)) {
    return buildApp4bCurrencySummaryWeekBandSubheaderRow();
  }
  const label =
    [row[0], row[1], row[2]].find((c) => c != null && String(c).trim() !== "") ?? row[0];
  return [label, row[3], row[4], row[5], row[6], row[7]];
};

const squeezeApp4bCurrencySummaryMatrix = (matrix, currentFileName, cleanTitle, { headerMatrix = false } = {}) => {
  if (!shouldNormalizeApp4bCurrencySummaryMatrix(matrix, currentFileName, cleanTitle) || !Array.isArray(matrix)) {
    return matrix;
  }
  return matrix.map((row) => {
    if (!Array.isArray(row)) return row;
    if (row.length === 6 && isApp4bLegacySqueezedCurrencySummaryLeafLayout(row)) {
      return squeezeApp4bCurrencySummaryRow(row);
    }
    if (row.length !== 8) return row;
    const isLabel = headerMatrix && isApp4bCurrencySummaryLeafHeaderLayout(row);
    return squeezeApp4bCurrencySummaryRow(row, { isLabelHeaderRow: isLabel });
  });
};

/** Normalizes CURRENT / PREVIOUS WEEK row for APP 4B SUMMARY(USD/EUR/GBP) after column squeeze. */
const withApp4bCurrencySummaryWeekBandHeaderRows = (base, currentFileName, cleanTitle) => {
  if (!Array.isArray(base) || base.length === 0) return base;
  if (!shouldNormalizeApp4bCurrencySummaryMatrix(base, currentFileName, cleanTitle)) return base;
  const labelIdx = base.findIndex((r) => isApp4bSqueezedCurrencySummaryLeafLayout(r));
  const weekIdx = findPfaWeekBandSubheaderRowIndex(base);
  if (labelIdx < 0 || weekIdx < 0 || labelIdx === weekIdx) return base;
  const ideal = buildApp4bCurrencySummaryWeekBandSubheaderRow();
  const sub = base[weekIdx];
  if (app4bCurrencySummaryWeekBandRowMatchesIdeal(sub)) return base;
  const next = [...base];
  next[weekIdx] = ideal;
  return next;
};

/** APP 4A main SUMMARY — API 8-col: null / SUMMARY: / null + VOLUME / WA × 2 + WEEK-ON-WEEK VARIANCE. */
const isApp4aMainSummaryLeafHeaderLayout = (leaf) => {
  if (!Array.isArray(leaf) || leaf.length !== 8) return false;
  const c = (i) => String(leaf[i] ?? "").trim();
  return (
    /^summary\s*:?$/i.test(c(1)) &&
    /^volume$/i.test(c(3)) &&
    /^weighted\s+average/i.test(c(4)) &&
    /^volume$/i.test(c(5)) &&
    /^weighted\s+average/i.test(c(6)) &&
    /week[\s-]*on[\s-]*week\s+variance/i.test(c(7))
  );
};

/** After 8→6 squeeze: SUMMARY: + VOLUME / WA × 2 + WEEK-ON-WEEK VARIANCE (week bands on row below). */
const isApp4aSqueezedMainSummaryLeafLayout = (leaf) => {
  if (!Array.isArray(leaf) || leaf.length !== 6) return false;
  const c = (i) => String(leaf[i] ?? "").trim();
  return (
    /^summary\s*:?$/i.test(c(0)) &&
    /^volume$/i.test(c(1)) &&
    /^weighted\s+average/i.test(c(2)) &&
    /^volume$/i.test(c(3)) &&
    /^weighted\s+average/i.test(c(4)) &&
    /week[\s-]*on[\s-]*week\s+variance/i.test(c(5))
  );
};

/** Prior squeeze placed SUMMARY: on the week-band row — re-normalize when seen. */
const isApp4aLegacySqueezedMainSummaryLeafLayout = (leaf) => {
  if (!Array.isArray(leaf) || leaf.length !== 6) return false;
  const c = (i) => String(leaf[i] ?? "").trim();
  return (
    c(0) === "" &&
    /^volume$/i.test(c(1)) &&
    /^weighted\s+average/i.test(c(2)) &&
    /^volume$/i.test(c(3)) &&
    /^weighted\s+average/i.test(c(4)) &&
    /week[\s-]*on[\s-]*week\s+variance/i.test(c(5))
  );
};

const isApp4aMainSummaryByLayout = (matrix) =>
  Array.isArray(matrix) &&
  matrix.some(
    (r) =>
      isApp4aMainSummaryLeafHeaderLayout(r) ||
      isApp4aSqueezedMainSummaryLeafLayout(r) ||
      isApp4aLegacySqueezedMainSummaryLeafLayout(r)
  );

const shouldNormalizeApp4aMainSummaryMatrix = (matrix, currentFileName, cleanTitle) =>
  isApp4aTableSummaryTitle(currentFileName, cleanTitle) || isApp4aMainSummaryByLayout(matrix);

const buildApp4aMainSummaryWeekBandSubheaderRow = () =>
  ["", "CURRENT WEEK", "", "PREVIOUS WEEK", "", ""];

const app4aMainSummaryWeekBandRowMatchesIdeal = (row) => {
  if (!Array.isArray(row) || row.length !== 6) return false;
  const ideal = buildApp4aMainSummaryWeekBandSubheaderRow();
  return row.every((cell, i) => String(cell ?? "").trim() === String(ideal[i] ?? "").trim());
};

const squeezeApp4aMainSummaryRow = (row, { isLabelHeaderRow = false } = {}) => {
  if (Array.isArray(row) && row.length === 6 && isApp4aLegacySqueezedMainSummaryLeafLayout(row)) {
    return ["SUMMARY:", row[1], row[2], row[3], row[4], row[5]];
  }
  if (!Array.isArray(row) || row.length !== 8) return row;
  if (isLabelHeaderRow && isApp4aMainSummaryLeafHeaderLayout(row)) {
    return ["SUMMARY:", row[3], row[4], row[5], row[6], row[7]];
  }
  if (rowHasPfaWeekBandSubheaderShape(row)) {
    return buildApp4aMainSummaryWeekBandSubheaderRow();
  }
  const label =
    [row[0], row[1], row[2]].find((c) => c != null && String(c).trim() !== "") ?? row[0] ?? "";
  return [label, row[3], row[4], row[5], row[6], row[7]];
};

const squeezeApp4aMainSummaryMatrix = (matrix, currentFileName, cleanTitle, { headerMatrix = false } = {}) => {
  if (!shouldNormalizeApp4aMainSummaryMatrix(matrix, currentFileName, cleanTitle) || !Array.isArray(matrix)) {
    return matrix;
  }
  return matrix.map((row) => {
    if (!Array.isArray(row)) return row;
    if (row.length === 6 && isApp4aLegacySqueezedMainSummaryLeafLayout(row)) {
      return squeezeApp4aMainSummaryRow(row);
    }
    if (
      row.length === 6 &&
      rowHasPfaWeekBandSubheaderShape(row) &&
      !isApp4aSqueezedMainSummaryLeafLayout(row)
    ) {
      return buildApp4aMainSummaryWeekBandSubheaderRow();
    }
    if (row.length !== 8) return row;
    const isLabel = headerMatrix && isApp4aMainSummaryLeafHeaderLayout(row);
    return squeezeApp4aMainSummaryRow(row, { isLabelHeaderRow: isLabel });
  });
};

/** Normalizes CURRENT / PREVIOUS WEEK row for APP 4A main SUMMARY after column squeeze. */
const withApp4aMainSummaryWeekBandHeaderRows = (base, currentFileName, cleanTitle) => {
  if (!Array.isArray(base) || base.length === 0) return base;
  if (!shouldNormalizeApp4aMainSummaryMatrix(base, currentFileName, cleanTitle)) return base;
  const labelIdx = base.findIndex(
    (r) => isApp4aSqueezedMainSummaryLeafLayout(r) || isApp4aLegacySqueezedMainSummaryLeafLayout(r)
  );
  const weekIdx = findPfaWeekBandSubheaderRowIndex(base);
  if (labelIdx < 0 || weekIdx < 0 || labelIdx === weekIdx) return base;
  const next = [...base];
  let changed = false;
  const sub = base[weekIdx];
  if (!app4aMainSummaryWeekBandRowMatchesIdeal(sub)) {
    next[weekIdx] = buildApp4aMainSummaryWeekBandSubheaderRow();
    changed = true;
  }
  const label = base[labelIdx];
  if (Array.isArray(label) && label.length === 6 && !/^summary\s*:?$/i.test(String(label[0] ?? "").trim())) {
    next[labelIdx] = ["SUMMARY:", label[1], label[2], label[3], label[4], label[5]];
    changed = true;
  }
  return changed ? next : base;
};

const isCurrencyComparisonSummaryTable = (currentFileName, cleanTitle, layoutMatrix) =>
  isApp4aTableSummaryTitle(currentFileName, cleanTitle) ||
  isApp4bCurrencySummaryTitle(currentFileName, cleanTitle) ||
  (isApp4BFile(currentFileName) && isApp4bCurrencySummaryByLayout(layoutMatrix));

/** APP 4B / APP 4A comparison summary — leaf row used for week-band colspan + column widths. */
const isCurrencyComparisonSummaryLeafHeaderLayout = (leaf, currentFileName, cleanTitle) =>
  isApp4bSqueezedCurrencySummaryLeafLayout(leaf) ||
  isApp4aSqueezedMainSummaryLeafLayout(leaf) ||
  (isApp4aTableSummaryTitle(currentFileName, cleanTitle) &&
    isPfaFixedCallDepositLeafHeaderLayout(leaf));

/** APP 6A “PFA SUMMARY” — same week-band colspan + amount min-width behaviour as APP 4A PFA. */
const isApp6aPfaSummaryTitle = (cleanTitle) => {
  const t = normalizeHeaderTitleMatch(cleanTitle);
  return t === "pfa summary" || t.includes("pfa summary");
};

/** API may send a blank column 1 under DESCRIPTION (7 cols on APP 4A PFA or APP 6A PFA summary; 6 cols without DIFFERENCE on APP 6A only). */
const stripPfaSummarySpacerColumn = (row) => {
  if (!Array.isArray(row)) return row;
  if (row.length === 7) return row.filter((_, i) => i !== 1);
  if (
    row.length === 6 &&
    /^description$/i.test(String(row[0] ?? "").trim()) &&
    (String(row[1] ?? "").trim() === "" || String(row[1] ?? "") === "\u200c")
  ) {
    return row.filter((_, i) => i !== 1);
  }
  return row;
};

/** Bottom leaf row: DESCRIPTION + (AMOUNT, WEIGHTED AVERAGE) × 2 + DIFFERENCE — used for APP 4A week-band colspan. Supports legacy 6-col or 7-col with blank column after DESCRIPTION (API shape). */
const isPfaFixedCallDepositLeafHeaderLayout = (leaf) => {
  if (!Array.isArray(leaf)) return false;
  const c = (i) => String(leaf[i] ?? "").trim();
  const amountPair = (a, w1, w2, d) =>
    /^amount$/i.test(c(a)) &&
    /^weighted\s+average/i.test(c(w1)) &&
    /^amount$/i.test(c(w2)) &&
    /^weighted\s+average/i.test(c(w2 + 1)) &&
    /^difference$/i.test(c(d));
  if (leaf.length === 6 && /^description$/i.test(c(0))) {
    return amountPair(1, 2, 3, 5);
  }
  if (leaf.length === 7 && /^description$/i.test(c(0))) {
    const mid = String(leaf[1] ?? "").trim();
    if (mid === "" || mid === PFA_TOP_HEADER_MERGE_BREAK) return amountPair(2, 3, 4, 6);
  }
  return false;
};

/** Column index of first `AMOUNT` when leaf matches week-band summary layout (`isPfaFixedCallDepositLeafHeaderLayout`). */
const firstPfaStyleWeekBandAmountColumnIndex = (leaf) => {
  if (!Array.isArray(leaf) || !isPfaFixedCallDepositLeafHeaderLayout(leaf)) return null;
  if (leaf.length === 7) return 2;
  if (leaf.length === 6) return 1;
  return null;
};

/** Column index of first volume/amount band for week-band summary tables. */
const firstCurrencyComparisonVolumeColumnIndex = (leaf) => {
  if (isApp4bSqueezedCurrencySummaryLeafLayout(leaf)) return 1;
  if (isApp4aSqueezedMainSummaryLeafLayout(leaf)) return 1;
  return firstPfaStyleWeekBandAmountColumnIndex(leaf);
};

const rowHasPfaWeekBandSubheaderShape = (row) => {
  if (!Array.isArray(row)) return false;
  const has = (re) => row.some((c) => re.test(String(c ?? "").trim()));
  const hasSecondBand = has(/\bprevious\s+week\b/i) || has(/\blast\s+week\b/i);
  return has(/\bcurrent\s+week\b/i) && hasSecondBand;
};

/** PFA summary only — API may send [label row, week row] so the “leaf” is not always last. */
const findPfaFixedCallLabelHeaderRowIndex = (headerRows) => {
  if (!Array.isArray(headerRows)) return -1;
  return headerRows.findIndex((r) => isPfaFixedCallDepositLeafHeaderLayout(r));
};

const findPfaWeekBandSubheaderRowIndex = (headerRows) => {
  if (!Array.isArray(headerRows)) return -1;
  return headerRows.findIndex((r) => rowHasPfaWeekBandSubheaderShape(r));
};

const PFA_TOP_HEADER_MERGE_BREAK = "\u200c"; /* ZWNJ — trim() does not strip it; blocks DESCRIPTION + spacer colspan */

/** Leaf row for APP 6A PFA summary: two AMOUNT / WEIGHTED AVERAGE bands + optional DIFFERENCE; optional spacer after DESCRIPTION (6- or 7-col API). */
const isApp6aPfaSummaryLeafTwoBandLayout = (leaf) => {
  if (!Array.isArray(leaf)) return false;
  const c = (i) => String(leaf[i] ?? "").trim();
  const twoBands = (a1, w1, a2, w2) =>
    /^amount$/i.test(c(a1)) &&
    /^weighted\s+average/i.test(c(w1)) &&
    /^amount$/i.test(c(a2)) &&
    /^weighted\s+average/i.test(c(w2));
  const withDiffAt = (dIdx, a1, w1, a2, w2) =>
    twoBands(a1, w1, a2, w2) && /^difference$/i.test(c(dIdx));
  if (leaf.length === 5 && /^description$/i.test(c(0))) {
    return twoBands(1, 2, 3, 4);
  }
  if (leaf.length === 6 && /^description$/i.test(c(0))) {
    if (withDiffAt(5, 1, 2, 3, 4)) return true;
    const mid = String(leaf[1] ?? "").trim();
    if (mid === "" || mid === PFA_TOP_HEADER_MERGE_BREAK) return twoBands(2, 3, 4, 5);
  }
  if (leaf.length === 7 && /^description$/i.test(c(0))) {
    const mid = String(leaf[1] ?? "").trim();
    if (mid === "" || mid === PFA_TOP_HEADER_MERGE_BREAK) return withDiffAt(6, 2, 3, 4, 5);
  }
  return false;
};

const findPfaWeekBandLabelHeaderRowIndex = (headerRows, currentFileName, cleanTitle) => {
  if (!Array.isArray(headerRows)) return -1;
  const fn = String(currentFileName ?? "").toUpperCase();
  const app4 = isApp4aPfaFixedCallDepositSummary(currentFileName, cleanTitle);
  const app4aMain = shouldNormalizeApp4aMainSummaryMatrix(headerRows, currentFileName, cleanTitle);
  const app6 = fn.includes("APP 6A") && isApp6aPfaSummaryTitle(cleanTitle);
  const app4b = shouldNormalizeApp4bCurrencySummaryMatrix(headerRows, currentFileName, cleanTitle);
  if (!app4 && !app4aMain && !app6 && !app4b) return -1;
  return headerRows.findIndex((r) => {
    if (app4 && isPfaFixedCallDepositLeafHeaderLayout(r)) return true;
    if (app4aMain && (isApp4aSqueezedMainSummaryLeafLayout(r) || isApp4aLegacySqueezedMainSummaryLeafLayout(r)))
      return true;
    if (app6 && isApp6aPfaSummaryLeafTwoBandLayout(r)) return true;
    if (app4b && isApp4bSqueezedCurrencySummaryLeafLayout(r)) return true;
    return false;
  });
};

/** Stops generic colspan from merging DESCRIPTION across the spacer null before AMOUNT (same idea as APP 6A date bands). */
const withApp4aPfaFixedCallDepositHeaderRows = (base, currentFileName, cleanTitle) => {
  if (!Array.isArray(base) || base.length < 2) return base;
  if (!isApp4aPfaFixedCallDepositSummary(currentFileName, cleanTitle)) return base;
  const labelIdx = findPfaFixedCallLabelHeaderRowIndex(base);
  if (labelIdx < 0) return base;
  const leaf = base[labelIdx];
  if (!isPfaFixedCallDepositLeafHeaderLayout(leaf) || leaf.length !== 7) return base;
  const labelRow = base[labelIdx];
  if (!Array.isArray(labelRow) || labelRow.length !== 7) return base;
  const d0 = String(labelRow[0] ?? "").trim();
  if (!/^description$/i.test(d0)) return base;
  if (!/^amount$/i.test(String(labelRow[2] ?? "").trim())) return base;
  const mid = labelRow[1];
  if (mid != null && String(mid).trim() !== "" && String(mid) !== PFA_TOP_HEADER_MERGE_BREAK) return base;
  if (String(labelRow[1] ?? "") === PFA_TOP_HEADER_MERGE_BREAK) return base;
  const next = [...base];
  next[labelIdx] = [...labelRow];
  next[labelIdx][1] = PFA_TOP_HEADER_MERGE_BREAK;
  return next;
};

const pfaFixedCallWeekBandRowMatchesIdeal = (row, columnCount) => {
  if (!Array.isArray(row) || row.length !== columnCount) return false;
  const ideal = buildPfaFixedCallWeekBandSubheaderRow(columnCount);
  return row.every((cell, i) => String(cell ?? "").trim() === String(ideal[i] ?? "").trim());
};

const buildPfaFixedCallWeekBandSubheaderRow = (columnCount) => {
  const r = Array.from({ length: columnCount }, () => "");
  if (columnCount === 7) {
    r[2] = "CURRENT WEEK";
    r[4] = "PREVIOUS WEEK";
  } else if (columnCount >= 4) {
    r[1] = "CURRENT WEEK";
    r[3] = "PREVIOUS WEEK";
  }
  return r;
};

/** Normalizes the CURRENT / PREVIOUS WEEK row so colspan-2 aligns over AMOUNT + WEIGHTED AVERAGE (label row may be first or last in API). */
const withApp4aWeekBandHeaderRows = (base, currentFileName, cleanTitle) => {
  if (!Array.isArray(base) || base.length === 0) return base;
  if (!isApp4aPfaFixedCallDepositSummary(currentFileName, cleanTitle)) return base;
  const labelIdx = findPfaFixedCallLabelHeaderRowIndex(base);
  const weekIdx = findPfaWeekBandSubheaderRowIndex(base);
  if (labelIdx < 0 || weekIdx < 0 || labelIdx === weekIdx) return base;
  const leaf = base[labelIdx];
  if (!isPfaFixedCallDepositLeafHeaderLayout(leaf)) return base;
  const ideal = buildPfaFixedCallWeekBandSubheaderRow(leaf.length);
  const sub = base[weekIdx];
  if (pfaFixedCallWeekBandRowMatchesIdeal(sub, leaf.length)) return base;
  const next = [...base];
  next[weekIdx] = ideal;
  return next;
};

const buildApp6aPfaWeekBandSubheaderRow = (labelLeaf) => {
  if (!Array.isArray(labelLeaf)) return [];
  const n = labelLeaf.length;
  const r = Array.from({ length: n }, () => "");
  const c = (i) => String(labelLeaf[i] ?? "").trim();
  if (n === 5 && /^description$/i.test(c(0))) {
    r[1] = "CURRENT WEEK";
    r[3] = "LAST WEEK";
    return r;
  }
  if (n === 6 && /^description$/i.test(c(0))) {
    if (/^difference$/i.test(c(5))) {
      r[1] = "CURRENT WEEK";
      r[3] = "LAST WEEK";
      r[5] = "-";
      return r;
    }
    r[2] = "CURRENT WEEK";
    r[4] = "LAST WEEK";
    return r;
  }
  if (n === 7 && /^description$/i.test(c(0)) && /^difference$/i.test(c(6))) {
    r[2] = "CURRENT WEEK";
    r[4] = "LAST WEEK";
    r[6] = "-";
    return r;
  }
  return r;
};

const app6aPfaWeekBandRowMatchesIdeal = (row, labelLeaf) => {
  if (!Array.isArray(row) || !Array.isArray(labelLeaf) || row.length !== labelLeaf.length) return false;
  const ideal = buildApp6aPfaWeekBandSubheaderRow(labelLeaf);
  if (ideal.length !== row.length) return false;
  return row.every((cell, i) => String(cell ?? "").trim() === String(ideal[i] ?? "").trim());
};

/** ZWNJ in label row col1 when APP 6A PFA summary uses a spacer column (7-col, or 6-col without DIFFERENCE). */
const withApp6aPfaSummaryTopHeaderRows = (base, currentFileName, cleanTitle) => {
  if (!Array.isArray(base) || base.length < 2) return base;
  if (!String(currentFileName ?? "").toUpperCase().includes("APP 6A")) return base;
  if (!isApp6aPfaSummaryTitle(cleanTitle)) return base;
  const labelIdx = base.findIndex((r) => isApp6aPfaSummaryLeafTwoBandLayout(r));
  if (labelIdx < 0) return base;
  const labelRow = base[labelIdx];
  if (!Array.isArray(labelRow) || !isApp6aPfaSummaryLeafTwoBandLayout(labelRow)) return base;
  const d0 = String(labelRow[0] ?? "").trim();
  if (!/^description$/i.test(d0)) return base;

  if (labelRow.length === 7) {
    if (!isPfaFixedCallDepositLeafHeaderLayout(labelRow)) return base;
    if (!/^amount$/i.test(String(labelRow[2] ?? "").trim())) return base;
    const mid = labelRow[1];
    if (mid != null && String(mid).trim() !== "" && String(mid) !== PFA_TOP_HEADER_MERGE_BREAK) return base;
    if (String(labelRow[1] ?? "") === PFA_TOP_HEADER_MERGE_BREAK) return base;
    const next = [...base];
    next[labelIdx] = [...labelRow];
    next[labelIdx][1] = PFA_TOP_HEADER_MERGE_BREAK;
    return next;
  }
  if (labelRow.length === 6 && /^difference$/i.test(String(labelRow[5] ?? "").trim())) {
    return base;
  }
  if (labelRow.length === 6) {
    if (!/^amount$/i.test(String(labelRow[2] ?? "").trim())) return base;
    const mid = labelRow[1];
    if (mid != null && String(mid).trim() !== "" && String(mid) !== PFA_TOP_HEADER_MERGE_BREAK) return base;
    if (String(labelRow[1] ?? "") === PFA_TOP_HEADER_MERGE_BREAK) return base;
    const next = [...base];
    next[labelIdx] = [...labelRow];
    next[labelIdx][1] = PFA_TOP_HEADER_MERGE_BREAK;
    return next;
  }
  return base;
};

/** Normalizes CURRENT / LAST WEEK positions for APP 6A PFA summary. */
const withApp6aPfaSummaryWeekBandHeaderRows = (base, currentFileName, cleanTitle) => {
  if (!Array.isArray(base) || base.length === 0) return base;
  if (!String(currentFileName ?? "").toUpperCase().includes("APP 6A")) return base;
  if (!isApp6aPfaSummaryTitle(cleanTitle)) return base;
  const labelIdx = base.findIndex((r) => isApp6aPfaSummaryLeafTwoBandLayout(r));
  const weekIdx = findPfaWeekBandSubheaderRowIndex(base);
  if (labelIdx < 0 || weekIdx < 0 || labelIdx === weekIdx) return base;
  const leaf = base[labelIdx];
  if (!isApp6aPfaSummaryLeafTwoBandLayout(leaf)) return base;
  const ideal = buildApp6aPfaWeekBandSubheaderRow(leaf);
  const sub = base[weekIdx];
  if (app6aPfaWeekBandRowMatchesIdeal(sub, leaf)) return base;
  const next = [...base];
  next[weekIdx] = ideal;
  return next;
};

/** Single family for table chrome — must match `--zenith-table-font-family` in BerlinSans.css (bundled @font-face). */
const TABLE_FONT_FAMILY = "var(--zenith-table-font-family)";
const CRR_BG = "#fff";
const CRR_BORDER = "4px solid #8F8C8C";
const CRR_MATCH = ["net of dcrr", "total crr debit ytd"];

const normalizeCrrLabel = (cell) =>
  String(cell ?? "").replace(/\s+/g, " ").trim().toLowerCase();

/** APP 2A CRR POSITION footer/tbody — `TOTAL CRR DEBIT YTD (PRIVATE & PUBLIC SECTOR)`. */
const isApp2ACrrDebitYtdLabel = (cell) => {
  const s = normalizeCrrLabel(cell);
  return s.includes("total crr debit ytd");
};

const isApp2ACrrDebitYtdRow = (row, fileName) =>
  isApp2AFile(fileName) && Array.isArray(row) && isApp2ACrrDebitYtdLabel(row[0]);

const getSpecialRowStyle = (row, fileName = "") => {
  if (!isApp2AFile(fileName) || !Array.isArray(row)) return null;
  const first = normalizeCrrLabel(row[0]);
  const checks = [{ match: CRR_MATCH, bg: CRR_BG, border: CRR_BORDER }];
  for (const { match, bg, border } of checks) {
    if (match.some((p) => first.includes(p.toLowerCase()))) return { bg, border };
  }
  return null;
};

const isApp2AFile = (name) => name ? String(name).toUpperCase().includes("APP 2A") : false;
const isApp3File = (name) => name ? String(name).toUpperCase().includes("APP 3") : false;

const normalizeSummaryLabelCell = (cell) =>
  String(cell ?? "").replace(/\s+/g, " ").trim();

const isTotalDepositLiabilityLabel = (cell) =>
  /^total\s+deposit\s+liability(?:\s*[.:;,–\-]+)?$/i.test(normalizeSummaryLabelCell(cell));

/** APP 3 — `TOTAL LCY LIABILITIES` / `TOTAL LCY LIABILITY` summary rows (bold whole row). */
const isTotalLcyLiabilitiesLabel = (cell) =>
  /^total\s+lcy\s+liabilit(?:y|ies)(?:\s*[.:;,–\-]+)?$/i.test(normalizeSummaryLabelCell(cell));

/** APP 3 — `TOTAL LCY ASSETS` / `TOTAL LCY ASSET` summary rows (bold whole row). */
const isTotalLcyAssetsLabel = (cell) =>
  /^total\s+lcy\s+assets?(?:\s*[.:;,–\-]+)?$/i.test(normalizeSummaryLabelCell(cell));

/** APP 3 — section band labels like `INFLOWS:` / `OUTFLOWS:` (may share the row with unit tokens e.g. N'M). */
const isApp3InflowOutflowBandLabel = (cell) =>
  /^(?:in|out)\s*flows?\s*:?\s*$/i.test(normalizeSummaryLabelCell(cell));

const rowIsApp3InflowOutflowBand = (row, colWidths) => {
  if (!Array.isArray(row)) return false;
  return row.some((cell, ci) => {
    if (colWidths && colWidths[ci] === 0) return false;
    return isApp3InflowOutflowBandLabel(cell);
  });
};

const isTotalRiskAssetsLabel = (cell) =>
  /^total\s+risk\s+assets?(?:\s*[.:;,–\-]+)?$/i.test(normalizeSummaryLabelCell(cell));

/** APP 2B — standalone `RISK ASSETS` / `RISK ASSET` summary rows (e.g. BANK table). */
const isRiskAssetsLabel = (cell) => {
  const s = normalizeSummaryLabelCell(cell);
  return /^risk\s+assets?(?:\s*[.:;,–\-]+)?$/i.test(s) || isTotalRiskAssetsLabel(cell);
};

const isSumTotalLabel = (cell) =>
  /^sum[\s_-]*total(?:\s*[.:;,–\-]+)?$/i.test(normalizeSummaryLabelCell(cell));

/**
 * APP 2D — zone aggregate rows / columns:
 * `SUM TOTAL OF TOP ZONES`, `SUM TOTAL OF HEAD OFFICE ZONES` (optional trailing punctuation).
 */
const isApp2dSumTotalZonesLabel = (cell) => {
  const s = normalizeSummaryLabelCell(cell);
  if (!s) return false;
  return (
    /^sum[\s_-]*total\s+of\s+top\s+zones?(?:\s*[.:;,–\-]+)?$/i.test(s) ||
    /^sum[\s_-]*total\s+of\s+head\s+office\s+zones?(?:\s*[.:;,–\-]+)?$/i.test(s)
  );
};

const isSumTotalLabelForFile = (cell, fileName) => {
  if (isSumTotalLabel(cell)) return true;
  if (fileName && String(fileName).toUpperCase().includes("APP 2D") && isApp2dSumTotalZonesLabel(cell)) {
    return true;
  }
  return false;
};

/** Standalone summary label row — bold label + amount columns in tbody (all files; footer already bold). */
const rowHasSummaryLabelInLabelColumns = (
  row,
  colWidths,
  rightAlignCols,
  getLeafHeader,
  app2dLoose,
  labelMatcher
) => {
  if (!Array.isArray(row) || typeof labelMatcher !== "function") return false;
  const loose = { app2dLoose: !!app2dLoose };
  return row.some((cell, ci) => {
    if (!colWidths || colWidths[ci] === 0) return false;
    // Exact summary token in any visible column — bold whole row (split tables may place label under N'M / %).
    if (labelMatcher(cell)) return true;
    if (rightAlignCols && rightAlignCols.has(ci)) return false;
    const leaf = getLeafHeader ? String(getLeafHeader(ci) ?? "").trim() : "";
    if (leaf && isTotalMetricColumnHeader(leaf)) return false;
    if (leaf && isMoneyColumnHeader(leaf, loose)) return false;
    return false;
  });
};

const rowHasSummaryLabelAnywhere = (row, colWidths, labelMatcher) => {
  if (!Array.isArray(row) || typeof labelMatcher !== "function") return false;
  return row.some((cell, ci) => colWidths?.[ci] !== 0 && labelMatcher(cell));
};

const rowHasTotalDepositLiabilityInLabelColumns = (row, colWidths, rightAlignCols, getLeafHeader, app2dLoose) =>
  rowHasSummaryLabelInLabelColumns(row, colWidths, rightAlignCols, getLeafHeader, app2dLoose, isTotalDepositLiabilityLabel);

const rowHasRiskAssetsInLabelColumns = (row, colWidths, rightAlignCols, getLeafHeader, app2dLoose) =>
  rowHasSummaryLabelInLabelColumns(row, colWidths, rightAlignCols, getLeafHeader, app2dLoose, isRiskAssetsLabel);

const rowHasSumTotalInLabelColumns = (row, colWidths, rightAlignCols, getLeafHeader, app2dLoose, fileName) =>
  rowHasSummaryLabelInLabelColumns(
    row,
    colWidths,
    rightAlignCols,
    getLeafHeader,
    app2dLoose,
    (cell) => isSumTotalLabelForFile(cell, fileName)
  );

const isStandaloneTotalLabel = (cell) =>
  /^total(?:\s*[.:;,–\-]+)?$/i.test(normalizeSummaryLabelCell(cell));

/** APP 1A dual-column REVIEW / OUTLOOK prose (e.g. MONEY MARKET) — body stays normal weight. */
const isApp1AReviewOutlookDualColumnTable = (fileName, lastHdr) => {
  if (!isApp1AFile(fileName) || !Array.isArray(lastHdr)) return false;
  const labels = lastHdr.map((h) => normalizeHeaderTitleMatch(h));
  const hasReview = labels.some((h) => h === "review" || h.includes("review"));
  const hasOutlook = labels.some((h) => h === "outlook" || h.includes("outlook"));
  return hasReview && hasOutlook;
};

const isApp1AFile = (n) => n ? String(n).includes("APP 1A") : false;
const isApp4BFile = (n) => (n ? String(n).toUpperCase().includes("APP 4B") : false);
const isApp1BFile = (n) => n ? String(n).toUpperCase().includes("APP 1B") : false;
const isApp7BFile = (n) => n ? String(n).toUpperCase().includes("APP 7B") : false;
const isApp5AFile = (n) => n ? String(n).toUpperCase().includes("APP 5A") : false;

/** APP 5A fixed-deposit band tables (ACTUAL / INDICATIVE RATE SHEET) — render every column from the API. */
const isApp5AVolumeBandTable = (cleanTitle, leafHeader) => {
  const t = String(cleanTitle ?? "").trim();
  if (/^(ACTUAL|INDICATIVE RATE SHEET)$/i.test(t)) return true;
  if (/^band$/i.test(String(leafHeader?.[0] ?? "").trim())) return true;
  return false;
};

const rowHasDataBeyondFirstColumn = (row) => {
  if (!Array.isArray(row)) return false;
  return row.slice(1).some((c) => c != null && String(c).trim() !== "");
};
const isApp5CFile = (n) => n ? String(n).toUpperCase().includes("APP 5C") : false;
const isApp7AFile = (n) => n ? String(n).toUpperCase().includes("APP 7A") : false;

/** APP 7A only — `NOTES/COMMENTS` prose table (API sends col 2 as null). */
const isApp7ANotesCommentsTableTitle = (titles = []) =>
  (titles || []).some((raw) => {
    const t = String(raw ?? "").replace(/\s+/g, " ").trim();
    if (!t) return false;
    return /^notes\s*\/\s*comments$/i.test(t);
  });

const isApp7ANotesCommentsTable = (fileName, titles = []) =>
  isApp7AFile(fileName) && isApp7ANotesCommentsTableTitle(titles);

/** APP 1A review/outlook prose sub-files (e.g. GLOBAL CURRENCY REVIEW & OUTLOOK). */
const isApp1AProseSectionTableTitle = (titles = []) =>
  (titles || []).some((raw) => {
    const t = normalizeHeaderTitleMatch(raw);
    if (!t) return false;
    if (t.includes("global currency review")) return true;
    if (t.includes("market review") && t.includes("outlook")) return true;
    return false;
  });

const isEmptyProseTableHeader = (headers) => {
  const headerRows = Array.isArray(headers) ? headers : [];
  return (
    headerRows.length === 0 ||
    headerRows.every(
      (r) => !Array.isArray(r) || r.every((c) => c == null || String(c).trim() === "")
    )
  );
};

/** Empty headers + col 1+ never has tbody data (API sends `[prose, null]` rows). */
const isNullPaddedProseTableShape = (headers, rows) => {
  if (!isEmptyProseTableHeader(headers)) return false;
  const bodyRows = (rows || []).filter((r) => Array.isArray(r) && r.length > 0);
  if (!bodyRows.length) return false;
  const colCount = Math.max(...bodyRows.map((r) => r.length));
  if (colCount < 2) return true;
  for (let ci = 1; ci < colCount; ci++) {
    const hasData = bodyRows.some((r) => {
      const v = r[ci];
      if (v == null) return false;
      const s = String(v).trim();
      return s !== "" && s.toLowerCase() !== "null";
    });
    if (hasData) return false;
  }
  return true;
};

const isApp1AProseNarrativeTable = (fileName, titles, headers, rows) => {
  const inApp1AContext =
    isApp1AFile(fileName) || isApp1AProseSectionTableTitle([fileName, ...titles]);
  if (!inApp1AContext) return false;
  return isNullPaddedProseTableShape(headers, rows);
};

const isAcctNoCol = (n) =>
  /^acct\.?\s*no\.?$|^account[\s_-]*no\.?$|^account[\s_-]*number$/i.test(String(n ?? "").trim());

const isBoldFile = (n) => {
  if (!n) return false;
  const u = String(n).toUpperCase();
  return u.includes("APP 1A") || u.includes("APP 1B") || u.includes("APP 3") || u.includes("APP 7A") || u.includes("APP 7B");
};

const isLiquidAssetsGroup = (groupTitle) => {
  if (!groupTitle) return false;
  return /liquid[\s-]*assets/i.test(String(groupTitle));
};

const buildSearchRegex = (term) => {
  if (!term || !term.trim()) return null;
  try { return new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "i"); }
  catch { return null; }
};

const hl = (text, re) => {
  if (!re || !text) return text;
  const s = String(text);
  const parts = s.split(re);
  if (parts.length === 1) return s;
  return parts.map((p, i) => i % 2 === 1 ? <mark key={i} className="srch-hl">{p}</mark> : p);
};

const arr = (v) => (Array.isArray(v) ? v : []);

/** Curly / prime quotes → ASCII so AMOUNT N'000-style labels match reliably. */
const normalizeLeafHeaderLabel = (s) =>
  String(s ?? "")
    .replace(/\u2019|\u2018|\u2032/g, "'")
    .trim();

const isAmountCol = (n) =>
  /^(amount|price|cost|balance|salary|fee|principal)$/i.test(normalizeLeafHeaderLabel(n));

/** Headers like AMOUNT N'000, AMOUNT (LOCAL) — same column styling as numeric amounts. */
const isAmountLikeColHeader = (n) => {
  const s = normalizeLeafHeaderLabel(n);
  return isAmountCol(s) || /^amount\b/i.test(s);
};

const isDealAmountCol = (n) => /^deal[\s_-]*amount$/i.test(normalizeLeafHeaderLabel(n));

/** Money / balance columns: uniform numeric typography. APP 2D sheets often label columns "… AMOUNT …" mid-string — use `{ app2dLoose: true }`. */
const isMoneyColumnHeader = (label, opts = {}) => {
  const s = normalizeLeafHeaderLabel(label);
  if (!s) return false;
  if (isAmountLikeColHeader(s) || isDealAmountCol(s)) return true;
  if (isEquivalentAmountCol(s)) return true;
  if (/^cur[\s._-]*bal(ance)?$/i.test(s)) return true;
  if (/^net[\s_-]*position$/i.test(s)) return true;
  if (opts.app2dLoose && /\bamount\b/i.test(s) && !/%|percent|percentage/i.test(s)) return true;
  return false;
};

/** Bottom-up scan: merged multi-row headers often leave the bottom row blank at a column index. */
const resolveLeafHeaderLabelFromRows = (allHeaderRows, ci, fallback) => {
  for (let r = allHeaderRows.length - 1; r >= 0; r--) {
    const row = allHeaderRows[r];
    if (!Array.isArray(row)) continue;
    const t = String(row[ci] ?? "").trim();
    if (t !== "") return t;
  }
  return String(fallback ?? "").trim();
};

/** `COMPANY SIZE CLASSIFICATION` — fixed column widths (applied in colWidths post-process). */
const COMPANY_SIZE_CLASSIFICATION_VOLUME_COLUMN_WIDTH_PX = 170;
const COMPANY_SIZE_CLASSIFICATION_TENOR_DAYS_COLUMN_WIDTH_PX = 170;
/** `LOAN TYPE` leaf column — fixed width. */
const LOAN_TYPE_COLUMN_WIDTH_PX = 240;
/** `ID NAME` leaf column — fixed width. */
const ID_NAME_COLUMN_WIDTH_PX = 500;

const normalizeColumnHeaderForMatch = (s) =>
  normalizeLeafHeaderLabel(s)
    .replace(/[\uFF08\u201C]/g, "(")
    .replace(/[\uFF09\u201D]/g, ")")
    .replace(/\s+/g, " ")
    .trim();

const mergeHeaderRowSources = (...sources) => {
  const out = [];
  for (const src of sources) {
    if (!Array.isArray(src)) continue;
    for (const row of src) {
      if (Array.isArray(row)) out.push(row);
    }
  }
  return out;
};

const isCompanySizeClassificationTable = (titles = [], headerRows = []) => {
  if (
    titles.some((raw) =>
      /company\s*size\s*classif/i.test(normalizeHeaderTitleMatch(raw))
    )
  ) {
    return true;
  }
  return mergeHeaderRowSources(headerRows).some(
    (row) =>
      row.some((cell) =>
        /company\s*size\s*classif/i.test(normalizeHeaderTitleMatch(cell))
      )
  );
};

const isCompanySizeClassificationVolumeCol = (label) =>
  /^volume$/i.test(normalizeColumnHeaderForMatch(label));

const isCompanySizeClassificationTenorDaysCol = (label) => {
  const s = normalizeColumnHeaderForMatch(label);
  if (!s || /requested\s+tenor/i.test(s)) return false;
  return (
    /^tenor\s*[\(\[]\s*days\s*[\)\]]\s*$/i.test(s) ||
    /\btenor\s*[\(\[]\s*days\s*[\)\]]\b/i.test(s)
  );
};

const hasCompanySizeClassificationHeaderSignature = (headerRows = []) => {
  let hasVolume = false;
  let hasTenor = false;
  for (const row of mergeHeaderRowSources(headerRows)) {
    for (const cell of row) {
      const s = normalizeColumnHeaderForMatch(cell);
      if (!s) continue;
      if (isCompanySizeClassificationVolumeCol(s)) hasVolume = true;
      if (isCompanySizeClassificationTenorDaysCol(s)) hasTenor = true;
    }
  }
  return hasVolume && hasTenor;
};

const columnLabelCandidates = (headerRows, ci, fallback) => {
  const out = [];
  const leaf = resolveLeafHeaderLabelFromRows(headerRows, ci, fallback);
  if (leaf) out.push(leaf);
  if (Array.isArray(headerRows)) {
    const stack = headerRows
      .map((r) => (Array.isArray(r) ? String(r[ci] ?? "").trim() : ""))
      .filter(Boolean)
      .join(" ");
    if (stack) out.push(stack);
  }
  return [...new Set(out)];
};

const applyCompanySizeClassificationColumnWidths = (
  widths,
  headerRows,
  lastHdr,
  titles,
  rawHeaders = []
) => {
  const allHeaderRows = mergeHeaderRowSources(headerRows, rawHeaders);
  if (
    !isCompanySizeClassificationTable(titles, allHeaderRows) &&
    !hasCompanySizeClassificationHeaderSignature(allHeaderRows)
  ) {
    return widths;
  }

  const w = Array.isArray(widths) ? [...widths] : [];
  const colCount = Math.max(
    w.length,
    lastHdr?.length ?? 0,
    ...(allHeaderRows.length ? allHeaderRows.map((row) => row.length) : [0])
  );

  for (const row of allHeaderRows) {
    row.forEach((cell, ci) => {
      if ((w[ci] ?? 0) === 0) return;
      const s = normalizeColumnHeaderForMatch(cell);
      if (!s) return;
      if (isCompanySizeClassificationVolumeCol(s)) {
        w[ci] = COMPANY_SIZE_CLASSIFICATION_VOLUME_COLUMN_WIDTH_PX;
      }
      if (isCompanySizeClassificationTenorDaysCol(s)) {
        w[ci] = COMPANY_SIZE_CLASSIFICATION_TENOR_DAYS_COLUMN_WIDTH_PX;
      }
    });
  }

  for (let ci = 0; ci < colCount; ci++) {
    if ((w[ci] ?? 0) === 0) continue;
    const candidates = columnLabelCandidates(allHeaderRows, ci, lastHdr?.[ci]);
    for (const label of candidates) {
      if (isCompanySizeClassificationVolumeCol(label)) {
        w[ci] = COMPANY_SIZE_CLASSIFICATION_VOLUME_COLUMN_WIDTH_PX;
        break;
      }
      if (isCompanySizeClassificationTenorDaysCol(label)) {
        w[ci] = COMPANY_SIZE_CLASSIFICATION_TENOR_DAYS_COLUMN_WIDTH_PX;
        break;
      }
    }
  }
  return w;
};

const isLoanTypeCol = (label) =>
  /^loan[\s_-]*type$/i.test(normalizeColumnHeaderForMatch(label));

const applyLoanTypeColumnWidths = (widths, headerRows, lastHdr, rawHeaders = []) => {
  const allHeaderRows = mergeHeaderRowSources(headerRows, rawHeaders);
  const w = Array.isArray(widths) ? [...widths] : [];
  const colCount = Math.max(
    w.length,
    lastHdr?.length ?? 0,
    ...(allHeaderRows.length ? allHeaderRows.map((row) => row.length) : [0])
  );

  for (const row of allHeaderRows) {
    row.forEach((cell, ci) => {
      if ((w[ci] ?? 0) === 0) return;
      if (isLoanTypeCol(cell)) w[ci] = LOAN_TYPE_COLUMN_WIDTH_PX;
    });
  }

  for (let ci = 0; ci < colCount; ci++) {
    if ((w[ci] ?? 0) === 0) continue;
    const candidates = columnLabelCandidates(allHeaderRows, ci, lastHdr?.[ci]);
    for (const label of candidates) {
      if (isLoanTypeCol(label)) {
        w[ci] = LOAN_TYPE_COLUMN_WIDTH_PX;
        break;
      }
    }
  }

  return w;
};

const isIdNameCol = (label) =>
  /^id[\s_-]*name$/i.test(normalizeColumnHeaderForMatch(label));

const applyIdNameColumnWidths = (widths, headerRows, lastHdr, rawHeaders = []) => {
  const allHeaderRows = mergeHeaderRowSources(headerRows, rawHeaders);
  const w = Array.isArray(widths) ? [...widths] : [];
  const colCount = Math.max(
    w.length,
    lastHdr?.length ?? 0,
    ...(allHeaderRows.length ? allHeaderRows.map((row) => row.length) : [0])
  );

  for (const row of allHeaderRows) {
    row.forEach((cell, ci) => {
      if ((w[ci] ?? 0) === 0) return;
      if (isIdNameCol(cell)) w[ci] = ID_NAME_COLUMN_WIDTH_PX;
    });
  }

  for (let ci = 0; ci < colCount; ci++) {
    if ((w[ci] ?? 0) === 0) continue;
    const candidates = columnLabelCandidates(allHeaderRows, ci, lastHdr?.[ci]);
    for (const label of candidates) {
      if (isIdNameCol(label)) {
        w[ci] = ID_NAME_COLUMN_WIDTH_PX;
        break;
      }
    }
  }

  return w;
};

const isApp6bTenorDaysCol = (label) => {
  const s = normalizeColumnHeaderForMatch(label);
  if (!s) return false;
  return (
    /^tenor\s*[\(\[]\s*days\s*[\)\]]\s*$/i.test(s) ||
    /^requested\s+tenor\s*\(\s*days\s*\)$/i.test(s) ||
    /^requested\s+tenor\s+days\s*\(\s*%?\s*\)$/i.test(s) ||
    /^requested\s+tenor\s+days\s*%$/i.test(s) ||
    /^requested\s+tenor\s+days$/i.test(s)
  );
};

const isPercentCol = (n) => {
  const s = String(n ?? "").trim();
  if (/%|percent|percentage/i.test(s)) return true;
  if (/^(mtm|stop[\s_-]*rate|yield|rate|int[\s.]?\s*rate|avg[\s.]?\s*rate|curr[\s.]?rate|interest[\s.]?\s*rate|coupon|spread|margin)$/i.test(s)) return true;
  return false;
};

const isRateMultiplyCol = (hdr) => {
  const s = String(hdr ?? "").trim();
  return /\b(rate|yield|mtm|coupon|spread|margin)\b/i.test(s) && !s.includes("%");
};

const fmtPct = (v) => {
  if (v == null || v === "") return "";
  const s = String(v).trim();
  const hasPercent = s.includes("%");
  const n = parseFloat(s.replace(/%/g, "").replace(/,/g, "").trim());
  if (isNaN(n)) return s;
  return hasPercent ? `${n.toFixed(4)}%` : n.toFixed(4);
};

const isTenorCol = (hdr) => /^tenor$/i.test(String(hdr ?? "").trim());
/** Serial-number headers: S/N, S/NO, S.NO, S NO (same narrow width). */
const isSnCol = (n) => /^s\s*\/?\s*n(o)?\.?$/i.test(String(n ?? "").trim());
const isAvgRateCol = (n) => /^(avg[\s.]?\s*rate|average[\s_-]*rate)$/i.test(String(n ?? "").trim());
const isVariancePctCol = (n) => /^variance[\s_-]*%$/i.test(String(n ?? "").trim());
/** Leaf headers: `FCY EQUIVALENT` / `NAIRA EQUIVALENT` (incl. `NAIRA_EQUIVALENT`). */
const isFcyEquivalentCol = (n) => /^fcy[\s_-]+equivalent\b/i.test(normalizeLeafHeaderLabel(n));
const isNairaEquivalentCol = (n) => /^naira[\s_-]+equivalent\b/i.test(normalizeLeafHeaderLabel(n));
const isEquivalentAmountCol = (n) => isFcyEquivalentCol(n) || isNairaEquivalentCol(n);
const equivalentAmountHeaderStackRe = /(?:fcy|naira)[\s_-]+equivalent/i;
/** Detect date-looking tokens like 08/01/2026 (also supports - and . separators). */
const isDateLikeToken = (v) => {
  if (v == null) return false;
  const s = String(v).trim();
  if (!s || s.length > 32) return false;
  // dd/mm/yyyy or d/m/yy (and similar with - or .)
  if (/^\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}$/.test(s)) return true;
  // dd-MMM-yyyy (e.g. 12-Jan-2026)
  if (/^\d{1,2}-[A-Za-z]{3}-\d{2,4}$/.test(s)) return true;
  return false;
};

/** APP 2A volume columns — e.g. `31/12/2025 (N'Mn)` / `03/07/2026(N' Mn)`; keep date + unit on one line. */
const isApp2aDateNairaMnHeader = (v) => {
  if (v == null) return false;
  const s = String(v).trim();
  return /^\d{1,2}[\/.-]\d{1,2}[\/.-]\d{2,4}\s*\(\s*N\s*[''′]?\s*Mn\s*\)\s*$/i.test(s);
};

/** APP 6A widget “FIXED DEPOSIT SUMMARY” — two as-of dates each span VOLUME / W/A / PROPORTION. */
const isApp6aFixedDepositSummaryTitle = (cleanTitle) => {
  const t = normalizeHeaderTitleMatch(cleanTitle);
  return t === "fixed deposit summary" || t.includes("fixed deposit summary");
};

const isApp6aFixedDepositSummaryLeafRow = (leaf) => {
  if (!Array.isArray(leaf) || leaf.length !== 7) return false;
  const cell = (i) => String(leaf[i] ?? "").trim();
  const isWa = (i) => {
    const u = cell(i).toUpperCase().replace(/\s+/g, "");
    return u === "W/A" || u === "W-A";
  };
  return (
    cell(0) === "" &&
    /^volume$/i.test(cell(1)) &&
    isWa(2) &&
    /^proportion$/i.test(cell(3)) &&
    /^volume$/i.test(cell(4)) &&
    isWa(5) &&
    /^proportion$/i.test(cell(6))
  );
};

const extractApp6aFixedDepositSummaryDates = (top) => {
  if (!Array.isArray(top) || top.length !== 7) return null;
  if (isDateLikeToken(top[1]) && isDateLikeToken(top[4])) return { title: top[0], date1: top[1], date2: top[4] };
  if (isDateLikeToken(top[3]) && isDateLikeToken(top[6])) return { title: top[0], date1: top[3], date2: top[6] };
  return null;
};

/** API often sends [title, null, null, date1, null, null, date2]; normalize so colspan logic yields 1 + 3 + 3 like the reference layout. */
const withApp6aFixedDepositSummaryHeaderRows = (base, currentFileName, cleanTitle) => {
  if (!Array.isArray(base) || base.length < 2) return base;
  if (!currentFileName || !String(currentFileName).toUpperCase().includes("APP 6A")) return base;
  if (!isApp6aFixedDepositSummaryTitle(cleanTitle)) return base;
  const leaf = base[base.length - 1];
  if (!isApp6aFixedDepositSummaryLeafRow(leaf)) return base;
  const top = base[0];
  const dates = extractApp6aFixedDepositSummaryDates(top);
  if (!dates) return base;
  const titleStr = String(dates.title ?? "").trim();
  if (!/fixed\s+deposit\s+summary/i.test(titleStr)) return base;
  const normalized = [dates.title, dates.date1, null, null, dates.date2, null, null];
  const unchanged = top.every((c, i) => String(c ?? "") === String(normalized[i] ?? ""));
  if (unchanged) return base;
  const next = [...base];
  next[0] = normalized;
  return next;
};
/** Leaf headers: `TOTAL`, `TOTAL (USD)`, `TOTAL (NGN)`, etc. */
const isTotalCol = (n) => {
  const s = String(n ?? "").trim();
  if (!s) return false;
  if (/^total$/i.test(s)) return true;
  if (/^total\s*\([^)]+\)\s*$/i.test(s)) return true;
  return false;
};

/** Leaf headers: `SUB TOTAL`, `SUB TOTAL (USD)`, `SUBTOTAL`, etc. */
const isSubTotalCol = (n) => {
  const s = normalizeLeafHeaderLabel(n);
  if (!s) return false;
  if (/^sub[\s_-]*total$/i.test(s)) return true;
  if (/^subtotal$/i.test(s)) return true;
  if (/^sub[\s_-]*total\s*\([^)]+\)\s*$/i.test(s)) return true;
  return false;
};

const isApp10bFileName = (fileName) =>
  !!(fileName && String(fileName).toUpperCase().includes("APP 10B"));

/** APP 10B: `TOTAL BALS (USD) 08/01/2026`, `TOTAL BALS(USD)`, etc. */
const isApp10bTotalBalsUsdCol = (label) => {
  const s = normalizeColumnHeaderForMatch(label);
  if (!s) return false;
  return /^total\s+bals?\s*\(\s*usd\s*\)/i.test(s);
};

const collectApp10bTotalBalsColIndices = (headerRows, lastHdr, colWidths) => {
  const out = new Set();
  const n = Math.max(
    lastHdr?.length ?? 0,
    colWidths?.length ?? 0,
    ...(Array.isArray(headerRows) ? headerRows.map((r) => (Array.isArray(r) ? r.length : 0)) : [0])
  );
  for (let ci = 0; ci < n; ci++) {
    if ((colWidths?.[ci] ?? 0) === 0) continue;
    const candidates = columnLabelCandidates(headerRows, ci, lastHdr?.[ci]);
    if (candidates.some((label) => isApp10bTotalBalsUsdCol(label))) out.add(ci);
  }
  return out;
};

/** APP 10B summary tables often put grand totals in trailing `rows` with no TOTAL label. */
const isApp10bNumericFooterLikeRow = (row, fileName, colWidths) => {
  if (!isApp10bFileName(fileName) || !Array.isArray(row) || isSectionRow(row)) return false;
  let significantNumeric = 0;
  let nonEmptyNonNumeric = 0;
  for (let ci = 0; ci < row.length; ci++) {
    if (colWidths?.[ci] === 0) continue;
    const v = row[ci];
    const s = v == null ? "" : String(v).trim();
    if (!s || s === "0") continue;
    if (isNumericVal(v) || isCommaCurrencyVal(v)) {
      const n = parseFloat(s.replace(/,/g, ""));
      if (!isNaN(n) && Math.abs(n) >= 1) significantNumeric++;
    } else if (/^(?:grand\s+)?total$/i.test(s)) {
      return true;
    } else {
      nonEmptyNonNumeric++;
    }
  }
  return significantNumeric >= 3 && nonEmptyNonNumeric === 0;
};

/** Header is a totals *metric* column (SUB TOTAL, TOTAL (NGN), …) — body cells may echo the header; skip for row-level TOTAL detection. */
const isTotalMetricColumnHeader = (label) => {
  const s = normalizeLeafHeaderLabel(label);
  if (!s) return false;
  if (/^sub[\s_-]*total\b/i.test(s)) return true;
  if (/^cumulative\s+gap\b/i.test(s)) return true;
  if (isTotalCol(s)) return true;
  if (/^grand[\s_-]*total\b/i.test(s)) return true;
  if (isApp2dSumTotalZonesLabel(s)) return true;
  return false;
};
const isTransDateCol = (n) => /^trans[\s_-]*date$/i.test(String(n ?? "").trim());

const isCustomerDetailsAlphaCol = (n) => /^customer[\s_-]*details[\s_-]*alphabetically$/i.test(String(n ?? "").trim());
const isCustomerCurrentAcctNoCol = (n) => /^customer[\s_-]*current[\s_-]*account[\s_-]*number$/i.test(String(n ?? "").trim());
const isBranchGroupsCol = (n) => /^branch[\s_-]*groups?$/i.test(String(n ?? "").trim());
const isParametersColumn = (n) =>
  /^(parameters?|parameteres)\s*\(\s*%\s*\)$/i.test(String(n ?? "").trim());
const isRemarksColumn = (n) => /^remarks/i.test(String(n ?? "").trim());
const isSignificantFundingCol = (n) => /significant[\s_-]*funding[\s_-]*sources/i.test(String(n ?? "").trim());
const isAssetsLiabilityCol = (n) => /assets?\s*[/\\]\s*liabilit/i.test(String(n ?? "").trim());
const isSecurityCol = (n) => /^security$/i.test(String(n ?? "").trim());
const isCustomersNameCol = (n) => /^customers?'?s?[\s_-]*name$/i.test(String(n ?? "").trim());
const isCustomerNameColHdr = (n) => /^customer[\s_-]*name$/i.test(String(n ?? "").trim());

/**
 * Row-label / dimension columns (zones, S/N, branch…): when a footer row puts "TOTAL" here,
 * it labels the row — it must not trigger whole-column bold (`dataTotalOnlyLabelColIndices`).
 */
const isRowLabelColumnHeader = (n) => {
  const s = normalizeLeafHeaderLabel(n);
  if (!s) return false;
  if (isSnCol(s)) return true;
  if (/^zones?$/i.test(s)) return true;
  if (/^branch(es)?$/i.test(s)) return true;
  if (/^region$/i.test(s)) return true;
  if (/^location$/i.test(s)) return true;
  if (isCustomerNameColHdr(s)) return true;
  if (/^customers?'?s?[\s_-]*name$/i.test(s)) return true;
  if (/^description$/i.test(s)) return true;
  if (/^particulars?$/i.test(s)) return true;
  if (/^name$/i.test(s)) return true;
  if (/^id[\s_-]*name$/i.test(s)) return true;
  if (/^account[\s_-]*name$/i.test(s)) return true;
  if (/^entity(?:\s*name)?$/i.test(s)) return true;
  if (/^counterparty$/i.test(s)) return true;
  if (/^sierra\s+leone$/i.test(s)) return true;
  if (/^deposits?$/i.test(s)) return true;
  return false;
};

/** Labels like "NET INFLOW / OUTFLOW", "NET INFLOW/OUTFLOW" */
const isNetInflowOutflowText = (v) => {
  const t = String(v ?? "").trim();
  if (!t || t.length > 220) return false;
  return /net\s*inflow/i.test(t) && /outflow/i.test(t);
};

const rowContainsNetInflowOutflow = (row) =>
  Array.isArray(row) && row.some((c) => isNetInflowOutflowText(c));

const isConsolidatedCashPositionCol = (n) => {
  const s = String(n ?? "").trim();
  return /^co[a-z]*[\s_-]+cash[\s_-]*position/i.test(s);
};

const isRegulatoryIndustryCol = (n) =>
  /^regulatory[\s_/\\-]*industry$/i.test(String(n ?? "").trim());

/**
 * Prefix-style match for nowrap heuristics only (e.g. “Total …” headings).
 * Do not use for “is this a totals row?” — use `cellIsBodySummaryTotalLabel`.
 */
const isTotalLabelPrefix = (v) => {
  if (v == null) return false;
  if (isCompositeDepositsTotalLabel(v)) return true;
  const s = String(v).trim();
  if (s.length > 120) return false;
  if (/^sum[\s_-]+total\b/i.test(s)) return true;
  if (/^sum\s+total\s+of\s+(?:head\s+office\s+zones|top\s+zones)\b/i.test(s)) return true;
  if (/^net[\s_-]*total\b/i.test(s)) return true;
  if (/^total\s*[-–]\s*[a-z]\b/i.test(s)) return true;
  if (/^total\s+deposits?\b/i.test(s)) return true;
  if (/^total\s+dom\s+deposits?\b/i.test(s)) return true;
  if (/^total\s+deposit\s+liability\b/i.test(s)) return true;
  if (/^total\s+eurobonds\s*\(\s*htm\s*&\s*hft\s*\)/i.test(s)) return true;
  return /^(grand[\s_-]*total|sub[\s_-]*total|subtotal|total)[\s:,–-]?/i.test(s);
};

/** Exact labels only: TOTAL / SUB TOTAL / … / TOTAL DEPOSIT LIABILITY / TOTAL EUROBONDS (HTM & HFT) (standalone only). APP 3: Cumulative Gap summary lines. */
const isExactTotalOnlyLabel = (v, fileName) => {
  if (v == null) return false;
  const s = String(v).trim();
  if (!s) return false;
  if (isCompositeDepositsTotalLabel(v)) return true;
  if (s.length > 120) return false;
  const isApp3 = fileName && String(fileName).toUpperCase().includes("APP 3");
  const isApp2d = fileName && String(fileName).toUpperCase().includes("APP 2D");
  return (
    /^(grand[\s_-]*total|sub[\s_-]*total|subtotal|total)$/i.test(s) ||
    /^net[\s_-]*total(?:\s*[.:;,–\-]+)?$/i.test(s) ||
    /^total\s*[-–]\s*[a-z](?:\s*[.:;,–\-]+)?$/i.test(s) ||
    /^total\s*\(\s*[a-z]\s*\)(?:\s*[.:;,–\-]+)?$/i.test(s) ||
    /^total\s+deposits?(?:\s*[.:;,–\-]+)?$/i.test(s) ||
    /^total\s+dom\s+deposits?(?:\s*[.:;,–\-]+)?$/i.test(s) ||
    /^total\s+deposit\s+liability(?:\s*[.:;,–\-]+)?$/i.test(s) ||
    /^total\s+risk\s+assets(?:\s*[.:;,–\-]+)?$/i.test(s) ||
    /^total\s+eurobonds\s*\(\s*htm\s*&\s*hft\s*\)(?:\s*[.:;,–\-]+)?$/i.test(s) ||
    (isApp2d && isApp2dSumTotalZonesLabel(s)) ||
    (isApp3 &&
      (/^cumulative\s+gap(?:\s*[.:;,–\-]+)?$/i.test(s) || /^cumulative\s+gap\s*\([^)]+\)\s*$/i.test(s))) ||
    (isApp3 && /^total\s+lcy\s+liabilit(?:y|ies)(?:\s*[.:;,–\-]+)?$/i.test(s))
  );
};

/** Stacked header rows may carry “ID NAME” / “S/N” even when the resolved leaf at ci is empty or a merged title. */
const columnMatchesRowLabelHeaderStack = (headerRows, ci, resolvedLeafHeaders, lastHdr) => {
  const leaf = normalizeLeafHeaderLabel(resolvedLeafHeaders?.[ci] ?? lastHdr?.[ci] ?? "");
  if (leaf && isRowLabelColumnHeader(leaf)) return true;
  if (!Array.isArray(headerRows)) return false;
  for (let r = 0; r < headerRows.length; r++) {
    const row = headerRows[r];
    if (!Array.isArray(row)) continue;
    const t = normalizeLeafHeaderLabel(row[ci]);
    if (t && isRowLabelColumnHeader(t)) return true;
  }
  return false;
};

/**
 * Footers often repeat SUB TOTAL / GRAND TOTAL in the entity-name column. If most non-empty cells are not
 * exact total labels, do not treat the column as “all totals” for whole-column bold.
 */
const columnHasPredominantlyNonTotalCells = (rows, footerRows, colWidths, ci, fileName) => {
  if (colWidths[ci] === 0) return false;
  let exactTotals = 0;
  let other = 0;
  const scan = (block) => {
    if (!Array.isArray(block)) return;
    for (const r of block) {
      if (!Array.isArray(r)) continue;
      const v = r[ci];
      const str = v == null ? "" : String(v).trim();
      if (!str) continue;
      if (isExactTotalOnlyLabel(v, fileName)) exactTotals++;
      else other++;
    }
  };
  scan(rows);
  scan(footerRows);
  return other >= 2 && other >= exactTotals;
};

const isSingleToken = (v) => {
  if (v == null) return false;
  const s = String(v).trim();
  return s.length > 0 && s.length <= 40 && !/\s/.test(s);
};

const isNoWrapCol = (header) => {
  if (header == null) return false;
  const h = String(header).trim();
  return /\b(lc[\s_-]*no\.?|lc[\s_-]*num(ber)?s?|lc[\s_-]*ref\.?)\b/i.test(h)
    || /^reference(s)?$/i.test(h)
    || /^ref\.?$/i.test(h);
};

const emptyIdxCol = (header, rows, ci, footer = []) => {
  if (!rows.length && !footer.length) return false;
  if (rows.some((r) => { const v = Array.isArray(r) ? r[ci] : null; return v != null && String(v).trim() !== ""; })) return false;
  return !footer.some((r) => { const v = Array.isArray(r) ? r[ci] : null; return v != null && String(v).trim() !== ""; });
};

const colHasNeg = (rows, ci) =>
  rows.some((r) => {
    const v = Array.isArray(r) ? r[ci] : null;
    if (v == null) return false;
    const s = String(v).trim();
    return /^\([\d,]+(\.\d+)?\)$/.test(s) ||
      (!isNaN(parseFloat(s.replace(/,/g, ""))) && parseFloat(s.replace(/,/g, "")) < 0);
  });

const colHasPercent = (header, rows, ci) => {
  if (isPercentCol(header)) {
    if (!/%|percent|percentage/i.test(String(header ?? ""))) return true;
    const vals = rows
      .map((r) => parseFloat(String(Array.isArray(r) ? (r[ci] ?? "") : "").replace(/%/g, "").replace(/,/g, "").trim()))
      .filter((v) => !isNaN(v));
    if (vals.length > 0 && vals.filter((v) => v >= 0 && v <= 100).length / vals.length >= 0.6) return true;
  }
  const cellsWithPct = rows.filter((r) => {
    const v = Array.isArray(r) ? String(r[ci] ?? "").trim() : "";
    return v.includes("%");
  });
  return cellsWithPct.length > 0 && cellsWithPct.length / Math.max(rows.length, 1) >= 0.4;
};

const isNeg = (v) => {
  if (v == null) return false;
  const s = String(v).trim();
  return /^\([\d,]+(\.\d+)?\)$/.test(s) ||
    (!isNaN(parseFloat(s.replace(/,/g, ""))) && parseFloat(s.replace(/,/g, "")) < 0);
};

const isNegStr = (s) => {
  if (!s) return false;
  const c = String(s).replace(/,/g, "").trim();
  return /^\([\d.]+\)$/.test(c) || (!isNaN(parseFloat(c)) && parseFloat(c) < 0);
};

const isNumericVal = (v) => {
  if (v == null || String(v).trim() === "" || String(v).trim() === "-") return false;
  const s = String(v).trim();
  if (/^\([\d,]+(\.\d+)?\)$/.test(s)) return true;
  if (/^-?\([\d,]+(\.\d+)?\)$/.test(s)) return true;
  const clean = s.replace(/,/g, "").replace(/^-/, "").trim();
  return !isNaN(parseFloat(clean)) && isFinite(Number(clean)) && clean.length > 0;
};

const isSectionRow = (row, opts = {}) => {
  if (!Array.isArray(row)) return false;
  const nn = row.filter((c) => c != null && c !== "" && c !== undefined);
  if (nn.length !== 1 || row[0] == null || row[0] === "") return false;
  const t = String(row[0]).trim();
  if (/^\d+[.)]\s/.test(t)) return false;
  /** APP 1A prose headlines can exceed the default 120 (e.g. long bond / market titles). */
  const maxLen =
    typeof opts.maxLen === "number"
      ? opts.maxLen
      : opts.app2dLoose
        ? 220
        : opts.app1AProse
          ? 200
          : 120;
  if (t.length > maxLen) return false;
  return !t.startsWith("o ") && !t.includes("\n");
};

/** Long band labels / week-under-review subtitles in tbody — not in-table week-ending section headers. */
const isSectionSubheaderText = (text) => {
  const t = String(text ?? "").trim();
  if (!t) return false;
  if (/^(sub\s*total|grand\s+total|sum\s+total|total)\b/i.test(t)) return false;
  if (/\bweek\s+under\s+review\b/i.test(t)) return true;
  if (/\bfor\s+the\s+week\b/i.test(t)) return true;
  return false;
};

/** Thead document subtitle above column headers (small grey) — not tbody “Week Ending …” section bands. */
const isTheadTableSubtitleText = (text) => {
  const t = String(text ?? "").trim();
  if (!t) return false;
  if (/\bweek\s+ending\b/i.test(t)) return false;
  if (isSectionSubheaderText(t)) return true;
  if (/\bmaturity\s+profile\b/i.test(t)) return true;
  if (/\bbooked\s*@/i.test(t)) return true;
  if (/\bhighly\s+priced\s+deposits\b/i.test(t)) return true;
  if (/\bfresh\s+deposit\b/i.test(t)) return true;
  return false;
};

/** First thead row when it is a single full-width band above column headers (e.g. week-under-review). */
const isTheadBannerRow = (hRow, headerRows, rowIndex) => {
  if (!Array.isArray(hRow) || !Array.isArray(headerRows) || headerRows.length < 2) return false;
  if (rowIndex >= headerRows.length - 1) return false;
  const filled = hRow.filter((cell) => cell != null && String(cell).trim() !== "");
  return filled.length === 1;
};

/** APP 4B — "Week Ending …" band rows (section headers within deposit tables). */
const getApp4bWeekEndingLabel = (row) => {
  if (!Array.isArray(row)) return null;
  for (const cell of row) {
    if (cell == null) continue;
    const t = String(cell).trim();
    if (t && /^week\s+ending\b/i.test(t)) return cell;
  }
  return null;
};

const isApp4bWeekEndingRow = (row, fileName) =>
  isApp4BFile(fileName) && getApp4bWeekEndingLabel(row) != null;

/** APP 8 (and similar): single-cell banner rows like "QUARTER 3, 2025" / "QUARTER 4, 2024". */
const isQuarterHeadingSectionRow = (row) => {
  if (!isSectionRow(row)) return false;
  const t = String(row[0] ?? "").trim();
  return /^quarter\s+\d+\s*,\s*\d{4}/i.test(t);
};

/** APP 8: section rows that use the smaller banner font (`APP_8_QUARTER_SECTION_FONT_EM`) — QUARTER lines + "LESS PLACEMENTS". */
const isApp8SmallSectionBannerRow = (row) => {
  if (isQuarterHeadingSectionRow(row)) return true;
  if (!isSectionRow(row)) return false;
  const t = String(row[0] ?? "").trim();
  return /^less\s+placements?$/i.test(t);
};

/**
 * APP 9: single-cell band rows — months, MONTHS, Eurobond / TRCN, narrative table titles (Movement / Major Activities).
 * Same smaller `APP_9_MONTH_SECTION_FONT_EM` as calendar month banners.
 */
const isApp9SmallSectionBannerRow = (row) => {
  if (!isSectionRow(row)) return false;
  const t = String(row[0] ?? "").trim();
  if (/^(?:january|february|march|april|may|june|july|august|september|october|november|december)$/i.test(t)) return true;
  if (/^months$/i.test(t)) return true;
  if (/^trcn$/i.test(t)) return true;
  if (/^eurobond\s+inflows?$/i.test(t)) return true;
  if (/^eurobond\s+outflows?$/i.test(t)) return true;
  if (/^movement\s+in\s+dom\s+balances:?\s*$/i.test(t)) return true;
  if (/^major\s+activities\s+as\s+at\s+/i.test(t)) return true;
  return false;
};

/** APP 9: narrative column width (px) for Movement / Major Activities tables. */
const APP_9_NARRATIVE_LAST_COL_WIDTH_PX = 850;

const isApp9NarrativeTableTitle = (title) => {
  const t = normalizeHeaderTitleMatch(title);
  return t === "movement in dom balances" || t === "major activities";
};

/** APP 9 tables with empty headers and a wide narrative in the last column. */
const isApp9TwoColumnNarrativeTable = (headers, rows, cleanTitle) => {
  if (isApp9NarrativeTableTitle(cleanTitle)) return true;
  const hasMovementBanner = (rows || []).some(
    (r) => Array.isArray(r) && /^movement\s+in\s+dom\s+balances/i.test(String(r[0] ?? "").trim())
  );
  const hasMajorBanner = (rows || []).some(
    (r) => Array.isArray(r) && /^major\s+activities\s+as\s+at/i.test(String(r[0] ?? "").trim())
  );
  if (!hasMovementBanner && !hasMajorBanner) return false;
  const headerRows = Array.isArray(headers) ? headers : [];
  const headersEmpty =
    headerRows.length === 0 ||
    headerRows.every(
      (r) => !Array.isArray(r) || r.every((c) => c == null || String(c).trim() === "")
    );
  if (!headersEmpty) return false;
  const cc = Math.max(
    rows?.[0]?.length ?? 0,
    ...((rows || []).map((r) => (Array.isArray(r) ? r.length : 0)))
  );
  return cc >= 2;
};

/** Column with the longest non-numeric text (narrative prose) — not always the rightmost index. */
const getApp9NarrativeColumnIndex = (rows, colCount) => {
  if (colCount < 2) return colCount - 1;
  let bestIdx = colCount - 1;
  let bestLen = 0;
  for (let ci = 0; ci < colCount; ci++) {
    let maxLen = 0;
    for (const r of rows || []) {
      if (!Array.isArray(r)) continue;
      const v = r[ci];
      if (v == null || String(v).trim() === "") continue;
      const s = String(v).trim();
      if (isNumericVal(v)) continue;
      maxLen = Math.max(maxLen, s.length);
    }
    if (maxLen > bestLen) {
      bestLen = maxLen;
      bestIdx = ci;
    }
  }
  return bestIdx;
};

const applyApp9NarrativeColumnWidth = (colWidths, colCount, rows) => {
  if (!Array.isArray(colWidths) || colCount < 2) return;
  const narrativeIdx = getApp9NarrativeColumnIndex(rows, colCount);
  if (narrativeIdx < 0 || narrativeIdx >= colWidths.length) return;
  colWidths[narrativeIdx] = APP_9_NARRATIVE_LAST_COL_WIDTH_PX;
};

const isInlineHeaderRow = (row) => {
  if (!Array.isArray(row)) return false;
  const nn = row.filter((c) => c != null && String(c).trim() !== "");
  if (nn.length < 2) return false;
  return nn.every((c) => { const s = String(c).trim(); return s.length <= 30 && !isNumericVal(c); });
};

const fmtCurrency = (v, cur = "NGN") => {
  if (v == null || v === "") return "";
  const n = Number(String(v).replace(/[^0-9.-]+/g, ""));
  return isNaN(n) ? String(v) : new Intl.NumberFormat("en-NG", { style: "currency", currency: cur, minimumFractionDigits: 4, maximumFractionDigits: 4 }).format(n);
};

const normBracket = (v) => {
  if (v == null) return v;
  const s = String(v).trim();
  return /^\([\d,]+(\.\d+)?\)$/.test(s) ? "-" + s.slice(1, -1).replace(/,/g, "") : v;
};

const isBullet = (v) => { if (!v) return false; const s = String(v).trimStart(); return s !== "-" && (s.startsWith("* ") || s.startsWith("o ") || s.startsWith("o. ")); };
const isBlackBullet = (v) => { if (!v) return false; const s = String(v).trimStart(); return /^•/.test(s); };
const stripBullet = (s) => s.trim().replace(/^(•\s+|\*|o\.?)\s*/i, "").trim();
const BulletDot = () => <span style={{ color: "#d62728", flexShrink: 0, marginTop: 1 }}>•</span>;
const isHeadingLine = (s) => {
  if (!s) return false;
  const t = s.trim();
  if (/^n\/a$/i.test(t)) return false;
  return /^[A-Z][A-Z\s&/()-]{1,}$/.test(t) && t.length >= 2 && t.length <= 200;
};
const isNumberedItem = (s) => s && /^\d+[.)]\s/.test(s.trimStart());

const makeSectionRowId = (tableTitle, sectionText) =>
  `srow--${String(tableTitle ?? "").replace(/\W+/g, "-").slice(0, 40)}--${String(sectionText ?? "").replace(/\W+/g, "-").slice(0, 40)}`.toLowerCase();

const isHiddenApp2ATable = (title) =>
  /^(total\s+liquid\s+assets|non[\s-]*(total[\s-]*)?liquid\s+assets|total\s+non[\s-]*liquid\s+assets)$/i
    .test(String(title ?? "").trim());

/** Column index of the merged parent cell in the first header row that covers `colIdx` (grouped multi-row headers). */
const getParentHeaderColIndex = (allHeaderRows, colIdx) => {
  if (!Array.isArray(allHeaderRows) || allHeaderRows.length < 2) return colIdx;
  const row = allHeaderRows[0];
  if (!Array.isArray(row) || colIdx < 0 || colIdx >= row.length) return colIdx;
  let ci = 0;
  while (ci < row.length) {
    const v = row[ci];
    if (v != null && String(v).trim() !== "") {
      let span = 1;
      let ni = ci + 1;
      while (ni < row.length) {
        const nv = row[ni];
        if (nv != null && String(nv).trim() !== "") break;
        span++;
        ni++;
      }
      if (colIdx >= ci && colIdx < ci + span) return ci;
      ci = ni;
    } else {
      ci++;
    }
  }
  return colIdx;
};

const resolveHeaders = (headers, rows) => {
  const cc = rows?.[0]?.length || headers?.find((r) => Array.isArray(r) && r.length > 1)?.length || 0;
  const valid = headers.filter((r) => {
    if (!Array.isArray(r) || r.length !== cc) return false;
    const nn = r.filter((c) => c != null && String(c).trim() !== "");
    if (nn.length === 0) return false;
    if (nn.every((c) => String(c).trim().length > 100)) return false;
    if (nn.length > 1) return true;
    if (nn.length === 1) {
      const t = String(nn[0]).trim();
      if (isSectionSubheaderText(t) || isTheadTableSubtitleText(t)) return true;
      return t.length <= 100;
    }
    return false;
  });
  if (valid.length) return valid;
  if (cc > 0) return [Array.from({ length: cc }).fill("")];
  return [[""]];
};

const resolveFooters = (f) =>
  arr(f).filter((r) => Array.isArray(r) && r.some((c) => c != null && c !== "" && c !== undefined));

const ColGroup = ({ widths, stretch, alcoLondonPartSplit, alcoPartLabelIdx = 0, alcoPartTextIdx = 1 }) => (
  <colgroup>
    {widths.map((w, i) => {
      if (w === 0) return null;
      if (alcoLondonPartSplit && i === alcoPartLabelIdx) {
        return <col key={i} style={{ width: `${ALCO_LONDON_PART_LABEL_COL_WIDTH_PX}px` }} />;
      }
      if (alcoLondonPartSplit && i === alcoPartTextIdx) return <col key={i} />;
      if (stretch) return <col key={i} />;
      return <col key={i} style={{ width: `${w}px` }} />;
    })}
  </colgroup>
);

const RegulatoryIndustryLabel = ({ text }) => {
  const parts = text.split(/[\s_/\\-]+/).filter(Boolean);
  return (
    <>
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {i > 0 && <br />}
          {part}
        </React.Fragment>
      ))}
    </>
  );
};

const isCommaCurrencyVal = (v) => {
  if (v == null) return false;
  const s = String(v).trim();
  if (s === "" || s === "-") return false;
  if (isMarketReviewProseLine(s)) return false;
  const stripped = s.replace(/^[₦$€£¥]|^[A-Z]{3}\s*/i, "").trim();
  const hadSymbol = stripped !== s;
  const hasComma = stripped.includes(",");
  if (!hadSymbol && !hasComma) return false;
  const clean = stripped.replace(/,/g, "").replace(/^\((.+)\)$/, "-$1");
  const n = parseFloat(clean);
  return !isNaN(n) && isFinite(n);
};

/** Plain numeric amounts (with or without commas) for uniform styling when column is amount-like. */
const isPlainNumericAmountCell = (v) => {
  if (v == null) return false;
  const s = String(v).trim();
  if (s === "" || s === "-") return false;
  return isNumericVal(v);
};

const isRightAlignColByData = (rows, footer, ci) => {
  const allRows = [...rows, ...(footer || [])];
  const nonEmpty = allRows.filter((r) => {
    const v = Array.isArray(r) ? r[ci] : null;
    if (v == null) return false;
    const s = String(v).trim();
    return s !== "" && s !== "-";
  });
  if (nonEmpty.length === 0) return false;
  const commaCount = nonEmpty.filter((r) => {
    const v = Array.isArray(r) ? r[ci] : null;
    return isCommaCurrencyVal(v);
  }).length;
  return commaCount / nonEmpty.length >= 0.6;
};

/** Totals row: cell is only the keyword phrase (not “TOTAL NIGERIA PLC” / “…/TOTAL ENERGIES…”). */
const rowIsTotalDataRow = (row, secRow, fileName) => {
  if (secRow || !Array.isArray(row)) return false;
  return row.some((cell) => cellIsBodySummaryTotalLabel(cell, fileName));
};

/** Tfoot only — exact summary labels or any cell containing the word TOTAL. APP 1A / APP 6A / APP 2D: exact TOTAL / SUB TOTAL only. */
const cellIsFooterTotalReference = (cell, fileName) => {
  if (cellIsBodySummaryTotalLabel(cell, fileName)) return true;
  if (cell == null) return false;
  const fileUpper = fileName ? String(fileName).toUpperCase() : "";
  if (fileUpper.includes("APP 6A") || fileUpper.includes("APP 2D") || fileUpper.includes("APP 1A")) return false;
  const s = String(cell).trim();
  if (!s || s.length > 200) return false;
  if (isExcludedTotalName(s)) return false;
  return /\btotal\b/i.test(s);
};

const rowIsFooterTotalRow = (row, secRow, fileName) => {
  if (secRow || !Array.isArray(row)) return false;
  return row.some((cell) => cellIsFooterTotalReference(cell, fileName));
};

/**
 * Row looks like a footer summary (TOTAL / SUB TOTAL / SUM TOTAL / …).
 * Used for tfoot and for trailing tbody rows the API sends in `rows` instead of `footers`.
 */
const isFooterLikeSummaryRow = (row, fileName, colWidths) => {
  if (!Array.isArray(row) || isSectionRow(row)) return false;
  return (
    rowIsFooterTotalRow(row, false, fileName) ||
    rowHasSummaryLabelAnywhere(row, colWidths, (cell) => isSumTotalLabelForFile(cell, fileName)) ||
    rowHasSummaryLabelAnywhere(row, colWidths, isTotalDepositLiabilityLabel) ||
    rowHasSummaryLabelAnywhere(row, colWidths, isTotalRiskAssetsLabel) ||
    rowHasSummaryLabelAnywhere(row, colWidths, isStandaloneTotalLabel) ||
    isApp10bNumericFooterLikeRow(row, fileName, colWidths)
  );
};

/**
 * Standalone summary token(s) in one cell — whole string must be TOTAL / GRAND TOTAL / SUB TOTAL / SUM TOTAL /
 * TOTAL DEPOSIT LIABILITY / TOTAL EUROBONDS (HTM & HFT) (+ optional trailing punctuation only).
 * APP 3: same treatment for standalone "Cumulative Gap" (optional parentheses suffix).
 * Not company names starting with TOTAL or containing /TOTAL/.
 */
const cellIsBodySummaryTotalLabel = (cell, fileName) => {
  if (cell == null) return false;
  if (isCompositeDepositsTotalLabel(cell)) return true;
  const s = String(cell).trim();
  if (!s || s.length > 200) return false;
  if (isExcludedTotalName(s)) return false;
  if (/total[\s_-]*crr/i.test(s)) return false;
  const trail = "(?:\\s*[.:;,–\\-]+)?";
  const isApp3 = fileName && String(fileName).toUpperCase().includes("APP 3");
  return (
    new RegExp(`^total${trail}$`, "i").test(s) ||
    new RegExp(`^grand\\s+total${trail}$`, "i").test(s) ||
    new RegExp(`^sub[\\s_-]*total${trail}$`, "i").test(s) ||
    new RegExp(`^subtotal${trail}$`, "i").test(s) ||
    new RegExp(`^sum\\s+total${trail}$`, "i").test(s) ||
    (fileName &&
      String(fileName).toUpperCase().includes("APP 2D") &&
      isApp2dSumTotalZonesLabel(s)) ||
    new RegExp(`^net[\\s_-]*total${trail}$`, "i").test(s) ||
    new RegExp(`^total\\s*[-–]\\s*[a-z]${trail}$`, "i").test(s) ||
    new RegExp(`^total\\s*\\(\\s*[a-z]\\s*\\)${trail}$`, "i").test(s) ||
    new RegExp(`^total\\s+deposits?${trail}$`, "i").test(s) ||
    new RegExp(`^total\\s+dom\\s+deposits?${trail}$`, "i").test(s) ||
    new RegExp(`^total\\s+deposit\\s+liability${trail}$`, "i").test(s) ||
    new RegExp(`^total\\s+risk\\s+assets${trail}$`, "i").test(s) ||
    new RegExp(`^total\\s+eurobonds\\s*\\(\\s*htm\\s*&\\s*hft\\s*\\)${trail}$`, "i").test(s) ||
    /** GCA summary lines — same tbody row bold as TOTAL / SUB TOTAL. */
    new RegExp(
      `^total\\s+guarantee\\s+collateral\\s+interest\\s+bearing\\s+current\\s+accounts${trail}$`,
      "i"
    ).test(s) ||
    new RegExp(`^gca\\s+accounts\\s+from\\s+1\\.4%\\s+and\\s+below${trail}$`, "i").test(s) ||
    new RegExp(`^gca\\s+accounts\\s+above\\s+1\\.4%${trail}$`, "i").test(s) ||
    /^total\s*\([^)]+\)\s*$/i.test(s) ||
    /^grand\s+total\s*\([^)]+\)\s*$/i.test(s) ||
    /^sub[\s_-]*total\s*\([^)]+\)\s*$/i.test(s) ||
    (isApp3 &&
      (new RegExp(`^cumulative\\s+gap${trail}$`, "i").test(s) ||
        /^cumulative\s+gap\s*\([^)]+\)\s*$/i.test(s))) ||
    (isApp3 && new RegExp(`^total\\s+lcy\\s+liabilit(?:y|ies)${trail}$`, "i").test(s))
  );
};

/**
 * Row-level TOTAL / GRAND TOTAL / SUB TOTAL: only scan label / descriptive columns.
 * Amount columns (right-aligned, SUB TOTAL header, money-like headers) often repeat “SUB TOTAL” or mirror headers — that must not bold every row.
 */
const rowHasBodySummaryTotalInLabelColumns = (row, colWidths, rightAlignCols, getLeafHeader, app2dLoose, fileName) => {
  if (!Array.isArray(row)) return false;
  const loose = { app2dLoose: !!app2dLoose };
  return row.some((cell, ci) => {
    if (!colWidths || colWidths[ci] === 0) return false;
    if (rightAlignCols && rightAlignCols.has(ci)) return false;
    const leaf = getLeafHeader ? String(getLeafHeader(ci) ?? "").trim() : "";
    if (leaf && isTotalMetricColumnHeader(leaf)) return false;
    if (leaf && isMoneyColumnHeader(leaf, loose)) return false;
    return cellIsBodySummaryTotalLabel(cell, fileName);
  });
};

const TABULAR_NUM_STYLE = {
  fontVariantNumeric: "tabular-nums",
  fontFeatureSettings: '"tnum"',
  letterSpacing: "0.01em",
};

/** Tbody numeric / currency cells: one size & weight; footer uses its own styles. */
const BODY_AMOUNT_WRAP_STYLE = {
  ...TABULAR_NUM_STYLE,
  fontWeight: 400,
  fontStyle: "normal",
  lineHeight: 1.45,
  fontSynthesis: "none",
};

/** Row where only col 0 has meaningful (trimmed) content. */
const isFullSpanTextRow = (row) => {
  if (!Array.isArray(row)) return false;
  const firstHasContent = row[0] != null && String(row[0]).trim() !== "";
  if (!firstHasContent) return false;
  // 1-column tables (common in APP 7A NOTES/COMMENTS) should qualify as full-span.
  if (row.length <= 1) return true;
  const restAllEmpty = row.slice(1).every((c) => c == null || String(c).trim() === "");
  return restAllEmpty;
};

/** Compare table title vs in-table band label — ignores case, spacing, trailing punctuation. */
const normalizeTableTitleForMatch = (s) =>
  normalizeHeaderTitleMatch(s).replace(/[.:;,–\-—]+$/g, "").trim();

/** Prose row repeats widget `cleanTitle` — skip when title is already shown above the table. */
const isDuplicateTableTitleProseRow = (row, tableTitle) => {
  if (!tableTitle || !isFullSpanTextRow(row)) return false;
  const normTitle = normalizeTableTitleForMatch(tableTitle);
  const normCell = normalizeTableTitleForMatch(row[0]);
  return normTitle.length > 0 && normCell.length > 0 && normCell === normTitle;
};

// Used to render borderless note rows in BEHAVIOURAL ASSUMPTIONS. ───────────
const isBehavAssumptionNoteRow = (row) => {
  return isFullSpanTextRow(row);
};

export default function TableRenderer({
  widget, title, search, isFullWidth: _ignored,
  isFirstInGroup = true, liquidTotal, nonLiquidTotal, grandTotal, groupTitle = "",
}) {
  // hook 1
  const { fontSize, setInitializeFontSize, currentFileName, activeGroupIndex, isFullscreen } = useDashboard();

  const SN_W = currentFileName?.includes("APP 4D") ? 100 : currentFileName?.includes("APP 4C") ? 100 : 82;
  const DEAL_AMOUNT_W = currentFileName?.includes("APP 2D") ? 215 : 200;
  const CUSTOMER_DETAILS_ALPHA_W = 320;
  const CUSTOMER_CURRENT_ACCT_NO_W = 260;
  const BRANCH_GROUPS_W = 220;
  const PARAMS_W = 220;
  const REMARKS_W = 340;
  const ACCT_NO_W = 130;
  const NAME_W = 380;
  const DESCRIPTION_W = currentFileName?.includes('APP 2D') ? 160 : 250;
  const CUR_BAL_W = 200;
  const CUSTOMERS_NAME_W = 320;
  const CONSOLIDATED_CASH_POSITION_W = 300;
  const REGULATORY_INDUSTRY_W = 140;

  const CUSTOMER_NAME_W = 20;
  const ACCT_NAME_W = 300;
  const BRANCH_W = 260;
  const CRNCY_ID_W = 96;
  const ACCT_STATUS_W = 120;
  const RATE_W = 80;
  const INT_RATE_W = 90;
  const AVG_RATE_W = 130;
  const CURR_RATE_W = 100;
  const INTEREST_RATE_W = 80;
  const VALUE_ERROR_W = 80;
  const PCT_W = 120;
  const CALL_PCT_W = 120;
  const SIG_FUNDING_W = 450;
  const ASSETS_LIABILITY_W = 280;
  const SECURITY_W = 360;
  /** `VARIANCE %` leaf header column width. */
  const VARIANCE_PCT_COLUMN_WIDTH_PX = 156;
  /** `WEIGHTED AVERAGE YIELD (%)` leaf header column width. */
  const WEIGHTED_AVERAGE_YIELD_PCT_COLUMN_WIDTH_PX = 150;
  /** `PRINCIPAL (EUR)` leaf header column width. */
  const PRINCIPAL_EUR_COLUMN_WIDTH_PX = 200;
  /** `PRINCIPAL (GBP)` leaf header column width. */
  const PRINCIPAL_GBP_COLUMN_WIDTH_PX = 200;
  /** `MATURED FORWARDS NOT YET DELIVERED` leaf header column width. */
  const MATURED_FORWARDS_NOT_YET_DELIVERED_COLUMN_WIDTH_PX = 220;
  /** APP 5B: `CUSTOMERS` / `CUSTOMER` column width. */
  const APP_5B_CUSTOMERS_COLUMN_WIDTH_PX = 370;
  /** APP 3: "Maximum Cumulative Outflow/Inflow..." header font size multiplier. */
  const APP_3_MAX_CUM_HEADER_FONT_MULT = 1.45;
  /** APP 3: all `TOTAL` / `TOTAL (…)` leaf header columns — fixed width. */
  const APP_3_TOTAL_COLUMN_WIDTH_PX = 250;
  /** `PROPORTION` leaf header column width. */
  const PROPORTION_COLUMN_WIDTH_PX = 170;
  /** APP 1B: `CURRENT` leaf header column width. */
  const APP_1B_CURRENT_COLUMN_WIDTH_PX = 300;
  /** APP 1B: `PARAMETERS` / `PARAMETERS (%)` / `PARAMETERES (%)` — fixed width. */
  const APP_1B_PARAMETERS_PCT_COLUMN_WIDTH_PX = 210;
  /** APP 6A: `AMOUNT` / `AMOUNT (…)` — base 300px; width still grows with numeric content (capped by cfg.maxW). */
  const APP_6A_AMOUNT_COLUMN_WIDTH_PX = 300;
  /** APP 6B: `AMOUNT (NGN)` leaf column — fixed width. */
  const APP_6B_AMOUNT_NGN_COLUMN_WIDTH_PX = 350;
  /** APP 6B: `REQUESTED TENOR(DAYS)` / `REQUESTED TENOR DAYS(%)` — fixed width. */
  const APP_6B_REQUESTED_TENOR_COLUMN_WIDTH_PX = 167;
  /** APP 4A PFA summary: both `AMOUNT` leaf columns — min 320px before numeric growth. */
  const APP_4A_PFA_SUMMARY_AMOUNT_MIN_WIDTH_PX = 320;
  /** APP 4A main SUMMARY table: `SUMMARY:` label column — min width + content-driven growth (capped by cfg.maxW). */
  const APP_4A_TABLE_SUMMARY_LABEL_COLUMN_MIN_WIDTH_PX = 320;
  /** APP 4A main SUMMARY table: extra min width on first `AMOUNT` (CURRENT WEEK band) when leaf matches week-band layout. */
  const APP_4A_TABLE_SUMMARY_CURRENT_WEEK_AMOUNT_EXTRA_WIDTH_PX = 350;
  /** APP 4A main SUMMARY table: `VOLUME` / `CURRENT WEEK` band — min width + content-driven growth (capped by cfg.maxW). */
  const APP_4A_TABLE_SUMMARY_VOLUME_COLUMN_MIN_WIDTH_PX = 240;
  /** APP 4A main SUMMARY table: `VOLUME` / `PREVIOUS WEEK` band — min width + content-driven growth (capped by cfg.maxW). */
  const APP_4A_TABLE_SUMMARY_PREVIOUS_WEEK_VOLUME_COLUMN_MIN_WIDTH_PX = 300;
  /** Long metric header — widen so label and values don’t clip. */
  const AVERAGE_PRICING_ADJUSTED_COLUMN_WIDTH_PX = 150;
  /** `FCY EQUIVALENT` / `NAIRA EQUIVALENT` — min width; grows with numeric content (capped by cfg.maxW). */
  const EQUIVALENT_AMOUNT_COLUMN_MIN_WIDTH_PX = 190;
  /** APP 2A: `dd/mm/yyyy (N'Mn)` date volume headers — min width so label stays on one line. */
  const APP_2A_DATE_NM_HEADER_MIN_WIDTH_PX = 175;
  /** APP 8: tweak these px values to widen TOTAL vs CURRENT / PREVIOUS WEEK columns. */
  const APP_8_TOTAL_COLUMN_WIDTH_PX = 220;
  const APP_8_CURRENT_PREVIOUS_WEEK_COLUMN_WIDTH_PX = 260;
  /** APP 8: QUARTER / LESS PLACEMENTS section banners — `em` vs tbody base (default section rows use 1.3em). Lower = smaller text. */
  const APP_8_QUARTER_SECTION_FONT_EM = 0.92;
  /** APP 9: small band rows — months, MONTHS, EUROBOND …, TRCN (see `isApp9SmallSectionBannerRow`). */
  const APP_9_MONTH_SECTION_FONT_EM = 0.88;
  /** In-table section subheaders — smaller + lighter than legacy 1.3em / bold black. */
  const SECTION_SUBHEADER_FONT_EM = 0.65;
  const SECTION_SUBHEADER_COLOR = "#303234";
  const TOTAL_W = currentFileName?.includes("APP 8")
    ? APP_8_TOTAL_COLUMN_WIDTH_PX
    : currentFileName?.includes("APP 6A")
      ? 180
      : currentFileName?.includes("APP 6C")
        ? 250
        : 160;
  const TRANS_DATE_W = 140;

  const computeWidths = (hdr, allHeaderRows, rows, footer, cur, pctCols, cfg) => {
    const widths = [];
    const noWrapCols = new Set();
    const multiRowHeader = allHeaderRows.length >= 2;
    const sgHdr = TABLE_CONFIG.subgroupPctHeader;

    hdr.forEach((header, ci) => {
      const labelRaw = resolveLeafHeaderLabelFromRows(allHeaderRows, ci, header);
      const headerStackText = Array.isArray(allHeaderRows)
        ? allHeaderRows
            .map((r) => (Array.isArray(r) ? String(r[ci] ?? "").trim() : ""))
            .filter(Boolean)
            .join(" ")
        : "";

      const h = labelRaw.toLowerCase();

      const isPct = pctCols.has(ci);
      const numericW = (() => {
        const allRows = [...rows, ...footer];
        let max = 0;
        for (const r of allRows) {
          const v = Array.isArray(r) ? r[ci] : null;
          if (!isNumericVal(v) && !isTotalLabelPrefix(v) && !noWrapCols.has(ci) && !isSingleToken(v)) continue;
          const useCurrencyFmt =
            isAmountCol(header) ||
            isEquivalentAmountCol(labelRaw) ||
            equivalentAmountHeaderStackRe.test(headerStackText);
          const f = isPct ? fmtPct(v) : useCurrencyFmt ? fmtCurrency(v, cur) : String(v ?? "");
          const w = Math.ceil(String(f).length * cfg.charW) + cfg.cellPad;
          if (w > max) max = w;
        }
        if (max > 0 && colHasNeg(rows, ci)) max = Math.ceil(max * cfg.negMult);
        return max;
      })();

      if (/^repo$/i.test(labelRaw)) { widths.push(190); return; }
      if (/^rating$/i.test(labelRaw)) { widths.push(190); return; }
      if (/^proportion$/i.test(labelRaw.trim())) { widths.push(PROPORTION_COLUMN_WIDTH_PX); return; }
      if (isLoanTypeCol(labelRaw) || isLoanTypeCol(headerStackText)) {
        widths.push(LOAN_TYPE_COLUMN_WIDTH_PX);
        return;
      }
      if (isIdNameCol(labelRaw) || isIdNameCol(headerStackText)) {
        widths.push(ID_NAME_COLUMN_WIDTH_PX);
        return;
      }
      if (/^%\s*tdl\s*\(\s*cur[\s_-]*rent\s*\)$/i.test(labelRaw.trim())) { widths.push(150); return; }
      if (/matured\s+forwards?\s+not\s+yet\s+delivered/i.test(labelRaw) || /matured\s+forwards?\s+not\s+yet\s+delivered/i.test(headerStackText)) {
        widths.push(MATURED_FORWARDS_NOT_YET_DELIVERED_COLUMN_WIDTH_PX);
        return;
      }
      if (/^forward$/i.test(labelRaw)) { widths.push(190); return; }
      if (isApp2AFile(currentFileName) && isApp2aDateNairaMnHeader(labelRaw)) {
        const txt = String(labelRaw).trim();
        const hdrW = Math.ceil(txt.length * (Number(cfg.headerCharW) || 10)) + 24;
        widths.push(Math.min(cfg.maxW, Math.max(APP_2A_DATE_NM_HEADER_MIN_WIDTH_PX, hdrW, numericW)));
        noWrapCols.add(ci);
        return;
      }
      if (currentFileName?.includes("APP 5B") && /^(customers?|customer)$/i.test(labelRaw.trim())) {
        widths.push(APP_5B_CUSTOMERS_COLUMN_WIDTH_PX);
        return;
      }
      if (
        currentFileName?.includes("APP 6B") &&
        /^amount\s*\(\s*ngn\s*\)$/i.test(labelRaw.trim())
      ) {
        widths.push(APP_6B_AMOUNT_NGN_COLUMN_WIDTH_PX);
        return;
      }
      if (
        String(currentFileName ?? "").toUpperCase().includes("APP 6B") &&
        isApp6bTenorDaysCol(labelRaw)
      ) {
        widths.push(APP_6B_REQUESTED_TENOR_COLUMN_WIDTH_PX);
        return;
      }
      if (/^customers\s*deposit/i.test(labelRaw)) { widths.push(200); return; }
      if (/^total\s*per\s*wk$/i.test(labelRaw)) { widths.push(190); return; }
      if (/^total\s*inflows$/i.test(labelRaw)) { widths.push(130); return; }
      if (/^total\s*outflows$/i.test(labelRaw)) { widths.push(130); return; }
      if (
        currentFileName?.includes("APP 6A") &&
        isApp6aPfaSummaryTitle(cleanTitle) &&
        /^amount$/i.test(labelRaw.trim()) &&
        !/%|percent|percentage/i.test(labelRaw)
      ) {
        widths.push(Math.min(cfg.maxW, Math.max(APP_4A_PFA_SUMMARY_AMOUNT_MIN_WIDTH_PX, numericW)));
        return;
      }
      if (
        currentFileName?.includes("APP 6A") &&
        /^amount\b/i.test(labelRaw) &&
        !/%|percent|percentage/i.test(labelRaw)
      ) {
        widths.push(Math.min(cfg.maxW, Math.max(APP_6A_AMOUNT_COLUMN_WIDTH_PX, numericW)));
        return;
      }
      if (
        isCurrencyComparisonSummaryTable(currentFileName, cleanTitle, hdr) &&
        /^amount$/i.test(labelRaw.trim()) &&
        !/%|percent|percentage/i.test(labelRaw)
      ) {
        const leaf = hdr;
        const firstAmt = firstCurrencyComparisonVolumeColumnIndex(leaf);
        const isCurrentWeekAmountCol = firstAmt != null && ci === firstAmt;
        const floor =
          APP_4A_PFA_SUMMARY_AMOUNT_MIN_WIDTH_PX +
          (isCurrentWeekAmountCol ? APP_4A_TABLE_SUMMARY_CURRENT_WEEK_AMOUNT_EXTRA_WIDTH_PX : 0);
        widths.push(Math.min(cfg.maxW, Math.max(floor, numericW)));
        return;
      }
      if (
        isApp4aPfaFixedCallDepositSummary(currentFileName, cleanTitle) &&
        /^amount$/i.test(labelRaw.trim()) &&
        !/%|percent|percentage/i.test(labelRaw)
      ) {
        widths.push(Math.min(cfg.maxW, Math.max(APP_4A_PFA_SUMMARY_AMOUNT_MIN_WIDTH_PX, numericW)));
        return;
      }
      if (
        isCurrencyComparisonSummaryTable(currentFileName, cleanTitle, hdr) &&
        /^volume\b/i.test(labelRaw.trim())
      ) {
        const prevWeekVol = /\bprevious\s+week\b/i.test(headerStackText);
        const floor = prevWeekVol
          ? APP_4A_TABLE_SUMMARY_PREVIOUS_WEEK_VOLUME_COLUMN_MIN_WIDTH_PX
          : APP_4A_TABLE_SUMMARY_VOLUME_COLUMN_MIN_WIDTH_PX;
        widths.push(Math.min(cfg.maxW, Math.max(floor, numericW)));
        return;
      }
      if (/^amount\s*\(usd\)$/i.test(labelRaw)) { widths.push(220); return; }
      if (
        isEquivalentAmountCol(labelRaw) ||
        equivalentAmountHeaderStackRe.test(headerStackText)
      ) {
        widths.push(Math.min(cfg.maxW, Math.max(EQUIVALENT_AMOUNT_COLUMN_MIN_WIDTH_PX, numericW)));
        return;
      }
      if (/^amount$/i.test(labelRaw)) { widths.push(190); return; }
      if (/^collaterized\s*deposit$/i.test(labelRaw)) { widths.push(160); return; }
      if (/^net\s*position$/i.test(labelRaw)) { widths.push(120); return; }
      if (/^principal$/i.test(labelRaw)) { widths.push(300); return; }
      if (/^usd\s*amount$/i.test(labelRaw)) { widths.push(160); return; }
      if (/^sub[\s_-]*total$/i.test(h)) { widths.push(150); return; }
      if (currentFileName?.includes("APP 3") && /^cumulative\s+gap/i.test(labelRaw)) { widths.push(150); return; }
      if (/^description$/i.test(labelRaw)) { widths.push(DESCRIPTION_W); return; }
      if (
        shouldNormalizeApp4bCurrencySummaryMatrix(lastHdr, currentFileName, cleanTitle) &&
        ci === 0 &&
        !labelRaw
      ) {
        widths.push(DESCRIPTION_W);
        return;
      }
      if (
        shouldNormalizeApp4aMainSummaryMatrix(lastHdr, currentFileName, cleanTitle) &&
        ci === 0 &&
        (/^summary\s*:?$/i.test(labelRaw.trim()) || !labelRaw)
      ) {
        let labelBodyW = 0;
        for (const r of [...rows, ...footer]) {
          const v = Array.isArray(r) ? r[ci] : null;
          if (v == null || String(v).trim() === "") continue;
          const line = String(v).split("\n")[0];
          labelBodyW = Math.max(labelBodyW, Math.ceil(line.length * cfg.charW) + cfg.cellPad);
        }
        widths.push(
          Math.min(
            cfg.maxW,
            Math.max(APP_4A_TABLE_SUMMARY_LABEL_COLUMN_MIN_WIDTH_PX, labelBodyW, numericW)
          )
        );
        return;
      }
      if (/^unpaid[\s_-]*balance(?:\s*\(usd\))?$/i.test(h)) { widths.push(190); return; }
      if (/^principal[\s_-]*\(usd\)$/i.test(h)) { widths.push(190); return; }
      if (/^principal[\s_-]*\(eur\)$/i.test(h)) { widths.push(PRINCIPAL_EUR_COLUMN_WIDTH_PX); return; }
      if (/^principal[\s_-]*\(gbp\)$/i.test(h)) { widths.push(PRINCIPAL_GBP_COLUMN_WIDTH_PX); return; }
      if (
        isCurrencyComparisonSummaryTable(currentFileName, cleanTitle, hdr) &&
        /^current\s*week$/i.test(labelRaw.trim()) &&
        /\b(volume|amount)\b/i.test(headerStackText)
      ) {
        widths.push(Math.min(cfg.maxW, Math.max(APP_4A_TABLE_SUMMARY_VOLUME_COLUMN_MIN_WIDTH_PX, numericW)));
        return;
      }
      if (
        isCurrencyComparisonSummaryTable(currentFileName, cleanTitle, hdr) &&
        /^previous\s*week$/i.test(labelRaw.trim()) &&
        /\b(volume|amount)\b/i.test(headerStackText)
      ) {
        widths.push(
          Math.min(cfg.maxW, Math.max(APP_4A_TABLE_SUMMARY_PREVIOUS_WEEK_VOLUME_COLUMN_MIN_WIDTH_PX, numericW))
        );
        return;
      }
      if (/^current\s*week$/i.test(labelRaw)) {
        widths.push(
          currentFileName?.includes("APP 8")
            ? APP_8_CURRENT_PREVIOUS_WEEK_COLUMN_WIDTH_PX
            : currentFileName?.includes("APP 4C")
              ? 250
              : 190
        );
        return;
      }
      if (/^previous\s*week$/i.test(labelRaw)) {
        widths.push(
          currentFileName?.includes("APP 8")
            ? APP_8_CURRENT_PREVIOUS_WEEK_COLUMN_WIDTH_PX
            : currentFileName?.includes("APP 4C")
              ? 250
              : 190
        );
        return;
      }
      if (/^expiry\s*date$/i.test(labelRaw)) { widths.push(160); return; }
      if (/^name$/i.test(labelRaw)) { widths.push(370); return; }
      if (/^top\s*depositors\s*of\s*fund\s*\(\d+%\)$/i.test(labelRaw)) {
        widths.push(330);
        return;
      }
      if (/^customer\s*name/i.test(labelRaw)) {
        widths.push(700);
        return;
      }

      if (/^customer\s+name$/i.test(labelRaw.trim())) {
        widths.push(570);
        return;
      }
      if (/^category$/i.test(labelRaw)) { widths.push(160); return; }
      if (/rtb\s*as\s*at/i.test(labelRaw)) { widths.push(120); return; }
      if (isCustomerNameColHdr(labelRaw)) {
        const pad = Math.max(cfg.cellPad, 24) * 2;
        const perChar = Math.max(Number(cfg.headerCharW) || 10, 11.5);
        const hdrMin = Math.max(300, Math.ceil(labelRaw.length * perChar) + pad);
        let bodyLineMax = 0;
        for (const r of rows) {
          const v = Array.isArray(r) ? r[ci] : null;
          if (v == null) continue;
          const line = String(v).split("\n")[0];
          bodyLineMax = Math.max(bodyLineMax, Math.ceil(line.length * cfg.charW) + cfg.cellPad);
        }
        for (const r of footer) {
          const v = Array.isArray(r) ? r[ci] : null;
          if (v == null) continue;
          const line = String(v).split("\n")[0];
          bodyLineMax = Math.max(bodyLineMax, Math.ceil(line.length * cfg.charW) + cfg.cellPad);
        }
        widths.push(Math.min(Math.max(hdrMin, numericW, bodyLineMax), cfg.maxW));
        return;
      }
      if (/maturing.*unconfirmed.*lcs?.*yet.*paid.*doc/i.test(labelRaw)) { widths.push(250); return; }
      if (/^current$/i.test(labelRaw)) {
        widths.push(isApp1BFile(currentFileName) ? APP_1B_CURRENT_COLUMN_WIDTH_PX : 200);
        return;
      }
      if (/^fixed dep\/collateralised deposit$/i.test(labelRaw)) { widths.push(200); return; }
      if (/^sub[\s_-]*total\s*\(/i.test(labelRaw)) { widths.push(200); return; }
      if (/^fixed dep/i.test(labelRaw)) { widths.push(190); return; }
      if (/^coupon\s*&\s*tenor\s*@\s*issue$/i.test(labelRaw)) { widths.push(220); return; }
      if (/^weighted\s+average\s+yield\s*\(%\)$/i.test(labelRaw)) { widths.push(WEIGHTED_AVERAGE_YIELD_PCT_COLUMN_WIDTH_PX); return; }
      if (/^average\s+pricing\s*\(\s*adjusted\s*\)$/i.test(labelRaw)) {
        widths.push(AVERAGE_PRICING_ADJUSTED_COLUMN_WIDTH_PX);
        return;
      }
      if (/^regulatory\s*\(?%\)?$/i.test(labelRaw.trim())) {
        widths.push(310);
        return;
      }
      if (/^payment\s*channels?/i.test(labelRaw)) {
        widths.push(220);
        return;
      }

      if (/^(current|previous)\s*%$/i.test(labelRaw)) {
        if (multiRowHeader && sgHdr) {
          const cap = Math.min(sgHdr.maxWidth ?? 260, cfg.maxW);
          const floor = sgHdr.currentPreviousWidth ?? 120;
          widths.push(Math.min(Math.max(floor, numericW), cap));
        } else {
          widths.push(Math.min(Math.max(PCT_W, numericW), cfg.maxW));
        }
        return;
      }

      if (isSnCol(labelRaw)) { widths.push(SN_W); return; }
      if (isAvgRateCol(labelRaw)) { widths.push(AVG_RATE_W); return; }
      if (isVariancePctCol(labelRaw)) { widths.push(VARIANCE_PCT_COLUMN_WIDTH_PX); return; }
      if (currentFileName?.includes("APP 3") && isTotalCol(labelRaw)) {
        widths.push(APP_3_TOTAL_COLUMN_WIDTH_PX);
        return;
      }
      if (isTotalCol(labelRaw)) { widths.push(TOTAL_W); return; }
      if (isTransDateCol(labelRaw)) { widths.push(TRANS_DATE_W); return; }
      if (isCustomerDetailsAlphaCol(labelRaw)) { widths.push(CUSTOMER_DETAILS_ALPHA_W); return; }
      if (isCustomerCurrentAcctNoCol(labelRaw)) { widths.push(CUSTOMER_CURRENT_ACCT_NO_W); return; }
      if (isBranchGroupsCol(labelRaw)) { widths.push(BRANCH_GROUPS_W); return; }
      if (
        isApp1BFile(currentFileName) &&
        /^(parameters?|parameteres)(\s*\(\s*%\s*\))?$/i.test(labelRaw.trim())
      ) {
        widths.push(APP_1B_PARAMETERS_PCT_COLUMN_WIDTH_PX);
        return;
      }
      if (isParametersColumn(labelRaw)) {
        widths.push(PARAMS_W);
        return;
      }
      if (isRemarksColumn(labelRaw)) { widths.push(REMARKS_W); return; }
      if (isSignificantFundingCol(labelRaw)) { widths.push(SIG_FUNDING_W); return; }
      if (isAssetsLiabilityCol(labelRaw)) { widths.push(ASSETS_LIABILITY_W); return; }
      if (isSecurityCol(labelRaw)) { widths.push(SECURITY_W); return; }
      if (isCustomersNameCol(labelRaw)) { widths.push(CUSTOMERS_NAME_W); return; }
      if (isConsolidatedCashPositionCol(labelRaw)) { widths.push(CONSOLIDATED_CASH_POSITION_W); return; }
      if (isRegulatoryIndustryCol(labelRaw)) { widths.push(REGULATORY_INDUSTRY_W); return; }

      const hasConsolidatedCashInBody = rows.some((r) => {
        const v = Array.isArray(r) ? r[ci] : null;
        return v != null && isConsolidatedCashPositionCol(String(v).trim());
      });
      if (hasConsolidatedCashInBody) { widths.push(CONSOLIDATED_CASH_POSITION_W); return; }

      if (isDealAmountCol(labelRaw)) { widths.push(Math.max(DEAL_AMOUNT_W, numericW)); return; }
      if (/^acct\.?\s*no\.?$/i.test(h)) { widths.push(Math.max(ACCT_NO_W, numericW)); return; }
      if (/^acct[\s_-]*name$/i.test(h)) { widths.push(Math.max(ACCT_NAME_W, numericW)); return; }
      if (/^crncy[\s_-]*id$|^currency[\s_-]*id$/i.test(h)) { widths.push(Math.max(CRNCY_ID_W, numericW)); return; }
      if (/^name$/i.test(h)) { widths.push(Math.max(NAME_W, numericW)); return; }
      if (/^curr[\s.]?rate$/i.test(h)) { widths.push(Math.max(CURR_RATE_W, numericW)); return; }
      if (/^int[\s.]?\s*rate$/i.test(h)) { widths.push(Math.max(INT_RATE_W, numericW)); return; }
      if (/^rate$/i.test(h)) { widths.push(Math.max(RATE_W, numericW)); return; }
      if (/^interest[\s.]?\s*rate$/i.test(h)) { widths.push(Math.max(INTEREST_RATE_W, numericW)); return; }
      if (/^#value!?$/i.test(h)) { widths.push(Math.max(VALUE_ERROR_W, numericW)); return; }
      if (/call.*%/.test(h)) { widths.push(Math.max(CALL_PCT_W, numericW)); return; }
      if (h.includes("%")) { widths.push(Math.max(PCT_W, numericW)); return; }
      if (/^cur[\s._-]*bal(ance)?$/i.test(h)) { widths.push(Math.max(CUR_BAL_W, numericW)); return; }
      if (/^acct[\s._-]*status$|^account[\s._-]*status$/i.test(h)) { widths.push(Math.max(ACCT_STATUS_W, numericW)); return; }
      if (/^branch$/i.test(h)) { widths.push(Math.max(BRANCH_W, numericW)); return; }

      if (!labelRaw && emptyIdxCol(header, rows, ci, footer)) { widths.push(0); return; }

      const bodyW = (() => {
        const ws = rows.map((r) => {
          const v = Array.isArray(r) ? r[ci] : null;
          if (v == null) return 0;
          const f = isPct ? fmtPct(v) : isAmountCol(header) ? fmtCurrency(v, cur) : String(v);
          return Math.ceil(String(f).split("\n")[0].length * cfg.charW) + cfg.cellPad;
        });
        let w = rows.length ? Math.max(...ws, 0) : 0;
        if (colHasNeg(rows, ci)) w = Math.ceil(w * cfg.negMult);
        return w;
      })();

      const fw = (() => {
        const ws = footer.map((r) => {
          const v = Array.isArray(r) ? r[ci] : null;
          if (v == null) return 0;
          const f = isPct ? fmtPct(v) : isAmountCol(header) ? fmtCurrency(v, cur) : String(v);
          return Math.ceil(String(f).split("\n")[0].length * cfg.charW) + cfg.cellPad;
        });
        let w = footer.length ? Math.max(...ws, 0) : 0;
        if (w > 0) w = Math.ceil(w * cfg.footerMult);
        return w;
      })();

      const allHeaderW = allHeaderRows.reduce((maxW, hrow) => {
        const raw = String(hrow[ci] ?? "").trim();
        if (!raw) return maxW;
        const txt = isPct && !raw.includes("(%)") ? `${raw} (%)` : raw;
        if (isApp2AFile(currentFileName) && isApp2aDateNairaMnHeader(raw)) {
          const w = Math.ceil(txt.length * (Number(cfg.headerCharW) || 10)) + 24;
          return Math.max(maxW, w, APP_2A_DATE_NM_HEADER_MIN_WIDTH_PX);
        }
        const words = txt.split(/[\s()%,/_-]+/).filter((w) => w.length > 0);
        const longestWord = Math.max(...words.map((w) => w.length), 4);
        const lines = txt.length <= 20 ? 1 : txt.length <= 40 ? 2 : 3;
        const refLen = Math.max(longestWord, Math.ceil(txt.length / lines));
        const w = Math.ceil(refLen * cfg.headerCharW) + cfg.cellPad;
        return Math.max(maxW, w);
      }, 0);

      const dataW = Math.max(bodyW, fw, numericW, cfg.minW);
      const finalHeaderW = dataW > cfg.minW ? Math.min(allHeaderW, dataW) : allHeaderW;

      widths.push(Math.min(Math.max(finalHeaderW, dataW), cfg.maxW));
    });

    const leafRow = multiRowHeader ? allHeaderRows[allHeaderRows.length - 1] : null;
    if (Array.isArray(leafRow) && leafRow.length === widths.length && sgHdr) {
      const syncSubgroupPct = /^(current|previous|regulatory)\s*%$/i;
      const capDefault = Math.min(sgHdr.maxWidth ?? 260, cfg.maxW);
      const capRegulatory = Math.min(sgHdr.regulatoryMaxWidth ?? sgHdr.maxWidth ?? 260, cfg.maxW);
      const byKey = new Map();
      leafRow.forEach((cell, ci) => {
        if ((widths[ci] ?? 0) === 0) return;
        const t = String(cell ?? "").trim();
        if (!syncSubgroupPct.test(t)) return;
        const key = t.toLowerCase().replace(/\s+/g, " ");
        if (!byKey.has(key)) byKey.set(key, []);
        byKey.get(key).push(ci);
      });
      byKey.forEach((indices, key) => {
        if (indices.length < 2) return;
        const syncCap = key === "regulatory %" ? capRegulatory : capDefault;
        const mx = Math.min(syncCap, Math.max(...indices.map((i) => widths[i] ?? 0)));
        indices.forEach((i) => { widths[i] = mx; });
      });
    }

    if (
      currentFileName &&
      String(currentFileName).toUpperCase().includes("APP 9") &&
      isApp9TwoColumnNarrativeTable(headers, rows, cleanTitle)
    ) {
      applyApp9NarrativeColumnWidth(widths, widths.length, rows);
    }

    if (isAlcoLondonPartASplitTable(currentFileName, allHeaderRows, rows)) {
      applyAlcoLondonPartColumnWidths(widths, allHeaderRows, rows);
    }

    applyAlcoSierraLeoneMovementColumnWidths(widths, currentFileName, cleanTitle);

    return { widths, noWrapCols };
  };

  const cleanTitle = useMemo(() => removeGroupPrefix(title ?? widget?.title ?? ""), [title, widget?.title]);

  const alcoFileNameBlob = useMemo(
    () => buildAlcoSubsidiariesFileNameBlob(currentFileName, title, widget?.title, groupTitle),
    [currentFileName, title, widget?.title, groupTitle]
  );

  /** APP 2A COMMERCIAL PAPER / CORPORATE BOND — drop empty-header trailing column at data layer. */
  const app2aDropLastColIdx = useMemo(() => {
    const rawHeaders = arr(widget?.headers || widget?.columns);
    const rawRows = arr(widget?.rows);
    const rawFooters = resolveFooters(widget?.footers ?? widget?.footerRows);
    const inferredSection = inferNonLiquidSubTableSection(rawHeaders, rawRows);
    const tableTitles = [
      cleanTitle,
      title,
      widget?.title,
      removeGroupPrefix(widget?.title ?? ""),
      removeGroupPrefix(title ?? ""),
      inferredSection,
    ].filter(Boolean);
    return resolveApp2ADropLastColumnIndex({
      headerRows: rawHeaders,
      rows: rawRows,
      footerRows: rawFooters,
      currentFileName,
      groupTitle,
      tableTitles,
    });
  }, [
    widget?.headers,
    widget?.columns,
    widget?.rows,
    widget?.footers,
    widget?.footerRows,
    currentFileName,
    groupTitle,
    cleanTitle,
    title,
    widget?.title,
  ]);

  const pfaStripSpacerColumn = useMemo(() => {
    const rawRows = arr(widget?.rows);
    const rawHeaders = arr(widget?.headers || widget?.columns);
    const r0 = rawRows[0];
    const h0 = rawHeaders.find((x) => Array.isArray(x) && x.length > 1) ?? rawHeaders[0];
    const fn = String(currentFileName ?? "").toUpperCase();
    const app6aPfa = fn.includes("APP 6A") && isApp6aPfaSummaryTitle(cleanTitle);
    const app6aPfaSixColSpacer =
      app6aPfa &&
      Array.isArray(h0) &&
      h0.length === 6 &&
      isApp6aPfaSummaryLeafTwoBandLayout(h0) &&
      (String(h0[1] ?? "").trim() === "" || String(h0[1] ?? "") === "\u200c");
    const app6aPfaSevenColSpacer =
      app6aPfa &&
      Array.isArray(h0) &&
      h0.length === 7 &&
      isApp6aPfaSummaryLeafTwoBandLayout(h0) &&
      (String(h0[1] ?? "").trim() === "" || String(h0[1] ?? "") === "\u200c");
    return (
      (isApp4aPfaFixedCallDepositSummary(currentFileName, cleanTitle) &&
        Array.isArray(r0) &&
        r0.length === 7 &&
        Array.isArray(h0) &&
        h0.length === 7) ||
      (app6aPfaSevenColSpacer && Array.isArray(r0) && r0.length === 7) ||
      (app6aPfaSixColSpacer && Array.isArray(r0) && r0.length === 6)
    );
  }, [widget?.rows, widget?.headers, widget?.columns, currentFileName, cleanTitle]);

  const rows = useMemo(() => {
    let r = arr(widget?.rows);
    if (!r.length) {
      const tableWidget = (widget?.widgets || []).find(
        (w) => w?.type === "TABLE" && Array.isArray(w.rows) && w.rows.length
      );
      if (tableWidget) r = arr(tableWidget.rows);
    }
    if (pfaStripSpacerColumn) {
      r = r.map((row) => (Array.isArray(row) ? stripPfaSummarySpacerColumn(row) : row));
    }
    if (app2aDropLastColIdx != null) {
      r = stripTableMatrixColumn(r, app2aDropLastColIdx);
    }
    r = squeezeApp4bCurrencySummaryMatrix(r, currentFileName, cleanTitle);
    r = squeezeApp4aMainSummaryMatrix(r, currentFileName, cleanTitle);
    r = prepareAlcoSierraLeoneRiskAssetsRows(r, currentFileName, cleanTitle);
    return r;
  }, [widget?.rows, widget?.widgets, pfaStripSpacerColumn, app2aDropLastColIdx, currentFileName, cleanTitle]);

  const headers = useMemo(() => {
    let h = arr(widget?.headers || widget?.columns);
    if (!h.length) {
      const tableWidget = (widget?.widgets || []).find(
        (w) => w?.type === "TABLE" && Array.isArray(w.columns) && w.columns.length
      );
      if (tableWidget) h = arr(tableWidget.columns);
    }
    if (pfaStripSpacerColumn) {
      h = h.map((hr) => (Array.isArray(hr) ? stripPfaSummarySpacerColumn(hr) : hr));
    }
    if (app2aDropLastColIdx != null) {
      h = stripTableMatrixColumn(h, app2aDropLastColIdx);
    }
    h = squeezeApp4bCurrencySummaryMatrix(h, currentFileName, cleanTitle, { headerMatrix: true });
    h = squeezeApp4aMainSummaryMatrix(h, currentFileName, cleanTitle, { headerMatrix: true });
    return h;
  }, [widget?.headers, widget?.columns, widget?.widgets, pfaStripSpacerColumn, app2aDropLastColIdx, currentFileName, cleanTitle]);

  const footerRows = useMemo(() => {
    let f = resolveFooters(widget?.footers ?? widget?.footerRows);
    if (pfaStripSpacerColumn) {
      f = f.map((fr) => (Array.isArray(fr) ? stripPfaSummarySpacerColumn(fr) : fr));
    }
    if (app2aDropLastColIdx != null) {
      f = stripTableMatrixColumn(f, app2aDropLastColIdx);
    }
    f = squeezeApp4bCurrencySummaryMatrix(f, currentFileName, cleanTitle);
    f = squeezeApp4aMainSummaryMatrix(f, currentFileName, cleanTitle);
    return f;
  }, [widget?.footers, widget?.footerRows, pfaStripSpacerColumn, app2aDropLastColIdx, currentFileName, cleanTitle]);

  const isApp4aSummaryTable = useMemo(
    () => isCurrencyComparisonSummaryTable(currentFileName, cleanTitle, headers),
    [currentFileName, cleanTitle, headers]
  );

  const currency = widget?.currency || "NGN";

  /** When `plainBodyCell` is true (tbody data paths), inner text avoids extra bold weights; thead/tfoot pass false. */
  const renderCell = (val, re = null, inlineHeadings = false, suppressBold = false, plainBodyCell = false) => {
    if (val == null || (typeof val === "number" && isNaN(val))) return null;
    const str = prepareAlcoLondonMarketReviewCellText(String(val ?? ""), currentFileName, cleanTitle);
    if (str.trim() === "" || str.trim().toLowerCase() === "nan") return null;
    if (str.trim() === "-") return <span>{str}</span>;

    const norm = str
      .replace(/(==\w+)\s+(\$\/)/g, "$1\n$2")
      .replace(/[ \t]+/g, " ")
      .replace(/(\s*\n\s*)+/g, "\n")
      .trim();

    const lines = [];
    norm.split("\n").forEach((line) => {
      if (!line.trim()) return;
      if (line.trim() === "-") { lines.push("-"); return; }
      const last = lines[lines.length - 1];
      const lastH = isHeadingLine(last);
      const curH =
        isHeadingLine(line.trim()) ||
        isAlcoLondonMarketReviewSectionLine(line, currentFileName, cleanTitle);
      const isBull = /^(-|\*|•|o\.?|o )\s*\S/.test(line.trimStart());
      const isFxEntry = /^\$\//.test(line.trimStart());
      const isNum = isNumberedItem(line);
      if (!isBull && !isFxEntry && !curH && !isNum && last && last !== "-" && !lastH) {
        lines[lines.length - 1] = `${last} ${line.trim()}`;
      } else {
        lines.push(line.trim());
      }
    });

    return lines.map((line, i) => {
      if (line === "-") return <span key={i}>{line}</span>;
      const neg = isNegStr(line);
      const bull = isBullet(line);
      const blackBull = !bull && isBlackBullet(line);
      const num = isNumberedItem(line);
      const text = bull ? stripBullet(line) : line;
      if (!text?.trim()) return null;

      const hbm = text.match(/^([A-Z][A-Z\s&]*?)\s+(o\s+.+)$/i);
      if (hbm) {
        return (
          <div key={i} style={{ marginTop: i > 0 ? 4 : 0, display: "flex", alignItems: "flex-start", gap: 8 }}>
            <span style={{ fontWeight: plainBodyCell ? 400 : 700, whiteSpace: "nowrap" }}>{hl(hbm[1].trim(), re)}</span>
            <span>{hl(hbm[2], re)}</span>
          </div>
        );
      }

      const isH =
        isHeadingLine(text.trim()) ||
        isAlcoLondonMarketReviewSectionLine(text, currentFileName, cleanTitle);
      if (num) {
        const numFontSize =
          isApp7BFile(currentFileName) && !plainBodyCell ? `${fontSize}px` : undefined;
        return (
          <div key={i} style={{ marginTop: i > 0 ? 6 : 0, display: "flex", alignItems: "flex-start", gap: 6, ...(numFontSize ? { fontSize: numFontSize } : {}) }}>
            <span>{hl(text, re)}</span>
          </div>
        );
      }

      return (
        <div key={i} style={{
          marginTop: i > 0 ? (isH ? 8 : 4) : 0, paddingBottom: bull && !isH ? 25 : 0, paddingLeft: bull && !isH ? 12 : blackBull ? 28 : 0, display: "flex", alignItems: "flex-start", gap: bull && !isH ? 8 : 0, color: neg ? "#d62728" : "inherit", fontWeight: plainBodyCell ? "inherit" : (isH && containsAppFile(currentFileName) && !suppressBold) ? cleanTitle === 'E: NIBOR AND TERM SOFR' || cleanTitle === 'C: MONETARY POLICY TOOLS' ? 500 : 700 : neg ? 600 : "inherit",
        }}>
          {bull && !isH && <BulletDot />}
          <span>{hl(text, re)}</span>
        </div>
      );
    }).filter(Boolean);
  };

  // hook 2

  // hooks 3-4
  const narrativeHeaderRows = useMemo(() => {
    const cc = rows?.[0]?.length || headers?.find((r) => Array.isArray(r) && r.length > 1)?.length || 0;
    return (headers || []).filter((r) => {
      if (!Array.isArray(r) || r.length !== cc) return false;
      const nn = r.filter((c) => c != null && String(c).trim() !== "");
      return nn.length > 0 && nn.every((c) => String(c).trim().length > 100);
    });
  }, [headers, rows]);

  const headerRows = useMemo(() => {
    const base = resolveHeaders(headers, rows);
    const withPfaTop = withApp4aPfaFixedCallDepositHeaderRows(base, currentFileName, cleanTitle);
    const with4a = withApp4aWeekBandHeaderRows(withPfaTop, currentFileName, cleanTitle);
    const with6aPfaTop = withApp6aPfaSummaryTopHeaderRows(with4a, currentFileName, cleanTitle);
    const with6aPfa = withApp6aPfaSummaryWeekBandHeaderRows(with6aPfaTop, currentFileName, cleanTitle);
    const with4bSummary = withApp4bCurrencySummaryWeekBandHeaderRows(with6aPfa, currentFileName, cleanTitle);
    const with4aMainSummary = withApp4aMainSummaryWeekBandHeaderRows(with4bSummary, currentFileName, cleanTitle);
    const with6aFixed = withApp6aFixedDepositSummaryHeaderRows(with4aMainSummary, currentFileName, cleanTitle);
    return withAlcoSierraLeoneMovementHeaderRows(with6aFixed, alcoFileNameBlob, cleanTitle);
  }, [headers, rows, alcoFileNameBlob, cleanTitle]);
  const pfaLabelHeaderIdx = useMemo(
    () => findPfaWeekBandLabelHeaderRowIndex(headerRows, currentFileName, cleanTitle),
    [headerRows, currentFileName, cleanTitle]
  );
  const pfaWeekBandRowIdx = useMemo(
    () => findPfaWeekBandSubheaderRowIndex(headerRows),
    [headerRows]
  );
  const lastHdr =
    pfaLabelHeaderIdx >= 0 &&
    (isApp4aPfaFixedCallDepositSummary(currentFileName, cleanTitle) ||
      shouldNormalizeApp4aMainSummaryMatrix(headerRows, currentFileName, cleanTitle) ||
      shouldNormalizeApp4bCurrencySummaryMatrix(headerRows, currentFileName, cleanTitle) ||
      (String(currentFileName ?? "").toUpperCase().includes("APP 6A") && isApp6aPfaSummaryTitle(cleanTitle)))
      ? headerRows[pfaLabelHeaderIdx] ?? []
      : headerRows[headerRows.length - 1] ?? [];
  const colCount = lastHdr.length;

  /** Omit PFA week-band row for width + leaf-label resolution (must be before `computeWidths`). */
  const headerRowsForLeafResolve = useMemo(() => {
    const pfaWeekBandContext =
      isApp4aPfaFixedCallDepositSummary(currentFileName, cleanTitle) ||
      isApp4aTableSummaryTitle(currentFileName, cleanTitle) ||
      isApp4bCurrencySummaryTitle(currentFileName, cleanTitle) ||
      (String(currentFileName ?? "").toUpperCase().includes("APP 6A") && isApp6aPfaSummaryTitle(cleanTitle));
    if (!pfaWeekBandContext || pfaWeekBandRowIdx < 0) return headerRows;
    return headerRows.filter((_, ri) => ri !== pfaWeekBandRowIdx);
  }, [headerRows, currentFileName, cleanTitle, pfaWeekBandRowIdx]);

  // hook 5
  const hasApp1A = useMemo(() => isApp1AFile(currentFileName), [currentFileName]);
  const isApp1AReviewOutlookBody = useMemo(
    () => isApp1AReviewOutlookDualColumnTable(currentFileName, lastHdr),
    [currentFileName, lastHdr]
  );
  const hasApp1B = useMemo(() => isApp1BFile(currentFileName), [currentFileName]);
  // hook 6
  const hasApp2A = useMemo(() => isApp2AFile(currentFileName), [currentFileName]);
  const hasApp3 = useMemo(() => isApp3File(currentFileName), [currentFileName]);
  const hasApp10B = useMemo(() => isApp10bFileName(currentFileName), [currentFileName]);

  const visibleColIndices = useMemo(() => lastHdr.map((_, i) => i), [lastHdr]);
  const visibleColCount = visibleColIndices.length;

  const FILE_COLUMN_CONFIG = {
    APP_1A: { wrapAt: 50, charW: 8.5, headerCharW: 9.8, cellPad: 28, minW: 80, maxW: 100, wrapMin: 160, wrapMax: 420, negMult: 1.25, footerMult: 1.5, rowPadY: 4 },
    APP_1B: { wrapAt: 12, charW: 9.5, headerCharW: 10.0, cellPad: 45, minW: 80, maxW: 650, wrapMin: 140, wrapMax: 300, negMult: 1.1, footerMult: 1.4, rowPadY: 4 },
    APP_2A: { wrapAt: 12, charW: 9.3, headerCharW: 10, cellPad: 100, minW: 80, maxW: 650, wrapMin: 140, wrapMax: 300, negMult: 1.1, footerMult: 1.41, rowPadY: 4 },
    APP_2B: { wrapAt: 5, charW: 10.3, headerCharW: 3, cellPad: cleanTitle === 'Exchange Rate ($/N)' ? 120 : cleanTitle === "RISK ASSET GROUP" ? 100 : cleanTitle === 'KENYA' || cleanTitle === 'COTE D\'IVOIRE' ? 130 : 42, minW: 70, maxW: 640, wrapMin: 150, wrapMax: 50, negMult: 1.1, footerMult: 1.2, rowPadY: 4 },
    APP_2C: { wrapAt: 10, charW: cleanTitle === 'HEAD OFFICE MONTH' ? 11 : 8.9, headerCharW: 5, cellPad: 20, minW: 50, maxW: 300, wrapMin: 110, wrapMax: 150, negMult: 1.1, footerMult: 1.58, rowPadY: 4 },
    APP_3: { wrapAt: 5, charW: 3.5, headerCharW: 6, cellPad: cleanTitle === 'Maximum Cumulative Outflow/Inflow (Local Currency) Report' ? 135 : 105, minW: 65, maxW: 305, wrapMin: 125, wrapMax: 120, negMult: 1.1, footerMult: 1.4, rowPadY: 4 },
    APP_2D: {
      wrapAt: 20, charW: 6, headerCharW: 10, cellPad: cleanTitle === 'FIXED DEPOSIT LIQUIDATED DUE TO RATE' ? 200 :
        cleanTitle === "HUGE MOVEMENT IN DEMAND DEPOSIT"
          ? 39
          : cleanTitle === 'MOVEMENT IN DOM DEPOSITS FOR THE WEEK (GBP)-100,000.00 AND ABOVE - OUTFLOWS' ? 150 : cleanTitle === "MOVEMENT IN DOM DEPOSITS FOR THE WEEK (GBP)-100,000.00 AND ABOVE - INFLOWS"
            ? 95
            : cleanTitle !== "ZONAL  MOVEMENT  IN SAVINGS ACCOUNTS"
              ? 90
              : 370, minW: 70, maxW: 500, wrapMin: 125, wrapMax: 295, negMult: 1.2, footerMult: 1.6, rowPadY: 4
    },
    APP_4A: { wrapAt: 10, charW: 9, headerCharW: 10, cellPad: 170, minW: 70, maxW: 755, wrapMin: 105, wrapMax: 55, negMult: 1.1, footerMult: 1.3, rowPadY: 4 },
    APP_6A: { wrapAt: 10, charW: 7, headerCharW: 10, cellPad: 95, minW: 70, maxW: 555, wrapMin: 105, wrapMax: 55, negMult: 1.1, footerMult: 1.3, rowPadY: 4 },
    APP_6B: { wrapAt: 10, charW: 7, headerCharW: 10, cellPad: 60, minW: 70, maxW: 555, wrapMin: 105, wrapMax: 55, negMult: 1.1, footerMult: 1.3, rowPadY: 4 },
    APP_6C: { wrapAt: 10, charW: 7, headerCharW: 10, cellPad: 60, minW: 50, maxW: 555, wrapMin: 105, wrapMax: 55, negMult: 1.1, footerMult: 1.3, rowPadY: 4 },
    APP_4B: { wrapAt: 10, charW: 9.5, headerCharW: 10, cellPad: cleanTitle === 'Total Weekly HPD FCY (EUR)' || cleanTitle === 'Total Weekly HPD FCY (GBP)' ? 100 : 70, minW: 70, maxW: 455, wrapMin: 225, wrapMax: 395, negMult: 1.1, footerMult: 1.3, rowPadY: 4 },
    APP_4C: { wrapAt: 12, charW: 8.4, headerCharW: 13, cellPad: 108, minW: 80, maxW: 690, wrapMin: 140, wrapMax: 300, negMult: 1.1, footerMult: 1.41, rowPadY: 4 },
    APP_4D: { wrapAt: 10, charW: 8.6, headerCharW: 15, cellPad: 90, minW: 70, maxW: 455, wrapMin: 225, wrapMax: 395, negMult: 1.1, footerMult: 1.3, rowPadY: 4 },
    APP_5A: { wrapAt: 10, charW: 7, headerCharW: 13, cellPad: cleanTitle === 'CRR ADJUSTED WEIGHTED AVERAGE PRICING' ? 80 : cleanTitle === 'INDICATIVE RATE SHEET' ? 130 : cleanTitle === 'PRICING OF FCY LOANS' ? 130 : /\bUSANCE\b/i.test(String(cleanTitle ?? '')) ? 120 : 90, minW: 50, maxW: 300, wrapMin: 110, wrapMax: 150, negMult: 1.0, footerMult: 1.5, rowPadY: 4 },
    APP_8: { wrapAt: 10, charW: 10, headerCharW: 10, cellPad: 100, minW: 50, maxW: 555, wrapMin: 105, wrapMax: 55, negMult: 1.1, footerMult: 1.3, rowPadY: 4 },
    APP_5B: { wrapAt: 12, charW: 5, headerCharW: 5, cellPad: 98, minW: 90, maxW: 500, wrapMin: 210, wrapMax: 250, negMult: 1.3, footerMult: 1.6, rowPadY: 4 },
    APP_5C: { wrapAt: 12, charW: 9, headerCharW: 13, cellPad: 70, minW: 90, maxW: 500, wrapMin: 210, wrapMax: 250, negMult: 1.3, footerMult: 1.6, rowPadY: 4 },
    APP_7A: { wrapAt: 10, charW: 10, headerCharW: 15, cellPad: cleanTitle === 'MARKET TRIGGERS AND RATIOS' ? 20 : 60, minW: 50, maxW: 300, wrapMin: 110, wrapMax: 150, negMult: 1.0, footerMult: 1.4, rowPadY: 4 },
    APP_7B: { wrapAt: 10, charW: 10, headerCharW: 9, cellPad: 200, minW: 50, maxW: 300, wrapMin: 110, wrapMax: 150, negMult: 1.0, footerMult: 1.4, rowPadY: 4 },
    APP_9: { wrapAt: 10, charW: 8.5, headerCharW: 9, cellPad:75, minW: 50, maxW: 300, wrapMin: 110, wrapMax: 150, negMult: 1.0, footerMult: 1.3, rowPadY: 4 },
    APP_10B: { wrapAt: 10, charW: 8.5, headerCharW: 9, cellPad: cleanTitle === 'SUMMARY OF STATE RELATED DOM ACCOUNT BALANCES' ? 70 : 40, minW: 50, maxW: 300, wrapMin: 110, wrapMax: 150, negMult: 1.0, footerMult: 1.3, rowPadY: 4 },
    APP_11A: { wrapAt: cleanTitle === "ANALYSIS OF TOP 20 CUSTOMERS" ? 5 : 10, charW: cleanTitle === "ANALYSIS OF TOP 20 CUSTOMERS" ? 15 : 7, headerCharW: 10, cellPad: 50, minW: 50, maxW: 555, wrapMin: 105, wrapMax: 55, negMult: 1.1, footerMult: 1.3, rowPadY: 4 },
    APP_11B: { wrapAt: 10, charW: 7, headerCharW: 10, cellPad: 64, minW: 70, maxW: 555, wrapMin: 105, wrapMax: 55, negMult: 1.1, footerMult: 1.3, rowPadY: 4 },
    DEFAULT: { wrapAt: 12, charW: 9, headerCharW: 10.0, cellPad: 90, minW: 80, maxW: 650, wrapMin: 140, wrapMax: 300, negMult: 1.1, footerMult: 1.4, rowPadY: 4 },
  };

  const getColumnConfig = (fileName) => {
    if (!fileName) return FILE_COLUMN_CONFIG.DEFAULT;
    const n = String(fileName).toUpperCase();
    if (n.includes("APP 1A")) return FILE_COLUMN_CONFIG.APP_1A;
    if (n.includes("APP 1B")) return FILE_COLUMN_CONFIG.APP_1B;
    if (n.includes("APP 2A")) return FILE_COLUMN_CONFIG.APP_2A;
    if (n.includes("APP 2B")) return FILE_COLUMN_CONFIG.APP_2B;
    if (n.includes("APP 2C")) return FILE_COLUMN_CONFIG.APP_2C;
    if (n.includes("APP 2D")) return FILE_COLUMN_CONFIG.APP_2D;
    if (n.includes("APP 3")) return FILE_COLUMN_CONFIG.APP_3;
    if (n.includes("APP 4A")) return FILE_COLUMN_CONFIG.APP_4A;
    if (n.includes("APP 4B")) return FILE_COLUMN_CONFIG.APP_4B;
    if (n.includes("APP 4C")) return FILE_COLUMN_CONFIG.APP_4C;
    if (n.includes("APP 4D")) return FILE_COLUMN_CONFIG.APP_4D;
    if (n.includes("APP 5A")) return FILE_COLUMN_CONFIG.APP_5A;
    if (n.includes("APP 5B")) return FILE_COLUMN_CONFIG.APP_5B;
    if (n.includes("APP 5C")) return FILE_COLUMN_CONFIG.APP_5C;
    if (n.includes("APP 7A")) return FILE_COLUMN_CONFIG.APP_7A;
    if (n.includes("APP 6A")) return FILE_COLUMN_CONFIG.APP_6A;
    if (n.includes("APP 6B")) return FILE_COLUMN_CONFIG.APP_6B;
    if (n.includes("APP 6C")) return FILE_COLUMN_CONFIG.APP_6C;
    if (n.includes("APP 10B")) return FILE_COLUMN_CONFIG.APP_10B;
    if (n.includes("APP 11A")) return FILE_COLUMN_CONFIG.APP_11A;
    if (n.includes("APP 11B")) return FILE_COLUMN_CONFIG.APP_11B;
    if (n.includes("APP 7B")) return FILE_COLUMN_CONFIG.APP_7B;
    if (n.includes("APP 9")) return FILE_COLUMN_CONFIG.APP_9;
    if (n.includes("APP 8")) return FILE_COLUMN_CONFIG.APP_8;

    return FILE_COLUMN_CONFIG.DEFAULT;
  };

  const cfg = useMemo(() => getColumnConfig(currentFileName), [currentFileName, cleanTitle]);

  // hook 8
  const boldAllowed = useMemo(() => isBoldFile(currentFileName), [currentFileName]);
  // hook 9
  // hook 9b
  const isApp7B = useMemo(() => isApp7BFile(currentFileName), [currentFileName]);
  // hook 9c
  const hasApp5A = useMemo(() => isApp5AFile(currentFileName), [currentFileName]);
  const hasApp5C = useMemo(() => isApp5CFile(currentFileName), [currentFileName]);
  const hasApp7A = useMemo(() => isApp7AFile(currentFileName), [currentFileName]);
  const isApp6A = useMemo(
    () => (currentFileName ? String(currentFileName).toUpperCase().includes("APP 6A") : false),
    [currentFileName]
  );
  const isApp6APercentileTopDepositors = useMemo(
    () => isApp6A && isApp6APercentileTopDepositorsTitle(cleanTitle),
    [isApp6A, cleanTitle]
  );
  const isApp4B = useMemo(
    () => (currentFileName ? String(currentFileName).toUpperCase().includes("APP 4B") : false),
    [currentFileName]
  );
  // hook 9d
  const isBankRatesTable = useMemo(() => isApp7B && /bank[\s_-]*rates?/i.test(String(cleanTitle ?? "")), [isApp7B, cleanTitle]);
  /** APP 2D — loose "AMOUNT" header match + typography scope (many TDL tables use mid-string titles). */
  const isApp2dFile = useMemo(
    () => !!(currentFileName && String(currentFileName).toUpperCase().includes("APP 2D")),
    [currentFileName]
  );
  const isApp2bFile = useMemo(
    () => !!(currentFileName && String(currentFileName).toUpperCase().includes("APP 2B")),
    [currentFileName]
  );
  const isApp2cFile = useMemo(
    () => !!(currentFileName && String(currentFileName).toUpperCase().includes("APP 2C")),
    [currentFileName]
  );
  const isApp2bcFile = isApp2bFile || isApp2cFile;
  // hook 9e — pin row padding for APP 2D so title-based FILE_COLUMN_CONFIG.cellPad swings don’t change body line rhythm
  const effectiveCfg = useMemo(() => {
    let c = cfg;
    if (isBankRatesTable) c = { ...c, cellPad: 98, charW: 8.5, headerCharW: 8.5, minW: 60, maxW: 280 };
    if (isApp2dFile) c = { ...c, rowPadY: 8 };
    return c;
  }, [cfg, isBankRatesTable, isApp2dFile]);
  // hook 9g
  const isApp9MaturitiesTable = useMemo(() => {
    if (!currentFileName || !String(currentFileName).toUpperCase().includes("APP 9")) return false;
    const t = String(cleanTitle ?? "").trim();
    return /^maturities$/i.test(t) || /^weekly[\s_-]*net[\s_-]*position$/i.test(t);
  }, [currentFileName, cleanTitle]);

  // hook 9h — suppress bold for NOTE tables and BEHAVIOURAL ASSUMPTIONS (any document)
  const isNoteTable = useMemo(
    () =>
      /^NOTE\s*:?/i.test(String(cleanTitle ?? "").trim()) ||
      /^BEHAVIOURAL[\s_-]*ASSUMPTIONS$/i.test(String(cleanTitle ?? "").trim()),
    [cleanTitle]
  );

  /** APP 5A only — ": Notes" table (cleanTitle is often just "Notes" after group-prefix strip). */
  const isApp5ANotes = useMemo(
    () => isApp5ANotesTable(currentFileName, [cleanTitle, title, widget?.title]),
    [currentFileName, cleanTitle, title, widget?.title]
  );

  /** APP 7A only — `NOTES/COMMENTS` table; trailing null column is prose padding in the API. */
  const isApp7ANotesComments = useMemo(
    () => isApp7ANotesCommentsTable(currentFileName, [cleanTitle, title, widget?.title]),
    [currentFileName, cleanTitle, title, widget?.title]
  );

  /** APP 1A only — prose sub-files (GLOBAL CURRENCY REVIEW & OUTLOOK, etc.). */
  const isApp1AProseNarrative = useMemo(
    () =>
      isApp1AProseNarrativeTable(
        currentFileName,
        [cleanTitle, title, widget?.title],
        headers,
        rows
      ),
    [currentFileName, cleanTitle, title, widget?.title, headers, rows]
  );

  const isNoteStyleTable = isNoteTable || isApp5ANotes;

  const isMarketReviewTable = useMemo(
    () => isMarketReviewTableTitle(cleanTitle),
    [cleanTitle]
  );

  const isAlcoSierraLeoneMovement = useMemo(
    () => isAlcoSierraLeoneMovementTable(alcoFileNameBlob, cleanTitle),
    [alcoFileNameBlob, cleanTitle]
  );

  const alcoPartColIndices = useMemo(() => {
    const titles = [cleanTitle, title, widget?.title, groupTitle]
      .map((t) => removeGroupPrefix(t ?? ""))
      .filter(Boolean);
    return getMarketReviewProseColIndices(headerRows, rows, titles);
  }, [headerRows, rows, cleanTitle, title, widget?.title, groupTitle]);

  const isMarketReviewNarrativeTable = useMemo(() => {
    const titles = [cleanTitle, title, widget?.title, groupTitle]
      .map((t) => removeGroupPrefix(t ?? ""))
      .filter(Boolean);
    return isMarketReviewNarrativeTableShape(headerRows, rows, ...titles);
  }, [cleanTitle, title, widget?.title, groupTitle, headerRows, rows]);

  const isAlcoSierraLeoneMarketReview = useMemo(
    () => isAlcoSierraLeoneMarketReviewTable(alcoFileNameBlob, cleanTitle, headerRows, rows),
    [alcoFileNameBlob, cleanTitle, headerRows, rows]
  );

  const isAlcoSierraLeoneMarketReviewProseTable = useMemo(
    () => isSierraLeoneMarketReviewContext(alcoFileNameBlob, cleanTitle, headerRows, rows),
    [alcoFileNameBlob, cleanTitle, headerRows, rows]
  );

  const alcoSierraMarketReviewHeaderTitle = useMemo(
    () => (isAlcoSierraLeoneMarketReview ? getAlcoSierraLeoneMarketReviewHeaderTitle(headerRows, rows) : ""),
    [isAlcoSierraLeoneMarketReview, headerRows, rows]
  );

  const alcoSierraMarketReviewParagraphs = useMemo(() => {
    if (!isAlcoSierraLeoneMarketReview) return [];
    const paras = collectAlcoSierraLeoneMarketReviewParagraphs(rows, headerRows);
    const q = normalizeSearchQuery(search);
    if (!q) return paras;
    return paras.filter((p) => String(p).toLowerCase().includes(q));
  }, [isAlcoSierraLeoneMarketReview, rows, headerRows, search]);

  const displayTitle = useMemo(
    () => (isAlcoSierraLeoneMovement ? alcoSierraLeoneMovementDisplayTitle(cleanTitle) : cleanTitle),
    [isAlcoSierraLeoneMovement, cleanTitle]
  );

  const isAlcoLondonPartASplit = useMemo(() => {
    if (isAlcoSierraLeoneMarketReview) return false;
    if (
      isMarketReviewTableTitle(cleanTitle) &&
      findAlcoLondonPartAColumnIndices(headerRows, rows) != null &&
      !hasMarketReviewPartALabel(headerRows, rows)
    ) {
      return false;
    }
    return isAlcoLondonPartASplitTable(alcoFileNameBlob, headerRows, rows);
  }, [alcoFileNameBlob, headerRows, rows, isAlcoSierraLeoneMarketReview, cleanTitle]);

  const alcoLondonPartColIndices = useMemo(
    () => (isAlcoLondonPartASplit ? alcoPartColIndices : null),
    [isAlcoLondonPartASplit, alcoPartColIndices]
  );

  // ── scoped flag for BEHAVIOURAL ASSUMPTIONS borderless note rows (any document) ──────
  const isBehaviouralAssumptions = useMemo(
    () => /^BEHAVIOURAL[\s_-]*ASSUMPTIONS$/i.test(String(cleanTitle ?? "").trim()),
    [cleanTitle]
  );

  const customerNameColIdx = useMemo(() => {
    const idx = lastHdr.findIndex((h) => isCustomerNameColHdr(h));
    return idx >= 0 ? idx : null;
  }, [lastHdr]);

  // hook 11
  const showLiquidMetrics = useMemo(() => containsApp2ALiquid(currentFileName) && isLiquidAssetsGroup(groupTitle), [currentFileName, groupTitle]);
  const freeze = containsApp2cTdlZones(currentFileName) ? 2 : containsApp3M0(currentFileName) ? 1 : 0;

  // hook 12
  const pctCols = useMemo(() => {
    const s = new Set();
    lastHdr.forEach((h, i) => { if (colHasPercent(h, rows, i)) s.add(i); });
    return s;
  }, [lastHdr, rows]);

  // hook 13
  const { widths: baseColWidths, noWrapCols } = useMemo(
    () => computeWidths(lastHdr, headerRowsForLeafResolve, rows, footerRows, currency, pctCols, effectiveCfg),
    [lastHdr, headerRowsForLeafResolve, rows, footerRows, currency, pctCols, effectiveCfg]
  );
  /**
   * APP 5A: For specific tables, hide any column that has no tbody data at all (all values empty/null across `rows`).
   * — GL TOTAL current/previous week, DIFFERENCE, CRR adjusted / weighted average pricing per product.
   */
  const colWidths = useMemo(() => {
    let w = Array.isArray(baseColWidths) ? [...baseColWidths] : [];

    w = applyCompanySizeClassificationColumnWidths(
      w,
      headerRows,
      lastHdr,
      [cleanTitle, title, widget?.title, groupTitle],
      headers
    );

    w = applyLoanTypeColumnWidths(w, headerRows, lastHdr, headers);

    w = applyIdNameColumnWidths(w, headerRows, lastHdr, headers);

    if (isApp6APercentileTopDepositors) {
      w = applyApp6APercentileColumnWidths(w, lastHdr);
    }

    if (isAlcoLondonPartASplit) {
      applyAlcoLondonPartColumnWidths(w, headerRows, rows);
    }

    if (
      currentFileName &&
      String(currentFileName).toUpperCase().includes("APP 9") &&
      isApp9TwoColumnNarrativeTable(headers, rows, cleanTitle)
    ) {
      const narrativeColCount = Math.max(
        w.length,
        lastHdr?.length ?? 0,
        rows?.[0]?.length ?? 0,
        ...((rows || []).map((r) => (Array.isArray(r) ? r.length : 0)))
      );
      applyApp9NarrativeColumnWidth(w, narrativeColCount, rows);
    }

    if (hasApp5A && isApp5ANotes) {
      const colCount = Math.max(lastHdr?.length ?? 0, w.length);
      return applyApp5ANotesColumnWidths(w, rows, colCount);
    }

    if (isApp7ANotesComments || isApp1AProseNarrative) {
      const colCount = Math.max(lastHdr?.length ?? 0, w.length);
      return applyApp5ANotesColumnWidths(w, rows, colCount);
    }

    if (hasApp5A && isApp5AVolumeBandTable(cleanTitle, lastHdr)) return w;

    if (hasApp5A && /\bUSANCE\b/i.test(String(cleanTitle ?? title ?? ""))) {
      if ((w[0] ?? 0) > 0) w[0] = Math.max(w[0], 160);
      return w;
    }

    if (!hasApp5A) return w;

    const t = String(cleanTitle ?? "").trim();
    const isTargetApp5ATable =
      /GL\s*TOTAL\s*-\s*CURRENT\s*WEEK/i.test(t) ||
      /GL\s*TOTAL\s*-\s*PREVIOUS\s*WEEK/i.test(t) ||
      /\bDIFFERENCE\b/i.test(t) ||
      /CRR\s+ADJUSTED\s+WEIGHTED\s+AVERAGE\s+PRICING\s+PER\s+PRODUCT/i.test(t) ||
      /\bWEIGHTED\s+AVERAGE\s+PRICING\s+PER\s+PRODUCT\b/i.test(t);
    if (!isTargetApp5ATable) return w;

    const isEmptyBodyVal = (v) => {
      if (v == null) return true;
      const s = String(v).trim();
      if (!s) return true;
      if (s.toLowerCase() === "null") return true;
      return false;
    };

    const colCount = Math.max(lastHdr?.length ?? 0, w.length);
    for (let ci = 0; ci < colCount; ci++) {
      if ((w[ci] ?? 0) === 0) continue;
      const hasAnyBodyData = (rows || []).some((r) => Array.isArray(r) && !isEmptyBodyVal(r[ci]));
      if (!hasAnyBodyData) w[ci] = 0;
    }

    if (isAlcoLondonPartASplit) {
      applyAlcoLondonPartColumnWidths(w, headerRows, rows);
    }

    if (isAlcoSierraLeoneMovement) {
      applyAlcoSierraLeoneMovementColumnWidths(w, alcoFileNameBlob, cleanTitle);
    }

    return w;
  }, [baseColWidths, hasApp5A, isApp5ANotes, isApp7ANotesComments, isApp1AProseNarrative, cleanTitle, title, widget?.title, groupTitle, rows, lastHdr, footerRows, headers, currentFileName, isAlcoLondonPartASplit, isAlcoSierraLeoneMovement, headerRows, headerRowsForLeafResolve, isApp6APercentileTopDepositors]);

  const isApp9NarrativeTable = useMemo(() => {
    if (!currentFileName || !String(currentFileName).toUpperCase().includes("APP 9")) return false;
    return isApp9TwoColumnNarrativeTable(headers, rows, cleanTitle);
  }, [currentFileName, headers, rows, cleanTitle]);

  const app9NarrativeColIdx = useMemo(() => {
    if (!isApp9NarrativeTable) return null;
    const narrativeColCount = Math.max(
      colWidths?.length ?? 0,
      lastHdr?.length ?? 0,
      rows?.[0]?.length ?? 0,
      ...((rows || []).map((r) => (Array.isArray(r) ? r.length : 0)))
    );
    return getApp9NarrativeColumnIndex(rows, narrativeColCount);
  }, [isApp9NarrativeTable, colWidths, lastHdr, rows]);

  const totalW = colWidths.reduce((a, b) => a + b, 0);

  /** Same resolution as computeWidths leaf label — walk header rows bottom-up so merged / grouped headers still resolve (e.g. APP 2D “AMOUNT N'000”). */
  const resolvedLeafHeaders = useMemo(
    () => lastHdr.map((fallback, ci) => resolveLeafHeaderLabelFromRows(headerRowsForLeafResolve, ci, fallback)),
    [lastHdr, headerRowsForLeafResolve]
  );

  // hook 13b
  const rightAlignCols = useMemo(() => {
    const s = new Set();
    const loose = { app2dLoose: isApp2dFile };
    lastHdr.forEach((_h, ci) => {
      if (colWidths[ci] === 0) return;
      if (isRightAlignColByData(rows, footerRows, ci)) s.add(ci);
      if (isMoneyColumnHeader(resolvedLeafHeaders[ci], loose)) s.add(ci);
    });
    return s;
  }, [lastHdr, colWidths, rows, footerRows, resolvedLeafHeaders, isApp2dFile]);

  /** AMOUNT / deal amount / cur bal / etc. — full-column money styling in tbody. */
  const amountColIndices = useMemo(() => {
    const s = new Set();
    const loose = { app2dLoose: isApp2dFile };
    resolvedLeafHeaders.forEach((label, ci) => {
      if (colWidths[ci] === 0) return;
      if (isMoneyColumnHeader(label, loose)) s.add(ci);
    });
    return s;
  }, [resolvedLeafHeaders, colWidths, isApp2dFile]);

  /** Column indices whose leaf header is `TOTAL` / `TOTAL (…)` — entire column bold in body/head/foot. */
  const totalColIndices = useMemo(() => {
    const s = new Set();
    lastHdr.forEach((_h, ci) => {
      if (colWidths[ci] === 0) return;
      if (isTotalCol(normalizeLeafHeaderLabel(resolvedLeafHeaders[ci]))) s.add(ci);
    });
    return s;
  }, [lastHdr, colWidths, resolvedLeafHeaders]);

  /** Column indices whose leaf header is `SUB TOTAL` / `SUB TOTAL (…)` — entire column bold in body/head/foot. */
  const subTotalColIndices = useMemo(() => {
    const s = new Set();
    lastHdr.forEach((_h, ci) => {
      if (colWidths[ci] === 0) return;
      if (isSubTotalCol(resolvedLeafHeaders[ci])) s.add(ci);
    });
    return s;
  }, [lastHdr, colWidths, resolvedLeafHeaders]);

  /**
   * APP 2D — columns whose header is `SUM TOTAL OF TOP ZONES` / `SUM TOTAL OF HEAD OFFICE ZONES`.
   * Bold the full column (header, body, footer).
   */
  const app2dSumTotalZonesColIndices = useMemo(() => {
    if (!isApp2dFile) return new Set();
    const s = new Set();
    const n = Math.max(
      lastHdr?.length ?? 0,
      colWidths?.length ?? 0,
      ...(Array.isArray(headerRows) ? headerRows.map((r) => (Array.isArray(r) ? r.length : 0)) : [0])
    );
    for (let ci = 0; ci < n; ci++) {
      if ((colWidths?.[ci] ?? 0) === 0) continue;
      const leaf = resolvedLeafHeaders?.[ci] ?? lastHdr?.[ci] ?? "";
      if (isApp2dSumTotalZonesLabel(leaf)) {
        s.add(ci);
        continue;
      }
      if (!Array.isArray(headerRows)) continue;
      for (let ri = 0; ri < headerRows.length; ri++) {
        const row = headerRows[ri];
        if (!Array.isArray(row)) continue;
        if (isApp2dSumTotalZonesLabel(row[ci])) {
          s.add(ci);
          break;
        }
      }
    }
    return s;
  }, [isApp2dFile, headerRows, lastHdr, colWidths, resolvedLeafHeaders]);

  /** APP 10B: `TOTAL BALS (USD) …` columns — bold for the full column (header, body, footer). */
  const app10bTotalBalsColIndices = useMemo(() => {
    if (!hasApp10B) return new Set();
    return collectApp10bTotalBalsColIndices(headerRows, lastHdr, colWidths);
  }, [hasApp10B, headerRows, lastHdr, colWidths]);

  /** Columns whose stacked headers identify entity / dimension labels (incl. merged layouts). */
  const rowLabelHeaderStackColIndices = useMemo(() => {
    const out = new Set();
    const n = Math.max(lastHdr?.length ?? 0, colWidths?.length ?? 0);
    for (let ci = 0; ci < n; ci++) {
      if (colWidths[ci] === 0) continue;
      if (columnMatchesRowLabelHeaderStack(headerRows, ci, resolvedLeafHeaders, lastHdr)) out.add(ci);
    }
    return out;
  }, [headerRows, resolvedLeafHeaders, lastHdr, colWidths]);

  /** Columns where most values are not standalone TOTAL / SUB TOTAL — footer totals must not bold the whole column. */
  const predominantNonTotalLabelColIndices = useMemo(() => {
    const out = new Set();
    const n = Math.max(lastHdr?.length ?? 0, colWidths?.length ?? 0);
    for (let ci = 0; ci < n; ci++) {
      if (colWidths[ci] === 0) continue;
      if (columnHasPredominantlyNonTotalCells(rows, footerRows, colWidths, ci, currentFileName)) out.add(ci);
    }
    return out;
  }, [rows, footerRows, colWidths, lastHdr, currentFileName]);

  /**
   * Global TOTAL columns (by data):
   * If any cell is exactly TOTAL / SUB TOTAL / GRAND TOTAL / TOTAL DEPOSIT LIABILITY / TOTAL EUROBONDS (HTM & HFT), bold the whole column.
   * Skip row-label columns (ZONES, S/N, …) so a totals row does not bold every zone name.
   */
  const dataTotalOnlyLabelColIndices = useMemo(() => {
    const s = new Set();
    const all = [...rows, ...footerRows];
    all.forEach((r) => {
      if (!Array.isArray(r)) return;
      r.forEach((cell, ci) => {
        if (colWidths[ci] === 0) return;
        const leaf = resolvedLeafHeaders[ci] ?? lastHdr[ci] ?? "";
        if (isRowLabelColumnHeader(leaf)) return;
        if (rowLabelHeaderStackColIndices.has(ci)) return;
        if (predominantNonTotalLabelColIndices.has(ci)) return;
        if (isExactTotalOnlyLabel(cell, currentFileName)) s.add(ci);
      });
    });
    return s;
  }, [
    rows,
    footerRows,
    colWidths,
    resolvedLeafHeaders,
    lastHdr,
    rowLabelHeaderStackColIndices,
    predominantNonTotalLabelColIndices,
    currentFileName,
  ]);

  // hook 14
  const isSingleVisibleCol = useMemo(() => colWidths.filter((w) => w > 0).length <= 1, [colWidths]);

  // ── fullWidth: note-style tables (NOTE / BEHAVIOURAL ASSUMPTIONS) expand to 100% in any file ──
  const fullWidth = useMemo(
    () =>
      hasApp1A ||
      isAlcoLondonPartASplit ||
      isAlcoSierraLeoneMarketReview ||
      isSingleVisibleCol ||
      (isApp7B && !isBankRatesTable) ||
      isNoteTable ||
      isApp5ANotes ||
      isApp7ANotesComments ||
      isApp1AProseNarrative ||
      isMarketReviewTable,
    [hasApp1A, isAlcoLondonPartASplit, isAlcoSierraLeoneMarketReview, isSingleVisibleCol, isApp7B, isBankRatesTable, isNoteTable, isApp5ANotes, isApp7ANotesComments, isApp1AProseNarrative, isMarketReviewTable]
  );

  // hook 15
  const stickyOffsets = useMemo(() => {
    let acc = 0;
    return colWidths.map((w) => {
      const o = acc;
      acc += w;
      return o;
    });
  }, [colWidths]);

  // hook 16
  const colColors = useMemo(() => Array.from({ length: colCount }).map((_, i) => ENTERPRISE_COLORS[i % ENTERPRISE_COLORS.length]), [colCount]);

  // hooks 17-18
  const [sortIdx, setSortIdx] = useState(null);
  const [sortDir, setSortDir] = useState("asc");

  // hook 19
  const emptyIdxCols = useMemo(() => lastHdr.map((h, i) => emptyIdxCol(h, rows, i, footerRows)), [lastHdr, rows, footerRows]);

  // hook 20
  const filteredRows = useMemo(() => {
    let base = narrativeHeaderRows.length > 0 ? [...narrativeHeaderRows, ...rows] : rows;
    if (
      cleanTitle &&
      (isApp1AProseNarrative || isApp5ANotes || isApp7ANotesComments) &&
      Array.isArray(base)
    ) {
      base = base.filter((row) => !isDuplicateTableTitleProseRow(row, cleanTitle));
    }
    if (cleanTitle && isApp2AFile(currentFileName) && Array.isArray(base)) {
      base = base.filter((row) => !isDuplicateTableTitleProseRow(row, cleanTitle));
    }
    const q = normalizeSearchQuery(search);
    if (!q) return base;

    const cellHit = (c) => String(c ?? "").toLowerCase().includes(q);
    const rowHit = (r) => arr(r).some(cellHit);

    const anyHeader = headerRows.some((r) => Array.isArray(r) && r.some(cellHit));
    const anyFooter = footerRows.some((r) => Array.isArray(r) && r.some(cellHit));
    const titleHit =
      (title && String(title).toLowerCase().includes(q)) ||
      (widget?.title && String(widget.title).toLowerCase().includes(q));
    const groupHit = groupTitle && String(groupTitle).toLowerCase().includes(q);

    const filtered = base.filter(rowHit);
    if (filtered.length > 0) return filtered;
    if (anyHeader || anyFooter || titleHit || groupHit) return base;
    return filtered;
  }, [
    rows,
    narrativeHeaderRows,
    search,
    headerRows,
    footerRows,
    title,
    widget?.title,
    groupTitle,
    cleanTitle,
    isApp1AProseNarrative,
    isApp5ANotes,
    isApp7ANotesComments,
    currentFileName,
  ]);

    

  // hook 21
  const sortedRows = useMemo(() => {
    if (sortIdx === null) return filteredRows;
    if (hasApp2A && colCount === 4) {
      const isLeftSort = sortIdx <= 1;
      const halfOffset = isLeftSort ? 0 : 2;
      const halfSortIdx = sortIdx - halfOffset;
      const sortedIndices = [...Array(filteredRows.length).keys()].sort((ia, ib) => {
        const A = Array.isArray(filteredRows[ia]) ? filteredRows[ia][halfOffset + halfSortIdx] : null;
        const B = Array.isArray(filteredRows[ib]) ? filteredRows[ib][halfOffset + halfSortIdx] : null;
        const nA = parseFloat(String(A ?? "").replace(/,/g, ""));
        const nB = parseFloat(String(B ?? "").replace(/,/g, ""));
        if (!isNaN(nA) && !isNaN(nB)) return sortDir === "asc" ? nA - nB : nB - nA;
        return sortDir === "asc" ? String(A ?? "").localeCompare(String(B ?? "")) : String(B ?? "").localeCompare(String(A ?? ""));
      });
      return filteredRows.map((row, i) => {
        if (!Array.isArray(row)) return row;
        const sortedRow = filteredRows[sortedIndices[i]];
        if (isLeftSort) return [sortedRow[0], sortedRow[1], row[2], row[3]];
        return [row[0], row[1], sortedRow[2], sortedRow[3]];
      });
    }
    const secs = []; let cur = [];
    filteredRows.forEach((r) => {
      if (isSectionRow(r, { app2dLoose: isApp2dFile, app1AProse: isApp1AProseNarrative }) || checkIsSubTotalRow(r, currentFileName)) { if (cur.length) { secs.push({ d: true, rows: cur }); cur = []; } secs.push({ d: false, rows: [r] }); }
      else { cur.push(r); }
    });
    if (cur.length) secs.push({ d: true, rows: cur });
    return secs.flatMap((g) => {
      if (!g.d) return g.rows;
      return [...g.rows].sort((a, b) => {
        const A = Array.isArray(a) ? a[sortIdx] : a;
        const B = Array.isArray(b) ? b[sortIdx] : b;
        const nA = parseFloat(String(A ?? "").replace(/,/g, ""));
        const nB = parseFloat(String(B ?? "").replace(/,/g, ""));
        if (!isNaN(nA) && !isNaN(nB)) return sortDir === "asc" ? nA - nB : nB - nA;
        return sortDir === "asc" ? String(A ?? "").localeCompare(String(B ?? "")) : String(B ?? "").localeCompare(String(A ?? ""));
      });
    });
  }, [filteredRows, sortIdx, sortDir, hasApp2A, colCount, currentFileName, isApp2dFile, isApp1AProseNarrative]);

  /** Trailing tbody rows that are really footer summaries (API often puts TOTAL last in `rows`, not `footers`). */
  const trailingFooterLikeRowIndices = useMemo(() => {
    const indices = new Set();
    if (!Array.isArray(sortedRows)) return indices;
    for (let i = sortedRows.length - 1; i >= 0; i--) {
      const row = sortedRows[i];
      if (!isFooterLikeSummaryRow(row, currentFileName, colWidths)) break;
      indices.add(i);
    }
    return indices;
  }, [sortedRows, currentFileName, colWidths]);

  // hook 22
  const searchRe = useMemo(() => buildSearchRegex(search), [search]);

  // hooks 23-27
  const containerRef = useRef(null);
  const titleRef = useRef(null);
  const bScrollRef = useRef(null);
  const theadRef = useRef(null);
  const trackRef = useRef(null);
  const dragState = useRef(null);
  const [theadStickyHeight, setTheadStickyHeight] = useState(0);

  const [thumbLeft, setThumbLeft] = useState(0);
  const [thumbWidth, setThumbWidth] = useState(0);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const update = () => {
      const el = bScrollRef.current;
      const tr = trackRef.current;
      if (!el) return;
      const scrollMax = el.scrollWidth - el.clientWidth;
      const hasX = scrollMax > 0;
      setCanScroll(hasX);
      if (hasX && tr) {
        const trackW = tr.clientWidth || el.clientWidth;
        const tW = Math.max(40, trackW * (el.clientWidth / el.scrollWidth));
        const tL = (el.scrollLeft / scrollMax) * (trackW - tW);
        setThumbWidth(tW);
        setThumbLeft(tL);
      }
    };
    const t = setTimeout(update, 50);
    const ro = new ResizeObserver(update);
    if (bScrollRef.current) ro.observe(bScrollRef.current);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => { clearTimeout(t); ro.disconnect(); };
  }, [colWidths, totalW]);

  const onThumbMouseDown = useCallback((e) => {
    e.preventDefault();
    dragState.current = { startX: e.clientX, startLeft: bScrollRef.current?.scrollLeft ?? 0 };
    const onMove = (ev) => {
      if (!dragState.current || !bScrollRef.current || !trackRef.current) return;
      const dx = ev.clientX - dragState.current.startX;
      const trackW = trackRef.current.clientWidth;
      const scrollMax = bScrollRef.current.scrollWidth - bScrollRef.current.clientWidth;
      const ratio = scrollMax / (trackW - thumbWidth);
      bScrollRef.current.scrollLeft = Math.max(0, Math.min(scrollMax, dragState.current.startLeft + dx * ratio));
    };
    const onUp = () => { dragState.current = null; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [thumbWidth]);

  const onTrackClick = useCallback((e) => {
    if (!bScrollRef.current || !trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const trackW = trackRef.current.clientWidth;
    const scrollMax = bScrollRef.current.scrollWidth - bScrollRef.current.clientWidth;
    bScrollRef.current.scrollLeft = Math.max(0, Math.min(scrollMax, (clickX / trackW) * bScrollRef.current.scrollWidth));
  }, []);

  if (hasApp2A && isHiddenApp2ATable(cleanTitle)) return null;

  const hasData = sortedRows.length > 0;
  const minFS = TABLE_CONFIG.fontSize.body - 6;
  const maxFS = TABLE_CONFIG.fontSize.body + 10;

  const fmtVal = (hdr, v, ci) => {
    if (v == null || (typeof v === "number" && isNaN(v))) return "";
    if (String(v).trim() === "" || String(v).trim().toLowerCase() === "nan") return "";
    return String(v);
  };

  const containerWidth = fullWidth ? "100%" : isApp9MaturitiesTable ? "80%" : "fit-content";
  const tablePixelWidth = fullWidth || isApp9MaturitiesTable ? "100%" : `${totalW}px`;
  const tableMinWidth = fullWidth || isApp9MaturitiesTable ? (isApp9MaturitiesTable ? `${totalW}px` : "100%") : `${totalW}px`;
  const stretchMarketReviewCols = isMarketReviewTable && !isAlcoLondonPartASplit;
  const stretchApp5ANotesCols = isApp5ANotes;
  const stretchApp7ANotesCommentsCols = isApp7ANotesComments;
  const stretchApp1AProseCols = isApp1AProseNarrative;
  const stretchNoteProseCols =
    stretchMarketReviewCols ||
    stretchApp5ANotesCols ||
    stretchApp7ANotesCommentsCols ||
    stretchApp1AProseCols;
  const hideTheadForProseTable = useMemo(
    () =>
      (isApp7ANotesComments || isApp1AProseNarrative) &&
      (headerRows || []).every(
        (hr) =>
          Array.isArray(hr) &&
          hr.every((c) => c == null || String(c).trim() === "")
      ),
    [isApp7ANotesComments, isApp1AProseNarrative, headerRows]
  );

  useEffect(() => {
    if (hideTheadForProseTable) {
      setTheadStickyHeight(0);
      return undefined;
    }
    const el = theadRef.current;
    if (!el) {
      setTheadStickyHeight(0);
      return undefined;
    }
    const measure = () => setTheadStickyHeight(Math.ceil(el.getBoundingClientRect().height) || 0);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [headerRows, fontSize, colWidths, hideTheadForProseTable]);

  const colDim = (ci) => {
    if (colWidths[ci] === 0) return { width: 0, minWidth: 0, maxWidth: 0 };
    if (isAlcoLondonPartASplit && alcoLondonPartColIndices) {
      if (ci === alcoLondonPartColIndices.labelIdx) {
        const w = ALCO_LONDON_PART_LABEL_COL_WIDTH_PX;
        return { width: `${w}px`, minWidth: `${w}px`, maxWidth: `${w}px` };
      }
      if (ci === alcoLondonPartColIndices.textIdx) {
        return { width: "auto", minWidth: 0, maxWidth: "none" };
      }
    }
    if (stretchNoteProseCols) return { width: undefined, minWidth: 0, maxWidth: "none" };
    if (isApp9NarrativeTable && app9NarrativeColIdx != null && ci === app9NarrativeColIdx) {
      const w = APP_9_NARRATIVE_LAST_COL_WIDTH_PX;
      return { width: `${w}px`, minWidth: `${w}px`, maxWidth: `${w}px` };
    }
    return {
      width: `${colWidths[ci]}px`,
      minWidth: `${colWidths[ci]}px`,
      maxWidth: `${colWidths[ci]}px`,
    };
  };

  const tStyle = () => ({
    fontSize: `${fontSize}px`,
    fontFamily: TABLE_FONT_FAMILY,
    fontSynthesis: "none",
    width: tablePixelWidth,
    minWidth: tableMinWidth,
    tableLayout: "fixed",
    borderCollapse: "collapse",
  });

  const stickyBase = (ci, bg) => ci < freeze ? { position: "sticky", left: stickyOffsets[ci], zIndex: 10, backgroundColor: bg, boxShadow: ci === freeze - 1 ? "2px 0 4px -2px rgba(0,0,0,0.18)" : undefined } : {};

  const colAlign = (ci) => rightAlignCols.has(ci) ? "right" : "left";

  const cellBase = (ci, bg, border) => ({
    ...colDim(ci),
    boxSizing: "border-box", padding: "8px 12px",
    textAlign: colAlign(ci),
    backgroundColor: bg, lineHeight: "1.5",
    border: border || `2px solid ${BORDER_COLOR}`,
    verticalAlign: "middle",
    ...stickyBase(ci, bg),
  });

  const hdrCell = (ci, extra = {}) => ({
    ...colDim(ci),
    padding: "8px 12px",
    textAlign: "left",
    border: `2px solid ${BORDER_COLOR}`,
    fontSize: `${fontSize}px`,
    fontFamily: TABLE_FONT_FAMILY,
    fontSynthesis: "none",
    fontWeight: "700", color: "#fff", backgroundColor: colColors[ci],
    whiteSpace: "normal",
    wordBreak: "break-word",
    overflowWrap: "break-word",
    overflow: "hidden",
    lineHeight: "1.25",
    verticalAlign: "middle",
    boxSizing: "border-box",
    position: ci < freeze ? "sticky" : "relative",
    left: ci < freeze ? stickyOffsets[ci] : "auto",
    zIndex: ci < freeze ? 11 : 0,
    ...extra,
  });

  const bodyCell = (ci, bg, neg, bold, specialStyle, noWrap = false, fontWeightOverride = null) => ({
    ...cellBase(ci, specialStyle ? specialStyle.bg : bg, specialStyle ? specialStyle.border : null),
    fontSize: `${fontSize}px`,
    fontFamily: TABLE_FONT_FAMILY,
    fontSynthesis: "none",
    whiteSpace: noWrap ? "nowrap" : "normal",
    wordBreak: noWrap ? "normal" : "break-word",
    overflowWrap: noWrap ? "normal" : "break-word",
    overflow: "hidden", verticalAlign: "top",
    fontWeight: fontWeightOverride != null ? fontWeightOverride : (bold ? "700" : "400"),
    color: neg ? "#d62728" : "inherit",
    minHeight: "36px", padding: `${effectiveCfg.rowPadY ?? 8}px 12px`,
  });

  const ftCell = (ci, bg, neg, noWrap = false, boldOverride = true) => ({
    ...cellBase(ci, bg),
    fontWeight: !boldOverride
      ? "400"
      : (
        cleanTitle === "CUSTOMER DETAILS"
          ? "500"
          : cleanTitle === "MOVEMENT IN DOM DEPOSITS FOR THE WEEK (EUR)-100,000.00 AND ABOVE - OUTFLOWS"
            ? "500"
            : "700"
      ),
    fontSize: `${fontSize}px`,
    fontFamily: TABLE_FONT_FAMILY,
    fontSynthesis: "none",
    letterSpacing: "0.02em",
    padding: "12px 12px",
    whiteSpace: noWrap ? "nowrap" : "normal",
    wordBreak: noWrap ? "normal" : "break-word",
    overflowWrap: noWrap ? "normal" : "break-word",
    overflow: "visible", verticalAlign: "top",
    color: neg ? "#d62728" : "#000", minHeight: "44px",
    position: ci < freeze ? "sticky" : "relative",
    left: ci < freeze ? stickyOffsets[ci] : "auto",
    zIndex: ci < freeze ? 9 : 0,
  });

  if (!hasData && footerRows.length === 0 && isEmptyProseTableHeader(headerRows)) {
    return (
      <>
        {containsApp2cTdlZones(currentFileName) && <Metric />}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 20px", color: "#6b7280", fontSize: "16px", textAlign: "center", minHeight: "300px", fontWeight: 500 }}>
          No table entries
        </div>
      </>
    );
  }

  return (
    <>
      {/* {containsApp2cTdlZones(currentFileName) && cleanTitle === "ZONES" && <Metric />}
      {containsApp2cTdlZones(currentFileName) && cleanTitle === "HEAD OFFICE MONTH" && <MetricHeadOffice />} */}

      <div
        ref={containerRef}
        className={`doc-table-widget border border-gray-200 rounded-lg bg-white mt-6${isApp2dFile ? " zenith-app-2d-wrap" : ""}${isMarketReviewTable || isAlcoLondonPartASplit || isAlcoSierraLeoneMarketReview || isMarketReviewNarrativeTable || isAlcoSierraLeoneMarketReviewProseTable || isApp5ANotes || isApp7ANotesComments || isApp1AProseNarrative ? " zenith-market-review-full" : ""}${isAlcoLondonPartASplit ? " zenith-alco-london-split" : ""}${isAlcoSierraLeoneMovement ? " zenith-alco-sierra-movement" : ""}${isAlcoSierraLeoneMarketReview ? " zenith-alco-sierra-market-review" : ""}${(isMarketReviewNarrativeTable || isAlcoSierraLeoneMarketReviewProseTable) && !isAlcoSierraLeoneMarketReview ? " zenith-alco-sierra-market-review-prose" : ""}`}
        style={{ display: "flex", flexDirection: "column", color: "#222", width: containerWidth, maxWidth: "100%", height: isFullscreen ? "100%" : "auto", flex: isFullscreen ? 1 : "none", minHeight: 0, alignSelf: (isMarketReviewTable || isApp5ANotes || isApp7ANotesComments || isApp1AProseNarrative) ? "stretch" : undefined }}
      >
        <div ref={containerRef} className="doc-table-toolbar-row flex justify-between items-center px-3 py-1 gap-2 flex-shrink-0" style={{ width: "100%", minWidth: 0 }}>
          <div style={{ minWidth: 0, overflow: "hidden" }}>
            {displayTitle && !isAlcoSierraLeoneMarketReview && (
              <span ref={titleRef} className="bank-header-gradient whitespace-nowrap" style={{ fontSize: `${fontSize}px`, display: "inline-block" }}>
                {displayTitle}
              </span>
            )}
          </div>
          <div className="doc-table-font-controls flex items-center gap-2 flex-shrink-0">
            <button type="button" onClick={() => setInitializeFontSize((f) => Math.max(f - 1, minFS))} className="rounded border px-2 py-1 text-sm hover:bg-gray-100">A-</button>
            <span className="text-sm text-gray-600">{fontSize}px</span>
            <button type="button" onClick={() => setInitializeFontSize((f) => Math.min(f + 1, maxFS))} className="rounded border px-2 py-1 text-sm hover:bg-gray-100">A+</button>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", borderTop: "1px solid #e5e7eb", flex: isFullscreen ? 1 : "none", minHeight: 0 }}>

          {/* ── SCROLLBAR TRACK ── */}
          <div ref={trackRef} className="zenith-table-h-scroll-track" onClick={onTrackClick} style={{ position: "relative", width: "100%", height: 12, background: "#e8e8e8", borderBottom: "1px solid #d1d5db", flexShrink: 0, cursor: "pointer", userSelect: "none" }}>
            {canScroll && (
              <div
                onMouseDown={onThumbMouseDown}
                style={{ position: "absolute", top: 2, height: 8, left: `${thumbLeft}px`, width: `${thumbWidth}px`, background: "#999", borderRadius: 4, cursor: "grab", transition: "background 0.15s", minWidth: 40 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#555")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "#999")}
              />
            )}
          </div>

          {/* ── SINGLE SCROLL CONTAINER ── */}
          <div
            ref={bScrollRef}
            className="zenith-table-x-scroll"
            onScroll={(e) => {
              const el = e.currentTarget;
              const scrollMax = el.scrollWidth - el.clientWidth;
              if (scrollMax > 0 && trackRef.current) {
                const trackW = trackRef.current.clientWidth;
                const tW = Math.max(40, trackW * (el.clientWidth / el.scrollWidth));
                const tL = (el.scrollLeft / scrollMax) * (trackW - tW);
                setThumbLeft(tL);
                setThumbWidth(tW);
              }
            }}
            style={{
              overflowX: "auto",
              overflowY: "auto",
              width: "100%",
              maxHeight: !isFullscreen ? "65vh" : undefined,
              flex: isFullscreen ? 1 : undefined,
              height: isFullscreen ? 0 : undefined,
              minHeight: 0,
            }}
          >
            {isAlcoSierraLeoneMarketReview ? (
              <table
                className="zenith-table-renderer zenith-alco-sierra-market-review-table"
                style={{ ...tStyle(), tableLayout: "fixed", width: "100%" }}
              >
                <colgroup>
                  <col style={{ width: `${ALCO_LONDON_PART_LABEL_COL_WIDTH_PX}px` }} />
                  <col />
                </colgroup>
                <thead>
                  <tr>
                    <th className="alco-sierra-mr-part-label">{hl("A.", searchRe)}</th>
                    <th className="alco-sierra-mr-part-title">{hl(alcoSierraMarketReviewHeaderTitle, searchRe)}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="alco-sierra-mr-part-spacer" aria-hidden="true" />
                    <td className="alco-sierra-mr-prose">
                      {alcoSierraMarketReviewParagraphs.map((para, pi) => {
                        const bold = isAlcoSierraLeoneMarketReviewBoldParagraph(para);
                        return (
                          <p
                            key={pi}
                            className={bold ? "alco-sierra-mr-bold" : "alco-sierra-mr-normal"}
                            style={{
                              margin: pi === 0 ? 0 : "0.65em 0 0",
                              fontSize: `${fontSize}px`,
                              lineHeight: 1.45,
                              textAlign: "left",
                            }}
                          >
                            {hl(para, searchRe)}
                          </p>
                        );
                      })}
                    </td>
                  </tr>
                </tbody>
              </table>
            ) : (
            <table className="zenith-table-renderer" style={tStyle()}>
              <ColGroup
                widths={colWidths}
                stretch={stretchNoteProseCols}
                alcoLondonPartSplit={isAlcoLondonPartASplit}
                alcoPartLabelIdx={alcoLondonPartColIndices?.labelIdx ?? 0}
                alcoPartTextIdx={alcoLondonPartColIndices?.textIdx ?? 1}
              />

              {/* ── STICKY THEAD ── */}
              {!hideTheadForProseTable && (
              <thead ref={theadRef} style={{ position: "sticky", top: 0, zIndex: 20, background: "#fff" }}>
                {headerRows.map((hRow, ri) => {
                  const isLast = ri === headerRows.length - 1;
                  const skip = new Set();
                  const spanMap = {};
                  const isPfaSummaryWeekBandTheadRow =
                    pfaWeekBandRowIdx >= 0 &&
                    ri === pfaWeekBandRowIdx &&
                    (isApp4aPfaFixedCallDepositSummary(currentFileName, cleanTitle) ||
                      shouldNormalizeApp4aMainSummaryMatrix(headerRows, currentFileName, cleanTitle) ||
                      shouldNormalizeApp4bCurrencySummaryMatrix(headerRows, currentFileName, cleanTitle) ||
                      (String(currentFileName ?? "").toUpperCase().includes("APP 6A") &&
                        isApp6aPfaSummaryTitle(cleanTitle) &&
                        pfaLabelHeaderIdx >= 0));
                  const isPfaWeekBandDataRow = isPfaSummaryWeekBandTheadRow;
                  const isLeafHeaderTheadRow =
                    pfaLabelHeaderIdx >= 0 &&
                    (isApp4aPfaFixedCallDepositSummary(currentFileName, cleanTitle) ||
                      shouldNormalizeApp4aMainSummaryMatrix(headerRows, currentFileName, cleanTitle) ||
                      shouldNormalizeApp4bCurrencySummaryMatrix(headerRows, currentFileName, cleanTitle) ||
                      (String(currentFileName ?? "").toUpperCase().includes("APP 6A") &&
                        isApp6aPfaSummaryTitle(cleanTitle)))
                      ? ri === pfaLabelHeaderIdx
                      : isLast;
                  const canSpanThisTheadRow = !isLast || isPfaWeekBandDataRow;

                  if (canSpanThisTheadRow) {
                    let ci = 0;
                    while (ci < hRow.length) {
                      const v = hRow[ci];
                      if (v != null && String(v).trim() !== "") {
                        let span = 1, vw = colWidths[ci], ni = ci + 1;
                        while (ni < hRow.length) { const nv = hRow[ni]; if (nv != null && String(nv).trim() !== "") break; span++; vw += colWidths[ni]; skip.add(ni); ni++; }
                        spanMap[ci] = { span, vw }; ci = ni;
                      } else { ci++; }
                    }
                    if (isPfaWeekBandDataRow) {
                      for (let c = 0; c < hRow.length; c++) {
                        if (skip.has(c)) continue;
                        const t = String(hRow[c] ?? "").trim();
                        if (/\bcurrent\s+week\b/i.test(t) && c + 1 < hRow.length) {
                          spanMap[c] = { span: 2, vw: colWidths[c] + colWidths[c + 1] };
                          skip.add(c + 1);
                          delete spanMap[c + 1];
                        } else if (/\b(previous|last)\s+week\b/i.test(t) && c + 1 < hRow.length) {
                          spanMap[c] = { span: 2, vw: colWidths[c] + colWidths[c + 1] };
                          skip.add(c + 1);
                          delete spanMap[c + 1];
                        }
                      }
                      const secondBandIdx = hRow.findIndex((cell) =>
                        /\b(previous|last)\s+week\b/i.test(String(cell ?? "").trim())
                      );
                      if (secondBandIdx !== -1 && secondBandIdx + 2 < hRow.length) {
                        skip.delete(secondBandIdx + 2);
                        delete spanMap[secondBandIdx + 2];
                      }
                      /* Match label row: DESCRIPTION + spacer = colspan 2 so CURRENT/PREVIOUS sit under AMOUNT+WA. */
                      const labelLeafForWeek =
                        pfaLabelHeaderIdx >= 0 && pfaLabelHeaderIdx < headerRows.length
                          ? headerRows[pfaLabelHeaderIdx]
                          : null;
                      if (
                        Array.isArray(labelLeafForWeek) &&
                        labelLeafForWeek.length === 7 &&
                        isPfaFixedCallDepositLeafHeaderLayout(labelLeafForWeek) &&
                        hRow.length === 7
                      ) {
                        const z0 = String(hRow[0] ?? "").trim();
                        const z1 = String(hRow[1] ?? "").trim();
                        if (!z0 && !z1 && !skip.has(0)) {
                          spanMap[0] = { span: 2, vw: colWidths[0] + colWidths[1] };
                          skip.add(1);
                          delete spanMap[1];
                        }
                      }
                      if (
                        Array.isArray(labelLeafForWeek) &&
                        labelLeafForWeek.length === 6 &&
                        isApp6aPfaSummaryLeafTwoBandLayout(labelLeafForWeek) &&
                        hRow.length === 6 &&
                        !/^difference$/i.test(String(labelLeafForWeek[5] ?? "").trim())
                      ) {
                        const z0 = String(hRow[0] ?? "").trim();
                        const z1 = String(hRow[1] ?? "").trim();
                        if (!z0 && !z1 && !skip.has(0)) {
                          spanMap[0] = { span: 2, vw: colWidths[0] + colWidths[1] };
                          skip.add(1);
                          delete spanMap[1];
                        }
                      }
                      if (
                        Array.isArray(labelLeafForWeek) &&
                        labelLeafForWeek.length === 7 &&
                        isApp6aPfaSummaryLeafTwoBandLayout(labelLeafForWeek) &&
                        hRow.length === 7
                      ) {
                        const z0 = String(hRow[0] ?? "").trim();
                        const z1 = String(hRow[1] ?? "").trim();
                        if (!z0 && !z1 && !skip.has(0)) {
                          spanMap[0] = { span: 2, vw: colWidths[0] + colWidths[1] };
                          skip.add(1);
                          delete spanMap[1];
                        }
                      }
                    }
                  }
                  return (
                    <tr
                      key={ri}
                      className={isPfaWeekBandDataRow ? "zenith-pfa-week-band-row" : undefined}
                      style={{ fontSize: `${fontSize}px`, fontFamily: TABLE_FONT_FAMILY, fontSynthesis: "none" }}
                    >
                      {isApp7B && !isBankRatesTable ? (
                        <th colSpan={hRow.length} style={{ width: "100%", padding: "10px 16px", textAlign: currentFileName?.includes("APP 3") ? "center" : "left", backgroundColor: "#3a3a3a", color: "#fff", fontWeight: "700", fontSize: `${fontSize}px`, fontFamily: TABLE_FONT_FAMILY, fontSynthesis: "none", border: `2px solid ${BORDER_COLOR}`, whiteSpace: "normal", wordBreak: "break-word", overflowWrap: "break-word", lineHeight: "1.4", boxSizing: "border-box", verticalAlign: "middle" }}>
                          {hRow.find((h) => h != null && String(h).trim() !== "") ?? ""}
                        </th>
                      ) : isTheadBannerRow(hRow, headerRows, ri) ? (
                        <th
                          colSpan={visibleColCount || hRow.length}
                          className={hasApp1A ? undefined : "zenith-thead-banner-row"}
                          style={{
                            width: "100%",
                            padding: hasApp1A ? "10px 16px" : "6px 12px",
                            textAlign: "left",
                            backgroundColor: "#fff",
                            color: hasApp1A ? "#000" : SECTION_SUBHEADER_COLOR,
                            fontWeight: hasApp1A ? "700" : 400,
                            fontSize: `${hasApp1A ? fontSize : Math.round(fontSize * SECTION_SUBHEADER_FONT_EM)}px`,
                            fontFamily: TABLE_FONT_FAMILY,
                            fontSynthesis: "none",
                            border: `2px solid ${BORDER_COLOR}`,
                            whiteSpace: "normal",
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                            lineHeight: hasApp1A ? "1.4" : 1.35,
                            boxSizing: "border-box",
                            verticalAlign: "middle",
                            letterSpacing: hasApp1A ? "0.01em" : "0.03em",
                          }}
                        >
                          {hl(String(hRow.find((c) => c != null && String(c).trim() !== "") ?? ""), searchRe)}
                        </th>
                      ) : (
                        visibleColIndices.map((ci) => {
                          const h = hRow[ci];
                          if (skip.has(ci)) return null;
                          if (colWidths[ci] === 0) return null;
                          const sortable = isLeafHeaderTheadRow && !emptyIdxCols[ci] && !hasApp1A && !hasApp1B;
                          const raw = String(h ?? "");
                          const percentileSpacerHdr =
                            isApp6APercentileTopDepositors && isApp6APercentileSpacerCol(lastHdr, ci);
                          const totalLeafHeaderBold =
                            (isLeafHeaderTheadRow &&
                              (isTotalCol(normalizeLeafHeaderLabel(raw)) ||
                                isSubTotalCol(raw) ||
                                (hasApp10B && isApp10bTotalBalsUsdCol(raw)) ||
                                (isApp2dFile && app2dSumTotalZonesColIndices.has(ci)))) ||
                            (isApp2dFile && isApp2dSumTotalZonesLabel(raw));
                          const htxt = percentileSpacerHdr
                            ? ""
                            : isLeafHeaderTheadRow && pctCols.has(ci) && !raw.includes("(%)")
                              ? `${raw} `
                              : raw;
                          const sp = canSpanThisTheadRow ? spanMap[ci] : null;
                          const swStyle = sp?.span > 1 ? { width: `${sp.vw}px`, minWidth: `${sp.vw}px`, maxWidth: `${sp.vw}px`, textAlign: "center" } : {};
                          const emStyle =
                            isPfaWeekBandDataRow && !htxt
                              ? { backgroundColor: "#1a1a1a" }
                              : canSpanThisTheadRow && !htxt
                                ? { backgroundColor: "#1a1a1a", borderBottom: `1px solid ${BORDER_COLOR}` }
                                : {};
                          const isNarrativeSpan = canSpanThisTheadRow && sp?.span > 1 && htxt.length > 60;
                          const isSubheaderNarrativeSpan =
                            !hasApp1A && isNarrativeSpan && isTheadTableSubtitleText(htxt);
                          if (isSubheaderNarrativeSpan) {
                            return (
                              <th
                                key={ci}
                                colSpan={sp.span}
                                className="zenith-thead-banner-row"
                                style={{
                                  width: `${sp.vw}px`,
                                  minWidth: `${sp.vw}px`,
                                  maxWidth: `${sp.vw}px`,
                                  padding: "6px 12px",
                                  textAlign: "left",
                                  backgroundColor: "#fff",
                                  color: SECTION_SUBHEADER_COLOR,
                                  fontWeight: 400,
                                  fontSize: `${Math.round(fontSize * SECTION_SUBHEADER_FONT_EM)}px`,
                                  fontFamily: TABLE_FONT_FAMILY,
                                  fontSynthesis: "none",
                                  border: `2px solid ${BORDER_COLOR}`,
                                  whiteSpace: "normal",
                                  wordBreak: "break-word",
                                  overflowWrap: "break-word",
                                  lineHeight: 1.35,
                                  boxSizing: "border-box",
                                  verticalAlign: "middle",
                                  letterSpacing: "0.03em",
                                }}
                              >
                                {hl(String(htxt ?? ""), searchRe)}
                              </th>
                            );
                          }
                          if (isNarrativeSpan && !isTheadBannerRow(hRow, headerRows, ri)) {
                            const isApp3 = !!currentFileName?.includes("APP 3");
                            const isApp3MaxCumHeader =
                              isApp3 &&
                              /^maximum\s+cumulative\s+outflow\/inflow\s+\(local\s+currency\)\s+report\s+@\s+/i.test(String(htxt ?? "").trim());
                            return (
                              <th key={ci} colSpan={sp.span} style={{ width: `${sp.vw}px`, minWidth: `${sp.vw}px`, maxWidth: `${sp.vw}px`, padding: "10px 16px", textAlign: isApp3 ? "center" : "left", backgroundColor: "#fff", color: "#000", fontWeight: "400", fontSize: `${fontSize}px`, fontFamily: TABLE_FONT_FAMILY, fontSynthesis: "none", border: `2px solid ${BORDER_COLOR}`, whiteSpace: "normal", wordBreak: "break-word", overflowWrap: "break-word", lineHeight: "1.4", boxSizing: "border-box", verticalAlign: "middle" }}>
                                {isApp3MaxCumHeader ? (
                                  <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
                                    <span style={{ textAlign: "center", fontSize: `${Math.round(fontSize * APP_3_MAX_CUM_HEADER_FONT_MULT)}px`, fontWeight: 700, lineHeight: 1.2 }}>
                                      {hl(String(htxt ?? ""), searchRe)}
                                    </span>
                                  </div>
                                ) : (
                                  renderCell(htxt, searchRe, false, false, false)
                                )}
                              </th>
                            );
                          }
                          const isRegIndCol = isRegulatoryIndustryCol(String(h ?? ""));
                          const useGroupedSubHeaderBg =
                            isLeafHeaderTheadRow && headerRows.length >= 2 && !isApp6APercentileTopDepositors;
                          const groupHdrBg = isApp6APercentileTopDepositors && isLeafHeaderTheadRow
                            ? APP_6A_PERCENTILE_LEAF_BG
                            : useGroupedSubHeaderBg
                              ? ENTERPRISE_COLORS[getParentHeaderColIndex(headerRows, ci) % ENTERPRISE_COLORS.length]
                              : undefined;
                          const nowrapRegulatorySubgroup =
                            isLeafHeaderTheadRow &&
                            headerRows.length >= 2 &&
                            /^regulatory\s*%$/i.test(String(raw ?? "").trim());
                          const nowrapCustomerNameHdr = isLeafHeaderTheadRow && isCustomerNameColHdr(raw);
                          const nowrapDateHeader = isLeafHeaderTheadRow && isDateLikeToken(htxt);
                          const nowrapApp2aNairaMnHdr =
                            hasApp2A && isLeafHeaderTheadRow && isApp2aDateNairaMnHeader(htxt);
                          const netInflowOutflowHdr = isNetInflowOutflowText(raw) || isNetInflowOutflowText(htxt);
                          const isPfaWeekMergedLabelTh =
                            isPfaWeekBandDataRow &&
                            (sp?.span ?? 0) >= 2 &&
                            (/\bcurrent\s+week\b/i.test(String(raw ?? "").trim()) ||
                              /\bprevious\s+week\b/i.test(String(raw ?? "").trim()) ||
                              /\blast\s+week\b/i.test(String(raw ?? "").trim()));
                          const pfaWeekMergedLabelStyle = isPfaWeekMergedLabelTh
                            ? {
                                textAlign: "center",
                                whiteSpace: "nowrap",
                                wordBreak: "normal",
                                overflowWrap: "normal",
                                overflow: "visible",
                              }
                            : {};
                          const pfaWeekBandLabelLeaf =
                            pfaLabelHeaderIdx >= 0 && pfaLabelHeaderIdx < headerRows.length
                              ? headerRows[pfaLabelHeaderIdx]
                              : null;
                          const isPfaWeekBandDiffHyphenTh =
                            isPfaWeekBandDataRow &&
                            Array.isArray(pfaWeekBandLabelLeaf) &&
                            ci < pfaWeekBandLabelLeaf.length &&
                            /^difference$/i.test(String(pfaWeekBandLabelLeaf[ci] ?? "").trim()) &&
                            /^-+$/.test(String(raw ?? "").trim());
                          const pfaWeekBandDiffHyphenStyle = isPfaWeekBandDiffHyphenTh ? { textAlign: "center" } : {};

                          return (
                            <th
                              key={ci}
                              className={
                                [nowrapCustomerNameHdr && "th-customer-name-nowrap", isPfaWeekMergedLabelTh && "zenith-pfa-week-band-merged"]
                                  .filter(Boolean)
                                  .join(" ") || undefined
                              }
                              colSpan={sp?.span > 1 ? sp.span : undefined}
                              onClick={() => { if (!sortable) return; sortIdx === ci ? setSortDir((d) => (d === "asc" ? "desc" : "asc")) : (setSortIdx(ci), setSortDir("asc")); }}
                              style={hdrCell(ci, {
                                cursor: sortable ? "pointer" : "default",
                                userSelect: "none",
                                ...(!isLast && !htxt ? { padding: "0", lineHeight: "0" } : {}),
                                ...swStyle,
                                ...emStyle,
                                ...(groupHdrBg ? { backgroundColor: groupHdrBg } : {}),
                                ...(isApp6APercentileTopDepositors && isLeafHeaderTheadRow
                                  ? { color: "#000", fontWeight: "700" }
                                  : {}),
                                ...(nowrapRegulatorySubgroup
                                  ? { whiteSpace: "nowrap", wordBreak: "normal", overflowWrap: "normal" }
                                  : {}),
                                ...(nowrapCustomerNameHdr
                                  ? { whiteSpace: "nowrap", wordBreak: "normal", overflowWrap: "normal" }
                                  : {}),
                                ...(nowrapDateHeader
                                  ? { whiteSpace: "nowrap", wordBreak: "normal", overflowWrap: "normal" }
                                  : {}),
                                ...(nowrapApp2aNairaMnHdr
                                  ? { whiteSpace: "nowrap", wordBreak: "normal", overflowWrap: "normal" }
                                  : {}),
                                ...(netInflowOutflowHdr ? { fontWeight: 900 } : {}),
                                ...(totalLeafHeaderBold ? { fontWeight: 900 } : {}),
                                ...(isRegIndCol ? { whiteSpace: "normal", wordBreak: "break-word", lineHeight: "1.4", verticalAlign: "top" } : {}),
                                ...pfaWeekMergedLabelStyle,
                                ...pfaWeekBandDiffHyphenStyle,
                              })}
                            >
                              {isRegIndCol ? (
                                <RegulatoryIndustryLabel text={htxt} />
                              ) : isPfaWeekMergedLabelTh ? (
                                <span style={{ display: "inline-block", width: "100%", textAlign: "center" }}>{htxt}</span>
                              ) : isPfaWeekBandDiffHyphenTh ? (
                                <span style={{ display: "inline-block", width: "100%", textAlign: "center" }}>{htxt}</span>
                              ) : (
                                nowrapApp2aNairaMnHdr
                                  ? htxt.replace(
                                      /\s*\(\s*N\s*[''′]?\s*Mn\s*\)\s*$/i,
                                      "\u00a0(N'Mn)"
                                    )
                                  : htxt
                              )}
                              {sortable && sortIdx === ci && (
                                <span style={{ marginLeft: 4 }}>{sortDir === "asc" ? "↑" : "↓"}</span>
                              )}
                            </th>
                          );
                        })
                      )}
                    </tr>
                  );
                })}
              </thead>
              )}

              {/* ── TBODY ── */}
              <tbody>
                {!hasData ? (
                  <tr><td colSpan={visibleColCount} style={{ textAlign: "center", padding: "24px", color: "#aaa", fontStyle: "italic" }}>{search ? `No results found for "${search}"` : "No data available"}</td></tr>
                ) : (
                  sortedRows.map((row, ri) => {
                    let secRow = isSectionRow(row, {
                      app2dLoose: isApp2dFile,
                      app1AProse: isApp1AProseNarrative,
                    });
                    if (!secRow && !hasApp1A && Array.isArray(row)) {
                      const nn = row.filter((c) => c != null && String(c).trim() !== "");
                      if (nn.length === 1 && row[0] != null && isSectionSubheaderText(row[0])) secRow = true;
                    }
                    if (secRow && hasApp5A && (isApp5AVolumeBandTable(cleanTitle, lastHdr) || rowHasDataBeyondFirstColumn(row))) {
                      secRow = false;
                    }
                    if (secRow && isAlcoSierraLeoneMovement) {
                      secRow = false;
                    }
                    /** APP 7B numbered narrative (e.g. "1. In the week under review…") — not a subtitle band. */
                    if (secRow && isApp7B && isNumberedItem(String(row[0] ?? "").trim())) {
                      secRow = false;
                    }
                    const subTot = checkIsSubTotalRow(row, currentFileName);
                    const cellIsBodySummaryTotalLabelScoped = (cell) => cellIsBodySummaryTotalLabel(cell, currentFileName);
                    const rowIsTotalDataRowScoped = (r, sRow) => {
                      if (sRow || !Array.isArray(r)) return false;
                      return r.some((cell) => cellIsBodySummaryTotalLabelScoped(cell));
                    };
                    const rowHasBodySummaryTotalInLabelColumnsScoped = (r) => {
                      if (!Array.isArray(r)) return false;
                      const loose = { app2dLoose: !!isApp2dFile };
                      return r.some((cell, ci) => {
                        if (!colWidths || colWidths[ci] === 0) return false;
                        if (rightAlignCols && rightAlignCols.has(ci)) return false;
                        const leaf = String((resolvedLeafHeaders?.[ci] ?? lastHdr?.[ci]) ?? "").trim();
                        if (leaf && isTotalMetricColumnHeader(leaf)) return false;
                        if (leaf && isMoneyColumnHeader(leaf, loose)) return false;
                        return cellIsBodySummaryTotalLabelScoped(cell);
                      });
                    };
                    /** APP 3 only — tbody TOTAL / GRAND TOTAL / SUB TOTAL row bold; all other files use tfoot. */
                    const summaryTotalBodyBold =
                      hasApp3 &&
                      !isNoteStyleTable &&
                      (isApp2bFile
                        ? rowHasBodySummaryTotalInLabelColumnsScoped(row)
                        : rowHasBodySummaryTotalInLabelColumns(row, colWidths, rightAlignCols, (ci) => resolvedLeafHeaders[ci] ?? lastHdr[ci], isApp2dFile, currentFileName));
                    /** Exceptions — these summary labels may live in tbody (e.g. APP 2B / APP 6A tables). */
                    const labelColCtx = [
                      row,
                      colWidths,
                      rightAlignCols,
                      (ci) => resolvedLeafHeaders[ci] ?? lastHdr[ci],
                      isApp2dFile,
                    ];
                    const totalDepositLiabilityBodyBold =
                      !isNoteStyleTable && rowHasTotalDepositLiabilityInLabelColumns(...labelColCtx);
                    const totalLcyLiabilitiesBodyBold =
                      hasApp3 &&
                      !isNoteStyleTable &&
                      rowHasSummaryLabelAnywhere(row, colWidths, isTotalLcyLiabilitiesLabel);
                    const totalLcyAssetsBodyBold =
                      hasApp3 &&
                      !isNoteStyleTable &&
                      rowHasSummaryLabelAnywhere(row, colWidths, isTotalLcyAssetsLabel);
                    const app3InflowOutflowBand =
                      hasApp3 && !isNoteStyleTable && rowIsApp3InflowOutflowBand(row, colWidths);
                    const app3InflowOutflowBodyBold = app3InflowOutflowBand;
                    const riskAssetsBodyBold =
                      isApp2bFile &&
                      !isNoteStyleTable &&
                      (rowHasRiskAssetsInLabelColumns(...labelColCtx) ||
                        rowHasSummaryLabelAnywhere(row, colWidths, isRiskAssetsLabel));
                    const sumTotalBodyBold =
                      !isNoteStyleTable &&
                      (rowHasSumTotalInLabelColumns(...labelColCtx, currentFileName) ||
                        rowHasSummaryLabelAnywhere(row, colWidths, (cell) =>
                          isSumTotalLabelForFile(cell, currentFileName)
                        ));
                    /** Last tbody row(s) with TOTAL / SUB TOTAL / … — treat like tfoot when API omits `footers`. */
                    const trailingFooterTotalBodyBold =
                      !isNoteStyleTable && trailingFooterLikeRowIndices.has(ri);
                    const bodyRowSummaryBold =
                      !isApp4aSummaryTable &&
                      !isApp1AReviewOutlookBody &&
                      (summaryTotalBodyBold ||
                        totalDepositLiabilityBodyBold ||
                        totalLcyLiabilitiesBodyBold ||
                        totalLcyAssetsBodyBold ||
                        app3InflowOutflowBodyBold ||
                        riskAssetsBodyBold ||
                        sumTotalBodyBold ||
                        trailingFooterTotalBodyBold);

                    // APP 7A NOTES/COMMENTS: numbered headings like "3) Available …" should behave like section rows
                    // (same size/weight as "1)Net …" / "2)Required …"), even when there's a space after ')'.
                    if (hasApp7A && !secRow && isFullSpanTextRow(row)) {
                      const t0 = String(row?.[0] ?? "").trim();
                      if (/^\d+\)\s*\S/.test(t0)) secRow = true;
                    }

                    const netInflowRow = rowContainsNetInflowOutflow(row);
                    const isDataTotalRow = isApp2bFile ? rowIsTotalDataRowScoped(row, secRow) : rowIsTotalDataRow(row, secRow, currentFileName);
                    const totalishBody = isDataTotalRow || subTot;
                    /** APP 3 only — same tbody TOTAL emphasis as other files’ tfoot (APP 6A totals stay plain in tbody). */
                    const app6ADataTotalEmphasis = hasApp3 && isApp6A && isDataTotalRow;
                    // Net-inflow emphasis only when not a broad total-style row (summary TOTAL / GRAND TOTAL / SUB TOTAL rows use `summaryTotalBodyBold` instead).
                    const bold = isNoteStyleTable ? false : (!totalishBody && netInflowRow && !isApp2dFile);
                    const specialStyle = getSpecialRowStyle(row, currentFileName);
                    const inlineHdr = isApp7B && isInlineHeaderRow(row);

                    // APP 5A Notes / APP 7A NOTES/COMMENTS / APP 1A prose — full-width rows.
                    if (
                      (isApp5ANotes || isApp7ANotesComments || isApp1AProseNarrative) &&
                      !secRow &&
                      isFullSpanTextRow(row)
                    ) {
                      return (
                        <tr key={ri}>
                          <td
                            colSpan={visibleColCount || 1}
                            style={{
                              padding: `${effectiveCfg.rowPadY ?? 8}px 12px`,
                              fontWeight: "400",
                              fontSize: `${fontSize}px`,
                              color: "#000",
                              backgroundColor: ri % 2 === 0 ? "#fafafa" : "#fff",
                              border: `2px solid ${BORDER_COLOR}`,
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                              lineHeight: "1.6",
                            }}
                          >
                            {renderCell(row[0], searchRe, fullWidth, false, true)}
                          </td>
                        </tr>
                      );
                    }

                    // ── BEHAVIOURAL ASSUMPTIONS: borderless note rows ─────────────────────
                    // Rows where only col 0 has content (cols 1+ are empty) become a clean
                    // full-width note block with no cell borders.
                    if (isBehaviouralAssumptions && !secRow && isBehavAssumptionNoteRow(row)) {
                      return (
                        <tr key={ri}>
                          <td
                            colSpan={visibleColCount || 1}
                            style={{
                              padding: "10px 14px",
                              fontWeight: "400",
                              fontSize: `${fontSize}px`,
                              color: "#333",
                              backgroundColor: "#fff",
                              border: "none",
                              borderBottom: "1px solid #e5e7eb",
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                              lineHeight: "1.6",
                            }}
                          >
                            {renderCell(row[0], searchRe, false, false, true)}
                          </td>
                        </tr>
                      );
                    }

                    // APP 4B: "Week Ending …" rows are in-table section headers (bold, full span).
                    if (isApp4B && isApp4bWeekEndingRow(row, currentFileName)) {
                      const weekEndingLabel = getApp4bWeekEndingLabel(row);
                      return (
                        <tr key={ri}>
                          <td
                            colSpan={visibleColCount || 1}
                            style={{
                              padding: "8px 12px",
                              fontWeight: "700",
                              fontSize: "1.3em",
                              color: "#000",
                              backgroundColor: "#fff",
                              border: `2px solid ${BORDER_COLOR}`,
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                              overflowWrap: "break-word",
                              lineHeight: "1.5",
                              letterSpacing: "0.01em",
                              position: "sticky",
                              top: 0,
                              left: 0,
                              zIndex: 5,
                            }}
                          >
                            {renderCell(weekEndingLabel, searchRe, false, false, true)}
                          </td>
                        </tr>
                      );
                    }

                    // ── Section rows ─────────────────────────────────────────────────────
                    if (secRow) {
                      const sectionId = makeSectionRowId(cleanTitle, String(row[0] ?? ""));

                      // BEHAVIOURAL ASSUMPTIONS: section rows also render borderless
                      if (isBehaviouralAssumptions) {
                        return (
                          <tr key={ri} id={sectionId}>
                            <td
                            colSpan={visibleColCount || 1}
                            style={{
                                padding: "14px 14px 6px 14px",
                                fontWeight: "600",
                                fontSize: `${fontSize}px`,
                                color: "#111",
                                backgroundColor: "#fff",
                                border: "none",
                                borderTop: "2px solid #e5e7eb",
                                borderBottom: "1px solid #e5e7eb",
                                whiteSpace: "normal",
                                wordBreak: "break-word",
                                overflowWrap: "break-word",
                                lineHeight: "1.5",
                              }}
                            >
                              {renderCell(row[0], searchRe, false, false, true)}
                            </td>
                          </tr>
                        );
                      }

                      // All other files: subtitle bands vs legacy section rows
                      const sectionText = String(row[0] ?? "");
                      const isSubtitleBand =
                        !hasApp1A &&
                        isSectionSubheaderText(sectionText) &&
                        !(isApp7B && isNumberedItem(sectionText.trim()));

                      if (isSubtitleBand) {
                        const sectionFw =
                          isNoteStyleTable ? "400" : bodyRowSummaryBold ? "700" : "400";
                        const sectionFontMult =
                          isNoteTable && currentFileName?.includes("APP 11A") ? 1.0 : SECTION_SUBHEADER_FONT_EM;
                        /** Match thead banner px sizing so APP 2D (and others) week-under-review bands stay consistent. */
                        const sectionFontPx = Math.round(fontSize * sectionFontMult);
                        return (
                          <tr key={ri} id={sectionId} className="zenith-section-subheader-row">
                            <td colSpan={visibleColCount || 1} style={{ padding: "6px 12px", fontWeight: sectionFw, fontSize: `${sectionFontPx}px`, color: SECTION_SUBHEADER_COLOR, backgroundColor: specialStyle ? specialStyle.bg : "#fff", borderTop: specialStyle ? specialStyle.border : `2px solid ${BORDER_COLOR}`, borderRight: specialStyle ? specialStyle.border : `2px solid ${BORDER_COLOR}`, borderLeft: specialStyle ? specialStyle.border : `2px solid ${BORDER_COLOR}`, borderBottom: specialStyle ? specialStyle.border : `2px solid ${BORDER_COLOR}`, whiteSpace: "normal", wordBreak: "break-word", overflowWrap: "break-word", letterSpacing: "0.03em", ...({ position: "sticky", top: hasApp3 ? theadStickyHeight : 0, left: 0, zIndex: 15 }) }}>
                              {renderCell(row[0], searchRe, false, isNoteStyleTable, true)}
                            </td>
                          </tr>
                        );
                      }

                      const sectionFw =
                        isNoteStyleTable ? "400" : bodyRowSummaryBold ? "700" : /total/i.test(sectionText) ? "400" : "700";
                      const sectionFontEm =
                        isNoteTable && currentFileName?.includes("APP 11A")
                          ? 1.0
                          : currentFileName?.includes("APP 8") && isApp8SmallSectionBannerRow(row)
                            ? APP_8_QUARTER_SECTION_FONT_EM
                            : currentFileName?.includes("APP 9") && isApp9SmallSectionBannerRow(row)
                              ? APP_9_MONTH_SECTION_FONT_EM
                              : currentFileName?.includes("APP 1B")
                                ? 0.9
                                : currentFileName?.includes("APP 2A")
                                  ? 0.9
                                  : 1.3;
                      return (
                        <tr key={ri} id={sectionId}>
                          <td colSpan={visibleColCount || 1} style={{ padding: "8px 12px", fontWeight: sectionFw, fontSize: `${sectionFontEm}em`, color: "#000", backgroundColor: specialStyle ? specialStyle.bg : "#fff", borderTop: specialStyle ? specialStyle.border : `2px solid ${BORDER_COLOR}`, borderRight: specialStyle ? specialStyle.border : `2px solid ${BORDER_COLOR}`, borderLeft: specialStyle ? specialStyle.border : `2px solid ${BORDER_COLOR}`, borderBottom: specialStyle ? specialStyle.border : `2px solid ${BORDER_COLOR}`, whiteSpace: "normal", wordBreak: "break-word", overflowWrap: "break-word", letterSpacing: "0.01em", ...({ position: "sticky", top: hasApp3 ? theadStickyHeight : 0, left: 0, zIndex: 15 }) }}>
                            {renderCell(row[0], searchRe, false, isNoteStyleTable, true)}
                          </td>
                        </tr>
                      );
                    }

                    const nn7b = isApp7B && Array.isArray(row) ? row.filter((c) => c != null && String(c).trim() !== "") : null;
                    const isFullSpanRow = isApp7B && nn7b && nn7b.length === 1 && row[0] != null && String(row[0]).trim() !== "";
                    if (isFullSpanRow) {
                      const t = String(row[0]).trim();
                      const isSubHeading = /^[A-Z][A-Z\s&/():-]{1,}$/.test(t) && t.length <= 80;
                      const isNumberedListItem = isNumberedItem(t);
                      const spanFw =
                        isNoteStyleTable ? "400" : bodyRowSummaryBold ? "700" : isSubHeading && !/total/i.test(t) ? "700" : "400";
                      return (
                        <tr key={ri}>
                          <td colSpan={visibleColCount || 1} style={{ padding: `${effectiveCfg.rowPadY ?? 8}px 12px`, fontWeight: spanFw, fontSize: isSubHeading ? "1.1em" : isNumberedListItem ? `${fontSize}px` : "1em", color: "#000", backgroundColor: ri % 2 === 0 ? "#fafafa" : "#fff", border: `2px solid ${BORDER_COLOR}`, whiteSpace: "normal", wordBreak: "break-word", overflowWrap: "break-word", lineHeight: "1.6" }}>
                            {renderCell(row[0], searchRe, false, isNoteStyleTable, true)}
                          </td>
                        </tr>
                      );
                    }

                    // APP 7A: numbered subheadings like "1) …", "2) …", "3) …" should be bold when they are full-span rows.
                    if (hasApp7A && isFullSpanTextRow(row)) {
                      const t = String(row[0] ?? "").trim();
                      const isNumberedSubHeading = /^\d+\)\s*\S/.test(t);
                      if (isNumberedSubHeading) {
                        return (
                          <tr key={ri}>
                            <td
                              colSpan={visibleColCount || 1}
                              style={{
                                padding: `${effectiveCfg.rowPadY ?? 8}px 12px`,
                                fontWeight: isNoteStyleTable ? "400" : "700",
                                fontSize: "1.1em",
                                color: "#000",
                                backgroundColor: ri % 2 === 0 ? "#fafafa" : "#fff",
                                border: `2px solid ${BORDER_COLOR}`,
                                whiteSpace: "normal",
                                wordBreak: "break-word",
                                overflowWrap: "break-word",
                                lineHeight: "1.6",
                              }}
                            >
                              {renderCell(row[0], searchRe, false, isNoteStyleTable, true)}
                            </td>
                          </tr>
                        );
                      }
                    }

                    // MARKET REVIEW narrative — one row per paragraph; only budget sentence bold.
                    if (
                      isMarketReviewNarrativeTable &&
                      !isAlcoSierraLeoneMarketReview &&
                      alcoPartColIndices &&
                      Array.isArray(row) &&
                      !secRow
                    ) {
                      const { textIdx } = alcoPartColIndices;
                      const proseText = String(row[textIdx] ?? "").trim();
                      if (proseText.length > 0) {
                        const proseBold = isAlcoSierraLeoneMarketReviewBoldParagraph(proseText);
                        return (
                          <tr key={ri} className="alco-sierra-mr-prose-row">
                            <td
                              colSpan={visibleColCount || 1}
                              className={`alco-sierra-mr-prose-cell${proseBold ? " alco-sierra-mr-prose-cell--bold" : ""}`}
                              style={{
                                padding: `${effectiveCfg.rowPadY ?? 8}px 12px`,
                                fontWeight: proseBold ? 700 : 400,
                                fontSize: `${fontSize}px`,
                                fontFamily: TABLE_FONT_FAMILY,
                                fontSynthesis: "none",
                                color: "#000",
                                backgroundColor: ri % 2 === 0 ? "#fafafa" : "#fff",
                                border: `2px solid ${BORDER_COLOR}`,
                                whiteSpace: "normal",
                                wordBreak: "break-word",
                                overflowWrap: "break-word",
                                lineHeight: 1.45,
                                textAlign: "left",
                              }}
                            >
                              <span
                                className={proseBold ? "alco-sierra-mr-prose-bold" : "alco-sierra-mr-prose-normal"}
                                style={{ fontWeight: proseBold ? 700 : 400 }}
                              >
                                {hl(proseText, searchRe)}
                              </span>
                            </td>
                          </tr>
                        );
                      }
                    }

                    return (
                      <tr key={ri}>
                        {visibleColIndices.map((ci) => {
                          const hdr = lastHdr[ci];
                          if (colWidths[ci] === 0) return null;
                          const raw = Array.isArray(row) ? row[ci] : null;
                          const leafHdr = resolvedLeafHeaders[ci] ?? String(hdr ?? "").trim();
                          const bBg = "#d0d0d0";
                          const nBg = "#e8e8e8";
                          const bg = isApp2bcFile && !specialStyle
                            ? getApp2bcBodyColumnBg(currentFileName, headerRowsForLeafResolve, ci, hdr, ri, bold)
                            : ci < freeze
                              ? (bold ? bBg : ri % 2 === 0 ? STICKY_BG_EVEN[ci % STICKY_BG_EVEN.length] : STICKY_BG_ODD[ci % STICKY_BG_ODD.length])
                              : (bold ? nBg : `${colColors[ci]}10`);
                          const neg = isNeg(raw);
                          const fmt = fmtVal(leafHdr, raw, ci);
                          const rawStr = String(raw ?? "").trim();
                          const marketReviewNarrativeTitles = [cleanTitle, title, widget?.title, groupTitle]
                            .map((t) => removeGroupPrefix(t ?? ""))
                            .filter(Boolean);
                          const isSierraMrProseCell = isMarketReviewNarrativeBodyCell(
                            headerRows,
                            rows,
                            marketReviewNarrativeTitles,
                            ci,
                            rawStr,
                            alcoPartColIndices
                          );
                          const noWrap = isNumericVal(raw) || isDateLikeToken(rawStr) || noWrapCols.has(ci) || isSingleToken(raw) || (isTotalLabelPrefix(raw) && rawStr.length <= 30);
                          const app7ANumberedSubHeadingCell =
                            hasApp7A && ci === 0 && /^\d+\)\s*\S/.test(rawStr);
                          const app6ASectionHeadingCell =
                            isApp6A &&
                            ci === 1 &&
                            /^(FEDERAL|STATE)$/i.test(rawStr) &&
                            (Array.isArray(row) ? row.slice(2).every((v) => v == null || String(v).trim() === "") : false);
                          const app4aSummaryRowBold =
                            isApp4aSummaryTable && isApp4aSummaryBoldRow(row);
                          const subTotalBodyBold =
                            !isApp4aSummaryTable && !isNoteStyleTable && !isApp1AReviewOutlookBody && subTot;
                          const cellBold = isNoteStyleTable || isApp1AReviewOutlookBody
                            ? false
                            : isApp4aSummaryTable
                              ? app4aSummaryRowBold
                              : (bold ||
                                  inlineHdr ||
                                  app6ADataTotalEmphasis ||
                                  app7ANumberedSubHeadingCell ||
                                  bodyRowSummaryBold ||
                                  subTotalBodyBold);
                          const isRightCol = rightAlignCols.has(ci);
                          const inTotalLeafCol = totalColIndices.has(ci) || dataTotalOnlyLabelColIndices.has(ci);
                          const inSubTotalLeafCol = subTotalColIndices.has(ci);
                          const inApp10bTotalBalsCol = hasApp10B && app10bTotalBalsColIndices.has(ci);
                          const inApp2dSumTotalZonesCol = isApp2dFile && app2dSumTotalZonesColIndices.has(ci);
                          const bodyTotalColBold = isApp4aSummaryTable
                            ? app4aSummaryRowBold
                            : (hasApp3 && inTotalLeafCol) || inApp10bTotalBalsCol || inSubTotalLeafCol || inApp2dSumTotalZonesCol;
                          const leafForPct = leafHdr;
                          const nlHdr = normalizeLeafHeaderLabel(leafHdr);
                          const headerIsAmountLike =
                            isAmountLikeColHeader(leafHdr) ||
                            (isApp2dFile && /\bamount\b/i.test(nlHdr) && !/%|percent|percentage/i.test(nlHdr));
                          const inMoneyColumn = amountColIndices.has(ci);
                          const useAmountWrap =
                            !isSierraMrProseCell &&
                            !(isMarketReviewNarrativeTable && isMarketReviewProseLine(rawStr)) &&
                            !pctCols.has(ci) &&
                            !isPercentCol(leafForPct) &&
                            (inMoneyColumn ||
                              isRightCol ||
                              (!inTotalLeafCol &&
                                (isCommaCurrencyVal(raw) ||
                                  (headerIsAmountLike && isPlainNumericAmountCell(raw)))));
                          /** All wrapped amount/currency cells use the same weight (bold/neg rows must not bump td to 600/700). */
                          const amountUniformBody =
                            !bodyTotalColBold &&
                            !app6ADataTotalEmphasis &&
                            !bodyRowSummaryBold &&
                            !subTotalBodyBold &&
                            !inlineHdr &&
                            useAmountWrap;
                          let bodyFwOverride = null;
                          if (isApp4aSummaryTable) {
                            bodyFwOverride = app4aSummaryRowBold ? "700" : "400";
                          } else if (app6ASectionHeadingCell) bodyFwOverride = "700";
                          else if (bodyTotalColBold) bodyFwOverride = "700";
                          else if (app6ADataTotalEmphasis) bodyFwOverride = "700";
                          else if (bodyRowSummaryBold) bodyFwOverride = "700";
                          else if (subTotalBodyBold) bodyFwOverride = "700";
                          else if (app7ANumberedSubHeadingCell) bodyFwOverride = "700";
                          else if (isApp1AReviewOutlookBody) bodyFwOverride = "400";
                          else if (isApp2dFile) bodyFwOverride = "400";
                          else if (!bodyTotalColBold && (useAmountWrap || inMoneyColumn)) bodyFwOverride = "400";

                          const fmtSingleLine = !/\n/.test(String(fmt ?? ""));
                          /** Single-line wrapped values: always flat span so renderCell nested blocks cannot vary metrics. */
                          const trivialAmount = useAmountWrap && fmtSingleLine;

                          if (isSierraMrProseCell) {
                            const proseBold = isAlcoSierraLeoneMarketReviewBoldParagraph(rawStr);
                            const proseFw = proseBold ? 700 : 400;
                            return (
                              <td
                                key={ci}
                                className={`alco-sierra-mr-prose-cell${proseBold ? " alco-sierra-mr-prose-cell--bold" : ""}`}
                                title=""
                                style={{
                                  ...bodyCell(ci, bg, neg, false, specialStyle, noWrap, proseFw),
                                }}
                              >
                                <span
                                  className={proseBold ? "alco-sierra-mr-prose-bold" : "alco-sierra-mr-prose-normal"}
                                  style={{ fontWeight: proseFw }}
                                >
                                  {hl(rawStr, searchRe)}
                                </span>
                              </td>
                            );
                          }

                          return (
                            <td
                              key={ci}
                              className={useAmountWrap ? "zenith-tbody-amount-cell" : undefined}
                              title=""
                              style={{
                                ...bodyCell(ci, bg, neg, cellBold, specialStyle, noWrap, bodyFwOverride),
                                ...(app7ANumberedSubHeadingCell ? { fontSize: `${Math.round(fontSize * 1.1)}px` } : {}),
                                ...(app3InflowOutflowBand
                                  ? {
                                      position: "sticky",
                                      top: theadStickyHeight,
                                      zIndex: ci < freeze ? 16 : 15,
                                      backgroundColor: specialStyle?.bg ?? "#fff",
                                    }
                                  : {}),
                              }}
                            >
                              {useAmountWrap ? (
                                <div
                                  className={
                                    `zenith-tbody-amount-wrap${(bodyTotalColBold || app6ADataTotalEmphasis || bodyRowSummaryBold || subTotalBodyBold || inlineHdr) ? " zenith-tbody-amount-wrap--total-leaf-col" : ""}`
                                  }
                                  style={{
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: isRightCol ? "flex-end" : "flex-start",
                                    width: "100%",
                                    fontSize: `${fontSize}px`,
                                    ...(amountUniformBody ? BODY_AMOUNT_WRAP_STYLE : TABULAR_NUM_STYLE),
                                    ...((bodyTotalColBold || app6ADataTotalEmphasis || bodyRowSummaryBold || subTotalBodyBold || inlineHdr) ? { fontWeight: 700 } : {}),
                                  }}
                                >
                                  {trivialAmount ? (
                                    <span
                                      className="zenith-tbody-amount-plain"
                                      style={{
                                        color: neg ? "#d62728" : "inherit",
                                        ...(amountUniformBody ? BODY_AMOUNT_WRAP_STYLE : TABULAR_NUM_STYLE),
                                        ...((bodyTotalColBold || app6ADataTotalEmphasis || bodyRowSummaryBold || subTotalBodyBold || inlineHdr) ? { fontWeight: 700 } : {}),
                                      }}
                                    >
                                      {hl(String(fmt ?? ""), searchRe)}
                                    </span>
                                  ) : (
                                    renderCell(fmt, searchRe, fullWidth, isApp1AReviewOutlookBody, true)
                                  )}
                                </div>
                              ) : renderCell(fmt, searchRe, fullWidth, isApp1AReviewOutlookBody, true)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>

              {/* ── TFOOT ── */}
              {footerRows.length > 0 && (
                <tfoot>
                  {footerRows.map((row, ri) => {
                    const subTot = checkIsSubTotalRow(row, currentFileName);
                    const secRow = isSectionRow(row);
                    const specialStyle = getSpecialRowStyle(row, currentFileName);
                    const app2aCrrDebitYtdRow = isApp2ACrrDebitYtdRow(row, currentFileName);
                    const isFooterTotalRow = rowIsFooterTotalRow(row, secRow, currentFileName);
                    const footerNetInflowRow = rowContainsNetInflowOutflow(row);
                    const footerLikeSummaryRow =
                      !secRow && isFooterLikeSummaryRow(row, currentFileName, colWidths);
                    const app4aSummaryFooterBold =
                      isApp4aSummaryTable && isApp4aSummaryBoldRow(row);
                    const footerBoldForRow = isApp4aSummaryTable
                      ? app4aSummaryFooterBold
                      : (isFooterTotalRow ||
                          footerNetInflowRow ||
                          app2aCrrDebitYtdRow ||
                          subTot ||
                          footerLikeSummaryRow);

                    const footerRowFontWeight = footerBoldForRow ? "700" : "400";

                    if (secRow) {
                      return (
                        <tr key={ri} style={{ fontSize: `${fontSize}px` }}>
                          <td colSpan={visibleColCount || 1} style={{ padding: "12px 12px", fontWeight: "700", fontSize: `${fontSize}px`, fontFamily: TABLE_FONT_FAMILY, fontSynthesis: "none", color: specialStyle ? "#000" : "#fff", backgroundColor: specialStyle ? specialStyle.bg : "grey", borderTop: specialStyle ? specialStyle.border : `2px solid ${BORDER_COLOR}`, borderBottom: specialStyle ? specialStyle.border : `2px solid ${BORDER_COLOR}`, whiteSpace: "normal", wordBreak: "break-word", overflowWrap: "break-word", letterSpacing: "0.02em" }}>
                            {renderCell(row[0], searchRe, false, false, false)}
                          </td>
                        </tr>
                      );
                    }

                    const fbg = specialStyle ? specialStyle.bg : (subTot ? (hasApp1A ? "#e0e0e0" : "#fff") : "#f5f5f5");
                    const footerBoldCells = footerBoldForRow;
                    return (
                      <tr key={ri} style={{ fontWeight: footerRowFontWeight, backgroundColor: fbg, fontSize: `${fontSize}px` }}>
                        {visibleColIndices.map((ci) => {
                          const hdr = lastHdr[ci];
                          if (colWidths[ci] === 0) return null;
                          const v = Array.isArray(row) ? row[ci] : null;
                          const leafF = resolvedLeafHeaders[ci] ?? String(hdr ?? "").trim();
                          const percentileSpacerFooter =
                            isApp6APercentileTopDepositors && isApp6APercentileSpacerCol(lastHdr, ci);
                          const bg = percentileSpacerFooter
                            ? APP_6A_PERCENTILE_SPACER_BG
                            : specialStyle
                              ? specialStyle.bg
                              : ci < freeze
                                ? (subTot ? (hasApp1A ? "#502f2fff" : "#fff") : "#e8e8e8")
                                : fbg;
                          const neg = isNeg(v);
                          const fmt = percentileSpacerFooter ? "" : fmtVal(leafF, v, ci);
                          const noWrap = isNumericVal(v) || isDateLikeToken(v) || isTotalLabelPrefix(v) || noWrapCols.has(ci) || isSingleToken(v);
                          const isRightCol = rightAlignCols.has(ci);
                          const footerColHasTotalLabel =
                            !isApp4aSummaryTable && dataTotalOnlyLabelColIndices.has(ci);
                          const footerCellBold = isApp4aSummaryTable
                            ? app4aSummaryFooterBold
                            : (footerBoldCells || footerColHasTotalLabel);
                          return (
                            <td key={ci} title="" style={{
                              ...ftCell(ci, bg, neg, noWrap, footerCellBold),
                              ...(specialStyle ? { border: specialStyle.border } : {}),
                              ...(isRightCol ? TABULAR_NUM_STYLE : {}),
                              ...(footerBoldForRow ? { fontWeight: "700" } : {}),
                              ...(!isApp4aSummaryTable && footerColHasTotalLabel ? { fontWeight: "700" } : {}),
                              ...(!isApp4aSummaryTable && app2aCrrDebitYtdRow ? { fontWeight: "700" } : {}),
                              ...(!isApp4aSummaryTable && subTot ? { fontWeight: "700" } : {}),
                              ...(!isApp4aSummaryTable && isTotalCol(normalizeLeafHeaderLabel(leafF)) ? { fontWeight: "700" } : {}),
                              ...(!isApp4aSummaryTable && isSubTotalCol(leafF) ? { fontWeight: "700" } : {}),
                              ...(!isApp4aSummaryTable && hasApp10B && app10bTotalBalsColIndices.has(ci) ? { fontWeight: "700" } : {}),
                              ...(!isApp4aSummaryTable && isApp2dFile && app2dSumTotalZonesColIndices.has(ci) ? { fontWeight: "700" } : {}),
                            }}>
                              {hl(String(fmt ?? ""), searchRe)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tfoot>
              )}

            </table>
            )}
          </div>

        </div>

        <style>{`
          .zenith-market-review-full.doc-table-widget,
          .zenith-market-review-full .zenith-table-x-scroll,
          .zenith-market-review-full table.zenith-table-renderer {
            width: 100% !important;
            max-width: 100% !important;
            box-sizing: border-box;
          }
          .zenith-market-review-full table.zenith-table-renderer {
            min-width: 100% !important;
            table-layout: fixed !important;
          }
          .zenith-alco-london-split table.zenith-table-renderer > colgroup > col:first-of-type {
            width: ${ALCO_LONDON_PART_LABEL_COL_WIDTH_PX}px !important;
            max-width: ${ALCO_LONDON_PART_LABEL_COL_WIDTH_PX}px !important;
          }
          .zenith-alco-london-split table.zenith-table-renderer > thead > tr > th:first-of-type,
          .zenith-alco-london-split table.zenith-table-renderer > tbody > tr > td:first-of-type,
          .zenith-alco-london-split table.zenith-table-renderer > tfoot > tr > td:first-of-type {
            width: ${ALCO_LONDON_PART_LABEL_COL_WIDTH_PX}px !important;
            max-width: ${ALCO_LONDON_PART_LABEL_COL_WIDTH_PX}px !important;
            min-width: ${ALCO_LONDON_PART_LABEL_COL_WIDTH_PX}px !important;
            box-sizing: border-box !important;
          }
          .zenith-alco-london-split table.zenith-table-renderer > thead > tr > th:nth-of-type(2),
          .zenith-alco-london-split table.zenith-table-renderer > tbody > tr > td:nth-of-type(2),
          .zenith-alco-london-split table.zenith-table-renderer > tfoot > tr > td:nth-of-type(2) {
            width: auto !important;
            max-width: none !important;
          }
          .zenith-alco-sierra-movement table.zenith-table-renderer {
            table-layout: fixed !important;
            width: 100% !important;
          }
          .zenith-alco-sierra-movement table.zenith-table-renderer > colgroup > col:first-of-type {
            width: ${ALCO_SIERRA_MOVEMENT_LABEL_COL_MIN_WIDTH_PX}px !important;
            min-width: ${ALCO_SIERRA_MOVEMENT_LABEL_COL_MIN_WIDTH_PX}px !important;
          }
          .zenith-alco-sierra-movement table.zenith-table-renderer > thead > tr > th:first-of-type,
          .zenith-alco-sierra-movement table.zenith-table-renderer > tbody > tr > td:first-of-type,
          .zenith-alco-sierra-movement table.zenith-table-renderer > tfoot > tr > td:first-of-type {
            text-align: left !important;
            white-space: nowrap;
            width: ${ALCO_SIERRA_MOVEMENT_LABEL_COL_MIN_WIDTH_PX}px !important;
            min-width: ${ALCO_SIERRA_MOVEMENT_LABEL_COL_MIN_WIDTH_PX}px !important;
            max-width: ${ALCO_SIERRA_MOVEMENT_LABEL_COL_MIN_WIDTH_PX}px !important;
            box-sizing: border-box !important;
          }
          .zenith-alco-sierra-movement table.zenith-table-renderer > thead > tr > th:first-of-type {
            font-weight: 700 !important;
            vertical-align: bottom;
          }
          .zenith-alco-sierra-market-review table.zenith-alco-sierra-market-review-table {
            border-collapse: collapse !important;
            width: 100% !important;
            table-layout: fixed !important;
            font-family: "Times New Roman", Times, serif !important;
          }
          .zenith-alco-sierra-market-review table.zenith-alco-sierra-market-review-table th,
          .zenith-alco-sierra-market-review table.zenith-alco-sierra-market-review-table td {
            border: 2px solid #000 !important;
            background: #fff !important;
            color: #000 !important;
            vertical-align: top;
          }
          .zenith-alco-sierra-market-review table.zenith-alco-sierra-market-review-table > thead > tr > th {
            font-weight: 400 !important;
          }
          .zenith-alco-sierra-market-review .alco-sierra-mr-part-label {
            width: ${ALCO_LONDON_PART_LABEL_COL_WIDTH_PX}px !important;
            min-width: ${ALCO_LONDON_PART_LABEL_COL_WIDTH_PX}px !important;
            max-width: ${ALCO_LONDON_PART_LABEL_COL_WIDTH_PX}px !important;
            text-align: left !important;
            font-weight: 400 !important;
            padding: 8px 10px !important;
            white-space: nowrap;
          }
          .zenith-alco-sierra-market-review .alco-sierra-mr-part-title {
            text-align: center !important;
            text-decoration: underline !important;
            font-weight: 400 !important;
            padding: 8px 12px !important;
          }
          .zenith-alco-sierra-market-review .alco-sierra-mr-part-spacer {
            width: ${ALCO_LONDON_PART_LABEL_COL_WIDTH_PX}px !important;
            min-width: ${ALCO_LONDON_PART_LABEL_COL_WIDTH_PX}px !important;
            max-width: ${ALCO_LONDON_PART_LABEL_COL_WIDTH_PX}px !important;
            padding: 0 !important;
            border-right: 2px solid #000 !important;
          }
          .zenith-alco-sierra-market-review .alco-sierra-mr-prose {
            padding: 10px 14px !important;
            text-align: left !important;
            line-height: 1.45 !important;
          }
          .zenith-alco-sierra-market-review .alco-sierra-mr-prose p {
            margin: 0;
            font-weight: 400 !important;
          }
          .zenith-alco-sierra-market-review .alco-sierra-mr-prose p + p {
            margin-top: 0.65em;
          }
          .zenith-alco-sierra-market-review .alco-sierra-mr-prose .alco-sierra-mr-normal,
          .zenith-alco-sierra-market-review .alco-sierra-mr-prose .alco-sierra-mr-normal * {
            font-weight: 400 !important;
          }
          .zenith-alco-sierra-market-review .alco-sierra-mr-bold,
          .zenith-alco-sierra-market-review .alco-sierra-mr-bold * {
            font-weight: 700 !important;
          }
          .zenith-market-review-full table.zenith-table-renderer > tbody > tr > td.alco-sierra-mr-prose-cell,
          .zenith-market-review-full table.zenith-table-renderer > tbody > tr > td .alco-sierra-mr-prose-normal {
            font-weight: 400 !important;
          }
          .zenith-market-review-full table.zenith-table-renderer > tbody > tr > td.alco-sierra-mr-prose-cell--bold,
          .zenith-market-review-full table.zenith-table-renderer > tbody > tr > td .alco-sierra-mr-prose-bold {
            font-weight: 700 !important;
          }
          .zenith-alco-sierra-market-review-prose .alco-sierra-mr-prose-cell,
          .zenith-alco-sierra-market-review-prose .alco-sierra-mr-prose-normal {
            font-weight: 400 !important;
          }
          .zenith-alco-sierra-market-review-prose .zenith-table-renderer > tbody > tr > td {
            font-weight: 400 !important;
          }
          .zenith-alco-sierra-market-review-prose .alco-sierra-mr-prose-cell--bold,
          .zenith-alco-sierra-market-review-prose .alco-sierra-mr-prose-bold {
            font-weight: 700 !important;
          }
          .zenith-alco-sierra-market-review-prose .zenith-table-renderer > tbody > tr > td.zenith-tbody-amount-cell,
          .zenith-alco-sierra-market-review-prose .zenith-table-renderer > tbody > tr > td.zenith-tbody-amount-cell * {
            font-weight: 400 !important;
          }
          .alco-sierra-mr-prose-cell {
            font-weight: 400 !important;
          }
          .alco-sierra-mr-prose-cell--bold {
            font-weight: 700 !important;
          }
          table.zenith-table-renderer {
            border-collapse: collapse;
            font-family: var(--zenith-table-font-family) !important;
          }
          .zenith-table-renderer > tbody > tr > td,
          .zenith-table-renderer > tfoot > tr > td {
            font-family: var(--zenith-table-font-family) !important;
            font-synthesis: none;
          }
          .zenith-table-renderer th,
          .zenith-table-renderer td { word-break: break-word; hyphens: auto; -webkit-font-smoothing: antialiased; font-synthesis: none; }
          .zenith-table-renderer > thead > tr > th:not(.zenith-thead-banner-row) {
            font-weight: 700 !important;
            -webkit-font-smoothing: antialiased;
            font-synthesis: none !important;
            font-size: ${fontSize}px !important;
            font-family: ${TABLE_FONT_FAMILY} !important;
            line-height: 1.25 !important;
            letter-spacing: normal !important;
          }
          .zenith-table-renderer > thead > tr > th:not(.zenith-thead-banner-row) * {
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            letter-spacing: inherit !important;
          }
          .zenith-table-renderer > thead > tr > th.th-customer-name-nowrap {
            white-space: nowrap !important;
            word-break: normal !important;
            overflow-wrap: normal !important;
            hyphens: manual !important;
          }
          /* APP 4A PFA week row: no vertical lines between lead / CURRENT / PREVIOUS / tail — one continuous band */
          .zenith-table-renderer > thead > tr.zenith-pfa-week-band-row > th {
            border-top: none !important;
            border-left: none !important;
            border-right: none !important;
            border-bottom: 2px solid ${BORDER_COLOR} !important;
          }
          .zenith-table-renderer > thead > tr.zenith-pfa-week-band-row > th:first-child {
            border-left: 2px solid ${BORDER_COLOR} !important;
          }
          .zenith-table-renderer > thead > tr.zenith-pfa-week-band-row > th:last-child {
            border-right: 2px solid ${BORDER_COLOR} !important;
          }
          .zenith-table-renderer > thead > tr.zenith-pfa-week-band-row > th.zenith-pfa-week-band-merged {
            text-align: center !important;
            white-space: nowrap !important;
            word-break: normal !important;
            overflow-wrap: normal !important;
            vertical-align: middle !important;
          }
          .zenith-table-renderer > tbody > tr > td:not(.zenith-tbody-amount-cell) *,
          .zenith-table-renderer > tfoot > tr > td * {
            font-size: inherit !important;
            font-family: inherit !important;
          }
          .zenith-table-renderer > tbody > tr > td.zenith-tbody-amount-cell {
            font-size: ${fontSize}px !important;
            line-height: 1.45 !important;
            font-family: ${TABLE_FONT_FAMILY} !important;
            font-synthesis: none !important;
          }
          .zenith-table-renderer > tbody > tr > td .zenith-tbody-amount-wrap {
            font-size: ${fontSize}px !important;
            font-weight: 400 !important;
            line-height: 1.45 !important;
            font-family: ${TABLE_FONT_FAMILY} !important;
            -webkit-text-size-adjust: 100%;
          }
          .zenith-table-renderer > tbody > tr > td .zenith-tbody-amount-wrap--total-leaf-col {
            font-weight: 700 !important;
          }
          .zenith-table-renderer > tbody > tr > td .zenith-tbody-amount-wrap .zenith-tbody-amount-plain,
          .zenith-table-renderer > tbody > tr > td .zenith-tbody-amount-wrap .zenith-tbody-amount-plain *,
          .zenith-table-renderer > tbody > tr > td .zenith-tbody-amount-wrap *,
          .zenith-table-renderer > tbody > tr > td .zenith-tbody-amount-wrap span,
          .zenith-table-renderer > tbody > tr > td .zenith-tbody-amount-wrap div {
            font-size: ${fontSize}px !important;
            font-family: ${TABLE_FONT_FAMILY} !important;
            line-height: 1.45 !important;
          }
          .zenith-table-renderer > tbody > tr > td .zenith-tbody-amount-wrap:not(.zenith-tbody-amount-wrap--total-leaf-col),
          .zenith-table-renderer > tbody > tr > td .zenith-tbody-amount-wrap:not(.zenith-tbody-amount-wrap--total-leaf-col) * {
            font-weight: 400 !important;
          }
          .zenith-table-renderer > tbody > tr > td .zenith-tbody-amount-wrap--total-leaf-col,
          .zenith-table-renderer > tbody > tr > td .zenith-tbody-amount-wrap--total-leaf-col * {
            font-weight: 700 !important;
          }
          .zenith-table-renderer > tbody > tr > td .zenith-tbody-amount-wrap mark.srch-hl {
            font-size: ${fontSize}px !important;
            font-weight: inherit !important;
            line-height: 1.45 !important;
          }
          /* Thead week-under-review / band subheaders */
          .zenith-table-renderer > thead > tr > th.zenith-thead-banner-row,
          .zenith-table-renderer > thead > tr > th.zenith-thead-banner-row *,
          .dashboard-doc-modal .zenith-table-renderer > thead > tr > th.zenith-thead-banner-row,
          .dashboard-doc-modal .zenith-table-renderer > thead > tr > th.zenith-thead-banner-row * {
            color: ${SECTION_SUBHEADER_COLOR} !important;
            font-weight: 400 !important;
            font-synthesis: none !important;
            font-size: ${Math.round(fontSize * SECTION_SUBHEADER_FONT_EM)}px !important;
            letter-spacing: 0.03em !important;
          }
          /* In-table section subheader bands — same px as thead banners (avoid em compounding on td *) */
          .zenith-table-renderer > tbody > tr.zenith-section-subheader-row > td,
          .dashboard-doc-modal .zenith-table-renderer > tbody > tr.zenith-section-subheader-row > td {
            color: ${SECTION_SUBHEADER_COLOR} !important;
            font-weight: 400 !important;
            font-synthesis: none !important;
            font-size: ${Math.round(fontSize * SECTION_SUBHEADER_FONT_EM)}px !important;
            letter-spacing: 0.03em !important;
          }
          .zenith-table-renderer > tbody > tr.zenith-section-subheader-row > td *,
          .dashboard-doc-modal .zenith-table-renderer > tbody > tr.zenith-section-subheader-row > td * {
            color: ${SECTION_SUBHEADER_COLOR} !important;
            font-weight: 400 !important;
            font-synthesis: none !important;
            font-size: inherit !important;
            letter-spacing: inherit !important;
          }
          /* APP 2D: extra guard — many sheets use long / variant AMOUNT headers; wins over stray parent styles */
          .zenith-app-2d-wrap .zenith-table-renderer > tbody > tr > td.zenith-tbody-amount-cell,
          .zenith-app-2d-wrap .zenith-table-renderer > tbody > tr > td.zenith-tbody-amount-cell .zenith-tbody-amount-wrap,
          .zenith-app-2d-wrap .zenith-table-renderer > tbody > tr > td.zenith-tbody-amount-cell .zenith-tbody-amount-wrap * {
            font-size: ${fontSize}px !important;
            font-family: ${TABLE_FONT_FAMILY} !important;
            line-height: 1.45 !important;
            font-synthesis: none !important;
          }
          .srch-hl { background-color: #C28E00 !important; color: #fff !important; border-radius: 2px; padding: 0 2px; }
          .tbl-vscroll { scrollbar-width: thin; scrollbar-color: #aaa #f0f0f0; }
          .tbl-vscroll::-webkit-scrollbar { width: 7px; }
          .tbl-vscroll::-webkit-scrollbar-track { background: #f0f0f0; border-radius: 4px; }
          .tbl-vscroll::-webkit-scrollbar-thumb { background: #bbb; border-radius: 4px; }
          .tbl-vscroll::-webkit-scrollbar-thumb:hover { background: #888; }
        `}</style>
      </div>
    </>
  );
}