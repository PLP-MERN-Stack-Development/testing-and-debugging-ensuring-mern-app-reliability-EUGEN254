// src/tests/unit/Header.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Header from '../../components/Header';

describe('Header Component', () => {
  it('renders the title', () => {
    render(<Header title="My App" />);
    expect(screen.getByText('My App')).toBeInTheDocument();
  });

  it('renders children', () => {
    render(<Header title="My App"><span>Child</span></Header>);
    expect(screen.getByText('Child')).toBeInTheDocument();
  });

  it('renders title as h1', () => {
    render(<Header title="My App" />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('My App');
  });
});