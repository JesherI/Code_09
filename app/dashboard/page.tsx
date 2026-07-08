'use client';

import { auth, db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  Timestamp,
  FirestoreError,
  serverTimestamp,
} from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ImageUploader } from '@/components/ui/image-uploader';

type Prompt = {
  id: string;
  title: string;
  text: string;
  imageUrl?: string;
  categories: string[];
  createdAt: Timestamp;
};

type Category = {
  id: string;
  name: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<string | null>(null);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showForm || showCatModal) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [showForm, showCatModal]);

  // New category input
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    if (!auth) {
      router.push('/login');
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        router.push('/login');
        return;
      }
      setUser(u);
      setLoading(false);
    });
    return unsub;
  }, [router]);

  // Fetch prompts
  useEffect(() => {
    if (!user || !db) return;

    const q = query(
      collection(db, 'prompts'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const list: Prompt[] = [];
        snapshot.forEach((d) => {
          list.push({ id: d.id, ...d.data() } as Prompt);
        });
        setPrompts(list);
        setError('');
      },
      (err: FirestoreError) => {
        setError(err.message);
      },
    );

    return unsub;
  }, [user]);

  // Fetch categories
  useEffect(() => {
    if (!user || !db) return;

    const q = query(
      collection(db, 'categories'),
      where('userId', '==', user.uid),
      orderBy('createdAt'),
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list: Category[] = [];
      snapshot.forEach((d) => {
        list.push({ id: d.id, name: d.data().name });
      });
      setCategories(list);
    });

    return unsub;
  }, [user]);

  const addCategory = async () => {
    if (!db || !user || !newCatName.trim()) return;
    try {
      await addDoc(collection(db, 'categories'), {
        userId: user.uid,
        name: newCatName.trim(),
        createdAt: serverTimestamp(),
      });
      setNewCatName('');
      setShowNewCat(false);
    } catch {
      // silent
    }
  };

  const deleteCategory = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'categories', id));
    } catch {
      // silent
    }
  };

  const toggleFormCat = (name: string) => {
    setSelectedCats((prev) =>
      prev.includes(name) ? prev.filter((c) => c !== name) : [...prev, name],
    );
  };

  const openEditor = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setTitle(prompt.title);
    setText(prompt.text);
    setImageUrl(prompt.imageUrl || '');
    setSelectedCats(prompt.categories || []);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !db || !title.trim() || (!text.trim() && !imageUrl)) return;

    setSaving(true);
    try {
      const data = {
        title: title.trim(),
        text: text.trim(),
        imageUrl: imageUrl || '',
        categories: selectedCats,
      };

      if (editingPrompt) {
        await updateDoc(doc(db, 'prompts', editingPrompt.id), data);
      } else {
        await addDoc(collection(db, 'prompts'), {
          userId: user.uid,
          ...data,
          createdAt: Timestamp.now(),
        });
      }
      setTitle('');
      setText('');
      setImageUrl('');
      setSelectedCats([]);
      setEditingPrompt(null);
      setShowForm(false);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'prompts', id));
    } catch {
      // silent
    }
  };

  const handleCopy = async (id: string, text: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 1500);
    } catch {
      // silent
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/');
  };

  const filtered = filterCat
    ? prompts.filter((p) => p.categories?.includes(filterCat))
    : prompts;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-foreground/30 border-t-foreground" />
      </div>
    );
  }

  return (
    <div className="relative z-10 min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-foreground/5 px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <img
            src="/CODE_09-Transparente.svg"
            alt="logo"
            className="h-10 w-auto"
          />
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingPrompt(null);
              setTitle('');
              setText('');
              setImageUrl('');
              setSelectedCats([]);
              setShowForm(true);
            }}
            className="rounded-lg bg-foreground px-3 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            + add
          </button>
          <button
            onClick={handleSignOut}
            className="text-sm text-foreground/50 transition-colors hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-4xl px-6 py-10">
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Category filter */}
        {categories.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFilterCat(null)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                !filterCat
                  ? 'bg-foreground/10 text-foreground'
                  : 'bg-foreground/5 text-foreground/40 hover:bg-foreground/10 hover:text-foreground/70',
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilterCat(filterCat === cat.name ? null : cat.name)}
                className={cn(
                  'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                  filterCat === cat.name
                    ? 'bg-foreground/10 text-foreground'
                    : 'bg-foreground/5 text-foreground/40 hover:bg-foreground/10 hover:text-foreground/70',
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}

        {/* New prompt modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowForm(false)}
            />
            {/* Modal */}
            <form
              onSubmit={handleSave}
              className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-foreground/10 bg-background/80 p-6 backdrop-blur-xl shadow-2xl"
            >
              <div className="mb-5">
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Prompt title"
                  className="w-full bg-transparent text-lg font-medium outline-none placeholder:text-foreground/30"
                  autoFocus
                />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-medium text-foreground/40 mb-1.5">
                  Text description
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Describe the prompt..."
                  rows={4}
                  className="w-full resize-none rounded-lg border border-foreground/10 bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-foreground/30 focus:border-foreground/30"
                />
              </div>

              {/* Image */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-foreground/40 mb-1.5">
                  Image (optional)
                </label>
                <ImageUploader
                  value={imageUrl}
                  onUpload={(url) => setImageUrl(url)}
                  onRemove={() => setImageUrl('')}
                />
              </div>

              {/* Categories */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-foreground/40">
                    Categories
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCatModal(true)}
                    className="text-[10px] font-medium text-foreground/30 hover:text-foreground/60 transition-colors"
                  >
                    Manage
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 min-h-[28px]">
                  {categories.length === 0 ? (
                    <span className="text-xs text-foreground/20">No categories yet</span>
                  ) : (
                    categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleFormCat(cat.name)}
                        className={cn(
                          'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                          selectedCats.includes(cat.name)
                            ? 'bg-foreground/15 text-foreground'
                            : 'bg-foreground/5 text-foreground/40 hover:bg-foreground/10',
                        )}
                      >
                        {cat.name}
                      </button>
                    ))
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving || !title.trim()}
                  className="rounded-lg bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="text-sm text-foreground/50 transition-colors hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Category management modal */}
        {showCatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowCatModal(false)} />
            <div className="relative w-full max-w-sm rounded-xl border border-foreground/10 bg-background/80 p-6 backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold">Categories</h2>
                <button onClick={() => setShowCatModal(false)} className="text-xs text-foreground/40 hover:text-foreground">
                  Close
                </button>
              </div>

              {/* Add new category */}
              <div className="flex items-center gap-2 mb-4">
                <input
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="New category name"
                  className="flex-1 rounded-lg border border-foreground/10 bg-background px-3 py-1.5 text-sm outline-none placeholder:text-foreground/30 focus:border-foreground/30"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCategory(); } }}
                />
                <button
                  type="button"
                  onClick={addCategory}
                  disabled={!newCatName.trim()}
                  className="rounded-lg bg-foreground px-4 py-1.5 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-40"
                >
                  Add
                </button>
              </div>

              {/* Category list */}
              <div className="space-y-1 max-h-[300px] overflow-y-auto">
                {categories.length === 0 ? (
                  <p className="text-sm text-foreground/30 text-center py-8">No categories yet</p>
                ) : (
                  categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between rounded-lg px-3 py-2 hover:bg-foreground/5 transition-colors group/cat"
                    >
                      <span className="text-sm text-foreground/70">{cat.name}</span>
                      <button
                        type="button"
                        onClick={() => deleteCategory(cat.id)}
                        className="text-xs text-foreground/20 hover:text-red-400 opacity-0 group-hover/cat:opacity-100 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Prompts list */}
        {filtered.length === 0 && !showForm ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-foreground/40 text-lg">
              {filterCat ? `No prompts in "${filterCat}"` : 'No prompts yet'}
            </p>
            <button
              onClick={() => { setShowForm(true); setSelectedCats([]); }}
              className="mt-4 text-sm text-foreground/60 underline underline-offset-4 hover:text-foreground"
            >
              Create your first prompt
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((prompt) => (
              <div
                key={prompt.id}
                className="group rounded-xl border border-foreground/5 bg-background/30 backdrop-blur-sm transition-all hover:border-foreground/10 hover:bg-background/40 overflow-hidden"
              >
                {/* Preview */}
                {prompt.imageUrl && (
                  <div className="relative aspect-[4/3] bg-black/20 overflow-hidden group/preview">
                    <img src={prompt.imageUrl} alt={prompt.title} className="w-full h-full object-cover" />
                    {/* Gradient overlay at bottom */}
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background/60 to-transparent pointer-events-none" />
                    {/* Edit overlay on hover */}
                    <button
                      onClick={() => openEditor(prompt)}
                      className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/30 transition-colors opacity-0 group-hover/preview:opacity-100"
                    >
                      <span className="flex items-center gap-1.5 rounded-lg bg-white/10 backdrop-blur-md px-3 py-1.5 text-xs font-medium text-white/90">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                          <path d="M11.5 1.5L14.5 4.5L5 14H2V11L11.5 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                        </svg>
                        Edit
                      </span>
                    </button>
                  </div>
                )}

                {/* Info */}
                <div className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-sm font-medium truncate leading-snug">{prompt.title}</h2>
                    <button
                      onClick={() => handleDelete(prompt.id)}
                      className="text-[10px] text-foreground/20 hover:text-red-400 shrink-0 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M4 4L12 12M12 4L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </button>
                  </div>

                  {prompt.categories && prompt.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {prompt.categories.map((cat) => (
                        <span
                          key={cat}
                          className="inline-block rounded-full bg-foreground/5 px-2 py-0.5 text-[9px] font-medium text-foreground/40"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}

                  {prompt.text && (
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(prompt.id, prompt.text)}
                        className={cn(
                          'flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium transition-all',
                          copiedId === prompt.id
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-foreground/5 text-foreground/40 hover:bg-foreground/10 hover:text-foreground/70',
                        )}
                      >
                        {copiedId === prompt.id ? (
                          <>
                            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                              <path d="M13 4L6 12L3 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Copied
                          </>
                        ) : (
                          <>
                            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                              <rect x="4" y="4" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
                              <path d="M12 3V2a1 1 0 00-1-1H3a1 1 0 00-1 1v8a1 1 0 001 1h1" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
