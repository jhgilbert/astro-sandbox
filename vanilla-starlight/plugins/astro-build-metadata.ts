import { execSync } from "child_process";
import fs from "fs";
import glob from "fast-glob";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Astro integration that emits a JSON file of last modified timestamps
 * from Git for all non-ignored files in a target directory inside a repo.
 */
export default function buildMetadataPlugin() {
  const absRepoDir = path.resolve(__dirname + "/../..");

  return {
    name: "astro-build-metadata-plugin",
    hooks: {
      "astro:build:start": async () => {
        console.log(`Using repo dir: ${absRepoDir}`);
        const result = getGitModifiedFilesMatching(absRepoDir, /.*\.md$/);
        console.log(`Found ${Object.keys(result).length} modified files.`);
        console.log(JSON.stringify(result, null, 2));
      },
    },
  };
}

export function getGitModifiedFilesMatching(
  absRepoPath: string,
  matchRegex: RegExp
): Record<string, string> {
  const result: Record<string, string> = {};

  // Get last commit date + file path for all files
  const output = execSync(
    `git log --name-only --pretty=format:"%cI" --diff-filter=AM`,
    { cwd: absRepoPath, encoding: "utf8" }
  );

  const lines = output.split("\n");
  let currentTimestamp: string | null = null;

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === "") continue;

    // If line looks like a timestamp (starts with 4-digit year)
    if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
      currentTimestamp = trimmed;
    } else if (currentTimestamp && matchRegex.test(trimmed)) {
      // Only keep the most recent timestamp per file
      if (!result[trimmed]) {
        result[trimmed] = currentTimestamp;
      }
    }
  }

  return result;
}

/*
const lastModified = "2025-07-04T14:22:35Z"; // from Git
const now = new Date();

// Convert to Date object
const lastModifiedDate = new Date(lastModified);

// Compare
const isRecent = now.getTime() - lastModifiedDate.getTime() < 1000 * 60 * 60 * 24; // < 24 hours

console.log(`Last modified: ${lastModifiedDate.toISOString()}`);
console.log(`Now: ${now.toISOString()}`);
console.log(`Is recent? ${isRecent}`);
*/
