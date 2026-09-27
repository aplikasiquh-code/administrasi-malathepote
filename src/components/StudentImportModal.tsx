import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  GraduationCap, 
  FileCheck,
  RefreshCw,
  Info,
  Users
} from 'lucide-react';
import { Student } from '../types';
import { 
  parseStudentExcelFile, 
  downloadStudentExcelTemplate, 
  ParsedStudentRow 
} from '../utils/excelStudentUtils';

interface StudentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (students: Student[], mode: 'append' | 'merge') => void;
  existingStudents: Student[];
}

export const StudentImportModal: React.FC<StudentImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
  existingStudents
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [importMode, setImportMode] = useState<'append' | 'merge'>('merge');
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (file: File) => {
    if (!file) return;

    // Check extension
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls') && !fileName.endsWith('.csv')) {
      setErrorMessage('Format file tidak didukung. Harap unggah file spreadsheet dengan format .xlsx, .xls, atau .csv');
      return;
    }

    setSelectedFile(file);
    setIsParsing(true);
    setErrorMessage(null);

    try {
      const { results } = await parseStudentExcelFile(file);
      setParsedRows(results);
      
      // Auto select valid rows by default
      const validIndices = new Set<number>();
      results.forEach((r, idx) => {
        if (r.isValid) {
          validIndices.add(idx);
        }
      });
      setSelectedIndices(validIndices);
    } catch (err: any) {
      console.error('Error parsing student excel:', err);
      setErrorMessage(err.message || 'Gagal membaca berkas Excel. Pastikan file tidak rusak dan memiliki struktur tabel yang benar.');
      setParsedRows([]);
      setSelectedIndices(new Set());
    } finally {
      setIsParsing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleToggleSelectRow = (index: number) => {
    setSelectedIndices(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const handleToggleSelectAll = () => {
    if (selectedIndices.size === parsedRows.filter(r => r.isValid).length) {
      // Deselect all
      setSelectedIndices(new Set());
    } else {
      // Select all valid
      const allValid = new Set<number>();
      parsedRows.forEach((r, idx) => {
        if (r.isValid) allValid.add(idx);
      });
      setSelectedIndices(allValid);
    }
  };

  const handleExecuteImport = () => {
    const studentsToImport: Student[] = [];
    selectedIndices.forEach(idx => {
      if (parsedRows[idx] && parsedRows[idx].isValid) {
        studentsToImport.push(parsedRows[idx].data);
      }
    });

    if (studentsToImport.length === 0) {
      alert('Pilih setidaknya 1 baris data peserta didik yang valid untuk diimpor.');
      return;
    }

    onImportComplete(studentsToImport, importMode);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setParsedRows([]);
    setSelectedIndices(new Set());
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validCount = parsedRows.filter(r => r.isValid).length;
  const invalidCount = parsedRows.filter(r => !r.isValid).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Import Data Siswa dari File Excel
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Unggah berkas spreadsheet (.xlsx / .xls / .csv) untuk memasukkan data buku induk siswa secara massal.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200 text-xs sm:text-sm">
          
          {/* Step 1: Template Download Banner */}
          <div className="bg-gradient-to-r from-violet-900/30 to-blue-900/20 border border-violet-800/40 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0 mt-0.5">
                <Info className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">Belum memiliki format Excel siswa yang sesuai?</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Unduh template resmi berisi kolom baku (Nama, NIS, NISN, Rombel/Kelas, Tanggal Lahir, Orang Tua, dll.) lengkap dengan contoh data.
                </p>
              </div>
            </div>

            <button
              onClick={downloadStudentExcelTemplate}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs shadow-md shadow-violet-600/20 transition-all shrink-0 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Unduh Template Excel (.xlsx)</span>
            </button>
          </div>

          {/* Step 2: Upload Dropzone (if no file parsed yet) */}
          {parsedRows.length === 0 ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                isDragOver 
                  ? 'border-violet-500 bg-violet-500/10 scale-[0.99]' 
                  : 'border-slate-700 hover:border-slate-600 bg-slate-900/50 hover:bg-slate-800/50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files && e.target.files[0] && handleFileChange(e.target.files[0])}
                accept=".xlsx, .xls, .csv"
                className="hidden"
              />

              <div className="w-16 h-16 rounded-2xl bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-400 mx-auto mb-4">
                {isParsing ? (
                  <RefreshCw className="w-8 h-8 animate-spin" />
                ) : (
                  <UploadCloud className="w-8 h-8" />
                )}
              </div>

              <h4 className="text-base font-bold text-white">
                {isParsing ? 'Membaca dan Menganalisis Berkas Excel Siswa...' : 'Tarik & Letakkan File Excel Siswa di Sini'}
              </h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Mendukung file format <strong>.xlsx</strong>, <strong>.xls</strong>, atau <strong>.csv</strong>. Klik di mana saja pada area ini untuk memilih berkas dari perangkat Anda.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold hover:bg-slate-700 transition-colors">
                <FileSpreadsheet className="w-4 h-4 text-violet-400" />
                <span>Pilih Berkas Excel Siswa</span>
              </div>
            </div>
          ) : (
            /* Step 3: Parsed File Preview & Confirmation Table */
            <div className="space-y-4">
              
              {/* File Info and Summary Chips */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{selectedFile?.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      Ukuran: {selectedFile ? (selectedFile.size / 1024).toFixed(1) : 0} KB • Terdeteksi {parsedRows.length} baris data siswa
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition-colors self-start sm:self-auto"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Ganti File Lain</span>
                </button>
              </div>

              {/* Stats & Import Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Total Terbaca</span>
                    <div className="text-base font-bold text-white">{parsedRows.length} Siswa</div>
                  </div>
                  <Users className="w-5 h-5 text-slate-500" />
                </div>

                <div className="bg-slate-900 border border-violet-900/40 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-violet-400">Siap Diimpor (Valid)</span>
                    <div className="text-base font-bold text-violet-300">{validCount} Siswa</div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-violet-400" />
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">Terpilih untuk Masuk</span>
                    <div className="text-base font-bold text-blue-300">{selectedIndices.size} Siswa</div>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold">
                    Pilihan
                  </span>
                </div>
              </div>

              {/* Duplicate Handling Mode Selection */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-slate-300">
                  <span className="font-semibold text-white">Metode Penggabungan Data Siswa:</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input
                      type="radio"
                      name="studentImportMode"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="accent-violet-500"
                    />
                    <span>Perbarui jika NISN/NIS cocok (Rekomendasi)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white">
                    <input
                      type="radio"
                      name="studentImportMode"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="accent-violet-500"
                    />
                    <span>Tambahkan Semua sebagai Siswa Baru</span>
                  </label>
                </div>
              </div>

              {/* Data Preview Table */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900 shadow-inner max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/90 sticky top-0 z-10 text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={validCount > 0 && selectedIndices.size === validCount}
                          onChange={handleToggleSelectAll}
                          className="accent-violet-500 rounded cursor-pointer"
                        />
                      </th>
                      <th className="py-2.5 px-3">No</th>
                      <th className="py-2.5 px-3">Nama Siswa</th>
                      <th className="py-2.5 px-3">NISN / NIS</th>
                      <th className="py-2.5 px-3">Kelas</th>
                      <th className="py-2.5 px-3">L/P</th>
                      <th className="py-2.5 px-3">Tgl Lahir</th>
                      <th className="py-2.5 px-3">Orang Tua / No WA</th>
                      <th className="py-2.5 px-3">Status Validasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {parsedRows.map((row, idx) => {
                      const isSelected = selectedIndices.has(idx);
                      const isMatchExisting = existingStudents.some(
                        es => (es.nisn && es.nisn === row.data.nisn) || 
                              (es.nis && es.nis === row.data.nis) ||
                              (es.namaLengkap.toLowerCase() === row.data.namaLengkap.toLowerCase() && es.tanggalLahir === row.data.tanggalLahir)
                      );

                      return (
                        <tr 
                          key={idx}
                          className={`transition-colors ${
                            !row.isValid 
                              ? 'bg-rose-950/20 text-rose-300' 
                              : isSelected 
                              ? 'bg-violet-950/20 hover:bg-violet-950/30' 
                              : 'hover:bg-slate-800/30'
                          }`}
                        >
                          <td className="py-2 px-3 text-center">
                            <input
                              type="checkbox"
                              disabled={!row.isValid}
                              checked={isSelected}
                              onChange={() => handleToggleSelectRow(idx)}
                              className="accent-violet-500 rounded cursor-pointer disabled:opacity-30"
                            />
                          </td>
                          <td className="py-2 px-3 text-slate-400">{idx + 1}</td>
                          <td className="py-2 px-3 font-semibold text-white">
                            <div>{row.data.namaLengkap}</div>
                            {row.data.namaPanggilan && (
                              <div className="text-[11px] text-slate-400 font-normal">Panggilan: {row.data.namaPanggilan}</div>
                            )}
                          </td>
                          <td className="py-2 px-3 font-mono text-slate-300">
                            <div>NISN: {row.data.nisn}</div>
                            <div className="text-[10px] text-slate-500">NIS: {row.data.nis}</div>
                          </td>
                          <td className="py-2 px-3">
                            <span className="inline-block px-2 py-0.5 rounded-lg bg-violet-500/20 text-violet-300 font-bold text-[11px]">
                              Kelas {row.data.kelas}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              row.data.jenisKelamin === 'L'
                                ? 'bg-blue-500/20 text-blue-300'
                                : 'bg-pink-500/20 text-pink-300'
                            }`}>
                              {row.data.jenisKelamin}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-300 whitespace-nowrap">
                            <div>{row.data.tanggalLahir}</div>
                            <div className="text-[10px] text-slate-500">{row.data.tempatLahir}</div>
                          </td>
                          <td className="py-2 px-3">
                            <div className="text-slate-200 font-medium">{row.data.namaAyah !== '-' ? row.data.namaAyah : row.data.namaIbu}</div>
                            <div className="text-[10px] text-slate-400">{row.data.noHpOrtu}</div>
                          </td>
                          <td className="py-2 px-3">
                            {row.isValid ? (
                              <div className="flex items-center gap-1 text-emerald-400 font-medium text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                <span>{isMatchExisting ? 'Cocok (Update)' : 'Valid'}</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-rose-400 font-medium text-[11px]" title={row.errors.join(', ')}>
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span className="truncate max-w-[120px]">{row.errors[0]}</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Error display */}
          {errorMessage && (
            <div className="bg-rose-950/40 border border-rose-800 rounded-2xl p-4 flex items-start gap-3 text-rose-200">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-sm text-white">Gagal Membaca File Excel</h5>
                <p className="text-xs text-rose-300 mt-0.5">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* Guidance Info Card */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
            <h5 className="font-bold text-slate-200 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Petunjuk & Format Kolom Import Siswa Sekolah Dasar</span>
            </h5>
            <ul className="list-disc list-inside space-y-1 text-slate-400 leading-relaxed">
              <li>Header kolom Excel dapat menggunakan nama umum bahasa Indonesia (contoh: <em>Nama Lengkap, NIS, NISN, Kelas, Jenis Kelamin, Tempat Lahir, Tanggal Lahir, Agama, Nama Ayah, Nama Ibu, No HP Ortu, Alamat</em>).</li>
              <li>Kolom <strong>Kelas / Rombel</strong> dapat diisi dengan format baku seperti <code className="text-violet-300">1A</code>, <code className="text-violet-300">1B</code>, <code className="text-violet-300">2A</code>, <code className="text-violet-300">Kelas 3A</code>, atau angka rombel saja.</li>
              <li>Kolom <strong>Jenis Kelamin</strong> dapat diisi dengan <code className="text-violet-300">L</code> / <code className="text-violet-300">P</code> atau <code className="text-violet-300">Laki-laki</code> / <code className="text-violet-300">Perempuan</code>.</li>
              <li>Format tanggal lahir dapat berupa format tanggal Excel atau teks <code className="text-violet-300">YYYY-MM-DD</code> / <code className="text-violet-300">DD/MM/YYYY</code>.</li>
              <li>Sistem akan otomatis mencocokkan NISN dan NIS yang sama agar tidak terjadi entri ganda jika memilih metode *Perbarui/Update*.</li>
            </ul>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 flex items-center justify-between bg-slate-900/90 gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs sm:text-sm font-semibold transition-colors"
          >
            Batal
          </button>

          <div className="flex items-center gap-3">
            {parsedRows.length > 0 && (
              <span className="text-xs text-slate-400 hidden sm:inline">
                {selectedIndices.size} dari {validCount} siswa terpilih
              </span>
            )}

            <button
              type="button"
              disabled={selectedIndices.size === 0}
              onClick={handleExecuteImport}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:hover:bg-violet-600 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-violet-600/30 transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Impor {selectedIndices.size > 0 ? `${selectedIndices.size} Data Siswa` : 'Data Siswa'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
