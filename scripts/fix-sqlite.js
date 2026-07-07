const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? 
      walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace .get(...)
    content = content.replace(/sqlite\.prepare\(([`"'].*?[`"'])\)\.get\((.*?)\)/g, '(await sqlite.execute({sql: $1, args: [$2]})).rows[0]');
    content = content.replace(/sqlite\.prepare\(([`"'].*?[`"'])\)\.get\(\)/g, '(await sqlite.execute($1)).rows[0]');

    // Replace .all(...)
    content = content.replace(/sqlite\.prepare\(([`"'].*?[`"'])\)\.all\((.*?)\)/g, '(await sqlite.execute({sql: $1, args: [$2]})).rows');
    content = content.replace(/sqlite\.prepare\(([`"'].*?[`"'])\)\.all\(\)/g, '(await sqlite.execute($1)).rows');

    // Replace .run(...)
    content = content.replace(/sqlite\.prepare\(([`"'].*?[`"'])\)\.run\((.*?)\)/g, 'await sqlite.execute({sql: $1, args: [$2]})');
    content = content.replace(/sqlite\.prepare\(([`"'].*?[`"'])\)\.run\(\)/g, 'await sqlite.execute($1)');

    if (content !== original) {
      console.log(`Updated ${filePath}`);
      fs.writeFileSync(filePath, content, 'utf8');
    }
  }
});
