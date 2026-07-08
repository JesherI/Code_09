import { NextRequest, NextResponse } from 'next/server';

interface OgData {
  title: string;
  description: string;
  image: string;
  domain: string;
}

const META_REGEX = /<meta\s+(?:property|name)=["'](?:og:|twitter:)?(title|description|image)["']\s+content=["']([^"']+)["']/gi;

function parseMeta(html: string): Partial<OgData> {
  const result: Record<string, string> = {};
  let match: RegExpExecArray | null;
  while ((match = META_REGEX.exec(html)) !== null) {
    const key = match[1] as string;
    const value = match[2];
    if (!result[key]) result[key] = value;
  }
  return result as Partial<OgData>;
}

function extractTitle(html: string): string | null {
  const match = html.match(/<title>([^<]+)<\/title>/i);
  return match ? match[1].trim() : null;
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
  }

  // Basic URL validation
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
  }

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(5000),
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Code09Preview/1.0)' },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `Fetch failed: ${res.status}` }, { status: 502 });
    }

    const html = await res.text();
    const meta = parseMeta(html);
    const domain = new URL(url).hostname;

    const data: OgData = {
      title: meta.title || extractTitle(html) || domain,
      description: meta.description || '',
      image: meta.image || '',
      domain,
    };

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 502 },
    );
  }
}
