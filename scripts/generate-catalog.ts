import * as fs from 'fs';
import * as path from 'path';
import YAML from 'yaml';

const catalog: Record<string, { correct_index: number; explanation: string }> = {};

function scanDir(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDir(fullPath);
    } else if (entry.name.endsWith('.yaml') && entry.name !== 'skeleton.yaml') {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const parsed = YAML.parse(content);
        if (parsed.quiz_pool && Array.isArray(parsed.quiz_pool)) {
          for (const q of parsed.quiz_pool) {
            if (q.question) {
              catalog[q.question.trim()] = {
                correct_index: q.correct_index ?? 0,
                explanation: q.explanation || ''
              };
            }
          }
        }
      } catch (e: any) {
        console.error('Error parsing', fullPath, e.message);
      }
    }
  }
}

scanDir('content-drafts');

const outPath = 'src/features/quiz/utils/explanationsCatalog.ts';
const fileContent = '// Auto-generated explanation catalog from content drafts\n' +
  'export const explanationsCatalog: Record<string, { correct_index: number; explanation: string }> = ' +
  JSON.stringify(catalog, null, 2) + ';\n';

fs.writeFileSync(outPath, fileContent, 'utf-8');
console.log('Catalog generated with', Object.keys(catalog).length, 'questions!');
