import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/ui/App';
import { makeItem, makeListing, makeState } from '../helpers';
import { seedSave } from './uiHelpers';

test('rehber ilk günde ipucu gösterir, kapatılınca bir daha çıkmaz', async () => {
  seedSave(makeState({ listings: [makeListing()] }));
  const { unmount } = render(<App />);
  const coach = screen.getByRole('complementary', { name: 'Rehber' });
  expect(coach).toHaveTextContent('Bir ilana dokun');
  await userEvent.click(within(coach).getByRole('button', { name: 'Rehberi kapat' }));
  expect(screen.queryByRole('complementary', { name: 'Rehber' })).toBeNull();
  unmount();
  render(<App />);
  expect(screen.queryByRole('complementary', { name: 'Rehber' })).toBeNull();
});

test('uzman olunan türde ilan etiketlenir', () => {
  const stats = { ...makeState().stats, categorySales: { ...makeState().stats.categorySales, bisiklet: 5 } };
  seedSave(makeState({ day: 9, stats, listings: [makeListing()] }));
  render(<App />);
  expect(screen.getByText('Uzmanlık alanın')).toBeInTheDocument();
});

test('pazarlıkta aynı modelin son satışları görünür', async () => {
  seedSave(makeState({ day: 9, listings: [makeListing()], prices: { 'Serçe Şehir 26': [{ day: 4, price: 2300 }] } }));
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: /Serçe Şehir 26/ }));
  expect(screen.getByText(/2\.300 TL \(Gün 4\)/)).toBeInTheDocument();
});

test('motor işinde çırak alınır', async () => {
  seedSave(makeState({ stage: 2, age: 16, money: 60000, day: 20 }));
  render(<App />);
  await userEvent.click(screen.getByRole('tab', { name: 'Profil' }));
  expect(screen.queryByRole('button', { name: 'Usta: İşe al' })).toBeNull();
  await userEvent.click(screen.getByRole('button', { name: 'Çırak: İşe al' }));
  expect(screen.getByRole('button', { name: 'Çırak: Çıkar' })).toBeInTheDocument();
});

test('oyun bitince zor modda baştan başlanır, başarımlar kalır', async () => {
  seedSave(makeState({ stage: 3, age: 18, day: 80, won: true, wonSeen: false, achievements: ['sampiyon'], inventory: [makeItem()] }));
  render(<App />);
  await userEvent.click(screen.getByRole('button', { name: 'Zor modda baştan başla' }));
  await userEvent.click(screen.getByRole('button', { name: /Başla|Hadi/ }));
  await userEvent.click(screen.getByRole('tab', { name: 'Profil' }));
  expect(screen.getByText(/12 yaş · .* · Zor mod/)).toBeInTheDocument();
  expect(screen.getByText('Başarımlar').parentElement).toHaveTextContent('1/14');
});
