import { Sheet } from '../components/Sheet';

const RULES: [title: string, text: string][] = [
  ['Al', 'İlanlardan bir şeye dokun, istenenin altında teklif ver. Satıcının sabrı biterse vazgeçer. Önce bakarsan gizli kusurları görürsün.'],
  ['Hazırla', 'Garaj’da temizle, boya, kusurları tamir et. Tamirde ibre yeşildeyken “Vur!”a basarsan ucuza gelir.'],
  ['Sat', 'Fiyatını koy, kusurunu belirtip belirtmeyeceğine karar ver. Günü bitirince akşam alıcılar teklif getirir.'],
  ['Dürüst ol', 'Gizlediğin kusur ortaya çıkarsa itibarın düşer. İtibar yüksekse daha çok alıcı gelir.'],
  ['Büyü', '12 yaşında bisikletle başlarsın. Para biriktikçe motora, sonra arabaya, galeriye ve holdinge geçersin.'],
  ['Dikkat', 'Rakip Cevdet iyi ilanlara göz koyar. Siparişler ve mezatlar fırsattır, kaçırma.'],
  ['Gelişim', 'Alım, satış, tamir ve aile görevleri tecrübe verir. Her seviyede Profil’den bir yetenek geliştir: pazarlık, göz, tamircilik, karizma.'],
  ['Finans', 'Piyasa her gün değişir: endeks yüksekken sat, düşükken al. Defterde her alım-satımın kârı yazar. Banka kredisi ve borsa 18 yaşında açılır; öncesinde aileye danış.'],
  ['Aile', 'Annenle baban arada senden bir şey ister. Yaparsan güvenleri artar; harçlık ve gerekirse borç verirler.'],
];

export function HowToPlay({ onClose }: { onClose(): void }) {
  return (
    <Sheet open title="Nasıl oynanır" onClose={onClose}>
      <ol className="howto">
        {RULES.map(([title, text], i) => (
          <li key={title} className="howto__item">
            <span className="howto__num" aria-hidden="true">{i + 1}</span>
            <div>
              <div className="howto__title">{title}</div>
              <p className="howto__text">{text}</p>
            </div>
          </li>
        ))}
      </ol>
    </Sheet>
  );
}
