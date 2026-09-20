import apple from "../assets/brand-logos/apple.png";
import samsung from "../assets/brand-logos/samsung.png";
import oneplus from "../assets/brand-logos/oneplus.png";
import xiaomi from "../assets/brand-logos/xiaomi.png";
import google from "../assets/brand-logos/google.png";
import nothing from "../assets/brand-logos/nothing.png";
import vivo from "../assets/brand-logos/vivo.png";
import oppo from "../assets/brand-logos/oppo.png";
import realme from "../assets/brand-logos/realme.png";
import asus from "../assets/brand-logos/asus.png";
import honor from "../assets/brand-logos/honor.png";
import huawei from "../assets/brand-logos/huawei.png";
import infinix from "../assets/brand-logos/infinix.png";
import iqoo from "../assets/brand-logos/iqoo.png";
import lava from "../assets/brand-logos/lava.png";
import moto from "../assets/brand-logos/moto.png";
import nokia from "../assets/brand-logos/nokia.png";
import poco from "../assets/brand-logos/poco.png";
import sony from "../assets/brand-logos/sony.png";
import techno from "../assets/brand-logos/techno.webp";

const BRAND_LOGOS: Record<string, string> = {
  apple: apple,
  samsung: samsung,
  oneplus: oneplus,
  xiaomi: xiaomi,
  redmi: xiaomi,
  mi: xiaomi,
  google: google,
  pixel: google,
  nothing: nothing,
  vivo: vivo,
  oppo: oppo,
  realme: realme,
  asus: asus,
  honor: honor,
  huawei: huawei,
  infinix: infinix,
  iqoo: iqoo,
  lava: lava,
  moto: moto,
  motorola: moto,
  nokia: nokia,
  poco: poco,
  sony: sony,
  techno: techno,
  tecno: techno,
};

const normalize = (brand: string) => brand.toLowerCase().replace(/[^a-z0-9]/g, "");

export const getBrandLogo = (brand: string): string | undefined =>
  BRAND_LOGOS[normalize(brand)];
