

## Plan: Remove Sign In Button from Header

Remove the Sign In button (and authenticated user dropdown) from both desktop and mobile navigation in the Header component.

### Changes

**`src/components/Header.tsx`**
- Remove the `LogIn`, `LogOut`, `User`, `Headphones` icon imports
- Remove the `useAuth` import and hook call
- Remove the desktop auth section (Sign In button / user dropdown)
- Remove the mobile auth section at the bottom of the mobile menu
- Keep all other navigation intact

Single file change, no other files affected.

