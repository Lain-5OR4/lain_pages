import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const result = spawnSync(process.execPath, [require.resolve("next/dist/bin/next"), "build"], {
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_OPTIONS: [
      process.env.NODE_OPTIONS,
      `--import=${new URL("./build-network.mjs", import.meta.url).href}`,
    ]
      .filter(Boolean)
      .join(" "),
  },
});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
