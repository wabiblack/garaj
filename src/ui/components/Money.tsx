import { formatTL } from '../../game/format';

export function Money({ value, className = '' }: { value: number; className?: string }) {
  return <span className={'money ' + className}>{formatTL(value)}</span>;
}
