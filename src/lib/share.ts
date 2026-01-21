/**
 * Share utilities for events and organizations
 */

export type ShareType = 'event' | 'organization';

interface ShareOptions {
  id: string;
  type: ShareType;
}

/**
 * Generates a shareable URL for an event or organization
 */
export function getShareUrl(options: ShareOptions): string {
  if (typeof window === 'undefined') return '';

  const url = new URL(window.location.origin);

  if (options.type === 'event') {
    // Share link directly to event detail with event parameter
    const currentPath = window.location.pathname;
    url.pathname = currentPath.includes('/organizations/') ? currentPath : '/events';
    url.searchParams.set('event', options.id);
  } else if (options.type === 'organization') {
    // Share link directly to organization page
    url.pathname = `/organizations/${options.id}`;
  }

  return url.toString();
}

/**
 * Copies share URL to clipboard
 */
export async function copyShareUrl(options: ShareOptions): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  try {
    const url = getShareUrl(options);
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}
