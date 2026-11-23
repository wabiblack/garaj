import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/ui/App';
import { makeItem, makeListing, makeState } from '../helpers';
import { renderGame, seedSave } from './uiHelpers';

test('fix I2: ekspertize para yetmiyorsa buton kapalı ve sebep yazılı', async () => {
  const motor = makeItem({ category: 'motor', brand: 'Kartal', model: 'K125', baseValue: 100000 });
  seedSave(makeState({ stage: 2, money: 100, listings: [makeListing({ item: motor, askPrice: 120000, minPrice: 90000 })] }));
  renderGame();
  await userEvent.click(screen.getByRole('button', { name: /Kartal K125/ }));
  const dialog = screen.getByRole('dialog', { name: 'Pazarlık' });
  expect(within(dialog).getByRole('button', { name: 'Ekspertiz (2.000 TL)' })).toBeDisabled();
  expect(within(dialog).getByText('Ekspertize paran yetmiyor')).toBeInTheDocument();
});

test('fix I1: karşı tekliften sonra aynı tutarla Teklif ver kapalı', async () => {
  seedSave(makeState({ listings: [makeListing()] }));
  renderGame();
  await userEvent.click(screen.getByRole('button', { name: /Serçe Şehir 26/ }));
  const dialog = screen.getByRole('dialog', { name: 'Pazarlık' });
  const input = within(dialog).getByLabelText('Teklifin (TL)');
  await userEvent.clear(input);
  await userEvent.type(input, '1600');
  await userEvent.click(within(dialog).getByRole('button', { name: 'Teklif ver' }));
  expect(within(dialog).getByRole('button', { name: 'Teklif ver' })).toBeDisabled();
  expect(input).toHaveAttribute('maxLength', '10');
});

test('fix M2: aşama 1de bakınca ipucu gizli kusur olup olmamasına göre değişmez', async () => {
  const clean = makeListing({ item: makeItem({ defects: [] }) });
  seedSave(makeState({ listings: [clean] }));
  renderGame();
  await userEvent.click(screen.getByRole('button', { name: /Serçe Şehir 26/ }));
  await userEvent.click(screen.getByRole('button', { name: 'Bir bakayım' }));
  expect(screen.getByText('Baktın; gözden kaçan bir şey olabilir.')).toBeInTheDocument();
});

test('fix I3: iflas ekranı ve aşamayı yeniden başlatma', async () => {
  seedSave(makeState({ stage: 2, age: 16, money: 100, listings: [makeListing({ minPrice: 9000 })] }));
  renderGame();
  expect(screen.getByText('İflas ettin')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Aşamayı yeniden başlat' }));
  expect(screen.queryByText('İflas ettin')).toBeNull();
  expect(screen.getByText('50.000 TL')).toBeInTheDocument();
});

test('fix M1: render hatası kayıt-bozuk ekranına düşer', () => {
  const bad = makeState();
  // @ts-expect-error bozuk kayıt simülasyonu
  bad.listings = [{ id: 'x' }];
  seedSave(bad);
  const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
  renderGame();
  spy.mockRestore();
  expect(screen.getByText('Kayıt okunamadı')).toBeInTheDocument();
});
