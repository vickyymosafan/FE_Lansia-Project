'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  profileId: number;
}

export default function QRCodeDisplay({ profileId }: QRCodeDisplayProps) {
  const [showPrintView, setShowPrintView] = useState(false);
  const [profileUrl, setProfileUrl] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  // Set URL dan detect mobile setelah component mount di client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setProfileUrl(`${window.location.origin}/profile/${profileId}`);
      setIsMobile(window.innerWidth < 640);

      const handleResize = () => {
        setIsMobile(window.innerWidth < 640);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [profileId]);

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      setShowPrintView(true);
      setTimeout(() => {
        window.print();
        setShowPrintView(false);
      }, 100);
    }
  };

  const handleDownload = () => {
    if (typeof document !== 'undefined') {
      const canvas = document.querySelector('#qr-code canvas') as HTMLCanvasElement;
      if (canvas) {
        const link = document.createElement('a');
        link.download = `qr-code-lansia-${profileId}.png`;
        link.href = canvas.toDataURL();
        link.click();
      }
    }
  };

  const handleCopyUrl = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && profileUrl) {
      navigator.clipboard.writeText(profileUrl).then(() => {
        alert('URL berhasil disalin ke clipboard!');
      }).catch(() => {
        alert('Gagal menyalin URL');
      });
    } else {
      alert('Fitur copy tidak didukung atau URL belum tersedia');
    }
  };

  return (
    <>
      <div className="text-center space-y-3 sm:space-y-4">
        {/* QR Code */}
        <div id="qr-code" className="flex justify-center">
          <div className="bg-white p-3 sm:p-4 rounded-lg border-2 border-gray-200">
            {profileUrl ? (
              <QRCodeSVG
                value={profileUrl}
                size={isMobile ? 150 : 200}
                level="M"
              />
            ) : (
              <div className="w-[150px] h-[150px] sm:w-[200px] sm:h-[200px] flex items-center justify-center bg-gray-100 rounded">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-xs sm:text-sm text-gray-500">Memuat QR Code...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="text-xs sm:text-sm text-gray-600">
          <p>ID Profil: <span className="font-mono font-semibold">{profileId}</span></p>
          <p className="mt-1">Scan untuk akses cepat</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2">
          <button
            onClick={handlePrint}
            disabled={!profileUrl}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 btn-hover disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <span className="flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Cetak QR Code
            </span>
          </button>

          <button
            onClick={handleDownload}
            disabled={!profileUrl}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 btn-hover disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            <span className="flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PNG
            </span>
          </button>

          <button
            onClick={handleCopyUrl}
            disabled={!profileUrl}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 btn-hover disabled:bg-gray-400 disabled:cursor-not-allowed disabled:text-gray-600"
          >
            <span className="flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Salin URL
            </span>
          </button>
        </div>
      </div>

      {/* Print Styles */}
      {showPrintView && (
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            #print-qr-code, #print-qr-code * {
              visibility: visible;
            }
            #print-qr-code {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              text-align: center;
              padding: 20px;
            }
          }
        `}</style>
      )}

      {/* Hidden Print Content */}
      <div id="print-qr-code" className="hidden print:block">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">QR Code Kesehatan Lansia</h1>
          <div className="flex justify-center mb-4">
            {profileUrl && (
              <QRCodeSVG
                value={profileUrl}
                size={300}
                level="M"
              />
            )}
          </div>
          <div className="text-lg">
            <p><strong>ID Profil:</strong> {profileId}</p>
            <p className="mt-2">Scan QR Code ini untuk mengakses profil kesehatan</p>
            <p className="mt-4 text-sm text-gray-600">
              Aplikasi Kesehatan Lansia - Posyandu Digital
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
