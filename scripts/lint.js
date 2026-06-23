import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const roots = ['src', 'tests', 'scripts'];
const jsFiles = roots.flatMap((root) => collectJavaScriptFiles(path.resolve(root)));
const failures = [];

for (const file of jsFiles) {
  const syntax = spawnSync(process.execPath, ['--check', file], {
    encoding: 'utf8'
  });

  if (syntax.status !== 0) {
    failures.push(`${file}\n${syntax.stderr || syntax.stdout}`);
  }

  const content = readFileSync(file, 'utf8');
  const trailingSpaceLine = content.split('\n').findIndex((line) => /\s+$/.test(line));

  if (trailingSpaceLine !== -1) {
    failures.push(`${file}: linha ${trailingSpaceLine + 1} contém espaço em branco no final.`);
  }
}

if (failures.length > 0) {
  console.error(failures.join('\n\n'));
  process.exit(1);
}

console.log(`Qualidade validada em ${jsFiles.length} arquivos JavaScript.`);

function collectJavaScriptFiles(directory) {
  const entries = readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...collectJavaScriptFiles(fullPath));
    }

    if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }

  return files;
}

