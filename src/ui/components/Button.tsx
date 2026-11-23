import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'good';

export function Button({ variant = 'secondary', small, block, className = '', ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  small?: boolean;
  block?: boolean;
}) {
  const cls = ['btn', `btn--${variant}`, small ? 'btn--small' : '', block ? 'btn--block' : '', className].filter(Boolean).join(' ');
  return <button type="button" className={cls} {...rest} />;
}
