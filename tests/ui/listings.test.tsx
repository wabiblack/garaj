import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/ui/App';
import { ItemCard } from '../../src/ui/components/ItemCard';
import { SAVE_KEY } from '../../src/game/save';
import { makeItem, makeListing, makeState } from '../helpers';
import { renderGame, seedSave } from './uiHelpers';

test('ilana dokununca pazarlık açılır, kabul edilen teklifle eşya garaja girer', async () => {
  seedSave(makeState({ listings: [makeListing()] }));
  renderGame();
  await userEvent.click(screen.getByRole('button', { name: /Serçe Şehir 26/ }));
  const dialog = screen.getByRole('dialog', { name: 'Pazarlık' });
  const input = within(dialog).getByLabelText('Teklifin (TL)');
  await userEvent.clear(input);
  await userEvent.type(input, '1900');
  await userEvent.click(within(dialog).getByRole('button', { name: 'Teklif ver' }));
  expect(within(dialog).getByText(/Anlaştınız/)).toBeInTheDocument();
  await userEvent.click(within(dialog).getByRole('button', { name: 'Kapat' }));
  await userEvent.click(screen.getByRole('tab', { name: 'Garaj' }));
  expect(screen.getByText('Serçe Şehir 26')).toBeInTheDocument();
  expect(screen.getAllByText('100 TL').length).toBeGreaterThan(0);
});

test('düşük teklife karşı teklif gösterilir', async () => {
  seedSave(makeState({ listings: [makeListing()] }));
  renderGame();
  await userEvent.click(screen.getByRole('button', { name: /Serçe Şehir 26/ }));
  const dialog = screen.getByRole('dialog', { name: 'Pazarlık' });
  const input = within(dialog).getByLabelText('Teklifin (TL)');
  await userEvent.clear(input);
  await userEvent.type(input, '1600');
  await userEvent.click(within(dialog).getByRole('button', { name: 'Teklif ver' }));
  expect(within(dialog).getByText(/2.000 TL olur/)).toBeInTheDocument();
});

test('aşama 1de "Bir bakayım", aşama 2de ekspertiz butonu', async () => {
  seedSave(makeState({ listings: [makeListing()] }));
  const { unmount } = renderGame();
  await userEvent.click(screen.getByRole('button', { name: /Serçe Şehir 26/ }));
  expect(screen.getByRole('button', { name: 'Bir bakayım' })).toBeInTheDocument();
  unmount();
  localStorage.clear();
  const motor = makeItem({ category: 'motor', brand: 'Kartal', model: 'K125', baseValue: 100000 });
  seedSave(makeState({ stage: 2, money: 60000, listings: [makeListing({ item: motor, askPrice: 120000, minPrice: 90000 })] }));
  renderGame();
  await userEvent.click(screen.getByRole('button', { name: /Kartal K125/ }));
  expect(screen.getByRole('button', { name: 'Ekspertiz (2.000 TL)' })).toBeInTheDocument();
});

test('bozuk kayıtta yeni oyun ekranı', async () => {
  localStorage.setItem(SAVE_KEY, '{oops');
  render(<App />);
  expect(screen.getByText('Kayıt okunamadı')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Yeni oyun' }));
  expect(screen.getByRole('tab', { name: 'İlanlar' })).toBeInTheDocument();
});

test('uzun isim kısaltılır, büyük fiyat biçimlenir', () => {
  render(<ItemCard item={makeItem({ brand: 'Doruk', model: 'Grand Turismo Elegance Plus' })} price={12500000} />);
  expect(screen.getByText('Doruk Grand Turismo Elegance Plus')).toHaveClass('ellipsis');
  expect(screen.getByText('12.500.000 TL')).toBeInTheDocument();
});
