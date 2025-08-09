'use client';

import { getBloodPressureStatus, getBloodSugarStatus } from '@/utils/healthUtils';

interface HealthAnalysisProps {
  tekananDarah: string;
  gulaDarah: number;
  showRecommendations?: boolean;
  compact?: boolean;
}

export default function HealthAnalysis({ 
  tekananDarah, 
  gulaDarah, 
  showRecommendations = true,
  compact = false 
}: HealthAnalysisProps) {
  const bpStatus = getBloodPressureStatus(tekananDarah);
  const sugarStatus = getBloodSugarStatus(gulaDarah);

  // Determine overall risk level
  const getRiskLevel = () => {
    if (bpStatus.status === 'Hipertensi Tingkat 2' || sugarStatus.status === 'Diabetes') {
      return { level: 'very_high', label: 'Sangat Tinggi', color: 'text-red-700 bg-red-100' };
    } else if (bpStatus.status === 'Hipertensi Tingkat 1' || sugarStatus.status === 'Diabetes') {
      return { level: 'high', label: 'Tinggi', color: 'text-red-600 bg-red-50' };
    } else if (bpStatus.status === 'Normal Tinggi' || sugarStatus.status === 'Pradiabetes') {
      return { level: 'moderate', label: 'Sedang', color: 'text-yellow-600 bg-yellow-50' };
    } else {
      return { level: 'low', label: 'Rendah', color: 'text-green-600 bg-green-50' };
    }
  };

  const riskLevel = getRiskLevel();

  // Generate recommendations
  const getRecommendations = () => {
    const recommendations = [];
    
    if (bpStatus.status === 'Normal Tinggi') {
      recommendations.push('Kurangi konsumsi garam dan makanan berlemak');
      recommendations.push('Lakukan olahraga ringan secara teratur');
      recommendations.push('Pantau tekanan darah secara berkala');
    }
    
    if (bpStatus.status === 'Hipertensi Tingkat 1') {
      recommendations.push('Konsultasi dengan dokter untuk evaluasi lebih lanjut');
      recommendations.push('Kurangi konsumsi garam dan makanan berlemak');
      recommendations.push('Lakukan olahraga ringan secara teratur');
      recommendations.push('Pantau tekanan darah secara rutin');
    }
    
    if (bpStatus.status === 'Hipertensi Tingkat 2') {
      recommendations.push('SEGERA konsultasi dengan dokter');
      recommendations.push('Pantau tekanan darah setiap hari');
      recommendations.push('Ikuti anjuran pengobatan dari dokter');
      recommendations.push('Hindari aktivitas berat tanpa pengawasan medis');
    }
    
    if (sugarStatus.status === 'Pradiabetes') {
      recommendations.push('Kurangi konsumsi gula dan karbohidrat sederhana');
      recommendations.push('Tingkatkan aktivitas fisik');
      recommendations.push('Pantau berat badan');
      recommendations.push('Periksa gula darah secara berkala');
    }
    
    if (sugarStatus.status === 'Diabetes') {
      recommendations.push('Konsultasi dengan dokter untuk penanganan diabetes');
      recommendations.push('Kontrol diet sesuai anjuran dokter');
      recommendations.push('Pantau gula darah secara rutin');
      recommendations.push('Minum obat sesuai resep dokter');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Pertahankan pola hidup sehat');
      recommendations.push('Lakukan pemeriksaan rutin');
      recommendations.push('Konsumsi makanan bergizi seimbang');
      recommendations.push('Olahraga ringan secara teratur');
    }
    
    return recommendations;
  };

  const recommendations = getRecommendations();

  if (compact) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Status Kesehatan:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${riskLevel.color}`}>
            Risiko {riskLevel.label}
          </span>
        </div>
        <div className="text-xs text-gray-600">
          <p>{bpStatus.description}</p>
          <p>{sugarStatus.description}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Analisis Kesehatan</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${riskLevel.color}`}>
          Risiko {riskLevel.label}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Tekanan Darah</h4>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">{tekananDarah}</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${bpStatus.color}`}>
              {bpStatus.status}
            </span>
          </div>
          <p className="text-sm text-gray-600">{bpStatus.description}</p>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Gula Darah</h4>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900">{gulaDarah} mg/dL</span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${sugarStatus.color}`}>
              {sugarStatus.status}
            </span>
          </div>
          <p className="text-sm text-gray-600">{sugarStatus.description}</p>
        </div>
      </div>

      {showRecommendations && recommendations.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="font-medium text-gray-900 mb-3">Rekomendasi</h4>
          <ul className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span className="text-sm text-gray-700">{recommendation}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {(riskLevel.level === 'high' || riskLevel.level === 'very_high') && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h5 className="font-medium text-red-800">Perhatian Medis Diperlukan</h5>
              <p className="text-sm text-red-700 mt-1">
                Hasil pemeriksaan menunjukkan kondisi yang memerlukan perhatian medis. 
                Segera konsultasi dengan dokter atau tenaga kesehatan.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}