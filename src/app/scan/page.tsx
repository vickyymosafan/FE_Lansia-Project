'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BrowserMultiFormatReader } from '@zxing/library';

export default function ScanPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string>('');
  const [codeReader, setCodeReader] = useState<BrowserMultiFormatReader | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const reader = new BrowserMultiFormatReader();
    setCodeReader(reader);

    return () => {
      reader.reset();
    };
  }, []);

  const startScanning = async () => {
    if (!codeReader || !videoRef.current) return;

    try {
      setError('');
      setIsScanning(true);

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Use back camera if available
        } 
      });
      
      setHasPermission(true);
      videoRef.current.srcObject = stream;

      // Start decoding
      codeReader.decodeFromVideoDevice(null, videoRef.current, (result, error) => {
        if (result) {
          const text = result.getText();
          console.log('QR Code detected:', text);
          
          // Check if it's a valid profile URL
          const profileMatch = text.match(/\/profile\/(\d+)$/);
          if (profileMatch) {
            const profileId = profileMatch[1];
            stopScanning();
            router.push(`/profile/${profileId}`);
          } else {
            // If it's a full URL, try to extract the profile ID
            const urlMatch = text.match(/profile\/(\d+)/);
            if (urlMatch) {
              const profileId = urlMatch[1];
              stopScanning();
              router.push(`/profile/${profileId}`);
            } else {
              setError('QR Code tidak valid. Pastikan ini adalah QR Code dari aplikasi kesehatan lansia.');
            }
          }
        }
        
        if (error && !(error.name === 'NotFoundException')) {
          console.error('Scan error:', error);
        }
      });

    } catch (err) {
      console.error('Camera error:', err);
      setHasPermission(false);
      setError('Gagal mengakses kamera. Pastikan Anda memberikan izin kamera dan menggunakan HTTPS.');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReader) {
      codeReader.reset();
    }
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
  };

  const handleManualInput = () => {
    const profileId = prompt('Masukkan ID Profil Lansia:');
    if (profileId && /^\d+$/.test(profileId)) {
      router.push(`/profile/${profileId}`);
    } else if (profileId) {
      alert('ID Profil harus berupa angka');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Kesehatan Lansia</h1>
                  <p className="text-sm text-gray-500">Scan QR Code</p>
                </div>
              </Link>
            </div>
            <Link 
              href="/" 
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 card-shadow-lg">
          <div className="px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Scan QR Code Lansia</h2>
            <p className="text-gray-600 mt-2">
              Pindai QR Code untuk melihat profil dan riwayat pemeriksaan kesehatan lansia
            </p>
          </div>

          <div className="px-8 py-6">
            {/* Camera View */}
            <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-6" style={{ aspectRatio: '4/3' }}>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              
              {!isScanning && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                  <div className="text-center text-white">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <p className="text-lg font-medium">Kamera Belum Aktif</p>
                    <p className="text-sm text-gray-300 mt-1">Klik tombol "Mulai Scan" untuk mengaktifkan kamera</p>
                  </div>
                </div>
              )}

              {isScanning && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Scanning overlay */}
                  <div className="absolute inset-4 border-2 border-green-400 rounded-lg">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-green-400"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-green-400"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-green-400"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-green-400"></div>
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <p className="text-white text-sm bg-black bg-opacity-50 rounded px-3 py-1">
                      Arahkan kamera ke QR Code
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Control Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              {!isScanning ? (
                <button
                  onClick={startScanning}
                  className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 btn-hover"
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    Mulai Scan
                  </span>
                </button>
              ) : (
                <button
                  onClick={stopScanning}
                  className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 btn-hover"
                >
                  <span className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                    </svg>
                    Stop Scan
                  </span>
                </button>
              )}

              <button
                onClick={handleManualInput}
                className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 btn-hover"
              >
                Input Manual
              </button>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Cara Menggunakan</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Klik "Mulai Scan" untuk mengaktifkan kamera</li>
                  <li>Arahkan kamera ke QR Code lansia</li>
                  <li>Tunggu hingga QR Code terdeteksi secara otomatis</li>
                  <li>Jika QR Code tidak terbaca, gunakan "Input Manual"</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
