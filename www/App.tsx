import React, { useCallback, useEffect, useState } from "react/";
import { clsx } from "clsx";
import { tw } from "twind";
import {
  IconHome,
  IconRotateClockwise2,
  IconSettings,
} from "@tabler/icons-react";

import { Button } from "./components/ui/reactive-button.tsx";
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
  const [intervalId, setIntervalId] = useState<number | null>(null);

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
        await write_data("device_info", json_array);
      });
    } catch (error) {
      console.error(error);
    }
  }

  const intervalFn = useCallback(async () => {
    const cacheId = await read_data<string>("selected_device_id");
    cacheId && setSelectedDeviceId(cacheId);
  }, [setSelectedDeviceId]);

  async function updateSystemTrayInterval() {
    const mins = Number(settings?.["battery-query-duration-minutes"]);
    if (Number.isNaN(mins)) {
      console.error("Invalid value. expected number");
      return;
    }
    const duration_time = mins;
    await update_info_interval(duration_time); // write battery info by backend

    intervalId && clearInterval(intervalId);
    const id = setInterval(intervalFn, mins * 60 * 1000); // minutes to milliseconds
    setIntervalId(id);
  }

  return (
    <div className={clsx("App")}>
      <div
        className={clsx(
          tw`flex justify-around fixed w-full py-4 z-50`,
          "glass"
        )}
      >
        <Button
          className={tw`grid place-items-center`}
          callback={getBatteryInfo_all}
          idleText={<IconRotateClockwise2 />}
        />
        <Button
          callback={updateSystemTrayInterval}
          idleText="Restart interval battery query"
        />
        <Button
          className={tw`grid place-items-center`}
          idleText={toggleSettings ? <IconHome /> : <IconSettings />}
          onClick={() => setToggleSettings(!toggleSettings)}
        />
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
          `animate translate-x-${toggleSettings ? "0" : "9999"}`,
          tw`fixed float-right z-10 top-0 pt-24 pb-5 grid grid-cols-1 place-items-center w-screen`
        )}
      />
    </div>
  );
}
