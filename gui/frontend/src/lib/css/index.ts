import { STORAGE } from '@/lib/storage';
import { PUB_CACHE_OBJ } from '@/lib/storage/cacheKeys';

/**
 * Creates a CSS preset.
 *
 * @template T - The type of the CSS string.
 * @param css - The CSS string.
 * @returns - The CSS preset as a readonly string literal type.
 */
const createPreset = <T extends string>(css: T) => {
  return /* css */ `:root {
  ${css}
}

body {
  background-attachment: fixed;
  background-color: #000;
  background-image: var(--image-url);
  background-position-x: var(--image-position-x);
  background-position-y: var(--image-position-y);
  background-repeat: no-repeat;
  background-size: var(--image-size);
}

main {
  background-color: var(--main-bg-color);
}

:-webkit-autofill {
  box-shadow: var(--autofill-color) 0px 0px 0px 100px inset !important;
}

.monaco-editor,
.monaco-editor-background {
  background-color: #2121213b !important;
  --vscode-editorGutter-background: #283d671a !important;
}

.decorationsOverviewRuler,
.monaco-editor .minimap canvas {
  opacity: 0.6;
}

.MuiCard-root,
.MuiOutlinedInput-root {
  background-color: #2424248c !important;
}

p.Mui-error {
  background-color: #2f2e2eba;
  color: var(--error-color);
}

.Mui-checked,
.Mui-selected,
.MuiButton-outlined,
.MuiButton-root.MuiButton-text,
.MuiInputBase-root.MuiOutlinedInput-root.MuiInputBase-colorPrimary.Mui-focused>fieldset,
[class$="MuiFormLabel-root"].Mui-focused,
[class$="MuiInputBase-root-MuiInput-root"]::after,
a,
label.Mui-focused,
span.Mui-checked>svg {
  color: var(--theme-color) !important;
  border-color: var(--theme-color);
}

.MuiCircularProgress-colorPrimary {
  color: var(--theme-color); /** NOTE: avoid adding !important as it will overwrite the power off color */
}

.MuiButton-outlined {
  background-color: #2424248c;
}

.MuiButton-outlined:hover {
  color: #fff !important;
  background-color: var(--hover-btn-color);
}

#x-data-grid-selected,
.MuiLoadingButton-root {
  color: #fff;
  background-color: var(--convert-btn-color);
}

.MuiLoadingButton-root:hover {
  background-color: var(--hover-convert-btn-color);
}

.MuiTabs-indicator {
  background-color: var(--theme-color);
}
` as const;
};

const preset1 = createPreset(
  `--autofill-color: #691c3747;
  --convert-btn-color: #ab2b7e6e;
  --error-color: #ff1655;
  --hover-btn-color: #c9623db3;
  --hover-convert-btn-color: #cd2c6c95;
  --image-size: cover;
  --image-url: url("https://i.redd.it/red-forest-1920-1080-v0-s9u8ki2rr70a1.jpg?s=139edf608c428656505a143635a0687dec086229");
  --main-bg-color: #2223;
  --theme-color: #ff8e16;`,
);

const preset2 = createPreset(
  `--autofill-color: #5eb1ef24;
  --convert-btn-color: #3369ad7d;
  --hover-btn-color: #1d5aa58b;
  --hover-convert-btn-color: #2665b5d1;
  --image-size: cover;
  --image-url: url("https://images.pexels.com/photos/2817421/pexels-photo-2817421.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750& dpr=1");
  --main-bg-color: #2223;
  --theme-color: #5a9ab9;`,
);

const preset3 = createPreset(
  `--autofill-color: #eb37ff1c;
  --convert-btn-color: #ab2b7e6e;
  --hover-btn-color: #8b51fb8b;
  --hover-convert-btn-color: #7d00c9a3;
  --image-size: cover;
  --image-url: url("https://images.pexels.com/photos/6162265/pexels-photo-6162265.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1");
  --main-bg-color: #2223;
  --theme-color: #9644f1;`,
);

const preset4 = createPreset(
  `--autofill-color: #a19c0038;
  --convert-btn-color: #94ce7c6e;
  --hover-btn-color: #cefb518b;
  --hover-convert-btn-color: #81c462a3;
  --image-position-x: center;
  --image-position-y: center;
  --image-url: url('https://images.pexels.com/photos/973324/pexels-photo-973324.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1');
  --main-bg-color: #222a;
  --theme-color: rgb(185, 185, 90);`,
);

const PRESETS = {
  '0': STORAGE.get(PUB_CACHE_OBJ.customCss) ?? '',
  '1': preset1,
  '2': preset2,
  '3': preset3,
  '4': preset4,
} as const;

const normalize = (select?: string | null) => {
  switch (select) {
    case '1':
    case '2':
    case '3':
    case '4':
      return select;
    default:
      return '0';
  }
};

export const CSS = {
  normalize,

  preset: {
    /** Get current preset */
    get: () => normalize(STORAGE.get(PUB_CACHE_OBJ.presetNumber)),
    /** Set current preset */
    set: (presetN: keyof typeof PRESETS) => STORAGE.set(PUB_CACHE_OBJ.presetNumber, presetN),
  },

  css: {
    /** ID of the HTML from which the CSS is drawn. */
    id: 'user-custom-css',

    /** Get css */
    get: (presetN: keyof typeof PRESETS) => PRESETS[presetN],
    /** Set css */
    set: (css: string) => STORAGE.set(PUB_CACHE_OBJ.customCss, css),
  },
} as const;

export type CssPresets = keyof typeof PRESETS;
