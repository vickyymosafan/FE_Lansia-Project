// Utility functions for health data processing and categorization

export interface HealthStatus {
  status: string;
  color: string;
  description: string;
}

/**
 * Kategorisasi tekanan darah untuk lansia berdasarkan panduan medis
 * Menggunakan dua angka: sistolik (atas) dan diastolik (bawah) dalam mmHg
 */
export function getBloodPressureStatus(bp: string): HealthStatus {
  // Validasi format input
  if (!bp || !bp.includes('/')) {
    return { 
      status: 'Tidak Valid', 
      color: 'text-gray-600 bg-gray-100',
      description: 'Format tekanan darah tidak valid (gunakan format: 120/80)'
    };
  }

  const parts = bp.split('/');
  if (parts.length !== 2) {
    return { 
      status: 'Tidak Valid', 
      color: 'text-gray-600 bg-gray-100',
      description: 'Format tekanan darah tidak valid (gunakan format: 120/80)'
    };
  }

  const systolic = parseInt(parts[0].trim());
  const diastolic = parseInt(parts[1].trim());

  // Validasi range nilai
  if (isNaN(systolic) || isNaN(diastolic) || systolic < 50 || systolic > 300 || diastolic < 30 || diastolic > 200) {
    return { 
      status: 'Tidak Valid', 
      color: 'text-gray-600 bg-gray-100',
      description: 'Nilai tekanan darah di luar rentang normal'
    };
  }

  // Kategori tekanan darah untuk lansia berdasarkan panduan medis
  // Normal: di bawah 130 sistolik dan di bawah 80 diastolik
  if (systolic < 130 && diastolic < 80) {
    return { 
      status: 'Normal', 
      color: 'text-green-600 bg-green-100',
      description: 'Tekanan darah dalam batas normal untuk lansia'
    };
  }
  
  // Normal Tinggi: 130-139 sistolik atau 80-89 diastolik
  if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
    return { 
      status: 'Normal Tinggi', 
      color: 'text-yellow-600 bg-yellow-100',
      description: 'Tekanan darah sedikit tinggi, perlu pemantauan rutin'
    };
  }
  
  // Hipertensi Tingkat 1: 140-159 sistolik atau 90-99 diastolik
  if ((systolic >= 140 && systolic <= 159) || (diastolic >= 90 && diastolic <= 99)) {
    return { 
      status: 'Hipertensi Tingkat 1', 
      color: 'text-orange-600 bg-orange-100',
      description: 'Hipertensi ringan, perlu konsultasi dokter dan perubahan gaya hidup'
    };
  }
  
  // Hipertensi Tingkat 2: 160 atau lebih tinggi sistolik atau 100 atau lebih tinggi diastolik
  if (systolic >= 160 || diastolic >= 100) {
    return { 
      status: 'Hipertensi Tingkat 2', 
      color: 'text-red-600 bg-red-100',
      description: 'Hipertensi berat, segera konsultasi dokter untuk penanganan medis'
    };
  }

  // Fallback untuk kasus edge
  return { 
    status: 'Perlu Evaluasi', 
    color: 'text-gray-600 bg-gray-100',
    description: 'Nilai tekanan darah perlu evaluasi lebih lanjut'
  };
}

/**
 * Kategorisasi gula darah
 */
export function getBloodSugarStatus(sugar: number): HealthStatus {
  if (isNaN(sugar) || sugar < 0 || sugar > 1000) {
    return { 
      status: 'Tidak Valid', 
      color: 'text-gray-600 bg-gray-100',
      description: 'Nilai gula darah tidak valid'
    };
  }

  if (sugar < 100) {
    return { 
      status: 'Normal', 
      color: 'text-green-600 bg-green-100',
      description: 'Kadar gula darah normal'
    };
  } else if (sugar < 126) {
    return { 
      status: 'Pradiabetes', 
      color: 'text-yellow-600 bg-yellow-100',
      description: 'Kadar gula darah tinggi, berisiko diabetes'
    };
  } else {
    return { 
      status: 'Diabetes', 
      color: 'text-red-600 bg-red-100',
      description: 'Kadar gula darah tinggi, indikasi diabetes'
    };
  }
}

/**
 * Validasi format tekanan darah
 */
export function validateBloodPressureFormat(bp: string): { isValid: boolean; message: string } {
  if (!bp || bp.trim() === '') {
    return { isValid: false, message: 'Tekanan darah harus diisi' };
  }

  const bpPattern = /^\d{2,3}\/\d{2,3}$/;
  if (!bpPattern.test(bp.trim())) {
    return { isValid: false, message: 'Format harus: sistolik/diastolik (contoh: 120/80)' };
  }

  const [systolic, diastolic] = bp.split('/').map(num => parseInt(num.trim()));
  
  if (systolic < 50 || systolic > 300) {
    return { isValid: false, message: 'Tekanan sistolik harus antara 50-300 mmHg' };
  }
  
  if (diastolic < 30 || diastolic > 200) {
    return { isValid: false, message: 'Tekanan diastolik harus antara 30-200 mmHg' };
  }

  if (systolic <= diastolic) {
    return { isValid: false, message: 'Tekanan sistolik harus lebih tinggi dari diastolik' };
  }

  return { isValid: true, message: 'Format tekanan darah valid' };
}

/**
 * Parse tekanan darah menjadi objek sistolik dan diastolik
 */
export function parseBloodPressure(bp: string): { systolic: number; diastolic: number } | null {
  const validation = validateBloodPressureFormat(bp);
  if (!validation.isValid) {
    return null;
  }

  const [systolic, diastolic] = bp.split('/').map(num => parseInt(num.trim()));
  return { systolic, diastolic };
}

/**
 * Format tanggal untuk tampilan Indonesia
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}