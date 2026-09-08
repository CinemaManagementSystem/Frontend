import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SnackImage } from './SnackImage';

describe('SnackImage', () => {
  it('replaces a failed remote image with an accessible local placeholder', () => {
    render(<SnackImage name="Caramel Popcorn" category="Popcorn" src="https://example.invalid/caramel.jpg" />);
    const image = screen.getByRole('img', { name: 'Caramel Popcorn product' });

    fireEvent.error(image);

    expect(screen.queryByRole('img', { name: 'Caramel Popcorn product' })).not.toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Caramel Popcorn image unavailable' })).toBeInTheDocument();
    expect(screen.getByText('Image unavailable')).toBeInTheDocument();
  });

  it('uses the same fallback when a product has no image URL', () => {
    render(<SnackImage name="Chocolate" category="Snacks" />);

    expect(screen.getByRole('img', { name: 'Chocolate image unavailable' })).toBeInTheDocument();
    expect(screen.queryByText('Chocolate product')).not.toBeInTheDocument();
  });
});
