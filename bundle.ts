/**
 * Usage:
 *
 *
 * - dev:
 *     deno run -A ./bundle.ts --dev
 *
 * - watch-release:
 *     deno run -A ./bundle.ts --dev --release
 *
 * - build:
 *     deno run -A ./bundle.ts --build
 *
 * - build-release:
 *     deno run -A ./bundle.ts --release
 */

import * as esbuild from "https://deno.land/x/esbuild@v0.17.14/mod.js";
import { denoPlugin } from "https://deno.land/x/esbuild_deno_loader@0.6.0/mod.ts";
import { parse } from "https://deno.land/std@0.181.0/flags/mod.ts";

const common_opts: esbuild.BuildOptions = {
  plugins: [
    denoPlugin({
      // See: https://github.com/lucacasonato/esbuild_deno_loader/issues/29#issuecomment-1458880891
      importMapURL: new URL("./import_map.json", import.meta.url),
    }) as unknown as esbuild.Plugin,
  ],
  entryPoints: ["./www/index.tsx"],
  outfile: "./www/dist/main.js",
  format: "esm",
  bundle: true,
};

const dev_opts: esbuild.BuildOptions = {
  sourcemap: true,
};

const release_opts: esbuild.BuildOptions = {
  minify: true,
  sourcemap: false,
};

async function build(opts: esbuild.BuildOptions) {
  await esbuild.build({ ...common_opts, ...opts });
  esbuild.stop();
}

async function dev(opts: esbuild.BuildOptions) {
  // https://github.com/evanw/esbuild/blob/main/CHANGELOG.md#0170
  const context = await esbuild.context({
    ...common_opts,
    ...dev_opts, // overwrite common
    ...opts,
  });
  await context.watch();
  await context.serve({
    port: 3000,
    servedir: "www",
  });
}

const flags = parse(Deno.args, {
  boolean: ["build", "dev", "release"],
});

const overwrite_opts = flags.release ? release_opts : {};
if (flags.dev) {
  dev(overwrite_opts);
} else if (flags.build || flags.release) {
  build(overwrite_opts);
}
