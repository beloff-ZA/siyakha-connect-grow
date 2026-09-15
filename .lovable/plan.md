# Call-update emails to the person who logged the call (Satio first)

## Goal
When a logged call moves along (assigned, on site, status changes, completed), the person who logged it gets a professional Siyakha-branded email — starting with Danelle van den Berg at the Satio BS Service Desk (support@satio.co.za). Reusable for any client who emails us job cards, not just Satio.

## Sender address
- Emails come from your own domain, e.g. `Siyakha Technology <notify@siyakhatechnology.co.za>` — never a Lovable address, and not the current unrelated `angoladay.info` sender.
- Requires the one-time email domain setup for siyakhatechnology.co.za (setup dialog). Code ships regardless; emails flow once the domain is verified.

## Steps

1. **Email domain + infrastructure (user action, then automated)**
   - User completes the email domain setup dialog for siyakhatechnology.co.za.
   - Run email infrastructure setup so app emails send from the branded domain.

2. **"Logged by" contact on every call (reusable)**
   - Add to `logged_calls`: `logging_contact_name`, `logging_contact_email`.
   - Editable in the admin Logged Call form; sensible defaults remembered per client (Satio calls prefill Danelle / support@satio.co.za).
   - Backfill the existing Satio/InteliGro call with Danelle's details.

3. **Call-update email template**
   - New branded template (black-and-white Siyakha look): call number, client, end customer, site, status, engineer, latest note, and sign-off state.
   - Sent via the built-in email queue with idempotency per event (no duplicates on retry), unsubscribe footer included automatically.

4. **Triggers**
   - Call created/assigned to an engineer.
   - Status changes (on site, in progress, on hold, completed).
   - Job card signed — logging contact also receives the completed Satio sign-off sheet (existing delivery to accounts@/admin@ stays as-is).

5. **Admin visibility**
   - Call view shows "Updates go to: Danelle van den Berg <support@satio.co.za>" and a per-call on/off toggle for update emails.

## Not changing
- Satio sheet layout, sign-off immutability, BOQ data, existing sign-off recipients.

## Technical notes
- New columns on existing `logged_calls` only; RLS policies unchanged.
- Sends via the single `send-transactional-email` function + queue (one recipient per send).
- Branded template in `_shared/transactional-email-templates/`, registry updated, functions deployed.
