import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SIYAKHA } from "@/lib/proposals";
import { CONSENT_TEXT, validateRegistration, type ViewerRegistration } from "@/lib/deckViewer";

/**
 * Registration gate for every secure project deck. It appears before any
 * project, client or commercial detail is loaded: the token is validated
 * server-side first, and only a successful registration returns deck content.
 * No password is requested and nothing is emailed.
 */
const ViewerGate: React.FC<{
  onRegister: (input: ViewerRegistration) => Promise<void>;
  error?: string | null;
}> = ({ onRegister, error }) => {
  const [form, setForm] = useState<ViewerRegistration>({
    first_name: "",
    surname: "",
    email: "",
    consent: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const found = validateRegistration(form);
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      await onRegister({ ...form, email: form.email.trim() });
    } finally {
      setBusy(false);
    }
  };

  const field = (key: "first_name" | "surname" | "email", label: string, type = "text") => (
    <div>
      <label htmlFor={key} className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </label>
      <Input
        id={key}
        name={key}
        type={type}
        autoComplete={key === "email" ? "email" : key === "first_name" ? "given-name" : "family-name"}
        value={form[key]}
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? `${key}-error` : undefined}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="mt-1"
        required
      />
      {errors[key] && (
        <p id={`${key}-error`} className="mt-1 text-xs text-destructive">
          {errors[key]}
        </p>
      )}
    </div>
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <div className="w-full max-w-md border border-border p-8">
        <p className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground">{SIYAKHA.company}</p>
        <h1 className="mt-3 text-xl font-semibold tracking-tight">Secure project deck</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please confirm who you are before opening this project. No password is required.
        </p>

        <form className="mt-6 space-y-4" onSubmit={submit} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("first_name", "First name")}
            {field("surname", "Surname")}
          </div>
          {field("email", "Email address", "email")}

          <div className="flex gap-3 border border-border p-3">
            <input
              id="consent"
              type="checkbox"
              className="mt-1 h-4 w-4"
              checked={form.consent}
              aria-invalid={!!errors.consent}
              onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
            />
            <label htmlFor="consent" className="text-xs leading-relaxed text-muted-foreground">
              {CONSENT_TEXT}
            </label>
          </div>
          {errors.consent && <p className="text-xs text-destructive">{errors.consent}</p>}
          {error && <p className="text-xs text-destructive">{error}</p>}

          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Opening…" : "Open project deck"}
          </Button>
        </form>

        <p className="mt-6 text-xs text-muted-foreground">
          Questions about this link: {SIYAKHA.email}
        </p>
      </div>
    </main>
  );
};

export default ViewerGate;
