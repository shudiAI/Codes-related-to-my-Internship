import { getDb } from '../db/database.js';

/**
 * Translates an English text string to Arabic.
 * 1. Checks internal translation_dictionary database table.
 * 2. If not found, attempts external translation API if key configured.
 * 3. Falls back to deterministic mock translation if no API key is available.
 */
export async function translateText(englishText) {
  if (!englishText || typeof englishText !== 'string') return '';
  const trimmed = englishText.trim();
  if (!trimmed) return '';

  const db = await getDb();

  // Tier 1: Search Translation Dictionary (case-insensitive)
  const dictMatch = await db.get(
    'SELECT arabic_value FROM translation_dictionary WHERE LOWER(english_value) = LOWER(?)',
    [trimmed]
  );

  if (dictMatch && dictMatch.arabic_value) {
    return dictMatch.arabic_value;
  }

  // Tier 2: Search word-by-word or phrase replacement if full string not found directly
  const allDictEntries = await db.all('SELECT english_value, arabic_value FROM translation_dictionary');
  let substitutedText = trimmed;
  let matchesFound = 0;

  for (const entry of allDictEntries) {
    const regex = new RegExp(`\\b${escapeRegExp(entry.english_value)}\\b`, 'gi');
    if (regex.test(substitutedText)) {
      substitutedText = substitutedText.replace(regex, entry.arabic_value);
      matchesFound++;
    }
  }

  if (matchesFound > 0) {
    return substitutedText;
  }

  // Tier 3: External API check (e.g. Google Translate API if process.env.TRANSLATION_API_KEY exists)
  if (process.env.TRANSLATION_API_KEY) {
    try {
      const response = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${process.env.TRANSLATION_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            q: trimmed,
            source: 'en',
            target: 'ar',
            format: 'text'
          })
        }
      );
      const data = await response.json();
      if (data?.data?.translations?.[0]?.translatedText) {
        return data.data.translations[0].translatedText;
      }
    } catch (err) {
      console.warn('External translation API error, using mock fallback:', err.message);
    }
  }

  // Tier 4: Deterministic Mock Fallback for Prototype
  return mockArabicTranslation(trimmed);
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function mockArabicTranslation(text) {
  const mockMap = {
    'Construction and site mobilization for the new example facility in Dammam industrial sector, requiring environmental permit issuance.':
      'أعمال الإنشاء والتجهيز الميداني للمرفق النموذجي الجديد في القطاع الصناعي بالدمام، والتي تتطلب إصدار تصريح بيئي.',
    'Construction': 'إنشاءات',
    'Permit': 'تصريح',
    'License': 'ترخيص',
    'Project': 'مشروع',
    'Work': 'عمل',
    'Industrial': 'صناعي',
    'Environmental': 'بيئي',
    'Supervisor': 'مشرف',
    'Current User': 'المستخدم الحالي',
    'Operations Director': 'مدير العمليات',
    'Case Manager': 'مدير المعاملة'
  };

  if (mockMap[text]) return mockMap[text];

  // Generic fallback format clearly denoting mock translation
  return `[مترجم: ${text}]`;
}
