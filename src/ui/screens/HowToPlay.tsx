import { Sheet } from '../components/Sheet';

const RULES: [title: string, text: string][] = [
  ['Al', 'İlanlardan bir şeye dokun, istenenin altında teklif ver. Satıcının sabrı biterse vazgeçer. Önce bakarsan gizli kusurları görürsün.'],
  ['Hazırla', 'Garaj’da temizle, boya, kusurları tamir et. Tamiri ustaya yaptırabilir ya da kendin yapabilirsin: arızalı parçayı bul, vidaları doğru aletle sök, parçayı sipariş et ve tork ayarıyla tak.'],
  ['Sat', 'Fiyatını koy, kusurunu belirtip belirtmeyeceğine karar ver. Ayı bitirince ay sonunda alıcılar teklif getirir.'],
  ['Dürüst ol', 'Gizlediğin kusur ortaya çıkarsa itibarın düşer. İtibar yüksekse daha çok alıcı gelir.'],
  ['Büyü', '12 yaşında bisikletle başlarsın. Para biriktikçe motora, sonra arabaya, galeriye ve holdinge geçersin.'],
  ['Dikkat', 'Rakip Cevdet iyi ilanlara göz koyar. Siparişler ve mezatlar fırsattır, kaçırma.'],
  ['Gelişim', 'Alım, satış, tamir ve aile görevleri tecrübe verir. Her seviyede Profil’den bir yetenek geliştir: pazarlık, göz, tamircilik, karizma.'],
  ['Zaman', 'Her tur bir ay. 12 ay dolunca bir yaş büyürsün; yaşın büyüdükçe yeni eşyalar açılır: 13’te telefon, 14’te konsol ve köpek, 15’te bilgisayar, 16’da motor, 18’de araba. Okul aylarında ayda 6 iş yapabilirsin, yaz tatilinde sınır yok.'],
  ['Finans', 'Piyasa her ay değişir: endeks yüksekken sat, düşükken al. Defterde her alım-satımın kârı yazar. Banka kredisi ve borsa 18 yaşında açılır; öncesinde aileye danış.'],
  ['Gerçek hayat', 'Araçların yaşı ve kilometresi fiyatı düşürür; elinde tuttuğun araca her ay sigorta ve vergi ödersin, alırken noter masrafı vardır. Ucuz ilana dikkat: çalıntı ya da sahte olabilir, önce bak. İnternetten alınan mal gelecek ay kargoyla gelir. 16 ve 18 yaşta ehliyet sınavına girersin.'],
  ['Okul', 'Okul aylarında az iş yaparsan karnen iyi gelir, ailen sevinir. 18 yaşında meslek seçersin.'],
  ['Hayvanlar', 'Hayvanlara bakarsan değerlenir. Bir köpeği yanında tutarsan garajı hırsızdan korur; kedi fareleri uzak tutar. Her ay mama ver.'],
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
