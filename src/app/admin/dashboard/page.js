import AdminProductList from './AdminProductList';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const revalidate = 0; // Always fresh data for admin

export default async function AdminDashboard() {
    const cookieStore = cookies();
    const token = cookieStore.get('admin_token');

    if (!token) {
        redirect('/admin');
    }

    return (
        <div style={{ paddingTop: '40px' }}>
            <AdminProductList />
        </div>
    );
}
