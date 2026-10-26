import { getCarbTypeShortCode } from "./carbTypeDisplay";
import { formatLabelMacros } from "./nutritionInfo";
import mealprepLogo from "./assets/images/logo/mp-logo.png";

// Resolved to an absolute URL — the print iframe below gets its HTML via
// document.write() rather than navigating to a page of its own, so a
// relative path has no reliable base to resolve against.
const MEALPREP_LOGO_URL = new URL(mealprepLogo, window.location.origin).href;

const LABEL_WIDTH_MM = 60;
const LABEL_HEIGHT_MM = 30;

// Word-wraps a free-text address down to a couple of short lines — there's
// no room on a 60mm label for a full postal address.
const truncateAddressLines = (address, maxCharsPerLine = 16, maxLines = 2) => {
  const words = (address || "").trim().split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
      if (lines.length === maxLines) return lines;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, maxLines);
};

// Lunch/Dinner coverage, from a Scheduled-tab row's remaining meal-bucket
// counts — "LD" describes the customer's plan, shown the same way on every
// label for them regardless of which specific meal this label is for.
export const getCoverageCodeFromMealCounts = (meal) => {
  const hasLunch = (meal?.lunchMeals || 0) + (meal?.nextDayLunchMeals || 0) > 0;
  const hasDinner = (meal?.dinnerMeals || 0) + (meal?.nextDayDinnerMeals || 0) > 0;
  if (hasLunch && hasDinner) return "LD";
  if (hasLunch) return "L";
  if (hasDinner) return "D";
  return "";
};

// Same idea for the Delivered tab, where coverage isn't a stored balance —
// it's "did this same customer show up in both today's lunch and dinner
// delivery lists."
export const getCoverageCodeFromDeliveredLists = (userId, lunchRows, dinnerRows) => {
  const inLunch = lunchRows.some((r) => String(r.userId) === String(userId));
  const inDinner = dinnerRows.some((r) => String(r.userId) === String(userId));
  if (inLunch && inDinner) return "LD";
  if (inLunch) return "L";
  if (inDinner) return "D";
  return "";
};

const formatLabelDate = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
};

// Shapes one delivery row (from either tab) into exactly what the label
// template needs — name/address/mobile/date plus the NEW/coverage tag,
// the carb-type short code, and the macro line.
export const buildMealLabel = (row, { coverageCode, date }) => {
  const dietType = row.dietaryType || row.dietaryPreference;
  return {
    name: row.name || "",
    addressLines: truncateAddressLines(row.address),
    tag: `${row.isNewCustomer ? "NEW" : ""}${coverageCode ? `(${coverageCode})` : ""}`,
    date: formatLabelDate(date),
    mobile: row.mobile || "",
    macros: formatLabelMacros(row.carbType),
    carbCode: getCarbTypeShortCode(row.carbType),
    dietCode: dietType === "non-veg" ? "NON VEG" : "VEG",
  };
};

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const labelHtml = (label) => `
  <div class="label-page">
    <div class="top-row">
      <div class="address">${label.addressLines.map(escapeHtml).join("<br/>")}</div>
      <div class="name-block">
        <div class="name">${escapeHtml(label.name)}</div>
        ${label.tag ? `<div class="tag">${escapeHtml(label.tag)}</div>` : ""}
      </div>
    </div>
    <div class="mid-row">
      <span class="date">${escapeHtml(label.date)}</span>
      <img class="logo" src="${MEALPREP_LOGO_URL}" alt="Mealprep" />
      <span class="mobile">${escapeHtml(label.mobile)}</span>
    </div>
    <div class="macro-row">${escapeHtml(label.macros)}</div>
    <div class="bar-row">
      <span>${escapeHtml(label.carbCode)}</span>
      <span>${escapeHtml(label.dietCode)}</span>
    </div>
  </div>
`;

const LABEL_DOCUMENT_STYLES = `
  @page { size: ${LABEL_WIDTH_MM}mm ${LABEL_HEIGHT_MM}mm; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: Arial, Helvetica, sans-serif; color: #0f172a; }
  .label-page {
    width: ${LABEL_WIDTH_MM}mm;
    height: ${LABEL_HEIGHT_MM}mm;
    padding: 1.6mm 2mm;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    overflow: hidden;
    page-break-after: always;
  }
  .label-page:last-child { page-break-after: auto; }
  .top-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 2mm; }
  .address { font-size: 6.5pt; font-weight: 700; line-height: 1.15; white-space: nowrap; }
  .name-block { text-align: right; }
  .name { font-size: 11pt; font-weight: 800; line-height: 1.05; white-space: nowrap; }
  .tag { font-size: 7.5pt; font-weight: 700; margin-top: 0.3mm; }
  .mid-row { display: flex; align-items: center; justify-content: space-between; gap: 1.5mm; font-size: 8pt; font-weight: 700; }
  .logo { height: 4.5mm; width: auto; flex-shrink: 0; object-fit: contain; }
  .macro-row { font-size: 6.3pt; font-weight: 600; white-space: nowrap; }
  .bar-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #0f172a;
    color: #fff;
    font-size: 8pt;
    font-weight: 800;
    padding: 0.8mm 1.8mm;
    letter-spacing: 0.2px;
  }
`;

// Opens a hidden iframe with its own isolated document (so this never
// interferes with the host page's own print:hidden/print:block rules),
// writes one .label-page per label at exact physical size, and prints it.
export const printMealDeliveryLabels = (labels) => {
  if (!labels || labels.length === 0) return;

  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;";
  document.body.appendChild(iframe);

  const cleanup = () => {
    if (document.body.contains(iframe)) document.body.removeChild(iframe);
  };

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`<!DOCTYPE html><html><head><title>Meal Delivery Labels</title><style>${LABEL_DOCUMENT_STYLES}</style></head><body>${labels.map(labelHtml).join("")}</body></html>`);
  doc.close();

  iframe.contentWindow.onafterprint = cleanup;
  // Fallback in case the browser never fires afterprint (seen in some setups).
  setTimeout(cleanup, 10000);

  // Wait for the logo (and anything else with an src) to actually load before
  // printing — the previous blind delay risked a blank logo on the first print.
  const images = Array.from(doc.images || []);
  const whenLoaded = images.length
    ? Promise.all(images.map((img) => (img.complete ? Promise.resolve() : new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      }))))
    : Promise.resolve();
  const whenReady = Promise.race([whenLoaded, new Promise((resolve) => setTimeout(resolve, 2000))]);

  whenReady.then(() => {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  });
};
