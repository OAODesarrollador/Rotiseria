import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { orders, orderPayments } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const STATUS_MAP = {
    approved: 'pago_confirmado',
    pending: 'pendiente_pago',
    in_process: 'pendiente_pago',
    rejected: 'cancelado',
    cancelled: 'cancelado',
};

function getMappedStatus(mpStatus) {
    return STATUS_MAP[mpStatus] || null;
}

export async function GET(request, { params }) {
    try {
        const paymentId = params?.paymentId;

        if (!paymentId) {
            return NextResponse.json({ error: 'paymentId is required' }, { status: 400 });
        }

        if (!process.env.MP_ACCESS_TOKEN) {
            return NextResponse.json({ error: 'MP_ACCESS_TOKEN is not configured' }, { status: 500 });
        }

        const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
        });

        const mpData = await mpResponse.json().catch(() => null);

        if (!mpResponse.ok) {
            return NextResponse.json({ error: 'Mercado Pago error', detail: mpData }, { status: 502 });
        }

        const orderId = mpData.external_reference;
        const now = new Date().toISOString();

        if (orderId) {
            await db.insert(orderPayments).values({
                paymentId: String(mpData.id),
                orderId,
                status: mpData.status,
                statusDetail: mpData.status_detail,
                paymentMethodId: mpData.payment_method_id,
                amount: mpData.transaction_amount ? Number(mpData.transaction_amount) : null,
                createdAt: now,
                updatedAt: now,
            }).onConflictDoUpdate({
                target: orderPayments.paymentId,
                set: {
                    status: mpData.status,
                    statusDetail: mpData.status_detail,
                    paymentMethodId: mpData.payment_method_id,
                    amount: mpData.transaction_amount ? Number(mpData.transaction_amount) : null,
                    updatedAt: now,
                },
            });

            const mappedStatus = getMappedStatus(mpData.status);
            if (mappedStatus) {
                const orderRows = await db.select().from(orders).where(eq(orders.id, orderId));
                const order = orderRows[0];

                if (order && !(order.status === 'pago_confirmado' && mappedStatus !== 'pago_confirmado')) {
                    await db.update(orders).set({ status: mappedStatus }).where(eq(orders.id, orderId));
                }
            }
        }

        return NextResponse.json({
            paymentId: String(mpData.id),
            status: mpData.status,
            status_detail: mpData.status_detail,
            external_reference: mpData.external_reference || null,
        }, { status: 200 });
    } catch (error) {
        console.error('MP payment status error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
