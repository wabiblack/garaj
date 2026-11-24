import type { Stage } from '../../game/types';
import type { Player } from '../../game/player';
import { Button } from '../components/Button';
import { portraitUrl } from '../art';
import { extraImage } from '../images';
import { useState, type CSSProperties } from 'react';
import { CAREERS, EXAM_PASS, examFor, needsExam } from '../../game/life';
import type { CareerId } from '../../game/types';

const TEXT: Record<2 | 3 | 4, { when: string; body(name: string): string; next: string }> = {
  2: {
    when: 'Motor ehliyeti',
    body: (n) => `${n} 16 yaşına girdi. Motor ehliyeti sınavını geçerse biriktirdiği parayla motor da alıp satabilir.`,
    next: 'Yeni hedef: 500.000 TL',
  },
  3: {
    when: 'Reşit oldu',
    body: (n) => `${n} 18 yaşında, reşit oldu. Amcası sanayideki garajını ona bırakacak; önce araba ehliyeti sınavı var.`,
    next: 'Yeni hedef: şehrin en büyük galericisi olmak',
  },
  4: {
    when: 'Holding zamanı',
    body: (n) => `${n} şehrin bir numarası oldu; şimdi ${n} Holding’i kurup başka şehirlere açılıyor.`,
    next: 'Yeni hedef: İzmir, Ankara ve Antalya’da şube açmak',
  },
};

/** Ehliyet sınavı: 3 soru, en az 2 doğru. */
function Exam({ stage, day, onPass, onFail }: { stage: 2 | 3; day: number; onPass(): void; onFail(): void }) {
  const qs = examFor(stage, day);
  const [answers, setAnswers] = useState<number[]>([]);
  const i = answers.length;
  const correct = answers.filter((a, k) => a === qs[k].answer).length;
  if (i >= qs.length) {
    const pass = correct >= EXAM_PASS;
    return (
      <div className="exam" role="group" aria-label="Ehliyet sınavı">
        <h2>{pass ? 'Tebrikler, ehliyetini aldın!' : 'Sınavı geçemedin'}</h2>
        <p className="muted">{correct}/{qs.length} doğru{pass ? '' : `. Geçmek için en az ${EXAM_PASS} doğru gerekiyor.`}</p>
        <Button variant="primary" block onClick={pass ? onPass : onFail}>{pass ? 'Devam' : 'Gelecek ay tekrar dene'}</Button>
      </div>
    );
  }
  const q = qs[i];
  return (
    <div className="exam" role="group" aria-label="Ehliyet sınavı">
      <p className="overlay__kicker">Soru {i + 1}/{qs.length}</p>
      <h2 className="exam__q">{q.q}</h2>
      <div className="exam__opts">
        {q.options.map((o, k) => <Button key={o} block variant="secondary" onClick={() => setAnswers([...answers, k])}>{o}</Button>)}
      </div>
    </div>
  );
}

function Career({ onPick }: { onPick(id: CareerId): void }) {
  return (
    <div className="exam" role="group" aria-label="Meslek seçimi">
      <h2>Liseyi bitirdin. Şimdi ne yapacaksın?</h2>
      <div className="exam__opts">
        {(Object.keys(CAREERS) as CareerId[]).map((id) => (
          <Button key={id} block variant="secondary" onClick={() => onPick(id)}>
            <span className="story__label">{CAREERS[id].name}</span>
            <span className="story__effect">{CAREERS[id].text}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}

export function TransitionScreen({ to, player, age, day, onContinue, onFail, onCareer }: {
  to: Stage; player: Player; age: number; day: number; onContinue(): void; onFail(): void; onCareer(id: CareerId): void;
}) {
  const key = to === 1 ? 2 : to;
  const t = TEXT[key];
  const scene = extraImage(`scenes/donem-${key}`);
  const [step, setStep] = useState<'hikaye' | 'sinav' | 'meslek'>('hikaye');
  const next = () => {
    if (step === 'hikaye' && needsExam(key)) setStep('sinav');
    else if (step !== 'meslek' && key === 3 && !player.career) setStep('meslek');
    else onContinue();
  };
  return (
    <div
      className={'overlay overlay--center' + (scene ? ' overlay--scene' : '')}
      style={scene ? ({ '--scene': `url("${scene}")` } as CSSProperties) : undefined}
      role="dialog" aria-modal="true" aria-label="Yeni dönem"
    >
      <div className="overlay__inner overlay__inner--center">
        {step === 'hikaye' ? (
          <>
            <img className="story__face" src={portraitUrl(age, player.look)} alt={`${player.name} ${age} yaşında`} />
            <p className="overlay__kicker">{t.when}</p>
            <h1 className="transition__title">{t.body(player.name)}</h1>
            <p className="muted">{t.next}</p>
            <Button variant="primary" block onClick={next}>{needsExam(key) ? 'Ehliyet sınavına gir' : 'Devam'}</Button>
          </>
        ) : step === 'sinav' && needsExam(key) ? (
          <Exam stage={key} day={day} onPass={next} onFail={onFail} />
        ) : (
          <Career onPick={(id) => { onCareer(id); onContinue(); }} />
        )}
      </div>
    </div>
  );
}
