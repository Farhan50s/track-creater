import * as fs from 'fs';
import * as path from 'path';

const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

console.log('Found', files.length, 'migration files in order:\n');
files.forEach((f, idx) => {
  console.log(`${idx + 1}. ${f}`);
});

console.log('\n--- Consolidated SQL Migration Output ---');
for (const file of files) {
  const filePath = path.join(migrationsDir, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  console.log(`\n-- ==========================================`);
  console.log(`-- Migration: ${file}`);
  console.log(`-- ==========================================\n`);
  console.log(content);
}
