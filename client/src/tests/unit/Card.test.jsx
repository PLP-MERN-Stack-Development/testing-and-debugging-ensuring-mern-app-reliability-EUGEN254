// src/tests/unit/Card.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Card from '../../components/Card';

describe('Card Component', () => {
  it('renders title and content', () => {
    render(<Card title="Card Title" content="Card content" />);
    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders correct heading level', () => {
    render(<Card title="Card Title" content="Card content" />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Card Title');
  });

  it('has correct card structure', () => {
    render(<Card title="Test Title" content="Test content" />);
    const card = screen.getByText('Test Title').closest('.card');
    expect(card).toBeInTheDocument();
    expect(card).toContainElement(screen.getByText('Test content'));
  });
});