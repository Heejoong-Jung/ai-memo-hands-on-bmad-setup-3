// app/notes/[id]/page.tsx
// 노트 상세 조회 페이지 (Story 2.3에서 완전 구현 예정)
// 특정 노트의 상세 내용 표시
// 관련 파일: lib/db/notes.ts, app/notes/page.tsx

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type Params = Promise<{ id: string }>;

export default async function NoteDetailPage(props: { params: Params }) {
  const params = await props.params;
  
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
      <div className="mb-6">
        <Link href="/notes">
          <Button variant="outline">← 목록으로</Button>
        </Link>
      </div>
      <div className="text-center py-12 text-gray-500">
        <p>노트 상세 페이지는 Story 2.3에서 구현 예정입니다.</p>
        <p className="mt-2">노트 ID: {params.id}</p>
      </div>
    </div>
  );
}

