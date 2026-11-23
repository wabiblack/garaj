import { act, fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/ui/App';
import { makeItem, makeListing, makeState } from '../helpers';
import { renderGame, seedSave } from './uiHelpers';
import { needleAt } from '../../src/ui/screens/RepairSheet';
import { exportSave } from '../../src/game/save';

test('hikâye sahnesi seçimle kapanır ve etkisi uygulanır', async () => {
  seedSave(makeState({ money: 2000, story: { seen: [], pending: 'dede' } }));
  renderGame();
  const dialog = screen.getByRole('dialog', { name: 'Hikâye' });
  await userEvent.click(within(dialog).getByRole('button', { name: /Harçlık iste/ }));
  expect(screen.queryByRole('dialog', { name: 'Hikâye' })).toBeNull();
  expect(screen.getByText('Deden gülüp harçlık verdi')).toBeInTheDocument();
});

test('sipariş ilanlarda görünür, garajda uyan mal siparişe verilir', async () => {
  const order = { id: 'or-1', buyerName: 'Derya', category: 'bisiklet' as const, minCondition: 60, bonus: 0.3, daysLeft: 2 };
  seedSave(makeState({ orders: [order], inventory: [makeItem({ condition: 80, boughtFor: 1000 })] }));
  renderGame();
  expect(screen.getByRole('region', { name: 'Siparişler' })).toHaveTextContent('Derya bisiklet arıyor');
  await userEvent.click(screen.getByRole('tab', { name: 'Garaj' }));
  await userEvent.click(screen.getByRole('button', { name: /Derya’e sat/ }));
  expect(screen.getByText('Garajın boş. İlanlardan bir şey al.')).toBeInTheDocument();
});

test('Cevdet’in göz koyduğu ilan etiketlenir', () => {
  seedSave(makeState({ listings: [makeListing({ rivalEye: true })] }));
  renderGame();
  expect(screen.getByText('Cevdet göz koydu')).toBeInTheDocument();
});

test('tamir oyunu: ibre gidip gelir, ustaya bırakınca normal fiyat', async () => {
  expect(needleAt(0, 1000)).toBe(0);
  expect(needleAt(500, 1000)).toBeCloseTo(0.5);
  expect(needleAt(1500, 1000)).toBeCloseTo(0.5);
  const d = { id: 'd1', name: 'Zincir paslı', repairCost: 300, valueHit: 0.1, known: true };
  seedSave(makeState({ money: 2000, inventory: [makeItem({ defects: [d] })] }));
  renderGame();
  await userEvent.click(screen.getByRole('tab', { name: 'Garaj' }));
  await userEvent.click(screen.getByRole('button', { name: /Tamir et: Zincir paslı/ }));
  const dialog = screen.getByRole('dialog', { name: 'Tamir' });
  await userEvent.click(within(dialog).getByRole('button', { name: /Ustaya bırak/ }));
  expect(screen.queryByRole('button', { name: /Tamir et/ })).toBeNull();
});

test('mezat: kimse artırmazsa çekiç iner, mal oyuncunun olur', () => {
  vi.useFakeTimers();
  try {
    const motor = makeItem({ category: 'motor', brand: 'Kartal', model: 'K125', baseValue: 100000 });
    // Rakip sınırı açılış fiyatının altında: oyuncu bir kez artırınca kimse çıkamaz.
    const mezat = makeListing({ id: 'mz', item: motor, special: 'mezat', askPrice: 50000, minPrice: 50000, auctionMax: 52000 });
    seedSave(makeState({ stage: 2, age: 16, money: 200000, listings: [mezat] }));
    renderGame();
    fireEvent.click(screen.getByRole('button', { name: /Kartal K125/ }));
    const dialog = screen.getByRole('dialog', { name: 'Canlı mezat' });
    fireEvent.click(within(dialog).getByRole('button', { name: 'Mezata katıl' }));
    fireEvent.click(within(dialog).getByRole('button', { name: /Artır/ }));
    act(() => { vi.advanceTimersByTime(3500); });
    expect(within(dialog).getByText('Çekiç indi, mezat senin!')).toBeInTheDocument();
  } finally {
    vi.useRealTimers();
  }
});

test('ayarlar: açık tema ve büyük yazı html etiketine işlenir', async () => {
  seedSave(makeState());
  renderGame();
  await userEvent.click(screen.getByRole('tab', { name: 'Profil' }));
  await userEvent.click(screen.getByLabelText('Açık tema'));
  await userEvent.click(screen.getByLabelText('Büyük yazı'));
  expect(document.documentElement.dataset.theme).toBe('acik');
  expect(document.documentElement.dataset.font).toBe('buyuk');
});

test('yedekten yükle: kod girilince kayıt değişir', async () => {
  seedSave(makeState({ money: 2000 }));
  renderGame();
  await userEvent.click(screen.getByRole('tab', { name: 'Profil' }));
  await userEvent.click(screen.getByRole('button', { name: 'Yedekten yükle' }));
  const box = screen.getByLabelText('Yedek kodunu yapıştır');
  fireEvent.change(box, { target: { value: exportSave(makeState({ money: 77777, day: 9 })) } });
  await userEvent.click(screen.getByRole('button', { name: 'Kaydı yükle' }));
  expect(screen.getByText(/Gün 9/, { selector: '.topbar__day' })).toBeInTheDocument();
});

test('4. aşamada şube açılır', async () => {
  seedSave(makeState({ stage: 4, age: 25, money: 16_000_000, won: true, wonSeen: true }));
  renderGame();
  await userEvent.click(screen.getByRole('tab', { name: 'Profil' }));
  await userEvent.click(screen.getByRole('button', { name: /Aç · 15\.000\.000 TL/ }));
  expect(screen.getByText('Açık')).toBeInTheDocument();
});
