import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import IndexPage from './Index';
import { describe, it, expect, vi } from 'vitest';

// Mock useAuth
vi.mock('@/auth/AuthContext', () => ({
    useAuth: () => ({
        user: null,
        isAuthenticated: false
    })
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion');
    return {
        ...actual,
        motion: {
            div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        },
        AnimatePresence: ({ children }: any) => <>{children}</>,
    };
});

describe('IndexPage', () => {
    it('renders correctly', () => {
        render(
            <BrowserRouter>
                <IndexPage />
            </BrowserRouter>
        );

        expect(screen.getByText('Trame')).toBeInTheDocument();
        expect(screen.getByText(/Tissez des/i)).toBeInTheDocument();
        expect(screen.getByText("Commencer l'Aventure")).toBeInTheDocument();
    });
});
