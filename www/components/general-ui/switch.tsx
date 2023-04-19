import React from "react";
import { tw } from "twind";

type Props = {
  label: string;
  isToggled: boolean;
  onClick?: (
    event: React.MouseEvent<HTMLInputElement, MouseEvent>
  ) => void | Promise<void>;
};

export const SwitchButton = ({ label, isToggled, onClick }: Props) => {
  return (
    <label className={tw`relative inline-block w-14 h-8 text-yellow-50`}>
      <input
        className={"switch-input"}
        type="checkbox"
        //! `defaultChecked` does not seem to reflect state updates in async, so use `checked` instead.
        //? See: https://reactjs.org/docs/dom-elements.html#checked
        checked={isToggled}
        onClick={onClick}
      />
      <span className={"switch-span"} />
      <strong className={"switch-strong"}>{label}</strong>
    </label>
  );
};
