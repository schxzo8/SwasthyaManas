// utils/timeNepal.js
const TZ = "Asia/Kathmandu";

// Get YYYY-MM-DD in Nepal time for a Date
function toNepalISODate(d = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);

  const y = parts.find(p => p.type === "year").value;
  const m = parts.find(p => p.type === "month").value;
  const day = parts.find(p => p.type === "day").value;

  return `${y}-${m}-${day}`; // "2026-02-18"
}

// Convert a Nepal local day (YYYY-MM-DD) into UTC range [start,end)
function nepalDayToUtcRange(dateStr) {
  // dateStr is Nepal calendar day
  // We compute the UTC instants that correspond to Nepal 00:00 and next day 00:00.
  // We'll do it by formatting known instants - easiest reliable approach is using Date + Intl offset trick.

  // Create a "fake" date at UTC midnight and then map to Nepal time — BUT better:
  // We'll compute start/end by iterating with Intl and searching offset is heavy.
  // Simpler: accept that Nepal is fixed +05:45 (no DST), so offset is stable.
  const offsetMs = (5 * 60 + 45) * 60 * 1000;

  // Nepal 00:00 => UTC = Nepal - offset
  const startLocal = new Date(`${dateStr}T00:00:00.000Z`); // treated as UTC
  const startUtc = new Date(startLocal.getTime() - offsetMs);

  const endUtc = new Date(startUtc.getTime() + 24 * 60 * 60 * 1000);

  return { startUtc, endUtc };
}

module.exports = { TZ, toNepalISODate, nepalDayToUtcRange };