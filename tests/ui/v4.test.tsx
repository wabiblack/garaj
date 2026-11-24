import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/ui/App';
import { makeItem, makeListing, makeState } from '../helpers';
import { renderGame, seedSave } from './uiHelpers';

test('rehber ilk günde ipucu gösterir, kapatılınca bir daha çıkmaz', async () => {
  seedSave(makeState({ listings: [makeListing()] }));
  const { unmount } = renderGame();
  const coach = screen.getByRole('complementary', { name: 'Rehber' });
  expect(coach).toHaveTextContent('Bir ilana dokun');
  await userEvent.click(within(coach).getByRole('button', { name: 'Rehberi kapat' }));
  expect(screen.queryByRole('complementary', { name: 'Rehber' })).toBeNull();
  unmount();
  renderGame();
  expect(screen.queryByRole('complementary', { name: 'Rehber' })).toBeNull();
});

test('uzman olunan türde ilan etiketlenir', () => {
  const stats = { ...makeState().stats, categorySales: { ...makeState().stats.categorySales, bisiklet: 5 } };
  seedSave(makeState({ day: 9, stats, listings: [makeListing()] }));
  renderGame();
  expect(screen.getByText('Uzmanlık alanın')).toBeInTheDocument();
});

test('pazarlıkta aynı modelin son satışları görünür', async () => {
  seedSave(makeState({ day: 9, listings: [makeListing()], prices: { 'Serçe Şehir 26': [{ day: 4, price: 2300 }] } }));
  renderGame();
  await userEvent.click(screen.getByRole('button', { name: /Serçe Şehir 26/ }));
  expect(screen.getByText(/2\.300 TL \(Hafta 4\)/)).toBeInTheDocument();
});

test('motor işinde çırak alınır', async () => {
  seedSave(makeState({ stage: 2, age: 16, money: 60000, day: 20 }));
  renderGame();
  await userEvent.click(screen.getByRole('tab', { name: 'Profil' }));
  expect(screen.queryByRole('button', { name: 'Usta: İşe al' })).toBeNull();
  await userEvent.click(screen.getByRole('button', { name: 'Çırak: İşe al' }));
  expect(screen.getByRole('button', { name: 'Çırak: Çıkar' })).toBeInTheDocument();
});

test('oyun bitince zor modda baştan başlanır, başarımlar kalır', async () => {
  seedSave(makeState({ stage: 3, age: 18, day: 80, won: true, wonSeen: false, achievements: ['sampiyon'], inventory: [makeItem()] }));
  renderGame();
  await userEvent.click(screen.getByRole('button', { name: 'Zor modda baştan başla' }));
  await userEvent.click(screen.getByRole('button', { name: 'Hikâyeye başla' }));
  await userEvent.click(screen.getByRole('button', { name: 'Atla' }));
  await userEvent.click(screen.getByRole('tab', { name: 'Profil' }));
  expect(screen.getByText(/12 yaş · .* · Zor mod/)).toBeInTheDocument();
  expect(screen.getByText('Başarımlar').parentElement).toHaveTextContent('1/14');
});

test('ana menü: kayıt varsa Devam et ilerlemeyi gösterir, zor mod kilitli', () => {
  seedSave(makeState({ day: 7, money: 4500 }));
  render(<App />);
  const menu = screen.getByRole('dialog', { name: 'Ana menü' });
  expect(within(menu).getByRole('button', { name: /Devam et.*Hafta 7.*4\.500 TL/ })).toBeInTheDocument();
  expect(within(menu).getByRole('button', { name: /Zor mod/ })).toBeDisabled();
});

test('ana menü: yeni oyun onay ister, onaylanınca giriş hikâyesi açılır', async () => {
  seedSave(makeState({ day: 7, money: 4500 }));
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: 'Yeni oyun' }));
  const sheet = screen.getByRole('dialog', { name: 'Yeni oyun' });
  expect(sheet).toHaveTextContent('geri alınamaz');
  await userEvent.click(within(sheet).getByRole('button', { name: 'Evet, baştan başla' }));
  await userEvent.click(screen.getByRole('button', { name: 'Hikâyeye başla' }));
  await userEvent.click(screen.getByRole('button', { name: 'Atla' }));
  expect(screen.getByText(/Hafta 1/, { selector: '.topbar__day' })).toBeInTheDocument();
});

test('ilk açılışta Oyuna başla; Profil’den ana menüye dönülür', async () => {
  render(<App />);
  expect(screen.queryByRole('button', { name: /Devam et/ })).toBeNull();
  await userEvent.click(screen.getByRole('button', { name: 'Oyuna başla' }));
  await userEvent.click(screen.getByRole('button', { name: 'Hikâyeye başla' }));
  await userEvent.click(screen.getByRole('button', { name: 'Atla' }));
  await userEvent.click(screen.getByRole('tab', { name: 'Profil' }));
  await userEvent.click(screen.getByRole('button', { name: 'Ana menüye dön' }));
  expect(screen.getByRole('dialog', { name: 'Ana menü' })).toBeInTheDocument();
});

test('ana menüden nasıl oynanır ve ayarlar açılır', async () => {
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: 'Nasıl oynanır' }));
  expect(screen.getByRole('dialog', { name: 'Nasıl oynanır' })).toHaveTextContent('Dürüst ol');
  await userEvent.click(screen.getByRole('button', { name: 'Kapat' }));
  await userEvent.click(screen.getByRole('button', { name: 'Ayarlar' }));
  expect(screen.getByLabelText('Açık tema')).toBeInTheDocument();
});

test('karakter oluşturma: isim ve görünüm oyuna geçer, hikâyede doğru ekle anılır', async () => {
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: 'Oyuna başla' }));
  const creator = screen.getByRole('dialog', { name: 'Karakter' });
  const name = within(creator).getByLabelText('Adı');
  await userEvent.clear(name);
  await userEvent.type(name, 'Ali');
  await userEvent.click(within(creator).getByRole('tab', { name: 'Saç' }));
  await userEvent.click(within(creator).getByLabelText('Kızıl'));
  await userEvent.click(within(creator).getByRole('tab', { name: 'Gözlük' }));
  await userEvent.click(within(creator).getByLabelText('Yuvarlak'));
  expect(within(creator).getByLabelText('Yuvarlak')).toBeChecked();
  await userEvent.click(within(creator).getByRole('button', { name: 'Hikâyeye başla' }));
  expect(screen.getByRole('heading', { name: /Ali 12 yaşında/ })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Atla' }));
  expect(screen.getByText(/^Ali · 12 yaş/)).toBeInTheDocument();
});

test('hikâye sahnesi oyuncunun adını ekle birlikte kullanır', () => {
  seedSave(makeState({ story: { seen: [], pending: 'okul' }, player: { name: 'Ayşe', look: { ...makeState().player.look, skin: 0 } } }));
  renderGame();
  const d = screen.getByRole('dialog', { name: 'Hikâye' });
  expect(d).toHaveTextContent('Ayşe’ye:');
  expect(d).toHaveTextContent('“Ayşe, karne');
});

test('Profil’den görünüm değiştirilir', async () => {
  seedSave(makeState({ day: 5 }));
  renderGame();
  await userEvent.click(screen.getByRole('tab', { name: 'Profil' }));
  await userEvent.click(screen.getByRole('button', { name: 'Görünümü değiştir' }));
  const name = screen.getByLabelText('Adı');
  await userEvent.clear(name);
  await userEvent.type(name, 'Umut');
  await userEvent.click(screen.getByRole('button', { name: 'Kaydet' }));
  expect(screen.getByRole('heading', { name: 'Umut' })).toBeInTheDocument();
});

test('alttan açılan pencereler ana menünün ve karakter ekranının üstünde kalır', async () => {
  const { readFileSync } = await import('node:fs');
  const css = readFileSync('src/ui/theme.css', 'utf8');
  const z = (sel: string) => Number(new RegExp(`\\n\\${sel} \\{[^}]*?z-index: (\\d+)`).exec(css)![1]);
  expect(z('.sheet-backdrop')).toBeGreaterThan(z('.menu'));
  expect(z('.sheet-backdrop')).toBeGreaterThan(z('.creator'));
  expect(z('.toast')).toBeGreaterThan(z('.sheet-backdrop'));
});

test('karakter ekranında seçilen yaş, oyunun başlangıç yaşı olur', async () => {
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: 'Oyuna başla' }));
  const creator = screen.getByRole('dialog', { name: 'Karakter' });
  const ages = within(creator).getByRole('radiogroup', { name: 'Başlangıç yaşı' });
  expect(within(ages).queryByLabelText('25 yaş')).toBeNull();
  await userEvent.click(within(ages).getByLabelText('16 yaş'));
  await userEvent.click(within(creator).getByRole('button', { name: 'Hikâyeye başla' }));
  expect(screen.getByRole('heading', { name: /16 yaşında/ })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Atla' }));
  expect(screen.getByText(/· 16 yaş/)).toBeInTheDocument();
});

test('Finans sekmesinde piyasa endeksi ve al-sat defteri görünür', async () => {
  const { initialMarket } = await import('../../src/game/market');
  const market = { ...initialMarket(), bisiklet: [1, 1.1] };
  seedSave(makeState({ market, ledger: [
    { day: 1, kind: 'al', name: 'Kanat BMX', category: 'bisiklet', price: 1000 },
    { day: 2, kind: 'sat', name: 'Kanat BMX', category: 'bisiklet', price: 1600, profit: 600 },
  ] }));
  renderGame();
  await userEvent.click(screen.getByRole('tab', { name: 'Finans' }));
  const piyasa = screen.getByRole('region', { name: 'Piyasa' });
  expect(within(piyasa).getByText('Bisiklet')).toBeInTheDocument();
  expect(within(piyasa).getByText('▲ %10')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('tab', { name: 'Defter' }));
  const defter = screen.getByRole('region', { name: 'Al-sat defteri' });
  expect(within(defter).getAllByText('Kanat BMX')).toHaveLength(2);
  expect(within(defter).getByText('+600 TL')).toBeInTheDocument();
});

test('Finans > Banka: reşit olmayan kredi göremez, birikim yapabilir', async () => {
  seedSave(makeState({ money: 2000 }));
  renderGame();
  await userEvent.click(screen.getByRole('tab', { name: 'Finans' }));
  await userEvent.click(screen.getByRole('tab', { name: 'Banka' }));
  const bank = screen.getByRole('region', { name: 'Banka' });
  expect(within(bank).getByText(/18 yaşından önce/)).toBeInTheDocument();
  expect(within(bank).queryByRole('button', { name: /kredi çek/ })).toBeNull();
  await userEvent.click(within(bank).getByRole('button', { name: 'Yatır: 1.000 TL' }));
  expect(within(bank).getByText('Birikim: 1.000 TL')).toBeInTheDocument();
});

test('Finans > Banka: koşulları sağlayan kredi çeker ve kapatır', async () => {
  seedSave(makeState({ stage: 3, age: 18, money: 500_000, reputation: 100, stats: { ...makeState().stats, sales: 20 } }));
  renderGame();
  await userEvent.click(screen.getByRole('tab', { name: 'Finans' }));
  await userEvent.click(screen.getByRole('tab', { name: 'Banka' }));
  const bank = screen.getByRole('region', { name: 'Banka' });
  expect(within(bank).getByText('Kredi limitin: 3.000.000 TL')).toBeInTheDocument();
  await userEvent.click(within(bank).getByRole('button', { name: '750.000 TL kredi çek' }));
  expect(within(bank).getByText('Borç: 825.000 TL')).toBeInTheDocument();
  await userEvent.click(within(bank).getByRole('button', { name: /Borcu kapat/ }));
  expect(within(bank).getByText('Kredi limitin: 3.000.000 TL')).toBeInTheDocument();
});

test('aile görevi ilanlarda görünür, Finans > Aile’den ödenir', async () => {
  const task = { kind: 'katki' as const, from: 'baba' as const, title: 'Eve katkı', text: 'Eve 200 TL katkı verebilir misin?', amount: 200, daysLeft: 2 };
  seedSave(makeState({ money: 1000, family: { trust: 60, task, debt: 0, debtDays: 0 } }));
  renderGame();
  const card = screen.getByRole('region', { name: 'Aile görevi' });
  expect(within(card).getByText(/Eve 200 TL katkı/)).toBeInTheDocument();
  await userEvent.click(within(card).getByRole('button', { name: 'Ver: 200 TL' }));
  expect(screen.queryByRole('region', { name: 'Aile görevi' })).toBeNull();
  await userEvent.click(screen.getByRole('tab', { name: 'Finans' }));
  await userEvent.click(screen.getByRole('tab', { name: 'Aile' }));
  const aile = screen.getByRole('region', { name: 'Aile' });
  expect(within(aile).getByText('Güven 68/100')).toBeInTheDocument();
  await userEvent.click(within(aile).getByRole('button', { name: /Aileden borç al/ }));
  expect(within(aile).getByText(/Aileye borcun/)).toBeInTheDocument();
});

test('Finans > Borsa: reşit olmayan yalnız izler, reşit olan alır satar', async () => {
  seedSave(makeState({ stage: 3, age: 18, money: 100_000 }));
  renderGame();
  await userEvent.click(screen.getByRole('tab', { name: 'Finans' }));
  await userEvent.click(screen.getByRole('tab', { name: 'Borsa' }));
  const borsa = screen.getByRole('region', { name: 'Borsa' });
  const row = within(borsa).getByRole('group', { name: 'Yıldız Oto' });
  await userEvent.click(within(row).getByRole('button', { name: /^Al:/ }));
  expect(within(row).getByText(/^\d+ hisse/)).toBeInTheDocument();
  await userEvent.click(within(row).getByRole('button', { name: 'Hepsini sat' }));
  expect(within(row).queryByText(/^\d+ hisse/)).toBeNull();
});

test('Finans > Borsa reşit olmayana kapalı', async () => {
  seedSave(makeState());
  renderGame();
  await userEvent.click(screen.getByRole('tab', { name: 'Finans' }));
  await userEvent.click(screen.getByRole('tab', { name: 'Borsa' }));
  const borsa = screen.getByRole('region', { name: 'Borsa' });
  expect(within(borsa).getByText(/18 yaşında açılır/)).toBeInTheDocument();
  expect(within(borsa).queryByRole('button', { name: /^Al:/ })).toBeNull();
});

test('alt menü sekme sayısı kadar sütun', async () => {
  const { readFileSync } = await import('node:fs');
  const css = readFileSync('src/ui/theme.css', 'utf8');
  const cols = Number(/\n\.tabbar \{[^}]*?repeat\((\d+), 1fr\)/.exec(css)![1]);
  seedSave(makeState());
  renderGame();
  expect(screen.getAllByRole('tab').filter((t) => t.closest('.tabbar'))).toHaveLength(cols);
});

test('Profil > Yetenekler: puan varsa sekmede rozet, geliştir düğmesi çalışır', async () => {
  const { initialTalents } = await import('../../src/game/talents');
  seedSave(makeState({ talents: { ...initialTalents(), xp: 60, level: 2, points: 1 } }));
  renderGame();
  expect(screen.getByRole('tab', { name: /Profil/ })).toHaveTextContent('1');
  await userEvent.click(screen.getByRole('tab', { name: /Profil/ }));
  const panel = screen.getByRole('region', { name: 'Yetenekler' });
  expect(within(panel).getByText('Seviye 2')).toBeInTheDocument();
  await userEvent.click(within(panel).getByRole('button', { name: 'Karizma geliştir' }));
  expect(within(panel).getByLabelText('Karizma 1/3')).toBeInTheDocument();
  expect(within(panel).queryByRole('button', { name: /geliştir/ })).toBeNull();
});

test('karakter ekranında görünüm ayrıntıları ve kişilik seçilir; kişilik yeteneğe yansır', async () => {
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: 'Oyuna başla' }));
  const creator = screen.getByRole('dialog', { name: 'Karakter' });
  for (const t of ['Kişilik', 'Ten', 'Saç', 'Model', 'Göz', 'Yüz', 'Renk', 'Gözlük', 'Aksesuar']) {
    expect(within(creator).getByRole('tab', { name: t })).toBeInTheDocument();
  }
  await userEvent.click(within(creator).getByRole('tab', { name: 'Model' }));
  await userEvent.click(within(creator).getByLabelText('Kıvırcık'));
  await userEvent.click(within(creator).getByRole('tab', { name: 'Aksesuar' }));
  await userEvent.click(within(creator).getByLabelText('Küpe'));
  await userEvent.click(within(creator).getByRole('tab', { name: 'Kişilik' }));
  await userEvent.click(within(creator).getByLabelText('Tamirci ruhlu'));
  await userEvent.click(within(creator).getByRole('button', { name: 'Hikâyeye başla' }));
  await userEvent.click(screen.getByRole('button', { name: 'Atla' }));
  await userEvent.click(screen.getByRole('tab', { name: /Profil/ }));
  expect(screen.getByLabelText('Tamircilik 1/3')).toBeInTheDocument();
  expect(screen.getByText(/Dedesinin tezgâhının başında/)).toBeInTheDocument();
});

test('görünüm düzenlenirken kişilik sekmesi yok', async () => {
  seedSave(makeState());
  renderGame();
  await userEvent.click(screen.getByRole('tab', { name: /Profil/ }));
  await userEvent.click(screen.getByRole('button', { name: 'Görünümü değiştir' }));
  expect(screen.queryByRole('tab', { name: 'Kişilik' })).toBeNull();
});

test('pazarlıkta araç yaşı/kilometresi ve incelenmiş riskli ilanın uyarısı görünür', async () => {
  const car = makeItem({ category: 'araba', brand: 'Doruk', model: 'Sedan 1.6', modelAge: 8, km: 120000, baseValue: 500000 });
  seedSave(makeState({ stage: 3, age: 18, money: 1e6, listings: [makeListing({ item: car, risk: 'calinti', inspected: true })] }));
  renderGame();
  await userEvent.click(screen.getByText('Doruk Sedan 1.6'));
  const sheet = screen.getByRole('dialog', { name: 'Pazarlık' });
  expect(within(sheet).getByText('8 yıllık · 120.000 km')).toBeInTheDocument();
  expect(within(sheet).getByRole('alert')).toHaveTextContent(/çalıntı/);
});

test('kendin yap tamiri: teşhis, söküm, orijinal parça, montaj (tork)', async () => {
  const d = { id: 'd1', name: 'Zincir paslı', repairCost: 1000, valueHit: 0.1, known: true };
  seedSave(makeState({ money: 5000, inventory: [makeItem({ defects: [d] })] }));
  renderGame();
  fireEvent.click(screen.getByRole('tab', { name: 'Garaj' }));
  fireEvent.click(screen.getByRole('button', { name: /Tamir et: Zincir paslı/ }));
  const dialog = screen.getByRole('dialog', { name: 'Tamir' });
  fireEvent.click(within(dialog).getByRole('button', { name: /Kendin yap/ }));
  fireEvent.click(within(dialog).getByRole('button', { name: 'Fan' }));
  expect(within(dialog).getByRole('status')).toHaveTextContent(/sağlam/);
  fireEvent.click(within(dialog).getByRole('button', { name: 'Zincir' }));
  fireEvent.click(within(dialog).getByLabelText('İngiliz anahtarı'));
  for (const screw of within(dialog).getAllByRole('button', { name: /^Vida/ })) for (let k = 0; k < 3; k++) fireEvent.click(screw);
  fireEvent.click(within(dialog).getByRole('button', { name: /Orijinal/ }));
  fireEvent.click(within(dialog).getByRole('button', { name: 'Parçayı yerine tak' }));
  const sik = within(dialog).getByRole('button', { name: 'Sık!' });
  for (let k = 0; k < 3; k++) fireEvent.pointerDown(sik);
  expect(screen.queryByRole('button', { name: /Zincir paslı/ })).toBeNull();
});

test('muadil parça kargoda bekler; hayvan kendin tedavi edilir', async () => {
  const d = { id: 'd1', name: 'Fren tutmuyor', repairCost: 1000, valueHit: 0.1, known: true };
  const sick = { id: 'd2', name: 'Hasta', repairCost: 600, valueHit: 0.3, known: true };
  seedSave(makeState({ money: 5000, inventory: [makeItem({ id: 'a', defects: [d] }), makeItem({ id: 'b', category: 'guvercin', brand: 'Taklacı', model: 'Ankara', defects: [sick] })], parts: [{ itemId: 'a', defectId: 'd1', source: 'muadil', arrives: 2 }] }));
  renderGame();
  fireEvent.click(screen.getByRole('tab', { name: 'Garaj' }));
  expect(screen.getByRole('button', { name: 'Kargoda: Fren tutmuyor' })).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: /Tedavi et: Hasta/ }));
  const dialog = screen.getByRole('dialog', { name: 'Bakım' });
  fireEvent.click(within(dialog).getByRole('button', { name: /Kendin bak/ }));
  fireEvent.click(within(dialog).getByLabelText('İlaç'));
  fireEvent.click(within(dialog).getByLabelText('Temiz su'));
  fireEvent.click(within(dialog).getByRole('button', { name: 'Uygula' }));
  for (let k = 0; k < 8; k++) fireEvent.click(within(dialog).getByRole('button', { name: 'Fırçala' }));
  expect(screen.queryByRole('button', { name: /Hasta/ })).toBeNull();
});
