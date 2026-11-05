/** Contrat du serveur de comptes et de sauvegarde. Deux implémentations : Supabase (réelle) et simulateur (tests). */

export type Role = 'admin' | 'student';

export interface Account {
  id: string;
  username: string;
  displayName: string;
  classLabel: string;
  role: Role;
  createdAt: string;
  lastSeenAt: string | null;
}

export interface DataRow {
  userId: string;
  key: string;
  value: unknown;
  updatedAt: string;
}

export interface NewStudent {
  username: string;
  displayName: string;
  classLabel: string;
  password: string;
}

export interface CreateResult {
  username: string;
  ok: boolean;
  id?: string;
  error?: string;
}

export interface CloudBackend {
  readonly kind: 'supabase' | 'mock';
  /** Identifiant de l'utilisateur connecté, ou null. */
  currentUserId(): Promise<string | null>;
  onSignedOut(cb: () => void): () => void;
  signIn(username: string, password: string): Promise<{ ok: true } | { ok: false; error: string }>;
  signOut(): Promise<void>;
  myAccount(): Promise<Account | null>;
  touchLastSeen(): Promise<void>;

  pull(userId: string): Promise<DataRow[]>;
  upsert(userId: string, rows: Array<{ key: string; value: unknown }>): Promise<void>;
  remove(userId: string, keys: string[]): Promise<void>;

  // Administrateur
  listAccounts(): Promise<Account[]>;
  pullAll(): Promise<DataRow[]>;
  createStudents(list: NewStudent[]): Promise<CreateResult[]>;
  setPassword(userId: string, password: string): Promise<void>;
  updateAccount(userId: string, patch: { displayName?: string; classLabel?: string }): Promise<void>;
  deleteAccount(userId: string): Promise<void>;
  bootstrap(): Promise<{ created: boolean; message: string }>;
}
