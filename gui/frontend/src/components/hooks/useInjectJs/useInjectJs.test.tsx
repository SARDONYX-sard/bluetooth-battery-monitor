import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import { JsProvider } from '@/components/providers/JsProvider';
import { STORAGE } from '@/lib/storage';
import { HIDDEN_CACHE_OBJ, PUB_CACHE_OBJ } from '@/lib/storage/cacheKeys';

import { useInjectJs } from '../useInjectJs';

const InnerComponent = () => {
  useInjectJs();
  return <div>Test Component</div>;
};

const TestComponent = () => {
  return (
    <JsProvider>
      <InnerComponent />
    </JsProvider>
  );
};

const enableExecJs = () => STORAGE.setHidden(HIDDEN_CACHE_OBJ.runScript, 'true');

// Test suite
describe('useInjectScript', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should inject the script when `run-script` is true', () => {
    const jsCode = 'console.log("Test script loaded")';
    STORAGE.set(PUB_CACHE_OBJ.customJs, jsCode);
    enableExecJs();

    const { unmount } = render(<TestComponent />);

    expect(document.body.querySelector('script')).toBeInTheDocument();
    expect(document.body.querySelector('script')?.innerHTML).toBe(jsCode);

    unmount();

    // Cleanup check
    expect(document.body.querySelector('script')).not.toBeInTheDocument();
  });

  it('should not inject the script if `run-script` is not true', () => {
    const { unmount } = render(<TestComponent />);
    expect(document.body.querySelector('script')).not.toBeInTheDocument();

    unmount();
  });

  it('should not inject the script again if already run', () => {
    enableExecJs();

    const { unmount } = render(<TestComponent />);
    unmount();

    render(<TestComponent />);

    expect(document.body.querySelector('script')).toBeInTheDocument();
    expect(document.body.querySelectorAll('script').length).toBe(1);
  });
});
