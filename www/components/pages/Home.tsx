import React, { TransitionEventHandler } from "react/";
import { clsx } from "clsx";
import { tw } from "twind";
import {
  IconHeadphones,
  IconHeadset,
  IconVideo,
  IconMicrophone,
  IconDeviceSpeaker,
  IconHeadsetOff,
  IconHeadphonesOff,
  IconDeviceSpeakerOff,
  IconDeviceGamepad,
  IconVideoOff,
  IconMicrophoneOff,
  IconHelpOctagon,
  IconDeviceLaptop,
  IconDeviceLaptopOff,
  IconDeviceDesktop,
  IconDeviceDesktopOff,
  IconDeviceAirpods,
  IconDeviceAudioTape,
} from "@tabler/icons-react";

import { write_data } from "../../commands/fs/bincode.ts";

import type { TablerIconsProps } from "@tabler/icons-react";
import type { DeviceJson } from "../../commands/bluetooth.ts";

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
        {Array.isArray(devices) ? (
          devices.map((device) => {
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
                <DeviceInfo device={device} />
              </button>
            );
          })
        ) : (
          <div>
            <span>Devices not Found.</span>
            <span>Please press `Update devices info` button.</span>
          </div>
        )}
      </div>
    </section>
  );
}

function DeviceInfo({ device }: { device: DeviceJson }) {
  const lastUsed = device["last_used"];
  if (!lastUsed) {
    return null;
  }
  const lastUsedDate = `${lastUsed.year}/${lastUsed.month}/${lastUsed.day} ${lastUsed.hour}:${lastUsed.minute}:${lastUsed.second}`;

  const meterOffCss = {
    "--background": "#dadada18",
    "--optimum": "#868686",
    "--sub-optimum": "#868686",
    "--sub-sub-optimum": "#868686",
  } as React.CSSProperties;

  return (
    <React.Fragment>
      <div className={tw`grid grid-cols-2 gap-2 text-gray-100 h-full`}>
        <div className={tw`grid place-items-center row-span-2`}>
          <DeviceCategoryIcon device={device} /> {device["device_name"]}
        </div>
        <div className={tw`grid place-items-center  text-gray-100`}>
          Battery level: {device["battery_level"]}%
          <meter
            style={device["is_connected"] ? undefined : meterOffCss}
            max={100}
            min={0}
            value={device["battery_level"] ?? 0}
            high={80}
            low={21}
            optimum={100}
          ></meter>
        </div>
        <div className={tw`grid place-items-center  text-gray-100`}>
          Last Used: {lastUsedDate}
        </div>
      </div>
    </React.Fragment>
  );
}

function DeviceCategoryIcon({ device }: { device: DeviceJson }) {
  const device_class = device["class_of_device"] ?? ":";
  const [_cc, sub] = device_class.split(":");

  const connectedBgColor = device["is_connected"] ? "#ffffff" : "#b1b1b1a2";
  const iconProps: TablerIconsProps = { size: "3rem", color: connectedBgColor };

  switch (sub.trim()) {
    case "Hands-free Device":
    case "Wearable Headset Device":
      return device["is_connected"] ? (
        <IconHeadset {...iconProps} />
      ) : (
        <IconHeadsetOff {...iconProps} />
      );
    case "Microphone":
      return device["is_connected"] ? (
        <IconMicrophone {...iconProps} />
      ) : (
        <IconMicrophoneOff {...iconProps} />
      );
    case "HiFi Audio Device":
    case "Loudspeaker":
    case "Set-top box":
    case "Video Display and Loudspeaker":
      return device["is_connected"] ? (
        <IconDeviceSpeaker {...iconProps} />
      ) : (
        <IconDeviceSpeakerOff {...iconProps} />
      );
    case "Headphones":
      return device["is_connected"] ? (
        <IconHeadphones {...iconProps} />
      ) : (
        <IconHeadphonesOff {...iconProps} />
      );
    case "Portable Audio":
      return <IconDeviceAirpods {...iconProps} />;
    case "Car audio":
      return <IconDeviceAudioTape />;
    case "VCR":
      return null;
    case "Camcorder":
    case "Video Camera":
      return device["is_connected"] ? (
        <IconVideo {...iconProps} />
      ) : (
        <IconVideoOff {...iconProps} />
      );
    case "Video Monitor":
      return device["is_connected"] ? (
        <IconDeviceDesktop {...iconProps} />
      ) : (
        <IconDeviceDesktopOff {...iconProps} />
      );
    case "Video Conferencing":
      return device["is_connected"] ? (
        <IconDeviceLaptop {...iconProps} />
      ) : (
        <IconDeviceLaptopOff {...iconProps} />
      );
    case "Gaming/Toy":
      return <IconDeviceGamepad {...iconProps} />;
    default: // "Uncategorized" and "(Reserved)" too
      return <IconHelpOctagon {...iconProps} />;
  }
}
