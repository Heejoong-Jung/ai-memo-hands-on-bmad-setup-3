// scripts/test-gemini-connection.ts
// Gemini API 연결 테스트 스크립트
// API 키 설정이 올바른지 검증하는 스크립트
// 실행: pnpm test:gemini

// .env.local 파일 로드
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

import { testGeminiConnection } from '../lib/ai/gemini';

async function main() {
  console.log('🔄 Gemini API 연결 테스트 시작...\n');

  try {
    const isConnected = await testGeminiConnection();

    if (isConnected) {
      console.log('✅ Gemini API 연결 성공!');
      console.log('   API 키가 올바르게 설정되었습니다.\n');
      process.exit(0);
    } else {
      console.error('❌ Gemini API 연결 실패');
      console.error('   API 키를 확인해주세요.\n');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Gemini API 연결 테스트 중 오류 발생:');
    console.error(`   ${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}

main();

