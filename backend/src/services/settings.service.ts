import Settings from '../models/Settings';
import env from '../config/env';

// env.smtp.from is a full "Name <email>" string; admin-configured settings
// store only the bare address (see email.service.ts's xssSanitizer, which
// mangles literal `<`/`>` in request bodies), so fall back to the address
// portion of the env default rather than the whole string.
const extractDefaultEmail = (): string => {
  const match = env.smtp.from.match(/<([^>]+)>/);
  return match ? match[1] : env.smtp.from;
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
  return settings.emailFrom;
};
