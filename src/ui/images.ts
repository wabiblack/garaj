// İsteğe bağlı hazır görseller (bkz. docs/gorsel-istegi-2.md, -3.md, -4.md). Dosya yoksa oyun eski görünümüyle çalışır.
const FILES = import.meta.glob('../assets/{ui,scenes,badges,stocks,tools,parts,care,docs}/*.{png,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

const MAP = new Map<string, string>();
for (const [path, url] of Object.entries(FILES)) {
  const [, dir, name] = path.match(/\/assets\/([^/]+)\/([^/]+)\.(?:png|webp)$/)!;
  MAP.set(`${dir}/${name}`, url);
}

/** Ör. extraImage('scenes/donem-2') → görselin adresi ya da undefined. */
export function extraImage(key: string): string | undefined {
  return MAP.get(key);
}
