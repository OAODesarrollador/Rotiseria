import { NextResponse } from 'next/server';
import { fetchAllCombos, createCombo, updateCombo, deleteCombo } from '@/lib/catalog';
import { isAdminAuthenticated } from '@/lib/auth/adminAuth';

/**
 * GET /api/admin/combos
 * Retorna lista de ofertas
 */
export async function GET() {
    if (!isAdminAuthenticated()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const allCombos = await fetchAllCombos();
        return NextResponse.json({ success: true, data: allCombos });
    } catch (error) {
        console.error("GET /api/admin/combos error:", error);
        return NextResponse.json({ error: 'Error al cargar ofertas' }, { status: 500 });
    }
}

/**
 * POST /api/admin/combos
 * Crear nueva oferta
 */
export async function POST(req) {
    if (!isAdminAuthenticated()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const result = await createCombo(body);
        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error("POST /api/admin/combos error:", error);
        return NextResponse.json(
            { error: error.message || 'Error al crear oferta' },
            { status: 400 }
        );
    }
}

/**
 * PATCH /api/admin/combos
 * Actualizar oferta existente
 */
export async function PATCH(req) {
    if (!isAdminAuthenticated()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: 'El ID de la oferta es requerido' }, { status: 400 });
        }

        const result = await updateCombo(id, updates);
        return NextResponse.json(result);
    } catch (error) {
        console.error("PATCH /api/admin/combos error:", error);
        return NextResponse.json(
            { error: error.message || 'Error al actualizar oferta' },
            { status: 400 }
        );
    }
}

/**
 * DELETE /api/admin/combos?id=<comboId>
 * Eliminar oferta
 */
export async function DELETE(req) {
    if (!isAdminAuthenticated()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'El ID de la oferta es requerido' }, { status: 400 });
        }

        const result = await deleteCombo(id);
        return NextResponse.json(result);
    } catch (error) {
        console.error("DELETE /api/admin/combos error:", error);
        return NextResponse.json(
            { error: error.message || 'Error al eliminar oferta' },
            { status: 400 }
        );
    }
}
