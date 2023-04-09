import React, { useState } from "react";
import ReactiveButton, { ReactiveButtonProps } from "reactive-button";

type Props = {
  /** onClick function wrapper */
  callback?: () => Promise<void>;
};

export const Button = (props: ReactiveButtonProps & Props) => {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  const onClickHandler = async () => {
    setState("loading");
    try {
      props.callback && (await props.callback());
      setState("success");
    } catch (error) {
      setState("error");
    }
  };

  return (
    <ReactiveButton
      buttonState={state}
      rounded
      color="dark"
      size="large"
      onClick={onClickHandler}
      successText="Complete"
      {...props}
    />
  );
};
