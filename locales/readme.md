# Localization

This files in are language tags according to the BCP-47 standard.

- See:
  [Content Partner Hub | BCP-47 Language Tags](https://partnerhub.warnermediagroup.com/metadata/languages)

## Note

This file information is currently only used on the front end of the GUI.
It is placed in the root directory for clarity and for future reference.

The file `en.json` is not used in the `en-US.json` symbolic link.
It exists to prevent erroneous error reporting of i18n's VS Code extension.

## Implementation

Just adding json to locales is not yet available.

Adding languages to the following components will allow for GUI selection and automatic inference.

It should be added like any other language selection.

- [menuItems](../gui/frontend/src/components/organisms/I18nList/I18nList.tsx)
- [RESOURCES & normalize](../gui/frontend/src/lib/i18n/index.ts)
