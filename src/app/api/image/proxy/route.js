import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'url query required' }, { status: 400 });
    }

    // Only allow a small set of hosts for safety.
    // Vercel Blob files use generated subdomains under these suffixes.
    const allowedHosts = ['raw.githubusercontent.com', 'i.imgur.com'];
    const parsed = new URL(url);
    const isVercelBlobHost = parsed.hostname.endsWith('.public.blob.vercel-storage.com');
    const isPrivateVercelBlobHost = parsed.hostname.endsWith('.private.blob.vercel-storage.com');

    if (!allowedHosts.includes(parsed.hostname) && !isVercelBlobHost && !isPrivateVercelBlobHost) {
      return NextResponse.json({ error: 'host not allowed' }, { status: 403 });
    }

    if (isPrivateVercelBlobHost && !process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: 'blob token required' }, { status: 500 });
    }

    const res = await fetch(url, {
      cache: 'no-store',
      headers: isPrivateVercelBlobHost
        ? { Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}` }
        : undefined,
    });
    if (!res.ok) {
      return NextResponse.json({ error: 'failed to fetch image', status: res.status }, { status: 502 });
    }

    const contentType = res.headers.get('content-type') || 'application/octet-stream';

    if (!contentType.startsWith('image/')) {
      return NextResponse.json(
        { error: 'upstream did not return an image', contentType },
        { status: 502 }
      );
    }

    const body = await res.arrayBuffer();

    return new NextResponse(Buffer.from(body), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store'
      }
    });
  } catch (err) {
    console.error('image proxy error', err);
    return NextResponse.json({ error: 'internal error' }, { status: 500 });
  }
}
