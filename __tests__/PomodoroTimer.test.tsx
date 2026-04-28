import { render, screen } from '@testing-library/react';
import PomodoroTimer from '../components/PomodoroTimer';
import { describe, it, expect } from 'vitest';

describe('PomodoroTimer', () => {
  it('renders without crashing', () => {
    render(<PomodoroTimer />);
    expect(screen.getByText('Work')).toBeInTheDocument();
    expect(screen.getByText('Break')).toBeInTheDocument();
    expect(screen.getByText('25:00')).toBeInTheDocument();
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });
});
