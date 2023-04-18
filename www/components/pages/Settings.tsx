import React, { TransitionEventHandler } from "react";
import { clsx } from "clsx";
import { tw } from "twind";

import { Form } from "../ui/form.tsx";
import { Toggle } from "../ui/switch.tsx";
import { CSSText } from "./../ui/css-text.tsx";

export type SettingsJson = {
  "battery-query-duration-sec": number;
};

type Props = {
  className?: string;
  onTransitionEnd?: TransitionEventHandler<HTMLElement>;
  settings?: SettingsJson;
  setSettings: React.Dispatch<React.SetStateAction<SettingsJson | undefined>>;
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
      <div className={clsx(tw`w-11/12 rounded-3xl`, "glass")}>
        <Form settings={settings} setSettings={setSettings} />
        <Toggle label={"auto start"} />
        <CSSText />
      </div>
    </section>
  );
}
