import React, { useState } from "react";
import { tw } from "twind";
import { disable, enable, isEnabled } from "../commands/auto-start.ts";
import { useEffect } from "react/";

type Props = {
  label: string;
  toggled?: boolean;
  onClick?: (bool: boolean) => void;
};

export const Toggle = ({ label, onClick }: Props) => {
  const [isToggled, setToggle] = useState(false);

  useEffect(() => {
    (async () => {
      const isAutoStartEnabled = await isEnabled();
      setToggle(isAutoStartEnabled);
    })();
  }, []);

  return (
    <label className={tw`relative inline-block w-14 h-8 ml-8 text-yellow-50`}>
      <input
        className={"switch-input"}
        type="checkbox"
        defaultChecked={isToggled}
        onClick={async (e) => {
          setToggle(!isToggled);
          onClick && onClick(!isToggled);
          if (isToggled) {
            await disable();
          } else {
            await enable();
            console.log("enable");
          }
        }}
      />
      <span className={"switch-span"} />
      <strong className={"switch-strong"}>{label}</strong>
    </label>
  );
};
