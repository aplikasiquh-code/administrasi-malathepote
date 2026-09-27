import React, { useState, useRef } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  FileCheck,
  RefreshCw,
  Layers,
  BookOpen,
  ArrowRight,
  Info
} from 'lucide-react';
import { CurriculumItem } from '../types';
import { 
  downloadCurriculumTemplate, 
  parseCurriculumFromExcel, 
  ParsedCurriculumRow 
} from '../utils/excelCurriculumUtils';

interface CurriculumImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (items: CurriculumItem[], replaceExisting: boolean) => void;
  existingCount: number;
}

export const CurriculumImportModal: React.FC<CurriculumImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete,
  existingCount
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedCurriculumRow[]>([]);
  const [validCount, setValidCount] = useState<number>(0);
  const [invalidCount, setInvalidCount] = useState<number>(0);
  const [uniqueSubjects, setUniqueSubjects] = useState<string[]>([]);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [filterView, setFilterView] = useState<'all' | 'valid' | 'invalid'>('all');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (selectedFile: File) => {
    if (!selectedFile) return;

    // Validate extension
    const fileName = selectedFile.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      setError('Format berkas tidak valid. Harap unggah file spreadsheet Excel (.xlsx atau .xls).');
      return;
    }

    setFile(selectedFile);
    setError(null);
    setIsParsing(true);

    try {
      const result = await parseCurriculumFromExcel(selectedFile);
      setParsedRows(result.rows);
      setValidCount(result.totalValid);
      setInvalidCount(result.totalInvalid);
      setUniqueSubjects(result.uniqueSubjects);

      if (result.rows.length === 0) {
        setError('Tidak ada data baris yang dapat dibaca di dalam file Excel ini.');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memproses berkas Excel.');
      setParsedRows([]);
      setValidCount(0);
      setInvalidCount(0);
    } finally {
      setIsParsing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedRows([]);
    setError(null);
    setValidCount(0);
    setInvalidCount(0);
    setUniqueSubjects([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleExecuteImport = () => {
    const validItems = parsedRows
      .filter(r => r.isValid)
      .map(r => r.data);

    if (validItems.length === 0) {
      setError('Tidak ada data kurikulum yang valid untuk diimpor.');
      return;
    }

    onImportComplete(validItems, importMode === 'replace');
    handleReset();
    onClose();
  };

  const displayedRows = parsedRows.filter(row => {
    if (filterView === 'valid') return row.isValid;
    if (filterView === 'invalid') return !row.isValid;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Import Kurikulum & TP dari Excel
              </h2>
              <p className="text-xs text-slate-400">
                Unggah pemetaan Mata Pelajaran, Tujuan Pembelajaran (TP), dan Materi Pokok
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 custom-scrollbar">
          {/* Quick Guide & Template Download Bar */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-indigo-950/30 to-slate-900/80 border border-blue-800/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-300 font-semibold text-sm">
                <BookOpen className="w-4 h-4" />
                Format Kurikulum Otomatis (Cascading Dropdown)
              </div>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Saat mengisi Jurnal Mengajar, pilihan <span className="text-amber-300 font-medium">Tujuan Pembelajaran (TP)</span> dan <span className="text-emerald-300 font-medium">Materi</span> akan otomatis tersinkronisasi mengikuti data yang Anda unggah dari file Excel ini.
              </p>
            </div>
            <button
              type="button"
              onClick={downloadCurriculumTemplate}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md shadow-blue-900/30 transition-all shrink-0 active:scale-95"
            >
              <Download className="w-4 h-4" />
              Unduh Format Excel
            </button>
          </div>

          {/* Upload Dropzone */}
          {!file && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
                isDragOver
                  ? 'border-blue-500 bg-blue-500/10 scale-[0.99]'
                  : 'border-slate-700 hover:border-slate-600 hover:bg-slate-800/50 bg-slate-900/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center mb-3">
                <Upload className="w-8 h-8" />
              </div>
              <h3 className="text-base font-semibold text-slate-200 mb-1">
                Tarik & Lepas Berkas Excel Kurikulum di Sini
              </h3>
              <p className="text-xs text-slate-400 mb-3">
                atau klik untuk memilih file dari komputer Anda (.xlsx / .xls)
              </p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                <Info className="w-3.5 h-3.5 text-blue-400" />
                Kolom Wajib: Mata Pelajaran, Tujuan Pembelajaran, Materi
              </span>
            </div>
          )}

          {/* Parsing State */}
          {isParsing && (
            <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
              <p className="text-sm font-medium text-slate-200">
                Memproses dan memvalidasi format kurikulum...
              </p>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-start gap-3 text-rose-300 text-xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-rose-200">Terjadi Kesalahan</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Parsed Results Overview */}
          {file && !isParsing && parsedRows.length > 0 && (
            <div className="space-y-4">
              {/* File Info & Action Bar */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100">{file.name}</h4>
                    <p className="text-xs text-slate-400">
                      {(file.size / 1024).toFixed(1)} KB • Terbaca {parsedRows.length} baris kurikulum
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 border border-slate-700/60 transition-colors"
                >
                  Ganti Berkas
                </button>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800">
                  <span className="text-xs text-slate-400 block">Total Baris</span>
                  <span className="text-lg font-bold text-slate-100">{parsedRows.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
                  <span className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Valid Siap Impor
                  </span>
                  <span className="text-lg font-bold text-emerald-300">{validCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40">
                  <span className="text-xs text-rose-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Baris Tidak Valid
                  </span>
                  <span className="text-lg font-bold text-rose-300">{invalidCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40">
                  <span className="text-xs text-blue-400 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5" /> Mata Pelajaran
                  </span>
                  <span className="text-lg font-bold text-blue-300">{uniqueSubjects.length} Mapel</span>
                </div>
              </div>

              {/* Unique subjects tag list */}
              {uniqueSubjects.length > 0 && (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-slate-400 font-medium shrink-0">Mapel terdeteksi:</span>
                  {uniqueSubjects.map((sub, i) => (
                    <span 
                      key={i} 
                      className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/20 font-medium"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              )}

              {/* Import Mode Selector */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="text-xs font-semibold text-slate-300 block">
                  Metode Penggabungan Data:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label 
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      importMode === 'merge'
                        ? 'bg-blue-600/10 border-blue-500 text-slate-100 ring-1 ring-blue-500'
                        : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800/70'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      value="merge"
                      checked={importMode === 'merge'}
                      onChange={() => setImportMode('merge')}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="text-xs">
                      <p className="font-semibold text-slate-200">Gabungkan / Tambahkan (Merge)</p>
                      <p className="text-slate-400 mt-0.5">
                        Menambahkan {validCount} data baru ke {existingCount} data kurikulum yang sudah ada di sistem.
                      </p>
                    </div>
                  </label>

                  <label 
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      importMode === 'replace'
                        ? 'bg-amber-600/10 border-amber-500 text-slate-100 ring-1 ring-amber-500'
                        : 'bg-slate-800/40 border-slate-700 text-slate-400 hover:bg-slate-800/70'
                    }`}
                  >
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="mt-0.5 text-amber-600 focus:ring-amber-500"
                    />
                    <div className="text-xs">
                      <p className="font-semibold text-slate-200">Ganti Seluruh Data (Replace All)</p>
                      <p className="text-slate-400 mt-0.5">
                        Menghapus {existingCount} data kurikulum lama dan menggantikannya penuh dengan {validCount} data baru.
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Table Filter Tabs */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-lg border border-slate-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setFilterView('all')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      filterView === 'all' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Semua ({parsedRows.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterView('valid')}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      filterView === 'valid' ? 'bg-emerald-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Valid ({validCount})
                  </button>
                  {invalidCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilterView('invalid')}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        filterView === 'invalid' ? 'bg-rose-600 text-white font-medium' : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Tidak Valid ({invalidCount})
                    </button>
                  )}
                </div>
                <span className="text-xs text-slate-400">
                  Menampilkan {displayedRows.length} baris
                </span>
              </div>

              {/* Preview Table */}
              <div className="border border-slate-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/90 text-slate-300 sticky top-0 z-10">
                    <tr>
                      <th className="p-2.5 w-12 text-center">Status</th>
                      <th className="p-2.5">Mata Pelajaran</th>
                      <th className="p-2.5">Elemen</th>
                      <th className="p-2.5">Capaian Pembelajaran (CP)</th>
                      <th className="p-2.5">Tujuan Pembelajaran (TP)</th>
                      <th className="p-2.5">Materi Pokok</th>
                      <th className="p-2.5">Fase / Kelas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                    {displayedRows.map((row, idx) => (
                      <tr 
                        key={idx} 
                        className={`hover:bg-slate-800/40 transition-colors ${
                          !row.isValid ? 'bg-rose-950/20' : ''
                        }`}
                      >
                        <td className="p-2.5 text-center">
                          {row.isValid ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 inline-block" />
                          ) : (
                            <div className="group relative inline-block">
                              <AlertTriangle className="w-4 h-4 text-rose-400 cursor-help" />
                              <div className="hidden group-hover:block absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-1 p-2 bg-slate-800 border border-slate-700 text-rose-300 text-[10px] rounded-lg shadow-xl whitespace-nowrap">
                                {row.errors.join(', ')}
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="p-2.5 font-medium text-slate-200">{row.data.mataPelajaran}</td>
                        <td className="p-2.5 text-indigo-300 max-w-[140px] truncate" title={row.data.elemen || '-'}>
                          {row.data.elemen ? (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px]">
                              {row.data.elemen}
                            </span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="p-2.5 text-slate-300 max-w-xs truncate" title={row.data.capaianPembelajaran || '-'}>
                          {row.data.capaianPembelajaran || <span className="text-slate-500">-</span>}
                        </td>
                        <td className="p-2.5 text-slate-300 max-w-xs truncate font-medium" title={row.data.tujuanPembelajaran}>
                          {row.data.tujuanPembelajaran}
                        </td>
                        <td className="p-2.5 text-slate-300 max-w-xs truncate" title={row.data.materi}>
                          {row.data.materi}
                        </td>
                        <td className="p-2.5 text-slate-400">
                          {row.data.faseKelas || row.data.kelasTarget || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/90 sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors"
          >
            Batal
          </button>

          <div className="flex items-center gap-3">
            {parsedRows.length > 0 && validCount > 0 && (
              <button
                type="button"
                onClick={handleExecuteImport}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-semibold text-xs shadow-lg shadow-blue-600/20 transition-all"
              >
                <span>Simpan {validCount} Kurikulum ke Sistem</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
