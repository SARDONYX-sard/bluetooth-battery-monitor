# Bluetooth battery monitor

<div style="display:grid;place-items:center">
   <img src="./src-tauri/icons/128x128.png" alt="bluetooth battery monitor icon"/>
</div>

## Supported Features

- [x] Bluetooth classic device search
- [x] Battery information acquisition for Bluetooth classic
- [x] Autostart at PC startup
- [x] Battery information acquisition interval setting
- [x] CSS customization

## Features to be implemented

- [ ] Support pages including links to source code pages, license information, version information, etc.
- [ ] Abundant CSS options
- [ ] Localization

## Unsupported Features

- Reason: the author does not have a supported device.

- [ ] Bluetooth LE device search
- [ ] Battery information acquisition for Bluetooth LE

![Bluetooth battery monitor GUI](https://user-images.githubusercontent.com/68905624/233191197-0c2906b7-c823-41dc-a417-11abac34474e.png)

![settings page](https://user-images.githubusercontent.com/68905624/233191832-4e314825-0b5b-484d-baeb-7c0d3dbdaee9.png)

## Development & Build

- `src-tauri`: Rust backend
- `www`: Web frontend
- `bundle.ts`: Script to bundle your frontend

Prerequisites:

- [Rust](https://www.rust-lang.org/)
- [Deno](https://deno.land/)
- [Tauri](https://tauri.studio/v1/guides/getting-started/beginning-tutorial#alternatively-install-tauri-cli-as-a-cargo-subcommand)
- [Tauri os-specific dependencies](https://tauri.studio/v1/guides/getting-started/prerequisites#installing)

Development:

|  Command   |    Explain   |
| :--------- | :----------: |
| make dev   |  Development |
| make build |   Building   |
| make fmt   |  Formatting  |
| make lint  |    Linting   |

And Consider to read the following documentations.

- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Guidelines for contribution](./CONTRIBUTING.md)

## License

Licensed under either of

- Apache License, Version 2.0
   ([LICENSE-APACHE](LICENSE-APACHE) or <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT license
   ([LICENSE-MIT](LICENSE-MIT) or <http://opensource.org/licenses/MIT>)

at your option.
