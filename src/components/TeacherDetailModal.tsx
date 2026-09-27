import React from 'react';
import { Teacher, SchoolProfile } from '../types';
import { 
  X, 
  Printer, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Award, 
  Briefcase, 
  Calendar, 
  ShieldCheck,
  Building,
  FileSpreadsheet
} from 'lucide-react';
import { exportSingleTeacherExcel } from '../utils/excelReportUtils';
import { printDocumentWithA4 } from '../utils/exportUtils';
import { OfficialSchoolKop } from './OfficialSchoolKop';

interface TeacherDetailModalProps {
  teacher: Teacher | null;
  school: SchoolProfile;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (teacher: Teacher) => void;
}

export const TeacherDetailModal: React.FC<TeacherDetailModalProps> = ({
  teacher,
  school,
  isOpen,
  onClose,
  onEdit
}) => {
  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    setImgError(false);
  }, [teacher?.id, teacher?.fotoUrl]);

  React.useEffect(() => {
    if (isOpen) {
      document.body.classList.add('print-modal-open');
    } else {
      document.body.classList.remove('print-modal-open');
    }
    return () => {
      document.body.classList.remove('print-modal-open');
    };
  }, [isOpen]);

  if (!isOpen || !teacher) return null;

  const handlePrintCard = () => {
    printDocumentWithA4({
      orientation: 'portrait',
      title: `Biodata_Guru_${teacher.namaLengkap.replace(/\s+/g, '_')}_${teacher.nip || teacher.id}`
    });
  };

  const handleExportExcel = () => {
    exportSingleTeacherExcel(teacher, school);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto print:static print:inset-auto print:p-0 print:m-0 print:bg-white print:overflow-visible print:block print:z-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 my-6 a4-portrait-sheet print:bg-white print:border-none print:shadow-none print:my-0 print:p-0 print:w-full print:max-w-none print:block print:static">
        {/* Header Actions (hidden in print) */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 print:hidden flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
              Biodata Pendidik & Tenaga Kependidikan
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer"
              title="Unduh format Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simpan Excel</span>
            </button>
            <button
              onClick={handlePrintCard}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
              title="Cetak via Kabel/Wireless atau Simpan ke PDF"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Cetak / PDF</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(teacher);
              }}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer"
            >
              Edit
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Card Area */}
        <div className="pt-4 space-y-6 print:p-0 print:space-y-4 print:bg-white print:text-black">
          {/* Print-Only Official Kop & Document Header */}
          <div className="hidden print:block mb-4">
            <OfficialSchoolKop school={school} />
            <div className="text-center my-3">
              <h2 className="text-base font-bold uppercase underline">
                BIODATA PENDIDIK DAN TENAGA KEPENDIDIKAN
              </h2>
              <p className="text-xs text-black mt-0.5">
                Tahun Pelajaran {school.tahunAjaran} • NPSN: {school.npsn}
              </p>
            </div>
          </div>

          {/* Top Identity Badge */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-5 rounded-2xl bg-gradient-to-r from-slate-800/80 to-slate-800/40 border border-slate-700/60 print:bg-white print:border-black">
            {teacher.fotoUrl && !imgError ? (
              <div className="w-24 h-32 aspect-[3/4] rounded-xl overflow-hidden border-2 border-emerald-500/60 shadow-lg shrink-0 print:w-[30mm] print:h-[40mm] print:rounded-none print:border-black bg-slate-950 flex items-center justify-center">
                <img
                  src={teacher.fotoUrl}
                  alt={teacher.namaLengkap}
                  className="w-full h-full object-cover object-top"
                  onError={() => setImgError(true)}
                />
              </div>
            ) : (
              <div className="w-24 h-32 aspect-[3/4] rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-2xl flex flex-col items-center justify-center shadow-lg shrink-0 border border-slate-700/60 print:w-[30mm] print:h-[40mm] print:rounded-none print:bg-slate-100 print:text-black print:border-black">
                <span>{teacher.namaLengkap.slice(0, 2).toUpperCase()}</span>
                <span className="text-[10px] font-medium tracking-wider text-blue-200 print:text-slate-600 mt-1">3 × 4</span>
              </div>
            )}
            <div className="text-center sm:text-left min-w-0 flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-white print:text-black">
                  {teacher.namaLengkap}
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {teacher.statusKepegawaian}
                </span>
              </div>
              <p className="text-sm font-medium text-amber-300 print:text-slate-800 mt-1">
                {teacher.jabatan} • Penugasan: {teacher.penugasanKelas}
              </p>
              <p className="text-xs text-slate-400 print:text-slate-600 mt-1 font-mono">
                NIP: {teacher.nip} | NUPTK: {teacher.nuptk}
              </p>
            </div>
          </div>

          {/* Detailed Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-2.5 print:border-black print:bg-white">
              <h4 className="font-bold text-slate-200 print:text-black uppercase tracking-wider text-[11px] pb-2 border-b border-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Data Kepegawaian & Kualifikasi
              </h4>
              <div className="flex justify-between py-1 border-b border-slate-700/40">
                <span className="text-slate-400">Pendidikan Terakhir:</span>
                <span className="font-semibold text-white print:text-black">{teacher.pendidikanTerakhir} ({teacher.jurusan})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700/40">
                <span className="text-slate-400">Golongan / Ruang:</span>
                <span className="font-mono font-semibold text-slate-200 print:text-black">{teacher.golonganRuang || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700/40">
                <span className="text-slate-400">Status Sertifikasi:</span>
                <span className={`font-semibold ${teacher.sertifikasi ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {teacher.sertifikasi ? 'Tersertifikasi Pendidik' : 'Belum Tersertifikasi'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Status Keaktifan:</span>
                <span className="text-emerald-400 font-semibold">{teacher.statusAktif ? 'Aktif Mengajar' : 'Non-Aktif'}</span>
              </div>
            </div>

            <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 space-y-2.5 print:border-black print:bg-white">
              <h4 className="font-bold text-slate-200 print:text-black uppercase tracking-wider text-[11px] pb-2 border-b border-slate-700 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-sky-400" />
                Biodata Pribadi & Kontak
              </h4>
              <div className="flex justify-between py-1 border-b border-slate-700/40">
                <span className="text-slate-400">Jenis Kelamin:</span>
                <span className="font-semibold text-white print:text-black">{teacher.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700/40">
                <span className="text-slate-400">Tempat, Tgl Lahir:</span>
                <span className="font-semibold text-white print:text-black">{teacher.tempatLahir}, {teacher.tanggalLahir}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-700/40">
                <span className="text-slate-400">No. WhatsApp / HP:</span>
                <span className="font-semibold text-sky-300 print:text-black">{teacher.noHp}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Email:</span>
                <span className="font-semibold text-slate-200 print:text-black truncate max-w-[170px]">{teacher.email}</span>
              </div>
            </div>
          </div>

          {/* Alamat */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-slate-300">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200">Alamat Tempat Tinggal: </strong>
              <span>{teacher.alamat}</span>
            </div>
          </div>

          {/* School sign footer */}
          <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between print:hidden">
            <span>Satuan Pendidikan: <strong>{school.namaSekolah}</strong></span>
            <span>NPSN: {school.npsn}</span>
          </div>

          {/* Formal Signatures on Print */}
          <div className="hidden print:grid grid-cols-2 gap-8 pt-6 mt-4 text-xs text-black border-t border-gray-400 break-inside-avoid">
            <div className="text-center">
              <p>Mengetahui,</p>
              <p className="font-semibold">Kepala Sekolah</p>
              <div className="h-16" />
              <p className="font-bold underline">{school.kepalaSekolah || school.namaKepalaSekolah}</p>
              <p className="text-[11px] font-mono text-gray-700">NIP. {school.nipKepalaSekolah || '-'}</p>
            </div>
            <div className="text-center">
              <p>{school.kabupatenKota || 'Tempat'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p className="font-semibold">Pendidik / Tenaga Kependidikan Ybs,</p>
              <div className="h-16" />
              <p className="font-bold underline">{teacher.namaLengkap}</p>
              <p className="text-[11px] font-mono text-gray-700">NIP. {teacher.nip || '-'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
