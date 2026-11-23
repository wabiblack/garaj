import type { ReactNode } from 'react';
import type { Item } from '../../game/types';
import { CATEGORY_LABEL } from '../../game/catalog';
import { itemName } from '../../game/selling';
import { Money } from './Money';

const TR: Record<string, string> = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' };

/** "Serçe Şehir 26" → "serce-sehir-26": modele özel görselin dosya adı. */
export function modelSlug(item: Pick<Item, 'brand' | 'model'>): string {
  return `${item.brand} ${item.model}`
    .toLocaleLowerCase('tr-TR')
    .replace(/[çğıöşüâîû]/g, (c) => TR[c])
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Paketlenen çizimler: yalnız var olan dosyalar listelenir, bu yüzden 404 isteği olmaz.
// PNG/WebP (ör. yapay zekâ görseli) aynı addaki SVG çizimin önüne geçer. Bkz. docs/gorsel-istegi.md
const MODEL_FILES = import.meta.glob('../../assets/models/*.{png,webp,svg}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const CATEGORY_FILES = import.meta.glob('../../assets/categories/*.{png,webp,svg}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;

function fileMap(files: Record<string, string>): Map<string, string> {
  const map = new Map<string, string>();
  for (const [path, url] of Object.entries(files)) {
    const [, name, ext] = path.match(/\/([^/]+)\.(png|webp|svg)$/)!;
    if (!map.has(name) || ext !== 'svg') map.set(name, url);
  }
  return map;
}
const MODELS = fileMap(MODEL_FILES);
const CATEGORIES = fileMap(CATEGORY_FILES);

export function hasModelArt(item: Pick<Item, 'brand' | 'model'>): boolean {
  return MODELS.has(modelSlug(item));
}

export function categoryImageUrl(category: Item['category']): string {
  return CATEGORIES.get(category) ?? '';
}

export function itemImageUrl(item: Item): string {
  return MODELS.get(modelSlug(item)) ?? categoryImageUrl(item.category);
}

export function ItemImage({ item, className }: { item: Item; className?: string }) {
  return <img src={itemImageUrl(item)} alt="" className={className} draggable={false} />;
}

export function ConditionBar({ value }: { value: number }) {
  const tone = value >= 70 ? 'good' : value >= 40 ? 'mid' : 'bad';
  return (
    <div className="cond" aria-label={`Durum %${value}`}>
      <div className="cond__track"><div className={`cond__fill cond__fill--${tone}`} style={{ width: `${value}%` }} /></div>
      <span className="cond__label">%{value}</span>
    </div>
  );
}

const TAG_LABEL = { klasik: 'Klasik', cabrio: 'Üstü açık', '4x4': '4x4', nadir: 'Nadir' } as const;

export function TagRow({ item }: { item: Item }) {
  const known = item.defects.filter((d) => d.known);
  if (known.length === 0 && item.tags.length === 0) return null;
  return (
    <div className="tags">
      {item.tags.map((t) => <span key={t} className={'tag ' + (t === 'nadir' || t === 'klasik' ? 'tag--accent' : 'tag--info')}>{TAG_LABEL[t]}</span>)}
      {known.map((d) => <span key={d.id} className="tag tag--bad">{d.name}</span>)}
    </div>
  );
}

export function ItemCard({ item, price, priceLabel, subtitle, onClick, badge, children }: {
  item: Item;
  price?: number;
  priceLabel?: string;
  subtitle?: ReactNode;
  onClick?(): void;
  badge?: ReactNode;
  children?: ReactNode;
}) {
  const name = itemName(item);
  const body = (
    <>
      <div className="card__media"><ItemImage item={item} /></div>
      <div className="card__main">
        <div className="card__top">
          <span className="card__kicker">{CATEGORY_LABEL[item.category]}</span>
          {badge}
        </div>
        <div className="card__title ellipsis">{name}</div>
        {subtitle ? <div className="card__sub">{subtitle}</div> : null}
        <ConditionBar value={item.condition} />
        <TagRow item={item} />
      </div>
      {price !== undefined ? (
        <div className="card__price">
          {priceLabel ? <span className="card__price-label">{priceLabel}</span> : null}
          <Money value={price} />
        </div>
      ) : null}
    </>
  );
  return (
    <div className="card-wrap">
      {onClick ? (
        <button type="button" className="card card--tap" onClick={onClick} aria-label={name}>{body}</button>
      ) : (
        <div className="card">{body}</div>
      )}
      {children ? <div className="card__actions">{children}</div> : null}
    </div>
  );
}
