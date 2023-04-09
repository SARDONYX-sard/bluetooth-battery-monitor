default: dev

dev:
	cargo tauri dev

build:
	deno run -A ./bundle.ts --build
	cargo tauri build

build-release:
	deno run -A ./bundle.ts --release
	cargo tauri build

update:
	deno task esm:update

fmt:
	deno fmt www
	cargo fmt

lint:
	deno lint www
	cargo clippy

.PHONY: dev build build-release update fmt lint
