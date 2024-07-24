# Bluetooth Battery Monitor

<div>
    <a href="https://github.com/SARDONYX-sard/bluetooth-battery-monitor/actions/workflows/lint-and-test.yaml">
        <img src="https://github.com/SARDONYX-sard/bluetooth-battery-monitor/actions/workflows/lint-and-test.yaml/badge.svg" alt="Lint&Test">
    </a>
    <a href="https://github.com/SARDONYX-sard/bluetooth-battery-monitor/actions/workflows/release-gui.yaml">
        <img src="https://github.com/SARDONYX-sard/bluetooth-battery-monitor/actions/workflows/release-gui.yaml/badge.svg" alt="Release">
    </a>
    <a href="https://opensource.org/licenses/MIT">
        <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License">
    </a>
    <a href="https://opensource.org/licenses/Apache-2.0">
        <img src="https://img.shields.io/badge/License-Apache_2.0-blue.svg" alt="License">
    </a>
</div>

<p align="center">
   <img src="./gui/backend/icons/128x128.png" alt="bluetooth battery monitor icon"/>
</p>

![index](https://github.com/user-attachments/assets/4b09ce2a-40b9-424c-8f5c-cb716d2771da)
![settings](https://github.com/user-attachments/assets/09d9ac9f-df5d-4736-8bc2-f32d27d0c099)

## Getting Started for User

- [Release Page](https://github.com/SARDONYX-sard/bluetooth-battery-monitor/releases)

1. When the application is launched, an icon will appear on the taskbar.

2. When the Bluetooth Classic battery information is successfully acquired, the icon will switch to battery reporting.

3. The icon will change according to the battery %.

## Features

- [x] Search Bluetooth(Classic) battery info

- [x] Autostart at PC startup
- [x] Localization(could be customized)
- [x] Custom edit JavaScript & CSS

## UnSupported Features(I does not have a supported device.)

- &#x2612; Bluetooth LE device search
- &#x2612; Battery information acquisition for Bluetooth LE

## Wiki

- If you want to change the design: `Settings` page -> `Editor/Preset` tab -> Click `Preset1`

- background image randomization(NOTE: Script execution is at your own risk.)

1. `Settings` page -> `Editor/Preset` tab -> Click `Preset1`
2. Click `JS Auto run` button
3. Copy this code.

```javascript
//@ts-check
(() => {
  const preset1 = `
  --autofill-color: #691c3747;
  --convert-btn-color: #ab2b7e6e;
  --error-color: #ff1655;
  --hover-btn-color: #ff89898b;
  --hover-convert-btn-color: #fd3b3b6e;
  --theme-color: #ff8e16;`;
  const preset2 = `
  --autofill-color: #5eb1ef24;
  --convert-btn-color: #3369ad7d;
  --hover-btn-color: #1d5aa58b;
  --hover-convert-btn-color: #2665b5d1;
  --theme-color: #5a9ab9;`;
  const preset4 = `
  --autofill-color: #a19c0038;
  --convert-btn-color: #94ce7c6e;
  --hover-btn-color: #cefb518b;
  --hover-convert-btn-color: #81c462a3;
  --main-bg-color: #222a;
  --theme-color: rgb(185, 185, 90);`;

  let preset =/** @type{const} */ preset2;
  const getRandomUrl = () => {
    const imgNumList = [1543801, 1547163, 4589833, 7325003, 14133639];

    const imgNum = imgNumList[Math.floor(Math.random() * imgNumList.length)];
    if ([1547163, 14133639].includes(imgNum)) {
      preset = preset1;
    } else if ([4589833, 7325003].includes(imgNum)) {
      preset = preset4;
    }
    return `https://images.pexels.com/photos/${imgNum}/pexels-photo-${imgNum}.jpeg`;
  };

  const img = getRandomUrl();
  // Change the background on each page.(JS is executed every time, so the same variable is fine.)
  dynImg(/** index */ img, /** settings */ img);

  /**
   * Change the background on each page.
   * @param {string} indexUrl - Image URI of index(converter) page
   * @param {string} settingsUrl - Image URI of settings page
   */
  function dynImg(indexUrl, settingsUrl) {
    const commonVariables = `
        --image-position-x: center;
        --image-position-y: center;
        --image-size: cover;
        --main-bg-color: #222a;
        ${preset}
`;
    const style = document.getElementById('dyn-style') ?? document.createElement('style');
    style.id = 'dyn-style';
    const currentPage = window.location.pathname;
    if (currentPage === '/') {
      style.innerHTML = `:root { ${commonVariables} --image-url: url('${indexUrl}');  }`;
    } else if (currentPage === '/settings') {
      style.innerHTML = `:root { ${commonVariables} --image-url: url('${settingsUrl}'); }`;
    }
    document.body.appendChild(style);
  }
})();
```

## Licenses

Licensed under either of

- Apache License, Version 2.0
   ([LICENSE-APACHE](LICENSE-APACHE) or <http://www.apache.org/licenses/LICENSE-2.0>)
- MIT license
   ([LICENSE-MIT](LICENSE-MIT) or <http://opensource.org/licenses/MIT>)
