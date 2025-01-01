import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vitest } from 'vitest';

import { SelectWithLabel } from './SelectWithLabel';

describe('SelectWithLabel', () => {
  const mockOnChange = vitest.fn();

  const menuItems = [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
  ];

  beforeEach(() => {
    render(<SelectWithLabel label='Test Label' menuItems={menuItems} onChange={mockOnChange} value='option1' />);
  });

  it('should render the label correctly', () => {
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });

  it('should render menu items correctly', () => {
    const select = screen.getByLabelText('Test Label');
    fireEvent.mouseDown(select);
    for (const item of menuItems) {
      expect(screen.getByRole('option', { name: item.label })).toBeInTheDocument();
    }
  });
});
