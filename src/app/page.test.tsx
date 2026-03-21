import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import HomePage from './page';

// Mock useRouter
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: mockPush,
    };
  },
}));

// Mock next-auth
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({ data: null, status: 'unauthenticated' })),
  SessionProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('renders correctly', () => {
    render(<HomePage />);
    expect(screen.getByText(/Strategic/i)).toBeInTheDocument();
    // Use getAllByText for 'Alignment' as it appears in title and button
    expect(screen.getAllByText(/Alignment/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Mercury/i)).toBeInTheDocument();
  });

  it('shows form after clicking initiate', async () => {
    render(<HomePage />);
    
    const initiateButton = screen.getByText(/Initiate Alignment/i);
    fireEvent.click(initiateButton);

    expect(await screen.findByLabelText(/URL \/ Social Handle/i)).toBeInTheDocument();
  });

  it('submits successfully and redirects if keys exist', async () => {
    localStorage.setItem('gemini_api_key', 'valid-key');
    render(<HomePage />);
    
    // Open form
    fireEvent.click(screen.getByText(/Initiate Alignment/i));

    fireEvent.change(screen.getByLabelText(/URL \/ Social Handle/i), { target: { value: 'https://test.com' } });
    fireEvent.change(screen.getByLabelText(/Business Niche/i), { target: { value: 'Studio' } });
    fireEvent.change(screen.getByLabelText(/Target Manifestation/i), { target: { value: 'Grow' } });
    
    fireEvent.click(screen.getByText(/Generate Strategic Audit/i));
    
    expect(mockPush).toHaveBeenCalledWith('/results');
    expect(JSON.parse(sessionStorage.getItem('current_audit_request')!)).toEqual({
      link: 'https://test.com',
      businessType: 'Studio',
      goals: 'Grow',
      teamId: ''
    });
  });
});
