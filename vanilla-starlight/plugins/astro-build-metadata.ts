import { execSync } from "child_process";
import path from "path";
import fs from "fs";
import glob from "fast-glob";

/**
 * Astro integration that emits a JSON file of last modified timestamps
 * from Git for all non-ignored files in a target directory inside a repo.
 */
export default function buildMetadataPlugin({
  repoDir,
  analyzeDir,
  outputFilePath,
}: {
  repoDir: string;
  analyzeDir: string;
  outputFilePath: string;
}) {
  const absRepoDir = path.resolve(repoDir);
  const absAnalyzeDir = path.isAbsolute(analyzeDir)
    ? analyzeDir
    : path.resolve(absRepoDir, analyzeDir);
  const absOutputFilePath = path.resolve(outputFilePath);

  return {
    name: "astro-build-metadata-plugin",
    hooks: {
      "astro:build:start": async () => {
        console.log("\n\n🚧 Generating last-modified metadata from Git...\n");

        const files = await glob(["**/*"], {
          cwd: absAnalyzeDir,
          onlyFiles: true,
          dot: true,
        });

        const result: Record<string, string> = {};

        for (const relativeFile of files) {
          const fullPath = path.join(absAnalyzeDir, relativeFile);
          const gitRelativePath = path.relative(absRepoDir, fullPath);

          // Skip files ignored by Git
          try {
            const ignoreResult = execSync(
              `git check-ignore "${gitRelativePath}"`,
              { cwd: absRepoDir, stdio: "pipe" }
            )
              .toString()
              .trim();

            if (ignoreResult) {
              continue; // File is ignored, skip it
            }
          } catch {
            // check-ignore throws if file is not ignored — we want this
          }

          try {
            const timestamp = execSync(
              `git log -1 --format="%cI" -- "${gitRelativePath}"`,
              { cwd: absRepoDir }
            )
              .toString()
              .trim();

            result[relativeFile] = timestamp;
          } catch {
            result[relativeFile] = "untracked";
          }
        }

        fs.mkdirSync(path.dirname(absOutputFilePath), { recursive: true });
        fs.writeFileSync(absOutputFilePath, JSON.stringify(result, null, 2));

        console.log(
          `✅ Wrote ${
            Object.keys(result).length
          } entries to ${absOutputFilePath}\n`
        );
      },
    },
  };
}
