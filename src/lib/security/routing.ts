/**
 * Static file extensions that bypass middleware session refreshing.
 * Only genuine static assets with these extensions are excluded.
 * Application routes (including those with dots in parameters or query values)
 * are NOT matched, preventing auth bypass (VULN-10).
 */
export const STATIC_ASSET_EXTENSIONS = /\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|woff|woff2|ttf|eot|json)$/i;

export function isStaticAssetPath(pathname: string): boolean {
  if (!pathname || typeof pathname !== 'string') return false;
  return STATIC_ASSET_EXTENSIONS.test(pathname);
}
