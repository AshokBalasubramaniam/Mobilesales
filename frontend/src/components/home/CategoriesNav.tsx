import { Link } from "react-router-dom";
import { LayoutGrid } from "lucide-react";
import clsx from "clsx";
import { DEVICE_CATEGORIES } from "../../utils/constants";
import { PATHS } from "../../routes/paths";
import type { DeviceCategory } from "../../types/models";
import phoneIcon from "../../assets/categories/phone.png";
import laptopIcon from "../../assets/categories/laptop.png";
import tabletIcon from "../../assets/categories/tablet.png";
import smartwatchIcon from "../../assets/categories/smartwatch.png";
import accessoryIcon from "../../assets/categories/accessory.png";
import gamingIcon from "../../assets/categories/gaming.png";
import audioIcon from "../../assets/categories/audio.png";
import cameraIcon from "../../assets/categories/camera.png";

export interface CategoriesNavProps {
  selected: DeviceCategory | null;
  onSelect: (category: DeviceCategory | null) => void;
}

const CATEGORY_ICON: Record<DeviceCategory, string> = {
  phone: phoneIcon,
  laptop: laptopIcon,
  tablet: tabletIcon,
  smartwatch: smartwatchIcon,
  accessory: accessoryIcon,
  gaming: gamingIcon,
  audio: audioIcon,
  camera: cameraIcon,
};

const classes = {
  card: "flex items-center justify-between gap-3 overflow-x-auto rounded-xl border border-gray-100 bg-white p-4 shadow-sm",
  item: "flex shrink-0 flex-col items-center gap-2 rounded-xl border border-gray-100 bg-white p-3 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md",
  itemActive: "border-brand-300 bg-brand-50 shadow-md",
  itemViewAll:
    "border-brand-200 bg-brand-50 hover:bg-brand-100 hover:border-brand-300",
  iconWrap:
    "flex size-14 items-center justify-center overflow-hidden rounded-full bg-gray-50 text-gray-700 ring-1 ring-gray-100",
  iconWrapActive: "bg-brand-100 text-brand-700 ring-brand-200",
  iconWrapViewAll: "bg-brand-100 text-brand-700 ring-brand-200",
  icon: "size-5",
  iconImage: "size-full scale-125 object-cover",
  label: "text-xs font-semibold leading-tight text-gray-800",
  labelActive: "text-brand-700",
  labelViewAll: "text-brand-700",
  sublabel: "text-xs leading-tight text-gray-400",
};

const CategoriesNav = ({ selected, onSelect }: CategoriesNavProps) => (
  <div className={classes.card}>
    {DEVICE_CATEGORIES.map((cat) => {
      const iconSrc = CATEGORY_ICON[cat.value];
      const isActive = selected === cat.value;
      return (
        <button
          key={cat.value}
          type="button"
          onClick={() => onSelect(isActive ? null : cat.value)}
          className={clsx(classes.item, isActive && classes.itemActive)}
          style={{ minWidth: 84, maxWidth: 94 }}
        >
          <span
            className={clsx(
              classes.iconWrap,
              isActive && classes.iconWrapActive,
            )}
          >
            <img src={iconSrc} alt={cat.label} className={classes.iconImage} />
          </span>
          <span className="text-center">
            <span
              className={clsx(
                classes.label,
                isActive && classes.labelActive,
                "block",
              )}
            >
              {cat.label}
            </span>
            <span className={clsx(classes.sublabel, "block")}>
              {cat.sublabel}
            </span>
          </span>
        </button>
      );
    })}
    <Link
      to={PATHS.search}
      className={clsx(classes.item, classes.itemViewAll)}
      style={{ minWidth: 84, maxWidth: 94 }}
    >
      <span className={clsx(classes.iconWrap, classes.iconWrapViewAll)}>
        <LayoutGrid className={classes.icon} />
      </span>
      <span className="text-center">
        <span className={clsx(classes.label, classes.labelViewAll, "block")}>
          View All
        </span>
        <span className={clsx(classes.sublabel, "block")}>Categories</span>
      </span>
    </Link>
  </div>
);

export default CategoriesNav;
