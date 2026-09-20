import {
  Camera,
  Cable,
  Gamepad2,
  Laptop,
  Smartphone,
  Tablet,
  Volume2,
  Watch,
  type LucideIcon,
} from "lucide-react";
import type { DeviceCategory } from "../types/models";

export const DEVICE_ICON: Record<DeviceCategory, LucideIcon> = {
  phone: Smartphone,
  laptop: Laptop,
  tablet: Tablet,
  smartwatch: Watch,
  accessory: Cable,
  gaming: Gamepad2,
  audio: Volume2,
  camera: Camera,
};

const PLACEHOLDER_IMAGE_HOSTS = ["placehold.co", "via.placeholder.com"];

export const isPlaceholderImage = (url?: string): boolean =>
  !url || PLACEHOLDER_IMAGE_HOSTS.some((host) => url.includes(host));
