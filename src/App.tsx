import React, { useState, useEffect } from 'react';
import { 
  SchoolProfile, 
  Teacher, 
  Student, 
  SchoolAgenda, 
  SchoolAnnouncement, 
  ActiveTab,
  ClassGrade,
  DailyClassAttendance,
  CurriculumItem,
  DailyTeachingJournal,
  JpScheduleConfig,
  StudentAssessment,
  ExtracurricularAssessment,
  CocurricularProject,
  ClassRoomItem,
  AuthUser,
  AppSyncData
} from './types';
import { 
  getStoredSchoolProfile, 
  saveStoredSchoolProfile,
  getStoredTeachers,
  saveStoredTeachers,
  getStoredStudents,
  saveStoredStudents,
  getStoredClasses,
  saveStoredClasses,
  getStoredAgendas,
  saveStoredAgendas,
  getStoredAnnouncements,
  saveStoredAnnouncements,
  getStoredAttendance,
  saveStoredAttendance,
  getStoredCurriculum,
  saveStoredCurriculum,
  LEGACY_DUMMY_IDS,
  getStoredTeachingJournals,
  saveStoredTeachingJournals,
  getStoredJpScheduleConfig,
  saveStoredJpScheduleConfig,
  getStoredAssessments,
  saveStoredAssessments,
  getStoredExtracurriculars,
  saveStoredExtracurriculars,
  getStoredCocurricularProjects,
  saveStoredCocurricularProjects,
  getStoredActiveTab,
  saveStoredActiveTab,
  resetAllData,
  exportAllDataJSON
} from './utils/storage';
import { 
  authService, 
  getStoredAuthUser, 
  getLastSyncTime 
} from './services/authService';
import { 
  subscribeToSchoolData, 
  pushFullSchoolDataToFirestore, 
  fetchFullSchoolDataFromFirestore,
  SyncStatus,
  isQuotaError,
  getIsQuotaExceeded,
  retryQuotaConnection 
} from './services/firestoreSyncService';
import { initialCurriculum } from './data/initialData';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoginGateway } from './components/LoginGateway';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { DashboardView } from './components/DashboardView';
import { SchoolProfileView } from './components/SchoolProfileView';
import { TeacherListView } from './components/TeacherListView';
import { TeacherModal } from './components/TeacherModal';
import { TeacherDetailModal } from './components/TeacherDetailModal';
import { TeacherImportModal } from './components/TeacherImportModal';
import { StudentListView } from './components/StudentListView';
import { StudentAttendanceView } from './components/StudentAttendanceView';
import { DailyTeachingJournalView } from './components/DailyTeachingJournalView';
import { StudentGradingView } from './components/StudentGradingView';
import { ExtracurricularGradingView } from './components/ExtracurricularGradingView';
import { CocurricularGradingView } from './components/CocurricularGradingView';
import { StudentReportCardView } from './components/StudentReportCardView';
import { StudentModal } from './components/StudentModal';
import { StudentDetailModal } from './components/StudentDetailModal';
import { StudentImportModal } from './components/StudentImportModal';
import { ClassPromotionModal } from './components/ClassPromotionModal';
import { ClassManagementModal } from './components/ClassManagementModal';
import { PrintReportsModal, ReportModalType } from './components/PrintReportsModal';
import { ConfirmDeleteModal, ConfirmDeleteState } from './components/ConfirmDeleteModal';
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  // Main Data States
  const [school, setSchool] = useState<SchoolProfile>(getStoredSchoolProfile);
  const [teachers, setTeachers] = useState<Teacher[]>(getStoredTeachers);
  const [students, setStudents] = useState<Student[]>(getStoredStudents);
  const [agendas, setAgendas] = useState<SchoolAgenda[]>(getStoredAgendas);
  const [announcements, setAnnouncements] = useState<SchoolAnnouncement[]>(getStoredAnnouncements);
  const [attendance, setAttendance] = useState<DailyClassAttendance[]>(getStoredAttendance);
  const [curriculum, setCurriculum] = useState<CurriculumItem[]>(getStoredCurriculum);
  const [teachingJournals, setTeachingJournals] = useState<DailyTeachingJournal[]>(getStoredTeachingJournals);
  const [jpSchedule, setJpSchedule] = useState<JpScheduleConfig>(getStoredJpScheduleConfig);
  const [assessments, setAssessments] = useState<StudentAssessment[]>(getStoredAssessments);
  const [extracurriculars, setExtracurriculars] = useState<ExtracurricularAssessment[]>(getStoredExtracurriculars);
  const [cocurricularProjects, setCocurricularProjects] = useState<CocurricularProject[]>(getStoredCocurricularProjects);
  const [classes, setClasses] = useState<ClassRoomItem[]>(getStoredClasses);

  // Authentication & Cloud Sync States
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(getStoredAuthUser);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(getLastSyncTime);
  const [firestoreStatus, setFirestoreStatus] = useState<SyncStatus>(() => 
    getIsQuotaExceeded() ? 'quota-exceeded' : 'syncing'
  );

  // Real-time synchronization across devices via Firebase Firestore
  useEffect(() => {
    const schoolNpsn = currentUser?.npsn || school.npsn || '20512345';

    if (getIsQuotaExceeded()) {
      setFirestoreStatus('quota-exceeded');
      return;
    }

    // First check if Firestore has pre-existing cloud data
    fetchFullSchoolDataFromFirestore(schoolNpsn).then(remoteData => {
      if (remoteData && remoteData.school) {
        applyCloudData(remoteData as AppSyncData);
      }
    }).catch(err => {
      console.warn('Initial Firestore fetch error:', err);
    });

    // Subscribe to real-time changes across devices
    const unsubscribe = subscribeToSchoolData(schoolNpsn, {
      onSchoolChange: (remoteSchool) => {
        setSchool(prev => {
          if (JSON.stringify(prev) === JSON.stringify(remoteSchool)) return prev;
          saveStoredSchoolProfile(remoteSchool);
          return remoteSchool;
        });
      },
      onTeachersChange: (remoteTeachers) => {
        setTeachers(prev => {
          if (JSON.stringify(prev) === JSON.stringify(remoteTeachers)) return prev;
          saveStoredTeachers(remoteTeachers);
          return remoteTeachers;
        });
      },
      onStudentsChange: (remoteStudents) => {
        setStudents(prev => {
          if (JSON.stringify(prev) === JSON.stringify(remoteStudents)) return prev;
          saveStoredStudents(remoteStudents);
          return remoteStudents;
        });
      },
      onClassesChange: (remoteClasses) => {
        setClasses(prev => {
          if (JSON.stringify(prev) === JSON.stringify(remoteClasses)) return prev;
          saveStoredClasses(remoteClasses);
          return remoteClasses;
        });
      },
      onAgendasChange: (remoteAgendas) => {
        setAgendas(prev => {
          if (JSON.stringify(prev) === JSON.stringify(remoteAgendas)) return prev;
          saveStoredAgendas(remoteAgendas);
          return remoteAgendas;
        });
      },
      onAnnouncementsChange: (remoteAnnouncements) => {
        setAnnouncements(prev => {
          if (JSON.stringify(prev) === JSON.stringify(remoteAnnouncements)) return prev;
          saveStoredAnnouncements(remoteAnnouncements);
          return remoteAnnouncements;
        });
      },
      onAttendanceChange: (remoteAttendance) => {
        setAttendance(prev => {
          if (JSON.stringify(prev) === JSON.stringify(remoteAttendance)) return prev;
          saveStoredAttendance(remoteAttendance);
          return remoteAttendance;
        });
      },
      onCurriculumChange: (remoteCurriculum) => {
        setCurriculum(prev => {
          if (JSON.stringify(prev) === JSON.stringify(remoteCurriculum)) return prev;
          saveStoredCurriculum(remoteCurriculum);
          return remoteCurriculum;
        });
      },
      onTeachingJournalsChange: (remoteJournals) => {
        setTeachingJournals(prev => {
          if (JSON.stringify(prev) === JSON.stringify(remoteJournals)) return prev;
          saveStoredTeachingJournals(remoteJournals);
          return remoteJournals;
        });
      },
      onJpScheduleChange: (remoteJp) => {
        setJpSchedule(prev => {
          if (JSON.stringify(prev) === JSON.stringify(remoteJp)) return prev;
          saveStoredJpScheduleConfig(remoteJp);
          return remoteJp;
        });
      },
      onAssessmentsChange: (remoteAssessments) => {
        setAssessments(prev => {
          if (JSON.stringify(prev) === JSON.stringify(remoteAssessments)) return prev;
          saveStoredAssessments(remoteAssessments);
          return remoteAssessments;
        });
      },
      onExtracurricularsChange: (remoteExtras) => {
        setExtracurriculars(prev => {
          if (JSON.stringify(prev) === JSON.stringify(remoteExtras)) return prev;
          saveStoredExtracurriculars(remoteExtras);
          return remoteExtras;
        });
      },
      onCocurricularProjectsChange: (remoteProjects) => {
        setCocurricularProjects(prev => {
          if (JSON.stringify(prev) === JSON.stringify(remoteProjects)) return prev;
          saveStoredCocurricularProjects(remoteProjects);
          return remoteProjects;
        });
      },
      onStatusChange: (status, syncTime) => {
        setFirestoreStatus(status);
        if (syncTime) setLastSyncTime(syncTime);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [currentUser?.npsn, school.npsn]);

  // Self-heal: ensure no duplicate student IDs exist in state on initial load
  useEffect(() => {
    setStudents(prev => {
      const seen = new Set<string>();
      let hasDuplicate = false;
      const cleanList = prev.filter(s => {
        if (!s?.id || seen.has(s.id)) {
          hasDuplicate = true;
          return false;
        }
        seen.add(s.id);
        return true;
      });
      return hasDuplicate ? cleanList : prev;
    });
  }, []);

  // Self-heal: ensure all curriculum items have unique IDs, "Peserta didik mampu" in TP, and match official standards
  useEffect(() => {
    setCurriculum(prev => {
      const initialMap = new Map(initialCurriculum.map(i => [i.id, i]));
      let hasChange = false;
      const seenIds = new Set<string>();

      // First pass: remove any duplicate IDs
      const uniquePrev = prev.filter(item => {
        if (!item?.id || seenIds.has(item.id)) {
          hasChange = true;
          return false;
        }
        seenIds.add(item.id);
        return true;
      });

      const updated = uniquePrev.map(item => {
        const init = initialMap.get(item.id);
        if (init) {
          if (item.tujuanPembelajaran !== init.tujuanPembelajaran) {
            hasChange = true;
            return {
              ...item,
              tujuanPembelajaran: init.tujuanPembelajaran,
              capaianPembelajaran: init.capaianPembelajaran,
              elemen: init.elemen || item.elemen
            };
          }
          return item;
        }
        if (item.tujuanPembelajaran && !item.tujuanPembelajaran.includes('Peserta didik mampu')) {
          hasChange = true;
          const match = item.tujuanPembelajaran.match(/^(TP\s+[^:]+:\s*)(.*)$/);
          if (match) {
            const prefix = match[1];
            const rest = match[2].trim();
            const firstChar = rest.charAt(0);
            const firstWord = rest.split(/[\s,]+/)[0];
            const lowerFirstChar = (firstWord === 'Allah' || firstWord === 'Al-Quran' || firstWord === 'Scratch' || firstWord === 'AI') ? firstChar : firstChar.toLowerCase();
            return {
              ...item,
              tujuanPembelajaran: `${prefix}Peserta didik mampu ${lowerFirstChar}${rest.slice(1)}`
            };
          } else {
            const firstChar = item.tujuanPembelajaran.charAt(0);
            const firstWord = item.tujuanPembelajaran.split(/[\s,]+/)[0];
            const lowerFirstChar = (firstWord === 'Allah' || firstWord === 'Al-Quran' || firstWord === 'Scratch' || firstWord === 'AI') ? firstChar : firstChar.toLowerCase();
            return {
              ...item,
              tujuanPembelajaran: `Peserta didik mampu ${lowerFirstChar}${item.tujuanPembelajaran.slice(1)}`
            };
          }
        }
        return item;
      });
      if (hasChange) {
        saveStoredCurriculum(updated);
        return updated;
      }
      return prev;
    });
  }, []);

  // Apply data retrieved from Cloud
  const applyCloudData = (cloudData: AppSyncData) => {
    if (cloudData.school) setSchool(cloudData.school);
    if (cloudData.teachers) {
      const seenTeacher = new Set<string>();
      setTeachers(cloudData.teachers.filter(t => {
        if (!t?.id || seenTeacher.has(t.id)) return false;
        seenTeacher.add(t.id);
        return true;
      }));
    }
    if (cloudData.students) {
      const seenStudent = new Set<string>();
      setStudents(cloudData.students.filter(s => {
        if (!s?.id || seenStudent.has(s.id)) return false;
        seenStudent.add(s.id);
        return true;
      }));
    }
    if (cloudData.agendas) setAgendas(cloudData.agendas);
    if (cloudData.announcements) setAnnouncements(cloudData.announcements);
    if (cloudData.attendance) setAttendance(cloudData.attendance);
    if (cloudData.curriculum) {
      const initialMap = new Map<string, CurriculumItem>(initialCurriculum.map(i => [i.id, i]));
      const seenCloudCurIds = new Set<string>();
      const cleanedFromCloud = cloudData.curriculum.filter((item: CurriculumItem) => {
        if (!item?.id || seenCloudCurIds.has(item.id)) return false;
        if (LEGACY_DUMMY_IDS.has(item.id)) return false;
        if (typeof item.capaianPembelajaran === 'string' && item.capaianPembelajaran.includes('Peserta didik mempraktikkan variasi dan kombinasi')) return false;
        seenCloudCurIds.add(item.id);
        return true;
      });
      const healedCurriculum: CurriculumItem[] = cleanedFromCloud.map((item: CurriculumItem) => {
        const init = initialMap.get(item.id);
        if (init) {
          return {
            ...item,
            mataPelajaran: init.mataPelajaran || item.mataPelajaran,
            elemen: init.elemen || item.elemen,
            capaianPembelajaran: init.capaianPembelajaran,
            subOpsiSeni: init.subOpsiSeni || item.subOpsiSeni,
            faseKelas: init.faseKelas || item.faseKelas,
            kelasTarget: init.kelasTarget || item.kelasTarget,
            semester: item.semester || init.semester,
            tujuanPembelajaran: init.tujuanPembelajaran,
            materi: item.materi || init.materi,
            alokasiWaktu: item.alokasiWaktu || init.alokasiWaktu
          };
        }
        let customTP = item.tujuanPembelajaran;
        if (customTP && !customTP.includes('Peserta didik mampu')) {
          const match = customTP.match(/^(TP\s+[^:]+:\s*)(.*)$/);
          if (match) {
            const prefix = match[1];
            const rest = match[2].trim();
            const firstChar = rest.charAt(0);
            const firstWord = rest.split(/[\s,]+/)[0];
            const lowerFirstChar = (firstWord === 'Allah' || firstWord === 'Al-Quran' || firstWord === 'Scratch' || firstWord === 'AI') ? firstChar : firstChar.toLowerCase();
            customTP = `${prefix}Peserta didik mampu ${lowerFirstChar}${rest.slice(1)}`;
          } else {
            const firstChar = customTP.charAt(0);
            const firstWord = customTP.split(/[\s,]+/)[0];
            const lowerFirstChar = (firstWord === 'Allah' || firstWord === 'Al-Quran' || firstWord === 'Scratch' || firstWord === 'AI') ? firstChar : firstChar.toLowerCase();
            customTP = `Peserta didik mampu ${lowerFirstChar}${customTP.slice(1)}`;
          }
        }
        if (
          item.mataPelajaran.includes('Jasmani') && 
          item.faseKelas?.includes('Fase B') && 
          item.elemen === 'Terampil Bergerak' && 
          (!item.capaianPembelajaran || item.capaianPembelajaran.includes('Peserta didik mempraktikkan'))
        ) {
          return {
            ...item,
            tujuanPembelajaran: customTP,
            capaianPembelajaran: 'Menghaluskan keterampilan gerak fundamental dan menerapkannya dalam situasi gerak yang baru; menyesuaikan strategi gerak untuk mendapatkan capaian keterampilan gerak; dan memperagakan berbagai konsep gerak yang dapat diterapkan dalam rangkaian gerak.'
          };
        }
        return {
          ...item,
          tujuanPembelajaran: customTP
        };
      });
      const existingIds = new Set(healedCurriculum.map(i => i.id));
      const missingInitial = initialCurriculum.filter(i => !existingIds.has(i.id));
      const finalCur = [...healedCurriculum, ...missingInitial];
      setCurriculum(finalCur);
      saveStoredCurriculum(finalCur);
    }
    if (cloudData.teachingJournals) setTeachingJournals(cloudData.teachingJournals);
    if (cloudData.jpSchedule) setJpSchedule(cloudData.jpSchedule);
    if (cloudData.assessments) setAssessments(cloudData.assessments);
    if (cloudData.extracurriculars) setExtracurriculars(cloudData.extracurriculars);
    if (cloudData.cocurricularProjects) setCocurricularProjects(cloudData.cocurricularProjects);
    if (cloudData.classes) setClasses(cloudData.classes);
    if (cloudData.syncedAt) setLastSyncTime(cloudData.syncedAt);
  };

  // Check auth & pull cloud data on mount
  useEffect(() => {
    let isMounted = true;
    const checkAuthAndSync = async () => {
      try {
        const user = await authService.getCurrentUser();
        if (isMounted && user) {
          setCurrentUser(user);
          const cloud = await authService.fetchCloudSyncData();
          if (isMounted && cloud && cloud.school) {
            applyCloudData(cloud);
          }
        }
      } catch (err) {
        console.warn('Initial cloud sync / auth check:', err);
      } finally {
        if (isMounted) setIsCheckingAuth(false);
      }
    };
    checkAuthAndSync();
    return () => { isMounted = false; };
  }, []);

  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>(getStoredActiveTab);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Synchronize activeTab to localStorage and URL hash
  useEffect(() => {
    saveStoredActiveTab(activeTab);
  }, [activeTab]);

  // Synchronize from window hash changes or browser history
  useEffect(() => {
    const handleHashChange = () => {
      const currentTab = getStoredActiveTab();
      setActiveTab(prev => (prev !== currentTab ? currentTab : prev));
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  // Modals States
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [isTeacherImportModalOpen, setIsTeacherImportModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [selectedTeacherForDetail, setSelectedTeacherForDetail] = useState<Teacher | null>(null);

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isStudentImportModalOpen, setIsStudentImportModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);
  const [defaultStudentClass, setDefaultStudentClass] = useState<ClassGrade>('1A');

  const [isPromotionModalOpen, setIsPromotionModalOpen] = useState(false);
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printReportInitialType, setPrintReportInitialType] = useState<ReportModalType>('rekap-siswa');

  // Confirmation Delete Modal
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

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, message?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, title, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Sync state to localStorage on changes
  useEffect(() => {
    saveStoredSchoolProfile(school);
  }, [school]);

  useEffect(() => {
    saveStoredTeachers(teachers);
  }, [teachers]);

  useEffect(() => {
    saveStoredStudents(students);
  }, [students]);

  useEffect(() => {
    saveStoredAgendas(agendas);
  }, [agendas]);

  useEffect(() => {
    saveStoredAnnouncements(announcements);
  }, [announcements]);

  useEffect(() => {
    saveStoredAttendance(attendance);
  }, [attendance]);

  useEffect(() => {
    saveStoredCurriculum(curriculum);
  }, [curriculum]);

  useEffect(() => {
    saveStoredTeachingJournals(teachingJournals);
  }, [teachingJournals]);

  useEffect(() => {
    saveStoredJpScheduleConfig(jpSchedule);
  }, [jpSchedule]);

  useEffect(() => {
    saveStoredAssessments(assessments);
  }, [assessments]);

  useEffect(() => {
    saveStoredExtracurriculars(extracurriculars);
  }, [extracurriculars]);

  useEffect(() => {
    saveStoredCocurricularProjects(cocurricularProjects);
  }, [cocurricularProjects]);

  useEffect(() => {
    saveStoredClasses(classes);
  }, [classes]);

  // Debounced Auto-sync to Local Server and Firestore (with quota guard)
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const schoolNpsn = currentUser?.npsn || school.npsn || '20512345';
        const payload: AppSyncData = {
          school,
          teachers,
          students,
          agendas,
          announcements,
          attendance,
          curriculum,
          teachingJournals,
          jpSchedule,
          assessments,
          extracurriculars,
          cocurricularProjects,
          classes,
          syncedAt: new Date().toISOString()
        };

        // Always save to internal server backup and storage (zero Firestore quota consumed)
        authService.pushCloudSyncData(payload).catch(() => {});
        setLastSyncTime(payload.syncedAt);

        // If Firestore quota was previously exceeded, keep status indicator updated
        if (getIsQuotaExceeded()) {
          setFirestoreStatus('quota-exceeded');
          return;
        }
      } catch (err) {
        if (isQuotaError(err)) {
          setFirestoreStatus('quota-exceeded');
        } else {
          console.warn('Background auto-save failed:', err);
        }
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [
    currentUser,
    school,
    teachers,
    students,
    agendas,
    announcements,
    attendance,
    curriculum,
    teachingJournals,
    jpSchedule,
    assessments,
    extracurriculars,
    cocurricularProjects,
    classes
  ]);

  // Manual Firestore Sync Trigger
  const handleManualSync = async () => {
    setIsSyncing(true);
    const schoolNpsn = currentUser?.npsn || school.npsn || '20512345';
    try {
      const payload: AppSyncData = {
        school,
        teachers,
        students,
        agendas,
        announcements,
        attendance,
        curriculum,
        teachingJournals,
        jpSchedule,
        assessments,
        extracurriculars,
        cocurricularProjects,
        classes,
        syncedAt: new Date().toISOString()
      };

      // If quota was previously exceeded, attempt reconnection check
      if (getIsQuotaExceeded()) {
        const reconnected = await retryQuotaConnection();
        if (!reconnected) {
          // Backup to local server
          await authService.pushCloudSyncData(payload).catch(() => {});
          setLastSyncTime(payload.syncedAt);
          setFirestoreStatus('quota-exceeded');
          addToast(
            'Kuota Harian Firebase Tercapai',
            'Batas kuota gratis harian Firebase Firestore (Free Tier) sedang aktif untuk hari ini. Seluruh data Anda aman dan telah tersimpan di memori perangkat & server internal. Kuota akan direset otomatis oleh Google setiap 24 jam.',
            'info'
          );
          return;
        }
      }

      const res = await pushFullSchoolDataToFirestore(
        schoolNpsn,
        payload,
        currentUser?.name || 'Admin Sekolah'
      );
      authService.pushCloudSyncData(payload).catch(() => {});
      setLastSyncTime(res.syncedAt);

      if (res.quotaExceeded) {
        setFirestoreStatus('quota-exceeded');
        addToast(
          'Kuota Harian Firebase Tercapai',
          'Batas kuota tulis harian gratis Firebase tercapai. Data Anda tetap tersimpan aman di penyimpanan lokal dan server internal.',
          'info'
        );
      } else {
        setFirestoreStatus('connected');
        addToast(
          'Sinkronisasi Firestore Berhasil',
          'Seluruh data (profil sekolah, GTK, siswa, nilai, presensi, dll.) telah tersimpan dan tersinkronisasi real-time antar perangkat via Firebase Firestore.',
          'success'
        );
      }
    } catch (err: any) {
      if (isQuotaError(err)) {
        setFirestoreStatus('quota-exceeded');
        addToast(
          'Kuota Harian Firebase Tercapai',
          'Batas kuota gratis harian tercapai. Data Anda aman tersimpan di memori lokal & server.',
          'info'
        );
      } else {
        console.error('Firestore sync error:', err);
        setFirestoreStatus('error');
        addToast('Sinkronisasi Gagal', err?.message || 'Gagal menyinkronkan dengan Firebase Firestore.', 'error');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  // Login Success Handler
  const handleLoginSuccess = (user: AuthUser, cloudData?: AppSyncData | null) => {
    setCurrentUser(user);
    if (cloudData && cloudData.school) {
      applyCloudData(cloudData);
    } else {
      if (user.schoolName && user.schoolName !== 'SDN Malathe Pote 1 Kokop') {
        setSchool(prev => ({
          ...prev,
          namaSekolah: user.schoolName,
          npsn: user.npsn || prev.npsn,
          email: user.email || prev.email
        }));
      }
      setTimeout(() => {
        handleManualSync();
      }, 500);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    openDeleteConfirm({
      title: 'Keluar dari Aplikasi (Logout)',
      itemName: currentUser?.name || 'Akun Guru',
      description: 'Apakah Anda yakin ingin keluar? Data Anda tersimpan aman di server cloud dan dapat dibuka kembali kapan saja dari perangkat mana pun.',
      confirmButtonText: 'Ya, Keluar Sekarang',
      onConfirm: () => {
        authService.logout();
        setCurrentUser(null);
        addToast('Berhasil Keluar', 'Sesi login telah selesai. Silakan masuk kembali kapan saja.', 'info');
      }
    });
  };

  // Handlers for Class Management
  const handleAddClass = (newClassData: Omit<ClassRoomItem, 'id'>) => {
    const newClass: ClassRoomItem = {
      ...newClassData,
      id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      tahunAjaran: school?.tahunAjaran || '2025/2026'
    };
    setClasses(prev => [...prev, newClass]);
    addToast('Rombel Ditambahkan', `Kelas ${newClass.nama} berhasil ditambahkan ke daftar rombongan belajar.`, 'success');
  };

  const handleEditClass = (oldName: string, updatedClass: ClassRoomItem) => {
    setClasses(prev => prev.map(c => c.id === updatedClass.id ? updatedClass : c));
    
    // If class name changed, update all student references
    if (oldName !== updatedClass.nama) {
      setStudents(prev => prev.map(s => s.kelas === oldName ? { ...s, kelas: updatedClass.nama } : s));
      addToast('Rombel Diperbarui', `Kelas ${oldName} diubah menjadi ${updatedClass.nama}. Data siswa diperbarui otomatis.`, 'success');
    } else {
      addToast('Rombel Diperbarui', `Informasi kelas ${updatedClass.nama} berhasil diperbarui.`, 'success');
    }
  };

  const handleDeleteClass = (classToDelete: ClassRoomItem, transferToClass?: string) => {
    setClasses(prev => prev.filter(c => c.id !== classToDelete.id));
    
    if (transferToClass) {
      setStudents(prev => prev.map(s => s.kelas === classToDelete.nama ? { ...s, kelas: transferToClass } : s));
      addToast('Rombel Dihapus', `Kelas ${classToDelete.nama} dihapus. Siswa berhasil dialihkan ke kelas ${transferToClass}.`, 'info');
    } else {
      addToast('Rombel Dihapus', `Kelas ${classToDelete.nama} berhasil dihapus dari daftar rombel.`, 'info');
    }
  };

  const handleResetClasses = () => {
    const currentTa = school?.tahunAjaran || '2025/2026';
    const defaultClasses: ClassRoomItem[] = [
      { id: 'c1a', nama: '1A', tingkat: 1, kapasitas: 28, ruangan: 'Ruang 01 (Lantai 1)', tahunAjaran: currentTa },
      { id: 'c1b', nama: '1B', tingkat: 1, kapasitas: 28, ruangan: 'Ruang 02 (Lantai 1)', tahunAjaran: currentTa },
      { id: 'c2a', nama: '2A', tingkat: 2, kapasitas: 28, ruangan: 'Ruang 03 (Lantai 1)', tahunAjaran: currentTa },
      { id: 'c2b', nama: '2B', tingkat: 2, kapasitas: 28, ruangan: 'Ruang 04 (Lantai 1)', tahunAjaran: currentTa },
      { id: 'c3a', nama: '3A', tingkat: 3, kapasitas: 28, ruangan: 'Ruang 05 (Lantai 1)', tahunAjaran: currentTa },
      { id: 'c3b', nama: '3B', tingkat: 3, kapasitas: 28, ruangan: 'Ruang 06 (Lantai 1)', tahunAjaran: currentTa },
      { id: 'c4a', nama: '4A', tingkat: 4, kapasitas: 28, ruangan: 'Ruang 07 (Lantai 2)', tahunAjaran: currentTa },
      { id: 'c4b', nama: '4B', tingkat: 4, kapasitas: 28, ruangan: 'Ruang 08 (Lantai 2)', tahunAjaran: currentTa },
      { id: 'c5a', nama: '5A', tingkat: 5, kapasitas: 28, ruangan: 'Ruang 09 (Lantai 2)', tahunAjaran: currentTa },
      { id: 'c5b', nama: '5B', tingkat: 5, kapasitas: 28, ruangan: 'Ruang 10 (Lantai 2)', tahunAjaran: currentTa },
      { id: 'c6a', nama: '6A', tingkat: 6, kapasitas: 28, ruangan: 'Ruang 11 (Lantai 2)', tahunAjaran: currentTa },
      { id: 'c6b', nama: '6B', tingkat: 6, kapasitas: 28, ruangan: 'Ruang 12 (Lantai 2)', tahunAjaran: currentTa },
    ];
    setClasses(defaultClasses);
    saveStoredClasses(defaultClasses);
    addToast('Rombel Direset', 'Daftar rombongan belajar berhasil dikembalikan ke standar bawaan (1A - 6B).', 'info');
  };

  // Handlers for Student Assessments
  const handleSaveAssessment = (assessment: StudentAssessment) => {
    setAssessments(prev => {
      const idx = prev.findIndex(a => a.id === assessment.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = assessment;
        return copy;
      }
      return [assessment, ...prev];
    });
  };

  const handleDeleteAssessment = (assessmentId: string) => {
    setAssessments(prev => prev.filter(a => a.id !== assessmentId));
  };

  // Handlers for Extracurricular
  const handleSaveExtracurricular = (extra: ExtracurricularAssessment) => {
    setExtracurriculars(prev => {
      const idx = prev.findIndex(e => e.id === extra.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = extra;
        return copy;
      }
      return [extra, ...prev];
    });
  };

  const handleDeleteExtracurricular = (extraId: string) => {
    setExtracurriculars(prev => prev.filter(e => e.id !== extraId));
  };

  // Handlers for Cocurricular (P5)
  const handleSaveCocurricularProject = (project: CocurricularProject) => {
    setCocurricularProjects(prev => {
      const idx = prev.findIndex(p => p.id === project.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = project;
        return copy;
      }
      return [project, ...prev];
    });
  };

  const handleDeleteCocurricularProject = (projectId: string) => {
    setCocurricularProjects(prev => prev.filter(p => p.id !== projectId));
  };

  // Handlers for Teaching Journal & Curriculum
  const handleSaveTeachingJournal = (journal: DailyTeachingJournal) => {
    setTeachingJournals(prev => {
      const exists = prev.some(j => j.id === journal.id);
      if (exists) {
        return prev.map(j => j.id === journal.id ? journal : j);
      }
      return [journal, ...prev];
    });
  };

  const handleDeleteTeachingJournal = (id: string) => {
    const target = teachingJournals.find(j => j.id === id);
    openDeleteConfirm({
      title: 'Hapus Jurnal Mengajar',
      itemName: target ? `${target.mataPelajaran} (${target.kelas}) - ${target.tanggal}` : 'Catatan Jurnal Mengajar',
      description: 'Apakah Anda yakin ingin menghapus catatan agenda KBM ini dari sistem?',
      confirmButtonText: 'Ya, Hapus Jurnal',
      onConfirm: () => {
        setTeachingJournals(prev => prev.filter(j => j.id !== id));
        addToast('Jurnal Mengajar Dihapus', 'Catatan jurnal mengajar berhasil dihapus.', 'info');
      }
    });
  };

  const handleUpdateCurriculum = (newList: CurriculumItem[]) => {
    setCurriculum(newList);
  };

  // Handlers for Attendance
  const handleSaveAttendance = (newAtt: DailyClassAttendance) => {
    setAttendance(prev => {
      const filtered = prev.filter(a => !(a.tanggal === newAtt.tanggal && a.kelas === newAtt.kelas));
      return [newAtt, ...filtered];
    });
  };

  const handleBatchUpdateAttendance = (newList: DailyClassAttendance[]) => {
    setAttendance(newList);
  };

  // Handlers for School Profile
  const handleUpdateSchool = (updated: SchoolProfile) => {
    setSchool(updated);
  };

  // Handlers for Teachers
  const handleSaveTeacher = (teacher: Teacher) => {
    if (editingTeacher) {
      setTeachers(prev => prev.map(t => (t.id === teacher.id ? teacher : t)));
      addToast('Data Guru Diperbarui', `Informasi ${teacher.namaLengkap} berhasil disimpan.`, 'success');
    } else {
      setTeachers(prev => [teacher, ...prev]);
      addToast('Guru Berhasil Ditambahkan', `${teacher.namaLengkap} telah didaftarkan ke sistem.`, 'success');
    }
    setIsTeacherModalOpen(false);
    setEditingTeacher(null);
  };

  const handleImportTeachers = (imported: Teacher[], mode: 'append' | 'merge') => {
    if (mode === 'append') {
      setTeachers(prev => [...imported, ...prev]);
      addToast('Import Berhasil', `${imported.length} data guru berhasil ditambahkan ke sistem.`, 'success');
    } else {
      // Merge mode: replace existing if NIP or NUPTK matches, otherwise append
      setTeachers(prev => {
        const updatedList = [...prev];
        let updatedCount = 0;
        let insertedCount = 0;

        imported.forEach(newT => {
          const matchIdx = updatedList.findIndex(
            existing => 
              (existing.nip !== '-' && existing.nip === newT.nip) ||
              (existing.nuptk !== '-' && existing.nuptk === newT.nuptk) ||
              (existing.namaLengkap.toLowerCase() === newT.namaLengkap.toLowerCase() && existing.tanggalLahir === newT.tanggalLahir)
          );

          if (matchIdx !== -1) {
            updatedList[matchIdx] = { ...updatedList[matchIdx], ...newT, id: updatedList[matchIdx].id };
            updatedCount++;
          } else {
            updatedList.unshift(newT);
            insertedCount++;
          }
        });

        addToast(
          'Import Excel Berhasil',
          `Selesai memproses ${imported.length} data guru (${insertedCount} baru, ${updatedCount} diperbarui).`,
          'success'
        );
        return updatedList;
      });
    }
  };

  const handleDeleteTeacher = (id: string, name: string) => {
    openDeleteConfirm({
      title: 'Hapus Data Guru / GTK',
      itemName: name,
      description: `Apakah Anda yakin ingin menghapus data "${name}" dari daftar GTK sekolah? Tindakan ini tidak dapat dibatalkan.`,
      confirmButtonText: 'Ya, Hapus Guru',
      onConfirm: () => {
        setTeachers(prev => prev.filter(t => t.id !== id));
        addToast('Data Guru Dihapus', `${name} telah dihapus dari daftar GTK.`, 'info');
      }
    });
  };

  // Handlers for Students
  const handleSaveStudent = (student: Student) => {
    if (editingStudent) {
      setStudents(prev => prev.map(s => (s.id === student.id ? student : s)));
      addToast('Data Siswa Diperbarui', `Data ${student.namaLengkap} berhasil diperbarui.`, 'success');
    } else {
      setStudents(prev => [student, ...prev.filter(s => s.id !== student.id)]);
      addToast('Siswa Berhasil Didaftarkan', `${student.namaLengkap} masuk ke Kelas ${student.kelas}.`, 'success');
    }
    setIsStudentModalOpen(false);
    setEditingStudent(null);
  };

  const handleImportStudents = (imported: Student[], mode: 'append' | 'merge') => {
    if (mode === 'append') {
      setStudents(prev => {
        const seen = new Set(prev.map(s => s.id));
        const filteredNew = imported.filter(s => !seen.has(s.id));
        return [...filteredNew, ...prev];
      });
      addToast('Import Berhasil', `${imported.length} data peserta didik berhasil ditambahkan.`, 'success');
    } else {
      // Merge mode: replace existing if NISN or NIS matches, otherwise append
      setStudents(prev => {
        const updatedList = [...prev];
        let updatedCount = 0;
        let insertedCount = 0;

        imported.forEach(newS => {
          const matchIdx = updatedList.findIndex(
            existing => 
              (existing.nisn && existing.nisn === newS.nisn) ||
              (existing.nis && existing.nis === newS.nis) ||
              (existing.namaLengkap.toLowerCase() === newS.namaLengkap.toLowerCase() && existing.tanggalLahir === newS.tanggalLahir)
          );

          if (matchIdx !== -1) {
            updatedList[matchIdx] = { ...updatedList[matchIdx], ...newS, id: updatedList[matchIdx].id };
            updatedCount++;
          } else {
            updatedList.unshift(newS);
            insertedCount++;
          }
        });

        addToast(
          'Import Excel Berhasil',
          `Selesai memproses ${imported.length} data siswa (${insertedCount} baru, ${updatedCount} diperbarui).`,
          'success'
        );
        return updatedList;
      });
    }
  };

  const handleDeleteStudent = (id: string, name: string) => {
    openDeleteConfirm({
      title: 'Hapus Data Siswa',
      itemName: name,
      description: `Apakah Anda yakin ingin menghapus data siswa "${name}" dari Buku Induk? Tindakan ini tidak dapat dibatalkan.`,
      confirmButtonText: 'Ya, Hapus Siswa',
      onConfirm: () => {
        setStudents(prev => prev.filter(s => s.id !== id));
        addToast('Data Siswa Dihapus', `Data ${name} telah dihapus dari buku induk.`, 'info');
      }
    });
  };

  const handleBatchUpdateStudents = (updatedStudents: Student[]) => {
    setStudents(updatedStudents);
    addToast('Proses Massal Selesai', 'Data kenaikan / mutasi kelas berhasil diproses.', 'success');
  };

  // Handlers for Agendas & Announcements
  const handleToggleAgenda = (agendaId: string) => {
    setAgendas(prev =>
      prev.map(a => (a.id === agendaId ? { ...a, selesai: !a.selesai } : a))
    );
  };

  const handleAddAgenda = (newAgenda: Omit<SchoolAgenda, 'id' | 'selesai'>) => {
    const item: SchoolAgenda = {
      ...newAgenda,
      id: `agenda-${Date.now()}`,
      selesai: false
    };
    setAgendas(prev => [item, ...prev]);
    addToast('Agenda Ditambahkan', `"${item.judul}" telah dicatat di kalender kegiatan.`, 'success');
  };

  const handleDeleteAgenda = (agendaId: string, judul: string) => {
    openDeleteConfirm({
      title: 'Hapus Agenda Kegiatan',
      itemName: judul,
      description: `Apakah Anda yakin ingin menghapus agenda kegiatan "${judul}"?`,
      confirmButtonText: 'Ya, Hapus Agenda',
      onConfirm: () => {
        setAgendas(prev => prev.filter(a => a.id !== agendaId));
        addToast('Agenda Dihapus', `Agenda "${judul}" telah dihapus.`, 'info');
      }
    });
  };

  const handleAddAnnouncement = (newAnn: Omit<SchoolAnnouncement, 'id'>) => {
    const item: SchoolAnnouncement = {
      ...newAnn,
      id: `ann-${Date.now()}`
    };
    setAnnouncements(prev => [item, ...prev]);
    addToast('Pengumuman Dipublikasikan', `"${item.judul}" berhasil diterbitkan.`, 'success');
  };

  const handleDeleteAnnouncement = (annId: string, judul: string) => {
    openDeleteConfirm({
      title: 'Hapus Pengumuman',
      itemName: judul,
      description: `Apakah Anda yakin ingin menghapus pengumuman "${judul}"?`,
      confirmButtonText: 'Ya, Hapus Pengumuman',
      onConfirm: () => {
        setAnnouncements(prev => prev.filter(a => a.id !== annId));
        addToast('Pengumuman Dihapus', `Pengumuman "${judul}" telah dihapus.`, 'info');
      }
    });
  };

  // Backup & Reset
  const handleExportBackup = () => {
    exportAllDataJSON(
      school, 
      teachers, 
      students, 
      agendas, 
      announcements, 
      attendance, 
      curriculum, 
      teachingJournals, 
      jpSchedule, 
      assessments,
      extracurriculars,
      cocurricularProjects
    );
    addToast('Backup Berhasil', 'File data cadangan JSON berhasil diunduh.', 'success');
  };

  const handleResetData = () => {
    openDeleteConfirm({
      title: 'Reset Seluruh Data Aplikasi',
      itemName: 'Seluruh Database Sekolah, Guru, Siswa, Jurnal, Penilaian, Ekskul & Kokurikuler',
      description: 'Apakah Anda yakin ingin mengembalikan seluruh data sekolah ke kondisi awal bawaan? Seluruh data yang sudah diinput akan terhapus.',
      confirmButtonText: 'Ya, Reset Semua Data',
      onConfirm: () => {
        const reseted = resetAllData();
        setSchool(reseted.school);
        setTeachers(reseted.teachers);
        setStudents(reseted.students);
        setAgendas(reseted.agendas);
        setAnnouncements(reseted.announcements);
        setAttendance(reseted.attendance);
        setCurriculum(reseted.curriculum);
        setTeachingJournals(reseted.teachingJournals);
        setJpSchedule(reseted.jpSchedule);
        setAssessments(reseted.assessments);
        setExtracurriculars(reseted.extracurriculars);
        setCocurricularProjects(reseted.cocurricularProjects);
        addToast('Data Direset', 'Seluruh data telah dikembalikan ke kondisi awal bawaan.', 'info');
      }
    });
  };

  // Initial loading screen while verifying auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-center">
        <div className="p-3 bg-white rounded-3xl shadow-2xl ring-4 ring-emerald-500/30 border border-slate-200 mb-4 animate-pulse">
          <img 
            src="/logo_kkg_guslah.jpg" 
            alt="Logo KKG Guslah 1 Malathe Pote Kokop" 
            className="w-24 h-24 object-contain rounded-2xl"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.endsWith('logo_kkg_guslah.svg')) {
                target.src = '/logo_kkg_guslah.svg';
              }
            }}
          />
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
          KKG Guslah 1 Malathe Pote Kokop
        </h2>
        <p className="text-xs sm:text-sm text-emerald-400 font-medium mt-1">
          Memeriksa autentikasi & menyinkronkan data cloud...
        </p>
      </div>
    );
  }

  // Not logged in -> Show Login Gateway
  if (!currentUser) {
    return (
      <>
        <LoginGateway 
          onLoginSuccess={handleLoginSuccess}
          onShowToast={addToast}
        />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white font-sans">
      {/* Top Header */}
      <Header
        school={school}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenPrintModal={() => setIsPrintModalOpen(true)}
        onExportBackup={handleExportBackup}
        onResetData={handleResetData}
        isMobileNavOpen={isMobileNavOpen}
        setIsMobileNavOpen={setIsMobileNavOpen}
        currentUser={currentUser}
        onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        onLogout={handleLogout}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        onManualSync={handleManualSync}
        firestoreStatus={firestoreStatus}
      />

      {/* Main Layout Body */}
      <div id="main-app-container" className={`flex-1 flex max-w-7xl w-full mx-auto print:max-w-full print:w-full print:m-0 print:p-0 ${isPrintModalOpen ? 'print:hidden' : ''}`}>
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          teacherCount={teachers.filter(t => t.statusAktif).length}
          studentCount={students.filter(s => s.statusSiswa === 'Aktif').length}
          classCount={classes.length}
          onOpenClassModal={() => setIsClassModalOpen(true)}
          isMobileOpen={isMobileNavOpen}
          onCloseMobile={() => setIsMobileNavOpen(false)}
          currentUser={currentUser}
          onOpenChangePassword={() => setIsChangePasswordOpen(true)}
          onLogout={handleLogout}
          isSyncing={isSyncing}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 print:p-0 print:m-0 print:w-full">
          {activeTab === 'dashboard' && (
            <DashboardView
              school={school}
              teachers={teachers}
              students={students}
              agendas={agendas}
              announcements={announcements}
              classes={classes}
              onNavigateTab={setActiveTab}
              onOpenAddStudent={() => {
                setEditingStudent(null);
                setDefaultStudentClass(classes[0]?.nama || '1A');
                setIsStudentModalOpen(true);
              }}
              onOpenAddTeacher={() => {
                setEditingTeacher(null);
                setIsTeacherModalOpen(true);
              }}
              onToggleAgenda={handleToggleAgenda}
              onAddAgenda={handleAddAgenda}
              onDeleteAgenda={handleDeleteAgenda}
              onAddAnnouncement={handleAddAnnouncement}
              onDeleteAnnouncement={handleDeleteAnnouncement}
            />
          )}

          {activeTab === 'data-sekolah' && (
            <SchoolProfileView
              profile={school}
              onUpdateProfile={handleUpdateSchool}
              onShowToast={addToast}
            />
          )}

          {activeTab === 'data-guru' && (
            <TeacherListView
              teachers={teachers}
              school={school}
              onOpenAddModal={() => {
                setEditingTeacher(null);
                setIsTeacherModalOpen(true);
              }}
              onOpenEditModal={(teacher) => {
                setEditingTeacher(teacher);
                setIsTeacherModalOpen(true);
              }}
              onOpenDetailModal={(teacher) => {
                setSelectedTeacherForDetail(teacher);
              }}
              onDeleteTeacher={handleDeleteTeacher}
              onOpenImportModal={() => setIsTeacherImportModalOpen(true)}
            />
          )}

          {activeTab === 'data-siswa' && (
            <StudentListView
              students={students}
              school={school}
              classes={classes}
              onOpenClassModal={() => setIsClassModalOpen(true)}
              onOpenAddModal={(defaultClass) => {
                setEditingStudent(null);
                if (defaultClass) setDefaultStudentClass(defaultClass);
                setIsStudentModalOpen(true);
              }}
              onOpenEditModal={(student) => {
                setEditingStudent(student);
                setIsStudentModalOpen(true);
              }}
              onOpenDetailModal={(student) => {
                setSelectedStudentForDetail(student);
              }}
              onOpenPromotionModal={() => {
                setIsPromotionModalOpen(true);
              }}
              onDeleteStudent={handleDeleteStudent}
              onOpenImportModal={() => setIsStudentImportModalOpen(true)}
            />
          )}

          {activeTab === 'presensi' && (
            <StudentAttendanceView
              students={students}
              teachers={teachers}
              school={school}
              classes={classes}
              attendanceList={attendance}
              onSaveAttendance={handleSaveAttendance}
              onBatchUpdateAttendance={handleBatchUpdateAttendance}
              onAddToast={addToast}
            />
          )}

          {activeTab === 'jurnal-mengajar' && (
            <DailyTeachingJournalView
              teachers={teachers}
              school={school}
              curriculum={curriculum}
              teachingJournals={teachingJournals}
              jpSchedule={jpSchedule}
              classes={classes}
              onOpenClassModal={() => setIsClassModalOpen(true)}
              onSaveJpSchedule={setJpSchedule}
              onSaveJournal={handleSaveTeachingJournal}
              onDeleteJournal={handleDeleteTeachingJournal}
              onUpdateCurriculum={handleUpdateCurriculum}
              onOpenPrintJournal={() => {
                setPrintReportInitialType('cetak-jurnal');
                setIsPrintModalOpen(true);
              }}
              onAddToast={addToast}
              onShowToast={addToast}
            />
          )}

          {activeTab === 'penilaian' && (
            <StudentGradingView
              students={students}
              teachers={teachers}
              school={school}
              curriculum={curriculum}
              assessments={assessments}
              classes={classes}
              onOpenClassModal={() => setIsClassModalOpen(true)}
              onSaveAssessment={handleSaveAssessment}
              onDeleteAssessment={handleDeleteAssessment}
              extracurriculars={extracurriculars}
              onSaveExtracurricular={handleSaveExtracurricular}
              onDeleteExtracurricular={handleDeleteExtracurricular}
              cocurricularProjects={cocurricularProjects}
              onSaveCocurricularProject={handleSaveCocurricularProject}
              onDeleteCocurricularProject={handleDeleteCocurricularProject}
              onAddToast={addToast}
            />
          )}

          {activeTab === 'ekstrakurikuler' && (
            <StudentGradingView
              students={students}
              teachers={teachers}
              school={school}
              curriculum={curriculum}
              assessments={assessments}
              classes={classes}
              onOpenClassModal={() => setIsClassModalOpen(true)}
              onSaveAssessment={handleSaveAssessment}
              onDeleteAssessment={handleDeleteAssessment}
              extracurriculars={extracurriculars}
              onSaveExtracurricular={handleSaveExtracurricular}
              onDeleteExtracurricular={handleDeleteExtracurricular}
              cocurricularProjects={cocurricularProjects}
              onSaveCocurricularProject={handleSaveCocurricularProject}
              onDeleteCocurricularProject={handleDeleteCocurricularProject}
              onAddToast={addToast}
              initialSubTab="ekskul"
            />
          )}

          {activeTab === 'kokurikuler' && (
            <StudentGradingView
              students={students}
              teachers={teachers}
              school={school}
              curriculum={curriculum}
              assessments={assessments}
              classes={classes}
              onOpenClassModal={() => setIsClassModalOpen(true)}
              onSaveAssessment={handleSaveAssessment}
              onDeleteAssessment={handleDeleteAssessment}
              extracurriculars={extracurriculars}
              onSaveExtracurricular={handleSaveExtracurricular}
              onDeleteExtracurricular={handleDeleteExtracurricular}
              cocurricularProjects={cocurricularProjects}
              onSaveCocurricularProject={handleSaveCocurricularProject}
              onDeleteCocurricularProject={handleDeleteCocurricularProject}
              onAddToast={addToast}
              initialSubTab="kokurikuler"
            />
          )}

          {activeTab === 'rapor' && (
            <StudentReportCardView
              school={school}
              teachers={teachers}
              students={students}
              classes={classes}
              assessments={assessments}
              attendance={attendance}
              curriculum={curriculum}
              extracurriculars={extracurriculars}
              cocurricularProjects={cocurricularProjects}
              onUpdateStudent={handleSaveStudent}
              onAddToast={addToast}
              onOpenPrintReports={(type) => {
                setPrintReportInitialType(type);
                setIsPrintModalOpen(true);
              }}
            />
          )}

          {activeTab === 'laporan' && (
            <div className="space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Laporan & Pusat Cetak Dokumen Resmi SD
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Cetak format resmi Form 8355, Jurnal Mengajar KBM, Rekap GTK, Profil Sekolah, dan Lembar Presensi Kelas.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPrintReportInitialType('rekap-siswa');
                    setIsPrintModalOpen(true);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-600/30 transition-all self-start sm:self-auto"
                >
                  Buka Dialog Cetak & Pratinjau Dokumen
                </button>
              </div>

              {/* Instant Preview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <div 
                  onClick={() => {
                    setPrintReportInitialType('rekap-siswa');
                    setIsPrintModalOpen(true);
                  }}
                  className="bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-5 cursor-pointer transition-all group"
                >
                  <div className="text-xs font-bold uppercase text-blue-400 mb-1">Form 8355</div>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-300">Rekapitulasi Siswa</h3>
                  <p className="text-xs text-slate-400 mt-2">
                    Laporan bulanan jumlah siswa aktif per rombel & pembagian gender (L/P).
                  </p>
                </div>

                <div 
                  onClick={() => {
                    setPrintReportInitialType('rekap-guru');
                    setIsPrintModalOpen(true);
                  }}
                  className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-5 cursor-pointer transition-all group"
                >
                  <div className="text-xs font-bold uppercase text-emerald-400 mb-1">Data GTK</div>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-300">Daftar Guru & PTK</h3>
                  <p className="text-xs text-slate-400 mt-2">
                    Rekapitulasi NIP, NUPTK, status kepegawaian PNS/PPPK, dan sertifikasi.
                  </p>
                </div>

                <div 
                  onClick={() => {
                    setPrintReportInitialType('profil-sekolah');
                    setIsPrintModalOpen(true);
                  }}
                  className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 cursor-pointer transition-all group"
                >
                  <div className="text-xs font-bold uppercase text-amber-400 mb-1">Profil Lembaga</div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-300">Profil & Visi Misi</h3>
                  <p className="text-xs text-slate-400 mt-2">
                    Lembar profil legalitas sekolah, akreditasi, data sarpras, dan kontak resmi.
                  </p>
                </div>

                <div 
                  onClick={() => {
                    setPrintReportInitialType('daftar-hadir');
                    setIsPrintModalOpen(true);
                  }}
                  className="bg-slate-900 border border-slate-800 hover:border-violet-500/40 rounded-2xl p-5 cursor-pointer transition-all group"
                >
                  <div className="text-xs font-bold uppercase text-violet-400 mb-1">Presensi</div>
                  <h3 className="text-base font-bold text-white group-hover:text-violet-300">Daftar Hadir Kelas</h3>
                  <p className="text-xs text-slate-400 mt-2">
                    Format lembar absensi bulanan siswa siap cetak untuk setiap wali kelas.
                  </p>
                </div>

                <div 
                  onClick={() => {
                    setPrintReportInitialType('cetak-jurnal');
                    setIsPrintModalOpen(true);
                  }}
                  className="bg-slate-900 border border-slate-800 hover:border-indigo-500/40 rounded-2xl p-5 cursor-pointer transition-all group"
                >
                  <div className="text-xs font-bold uppercase text-indigo-400 mb-1">Buku Agenda KBM</div>
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300">Cetak Jurnal KBM</h3>
                  <p className="text-xs text-slate-400 mt-2">
                    Format resmi agenda KBM guru SD lengkap dengan TP, materi, dan tanda tangan.
                  </p>
                </div>

                <div 
                  onClick={() => {
                    setPrintReportInitialType('leger-nilai');
                    setIsPrintModalOpen(true);
                  }}
                  className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 cursor-pointer transition-all group"
                >
                  <div className="text-xs font-bold uppercase text-amber-400 mb-1">Buku Penilaian</div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-300">Buku Leger Nilai</h3>
                  <p className="text-xs text-slate-400 mt-2">
                    Rekap format nilai SH 1-6, PTS, SAS, nilai akhir, predikat, dan ketuntasan.
                  </p>
                </div>

                <div 
                  onClick={() => setActiveTab('rapor')}
                  className="bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-5 cursor-pointer transition-all group"
                >
                  <div className="text-xs font-bold uppercase text-cyan-400 mb-1">Buku Rapor</div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300">Buku Rapor Siswa</h3>
                  <p className="text-xs text-slate-400 mt-2">
                    Laporan hasil belajar semester ganjil & genap, capaian kompetensi, dan cetak per kelas.
                  </p>
                </div>

                <div 
                  onClick={() => {
                    setPrintReportInitialType('sampul-rapor');
                    setIsPrintModalOpen(true);
                  }}
                  className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-5 cursor-pointer transition-all group"
                >
                  <div className="text-xs font-bold uppercase text-amber-400 mb-1">Halaman 1 & 2 Rapor</div>
                  <h3 className="text-base font-bold text-white group-hover:text-amber-300">Sampul & Keterangan Diri Rapor</h3>
                  <p className="text-xs text-slate-400 mt-2">
                    Cover resmi buku rapor peserta didik SD (Hal. 1) dan lembar keterangan tentang diri peserta didik (Hal. 2).
                  </p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <TeacherModal
        isOpen={isTeacherModalOpen}
        onClose={() => {
          setIsTeacherModalOpen(false);
          setEditingTeacher(null);
        }}
        onSave={handleSaveTeacher}
        teacherToEdit={editingTeacher}
      />

      <TeacherImportModal
        isOpen={isTeacherImportModalOpen}
        onClose={() => setIsTeacherImportModalOpen(false)}
        onImportComplete={handleImportTeachers}
        existingTeachers={teachers}
      />

      <TeacherDetailModal
        teacher={selectedTeacherForDetail}
        school={school}
        isOpen={Boolean(selectedTeacherForDetail)}
        onClose={() => setSelectedTeacherForDetail(null)}
        onEdit={(t) => {
          setEditingTeacher(t);
          setIsTeacherModalOpen(true);
        }}
      />

      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => {
          setIsStudentModalOpen(false);
          setEditingStudent(null);
        }}
        onSave={handleSaveStudent}
        studentToEdit={editingStudent}
        defaultClass={defaultStudentClass}
        classes={classes}
      />

      <StudentImportModal
        isOpen={isStudentImportModalOpen}
        onClose={() => setIsStudentImportModalOpen(false)}
        onImportComplete={handleImportStudents}
        existingStudents={students}
      />

      <StudentDetailModal
        student={selectedStudentForDetail}
        school={school}
        isOpen={Boolean(selectedStudentForDetail)}
        onClose={() => setSelectedStudentForDetail(null)}
        onEdit={(s) => {
          setEditingStudent(s);
          setIsStudentModalOpen(true);
        }}
      />

      <ClassPromotionModal
        isOpen={isPromotionModalOpen}
        onClose={() => setIsPromotionModalOpen(false)}
        students={students}
        classes={classes}
        onBatchUpdate={handleBatchUpdateStudents}
      />

      <ClassManagementModal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        classes={classes}
        students={students}
        teachers={teachers}
        school={school}
        onAddClass={handleAddClass}
        onEditClass={handleEditClass}
        onDeleteClass={handleDeleteClass}
        onResetClassesToDefault={handleResetClasses}
        onAddToast={addToast}
      />

      <PrintReportsModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        school={school}
        teachers={teachers}
        students={students}
        classes={classes}
        attendanceList={attendance}
        teachingJournals={teachingJournals}
        assessments={assessments}
        initialReportType={printReportInitialType}
        initialPrintDate={new Date().toISOString().slice(0, 10)}
        initialPrintPlace={school.kabupatenKota || ''}
      />

      {/* Reusable Confirmation Delete Modal */}
      <ConfirmDeleteModal 
        state={deleteConfirmState} 
        onClose={closeDeleteConfirm} 
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        currentUser={currentUser}
        onShowToast={addToast}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
