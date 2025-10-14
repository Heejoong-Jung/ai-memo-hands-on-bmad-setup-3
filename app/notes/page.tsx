// app/notes/page.tsx
// 노트 목록 페이지 - 사용자의 모든 노트 표시 (페이지네이션 지원)
// 인증된 사용자의 노트 목록을 카드 형태로 표시하고 빈 상태 처리
// 관련 파일: lib/db/notes.ts, app/notes/actions.ts, app/notes/new/page.tsx

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getNotesAction } from './actions';

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function NotesPage(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  
  // 인증 확인
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // 페이지 번호 추출 (기본값: 1)
  const currentPage = Number(searchParams.page) || 1;
  const pageSize = 20;

  // 노트 목록 조회
  const { notes, total, error } = await getNotesAction(currentPage, pageSize);

  // 페이지네이션 계산
  const totalPages = Math.ceil(total / pageSize);
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">내 노트</h1>
          <p className="text-gray-600 mt-1">
            총 {total}개의 노트
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/notes/trash">
            <Button variant="outline" size="lg">
              🗑️ 휴지통
            </Button>
          </Link>
          <Link href="/notes/new">
            <Button size="lg">+ 새 노트 작성</Button>
          </Link>
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* 노트 목록 또는 빈 상태 */}
      {notes.length === 0 ? (
        // 빈 상태 UI
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-semibold mb-2">
              아직 작성된 노트가 없습니다
            </h2>
            <p className="text-gray-600 mb-6">
              첫 번째 노트를 작성하고 아이디어를 기록해보세요.
            </p>
            <Link href="/notes/new">
              <Button size="lg">+ 새 노트 작성하기</Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* 노트 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {notes.map((note) => {
              // 본문 미리보기 (첫 100자)
              const preview =
                note.content.length > 100
                  ? note.content.slice(0, 100) + '...'
                  : note.content;

              // 날짜 포맷팅
              const createdDate = new Date(note.createdAt!).toLocaleDateString(
                'ko-KR',
                {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                }
              );

              return (
                <Link
                  key={note.id}
                  href={`/notes/${note.id}`}
                  className="block transition-transform hover:scale-[1.02]"
                >
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <CardTitle className="line-clamp-2 text-xl">
                        {note.title}
                      </CardTitle>
                      <p className="text-sm text-gray-500">{createdDate}</p>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 line-clamp-3 whitespace-pre-wrap">
                        {preview}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* 페이지네이션 UI (20개 초과 시에만 표시) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {/* 이전 페이지 버튼 */}
              {hasPrevPage ? (
                <Link href={`/notes?page=${currentPage - 1}`}>
                  <Button variant="outline">이전</Button>
                </Link>
              ) : (
                <Button variant="outline" disabled>
                  이전
                </Button>
              )}

              {/* 페이지 정보 */}
              <span className="px-4 py-2 text-sm">
                {currentPage} / {totalPages}
              </span>

              {/* 다음 페이지 버튼 */}
              {hasNextPage ? (
                <Link href={`/notes?page=${currentPage + 1}`}>
                  <Button variant="outline">다음</Button>
                </Link>
              ) : (
                <Button variant="outline" disabled>
                  다음
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

