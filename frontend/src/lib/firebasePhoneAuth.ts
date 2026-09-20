import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from "firebase/auth";
import { auth } from "./firebase";

const RECAPTCHA_CONTAINER_ID = "firebase-recaptcha-container";

let verifier: RecaptchaVerifier | null = null;
let confirmationResult: ConfirmationResult | null = null;

const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-phone-number": "Enter a valid 10-digit mobile number.",
  "auth/missing-phone-number": "Enter your mobile number.",
  "auth/quota-exceeded": "Too many OTP requests right now. Try again later.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/operation-not-allowed": "Phone sign-in is not enabled for this project.",
  "auth/captcha-check-failed": "reCAPTCHA verification failed. Please try again.",
  "auth/too-many-requests": "Too many attempts. Try again later.",
  "auth/invalid-verification-code": "Incorrect OTP. Please check and try again.",
  "auth/code-expired": "This OTP has expired. Request a new one.",
  "auth/invalid-verification-id": "This OTP session expired. Request a new OTP.",
  "auth/billing-not-enabled":
    "SMS login isn't active yet — this Firebase project needs the Blaze billing plan enabled before it can send OTPs.",
};

export const describeFirebaseAuthError = (error: unknown): string => {
  const code = (error as { code?: string } | null)?.code;
  if (code && FIREBASE_ERROR_MESSAGES[code]) return FIREBASE_ERROR_MESSAGES[code];
  return error instanceof Error ? error.message : "Something went wrong";
};

const getContainer = (): HTMLElement => {
  let el = document.getElementById(RECAPTCHA_CONTAINER_ID);
  if (!el) {
    el = document.createElement("div");
    el.id = RECAPTCHA_CONTAINER_ID;
    document.body.appendChild(el);
  }
  return el;
};

const getVerifier = (): RecaptchaVerifier => {
  if (!verifier) {
    verifier = new RecaptchaVerifier(auth, getContainer(), {
      size: "invisible",
    });
  }
  return verifier;
};

export const resetFirebasePhoneAuth = (): void => {
  verifier?.clear();
  verifier = null;
  confirmationResult = null;
};

/** Sends an OTP to `+91<phone>` via Firebase Phone Auth. Also covers resend. */
export const sendFirebasePhoneOtp = async (phone: string): Promise<void> => {
  try {
    confirmationResult = await signInWithPhoneNumber(
      auth,
      `+91${phone}`,
      getVerifier(),
    );
  } catch (error) {
    // A used/expired reCAPTCHA widget must be re-rendered before the next
    // attempt, otherwise every retry after a failure fails the same way.
    resetFirebasePhoneAuth();
    throw error;
  }
};

/** Verifies the OTP against the pending request and returns a Firebase ID token. */
export const confirmFirebasePhoneOtp = async (code: string): Promise<string> => {
  if (!confirmationResult) {
    throw new Error("Request an OTP before verifying.");
  }
  const credential = await confirmationResult.confirm(code);
  return credential.user.getIdToken();
};
