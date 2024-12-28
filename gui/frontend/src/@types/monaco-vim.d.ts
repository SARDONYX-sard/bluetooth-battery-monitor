// Copyright (c) 2023 Luma <lumakernel@gmail.com>
// Copyright (c) 2024 SARDONYX
// SPDX-License-Identifier: MIT or Apache-2.0

// NOTE: Type is not read correctly when using the `import` statement because it was obtained via CDN and does not exist in `node_modules`.

declare module 'monaco-vim' {
  // Interface for the StatusBar
  interface StatusBar {
    addInputListeners(): void;
    removeInputListeners(): void;
    setInnerHtml_(html: string, options?: any): void;
    setKeyBuffer(buffer: string): void;
    setMode(mode: string): void;
    setSec(sec: string, options?: any): void;
    setText(text: string): void;
    showNotification(notification: string): void;
    toggleVisibility(visible: boolean): void;
  }

  /**
   * Return value object of `initVimMode`
   *
   * - NOTE: TypeScript interface based on the provided devtool information
   */
  interface VimEnvironment extends VimMode {
    $uid: number;
    attached: boolean;
    ctxInsert: {
      _service: string;
      _key: string;
      _defaultValue: boolean;
    };
    curOp: {
      selectionChanged: boolean;
    };
    disposables: object[]; // Adjust this based on the actual types of disposables
    editor: editor.IStandaloneCodeEditor;
    handleChange: (e: any) => void;
    handleCursorChange: (n: any) => void;
    handleKeyDown: (n: any) => void;
    initialCursorWidth: number;
    listeners: {
      'vim-mode-change': Function[];
      'vim-keypress': Function[];
      'vim-command-done': Function[];
      dispose: any[];
      cursorActivity: any[];
    };
    marks: object; // Define the structure of marks if possible
    options: {
      $customCursor: () => void;
    };
    state: {
      keyMap: string;
      disableInput: boolean;
      showCursorWhenSelecting: boolean;
      vim: object; // Define further structure based on vim details
    };
    statusBar: {
      closeInput: () => void;
      clear: () => void;
      inputKeyUp: () => void;
      inputKeyInput: () => void;
      inputBlur: () => void;
      // More methods may be added based on the actual status bar behavior
    };
  }

  interface VimMode {
    addLocalListeners: () => void;
    addOverlay: (e: any, t: any, n: any) => void;
    attach: () => void;
    charCoords: (e: any, t: any) => any;
    clipPos: (e: any) => any;
    constructor: (e: any) => void;
    coordsChar: (e: any, t: any) => any;
    defaultTextHeight: () => number;
    dispatch: (e: any) => void;
    dispose: () => void;
    enterVimMode: () => void;
    execCommand: (e: any) => void;
    findFirstNonWhiteSpaceCharacter: (e: any) => any;
    findMatchingBracket: (e: any) => any;
    findPosV: (e: any, t: any, n: any) => any;
    firstLine: () => any;
    focus: () => void;
    getAnchorForSelection: (t: any) => any;
    getConfiguration: () => any;
    getCursor: () => any;
    getHeadForSelection: (t: any) => any;
    getInputField: () => any;
    getLine: (e: any) => any;
    getOption: (e: any) => any;
    getRange: (t: any, n: any) => any;
    getScrollInfo: () => any;
    getSearchCursor: (e: any, t: any) => any;
    getSelection: () => any;
    getSelections: () => any;
    getUserVisibleLines: () => any;
    getWrapperElement: () => any;
    handleReplaceMode: (t: any, n: any) => void;
    highlightRanges: (t: any) => void;
    indentLine: (n: any) => void;
    indexFromPos: (e: any) => any;
    lastLine: () => any;
    leaveVimMode: () => void;
    lineCount: () => any;
    listSelections: () => any;
    markText: (e: any) => any;
    moveCurrentLineTo: (t: any) => void;
    moveCursorTo: (e: any) => void;
    moveH: (t: any, n: any) => void;
    off: (e: any, t: any) => void;
    on: (e: any, t: any) => void;
    openDialog: (e: any, t: any, n: any) => void;
    openNotification: (e: any) => void;
    operation: (e: any, t: any) => void;
    posFromIndex: (e: any) => any;
    pushUndoStop: () => void;
    removeOverlay: () => void;
    replaceRange: (t: any, n: any, r: any) => void;
    replaceSelections: (e: any) => void;
    scanForBracket: (e: any, t: any, n: any, r: any) => void;
    scrollIntoView: (e: any) => void;
    scrollTo: (e: any, t: any) => void;
    setBookmark: (e: any, t: any) => void;
    setCursor: (e: any, t: any) => void;
    setOption: (t: any, n: any) => void;
    setSelection: (t: any, n: any) => void;
    setSelections: (t: any, n: any) => void;
    setStatusBar: (e: any) => void;
    smartIndent: () => void;
    somethingSelected: () => boolean;
    toggleOverwrite: (e: any) => void;
    triggerEditorAction: (e: any) => void;
    virtualSelectionMode: () => void;
  }

  // Interface for Vim
  interface Vim {
    InsertModeKey(key: string): void;
    buildKeyMap(): void;
    defineAction(action: string, fn: Function): void;
    /**
     * # Example
     * ```typescript
     * VimMode.Vim.defineEx('write', 'w', function() {
     *   // your own implementation on what you want to do when :w is pressed
     *   localStorage.setItem('editorvalue', editor.getValue());
     * });
     * ```
     * @see [Defining ex mode command](https://github.com/brijeshb42/monaco-vim?tab=readme-ov-file#defining-ex-mode-command)
     */
    defineEx(name: string, shortName: string, fn: Function): void;
    defineMotion(motion: string, fn: Function): void;
    defineOperator(operator: string, fn: Function): void;
    defineOption(name: string, defaultValue: any, type: string, options?: any): void;
    defineRegister(name: string, handler: Function): void;
    exitInsertMode(editor: any): void;
    exitVisualMode(editor: any, options?: any): void;
    findKey(key: string, options?: any, editor?: any): void;
    getOption(option: string, options?: any, editor?: any): any;
    getRegisterController(): any;
    getVimGlobalState_(): any;
    handleEx(command: string, options?: any): void;
    handleKey(key: string, editor: any, options?: any): void;
    /**
     *
     * @param lhs
     * @param rhs
     * @param options
     * # Examples
     * ```ts
     * // monacoVim: default export module
     * monacoVim.VimMode.Vim.map('jj', '<Esc>', 'insert');
     * monacoVim.VimMode.Vim.map('jk', '<Esc>', 'insert');
     * monacoVim.VimMode.Vim.map('kj', '<Esc>', 'insert');
     * ```
     * @see https://github.com/brijeshb42/monaco-vim/issues/67
     */
    map(lhs: string, rhs: string, mode: 'normal' | 'insert' | 'visual'): void;
    mapCommand(command: string, description: string, fn: Function, options?: any): void;
    mapclear(): void;
    maybeInitVimState_(editor: any): void;
    noremap(lhs: string, rhs: string, options?: any): void;
    resetVimGlobalState_(): void;
    setOption(name: string, value: any, options?: any, editor?: any): void;
    suppressErrorLogging: boolean;
    unmap(key: string, options?: any): void;
  }

  declare var VimMode: {
    Pos: (e: any, t?: any) => void;
    StringStream: {
      eol(): boolean;
      sol(): boolean;
      peek(): string;
      next(): string;
      eat(char: string): void;
    };
    Vim: Vim;
    addClass(): void;
    defineExtension(e: any, t: any): void;
    defineOption(): void;
    e_preventDefault(e: any): void;
    e_stop(e: any): void;
    isWordChar(e: any): boolean;
    keyMap: {
      default: (e: any) => void;
      vim: {
        attach: () => void;
        detach: () => void;
        call: () => void;
      };
      'vim-insert': {
        fallthrough: any[];
        attach: () => void;
        detach: () => void;
        call: () => void;
      };
      'vim-replace': {
        Backspace: string;
        fallthrough: any[];
        attach: () => void;
        detach: () => void;
        call: () => void;
      };
    };
    keyName(t: string): string;
    lookupKey(e: any, n: any, r: any): void;
    matchingBrackets: {
      '(': ')>';
      ')': '(<';
      '<': '>>';
      '>': '<<';
      '[': ']>';
      ']': '[<';
      '{': '}>';
      '}': '{<';
    };
    off(): void;
    on(): void;
    rmClass(): void;
    signal: (e: any, t: any, n: any) => void;
  };
  export function initVimMode(editor: editor.IStandaloneCodeEditor, statusbarNode?: HTMLElement): VimEnvironment;
}
