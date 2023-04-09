# Deno 🦕 + Tauri

Starter template for Tauri, bundling the frontend made with React using Deno
with esbuild.

You can use TypeScript or JavaScript. With React or any other library, or just
vanilla, with no extra steps.

- `src-tauri`: Rust backend
- `www`: Web frontend
- `build.ts`: Script to build your frontend
- `bundle.ts`: Script to bundle your frontend while developing

Prerequisites:

- [Rust](https://www.rust-lang.org/)
- [Deno](https://deno.land/)
- [Tauri](https://tauri.studio/v1/guides/getting-started/beginning-tutorial#alternatively-install-tauri-cli-as-a-cargo-subcommand)
- [Tauri os-specific dependencies](https://tauri.studio/v1/guides/getting-started/prerequisites#installing)

Development:

```shell
cargo tauri dev
```

Building:

```shell
cargo tauri build
```

Formatting:

```shell
deno fmt www
cargo fmt
```

Linting:

```shell
deno lint www
cargo clippy
```

## License

Licensed under either of

- Apache License, Version 2.0
   ([LICENSE-APACHE](LICENSE-APACHE) or <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT license
   ([LICENSE-MIT](LICENSE-MIT) or <http://opensource.org/licenses/MIT>)

at your option.

## Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted
for inclusion in the work by you, as defined in the Apache-2.0 license, shall be
dual licensed as above, without any additional terms or conditions.
