import { Button } from '../components/Button';

export function BrokenSaveScreen({ onReset }: { onReset(): void }) {
  return (
    <div className="fullscreen">
      <div className="fullscreen__inner">
        <h1>Kayıt okunamadı</h1>
        <p className="muted">Kayıtlı oyun bozulmuş ya da eski bir sürüme ait. Yeni bir oyuna başlayabilirsin.</p>
        <Button variant="primary" block onClick={onReset}>Yeni oyun</Button>
      </div>
    </div>
  );
}
