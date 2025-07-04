import fs from "fs";
import path from "path";

const MAX_LINE_COUNT = 3000;
const MIN_LINE_COUNT = 300;
const FILE_PREFIX = "generated_content_file_";
const GENERATED_CONTENT_DIR =
  __dirname + "../../vanilla-starlight/src/content/generated";

function getLineCount(seed: number): number {
  const x = Math.sin(seed) * 10000;
  const r = x - Math.floor(x); // [0, 1)
  return Math.round(MIN_LINE_COUNT + r * (MAX_LINE_COUNT - MIN_LINE_COUNT));
}

function buildFileContents(fileNumber: number): string {
  let fileContents = `---
title: File ${fileNumber}
description: This is the description for file number ${fileNumber}.
---

# File ${fileNumber}`;

  const lineCount = getLineCount(fileNumber);
  for (let i = 0; i < lineCount; i++) {
    fileContents += `\nThis is line ${i + 1} of file ${fileNumber}.`;
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
    const fileName = `${p.outDir}/${FILE_PREFIX}${i}.md`;
    const fileContents = buildFileContents(i);
    console.log(`Writing to ${fileName}`);
    fs.writeFileSync(fileName, fileContents, "utf8");
  }
}

export function deleteGeneratedContentFiles(p: { dir: string }): void {
  // traverse the directory and delete files
  console.log(`Deleting content files in directory: ${p.dir}`);
  const files = fs.readdirSync(p.dir);
  files.forEach((file) => {
    const filePath = `${p.dir}/${file}`;
    if (fs.statSync(filePath).isFile() && file.startsWith(FILE_PREFIX)) {
      console.log(`Deleting file: ${filePath}`);
      fs.unlinkSync(filePath);
    } else {
      console.log(`Skipping non-file: ${filePath}`);
    }
  });
  console.log("Deletion complete.");
}
