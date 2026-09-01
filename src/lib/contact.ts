/**
 * Single source of truth for Siyakha's verified public contact points.
 * These values already existed across the site — do not invent new ones.
 */
export const CONTACT = {
  phoneE164: "+27877239183",
  phoneDisplay: "087 723 9183",
  whatsappE164: "+27815012993",
  whatsappDisplay: "081 501 2993",
  email: "nikita@siyakhatechnology.co.za",
  ownerName: "Nikita Jacobs",
} as const;

export const telHref = `tel:${CONTACT.phoneE164}`;
export const mailtoHref = `mailto:${CONTACT.email}`;
