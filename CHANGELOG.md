# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
