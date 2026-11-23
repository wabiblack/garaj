import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/ui/App';
import { makeItem, makeListing, makeState } from '../helpers';
import { seedSave } from './uiHelpers';
import { newGame } from '../../src/game/newGame';

const defect = { id: 'd1', name: 'Fren tutmuyor', repairCost: 200, valueHit: 0.2, known: true };
const goGarage = () => userEvent.click(screen.getByRole('tab', { name: 'Garaj' }));

describe('Garaj', () => {
  test('uygun hazırlık butonları maliyetleriyle görünür', async () => {
    seedSave(makeState({
      money: 1e6,
      inventory: [
        makeItem({ id: 'b', defects: [defect], baseValue: 2000 }),
        makeItem({ id: 'g', category: 'guvercin', brand: 'Taklacı', model: 'Ankara', baseValue: 1000 }),
      ],
    }));
    render(<App />);
    await goGarage();
    expect(screen.getByRole('button', { name: 'Tamir et: Fren tutmuyor · 200 TL' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /^Temizle/ })).toHaveLength(2);
    expect(screen.getByRole('button', { name: 'Bak · 30 TL' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Boya/ })).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Tamir et: Fren tutmuyor · 200 TL' }));
    expect(screen.queryByRole('button', { name: /Tamir et/ })).toBeNull();
  });
  test('araba için boya butonu', async () => {
    seedSave(makeState({ stage: 3, money: 1e7, inventory: [makeItem({ category: 'araba', brand: 'Doruk', model: 'Sedan', baseValue: 100000 })] }));
    render(<App />);
    await goGarage();
    expect(screen.getByRole('button', { name: 'Boya · 6.000 TL' })).toBeInTheDocument();
  });
  test('satışa koy: varsayılan piyasa değeri, kusur varsa belirtme anahtarı', async () => {
    seedSave(makeState({ inventory: [makeItem({ defects: [defect], baseValue: 2000, condition: 100 })] }));
    render(<App />);
    await goGarage();
    await userEvent.click(screen.getByRole('button', { name: 'Satışa koy' }));
    const dialog = screen.getByRole('dialog', { name: 'Satışa koy' });
    expect(within(dialog).getByLabelText('Satış fiyatı (TL)')).toHaveValue('1600');
    await userEvent.click(within(dialog).getByLabelText('Kusurları belirt'));
    await userEvent.click(within(dialog).getByRole('button', { name: 'İlana koy' }));
    await userEvent.click(screen.getByRole('tab', { name: /Satış/ }));
    expect(screen.getByText('Kusurlar belirtildi')).toBeInTheDocument();
  });
});

test('Satış: satıştan çekilir', async () => {
  const it = makeItem();
  seedSave(makeState({ inventory: [it], forSale: [{ itemId: it.id, price: 2500, disclosed: false }] }));
  render(<App />);
  await userEvent.click(screen.getByRole('tab', { name: /Satış/ }));
  expect(screen.getByText('Serçe Şehir 26')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Satıştan çek' }));
  expect(screen.queryByText('Serçe Şehir 26')).toBeNull();
});

test('Gün sonu: özet, teklifler, yeni gün', async () => {
  const it = makeItem();
  seedSave(makeState({
    phase: 'evening', money: 0, inventory: [it], forSale: [{ itemId: it.id, price: 2000, disclosed: false }],
    offers: [{ id: 'o1', itemId: it.id, amount: 1900, buyerName: 'Ali' }, { id: 'o2', itemId: it.id, amount: 1700, buyerName: 'Can' }],
    summary: { day: 1, bought: 1, sold: 0, spent: 1500, earned: 0, notes: [] },
  }));
  render(<App />);
  const ev = screen.getByRole('dialog', { name: 'Gün sonu' });
  expect(within(ev).getByText('Gün 1 bitti')).toBeInTheDocument();
  expect(within(ev).getByText('Ali')).toBeInTheDocument();
  await userEvent.click(within(ev).getAllByRole('button', { name: 'Kabul' })[0]);
  expect(within(ev).queryByText('Can')).toBeNull();
  await userEvent.click(within(ev).getByRole('button', { name: 'Yeni güne başla' }));
  expect(screen.queryByRole('dialog', { name: 'Gün sonu' })).toBeNull();
  expect(screen.getByText('Gün 2 · İlkbahar')).toBeInTheDocument();
});

test('Gün sonu: karşı teklif', async () => {
  const it = makeItem();
  seedSave(makeState({ phase: 'evening', money: 0, inventory: [it], offers: [{ id: 'o1', itemId: it.id, amount: 1000, buyerName: 'Ali' }] }));
  render(<App />);
  const ev = screen.getByRole('dialog', { name: 'Gün sonu' });
  await userEvent.click(within(ev).getByRole('button', { name: 'Karşı teklif' }));
  const input = within(ev).getByLabelText('Karşı teklifin (TL)');
  await userEvent.clear(input);
  await userEvent.type(input, '1040');
  await userEvent.click(within(ev).getByRole('button', { name: 'Gönder' }));
  expect(within(ev).getByText('Ali kabul etti')).toBeInTheDocument();
});

test('Geçiş ekranı', async () => {
  seedSave(makeState({ money: 50000, pendingTransition: 2 }));
  render(<App />);
  expect(screen.getByText('4 yıl sonra…')).toBeInTheDocument();
  expect(screen.getByText(/Kerem 16 yaşında/)).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Devam' }));
  expect(screen.getByText(/16 yaş · Motorcu/)).toBeInTheDocument();
});

test('Geçiş ekranı: galerici', () => {
  seedSave(makeState({ stage: 2, money: 500000, pendingTransition: 3 }));
  render(<App />);
  expect(screen.getByText('2 yıl sonra…')).toBeInTheDocument();
  expect(screen.getByText(/ehliyetini aldı/)).toBeInTheDocument();
});

describe('Profil', () => {
  test('itibar ve beceri; aşama 1de büyüme yok', async () => {
    seedSave(makeState());
    render(<App />);
    await userEvent.click(screen.getByRole('tab', { name: 'Profil' }));
    expect(screen.getByText('İtibar')).toBeInTheDocument();
    expect(screen.getByText('Tamir becerisi')).toBeInTheDocument();
    expect(screen.queryByText('Büyüme')).toBeNull();
  });
  test('aşama 3te büyüme: yükseltme, işe alma, kredi', async () => {
    seedSave(makeState({ stage: 3, age: 18, money: 500_000 }));
    render(<App />);
    await userEvent.click(screen.getByRole('tab', { name: 'Profil' }));
    expect(screen.getByText('Büyüme')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Mekânı yükselt/ })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: /Kapasiteyi artır/ }));
    expect(screen.getByText(/2 araç/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /Usta.*İşe al/ }));
    expect(screen.getByRole('button', { name: /Usta.*Çıkar/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /1.000.000 TL kredi al/ }));
    expect(screen.getByRole('button', { name: /Krediyi öde/ })).toBeInTheDocument();
  });
});

test('Bitiş ekranı', async () => {
  seedSave(makeState({ stage: 3, won: true, wonSeen: false }));
  render(<App />);
  expect(screen.getByText('Şehrin en büyük galericisi oldun!')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Devam et' }));
  expect(screen.queryByText('Şehrin en büyük galericisi oldun!')).toBeNull();
});

test('uçtan uca: al, temizle, satışa koy, günü bitir, teklif kabul', async () => {
  const listing = makeListing({ item: makeItem({ baseValue: 2000, condition: 80 }), askPrice: 1800, minPrice: 1200 });
  seedSave({ ...newGame(1), listings: [listing], money: 2000, reputation: 100, locationLevel: 2 });
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: /Serçe Şehir 26/ }));
  const neg = screen.getByRole('dialog', { name: 'Pazarlık' });
  const input = within(neg).getByLabelText('Teklifin (TL)');
  await userEvent.clear(input);
  await userEvent.type(input, '1300');
  await userEvent.click(within(neg).getByRole('button', { name: 'Teklif ver' }));
  await userEvent.click(within(neg).getByRole('button', { name: 'Garaja git' }));
  await userEvent.click(screen.getByRole('button', { name: /^Temizle/ }));
  await userEvent.click(screen.getByRole('button', { name: 'Satışa koy' }));
  const sell = screen.getByRole('dialog', { name: 'Satışa koy' });
  const price = within(sell).getByLabelText('Satış fiyatı (TL)');
  await userEvent.clear(price);
  await userEvent.type(price, '1500');
  await userEvent.click(within(sell).getByRole('button', { name: 'İlana koy' }));
  await userEvent.click(screen.getByRole('button', { name: 'Günü bitir' }));
  const ev = screen.getByRole('dialog', { name: 'Gün sonu' });
  await userEvent.click(within(ev).getAllByRole('button', { name: 'Kabul' })[0]);
  await userEvent.click(within(ev).getByRole('button', { name: 'Yeni güne başla' }));
  const money = Number(screen.getByText(/TL$/, { selector: '.topbar__money .money' }).textContent!.replace(/\D/g, ''));
  expect(money).toBeGreaterThan(2000 - 1300 - 40);
});
