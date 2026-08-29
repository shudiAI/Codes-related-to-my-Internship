import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { getDb } from './db/database.js';
import { translateText } from './services/translationService.js';
import { extractPlaceholders, renderTemplate } from './services/templateProcessor.js';
import { predictCaseProcessingDays } from './services/caseProcessingPredictionService.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Set up file uploads for templates
const UPLOADS_DIR = path.resolve(process.cwd(), 'server', 'uploads', 'templates');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Helper to map reference category names to tables
function getTableName(category) {
  const map = {
    'government-entities': 'government_entities',
    'department-names': 'department_names',
    'title-addresses': 'title_addresses',
    'government-affairs': 'government_affairs',
    'cities': 'cities'
  };
  return map[category] || null;
}

// Ensure columns are correct based on category
function getFieldNames(category) {
  if (category === 'title-addresses') {
    return { eng: 'english_value', ara: 'arabic_value', parentId: 'department_name_id' };
  }
  if (category === 'department-names') {
    return { eng: 'english_name', ara: 'arabic_name', parentId: 'government_entity_id' };
  }
  if (category === 'government-affairs') {
    return { eng: 'english_name', ara: 'arabic_name', parentId: 'title_address_id' };
  }
  if (category === 'cities') {
    return { eng: 'english_name', ara: 'arabic_name', parentId: 'province' };
  }
  return { eng: 'english_name', ara: 'arabic_name' };
}

// Helper for dictionary sync
async function syncToDictionary(db, eng, ara) {
  if (!eng || !ara) return;
  await db.run(
    'INSERT INTO translation_dictionary (english_value, arabic_value) VALUES (?, ?) ON CONFLICT(english_value) DO UPDATE SET arabic_value = excluded.arabic_value',
    [eng.trim(), ara.trim()]
  );
}

// Initialize DB on start
await getDb();

// ==================== CASES ENDPOINTS ====================

app.get('/api/cases', async (req, res) => {
  try {
    const db = await getDb();
    const cases = await db.all(`
      SELECT c.*, ge.english_name as government_entity_name, ge.arabic_name as government_entity_arabic
      FROM cases c
      LEFT JOIN government_entities ge ON c.government_entity_id = ge.id
      ORDER BY c.created_at DESC
    `);
    res.json(cases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cases', async (req, res) => {
  try {
    const { title, government_entity_id, province, city, project_type, work_method, project_description } = req.body;
    const validProjectTypes = ['Pipeline', 'Culvert', 'Temporary Site', 'Borrow Pit', 'Well Drilling'];
    const normalizedWorkMethod = project_type === 'Pipeline' ? work_method : 'N/A';
    if (!title || !government_entity_id || !province || !city || !validProjectTypes.includes(project_type)) {
      return res.status(400).json({ error: 'Missing required case fields' });
    }
    if (project_type === 'Pipeline' && !['HDD', 'Open Cut'].includes(normalizedWorkMethod)) {
      return res.status(400).json({ error: 'Pipeline work method must be HDD or Open Cut' });
    }

    const db = await getDb();
    const lastCase = await db.get(`
    SELECT case_number
     FROM cases
    WHERE case_number LIKE 'CASE-2026-%'
     ORDER BY id DESC
     LIMIT 1
   `);

const nextNumber = lastCase
  ? parseInt(lastCase.case_number.split('-').pop(), 10) + 1
  : 1;

const caseNumber = `CASE-2026-${String(nextNumber).padStart(3, '0')}`;

    const result = await db.run(
      `INSERT INTO cases (case_number, title, government_entity_id, province, city, project_type, work_method, project_description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [caseNumber, title, government_entity_id, province, city, project_type, normalizedWorkMethod, project_description || '', 'New']
    );

    const newCase = await db.get('SELECT * FROM cases WHERE id = ?', [result.lastID]);
    res.status(201).json(newCase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cases/:id', async (req, res) => {
  try {
    const db = await getDb();
    const caseItem = await db.get(
      `SELECT c.*, ge.english_name as government_entity_name, ge.arabic_name as government_entity_arabic
       FROM cases c
       LEFT JOIN government_entities ge ON c.government_entity_id = ge.id
       WHERE c.id = ?`,
      [req.params.id]
    );

    if (!caseItem) return res.status(404).json({ error: 'Case not found' });

    const correspondence = await db.all(
      'SELECT * FROM correspondence WHERE case_id = ? ORDER BY created_at DESC',
      [req.params.id]
    );

    let estimatedProcessingDays = null;
    if (caseItem.project_type && caseItem.work_method) {
      try {
        estimatedProcessingDays = await predictCaseProcessingDays(caseItem);
      } catch (predictionError) {
        console.error(`Prediction failed for case ${caseItem.id}:`, predictionError.message);
      }
    }

    res.json({ ...caseItem, correspondence, estimated_processing_days: estimatedProcessingDays });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cases/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM correspondence WHERE case_id = ?', [req.params.id]);
    await db.run('DELETE FROM cases WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== CORRESPONDENCE ENDPOINTS ====================

app.get('/api/correspondence', async (req, res) => {
  try {
    const db = await getDb();
    const list = await db.all(`
      SELECT corr.*, c.title as case_title, c.case_number
      FROM correspondence corr
      JOIN cases c ON corr.case_id = c.id
      ORDER BY corr.created_at DESC
    `);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/correspondence', async (req, res) => {
  try {
    const {
      case_id, project_description, government_affairs_id, title_address_id,
      department_name_id, template_id, priority, confidentiality, sender, performer
    } = req.body;

    const db = await getDb();
    const caseExists = await db.get('SELECT * FROM cases WHERE id = ?', [case_id]);
    if (!caseExists) return res.status(404).json({ error: 'Case not found' });

    const finalProjectDescription = project_description || caseExists.project_description || '';

    if (!case_id || !finalProjectDescription || !government_affairs_id || !title_address_id || !department_name_id || !template_id) {
      return res.status(400).json({ error: 'Missing required correspondence fields' });
    }

    const countRes = await db.get('SELECT COUNT(*) as count FROM correspondence');
    const correspondenceNumber = `CORR-2026-${String(countRes.count + 1).padStart(3, '0')}`;

    const result = await db.run(
      `INSERT INTO correspondence
       (correspondence_number, case_id, project_description, government_affairs_id, title_address_id, department_name_id, template_id, priority, confidentiality, sender, performer, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        correspondenceNumber, case_id, finalProjectDescription, government_affairs_id,
        title_address_id, department_name_id, template_id,
        priority || 'Immediate', confidentiality || 'Restricted',
        sender && sender.trim() ? sender.trim() : '-',
        performer && performer.trim() ? performer.trim() : '-',
        'Draft'
      ]
    );

    await db.run("UPDATE cases SET status = 'Correspondence Created' WHERE id = ?", [case_id]);
    const newCorrespondence = await db.get('SELECT * FROM correspondence WHERE id = ?', [result.lastID]);
    res.status(201).json(newCorrespondence);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/correspondence/:id', async (req, res) => {
  try {
    const db = await getDb();
    const corr = await db.get(
      `SELECT corr.*, 
              c.title as case_title, c.case_number, c.province as case_province, c.city as case_city,
              ge.english_name as government_entity_name, ge.arabic_name as government_entity_arabic,
              ga.english_name as government_affairs_name, ga.arabic_name as government_affairs_arabic,
              ta.english_value as title_address_name, ta.arabic_value as title_address_arabic,
              dn.english_name as department_name, dn.arabic_name as department_arabic,
              t.name as template_name
       FROM correspondence corr
       JOIN cases c ON corr.case_id = c.id
       JOIN government_entities ge ON c.government_entity_id = ge.id
       JOIN government_affairs ga ON corr.government_affairs_id = ga.id
       JOIN title_addresses ta ON corr.title_address_id = ta.id
       JOIN department_names dn ON corr.department_name_id = dn.id
       JOIN templates t ON corr.template_id = t.id
       WHERE corr.id = ?`,
      [req.params.id]
    );

    if (!corr) return res.status(404).json({ error: 'Not found' });
    res.json(corr);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/correspondence/:id', async (req, res) => {
  try {
    const db = await getDb();
    const corr = await db.get('SELECT case_id FROM correspondence WHERE id = ?', [req.params.id]);
    await db.run('DELETE FROM correspondence WHERE id = ?', [req.params.id]);
    if (corr) await db.run("UPDATE cases SET status = 'New' WHERE id = ?", [corr.case_id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== TEMPLATE ENDPOINTS ====================

app.get('/api/templates', async (req, res) => {
  try {
    const db = await getDb();
    const templates = await db.all('SELECT * FROM templates ORDER BY created_at DESC');
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/templates/upload', upload.single('templateFile'), async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !req.file) {
      return res.status(400).json({ error: 'Template name and DOCX file are required' });
    }

    const filePath = req.file.path;
    const placeholders = extractPlaceholders(filePath);

    const db = await getDb();
    const result = await db.run(
      'INSERT INTO templates (name, file_path, placeholders_json) VALUES (?, ?, ?)',
      [name, filePath, JSON.stringify(placeholders)]
    );

    const newTemplate = await db.get('SELECT * FROM templates WHERE id = ?', [result.lastID]);
    res.status(201).json(newTemplate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/templates/:id', async (req, res) => {
  try {
    const db = await getDb();
    const t = await db.get('SELECT file_path FROM templates WHERE id = ?', [req.params.id]);
    if (t?.file_path && fs.existsSync(t.file_path)) fs.unlinkSync(t.file_path);
    await db.run('DELETE FROM templates WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== REFERENCE DATA ENDPOINTS ====================

app.get('/api/reference/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const table = getTableName(category);
    if (!table) return res.status(400).json({ error: 'Invalid category' });

    const db = await getDb();
    let items;

    if (category === 'department-names') {
      items = await db.all(`SELECT t.*, p.english_name as parent_name FROM ${table} t JOIN government_entities p ON t.government_entity_id = p.id ORDER BY t.id DESC`);
    } else if (category === 'title-addresses') {
      items = await db.all(`SELECT t.*, p.english_name as parent_name FROM ${table} t JOIN department_names p ON t.department_name_id = p.id ORDER BY t.id DESC`);
    } else if (category === 'government-affairs') {
      items = await db.all(`SELECT t.*, p.english_value as parent_name FROM ${table} t JOIN title_addresses p ON t.title_address_id = p.id ORDER BY t.id DESC`);
    } else {
      items = await db.all(`SELECT * FROM ${table} ORDER BY id DESC`);
    }
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/reference/:category', async (req, res) => {
  try {
    const category = req.params.category;
    const table = getTableName(category);
    const fields = getFieldNames(category);
    const { [fields.eng]: eng, [fields.ara]: ara, [fields.parentId]: parent } = req.body;

    if (!eng || !ara || (fields.parentId && !parent)) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = await getDb();
    let result;
    if (fields.parentId) {
      result = await db.run(`INSERT INTO ${table} (${fields.parentId}, ${fields.eng}, ${fields.ara}) VALUES (?, ?, ?)`, [parent, eng, ara]);
    } else {
      result = await db.run(`INSERT INTO ${table} (${fields.eng}, ${fields.ara}) VALUES (?, ?)`, [eng, ara]);
    }

    await syncToDictionary(db, eng, ara);
    const newItem = await db.get(`SELECT * FROM ${table} WHERE id = ?`, [result.lastID]);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/reference/:category/:id', async (req, res) => {
  try {
    const category = req.params.category;
    const table = getTableName(category);
    const fields = getFieldNames(category);
    const { [fields.eng]: eng, [fields.ara]: ara, [fields.parentId]: parent } = req.body;

    const db = await getDb();
    if (fields.parentId) {
      await db.run(`UPDATE ${table} SET ${fields.parentId} = ?, ${fields.eng} = ?, ${fields.ara} = ? WHERE id = ?`, [parent, eng, ara, req.params.id]);
    } else {
      await db.run(`UPDATE ${table} SET ${fields.eng} = ?, ${fields.ara} = ? WHERE id = ?`, [eng, ara, req.params.id]);
    }

    await syncToDictionary(db, eng, ara);
    const updated = await db.get(`SELECT * FROM ${table} WHERE id = ?`, [req.params.id]);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/reference/:category/:id', async (req, res) => {
  try {
    const table = getTableName(req.params.category);
    const db = await getDb();
    await db.run(`DELETE FROM ${table} WHERE id = ?`, [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== DICTIONARY ENDPOINTS ====================

app.get('/api/dictionary', async (req, res) => {
  try {
    const db = await getDb();
    res.json(await db.all('SELECT * FROM translation_dictionary ORDER BY id DESC'));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/dictionary', async (req, res) => {
  try {
    const { english_value, arabic_value } = req.body;
    const db = await getDb();
    const result = await db.run('INSERT INTO translation_dictionary (english_value, arabic_value) VALUES (?, ?)', [english_value.trim(), arabic_value.trim()]);
    res.status(201).json(await db.get('SELECT * FROM translation_dictionary WHERE id = ?', [result.lastID]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/dictionary/:id', async (req, res) => {
  try {
    const { english_value, arabic_value } = req.body;
    const db = await getDb();
    await db.run('UPDATE translation_dictionary SET english_value = ?, arabic_value = ? WHERE id = ?', [english_value.trim(), arabic_value.trim(), req.params.id]);
    res.json(await db.get('SELECT * FROM translation_dictionary WHERE id = ?', [req.params.id]));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/dictionary/:id', async (req, res) => {
  try {
    const db = await getDb();
    await db.run('DELETE FROM translation_dictionary WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== GENERATE DRAFT LETTER ====================

app.post('/api/correspondence/:id/generate-draft', async (req, res) => {
  try {
    const db = await getDb();
    const corr = await db.get(
      `SELECT corr.*, 
              c.title as case_title, c.case_number, c.province as case_province, c.city as case_city,
              ge.english_name as government_entity_name, ge.arabic_name as government_entity_arabic,
              ga.english_name as government_affairs_name, ga.arabic_name as government_affairs_arabic,
              ta.english_value as title_address_name, ta.arabic_value as title_address_arabic,
              dn.english_name as department_name, dn.arabic_name as department_arabic,
              t.id as template_id, t.name as template_name, t.file_path, t.placeholders_json
       FROM correspondence corr
       JOIN cases c ON corr.case_id = c.id
       JOIN government_entities ge ON c.government_entity_id = ge.id
       JOIN government_affairs ga ON corr.government_affairs_id = ga.id
       JOIN title_addresses ta ON corr.title_address_id = ta.id
       JOIN department_names dn ON corr.department_name_id = dn.id
       JOIN templates t ON corr.template_id = t.id
       WHERE corr.id = ?`,
      [req.params.id]
    );

    if (!corr) return res.status(404).json({ error: 'Not found' });

    const subData = {
      CORRESPONDENCE_NUMBER: corr.correspondence_number,
      TITLE: await translateText(corr.case_title),
      PROVINCE: await translateText(corr.case_province),
      CITY: await translateText(corr.case_city),
      GOVERNMENT_ENTITY: corr.government_entity_arabic,
      GOVERNMENT_AFFAIRS: corr.government_affairs_arabic,
      TITLE_ADDRESS: corr.title_address_arabic,
      DEPARTMENT_NAME: corr.department_arabic,
      PROJECT_DESCRIPTION: await translateText(corr.project_description),
      PRIORITY: await translateText(corr.priority),
      CONFIDENTIALITY: await translateText(corr.confidentiality),
      SENDER: await translateText(corr.sender),
      PERFORMER: await translateText(corr.performer)
    };

    const result = await renderTemplate({ file_path: corr.file_path }, subData);
    await db.run("UPDATE correspondence SET status = 'Draft' WHERE id = ?", [corr.id]);
    await db.run("UPDATE cases SET status = 'Draft' WHERE id = ?", [corr.case_id]);

    res.json({ html: result.html, translation_map: subData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => console.log(`Server on ${PORT}`));
