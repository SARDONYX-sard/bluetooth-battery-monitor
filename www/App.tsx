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
  const cache = localStorage.getItem("bluetooth-info-all");
  useEffect(() => {
    if (cache) {
      setResult(JSON.parse(cache) as DeviceJson[]);
    }
  }, [result, setResult]);

  async function getBatteryInfo() {
    await get_bluetooth_info_all((json_array) => {
      setResult(json_array);
      localStorage.setItem("bluetooth-info-all", JSON.stringify(json_array));
    });
  }

  async function pollingInterval() {
    await update_info_interval(
      "BTHENUM\\{0000111E-0000-1000-8000-00805F9B34FB}_LOCALMFG&005D\\7&2CDD7520&0&9C431E0131A6_C00000000",
      10 * 60
    );
  }

  const glass = {
    borderRadius: "50px",
    backgroundColor: "rgb(18 18 18 / 65%)",
    boxShadow: `rgb(0 0 0 / 50%) 20px 20px 60px, rgb(0 0 0 / 50%) -20px -20px 60px`,
  };

  return (
    <section className={tw`h-fit`}>
      <div className={tw`my-4 mx-2 grid grid-cols-3 gap-7`}>
        <Button callback={getBatteryInfo} idleText="Update info" />
        <Button onClick={pollingInterval} idleText="Interval battery" />
      </div>

      {result.map((device) => {
        return (
          <div
            className={tw`my-5 mx-2 grid grid-flow-row-dense grid-cols-1 gap-1`}
            style={glass}
            key={device.instance_id}
          >
            {Object.keys(device).map((key) => {
              const objKey = key as keyof DeviceJson;
              let value = device[objKey];
              if (objKey === "is_connected") {
                value = value ? "is paired" : "not paired";
              }
              if (
                ["instance_id", "friendly_name", "bluetooth_address"].includes(
                  objKey
                )
              ) {
                return;
              }
              if (["last_seen", "last_used"].includes(objKey)) {
                const val = value as SystemTime;
                value = `${val.year}/${val.month}/${val.day} - ${val.hour}:${val.minute}:${val.second}`;
              }
              return (
                <div key={objKey} className={tw`my-1 mx-16 text-gray-100`}>
                  {key}: {`${value}`}
                </div>
              );
            })}
          </div>
        );
      })}
    </section>
  );
}
