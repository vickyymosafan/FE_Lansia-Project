'use client';

import { useState, useEffect } from 'react';
import { getUser, isAuthenticated, isAdmin } from '@/utils/auth';

interface AdminStatus {
  isLoggedInAdmin: boolean;
  adminUser: any | null;
  isLoading: boolean;
}

/**
 * Hook untuk mendeteksi apakah user yang sedang mengakses halaman adalah admin yang login
 * Tidak melakukan redirect atau side effect yang mengganggu halaman publik
 */
export function useAdminStatus(): AdminStatus {
  const [adminStatus, setAdminStatus] = useState<AdminStatus>({
    isLoggedInAdmin: false,
    adminUser: null,
    isLoading: true
  });

  useEffect(() => {
    const checkAdminStatus = () => {
      try {
        // Cek apakah user sudah login dan memiliki role admin
        const isUserAuthenticated = isAuthenticated();
        const isUserAdmin = isAdmin();
        const user = getUser();

        if (isUserAuthenticated && isUserAdmin && user) {
          setAdminStatus({
            isLoggedInAdmin: true,
            adminUser: user,
            isLoading: false
          });
        } else {
          setAdminStatus({
            isLoggedInAdmin: false,
            adminUser: null,
            isLoading: false
          });
        }
      } catch (error) {
        // Jika ada error, anggap tidak ada admin yang login
        console.error('Error checking admin status:', error);
        setAdminStatus({
          isLoggedInAdmin: false,
          adminUser: null,
          isLoading: false
        });
      }
    };

    // Cek status admin saat hook pertama kali digunakan
    checkAdminStatus();

    // Optional: Listen untuk perubahan localStorage (jika admin logout dari tab lain)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken' || e.key === 'user') {
        checkAdminStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return adminStatus;
}
