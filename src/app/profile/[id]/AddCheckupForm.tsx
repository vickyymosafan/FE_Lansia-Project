'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface AddCheckupFormProps {
  profileId: number;
}

interface CheckupData {
  tekanan_darah: string;
  gula_darah: string;
  catatan: string;
}

export default function AddCheckupForm({ profileId }: AddCheckupFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CheckupData>({
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
      const response = await fetch('http://localhost:5000/api/checkups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile_id: profileId,
          ...formData
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Reset form
        setFormData({
          tekanan_darah: '',
          gula_darah: '',
          catatan: ''
        });
        setShowForm(false);
        
        // Refresh the page to show new data
        router.refresh();
        
        alert('Pemeriksaan berhasil ditambahkan!');
      } else {
        alert(`Gagal menambah pemeriksaan: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error adding checkup:', error);
      alert('Gagal menghubungi server. Pastikan server backend berjalan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      tekanan_darah: '',
      gula_darah: '',
      catatan: ''
    });
    setShowForm(false);
  };

  if (!showForm) {
    return (
      <div className="text-center">
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 btn-hover"
        >
          <span className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Tambah Pemeriksaan Baru
          </span>
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div>
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

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed btn-hover"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menyimpan...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Simpan Pemeriksaan
            </span>
          )}
        </button>
        
        <button
          type="button"
          onClick={handleCancel}
          className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 btn-hover"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
