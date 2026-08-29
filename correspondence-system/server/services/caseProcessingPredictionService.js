import { spawn } from 'child_process';
import path from 'path';

const PREDICT_SCRIPT = path.resolve(process.cwd(), 'ML', 'predict_case_processing.py');
const PYTHON_COMMAND = process.env.PYTHON_COMMAND || 'python';

export function predictCaseProcessingDays(caseItem) {
  const input = {
    Region: normalizeRegion(caseItem.province),
    City: caseItem.city,
    Government_Entity: caseItem.government_entity_name,
    Project_Type: caseItem.project_type,
    Work_Method: caseItem.work_method || 'N/A'
  };

  return new Promise((resolve, reject) => {
    const child = spawn(PYTHON_COMMAND, [PREDICT_SCRIPT], {
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true
    });
    let stdout = '';
    let stderr = '';

    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error('Case processing prediction timed out'));
    }, 10000);

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });
    child.on('error', error => {
      clearTimeout(timeout);
      reject(error);
    });
    child.on('close', code => {
      clearTimeout(timeout);
      if (code !== 0) {
        return reject(new Error(stderr.trim() || `Prediction process exited with code ${code}`));
      }
      try {
        const result = JSON.parse(stdout);
        resolve(result.estimated_processing_days);
      } catch (error) {
        reject(new Error(`Invalid prediction response: ${error.message}`));
      }
    });

    child.stdin.end(JSON.stringify(input));
  });
}

function normalizeRegion(province) {
  const regionMap = {
    Western: 'Makkah Region',
    Central: 'Riyadh Region',
    Eastern: 'Eastern Region'
  };
  return regionMap[province] || province;
}
