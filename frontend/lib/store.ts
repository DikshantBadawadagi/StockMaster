import Cookies from 'js-cookie';
import type { User } from './api';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';
const COOKIE_OPTIONS = {
    expires: 7,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
};

export const authStore = {
    // Token management
    setToken: (token: string) => {
        Cookies.set(TOKEN_KEY, token, COOKIE_OPTIONS);
    },

    getToken: (): string | undefined => {
        return Cookies.get(TOKEN_KEY);
    },

    removeToken: () => {
        Cookies.remove(TOKEN_KEY);
    },

    // User data management
    setUser: (user: User) => {
        Cookies.set(USER_KEY, JSON.stringify(user), COOKIE_OPTIONS);
    },

    getUser: (): User | null => {
        const userCookie = Cookies.get(USER_KEY);
        if (!userCookie) return null;
        try {
            return JSON.parse(userCookie);
        } catch {
            return null;
        }
    },

    removeUser: () => {
        Cookies.remove(USER_KEY);
    },

    // Check if user is authenticated
    isAuthenticated: (): boolean => {
        return !!Cookies.get(TOKEN_KEY);
    },

    // Logout - clear all auth data
    logout: () => {
        Cookies.remove(TOKEN_KEY);
        Cookies.remove(USER_KEY);
    },

    // Clear all cookies
    clearAll: () => {
        Cookies.remove(TOKEN_KEY);
        Cookies.remove(USER_KEY);
    },
};
