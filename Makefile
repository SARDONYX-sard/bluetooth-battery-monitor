default: dev

# info|debug|error(default: debug)
LOG_LEVEL?=debug

dev:
	@echo "develop mode: log level(${LOG_LEVEL})"
	@export RUST_LOG=${LOG_LEVEL} && cargo tauri dev

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

deps:
	cargo install create-tauri-app

.PHONY: dev build build-release update fmt lint
