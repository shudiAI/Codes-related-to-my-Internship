import fs from 'fs';
import path from 'path';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import mammoth from 'mammoth';

/**
 * Extracts placeholders from a .docx file.
 */
export function extractPlaceholders(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return [];

  try {
    const content = fs.readFileSync(filePath);
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: '{{', end: '}}' }
    });
    
    // Extract from text or XML
    const text = doc.getFullText();
    const matches = text.match(/\{\{([A-Za-z0-9_]+)\}\}/g) || [];
    const placeholders = matches.map(m => m.replace(/[\{\}]/g, '').trim());

    // Also scan all document XMLs in the zip for any split tags
    const files = zip.files;
    Object.keys(files).forEach(fileName => {
      if (fileName.endsWith('.xml')) {
        const xmlText = files[fileName].asText();
        const xmlMatches = xmlText.match(/\{\{([A-Za-z0-9_]+)\}\}/g) || [];
        xmlMatches.forEach(m => placeholders.push(m.replace(/[\{\}]/g, '').trim()));
      }
    });

    return Array.from(new Set(placeholders.filter(Boolean)));
  } catch (err) {
    console.error('Error extracting placeholders:', err);
    return [];
  }
}

/**
 * Replaces placeholders in the exact uploaded .docx file and renders HTML.
 */
export async function renderTemplate(templateRecord, data) {
  const { file_path } = templateRecord;

  if (!file_path || !fs.existsSync(file_path)) {
    throw new Error('Template DOCX file not found on disk');
  }

  try {
    const fileBuffer = fs.readFileSync(file_path);
    const zip = new PizZip(fileBuffer);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
      delimiters: { start: '{{', end: '}}' },
      nullGetter: (part) => {
        if (!part.module) {
          return '';
        }
        return '';
      }
    });

    // Provide data (case-insensitive key mapping as well)
    const normalizedData = { ...data };
    Object.keys(data).forEach(key => {
      normalizedData[key.toLowerCase()] = data[key];
      normalizedData[key.toUpperCase()] = data[key];
    });

    doc.render(normalizedData);

    const buf = doc.getZip().generate({ type: 'nodebuffer' });
    
    // Convert compiled DOCX to HTML using mammoth
    const result = await mammoth.convertToHtml({ buffer: buf });
    
    // Check if result has html, ensure RTL arabic direction & styling
    const htmlContent = result.value || '<p>No content in template</p>';
    
    return {
      html: `<div class="docx-preview" style="direction: rtl; text-align: right; font-family: 'Amiri', serif; font-size: 16px; line-height: 1.8;">${htmlContent}</div>`,
      rawBuffer: buf
    };
  } catch (err) {
    console.error('Error rendering DOCX template:', err);
    throw err;
  }
}
