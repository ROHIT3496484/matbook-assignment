// Express backend for Dynamic Form Builder (SQLite)

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { insertSubmission, countSubmissions, listSubmissions } from './db.js';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaFile = path.join(__dirname, 'schema', 'formSchema.json');

function loadSchema() {
  const raw = fs.readFileSync(schemaFile, 'utf-8');
  return JSON.parse(raw);
}

function validateSubmission(schema, submission) {
  const errors = {};
  for (const field of schema.fields) {
    const value = submission[field.name];
    const v = field.validations || {};

    const isEmpty = (val) =>
      val === undefined ||
      val === null ||
      val === '' ||
      (Array.isArray(val) && val.length === 0);

    if (field.required && isEmpty(value)) {
      errors[field.name] = `${field.label} is required`;
      continue;
    }

    switch (field.type) {
      case 'text':
      case 'textarea': {
        if (value != null) {
          if (typeof value !== 'string') {
            errors[field.name] = `${field.label} must be a string`;
            break;
          }
          if (v.minLength != null && value.length < v.minLength) {
            errors[field.name] = `${field.label} must be at least ${v.minLength} characters`;
          }
          if (v.maxLength != null && value.length > v.maxLength) {
            errors[field.name] = `${field.label} must be at most ${v.maxLength} characters`;
          }
          if (v.regex) {
            const re = new RegExp(v.regex);
            if (!re.test(value)) {
              errors[field.name] = `${field.label} is invalid`;
            }
          }
        }
        break;
      }
      case 'number': {
        if (value != null && value !== '') {
          const num = Number(value);
          if (Number.isNaN(num)) {
            errors[field.name] = `${field.label} must be a number`;
            break;
          }
          if (v.min != null && num < v.min) {
            errors[field.name] = `${field.label} must be >= ${v.min}`;
          }
          if (v.max != null && num > v.max) {
            errors[field.name] = `${field.label} must be <= ${v.max}`;
          }
        }
        break;
      }
      case 'select': {
        if (value != null && value !== '') {
          const allowed = (field.options || []).map(o => o.value);
          if (!allowed.includes(value)) {
            errors[field.name] = `${field.label} has invalid selection`;
          }
        }
        break;
      }
      case 'multi-select': {
        if (value != null) {
          if (!Array.isArray(value)) {
            errors[field.name] = `${field.label} must be an array`;
            break;
          }
          const allowed = (field.options || []).map(o => o.value);
          if (!value.every(vv => allowed.includes(vv))) {
            errors[field.name] = `${field.label} contains invalid selections`;
            break;
          }
          if (v.minSelected != null && value.length < v.minSelected) {
            errors[field.name] = `${field.label} must have at least ${v.minSelected} selections`;
          }
          if (v.maxSelected != null && value.length > v.maxSelected) {
            errors[field.name] = `${field.label} must have at most ${v.maxSelected} selections`;
          }
        }
        break;
      }
      case 'date': {
        if (value != null && value !== '') {
          const d = new Date(value);
          if (isNaN(d.getTime())) {
            errors[field.name] = `${field.label} must be a valid date`;
            break;
          }
          if (v.minDate) {
            const min = new Date(v.minDate);
            if (d < min) {
              errors[field.name] = `${field.label} must be on or after ${v.minDate}`;
            }
          }
        }
        break;
      }
      case 'switch': {
        if (value != null && typeof value !== 'boolean') {
          errors[field.name] = `${field.label} must be true/false`;
        }
        break;
      }
      default: {
        errors[field.name] = `Unsupported field type: ${field.type}`;
      }
    }
  }
  return errors;
}

function cryptoRandomId() {
  if (global.crypto?.randomUUID) return global.crypto.randomUUID();
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Routes
app.get('/api/form-schema', (req, res) => {
  try {
    const schema = loadSchema();
    res.status(200).json(schema);
  } catch {
    res.status(500).json({ success: false, message: 'Failed to load schema' });
  }
});

app.post('/api/submissions', (req, res) => {
  try {
    const schema = loadSchema();
    const submission = req.body || {};
    const errors = validateSubmission(schema, submission);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({ success: false, errors });
    }
    const id = cryptoRandomId();
    const createdAt = new Date().toISOString();

    insertSubmission(id, createdAt, submission);

    return res.status(201).json({ success: true, id, createdAt });
  } catch {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/submissions?page=1&limit=10&sortBy=createdAt&sortOrder=desc
app.get('/api/submissions', (req, res) => {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '10', 10);
    const sortBy = (req.query.sortBy || 'createdAt').toString();
    const sortOrder = (req.query.sortOrder || 'desc').toString();

    if (Number.isNaN(page) || page < 1) {
      return res.status(400).json({ success: false, message: 'Invalid page parameter' });
    }
    if (Number.isNaN(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({ success: false, message: 'Invalid limit parameter' });
    }
    if (sortBy !== 'createdAt') {
      return res.status(400).json({ success: false, message: 'Only sorting by createdAt is supported' });
    }
    if (!['asc', 'desc'].includes(sortOrder)) {
      return res.status(400).json({ success: false, message: 'Invalid sortOrder parameter' });
    }

    const total = countSubmissions();
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const items = listSubmissions({ page, limit, sortOrder });

    return res.status(200).json({
      success: true,
      page,
      limit,
      total,
      totalPages,
      sortBy,
      sortOrder,
      items
    });
  } catch {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
