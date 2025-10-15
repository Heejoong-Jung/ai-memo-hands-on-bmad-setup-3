// scripts/test-supabase-connection.ts
// Supabase 연결 상태를 테스트하는 스크립트
// 환경 변수 및 DB 연결 확인
// 관련 파일: lib/supabase/server.ts, lib/db/client.ts

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testSupabaseConnection() {
  console.log('🔍 Supabase 연결 테스트 시작...\n');

  // 1. 환경 변수 확인
  console.log('📌 환경 변수 확인:');
  const envVars = {
    'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
    'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'DATABASE_URL': process.env.DATABASE_URL,
  };

  let allEnvVarsPresent = true;
  for (const [key, value] of Object.entries(envVars)) {
    if (!value) {
      console.log(`  ❌ ${key}: 설정되지 않음`);
      allEnvVarsPresent = false;
    } else {
      // 민감한 정보는 일부만 표시
      const maskedValue = key === 'DATABASE_URL' 
        ? value.replace(/:[^:@]+@/, ':****@')
        : value.substring(0, 20) + '...';
      console.log(`  ✅ ${key}: ${maskedValue}`);
    }
  }

  if (!allEnvVarsPresent) {
    console.log('\n❌ 일부 환경 변수가 누락되었습니다.');
    console.log('💡 .env.local 파일을 생성하고 필요한 환경 변수를 설정하세요.\n');
    return;
  }

  console.log('\n✅ 모든 환경 변수가 설정되었습니다.\n');

  // 2. Supabase Auth 연결 테스트
  console.log('📌 Supabase Auth API 연결 테스트:');
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log(`  ⚠️  세션 확인 중 에러: ${error.message}`);
    } else {
      console.log('  ✅ Supabase Auth API 연결 성공');
      console.log(`  📊 현재 세션: ${data.session ? '로그인됨' : '로그아웃됨'}`);
    }
  } catch (error) {
    console.log(`  ❌ Supabase Auth 연결 실패: ${error}`);
  }

  // 3. Database 연결 테스트 (Drizzle ORM)
  console.log('\n📌 Database 연결 테스트 (Drizzle ORM):');
  try {
    const postgres = (await import('postgres')).default;
    const sql = postgres(process.env.DATABASE_URL!);

    // 간단한 쿼리 실행
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    console.log('  ✅ Database 연결 성공');
    console.log(`  📊 PostgreSQL 버전: ${result[0].pg_version.split(' ')[0]} ${result[0].pg_version.split(' ')[1]}`);
    console.log(`  🕐 현재 시간: ${result[0].current_time}`);

    // 테이블 확인
    const tables = await sql`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `;
    
    if (tables.length > 0) {
      console.log(`  📋 데이터베이스 테이블 (${tables.length}개):`);
      tables.forEach(table => {
        console.log(`     - ${table.tablename}`);
      });
    } else {
      console.log('  ℹ️  아직 생성된 테이블이 없습니다.');
    }

    await sql.end();
  } catch (error: unknown) {
    console.log(`  ❌ Database 연결 실패: ${error instanceof Error ? error.message : String(error)}`);
  }

  console.log('\n✅ 테스트 완료!\n');
}

// 스크립트 실행
testSupabaseConnection().catch(console.error);

