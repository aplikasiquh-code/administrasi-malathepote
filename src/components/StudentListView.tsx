import React, { useState, useMemo } from 'react';
import { Student, SchoolProfile, ClassGrade, StudentStatus, Gender, ClassRoomItem } from '../types';
import { 
  GraduationCap, 
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
  UserCheck, 
  LayoutGrid, 
  Table as TableIcon,
  ArrowUpDown,
  BookOpen,
  Sparkles,
  Users,
  Building2
} from 'lucide-react';
import { exportStudentsCSV } from '../utils/exportUtils';
import { exportStudentsExcel } from '../utils/excelStudentUtils';

interface StudentListViewProps {
  students: Student[];
  school: SchoolProfile;
  classes?: ClassRoomItem[];
  onOpenClassModal?: () => void;
  onOpenAddModal: (defaultClass?: ClassGrade) => void;
  onOpenEditModal: (student: Student) => void;
  onOpenDetailModal: (student: Student) => void;
  onOpenPromotionModal: () => void;
  onDeleteStudent: (id: string, name: string) => void;
  onOpenImportModal: () => void;
}

export const StudentListView: React.FC<StudentListViewProps> = ({
  students,
  school,
  classes = [],
  onOpenClassModal,
  onOpenAddModal,
  onOpenEditModal,
  onOpenDetailModal,
  onOpenPromotionModal,
  onDeleteStudent,
  onOpenImportModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('Semua');
  const [selectedClass, setSelectedClass] = useState<string>('Semua');
  const [statusFilter, setStatusFilter] = useState<string>('Semua');
  const [genderFilter, setGenderFilter] = useState<string>('Semua');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const gradeList = ['Semua', 'Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'];

  const allClassOptions = useMemo(() => {
    if (classes && classes.length > 0) {
      return classes.map(c => c.nama).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    }
    const fromStudents: string[] = Array.from(new Set(students.map(s => s.kelas)));
    if (fromStudents.length > 0) {
      return fromStudents.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    }
    return ['1A', '1B', '2A', '2B', '3A', '3B', '4A', '4B', '5A', '5B', '6A', '6B'];
  }, [classes, students]);

  const availableClassesForGrade = useMemo(() => {
    if (selectedGrade === 'Semua') return [];
    const gradeNum = selectedGrade.replace('Kelas ', '');
    const matchingFromClasses = classes
      .filter(c => c.tingkat.toString() === gradeNum || c.nama.startsWith(gradeNum))
      .map(c => c.nama);

    if (matchingFromClasses.length > 0) {
      return Array.from(new Set(matchingFromClasses)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
    }

    const foundInStudents = Array.from(new Set(students.filter(s => s.kelas.startsWith(gradeNum)).map(s => s.kelas)));
    return foundInStudents.length > 0 ? foundInStudents.sort() : [`${gradeNum}A`, `${gradeNum}B`];
  }, [selectedGrade, classes, students]);

  const filteredStudents = useMemo(() => {
    const seen = new Set<string>();
    return students.filter((s) => {
      if (!s?.id || seen.has(s.id)) return false;
      seen.add(s.id);
      // Search
      const matchSearch =
        s.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nisn.includes(searchQuery) ||
        s.nis.includes(searchQuery) ||
        (s.namaPanggilan && s.namaPanggilan.toLowerCase().includes(searchQuery.toLowerCase())) ||
        s.namaAyah.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.alamat.toLowerCase().includes(searchQuery.toLowerCase());

      // Grade match
      let matchGrade = true;
      if (selectedGrade !== 'Semua') {
        const gradeNumber = selectedGrade.replace('Kelas ', '');
        matchGrade = s.kelas.startsWith(gradeNumber);
      }

      // Class specific match
      const matchClass = selectedClass === 'Semua' || s.kelas === selectedClass;

      // Status
      const matchStatus = statusFilter === 'Semua' || s.statusSiswa === statusFilter;

      // Gender
      const matchGender = genderFilter === 'Semua' || s.jenisKelamin === genderFilter;

      return matchSearch && matchGrade && matchClass && matchStatus && matchGender;
    });
  }, [students, searchQuery, selectedGrade, selectedClass, statusFilter, genderFilter]);

  const activeCount = filteredStudents.filter(s => s.statusSiswa === 'Aktif').length;
  const maleCount = filteredStudents.filter(s => s.jenisKelamin === 'L').length;
  const femaleCount = filteredStudents.filter(s => s.jenisKelamin === 'P').length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0">
            <GraduationCap className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Data Peserta Didik (Siswa SD)
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30">
                {students.length} Total Siswa
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Buku induk siswa lengkap dari Kelas 1 sampai Kelas 6 Sekolah Dasar.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          {onOpenClassModal && (
            <button
              onClick={onOpenClassModal}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-indigo-950/40 text-indigo-300 border border-indigo-700/50 hover:border-indigo-500 text-xs sm:text-sm font-semibold transition-all active:scale-95 shadow-sm cursor-pointer"
              title="Kelola Daftar Rombel & Kelas (Tambah, Edit, Hapus)"
            >
              <Building2 className="w-4 h-4 text-indigo-400" />
              <span>Kelola Kelas</span>
            </button>
          )}

          <button
            onClick={onOpenImportModal}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-violet-950/40 text-violet-300 border border-violet-700/50 hover:border-violet-500 text-xs sm:text-sm font-semibold transition-all active:scale-95 shadow-sm"
            title="Import data siswa dari berkas Excel (.xlsx / .xls / .csv)"
          >
            <UploadCloud className="w-4 h-4 text-violet-400" />
            <span>Impor Excel</span>
          </button>

          <button
            onClick={() => exportStudentsExcel(filteredStudents, school.namaSekolah, selectedGrade !== 'Semua' ? selectedGrade : undefined)}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition-colors"
            title="Unduh data siswa dalam format Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Ekspor Excel</span>
          </button>

          <button
            onClick={onOpenPromotionModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition-colors"
            title="Proses Kenaikan atau Perpindahan Kelas"
          >
            <ArrowUpDown className="w-4 h-4 text-amber-400" />
            <span>Kenaikan Kelas</span>
          </button>

          <button
            onClick={() => onOpenAddModal((selectedClass !== 'Semua' ? selectedClass : '1A') as ClassGrade)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-violet-600/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ Siswa Baru</span>
          </button>
        </div>
      </div>

      {/* Grade Level Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {gradeList.map((grade) => {
          const isActive = selectedGrade === grade;
          const count = grade === 'Semua' 
            ? students.length 
            : students.filter(s => s.kelas.startsWith(grade.replace('Kelas ', ''))).length;

          return (
            <button
              key={grade}
              onClick={() => {
                setSelectedGrade(grade);
                setSelectedClass('Semua');
              }}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                isActive
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-900/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>{grade}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Sub-class Rombel pills if specific grade selected */}
      {selectedGrade !== 'Semua' && (
        <div className="flex items-center gap-2 flex-wrap text-xs bg-slate-900/80 p-3 rounded-xl border border-slate-800">
          <span className="text-slate-400 font-medium">Pilih Rombel:</span>
          <button
            onClick={() => setSelectedClass('Semua')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              selectedClass === 'Semua' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua Rombel
          </button>
          {availableClassesForGrade.map((cls) => {
            const isSubActive = selectedClass === cls;
            const subCount = students.filter(s => s.kelas === cls).length;
            return (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                  isSubActive ? 'bg-violet-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <span>Kelas {cls}</span>
                <span className="text-[10px] opacity-75">({subCount})</span>
              </button>
            );
          })}
          {onOpenClassModal && (
            <button
              onClick={onOpenClassModal}
              className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-semibold transition-colors cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>+ / Edit Rombel</span>
            </button>
          )}
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari berdasarkan nama siswa, NISN, NIS, nama ayah/ibu, alamat..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-violet-500"
          />
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Gender Filter */}
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="Semua" className="bg-slate-800">Semua Gender</option>
              <option value="L" className="bg-slate-800">Laki-laki (L)</option>
              <option value="P" className="bg-slate-800">Perempuan (P)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-xl text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="Semua" className="bg-slate-800">Semua Status</option>
              <option value="Aktif" className="bg-slate-800">Siswa Aktif</option>
              <option value="Pindah" className="bg-slate-800">Pindah / Mutasi</option>
              <option value="Lulus" className="bg-slate-800">Lulus</option>
              <option value="Non-Aktif" className="bg-slate-800">Non-Aktif</option>
            </select>
          </div>

          {/* View Mode */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Tampilan Tabel Lengkap"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
              title="Tampilan Grid Kartu"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary indicator */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span>Menampilkan <strong>{filteredStudents.length}</strong> siswa</span>
        <div className="flex items-center gap-3">
          <span className="text-sky-400 font-medium">L: {maleCount}</span>
          <span className="text-pink-400 font-medium">P: {femaleCount}</span>
          <span className="text-emerald-400 font-medium">Aktif: {activeCount}</span>
        </div>
      </div>

      {/* Students Data */}
      {filteredStudents.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">
          <GraduationCap className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-200">Tidak ada data siswa ditemukan</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Coba ganti filter kelas atau periksa kata kunci pencarian.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-700">
                <tr>
                  <th className="py-3.5 px-4">No</th>
                  <th className="py-3.5 px-4">Nama Lengkap & NISN/NIS</th>
                  <th className="py-3.5 px-4 min-w-[130px]">
                    <div className="flex flex-col gap-1">
                      <span className="text-[11px] font-semibold text-slate-300">Kelas</span>
                      <select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="px-2 py-1 bg-slate-900 border border-slate-700 text-violet-300 font-bold rounded-lg text-[10px] focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
                        title="Pilih opsi kelas langsung dari kolom"
                      >
                        <option value="Semua">Semua Kelas</option>
                        {allClassOptions.map(cls => (
                          <option key={cls} value={cls}>Kelas {cls}</option>
                        ))}
                      </select>
                    </div>
                  </th>
                  <th className="py-3.5 px-4">L/P</th>
                  <th className="py-3.5 px-4">Tempat, Tgl Lahir</th>
                  <th className="py-3.5 px-4">Nama Orang Tua</th>
                  <th className="py-3.5 px-4">No. HP Ortu</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredStudents.map((student, idx) => (
                  <tr key={`${student.id}-${idx}`} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400 font-medium">{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div 
                          className="cursor-pointer shrink-0" 
                          onClick={() => onOpenDetailModal(student)}
                          title="Lihat Detail Profil Siswa"
                        >
                          {student.fotoUrl ? (
                            <img
                              src={student.fotoUrl}
                              alt={student.namaLengkap}
                              className="w-8 h-[42px] aspect-[3/4] rounded-lg object-cover border border-slate-700 shadow-sm"
                            />
                          ) : (
                            <div className="w-8 h-[42px] aspect-[3/4] rounded-lg bg-gradient-to-tr from-violet-600/30 to-purple-600/30 border border-violet-500/30 text-violet-300 font-bold text-xs flex items-center justify-center">
                              {student.namaLengkap.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div 
                            className="font-bold text-white text-sm hover:text-violet-300 transition-colors cursor-pointer truncate" 
                            onClick={() => onOpenDetailModal(student)}
                          >
                            {student.namaLengkap}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 truncate">
                            NISN: {student.nisn} | NIS: {student.nis}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                        {student.kelas}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${student.jenisKelamin === 'L' ? 'text-sky-400' : 'text-pink-400'}`}>
                        {student.jenisKelamin}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      <div>{student.tempatLahir}</div>
                      <div className="text-[11px] text-slate-400">{student.tanggalLahir}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-200">{student.namaAyah || '-'}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[120px]">{student.alamat}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">{student.noHpOrtu}</td>
                    <td className="py-3 px-4">
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          student.statusSiswa === 'Aktif'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : student.statusSiswa === 'Lulus'
                            ? 'bg-blue-500/20 text-blue-300'
                            : student.statusSiswa === 'Pindah'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {student.statusSiswa === 'Pindah' ? 'Pindah / Mutasi' : student.statusSiswa === 'Non-Aktif' ? 'Drop Out' : student.statusSiswa}
                        </span>
                        {student.statusSiswa === 'Pindah' && student.sekolahTujuan && (
                          <div className="text-[10px] text-amber-300/90 mt-0.5 max-w-[130px] truncate" title={`Tujuan: ${student.sekolahTujuan}`}>
                            Ke: {student.sekolahTujuan}
                          </div>
                        )}
                        {student.statusSiswa === 'Non-Aktif' && student.alasanKeluar && (
                          <div className="text-[10px] text-rose-300/90 mt-0.5 max-w-[130px] truncate" title={`Alasan: ${student.alasanKeluar}`}>
                            {student.alasanKeluar}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenDetailModal(student)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400"
                          title="Buka Buku Induk Siswa"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenEditModal(student)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                          title="Edit Biodata Siswa"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteStudent(student.id, student.namaLengkap)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-rose-400"
                          title="Hapus Siswa"
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
      ) : (
        /* Grid Card View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStudents.map((student, idx) => (
            <div
              key={`${student.id}-${idx}`}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div 
                      className="cursor-pointer shrink-0" 
                      onClick={() => onOpenDetailModal(student)}
                      title="Lihat Detail Profil Siswa"
                    >
                      {student.fotoUrl ? (
                        <img
                          src={student.fotoUrl}
                          alt={student.namaLengkap}
                          className="w-12 h-16 aspect-[3/4] rounded-xl object-cover border border-slate-700 shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-16 aspect-[3/4] rounded-xl bg-gradient-to-tr from-violet-600 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                          {student.namaLengkap.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <h3 
                        className="font-bold text-sm text-white truncate group-hover:text-violet-300 transition-colors cursor-pointer"
                        onClick={() => onOpenDetailModal(student)}
                      >
                        {student.namaLengkap}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                        NISN: {student.nisn}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30 shrink-0">
                    Kelas {student.kelas}
                  </span>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-300 bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Jenis Kelamin:</span>
                    <span className="font-semibold text-white">
                      {student.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Lahir:</span>
                    <span className="text-slate-200">{student.tempatLahir}, {student.tanggalLahir}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Nama Ayah / Wali:</span>
                    <span className="text-slate-200 font-medium">{student.namaAyah}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-700/60">
                    <span>No. HP Ortu:</span>
                    <span className="text-sky-300 font-mono">{student.noHpOrtu}</span>
                  </div>
                  {student.statusSiswa !== 'Aktif' && (
                    <div className="pt-1.5 border-t border-slate-700/60 flex items-start justify-between gap-2">
                      <span className="text-slate-400">Status:</span>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                          student.statusSiswa === 'Lulus'
                            ? 'bg-blue-500/20 text-blue-300'
                            : student.statusSiswa === 'Pindah'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          {student.statusSiswa === 'Pindah' ? 'Pindah / Mutasi' : student.statusSiswa === 'Non-Aktif' ? 'Drop Out' : student.statusSiswa}
                        </span>
                        {student.statusSiswa === 'Pindah' && student.sekolahTujuan && (
                          <div className="text-[10px] text-amber-300 mt-0.5 truncate max-w-[150px]">
                            Ke: {student.sekolahTujuan}
                          </div>
                        )}
                        {student.statusSiswa === 'Non-Aktif' && student.alasanKeluar && (
                          <div className="text-[10px] text-rose-300 mt-0.5 truncate max-w-[150px]">
                            {student.alasanKeluar}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => onOpenDetailModal(student)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  <span>Buku Induk</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onOpenEditModal(student)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteStudent(student.id, student.namaLengkap)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
