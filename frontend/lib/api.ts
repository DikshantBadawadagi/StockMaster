const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export interface SignupPayload {
    name: string;
    email: string;
    password: string;
    role?: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface VerifyEmailPayload {
    email: string;
    otp: string;
}

export interface ResendOTPPayload {
    email: string;
}

export interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    isEmailVerified: boolean;
    lastLogin?: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data?: {
        token?: string;
        user?: User;
    };
}

// Signup
export const signup = async (payload: SignupPayload): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    return response.json();
};

// Verify Email
export const verifyEmail = async (payload: VerifyEmailPayload): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    return response.json();
};

// Resend OTP
export const resendOTP = async (payload: ResendOTPPayload): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    return response.json();
};

// Login
export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    return response.json();
};

// Get current user
export const getCurrentUser = async (token: string): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
    });

    return response.json();
};

// Update profile
export const updateProfile = async (token: string, payload: { name: string }): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    return response.json();
};

// Change password
export const changePassword = async (token: string, payload: { currentPassword: string; newPassword: string }): Promise<AuthResponse> => {
    const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
    });

    return response.json();
};
