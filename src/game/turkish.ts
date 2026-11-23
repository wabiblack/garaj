// Özel isimlere Türkçe ek: ünlü uyumu ve kaynaştırma harfiyle (Kerem’e, Ali’ye, Ayşe’nin, Umut’un).
const VOWELS = 'aıoueiöü';
const BACK = 'aıou';

function lastVowel(word: string): string | null {
  const w = word.toLocaleLowerCase('tr-TR');
  for (let i = w.length - 1; i >= 0; i--) if (VOWELS.includes(w[i])) return w[i];
  return null;
}

const endsWithVowel = (word: string) => VOWELS.includes(word.toLocaleLowerCase('tr-TR').slice(-1));

/** Yönelme eki: Kerem’e, Ali’ye, Umut’a. */
export function dative(name: string): string {
  const v = lastVowel(name);
  const e = v && BACK.includes(v) ? 'a' : 'e';
  return `${name}’${endsWithVowel(name) ? 'y' : ''}${e}`;
}

/** İyelik (tamlayan) eki: Kerem’in, Ayşe’nin, Umut’un, Ömür’ün. */
export function genitive(name: string): string {
  const v = lastVowel(name) ?? 'e';
  const i = 'aı'.includes(v) ? 'ı' : 'ei'.includes(v) ? 'i' : 'ou'.includes(v) ? 'u' : 'ü';
  return `${name}’${endsWithVowel(name) ? 'n' : ''}${i}n`;
}
