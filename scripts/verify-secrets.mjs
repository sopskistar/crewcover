import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { parseEnv } from "node:util";

// Read credentials internally; output only aggregate counts.
const secrets = [
  ...new Set(
    [".env", ".env.local"].flatMap((file) =>
      existsSync(file)
        ? Object.entries(parseEnv(readFileSync(file, "utf8")))
            .filter(
              ([key, value]) =>
                /KEY|SECRET|TOKEN|PASSWORD|DATABASE_URL/i.test(key) &&
                value.length >= 20,
            )
            .map(([, value]) => value)
        : [],
    ),
  ),
];
const paths = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  { encoding: "utf8" },
)
  .split("\0")
  .filter(Boolean);
const forbidden = paths.filter(
  (path) =>
    (/(^|\/)\.env(\.|$)/.test(path) &&
      !path.endsWith(".example") &&
      !path.endsWith(".sample")) ||
    /^(\.tmp|test-results|playwright-report|\.vercel)\//.test(path),
);
const clientFiles = [];
function walk(directory) {
  if (!existsSync(directory)) return;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) walk(path);
    else if (entry.isFile()) clientFiles.push(path);
  }
}
walk(".vercel/output/static");
let matches = 0;
for (const path of [...paths, ...clientFiles]) {
  let content;
  try {
    content = readFileSync(path);
  } catch {
    continue;
  }
  if (secrets.some((secret) => content.includes(Buffer.from(secret))))
    matches++;
}
console.log(
  `Secret scan: ${paths.length} Git candidate files; ${clientFiles.length} public build files; ${forbidden.length} forbidden private files; ${matches} credential matches.`,
);
if (forbidden.length || matches) process.exitCode = 1;
