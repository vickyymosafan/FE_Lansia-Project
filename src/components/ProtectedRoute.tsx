'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, isAdmin, getUser, verifyToken } from '@/utils/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallbackPath?: string;
}

export default function ProtectedRoute({ 
  children, 
  requireAdmin = false, 
  fallbackPath = '/login' 
}: ProtectedRouteProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Cek apakah user sudah login
        if (!isAuthenticated()) {
          router.push(fallbackPath);
          return;
        }

        // Verifikasi token dengan server
        const isTokenValid = await verifyToken();
        if (!isTokenValid) {
          router.push(fallbackPath);
          return;
        }

        // Cek role jika diperlukan
        if (requireAdmin && !isAdmin()) {
          router.push('/unauthorized');
          return;
        }

        setIsAuthorized(true);
      } catch (error) {
        console.error('Auth check error:', error);
        router.push(fallbackPath);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, requireAdmin, fallbackPath]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <svg className="animate-spin w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Memverifikasi akses...</h3>
          <p className="text-gray-600">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Router akan redirect
  }

  return <>{children}</>;
}

// HOC untuk proteksi halaman
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requireAdmin: boolean = false
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute requireAdmin={requireAdmin}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}

// Hook untuk mendapatkan user info
export function useAuth() {
  const [user, setUser] = useState(getUser());
  const [isLoading, setIsLoading] = useState(false);

  const refreshUser = async () => {
    setIsLoading(true);
    try {
      const currentUser = getUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error refreshing user:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: isAuthenticated(),
    isAdmin: isAdmin(),
    refreshUser
  };
}
