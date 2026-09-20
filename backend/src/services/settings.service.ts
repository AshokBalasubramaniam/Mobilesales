import Settings from '../models/Settings';
import env from '../config/env';

// env.resend.from is a full "Name <email>" string; admin-configured settings
// store only the bare address (see email.service.ts's xssSanitizer, which
// mangles literal `<`/`>` in request bodies), so fall back to the address
// portion of the env default rather than the whole string.
const extractDefaultEmail = (): string => {
  const match = env.resend.from.match(/<([^>]+)>/);
  return match ? match[1] : env.resend.from;
};

export const getEmailFromAddress = async (): Promise<string> => {
  const settings = await Settings.findOne().lean();
  return settings?.emailFrom || extractDefaultEmail();
};

export const setEmailFromAddress = async (emailFrom: string): Promise<string> => {
  const settings = await Settings.findOneAndUpdate(
    {},
    { emailFrom },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  return settings.emailFrom || emailFrom;
};

export const getHeroBannerUrl = async (): Promise<string | null> => {
  const settings = await Settings.findOne().lean();
  return settings?.heroBannerUrl || null;
};

export const setHeroBannerUrl = async (heroBannerUrl: string): Promise<string | null> => {
  const settings = await Settings.findOneAndUpdate(
    {},
    { heroBannerUrl },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  return settings.heroBannerUrl || null;
};

const DEFAULT_HERO_BANNER_SIZE = 100;

export const getHeroBannerSize = async (): Promise<number> => {
  const settings = await Settings.findOne().lean();
  return settings?.heroBannerSize || DEFAULT_HERO_BANNER_SIZE;
};

export const setHeroBannerSize = async (heroBannerSize: number): Promise<number> => {
  const settings = await Settings.findOneAndUpdate(
    {},
    { heroBannerSize },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  return settings.heroBannerSize || DEFAULT_HERO_BANNER_SIZE;
};
