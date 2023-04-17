import React, { useEffect, useState } from "react/";
import { clsx } from "clsx";
import { tw } from "twind";

import { Button } from "./components/ui/button.tsx";
import { Home, Settings } from "./components/pages/index.ts";
import { get_bluetooth_info_all } from "./commands/bluetooth.ts";
import { read_data, write_data } from "./commands/storage.ts";
import { update_info_interval } from "./commands/timer.ts";

import type { SettingsJson } from "./components/pages/Settings.tsx";
import type { DeviceJson } from "./commands/bluetooth.ts";

export default function App() {
  const [devices, setDevices] = useState<DeviceJson[] | []>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [toggleSettings, setToggleSettings] = useState(false);
  const [settings, setSettings] = useState<SettingsJson>();

  useEffect(() => {
    (async () => {
      const cache = await read_data<DeviceJson[]>("device_info");
      const cacheId = await read_data<string>("selected_device_id");
      const settings = await read_data<SettingsJson>("settings.json");
      cache && setDevices(cache);
      cacheId && setSelectedDeviceId(cacheId);
      settings && setSettings(settings);
    })();
  }, []);

  // To scroll lock For settings page.
  if (toggleSettings) {
    document.body.classList.add(tw`overflow-y-hidden`);
  } else {
    document.body.classList.remove(tw`overflow-y-hidden`);
  }

  async function getBatteryInfo_all() {
    try {
      await get_bluetooth_info_all(async (json_array) => {
        setDevices(json_array);
        await write_data("device_info", JSON.stringify(json_array));
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function updateSystemTrayInterval() {
    const num = Number(settings?.["battery-query-duration-sec"]);
    if (Number.isNaN(num)) {
      console.error("Invalid value. expected number");
      return;
    }
    const duration_time = num;
    await update_info_interval(duration_time); // write battery info by backend
    setInterval(async () => {
      const cacheId = await read_data<string>("selected_device_id");
      cacheId && setSelectedDeviceId(cacheId);
    });
  }

  return (
    <div className={clsx("App")}>
      <div
        className={clsx(
          tw`grid grid-cols-3 place-items-stretch fixed w-full py-4 z-50`,
          "glass"
        )}
      >
        <Button callback={getBatteryInfo_all} idleText="Update devices info" />
        <Button
          callback={updateSystemTrayInterval}
          idleText="Restart interval battery query"
        />
        {toggleSettings ? (
          <Button idleText="To Home" onClick={() => setToggleSettings(false)} />
        ) : (
          <Button
            idleText="To Settings"
            onClick={() => setToggleSettings(true)}
          />
        )}
      </div>

      <Home
        className={clsx(
          "animate",
          tw`z-0 pt-24 pb-5 ${
            toggleSettings ? "opacity-0 invisible" : "opacity-100"
          }`
        )}
        devices={devices}
        selectedDeviceId={selectedDeviceId}
        setSelectedDeviceId={setSelectedDeviceId}
      />
      <Settings
        settings={settings}
        setSettings={setSettings}
        className={clsx(
          `float-right animate translate-x-${toggleSettings ? "" : "9999"}`,
          tw`fixed z-10 top-0 pt-24 pb-5 grid grid-cols-1 place-items-center w-screen`
        )}
      />
    </div>
  );
}
