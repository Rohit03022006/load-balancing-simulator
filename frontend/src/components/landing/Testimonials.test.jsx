import { render, screen } from '@testing-library/react';
import Testimonials from './Testimonials';

describe('Testimonials component', () => {
  it('renders the trusted badge and a testimonial author', () => {
    render(<Testimonials />);

    expect(
      screen.getByText(/Trusted by engineering teams worldwide/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/Sarah Chen/i)).toBeInTheDocument();
  });
});
