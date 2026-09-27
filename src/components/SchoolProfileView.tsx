import React, { useState, useRef } from 'react';
import { SchoolProfile, FacilityItem } from '../types';
import { OfficialSchoolKop } from './OfficialSchoolKop';
import { ConfirmDeleteModal, ConfirmDeleteState } from './ConfirmDeleteModal';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Award, 
  BookOpen, 
  Edit3, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle,
  School,
  FileCheck,
  Target,
  Sparkles,
  Info,
  Upload,
  Image as ImageIcon,
  Link as LinkIcon,
  Check,
  RefreshCw,
  Camera,
  X,
  FileText
} from 'lucide-react';

interface SchoolProfileViewProps {
  profile: SchoolProfile;
  onUpdateProfile: (updated: SchoolProfile) => void;
  onShowToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

const PEMDA_LOGO_PRESETS = [
  {
    name: 'Lambang Kota Depok',
    tag: 'Kota Depok (Jawa Barat)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Lambang_Kota_Depok.png/300px-Lambang_Kota_Depok.png'
  },
  {
    name: 'Garuda Pancasila RI',
    tag: 'Lambang Negara Republik Indonesia',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Coat_of_arms_of_Indonesia.svg/300px-Coat_of_arms_of_Indonesia.svg.png'
  },
  {
    name: 'Pemprov DKI Jakarta',
    tag: 'Jaya Raya (Ibukota Jakarta)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Coat_of_arms_of_Jakarta.svg/300px-Coat_of_arms_of_Jakarta.svg.png'
  },
  {
    name: 'Pemprov Jawa Barat',
    tag: 'Gemah Ripah Repeh Rapih',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Coat_of_arms_of_West_Java.svg/300px-Coat_of_arms_of_West_Java.svg.png'
  },
  {
    name: 'Pemprov Jawa Tengah',
    tag: 'Prasetya Ulah Sakti Bhakti Praja',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Coat_of_arms_of_Central_Java.svg/300px-Coat_of_arms_of_Central_Java.svg.png'
  },
  {
    name: 'Pemprov Jawa Timur',
    tag: 'Jer Basuki Mawa Beya',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Coat_of_arms_of_East_Java.svg/300px-Coat_of_arms_of_East_Java.svg.png'
  },
  {
    name: 'Pemda DIY Yogyakarta',
    tag: 'Golong Gilig Yogyakarta',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Coat_of_arms_of_Yogyakarta.svg/300px-Coat_of_arms_of_Yogyakarta.svg.png'
  },
  {
    name: 'Pemkab Sleman',
    tag: 'Kabupaten Sleman (DIY)',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Lambang_Kabupaten_Sleman.png/300px-Lambang_Kabupaten_Sleman.png'
  },
  {
    name: 'Pemkab Bogor',
    tag: 'Prayoga Tohaga Sayaga',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Lambang_Kabupaten_Bogor.png/300px-Lambang_Kabupaten_Bogor.png'
  }
];

const SCHOOL_LOGO_PRESETS = [
  {
    name: 'Kemendikbud Tut Wuri Handayani',
    tag: 'Resmi Kemendikbudristek RI',
    url: 'https://upload.wikimedia.org/wikipedia/commons/9/9c/Logo_of_Ministry_of_Education_and_Culture_of_Republic_of_Indonesia.svg'
  },
  {
    name: 'Logo Sekolah Dasar (SD)',
    tag: 'Emblem SD Merah Putih',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Logo_Sekolah_Dasar.png/300px-Logo_Sekolah_Dasar.png'
  },
  {
    name: 'Merdeka Belajar & Pelajar Pancasila',
    tag: 'Karakter Merdeka Belajar',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Logo_Kemendikbud.png/300px-Logo_Kemendikbud.png'
  },
  {
    name: 'Bintang Prestasi & Obor Ilmu',
    tag: 'Generasi Emas & Cerdas',
    url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=300&auto=format&fit=crop&q=80'
  },
  {
    name: 'Sekolah Adiwiyata & Ramah Anak',
    tag: 'Cinta Lingkungan & Asri',
    url: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&auto=format&fit=crop&q=80'
  }
];

export const SchoolProfileView: React.FC<SchoolProfileViewProps> = ({
  profile,
  onUpdateProfile,
  onShowToast
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<SchoolProfile>(profile);
  const [newMisiText, setNewMisiText] = useState('');
  const [newTujuanText, setNewTujuanText] = useState('');

  // Logo management state
  const pemdaFileInputRef = useRef<HTMLInputElement>(null);
  const schoolFileInputRef = useRef<HTMLInputElement>(null);

  const [isDraggingPemda, setIsDraggingPemda] = useState(false);
  const [isDraggingSchool, setIsDraggingSchool] = useState(false);

  const [showPemdaUrlInput, setShowPemdaUrlInput] = useState(false);
  const [customPemdaUrlInput, setCustomPemdaUrlInput] = useState('');
  const [showPemdaPresets, setShowPemdaPresets] = useState(false);

  const [showSchoolUrlInput, setShowSchoolUrlInput] = useState(false);
  const [customSchoolUrlInput, setCustomSchoolUrlInput] = useState('');
  const [showSchoolPresets, setShowSchoolPresets] = useState(false);

  // New Sarpras item state
  const [showAddSarpras, setShowAddSarpras] = useState(false);
  const [newSarprasNama, setNewSarprasNama] = useState('');
  const [newSarprasJumlah, setNewSarprasJumlah] = useState(1);
  const [newSarprasBaik, setNewSarprasBaik] = useState(1);
  const [newSarprasRusakR, setNewSarprasRusakR] = useState(0);
  const [newSarprasRusakB, setNewSarprasRusakB] = useState(0);
  const [newSarprasKet, setNewSarprasKet] = useState('');

  // Confirmation Delete Modal State
  const [deleteConfirmState, setDeleteConfirmState] = useState<ConfirmDeleteState>({
    isOpen: false,
    title: '',
    itemName: '',
    description: '',
    onConfirm: () => {},
  });

  const openDeleteConfirm = (config: Omit<ConfirmDeleteState, 'isOpen'>) => {
    setDeleteConfirmState({
      ...config,
      isOpen: true,
    });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmState(prev => ({ ...prev, isOpen: false }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setIsEditing(false);
    onShowToast('Profil Sekolah Tersimpan', 'Informasi identitas, logo Pemda, logo sekolah, dan sarana prasarana berhasil diperbarui.', 'success');
  };

  const processImageFile = (file: File, target: 'pemda' | 'school') => {
    if (!file.type.startsWith('image/')) {
      onShowToast('Format Tidak Didukung', 'Harap pilih file gambar (PNG, JPG, JPEG, SVG, atau WEBP).', 'error');
      return;
    }

    const field = target === 'pemda' ? 'logoPemdaUrl' : 'logoUrl';
    const label = target === 'pemda' ? 'Logo Pemerintah Daerah' : 'Logo Sekolah';

    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setFormData(prev => ({ ...prev, [field]: result }));
        onShowToast(`${label} Diperbarui`, 'File logo SVG berhasil dimuat.', 'success');
      };
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 512;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/png', 0.92);
          setFormData(prev => ({ ...prev, [field]: dataUrl }));
          onShowToast(`${label} Diperbarui`, 'File logo berhasil diunggah dan dioptimalkan.', 'success');
        }
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'pemda' | 'school') => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file, target);
    if (e.target) e.target.value = '';
  };

  const handleApplyUrl = (target: 'pemda' | 'school') => {
    if (target === 'pemda') {
      if (!customPemdaUrlInput.trim()) return;
      setFormData(prev => ({ ...prev, logoPemdaUrl: customPemdaUrlInput.trim() }));
      onShowToast('Logo Pemda Diterapkan', 'URL logo Pemda berhasil dipasang.', 'success');
      setCustomPemdaUrlInput('');
      setShowPemdaUrlInput(false);
    } else {
      if (!customSchoolUrlInput.trim()) return;
      setFormData(prev => ({ ...prev, logoUrl: customSchoolUrlInput.trim() }));
      onShowToast('Logo Sekolah Diterapkan', 'URL logo sekolah berhasil dipasang.', 'success');
      setCustomSchoolUrlInput('');
      setShowSchoolUrlInput(false);
    }
  };

  const handleRemoveLogo = (target: 'pemda' | 'school') => {
    const isPemda = target === 'pemda';
    openDeleteConfirm({
      title: isPemda ? 'Hapus Logo Pemerintah Daerah' : 'Hapus Logo Sekolah',
      itemName: isPemda ? `Logo Pemkab/Pemkot ${formData.kabupatenKota}` : `Logo ${formData.namaSekolah}`,
      description: `Apakah Anda yakin ingin menghapus ${isPemda ? 'Logo Pemda' : 'Logo Sekolah'} ini dari profil dan kop surat?`,
      confirmButtonText: 'Ya, Hapus Logo',
      onConfirm: () => {
        if (isPemda) {
          setFormData(prev => ({ ...prev, logoPemdaUrl: undefined }));
          onShowToast('Logo Pemda Dihapus', 'Logo Pemda telah dihapus.', 'info');
        } else {
          setFormData(prev => ({ ...prev, logoUrl: undefined }));
          onShowToast('Logo Sekolah Dihapus', 'Logo sekolah telah dihapus.', 'info');
        }
      }
    });
  };

  const handleSelectPreset = (url: string, name: string, target: 'pemda' | 'school') => {
    if (target === 'pemda') {
      setFormData(prev => ({ ...prev, logoPemdaUrl: url }));
      onShowToast('Logo Pemda Dipilih', `Preset "${name}" berhasil diterapkan.`, 'success');
    } else {
      setFormData(prev => ({ ...prev, logoUrl: url }));
      onShowToast('Logo Sekolah Dipilih', `Preset "${name}" berhasil diterapkan.`, 'success');
    }
  };

  const handleAddMisi = () => {
    if (!newMisiText.trim()) return;
    setFormData({
      ...formData,
      misi: [...formData.misi, newMisiText.trim()]
    });
    setNewMisiText('');
  };

  const handleRemoveMisi = (index: number) => {
    const itemText = formData.misi[index] || `Poin ${index + 1}`;
    openDeleteConfirm({
      title: 'Hapus Poin Misi Sekolah',
      itemName: `Poin ${index + 1}: ${itemText}`,
      description: 'Apakah Anda yakin ingin menghapus poin misi ini dari profil sekolah?',
      confirmButtonText: 'Ya, Hapus Misi',
      onConfirm: () => {
        setFormData(prev => ({
          ...prev,
          misi: prev.misi.filter((_, i) => i !== index)
        }));
        onShowToast('Poin Misi Dihapus', 'Poin misi sekolah telah dihapus.', 'info');
      }
    });
  };

  const handleAddTujuan = () => {
    if (!newTujuanText.trim()) return;
    setFormData({
      ...formData,
      tujuanSekolah: [...formData.tujuanSekolah, newTujuanText.trim()]
    });
    setNewTujuanText('');
  };

  const handleRemoveTujuan = (index: number) => {
    const itemText = formData.tujuanSekolah[index] || `Poin ${index + 1}`;
    openDeleteConfirm({
      title: 'Hapus Poin Tujuan Sekolah',
      itemName: `Poin ${index + 1}: ${itemText}`,
      description: 'Apakah Anda yakin ingin menghapus poin tujuan satuan pendidikan ini?',
      confirmButtonText: 'Ya, Hapus Tujuan',
      onConfirm: () => {
        setFormData(prev => ({
          ...prev,
          tujuanSekolah: prev.tujuanSekolah.filter((_, i) => i !== index)
        }));
        onShowToast('Poin Tujuan Dihapus', 'Poin tujuan sekolah telah dihapus.', 'info');
      }
    });
  };

  const handleAddSarpras = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSarprasNama.trim()) return;
    const newItem: FacilityItem = {
      id: `sarpras-${Date.now()}`,
      nama: newSarprasNama,
      jumlah: Number(newSarprasJumlah),
      kondisiBaik: Number(newSarprasBaik),
      kondisiRusakRingan: Number(newSarprasRusakR),
      kondisiRusakBerat: Number(newSarprasRusakB),
      keterangan: newSarprasKet
    };

    const updatedSarpras = [...formData.saranaPrasarana, newItem];
    setFormData({ ...formData, saranaPrasarana: updatedSarpras });
    if (!isEditing) {
      onUpdateProfile({ ...formData, saranaPrasarana: updatedSarpras });
      onShowToast('Sarpras Ditambahkan', `Fasilitas "${newSarprasNama}" berhasil dicatat.`, 'success');
    }

    setNewSarprasNama('');
    setNewSarprasJumlah(1);
    setNewSarprasBaik(1);
    setNewSarprasRusakR(0);
    setNewSarprasRusakB(0);
    setNewSarprasKet('');
    setShowAddSarpras(false);
  };

  const handleDeleteSarpras = (item: FacilityItem) => {
    openDeleteConfirm({
      title: 'Hapus Sarana & Prasarana',
      itemName: `${item.nama} (${item.jumlah} Unit)`,
      description: `Apakah Anda yakin ingin menghapus data inventaris sarpras "${item.nama}" dari data sekolah?`,
      confirmButtonText: 'Ya, Hapus Fasilitas',
      onConfirm: () => {
        const updated = formData.saranaPrasarana.filter(s => s.id !== item.id);
        setFormData(prev => ({ ...prev, saranaPrasarana: updated }));
        if (!isEditing) {
          onUpdateProfile({ ...formData, saranaPrasarana: updated });
        }
        onShowToast('Fasilitas Dihapus', `Data sarpras "${item.nama}" telah dihapus.`, 'info');
      }
    });
  };

  // Summary counts
  const totalFasilitas = formData.saranaPrasarana.reduce((acc, curr) => acc + curr.jumlah, 0);
  const totalBaik = formData.saranaPrasarana.reduce((acc, curr) => acc + curr.kondisiBaik, 0);
  const totalRusakR = formData.saranaPrasarana.reduce((acc, curr) => acc + curr.kondisiRusakRingan, 0);
  const totalRusakB = formData.saranaPrasarana.reduce((acc, curr) => acc + curr.kondisiRusakBerat, 0);

  return (
    <div className="space-y-6">
      {/* Hidden File Inputs for Pemda and School Logos */}
      <input
        ref={pemdaFileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
        onChange={(e) => handleFileUpload(e, 'pemda')}
        className="hidden"
      />
      <input
        ref={schoolFileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/jpg, image/svg+xml, image/webp"
        onChange={(e) => handleFileUpload(e, 'school')}
        className="hidden"
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
            <Building2 className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Data & Profil Sekolah Dasar
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                Terverifikasi Dapodik
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Pengelolaan identitas lembaga, akreditasi, pimpinan, visi misi, sarana prasarana, dan logo resmi kop surat.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {!isEditing ? (
            <button
              onClick={() => {
                setFormData(profile);
                setIsEditing(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/30 transition-all"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Data Sekolah</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setFormData(profile);
                  setIsEditing(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/30 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* LOGO RESMI PEMDA & SEKOLAH SECTION */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-amber-400" />
                Logo Resmi Pemerintah Daerah & Sekolah (Kop Surat)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Kop surat resmi menggunakan <strong>Logo Pemerintah Daerah di sebelah kiri</strong> dan <strong>Logo Sekolah di sebelah kanan</strong>.
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
              Format Standar Baku Dinas Pendidikan
            </span>
          </div>

          {/* 2-Column Logo Editors */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. LOGO PEMERINTAH DAERAH (KIRI KOP) */}
            <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800/80 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">Logo Pemerintah Daerah (Pemda)</h4>
                      <p className="text-[11px] text-blue-400">Posisi: Sebelah Kiri Kop Surat</p>
                    </div>
                  </div>
                  {formData.logoPemdaUrl ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      Terpasang
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Belum Ada
                    </span>
                  )}
                </div>

                {/* Preview Box & Quick Controls */}
                <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative group shrink-0">
                    <div className="w-28 h-28 rounded-2xl bg-white p-2 shadow-lg border-2 border-slate-700 flex items-center justify-center overflow-hidden group-hover:border-blue-500 transition-colors">
                      {formData.logoPemdaUrl ? (
                        <img
                          src={formData.logoPemdaUrl}
                          alt="Logo Pemda"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 text-center p-1">
                          <Building2 className="w-8 h-8 text-slate-400 mb-1" />
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Logo Pemda</span>
                        </div>
                      )}
                    </div>

                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => pemdaFileInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 p-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-transform active:scale-95"
                        title="Unggah Logo Pemda"
                      >
                        <Camera className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="text-center sm:text-left min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-200">
                      PEMERINTAH {formData.kabupatenKota.toUpperCase()}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Provinsi {formData.provinsi}
                    </p>
                    {formData.logoPemdaUrl && isEditing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLogo('pemda')}
                        className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Hapus Logo Pemda
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Editing Controls for Pemda */}
              {isEditing && (
                <div className="space-y-3 pt-3 border-t border-slate-800/80">
                  {/* Drag & drop box */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingPemda(true); }}
                    onDragLeave={() => setIsDraggingPemda(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingPemda(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        processImageFile(e.dataTransfer.files[0], 'pemda');
                      }
                    }}
                    onClick={() => pemdaFileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-all ${
                      isDraggingPemda
                        ? 'border-blue-400 bg-blue-500/10'
                        : 'border-slate-700 hover:border-slate-500 bg-slate-900/60'
                    }`}
                  >
                    <Upload className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-slate-200">
                      Klik / Seret Berkas Logo Pemda ke Sini
                    </p>
                    <p className="text-[10px] text-slate-400">PNG, JPG, SVG, atau WEBP</p>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => pemdaFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Pilih Berkas
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPemdaPresets(!showPemdaPresets)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        showPemdaPresets
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                      Pilihan Logo Pemda
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPemdaUrlInput(!showPemdaUrlInput)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        showPemdaUrlInput
                          ? 'bg-sky-600 text-white border-sky-500'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      Tautan URL
                    </button>
                  </div>

                  {/* URL Input */}
                  {showPemdaUrlInput && (
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 space-y-2 animate-in fade-in">
                      <label className="block text-[11px] font-semibold text-slate-300">
                        URL Langsung Lambang Daerah (PNG/SVG)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://upload.wikimedia.org/.../Lambang_Kota.png"
                          value={customPemdaUrlInput}
                          onChange={(e) => setCustomPemdaUrlInput(e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyUrl('pemda')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shrink-0"
                        >
                          Pasang
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Presets Gallery for Pemda */}
                  {showPemdaPresets && (
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 space-y-2.5 animate-in fade-in max-h-64 overflow-y-auto">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">
                          Pilih Lambang Pemerintah Daerah
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowPemdaPresets(false)}
                          className="text-slate-400 hover:text-white text-xs"
                        >
                          Tutup
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {PEMDA_LOGO_PRESETS.map((preset) => {
                          const isSelected = formData.logoPemdaUrl === preset.url;
                          return (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => handleSelectPreset(preset.url, preset.name, 'pemda')}
                              className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all ${
                                isSelected
                                  ? 'bg-blue-500/15 border-blue-500 ring-1 ring-blue-500'
                                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="w-8 h-8 rounded bg-white p-0.5 flex items-center justify-center shrink-0">
                                <img
                                  src={preset.url}
                                  alt={preset.name}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-100 truncate">{preset.name}</p>
                                <p className="text-[9px] text-slate-400 truncate">{preset.tag}</p>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 2. LOGO RESMI SEKOLAH (KANAN KOP) */}
            <div className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800/80 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-bold flex items-center justify-center">2</span>
                    <div>
                      <h4 className="text-sm font-bold text-white">Logo Resmi Sekolah</h4>
                      <p className="text-[11px] text-amber-400">Posisi: Sebelah Kanan Kop Surat & Navbar</p>
                    </div>
                  </div>
                  {formData.logoUrl ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      Terpasang
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                      Belum Ada
                    </span>
                  )}
                </div>

                {/* Preview Box & Quick Controls */}
                <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
                  <div className="relative group shrink-0">
                    <div className="w-28 h-28 rounded-2xl bg-white p-2 shadow-lg border-2 border-slate-700 flex items-center justify-center overflow-hidden group-hover:border-amber-500 transition-colors">
                      {formData.logoUrl ? (
                        <img
                          src={formData.logoUrl}
                          alt="Logo Sekolah"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.currentTarget as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 text-center p-1">
                          <School className="w-8 h-8 text-slate-400 mb-1" />
                          <span className="text-[9px] font-bold text-slate-500 uppercase">Logo Sekolah</span>
                        </div>
                      )}
                    </div>

                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => schoolFileInputRef.current?.click()}
                        className="absolute -bottom-1 -right-1 p-2 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md transition-transform active:scale-95"
                        title="Unggah Logo Sekolah"
                      >
                        <Camera className="w-3.5 h-3.5 font-bold" />
                      </button>
                    )}
                  </div>

                  <div className="text-center sm:text-left min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-200">
                      {formData.namaSekolah}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      NPSN: {formData.npsn}
                    </p>
                    {formData.logoUrl && isEditing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLogo('school')}
                        className="mt-2 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30 hover:bg-rose-500/25 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Hapus Logo Sekolah
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Editing Controls for School */}
              {isEditing && (
                <div className="space-y-3 pt-3 border-t border-slate-800/80">
                  {/* Drag & drop box */}
                  <div
                    onDragOver={(e) => { e.preventDefault(); setIsDraggingSchool(true); }}
                    onDragLeave={() => setIsDraggingSchool(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingSchool(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        processImageFile(e.dataTransfer.files[0], 'school');
                      }
                    }}
                    onClick={() => schoolFileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-3.5 text-center cursor-pointer transition-all ${
                      isDraggingSchool
                        ? 'border-amber-400 bg-amber-500/10'
                        : 'border-slate-700 hover:border-slate-500 bg-slate-900/60'
                    }`}
                  >
                    <Upload className="w-5 h-5 text-amber-400 mx-auto mb-1" />
                    <p className="text-xs font-semibold text-slate-200">
                      Klik / Seret Berkas Logo Sekolah ke Sini
                    </p>
                    <p className="text-[10px] text-slate-400">PNG, JPG, SVG, atau WEBP</p>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => schoolFileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-sm transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      Pilih Berkas
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSchoolPresets(!showSchoolPresets)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        showSchoolPresets
                          ? 'bg-amber-500 text-slate-950 border-amber-400'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Pilihan Logo Sekolah / SD
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSchoolUrlInput(!showSchoolUrlInput)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        showSchoolUrlInput
                          ? 'bg-sky-600 text-white border-sky-500'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      Tautan URL
                    </button>
                  </div>

                  {/* URL Input */}
                  {showSchoolUrlInput && (
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 space-y-2 animate-in fade-in">
                      <label className="block text-[11px] font-semibold text-slate-300">
                        URL Langsung Gambar Logo Sekolah
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://contoh-domain.sch.id/logo-sekolah.png"
                          value={customSchoolUrlInput}
                          onChange={(e) => setCustomSchoolUrlInput(e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyUrl('school')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shrink-0"
                        >
                          Pasang
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Presets Gallery for School */}
                  {showSchoolPresets && (
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 space-y-2.5 animate-in fade-in max-h-64 overflow-y-auto">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-200">
                          Pilih Preset Logo Pendidikan / SD
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowSchoolPresets(false)}
                          className="text-slate-400 hover:text-white text-xs"
                        >
                          Tutup
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {SCHOOL_LOGO_PRESETS.map((preset) => {
                          const isSelected = formData.logoUrl === preset.url;
                          return (
                            <button
                              key={preset.name}
                              type="button"
                              onClick={() => handleSelectPreset(preset.url, preset.name, 'school')}
                              className={`flex items-center gap-2.5 p-2 rounded-lg border text-left transition-all ${
                                isSelected
                                  ? 'bg-amber-500/15 border-amber-500 ring-1 ring-amber-500'
                                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="w-8 h-8 rounded bg-white p-0.5 flex items-center justify-center shrink-0">
                                <img
                                  src={preset.url}
                                  alt={preset.name}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-slate-100 truncate">{preset.name}</p>
                                <p className="text-[9px] text-slate-400 truncate">{preset.tag}</p>
                              </div>
                              {isSelected && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* LIVE KOP SURAT PREVIEW */}
          <div className="mt-6 pt-5 border-t border-slate-800 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-400" />
                Pratinjau Standar Baku Kop Dokumen & Laporan Cetak Resmi:
              </span>
              <span className="text-[11px] text-slate-400">
                (Kiri: Logo Pemda • Tengah: Susunan Instansi & Identitas • Kanan: Logo Sekolah)
              </span>
            </div>

            {/* Standard Kop Surat Preview Box */}
            <div className="bg-white text-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-300 shadow-md text-left font-sans">
              <OfficialSchoolKop school={formData} variant="preview" />
            </div>
          </div>
        </div>

        {/* Identitas Sekolah Grid */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-100 pb-3 border-b border-slate-800 flex items-center gap-2">
            <School className="w-5 h-5 text-amber-400" />
            1. Identitas Pokok & Legalitas Sekolah
          </h3>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Nama Resmi Sekolah</label>
              {isEditing ? (
                <input
                  type="text"
                  required
                  value={formData.namaSekolah}
                  onChange={(e) => setFormData({ ...formData, namaSekolah: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              ) : (
                <div className="text-sm font-bold text-white bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-700/60">
                  {formData.namaSekolah}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">NPSN (Nomor Pokok Sekolah Nasional)</label>
              {isEditing ? (
                <input
                  type="text"
                  required
                  value={formData.npsn}
                  onChange={(e) => setFormData({ ...formData, npsn: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              ) : (
                <div className="text-sm font-mono font-semibold text-amber-300 bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-700/60">
                  {formData.npsn}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">NSS (Nomor Statistik Sekolah)</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.nss}
                  onChange={(e) => setFormData({ ...formData, nss: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              ) : (
                <div className="text-sm font-mono text-slate-300 bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-700/60">
                  {formData.nss}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Status Lembaga</label>
              {isEditing ? (
                <select
                  value={formData.statusSekolah}
                  onChange={(e) => setFormData({ ...formData, statusSekolah: e.target.value as SchoolProfile['statusSekolah'] })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Negeri">Negeri</option>
                  <option value="Swasta">Swasta</option>
                </select>
              ) : (
                <div className="text-sm text-slate-200 bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-700/60">
                  Sekolah Dasar {formData.statusSekolah}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Akreditasi & No. SK</label>
              {isEditing ? (
                <div className="flex gap-2">
                  <select
                    value={formData.akreditasi}
                    onChange={(e) => setFormData({ ...formData, akreditasi: e.target.value as SchoolProfile['akreditasi'] })}
                    className="w-28 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="A">Peringkat A</option>
                    <option value="B">Peringkat B</option>
                    <option value="C">Peringkat C</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Nomor SK Akreditasi"
                    value={formData.nomorSkAkreditasi}
                    onChange={(e) => setFormData({ ...formData, nomorSkAkreditasi: e.target.value })}
                    className="flex-1 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              ) : (
                <div className="text-sm text-slate-200 bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-700/60 flex items-center justify-between">
                  <span className="font-semibold text-emerald-400">Akreditasi {formData.akreditasi}</span>
                  <span className="text-xs text-slate-400 font-mono truncate max-w-[150px]">{formData.nomorSkAkreditasi}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Kurikulum Digunakan</label>
              {isEditing ? (
                <select
                  value={formData.kurikulum}
                  onChange={(e) => setFormData({ ...formData, kurikulum: e.target.value as SchoolProfile['kurikulum'] })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Kurikulum Merdeka">Kurikulum Merdeka</option>
                  <option value="Kurikulum 2013 (K13)">Kurikulum 2013 (K13)</option>
                  <option value="Kombinasi">Kombinasi (Merdeka & K13)</option>
                </select>
              ) : (
                <div className="text-sm font-semibold text-sky-300 bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-700/60">
                  {formData.kurikulum}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Tahun Pelajaran Aktif</label>
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="2025/2026"
                    value={formData.tahunAjaran}
                    onChange={(e) => setFormData({ ...formData, tahunAjaran: e.target.value })}
                    className="flex-1 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                  <select
                    value={formData.semester}
                    onChange={(e) => setFormData({ ...formData, semester: e.target.value as SchoolProfile['semester'] })}
                    className="w-28 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="Ganjil">Ganjil</option>
                    <option value="Genap">Genap</option>
                  </select>
                </div>
              ) : (
                <div className="text-sm text-slate-200 bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-700/60">
                  T.P. {formData.tahunAjaran} - Semester {formData.semester}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Kepala Sekolah</label>
              {isEditing ? (
                <input
                  type="text"
                  required
                  value={formData.kepalaSekolah}
                  onChange={(e) => setFormData({ ...formData, kepalaSekolah: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              ) : (
                <div className="text-sm font-semibold text-white bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-700/60">
                  {formData.kepalaSekolah}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">NIP Kepala Sekolah</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.nipKepalaSekolah}
                  onChange={(e) => setFormData({ ...formData, nipKepalaSekolah: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              ) : (
                <div className="text-sm font-mono text-slate-300 bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-700/60">
                  {formData.nipKepalaSekolah}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Alamat & Kontak Grid */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-100 pb-3 border-b border-slate-800 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-sky-400" />
            2. Lokasi Geografis & Kontak Komunikasi
          </h3>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-slate-400 mb-1">Alamat Jalan / RT / RW</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.alamatJalan}
                  onChange={(e) => setFormData({ ...formData, alamatJalan: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              ) : (
                <div className="text-sm text-slate-200 bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-700/60">
                  {formData.alamatJalan}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Desa / Kelurahan</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.desaKelurahan}
                  onChange={(e) => setFormData({ ...formData, desaKelurahan: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              ) : (
                <div className="text-sm text-slate-200 bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-700/60">
                  {formData.desaKelurahan}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Kecamatan</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.kecamatan}
                  onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              ) : (
                <div className="text-sm text-slate-200 bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-700/60">
                  {formData.kecamatan}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Kabupaten / Kota</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.kabupatenKota}
                  onChange={(e) => setFormData({ ...formData, kabupatenKota: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              ) : (
                <div className="text-sm text-slate-200 bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-700/60">
                  {formData.kabupatenKota}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Provinsi & Kode Pos</label>
              {isEditing ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.provinsi}
                    onChange={(e) => setFormData({ ...formData, provinsi: e.target.value })}
                    className="flex-1 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="Kode Pos"
                    value={formData.kodePos}
                    onChange={(e) => setFormData({ ...formData, kodePos: e.target.value })}
                    className="w-24 px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              ) : (
                <div className="text-sm text-slate-200 bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-700/60">
                  {formData.provinsi}, {formData.kodePos}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Nomor Telepon Sekolah</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.telepon}
                  onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              ) : (
                <div className="text-sm text-slate-200 bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-700/60 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {formData.telepon}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Email Resmi Sekolah</label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              ) : (
                <div className="text-sm text-slate-200 bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-700/60 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {formData.email}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Website / Laman Sekolah</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              ) : (
                <div className="text-sm text-slate-200 bg-slate-800/60 px-3.5 py-2 rounded-xl border border-slate-700/60 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <a href={formData.website} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">
                    {formData.website}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Visi & Misi */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-100 pb-3 border-b border-slate-800 flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-400" />
            3. Visi, Misi & Tujuan Satuan Pendidikan
          </h3>

          <div className="mt-5 space-y-5">
            {/* Visi */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                Visi Sekolah
              </label>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={formData.visi}
                  onChange={(e) => setFormData({ ...formData, visi: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 leading-relaxed"
                />
              ) : (
                <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 text-sm text-slate-200 leading-relaxed italic border-l-4 border-l-amber-500">
                  "{formData.visi}"
                </div>
              )}
            </div>

            {/* Misi */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Misi Sekolah ({formData.misi.length} Poin)
                </label>
              </div>

              <div className="space-y-2">
                {formData.misi.map((item, idx) => (
                  <div 
                    key={idx}
                    className="flex items-start justify-between gap-3 bg-slate-800/40 border border-slate-700/50 rounded-xl p-3"
                  >
                    <div className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">{item}</p>
                    </div>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMisi(idx)}
                        className="text-slate-400 hover:text-rose-400 p-1 shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    placeholder="Tambah poin misi baru..."
                    value={newMisiText}
                    onChange={(e) => setNewMisiText(e.target.value)}
                    className="flex-1 px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddMisi}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                  >
                    Tambah
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sarana & Prasarana Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-violet-400" />
                4. Sarana & Prasarana Sekolah (Sarpras)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Kondisi ruang kelas, laboratorium TIK, perpustakaan, toilet, dan fasilitas penunjang belajar.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddSarpras(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-semibold transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Fasilitas / Ruang</span>
            </button>
          </div>

          {/* Sarpras Overview Pills */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
              <span className="text-[11px] text-slate-400 font-medium">Total Fasilitas</span>
              <div className="text-lg font-bold text-white mt-0.5">{totalFasilitas} Unit</div>
            </div>
            <div className="bg-emerald-950/30 p-3 rounded-xl border border-emerald-800/40">
              <span className="text-[11px] text-emerald-400 font-medium">Kondisi Baik</span>
              <div className="text-lg font-bold text-emerald-300 mt-0.5">{totalBaik} Unit</div>
            </div>
            <div className="bg-amber-950/30 p-3 rounded-xl border border-amber-800/40">
              <span className="text-[11px] text-amber-400 font-medium">Rusak Ringan</span>
              <div className="text-lg font-bold text-amber-300 mt-0.5">{totalRusakR} Unit</div>
            </div>
            <div className="bg-rose-950/30 p-3 rounded-xl border border-rose-800/40">
              <span className="text-[11px] text-rose-400 font-medium">Rusak Berat</span>
              <div className="text-lg font-bold text-rose-300 mt-0.5">{totalRusakB} Unit</div>
            </div>
          </div>

          {/* Table */}
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-700">
                <tr>
                  <th className="py-3 px-3">No</th>
                  <th className="py-3 px-3">Nama Ruang / Fasilitas</th>
                  <th className="py-3 px-3 text-center">Jumlah</th>
                  <th className="py-3 px-3 text-center">Baik</th>
                  <th className="py-3 px-3 text-center">Rusak Ringan</th>
                  <th className="py-3 px-3 text-center">Rusak Berat</th>
                  <th className="py-3 px-3">Keterangan</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {formData.saranaPrasarana.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-3 px-3 font-semibold text-white">{item.nama}</td>
                    <td className="py-3 px-3 text-center font-bold text-slate-200">{item.jumlah}</td>
                    <td className="py-3 px-3 text-center text-emerald-400 font-medium">{item.kondisiBaik}</td>
                    <td className="py-3 px-3 text-center text-amber-400 font-medium">{item.kondisiRusakRingan}</td>
                    <td className="py-3 px-3 text-center text-rose-400 font-medium">{item.kondisiRusakBerat}</td>
                    <td className="py-3 px-3 text-slate-400 max-w-xs truncate">{item.keterangan || '-'}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteSarpras(item)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                        title="Hapus fasilitas"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </form>

      {/* Modal Tambah Sarpras */}
      {showAddSarpras && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-white mb-4">Tambah Sarana / Prasarana Baru</h3>
            <form onSubmit={handleAddSarpras} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Fasilitas / Ruang *</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Ruang Lab IPA / Alat Peraga"
                  value={newSarprasNama}
                  onChange={(e) => setNewSarprasNama(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Jumlah Total *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newSarprasJumlah}
                    onChange={(e) => setNewSarprasJumlah(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-400 mb-1">Kondisi Baik</label>
                  <input
                    type="number"
                    min="0"
                    value={newSarprasBaik}
                    onChange={(e) => setNewSarprasBaik(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-amber-400 mb-1">Rusak Ringan</label>
                  <input
                    type="number"
                    min="0"
                    value={newSarprasRusakR}
                    onChange={(e) => setNewSarprasRusakR(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-rose-400 mb-1">Rusak Berat</label>
                  <input
                    type="number"
                    min="0"
                    value={newSarprasRusakB}
                    onChange={(e) => setNewSarprasRusakB(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Keterangan / Spesifikasi</label>
                <textarea
                  rows={2}
                  placeholder="Catatan kondisi atau kelengkapan..."
                  value={newSarprasKet}
                  onChange={(e) => setNewSarprasKet(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddSarpras(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-md shadow-violet-600/30"
                >
                  Simpan Sarpras
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Delete Modal */}
      <ConfirmDeleteModal 
        state={deleteConfirmState} 
        onClose={closeDeleteConfirm} 
      />
    </div>
  );
};
