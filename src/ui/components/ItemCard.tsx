import type { ReactNode } from 'react';
import type { Item } from '../../game/types';
import { CATEGORY_LABEL } from '../../game/catalog';
import { itemName } from '../../game/selling';
import { Money } from './Money';

export function itemImage(item: Item): string {
  return `${import.meta.env.BASE_URL}images/${item.category}.svg`;
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

export function TagRow({ item }: { item: Item }) {
  const known = item.defects.filter((d) => d.known);
  if (known.length === 0 && item.tags.length === 0) return null;
  return (
    <div className="tags">
      {item.tags.map((t) => <span key={t} className="tag tag--info">{t === 'klasik' ? 'Klasik' : t === 'cabrio' ? 'Üstü açık' : '4x4'}</span>)}
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
      <div className="card__media"><img src={itemImage(item)} alt="" /></div>
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
