import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  disableNetwork, 
  enableNetwork, 
  setLogLevel,
  Firestore 
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Silence Firestore internal log messages (e.g. backoff delay, resource-exhausted)
try {
  setLogLevel('silent');
} catch {}

export const firebaseConfig = {
  apiKey: "AIzaSyAlQ49P1R-4u0-_OIyG5cCfLAmfQH4avrQ",
  authDomain: "adm-malathepote.firebaseapp.com",
  projectId: "adm-malathepote",
  storageBucket: "adm-malathepote.firebasestorage.app",
  messagingSenderId: "969641090409",
  appId: firebaseConfigJson.appId || "1:969641090409:web:d64d24e0b3438b2ada31f8"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db: Firestore = (firebaseConfigJson as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfigJson as any).firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);
export { disableNetwork, enableNetwork, getDocFromServer, doc };

export enum OperationType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export function handleFirestoreError(error: unknown, operation: OperationType, path: string): void {
  const message = error instanceof Error ? error.message : String(error);
  // Suppress repetitive quota errors from flooding the console
  if (message.includes('Quota limit exceeded') || message.includes('resource-exhausted') || message.includes('Free daily write units')) {
    console.warn(`[Firestore Quota Pause]: ${operation.toUpperCase()} at ${path} skipped due to free daily quota.`);
    return;
  }
  console.error(`[Firestore ${operation.toUpperCase()} Error at ${path}]:`, message, error);
}

export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      message.includes('the client is offline') || 
      message.includes('offline') || 
      message.includes('Quota limit exceeded') || 
      message.includes('resource-exhausted')
    ) {
      console.warn('[Firestore] Client is offline or Firestore daily free quota reached.');
    }
    return false;
  }
}
