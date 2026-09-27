import React from 'react';
import { Student, SchoolProfile } from '../types';
import { 
  X, 
  GraduationCap, 
  Award, 
  ExternalLink,
  LogOut,
  FileSpreadsheet,
  Printer,
  Edit3,
  Camera
} from 'lucide-react';
import { exportSingleStudentExcel } from '../utils/excelReportUtils';
import { printDocumentWithA4 } from '../utils/exportUtils';
import { OfficialSchoolKop } from './OfficialSchoolKop';

interface StudentDetailModalProps {
  student: Student | null;
  school: SchoolProfile;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (student: Student) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  student,
  school,
  isOpen,
  onClose,
  onEdit
}) => {
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

  if (!isOpen || !student) return null;

  const handlePrintDocument = () => {
    printDocumentWithA4({
      orientation: 'portrait',
      title: `Buku_Induk_${student.namaLengkap.replace(/\s+/g, '_')}_NIS_${student.nis || student.id}`
    });
  };

  const handleExportExcel = () => {
    exportSingleStudentExcel(student, school);
  };

  const calculateAge = (birthdate: string) => {
    if (!birthdate) return '-';
    const diffMs = Date.now() - new Date(birthdate).getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  const getFase = (kelasStr: string) => {
    const digit = parseInt(kelasStr?.charAt(0) || '1');
    if (digit <= 2) return 'Fase A (Kelas 1-2)';
    if (digit <= 4) return 'Fase B (Kelas 3-4)';
    return 'Fase C (Kelas 5-6)';
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto print:static print:inset-auto print:p-0 print:m-0 print:bg-white print:overflow-visible print:block print:z-auto">
      <div className="max-w-4xl w-full my-4 flex flex-col max-h-[94vh] print:max-h-none print:my-0 print:p-0 print:max-w-none print:w-full print:block print:static">
        {/* Sticky Action Navigation Bar (Hidden on Print) */}
        <div className="bg-slate-900 border border-slate-800 text-white rounded-t-2xl p-3 sm:p-4 flex items-center justify-between shadow-xl shrink-0 flex-wrap gap-2 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-300">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                Lembar Buku Induk Peserta Didik
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 font-medium">
                  Model Buku Induk SD
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Arsip Data Pokok & Riwayat Pendidikan Peserta Didik
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-colors cursor-pointer"
              title="Unduh format Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Simpan</span> Excel
            </button>
            <button
              onClick={handlePrintDocument}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold transition-colors cursor-pointer shadow-sm"
              title="Cetak Dokumen via Printer atau Simpan ke file PDF"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onEdit(student);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
              title="Edit Biodata Siswa Ini"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Data</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              title="Tutup Jendela"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Paper Container */}
        <div 
          id="printable-buku-induk-document"
          className="bg-white text-slate-900 border border-slate-300 rounded-b-2xl shadow-2xl p-6 sm:p-8 overflow-y-auto print:p-0 print:m-0 print:border-none print:shadow-none print:rounded-none a4-portrait-sheet font-sans print:overflow-visible print:block"
        >
          {/* Official Kop Sekolah */}
          <OfficialSchoolKop school={school} className="mb-2" />

          {/* Double Separator Line */}
          <div className="border-t-2 border-b border-black my-2 py-0.5" />

          {/* Document Title Header */}
          <div className="text-center my-3">
            <h1 className="text-base sm:text-lg font-extrabold uppercase tracking-wide text-black leading-tight">
              LEMBAR BUKU INDUK PESERTA DIDIK
            </h1>
            <p className="text-xs font-semibold text-slate-800 uppercase tracking-wider mt-0.5">
              SEKOLAH DASAR (SD) • TAHUN PELAJARAN {school.tahunAjaran}
            </p>
          </div>

          {/* Header Metadata Bar */}
          <div className="bg-slate-50 border border-slate-400 rounded-lg px-3 py-2 text-xs flex flex-wrap items-center justify-between gap-2 mb-4 text-slate-800">
            <div className="flex items-center gap-3 flex-wrap">
              <div>
                <span className="text-slate-600 font-medium">Nomor Induk Siswa (NIS): </span>
                <strong className="font-mono text-black">{student.nis}</strong>
              </div>
              <span className="text-slate-300">|</span>
              <div>
                <span className="text-slate-600 font-medium">NISN: </span>
                <strong className="font-mono text-black">{student.nisn}</strong>
              </div>
              <span className="text-slate-300">|</span>
              <div>
                <span className="text-slate-600 font-medium">Kelas / Fase: </span>
                <strong className="text-black">Kelas {student.kelas} ({getFase(student.kelas)})</strong>
              </div>
            </div>
            <div>
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border uppercase ${
                student.statusSiswa === 'Aktif'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-400'
                  : student.statusSiswa === 'Lulus'
                  ? 'bg-blue-50 text-blue-800 border-blue-400'
                  : student.statusSiswa === 'Pindah'
                  ? 'bg-amber-50 text-amber-800 border-amber-400'
                  : 'bg-rose-50 text-rose-800 border-rose-400'
              }`}>
                Status: {student.statusSiswa === 'Pindah' ? 'Pindah / Mutasi' : student.statusSiswa === 'Non-Aktif' ? 'Drop Out / Keluar' : student.statusSiswa}
              </span>
            </div>
          </div>

          {/* Top Identity Block with 3:4 Aspect Ratio Photo Frame */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-start justify-between gap-4 p-4 rounded-xl border border-slate-300 bg-slate-50/70 mb-4">
            {/* Quick Profile Summary */}
            <div className="flex-1 min-w-0 space-y-1.5 text-xs text-slate-800">
              <div className="flex items-baseline gap-2 flex-wrap">
                <h2 className="text-lg font-black text-black tracking-tight">
                  {student.namaLengkap}
                </h2>
                {student.namaPanggilan && (
                  <span className="text-xs font-semibold text-slate-600">
                    (Panggilan: <strong className="text-black">{student.namaPanggilan}</strong>)
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs pt-1 border-t border-slate-200">
                <div className="flex"><span className="w-28 text-slate-600 font-medium">Jenis Kelamin</span><span className="font-semibold">: {student.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}</span></div>
                <div className="flex"><span className="w-28 text-slate-600 font-medium">Tempat, Tgl Lahir</span><span className="font-semibold">: {student.tempatLahir}, {student.tanggalLahir}</span></div>
                <div className="flex"><span className="w-28 text-slate-600 font-medium">Usia Siswa</span><span>: {calculateAge(student.tanggalLahir)} Tahun</span></div>
                <div className="flex"><span className="w-28 text-slate-600 font-medium">Agama</span><span className="font-semibold">: {student.agama}</span></div>
                <div className="flex"><span className="w-28 text-slate-600 font-medium">Tanggal Masuk SD</span><span>: {student.tanggalMasuk}</span></div>
                <div className="flex"><span className="w-28 text-slate-600 font-medium">Status Keluarga</span><span>: Anak ke-{student.anakKe || 1} dari {student.jumlahSaudara || 1} bersaudara</span></div>
              </div>
            </div>

            {/* Pas Foto Resmi Rasio 3:4 Standar Indonesia */}
            <div className="shrink-0 flex flex-col items-center self-center sm:self-start">
              <div 
                className="w-[114px] h-[152px] aspect-[3/4] border-2 border-slate-800 p-0.5 bg-white shadow-xs flex flex-col items-center justify-center relative overflow-hidden"
                title="Pas Foto Resmi Siswa (Rasio 3:4)"
              >
                {student.fotoUrl ? (
                  <img
                    src={student.fotoUrl}
                    alt={student.namaLengkap}
                    className="w-full h-full object-cover object-top"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full border border-dashed border-slate-400 bg-slate-50 flex flex-col items-center justify-center text-center p-1.5">
                    <Camera className="w-5 h-5 text-slate-400 mb-1" />
                    <span className="text-[9px] font-extrabold uppercase text-slate-700 leading-tight">
                      PAS FOTO
                    </span>
                    <span className="text-[9px] font-mono font-bold text-slate-600 mt-0.5">
                      3 × 4 CM
                    </span>
                    <span className="text-[7.5px] text-slate-400 leading-tight mt-1">
                      Cap Stempel Tiga Jari
                    </span>
                  </div>
                )}
              </div>
              <span className="text-[8.5px] font-bold tracking-wider text-slate-700 uppercase mt-1">
                Pas Foto 3 × 4
              </span>
            </div>
          </div>

          {/* Mutasi Details (if student transferred) */}
          {student.statusSiswa === 'Pindah' && (
            <div className="bg-amber-50 border border-amber-400 rounded-lg p-3 flex items-start gap-2.5 text-xs text-amber-950 mb-4">
              <ExternalLink className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5 flex-1">
                <div className="font-bold text-amber-900">
                  Keterangan Mutasi / Pindah Sekolah:
                </div>
                <div className="flex flex-wrap gap-x-4">
                  <div>Sekolah Tujuan: <strong className="text-black">{student.sekolahTujuan || 'Belum dicatat'}</strong></div>
                  {student.tanggalMutasi && <div>Tanggal Mutasi: <span className="font-mono font-semibold text-black">{student.tanggalMutasi}</span></div>}
                </div>
              </div>
            </div>
          )}

          {/* Drop Out Details (if student dropped out) */}
          {student.statusSiswa === 'Non-Aktif' && (
            <div className="bg-rose-50 border border-rose-400 rounded-lg p-3 flex items-start gap-2.5 text-xs text-rose-950 mb-4">
              <LogOut className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5 flex-1">
                <div className="font-bold text-rose-900">
                  Keterangan Non-Aktif / Drop Out / Berhenti:
                </div>
                <div className="flex flex-wrap gap-x-4">
                  <div>Alasan Keluar: <strong className="text-black">{student.alasanKeluar || 'Tidak ada keterangan'}</strong></div>
                  {student.tanggalKeluar && <div>Tanggal Keluar: <span className="font-mono font-semibold text-black">{student.tanggalKeluar}</span></div>}
                </div>
              </div>
            </div>
          )}

          {/* Form Registrasi Standar Buku Induk SD (A s.d. F) */}
          <div className="space-y-3.5 text-xs">
            {/* Bagian A: Diri Siswa */}
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <div className="bg-slate-100 px-3 py-1.5 font-bold uppercase text-[11px] text-slate-900 border-b border-slate-300">
                A. KETERANGAN TENTANG DIRI PESERTA DIDIK
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-slate-800">
                <div className="flex"><span className="w-44 text-slate-600 font-medium">1. Nama Lengkap</span><span className="font-bold text-black">: {student.namaLengkap}</span></div>
                <div className="flex"><span className="w-44 text-slate-600 font-medium">2. Nama Panggilan</span><span>: {student.namaPanggilan || '-'}</span></div>
                <div className="flex"><span className="w-44 text-slate-600 font-medium">3. Nomor Induk Siswa (NIS)</span><span className="font-mono font-semibold">: {student.nis}</span></div>
                <div className="flex"><span className="w-44 text-slate-600 font-medium">4. NISN</span><span className="font-mono font-semibold">: {student.nisn}</span></div>
                <div className="flex"><span className="w-44 text-slate-600 font-medium">5. Jenis Kelamin</span><span>: {student.jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}</span></div>
                <div className="flex"><span className="w-44 text-slate-600 font-medium">6. Tempat, Tanggal Lahir</span><span>: {student.tempatLahir}, {student.tanggalLahir}</span></div>
                <div className="flex"><span className="w-44 text-slate-600 font-medium">7. Agama & Kepercayaan</span><span>: {student.agama}</span></div>
                <div className="flex"><span className="w-44 text-slate-600 font-medium">8. Kewarganegaraan</span><span>: Warga Negara Indonesia (WNI)</span></div>
                <div className="flex"><span className="w-44 text-slate-600 font-medium">9. Anak ke berapa</span><span>: Ke-{student.anakKe || 1} dari {student.jumlahSaudara || 1} bersaudara</span></div>
                <div className="flex"><span className="w-44 text-slate-600 font-medium">10. Status Peserta Didik</span><span className="font-semibold">: {student.statusSiswa}</span></div>
              </div>
            </div>

            {/* Bagian B: Tempat Tinggal */}
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <div className="bg-slate-100 px-3 py-1.5 font-bold uppercase text-[11px] text-slate-900 border-b border-slate-300">
                B. KETERANGAN TEMPAT TINGGAL
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-slate-800">
                <div className="flex sm:col-span-2"><span className="w-44 text-slate-600 font-medium">11. Alamat Tempat Tinggal</span><span className="font-semibold">: {student.alamat || '-'}</span></div>
                <div className="flex"><span className="w-44 text-slate-600 font-medium">12. RT / RW</span><span>: {student.rtRw || '-'}</span></div>
                <div className="flex"><span className="w-44 text-slate-600 font-medium">13. Desa / Kelurahan</span><span>: {student.kelurahan || '-'}</span></div>
                <div className="flex"><span className="w-44 text-slate-600 font-medium">14. Kecamatan</span><span>: {student.kecamatan || '-'}</span></div>
                <div className="flex"><span className="w-44 text-slate-600 font-medium">15. Kabupaten / Kota</span><span>: {student.kabupatenKota || school.kabupatenKota || '-'}</span></div>
                <div className="flex"><span className="w-44 text-slate-600 font-medium">16. Provinsi</span><span>: {student.provinsi || school.provinsi || '-'}</span></div>
                <div className="flex"><span className="w-44 text-slate-600 font-medium">17. No. Telp / WhatsApp</span><span className="font-semibold text-blue-700">: {student.noHpOrtu || '-'}</span></div>
                <div className="flex"><span className="w-44 text-slate-600 font-medium">18. Tinggal Bersama</span><span>: {student.namaWali ? `Wali (${student.hubunganWali || 'Wali Siswa'})` : 'Orang Tua Kandung'}</span></div>
              </div>
            </div>

            {/* Bagian C: Kesehatan & Jasmani */}
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <div className="bg-slate-100 px-3 py-1.5 font-bold uppercase text-[11px] text-slate-900 border-b border-slate-300">
                C. KETERANGAN KESEHATAN DAN JASMANI
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-slate-800">
                <div className="flex">
                  <span className="w-44 text-slate-600 font-medium">19. Berat Badan</span>
                  <span className="font-mono font-semibold">: {student.beratBadan ? `${student.beratBadan} kg` : '26 kg (Standar Usia)'}</span>
                </div>
                <div className="flex">
                  <span className="w-44 text-slate-600 font-medium">20. Tinggi Badan</span>
                  <span className="font-mono font-semibold">: {student.tinggiBadan ? `${student.tinggiBadan} cm` : '128 cm (Standar Usia)'}</span>
                </div>
                <div className="flex sm:col-span-2">
                  <span className="w-44 text-slate-600 font-medium shrink-0">21. Riwayat Kesehatan</span>
                  <span className="italic">: {student.catatanKesehatan || 'Pendengaran, penglihatan, dan kesehatan gigi dalam kondisi baik.'}</span>
                </div>
              </div>
            </div>

            {/* Bagian D: Orang Tua / Wali */}
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <div className="bg-slate-100 px-3 py-1.5 font-bold uppercase text-[11px] text-slate-900 border-b border-slate-300">
                D. KETERANGAN ORANG TUA KANDUNG / WALI
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-slate-800">
                <div className="flex"><span className="w-44 text-slate-600 font-medium">22. Nama Ayah Kandung</span><span className="font-semibold text-black">: {student.namaAyah || '-'}</span></div>
                <div className="flex"><span className="w-44 text-slate-600 font-medium">23. Pekerjaan Ayah</span><span>: {student.pekerjaanAyah || '-'}</span></div>
                <div className="flex"><span className="w-44 text-slate-600 font-medium">24. Nama Ibu Kandung</span><span className="font-semibold text-black">: {student.namaIbu || '-'}</span></div>
                <div className="flex"><span className="w-44 text-slate-600 font-medium">25. Pekerjaan Ibu</span><span>: {student.pekerjaanIbu || '-'}</span></div>
                <div className="flex sm:col-span-2"><span className="w-44 text-slate-600 font-medium">26. Alamat Orang Tua</span><span>: {student.alamatOrtu || student.alamat || '-'}</span></div>
                {student.namaWali && (
                  <>
                    <div className="flex"><span className="w-44 text-slate-600 font-medium">27. Nama Wali Siswa</span><span className="font-semibold text-black">: {student.namaWali}</span></div>
                    <div className="flex"><span className="w-44 text-slate-600 font-medium">28. Hubungan Keluarga</span><span>: {student.hubunganWali || 'Wali Siswa'}</span></div>
                    <div className="flex"><span className="w-44 text-slate-600 font-medium">29. Pekerjaan Wali</span><span>: {student.pekerjaanWali || '-'}</span></div>
                    <div className="flex"><span className="w-44 text-slate-600 font-medium">30. Kontak Wali</span><span>: {student.noHpWali || '-'}</span></div>
                  </>
                )}
              </div>
            </div>

            {/* Bagian E: Pendidikan Sebelumnya & Prestasi */}
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <div className="bg-slate-100 px-3 py-1.5 font-bold uppercase text-[11px] text-slate-900 border-b border-slate-300">
                E. PENDIDIKAN SEBELUMNYA DAN PRESTASI SISWA
              </div>
              <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-slate-800">
                <div className="flex sm:col-span-2"><span className="w-44 text-slate-600 font-medium">31. Pendidikan Sebelumnya</span><span className="font-semibold">: {student.pendidikanSebelumnya || 'TK / PAUD / RA'}</span></div>
                <div className="flex"><span className="w-44 text-slate-600 font-medium">32. Tanggal Diterima Masuk</span><span className="font-semibold">: {student.tanggalMasuk || '-'}</span></div>
                <div className="flex"><span className="w-44 text-slate-600 font-medium">33. Masuk di Tingkat / Kelas</span><span className="font-semibold">: Kelas {student.diterimaDiKelas || student.kelas}</span></div>
                <div className="flex sm:col-span-2">
                  <span className="w-44 text-slate-600 font-medium shrink-0">34. Prestasi / Bakat Siswa</span>
                  <span>: {student.catatanPrestasi || 'Aktif mengikuti pembelajaran dan kegiatan intrakurikuler sekolah.'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Lembar Pengesahan Resmi Buku Induk (3 Kolom Formal Standar SD) */}
          <div className="pt-6 mt-6 border-t-2 border-slate-300 grid grid-cols-3 gap-4 text-xs text-black break-inside-avoid">
            <div className="text-center">
              <p className="text-slate-600">Mengetahui,</p>
              <p className="font-bold">Orang Tua / Wali Siswa</p>
              <div className="h-16" />
              <p className="font-bold underline uppercase">{student.namaAyah || student.namaWali || student.namaIbu || 'Orang Tua Siswa'}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Tanda Tangan & Nama Terang</p>
            </div>

            <div className="text-center">
              <p className="text-slate-600">Dicatat oleh,</p>
              <p className="font-bold">Guru Kelas / Petugas Buku Induk</p>
              <div className="h-16" />
              <p className="font-bold underline uppercase">Petugas Buku Induk</p>
              <p className="text-[10px] font-mono text-slate-500 mt-0.5">NIP. .........................................</p>
            </div>

            <div className="text-center">
              <p className="text-slate-600">
                {school.kabupatenKota || 'Tempat'}, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <p className="font-bold">Kepala Sekolah</p>
              <div className="h-16" />
              <p className="font-bold underline uppercase">
                {school.kepalaSekolah || school.namaKepalaSekolah || 'Kepala Sekolah SD'}
              </p>
              <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                NIP. {school.nipKepalaSekolah || '-'}
              </p>
            </div>
          </div>

          {/* Footer Ledger Notice */}
          <div className="pt-4 mt-4 border-t border-slate-200 text-[9.5px] text-slate-500 flex items-center justify-between">
            <span>Satuan Pendidikan: <strong>{school.namaSekolah}</strong> (NPSN: {school.npsn})</span>
            <span className="font-mono">Lembar Buku Induk Nomor: {student.nis} / {student.nisn}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
