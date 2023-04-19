import React, { useCallback, useState } from "react";

import { isEnabled, enable, disable } from "../../commands/auto-start.ts";
import { SwitchButton } from "../general-ui/switch.tsx";
import { SettingsJson, write_settings } from "../../commands/fs/settings.ts";

type Props = {
  autostart: boolean;
  setSettings: React.Dispatch<React.SetStateAction<SettingsJson>>;
};

export function AutoStartSwitch({ autostart, setSettings }: Props) {
  const [isToggled, setToggle] = useState(autostart);
  useCallback(async () => {
    const isAutoStartEnabled = await isEnabled();
    setToggle(isAutoStartEnabled);
  }, [setToggle])();

  const handleOnClick = useCallback(
    async (_event: React.MouseEvent<HTMLInputElement, MouseEvent>) => {
      setToggle((prev) => !prev);
      setSettings((prev) => {
        const res = {
          ...prev,
          base: {
            ...prev.base,
            autostart: !isToggled,
          },
        } as const satisfies SettingsJson;
        write_settings(res);
        return res;
      });

      if (!isToggled) {
        await enable();
      } else {
        await disable();
      }
    },
    [setSettings, setToggle, isToggled]
  );

  return (
    <SwitchButton
      label={"Auto start"}
      onClick={handleOnClick}
      isToggled={isToggled}
    />
  );
}
