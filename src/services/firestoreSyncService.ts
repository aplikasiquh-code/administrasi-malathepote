import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  onSnapshot, 
  Unsubscribe 
} from 'firebase/firestore';
import { 
  db, 
  handleFirestoreError, 
  OperationType, 
  testConnection, 
  disableNetwork, 
  enableNetwork 
} from './firebase';
import { 
  SchoolProfile, 
  Teacher, 
  Student, 
  SchoolAgenda, 
  SchoolAnnouncement, 
  DailyClassAttendance, 
  CurriculumItem, 
  DailyTeachingJournal, 
  JpScheduleConfig, 
  StudentAssessment, 
  ExtracurricularAssessment, 
  CocurricularProject, 
  ClassRoomItem,
  AppSyncData
} from '../types';

export type SyncStatus = 'connected' | 'syncing' | 'offline' | 'error' | 'quota-exceeded';

export interface FirestoreSyncCallbacks {
  onSchoolChange?: (school: SchoolProfile) => void;
  onTeachersChange?: (teachers: Teacher[]) => void;
  onStudentsChange?: (students: Student[]) => void;
  onClassesChange?: (classes: ClassRoomItem[]) => void;
  onAgendasChange?: (agendas: SchoolAgenda[]) => void;
  onAnnouncementsChange?: (announcements: SchoolAnnouncement[]) => void;
  onAttendanceChange?: (attendance: DailyClassAttendance[]) => void;
  onCurriculumChange?: (curriculum: CurriculumItem[]) => void;
  onTeachingJournalsChange?: (journals: DailyTeachingJournal[]) => void;
  onJpScheduleChange?: (schedule: JpScheduleConfig) => void;
  onAssessmentsChange?: (assessments: StudentAssessment[]) => void;
  onExtracurricularsChange?: (extras: ExtracurricularAssessment[]) => void;
  onCocurricularProjectsChange?: (projects: CocurricularProject[]) => void;
  onStatusChange?: (status: SyncStatus, lastSyncedAt?: string) => void;
}

const QUOTA_STORAGE_KEY = 'adm_firestore_quota_exceeded_timestamp';
const QUOTA_COOLDOWN_MS = 12 * 60 * 60 * 1000; // 12 hours cooldown

// In-memory flag initialized from localStorage and server status
let isQuotaExceeded = false;
try {
  const stored = localStorage.getItem(QUOTA_STORAGE_KEY);
  if (stored) {
    const ts = parseInt(stored, 10);
    if (!isNaN(ts) && Date.now() - ts < QUOTA_COOLDOWN_MS) {
      isQuotaExceeded = true;
      // Proactively shut down network to prevent SDK background retry storm
      disableNetwork(db).catch(() => {});
    } else {
      localStorage.removeItem(QUOTA_STORAGE_KEY);
    }
  }
} catch {}

// Also fetch server-side quota status to synchronize across tabs/sessions
if (typeof window !== 'undefined') {
  fetch('/api/firestore-quota')
    .then(res => res.json())
    .then(data => {
      if (data && data.quotaExceeded) {
        isQuotaExceeded = true;
        try { localStorage.setItem(QUOTA_STORAGE_KEY, (data.timestamp || Date.now()).toString()); } catch {}
        disableNetwork(db).catch(() => {});
      }
    })
    .catch(() => {});
}

export function getIsQuotaExceeded(): boolean {
  if (isQuotaExceeded) return true;
  try {
    const stored = localStorage.getItem(QUOTA_STORAGE_KEY);
    if (stored) {
      const ts = parseInt(stored, 10);
      if (!isNaN(ts) && Date.now() - ts < QUOTA_COOLDOWN_MS) {
        isQuotaExceeded = true;
        return true;
      }
      localStorage.removeItem(QUOTA_STORAGE_KEY);
    }
  } catch {}
  return false;
}

export async function markQuotaExceeded(): Promise<void> {
  isQuotaExceeded = true;
  try {
    localStorage.setItem(QUOTA_STORAGE_KEY, Date.now().toString());
  } catch {}
  try {
    fetch('/api/firestore-quota', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quotaExceeded: true })
    }).catch(() => {});
  } catch {}
  try {
    await disableNetwork(db);
    console.info('[Firestore] Network disabled to prevent background quota retry loops.');
  } catch (err) {
    console.warn('[Firestore] Failed to disable network:', err);
  }
}

export async function retryQuotaConnection(): Promise<boolean> {
  try {
    await enableNetwork(db);
    isQuotaExceeded = false;
    try {
      localStorage.removeItem(QUOTA_STORAGE_KEY);
      fetch('/api/firestore-quota', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quotaExceeded: false })
      }).catch(() => {});
    } catch {}
    const isOnline = await testConnection();
    if (isOnline) {
      console.info('[Firestore] Reconnection successful, network restored.');
      return true;
    }
    return false;
  } catch (err) {
    if (isQuotaError(err)) {
      await markQuotaExceeded();
    }
    return false;
  }
}

export function resetQuotaExceededFlag(): void {
  isQuotaExceeded = false;
  try {
    localStorage.removeItem(QUOTA_STORAGE_KEY);
  } catch {}
}

export function isQuotaError(error: unknown): boolean {
  if (!error) return false;
  const msg = error instanceof Error ? error.message : String(error);
  const code = (error as any)?.code;
  return (
    code === 'resource-exhausted' ||
    msg.includes('Quota limit exceeded') ||
    msg.includes('Free daily write units') ||
    msg.includes('Free daily read units') ||
    msg.includes('Quota exceeded') ||
    msg.includes('resource-exhausted')
  );
}

// Track timestamps of our own local writes to avoid bouncing state back to ourselves
const localWriteTimestamps: Record<string, number> = {};

/**
 * Recursively removes all `undefined` values from an object or array,
 * ensuring complete compatibility with Firestore which rejects `undefined`.
 */
export function sanitizeForFirestore<T>(val: T): T {
  if (val === undefined) {
    return null as unknown as T;
  }
  if (val === null || typeof val !== 'object') {
    return val;
  }
  if (Array.isArray(val)) {
    return val
      .filter(item => item !== undefined)
      .map(item => sanitizeForFirestore(item)) as unknown as T;
  }
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(val)) {
    if (value !== undefined) {
      result[key] = sanitizeForFirestore(value);
    }
  }
  return result as T;
}

export function normalizeSchoolId(idOrNpsn?: string | null): string {
  if (!idOrNpsn) return '20512345';
  const clean = idOrNpsn.trim().replace(/[^a-zA-Z0-9_\-]/g, '_');
  return clean || '20512345';
}

/**
 * Real-time listener for school administration data.
 * Listens to subcollection `schools/{schoolId}/sections` using Firestore `onSnapshot`.
 */
export function subscribeToSchoolData(
  schoolId: string,
  callbacks: FirestoreSyncCallbacks
): Unsubscribe {
  if (getIsQuotaExceeded()) {
    callbacks.onStatusChange?.('quota-exceeded');
    return () => {};
  }

  const safeSchoolId = normalizeSchoolId(schoolId);
  const sectionsColRef = collection(db, 'schools', safeSchoolId, 'sections');
  const collectionPath = `schools/${safeSchoolId}/sections`;

  // First verify connectivity
  testConnection().then(isOnline => {
    if (getIsQuotaExceeded()) {
      callbacks.onStatusChange?.('quota-exceeded');
    } else {
      callbacks.onStatusChange?.(isOnline ? 'connected' : 'offline');
    }
  }).catch(() => {
    callbacks.onStatusChange?.(getIsQuotaExceeded() ? 'quota-exceeded' : 'offline');
  });

  callbacks.onStatusChange?.('syncing');

  const unsubscribe = onSnapshot(
    sectionsColRef,
    { includeMetadataChanges: true },
    (snapshot) => {
      // If snapshot has pending writes, it originated on this client
      const hasPending = snapshot.metadata.hasPendingWrites;
      const isFromCache = snapshot.metadata.fromCache;

      snapshot.docChanges().forEach((change) => {
        const sectionKey = change.doc.id;
        const raw = change.doc.data();
        if (!raw || !raw.data) return;

        // Skip applying remote state if we wrote this locally within the last 2.5 seconds
        const lastLocalWrite = localWriteTimestamps[sectionKey] || 0;
        if (Date.now() - lastLocalWrite < 2500 && hasPending) {
          return;
        }

        try {
          switch (sectionKey) {
            case 'profile':
              callbacks.onSchoolChange?.(raw.data as SchoolProfile);
              break;
            case 'teachers':
              callbacks.onTeachersChange?.(raw.data as Teacher[]);
              break;
            case 'students':
              callbacks.onStudentsChange?.(raw.data as Student[]);
              break;
            case 'classes':
              callbacks.onClassesChange?.(raw.data as ClassRoomItem[]);
              break;
            case 'agendas':
              callbacks.onAgendasChange?.(raw.data as SchoolAgenda[]);
              break;
            case 'announcements':
              callbacks.onAnnouncementsChange?.(raw.data as SchoolAnnouncement[]);
              break;
            case 'attendance':
              callbacks.onAttendanceChange?.(raw.data as DailyClassAttendance[]);
              break;
            case 'curriculum':
              callbacks.onCurriculumChange?.(raw.data as CurriculumItem[]);
              break;
            case 'teachingJournals':
              callbacks.onTeachingJournalsChange?.(raw.data as DailyTeachingJournal[]);
              break;
            case 'jpSchedule':
              callbacks.onJpScheduleChange?.(raw.data as JpScheduleConfig);
              break;
            case 'assessments':
              callbacks.onAssessmentsChange?.(raw.data as StudentAssessment[]);
              break;
            case 'extracurriculars':
              callbacks.onExtracurricularsChange?.(raw.data as ExtracurricularAssessment[]);
              break;
            case 'cocurricularProjects':
              callbacks.onCocurricularProjectsChange?.(raw.data as CocurricularProject[]);
              break;
          }
        } catch (err) {
          console.warn(`[FirestoreSync] Failed to process incoming section '${sectionKey}':`, err);
        }
      });

      const updatedAt = new Date().toISOString();
      callbacks.onStatusChange?.(isFromCache && hasPending ? 'syncing' : 'connected', updatedAt);
    },
    (error) => {
      if (isQuotaError(error)) {
        markQuotaExceeded();
        console.warn('[Firestore] Quota limit exceeded for onSnapshot listener. Mode offline lokal aktif.');
        callbacks.onStatusChange?.('quota-exceeded');
        return;
      }
      handleFirestoreError(error, OperationType.GET, collectionPath);
      callbacks.onStatusChange?.('error');
    }
  );

  return unsubscribe;
}

/**
 * Save a single section to Firestore (e.g. students, teachers, grades).
 */
export async function saveSectionToFirestore<T>(
  schoolId: string,
  sectionKey: string,
  data: T,
  updatedBy: string = 'User'
): Promise<boolean> {
  if (getIsQuotaExceeded()) {
    return false;
  }

  const safeSchoolId = normalizeSchoolId(schoolId);
  const docRef = doc(db, 'schools', safeSchoolId, 'sections', sectionKey);
  const path = `schools/${safeSchoolId}/sections/${sectionKey}`;

  localWriteTimestamps[sectionKey] = Date.now();

  try {
    const payload = sanitizeForFirestore({
      sectionKey,
      updatedAt: new Date().toISOString(),
      updatedBy: updatedBy || 'User',
      schoolNpsn: safeSchoolId,
      data
    });
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (error) {
    if (isQuotaError(error)) {
      await markQuotaExceeded();
      console.warn(`[Firestore] Daily write quota reached during write to '${path}'. Pausing further Firestore writes.`);
      return false;
    }
    handleFirestoreError(error, OperationType.WRITE, path);
    return false;
  }
}

/**
 * Pushes entire local school state into Firestore sections safely.
 * Aborts immediately if quota limit is encountered, without queuing further writes.
 */
export async function pushFullSchoolDataToFirestore(
  schoolId: string,
  fullData: AppSyncData,
  updatedBy: string = 'User'
): Promise<{ success: boolean; syncedAt: string; quotaExceeded?: boolean }> {
  const safeSchoolId = normalizeSchoolId(schoolId);
  const now = new Date().toISOString();

  if (getIsQuotaExceeded()) {
    return { success: false, syncedAt: now, quotaExceeded: true };
  }

  // Root doc update
  try {
    const rootDocRef = doc(db, 'schools', safeSchoolId);
    const rootPayload = sanitizeForFirestore({
      npsn: safeSchoolId,
      schoolName: fullData.school?.namaSekolah || 'SDN Malathe Pote 1 Kokop',
      updatedAt: now,
      updatedBy: updatedBy || 'User'
    });
    await setDoc(rootDocRef, rootPayload, { merge: true });
  } catch (error) {
    if (isQuotaError(error)) {
      await markQuotaExceeded();
      console.warn('[Firestore] Daily write quota limit reached during root doc write.');
      return { success: false, syncedAt: now, quotaExceeded: true };
    }
    handleFirestoreError(error, OperationType.WRITE, `schools/${safeSchoolId}`);
  }

  if (getIsQuotaExceeded()) {
    return { success: false, syncedAt: now, quotaExceeded: true };
  }

  // Sequential push so that we immediately halt on the very first quota error
  const sectionsToPush: Array<{ key: string; data: any }> = [
    { key: 'profile', data: fullData.school },
    { key: 'teachers', data: fullData.teachers },
    { key: 'students', data: fullData.students },
    { key: 'classes', data: fullData.classes },
    { key: 'agendas', data: fullData.agendas },
    { key: 'announcements', data: fullData.announcements },
    { key: 'attendance', data: fullData.attendance },
    { key: 'curriculum', data: fullData.curriculum },
    { key: 'teachingJournals', data: fullData.teachingJournals },
    { key: 'jpSchedule', data: fullData.jpSchedule },
    { key: 'assessments', data: fullData.assessments },
    { key: 'extracurriculars', data: fullData.extracurriculars },
    { key: 'cocurricularProjects', data: fullData.cocurricularProjects },
  ];

  for (const item of sectionsToPush) {
    if (getIsQuotaExceeded()) {
      return { success: false, syncedAt: now, quotaExceeded: true };
    }
    if (item.data !== undefined) {
      const ok = await saveSectionToFirestore(safeSchoolId, item.key, item.data, updatedBy);
      if (!ok && getIsQuotaExceeded()) {
        return { success: false, syncedAt: now, quotaExceeded: true };
      }
    }
  }

  return { success: true, syncedAt: now };
}

/**
 * Fetch initial school data from Firestore if already exists.
 */
export async function fetchFullSchoolDataFromFirestore(
  schoolId: string
): Promise<Partial<AppSyncData> | null> {
  if (getIsQuotaExceeded()) {
    return null;
  }
  const safeSchoolId = normalizeSchoolId(schoolId);
  const sectionsColRef = collection(db, 'schools', safeSchoolId, 'sections');
  const path = `schools/${safeSchoolId}/sections`;

  try {
    const querySnapshot = await getDocs(sectionsColRef);
    if (querySnapshot.empty) {
      return null;
    }

    const result: Partial<AppSyncData> = {};
    querySnapshot.forEach(docSnap => {
      const sectionKey = docSnap.id;
      const raw = docSnap.data();
      if (!raw || !raw.data) return;

      switch (sectionKey) {
        case 'profile':
          result.school = raw.data as SchoolProfile;
          break;
        case 'teachers':
          result.teachers = raw.data as Teacher[];
          break;
        case 'students':
          result.students = raw.data as Student[];
          break;
        case 'classes':
          result.classes = raw.data as ClassRoomItem[];
          break;
        case 'agendas':
          result.agendas = raw.data as SchoolAgenda[];
          break;
        case 'announcements':
          result.announcements = raw.data as SchoolAnnouncement[];
          break;
        case 'attendance':
          result.attendance = raw.data as DailyClassAttendance[];
          break;
        case 'curriculum':
          result.curriculum = raw.data as CurriculumItem[];
          break;
        case 'teachingJournals':
          result.teachingJournals = raw.data as DailyTeachingJournal[];
          break;
        case 'jpSchedule':
          result.jpSchedule = raw.data as JpScheduleConfig;
          break;
        case 'assessments':
          result.assessments = raw.data as StudentAssessment[];
          break;
        case 'extracurriculars':
          result.extracurriculars = raw.data as ExtracurricularAssessment[];
          break;
        case 'cocurricularProjects':
          result.cocurricularProjects = raw.data as CocurricularProject[];
          break;
      }
    });

    result.syncedAt = new Date().toISOString();
    return result;
  } catch (error) {
    if (isQuotaError(error)) {
      await markQuotaExceeded();
      console.warn('[Firestore] Quota limit exceeded during initial fetch. Fallback to local storage.');
      return null;
    }
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}
