'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import type { User } from '@/lib/api';
import { authStore } from '@/lib/store';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUserState] = useState<User | null>(null);
    const [token, setTokenState] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize from cookies on mount
    useEffect(() => {
        const storedToken = authStore.getToken();
        const storedUser = authStore.getUser();

        if (storedToken) {
            setTokenState(storedToken);
        }
        if (storedUser) {
            setUserState(storedUser);
        }

        setIsLoading(false);
    }, []);

    const setUser = (newUser: User | null) => {
        setUserState(newUser);
        if (newUser) {
            authStore.setUser(newUser);
        } else {
            authStore.removeUser();
        }
    };

    const setToken = (newToken: string | null) => {
        setTokenState(newToken);
        if (newToken) {
            authStore.setToken(newToken);
        } else {
            authStore.removeToken();
        }
    };

    const logout = () => {
        setUserState(null);
        setTokenState(null);
        authStore.logout();
    };

    return (
        <AuthContext.Provider value={{ user, token, isLoading, setUser, setToken, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
