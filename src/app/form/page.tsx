'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface FormData {
  nama: string;
  usia: string;
  alamat: string;
  riwayat_medis: string;
  tekanan_darah: string;
  gula_darah: string;
  catatan: string;
}

export default function FormPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nama: '',
    usia: '',
    alamat: '',
    riwayat_medis: '',
    tekanan_darah: '',
    gula_darah: '',
    catatan: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.id) {
        // Redirect ke halaman profil dengan ID yang baru dibuat
        router.push(`/profile/${data.id}`);
      } else {
        alert(`Gagal menyimpan data: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Gagal menghubungi server. Pastikan server backend berjalan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Kesehatan Lansia</h1>
                  <p className="text-sm text-gray-600">Form Pendaftaran</p>
                </div>
              </Link>
            </div>
            <Link
              href="/"
              className="btn-secondary text-sm"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="fade-in">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <span className="ml-2 text-sm font-medium text-gray-900">Data Pribadi</span>
              </div>
              <div className="w-16 h-1 bg-gray-300 rounded"></div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <span className="ml-2 text-sm font-medium text-gray-900">Pemeriksaan</span>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="px-8 py-8 border-b border-gray-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Form Pendaftaran Lansia</h2>
                <p className="text-gray-600 max-w-md mx-auto">
                  Isi data pribadi dan pemeriksaan kesehatan pertama untuk lansia baru dengan lengkap dan akurat
                </p>
              </div>
            </div>

          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
            {/* Data Pribadi */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Pribadi</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    id="nama"
                    name="nama"
                    value={formData.nama}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Masukkan nama lengkap"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="usia" className="block text-sm font-medium text-gray-700 mb-2">
                    Usia *
                  </label>
                  <input
                    type="number"
                    id="usia"
                    name="usia"
                    value={formData.usia}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Masukkan usia"
                    min="50"
                    max="120"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="alamat" className="block text-sm font-medium text-gray-700 mb-2">
                  Alamat Lengkap *
                </label>
                <textarea
                  id="alamat"
                  name="alamat"
                  value={formData.alamat}
                  onChange={handleChange}
                  rows={3}
                  className="textarea-field"
                  placeholder="Masukkan alamat lengkap"
                  required
                />
              </div>

              <div className="mt-4">
                <label htmlFor="riwayat_medis" className="block text-sm font-medium text-gray-700 mb-2">
                  Riwayat Medis
                </label>
                <textarea
                  id="riwayat_medis"
                  name="riwayat_medis"
                  value={formData.riwayat_medis}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Masukkan riwayat penyakit atau kondisi medis (opsional)"
                />
              </div>
            </div>

            {/* Pemeriksaan Kesehatan */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pemeriksaan Kesehatan Pertama</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="tekanan_darah" className="block text-sm font-medium text-gray-700 mb-2">
                    Tekanan Darah *
                  </label>
                  <input
                    type="text"
                    id="tekanan_darah"
                    name="tekanan_darah"
                    value={formData.tekanan_darah}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Contoh: 120/80"
                    pattern="[0-9]{2,3}/[0-9]{2,3}"
                    title="Format: sistol/diastol (contoh: 120/80)"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="gula_darah" className="block text-sm font-medium text-gray-700 mb-2">
                    Gula Darah (mg/dL) *
                  </label>
                  <input
                    type="number"
                    id="gula_darah"
                    name="gula_darah"
                    value={formData.gula_darah}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Masukkan kadar gula darah"
                    min="50"
                    max="500"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="catatan" className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan Pemeriksaan
                </label>
                <textarea
                  id="catatan"
                  name="catatan"
                  value={formData.catatan}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Catatan tambahan dari pemeriksaan (opsional)"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <div className="spinner mr-3"></div>
                      Menyimpan...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Simpan Data
                    </span>
                  )}
                </button>
                <Link
                  href="/"
                  className="btn-secondary flex-1 text-center"
                >
                  Batal
                </Link>
              </div>
            </div>
          </form>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Informasi Penting</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Pastikan semua data yang dimasukkan sudah benar</li>
                  <li>Setelah disimpan, Anda akan mendapatkan QR Code untuk lansia</li>
                  <li>QR Code dapat dicetak atau disimpan untuk pemeriksaan selanjutnya</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        </div>
      </main>
    </div>
  );
}
