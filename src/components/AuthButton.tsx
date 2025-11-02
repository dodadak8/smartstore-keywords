/**
 * AuthButton 컴포넌트
 * - 로그인/로그아웃 버튼
 * - 모든 페이지에서 공통으로 사용
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function AuthButton() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
  };

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-white/80 text-sm hidden sm:inline">{user.email}</span>
        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg bg-red-500/80 text-white font-medium hover:bg-red-600 transition-all duration-200 text-sm"
        >
          로그아웃
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="px-4 py-2 rounded-lg bg-white/20 text-white font-medium hover:bg-white/30 transition-all duration-200 text-sm"
    >
      로그인
    </Link>
  );
}
