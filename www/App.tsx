import React, { useEffect, useState } from "react/";
import { tw } from "twind";

import {
  DeviceJson,
  SystemTime,
  get_bluetooth_info_all,
} from "./commands/bluetooth.ts";
import { update_info_interval } from "./commands/timer.ts";
import { Button } from "./components/button.tsx";

export default function App() {
  const [result, setResult] = useState<DeviceJson[] | []>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");

  useEffect(() => {
    const cache = localStorage.getItem("bluetooth-info-all");
    const cacheId = localStorage.getItem("selected-device-id");
    cache && setResult(JSON.parse(cache) as DeviceJson[]);
    cacheId && setSelectedDeviceId(JSON.parse(cacheId));
  }, []);

  async function getBatteryInfo() {
    await get_bluetooth_info_all((json_array) => {
      setResult(json_array);
      localStorage.setItem("bluetooth-info-all", JSON.stringify(json_array));
    });
  }

  async function pollingInterval() {
    const duration_time = 10; // * 60;
    await update_info_interval(selectedDeviceId, duration_time);
  }

  const selectDevice: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    setSelectedDeviceId(e.currentTarget.value);
    localStorage.setItem(
      "selected-device-id",
      JSON.stringify(e.currentTarget.value)
    );
  };

  return (
    <section>
      <div
        className={tw`grid grid-cols-2 place-items-stretch fixed w-full py-4 glass`}
      >
        <Button callback={getBatteryInfo} idleText="Update info" />
        <Button callback={pollingInterval} idleText="Interval battery" />
      </div>

      <div className={tw`grid gap-8 place-items-center pt-24 pb-5`}>
        {result.map((device) => {
          const bgColor =
            device.instance_id === selectedDeviceId
              ? ({ backgroundColor: "#000000bf" } as const)
              : undefined;

          return (
            <button
              className={tw`grid grid-flow-row-dense grid-cols-1 gap-1 w-11/12 rounded-3xl py-3 glass`}
              style={bgColor}
              key={device.instance_id}
              value={device.instance_id}
              onClick={selectDevice}
            >
              {Object.keys(device).map((key) => {
                return (
                  <DeviceInfo
                    device={device}
                    device_key={key as keyof DeviceJson}
                  />
                );
              })}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function DeviceInfo({
  device,
  device_key,
}: {
  device: DeviceJson;
  device_key: keyof DeviceJson;
}) {
  let value = device[device_key];
  if (device_key === "is_connected") {
    value = value ? "is paired" : "not paired";
  }
  if (
    ["instance_id", "friendly_name", "bluetooth_address"].includes(device_key)
  ) {
    return null;
  }
  if (["last_seen", "last_used"].includes(device_key)) {
    const val = value as SystemTime;
    value = `${val.year}/${val.month}/${val.day} - ${val.hour}:${val.minute}:${val.second}`;
  }

  return (
    <div
      key={device_key}
      className={tw`grid place-items-start my-1 mx-16 text-gray-100`}
    >
      {device_key}: {`${value}`}
    </div>
  );
}
