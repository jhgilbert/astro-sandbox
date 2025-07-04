import fs from "fs";

const MAX_SECTION_COUNT = 25;
const MIN_SECTION_COUNT = 4;
const FILE_PREFIX = "generated_content_file_";
const GENERATED_CONTENT_DIR =
  __dirname + "/../../vanilla-starlight/src/content/generated";

function getSectionCount(seed: number): number {
  const x = Math.sin(seed) * 10000;
  const r = x - Math.floor(x); // [0, 1)
  return Math.round(
    MIN_SECTION_COUNT + r * (MAX_SECTION_COUNT - MIN_SECTION_COUNT)
  );
}

function getDirectoryName(p: {
  fileNumber: number;
  filesPerDir: number;
}): string {
  return Math.floor((p.fileNumber - 1) / p.filesPerDir + 1).toString();
}

function getFilePath(p: { outDir: string; fileNumber: number }): string {
  const greatGrandparentDir = getDirectoryName({
    fileNumber: p.fileNumber,
    filesPerDir: 1000,
  });
  const grandparentDir = getDirectoryName({
    fileNumber: p.fileNumber,
    filesPerDir: 100,
  });
  const parentDir = getDirectoryName({
    fileNumber: p.fileNumber,
    filesPerDir: 25,
  });

  return `${p.outDir}/${greatGrandparentDir}/${grandparentDir}/${parentDir}/${FILE_PREFIX}${p.fileNumber}.md`;
}

function buildFileContents(fileNumber: number): string {
  let fileContents = `---
title: File ${fileNumber}
description: This is the description for file number ${fileNumber}.
---

# File ${fileNumber}\n`;

  const lineCount = getSectionCount(fileNumber);
  for (let i = 0; i < lineCount; i++) {
    fileContents += `\n## Section ${i} of file ${fileNumber}

This is section ${i} of file ${fileNumber}.

It has a list:
- [Item 1](https://example.com/item1)
- **Item 2**
- *Item 3*

And a code block:

\`\`\`javascript
console.log("This is a code block in file ${fileNumber}, section ${i}");
\`\`\`

That's the end of section ${i} in file ${fileNumber}.\n`;
  }

  return fileContents;
}

export function generateContentFiles(p: {
  outDir: string;
  fileCount: number;
}): void {
  console.log(`Generating content files in directory: ${p.outDir}`);
  console.log(`Number of files to generate: ${p.fileCount}`);

  for (let i = 1; i <= p.fileCount; i++) {
    const filePath = getFilePath({
      outDir: p.outDir,
      fileNumber: i,
    });
    const fileContents = buildFileContents(i);
    console.log(`Writing to ${filePath}`);
    fs.mkdirSync(require("path").dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, fileContents, "utf8");
  }
}

export function deleteGeneratedContentFiles(p: { dir: string }): void {
  console.log(`Deleting all generated content files in directory: ${p.dir}`);
  const files = fs.readdirSync(p.dir);
  files.forEach((file) => {
    const filePath = `${p.dir}/${file}`;
    if (fs.statSync(filePath).isDirectory()) {
      deleteGeneratedContentFiles({ dir: filePath });
      if (fs.readdirSync(filePath).length === 0) {
        fs.rmdirSync(filePath);
      }
    } else if (fs.statSync(filePath).isFile() && file.startsWith(FILE_PREFIX)) {
      fs.unlinkSync(filePath);
    }
  });
  console.log("Deletion complete.");
}

deleteGeneratedContentFiles({
  dir: GENERATED_CONTENT_DIR,
});

generateContentFiles({
  outDir: GENERATED_CONTENT_DIR,
  fileCount: 5000,
});
