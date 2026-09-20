export function getRatingBadge(rating: number): string {
  if (rating <= 0) return 'G';
  if (rating >= 8) return 'R18';
  if (rating >= 6) return 'PG-13';
  return 'G';
}