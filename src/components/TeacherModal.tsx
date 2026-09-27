import React, { useState, useEffect, useRef } from 'react';
import { Teacher, Gender, EmploymentStatus, TeacherRole } from '../types';
import { X, UserPlus, Check, Save, Camera, Upload, Trash2, Image, Sparkles, User, Link as LinkIcon } from 'lucide-react';
import { ConfirmDeleteModal, ConfirmDeleteState } from './ConfirmDeleteModal';

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (teacher: Teacher) => void;
  teacherToEdit?: Teacher | null;
}

const AVATAR_PRESETS = [
  {
    name: 'Pria Formal 1',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    gender: 'L'
  },
  {
    name: 'Pria Formal 2',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    gender: 'L'
  },
  {
    name: 'Kepala Sekolah (Senior)',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    gender: 'L'
  },
  {
    name: 'Wanita Formal 1',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    gender: 'P'
  },
  {
    name: 'Wanita Formal 2',
    url: 'https://images.unsplash.com/photo-1580894732444-8ecded7900cd?w=300&auto=format&fit=crop&q=80',
    gender: 'P'
  },
  {
    name: 'Wanita Formal 3',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    gender: 'P'
  },
];

export const TeacherModal: React.FC<TeacherModalProps> = ({
  isOpen,
  onClose,
  onSave,
  teacherToEdit
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleRemovePhoto = () => {
    openDeleteConfirm({
      title: 'Hapus Foto Profil Guru',
      itemName: formData.namaLengkap ? `${formData.namaLengkap} (${formData.jabatan || 'Guru'})` : 'Foto Profil Pendidik',
      description: 'Apakah Anda yakin ingin menghapus foto profil guru/GTK ini? Foto akan kembali ke inisial default.',
      confirmButtonText: 'Ya, Hapus Foto',
      onConfirm: () => {
        setFormData(prev => ({ ...prev, fotoUrl: '' }));
        setCustomUrlInput('');
      }
    });
  };

  const [formData, setFormData] = useState<Partial<Teacher>>({
    nip: '',
    nuptk: '',
    namaLengkap: '',
    gelar: 'S.Pd.',
    jenisKelamin: 'L',
    tempatLahir: '',
    tanggalLahir: '1990-01-01',
    pendidikanTerakhir: 'S1',
    jurusan: 'PGSD',
    jabatan: 'Guru Kelas 1',
    penugasanKelas: 'Kelas 1A',
    statusKepegawaian: 'PNS',
    golonganRuang: 'III/a',
    sertifikasi: true,
    noHp: '',
    email: '',
    alamat: '',
    tmtKerja: new Date().toISOString().slice(0, 10),
    statusAktif: true,
    fotoUrl: ''
  });

  useEffect(() => {
    if (teacherToEdit) {
      setFormData(teacherToEdit);
      setCustomUrlInput(teacherToEdit.fotoUrl || '');
    } else {
      setFormData({
        nip: '',
        nuptk: '',
        namaLengkap: '',
        gelar: 'S.Pd.',
        jenisKelamin: 'L',
        tempatLahir: '',
        tanggalLahir: '1990-01-01',
        pendidikanTerakhir: 'S1',
        jurusan: 'PGSD',
        jabatan: 'Guru Kelas 1',
        penugasanKelas: 'Kelas 1A',
        statusKepegawaian: 'PNS',
        golonganRuang: 'III/a',
        sertifikasi: true,
        noHp: '',
        email: '',
        alamat: '',
        tmtKerja: new Date().toISOString().slice(0, 10),
        statusAktif: true,
        fotoUrl: ''
      });
      setCustomUrlInput('');
    }
    setShowPresets(false);
    setShowUrlInput(false);
  }, [teacherToEdit, isOpen]);

  if (!isOpen) return null;

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 360;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round((height * MAX_SIZE) / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round((width * MAX_SIZE) / height);
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setFormData(prev => ({ ...prev, fotoUrl: dataUrl }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processImageFile(files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaLengkap?.trim()) return;

    const teacherToSave: Teacher = {
      id: teacherToEdit ? teacherToEdit.id : `guru-${Date.now()}`,
      nip: formData.nip?.trim() || '-',
      nuptk: formData.nuptk?.trim() || '-',
      namaLengkap: formData.namaLengkap.trim(),
      gelar: formData.gelar?.trim() || 'S.Pd.',
      jenisKelamin: (formData.jenisKelamin as Gender) || 'L',
      tempatLahir: formData.tempatLahir?.trim() || 'Depok',
      tanggalLahir: formData.tanggalLahir || '1990-01-01',
      pendidikanTerakhir: (formData.pendidikanTerakhir as Teacher['pendidikanTerakhir']) || 'S1',
      jurusan: formData.jurusan?.trim() || 'PGSD',
      jabatan: (formData.jabatan as TeacherRole) || 'Guru Kelas 1',
      penugasanKelas: formData.penugasanKelas?.trim() || 'Kelas 1A',
      statusKepegawaian: (formData.statusKepegawaian as EmploymentStatus) || 'PNS',
      golonganRuang: formData.golonganRuang?.trim() || '-',
      sertifikasi: Boolean(formData.sertifikasi),
      noHp: formData.noHp?.trim() || '08123456789',
      email: formData.email?.trim() || 'guru@sd.belajar.id',
      alamat: formData.alamat?.trim() || 'Alamat Sekolah',
      tmtKerja: formData.tmtKerja || new Date().toISOString().slice(0, 10),
      statusAktif: formData.statusAktif !== undefined ? formData.statusAktif : true,
      fotoUrl: formData.fotoUrl?.trim() || undefined
    };

    onSave(teacherToSave);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {teacherToEdit ? 'Edit Data Pendidik / GTK' : 'Tambah Guru & Tenaga Kependidikan'}
              </h3>
              <p className="text-xs text-slate-400">
                Lengkapi biodata dan informasi penugasan sekolah dasar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 pt-4 overflow-y-auto pr-1 flex-1">
          {/* Foto Profil Section */}
          <div className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {/* Photo Preview & Drop Zone */}
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative group cursor-pointer w-21 h-28 sm:w-24 sm:h-32 aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all flex items-center justify-center shrink-0 ${
                  isDragging 
                    ? 'border-emerald-400 bg-emerald-500/20 scale-105' 
                    : formData.fotoUrl 
                    ? 'border-emerald-500/50 bg-slate-900 shadow-md' 
                    : 'border-dashed border-slate-600 hover:border-emerald-400 bg-slate-900/80'
                }`}
              >
                {formData.fotoUrl ? (
                  <>
                    <img 
                      src={formData.fotoUrl} 
                      alt="Preview Foto Guru" 
                      className="w-full h-full object-cover object-top"
                      onError={() => setFormData(prev => ({ ...prev, fotoUrl: '' }))}
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-1 text-center">
                      <Camera className="w-5 h-5 mb-0.5" />
                      <span className="text-[10px] font-semibold">Ganti Foto</span>
                      <span className="text-[9px] text-emerald-300 font-mono">3 : 4</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-2">
                    <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/20 mx-auto flex items-center justify-center transition-colors mb-1">
                      <Camera className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-300 block leading-tight">
                      + Pas Foto
                    </span>
                    <span className="text-[9px] text-emerald-400 font-mono font-semibold block mt-0.5">
                      3 : 4
                    </span>
                  </div>
                )}
              </div>

              {/* Photo Controls & Helpers */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <label className="block text-xs font-bold text-slate-200">
                    Foto Profil Guru / GTK (Rasio 3:4)
                  </label>
                  {formData.fotoUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium hover:underline"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Hapus Foto
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Format Pas Foto Resmi Rasio 3:4 (JPG, PNG, WEBP). Tersedia opsi unggah dari galeri, tautan URL, atau sampel avatar instan.
                </p>

                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                {/* Button Action Bar */}
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Pilih File Foto
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowPresets(!showPresets);
                      setShowUrlInput(false);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      showPresets 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Sampel Avatar
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUrlInput(!showUrlInput);
                      setShowPresets(false);
                    }}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                      showUrlInput 
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
                    Link URL
                  </button>
                </div>

                {/* Preset Avatar Picker Grid */}
                {showPresets && (
                  <div className="mt-3 p-3 bg-slate-900 border border-slate-700/70 rounded-xl animate-in fade-in zoom-in-95">
                    <div className="text-[11px] font-semibold text-slate-300 mb-2 flex items-center justify-between">
                      <span>Pilih Foto Avatar Guru:</span>
                      <button 
                        type="button" 
                        onClick={() => setShowPresets(false)}
                        className="text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {AVATAR_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, fotoUrl: preset.url }));
                            setShowPresets(false);
                          }}
                          className={`group relative rounded-xl overflow-hidden border-2 transition-all p-0.5 ${
                            formData.fotoUrl === preset.url
                              ? 'border-emerald-400 ring-2 ring-emerald-400/30'
                              : 'border-slate-700 hover:border-emerald-400/60'
                          }`}
                          title={preset.name}
                        >
                          <img 
                            src={preset.url} 
                            alt={preset.name} 
                            className="w-full h-14 object-cover rounded-lg"
                          />
                          <span className="text-[9px] text-slate-300 block truncate mt-1 text-center font-medium">
                            {preset.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom URL Input */}
                {showUrlInput && (
                  <div className="mt-3 p-3 bg-slate-900 border border-slate-700/70 rounded-xl flex items-center gap-2 animate-in fade-in zoom-in-95">
                    <input
                      type="url"
                      placeholder="https://contoh.com/foto-guru.jpg"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customUrlInput.trim()) {
                          setFormData(prev => ({ ...prev, fotoUrl: customUrlInput.trim() }));
                          setShowUrlInput(false);
                        }
                      }}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shrink-0"
                    >
                      Pasang
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Nama & Gelar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nama Lengkap & Gelar *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Dra. Siti Aminah, M.Pd."
                value={formData.namaLengkap}
                onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Gelar Utama</label>
              <input
                type="text"
                placeholder="S.Pd. / M.Pd."
                value={formData.gelar}
                onChange={(e) => setFormData({ ...formData, gelar: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* NIP & NUPTK */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                NIP (18 Digit / Kosongkan jika Non-PNS)
              </label>
              <input
                type="text"
                placeholder="198001012005011001"
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                NUPTK (16 Digit)
              </label>
              <input
                type="text"
                placeholder="3447760662200003"
                value={formData.nuptk}
                onChange={(e) => setFormData({ ...formData, nuptk: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>
          </div>

          {/* Jenis Kelamin, Lahir */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Jenis Kelamin *</label>
              <select
                value={formData.jenisKelamin}
                onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value as Gender })}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="L">Laki-laki (L)</option>
                <option value="P">Perempuan (P)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tempat Lahir</label>
              <input
                type="text"
                placeholder="Kota Kelahiran"
                value={formData.tempatLahir}
                onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tanggal Lahir</label>
              <input
                type="date"
                value={formData.tanggalLahir}
                onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Jabatan & Penugasan Kelas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Jabatan / Peran Utama *</label>
              <select
                value={formData.jabatan}
                onChange={(e) => setFormData({ ...formData, jabatan: e.target.value as TeacherRole })}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="Kepala Sekolah">Kepala Sekolah</option>
                <option value="Guru Kelas 1">Guru Kelas 1</option>
                <option value="Guru Kelas 2">Guru Kelas 2</option>
                <option value="Guru Kelas 3">Guru Kelas 3</option>
                <option value="Guru Kelas 4">Guru Kelas 4</option>
                <option value="Guru Kelas 5">Guru Kelas 5</option>
                <option value="Guru Kelas 6">Guru Kelas 6</option>
                <option value="Guru PJOK">Guru PJOK (Penjas)</option>
                <option value="Guru PAI">Guru Pend. Agama Islam (PAI)</option>
                <option value="Guru Bahasa Inggris">Guru Bahasa Inggris</option>
                <option value="Guru Bahasa Daerah">Guru Bahasa Daerah</option>
                <option value="Guru Seni Budaya">Guru Seni Budaya</option>
                <option value="Tenaga Administrasi">Tenaga Administrasi / TU</option>
                <option value="Pustakawan">Pustakawan</option>
                <option value="Operator Dapodik">Operator Dapodik</option>
                <option value="Penjaga Sekolah">Penjaga Sekolah</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Penugasan Kelas / Ruang</label>
              <input
                type="text"
                placeholder="Contoh: Kelas 1A / Kelas 4-6 / -"
                value={formData.penugasanKelas}
                onChange={(e) => setFormData({ ...formData, penugasanKelas: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Status Kepegawaian, Golongan, Sertifikasi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Status Kepegawaian</label>
              <select
                value={formData.statusKepegawaian}
                onChange={(e) => setFormData({ ...formData, statusKepegawaian: e.target.value as EmploymentStatus })}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="PNS">PNS (Pegawai Negeri Sipil)</option>
                <option value="PPPK">PPPK (P3K Penuh Waktu)</option>
                <option value="PPPK PW">PPPK PW (P3K Paruh Waktu)</option>
                <option value="GTT / Honorer">GTT (Guru Tidak Tetap / Honorer)</option>
                <option value="PTT (Honorer)">PTT (Pegawai Tidak Tetap / Honorer)</option>
                <option value="Guru Tetap Yayasan">GTY (Guru Tetap Yayasan)</option>
                <option value="GTTY (Guru Tidak Tetap Yayasan)">GTTY (Guru Tidak Tetap Yayasan)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Pangkat & Golongan / Ruang</label>
              <select
                value={formData.golonganRuang || '-'}
                onChange={(e) => setFormData({ ...formData, golonganRuang: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="-">- (Non-PNS / Non-Golongan)</option>
                <optgroup label="Golongan IV (Pembina / PNS)">
                  <option value="IV/e">IV/e (Pembina Utama)</option>
                  <option value="IV/d">IV/d (Pembina Utama Madya)</option>
                  <option value="IV/c">IV/c (Pembina Utama Muda)</option>
                  <option value="IV/b">IV/b (Pembina Tingkat I)</option>
                  <option value="IV/a">IV/a (Pembina)</option>
                </optgroup>
                <optgroup label="Golongan III (Penata / PNS)">
                  <option value="III/d">III/d (Penata Tingkat I)</option>
                  <option value="III/c">III/c (Penata)</option>
                  <option value="III/b">III/b (Penata Muda Tingkat I)</option>
                  <option value="III/a">III/a (Penata Muda)</option>
                </optgroup>
                <optgroup label="Golongan II (Pengatur / PNS)">
                  <option value="II/d">II/d (Pengatur Tingkat I)</option>
                  <option value="II/c">II/c (Pengatur)</option>
                  <option value="II/b">II/b (Pengatur Muda Tingkat I)</option>
                  <option value="II/a">II/a (Pengatur Muda)</option>
                </optgroup>
                <optgroup label="Golongan I (Juru / PNS)">
                  <option value="I/d">I/d (Juru Tingkat I)</option>
                  <option value="I/c">I/c (Juru)</option>
                  <option value="I/b">I/b (Juru Muda Tingkat I)</option>
                  <option value="I/a">I/a (Juru Muda)</option>
                </optgroup>
                <optgroup label="Golongan PPPK (P3K)">
                  <option value="IX">Golongan IX (PPPK - S1)</option>
                  <option value="X">Golongan X (PPPK - S2)</option>
                  <option value="XI">Golongan XI (PPPK)</option>
                  <option value="VII">Golongan VII (PPPK - D3)</option>
                  <option value="V">Golongan V (PPPK - SMA)</option>
                </optgroup>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Sertifikasi Pendidik</label>
              <select
                value={formData.sertifikasi ? 'true' : 'false'}
                onChange={(e) => setFormData({ ...formData, sertifikasi: e.target.value === 'true' })}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="true">Sudah Sertifikasi</option>
                <option value="false">Belum Sertifikasi</option>
              </select>
            </div>
          </div>

          {/* Pendidikan & Jurusan */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Pendidikan Terakhir</label>
              <select
                value={formData.pendidikanTerakhir}
                onChange={(e) => setFormData({ ...formData, pendidikanTerakhir: e.target.value as Teacher['pendidikanTerakhir'] })}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="SD">SD / Sederajat</option>
                <option value="SMP">SMP / MTs / Sederajat</option>
                <option value="SMA/SMK">SMA / SMK / MA / Sederajat</option>
                <option value="D1">D1 (Diploma 1)</option>
                <option value="D2">D2 (Diploma 2)</option>
                <option value="D3">D3 (Diploma 3)</option>
                <option value="D4">D4 (Diploma 4)</option>
                <option value="S1">S1 (Sarjana)</option>
                <option value="S2">S2 (Magister)</option>
                <option value="S3">S3 (Doktor)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Program Studi / Jurusan</label>
              <input
                type="text"
                placeholder="PGSD / Pend. Matematika / dsb"
                value={formData.jurusan}
                onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Kontak & Alamat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">No. WhatsApp / HP</label>
              <input
                type="text"
                placeholder="081234567890"
                value={formData.noHp}
                onChange={(e) => setFormData({ ...formData, noHp: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
              <input
                type="email"
                placeholder="nama@guru.sd.belajar.id"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Alamat Tempat Tinggal</label>
            <input
              type="text"
              placeholder="Jl. / RT / RW / Kelurahan / Kecamatan"
              value={formData.alamat}
              onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
              className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/30 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{teacherToEdit ? 'Simpan Perubahan' : 'Tambah Guru'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Delete Modal for Teacher Photo */}
      <ConfirmDeleteModal 
        state={deleteConfirmState} 
        onClose={closeDeleteConfirm} 
      />
    </div>
  );
};
