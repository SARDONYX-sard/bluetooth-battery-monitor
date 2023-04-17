default: dev

# info|debug|error(default: debug)
LOG_LEVEL?=debug

dev:
	@echo "develop mode: log level(${LOG_LEVEL})"
	@export RUST_LOG=${LOG_LEVEL} && cargo tauri dev

build: deps
	cargo tauri build

deps:
	cargo install tauri-cli

update:
	deno task esm:update

fmt:
	deno fmt www
	cargo fmt

lint:
	deno lint www
	cargo clippy

.PHONY: dev build deps update fmt lint
