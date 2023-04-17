import React, { useCallback, useState } from "react";
import { tw } from "twind";

import { isEnabled, enable, disable } from "../../commands/auto-start.ts";

type Props = {
  label: string;
  onClick?: (bool: boolean) => void;
};

export const Toggle = ({ label, onClick }: Props) => {
  const [isToggled, setToggle] = useState(false);
  useCallback(async () => {
    const isAutoStartEnabled = await isEnabled();
    setToggle(isAutoStartEnabled);
  }, [setToggle])();

  return (
    <label className={tw`relative inline-block w-14 h-8 ml-8 text-yellow-50`}>
      <input
        className={"switch-input"}
        type="checkbox"
        //! `defaultChecked` does not seem to reflect state updates in async, so use `checked` instead.
        //? See: https://reactjs.org/docs/dom-elements.html#checked
        checked={isToggled}
        onClick={async (e) => {
          setToggle((prev) => !prev);
          onClick && onClick(!isToggled);

          if (!isToggled) {
            await enable();
          } else {
            await disable();
          }
        }}
      />
      <span className={"switch-span"} />
      <strong className={"switch-strong"}>{label}</strong>
    </label>
  );
};
