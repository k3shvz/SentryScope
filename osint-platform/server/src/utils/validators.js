export const USERNAME_REGEX = /^[a-zA-Z0-9_.-]{1,39}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const DOMAIN_REGEX = /^(?!-)[A-Za-z0-9-]{1,63}(?<!-)(\.[A-Za-z0-9-]{1,63})+$/;
export const HEX_PREFIX_REGEX = /^[0-9A-Fa-f]{5}$/;
export const URL_REGEX = /^[a-z0-9.-]+\.[a-z]{2,}([/?#].*)?$/i;
