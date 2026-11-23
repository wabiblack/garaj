import type { GameState } from '../../game/types';
import { placeSign, placeUrl } from '../art';

/** İşyeri çizimi; tabelada oyuncunun adı yazar. */
export function Place({ state, className, label }: { state: GameState; className?: string; label?: string }) {
  const sign = placeSign(state);
  return (
    <svg className={className} viewBox="0 0 320 140" preserveAspectRatio="xMidYMid slice" role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <image href={placeUrl(state)} width="320" height="140" />
      {sign ? (
        <text
          x={sign.x + sign.w / 2} y={sign.y + sign.size + 2} textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight={800}
          fontSize={sign.size} fill={sign.ink} textLength={sign.fit} lengthAdjust={sign.fit ? 'spacingAndGlyphs' : undefined}
        >{sign.text}</text>
      ) : null}
    </svg>
  );
}
