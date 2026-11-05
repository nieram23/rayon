import { useCallback, useEffect, useId, useMemo, useState, type FormEvent } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCopy,
  Download,
  FileSpreadsheet,
  KeyRound,
  ListPlus,
  Loader2,
  Pencil,
  Printer,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  UserPlus,
  Users,
  XCircle,
} from 'lucide-react';
import { Button, EmptyState, Stat } from '../../components/ui';
import { CHAPTERS } from '../../content/chapters';
import { generatePassword, parseStudentLine, suggestUsername, uniqueUsername, USERNAME_RE } from '../../lib/accounts';
import { cx, formatDate } from '../../lib/theme';
import { buildRoster, columnLabels, credentialsWorkbook, detectColumns, readRosterFile, type RosterColumns } from '../../lib/roster';
import type { Account, CreateResult, DataRow, NewStudent } from '../../services/cloud';
import { progressFromRecord, type ChapterRecord } from '../../services/chapterStore';
import { useAuth } from '../../state/AuthContext';
import { FIELD } from '../auth/AuthGate';
import { TeacherPageHeader } from './TeacherDashboard';

const SMALL_FIELD =
  'block w-full min-h-11 rounded-xl border border-line-2 bg-white px-3 text-[0.95rem] outline-none focus:border-ink focus:ring-2 focus:ring-tag';

interface Credential {
  firstName?: string;
  lastName?: string;
  displayName: string;
  username: string;
  password: string;
  classLabel: string;
}

interface Summary {
  started: number;
  done: number;
  total: number;
  lastActivity: string | null;
}

const TOTAL_ACTIVITIES = Object.values(CHAPTERS).reduce((n, ch) => n + ch.steps.reduce((m, s) => m + (s.activities?.length ?? 0), 0), 0);

function summarize(rows: DataRow[]): Map<string, Summary> {
  const out = new Map<string, Summary>();
  for (const r of rows) {
    if (!r.key.startsWith('answers.')) continue;
    const ch = CHAPTERS[r.key.slice('answers.'.length)];
    if (!ch) continue;
    const p = progressFromRecord(ch, r.value as Partial<ChapterRecord>);
    if (!p) continue;
    const s = out.get(r.userId) ?? { started: 0, done: 0, total: TOTAL_ACTIVITIES, lastActivity: null };
    s.started++;
    s.done += p.activitiesDone;
    if (p.lastVisitedAt && (!s.lastActivity || p.lastVisitedAt > s.lastActivity)) s.lastActivity = p.lastVisitedAt;
    out.set(r.userId, s);
  }
  return out;
}

function csvOf(list: Credential[]) {
  const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [['Classe', 'Nom', 'Prénom', 'Identifiant', 'Mot de passe'], ...list.map((c) => [c.classLabel, c.lastName ?? c.displayName, c.firstName ?? '', c.username, c.password])];
  return '﻿' + lines.map((l) => l.map(esc).join(';')).join('\r\n');
}

function saveFile(blob: Blob, filename: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
}

function downloadCsv(list: Credential[]) {
  saveFile(new Blob([csvOf(list)], { type: 'text/csv;charset=utf-8' }), `identifiants-rayon-${new Date().toISOString().slice(0, 10)}.csv`);
}

/** Fiches à découper : une par élève, avec l'adresse du site. */
function printCards(list: Credential[]) {
  const w = window.open('', '_blank');
  if (!w) return false;
  const site = window.location.origin;
  const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);
  w.document.write(`<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"><title>Identifiants Rayon</title>
<style>
body{font-family:Arial,sans-serif;margin:12mm;color:#111}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:6mm}
.card{border:1.5px dashed #555;border-radius:4mm;padding:5mm;break-inside:avoid}
h2{margin:0 0 1mm;font-size:13pt}.cls{color:#555;font-size:10pt;margin-bottom:3mm}
.row{font-size:11pt;margin:1.5mm 0}.v{font-family:'Courier New',monospace;font-weight:bold;font-size:13pt}
.site{margin-top:3mm;font-size:9pt;color:#555}
</style></head><body><div class="grid">${list
    .map(
      (c) => `<div class="card"><h2>${esc(c.displayName)}</h2><div class="cls">${esc(c.classLabel)}</div>
<div class="row">Identifiant : <span class="v">${esc(c.username)}</span></div>
<div class="row">Mot de passe : <span class="v">${esc(c.password)}</span></div>
<div class="site">Site : ${esc(site)}</div></div>`,
    )
    .join('')}</div><script>window.onload=function(){window.print()}</script></body></html>`);
  w.document.close();
  return true;
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

/* ============================================================ */

export function TeacherAccounts() {
  const { backend, cloud, account: me } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [summary, setSummary] = useState<Map<string, Summary>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [issued, setIssued] = useState<Credential[]>([]);
  const [tab, setTab] = useState<'file' | 'one' | 'list'>('file');

  const load = useCallback(async () => {
    if (!backend) return;
    setLoading(true);
    setError(null);
    try {
      const [acc, rows] = await Promise.all([backend.listAccounts(), backend.pullAll()]);
      setAccounts(acc);
      setSummary(summarize(rows));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  }, [backend]);

  useEffect(() => {
    void load();
  }, [load]);

  const taken = useMemo(() => new Set(accounts.map((a) => a.username)), [accounts]);
  const classes = useMemo(() => [...new Set(accounts.map((a) => a.classLabel).filter(Boolean))].sort(), [accounts]);
  const students = accounts.filter((a) => a.role === 'student');

  const onCreated = useCallback(
    (creds: Credential[]) => {
      setIssued((prev) => [...creds, ...prev]);
      void load();
    },
    [load],
  );

  if (!cloud || !backend) {
    return (
      <div>
        <TeacherPageHeader eyebrow="Administration" title="Comptes élèves" real>
          Création des identifiants de connexion.
        </TeacherPageHeader>
        <EmptyState icon={<KeyRound className="size-6" />} title="Disponible une fois le site en ligne">
          Les comptes élèves fonctionnent avec la base de données Supabase, sur le site publié avec Vercel. Cette version d’aperçu n’est reliée à aucun
          serveur.
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <TeacherPageHeader eyebrow="Administration" title="Comptes élèves" real>
        Crée les identifiants de tes élèves, puis distribue-les. Chaque élève retrouve son travail sur n’importe quel ordinateur.
      </TeacherPageHeader>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Comptes élèves" value={students.length} />
        <Stat label="Classes" value={classes.length} />
        <Stat label="Élèves ayant commencé un dossier" value={students.filter((s) => summary.has(s.id)).length} />
      </div>

      <section aria-labelledby="add-title" className="card p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="add-title" className="text-[1.25rem] font-bold">
            Ajouter des élèves
          </h2>
          <div role="tablist" aria-label="Mode d’ajout" className="inline-flex rounded-full bg-ink/6 p-1">
            {(
              [
                ['file', 'Importer un fichier', FileSpreadsheet],
                ['one', 'Un élève', UserPlus],
                ['list', 'Coller une liste', ListPlus],
              ] as const
            ).map(([v, label, Icon]) => (
              <button
                key={v}
                role="tab"
                type="button"
                aria-selected={tab === v}
                onClick={() => setTab(v)}
                className={cx('inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-[0.9rem] font-bold', tab === v ? 'bg-ink text-paper' : 'text-ink-2')}
              >
                <Icon className="size-4" aria-hidden /> {label}
              </button>
            ))}
          </div>
        </div>
        {tab === 'file' ? (
          <FileImportForm taken={taken} classes={classes} onCreated={onCreated} />
        ) : tab === 'one' ? (
          <OneStudentForm taken={taken} classes={classes} onCreated={onCreated} />
        ) : (
          <ListForm taken={taken} classes={classes} onCreated={onCreated} />
        )}
      </section>

      {issued.length > 0 && <IssuedPanel list={issued} onClear={() => setIssued([])} />}

      <AccountsTable
        accounts={accounts}
        summary={summary}
        classes={classes}
        loading={loading}
        error={error}
        meId={me?.id}
        onReload={load}
        onPassword={(c) => setIssued((prev) => [c, ...prev])}
      />
    </div>
  );
}

/* ======================== Ajout d'un élève ======================== */

function ClassInput({ id, value, onChange, classes }: { id: string; value: string; onChange: (v: string) => void; classes: string[] }) {
  return (
    <>
      <input id={id} className={FIELD} value={value} onChange={(e) => onChange(e.target.value)} list={`${id}-list`} placeholder="Ex. : 1re MCV A" maxLength={40} />
      <datalist id={`${id}-list`}>
        {classes.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </>
  );
}

function OneStudentForm({ taken, classes, onCreated }: { taken: Set<string>; classes: string[]; onCreated: (c: Credential[]) => void }) {
  const { backend } = useAuth();
  const id = useId();
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [username, setUsername] = useState('');
  const [userEdited, setUserEdited] = useState(false);
  const [classLabel, setClassLabel] = useState(classes[0] ?? '');
  const [password, setPassword] = useState(() => generatePassword());
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const suggested = uniqueUsername(suggestUsername(first, last), taken);
  const finalUsername = userEdited ? username.trim().toLowerCase() : suggested;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (!first.trim()) return setMsg({ ok: false, text: 'Indique au moins le prénom.' });
    if (!USERNAME_RE.test(finalUsername)) return setMsg({ ok: false, text: 'Identifiant invalide : 3 caractères minimum, lettres minuscules, chiffres, point ou tiret.' });
    if (password.length < 6) return setMsg({ ok: false, text: 'Le mot de passe doit contenir au moins 6 caractères.' });
    const displayName = [first.trim(), last.trim()].filter(Boolean).join(' ');
    setBusy(true);
    try {
      const [r] = await backend!.createStudents([{ username: finalUsername, displayName, classLabel: classLabel.trim(), password }]);
      if (!r.ok) setMsg({ ok: false, text: r.error ?? 'Création impossible.' });
      else {
        setMsg({ ok: true, text: `Compte ${finalUsername} créé.` });
        onCreated([{ firstName: first.trim(), lastName: last.trim(), displayName, username: finalUsername, password, classLabel: classLabel.trim() }]);
        setFirst('');
        setLast('');
        setUsername('');
        setUserEdited(false);
        setPassword(generatePassword());
      }
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : 'Erreur.' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor={`${id}-f`} className="font-bold">
          Prénom
        </label>
        <input id={`${id}-f`} className={FIELD} value={first} onChange={(e) => setFirst(e.target.value)} autoComplete="off" maxLength={30} />
      </div>
      <div>
        <label htmlFor={`${id}-l`} className="font-bold">
          Nom <span className="font-normal text-ink-3">(ou initiale)</span>
        </label>
        <input id={`${id}-l`} className={FIELD} value={last} onChange={(e) => setLast(e.target.value)} autoComplete="off" maxLength={30} />
      </div>
      <div>
        <label htmlFor={`${id}-c`} className="font-bold">
          Classe
        </label>
        <ClassInput id={`${id}-c`} value={classLabel} onChange={setClassLabel} classes={classes} />
      </div>
      <div>
        <label htmlFor={`${id}-u`} className="font-bold">
          Identifiant
        </label>
        <input
          id={`${id}-u`}
          className={FIELD}
          value={userEdited ? username : suggested}
          onChange={(e) => {
            setUserEdited(true);
            setUsername(e.target.value.toLowerCase());
          }}
          autoCapitalize="none"
          spellCheck={false}
          maxLength={40}
          placeholder="prenom.nom"
        />
        <p className="mt-1 text-[0.82rem] text-ink-3">Proposé automatiquement à partir du prénom et du nom. Modifiable.</p>
      </div>
      <div className="sm:col-span-2">
        <label htmlFor={`${id}-p`} className="font-bold">
          Mot de passe
        </label>
        <div className="flex gap-2">
          <input id={`${id}-p`} className={FIELD + ' font-mono'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="off" spellCheck={false} />
          <Button variant="secondary" className="mt-1.5 shrink-0" onClick={() => setPassword(generatePassword())} aria-label="Générer un autre mot de passe">
            <RefreshCw className="size-4" aria-hidden /> <span className="hidden sm:inline">Autre</span>
          </Button>
        </div>
        <p className="mt-1 text-[0.82rem] text-ink-3">Note-le : il ne pourra plus être affiché ensuite. Tu pourras en donner un nouveau à tout moment.</p>
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <Button type="submit" disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <UserPlus className="size-4" aria-hidden />} Créer le compte
        </Button>
        {msg && (
          <p className={cx('inline-flex items-center gap-2 font-bold', msg.ok ? 'text-p1-dark' : 'text-m1')} role={msg.ok ? 'status' : 'alert'}>
            {msg.ok ? <CheckCircle2 className="size-4" aria-hidden /> : <AlertTriangle className="size-4" aria-hidden />} {msg.text}
          </p>
        )}
      </div>
    </form>
  );
}

/* ======================== Création en lot (liste collée ou fichier) ======================== */

type Draft = NewStudent & { firstName?: string; lastName?: string; status?: CreateResult };
const BATCH = 50;

function BatchTable({ draft, setDraft, onCreated, onBack }: { draft: Draft[]; setDraft: (d: Draft[] | ((d: Draft[]) => Draft[])) => void; onCreated: (c: Credential[]) => void; onBack: () => void }) {
  const { backend } = useAuth();
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const remaining = draft.filter((d) => !d.status?.ok);

  async function create() {
    setBusy(true);
    setError(null);
    const next = [...draft];
    const todo = next.map((d, i) => ({ d, i })).filter(({ d }) => !d.status?.ok);
    const created: Credential[] = [];
    try {
      for (let k = 0; k < todo.length; k += BATCH) {
        const chunk = todo.slice(k, k + BATCH);
        setProgress(`Création des comptes… ${Math.min(k + BATCH, todo.length)} / ${todo.length}`);
        const results = await backend!.createStudents(chunk.map(({ d }) => ({ username: d.username, displayName: d.displayName, classLabel: d.classLabel, password: d.password })));
        chunk.forEach(({ d, i }, n) => {
          next[i] = { ...d, status: results[n] };
          if (results[n]?.ok) created.push({ firstName: d.firstName, lastName: d.lastName, displayName: d.displayName, username: d.username, password: d.password, classLabel: d.classLabel });
        });
        setDraft([...next]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur.');
    } finally {
      setBusy(false);
      setProgress(null);
      if (created.length) onCreated(created);
      if (next.every((d) => d.status?.ok)) setDraft([]);
    }
  }

  const update = (i: number, patch: Partial<Draft>) => setDraft((d) => d.map((x, j) => (j === i ? { ...x, ...patch, status: undefined } : x)));
  const remove = (i: number) => setDraft((d) => d.filter((_, j) => j !== i));

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[0.92rem] text-ink-2">
        <strong className="text-ink">{draft.length} élève{draft.length > 1 ? 's' : ''}</strong> prêt{draft.length > 1 ? 's' : ''}. Vérifie les identifiants, modifie-les si besoin, puis crée tous les comptes en une fois.
      </p>
      <div className="max-h-[28rem] overflow-auto rounded-xl border border-line">
        <table className="w-full min-w-[720px] text-left text-[0.9rem]">
          <thead className="sticky top-0 bg-[#efebe2] text-[0.8rem] text-ink-3">
            <tr>
              <th className="px-3 py-2">Élève</th>
              <th className="px-3 py-2">Classe</th>
              <th className="px-3 py-2">Identifiant</th>
              <th className="px-3 py-2">Mot de passe</th>
              <th className="px-3 py-2">État</th>
              <th className="px-2 py-2">
                <span className="sr-only">Retirer</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {draft.map((d, i) => (
              <tr key={i} className="border-t border-line">
                <td className="px-3 py-2 font-bold">{d.displayName}</td>
                <td className="px-3 py-1.5">
                  <input aria-label={`Classe de ${d.displayName}`} className={SMALL_FIELD + ' min-w-24'} value={d.classLabel} onChange={(e) => update(i, { classLabel: e.target.value })} disabled={d.status?.ok || busy} />
                </td>
                <td className="px-3 py-1.5">
                  <input aria-label={`Identifiant de ${d.displayName}`} className={SMALL_FIELD + ' font-mono'} value={d.username} onChange={(e) => update(i, { username: e.target.value.toLowerCase() })} disabled={d.status?.ok || busy} />
                </td>
                <td className="px-3 py-1.5">
                  <input aria-label={`Mot de passe de ${d.displayName}`} className={SMALL_FIELD + ' w-28 font-mono'} value={d.password} onChange={(e) => update(i, { password: e.target.value })} disabled={d.status?.ok || busy} />
                </td>
                <td className="px-3 py-2">
                  {!d.status ? (
                    <span className="text-ink-3">À créer</span>
                  ) : d.status.ok ? (
                    <span className="inline-flex items-center gap-1 font-bold text-p1-dark">
                      <CheckCircle2 className="size-4" aria-hidden /> Créé
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 font-bold text-m1">
                      <XCircle className="size-4 shrink-0" aria-hidden /> {d.status.error}
                    </span>
                  )}
                </td>
                <td className="px-2 py-1.5">
                  {!d.status?.ok && (
                    <button type="button" onClick={() => remove(i)} disabled={busy} className="grid size-9 place-items-center rounded-lg text-ink-3 hover:bg-ink/5 hover:text-m1" aria-label={`Retirer ${d.displayName} de la liste`}>
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={create} disabled={busy || !remaining.length}>
          {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Users className="size-4" aria-hidden />}
          Créer {remaining.length} compte{remaining.length > 1 ? 's' : ''}
        </Button>
        <Button variant="secondary" onClick={onBack} disabled={busy}>
          Recommencer
        </Button>
        {progress && (
          <span className="text-[0.9rem] font-bold text-ink-2" role="status">
            {progress}
          </span>
        )}
      </div>
      {error && (
        <p className="font-bold text-m1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function ListForm({ taken, classes, onCreated }: { taken: Set<string>; classes: string[]; onCreated: (c: Credential[]) => void }) {
  const id = useId();
  const [text, setText] = useState('');
  const [classLabel, setClassLabel] = useState(classes[0] ?? '');
  const [draft, setDraft] = useState<Draft[]>([]);
  const [error, setError] = useState<string | null>(null);

  function prepare() {
    setError(null);
    const used = new Set(taken);
    const rows: Draft[] = [];
    for (const line of text.split(/\r?\n/)) {
      const p = parseStudentLine(line);
      if (!p || !p.firstName) continue;
      const username = uniqueUsername(suggestUsername(p.firstName, p.lastName), used);
      used.add(username);
      rows.push({ firstName: p.firstName, lastName: p.lastName, username, displayName: [p.firstName, p.lastName].filter(Boolean).join(' '), classLabel: classLabel.trim(), password: generatePassword() });
    }
    if (!rows.length) setError('Colle au moins une ligne « Prénom Nom ».');
    else setDraft(rows);
  }

  if (draft.length) return <BatchTable draft={draft} setDraft={setDraft} onCreated={(c) => { onCreated(c); setText(''); }} onBack={() => setDraft([])} />;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
        <div>
          <label htmlFor={`${id}-t`} className="font-bold">
            Liste des élèves
          </label>
          <textarea id={`${id}-t`} className={FIELD + ' min-h-40 py-3'} value={text} onChange={(e) => setText(e.target.value)} placeholder={'Un élève par ligne :\nLéa Martin\nNoah Petit\nDUPONT Inès'} />
          <p className="mt-1 text-[0.82rem] text-ink-3">« Prénom Nom », « NOM Prénom » (export de vie scolaire) ou « Nom;Prénom » sont reconnus.</p>
        </div>
        <div>
          <label htmlFor={`${id}-c`} className="font-bold">
            Classe
          </label>
          <ClassInput id={`${id}-c`} value={classLabel} onChange={setClassLabel} classes={classes} />
        </div>
      </div>
      <Button onClick={prepare} className="self-start">
        <ListPlus className="size-4" aria-hidden /> Préparer les identifiants
      </Button>
      {error && (
        <p className="font-bold text-m1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/* ======================== Import d'un fichier CSV ou Excel ======================== */

function FileImportForm({ taken, classes, onCreated }: { taken: Set<string>; classes: string[]; onCreated: (c: Credential[]) => void }) {
  const id = useId();
  const [rows, setRows] = useState<string[][] | null>(null);
  const [fileName, setFileName] = useState('');
  const [cols, setCols] = useState<RosterColumns | null>(null);
  const [classLabel, setClassLabel] = useState(classes[0] ?? '');
  const [draft, setDraft] = useState<Draft[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [over, setOver] = useState(false);

  async function load(file: File | undefined) {
    if (!file) return;
    setError(null);
    setReading(true);
    try {
      const r = await readRosterFile(file);
      if (!r.length) throw new Error('Le fichier est vide.');
      setRows(r);
      setCols(detectColumns(r));
      setFileName(file.name);
    } catch (e) {
      setError(e instanceof Error && e.message !== 'image' ? `Lecture impossible : ${e.message}` : 'Lecture impossible.');
    } finally {
      setReading(false);
    }
  }

  function prepare() {
    if (!rows || !cols) return;
    const list = buildRoster(rows, cols, classLabel, taken);
    if (!list.length) return setError('Aucun élève trouvé avec ces colonnes.');
    setError(null);
    setDraft(list.map((e) => ({ ...e, displayName: [e.firstName, e.lastName].filter(Boolean).join(' ') })));
  }

  function reset() {
    setDraft([]);
    setRows(null);
    setCols(null);
    setFileName('');
  }

  if (draft.length) return <BatchTable draft={draft} setDraft={setDraft} onCreated={onCreated} onBack={reset} />;

  if (!rows || !cols)
    return (
      <div className="flex flex-col gap-3">
        <label
          htmlFor={`${id}-f`}
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            void load(e.dataTransfer.files[0]);
          }}
          className={cx('flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-colors', over ? 'border-ink bg-tag-soft' : 'border-line-2 bg-white hover:border-ink')}
        >
          {reading ? <Loader2 className="size-8 animate-spin text-ink-3" aria-hidden /> : <Upload className="size-8 text-ink-3" aria-hidden />}
          <span className="font-bold">Choisis ou dépose la liste de la classe</span>
          <span className="text-[0.88rem] text-ink-3">Fichier Excel (.xlsx, .xls), LibreOffice (.ods) ou CSV, avec une colonne Nom et une colonne Prénom (Classe facultative).</span>
          <input id={`${id}-f`} type="file" accept=".csv,.txt,.xlsx,.xls,.ods" className="sr-only" onChange={(e) => void load(e.target.files?.[0])} />
        </label>
        <p className="text-[0.85rem] text-ink-3">
          Identifiant créé : initiale du prénom, point, nom (<span className="font-mono">l.martin</span>). Mot de passe : 6 caractères sans lettres ni chiffres
          ambigus (<span className="font-mono">k7m4tp</span>). Tu récupères ensuite un fichier Excel avec tous les identifiants.
        </p>
        {error && (
          <p className="font-bold text-m1" role="alert">
            {error}
          </p>
        )}
      </div>
    );

  const labels = columnLabels(rows, cols.headerRow);
  const preview = buildRoster(rows.slice(0, cols.headerRow + 1 + 4), cols, classLabel, taken);
  const count = rows.length - (cols.headerRow + 1);
  const sel = (value: number, onChange: (v: number) => void, label: string, allowNone: string | null) => (
    <div>
      <label htmlFor={`${id}-${label}`} className="text-[0.88rem] font-bold">
        {label}
      </label>
      <select id={`${id}-${label}`} className={SMALL_FIELD + ' mt-1'} value={value} onChange={(e) => onChange(Number(e.target.value))}>
        {allowNone && <option value={-1}>{allowNone}</option>}
        {labels.map((l, i) => (
          <option key={i} value={i}>
            {l}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <p className="inline-flex items-center gap-2 text-[0.92rem]">
        <FileSpreadsheet className="size-4" aria-hidden /> <strong>{fileName}</strong> · {count} ligne{count > 1 ? 's' : ''}
        <button type="button" onClick={reset} className="ml-2 font-bold underline underline-offset-4">
          Changer de fichier
        </button>
      </p>
      <fieldset className="grid gap-3 rounded-xl bg-ink/4 p-4 sm:grid-cols-4">
        <legend className="sr-only">Correspondance des colonnes</legend>
        {sel(cols.combined ? -1 : cols.first, (v) => setCols({ ...cols, first: v, combined: v < 0 }), 'Prénom', 'Dans la colonne Nom (« NOM Prénom »)')}
        {sel(cols.last, (v) => setCols({ ...cols, last: v }), cols.combined ? 'Nom et prénom' : 'Nom', null)}
        {sel(cols.cls, (v) => setCols({ ...cols, cls: v }), 'Classe', 'Aucune colonne')}
        <div>
          <label htmlFor={`${id}-dc`} className="text-[0.88rem] font-bold">
            {cols.cls >= 0 ? 'Classe si vide' : 'Classe pour tous'}
          </label>
          <input id={`${id}-dc`} className={SMALL_FIELD + ' mt-1'} value={classLabel} onChange={(e) => setClassLabel(e.target.value)} list={`${id}-dcl`} placeholder="Ex. : 1re MCV A" />
          <datalist id={`${id}-dcl`}>
            {classes.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <label className="flex items-center gap-2 text-[0.88rem] sm:col-span-4">
          <input type="checkbox" checked={cols.headerRow >= 0} onChange={(e) => setCols({ ...cols, headerRow: e.target.checked ? Math.max(cols.headerRow, 0) : -1 })} className="size-4" />
          La première ligne contient les titres des colonnes
        </label>
      </fieldset>
      <div>
        <p className="mb-1 text-[0.85rem] font-bold text-ink-3">Aperçu des premières lignes</p>
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[520px] text-left text-[0.9rem]">
            <thead className="bg-ink/5 text-[0.8rem] text-ink-3">
              <tr>
                <th className="px-3 py-2">Prénom</th>
                <th className="px-3 py-2">Nom</th>
                <th className="px-3 py-2">Classe</th>
                <th className="px-3 py-2">Identifiant</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((p, i) => (
                <tr key={i} className="border-t border-line">
                  <td className="px-3 py-2">{p.firstName}</td>
                  <td className="px-3 py-2">{p.lastName}</td>
                  <td className="px-3 py-2">{p.classLabel || <span className="text-m1">à préciser</span>}</td>
                  <td className="px-3 py-2 font-mono">{p.username}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Button onClick={prepare} className="self-start">
        <ListPlus className="size-4" aria-hidden /> Préparer les {count} comptes
      </Button>
      {error && (
        <p className="font-bold text-m1" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/* ======================== Identifiants à distribuer ======================== */

function IssuedPanel({ list, onClear }: { list: Credential[]; onClear: () => void }) {
  const [note, setNote] = useState<string | null>(null);
  const text = list.map((c) => `${c.displayName} (${c.classLabel}) : ${c.username} / ${c.password}`).join('\n');
  return (
    <section aria-labelledby="issued-title" className="card border-2 border-ink p-5 sm:p-6">
      <h2 id="issued-title" className="text-[1.25rem] font-bold">
        Identifiants à distribuer ({list.length})
      </h2>
      <p className="mt-1 text-[0.9rem] text-ink-2">
        Les mots de passe ne sont affichés qu’ici et disparaissent si tu quittes la page. Imprime les fiches ou télécharge la liste maintenant.
      </p>
      <div className="mt-4 overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[520px] text-left text-[0.92rem]">
          <thead className="bg-ink/5 text-[0.82rem] text-ink-3">
            <tr>
              <th className="px-3 py-2">Nom</th>
              <th className="px-3 py-2">Classe</th>
              <th className="px-3 py-2">Identifiant</th>
              <th className="px-3 py-2">Mot de passe</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c, i) => (
              <tr key={i} className="border-t border-line">
                <td className="px-3 py-2 font-bold">{c.displayName}</td>
                <td className="px-3 py-2">{c.classLabel}</td>
                <td className="px-3 py-2 font-mono">{c.username}</td>
                <td className="px-3 py-2 font-mono font-bold">{c.password}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button
          onClick={async () => {
            const blob = await credentialsWorkbook(list);
            saveFile(blob, `identifiants-rayon-${new Date().toISOString().slice(0, 10)}.xlsx`);
          }}
        >
          <FileSpreadsheet className="size-4" aria-hidden /> Télécharger (Excel)
        </Button>
        <Button variant="secondary" onClick={() => { if (!printCards(list)) setNote('Autorise l’ouverture de fenêtres pour imprimer.'); }}>
          <Printer className="size-4" aria-hidden /> Imprimer les fiches
        </Button>
        <Button variant="secondary" onClick={() => downloadCsv(list)}>
          <Download className="size-4" aria-hidden /> CSV
        </Button>
        <Button variant="secondary" onClick={async () => setNote((await copyText(text)) ? 'Liste copiée.' : 'Copie impossible : sélectionne le tableau.')}>
          <ClipboardCopy className="size-4" aria-hidden /> Copier
        </Button>
        <Button variant="ghost" onClick={onClear}>
          Effacer cette liste
        </Button>
        {note && (
          <span className="text-[0.9rem] font-bold" role="status">
            {note}
          </span>
        )}
      </div>
    </section>
  );
}

/* ======================== Liste des comptes ======================== */

function AccountsTable({
  accounts,
  summary,
  classes,
  loading,
  error,
  meId,
  onReload,
  onPassword,
}: {
  accounts: Account[];
  summary: Map<string, Summary>;
  classes: string[];
  loading: boolean;
  error: string | null;
  meId?: string;
  onReload: () => void;
  onPassword: (c: Credential) => void;
}) {
  const [classe, setClasse] = useState('toutes');
  const [q, setQ] = useState('');
  const list = accounts.filter(
    (a) =>
      (classe === 'toutes' || a.classLabel === classe) &&
      (a.displayName.toLowerCase().includes(q.trim().toLowerCase()) || a.username.includes(q.trim().toLowerCase())),
  );

  return (
    <section aria-labelledby="list-title" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="list-title" className="text-[1.25rem] font-bold">
          Comptes existants
        </h2>
        <Button variant="ghost" onClick={onReload} disabled={loading}>
          <RefreshCw className={cx('size-4', loading && 'animate-spin')} aria-hidden /> Actualiser
        </Button>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="sr-only" htmlFor="acc-classe">
          Classe
        </label>
        <select id="acc-classe" value={classe} onChange={(e) => setClasse(e.target.value)} className={SMALL_FIELD + ' sm:w-56'}>
          <option value="toutes">Toutes les classes</option>
          {classes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <div className="relative flex-1">
          <Search className="absolute top-3.5 left-3 size-4 text-ink-3" aria-hidden />
          <label className="sr-only" htmlFor="acc-q">
            Rechercher
          </label>
          <input id="acc-q" value={q} onChange={(e) => setQ(e.target.value)} className={SMALL_FIELD + ' pl-9'} placeholder="Rechercher un nom ou un identifiant" />
        </div>
      </div>
      {error && (
        <p className="rounded-xl bg-m1/8 px-4 py-3 font-bold text-m1" role="alert">
          {error}
        </p>
      )}
      {loading && !accounts.length ? (
        <p className="inline-flex items-center gap-2 text-ink-3" role="status">
          <Loader2 className="size-4 animate-spin" aria-hidden /> Chargement des comptes…
        </p>
      ) : !list.length ? (
        <EmptyState icon={<Users className="size-6" />} title="Aucun compte">
          Ajoute tes premiers élèves avec le formulaire ci-dessus.
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-3">
          {list.map((a) => (
            <AccountRow key={a.id} account={a} summary={summary.get(a.id)} classes={classes} isMe={a.id === meId} onChanged={onReload} onPassword={onPassword} />
          ))}
        </ul>
      )}
    </section>
  );
}

function AccountRow({
  account: a,
  summary: s,
  classes,
  isMe,
  onChanged,
  onPassword,
}: {
  account: Account;
  summary?: Summary;
  classes: string[];
  isMe: boolean;
  onChanged: () => void;
  onPassword: (c: Credential) => void;
}) {
  const { backend } = useAuth();
  const [mode, setMode] = useState<'view' | 'edit' | 'delete' | 'password'>('view');
  const [displayName, setDisplayName] = useState(a.displayName);
  const [classLabel, setClassLabel] = useState(a.classLabel);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const id = useId();

  async function run(fn: () => Promise<void>, ok: string) {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      setMsg({ ok: true, text: ok });
      setMode('view');
      onChanged();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : 'Erreur.' });
    } finally {
      setBusy(false);
    }
  }

  const pct = s ? Math.round((s.done / s.total) * 100) : 0;

  return (
    <li className="card p-4">
      <div className="flex flex-wrap items-start gap-x-6 gap-y-3">
        <div className="min-w-44 flex-1">
          <p className="flex items-center gap-2 font-bold">
            {a.displayName}
            {a.role === 'admin' && <span className="rounded-full bg-ink px-2 py-0.5 text-[0.72rem] text-paper">Administrateur</span>}
          </p>
          <p className="font-mono text-[0.88rem] text-ink-2">{a.username}</p>
          <p className="text-[0.82rem] text-ink-3">{a.classLabel || 'Sans classe'}</p>
        </div>
        <div className="min-w-44 text-[0.88rem]">
          {a.role === 'student' &&
            (s ? (
              <>
                <p>
                  <strong>{s.started}</strong> dossier{s.started > 1 ? 's' : ''} commencé{s.started > 1 ? 's' : ''} · <strong>{s.done}</strong> activité
                  {s.done > 1 ? 's' : ''} ({pct} %)
                </p>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink/8" aria-hidden>
                  <div className="h-full rounded-full bg-p1" style={{ width: `${Math.max(pct, 2)}%` }} />
                </div>
              </>
            ) : (
              <p className="text-ink-3">Aucun dossier commencé</p>
            ))}
          <p className="mt-1 text-[0.8rem] text-ink-3">{a.lastSeenAt ? `Dernière connexion : ${formatDate(a.lastSeenAt)}` : 'Jamais connecté'}</p>
        </div>
        {mode === 'view' && (
          <div className="flex flex-wrap gap-1">
            <Button variant="ghost" className="min-h-10 px-3 text-[0.85rem]" onClick={() => { setPassword(generatePassword()); setMode('password'); setMsg(null); }}>
              <KeyRound className="size-4" aria-hidden /> Mot de passe
            </Button>
            <Button variant="ghost" className="min-h-10 px-3 text-[0.85rem]" onClick={() => { setMode('edit'); setMsg(null); }}>
              <Pencil className="size-4" aria-hidden /> Modifier
            </Button>
            {!isMe && (
              <Button variant="ghost" className="min-h-10 px-3 text-[0.85rem] text-m1" onClick={() => { setMode('delete'); setMsg(null); }}>
                <Trash2 className="size-4" aria-hidden /> Supprimer
              </Button>
            )}
          </div>
        )}
      </div>

      {mode === 'password' && (
        <div className="mt-4 flex flex-col gap-3 rounded-xl bg-ink/4 p-4">
          <label htmlFor={`${id}-pw`} className="font-bold">
            Nouveau mot de passe pour {a.displayName}
          </label>
          <div className="flex flex-wrap gap-2">
            <input id={`${id}-pw`} className={SMALL_FIELD + ' max-w-xs font-mono'} value={password} onChange={(e) => setPassword(e.target.value)} spellCheck={false} />
            <Button variant="secondary" className="min-h-11" onClick={() => setPassword(generatePassword())} aria-label="Générer un autre mot de passe">
              <RefreshCw className="size-4" aria-hidden />
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={busy || password.length < 6}
              onClick={() =>
                run(async () => {
                  await backend!.setPassword(a.id, password);
                  onPassword({ displayName: a.displayName, username: a.username, password, classLabel: a.classLabel });
                }, 'Nouveau mot de passe enregistré.')
              }
            >
              {busy && <Loader2 className="size-4 animate-spin" aria-hidden />} Enregistrer
            </Button>
            <Button variant="secondary" onClick={() => setMode('view')}>
              Annuler
            </Button>
          </div>
        </div>
      )}

      {mode === 'edit' && (
        <div className="mt-4 grid gap-3 rounded-xl bg-ink/4 p-4 sm:grid-cols-2">
          <div>
            <label htmlFor={`${id}-dn`} className="text-[0.88rem] font-bold">
              Nom affiché
            </label>
            <input id={`${id}-dn`} className={SMALL_FIELD} value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={60} />
          </div>
          <div>
            <label htmlFor={`${id}-cl`} className="text-[0.88rem] font-bold">
              Classe
            </label>
            <input id={`${id}-cl`} className={SMALL_FIELD} value={classLabel} onChange={(e) => setClassLabel(e.target.value)} list={`${id}-cl-list`} maxLength={40} />
            <datalist id={`${id}-cl-list`}>
              {classes.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div className="flex flex-wrap gap-2 sm:col-span-2">
            <Button disabled={busy || !displayName.trim()} onClick={() => run(() => backend!.updateAccount(a.id, { displayName: displayName.trim(), classLabel: classLabel.trim() }), 'Modifications enregistrées.')}>
              {busy && <Loader2 className="size-4 animate-spin" aria-hidden />} Enregistrer
            </Button>
            <Button variant="secondary" onClick={() => setMode('view')}>
              Annuler
            </Button>
          </div>
        </div>
      )}

      {mode === 'delete' && (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border-2 border-m1/40 bg-m1/5 p-4" role="alertdialog" aria-labelledby={`${id}-del`}>
          <p id={`${id}-del`} className="font-bold">
            Supprimer le compte de {a.displayName} ? Toutes ses réponses seront effacées définitivement.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="danger" disabled={busy} onClick={() => run(() => backend!.deleteAccount(a.id), 'Compte supprimé.')}>
              {busy && <Loader2 className="size-4 animate-spin" aria-hidden />} Oui, supprimer
            </Button>
            <Button variant="secondary" onClick={() => setMode('view')}>
              Annuler
            </Button>
          </div>
        </div>
      )}

      {msg && (
        <p className={cx('mt-3 text-[0.9rem] font-bold', msg.ok ? 'text-p1-dark' : 'text-m1')} role={msg.ok ? 'status' : 'alert'}>
          {msg.text}
        </p>
      )}
    </li>
  );
}
