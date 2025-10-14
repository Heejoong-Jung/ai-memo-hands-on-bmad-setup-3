// app/notes/page.tsx
// 노트 목록 페이지 (임시 - Story 2.2에서 완전히 구현 예정)
// 인증된 사용자의 노트 목록 표시
// 관련 파일: lib/db/notes.ts, app/notes/new/page.tsx

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function NotesPage() {
  // 인증 확인
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">내 노트</h1>
        <Link href="/notes/new">
          <Button>새 노트 작성</Button>
        </Link>
      </div>
      <div className="text-center py-12 text-gray-500">
        <p>노트 목록은 Story 2.2에서 구현 예정입니다.</p>
        <p className="mt-2">노트 생성이 성공적으로 작동하는지 확인하기 위한 임시 페이지입니다.</p>
      </div>
    </div>
  );
}

