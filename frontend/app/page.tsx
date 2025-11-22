'use client';

import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
    const { user, token } = useAuth();
    const router = useRouter();

    const handleGetStarted = () => {
        if (token && user) {
            router.push('/dashboard');
        } else {
            router.push('/signup');
        }
    };

    return (
        <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>StockMaster</h1>
            <p style={{ fontSize: '20px', marginBottom: '30px', color: '#666' }}>
                Manage your stock inventory with ease
            </p>

            {user && token ? (
                <div style={{ marginBottom: '40px' }}>
                    <p style={{ fontSize: '18px', marginBottom: '20px' }}>
                        Welcome back, <strong>{user.name}</strong>!
                    </p>
                    <Link href="/dashboard">
                        <button
                            style={{
                                padding: '12px 30px',
                                backgroundColor: '#1976d2',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '16px',
                                cursor: 'pointer',
                                marginRight: '10px',
                            }}
                        >
                            Go to Dashboard
                        </button>
                    </Link>
                </div>
            ) : (
                <div style={{ marginBottom: '40px' }}>
                    <button
                        onClick={handleGetStarted}
                        style={{
                            padding: '12px 30px',
                            backgroundColor: '#1976d2',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '16px',
                            cursor: 'pointer',
                            marginRight: '10px',
                        }}
                    >
                        Get Started
                    </button>
                    <Link href="/login">
                        <button
                            style={{
                                padding: '12px 30px',
                                backgroundColor: '#757575',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '16px',
                                cursor: 'pointer',
                            }}
                        >
                            Login
                        </button>
                    </Link>
                </div>
            )}

            <div style={{ marginTop: '60px', padding: '40px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                <h2>Features</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '20px' }}>
                    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
                        <h3>Easy Management</h3>
                        <p>Manage your stock inventory efficiently</p>
                    </div>
                    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
                        <h3>Real-time Updates</h3>
                        <p>Get real-time updates on stock levels</p>
                    </div>
                    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
                        <h3>Secure</h3>
                        <p>Your data is secure with us</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

