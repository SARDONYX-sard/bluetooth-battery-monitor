import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { CSS } from '@/lib/css';

import { useInjectCss } from './useInjectCss';

describe('useInjectCss hook', () => {
  beforeEach(() => {
    document.head.innerHTML = ''; // Clear document.head before each test
  });

  it('should inject CSS into the document on mount', () => {
    CSS.preset.set('1');
    const { result } = renderHook(() => useInjectCss());

    const styleElement = document.getElementById(CSS.css.id);
    expect(styleElement).not.toBeNull();

    expect(result.current.preset).toBe('1');
    expect(result.current.css).toBe(CSS.css.get('1'));
  });

  it('should update CSS when setCss is called', () => {
    CSS.preset.set('0');
    CSS.css.set('body { background: black; }');
    const { result } = renderHook(() => useInjectCss());

    act(() => {
      result.current.setCss('body { color: red; }');
    });

    const styleElement = document.getElementById(CSS.css.id);
    expect(styleElement?.innerHTML).toBe('body { color: red; }');
  });

  it('should update preset when setPreset is called', () => {
    const { result } = renderHook(() => useInjectCss());

    act(() => result.current.setPreset('1'));

    expect(result.current.preset).toBe('1');
  });

  it('should remove the style element on unmount', () => {
    const { unmount } = renderHook(() => useInjectCss());

    const styleElement = document.getElementById(CSS.css.id);
    expect(styleElement).not.toBeNull();

    // Unmount the hook and check that the style element is removed
    unmount();
    expect(document.getElementById(CSS.css.id)).toBeNull();
  });
});
