import React, { TransitionEventHandler } from "react/";
import { clsx } from "clsx";
import { tw } from "twind";

import { write_data } from "../../commands/storage.ts";

import type { SystemTime, DeviceJson } from "../../commands/bluetooth.ts";

type Props = {
  devices: DeviceJson[] | [];
  selectedDeviceId: string;
  className?: string;
  onTransitionEnd?: TransitionEventHandler<HTMLElement>;
  setSelectedDeviceId: React.Dispatch<React.SetStateAction<string>>;
};
export function Home({
  devices,
  selectedDeviceId,
  className,
  onTransitionEnd,
  setSelectedDeviceId,
}: Props) {
  const selectDevice: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    setSelectedDeviceId(e.currentTarget.value);
    write_data("selected_device_id", e.currentTarget.value);
  };

  return (
    <section className={className} onTransitionEnd={onTransitionEnd}>
      <div className={tw`grid gap-8 place-items-center`}>
        {devices.map((device) => {
          const bgColor =
            device.bluetooth_address === selectedDeviceId
              ? ({ backgroundColor: "#000000bf" } as const)
              : undefined;

          return (
            <button
              className={clsx(
                tw`grid grid-flow-row-dense grid-cols-1 gap-1 w-11/12 rounded-3xl py-3`,
                "glass"
              )}
              style={bgColor}
              key={device.instance_id}
              value={device.bluetooth_address}
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
