import { render, screen, within } from '@testing-library/react';
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
  expect(screen.getByText(/2\.300 TL \(Gün 4\)/)).toBeInTheDocument();
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
  await userEvent.click(screen.getByRole('button', { name: 'Başla' }));
  await userEvent.click(screen.getByRole('tab', { name: 'Profil' }));
  expect(screen.getByText(/12 yaş · .* · Zor mod/)).toBeInTheDocument();
  expect(screen.getByText('Başarımlar').parentElement).toHaveTextContent('1/14');
});

test('ana menü: kayıt varsa Devam et ilerlemeyi gösterir, zor mod kilitli', () => {
  seedSave(makeState({ day: 7, money: 4500 }));
  render(<App />);
  const menu = screen.getByRole('dialog', { name: 'Ana menü' });
  expect(within(menu).getByRole('button', { name: /Devam et.*Gün 7.*4\.500 TL/ })).toBeInTheDocument();
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
  await userEvent.click(screen.getByRole('button', { name: 'Başla' }));
  expect(screen.getByText(/Gün 1/, { selector: '.topbar__day' })).toBeInTheDocument();
});

test('ilk açılışta Oyuna başla; Profil’den ana menüye dönülür', async () => {
  render(<App />);
  expect(screen.queryByRole('button', { name: /Devam et/ })).toBeNull();
  await userEvent.click(screen.getByRole('button', { name: 'Oyuna başla' }));
  await userEvent.click(screen.getByRole('button', { name: 'Hikâyeye başla' }));
  await userEvent.click(screen.getByRole('button', { name: 'Başla' }));
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
  await userEvent.click(within(creator).getByLabelText('Kızıl'));
  await userEvent.click(within(creator).getByLabelText('Gözlük'));
  await userEvent.click(within(creator).getByRole('button', { name: 'Hikâyeye başla' }));
  expect(screen.getByRole('heading', { name: /Ali 12 yaşında/ })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Başla' }));
  expect(screen.getByText(/^Ali · 12 yaş/)).toBeInTheDocument();
});

test('hikâye sahnesi oyuncunun adını ekle birlikte kullanır', () => {
  seedSave(makeState({ story: { seen: [], pending: 'okul' }, player: { name: 'Ayşe', look: { skin: 0, hair: 0, color: 0, glasses: false } } }));
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
