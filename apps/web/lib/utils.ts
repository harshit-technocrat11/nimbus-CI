
export function formatRelativeTime(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 5) return 'just now';
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '—';
  }
}


export function formatDuration(
  startedAt?: string | null,
  completedAt?: string | null,
  fallbackSeconds?: number
): string {
  if (fallbackSeconds !== undefined && fallbackSeconds !== null) {
    if (fallbackSeconds < 60) return `${fallbackSeconds}s`;
    const mins = Math.floor(fallbackSeconds / 60);
    const secs = fallbackSeconds % 60;
    return `${mins}m ${secs}s`;
  }

  if (!startedAt) return '—';
  const start = new Date(startedAt).getTime();
  const end = completedAt ? new Date(completedAt).getTime() : Date.now();
  const diffSec = Math.max(0, Math.floor((end - start) / 1000));

  if (diffSec < 60) return `${diffSec}s`;
  const mins = Math.floor(diffSec / 60);
  const secs = diffSec % 60;
  return `${mins}m ${secs}s`;
}


export function formatFullDateTime(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  } catch {
    return '—';
  }
}

export function formatShortSha(sha?: string | null): string {
  if (!sha) return 'HEAD';
  return sha.slice(0, 7);
}

/**
 * Truncate text with ellipsis
 */
export function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}


export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch {
    return false;
  }
}

/**
 * Parse repository name and owner from a GitHub URL or string
 */
export function parseRepoInfo(urlOrName: string): { owner: string; name: string } {
  try {
    if (urlOrName.includes('github.com')) {
      const url = new URL(urlOrName.startsWith('http') ? urlOrName : `https://${urlOrName}`);
      const parts = url.pathname.replace(/^\/|\/$/g, '').split('/');
      return {
        owner: parts[0] || 'harshit',
        name: parts[1]?.replace(/\.git$/, '') || urlOrName,
      };
    }
    if (urlOrName.includes('/')) {
      const parts = urlOrName.split('/');
      return { owner: parts[0] || 'harshit', name: parts[1] || urlOrName };
    }
    return { owner: 'harshit', name: urlOrName };
  } catch {
    return { owner: 'harshit', name: urlOrName };
  }
}
