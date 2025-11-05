import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Profile from '@/components/protected/profile/Profile';
import { StaffResponse } from '@/types/staff';

/**
 * スタッフ情報を取得する
 * Cookieからセッション情報を取得
 */
async function getStaffInfo(): Promise<StaffResponse | null> {
  try {
    const cookieStore = await cookies();
    const accessTokenCookie = cookieStore.get('access_token');

    if (!accessTokenCookie) {
      return null;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/api/v1/staffs/me`, {
      headers: {
        'Cookie': `access_token=${accessTokenCookie.value}`,
      },
      credentials: 'include',
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('Failed to fetch staff info:', response.status);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching staff info:', error);
    return null;
  }
}

export default async function ProfilePage() {
  const staff = await getStaffInfo();

  if (!staff) {
    redirect('/auth/login');
  }

  return <Profile staff={staff} />;
}
