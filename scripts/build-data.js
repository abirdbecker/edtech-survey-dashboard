#!/usr/bin/env node
/**
 * Build data pipeline — fetches PA Unplugged EdTech Survey responses from Google Sheets,
 * aggregates counts, and writes public/data/dashboard.json for the React frontend.
 *
 * Required env vars:
 *   GOOGLE_SERVICE_ACCOUNT_KEY  — base64-encoded JSON service account key
 *   GOOGLE_SHEET_ID             — ID of the Google Sheet (from URL)
 */

import { google } from 'googleapis';
import { writeFileSync, readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// --- Load config ---
const fieldMap = JSON.parse(readFileSync(join(ROOT, 'data/field-map.json'), 'utf-8'));

// --- Auth ---
const keyB64 = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
const sheetId = process.env.GOOGLE_SHEET_ID;

if (!keyB64 || !sheetId) {
  console.error('Missing required env vars: GOOGLE_SERVICE_ACCOUNT_KEY, GOOGLE_SHEET_ID');
  process.exit(1);
}

const keyJson = JSON.parse(Buffer.from(keyB64, 'base64').toString('utf-8'));

const auth = new google.auth.GoogleAuth({
  credentials: keyJson,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

// --- Helpers ---
function increment(obj, key) {
  if (!key) return;
  const k = key.trim();
  if (!k) return;
  obj[k] = (obj[k] || 0) + 1;
}

function parseMultiSelect(raw) {
  if (!raw) return [];
  return raw.split(',').map(v => v.trim()).filter(Boolean);
}

// --- Main ---
async function main() {
  console.log('Fetching sheet data...');

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'A:AZ', // grab all columns
  });

  const rows = response.data.values;
  if (!rows || rows.length < 2) {
    console.log('No data found in sheet.');
    writeOutput({ totalResponses: 0 });
    return;
  }

  // First row is headers
  const headers = rows[0];
  const dataRows = rows.slice(1);

  console.log(`Found ${dataRows.length} response rows`);
  console.log('Sheet headers:', headers.join(', '));

  // Build column index map
  const colIndex = {};
  headers.forEach((h, i) => { colIndex[h] = i; });

  // Helper to get a cell value by column header name
  function getCell(row, colName) {
    const idx = colIndex[colName];
    return idx !== undefined ? (row[idx] || '').trim() : '';
  }

  // --- Aggregation buckets ---
  const byCounty = {};
  const screenTimeSentiment = { 'Too much': 0, 'Just right': 0, 'Not enough': 0, 'No opinion': 0 };
  const concernsTopLine = { Yes: 0, No: 0 };
  const concernsBreakdown = {};
  const policies = {};

  let totalResponses = 0;

  for (const row of dataRows) {
    // Skip empty rows
    if (!row || row.every(c => !c)) continue;
    totalResponses++;

    // County (public school only — Q2)
    const county = getCell(row, 'county');
    if (county) increment(byCounty, county);

    // Screen time sentiment — aggregate across all grade bands
    for (const field of fieldMap.sentimentFields) {
      const val = getCell(row, field);
      if (val && val in screenTimeSentiment) {
        screenTimeSentiment[val]++;
      }
    }

    // Concerns top-line (Q9)
    const hasConcerns = getCell(row, 'hasConcerns');
    if (hasConcerns === 'Yes') {
      concernsTopLine.Yes++;
      // Concerns breakdown (Q9b) — comma-separated
      const concernList = parseMultiSelect(getCell(row, 'concerns'));
      for (const concern of concernList) {
        if (concern !== 'Other') {
          increment(concernsBreakdown, concern);
        }
      }
    } else if (hasConcerns === 'No') {
      concernsTopLine.No++;
    }

    // Policy preferences (Q11) — comma-separated
    const policyList = parseMultiSelect(getCell(row, 'policies'));
    for (const policy of policyList) {
      if (policy !== 'Other') {
        increment(policies, policy);
      }
    }
  }

  // Sort concern and policy objects by count descending
  const sortedConcerns = Object.fromEntries(
    Object.entries(concernsBreakdown).sort(([, a], [, b]) => b - a)
  );
  const sortedPolicies = Object.fromEntries(
    Object.entries(policies).sort(([, a], [, b]) => b - a)
  );
  const sortedCounties = Object.fromEntries(
    Object.entries(byCounty).sort(([, a], [, b]) => b - a)
  );

  writeOutput({
    totalResponses,
    byCounty: sortedCounties,
    screenTimeSentiment,
    concernsTopLine,
    concernsBreakdown: sortedConcerns,
    policies: sortedPolicies,
  });
}

function writeOutput(data) {
  const output = {
    generated: new Date().toISOString(),
    totalResponses: data.totalResponses || 0,
    byCounty: data.byCounty || {},
    screenTimeSentiment: data.screenTimeSentiment || {},
    concernsTopLine: data.concernsTopLine || {},
    concernsBreakdown: data.concernsBreakdown || {},
    policies: data.policies || {},
  };

  const outPath = join(ROOT, 'public/data/dashboard.json');
  writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`Written to ${outPath}`);
  console.log(`Total responses: ${output.totalResponses}`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
