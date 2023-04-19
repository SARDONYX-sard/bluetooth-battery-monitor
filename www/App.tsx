import React, { useCallback, useEffect, useState } from "react/";
import { clsx } from "clsx";
import { tw } from "twind";
import {
  IconHome,
  IconRotateClockwise2,
  IconSettings,
} from "@tabler/icons-react";

import { Button } from "./components/ui/reactive-button.tsx";
import { DEFAULT_SETTINGS, read_settings } from "./commands/fs/settings.ts";
import { Home, Settings } from "./components/pages/index.ts";
import { get_bluetooth_info_all } from "./commands/bluetooth.ts";
import { read_data, write_data } from "./commands/fs/bincode.ts";
import { update_info_interval } from "./commands/timer.ts";

import type { DeviceJson } from "./commands/bluetooth.ts";
import type { SettingsJson } from "./commands/fs/settings.ts";

export default function App() {
  const [devices, setDevices] = useState<DeviceJson[] | []>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [toggleSettings, setToggleSettings] = useState(false);
  const [settings, setSettings] = useState<SettingsJson>(DEFAULT_SETTINGS);
  const [intervalId, setIntervalId] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const cache = await read_data<DeviceJson[]>("device_info");
      const cacheId = await read_data<string>("selected_device_id");
      const settings = await read_settings();
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
    if (!settings.base.battery_query_duration_minutes) {
      console.error("Invalid value. expected number");
      return;
    }
    const duration_minutes = settings.base.battery_query_duration_minutes;

    await update_info_interval(duration_minutes); // write battery info by backend
    intervalId && clearInterval(intervalId);
    const id = setInterval(intervalFn, duration_minutes * 60 * 1000); // minutes to milliseconds
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
