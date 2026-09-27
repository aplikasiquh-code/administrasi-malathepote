import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Check, 
  Info, 
  Sparkles,
  Coffee,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { BreakTimeConfig, JpScheduleConfig } from '../types';
import { calculateJpTimeline, SD_SCHEDULE_PRESETS } from '../utils/jpSchedule';
import { initialJpScheduleConfig } from '../data/initialData';
import { ConfirmDeleteModal, ConfirmDeleteState } from './ConfirmDeleteModal';

interface JpScheduleConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config?: JpScheduleConfig;
  currentConfig?: JpScheduleConfig;
  onSaveConfig: (newConfig: JpScheduleConfig) => void;
  onAddToast?: (title: string, message?: string, type?: 'success' | 'error' | 'info') => void;
}

export const JpScheduleConfigModal: React.FC<JpScheduleConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  currentConfig,
  onSaveConfig,
  onAddToast
}) => {
  const activeInitial = config || currentConfig || initialJpScheduleConfig;

  const [jamMulai, setJamMulai] = useState<string>(activeInitial?.jamMulai || '07:00');
  const [durasiJpMenit, setDurasiJpMenit] = useState<number>(activeInitial?.durasiJpMenit || 35);
  const [totalJp, setTotalJp] = useState<number>(activeInitial?.totalJp || 8);
  const [breaks, setBreaks] = useState<BreakTimeConfig[]>(activeInitial?.breaks || []);

  // Confirmation Delete Modal State
  const [deleteConfirmState, setDeleteConfirmState] = useState<ConfirmDeleteState>({
    isOpen: false,
    title: '',
    itemName: '',
    description: '',
    onConfirm: () => {},
  });

  const openDeleteConfirm = (config: Omit<ConfirmDeleteState, 'isOpen'>) => {
    setDeleteConfirmState({
      ...config,
      isOpen: true,
    });
  };

  const closeDeleteConfirm = () => {
    setDeleteConfirmState(prev => ({ ...prev, isOpen: false }));
  };

  // Synchronize when modal opens or incoming config changes
  useEffect(() => {
    if (isOpen) {
      const source = config || currentConfig || initialJpScheduleConfig;
      setJamMulai(source.jamMulai || '07:00');
      setDurasiJpMenit(source.durasiJpMenit || 35);
      setTotalJp(source.totalJp || 8);
      setBreaks(source.breaks ? [...source.breaks] : []);
    }
  }, [isOpen, config, currentConfig]);

  if (!isOpen) return null;

  // Real-time preview of the timeline
  const previewConfig: JpScheduleConfig = {
    jamMulai,
    durasiJpMenit,
    totalJp,
    breaks
  };
  const { timeline, slots } = calculateJpTimeline(previewConfig);

  // Add a new break
  const handleAddBreak = () => {
    const nextJp = Math.min(totalJp - 1, Math.max(1, (breaks.length + 1) * 2 + 1));
    const newBreak: BreakTimeConfig = {
      id: `brk-${Date.now()}`,
      name: `Istirahat ${breaks.length + 1}`,
      afterJp: nextJp,
      durationMinutes: 20
    };
    setBreaks([...breaks, newBreak]);
  };

  // Remove a break with confirmation
  const handleRemoveBreak = (b: BreakTimeConfig) => {
    openDeleteConfirm({
      title: 'Hapus Sesi Istirahat',
      itemName: `${b.name} (${b.durationMinutes} Menit, Setelah JP ${b.afterJp})`,
      description: `Apakah Anda yakin ingin menghapus "${b.name}" dari jadwal KBM? Jam pelajaran berikutnya akan digeser maju tanpa jeda ini.`,
      confirmButtonText: 'Ya, Hapus Istirahat',
      onConfirm: () => {
        setBreaks(prev => prev.filter(item => item.id !== b.id));
        if (onAddToast) {
          onAddToast('Istirahat Dihapus', `Sesi ${b.name} telah dihapus dari pengaturan jadwal.`, 'info');
        }
      }
    });
  };

  // Update a break field
  const handleUpdateBreak = (id: string, field: keyof BreakTimeConfig, value: any) => {
    setBreaks(breaks.map(b => (b.id === id ? { ...b, [field]: value } : b)));
  };

  // Apply a preset
  const handleApplyPreset = (presetConfig: JpScheduleConfig) => {
    setJamMulai(presetConfig.jamMulai);
    setDurasiJpMenit(presetConfig.durasiJpMenit);
    setTotalJp(presetConfig.totalJp);
    setBreaks(presetConfig.breaks.map(b => ({ ...b, id: `brk-${Math.random().toString(36).slice(2, 7)}` })));
  };

  // Save changes
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const finalConfig: JpScheduleConfig = {
      jamMulai,
      durasiJpMenit: Math.max(15, durasiJpMenit || 35),
      totalJp: Math.max(1, Math.min(12, totalJp || 8)),
      breaks: breaks.map(b => ({
        ...b,
        afterJp: Math.max(1, Math.min(totalJp, Number(b.afterJp))),
        durationMinutes: Math.max(5, Number(b.durationMinutes) || 15)
      }))
    };

    onSaveConfig(finalConfig);
    if (onAddToast) {
      onAddToast('Jadwal JP & Istirahat Disimpan', `Pengaturan 1 JP = ${finalConfig.durasiJpMenit} menit & ${finalConfig.breaks.length} jam istirahat berhasil diperbarui.`, 'success');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Pengaturan Jam Pelajaran (JP) & Istirahat
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  1 JP = 35 Menit (SD)
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Atur jam mulai KBM, durasi JP, serta jumlah dan durasi jam istirahat secara kondisional.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-6 custom-scrollbar">
          {/* Preset Buttons */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Pilihan Cepat / Preset Standar Jadwal SD:
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {SD_SCHEDULE_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPreset(p.config)}
                  className="p-2.5 rounded-xl text-left bg-slate-800/60 hover:bg-slate-800 border border-slate-700/70 hover:border-blue-500/50 transition-all text-xs group"
                >
                  <p className="font-semibold text-slate-200 group-hover:text-blue-400">{p.name}</p>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{p.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Main Config Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
            {/* 1. Jam Mulai KBM */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                Jam Masuk / Mulai KBM
              </label>
              <input
                type="time"
                value={jamMulai}
                onChange={(e) => setJamMulai(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-100 focus:outline-none focus:border-blue-500"
              />
              <p className="text-[11px] text-slate-400">Default sekolah: 07:00</p>
            </div>

            {/* 2. Durasi 1 JP */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                <span>Durasi 1 JP (Menit)</span>
                <span className="text-emerald-400 font-bold text-[11px]">35 Menit (SD)</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="15"
                  max="60"
                  value={durasiJpMenit}
                  onChange={(e) => setDurasiJpMenit(parseInt(e.target.value, 10) || 35)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-100 focus:outline-none focus:border-blue-500"
                />
                <span className="text-xs text-slate-400 shrink-0">Menit</span>
              </div>
              <p className="text-[11px] text-slate-400">Standar resmi SD: 35 menit/JP</p>
            </div>

            {/* 3. Total Jam Pelajaran per Hari */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                <span>Jumlah JP Per Hari</span>
                <span className="text-blue-400 font-bold text-[11px]">JP 1 s.d. JP {totalJp}</span>
              </label>
              <select
                value={totalJp}
                onChange={(e) => setTotalJp(parseInt(e.target.value, 10) || 8)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-slate-100 focus:outline-none focus:border-blue-500"
              >
                {[5, 6, 7, 8, 9, 10, 11, 12].map(num => (
                  <option key={num} value={num}>{num} Jam Pelajaran (JP 1 - {num})</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400">SD reguler: 6 s.d. 8 JP</p>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SECTION: PENGATURAN JAM ISTIRAHAT (KONDISIONAL: JUMLAH & DURASI)          */}
          {/* ========================================================================= */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-800/30 border border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-0.5">
                <label className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Coffee className="w-4 h-4 text-amber-400" />
                  Pengaturan Jam Istirahat (Jumlah & Durasi Kondisional)
                </label>
                <p className="text-[11px] text-slate-400">
                  Tambahkan atau hapus jam istirahat, tentukan durasi (menit) serta posisinya setelah JP ke berapa.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddBreak}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Jam Istirahat</span>
              </button>
            </div>

            {breaks.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-800/60 text-center border border-dashed border-slate-700">
                <p className="text-xs text-slate-400">
                  Tidak ada jam istirahat dikonfigurasi (KBM berlangsung bersambung).
                </p>
                <button
                  type="button"
                  onClick={handleAddBreak}
                  className="mt-2 inline-flex items-center gap-1 text-xs text-amber-400 font-semibold hover:underline"
                >
                  <Plus className="w-3 h-3" /> Tambah Istirahat 1
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {breaks.map((b, index) => (
                  <div 
                    key={b.id}
                    className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col md:flex-row items-stretch md:items-center gap-3"
                  >
                    {/* Index & Badge */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-xs">
                        {index + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-200 md:hidden">
                        Pengaturan Istirahat #{index + 1}
                      </span>
                    </div>

                    {/* Nama Istirahat */}
                    <div className="flex-1 min-w-[140px]">
                      <label className="text-[10px] text-slate-400 font-medium block mb-1">Nama Jeda / Istirahat</label>
                      <input
                        type="text"
                        value={b.name}
                        onChange={(e) => handleUpdateBreak(b.id, 'name', e.target.value)}
                        placeholder="Contoh: Istirahat 1 (Pagi)"
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    {/* Posisi: Setelah JP ke berapa */}
                    <div className="w-full md:w-44">
                      <label className="text-[10px] text-slate-400 font-medium block mb-1">Setelah Jam Pelajaran (JP)</label>
                      <select
                        value={b.afterJp}
                        onChange={(e) => handleUpdateBreak(b.id, 'afterJp', parseInt(e.target.value, 10))}
                        className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      >
                        {Array.from({ length: totalJp - 1 }, (_, i) => i + 1).map(jp => (
                          <option key={jp} value={jp}>
                            Setelah JP {jp} (Sebelum JP {jp + 1})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Durasi Menit */}
                    <div className="w-full md:w-36">
                      <label className="text-[10px] text-slate-400 font-medium block mb-1">Durasi Istirahat</label>
                      <div className="flex items-center gap-1.5">
                        <select
                          value={b.durationMinutes}
                          onChange={(e) => handleUpdateBreak(b.id, 'durationMinutes', parseInt(e.target.value, 10))}
                          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                        >
                          <option value={15}>15 Menit</option>
                          <option value={20}>20 Menit</option>
                          <option value={25}>25 Menit</option>
                          <option value={30}>30 Menit</option>
                          <option value={40}>40 Menit</option>
                          <option value={45}>45 Menit (ISHOMA)</option>
                          <option value={60}>60 Menit (1 Jam)</option>
                        </select>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <div className="pt-2 md:pt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveBreak(b)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-700/50 transition-colors"
                        title="Hapus Istirahat Ini"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* LIVE TIMELINE PREVIEW                                                     */}
          {/* ========================================================================= */}
          <div className="space-y-3 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-blue-400" />
                Pratinjau Jadwal KBM Nyata (Live Timeline):
              </label>
              <span className="text-[11px] text-slate-400">
                Total: {slots.length} JP ({slots.length * durasiJpMenit} Menit KBM)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 pt-1">
              {timeline.map((item, idx) => {
                if (item.type === 'jp') {
                  return (
                    <div
                      key={`jp-${item.jpNumber}`}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-300 font-bold text-xs border border-blue-500/20">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-slate-400">{item.durationMinutes} mnt</span>
                      </div>
                      <p className="text-xs font-mono font-semibold text-slate-200 mt-2">
                        {item.startTime} - {item.endTime}
                      </p>
                    </div>
                  );
                }

                return (
                  <div
                    key={`brk-${item.breakId}-${idx}`}
                    className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold text-[11px] flex items-center gap-1">
                        <Coffee className="w-3 h-3" />
                        {item.name}
                      </span>
                      <span className="text-[10px] text-amber-300 font-semibold">{item.durationMinutes} mnt</span>
                    </div>
                    <p className="text-xs font-mono font-semibold text-amber-200 mt-2">
                      {item.startTime} - {item.endTime}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/90 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => handleApplyPreset(SD_SCHEDULE_PRESETS[0].config)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Kembalikan Default SD</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/30 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Pengaturan Jadwal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Delete Modal for Breaks */}
      <ConfirmDeleteModal 
        state={deleteConfirmState} 
        onClose={closeDeleteConfirm} 
      />
    </div>
  );
};
