import React, { useState } from 'react';
import { Student, ClassGrade, StudentStatus, ClassRoomItem } from '../types';
import { 
  X, 
  ArrowRight, 
  CheckCircle2, 
  GraduationCap, 
  Users, 
  LogOut, 
  ExternalLink, 
  AlertTriangle,
  FileText,
  Calendar,
  Building2
} from 'lucide-react';

interface ClassPromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  classes?: ClassRoomItem[];
  onBatchUpdate: (updatedStudents: Student[]) => void;
}

export const ClassPromotionModal: React.FC<ClassPromotionModalProps> = ({
  isOpen,
  onClose,
  students,
  classes = [],
  onBatchUpdate
}) => {
  const classList = classes.length > 0 
    ? classes.map(c => c.nama) 
    : ['1A','1B','2A','2B','3A','3B','4A','4B','5A','5B','6A','6B'];

  const [sourceClass, setSourceClass] = useState<ClassGrade>(classList[0] || '1A');
  const [actionType, setActionType] = useState<'promote' | 'graduate' | 'transfer' | 'dropout'>('promote');
  const [targetClass, setTargetClass] = useState<ClassGrade>(classList[1] || '2A');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  
  // Fields for Mutasi (Pindah Sekolah)
  const [sekolahTujuan, setSekolahTujuan] = useState('');
  const [tanggalMutasi, setTanggalMutasi] = useState(new Date().toISOString().slice(0, 10));
  const [catatanMutasi, setCatatanMutasi] = useState('');

  // Fields for Drop Out (Keluar)
  const [alasanKeluarPreset, setAlasanKeluarPreset] = useState('Mengikuti orang tua pindah domisili');
  const [alasanKeluarCustom, setAlasanKeluarCustom] = useState('');
  const [tanggalKeluar, setTanggalKeluar] = useState(new Date().toISOString().slice(0, 10));

  if (!isOpen) return null;

  const currentClassStudents = students.filter(
    s => s.kelas === sourceClass && s.statusSiswa === 'Aktif'
  );

  const handleToggleSelect = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter(sId => sId !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedStudentIds.length === currentClassStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(currentClassStudents.map(s => s.id));
    }
  };

  const handleExecute = () => {
    if (selectedStudentIds.length === 0) return;

    if (actionType === 'transfer' && !sekolahTujuan.trim()) {
      alert('Harap isi nama sekolah tujuan mutasi terlebih dahulu.');
      return;
    }

    const effectiveAlasanKeluar = alasanKeluarPreset === 'Lainnya'
      ? (alasanKeluarCustom.trim() || 'Alasan Lainnya')
      : (alasanKeluarCustom.trim() ? `${alasanKeluarPreset} (${alasanKeluarCustom.trim()})` : alasanKeluarPreset);

    const updated = students.map((s) => {
      if (selectedStudentIds.includes(s.id)) {
        if (actionType === 'graduate') {
          return { 
            ...s, 
            statusSiswa: 'Lulus' as StudentStatus 
          };
        } else if (actionType === 'transfer') {
          return { 
            ...s, 
            statusSiswa: 'Pindah' as StudentStatus,
            sekolahTujuan: sekolahTujuan.trim(),
            tanggalMutasi: tanggalMutasi || new Date().toISOString().slice(0, 10),
            catatanPrestasi: catatanMutasi.trim() 
              ? `${s.catatanPrestasi ? s.catatanPrestasi + ' • ' : ''}Mutasi ke ${sekolahTujuan.trim()}: ${catatanMutasi.trim()}`
              : s.catatanPrestasi
          };
        } else if (actionType === 'dropout') {
          return { 
            ...s, 
            statusSiswa: 'Non-Aktif' as StudentStatus,
            alasanKeluar: effectiveAlasanKeluar,
            tanggalKeluar: tanggalKeluar || new Date().toISOString().slice(0, 10),
            catatanPrestasi: s.catatanPrestasi 
              ? `${s.catatanPrestasi} • Keluar: ${effectiveAlasanKeluar}` 
              : `Keluar: ${effectiveAlasanKeluar}`
          };
        } else {
          // Promote / change class
          return { 
            ...s, 
            kelas: targetClass,
            statusSiswa: 'Aktif' as StudentStatus
          };
        }
      }
      return s;
    });

    onBatchUpdate(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl animate-in fade-in zoom-in-95 my-6 max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-violet-500/15 text-violet-400 border border-violet-500/30 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Kenaikan Kelas & Mutasi Status Siswa
              </h3>
              <p className="text-xs text-slate-400">
                Pindahkan rombel, proses mutasi (pindah sekolah), kelulusan, atau status drop out (keluar).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 pt-4 overflow-y-auto pr-1 flex-1 text-slate-200">
          
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/60">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Pilih Kelas / Rombel Asal
              </label>
              <select
                value={sourceClass}
                onChange={(e) => {
                  setSourceClass(e.target.value as ClassGrade);
                  setSelectedStudentIds([]);
                }}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500 font-bold text-violet-300"
              >
                {classList.map(cls => (
                  <option key={cls} value={cls}>Kelas {cls}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Pilih Aksi Pemrosesan
              </label>
              <select
                value={actionType}
                onChange={(e) => setActionType(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500 font-medium"
              >
                <option value="promote">🔼 Naikkan / Pindah Rombel Kelas</option>
                <option value="graduate">🎓 Luluskan Siswa (Tamat SD)</option>
                <option value="transfer">➡️ Mutasi (Pindah Sekolah Keluar)</option>
                <option value="dropout">⛔ Drop Out / Keluar (Non-Aktif)</option>
              </select>
            </div>
          </div>

          {/* Conditional Option 1: Promote / Naik Kelas */}
          {actionType === 'promote' && (
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-4 space-y-2 animate-in fade-in duration-150">
              <label className="block text-xs font-semibold text-slate-300">
                Pilih Kelas / Rombel Tujuan
              </label>
              <select
                value={targetClass}
                onChange={(e) => setTargetClass(e.target.value as ClassGrade)}
                className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500 font-bold text-emerald-300"
              >
                {classList.map(cls => (
                  <option key={cls} value={cls}>Kelas {cls}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">
                Siswa yang dicentang akan dinaikkan atau dialihkan ke rombel <strong>Kelas {targetClass}</strong> dan statusnya tetap <strong>Aktif</strong>.
              </p>
            </div>
          )}

          {/* Conditional Option 2: Luluskan Siswa */}
          {actionType === 'graduate' && (
            <div className="bg-blue-950/20 border border-blue-800/40 rounded-2xl p-4 flex items-start gap-3 text-blue-200 animate-in fade-in duration-150">
              <GraduationCap className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-bold text-white text-sm">Kelulusan Siswa (Alumni SD)</div>
                <p className="text-blue-300 leading-relaxed">
                  Siswa yang terpilih akan ditandai dengan status <strong>Lulus</strong> dan diarsipkan sebagai alumni sekolah dasar.
                </p>
              </div>
            </div>
          )}

          {/* Conditional Option 3: Mutasi (Pindah Sekolah) */}
          {actionType === 'transfer' && (
            <div className="bg-violet-950/20 border border-violet-800/40 rounded-2xl p-4 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-violet-300 font-bold text-xs sm:text-sm">
                <ExternalLink className="w-4 h-4 text-violet-400" />
                <span>Formulir Mutasi Siswa (Pindah Sekolah Keluar)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Sekolah Tujuan Mutasi *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      placeholder="Contoh: SDN 2 Sukajaya / SD Islam Al-Azhar 1"
                      value={sekolahTujuan}
                      onChange={(e) => setSekolahTujuan(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-violet-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tanggal Efektif Mutasi
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="date"
                      value={tanggalMutasi}
                      onChange={(e) => setTanggalMutasi(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Alasan / Keterangan Pindah (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Ikut pindah domisili orang tua"
                    value={catatanMutasi}
                    onChange={(e) => setCatatanMutasi(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              <div className="text-[11px] text-violet-300/80 bg-violet-900/20 p-2.5 rounded-xl border border-violet-800/30">
                Siswa yang terpilih akan diubah statusnya menjadi <strong>Pindah</strong> dan data sekolah tujuan akan tercatat di buku induk.
              </div>
            </div>
          )}

          {/* Conditional Option 4: Drop Out / Keluar */}
          {actionType === 'dropout' && (
            <div className="bg-rose-950/20 border border-rose-800/40 rounded-2xl p-4 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-xs sm:text-sm">
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Formulir Drop Out / Keluar (Non-Aktif)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Alasan Drop Out / Keluar Sekolah *
                  </label>
                  <select
                    value={alasanKeluarPreset}
                    onChange={(e) => setAlasanKeluarPreset(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-rose-500 font-medium"
                  >
                    <option value="Mengikuti orang tua pindah domisili">Mengikuti orang tua pindah domisili (tanpa mutasi resmi)</option>
                    <option value="Faktor ekonomi keluarga">Faktor ekonomi keluarga</option>
                    <option value="Bekerja membantu orang tua">Bekerja / membantu orang tua</option>
                    <option value="Sakit menahun / kendala kesehatan">Sakit menahun / kendala kesehatan</option>
                    <option value="Kurang minat / motivasi belajar">Kurang minat / motivasi belajar</option>
                    <option value="Faktor sosial / lingkungan">Faktor sosial / lingkungan</option>
                    <option value="Lainnya">Lainnya (Ketik Manual)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    {alasanKeluarPreset === 'Lainnya' ? 'Rincian Alasan Keluar (Wajib)' : 'Catatan Tambahan Alasan Keluar (Opsional)'}
                  </label>
                  <input
                    type="text"
                    placeholder="Tuliskan keterangan detail alasan siswa keluar..."
                    value={alasanKeluarCustom}
                    onChange={(e) => setAlasanKeluarCustom(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Tanggal Efektif Keluar
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="date"
                      value={tanggalKeluar}
                      onChange={(e) => setTanggalKeluar(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-rose-300/80 bg-rose-900/20 p-2.5 rounded-xl border border-rose-800/30">
                Siswa yang terpilih akan ditandai dengan status <strong>Non-Aktif</strong> beserta alasan drop out/keluar di riwayat peserta didik.
              </div>
            </div>
          )}

          {/* Student Checklist */}
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-semibold text-slate-300">
                Daftar Siswa Aktif Kelas {sourceClass} ({currentClassStudents.length} Siswa)
              </span>
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-xs text-violet-400 hover:text-violet-300 font-semibold"
              >
                {selectedStudentIds.length === currentClassStudents.length && currentClassStudents.length > 0
                  ? 'Batal Pilih Semua' 
                  : 'Pilih Semua'}
              </button>
            </div>

            <div className="mt-2 space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {currentClassStudents.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500 bg-slate-800/20 rounded-xl border border-slate-800">
                  Tidak ada siswa aktif di kelas {sourceClass}.
                </div>
              ) : (
                currentClassStudents.map((student, idx) => {
                  const isSelected = selectedStudentIds.includes(student.id);
                  return (
                    <div
                      key={`${student.id}-${idx}`}
                      onClick={() => handleToggleSelect(student.id)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-colors ${
                        isSelected
                          ? actionType === 'dropout'
                            ? 'bg-rose-950/40 border-rose-700 text-white'
                            : actionType === 'transfer'
                            ? 'bg-amber-950/40 border-amber-700 text-white'
                            : 'bg-violet-950/40 border-violet-700 text-white'
                          : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="rounded text-violet-600 focus:ring-0 focus:outline-none cursor-pointer"
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-semibold truncate text-white">{student.namaLengkap}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            NISN: {student.nisn} • NIS: {student.nis} • {student.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {student.tempatLahir}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800 shrink-0 gap-3">
          <span className="text-xs text-slate-400">
            Terpilih: <strong className="text-white">{selectedStudentIds.length}</strong> dari {currentClassStudents.length} siswa
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Batal
            </button>
            <button
              disabled={selectedStudentIds.length === 0}
              onClick={handleExecute}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition-all active:scale-95 cursor-pointer ${
                actionType === 'dropout'
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                  : actionType === 'transfer'
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                  : 'bg-violet-600 hover:bg-violet-500 shadow-violet-600/30'
              }`}
            >
              <span>
                {actionType === 'promote' && `Naikkan ${selectedStudentIds.length} Siswa`}
                {actionType === 'graduate' && `Luluskan ${selectedStudentIds.length} Siswa`}
                {actionType === 'transfer' && `Mutasikan ${selectedStudentIds.length} Siswa`}
                {actionType === 'dropout' && `Keluarkan / DO (${selectedStudentIds.length})`}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
