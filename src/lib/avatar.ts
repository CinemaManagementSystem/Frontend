export const DEFAULT_AVATAR_URL =
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80';

export function normalizeAvatar(avatar?: string | null): string | undefined {
  const value = avatar?.trim();
  if (!value || value === DEFAULT_AVATAR_URL) return undefined;
  return value;
}

export function getAvatarSrc(avatar?: string | null): string {
  return normalizeAvatar(avatar) ?? DEFAULT_AVATAR_URL;
}
