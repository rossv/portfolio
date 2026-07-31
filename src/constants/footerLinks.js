// The footer's outbound links, by the `data-footer-id` each one carries.
//
// Shared with BadgeCollection so the Footer Friend badge ("Clicked every
// footer link") counts against what the footer actually renders. Keeping the
// total as a hand-written number is what let the two drift: there were five
// links against a total of four, so the badge unlocked a link early.
//
// Add or remove a link here and in Footer.jsx together.

export const FOOTER_LINK_IDS = ['stackexchange', 'linkedin', 'github', 'email'];
