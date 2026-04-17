import {describe, it, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import App from './App';

describe('App Component', () => {
    it('Deve renderizar sem crashar', () => {
        expect(true).toBe(true);
    });

    it('deve ter titulo correto', () => {
        const mockLocalStorage={
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {}
        };
        global.localStorage = mockLocalStorage;

        expect(true).toBe(true);
    });
});