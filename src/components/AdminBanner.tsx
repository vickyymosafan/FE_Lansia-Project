'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminStatus } from '@/hooks/useAdminStatus';
import { FaUserShield, FaTimes, FaArrowRight, FaCog } from 'react-icons/fa';

/**
 * Banner khusus yang muncul di halaman publik ketika admin sedang login
 * Memberikan akses cepat kembali ke dashboard admin
 */
export default function AdminBanner() {
  const { isLoggedInAdmin, adminUser, isLoading } = useAdminStatus();
  const [isVisible, setIsVisible] = useState(true);

  // Jangan tampilkan banner jika sedang loading atau bukan admin
  if (isLoading || !isLoggedInAdmin || !isVisible) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          {/* Admin Info */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <FaUserShield className="w-4 h-4 text-white" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">
                  Mode Admin: {adminUser?.username}
                </p>
                <p className="text-xs text-blue-100">
                  {adminUser?.posyandu_name || 'Posyandu Melati'}
                </p>
              </div>
              <div className="sm:hidden">
                <p className="text-sm font-medium">Mode Admin</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Dashboard Button */}
            <Link
              href="/admin"
              className="inline-flex items-center px-3 py-1.5 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm font-medium transition-all duration-200 group"
            >
              <FaCog className="w-3 h-3 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Admin</span>
              <FaArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>

            {/* Close Button */}
            <button
              onClick={() => setIsVisible(false)}
              className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
              title="Tutup banner"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 opacity-50"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1 left-4 w-2 h-2 bg-white bg-opacity-30 rounded-full animate-pulse"></div>
        <div className="absolute top-2 right-8 w-1 h-1 bg-white bg-opacity-40 rounded-full animate-pulse delay-300"></div>
        <div className="absolute bottom-1 left-1/3 w-1.5 h-1.5 bg-white bg-opacity-20 rounded-full animate-pulse delay-700"></div>
      </div>
    </div>
  );
}
