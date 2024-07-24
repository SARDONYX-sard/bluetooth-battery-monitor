// Copyright (c) 2023 Luma <lumakernel@gmail.com>
// SPDX-License-Identifier: MIT or Apache-2.0
declare module 'monaco-vim' {
  class VimMode {
    dispose(): void;
    initVimMode(editor: editor.IStandaloneCodeEditor, statusbarNode?: Element | null): VimMode;
  }
  export function initVimMode(editor: editor.IStandaloneCodeEditor, statusbarNode?: HTMLElement): VimMode;
}
