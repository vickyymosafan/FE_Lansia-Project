'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminLayout from '@/components/AdminLayout';
import { useAuth } from '@/components/ProtectedRoute';
import { logout, apiClient } from '@/utils/auth';
import { FaHandPaper } from 'react-icons/fa';

interface DashboardStats {
  totalLansia: number;
  totalPemeriksaan: number;
  lansiaAktif: number;
  pemeriksaanBulanIni: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalLansia: 0,
    totalPemeriksaan: 0,
    lansiaAktif: 0,
    pemeriksaanBulanIni: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentProfiles, setRecentProfiles] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch semua profil untuk statistik
      const profilesResponse = await apiClient.get('/profiles');
      const profiles = profilesResponse.data.profiles || [];
      
      // Hitung statistik
      const totalLansia = profiles.length;
      const totalPemeriksaan = profiles.reduce((sum: number, profile: any) => sum + (profile.total_checkups || 0), 0);
      const lansiaAktif = profiles.filter((profile: any) => {
        const lastCheckup = new Date(profile.last_checkup);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return lastCheckup > thirtyDaysAgo;
      }).length;
      
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const pemeriksaanBulanIni = profiles.reduce((sum: number, profile: any) => {
        if (profile.last_checkup) {
          const checkupDate = new Date(profile.last_checkup);
          if (checkupDate.getMonth() === currentMonth && checkupDate.getFullYear() === currentYear) {
            return sum + 1;
          }
        }
        return sum;
      }, 0);

      setStats({
        totalLansia,
        totalPemeriksaan,
        lansiaAktif,
        pemeriksaanBulanIni
      });

      // Set recent profiles (semua data untuk scroll)
      setRecentProfiles(profiles);
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <ProtectedRoute requireAdmin={true}>
      <AdminLayout
        title="Dashboard Admin"
        subtitle={`Selamat datang, ${user?.username} - ${user?.posyandu_name}`}
      >
        <div className="p-6 space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white bg-opacity-10 rounded-full transform translate-x-8 -translate-y-8"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                    <FaHandPaper className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold mb-1">Selamat Datang, {user?.username}!</h2>
                    <p className="text-blue-100 text-sm">Kelola data kesehatan lansia {user?.posyandu_name} dengan mudah</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span className="text-xs text-blue-100">Online</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-3 h-3 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-xs text-blue-100">{new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Lansia</p>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {isLoading ? (
                      <div className="animate-pulse bg-gray-200 h-6 w-12 rounded"></div>
                    ) : (
                      stats.totalLansia
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Terdaftar di sistem</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Pemeriksaan</p>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {isLoading ? (
                      <div className="animate-pulse bg-gray-200 h-6 w-12 rounded"></div>
                    ) : (
                      stats.totalPemeriksaan
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Riwayat kesehatan</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lansia Aktif</p>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {isLoading ? (
                      <div className="animate-pulse bg-gray-200 h-6 w-12 rounded"></div>
                    ) : (
                      stats.lansiaAktif
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">30 hari terakhir</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Bulan Ini</p>
                  <div className="text-2xl font-bold text-gray-900 mt-1">
                    {isLoading ? (
                      <div className="animate-pulse bg-gray-200 h-6 w-12 rounded"></div>
                    ) : (
                      stats.pemeriksaanBulanIni
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Pemeriksaan baru</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Quick Actions */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Aksi Cepat</h3>
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Link
                    href="/admin/profiles"
                    className="group flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-blue-50 transition-all duration-200"
                  >
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900 text-center">Daftar Lansia</span>
                    <span className="text-xs text-gray-500 text-center mt-1">Kelola data</span>
                  </Link>

                  <Link
                    href="/scan"
                    className="group flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-green-50 transition-all duration-200"
                  >
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900 text-center">Scan QR Code</span>
                    <span className="text-xs text-gray-500 text-center mt-1">Akses cepat</span>
                  </Link>

                  <Link
                    href="/form"
                    className="group flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-purple-50 transition-all duration-200"
                  >
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900 text-center">Daftar Baru</span>
                    <span className="text-xs text-gray-500 text-center mt-1">Tambah lansia</span>
                  </Link>

                  <Link
                    href="/"
                    className="group flex flex-col items-center p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-900 text-center">Beranda</span>
                    <span className="text-xs text-gray-500 text-center mt-1">Halaman utama</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">Aktivitas Terbaru</h3>
                <Link
                  href="/admin/profiles"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                >
                  Lihat Semua →
                </Link>
              </div>
              <div className="flex-1">
                {/* Container dengan tinggi tetap untuk 4 item */}
                <div
                  className="space-y-2 pr-2 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                  style={{ height: '240px' }} // Tinggi untuk 4 item (60px per item)
                >
                  {isLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="animate-pulse">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                            <div className="flex-1 space-y-1">
                              <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                              <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : recentProfiles.length > 0 ? (
                    recentProfiles.map((profile) => (
                      <div key={profile.id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-lg transition-all duration-200 cursor-pointer">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-xs">
                            {profile.nama.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate text-sm">
                            {profile.nama}
                          </p>
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <span>{profile.usia} tahun</span>
                            <span>•</span>
                            <span>{profile.total_checkups} pemeriksaan</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-gray-500">{formatDate(profile.created_at)}</p>
                          <div className="flex items-center justify-end mt-1">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></div>
                            <span className="text-xs text-green-600">Aktif</span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium text-sm">Belum ada data lansia</p>
                      <p className="text-xs text-gray-400 mt-1">Mulai dengan mendaftarkan lansia pertama</p>
                    </div>
                  )}
                </div>

                {/* Scroll indicator */}
                {!isLoading && recentProfiles.length > 4 && (
                  <div className="flex items-center justify-center mt-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                      <span>Scroll untuk melihat lebih banyak ({recentProfiles.length - 4} lainnya)</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Additional Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* System Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Status Sistem</h3>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Database</span>
                  <span className="text-sm font-medium text-green-600">Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Server</span>
                  <span className="text-sm font-medium text-green-600">Aktif</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Backup</span>
                  <span className="text-sm font-medium text-gray-900">Hari ini</span>
                </div>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-blue-50 rounded-xl shadow-sm border border-blue-100 p-6">
              <div className="flex items-center mb-4">
                <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Tips Hari Ini</h3>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                💡 Gunakan fitur <strong>Scan QR Code</strong> untuk akses cepat ke profil lansia.
                Setiap lansia memiliki QR code unik yang dapat dipindai untuk melihat riwayat kesehatan lengkap.
              </p>
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
