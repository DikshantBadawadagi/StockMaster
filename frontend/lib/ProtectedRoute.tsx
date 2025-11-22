'use client';

import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
    const { token, user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isLoading) return;

        if (!token || !user) {
            router.push('/login');
            return;
        }

        if (requiredRole && user.role !== requiredRole) {
            router.push('/');
            return;
        }
    }, [token, user, isLoading, router, requiredRole]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (!token || !user) {
        return null;
    }

    if (requiredRole && user.role !== requiredRole) {
        return null;
    }

    return <>{children}</>;
};
