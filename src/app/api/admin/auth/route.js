import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req) {
    const body = await req.json();
    const validPassword = process.env.ADMIN_PASSWORD;

    if (body.password === validPassword) {
        cookies().set('admin_token', 'valid', { secure: true, httpOnly: true });
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
}
