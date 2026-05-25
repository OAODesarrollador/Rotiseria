import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { isAdminAuthenticated } from '@/lib/auth/adminAuth';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const sanitizeFileName = (name) => {
    const fallback = 'imagen';
    const clean = String(name || fallback)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9._-]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .toLowerCase();

    return clean || fallback;
};

export async function POST(req) {
    if (!isAdminAuthenticated()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        if (!process.env.BLOB_READ_WRITE_TOKEN) {
            return NextResponse.json(
                { error: 'Falta configurar BLOB_READ_WRITE_TOKEN' },
                { status: 500 }
            );
        }

        const formData = await req.formData();
        const file = formData.get('file');
        const folder = sanitizeFileName(formData.get('folder') || 'catalogo');

        if (!file || typeof file === 'string') {
            return NextResponse.json({ error: 'Archivo requerido' }, { status: 400 });
        }

        if (!ALLOWED_TYPES.has(file.type)) {
            return NextResponse.json(
                { error: 'Formato no permitido. Usá JPG, PNG, WebP o GIF.' },
                { status: 400 }
            );
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                { error: 'La imagen no puede superar 5MB.' },
                { status: 400 }
            );
        }

        const fileName = sanitizeFileName(file.name);
        const pathname = `${folder}/${Date.now()}-${fileName}`;
        const blob = await put(pathname, file, {
            access: 'private',
            addRandomSuffix: true,
            contentType: file.type,
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        return NextResponse.json({
            success: true,
            url: blob.url,
            pathname: blob.pathname,
        });
    } catch (error) {
        console.error('POST /api/admin/upload error:', error);
        const message = error?.message || 'No se pudo subir la imagen';
        return NextResponse.json(
            {
                error: message,
                details: process.env.NODE_ENV === 'production' ? undefined : error?.cause?.message,
            },
            { status: 500 }
        );
    }
}
