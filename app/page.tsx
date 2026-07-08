'use client';

import { cn } from '@/lib/utils';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Home() {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!auth) return;
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) router.push('/dashboard');
      else setChecked(true);
    });
    return unsub;
  }, [router]);

  if (!checked) return null;

  return (
    <div className="relative z-10 flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-8 py-6">
        <Link href="/" className="flex items-center gap-3">
          <img
            src="/CODE_09-Transparente.svg"
            alt="logo"
            className="h-10 w-10"
          />
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-foreground px-5 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Sign In
          </Link>
        </nav>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute left-1/2 top-1/2 size-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full',
            'bg-[radial-gradient(ellipse_at_center,color-mix(in srgb,var(--foreground)_8%,transparent),transparent_60%)]',
            'blur-[60px]',
          )}
        />

        <div className="relative">
          <img
            src="/CODE_09-Transparente.svg"
            alt="logo"
            className="mx-auto mb-8 h-24 w-24 opacity-80"
          />
          <p className="mx-auto mb-10 max-w-md text-lg text-foreground/60">
            Store, visualize, and manage your prompts with a clean,
            minimal interface. Code and text, side by side.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-xl bg-foreground px-8 py-3 text-base font-medium text-background transition-all hover:gap-3 hover:opacity-90"
          >
            Get Started
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 12L10 8L6 4"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </div>
      </main>
    </div>
  );
}
