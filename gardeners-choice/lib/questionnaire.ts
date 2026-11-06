// The 5-question intake questionnaire ported from the Chabot Fresh Market
// (C:\Users\ccstudent\Desktop\rpi\index.php.html — "Chabot Microsoft Forms").
// Shared by the sign-up UI (for rendering) and the auth API (for validation).

export type QuestionnaireAnswers = {
  fullName: string;
  email: string;
  visitMarket: boolean;
  visitCoffee: boolean;
  householdSize: string;
  description: string; // must be one of DESCRIPTION_OPTIONS
};

export const DESCRIPTION_OPTIONS = [
  "Chabot Student",
  "Chabot Employee",
  "Hayward Resident",
  "Non-Hayward Resident",
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Default answers. Fresh Market is checked by default, matching the source form. */
export const DEFAULT_ANSWERS: QuestionnaireAnswers = {
  fullName: "",
  email: "",
  visitMarket: true,
  visitCoffee: false,
  householdSize: "",
  description: "",
};

type Validate =
  | { ok: true; answers: QuestionnaireAnswers }
  | { ok: false; error: string };

/**
 * Validate + normalise raw (untrusted) request data into stored-shaped answers.
 * Booleans accept true / 1 / "1"; numbers come back as strings to match the DB.
 */
export function validateAnswers(raw: Record<string, unknown>): Validate {
  const fullName = typeof raw.fullName === "string" ? raw.fullName.trim() : "";
  const email = typeof raw.email === "string" ? raw.email.trim() : "";
  const householdSize =
    typeof raw.householdSize === "string" ? raw.householdSize.trim() : "";
  const description =
    typeof raw.description === "string" ? raw.description.trim() : "";
  const visitMarket =
    raw.visitMarket === true || raw.visitMarket === 1 || raw.visitMarket === "1";
  const visitCoffee =
    raw.visitCoffee === true || raw.visitCoffee === 1 || raw.visitCoffee === "1";

  if (!fullName) return { ok: false, error: "Please enter your full name." };
  if (!EMAIL_RE.test(email))
    return { ok: false, error: "Please enter a valid email address." };
  if (!/^\d+$/.test(householdSize) || Number(householdSize) < 1)
    return {
      ok: false,
      error: "Please enter your household size (a whole number).",
    };
  if (!DESCRIPTION_OPTIONS.includes(description as (typeof DESCRIPTION_OPTIONS)[number]))
    return {
      ok: false,
      error: "Please select the option that best describes you.",
    };
  if (!visitMarket && !visitCoffee)
    return { ok: false, error: "Please tell us what you're here to visit." };

  return {
    ok: true,
    answers: {
      fullName,
      email,
      visitMarket,
      visitCoffee,
      householdSize,
      description,
    },
  };
}
