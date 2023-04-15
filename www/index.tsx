import React from "react/";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";

import "./global.css";

const root = createRoot(document.getElementById("root") as HTMLElement);

root.render(<App />);

// For hot reload(https://esbuild.github.io/api/#live-reload)
new EventSource("/esbuild").addEventListener("change", () => location.reload());
