import { BreakTimeConfig, JpScheduleConfig, CalculatedJpSlot } from '../types';

export interface TimelineJpItem {
  type: 'jp';
  jpNumber: number;
  label: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

export interface TimelineBreakItem {
  type: 'break';
  breakId: string;
  name: string;
  afterJp: number;
  startTime: string;
  endTime: string;
  durationMinutes: number;
}

export type TimelineItem = TimelineJpItem | TimelineBreakItem;

/**
 * Convert time string "HH:mm" to total minutes from 00:00
 */
export const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 420; // default 07:00
  const [h, m] = timeStr.split(':').map(Number);
  return (isNaN(h) ? 7 : h) * 60 + (isNaN(m) ? 0 : m);
};

/**
 * Convert total minutes from 00:00 to formatted string "HH:mm"
 */
export const minutesToTime = (totalMinutes: number): string => {
  const normalized = Math.max(0, totalMinutes % 1440);
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Calculate the full timeline of JP and Break slots based on conditional configuration
 */
export const calculateJpTimeline = (config?: JpScheduleConfig | null): {
  slots: CalculatedJpSlot[];
  timeline: TimelineItem[];
} => {
  const safeConfig = config || {
    durasiJpMenit: 35,
    jamMulai: '07:00',
    totalJp: 8,
    breaks: [
      { id: 'brk-1', name: 'Istirahat 1 (Pagi)', afterJp: 3, durationMinutes: 20 },
      { id: 'brk-2', name: 'Istirahat 2 (Dhuhur / Siang)', afterJp: 6, durationMinutes: 30 }
    ]
  };

  const durasiJp = safeConfig.durasiJpMenit || 35; // Standar SD: 35 menit per JP
  const totalJp = safeConfig.totalJp || 8;
  const breaks = safeConfig.breaks || [];

  let currentMinutes = timeToMinutes(safeConfig.jamMulai || '07:00');
  const slots: CalculatedJpSlot[] = [];
  const timeline: TimelineItem[] = [];

  for (let jp = 1; jp <= totalJp; jp++) {
    const startTime = minutesToTime(currentMinutes);
    const endTime = minutesToTime(currentMinutes + durasiJp);

    const slot: CalculatedJpSlot = {
      jpNumber: jp,
      label: `JP ${jp}`,
      startTime,
      endTime,
      durationMinutes: durasiJp
    };

    slots.push(slot);
    timeline.push({
      type: 'jp',
      ...slot
    });

    currentMinutes += durasiJp;

    // Check if there is one or more breaks after this JP (conditional breaks)
    const matchingBreaks = breaks.filter(b => Number(b.afterJp) === jp);
    for (const brk of matchingBreaks) {
      const bDuration = Math.max(5, Number(brk.durationMinutes) || 15);
      const bStart = minutesToTime(currentMinutes);
      const bEnd = minutesToTime(currentMinutes + bDuration);

      timeline.push({
        type: 'break',
        breakId: brk.id,
        name: brk.name || `Istirahat (Setelah JP ${jp})`,
        afterJp: jp,
        startTime: bStart,
        endTime: bEnd,
        durationMinutes: bDuration
      });

      currentMinutes += bDuration;
    }
  }

  return { slots, timeline };
};

/**
 * Helper to format selected JP checklist into friendly display text
 * e.g., [1, 2] -> "JP 1 - 2 (07:00 - 08:10)"
 */
export const formatSelectedJpDisplay = (
  selectedJps: number[],
  slots: CalculatedJpSlot[]
): string => {
  if (!selectedJps || selectedJps.length === 0) {
    return 'Belum ada JP dipilih';
  }

  const sorted = [...selectedJps].sort((a, b) => a - b);
  const minJp = sorted[0];
  const maxJp = sorted[sorted.length - 1];

  const minSlot = slots.find(s => s.jpNumber === minJp);
  const maxSlot = slots.find(s => s.jpNumber === maxJp);

  const startTime = minSlot ? minSlot.startTime : '07:00';
  const endTime = maxSlot ? maxSlot.endTime : '08:10';

  // Check if consecutive
  const isConsecutive = sorted.every((val, idx) => idx === 0 || val === sorted[idx - 1] + 1);

  if (sorted.length === 1) {
    return `JP ${minJp} (${startTime} - ${endTime})`;
  }

  if (isConsecutive) {
    return `JP ${minJp} - ${maxJp} (${startTime} - ${endTime})`;
  }

  return `JP ${sorted.join(', ')} (${startTime} - ${endTime})`;
};

/**
 * Common preset presets for Indonesian SD schools
 */
export const SD_SCHEDULE_PRESETS: {
  name: string;
  description: string;
  config: JpScheduleConfig;
}[] = [
  {
    name: 'Standar SD (2 Istirahat: 20m & 30m)',
    description: '1 JP = 35 mnt, Istirahat 1 setelah JP 3 (20 mnt), Istirahat 2 setelah JP 5 (30 mnt)',
    config: {
      jamMulai: '07:00',
      durasiJpMenit: 35,
      totalJp: 8,
      breaks: [
        { id: 'brk-1', name: 'Istirahat 1 (Pagi)', afterJp: 3, durationMinutes: 20 },
        { id: 'brk-2', name: 'Istirahat 2 (Siang / Dhuhur)', afterJp: 5, durationMinutes: 30 }
      ]
    }
  },
  {
    name: 'SD 1 Istirahat (30 Menit)',
    description: '1 JP = 35 mnt, 1 kali istirahat setelah JP 4 (30 mnt)',
    config: {
      jamMulai: '07:00',
      durasiJpMenit: 35,
      totalJp: 8,
      breaks: [
        { id: 'brk-1', name: 'Istirahat Utama', afterJp: 4, durationMinutes: 30 }
      ]
    }
  },
  {
    name: 'Jadwal Hari Jumat (6 JP Singkat)',
    description: '1 JP = 35 mnt, 6 JP dengan 1 Istirahat (20 mnt) setelah JP 3',
    config: {
      jamMulai: '07:00',
      durasiJpMenit: 35,
      totalJp: 6,
      breaks: [
        { id: 'brk-1', name: 'Istirahat Pagi', afterJp: 3, durationMinutes: 20 }
      ]
    }
  },
  {
    name: 'Full Day School (3 Istirahat: Pagi, ISHOMA, Ashar)',
    description: '1 JP = 35 mnt, 9 JP dengan 3 jeda istirahat terpisah',
    config: {
      jamMulai: '07:00',
      durasiJpMenit: 35,
      totalJp: 9,
      breaks: [
        { id: 'brk-1', name: 'Istirahat Pagi / Snack', afterJp: 3, durationMinutes: 15 },
        { id: 'brk-2', name: 'ISHOMA Siang & Makan', afterJp: 5, durationMinutes: 45 },
        { id: 'brk-3', name: 'Istirahat Sholat Ashar', afterJp: 8, durationMinutes: 20 }
      ]
    }
  }
];
