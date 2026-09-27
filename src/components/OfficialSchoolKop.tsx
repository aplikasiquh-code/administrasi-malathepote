import React from 'react';
import { SchoolProfile } from '../types';

interface OfficialSchoolKopProps {
  school: SchoolProfile;
  className?: string;
  variant?: 'print' | 'preview';
}

export const OfficialSchoolKop: React.FC<OfficialSchoolKopProps> = ({
  school,
  className = '',
}) => {
  // Format title of Pemda cleanly without duplicate prefixes
  const getPemdaTitle = (kabKota: string) => {
    if (!kabKota) return 'PEMERINTAH KABUPATEN/KOTA';
    const clean = kabKota.trim().toUpperCase();
    if (
      clean.startsWith('KABUPATEN ') || 
      clean.startsWith('KOTA ') || 
      clean.startsWith('KAB. ') || 
      clean.startsWith('KODYA ')
    ) {
      return `PEMERINTAH ${clean}`;
    }
    return `PEMERINTAH KABUPATEN ${clean}`;
  };

  const pemdaText = getPemdaTitle(school.kabupatenKota);
  const dinasText = 'DINAS PENDIDIKAN';
  const schoolName = (school.namaSekolah || 'SEKOLAH DASAR NEGERI').toUpperCase();
  
  // Format address line
  const addressLine = `${school.alamatJalan || ''}${school.kecamatan ? `, Kec. ${school.kecamatan}` : ''}${school.kabupatenKota ? `, ${school.kabupatenKota}` : ''}${school.provinsi ? `, Prov. ${school.provinsi}` : ''}`;
  
  // Format metadata line (Hanya Kode Pos, NPSN, Email)
  const metaParts: string[] = [];
  if (school.kodePos) metaParts.push(`Kode Pos: ${school.kodePos}`);
  if (school.npsn) metaParts.push(`NPSN: ${school.npsn}`);
  if (school.email) metaParts.push(`Email: ${school.email}`);
  const metaLine = metaParts.join(' | ');

  // Automatic dynamic font sizing calculations based on character length
  // Ensures all text lines fit comfortably without being cut off or hidden
  const getPemdaFontSize = (len: number) => {
    if (len > 40) return 'text-[10px] sm:text-[11px] md:text-[12px]';
    if (len > 28) return 'text-[11px] sm:text-[12px] md:text-[13px]';
    return 'text-[11.5px] sm:text-[13px] md:text-[14px]';
  };

  const getSchoolFontSize = (len: number) => {
    if (len > 45) return 'text-[12px] sm:text-[14px] md:text-[16px]';
    if (len > 32) return 'text-[13.5px] sm:text-[16px] md:text-[18px]';
    if (len > 22) return 'text-[15px] sm:text-[18px] md:text-[20px]';
    return 'text-[16px] sm:text-[19px] md:text-[22px]';
  };

  const getAddressFontSize = (len: number) => {
    if (len > 85) return 'text-[8.5px] sm:text-[9.5px] md:text-[10.5px]';
    if (len > 60) return 'text-[9px] sm:text-[10.5px] md:text-[11.5px]';
    return 'text-[9.5px] sm:text-[11px] md:text-[12px]';
  };

  const getMetaFontSize = (len: number) => {
    if (len > 70) return 'text-[8px] sm:text-[9px] md:text-[10px]';
    if (len > 50) return 'text-[8.5px] sm:text-[9.5px] md:text-[10.5px]';
    return 'text-[9px] sm:text-[10px] md:text-[11px]';
  };

  return (
    <div className={`w-full font-sans text-black select-none ${className}`}>
      <div className="flex items-center justify-between gap-2 sm:gap-4 pb-1.5 print:pb-1">
        {/* LOGO KIRI: PEMERINTAH DAERAH (KOMPAK, SIMETRIS, BG TRANSPARAN) */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 print:w-12 print:h-12 aspect-square flex items-center justify-center shrink-0 bg-transparent p-0">
          {school.logoPemdaUrl ? (
            <img
              src={school.logoPemdaUrl}
              alt="Logo Pemda"
              className="max-h-full max-w-full object-contain bg-transparent"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full rounded border border-dashed border-slate-400 bg-transparent flex flex-col items-center justify-center text-slate-700 text-center p-0.5">
              <span className="text-[7px] font-bold uppercase text-slate-500 leading-none">Logo</span>
              <span className="text-[8px] sm:text-[9px] font-extrabold text-slate-700 leading-tight mt-0.5">PEMDA</span>
            </div>
          )}
        </div>

        {/* TEKS TENGAH KOP SURAT (SEMUA IDENTITAS TERLIHAT LENGKAP TANPA TERTUTUP/TERPOTONG) */}
        <div className="flex-1 text-center min-w-0 px-1 sm:px-2 flex flex-col justify-center items-center">
          {/* BARIS 1: PEMERINTAH KABUPATEN / KOTA */}
          <div 
            className={`w-full font-bold uppercase text-black leading-tight tracking-wide ${getPemdaFontSize(pemdaText.length)}`}
          >
            {pemdaText}
          </div>

          {/* BARIS 2: DINAS PENDIDIKAN */}
          <div 
            className="w-full font-bold uppercase text-black leading-tight tracking-wider text-[10px] sm:text-[11.5px] md:text-[12.5px] print:text-[10.5px] mt-0.5"
          >
            {dinasText}
          </div>

          {/* BARIS 3: NAMA RESMI SEKOLAH */}
          <div 
            className={`w-full font-extrabold uppercase text-black leading-tight tracking-tight my-0.5 ${getSchoolFontSize(schoolName.length)}`}
          >
            {schoolName}
          </div>

          {/* BARIS 4: ALAMAT LENGKAP SEKOLAH */}
          <div 
            className={`w-full text-black leading-tight ${getAddressFontSize(addressLine.length)}`}
          >
            {addressLine}
          </div>

          {/* BARIS 5: KODE POS | NPSN | EMAIL */}
          <div 
            className={`w-full text-black leading-tight mt-0.5 ${getMetaFontSize(metaLine.length)}`}
          >
            {metaLine}
          </div>
        </div>

        {/* LOGO KANAN: SEKOLAH (KOMPAK, IDENTIK DENGAN KIRI, BG TRANSPARAN) */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 print:w-12 print:h-12 aspect-square flex items-center justify-center shrink-0 bg-transparent p-0">
          {school.logoUrl ? (
            <img
              src={school.logoUrl}
              alt="Logo Sekolah"
              className="max-h-full max-w-full object-contain bg-transparent"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full rounded border border-dashed border-slate-400 bg-transparent flex flex-col items-center justify-center text-slate-700 text-center p-0.5">
              <span className="text-[7px] font-bold uppercase text-slate-500 font-sans leading-none">Logo</span>
              <span className="text-[8px] sm:text-[9px] font-extrabold text-slate-700 font-sans leading-tight mt-0.5">SEKOLAH</span>
            </div>
          )}
        </div>
      </div>

      {/* GARIS GANDA BAKU KOP SURAT RESMI (TEBAL ATAS 2px, TIPIS BAWAH 1px) */}
      <div className="w-full mt-0.5">
        <div className="border-b-[2px] border-black w-full" />
        <div className="border-b-[1px] border-black w-full mt-[1.5px]" />
      </div>
    </div>
  );
};
