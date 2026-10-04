/** Only allows same-origin paths, preventing open redirects via the `redirect` query param. */
export function getSafeRedirect(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) {
    return '/';
  }
  return value;
}
