"use client";

import {
  DESCRIPTION_OPTIONS,
  type QuestionnaireAnswers,
} from "@/lib/questionnaire";

type Errors = Partial<Record<string, string>>;

type Props = {
  value: QuestionnaireAnswers;
  onChange: (v: QuestionnaireAnswers) => void;
  errors?: Errors;
};

const group: React.CSSProperties = {
  marginBottom: "1.1rem",
};
const legend: React.CSSProperties = {
  fontWeight: 700,
  marginBottom: "0.4rem",
};
const checkLabel: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  marginTop: "0.3rem",
  cursor: "pointer",
};

export default function Questionnaire({ value, onChange, errors }: Props) {
  function set<K extends keyof QuestionnaireAnswers>(
    key: K,
    val: QuestionnaireAnswers[K]
  ) {
    onChange({ ...value, [key]: val });
  }

  return (
    <div className="questionnaire" style={{ marginTop: "0.5rem" }}>
      <p className="kicker">Quick intake</p>
      <h2 style={{ fontSize: "1.15rem", marginTop: 0 }}>
        A few questions when you join
      </h2>
      <p className="form-note">
        The same intake the Chabot Fresh Market uses — so we know who's picking
        up and how to reach you.
      </p>

      {/* 1. Full name */}
      <div style={group}>
        <label htmlFor="q-fullName">1. Your full name *</label>
        <input
          id="q-fullName"
          value={value.fullName}
          onChange={(e) => set("fullName", e.target.value)}
          placeholder="Full name"
          autoComplete="name"
        />
        {errors?.fullName && <p className="form-error">{errors.fullName}</p>}
      </div>

      {/* 2. Email */}
      <div style={group}>
        <label htmlFor="q-email">2. Email *</label>
        <input
          id="q-email"
          type="email"
          value={value.email}
          onChange={(e) => set("email", e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
        />
        {errors?.email && <p className="form-error">{errors.email}</p>}
      </div>

      {/* 3. Here to visit */}
      <div style={group}>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={legend}>3. I am here to visit … *</legend>
          <label style={checkLabel}>
            <input
              type="checkbox"
              checked={value.visitMarket}
              onChange={(e) => set("visitMarket", e.target.checked)}
            />
            the Fresh Market
          </label>
          <label style={checkLabel}>
            <input
              type="checkbox"
              checked={value.visitCoffee}
              onChange={(e) => set("visitCoffee", e.target.checked)}
            />
            the Coffee Bar
          </label>
        </fieldset>
        {errors?.visit && <p className="form-error">{errors.visit}</p>}
      </div>

      {/* 4. Household size */}
      <div style={group}>
        <label htmlFor="q-household">
          4. How many people live in your household? *
        </label>
        <input
          id="q-household"
          type="number"
          min="1"
          inputMode="numeric"
          value={value.householdSize}
          onChange={(e) => set("householdSize", e.target.value)}
          placeholder="e.g. 3"
        />
        {errors?.householdSize && (
          <p className="form-error">{errors.householdSize}</p>
        )}
      </div>

      {/* 5. Best describes you */}
      <div style={group}>
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={legend}>
            5. Please select the option that best describes you. *
          </legend>
          {DESCRIPTION_OPTIONS.map((opt) => (
            <label key={opt} style={checkLabel}>
              <input
                type="radio"
                name="q-description"
                value={opt}
                checked={value.description === opt}
                onChange={() => set("description", opt)}
              />
              {opt}
            </label>
          ))}
        </fieldset>
        {errors?.description && (
          <p className="form-error">{errors.description}</p>
        )}
      </div>
    </div>
  );
}
