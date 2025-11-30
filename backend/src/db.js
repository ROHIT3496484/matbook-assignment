// JSON-file persistence helpers (no native build requirements)
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const jsonPath = path.join(dataDir, 'submissions.json');
if (!fs.existsSync(jsonPath)) {
  fs.writeFileSync(jsonPath, '[]', 'utf-8');
}

function readAll() {
  try {
    const raw = fs.readFileSync(jsonPath, 'utf-8');
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeAll(items) {
  fs.writeFileSync(jsonPath, JSON.stringify(items, null, 2), 'utf-8');
}

export function insertSubmission(id, createdAt, dataObj) {
  const items = readAll();
  items.push({ id, createdAt, data: dataObj });
  writeAll(items);
}

export function countSubmissions() {
  const items = readAll();
  return items.length;
}

export function listSubmissions({ page, limit, sortOrder }) {
  const items = readAll();
  const sorted = items.sort((a, b) => {
    const ta = new Date(a.createdAt).getTime();
    const tb = new Date(b.createdAt).getTime();
    return sortOrder.toLowerCase() === 'asc' ? ta - tb : tb - ta;
  });
  const start = (page - 1) * limit;
  const sliced = sorted.slice(start, start + limit);
  return sliced;
}
