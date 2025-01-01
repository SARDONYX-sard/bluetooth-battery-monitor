// Copyright (c) 2023 Luma <lumakernel@gmail.com>
// SPDX-License-Identifier: MIT or Apache-2.0
//
// issue: https://github.com/suren-atoyan/monaco-react/issues/136#issuecomment-731420078
import Editor, { type OnMount } from '@monaco-editor/react';
import { isTauri } from '@tauri-apps/api/core';
import { type ComponentPropsWithoutRef, type MutableRefObject, memo, useCallback, useEffect, useRef } from 'react';

import { start } from '@/services/api/shell';

import { atomOneDarkPro } from './atom_onedark_pro';
import { loadVimKeyBindings } from './vim_key_bindings';

import type monaco from 'monaco-editor/esm/vs/editor/editor.api';
import type { VimEnvironment } from 'monaco-vim';

export type MonacoEditor = monaco.editor.IStandaloneCodeEditor;
export type VimModeRef = MutableRefObject<VimEnvironment | null>;
export type VimStatusRef = MutableRefObject<HTMLDivElement | null>;

type Props = ComponentPropsWithoutRef<typeof Editor> & {
  id?: string;
  /** use vim key binding? */
  readonly vimMode?: boolean;
};

export const MonacoEditor = memo(function MonacoEditor({ id, vimMode = false, onMount, ...params }: Props) {
  const editorRef = useRef<MonacoEditor | null>(null);
  const vimModeRef: VimModeRef = useRef(null);
  const vimStatusRef: VimStatusRef = useRef(null);

  const handleDidMount: OnMount = useCallback(
    (editor, monaco) => {
      setLangCustomConfig(monaco);

      editorRef.current = editor;
      if (vimMode) {
        loadVimKeyBindings({ editor, vimModeRef, vimStatusRef });
      }

      editor.updateOptions({
        theme: 'onedark',
      });
      onMount?.(editor, monaco);
    },
    [onMount, vimMode],
  );

  // NOTE: If we do not set the key bindings within `useEffect`, the switching will not work.
  //       If we do it in `handleDidMount`, the key bindings will not switch unless we reload the page.
  useEffect(() => {
    vimModeRef.current?.dispose();
    if (vimMode && editorRef.current) {
      loadVimKeyBindings({ editor: editorRef.current, vimModeRef, vimStatusRef });
    }
  }, [vimMode]);

  return (
    <>
      <Editor
        theme='vs-dark'
        {...params}
        beforeMount={(monaco) => monaco.editor.defineTheme('onedark', atomOneDarkPro)}
        onMount={handleDidMount}
      />
      {/* NOTE: status is forced to have `display: block` at `initVim` call, so you have to wrap it with a div to center it. */}
      <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
        <div ref={vimStatusRef} />
      </div>
    </>
  );
});

/**
 * - javascript: enable inlay-hint
 * - json: enable schema
 * */
const setLangCustomConfig = (monacoEnv: typeof monaco) => {
  // NOTE: By default, the URL is opened in the app, so prevent this and call the backend API to open the URL in the browser of each PC.
  if (isTauri()) {
    monacoEnv.editor.registerLinkOpener({
      open(url) {
        start(url.toString());
        //? False is for hooks, but true replaces the function.
        //? In this case, it is a replacement because it opens the URL with its own API.
        return true;
      },
    });
  }

  monacoEnv.languages.typescript.javascriptDefaults.setInlayHintsOptions({
    includeInlayFunctionLikeReturnTypeHints: true,
    includeInlayFunctionParameterTypeHints: true,
    includeInlayParameterNameHints: 'literals',
    includeInlayVariableTypeHints: true,
  });
  monacoEnv.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    allowComments: false,
    schemas: [],
    enableSchemaRequest: true,
  });
};
