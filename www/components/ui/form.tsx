import React, { useCallback, useEffect } from "react";
import { NumericFormat } from "react-number-format";
import { clsx } from "clsx";
import { tw } from "twind";

import { write_settings } from "../../commands/fs/settings.ts";
import { useDebounce } from "./../hooks/useDebounce.ts";

import type { ChangeEvent } from "react";
import type { SettingsJson } from "../../commands/fs/settings.ts";

type Props = {
  settings: SettingsJson;
  setSettings: React.Dispatch<React.SetStateAction<SettingsJson>>;
};

export function Form({ settings, setSettings }: Props) {
  const duration = useDebounce(
    settings.base.battery_query_duration_minutes,
    500
  );

  useEffect(() => {
    const res = {
      ...settings,
      ...{
        base: {
          ...settings.base,
          battery_query_duration_minutes: duration,
        },
      },
    } as const satisfies SettingsJson;
    write_settings(res);
  }, [duration, settings]);

  const handleOnchange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setSettings((prev) => {
        return {
          ...prev,
          base: {
            ...prev.base,
            battery_query_duration_minutes: Number(event.target.value),
          },
        } as const satisfies SettingsJson;
      });
    },
    [setSettings]
  );

  return (
    <form className={tw`shadow-md rounded pt-6 pb-3`}>
      <div className={tw`mb-4`}>
        <label
          className={tw`block text-yellow-50 text-sm font-bold mb-2`}
          htmlFor="duration"
        >
          Battery query interval duration(Minutes)
        </label>
        <NumericFormat
          allowNegative={false}
          className={clsx(
            "form-input",
            tw`shadow text-yellow-50 appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none`
          )}
          defaultValue={60}
          min={1}
          id="duration"
          isAllowed={(num) => {
            return num.floatValue !== 0;
          }}
          onChange={handleOnchange}
          placeholder="Minutes"
          value={duration}
        />
      </div>
    </form>
  );
}
