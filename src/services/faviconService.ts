/**
 * faviconService
 *
 * 从链接 URL 提取域名，生成 Google Favicon API 地址。
 * Google Favicon API 会自动返回该域名的最佳分辨率图标，无需额外权限。
 *
 * 降级策略：URL 解析失败时返回 undefined，调用方应显示默认占位图标。
 */

const FAVICON_API = 'https://www.google.com/s2/favicons';
const FAVICON_SIZE = 64;

/**
 * 根据链接 URL 生成对应的 favicon 地址。
 *
 * @param url 链接地址（可以不含协议头）
 * @returns   Google Favicon API URL，解析失败时返回 undefined
 */
export function getFaviconUrl(url: string): string | undefined {
  try {
    const normalized = url.startsWith('http') ? url : `https://${url}`;
    const { hostname } = new URL(normalized);
    if (!hostname) return undefined;
    return `${FAVICON_API}?domain=${hostname}&sz=${FAVICON_SIZE}`;
  } catch {
    return undefined;
  }
}
