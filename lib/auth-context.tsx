"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    _id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    signOut: () => Promise<void>;
    setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = localStorage.getItem('auth-token');
            const userData = localStorage.getItem('user-data');
            
            if (!token || !userData) {
                setIsLoading(false);
                return;
            }

            // Parse and set user data
            try {
                const user = JSON.parse(userData);
                setUser(user);
            } catch (parseError) {
                console.error('Error parsing user data:', parseError);
                // Clear invalid data
                localStorage.removeItem('auth-token');
                localStorage.removeItem('user-data');
            }
        } catch (error) {
            console.error('Auth check error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const signOut = async () => {
        try {
            // Call the sign out API
            await fetch('/api/auth/signout', {
                method: 'POST',
                credentials: 'include',
            });

            // Clear local storage
            localStorage.removeItem('auth-token');
            localStorage.removeItem('user-data');
            
            // Clear user state
            setUser(null);
            
            // Redirect to home
            window.location.href = '/';
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, signOut, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}