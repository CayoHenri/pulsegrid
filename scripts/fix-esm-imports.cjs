const { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } = require("node:fs");
const { join, relative, resolve } = require("node:path");

const outputDirectory = resolve("dist");

function updateJavaScriptImports(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const filePath = join(directory, entry.name);

    if (entry.isDirectory()) {
      updateJavaScriptImports(filePath);
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith(".js")) continue;

    const content = readFileSync(filePath, "utf8");
    const updated = content.replace(
      /(\b(?:from\s*|import\s*\())(["'])(\.{1,2}\/[^"']+)\2/g,
      (specifier, prefix, quote, importPath) => {
        const extension = /\.[a-z\d]+$/i.exec(importPath)?.[0];
        if (extension === ".js" || extension === ".json") return specifier;
        if (extension === ".ts") {
          return `${prefix}${quote}${importPath.slice(0, -3)}.js${quote}`;
        }
        return `${prefix}${quote}${importPath}.js${quote}`;
      },
    );

    if (content !== updated) writeFileSync(filePath, updated);
  }
}

const prismaOutputDirectory = join(outputDirectory, "prisma");
mkdirSync(prismaOutputDirectory, { recursive: true });
for (const fileName of ["db.js", "contract.json"]) {
  copyFileSync(resolve("prisma", fileName), join(prismaOutputDirectory, fileName));
}
updateJavaScriptImports(outputDirectory);
writeFileSync(
  join(outputDirectory, "package.json"),
  JSON.stringify({ type: "module" }, null, 2),
);
console.log(`Prepared ESM imports in ${relative(process.cwd(), outputDirectory)}.`);
