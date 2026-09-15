# Satio call-update emails to Danelle (support@satio.co.za)

## Goal
Every update on Satio-logged calls emails Danelle van den Berg at the Satio BS Service Desk (support@satio.co.za), sent from a Siyakha-branded address (never Lovable).

## Steps

1. **Branded sender domain (user action)**
   - User completes the email domain setup for siyakhatechnology.co.za via the setup dialog.
   - Sender address for all call-update emails: `Siyakha Technology <notify@siyakhatechnology.co.za>` (or the configured sender).
   - If DNS verification is still pending, code ships now; emails start flowing once verified.

2. **Logging contact on calls**
   - Add optional fields to `logged_calls`: `logging_contact_name`, `logging_contact_email` (the person who logged the call).
   - Seed/default for Satio calls: Danelle van den Berg — support@satio.co.za.
   - Editable in the Logged Call admin form.

3. **Call-update notifications**
   - Extend `job-card-signoff` (or a small new edge function `notify-call-update`) to send a Siyakha-branded email to the logging contact when:
     - Call status changes (assigned, on site, in progress, on hold, completed)
     - The job card is signed/completed (include the completed Satio sign-off sheet, as today)
   - Non-blocking sends, logged for audit, idempotent per event.
   - Admin sees a "Notified: support@satio.co.za" line in the call activity.

4. **No changes to**
   - BOQ data, the Satio sheet layout, or the sign-off immutability rules.

## Technical notes
- Sender domain via Lovable email infrastructure; Resend remains fallback until verified.
- Emails via existing edge-function pattern (CORS, service-role inserts, HTML + text).
- RLS: new columns on existing table only; policies unchanged.
