// Copyright (c) 2023 Luma <lumakernel@gmail.com>
// SPDX-License-Identifier: MIT or Apache-2.0
//
// issue: https://github.com/suren-atoyan/monaco-react/issues/136#issuecomment-731420078
'use client';
import Editor, { type OnMount } from '@monaco-editor/react';
import { type ComponentProps, memo, useCallback, useRef } from 'react';

import { atomOneDarkPro } from './atom_onedark_pro';

import type monaco from 'monaco-editor/esm/vs/editor/editor.api';
import type { VimMode } from 'monaco-vim';

const loadVimKeyBindings: OnMount = (editor, monaco) => {
  // setup key bindings before monaco-vim setup

  // setup key bindings
  editor.addAction({
    // an unique identifier of the contributed action
    id: 'some-unique-id',
    // a label of the action that will be presented to the user
    label: 'Some label!',
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],

    // the method that will be executed when the action is triggered.
    run: (editor) => {
      alert(`we wanna save something => ${editor.getValue()}`);
    },
  });

  // setup monaco-vim
  // @ts-ignore
  window.require.config({
    paths: {
      'monaco-vim': 'https://unpkg.com/monaco-vim/dist/monaco-vim',
    },
  });

  // @ts-ignore
  window.require(['monaco-vim'], (monacoVim: VimMode) => {
    const statusNode = document.querySelector('#status-node');
    monacoVim.initVimMode(editor, statusNode);
  });
};

export type CodeEditorProps = ComponentProps<typeof Editor> & {
  readonly vimMode?: boolean;
};
function CodeEditorInternal({ vimMode = false, onMount, ...params }: CodeEditorProps) {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  const handleDidMount: OnMount = useCallback(
    (editor, monaco) => {
      editorRef.current = editor;
      if (vimMode) {
        loadVimKeyBindings(editor, monaco);
      }

      editor.updateOptions({
        theme: 'onedark',
      });
      onMount?.(editor, monaco);
    },
    [onMount, vimMode],
  );

  return (
    <Editor
      key=''
      theme='vs-dark'
      {...params}
      beforeMount={(monaco) => {
        monaco.editor.defineTheme('onedark', atomOneDarkPro);
      }}
      onMount={handleDidMount}
    />
  );
}

export const CodeEditor = memo(CodeEditorInternal);
