import type { MonacoEditor, VimModeRef, VimStatusRef } from './MonacoEditor';
import type MonacoVim from 'monaco-vim';
import type { Vim } from 'monaco-vim';

type DefineVimExCommand = {
  actionId: string;
  editor: MonacoEditor;
  /** - `actionId: 'editor.action.jumpToBracket'` => `exCommand: 'jumpToBracket'` */
  exCommand?: string;
  key: string;
  mode?: 'normal' | 'insert' | 'visual';
  vim: Vim;
};

const defineVimExCommand = ({ vim, exCommand, editor, actionId, key, mode }: DefineVimExCommand) => {
  const cmd = exCommand ?? actionId.split('.').at(-1) ?? actionId;
  vim.defineEx(cmd, cmd, () => {
    editor.getAction(actionId)?.run();
  });
  vim.map(key, `:${cmd}`, mode ?? 'normal');
};

const setCustomVimKeyConfig = (editor: MonacoEditor, vim: Vim) => {
  for (const key of ['jj', 'jk', 'kj'] as const) {
    vim.map(key, '<Esc>', 'insert');
  }

  const vimExCommands = [
    { actionId: 'editor.action.jumpToBracket', key: '%' },
    { actionId: 'editor.action.openLink', key: 'gx' },
    { actionId: 'editor.action.revealDefinition', key: 'gd' },
    { actionId: 'editor.action.showDefinitionPreviewHover', key: 'KK' }, // For some reason, it doesn't work.
    { actionId: 'editor.action.showHover', key: 'K' },
  ] as const satisfies Omit<DefineVimExCommand, 'vim' | 'editor'>[];

  for (const command of vimExCommands) {
    defineVimExCommand({ ...command, vim, editor });
  }
};

type VimKeyLoader = (props: { editor: MonacoEditor; vimModeRef: VimModeRef; vimStatusRef: VimStatusRef }) => void;
export const loadVimKeyBindings: VimKeyLoader = ({ editor, vimModeRef, vimStatusRef }) => {
  // @ts-ignore
  window.require.config({
    paths: {
      'monaco-vim': 'https://unpkg.com/monaco-vim/dist/monaco-vim',
    },
  });
  // @ts-ignore
  window.require(['monaco-vim'], (monacoVim: typeof MonacoVim) => {
    const { Vim } = monacoVim.VimMode;
    setCustomVimKeyConfig(editor, Vim);

    if (vimStatusRef.current) {
      vimModeRef.current = monacoVim.initVimMode(editor, vimStatusRef.current);
    }
  });
};
