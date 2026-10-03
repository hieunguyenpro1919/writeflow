import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../src/App';

describe('App Shell (Phase 0 Bootstrap)', () => {
  it('renders application header with localized title and tagline', () => {
    render(<App />);
    expect(screen.getByText('WriteFlow')).toBeInTheDocument();
    expect(screen.getByText('Trình soạn thảo Markdown WYSIWYG')).toBeInTheDocument();
  });

  it('renders the editor paper inside the main viewport', () => {
    render(<App />);
    expect(screen.getByTestId('editor-paper')).toBeInTheDocument();
  });
});
