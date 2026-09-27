import React, { useState, useEffect, useRef } from 'react';
import { Student, Gender, ClassGrade, StudentStatus, Religion, ClassRoomItem } from '../types';
import { 
  X, 
  Save, 
  GraduationCap, 
  Camera, 
  Upload, 
  Trash2, 
  Link as LinkIcon, 
  Sparkles,
  User,
  MapPin,
  Users,
  School,
  HeartPulse,
  FileText,
  Copy,
  Info,
  Calendar,
  Phone,
  BookOpen
} from 'lucide-react';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
  studentToEdit?: Student | null;
  defaultClass?: ClassGrade;
  classes?: ClassRoomItem[];
}

interface StudentAvatarPreset {
  name: string;
  url: string;
  gender: 'L' | 'P';
}

const STUDENT_AVATAR_PRESETS: StudentAvatarPreset[] = [
  {
    name: 'Siswa SD 1 (L)',
    url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=300&auto=format&fit=crop&q=80',
    gender: 'L'
  },
  {
    name: 'Siswa SD 2 (L)',
    url: 'https://images.unsplash.com/photo-1595454223600-91fbdd7753e1?w=300&auto=format&fit=crop&q=80',
    gender: 'L'
  },
  {
    name: 'Siswa SD 3 (L)',
    url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=300&auto=format&fit=crop&q=80',
    gender: 'L'
  },
  {
    name: 'Siswi SD 1 (P)',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80',
    gender: 'P'
  },
  {
    name: 'Siswi SD 2 (P)',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    gender: 'P'
  },
  {
    name: 'Siswi SD 3 (P)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    gender: 'P'
  }
];

type ActiveTab = 'all' | 'identitas' | 'alamat' | 'ortu' | 'sekolah' | 'fisik';

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  studentToEdit,
  defaultClass = '1A',
  classes = []
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showPresets, setShowPresets] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [hasWali, setHasWali] = useState(false);

  const [formData, setFormData] = useState<Partial<Student>>({
    nis: '',
    nisn: '',
    namaLengkap: '',
    namaPanggilan: '',
    jenisKelamin: 'L',
    kelas: defaultClass,
    tempatLahir: 'Depok',
    tanggalLahir: '2018-05-10',
    agama: 'Islam',
    pendidikanSebelumnya: 'TK / PAUD / RA',
    namaAyah: '',
    pekerjaanAyah: 'Wiraswasta',
    namaIbu: '',
    pekerjaanIbu: 'Ibu Rumah Tangga',
    alamatOrtu: '',
    noHpOrtu: '',
    namaWali: '',
    pekerjaanWali: '',
    alamatWali: '',
    hubunganWali: '',
    noHpWali: '',
    alamat: '',
    rtRw: '01/02',
    kelurahan: 'Mekar Jaya',
    kecamatan: 'Cimanggis',
    kabupatenKota: 'Kota Depok',
    provinsi: 'Jawa Barat',
    kodePos: '',
    statusSiswa: 'Aktif',
    diterimaDiKelas: defaultClass,
    tanggalMasuk: new Date().toISOString().slice(0, 10),
    anakKe: 1,
    jumlahSaudara: 1,
    catatanPrestasi: '',
    catatanKesehatan: '',
    tinggiBadan: undefined,
    beratBadan: undefined,
    sekolahTujuan: '',
    tanggalMutasi: '',
    alasanKeluar: '',
    tanggalKeluar: '',
    fotoUrl: ''
  });

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        ...studentToEdit,
        pendidikanSebelumnya: studentToEdit.pendidikanSebelumnya || 'TK / PAUD / RA',
        alamatOrtu: studentToEdit.alamatOrtu || studentToEdit.alamat || '',
        rtRw: studentToEdit.rtRw || '',
        kelurahan: studentToEdit.kelurahan || '',
        kecamatan: studentToEdit.kecamatan || '',
        kabupatenKota: studentToEdit.kabupatenKota || '',
        provinsi: studentToEdit.provinsi || '',
        kodePos: studentToEdit.kodePos || '',
        namaWali: studentToEdit.namaWali || '',
        pekerjaanWali: studentToEdit.pekerjaanWali || '',
        alamatWali: studentToEdit.alamatWali || '',
        hubunganWali: studentToEdit.hubunganWali || '',
        noHpWali: studentToEdit.noHpWali || '',
        diterimaDiKelas: studentToEdit.diterimaDiKelas || studentToEdit.kelas || defaultClass,
        fotoUrl: studentToEdit.fotoUrl || ''
      });
      setHasWali(Boolean(studentToEdit.namaWali && studentToEdit.namaWali.trim().length > 0));
      setCustomUrlInput(studentToEdit.fotoUrl || '');
    } else {
      const randomNis = `2025${Math.floor(100 + Math.random() * 900)}`;
      const randomNisn = `318${Math.floor(1000000 + Math.random() * 9000000)}`;
      setFormData({
        nis: randomNis,
        nisn: randomNisn,
        namaLengkap: '',
        namaPanggilan: '',
        jenisKelamin: 'L',
        kelas: defaultClass,
        tempatLahir: 'Depok',
        tanggalLahir: '2018-05-10',
        agama: 'Islam',
        pendidikanSebelumnya: 'TK / PAUD / RA',
        namaAyah: '',
        pekerjaanAyah: 'Wiraswasta',
        namaIbu: '',
        pekerjaanIbu: 'Ibu Rumah Tangga',
        alamatOrtu: '',
        noHpOrtu: '',
        namaWali: '',
        pekerjaanWali: '',
        alamatWali: '',
        hubunganWali: '',
        noHpWali: '',
        alamat: '',
        rtRw: '01/02',
        kelurahan: 'Mekar Jaya',
        kecamatan: 'Cimanggis',
        kabupatenKota: 'Kota Depok',
        provinsi: 'Jawa Barat',
        kodePos: '',
        statusSiswa: 'Aktif',
        diterimaDiKelas: defaultClass,
        tanggalMasuk: new Date().toISOString().slice(0, 10),
        anakKe: 1,
        jumlahSaudara: 1,
        catatanPrestasi: '',
        catatanKesehatan: 'Pendengaran, penglihatan, dan gigi dalam kondisi baik.',
        tinggiBadan: undefined,
        beratBadan: undefined,
        sekolahTujuan: '',
        tanggalMutasi: '',
        alasanKeluar: '',
        tanggalKeluar: '',
        fotoUrl: ''
      });
      setHasWali(false);
      setCustomUrlInput('');
    }
    setShowPresets(false);
    setShowUrlInput(false);
  }, [studentToEdit, defaultClass, isOpen]);

  if (!isOpen) return null;

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Standar rasio pas foto resmi Indonesia 3:4 (lebar:tinggi = 3:4)
        const targetRatio = 3 / 4;
        const inputRatio = img.width / img.height;
        let sx = 0;
        let sy = 0;
        let sWidth = img.width;
        let sHeight = img.height;

        if (inputRatio > targetRatio) {
          sWidth = Math.round(img.height * targetRatio);
          sx = Math.round((img.width - sWidth) / 2);
        } else {
          sHeight = Math.round(img.width / targetRatio);
          const diffY = img.height - sHeight;
          sy = Math.round(Math.max(0, diffY * 0.3));
        }

        const targetWidth = 360;
        const targetHeight = 480;
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetWidth, targetHeight);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setFormData(prev => ({ ...prev, fotoUrl: dataUrl }));
          setCustomUrlInput('');
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

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, fotoUrl: '' }));
    setCustomUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      setFormData(prev => ({ ...prev, fotoUrl: customUrlInput.trim() }));
      setShowUrlInput(false);
    }
  };

  const copyStudentAddressToParent = () => {
    if (formData.alamat) {
      setFormData(prev => ({ ...prev, alamatOrtu: prev.alamat }));
    }
  };

  const copyStudentAddressToWali = () => {
    if (formData.alamat) {
      setFormData(prev => ({ ...prev, alamatWali: prev.alamat }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaLengkap?.trim() || !formData.nisn?.trim()) return;

    const studentToSave: Student = {
      id: studentToEdit ? studentToEdit.id : `std-${Date.now()}`,
      nis: formData.nis?.trim() || '2025001',
      nisn: formData.nisn.trim(),
      namaLengkap: formData.namaLengkap.trim(),
      namaPanggilan: formData.namaPanggilan?.trim() || '',
      jenisKelamin: (formData.jenisKelamin as Gender) || 'L',
      kelas: (formData.kelas as ClassGrade) || defaultClass,
      tempatLahir: formData.tempatLahir?.trim() || 'Depok',
      tanggalLahir: formData.tanggalLahir || '2018-01-01',
      agama: (formData.agama as Religion) || 'Islam',
      pendidikanSebelumnya: formData.pendidikanSebelumnya?.trim() || 'TK / PAUD / RA',
      namaAyah: formData.namaAyah?.trim() || '-',
      pekerjaanAyah: formData.pekerjaanAyah?.trim() || '-',
      namaIbu: formData.namaIbu?.trim() || '-',
      pekerjaanIbu: formData.pekerjaanIbu?.trim() || '-',
      alamatOrtu: formData.alamatOrtu?.trim() || formData.alamat?.trim() || '',
      noHpOrtu: formData.noHpOrtu?.trim() || '08123456789',
      namaWali: hasWali ? formData.namaWali?.trim() || '' : '',
      pekerjaanWali: hasWali ? formData.pekerjaanWali?.trim() || '' : '',
      alamatWali: hasWali ? formData.alamatWali?.trim() || '' : '',
      hubunganWali: hasWali ? formData.hubunganWali?.trim() || '' : '',
      noHpWali: hasWali ? formData.noHpWali?.trim() || '' : '',
      alamat: formData.alamat?.trim() || 'Alamat Peserta Didik',
      rtRw: formData.rtRw?.trim() || '',
      kelurahan: formData.kelurahan?.trim() || '',
      kecamatan: formData.kecamatan?.trim() || '',
      kabupatenKota: formData.kabupatenKota?.trim() || '',
      provinsi: formData.provinsi?.trim() || '',
      kodePos: formData.kodePos?.trim() || '',
      statusSiswa: (formData.statusSiswa as StudentStatus) || 'Aktif',
      diterimaDiKelas: formData.diterimaDiKelas?.trim() || formData.kelas || defaultClass,
      tanggalMasuk: formData.tanggalMasuk || new Date().toISOString().slice(0, 10),
      anakKe: Number(formData.anakKe) || 1,
      jumlahSaudara: Number(formData.jumlahSaudara) || 1,
      tinggiBadan: formData.tinggiBadan ? Number(formData.tinggiBadan) : undefined,
      beratBadan: formData.beratBadan ? Number(formData.beratBadan) : undefined,
      catatanPrestasi: formData.catatanPrestasi?.trim() || '',
      catatanKesehatan: formData.catatanKesehatan?.trim() || '',
      sekolahTujuan: formData.sekolahTujuan?.trim() || '',
      tanggalMutasi: formData.tanggalMutasi || '',
      alasanKeluar: formData.alasanKeluar?.trim() || '',
      tanggalKeluar: formData.tanggalKeluar || '',
      fotoUrl: formData.fotoUrl?.trim() || undefined
    };

    onSave(studentToSave);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full p-5 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 my-6 max-h-[92vh] flex flex-col">
        {/* Header Modal */}
        <div className="flex items-start justify-between pb-3.5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500/15 text-violet-400 flex items-center justify-center shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-white">
                  {studentToEdit ? 'Edit Data Buku Induk Siswa' : 'Pendaftaran Siswa Baru (Buku Induk)'}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 uppercase tracking-wider">
                  Halaman 2 Rapor
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Format lengkap sesuai <strong>Halaman 2 Sampul Rapor</strong> (Keterangan tentang Diri Peserta Didik) &amp; Buku Induk Dapodik.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 cursor-pointer transition-colors"
            title="Tutup Form"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Shortcuts */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-2.5 border-b border-slate-800 shrink-0 text-xs no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Semua Kolom</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('identitas')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'identitas'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>1. Identitas &amp; Foto</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('alamat')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'alamat'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>2. Alamat Siswa</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ortu')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ortu'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>3. Orang Tua &amp; Wali</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sekolah')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'sekolah'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            <span>4. Pendaftaran &amp; Status</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('fisik')}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'fisik'
                ? 'bg-violet-600 text-white shadow-sm'
                : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <HeartPulse className="w-3.5 h-3.5" />
            <span>5. Fisik &amp; Kesehatan</span>
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="space-y-5 pt-3 overflow-y-auto pr-1 flex-1">
          {/* ================================================================ */}
          {/* SECTION 1: IDENTITAS PESERTA DIDIK & PAS FOTO 3:4               */}
          {/* ================================================================ */}
          {(activeTab === 'all' || activeTab === 'identitas') && (
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700/50 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-violet-600/30 text-violet-300 font-bold text-xs flex items-center justify-center">
                    1
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    Identitas Peserta Didik &amp; Pas Foto Resmi
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:inline">Poin 1 s.d. 7 Halaman 2 Rapor</span>
              </div>

              {/* Upload Pas Foto Siswa (Rasio 3:4 Resmi) */}
              <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Photo Preview & Drop Zone */}
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative group cursor-pointer w-24 h-32 sm:w-28 sm:h-[148px] aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all flex items-center justify-center shrink-0 shadow-md ${
                      isDragging 
                        ? 'border-violet-400 bg-violet-500/20 scale-105 ring-2 ring-violet-400/40' 
                        : formData.fotoUrl 
                        ? 'border-violet-500/60 bg-slate-900' 
                        : 'border-dashed border-slate-600 hover:border-violet-400 bg-slate-900/80 hover:bg-slate-800/80'
                    }`}
                    title="Klik atau seret file gambar untuk pas foto siswa (Rasio 3:4)"
                  >
                    {formData.fotoUrl ? (
                      <>
                        <img 
                          src={formData.fotoUrl} 
                          alt="Preview Foto Siswa" 
                          className="w-full h-full object-cover"
                          onError={() => setFormData(prev => ({ ...prev, fotoUrl: '' }))}
                        />
                        <div className="absolute top-1.5 right-1.5 bg-black/75 backdrop-blur-xs text-[9px] font-mono text-amber-300 px-1.5 py-0.5 rounded font-bold shadow-xs">
                          3:4
                        </div>
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2 text-center">
                          <Camera className="w-5 h-5 mb-1 text-violet-300" />
                          <span className="text-[10px] font-semibold">Ganti Foto</span>
                          <span className="text-[9px] text-slate-300 mt-0.5">Rasio 3:4</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-2 flex flex-col items-center justify-center h-full">
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 group-hover:text-violet-400 group-hover:bg-violet-500/20 mx-auto flex items-center justify-center transition-colors mb-1.5">
                          <Camera className="w-4 h-4" />
                        </div>
                        <span className="text-[11px] font-bold text-slate-200 block leading-tight">
                          + Pas Foto
                        </span>
                        <span className="text-[9px] font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded mt-1">
                          3 × 4 cm
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Photo Controls & Helpers */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <label className="block text-xs font-bold text-slate-200">
                          Pas Foto Siswa (Kotak Foto Halaman 2 Rapor)
                        </label>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                          Standar Rasio 3:4
                        </span>
                      </div>
                      {formData.fotoUrl && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium hover:underline cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Hapus Foto
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Unggah pas foto resmi siswa format JPG/PNG. Otomatis dipotong rapi ke rasio standar <strong>3×4 cm</strong> untuk dicetak pada Lembar Biodata Sampul Rapor.
                    </p>

                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                    />

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-xs font-semibold transition-colors cursor-pointer"
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
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                          showPresets 
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Contoh Foto Siswa
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowUrlInput(!showUrlInput);
                          setShowPresets(false);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                          showUrlInput 
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' 
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                      >
                        <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
                        Link URL
                      </button>
                    </div>

                    {/* Presets */}
                    {showPresets && (
                      <div className="mt-3 p-3 bg-slate-900 border border-slate-700/70 rounded-xl animate-in fade-in zoom-in-95">
                        <div className="text-[11px] font-semibold text-slate-300 mb-2 flex items-center justify-between">
                          <span>Pilih Contoh Pas Foto Siswa:</span>
                          <button 
                            type="button" 
                            onClick={() => setShowPresets(false)}
                            className="text-slate-400 hover:text-white cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                          {STUDENT_AVATAR_PRESETS.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setFormData(prev => ({ ...prev, fotoUrl: preset.url }));
                                setShowPresets(false);
                              }}
                              className={`group relative rounded-xl overflow-hidden border-2 transition-all p-0.5 cursor-pointer ${
                                formData.fotoUrl === preset.url
                                  ? 'border-violet-400 ring-2 ring-violet-400/30'
                                  : 'border-slate-700 hover:border-violet-400/60'
                              }`}
                              title={preset.name}
                            >
                              <img 
                                src={preset.url} 
                                alt={preset.name} 
                                className="w-full aspect-[3/4] object-cover rounded-lg"
                              />
                              <span className="text-[9px] text-slate-300 block truncate mt-1 text-center font-medium">
                                {preset.name}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Custom URL */}
                    {showUrlInput && (
                      <div className="mt-3 p-3 bg-slate-900 border border-slate-700/70 rounded-xl flex items-center gap-2 animate-in fade-in zoom-in-95">
                        <input
                          type="url"
                          placeholder="https://contoh.com/foto-siswa.jpg"
                          value={customUrlInput}
                          onChange={(e) => setCustomUrlInput(e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCustomUrl}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Terapkan
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Poin 1: Nama Lengkap & Panggilan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    1. Nama Peserta Didik (Lengkap Sesuai Akta Lahir) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Rizky Pratama"
                    value={formData.namaLengkap ?? ''}
                    onChange={(e) => setFormData({ ...formData, namaLengkap: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nama Panggilan</label>
                  <input
                    type="text"
                    placeholder="Rizky"
                    value={formData.namaPanggilan ?? ''}
                    onChange={(e) => setFormData({ ...formData, namaPanggilan: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Poin 2 & 3: NIS & NISN & Kelas */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    2. Nomor Induk Siswa (NIS) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="2025001"
                    value={formData.nis ?? ''}
                    onChange={(e) => setFormData({ ...formData, nis: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    3. NISN (10 Digit Nasional) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="3184920191"
                    value={formData.nisn ?? ''}
                    onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Kelas Saat Ini *</label>
                  <select
                    value={formData.kelas ?? defaultClass}
                    onChange={(e) => setFormData({ ...formData, kelas: e.target.value as ClassGrade })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500 font-semibold text-violet-300"
                  >
                    {classes.length > 0 ? (
                      classes.map(c => (
                        <option key={c.id || c.nama} value={c.nama}>Kelas {c.nama}</option>
                      ))
                    ) : (
                      ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'].map(cls => (
                        <option key={cls} value={cls}>Kelas {cls}</option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Poin 4, 5, 6: Gender, Tempat Lahir, Tgl Lahir, Agama */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    5. Jenis Kelamin *
                  </label>
                  <select
                    value={formData.jenisKelamin ?? 'L'}
                    onChange={(e) => setFormData({ ...formData, jenisKelamin: e.target.value as Gender })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500 font-medium"
                  >
                    <option value="L">Laki-laki (L)</option>
                    <option value="P">Perempuan (P)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    4.a. Tempat Lahir
                  </label>
                  <input
                    type="text"
                    placeholder="Kota Lahir (Depok)"
                    value={formData.tempatLahir ?? ''}
                    onChange={(e) => setFormData({ ...formData, tempatLahir: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    4.b. Tanggal Lahir
                  </label>
                  <input
                    type="date"
                    value={formData.tanggalLahir ?? '2018-01-01'}
                    onChange={(e) => setFormData({ ...formData, tanggalLahir: e.target.value })}
                    className="w-full px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    6. Agama &amp; Kepercayaan
                  </label>
                  <select
                    value={formData.agama ?? 'Islam'}
                    onChange={(e) => setFormData({ ...formData, agama: e.target.value as Religion })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500 font-medium"
                  >
                    <option value="Islam">Islam</option>
                    <option value="Kristen">Kristen</option>
                    <option value="Katolik">Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>
              </div>

              {/* Poin 7: Pendidikan Sebelumnya & Status Keluarga */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-300">
                      7. Pendidikan Sebelumnya (Asal TK / PAUD / RA)
                    </label>
                    <span className="text-[10px] text-violet-300">Tercetak di Biodata Rapor</span>
                  </div>
                  <input
                    type="text"
                    placeholder="Contoh: TK Pertiwi / PAUD Melati / RA Al-Ikhlas"
                    value={formData.pendidikanSebelumnya ?? ''}
                    onChange={(e) => setFormData({ ...formData, pendidikanSebelumnya: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500"
                  />
                  {/* Quick suggestions */}
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    <span className="text-[10px] text-slate-400">Pilihan cepat:</span>
                    {['TK / PAUD / RA', 'TK Pertiwi', 'PAUD Melati', 'RA Al-Hikmah', 'Belum Pernah TK'].map(preset => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setFormData({ ...formData, pendidikanSebelumnya: preset })}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 cursor-pointer transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Anak ke- &amp; Jumlah Saudara
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <input
                        type="number"
                        min={1}
                        placeholder="Ke-1"
                        value={formData.anakKe ?? 1}
                        onChange={(e) => setFormData({ ...formData, anakKe: Number(e.target.value) || 1 })}
                        className="w-full px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white text-center focus:outline-none focus:border-violet-500"
                        title="Anak ke berapa"
                      />
                      <span className="text-[9px] text-slate-400 block text-center mt-0.5">Anak ke-</span>
                    </div>
                    <div>
                      <input
                        type="number"
                        min={1}
                        placeholder="Dari 1"
                        value={formData.jumlahSaudara ?? 1}
                        onChange={(e) => setFormData({ ...formData, jumlahSaudara: Number(e.target.value) || 1 })}
                        className="w-full px-2.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white text-center focus:outline-none focus:border-violet-500"
                        title="Jumlah saudara kandung"
                      />
                      <span className="text-[9px] text-slate-400 block text-center mt-0.5">Bersaudara</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* SECTION 2: KETERANGAN TEMPAT TINGGAL (POIN 8 HALAMAN 2)         */}
          {/* ================================================================ */}
          {(activeTab === 'all' || activeTab === 'alamat') && (
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-700/50 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600/30 text-emerald-300 font-bold text-xs flex items-center justify-center">
                    2
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    8. Alamat Tempat Tinggal Peserta Didik
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:inline">Poin 8.a s.d. 8.e Halaman 2 Rapor</span>
              </div>

              {/* Jalan / Alamat Utama */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  8. Alamat Jalan / Perumahan / No. Rumah *
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Kamboja No. 12 / Perum Griya Asri Blok C-4"
                  value={formData.alamat ?? ''}
                  onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Sub-item Alamat: RT/RW, Kelurahan, Kecamatan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    8.a. RT / RW
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 02 / 04 atau 002/004"
                    value={formData.rtRw ?? ''}
                    onChange={(e) => setFormData({ ...formData, rtRw: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    8.b. Kelurahan / Desa
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Mekar Jaya"
                    value={formData.kelurahan ?? ''}
                    onChange={(e) => setFormData({ ...formData, kelurahan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    8.c. Kecamatan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Cimanggis"
                    value={formData.kecamatan ?? ''}
                    onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Sub-item Alamat: Kabupaten/Kota, Provinsi, Kode Pos */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    8.d. Kabupaten / Kota
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Kota Depok / Kab. Bogor"
                    value={formData.kabupatenKota ?? ''}
                    onChange={(e) => setFormData({ ...formData, kabupatenKota: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    8.e. Provinsi
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Jawa Barat / Jawa Timur"
                    value={formData.provinsi ?? ''}
                    onChange={(e) => setFormData({ ...formData, provinsi: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kode Pos (Opsional)
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="Contoh: 16411"
                    value={formData.kodePos ?? ''}
                    onChange={(e) => setFormData({ ...formData, kodePos: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* SECTION 3: DATA ORANG TUA KANDUNG & WALI (POIN 9 & 10)          */}
          {/* ================================================================ */}
          {(activeTab === 'all' || activeTab === 'ortu') && (
            <div className="space-y-4">
              {/* Poin 9: Data Orang Tua Kandung */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-700/50 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-blue-600/30 text-blue-300 font-bold text-xs flex items-center justify-center">
                      3
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                      9. Data Orang Tua Kandung
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">Poin 9.a s.d. 9.f Halaman 2 Rapor</span>
                </div>

                {/* Ayah Kandung */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      9.a. Nama Lengkap Ayah Kandung *
                    </label>
                    <input
                      type="text"
                      placeholder="Nama Lengkap Ayah"
                      value={formData.namaAyah ?? ''}
                      onChange={(e) => setFormData({ ...formData, namaAyah: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      9.b. Pekerjaan Ayah
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: PNS / Karyawan Swasta / Wiraswasta / Petani"
                      value={formData.pekerjaanAyah ?? ''}
                      onChange={(e) => setFormData({ ...formData, pekerjaanAyah: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Ibu Kandung */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      9.c. Nama Lengkap Ibu Kandung *
                    </label>
                    <input
                      type="text"
                      placeholder="Nama Lengkap Ibu"
                      value={formData.namaIbu ?? ''}
                      onChange={(e) => setFormData({ ...formData, namaIbu: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      9.d. Pekerjaan Ibu
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Ibu Rumah Tangga / Guru / PNS / Wiraswasta"
                      value={formData.pekerjaanIbu ?? ''}
                      onChange={(e) => setFormData({ ...formData, pekerjaanIbu: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Alamat Orang Tua & Kontak No HP */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-300">
                        9.e. Alamat Tempat Tinggal Orang Tua
                      </label>
                      <button
                        type="button"
                        onClick={copyStudentAddressToParent}
                        className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer font-medium hover:underline"
                        title="Salin alamat yang sudah diketik di data siswa"
                      >
                        <Copy className="w-3 h-3" />
                        Sama dengan alamat siswa
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Alamat domisili orang tua (kosongkan jika sama dengan siswa)"
                      value={formData.alamatOrtu ?? ''}
                      onChange={(e) => setFormData({ ...formData, alamatOrtu: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      9.f. No. Telepon / WhatsApp Orang Tua *
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="081234567890"
                        value={formData.noHpOrtu ?? ''}
                        onChange={(e) => setFormData({ ...formData, noHpOrtu: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Poin 10: Data Wali Peserta Didik */}
              <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-700/50 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-600/30 text-amber-300 font-bold text-xs flex items-center justify-center">
                      4
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                      10. Data Wali Peserta Didik
                    </h4>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasWali}
                      onChange={(e) => setHasWali(e.target.checked)}
                      className="rounded border-slate-700 text-amber-500 focus:ring-amber-500/20 w-4 h-4"
                    />
                    <span className="text-xs text-amber-300 font-medium">
                      Siswa Memiliki / Tinggal Bersama Wali
                    </span>
                  </label>
                </div>

                {hasWali ? (
                  <div className="space-y-3 animate-in fade-in">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          10.a. Nama Lengkap Wali Siswa *
                        </label>
                        <input
                          type="text"
                          placeholder="Nama Lengkap Wali"
                          value={formData.namaWali ?? ''}
                          onChange={(e) => setFormData({ ...formData, namaWali: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          10.b. Hubungan Keluarga dengan Siswa
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: Kakek / Nenek / Paman / Tante / Kakak Kandung / Wali Asuh"
                          value={formData.hubunganWali ?? ''}
                          onChange={(e) => setFormData({ ...formData, hubunganWali: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          10.c. Pekerjaan Wali
                        </label>
                        <input
                          type="text"
                          placeholder="Contoh: Wiraswasta / Pensiunan / PNS"
                          value={formData.pekerjaanWali ?? ''}
                          onChange={(e) => setFormData({ ...formData, pekerjaanWali: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-semibold text-slate-300">
                            10.d. Alamat Tempat Tinggal Wali
                          </label>
                          <button
                            type="button"
                            onClick={copyStudentAddressToWali}
                            className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer font-medium hover:underline"
                          >
                            <Copy className="w-3 h-3" />
                            Sama dengan alamat siswa
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="Jl. / RT / RW / No. Rumah Wali"
                          value={formData.alamatWali ?? ''}
                          onChange={(e) => setFormData({ ...formData, alamatWali: e.target.value })}
                          className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        10.e. Nomor Telepon / HP Wali
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          placeholder="081234567890"
                          value={formData.noHpWali ?? ''}
                          onChange={(e) => setFormData({ ...formData, noHpWali: e.target.value })}
                          className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic bg-slate-800/40 p-3 rounded-xl border border-slate-700/40">
                    Siswa tidak tinggal bersama wali (tinggal bersama orang tua kandung). Centang opsi di atas bila siswa memiliki wali untuk mencatat data wali pada Halaman 2 Rapor.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ================================================================ */}
          {/* SECTION 4: DITERIMA DI SEKOLAH INI & STATUS SISWA (POIN 11)     */}
          {/* ================================================================ */}
          {(activeTab === 'all' || activeTab === 'sekolah') && (
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-700/50 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-300 font-bold text-xs flex items-center justify-center">
                    5
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    11. Diterima di Sekolah Ini &amp; Status Keaktifan
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:inline">Poin 11.a s.d. 11.b Halaman 2 Rapor</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    11.a. Diterima di Kelas *
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 1A atau 1"
                    value={formData.diterimaDiKelas ?? formData.kelas ?? defaultClass}
                    onChange={(e) => setFormData({ ...formData, diterimaDiKelas: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                  <span className="text-[9px] text-slate-400 block mt-0.5">Kelas saat pertama kali masuk SD</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    11.b. Pada Tanggal (Tanggal Masuk) *
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="date"
                      required
                      value={formData.tanggalMasuk ?? new Date().toISOString().slice(0, 10)}
                      onChange={(e) => setFormData({ ...formData, tanggalMasuk: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-0.5">Tanggal resmi diterima di sekolah</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Status Keaktifan Siswa
                  </label>
                  <select
                    value={formData.statusSiswa ?? 'Aktif'}
                    onChange={(e) => setFormData({ ...formData, statusSiswa: e.target.value as StudentStatus })}
                    className={`w-full px-3.5 py-2 bg-slate-800 border rounded-xl text-xs sm:text-sm focus:outline-none font-semibold ${
                      formData.statusSiswa === 'Aktif'
                        ? 'border-emerald-500/50 text-emerald-300'
                        : formData.statusSiswa === 'Pindah'
                        ? 'border-amber-500/50 text-amber-300'
                        : formData.statusSiswa === 'Lulus'
                        ? 'border-blue-500/50 text-blue-300'
                        : 'border-rose-500/50 text-rose-300'
                    }`}
                  >
                    <option value="Aktif">Aktif</option>
                    <option value="Pindah">Pindah / Mutasi</option>
                    <option value="Lulus">Lulus</option>
                    <option value="Non-Aktif">Non-Aktif / Drop Out</option>
                  </select>
                </div>
              </div>

              {/* Conditional: Pindah / Mutasi */}
              {formData.statusSiswa === 'Pindah' && (
                <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-semibold text-amber-300 mb-1">
                      Sekolah Tujuan Mutasi *
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: SDN 2 Sukajaya"
                      value={formData.sekolahTujuan ?? ''}
                      onChange={(e) => setFormData({ ...formData, sekolahTujuan: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-amber-700/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-amber-300 mb-1">
                      Tanggal Mutasi / Pindah
                    </label>
                    <input
                      type="date"
                      value={formData.tanggalMutasi ?? ''}
                      onChange={(e) => setFormData({ ...formData, tanggalMutasi: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-amber-700/60 rounded-lg text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Conditional: Drop Out / Keluar */}
              {formData.statusSiswa === 'Non-Aktif' && (
                <div className="bg-rose-950/20 border border-rose-800/40 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-semibold text-rose-300 mb-1">
                      Alasan Drop Out / Keluar *
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Mengikuti orang tua pindah domisili / Faktor ekonomi"
                      value={formData.alasanKeluar ?? ''}
                      onChange={(e) => setFormData({ ...formData, alasanKeluar: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-rose-700/60 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-rose-300 mb-1">
                      Tanggal Keluar
                    </label>
                    <input
                      type="date"
                      value={formData.tanggalKeluar ?? ''}
                      onChange={(e) => setFormData({ ...formData, tanggalKeluar: e.target.value })}
                      className="w-full px-3 py-1.5 bg-slate-800 border border-rose-700/60 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================ */}
          {/* SECTION 5: PERKEMBANGAN FISIK, KESEHATAN & PRESTASI             */}
          {/* ================================================================ */}
          {(activeTab === 'all' || activeTab === 'fisik') && (
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-4 space-y-3.5">
              <div className="flex items-center justify-between border-b border-slate-700/50 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-pink-600/30 text-pink-300 font-bold text-xs flex items-center justify-center">
                    6
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                    Perkembangan Fisik, Kesehatan &amp; Prestasi (Integrasi Rapor)
                  </h4>
                </div>
                <span className="text-[11px] text-slate-400 hidden sm:inline">Otomatis sinkron ke Rapor &amp; Buku Induk</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tinggi Badan (cm)
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 128"
                    value={formData.tinggiBadan ?? ''}
                    onChange={(e) => setFormData({ ...formData, tinggiBadan: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-pink-500 font-mono"
                  />
                  <span className="text-[9px] text-slate-400 block mt-0.5">Dicatat pada lembar perkembangan fisik rapor</span>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Berat Badan (kg)
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 26"
                    value={formData.beratBadan ?? ''}
                    onChange={(e) => setFormData({ ...formData, beratBadan: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-pink-500 font-mono"
                  />
                  <span className="text-[9px] text-slate-400 block mt-0.5">Dicatat pada lembar perkembangan fisik rapor</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catatan Kondisi Kesehatan (Penglihatan, Pendengaran, Gigi)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pendengaran, penglihatan, dan gigi dalam kondisi baik dan sehat."
                  value={formData.catatanKesehatan ?? ''}
                  onChange={(e) => setFormData({ ...formData, catatanKesehatan: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Catatan Prestasi / Keahlian Khusus (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Juara 1 Mewarnai Tingkat Kecamatan / Juara Futsal / Aktif Pramuka"
                  value={formData.catatanPrestasi ?? ''}
                  onChange={(e) => setFormData({ ...formData, catatanPrestasi: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-between gap-3 pt-3.5 border-t border-slate-800 shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 hidden sm:flex">
              <Info className="w-3.5 h-3.5 text-violet-400" />
              <span>Semua data otomatis tersinkron ke Sampul Rapor Halaman 2 dan Buku Induk.</span>
            </div>
            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{studentToEdit ? 'Simpan Perubahan' : 'Daftarkan Siswa'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
