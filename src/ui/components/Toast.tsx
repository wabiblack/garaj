import { useEffect, useState } from 'react';

export function Toast({ message, stamp }: { message: string | null; stamp: unknown }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!message) return setVisible(false);
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2600);
    return () => clearTimeout(t);
  }, [message, stamp]);
  if (!visible || !message) return null;
  return <div className="toast" role="status">{message}</div>;
}
