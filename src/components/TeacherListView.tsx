import React, { useState, useMemo } from 'react';
import { Teacher, SchoolProfile, EmploymentStatus } from '../types';
import { 
  Users, 
  Search, 
  Plus, 
  Download, 
  UploadCloud,
  FileSpreadsheet,
  Filter, 
  Eye, 
  Edit3, 
  Trash2, 
  Phone, 
  Mail, 
  Award, 
  CheckCircle2, 
  LayoutGrid, 
  Table as TableIcon,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { exportTeachersCSV } from '../utils/exportUtils';
import { exportTeachersExcel, downloadTeacherExcelTemplate } from '../utils/excelTeacherUtils';

interface TeacherListViewProps {
  teachers: Teacher[];
  school: SchoolProfile;
  onOpenAddModal: () => void;
  onOpenEditModal: (teacher: Teacher) => void;
  onOpenDetailModal: (teacher: Teacher) => void;
  onDeleteTeacher: (id: string, name: string) => void;
  onOpenImportModal: () => void;
}

export const TeacherListView: React.FC<TeacherListViewProps> = ({
  teachers,
  school,
  onOpenAddModal,
  onOpenEditModal,
  onOpenDetailModal,
  onDeleteTeacher,
  onOpenImportModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [certFilter, setCertFilter] = useState<string>('Semua');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const matchSearch =
        t.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.nip.includes(searchQuery) ||
        t.nuptk.includes(searchQuery) ||
        t.jabatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.penugasanKelas.toLowerCase().includes(searchQuery.toLowerCase());

      const matchStatus = statusFilter === 'Semua' || t.statusKepegawaian === statusFilter;
      const matchCert =
        certFilter === 'Semua' ||
        (certFilter === 'Sertifikasi' && t.sertifikasi) ||
        (certFilter === 'Belum' && !t.sertifikasi);

      return matchSearch && matchStatus && matchCert;
    });
  }, [teachers, searchQuery, statusFilter, certFilter]);

  const pnsCount = teachers.filter(t => t.statusKepegawaian === 'PNS').length;
  const pppkCount = teachers.filter(t => t.statusKepegawaian === 'PPPK').length;
  const honorerCount = teachers.filter(t => t.statusKepegawaian === 'GTT / Honorer' || t.statusKepegawaian === 'Guru Tetap Yayasan').length;
  const certCount = teachers.filter(t => t.sertifikasi).length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Data Guru & Tenaga Kependidikan (GTK)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                {teachers.length} Personel
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Manajemen pendidik, guru kelas, guru mata pelajaran, dan staf administrasi SD.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={onOpenImportModal}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-950/40 text-emerald-300 border border-emerald-700/50 hover:border-emerald-500 text-xs sm:text-sm font-semibold transition-all active:scale-95 shadow-sm"
            title="Import data guru dari berkas Excel (.xlsx / .xls / .csv)"
          >
            <UploadCloud className="w-4 h-4 text-emerald-400" />
            <span>Impor Excel</span>
          </button>

          <button
            onClick={() => exportTeachersExcel(filteredTeachers, school.namaSekolah)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition-colors"
            title="Unduh data dalam format Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Ekspor Excel</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Guru Baru</span>
          </button>
        </div>
      </div>

      {/* Mini KPI Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Guru PNS</span>
            <div className="text-lg font-bold text-white mt-0.5">{pnsCount} Orang</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
            PNS
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Guru PPPK</span>
            <div className="text-lg font-bold text-white mt-0.5">{pppkCount} Orang</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-xs">
            P3K
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">GTT / Honorer</span>
            <div className="text-lg font-bold text-white mt-0.5">{honorerCount} Orang</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
            GTT
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400">Tersertifikasi</span>
            <div className="text-lg font-bold text-white mt-0.5">{certCount} Pendidik</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold text-xs">
            <Award className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama guru, NIP, NUPTK, mapel, atau jabatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Filter select boxes */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="Semua" className="bg-slate-800">Semua Status</option>
              <option value="PNS" className="bg-slate-800">PNS</option>
              <option value="PPPK" className="bg-slate-800">PPPK (Penuh Waktu)</option>
              <option value="PPPK PW" className="bg-slate-800">PPPK PW (Paruh Waktu)</option>
              <option value="GTT / Honorer" className="bg-slate-800">GTT / Honorer</option>
              <option value="PTT (Honorer)" className="bg-slate-800">PTT (Honorer)</option>
              <option value="Guru Tetap Yayasan" className="bg-slate-800">GTY (Tetap Yayasan)</option>
              <option value="GTTY (Guru Tidak Tetap Yayasan)" className="bg-slate-800">GTTY (Tidak Tetap Yayasan)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
            <Award className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={certFilter}
              onChange={(e) => setCertFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="Semua" className="bg-slate-800">Semua Sertifikasi</option>
              <option value="Sertifikasi" className="bg-slate-800">Sudah Sertifikasi</option>
              <option value="Belum" className="bg-slate-800">Belum Sertifikasi</option>
            </select>
          </div>

          {/* View toggle */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Tampilan Grid Kartu"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Tampilan Tabel Lengkap"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Teacher Content */}
      {filteredTeachers.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">Tidak ada data guru yang cocok</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Coba ubah kata kunci pencarian atau sesuaikan opsi filter status kepegawaian.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header card */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {teacher.fotoUrl ? (
                      <img 
                        src={teacher.fotoUrl} 
                        alt={teacher.namaLengkap} 
                        className="w-12 h-16 aspect-[3/4] rounded-xl object-cover object-top border border-slate-700 shadow-sm shrink-0"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-16 aspect-[3/4] rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex flex-col items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                        <span>{teacher.namaLengkap.slice(0, 2).toUpperCase()}</span>
                        <span className="text-[9px] font-normal text-emerald-200">3:4</span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm text-white truncate group-hover:text-emerald-300 transition-colors">
                        {teacher.namaLengkap}
                      </h3>
                      <p className="text-xs text-amber-300 font-medium truncate mt-0.5">
                        {teacher.jabatan}
                      </p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    teacher.statusKepegawaian === 'PNS'
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : teacher.statusKepegawaian === 'PPPK' || teacher.statusKepegawaian === 'PPPK PW'
                      ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                      : teacher.statusKepegawaian === 'Guru Tetap Yayasan' || teacher.statusKepegawaian === 'GTTY (Guru Tidak Tetap Yayasan)'
                      ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  }`}>
                    {teacher.statusKepegawaian}
                  </span>
                </div>

                {/* Details list */}
                <div className="mt-4 space-y-2 text-xs text-slate-300 bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>NIP / NUPTK:</span>
                    <span className="font-mono text-slate-200 truncate max-w-[150px]">
                      {teacher.nip !== '-' ? teacher.nip : teacher.nuptk}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Penugasan:</span>
                    <span className="font-medium text-slate-200">{teacher.penugasanKelas}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Pendidikan:</span>
                    <span className="text-slate-200">{teacher.pendidikanTerakhir} ({teacher.jurusan})</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-700/60">
                    <span>Sertifikasi:</span>
                    <span className={`font-semibold ${teacher.sertifikasi ? 'text-emerald-400' : 'text-slate-400'}`}>
                      {teacher.sertifikasi ? 'Sudah Sertifikasi' : 'Belum'}
                    </span>
                  </div>
                </div>

                {/* Kontak */}
                <div className="mt-3 flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1 truncate">
                    <Phone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    {teacher.noHp}
                  </span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenDetailModal(teacher)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span>Detail</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenEditModal(teacher)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Edit Data Guru"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteTeacher(teacher.id, teacher.namaLengkap)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Hapus Data Guru"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-700">
                <tr>
                  <th className="py-3.5 px-4">No</th>
                  <th className="py-3.5 px-4">Nama Lengkap & NIP/NUPTK</th>
                  <th className="py-3.5 px-4">Jabatan & Penugasan</th>
                  <th className="py-3.5 px-4">Status & Gol</th>
                  <th className="py-3.5 px-4">Pendidikan</th>
                  <th className="py-3.5 px-4">Sertifikasi</th>
                  <th className="py-3.5 px-4">Kontak HP</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredTeachers.map((teacher, idx) => (
                  <tr key={teacher.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        {teacher.fotoUrl ? (
                          <img 
                            src={teacher.fotoUrl} 
                            alt={teacher.namaLengkap} 
                            className="w-9 h-12 aspect-[3/4] rounded-lg object-cover object-top border border-slate-700 shadow-sm shrink-0"
                            onError={(e) => {
                              (e.currentTarget as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-9 h-12 aspect-[3/4] rounded-lg bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white font-bold text-xs shadow-sm shrink-0">
                            {teacher.namaLengkap.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-white text-sm truncate">{teacher.namaLengkap}</div>
                          <div className="text-[11px] font-mono text-slate-400">
                            NIP: {teacher.nip} | NUPTK: {teacher.nuptk}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-amber-300">{teacher.jabatan}</div>
                      <div className="text-slate-400">{teacher.penugasanKelas}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        teacher.statusKepegawaian === 'PNS' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {teacher.statusKepegawaian} ({teacher.golonganRuang || '-'})
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>{teacher.pendidikanTerakhir}</div>
                      <div className="text-slate-400 text-[11px] truncate max-w-[120px]">{teacher.jurusan}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[11px] font-semibold ${teacher.sertifikasi ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {teacher.sertifikasi ? 'Tersertifikasi' : 'Belum'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{teacher.noHp}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenDetailModal(teacher)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400"
                          title="Lihat Detail"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenEditModal(teacher)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTeacher(teacher.id, teacher.namaLengkap)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400"
                          title="Hapus"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
