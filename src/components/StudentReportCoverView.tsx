import React from 'react';
import { Student, SchoolProfile, Teacher } from '../types';
import { formatReportDateIndonesian } from '../utils/reportAttendanceUtils';
import { User, Award } from 'lucide-react';

interface StudentReportCoverPageProps {
  student?: Student;
  school: SchoolProfile;
  className?: string;
  blankMode?: boolean;
}

interface StudentReportBiodataPageProps {
  student: Student;
  school: SchoolProfile;
  printDate: string;
  printPlace: string;
  waliKelas?: Teacher;
  className?: string;
}

/**
 * Official Tut Wuri Handayani Logo with local vector SVG and Wikimedia fallback
 */
export const TutWuriHandayaniLogo: React.FC<{ size?: number; className?: string }> = ({ 
  size = 145, 
  className = '' 
}) => {
  const [imgError, setImgError] = React.useState(false);

  if (!imgError) {
    return (
      <img
        src="/logo_tut_wuri_handayani.svg"
        alt="Logo Tut Wuri Handayani"
        style={{ width: `${size}px`, height: `${size}px` }}
        className={`object-contain mx-auto print:block ${className}`}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
      />
    );
  }

  // Fallback to official Wikimedia SVG if local asset fails
  return (
    <img
      src="https://upload.wikimedia.org/wikipedia/commons/9/9c/Logo_of_Ministry_of_Education_and_Culture_of_Republic_of_Indonesia.svg"
      alt="Logo Tut Wuri Handayani"
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`object-contain mx-auto print:block ${className}`}
      crossOrigin="anonymous"
      referrerPolicy="no-referrer"
    />
  );
};

/**
 * Garuda Pancasila Official Emblem with high-resolution image and SVG fallback
 */
export const GarudaEmblem: React.FC<{ size?: number; className?: string }> = ({ 
  size = 140, 
  className = '' 
}) => {
  const [imgError, setImgError] = React.useState(false);

  if (!imgError) {
    return (
      <img
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Coat_of_arms_of_Indonesia.svg/300px-Coat_of_arms_of_Indonesia.svg.png"
        alt="Lambang Negara Garuda Pancasila"
        style={{ width: `${size}px`, height: 'auto' }}
        className={`object-contain mx-auto print:block ${className}`}
        crossOrigin="anonymous"
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
      />
    );
  }

  // High-fidelity SVG Fallback if image fails or offline
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`mx-auto text-amber-600 ${className}`}
      fill="currentColor"
    >
      <circle cx="50" cy="50" r="46" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" />
      {/* Eagle silhouette */}
      <path
        d="M50 15 C45 22 35 25 25 35 C20 40 18 50 20 60 C25 55 30 50 35 48 C30 55 28 65 32 72 C36 68 40 62 44 58 C42 66 43 75 48 80 L52 80 C57 75 58 66 56 58 C60 62 64 68 68 72 C72 65 70 55 65 48 C70 50 75 55 80 60 C82 50 80 40 75 35 C65 25 55 22 50 15 Z"
        fill="#B45309"
      />
      {/* Shield */}
      <path
        d="M40 42 L60 42 L60 58 C60 66 50 72 50 72 C50 72 40 66 40 58 Z"
        fill="#DC2626"
        stroke="#1E293B"
        strokeWidth="1.5"
      />
      <circle cx="50" cy="54" r="5" fill="#FBBF24" />
      {/* Banner */}
      <path
        d="M32 78 Q50 84 68 78 L66 84 Q50 89 34 84 Z"
        fill="#FFFFFF"
        stroke="#1E293B"
        strokeWidth="1"
      />
      <text
        x="50"
        y="83"
        fontSize="3.5"
        fontWeight="bold"
        textAnchor="middle"
        fill="#1E293B"
      >
        BHINNEKA TUNGGAL IKA
      </text>
    </svg>
  );
};

/**
 * Halaman 1: Sampul Rapor Peserta Didik (Kurikulum Merdeka)
 * Format resmi sesuai standar Kementerian Pendidikan Dasar dan Menengah RI
 * Dilengkapi Logo Tut Wuri Handayani berwarna di tengah antara judul dan nama peserta didik
 */
export const StudentReportCoverPage: React.FC<StudentReportCoverPageProps> = ({
  student,
  school: _school,
  className = '',
  blankMode = false
}) => {
  return (
    <div 
      className={`bg-white text-black mx-auto a4-portrait-sheet relative font-sans select-text print:break-inside-avoid ${className}`}
    >
      <div 
        className="w-full flex flex-col justify-between items-center text-center px-8 sm:px-14 md:px-16 pt-10 sm:pt-14 pb-10 sm:pb-12 min-h-[1050px] print:min-h-[268mm] print:h-[268mm] print:px-10 print:pt-10 print:pb-8 box-border"
      >
        {/* 1. Header Judul Rapor */}
        <div className="w-full space-y-2 pt-2 sm:pt-4 shrink-0">
          <h1 className="text-2xl sm:text-[26px] font-black tracking-[0.12em] uppercase text-black leading-tight">
            RAPOR PESERTA DIDIK
          </h1>
          <h2 className="text-lg sm:text-[20px] font-extrabold tracking-[0.08em] uppercase text-black">
            (KURIKULUM MERDEKA)
          </h2>
        </div>

        {/* 2. Logo Tut Wuri Handayani - Ditempatkan pas di tengah antara judul Kurikulum Merdeka dan nama siswa */}
        <div className="w-full flex-1 flex items-center justify-center my-4 sm:my-6 py-2 min-h-[180px]">
          <TutWuriHandayaniLogo size={155} className="drop-shadow-xs select-none" />
        </div>

        {/* 3. Identitas Peserta Didik */}
        <div className="w-full max-w-lg space-y-5 shrink-0 pt-1 pb-2">
          <div className="space-y-1.5">
            <p className="text-[15px] sm:text-base font-bold tracking-wide text-black">
              Nama Peserta Didik:
            </p>
            <div className="w-full max-w-md mx-auto pt-0.5">
              <div className="min-h-[28px] flex items-center justify-center">
                <span className="text-base sm:text-lg font-bold uppercase tracking-wider text-black">
                  {blankMode ? '' : (student?.namaLengkap || '')}
                </span>
              </div>
              {/* Garis titik-titik persis seperti di template dokumen */}
              <div className="border-b-2 border-dotted border-black w-full" />
            </div>
          </div>

          <div className="space-y-1 pt-1">
            <div className="flex items-baseline justify-center gap-2 text-[15px] sm:text-base font-bold text-black flex-wrap">
              <span className="shrink-0">NIS / NISN:</span>
              <span className="font-semibold tracking-wider min-w-[270px] inline-block text-center border-b-2 border-dotted border-black pb-0.5 text-black">
                {blankMode 
                  ? '' 
                  : (student?.nis && student?.nisn 
                      ? `${student.nis} / ${student.nisn}` 
                      : (student?.nisn || student?.nis || ''))
                }
              </span>
            </div>
          </div>
        </div>

        {/* 4. Spacer Penyeimbang Menuju Footer */}
        <div className="w-full flex-1 min-h-[40px] max-h-[100px]" />

        {/* 5. Footer Instansi Kementerian Pendidikan Dasar dan Menengah */}
        <div className="w-full text-center space-y-1 shrink-0 pb-2 sm:pb-4">
          <p className="text-[14px] sm:text-[15px] font-extrabold tracking-[0.08em] uppercase text-black leading-tight">
            KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH
          </p>
          <p className="text-[14px] sm:text-[15px] font-extrabold tracking-[0.1em] uppercase text-black leading-tight">
            REPUBLIK INDONESIA
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Halaman 2: Keterangan tentang Diri Peserta Didik (Buku Rapor Resmi SD)
 */
export const StudentReportBiodataPage: React.FC<StudentReportBiodataPageProps> = ({
  student,
  school,
  printDate,
  printPlace,
  waliKelas,
  className = ''
}) => {
  const formattedDate = formatReportDateIndonesian(printDate);
  const city = printPlace || school.kabupatenKota || 'Tempat';

  return (
    <div 
      className={`bg-white text-black p-8 sm:p-10 mx-auto a4-portrait-sheet font-sans text-[11px] leading-relaxed select-text ${className}`}
      style={{ boxSizing: 'border-box' }}
    >
      {/* Document Title */}
      <div className="text-center mb-6">
        <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider underline">
          KETERANGAN TENTANG DIRI PESERTA DIDIK
        </h2>
      </div>

      {/* Form Content (Daftar Biodata Rapor Resmi SD) */}
      <div className="space-y-1.5 text-slate-900">
        
        <div className="flex items-start">
          <span className="w-6 text-right pr-2 shrink-0">1.</span>
          <span className="w-56 shrink-0 font-medium">Nama Peserta Didik (Lengkap)</span>
          <span className="w-4 shrink-0 text-center">:</span>
          <span className="font-bold uppercase tracking-wide text-black">{student.namaLengkap}</span>
        </div>

        <div className="flex items-start">
          <span className="w-6 text-right pr-2 shrink-0">2.</span>
          <span className="w-56 shrink-0 font-medium">Nomor Induk Siswa (NIS)</span>
          <span className="w-4 shrink-0 text-center">:</span>
          <span className="font-mono font-semibold">{student.nis}</span>
        </div>

        <div className="flex items-start">
          <span className="w-6 text-right pr-2 shrink-0">3.</span>
          <span className="w-56 shrink-0 font-medium">Nomor Induk Siswa Nasional (NISN)</span>
          <span className="w-4 shrink-0 text-center">:</span>
          <span className="font-mono font-semibold">{student.nisn}</span>
        </div>

        <div className="flex items-start">
          <span className="w-6 text-right pr-2 shrink-0">4.</span>
          <span className="w-56 shrink-0 font-medium">Tempat, Tanggal Lahir</span>
          <span className="w-4 shrink-0 text-center">:</span>
          <span>{student.tempatLahir}, {student.tanggalLahir}</span>
        </div>

        <div className="flex items-start">
          <span className="w-6 text-right pr-2 shrink-0">5.</span>
          <span className="w-56 shrink-0 font-medium">Jenis Kelamin</span>
          <span className="w-4 shrink-0 text-center">:</span>
          <span>{student.jenisKelamin === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
        </div>

        <div className="flex items-start">
          <span className="w-6 text-right pr-2 shrink-0">6.</span>
          <span className="w-56 shrink-0 font-medium">Agama dan Kepercayaan</span>
          <span className="w-4 shrink-0 text-center">:</span>
          <span>{student.agama}</span>
        </div>

        <div className="flex items-start">
          <span className="w-6 text-right pr-2 shrink-0">7.</span>
          <span className="w-56 shrink-0 font-medium">Pendidikan Sebelumnya</span>
          <span className="w-4 shrink-0 text-center">:</span>
          <span>{student.pendidikanSebelumnya || 'TK / PAUD / RA'}</span>
        </div>

        <div className="flex items-start">
          <span className="w-6 text-right pr-2 shrink-0">8.</span>
          <span className="w-56 shrink-0 font-medium">Alamat Peserta Didik</span>
          <span className="w-4 shrink-0 text-center">:</span>
          <span className="font-medium">{student.alamat || '-'}</span>
        </div>

        {/* Sub-item Alamat */}
        <div className="pl-6 space-y-1">
          <div className="flex items-start">
            <span className="w-5 text-right pr-2 shrink-0">a.</span>
            <span className="w-52 shrink-0 text-slate-700">RT / RW</span>
            <span className="w-4 shrink-0 text-center">:</span>
            <span>{student.rtRw || '-'}</span>
          </div>
          <div className="flex items-start">
            <span className="w-5 text-right pr-2 shrink-0">b.</span>
            <span className="w-52 shrink-0 text-slate-700">Kelurahan / Desa</span>
            <span className="w-4 shrink-0 text-center">:</span>
            <span>{student.kelurahan || '-'}</span>
          </div>
          <div className="flex items-start">
            <span className="w-5 text-right pr-2 shrink-0">c.</span>
            <span className="w-52 shrink-0 text-slate-700">Kecamatan</span>
            <span className="w-4 shrink-0 text-center">:</span>
            <span>{student.kecamatan || '-'}</span>
          </div>
          <div className="flex items-start">
            <span className="w-5 text-right pr-2 shrink-0">d.</span>
            <span className="w-52 shrink-0 text-slate-700">Kabupaten / Kota</span>
            <span className="w-4 shrink-0 text-center">:</span>
            <span>{student.kabupatenKota || school.kabupatenKota || '-'}</span>
          </div>
          <div className="flex items-start">
            <span className="w-5 text-right pr-2 shrink-0">e.</span>
            <span className="w-52 shrink-0 text-slate-700">Provinsi</span>
            <span className="w-4 shrink-0 text-center">:</span>
            <span>{student.provinsi || school.provinsi || 'Jawa Timur'}</span>
          </div>
        </div>

        {/* Data Orang Tua */}
        <div className="flex items-start pt-1">
          <span className="w-6 text-right pr-2 shrink-0">9.</span>
          <span className="w-56 shrink-0 font-medium">Data Orang Tua Kandung</span>
          <span className="w-4 shrink-0 text-center">:</span>
          <span></span>
        </div>

        <div className="pl-6 space-y-1">
          <div className="flex items-start">
            <span className="w-5 text-right pr-2 shrink-0">a.</span>
            <span className="w-52 shrink-0 text-slate-700">Nama Ayah</span>
            <span className="w-4 shrink-0 text-center">:</span>
            <span className="font-semibold text-black">{student.namaAyah || '-'}</span>
          </div>
          <div className="flex items-start">
            <span className="w-5 text-right pr-2 shrink-0">b.</span>
            <span className="w-52 shrink-0 text-slate-700">Pekerjaan Ayah</span>
            <span className="w-4 shrink-0 text-center">:</span>
            <span>{student.pekerjaanAyah || '-'}</span>
          </div>
          <div className="flex items-start">
            <span className="w-5 text-right pr-2 shrink-0">c.</span>
            <span className="w-52 shrink-0 text-slate-700">Nama Ibu</span>
            <span className="w-4 shrink-0 text-center">:</span>
            <span className="font-semibold text-black">{student.namaIbu || '-'}</span>
          </div>
          <div className="flex items-start">
            <span className="w-5 text-right pr-2 shrink-0">d.</span>
            <span className="w-52 shrink-0 text-slate-700">Pekerjaan Ibu</span>
            <span className="w-4 shrink-0 text-center">:</span>
            <span>{student.pekerjaanIbu || '-'}</span>
          </div>
          <div className="flex items-start">
            <span className="w-5 text-right pr-2 shrink-0">e.</span>
            <span className="w-52 shrink-0 text-slate-700">Alamat Orang Tua</span>
            <span className="w-4 shrink-0 text-center">:</span>
            <span>{student.alamatOrtu || student.alamat || '-'}</span>
          </div>
          <div className="flex items-start">
            <span className="w-5 text-right pr-2 shrink-0">f.</span>
            <span className="w-52 shrink-0 text-slate-700">Nomor Telepon / HP</span>
            <span className="w-4 shrink-0 text-center">:</span>
            <span className="font-mono">{student.noHpOrtu || '-'}</span>
          </div>
        </div>

        {/* Data Wali */}
        <div className="flex items-start pt-1">
          <span className="w-6 text-right pr-2 shrink-0">10.</span>
          <span className="w-56 shrink-0 font-medium">Data Wali Peserta Didik</span>
          <span className="w-4 shrink-0 text-center">:</span>
          <span></span>
        </div>

        <div className="pl-6 space-y-1">
          <div className="flex items-start">
            <span className="w-5 text-right pr-2 shrink-0">a.</span>
            <span className="w-52 shrink-0 text-slate-700">Nama Wali</span>
            <span className="w-4 shrink-0 text-center">:</span>
            <span>{student.namaWali || '-'}</span>
          </div>
          <div className="flex items-start">
            <span className="w-5 text-right pr-2 shrink-0">b.</span>
            <span className="w-52 shrink-0 text-slate-700">Hubungan Keluarga</span>
            <span className="w-4 shrink-0 text-center">:</span>
            <span>{student.hubunganWali || (student.namaWali ? 'Wali Siswa' : '-')}</span>
          </div>
          <div className="flex items-start">
            <span className="w-5 text-right pr-2 shrink-0">c.</span>
            <span className="w-52 shrink-0 text-slate-700">Pekerjaan Wali</span>
            <span className="w-4 shrink-0 text-center">:</span>
            <span>{student.pekerjaanWali || '-'}</span>
          </div>
          <div className="flex items-start">
            <span className="w-5 text-right pr-2 shrink-0">d.</span>
            <span className="w-52 shrink-0 text-slate-700">Alamat Wali</span>
            <span className="w-4 shrink-0 text-center">:</span>
            <span>{student.alamatWali || (student.namaWali ? student.alamat : '-')}</span>
          </div>
          <div className="flex items-start">
            <span className="w-5 text-right pr-2 shrink-0">e.</span>
            <span className="w-52 shrink-0 text-slate-700">Nomor Telepon / HP Wali</span>
            <span className="w-4 shrink-0 text-center">:</span>
            <span className="font-mono">{student.noHpWali || '-'}</span>
          </div>
        </div>

        {/* Diterima di Sekolah Ini */}
        <div className="flex items-start pt-1">
          <span className="w-6 text-right pr-2 shrink-0">11.</span>
          <span className="w-56 shrink-0 font-medium">Diterima di Sekolah Ini</span>
          <span className="w-4 shrink-0 text-center">:</span>
          <span></span>
        </div>

        <div className="pl-6 space-y-1">
          <div className="flex items-start">
            <span className="w-5 text-right pr-2 shrink-0">a.</span>
            <span className="w-52 shrink-0 text-slate-700">Di Kelas</span>
            <span className="w-4 shrink-0 text-center">:</span>
            <span className="font-semibold">Kelas {student.diterimaDiKelas || student.kelas}</span>
          </div>
          <div className="flex items-start">
            <span className="w-5 text-right pr-2 shrink-0">b.</span>
            <span className="w-52 shrink-0 text-slate-700">Pada Tanggal</span>
            <span className="w-4 shrink-0 text-center">:</span>
            <span className="font-mono">{student.tanggalMasuk || '-'}</span>
          </div>
        </div>

      </div>

      {/* Bagian Pas Foto 3x4 & Pengesahan Kepala Sekolah */}
      <div className="mt-8 pt-4 flex justify-between items-end break-inside-avoid">
        {/* Kotak Pas Foto 3x4 */}
        <div className="pl-8 text-center">
          <div className="w-[30mm] h-[40mm] border border-black flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden shadow-xs mx-auto">
            {student.fotoUrl ? (
              <img
                src={student.fotoUrl}
                alt={`Foto ${student.namaLengkap}`}
                className="w-full h-full object-cover"
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="p-2 space-y-1 text-slate-400">
                <User className="w-6 h-6 mx-auto stroke-1 text-slate-400" />
                <span className="text-[10px] font-sans font-medium block leading-tight text-slate-500">
                  Pas Foto<br />3 × 4 cm
                </span>
              </div>
            )}
          </div>
          <span className="text-[9px] text-slate-500 mt-1 block">Cap Tiga Jari Tengah</span>
        </div>

        {/* Titimangsa & Tanda Tangan Kepala Sekolah */}
        <div className="w-64 text-center pr-4">
          <p className="text-xs">{city}, {formattedDate}</p>
          <p className="text-xs font-semibold mt-0.5">Kepala {school.namaSekolah}</p>
          
          {/* Tanda Tangan & Stempel */}
          <div className="h-20 flex items-center justify-center relative">
            <span className="text-[10px] text-slate-300 italic select-none print:hidden">
              (Tanda Tangan & Stempel Sekolah)
            </span>
          </div>

          <p className="font-bold underline uppercase text-xs tracking-wide">
            {school.kepalaSekolah}
          </p>
          <p className="font-mono text-[11px] text-slate-800">
            NIP. {school.nipKepalaSekolah}
          </p>
        </div>
      </div>

      {/* Formal Footer */}
      <div className="mt-8 pt-2 border-t border-slate-300 text-[10px] text-slate-500 flex justify-between items-center print:border-black/40 print:text-black">
        <span>Buku Rapor Peserta Didik • {school.namaSekolah}</span>
        <span>Keterangan tentang Diri Peserta Didik (Hal. 2)</span>
      </div>
    </div>
  );
};
