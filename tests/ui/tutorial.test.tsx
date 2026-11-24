import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/ui/App';
import { makeItem, makeListing, makeState } from '../helpers';
import { renderGame, seedSave } from './uiHelpers';
import { TUTORIAL_STEPS, tutorialStep } from '../../src/ui/tutorial';

test('açılış hikâyesi sahne sahne ilerler, son sahnede Başla ile kapanır', async () => {
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: 'Oyuna başla' }));
  await userEvent.click(screen.getByRole('button', { name: 'Hikâyeye başla' }));
  const story = screen.getByRole('dialog', { name: 'Hikâye' });
  expect(within(story).getByText(/12 yaşında/)).toBeInTheDocument();
  expect(within(story).queryByRole('button', { name: 'Başla' })).toBeNull();
  await userEvent.click(within(story).getByRole('button', { name: 'İleri' }));
  expect(within(story).getByText(/Her eşyanın bir hikâyesi var/)).toBeInTheDocument();
  await userEvent.click(within(story).getByRole('button', { name: 'İleri' }));
  expect(within(story).getByText(/banka yok/)).toBeInTheDocument();
  await userEvent.click(within(story).getByRole('button', { name: 'İleri' }));
  await userEvent.click(within(story).getByRole('button', { name: 'Başla' }));
  expect(screen.queryByRole('dialog', { name: 'Hikâye' })).toBeNull();
});

test('açılış hikâyesi Atla ile hemen kapanır', async () => {
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: 'Oyuna başla' }));
  await userEvent.click(screen.getByRole('button', { name: 'Hikâyeye başla' }));
  await userEvent.click(screen.getByRole('button', { name: 'Atla' }));
  expect(screen.queryByRole('dialog', { name: 'Hikâye' })).toBeNull();
});

test('öğretici adımı oyunun durumundan çıkar', () => {
  const base = makeState({ listings: [makeListing()] });
  const ids = TUTORIAL_STEPS.map((s) => s.id);
  expect(ids).toEqual(['al', 'hazirla', 'sat', 'gun', 'teklif']);
  expect(tutorialStep(base)).toBe(0);
  expect(tutorialStep({ ...base, inventory: [makeItem({ cleaned: false })] })).toBe(1);
  expect(tutorialStep({ ...base, inventory: [makeItem({ cleaned: true })] })).toBe(2);
  const it = makeItem();
  expect(tutorialStep({ ...base, inventory: [it], forSale: [{ itemId: it.id, price: 100, disclosed: true }] })).toBe(3);
  expect(tutorialStep({ ...base, phase: 'evening', inventory: [it] })).toBe(4);
  expect(tutorialStep({ ...base, stats: { ...base.stats, sales: 1 } })).toBeNull();
  expect(tutorialStep({ ...base, hard: true })).toBeNull();
  expect(tutorialStep({ ...base, day: 6 })).toBeNull();
});

test('öğretici adım sayısını gösterir ve gidilecek sekmeyi vurgular', () => {
  seedSave(makeState({ inventory: [makeItem({ cleaned: false })] }));
  renderGame();
  const coach = screen.getByRole('complementary', { name: 'Rehber' });
  expect(coach).toHaveTextContent('Adım 2/5');
  expect(screen.getByRole('tab', { name: /Garaj/ })).toHaveClass('tab--hint');
});

test('satışa koyunca Günü bitir düğmesi vurgulanır', () => {
  const it = makeItem({ cleaned: true });
  seedSave(makeState({ inventory: [it], forSale: [{ itemId: it.id, price: 100, disclosed: true }] }));
  renderGame();
  expect(screen.getByRole('complementary', { name: 'Rehber' })).toHaveTextContent('Adım 4/5');
  expect(screen.getByRole('button', { name: 'Günü bitir' })).toHaveClass('btn--hint');
});

test('akşam ekranında teklif adımı görünür', () => {
  const it = makeItem();
  seedSave(makeState({ phase: 'evening', inventory: [it], offers: [{ id: 'o', itemId: it.id, amount: 2000, buyerName: 'A' }] }));
  renderGame();
  expect(screen.getByRole('complementary', { name: 'Rehber' })).toHaveTextContent('Adım 5/5');
});
