import React, { useState } from "react";
import ReactiveButton, { ReactiveButtonProps } from "reactive-button";

type Props = {
  /** onClick function wrapper with async.
   * This will cause loading and completion state transitions.
   */
  callback?: (event: React.MouseEvent<Element, MouseEvent>) => Promise<void>;
};

export const Button = (props: ReactiveButtonProps & Props) => {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );

  const onClickHandler = async (
    event: React.MouseEvent<Element, MouseEvent>
  ) => {
    setState("loading");
    try {
      props.callback && (await props.callback(event));
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
