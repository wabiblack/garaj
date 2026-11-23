const fmt = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 });

export function formatTL(n: number): string {
  return `${fmt.format(n)} TL`;
}
