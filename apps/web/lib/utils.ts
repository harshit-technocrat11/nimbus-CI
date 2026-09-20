import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatShortSha(sha?: string | null): string {
  if (!sha) return '—';
  return sha.length > 7 ? sha.substring(0, 7) : sha;
}

export function formatRelativeTime(dateInput?: string | Date | null): string {
  if (!dateInput) return '—';
  try {
    const date = new Date(dateInput);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSec < 60) return `${Math.max(1, diffSec)}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  } catch {
    return '—';
  }
}

export function formatDuration(
  startOrSeconds?: string | Date | number | null,
  endInput?: string | Date | null
): string {
  if (startOrSeconds === null || startOrSeconds === undefined) return '—';
  if (typeof startOrSeconds === 'number') {
    const diffSec = Math.max(0, Math.floor(startOrSeconds));
    if (diffSec < 60) return `${diffSec}s`;
    const min = Math.floor(diffSec / 60);
    const sec = diffSec % 60;
    return `${min}m ${sec}s`;
  }
  try {
    const start = new Date(startOrSeconds).getTime();
    const end = endInput ? new Date(endInput).getTime() : Date.now();
    const diffSec = Math.max(0, Math.floor((end - start) / 1000));

    if (diffSec < 60) return `${diffSec}s`;
    const min = Math.floor(diffSec / 60);
    const sec = diffSec % 60;
    return `${min}m ${sec}s`;
  } catch {
    return '—';
  }
}

export function parseRepoInfo(url: string): { owner: string; name: string } {
  try {
    const cleaned = url.trim().replace(/\/$/, '').replace(/\.git$/, '');
    const parts = cleaned.split('/');
    if (parts.length >= 2) {
      const name = parts[parts.length - 1] || 'repo';
      const owner = parts[parts.length - 2] || 'owner';
      return { owner, name };
    }
  } catch {}
  return { owner: 'user', name: 'repo' };
}

export function formatFullDateTime(dateInput?: string | Date | null): string {
  if (!dateInput) return '—';
  try {
    return new Date(dateInput).toLocaleString();
  } catch {
    return '—';
  }
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}


