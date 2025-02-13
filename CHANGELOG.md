# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2025-02-13
### :sparkles: New Features
- [`4e768d2`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/4e768d2462a9c4b73a61e28ab9a3cc7446475a03) - add updater functionality and configuration for desktop platforms *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`42a54dd`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/42a54dd3bd711b7160bb86c6487c06f735fcb72f) - **frontend**: implement updater dialog and navigation component with localization support *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`ab72275`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/ab7227574964c7a404e15f42c9b29775d2d3b5a6) - add icon type selection and configuration support *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`a0f3f18`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/a0f3f186107e3631dc93d8dcaffd618a23f0d492) - **i18n**: add localization support for icon type label in English and Japanese *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`a89b59a`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/a89b59a5ebd176039bfa3d45cb8a260ce2082172) - **monitor**: add Monitor Config button and dialog for configuration settings *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`66dfbb6`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/66dfbb6279b7ee30d04b4386e90350cab177388a) - **i18n**: add localization for Monitor Config button and dialog *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*

### :bug: Bug Fixes
- [`ec24fc6`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/ec24fc62d5a59a1ae7af0536fb656a2261628b41) - fix `isis_connected` getter *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`4bcaea1`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/4bcaea1384f06b9cabdc79a95c809b9540e0e335) - **bluetooth**: update last used date on connection state change *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`9e75c5d`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/9e75c5d8fd6bf9703267e9d59b0a5a5df1a77583) - **icon**: adjust battery image text scaling for better visibility *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`0b29465`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/0b294657a738ccdedc59ea33d059bca8874056a9) - **icon**: adjust battery image text scaling for improved clarity *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`edc14da`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/edc14da15f26a233381e9da9ab84ccdd119ee095) - **logging**: improve error messages for device information retrieval and battery level handling *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`2a22af4`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/2a22af4c8a99353c9363f083f371ab538f315ada) - fix uninitialized panics in notification plugins *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`07a64f2`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/07a64f215479baeff6406c69ee1130a5e782f5bd) - prevent multiple calls for interval and watch notifications. *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*

### :recycle: Refactors
- [`8909edc`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/8909edcfade8b96d6cf622488f9709864a653c92) - update type definitions for VimModeRef and VimStatusRef in MonacoEditor *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`ecc4817`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/ecc48179b131a0911e7aeeb329b7224cf89d828a) - **frontend**: remove unnecessary a component *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*


## [0.4.2] - 2025-01-21
### :sparkles: New Features
- [`d0b3726`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/d0b3726c80c128ec227a0de1c885abea29eff7da) - change TypeError display *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`f48bab1`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/f48bab1b8461d09eec0277c14907383884b37100) - **i18n**: add `Korean` language selector *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`5fe695a`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/5fe695aad56adf643dac04e692998151f38b0ad8) - add interval command *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`362e898`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/362e8983056716061cfdb01bd05e3c7d012499ca) - insert interval on setup *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*

### :recycle: Refactors
- [`9254c88`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/9254c885776bb03ef6e2ec00e0f82828624cf7c9) - separate to files *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*

### :wrench: Chores
- [`ff6cf1d`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/ff6cf1d9f968248994bc11b8d55df687415d3270) - **github**: add `0.4.1` selector in issue template *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`2669417`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/2669417e822ba1399751e44d14a0710ce11a7c00) - **locale**: sort key by alpha *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*


## [0.4.1] - 2025-01-20
### :sparkles: New Features
- [`468dde7`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/468dde7957aca6e8987dc6886b90ac587a705184) - add Aborted status *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*

### :bug: Bug Fixes
- [`248b0ad`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/248b0ad6205588632ea660f84c52a7c1eba332dc) - fix config error *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`525b2ed`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/525b2ed991a28334a26b46a62a88bae7e97c1a66) - ignore invalid device instance id *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`d81cd18`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/d81cd18c68301b5f02f3de059c4b427b6604dad2) - fix by lint *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*

### :wrench: Chores
- [`efd34cf`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/efd34cf2937200acd7025ccb5421c5c5785efffc) - **template**: add `0.4.0` *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*


## [0.4.0] - 2025-01-19
### :boom: BREAKING CHANGES
- due to [`c7130b6`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/c7130b62e819226bb93f689345c07e6ce5f3d469) - rename module name *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*:

  rename module name


### :sparkles: New Features
- [`25611e1`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/25611e1ccc7fcf3f24f1329fad63081492f6cdc6) - attempt to implement v2 tauri app *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`a3f3c64`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/a3f3c645627c0fae197e09b308343c0d73b43768) - implement watch & debug *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`380685b`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/380685bf7f3222505b97508c2f4d77d062cbe0f9) - add address parser *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`c7130b6`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/c7130b62e819226bb93f689345c07e6ce5f3d469) - rename module name *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`4863b65`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/4863b654e8b714de6b97820980067236a313474b) - impl watch *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`89ea05a`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/89ea05a3888d17449819177d77919a95ba6442c5) - for some reason, the tray icon doesn't show up all the time *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`a63e3c4`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/a63e3c4b241d58a851dc4814e1d091dfd98ade4f) - remove powershell script *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`6114fec`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/6114fec6cd52f99f5caa71e49fad2e83f51295e3) - add os menu *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`69bedef`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/69bedef683cc0bc67b79b6c5af6540b8cbceda39) - add powerOff color images *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`2ff6485`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/2ff648562e5e4fe4d42005ced3b0eab0c5da1f0a) - change menu text *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*

### :bug: Bug Fixes
- [`cbbbbe2`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/cbbbbe2003c46b809a1e6540d268ca546d947cce) - update event *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`4a37e24`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/4a37e24440c3b577c37c3587a6d37356db401ef3) - fix tray click double event *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`f52c5e8`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/f52c5e88b13f2cef7908565131f30bb7084ca780) - fix license path *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*

### :recycle: Refactors
- [`c66d835`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/c66d835c48afecfe28e513a024a3e013b696f6fd) - remove unused code *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`5bf71f1`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/5bf71f1679e1de25562696845cbad153078e7739) - change to modern *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*

### :wrench: Chores
- [`6a029f1`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/6a029f184b082390c367862e8da7547a0d4a425f) - **backend-log**: remove duplicate log *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`81a1128`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/81a11284757ba688accf1db67dbb974bae12db24) - turn off metadata lint *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`93aa444`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/93aa444c9705e5a0e698b333dbf0a4c2b6bb527d) - **npm**: add `description` *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`721a46d`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/721a46d2b1466e133647cbe1c093706559b1a82f) - remove `global.d.ts` *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*
- [`0d26028`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/0d260286c79c76cc1000a420c7522098489a2b0f) - use `as` *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*


## [0.3.1] - 2024-07-27
### :bug: Bug Fixes
- [`ded5008`](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/commit/ded5008c07c42fef81ed58335fcf26d9843db2f1) - fix config *(commit by [@SARDONYX-sard](https://github.com/SARDONYX-sard))*

[0.3.1]: https://github.com/SARDONYX-sard/bluetooth-battery-monitor/compare/0.3.0...0.3.1
[0.4.0]: https://github.com/SARDONYX-sard/bluetooth-battery-monitor/compare/0.3.1...0.4.0
[0.4.1]: https://github.com/SARDONYX-sard/bluetooth-battery-monitor/compare/0.4.0...0.4.1
[0.4.2]: https://github.com/SARDONYX-sard/bluetooth-battery-monitor/compare/0.4.1...0.4.2
[0.5.0]: https://github.com/SARDONYX-sard/bluetooth-battery-monitor/compare/0.4.3...0.5.0
