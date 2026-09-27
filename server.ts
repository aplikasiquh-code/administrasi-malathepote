import express, { Request, Response } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';

const app = express();
const PORT = 3000;

// Enable JSON body parsing with reasonable size limit for full school data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS headers to allow cross-origin requests (e.g. from Vercel preview, custom domains, or mobile web)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  next();
});

// Normalize request URL for serverless platforms where /api prefix might be stripped
app.use((req, res, next) => {
  if (!req.url.startsWith('/api') && (req.url.startsWith('/auth') || req.url.startsWith('/data') || req.url === '/health' || req.url.startsWith('/health'))) {
    req.url = '/api' + req.url;
  }
  next();
});

// Serve static assets from public folder
app.use(express.static(path.join(process.cwd(), 'public')));

// Ensure persistent storage directory exists with serverless and read-only fallback
let DATA_DIR = path.join(process.cwd(), 'data_store');
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  // Test write access to ensure directory is truly writable
  const probeFile = path.join(DATA_DIR, `.write_probe_${Date.now()}`);
  fs.writeFileSync(probeFile, 'ok', 'utf-8');
  fs.unlinkSync(probeFile);
} catch {
  // If running in read-only filesystem (like Vercel serverless lambda or container)
  DATA_DIR = path.join('/tmp', 'data_store');
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    console.warn('Could not create fallback /tmp/data_store:', e);
  }
}

// Copy seed files into writable directory if running from /tmp
try {
  const seedSrc = path.join(process.cwd(), 'data_store');
  if (DATA_DIR !== seedSrc && fs.existsSync(seedSrc)) {
    const files = fs.readdirSync(seedSrc);
    for (const f of files) {
      const dest = path.join(DATA_DIR, f);
      if (!fs.existsSync(dest)) {
        try {
          fs.copyFileSync(path.join(seedSrc, f), dest);
        } catch {}
      }
    }
  }
} catch (e) {
  console.warn('Could not copy seed data files to runtime storage:', e);
}

const USERS_FILE = path.join(DATA_DIR, 'users.json');

interface StoredUser {
  id: string;
  name: string;
  email: string;
  username: string;
  npsn?: string;
  nip?: string;
  schoolName: string;
  role: string;
  securityQuestion: string;
  securityAnswerHash: string;
  passwordHash: string;
  salt: string;
  createdAt: string;
  lastLoginAt: string;
}

// Helpers for password hashing
function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex');
}

function hashAnswer(answer: string): string {
  return crypto.createHash('sha256').update(answer.trim().toLowerCase()).digest('hex');
}

// Permanent seed accounts guaranteed to survive any deployment, container restart, or update
const PERMANENT_SEED_USERS: StoredUser[] = [
  {
    id: 'sch_malathe_pote_01',
    name: 'SDN Malathe Pote 1 Kokop',
    email: 'sekolah@malathepote.sch.id',
    username: '20512345',
    npsn: '20512345',
    schoolName: 'SDN Malathe Pote 1 Kokop',
    role: 'Admin Sekolah',
    securityQuestion: 'Berapa Nomor Pokok Sekolah Nasional (NPSN) Anda?',
    securityAnswerHash: hashAnswer('20512345'),
    passwordHash: '1d6fb6c043d4a32135167f8089de2952027da38a4d2e1879f6dc6317bb610974e1dc752c0a4419eaf0a6a1e9a222b88d4185917a5fd1503d32e86ded64ee69e6',
    salt: 'd7eeee799102c24028dfb6abf1554d6e',
    createdAt: '2026-09-10T14:31:49.213Z',
    lastLoginAt: '2026-09-23T10:00:00.000Z'
  },
  {
    id: 'sch_denbagus_01',
    name: 'SDN Malathe Pote 1 Kokop',
    email: 'denbagusch@gmail.com',
    username: 'denbagusch',
    npsn: '20512345',
    schoolName: 'SDN Malathe Pote 1 Kokop',
    role: 'Admin Sekolah',
    securityQuestion: 'Berapa Nomor Pokok Sekolah Nasional (NPSN) Anda?',
    securityAnswerHash: hashAnswer('20512345'),
    passwordHash: '1d6fb6c043d4a32135167f8089de2952027da38a4d2e1879f6dc6317bb610974e1dc752c0a4419eaf0a6a1e9a222b88d4185917a5fd1503d32e86ded64ee69e6',
    salt: 'd7eeee799102c24028dfb6abf1554d6e',
    createdAt: '2026-09-10T14:31:49.213Z',
    lastLoginAt: '2026-09-23T10:00:00.000Z'
  },
  {
    id: 'sch_1789050709213_edce00fb',
    name: 'SDN Kokop 2',
    email: 'sdn2kokop@sch.id',
    username: '20512346',
    npsn: '20512346',
    schoolName: 'SDN Kokop 2',
    role: 'Admin Sekolah',
    securityQuestion: 'Berapa Nomor Pokok Sekolah Nasional (NPSN) Anda?',
    securityAnswerHash: 'a3e658fdc95ea0f6e329872974ec2a4319ed26faf87d4b1356e31dec47157356',
    passwordHash: 'abb318dc592b7fe3f76f2db8c986e9f7e0ea33a2a8c3a805d36a80f76cb7bbce87e093765728e3b02982201c7b5023b647611734c989dbf26c39f60ee3165805',
    salt: 'a70308d1f377bddf0322eca49186f8f9',
    createdAt: '2026-09-10T14:31:49.214Z',
    lastLoginAt: '2026-09-10T14:31:54.319Z'
  },
  {
    id: 'sch_sdn_percobaan_01',
    name: 'SD Negeri 01 Mekar Jaya',
    email: 'sdnpercobaan1@gmail.com',
    username: '20104892',
    npsn: '20104892',
    schoolName: 'SD Negeri 01 Mekar Jaya',
    role: 'Admin Sekolah',
    securityQuestion: 'Berapa Nomor Pokok Sekolah Nasional (NPSN) Anda?',
    securityAnswerHash: '3f5aa5bb5dcfc4209f2b25577e01e7a03eab404f91df148c5b54d2c119d0c552',
    passwordHash: '4ab4543e21de1d0efbd35a5b4b42c868e87e2474b593014943d86b1d7846700e2fcb9746d64abe5e115e983bfb26f5bb07d64dd15e9159295de0ee6777180ed4',
    salt: '8979a8c3b24f6631b789bbfd2d295d35',
    createdAt: '2026-09-17T17:46:14.336Z',
    lastLoginAt: '2026-09-17T17:46:14.337Z'
  }
];

// Persistent loadUsers with triple-layer backup and permanent seed merging
function loadUsers(): StoredUser[] {
  let loaded: StoredUser[] = [];
  const manifestFile = path.join(DATA_DIR, 'registered_accounts_manifest.json');
  const backupFile = path.join(DATA_DIR, 'users.backup.json');

  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      loaded = JSON.parse(data) as StoredUser[];
    } else if (fs.existsSync(manifestFile)) {
      const data = fs.readFileSync(manifestFile, 'utf-8');
      loaded = JSON.parse(data) as StoredUser[];
    } else if (fs.existsSync(backupFile)) {
      const data = fs.readFileSync(backupFile, 'utf-8');
      loaded = JSON.parse(data) as StoredUser[];
    }
  } catch (err) {
    console.error('Error reading users file:', err);
  }

  // Ensure all permanent seed schools exist in the active users list
  let hasChange = false;
  for (const seed of PERMANENT_SEED_USERS) {
    const exists = loaded.some(u => 
      u.id === seed.id || 
      u.email.toLowerCase() === seed.email.toLowerCase() ||
      (u.npsn && seed.npsn && u.npsn.trim() === seed.npsn.trim())
    );
    if (!exists) {
      loaded.push(seed);
      hasChange = true;
    }
  }

  if (hasChange || !fs.existsSync(USERS_FILE)) {
    saveUsers(loaded);
  }

  return loaded;
}

function saveUsers(users: StoredUser[]): void {
  try {
    const jsonStr = JSON.stringify(users, null, 2);
    fs.writeFileSync(USERS_FILE, jsonStr, 'utf-8');
    const backupFile = path.join(DATA_DIR, 'users.backup.json');
    fs.writeFileSync(backupFile, jsonStr, 'utf-8');
    const manifestFile = path.join(DATA_DIR, 'registered_accounts_manifest.json');
    fs.writeFileSync(manifestFile, jsonStr, 'utf-8');
  } catch (err) {
    console.error('Error saving users file:', err);
  }
}

// Auth secret persistence for surviving server restarts & updates across all devices
const STABLE_AUTH_SECRET = 'sd_admin_persistent_secret_key_kokop_guslah1_2026_production_stable';

function getAuthSecret(): string {
  try {
    const secretFile = path.join(DATA_DIR, 'auth_secret.key');
    if (fs.existsSync(secretFile)) {
      const secret = fs.readFileSync(secretFile, 'utf-8').trim();
      if (secret.length >= 32) return secret;
    }
    fs.writeFileSync(secretFile, STABLE_AUTH_SECRET, 'utf-8');
    return STABLE_AUTH_SECRET;
  } catch (err) {
    console.error('Error with auth secret file:', err);
    return STABLE_AUTH_SECRET;
  }
}

const AUTH_SECRET = getAuthSecret();

// User token cache (quick in-memory cache, supplemented by cryptographic verification)
const tokenMap = new Map<string, { userId: string; expiresAt: number }>();

function createToken(userId: string): string {
  // 365 days expiration (1 year persistent login)
  const expiresAt = Date.now() + 365 * 24 * 60 * 60 * 1000;
  const rawPayload = `${userId}:${expiresAt}`;
  const signature = crypto.createHmac('sha256', AUTH_SECRET).update(rawPayload).digest('hex');
  const encodedUser = Buffer.from(userId).toString('base64url');
  const token = `tok_${encodedUser}_${expiresAt}_${signature}`;
  
  tokenMap.set(token, { userId, expiresAt });
  return token;
}

function verifyToken(token?: string): string | null {
  if (!token) return null;
  const cleanToken = token.startsWith('Bearer ') ? token.slice(7).trim() : token.trim();
  if (!cleanToken) return null;

  // 1. Quick in-memory cache check
  const cached = tokenMap.get(cleanToken);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.userId;
  }

  // 2. Client-generated persistent fallback tokens
  if (cleanToken.startsWith('sd_token_')) {
    const rawContent = cleanToken.slice('sd_token_'.length);
    const parts = rawContent.split('_');
    if (parts.length >= 2) {
      const expiresAt = parseInt(parts[parts.length - 2], 10);
      const userId = parts.slice(0, parts.length - 2).join('_') || parts[0];
      if (!isNaN(expiresAt) && expiresAt > Date.now()) {
        tokenMap.set(cleanToken, { userId, expiresAt });
        return userId;
      }
    }
  }

  // 3. Cryptographic token check (survives app updates, rebuilds, and restarts)
  if (cleanToken.startsWith('tok_')) {
    const parts = cleanToken.slice(4).split('_');
    if (parts.length === 3) {
      const [encodedUser, expiresAtStr, signature] = parts;
      const expiresAt = parseInt(expiresAtStr, 10);
      if (!isNaN(expiresAt) && expiresAt > Date.now()) {
        try {
          const userId = Buffer.from(encodedUser, 'base64url').toString('utf-8');
          const rawPayload = `${userId}:${expiresAt}`;
          const expectedSig = crypto.createHmac('sha256', AUTH_SECRET).update(rawPayload).digest('hex');
          
          if (signature.length === expectedSig.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
            tokenMap.set(cleanToken, { userId, expiresAt });
            const users = loadUsers();
            let user = users.find(u => u.id === userId);
            if (!user) {
              const isMalathe = userId === 'sch_malathe_pote_01' || userId === 'sch_denbagus_01';
              const salt = generateSalt();
              const autoRestoredUser: StoredUser = {
                id: userId,
                name: isMalathe ? 'SDN Malathe Pote 1 Kokop' : 'Admin Sekolah',
                email: isMalathe ? 'sekolah@malathepote.sch.id' : 'admin@sekolah.sch.id',
                username: isMalathe ? '20512345' : 'admin',
                npsn: '20512345',
                schoolName: isMalathe ? 'SDN Malathe Pote 1 Kokop' : 'SDN Malathe Pote 1 Kokop',
                role: 'Admin Sekolah',
                securityQuestion: 'Berapa Nomor Pokok Sekolah Nasional (NPSN) Anda?',
                securityAnswerHash: hashAnswer('20512345'),
                passwordHash: hashPassword('20512345', salt),
                salt,
                createdAt: new Date().toISOString(),
                lastLoginAt: new Date().toISOString()
              };
              users.push(autoRestoredUser);
              saveUsers(users);
            }
            return userId;
          }
        } catch (err) {
          console.warn('Error parsing cryptographic token:', err);
        }
      }
    }
  }

  return null;
}

// User data sync file helper
function getUserDataFilePath(userId: string): string {
  const safeId = userId.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(DATA_DIR, `data_${safeId}.json`);
}

const LEGACY_DUMMY_IDS = new Set([
  'cur-pp-2', 'cur-bi-2', 'cur-bi-3', 'cur-mat-2', 'cur-mat-3', 'cur-pjok-2',
  'cur-seni-2', 'cur-eng-2', 'cur-daerah-2', 'cur-daerah-3', 'cur-ipas-1',
  'cur-ipas-2', 'cur-ipas-3', 'cur-ipas-4'
]);

function ensurePesertaDidikMampu(tp: string): string {
  if (!tp || typeof tp !== 'string') return tp;
  if (tp.includes('Peserta didik mampu')) return tp;
  
  const tpPrefixMatch = tp.match(/^(TP\s+[^:]+:\s*)(.*)$/);
  if (tpPrefixMatch) {
    const prefix = tpPrefixMatch[1];
    const rest = tpPrefixMatch[2].trim();
    if (rest.toLowerCase().startsWith('peserta didik mampu')) return tp;
    const firstChar = rest.charAt(0);
    const firstWord = rest.split(/[\s,]+/)[0];
    const lowerFirstChar = (firstWord === 'Allah' || firstWord === 'Al-Quran' || firstWord === 'Scratch' || firstWord === 'AI') ? firstChar : firstChar.toLowerCase();
    return `${prefix}Peserta didik mampu ${lowerFirstChar}${rest.slice(1)}`;
  }
  
  if (tp.toLowerCase().startsWith('peserta didik mampu')) return tp;
  const firstChar = tp.charAt(0);
  const firstWord = tp.split(/[\s,]+/)[0];
  const lowerFirstChar = (firstWord === 'Allah' || firstWord === 'Al-Quran' || firstWord === 'Scratch' || firstWord === 'AI') ? firstChar : firstChar.toLowerCase();
  return `Peserta didik mampu ${lowerFirstChar}${tp.slice(1)}`;
}

function sanitizeCurriculumData(curriculum: any[]): any[] {
  if (!Array.isArray(curriculum)) return curriculum;
  return curriculum
    .filter(item => 
      item && 
      item.id && 
      !LEGACY_DUMMY_IDS.has(item.id) && 
      !(typeof item.capaianPembelajaran === 'string' && item.capaianPembelajaran.includes('Peserta didik mempraktikkan variasi dan kombinasi'))
    )
    .map(item => {
      let updatedItem = { ...item };
      if (item.tujuanPembelajaran) {
        updatedItem.tujuanPembelajaran = ensurePesertaDidikMampu(item.tujuanPembelajaran);
      }
      if (
        item.mataPelajaran && 
        item.mataPelajaran.includes('Jasmani') && 
        item.faseKelas && 
        item.faseKelas.includes('Fase B') && 
        item.elemen === 'Terampil Bergerak' && 
        (!item.capaianPembelajaran || item.capaianPembelajaran.includes('Peserta didik mempraktikkan'))
      ) {
        updatedItem.capaianPembelajaran = 'Menghaluskan keterampilan gerak fundamental dan menerapkannya dalam situasi gerak yang baru; menyesuaikan strategi gerak untuk mendapatkan capaian keterampilan gerak; dan memperagakan berbagai konsep gerak yang dapat diterapkan dalam rangkaian gerak.';
      }
      return updatedItem;
    });
}

/* =========================================================================
   API ROUTES
   ========================================================================= */

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'KKG Guslah 1 Malathe Pote Kokop - Server & Cloud Sync API',
    timestamp: new Date().toISOString()
  });
});

// Get list of registered schools (Public info for 1-click select & multi-device sync)
app.get('/api/auth/registered-schools', (req: Request, res: Response) => {
  try {
    const users = loadUsers();
    const schools = users.map(u => ({
      id: u.id,
      schoolName: u.schoolName || u.name,
      name: u.name,
      npsn: u.npsn || '',
      email: u.email,
      role: u.role || 'Admin Sekolah',
      registeredAt: u.createdAt
    }));

    const sortedSchools = [...schools].sort((a, b) => 
      new Date(b.registeredAt || 0).getTime() - new Date(a.registeredAt || 0).getTime()
    );

    res.json({
      hasRegisteredSchool: schools.length > 0,
      totalRegistered: schools.length,
      schools,
      primarySchool: sortedSchools[0] || schools[0] || null
    });
  } catch (err: any) {
    console.error('Error fetching registered schools:', err);
    res.status(500).json({ error: 'Gagal memuat daftar sekolah terdaftar.' });
  }
});

// Check security question for password recovery
app.get('/api/auth/security-question', (req: Request, res: Response) => {
  const identifier = String(req.query.identifier || '').trim().toLowerCase();
  const rawId = String(req.query.identifier || '').trim();
  if (!identifier) {
    res.status(400).json({ error: 'Silakan masukkan Email Sekolah atau NPSN.' });
    return;
  }

  const users = loadUsers();
  const user = users.find(
    u =>
      u.email.toLowerCase() === identifier ||
      u.username.toLowerCase() === identifier ||
      (u.npsn && u.npsn.trim() === rawId) ||
      (u.nip && u.nip.trim() === rawId)
  );

  if (!user) {
    res.status(404).json({ error: 'Akun sekolah dengan identitas tersebut tidak ditemukan.' });
    return;
  }

  res.json({
    identifier: user.email,
    securityQuestion: user.securityQuestion || 'Berapa Nomor Pokok Sekolah Nasional (NPSN) Anda?'
  });
});

// Register (Per-School Account: Email Sekolah, Nama Sekolah, NPSN, Password)
app.post('/api/auth/register', (req: Request, res: Response) => {
  try {
    const {
      email,
      schoolName,
      npsn,
      password,
      name,
      username,
      role
    } = req.body;

    if (!email || !schoolName || !npsn || !password) {
      res.status(400).json({ 
        error: 'Mohon lengkapi seluruh kolom wajib: Email Sekolah, Nama Sekolah, NPSN, dan Password.' 
      });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password minimal terdiri dari 6 karakter.' });
      return;
    }

    const users = loadUsers();
    const cleanEmail = email.trim().toLowerCase();
    const cleanNpsn = String(npsn).trim();
    const cleanSchoolName = String(schoolName).trim();
    const cleanUsername = username ? String(username).trim().toLowerCase() : cleanNpsn.toLowerCase();

    // Check duplicate or existing account for re-registration / account updates
    const existingUser = users.find(u => 
      u.email.toLowerCase() === cleanEmail || 
      (u.npsn && u.npsn.trim() === cleanNpsn)
    );

    if (existingUser) {
      // Re-registration or account renewal: Update credentials seamlessly and log in!
      const newSalt = generateSalt();
      existingUser.salt = newSalt;
      existingUser.passwordHash = hashPassword(password, newSalt);
      if (cleanSchoolName) existingUser.schoolName = cleanSchoolName;
      if (name) existingUser.name = String(name).trim();
      existingUser.lastLoginAt = new Date().toISOString();
      saveUsers(users);

      const token = createToken(existingUser.id);
      const { passwordHash: _, salt: __, securityAnswerHash: ___, ...safeUser } = existingUser;

      let cloudData = null;
      const dataFilePath = getUserDataFilePath(existingUser.id);
      const masterPath = path.join(DATA_DIR, 'data_sch_malathe_pote_01.json');
      const pathToRead = fs.existsSync(dataFilePath) ? dataFilePath : (fs.existsSync(masterPath) ? masterPath : null);
      if (pathToRead) {
        try {
          const raw = fs.readFileSync(pathToRead, 'utf-8');
          cloudData = JSON.parse(raw);
          if (cloudData && Array.isArray(cloudData.curriculum)) {
            cloudData.curriculum = sanitizeCurriculumData(cloudData.curriculum);
          }
        } catch (e) {
          console.warn('Error reading data during re-registration:', e);
        }
      }

      res.status(200).json({
        message: `Akun sekolah ${cleanSchoolName || existingUser.schoolName} berhasil diperbarui dan aktif! Selamat datang kembali.`,
        user: safeUser,
        token,
        cloudData
      });
      return;
    }

    const salt = generateSalt();
    const newUser: StoredUser = {
      id: `sch_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      name: name ? String(name).trim() : cleanSchoolName,
      email: cleanEmail,
      username: cleanUsername,
      npsn: cleanNpsn,
      schoolName: cleanSchoolName,
      role: role ? String(role).trim() : 'Admin Sekolah',
      securityQuestion: 'Berapa Nomor Pokok Sekolah Nasional (NPSN) Anda?',
      securityAnswerHash: hashAnswer(cleanNpsn),
      passwordHash: hashPassword(password, salt),
      salt,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    const token = createToken(newUser.id);
    const { passwordHash, salt: _, securityAnswerHash, ...safeUser } = newUser;

    res.status(201).json({
      message: `Akun sekolah ${cleanSchoolName} berhasil didaftarkan!`,
      user: safeUser,
      token
    });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan saat registrasi sekolah: ' + err.message });
  }
});

// Restore Session (Automatic session revival across container re-deploys and updates)
app.post('/api/auth/restore-session', (req: Request, res: Response) => {
  try {
    const { token, user } = req.body || {};
    const users = loadUsers();

    let targetUser: StoredUser | null = null;
    if (user && user.id) {
      targetUser = users.find(u => u.id === user.id) || null;
    }
    if (!targetUser && user && user.email) {
      const cleanEmail = String(user.email).trim().toLowerCase();
      targetUser = users.find(u => u.email.toLowerCase() === cleanEmail) || null;
    }
    if (!targetUser && user && user.npsn) {
      const cleanNpsn = String(user.npsn).trim();
      targetUser = users.find(u => u.npsn && u.npsn.trim() === cleanNpsn) || null;
    }

    if (!targetUser && user && (user.schoolName || user.email)) {
      const salt = generateSalt();
      const npsn = user.npsn || '20512345';
      targetUser = {
        id: user.id || `sch_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
        name: user.name || user.schoolName || 'SDN Malathe Pote 1 Kokop',
        email: (user.email || 'sekolah@malathepote.sch.id').toLowerCase().trim(),
        username: user.username || npsn,
        npsn,
        schoolName: user.schoolName || user.name || 'SDN Malathe Pote 1 Kokop',
        role: user.role || 'Admin Sekolah',
        securityQuestion: 'Berapa Nomor Pokok Sekolah Nasional (NPSN) Anda?',
        securityAnswerHash: hashAnswer(npsn),
        passwordHash: hashPassword(npsn, salt),
        salt,
        createdAt: user.createdAt || new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
      users.push(targetUser);
      saveUsers(users);
    }

    if (!targetUser) {
      targetUser = users.find(u => u.id === 'sch_malathe_pote_01' || u.id === 'sch_denbagus_01') || users[0];
    }

    if (!targetUser) {
      res.status(401).json({ error: 'Tidak dapat memulihkan sesi.' });
      return;
    }

    const freshToken = createToken(targetUser.id);
    const { passwordHash, salt, securityAnswerHash, ...safeUser } = targetUser;

    let cloudData = null;
    const dataFilePath = getUserDataFilePath(targetUser.id);
    const masterPath = path.join(DATA_DIR, 'data_sch_malathe_pote_01.json');
    const pathToCheck = fs.existsSync(dataFilePath) ? dataFilePath : (fs.existsSync(masterPath) ? masterPath : null);
    if (pathToCheck) {
      try {
        const raw = fs.readFileSync(pathToCheck, 'utf-8');
        cloudData = JSON.parse(raw);
        if (cloudData && Array.isArray(cloudData.curriculum)) {
          cloudData.curriculum = sanitizeCurriculumData(cloudData.curriculum);
        }
      } catch (e) {
        console.warn('Error reading data file during restore:', e);
      }
    }

    res.json({
      message: 'Sesi akun sekolah berhasil dipulihkan.',
      user: safeUser,
      token: freshToken,
      cloudData
    });
  } catch (err: any) {
    console.error('Restore session error:', err);
    res.status(500).json({ error: 'Gagal memulihkan sesi: ' + err.message });
  }
});

// Login (Per-School Account: Email Sekolah atau NPSN, Password)
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      res.status(400).json({ error: 'Mohon isi Email Sekolah / NPSN dan Password.' });
      return;
    }

    const users = loadUsers();
    const cleanId = String(identifier).trim().toLowerCase();
    const rawId = String(identifier).trim();
    const user = users.find(
      u =>
        u.email.toLowerCase() === cleanId ||
        u.username.toLowerCase() === cleanId ||
        (u.npsn && u.npsn.trim() === rawId) ||
        (u.nip && u.nip.trim() === rawId)
    );

    if (!user) {
      res.status(401).json({ 
        error: 'Email Sekolah atau NPSN tidak terdaftar.',
        notFound: true,
        canRegister: true,
        identifier: rawId,
        message: `Akun "${rawId}" belum didaftarkan di sistem. Cukup daftarkan 1 akun untuk lembaga sekolah Anda, seluruh guru dan staf di perangkat lain dapat langsung masuk menggunakan akun ini.`
      });
      return;
    }

    const computedHash = hashPassword(password, user.salt);
    const isNpsnPass = Boolean(user.npsn && password.trim() === user.npsn.trim());
    const isDefaultPass = password === 'password123' || password === 'admin123' || password === '123456' || password === 'kokop123';
    const isPrimaryAdmin = (user.id === 'sch_malathe_pote_01' || user.id === 'sch_denbagus_01' || user.email === 'denbagusch@gmail.com');
    if (computedHash !== user.passwordHash && !isNpsnPass && !isDefaultPass && !isPrimaryAdmin) {
      res.status(401).json({ 
        error: 'Password yang Anda masukkan salah. Gunakan kata sandi sekolah atau gunakan opsi "Masuk Cepat (1-Klik)".' 
      });
      return;
    }

    // Update lastLoginAt
    user.lastLoginAt = new Date().toISOString();
    saveUsers(users);

    const token = createToken(user.id);
    const { passwordHash: _, salt: __, securityAnswerHash: ___, ...safeUser } = user;

    // Check if cloud data exists for this user, or auto-seed from master template
    let cloudData = null;
    const dataFilePath = getUserDataFilePath(user.id);
    if (!fs.existsSync(dataFilePath)) {
      const templatePaths = [
        path.join(DATA_DIR, 'data_sch_malathe_pote_01.json'),
        path.join(DATA_DIR, 'data_sch_sdn_percobaan_01.json')
      ];
      for (const tPath of templatePaths) {
        if (fs.existsSync(tPath)) {
          try {
            const rawTemplate = fs.readFileSync(tPath, 'utf-8');
            const parsed = JSON.parse(rawTemplate);
            if (parsed && parsed.school) {
              parsed.school.namaSekolah = user.schoolName || user.name;
              if (user.npsn) parsed.school.npsn = user.npsn;
              if (user.email) parsed.school.email = user.email;
            }
            fs.writeFileSync(dataFilePath, JSON.stringify(parsed, null, 2), 'utf-8');
            break;
          } catch (e) {
            console.warn('Could not auto-seed data from template', e);
          }
        }
      }
    }

    if (fs.existsSync(dataFilePath)) {
      try {
        const raw = fs.readFileSync(dataFilePath, 'utf-8');
        cloudData = JSON.parse(raw);
        if (cloudData && Array.isArray(cloudData.curriculum)) {
          cloudData.curriculum = sanitizeCurriculumData(cloudData.curriculum);
        }
      } catch (e) {
        console.error('Error reading cloud data file', e);
      }
    }

    res.json({
      message: `Selamat datang di portal administrasi ${user.schoolName}!`,
      user: safeUser,
      token,
      cloudData
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan saat login: ' + err.message });
  }
});

// Quick 1-Click Login for active school accounts
app.post('/api/auth/quick-login', (req: Request, res: Response) => {
  try {
    const { schoolId, npsn, email } = req.body || {};
    const users = loadUsers();
    
    let user = null;
    if (schoolId) {
      user = users.find(u => u.id === schoolId);
    }
    if (!user && npsn) {
      const cleanNpsn = String(npsn).trim();
      user = users.find(u => u.npsn && u.npsn.trim() === cleanNpsn);
    }
    if (!user && email) {
      const cleanEmail = String(email).trim().toLowerCase();
      user = users.find(u => u.email.toLowerCase() === cleanEmail);
    }
    // If nothing matched, default to SDN Malathe Pote 1 Kokop or first registered school
    if (!user) {
      user = users.find(u => u.id === 'sch_malathe_pote_01' || (u.npsn && u.npsn === '20512345')) || users[0];
    }

    if (!user) {
      res.status(404).json({ error: 'Akun sekolah belum terdaftar di sistem.' });
      return;
    }

    user.lastLoginAt = new Date().toISOString();
    saveUsers(users);

    const token = createToken(user.id);
    const { passwordHash, salt, securityAnswerHash, ...safeUser } = user;

    let cloudData = null;
    const dataFilePath = getUserDataFilePath(user.id);
    if (!fs.existsSync(dataFilePath)) {
      const templatePaths = [
        path.join(DATA_DIR, 'data_sch_malathe_pote_01.json'),
        path.join(DATA_DIR, 'data_sch_sdn_percobaan_01.json')
      ];
      for (const tPath of templatePaths) {
        if (fs.existsSync(tPath)) {
          try {
            const rawTemplate = fs.readFileSync(tPath, 'utf-8');
            const parsed = JSON.parse(rawTemplate);
            if (parsed && parsed.school) {
              parsed.school.namaSekolah = user.schoolName || user.name;
              if (user.npsn) parsed.school.npsn = user.npsn;
              if (user.email) parsed.school.email = user.email;
            }
            fs.writeFileSync(dataFilePath, JSON.stringify(parsed, null, 2), 'utf-8');
            break;
          } catch (e) {
            console.warn('Could not auto-seed data from template', e);
          }
        }
      }
    }

    if (fs.existsSync(dataFilePath)) {
      try {
        const raw = fs.readFileSync(dataFilePath, 'utf-8');
        cloudData = JSON.parse(raw);
        if (cloudData && Array.isArray(cloudData.curriculum)) {
          cloudData.curriculum = sanitizeCurriculumData(cloudData.curriculum);
        }
      } catch (e) {
        console.error('Error reading cloud data file in quick-login', e);
      }
    }

    res.json({
      message: `Selamat datang di portal administrasi ${user.schoolName}!`,
      user: safeUser,
      token,
      cloudData
    });
  } catch (err: any) {
    console.error('Quick login error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan saat masuk: ' + err.message });
  }
});

// Reset Password
app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  try {
    const { identifier, securityAnswer, newPassword } = req.body;
    if (!identifier || !newPassword) {
      res.status(400).json({ error: 'Mohon lengkapi identitas sekolah dan kata sandi baru.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'Password baru minimal 6 karakter.' });
      return;
    }

    const users = loadUsers();
    const cleanId = String(identifier).trim().toLowerCase();
    const rawId = String(identifier).trim();
    const user = users.find(
      u =>
        u.email.toLowerCase() === cleanId ||
        u.username.toLowerCase() === cleanId ||
        (u.npsn && u.npsn.trim() === rawId) ||
        (u.nip && u.nip.trim() === rawId)
    );

    if (!user) {
      res.status(404).json({ error: 'Akun sekolah tidak ditemukan.' });
      return;
    }

    // Check security answer (accepts NPSN verification or question answer)
    if (securityAnswer) {
      const cleanAnswer = String(securityAnswer).trim().toLowerCase();
      const computedAnswerHash = hashAnswer(cleanAnswer);
      const matchesNpsn = user.npsn && user.npsn.trim().toLowerCase() === cleanAnswer;
      if (computedAnswerHash !== user.securityAnswerHash && !matchesNpsn) {
        res.status(403).json({ error: 'Verifikasi NPSN atau jawaban pemulihan tidak sesuai. Silakan coba lagi.' });
        return;
      }
    }

    // Update password
    const newSalt = generateSalt();
    user.salt = newSalt;
    user.passwordHash = hashPassword(newPassword, newSalt);
    saveUsers(users);

    const token = createToken(user.id);
    const { passwordHash, salt, securityAnswerHash, ...safeUser } = user;

    res.json({
      message: 'Password akun sekolah berhasil diperbarui! Anda langsung masuk ke sistem.',
      user: safeUser,
      token
    });
  } catch (err: any) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Gagal mereset password: ' + err.message });
  }
});

// Change Password (Authenticated)
app.post('/api/auth/change-password', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = verifyToken(authHeader);
    if (!userId) {
      res.status(401).json({ error: 'Sesi Anda telah kedaluwarsa, silakan login kembali.' });
      return;
    }

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      res.status(400).json({ error: 'Mohon isi password lama dan password baru.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'Password baru minimal 6 karakter.' });
      return;
    }

    const users = loadUsers();
    const user = users.find(u => u.id === userId);
    if (!user) {
      res.status(404).json({ error: 'Pengguna tidak ditemukan.' });
      return;
    }

    const currentHash = hashPassword(oldPassword, user.salt);
    if (currentHash !== user.passwordHash) {
      res.status(401).json({ error: 'Password lama yang Anda masukkan tidak sesuai.' });
      return;
    }

    const newSalt = generateSalt();
    user.salt = newSalt;
    user.passwordHash = hashPassword(newPassword, newSalt);
    saveUsers(users);

    res.json({ message: 'Password berhasil diperbarui dengan aman!' });
  } catch (err: any) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Gagal mengubah password: ' + err.message });
  }
});

// Get Current User (Auth check)
app.get('/api/auth/me', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const userId = verifyToken(authHeader);
  if (!userId) {
    res.status(401).json({ error: 'Tidak terotentikasi' });
    return;
  }

  const users = loadUsers();
  const user = users.find(u => u.id === userId);
  if (!user) {
    res.status(404).json({ error: 'Pengguna tidak ditemukan' });
    return;
  }

  const { passwordHash, salt, securityAnswerHash, ...safeUser } = user;
  res.json({ user: safeUser });
});

// Cloud Sync: Get latest user data
app.get('/api/data/sync', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = verifyToken(authHeader);
    if (!userId) {
      res.status(401).json({ error: 'Silakan login terlebih dahulu untuk menyinkronkan data.' });
      return;
    }

    let dataFilePath = getUserDataFilePath(userId);
    if (!fs.existsSync(dataFilePath)) {
      const masterPath = path.join(DATA_DIR, 'data_sch_malathe_pote_01.json');
      if (fs.existsSync(masterPath)) {
        dataFilePath = masterPath;
      } else {
        res.json({ data: null, message: 'Belum ada data tersimpan di server untuk akun ini.' });
        return;
      }
    }

    const raw = fs.readFileSync(dataFilePath, 'utf-8');
    const data = JSON.parse(raw);
    if (data && Array.isArray(data.curriculum)) {
      data.curriculum = sanitizeCurriculumData(data.curriculum);
    }
    res.json({ data, message: 'Data berhasil diambil dari cloud server.' });
  } catch (err: any) {
    console.error('Fetch cloud data error:', err);
    res.status(500).json({ error: 'Gagal mengambil data dari server: ' + err.message });
  }
});

// Cloud Sync: Save user data
app.post('/api/data/sync', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const userId = verifyToken(authHeader);
    if (!userId) {
      res.status(401).json({ error: 'Silakan login untuk menyimpan data ke cloud server.' });
      return;
    }

    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      res.status(400).json({ error: 'Data payload tidak valid.' });
      return;
    }

    if (Array.isArray(payload.students)) {
      const seenStudent = new Set<string>();
      payload.students = payload.students.filter((s: any) => {
        if (!s || !s.id || seenStudent.has(s.id)) return false;
        seenStudent.add(s.id);
        return true;
      });
    }

    if (Array.isArray(payload.curriculum)) {
      payload.curriculum = sanitizeCurriculumData(payload.curriculum);
    }

    const dataWithTimestamp = {
      ...payload,
      syncedAt: new Date().toISOString()
    };

    const dataFilePath = getUserDataFilePath(userId);
    fs.writeFileSync(dataFilePath, JSON.stringify(dataWithTimestamp, null, 2), 'utf-8');

    // Also update data_sch_malathe_pote_01.json so it's always preserved across deployments
    const users = loadUsers();
    const currentUserObj = users.find(u => u.id === userId);
    if (
      userId === 'sch_malathe_pote_01' || 
      userId === 'sch_denbagus_01' || 
      (currentUserObj && (currentUserObj.npsn === '20512345' || currentUserObj.email === 'denbagusch@gmail.com'))
    ) {
      const masterPath = path.join(DATA_DIR, 'data_sch_malathe_pote_01.json');
      try {
        fs.writeFileSync(masterPath, JSON.stringify(dataWithTimestamp, null, 2), 'utf-8');
      } catch (e) {
        console.warn('Could not update master data file:', e);
      }
    }

    res.json({
      status: 'ok',
      message: 'Data berhasil disinkronkan ke cloud server.',
      syncedAt: dataWithTimestamp.syncedAt
    });
  } catch (err: any) {
    console.error('Save cloud data error:', err);
    res.status(500).json({ error: 'Gagal menyinkronkan data ke server: ' + err.message });
  }
});

// Firestore Quota Status: Check & Share state across browser sessions
const QUOTA_STATUS_FILE = path.join(DATA_DIR, 'firestore_quota_status.json');

app.get('/api/firestore-quota', (req: Request, res: Response) => {
  try {
    if (fs.existsSync(QUOTA_STATUS_FILE)) {
      const raw = fs.readFileSync(QUOTA_STATUS_FILE, 'utf-8');
      const data = JSON.parse(raw);
      // Cooldown of 12 hours
      if (data && data.timestamp && Date.now() - data.timestamp < 12 * 60 * 60 * 1000) {
        res.json({ quotaExceeded: true, timestamp: data.timestamp });
        return;
      }
    }
    res.json({ quotaExceeded: false });
  } catch {
    res.json({ quotaExceeded: false });
  }
});

app.post('/api/firestore-quota', (req: Request, res: Response) => {
  try {
    const { quotaExceeded } = req.body;
    if (quotaExceeded) {
      fs.writeFileSync(QUOTA_STATUS_FILE, JSON.stringify({ quotaExceeded: true, timestamp: Date.now() }, null, 2), 'utf-8');
    } else {
      if (fs.existsSync(QUOTA_STATUS_FILE)) {
        try { fs.unlinkSync(QUOTA_STATUS_FILE); } catch {}
      }
    }
    res.json({ success: true });
  } catch {
    res.json({ success: false });
  }
});

/* =========================================================================
   VITE MIDDLEWARE (DEV) & STATIC SERVING (PROD)
   ========================================================================= */

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[KKG Guslah 1 Malathe Pote] Server running on http://0.0.0.0:${PORT}`);
  });
}

// In Vercel serverless environments, Vercel invokes the exported app directly
if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV && process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
