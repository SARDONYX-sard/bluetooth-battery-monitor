import React, { TransitionEventHandler } from "react";
import { clsx } from "clsx";
import { tw } from "twind";

import { Form } from "../ui/form.tsx";
import { CSSText } from "./../ui/css-text.tsx";
import { AutoStartSwitch } from "../ui/autostart-switch.tsx";

import type { SettingsJson } from "../../commands/fs/settings.ts";

type Props = {
  className?: string;
  onTransitionEnd?: TransitionEventHandler<HTMLElement>;
  settings: SettingsJson;
  setSettings: React.Dispatch<React.SetStateAction<SettingsJson>>;
};

export function Settings({
  className,
  onTransitionEnd,
  settings,
  setSettings,
}: Props) {
  return (
    <section className={className} onTransitionEnd={onTransitionEnd}>
      <h1 className={clsx(tw`my-2 text-3xl text-white`)}>Settings</h1>
      <div className={clsx(tw`w-11/12 rounded-3xl px-8`, "glass")}>
        <Form settings={settings} setSettings={setSettings} />
        <AutoStartSwitch
          autostart={settings.base.autostart}
          setSettings={setSettings}
        />
        <CSSText />
      </div>
    </section>
  );
}
