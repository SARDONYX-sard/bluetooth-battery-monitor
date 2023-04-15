import React, { TransitionEventHandler } from "react";
import { clsx } from "clsx";
import { tw } from "twind";

import { Form } from "../form.tsx";
import { Toggle } from "../switch.tsx";
import { Settings } from "../../App.tsx";

type Props = {
  className?: string;
  onTransitionEnd?: TransitionEventHandler<HTMLElement>;
  settings?: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings | undefined>>;
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
      <div className={clsx(tw` h-96 w-11/12 rounded-3xl`, "glass")}>
        <Form settings={settings} setSettings={setSettings} />
        <Toggle label={"auto start"} />
      </div>
    </section>
  );
}
