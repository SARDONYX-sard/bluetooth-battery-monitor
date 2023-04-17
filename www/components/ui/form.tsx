import React, { useCallback } from "react";
import { clsx } from "clsx";
import { tw } from "twind";

import { write_data } from "../../commands/storage.ts";

import type { ChangeEvent } from "react";
import type { SettingsJson } from "../pages/index.ts";

type Props = {
  settings?: SettingsJson;
  setSettings: React.Dispatch<React.SetStateAction<SettingsJson | undefined>>;
};

export function Form({ settings, setSettings }: Props) {
  const handleOnchange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setSettings((prev) => {
      const res = {
        ...prev,
        "battery-query-duration-sec": Number(event.target.value),
      } as const satisfies SettingsJson;
      write_data("settings.json", res);
      return res;
    });
  }, [setSettings]);

  return (
    <form className={tw`shadow-md rounded px-8 pt-6 pb-3`}>
      <div className={tw`mb-4`}>
        <label
          className={tw`block text-yellow-50 text-sm font-bold mb-2`}
          htmlFor="duration"
        >
          Battery query interval duration(seconds)
        </label>
        <input
          className={clsx(
            "form-input",
            tw`shadow text-yellow-50 appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none`
          )}
          id="duration"
          type="text"
          placeholder="seconds"
          value={settings?.["battery-query-duration-sec"]}
          onChange={handleOnchange}
        />
      </div>
    </form>
  );
}
