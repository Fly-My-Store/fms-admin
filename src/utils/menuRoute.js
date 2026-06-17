/**
 * True when pathname is the menu item route or a nested sub-route (e.g. /categories/edit/1).
 */
export function matchesMenuRoute(pathname, url) {
  if (!pathname || !url) return false;
  if (pathname === url) return true;
  return pathname.startsWith(`${url}/`);
}
