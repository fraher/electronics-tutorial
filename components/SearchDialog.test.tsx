import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchDialog } from './SearchDialog';
import type { SearchDoc } from '@/lib/search-index';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const sampleIndex: SearchDoc[] = [
  {
    kind: 'experiment',
    experimentNumber: 1,
    chapter: 1,
    href: '/chapter/1/experiment/1/',
    title: 'Experiment 1: Taste the Power',
    subtitle: 'Feel a 9V battery on your tongue.',
    haystack: 'taste tongue battery resistance',
    parts: '9V battery, multimeter',
    takeaways: 'tissue conducts electricity',
    summary: 'sensory introduction to current',
  },
  {
    kind: 'formula',
    experimentNumber: 4,
    chapter: 1,
    href: '/chapter/1/experiment/4/#formulas',
    title: "Ohm's law",
    subtitle: 'Formula in Experiment 4',
    haystack: 'ohm voltage current resistance V=IR',
    formulaLatex: 'V = I \\cdot R',
  },
  {
    kind: 'experiment',
    experimentNumber: 10,
    chapter: 2,
    href: '/chapter/2/experiment/10/',
    title: 'Experiment 10: Transistor switch',
    subtitle: 'A small base current controls a larger collector current.',
    haystack: 'transistor switch base collector',
  },
];

describe('SearchDialog', () => {
  it('renders the trigger button with placeholder text', () => {
    render(<SearchDialog index={sampleIndex} />);
    expect(screen.getByRole('button', { name: /open search/i })).toBeInTheDocument();
    expect(screen.getByText(/search experiments/i)).toBeInTheDocument();
  });

  it('opens the dialog when clicking the trigger', async () => {
    const user = userEvent.setup();
    render(<SearchDialog index={sampleIndex} />);
    await user.click(screen.getByRole('button', { name: /open search/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('opens on cmd-k / ctrl-k keyboard shortcut', () => {
    render(<SearchDialog index={sampleIndex} />);
    act(() => {
      fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('filters results via fuzzy match', async () => {
    const user = userEvent.setup();
    render(<SearchDialog index={sampleIndex} />);
    await user.click(screen.getByRole('button', { name: /open search/i }));
    const input = screen.getByLabelText(/search input/i);
    await user.type(input, 'transistor');
    // Result for "Transistor switch" should appear; "Taste the Power" should be filtered out
    expect(screen.getByText(/Transistor switch/i)).toBeInTheDocument();
    expect(screen.queryByText(/Taste the Power/i)).not.toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    render(<SearchDialog index={sampleIndex} />);
    await user.click(screen.getByRole('button', { name: /open search/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    act(() => {
      fireEvent.keyDown(window, { key: 'Escape' });
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
