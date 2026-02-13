import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Example component for testing
const TestComponent: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div>
      <h1>{title}</h1>
      <p data-testid="description">This is a test component</p>
    </div>
  );
};

describe('Example Test Suite', () => {
  it('should pass a basic test', () => {
    expect(true).toBe(true);
  });

  it('should render the test component', () => {
    render(<TestComponent title="Hello Test" />);
    
    expect(screen.getByText('Hello Test')).toBeInTheDocument();
    expect(screen.getByTestId('description')).toHaveTextContent('This is a test component');
  });

  it('should demonstrate async testing', async () => {
    const asyncFn = async (): Promise<string> => {
      return new Promise(resolve => setTimeout(() => resolve('async result'), 10));
    };

    const result = await asyncFn();
    expect(result).toBe('async result');
  });
});