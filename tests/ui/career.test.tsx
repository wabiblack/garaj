import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/ui/App';
import { makeItem, makeListing, makeState } from '../helpers';
import { renderGame, seedSave } from './uiHelpers';

const quest = { id: 'q', kind: 'sat' as const, target: 2, progress: 1, reward: 1000, done: false, title: '2 satış yap' };

test('ilanlarda kişilik rozeti, olay kartı ve görevler görünür', () => {
  seedSave(makeState({ event: 'fuar', quests: [quest], listings: [makeListing({ personality: 'acele' })] }));
  renderGame();
  expect(screen.getByText('Acelesi var')).toBeInTheDocument();
  expect(screen.getByText('Fuar günü')).toBeInTheDocument();
  const q = screen.getByRole('region', { name: 'Görevler' });
  expect(within(q).getByText('2 satış yap')).toBeInTheDocument();
  expect(within(q).getByText('1/2')).toBeInTheDocument();
});

test('profilde rekorlar ve başarımlar', async () => {
  seedSave(makeState({
    achievements: ['ilk-satis'],
    stats: { sales: 4, profit: 3200, bestProfit: 1500, bestItem: 'Kanat BMX', disclosedSales: 1, rivalTaken: 0, stageDay: { 2: null, 3: null, 4: null } },
  }));
  renderGame();
  await userEvent.click(screen.getByRole('tab', { name: 'Profil' }));
  expect(screen.getByText('Kanat BMX')).toBeInTheDocument();
  expect(screen.getByText('3.200 TL')).toBeInTheDocument();
  const ach = screen.getByRole('region', { name: 'Başarımlar' });
  expect(within(ach).getByText('İlk satış')).toBeInTheDocument();
  expect(within(ach).getByText('1/14')).toBeInTheDocument();
});

test('yeni başarım bildirimi', async () => {
  const it = makeItem({ boughtFor: 1000 });
  seedSave(makeState({ phase: 'evening', money: 0, inventory: [it], offers: [{ id: 'o', itemId: it.id, amount: 2000, buyerName: 'A' }] }));
  renderGame();
  await userEvent.click(screen.getByRole('button', { name: 'Kabul' }));
  expect(screen.getByText('Başarım: İlk satış')).toBeInTheDocument();
});

test('ses ayarı profilde açılıp kapanır ve hatırlanır', async () => {
  seedSave(makeState());
  renderGame();
  await userEvent.click(screen.getByRole('tab', { name: 'Profil' }));
  const toggle = screen.getByLabelText('Ses ve titreşim');
  expect(toggle).toBeChecked();
  await userEvent.click(toggle);
  expect(toggle).not.toBeChecked();
  expect(localStorage.getItem('garaj.ses')).toBe('kapali');
});

test('modelin görseli varsa o, yoksa kategori görseli kullanılır', async () => {
  const { itemImageUrl, hasModelArt, categoryImageUrl } = await import('../../src/ui/components/ItemCard');
  const known = makeItem();
  const unknown = makeItem({ brand: 'Yok', model: 'Böyle' });
  expect(hasModelArt(known)).toBe(true);
  expect(hasModelArt(unknown)).toBe(false);
  expect(categoryImageUrl('bisiklet')).toBeTruthy();
  expect(itemImageUrl(unknown)).toBe(categoryImageUrl('bisiklet'));
  expect(itemImageUrl(known)).not.toBe(categoryImageUrl('bisiklet'));
});

test('katalogdaki her modelin çizimi var', async () => {
  const { hasModelArt } = await import('../../src/ui/components/ItemCard');
  const { CATALOG } = await import('../../src/game/catalog');
  for (const t of Object.values(CATALOG)) for (const [brand, model] of t.models) expect(hasModelArt({ brand, model }), `${brand} ${model}`).toBe(true);
  expect(hasModelArt({ brand: 'Doruk', model: 'Klasik 1972' })).toBe(true);
  expect(hasModelArt({ brand: 'Marmara', model: 'Klasik Coupe 1968' })).toBe(true);
});

test('şapkalı harfler de çevrilir', async () => {
  const { modelSlug } = await import('../../src/ui/components/ItemCard');
  expect(modelSlug({ brand: 'Rüzgârgülü', model: 'Yarış 28' })).toBe('ruzgargulu-yaris-28');
  expect(modelSlug({ brand: 'Hünkâri', model: 'Gösteri' })).toBe('hunkari-gosteri');
});

test('yeni oyunda giriş ekranı çıkar, Başla ile kapanır; kayıtlı oyunda çıkmaz', async () => {
  const { unmount } = renderGame();
  expect(screen.getByRole('dialog', { name: 'Hikâye' })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Başla' }));
  expect(screen.queryByRole('dialog', { name: 'Hikâye' })).toBeNull();
  unmount();
  renderGame();
  expect(screen.queryByRole('dialog', { name: 'Hikâye' })).toBeNull();
});
