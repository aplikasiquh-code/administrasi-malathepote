import React, { useState } from 'react';
import { ClassRoomItem, Student, Teacher, SchoolProfile } from '../types';
import { 
  Building2, 
  Plus, 
  Edit3, 
  Trash2, 
  Users, 
  GraduationCap, 
  DoorOpen, 
  X, 
  Save, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  ArrowUpDown, 
  RotateCcw,
  Sparkles,
  Info,
  ShieldAlert
} from 'lucide-react';
import { ConfirmDeleteModal, ConfirmDeleteState } from './ConfirmDeleteModal';

interface ClassManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: ClassRoomItem[];
  students: Student[];
  teachers: Teacher[];
  school?: SchoolProfile;
  onAddClass: (newClass: Omit<ClassRoomItem, 'id'>) => void;
  onEditClass: (oldName: string, updatedClass: ClassRoomItem) => void;
  onDeleteClass: (classToDelete: ClassRoomItem, transferToClass?: string) => void;
  onResetClassesToDefault: () => void;
  onAddToast: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const ClassManagementModal: React.FC<ClassManagementModalProps> = ({
  isOpen,
  onClose,
  classes,
  students,
  teachers,
  school,
  onAddClass,
  onEditClass,
  onDeleteClass,
  onResetClassesToDefault,
  onAddToast
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTingkatFilter, setSelectedTingkatFilter] = useState<string>('Semua');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassRoomItem | null>(null);

  // Form State
  const [formNama, setFormNama] = useState('');
  const [formTingkat, setFormTingkat] = useState<number>(1);
  const [formWaliKelas, setFormWaliKelas] = useState('');
  const [formRuangan, setFormRuangan] = useState('');
  const [formKapasitas, setFormKapasitas] = useState<number>(28);
  const [formKeterangan, setFormKeterangan] = useState('');

  // Delete & Transfer State
  const [deleteModalState, setDeleteModalState] = useState<ConfirmDeleteState>({ isOpen: false });
  const [classPendingDelete, setClassPendingDelete] = useState<ClassRoomItem | null>(null);
  const [transferTargetClass, setTransferTargetClass] = useState<string>('');

  if (!isOpen) return null;

  // Filtered classes
  const filteredClasses = classes
    .filter(c => {
      const matchSearch = c.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.waliKelas && c.waliKelas.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.ruangan && c.ruangan.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchTingkat = selectedTingkatFilter === 'Semua' || c.tingkat.toString() === selectedTingkatFilter;
      return matchSearch && matchTingkat;
    })
    .sort((a, b) => {
      if (a.tingkat !== b.tingkat) return a.tingkat - b.tingkat;
      return a.nama.localeCompare(b.nama, undefined, { numeric: true, sensitivity: 'base' });
    });

  const getStudentCount = (className: string) => {
    const list = students.filter(s => s.kelas === className && s.statusSiswa === 'Aktif');
    const male = list.filter(s => s.jenisKelamin === 'L').length;
    const female = list.filter(s => s.jenisKelamin === 'P').length;
    return { total: list.length, male, female };
  };

  const handleOpenAddForm = () => {
    setEditingClass(null);
    setFormNama('');
    setFormTingkat(1);
    setFormWaliKelas('');
    setFormRuangan('');
    setFormKapasitas(28);
    setFormKeterangan('');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (item: ClassRoomItem) => {
    setEditingClass(item);
    setFormNama(item.nama);
    setFormTingkat(item.tingkat);
    setFormWaliKelas(item.waliKelas || '');
    setFormRuangan(item.ruangan || '');
    setFormKapasitas(item.kapasitas || 28);
    setFormKeterangan(item.keterangan || '');
    setIsFormOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = formNama.trim().toUpperCase();

    if (!cleanName) {
      onAddToast('Validasi Gagal', 'Nama kelas tidak boleh kosong (contoh: 1A, 6C, dsb).', 'error');
      return;
    }

    // Check duplicate name
    const isDuplicate = classes.some(c => 
      c.nama.toUpperCase() === cleanName && (!editingClass || c.id !== editingClass.id)
    );

    if (isDuplicate) {
      onAddToast('Nama Kelas Duplikat', `Kelas dengan nama "${cleanName}" sudah terdaftar.`, 'error');
      return;
    }

    if (editingClass) {
      const oldName = editingClass.nama;
      onEditClass(oldName, {
        ...editingClass,
        nama: cleanName,
        tingkat: Number(formTingkat),
        waliKelas: formWaliKelas.trim(),
        ruangan: formRuangan.trim(),
        kapasitas: Number(formKapasitas) || 28,
        keterangan: formKeterangan.trim(),
        tahunAjaran: school?.tahunAjaran || '2025/2026'
      });
      setIsFormOpen(false);
      setEditingClass(null);
    } else {
      onAddClass({
        nama: cleanName,
        tingkat: Number(formTingkat),
        waliKelas: formWaliKelas.trim(),
        ruangan: formRuangan.trim(),
        kapasitas: Number(formKapasitas) || 28,
        keterangan: formKeterangan.trim(),
        tahunAjaran: school?.tahunAjaran || '2025/2026'
      });
      setIsFormOpen(false);
    }
  };

  const handleInitiateDelete = (cls: ClassRoomItem) => {
    const stCount = getStudentCount(cls.nama).total;
    setClassPendingDelete(cls);

    const otherClasses = classes.filter(c => c.id !== cls.id);
    setTransferTargetClass(otherClasses.length > 0 ? otherClasses[0].nama : '');

    setDeleteModalState({
      isOpen: true,
      title: `Hapus Kelas ${cls.nama}`,
      itemName: `Rombel Kelas ${cls.nama} (${stCount} Siswa)`,
      description: stCount > 0 
        ? `Perhatian: Terdapat ${stCount} siswa aktif di kelas ${cls.nama}. Menghapus kelas akan memindahkan siswa ke kelas tujuan yang Anda pilih atau menghapus referensi kelas.`
        : `Apakah Anda yakin ingin menghapus kelas ${cls.nama}? Data kelas ini akan dihapus dari daftar rombel.`,
      confirmButtonText: 'Ya, Hapus Kelas',
      onConfirm: () => {
        onDeleteClass(cls, transferTargetClass);
        setClassPendingDelete(null);
      }
    });
  };

  const totalCapacity = classes.reduce((sum, c) => sum + (c.kapasitas || 28), 0);
  const totalActiveStudents = students.filter(s => s.statusSiswa === 'Aktif').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Manajemen Kelas & Rombongan Belajar
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {classes.length} Rombel
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Kelola tambah, edit nama/wali, dan hapus rombel yang terhubung otomatis ke seluruh modul data siswa, presensi, jurnal & nilai.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
            title="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-950/40 border-b border-slate-800/80 text-xs shrink-0">
          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-slate-400 text-[11px]">Total Rombel</div>
              <div className="text-sm font-bold text-white">{classes.length} Kelas</div>
            </div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="text-slate-400 text-[11px]">Siswa Terdaftar</div>
              <div className="text-sm font-bold text-emerald-400">{totalActiveStudents} Siswa</div>
            </div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <DoorOpen className="w-4 h-4" />
            </div>
            <div>
              <div className="text-slate-400 text-[11px]">Total Daya Tampung</div>
              <div className="text-sm font-bold text-white">{totalCapacity} Kursi</div>
            </div>
          </div>

          <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-slate-400 text-[11px]">Rata-rata / Kelas</div>
              <div className="text-sm font-bold text-amber-300">
                {classes.length > 0 ? (totalActiveStudents / classes.length).toFixed(1) : 0} Siswa
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls & Filters */}
        <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-slate-900/50">
          <div className="flex items-center gap-2 flex-1 min-w-[260px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Cari nama kelas, wali kelas, ruangan..."
                className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <select
              value={selectedTingkatFilter}
              onChange={e => setSelectedTingkatFilter(e.target.value)}
              className="bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="Semua">Semua Tingkat (1-6)</option>
              <option value="1">Kelas 1</option>
              <option value="2">Kelas 2</option>
              <option value="3">Kelas 3</option>
              <option value="4">Kelas 4</option>
              <option value="5">Kelas 5</option>
              <option value="6">Kelas 6</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenAddForm}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Kelas Baru</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Kembalikan susunan kelas ke standar 12 rombel (1A - 6B)?')) {
                  onResetClassesToDefault();
                  onAddToast('Reset Berhasil', 'Daftar kelas dikembalikan ke default 12 rombel.', 'info');
                }
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-medium border border-slate-700 transition-all"
              title="Reset ke Standar 12 Rombel SD"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset Default</span>
            </button>
          </div>
        </div>

        {/* Modal Content / Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          
          {/* Inline Form Add / Edit */}
          {isFormOpen && (
            <div className="bg-slate-800/90 border border-indigo-500/40 rounded-2xl p-5 shadow-xl animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-700/80 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
                    {editingClass ? <Edit3 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {editingClass ? `Edit Rombel Kelas ${editingClass.nama}` : 'Tambah Rombel Kelas Baru'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      {editingClass 
                        ? 'Perubahan nama kelas akan otomatis disinkronisasi ke seluruh data siswa, absensi, dan nilai.'
                        : 'Kelas baru akan langsung aktif dan muncul di seluruh menu pilihan kelas.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Nama Kelas */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Nama Kelas / Rombel <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formNama}
                      onChange={e => setFormNama(e.target.value.toUpperCase())}
                      placeholder="Contoh: 1A, 1C, 6C, INKLUSI"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-bold"
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Singkat & jelas (e.g. 1A, 2B, 3C)
                    </span>
                  </div>

                  {/* Tingkat Kelas */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Tingkat Jenjang <span className="text-red-400">*</span>
                    </label>
                    <select
                      value={formTingkat}
                      onChange={e => setFormTingkat(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                    >
                      <option value={1}>Tingkat 1 (Fase A)</option>
                      <option value={2}>Tingkat 2 (Fase A)</option>
                      <option value={3}>Tingkat 3 (Fase B)</option>
                      <option value={4}>Tingkat 4 (Fase B)</option>
                      <option value={5}>Tingkat 5 (Fase C)</option>
                      <option value={6}>Tingkat 6 (Fase C)</option>
                    </select>
                  </div>

                  {/* Kapasitas Siswa */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Kapasitas Maksimal (Siswa)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      value={formKapasitas}
                      onChange={e => setFormKapasitas(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Guru Wali Kelas */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Guru Wali Kelas
                    </label>
                    <select
                      value={formWaliKelas}
                      onChange={e => setFormWaliKelas(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="">-- Belum Ditentukan / Pilih Guru --</option>
                      {teachers
                        .filter(t => t.statusAktif)
                        .map(t => (
                          <option key={t.id} value={t.namaLengkap}>
                            {t.namaLengkap} ({t.jabatan})
                          </option>
                        ))}
                    </select>
                  </div>

                  {/* Ruangan Kelas */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Ruangan / Lokasi Belajar
                    </label>
                    <input
                      type="text"
                      value={formRuangan}
                      onChange={e => setFormRuangan(e.target.value)}
                      placeholder="Contoh: Gedung A Lt. 1 (Ruang 101)"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Keterangan */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Keterangan Tambahan (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formKeterangan}
                    onChange={e => setFormKeterangan(e.target.value)}
                    placeholder="Contoh: Kelas Unggulan Sains, Dilengkapi Smart TV & AC"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-700 hover:bg-slate-600 transition-all cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{editingClass ? 'Simpan Perubahan Kelas' : 'Tambahkan Kelas'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Cards Grid */}
          {filteredClasses.length === 0 ? (
            <div className="text-center py-12 bg-slate-950/30 rounded-2xl border border-dashed border-slate-800">
              <Building2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-300">Tidak ada kelas ditemukan</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Silakan sesuaikan kata kunci pencarian atau klik tombol "Tambah Kelas Baru".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {filteredClasses.map(c => {
                const st = getStudentCount(c.nama);
                const capacity = c.kapasitas || 28;
                const percent = Math.min(100, Math.round((st.total / capacity) * 100));

                return (
                  <div 
                    key={c.id}
                    className="bg-slate-800/60 hover:bg-slate-800/90 border border-slate-700/80 hover:border-indigo-500/50 rounded-2xl p-4 transition-all flex flex-col justify-between group shadow-sm"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white flex items-center justify-center font-extrabold text-base shadow-md">
                            {c.nama}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-bold text-white">Kelas {c.nama}</h4>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-700 text-indigo-300">
                                Tingkat {c.tingkat}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-1">
                              {c.ruangan || 'Ruangan belum diatur'}
                            </p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => handleOpenEditForm(c)}
                            className="p-1.5 rounded-lg bg-slate-700/80 hover:bg-indigo-600 text-slate-300 hover:text-white transition-all cursor-pointer"
                            title={`Edit Kelas ${c.nama}`}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleInitiateDelete(c)}
                            className="p-1.5 rounded-lg bg-slate-700/80 hover:bg-red-600 text-slate-300 hover:text-white transition-all cursor-pointer"
                            title={`Hapus Kelas ${c.nama}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Wali Kelas */}
                      <div className="bg-slate-900/70 rounded-xl p-2.5 mb-3 border border-slate-800">
                        <div className="text-[10px] font-semibold text-slate-400 flex items-center gap-1 mb-0.5">
                          <GraduationCap className="w-3 h-3 text-indigo-400" />
                          <span>Wali Kelas:</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-200 truncate">
                          {c.waliKelas || <span className="text-amber-400 italic">Belum ditentukan</span>}
                        </div>
                      </div>

                      {/* Student Stats & Capacity */}
                      <div className="space-y-1.5 text-xs mb-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Terisi Siswa:</span>
                          <span className="font-bold text-white">
                            {st.total} / {capacity} Siswa ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all ${
                              percent > 100 ? 'bg-red-500' : percent >= 80 ? 'bg-emerald-500' : 'bg-blue-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                          <span>L: {st.male} Siswa</span>
                          <span>P: {st.female} Siswa</span>
                        </div>
                      </div>
                    </div>

                    {c.keterangan && (
                      <div className="text-[10px] text-slate-400 bg-slate-950/40 px-2 py-1 rounded-lg border border-slate-800 line-clamp-1 mt-2">
                        {c.keterangan}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3 shrink-0 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-[11px]">
            <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Setiap perubahan kelas langsung aktif pada seluruh formulir filter, presensi, jurnal, dan buku nilai.</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-all cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        state={deleteModalState}
        onClose={() => setDeleteModalState({ isOpen: false })}
      />
    </div>
  );
};
