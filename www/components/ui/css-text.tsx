import React, { useEffect, useState } from "react";
import { clsx } from "clsx";
import { tw } from "twind";

import { useDebounce } from "../hooks/useDebounce.ts";
import { Button } from "./reactive-button.tsx";

export function CSSText() {
  const [customCSS, setCustomCSS] = useState(
    localStorage.getItem("custom-css") ?? ""
  );
  const debouncedText = useDebounce(customCSS, 500);

  useEffect(() => {
    localStorage.setItem("custom-css", debouncedText);
  }, [debouncedText]);

  const exampleCss1 = `body {
	background-image: linear-gradient(43deg, #00b09b, #96c93d);
}`;

  const exampleCss2 = ` body {
	background-image: linear-gradient(43deg, #4158d0 0%, #c850c0 46%, #ffcc70 100%)
}`;

  const createClipboardHandler = (text: string) => {
    return (e: React.MouseEvent<Element, MouseEvent>) => {
      setCustomCSS(text);
    };
  };

  return (
    <div className={tw`grid grid-cols-2 my-7 grid-rows-1`}>
      <label
        className={tw`block text-white text-sm font-bold mb-2`}
        htmlFor="custom-css"
      >
        custom css
      </label>
      <textarea
        id="custom-css"
        className={clsx(tw`px-5 col-span-2 text-white rounded-3xl`, "glass")}
        cols={40}
        rows={5}
        value={customCSS}
        placeholder={`/* your custom css here. */
/* Example1: background green */
${exampleCss1}

/* Example2: background violet */
${exampleCss2}
`}
        onChange={(e) => {
          setCustomCSS(e.target.value);
        }}
      ></textarea>
      <Button
        onClick={createClipboardHandler(exampleCss1)}
        idleText="Background green"
        color="green"
      />
      <Button
        onClick={createClipboardHandler(exampleCss2)}
        idleText="Background violet"
        color="violet"
      />
      <style>{debouncedText}</style>
    </div>
  );
}
