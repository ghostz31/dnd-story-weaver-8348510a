import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SubscriptionPage from './SubscriptionPage';
import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';

// Mock useAuth
vi.mock('@/auth/AuthContext', () => ({
    useAuth: () => ({
        user: { email: 'test@example.com' },
        isAuthenticated: true
    })
}));

describe('SubscriptionPage', () => {
    it('renders subscription options', () => {
        render(
            <BrowserRouter>
                <SubscriptionPage />
            </BrowserRouter>
        );

        expect(screen.getByText('Abonnement Premium')).toBeInTheDocument();
        expect(screen.getByText('4,99€')).toBeInTheDocument();
    });

    it('validates form inputs', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <SubscriptionPage />
            </BrowserRouter>
        );

        const submitBtn = screen.getByRole('button', { name: /s'abonner maintenant/i });
        await user.click(submitBtn);

        expect(screen.getByText('Veuillez remplir tous les champs')).toBeInTheDocument();
    });

    it('completes subscription flow', async () => {
        const user = userEvent.setup();
        render(
            <BrowserRouter>
                <SubscriptionPage />
            </BrowserRouter>
        );

        // Fill form
        const cardInput = screen.getByLabelText('Numéro de carte');
        const holderInput = screen.getByLabelText('Titulaire de la carte');
        const expiryInput = screen.getByLabelText("Date d'expiration");
        const cvvInput = screen.getByLabelText('CVV');

        await user.type(cardInput, '1234123412341234');
        await user.type(holderInput, 'JOHN DOE');
        await user.type(expiryInput, '12/25');
        await user.type(cvvInput, '123');

        const submitBtn = screen.getByRole('button', { name: /s'abonner maintenant/i });
        await user.click(submitBtn);

        // Should show loading then success
        await waitFor(() => {
            expect(screen.getByText('Abonnement réussi!')).toBeInTheDocument();
        }, { timeout: 3000 });
    });
});
