# 🎨 UI/UX 요구사항 문서 - AI 메모장

## 문서 개요

**목적**: AI 메모장의 정식 서비스화를 위한 UI/UX 디자인 가이드라인 및 요구사항 정의  
**대상**: Frontend 개발팀, 디자인팀, Product Owner  
**버전**: v1.0  
**작성일**: 2024년 12월

---

## 1. 디자인 철학

### 1.1 핵심 원칙
- **단순함 (Simplicity)**: 복잡하지 않고 직관적인 인터페이스
- **일관성 (Consistency)**: 모든 화면에서 통일된 디자인 언어
- **접근성 (Accessibility)**: 모든 사용자가 쉽게 이용할 수 있는 디자인
- **반응성 (Responsiveness)**: 모든 디바이스에서 최적화된 경험

### 1.2 브랜드 톤앤매너
- **전문적이면서 친근한**: 비즈니스 도구이지만 사용하기 쉬운
- **혁신적이면서 신뢰할 수 있는**: AI 기술의 신뢰성 강조
- **효율적이면서 아름다운**: 기능성과 미적 요소의 균형

---

## 2. 디자인 시스템

### 2.1 색상 팔레트

#### Primary Colors
```css
/* 메인 브랜드 컬러 */
--primary-50: #eff6ff;   /* 매우 연한 파란색 */
--primary-100: #dbeafe;  /* 연한 파란색 */
--primary-500: #3b82f6;  /* 메인 파란색 */
--primary-600: #2563eb;  /* 진한 파란색 */
--primary-700: #1d4ed8;  /* 더 진한 파란색 */
--primary-900: #1e3a8a;  /* 가장 진한 파란색 */
```

#### Secondary Colors
```css
/* 보조 색상 */
--secondary-50: #f0fdf4;   /* 연한 초록색 */
--secondary-500: #22c55e;  /* 메인 초록색 */
--secondary-600: #16a34a;  /* 진한 초록색 */

--accent-50: #faf5ff;      /* 연한 보라색 */
--accent-500: #a855f7;     /* 메인 보라색 */
--accent-600: #9333ea;     /* 진한 보라색 */
```

#### Neutral Colors
```css
/* 중성 색상 */
--gray-50: #f9fafb;    /* 배경색 */
--gray-100: #f3f4f6;   /* 연한 회색 */
--gray-200: #e5e7eb;   /* 테두리 색상 */
--gray-500: #6b7280;   /* 텍스트 보조 색상 */
--gray-700: #374151;   /* 텍스트 메인 색상 */
--gray-900: #111827;   /* 텍스트 진한 색상 */
```

#### Semantic Colors
```css
/* 의미적 색상 */
--success: #22c55e;    /* 성공 */
--warning: #f59e0b;    /* 경고 */
--error: #ef4444;      /* 오류 */
--info: #3b82f6;       /* 정보 */
```

### 2.2 타이포그래피

#### 폰트 패밀리
```css
/* 시스템 폰트 스택 */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
             'Helvetica Neue', Arial, sans-serif;

/* 코드 폰트 */
font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', 
             Consolas, 'Courier New', monospace;
```

#### 폰트 크기 스케일
```css
/* 반응형 폰트 크기 */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
--text-6xl: 3.75rem;   /* 60px */
```

#### 폰트 웨이트
```css
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-extrabold: 800;
```

### 2.3 간격 시스템

#### 8px 그리드 시스템
```css
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

### 2.4 그림자 시스템

```css
/* Elevation 레벨 */
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

### 2.5 둥근 모서리

```css
--radius-sm: 0.125rem;  /* 2px */
--radius: 0.25rem;      /* 4px */
--radius-md: 0.375rem;  /* 6px */
--radius-lg: 0.5rem;    /* 8px */
--radius-xl: 0.75rem;   /* 12px */
--radius-2xl: 1rem;     /* 16px */
--radius-full: 9999px;  /* 완전한 원 */
```

---

## 3. 컴포넌트 가이드라인

### 3.1 버튼 (Button)

#### Primary Button
- **용도**: 주요 액션 (회원가입, 메모 저장)
- **스타일**: 파란색 배경, 흰색 텍스트
- **크기**: 높이 44px (터치 친화적)
- **상태**: Default, Hover, Active, Disabled

#### Secondary Button
- **용도**: 보조 액션 (취소, 뒤로가기)
- **스타일**: 투명 배경, 파란색 테두리
- **크기**: 높이 44px
- **상태**: Default, Hover, Active, Disabled

#### Ghost Button
- **용도**: 텍스트 링크 대체
- **스타일**: 투명 배경, 파란색 텍스트
- **크기**: 높이 32px
- **상태**: Default, Hover, Active

### 3.2 입력 필드 (Input)

#### 텍스트 입력
- **스타일**: 흰색 배경, 회색 테두리
- **포커스**: 파란색 테두리, 그림자 효과
- **에러**: 빨간색 테두리, 에러 메시지 표시
- **크기**: 높이 44px

#### 텍스트 영역
- **스타일**: 텍스트 입력과 동일
- **크기**: 최소 높이 120px, 리사이즈 가능
- **자동 높이 조절**: 내용에 따라 동적 조절

### 3.3 카드 (Card)

#### 기본 카드
- **스타일**: 흰색 배경, 연한 그림자
- **패딩**: 24px
- **둥근 모서리**: 8px
- **호버**: 그림자 강화

#### 기능 카드
- **스타일**: 색상별 배경 (파란색, 초록색, 보라색)
- **패딩**: 32px
- **아이콘**: 48px 크기
- **호버**: 위로 이동 애니메이션

### 3.4 네비게이션 (Navigation)

#### 데스크톱 네비게이션
- **높이**: 64px
- **배경**: 투명 → 흰색 (스크롤 시)
- **그림자**: 스크롤 시 그림자 추가
- **메뉴**: 가로 배치, 16px 간격

#### 모바일 네비게이션
- **높이**: 56px
- **햄버거 메뉴**: 24px 크기
- **사이드 메뉴**: 전체 화면 너비, 슬라이드 애니메이션

---

## 4. 반응형 디자인

### 4.1 브레이크포인트

```css
/* 모바일 우선 접근 */
/* 기본: 320px+ (모바일) */
sm: 640px   /* 모바일 가로 */
md: 768px   /* 태블릿 */
lg: 1024px  /* 데스크톱 */
xl: 1280px  /* 대형 데스크톱 */
2xl: 1536px /* 초대형 데스크톱 */
```

### 4.2 레이아웃 규칙

#### 컨테이너
- **모바일**: 전체 너비, 16px 패딩
- **태블릿**: 최대 너비 768px, 중앙 정렬
- **데스크톱**: 최대 너비 1200px, 중앙 정렬

#### 그리드 시스템
- **모바일**: 1열
- **태블릿**: 2열
- **데스크톱**: 3열
- **간격**: 24px (모바일), 32px (데스크톱)

### 4.3 타이포그래피 반응형

```css
/* 헤드라인 크기 조정 */
h1: 2rem (모바일) → 3rem (데스크톱)
h2: 1.5rem (모바일) → 2rem (데스크톱)
h3: 1.25rem (모바일) → 1.5rem (데스크톱)
body: 1rem (모바일) → 1.125rem (데스크톱)
```

---

## 5. 애니메이션 가이드라인

### 5.1 전환 효과

#### 기본 전환
```css
transition: all 0.2s ease-in-out;
```

#### 빠른 전환 (버튼, 링크)
```css
transition: all 0.15s ease-in-out;
```

#### 느린 전환 (페이지 전환)
```css
transition: all 0.3s ease-in-out;
```

### 5.2 호버 효과

#### 버튼 호버
- **스케일**: 1.02배 확대
- **그림자**: 그림자 강화
- **색상**: 배경색 약간 진하게

#### 카드 호버
- **이동**: 위로 4px 이동
- **그림자**: 그림자 강화
- **전환**: 0.2초 부드러운 전환

### 5.3 페이지 전환

#### 페이드 인
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
```

#### 슬라이드 인
```css
@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
```

---

## 6. 접근성 요구사항

### 6.1 색상 대비

- **일반 텍스트**: 4.5:1 이상
- **큰 텍스트**: 3:1 이상
- **UI 요소**: 3:1 이상

### 6.2 터치 타겟

- **최소 크기**: 44px × 44px
- **권장 크기**: 48px × 48px
- **간격**: 최소 8px

### 6.3 키보드 네비게이션

- **포커스 표시**: 명확한 포커스 링
- **탭 순서**: 논리적인 순서
- **스킵 링크**: 메인 콘텐츠로 바로 이동

### 6.4 스크린 리더

- **시맨틱 HTML**: 적절한 태그 사용
- **ARIA 라벨**: 명확한 라벨 제공
- **대체 텍스트**: 모든 이미지에 alt 텍스트

---

## 7. 성능 요구사항

### 7.1 로딩 성능

- **LCP (Largest Contentful Paint)**: 2.5초 이하
- **FID (First Input Delay)**: 100ms 이하
- **CLS (Cumulative Layout Shift)**: 0.1 이하

### 7.2 번들 크기

- **초기 번들**: 100KB 이하
- **이미지**: WebP 형식, 적절한 압축
- **폰트**: 시스템 폰트 우선 사용

### 7.3 애니메이션 성능

- **60fps**: 모든 애니메이션 유지
- **GPU 가속**: transform, opacity 속성 사용
- **모바일 최적화**: 복잡한 애니메이션 제한

---

## 8. 다크모드 지원

### 8.1 색상 매핑

```css
/* 라이트 모드 */
--bg-primary: #ffffff;
--text-primary: #111827;
--border-primary: #e5e7eb;

/* 다크 모드 */
--bg-primary: #111827;
--text-primary: #f9fafb;
--border-primary: #374151;
```

### 8.2 구현 방식

- **CSS 변수**: 색상 값만 변경
- **시스템 설정**: 사용자 시스템 설정 따름
- **토글 기능**: 수동 다크모드 전환 (향후)

---

## 9. 브라우저 지원

### 9.1 지원 브라우저

- **Chrome**: 최신 2개 버전
- **Firefox**: 최신 2개 버전
- **Safari**: 최신 2개 버전
- **Edge**: 최신 2개 버전

### 9.2 모바일 브라우저

- **iOS Safari**: iOS 14+
- **Chrome Mobile**: 최신 버전
- **Samsung Internet**: 최신 버전

---

## 10. 구현 가이드라인

### 10.1 컴포넌트 개발

1. **재사용성**: 다른 프로젝트에서도 사용 가능한 컴포넌트
2. **확장성**: props를 통한 유연한 커스터마이징
3. **접근성**: WCAG 2.1 AA 기준 준수
4. **성능**: 불필요한 리렌더링 방지

### 10.2 스타일링 규칙

1. **Tailwind CSS**: 유틸리티 클래스 우선 사용
2. **CSS 변수**: 색상, 간격 등은 CSS 변수로 관리
3. **모바일 우선**: Mobile-first 접근 방식
4. **일관성**: 디자인 시스템 가이드라인 준수

### 10.3 테스트 요구사항

1. **시각적 테스트**: 다양한 화면 크기에서 검증
2. **접근성 테스트**: 스크린 리더, 키보드 네비게이션
3. **성능 테스트**: Core Web Vitals 지표 측정
4. **크로스 브라우저**: 지원 브라우저에서 테스트

---

## 관련 문서

- [Epic 7: 메인 페이지 정식 서비스화](./epics/epic-7-main-page-service.md)
- [Story 7.1: 랜딩 페이지 Hero 섹션](./stories/7.1.story.md)
- [Story 7.2: 기능 소개 섹션](./stories/7.2.story.md)
- [Story 7.3: 반응형 디자인 및 네비게이션](./stories/7.3.story.md)
- [아키텍처 문서](./architecture.md)
