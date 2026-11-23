import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../../src/ui/App';

test('dört sekme görünür ve tıklanınca etkin olur', async () => {
  render(<App />);
  for (const label of ['İlanlar', 'Garaj', 'Satış', 'Profil'])
    expect(screen.getByRole('tab', { name: label })).toBeInTheDocument();
  await userEvent.click(screen.getByRole('tab', { name: 'Garaj' }));
  expect(screen.getByRole('tab', { name: 'Garaj' })).toHaveAttribute('aria-selected', 'true');
});
