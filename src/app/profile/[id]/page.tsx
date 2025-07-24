import { notFound } from 'next/navigation';
import Link from 'next/link';
import QRCodeDisplay from './QRCodeDisplay';
import AddCheckupForm from './AddCheckupForm';

interface Profile {
  id: number;
  nama: string;
  usia: number;
  alamat: string;
  riwayat_medis: string;
  created_at: string;
}

interface Checkup {
  id: number;
  profile_id: number;
  tekanan_darah: string;
  gula_darah: number;
  tanggal: string;
  catatan: string;
}

interface ProfileData {
  profile: Profile;
  checkups: Checkup[];
}

async function getProfileData(id: string): Promise<ProfileData | null> {
  try {
    const response = await fetch(`http://localhost:5000/api/profiles/${id}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getBloodPressureStatus(bp: string): { status: string; color: string } {
  const [systolic, diastolic] = bp.split('/').map(Number);
  
  if (systolic < 120 && diastolic < 80) {
    return { status: 'Normal', color: 'text-green-600 bg-green-100' };
  } else if (systolic < 130 && diastolic < 80) {
    return { status: 'Elevated', color: 'text-yellow-600 bg-yellow-100' };
  } else if (systolic < 140 || diastolic < 90) {
    return { status: 'Stage 1', color: 'text-orange-600 bg-orange-100' };
  } else {
    return { status: 'Stage 2', color: 'text-red-600 bg-red-100' };
  }
}

function getBloodSugarStatus(sugar: number): { status: string; color: string } {
  if (sugar < 100) {
    return { status: 'Normal', color: 'text-green-600 bg-green-100' };
  } else if (sugar < 126) {
    return { status: 'Prediabetes', color: 'text-yellow-600 bg-yellow-100' };
  } else {
    return { status: 'Diabetes', color: 'text-red-600 bg-red-100' };
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getProfileData(id);

  if (!data) {
    notFound();
  }

  const { profile, checkups } = data;
  const latestCheckup = checkups[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-4">
            <div className="flex items-center space-x-3 min-w-0 flex-1">
              <Link href="/" className="flex items-center space-x-3 min-w-0">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Kesehatan Lansia</h1>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">Profil {profile.nama}</p>
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
              <Link
                href="/scan"
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                Scan Lagi
              </Link>
              <Link
                href="/"
                className="text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                ← Beranda
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
          {/* Profile Info & QR Code */}
          <div className="xl:col-span-1 space-y-4 sm:space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 card-shadow-lg">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Data Pribadi</h2>
              </div>
              <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4">
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-500">Nama Lengkap</label>
                  <p className="text-base sm:text-lg font-semibold text-gray-900 break-words">{profile.nama}</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-500">Usia</label>
                  <p className="text-base sm:text-lg text-gray-900">{profile.usia} tahun</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-500">Alamat</label>
                  <p className="text-sm sm:text-base text-gray-900 break-words">{profile.alamat}</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-500">Riwayat Medis</label>
                  <p className="text-sm sm:text-base text-gray-900 break-words">{profile.riwayat_medis || 'Tidak ada riwayat khusus'}</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm font-medium text-gray-500">Terdaftar</label>
                  <p className="text-sm sm:text-base text-gray-900">{formatDate(profile.created_at)}</p>
                </div>
              </div>
            </div>

            {/* QR Code Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 card-shadow-lg">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">QR Code</h2>
                <p className="text-xs sm:text-sm text-gray-600">Untuk pemeriksaan selanjutnya</p>
              </div>
              <div className="px-4 sm:px-6 py-3 sm:py-4 flex justify-center">
                <QRCodeDisplay profileId={profile.id} />
              </div>
            </div>
          </div>

          {/* Health Data */}
          <div className="xl:col-span-2 space-y-4 sm:space-y-6">
            {/* Latest Checkup Summary */}
            {latestCheckup && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 card-shadow-lg">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">Pemeriksaan Terakhir</h2>
                  <p className="text-xs sm:text-sm text-gray-600">{formatDate(latestCheckup.tanggal)}</p>
                </div>
                <div className="px-4 sm:px-6 py-3 sm:py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1">
                        <h3 className="text-sm sm:text-base font-medium text-gray-900">Tekanan Darah</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium self-start ${getBloodPressureStatus(latestCheckup.tekanan_darah).color}`}>
                          {getBloodPressureStatus(latestCheckup.tekanan_darah).status}
                        </span>
                      </div>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{latestCheckup.tekanan_darah}</p>
                      <p className="text-xs sm:text-sm text-gray-600">mmHg</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 gap-1">
                        <h3 className="text-sm sm:text-base font-medium text-gray-900">Gula Darah</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium self-start ${getBloodSugarStatus(latestCheckup.gula_darah).color}`}>
                          {getBloodSugarStatus(latestCheckup.gula_darah).status}
                        </span>
                      </div>
                      <p className="text-xl sm:text-2xl font-bold text-gray-900">{latestCheckup.gula_darah}</p>
                      <p className="text-xs sm:text-sm text-gray-600">mg/dL</p>
                    </div>
                  </div>
                  {latestCheckup.catatan && (
                    <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-blue-50 rounded-lg">
                      <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-1">Catatan</h4>
                      <p className="text-sm sm:text-base text-gray-700 break-words">{latestCheckup.catatan}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Add New Checkup */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 card-shadow-lg">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Tambah Pemeriksaan Baru</h2>
                <p className="text-xs sm:text-sm text-gray-600">Catat hasil pemeriksaan kesehatan terbaru</p>
              </div>
              <div className="px-4 sm:px-6 py-3 sm:py-4">
                <AddCheckupForm profileId={profile.id} />
              </div>
            </div>

            {/* Checkup History */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 card-shadow-lg">
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Riwayat Pemeriksaan</h2>
                <p className="text-xs sm:text-sm text-gray-600">Total {checkups.length} pemeriksaan</p>
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tekanan Darah
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Gula Darah
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Catatan
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {checkups.map((checkup) => (
                      <tr key={checkup.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(checkup.tanggal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">{checkup.tekanan_darah}</span>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getBloodPressureStatus(checkup.tekanan_darah).color}`}>
                              {getBloodPressureStatus(checkup.tekanan_darah).status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">{checkup.gula_darah} mg/dL</span>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getBloodSugarStatus(checkup.gula_darah).color}`}>
                              {getBloodSugarStatus(checkup.gula_darah).status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {checkup.catatan || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-gray-200">
                {checkups.map((checkup) => (
                  <div key={checkup.id} className="px-4 py-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</p>
                        <p className="text-sm font-medium text-gray-900">{formatDate(checkup.tanggal)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Tekanan Darah</p>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-900">{checkup.tekanan_darah}</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getBloodPressureStatus(checkup.tekanan_darah).color}`}>
                            {getBloodPressureStatus(checkup.tekanan_darah).status}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Gula Darah</p>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-900">{checkup.gula_darah} mg/dL</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getBloodSugarStatus(checkup.gula_darah).color}`}>
                            {getBloodSugarStatus(checkup.gula_darah).status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {checkup.catatan && (
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Catatan</p>
                        <p className="text-sm text-gray-900 break-words">{checkup.catatan}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
