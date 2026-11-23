import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/ui/App';
import { ItemCard } from '../../src/ui/components/ItemCard';
import { makeItem, makeListing, makeState } from '../helpers';
import { seedSave } from './uiHelpers';

const quest = { id: 'q', kind: 'sat' as const, target: 2, progress: 1, reward: 1000, done: false, title: '2 satış yap' };

test('ilanlarda kişilik rozeti, olay kartı ve görevler görünür', () => {
  seedSave(makeState({ event: 'fuar', quests: [quest], listings: [makeListing({ personality: 'acele' })] }));
  render(<App />);
  expect(screen.getByText('Acelesi var')).toBeInTheDocument();
  expect(screen.getByText('Fuar günü')).toBeInTheDocument();
  const q = screen.getByRole('region', { name: 'Görevler' });
  expect(within(q).getByText('2 satış yap')).toBeInTheDocument();
  expect(within(q).getByText('1/2')).toBeInTheDocument();
});

test('profilde rekorlar ve başarımlar', async () => {
  seedSave(makeState({
    achievements: ['ilk-satis'],
    stats: { sales: 4, profit: 3200, bestProfit: 1500, bestItem: 'Kanat BMX', disclosedSales: 1, stageDay: { 2: null, 3: null } },
  }));
  render(<App />);
  await userEvent.click(screen.getByRole('tab', { name: 'Profil' }));
  expect(screen.getByText('Kanat BMX')).toBeInTheDocument();
  expect(screen.getByText('3.200 TL')).toBeInTheDocument();
  const ach = screen.getByRole('region', { name: 'Başarımlar' });
  expect(within(ach).getByText('İlk satış')).toBeInTheDocument();
  expect(within(ach).getByText('1/10')).toBeInTheDocument();
});

test('yeni başarım bildirimi', async () => {
  const it = makeItem({ boughtFor: 1000 });
  seedSave(makeState({ phase: 'evening', money: 0, inventory: [it], offers: [{ id: 'o', itemId: it.id, amount: 2000, buyerName: 'A' }] }));
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: 'Kabul' }));
  expect(screen.getByText('Başarım: İlk satış')).toBeInTheDocument();
});

test('ses ayarı profilde açılıp kapanır ve hatırlanır', async () => {
  seedSave(makeState());
  render(<App />);
  await userEvent.click(screen.getByRole('tab', { name: 'Profil' }));
  const toggle = screen.getByLabelText('Ses ve titreşim');
  expect(toggle).toBeChecked();
  await userEvent.click(toggle);
  expect(toggle).not.toBeChecked();
  expect(localStorage.getItem('garaj.ses')).toBe('kapali');
});

test('model görseli yoksa kategori görseline düşer', () => {
  const { container } = render(<ItemCard item={makeItem()} price={1} />);
  const img = container.querySelector('img')!;
  expect(img.getAttribute('src')).toBe('/images/models/serce-sehir-26.png');
  fireEvent.error(img);
  expect(img.getAttribute('src')).toBe('/images/bisiklet.svg');
});

test('şapkalı harfler de çevrilir', async () => {
  const { modelSlug } = await import('../../src/ui/components/ItemCard');
  expect(modelSlug({ brand: 'Rüzgârgülü', model: 'Yarış 28' })).toBe('ruzgargulu-yaris-28');
  expect(modelSlug({ brand: 'Hünkâri', model: 'Gösteri' })).toBe('hunkari-gosteri');
});
