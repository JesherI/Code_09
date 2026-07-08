'use client';

import { ThemeContextProvider } from '@/lib/theme-context';

export function Providers({ children }: { children: React.ReactNode }) {
	return <ThemeContextProvider>{children}</ThemeContextProvider>;
}
