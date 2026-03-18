# AI 제안서 생성기 - 기획서

> **프로젝트명**: AI 제안서 생성기
> **작성일**: 2026-03-18
> **버전**: 1.0

---

## 1. 프로젝트 개요

### 1.1 목적
URL을 입력하면 AI가 해당 웹페이지 내용을 분석하여 원하는 양식의 제안서를 자동으로 생성하는 웹 애플리케이션.

### 1.2 핵심 가치
- **시간 절약**: 수작업 제안서 작성 시간 대폭 단축
- **일관성**: AI 기반 일관된 품질의 제안서 생성
- **커스터마이징**: 프롬프트 수정을 통한 양식 자유 조정
- **접근성**: 회원가입 없이 바로 사용 가능

### 1.3 프로젝트 범위 (MVP)
- 과도한 기능 배제, 핵심 기능에 집중
- 순차적 구현으로 안정성 확보

---

## 2. 핵심 기능 정의

### 2.1 필수 기능
| 기능 | 설명 |
|------|------|
| URL 입력 → 제안서 생성 | URL을 입력하면 웹페이지 내용을 크롤링/분석하여 AI가 제안서 생성 |
| 프롬프트 관리 | 기본 AI 프롬프트 조회 및 수정, 수정된 프롬프트로 재생성 |
| 생성 결과 관리 | 생성된 제안서 목록 조회, 상세 보기, 다운로드(MD) |

### 2.2 제외 기능
- 회원 가입/로그인
- 결제 시스템
- 협업 기능
- 복잡한 템플릿 에디터

---

## 3. 기술 스택

### 3.1 Frontend
| 항목 | 기술 |
|------|------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui (Glassmorphism 커스터마이징) |
| Form | React Hook Form + Zod |

### 3.2 Backend
| 항목 | 기술 |
|------|------|
| Runtime | Next.js API Routes |
| AI API | OpenRouter API (Claude Opus 4.6) |
| Database | Supabase (PostgreSQL) |
| 인증 | 없음 (익명 세션 기반) |

### 3.3 배포
| 항목 | 기술 |
|------|------|
| Hosting | Vercel |
| CI/CD | Vercel 자동 배포 |

---

## 4. 화면 구성

### 4.1 페이지 구조
```
/                    → 메인 페이지 (URL 입력 & 제안서 생성)
/proposals           → 제안서 목록
/proposals/[id]      → 제안서 상세 보기
/settings            → 프롬프트 설정
```

### 4.2 레이아웃
```
┌──────────────────────────────────────────┐
│            Header (로고, 타이틀)           │
├────────┬─────────────────────────────────┤
│        │                                 │
│  Side  │       Main Content Area         │
│  bar   │                                 │
│        │   - URL 입력 카드               │
│  Nav   │   - 생성된 제안서 카드           │
│        │   - 최근 제안서 목록             │
│        │                                 │
└────────┴─────────────────────────────────┘
```

### 4.3 컴포넌트 구조
```
App
├── Layout
│   ├── Sidebar (네비게이션)
│   └── MainContent
│
├── Pages
│   ├── HomePage
│   │   ├── UrlInputCard
│   │   ├── GeneratedProposalCard
│   │   └── RecentProposalsList
│   ├── ProposalsPage
│   │   └── ProposalsTable
│   ├── ProposalDetailPage
│   │   ├── ProposalContent
│   │   └── ProposalActions
│   └── SettingsPage
│       └── PromptEditor
│
└── Shared (Card, Button, Input, Loading, Toast)
```

---

## 5. 데이터 모델 (Supabase)

### 5.1 proposals 테이블
```sql
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(255) NOT NULL,
  source_url TEXT NOT NULL,
  title VARCHAR(500),
  content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'completed',
  prompt_used TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_proposals_session_id ON proposals(session_id);
CREATE INDEX idx_proposals_created_at ON proposals(created_at DESC);
```

### 5.2 prompt_templates 테이블
```sql
CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  prompt_text TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 6. API 설계

### 6.1 API 엔드포인트
| Method | Path | 설명 |
|--------|------|------|
| POST | /api/proposals/generate | URL로 제안서 생성 |
| GET | /api/proposals | 제안서 목록 조회 |
| GET | /api/proposals/[id] | 제안서 상세 조회 |
| DELETE | /api/proposals/[id] | 제안서 삭제 |
| GET | /api/prompts | 프롬프트 목록 조회 |
| PUT | /api/prompts/[id] | 프롬프트 수정 |

### 6.2 제안서 생성 흐름
```
1. URL 입력
   ↓
2. 웹페이지 내용 추출 (Cheerio)
   ↓
3. 추출 내용 + 프롬프트 → OpenRouter API (Opus 4.6)
   ↓
4. AI 응답 수신
   ↓
5. Supabase에 결과 저장
   ↓
6. 클라이언트에 결과 반환
```

### 6.3 OpenRouter API 연동
```typescript
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'anthropic/claude-opus-4-6',
    messages: [
      {
        role: 'user',
        content: `${promptTemplate}\n\n웹사이트 내용:\n${scrapedContent}`
      }
    ],
    max_tokens: 4000,
  })
});
```

---

## 7. 디자인 가이드라인

### 7.1 디자인 컨셉
**Glassmorphism + Monochrome** (다크 테마)

참고 이미지의 깔끔한 대시보드 레이아웃을 기반으로, 유리 효과와 모노크롬 색상을 적용.

### 7.2 컬러 팔레트
```css
/* 배경 */
--background: #0a0a0a;
--surface: #1a1a1a;
--surface-light: #2a2a2a;

/* 텍스트 */
--text-primary: #ffffff;
--text-secondary: #a0a0a0;
--text-tertiary: #606060;

/* 강조 & 테두리 */
--accent: #ffffff;
--border: rgba(255, 255, 255, 0.1);
```

### 7.3 Glassmorphism 스타일
```css
.glass-card {
  background: rgba(26, 26, 26, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

### 7.4 타이포그래피
- 폰트: `Inter`, `Pretendard`, system-ui
- 간격: 4px 배수 (4, 8, 12, 16, 24, 32, 48)
- 카드 radius: 16px
- 버튼 radius: 8px

---

## 8. 구현 로드맵 (순차적)

### Phase 1: 프로젝트 기반 구축
- [ ] Next.js 프로젝트 초기화 (TypeScript)
- [ ] Tailwind CSS + shadcn/ui 설정
- [ ] Supabase 프로젝트 생성 및 연결
- [ ] 환경 변수 설정 (.env.local)
- [ ] 기본 레이아웃 구조 (Sidebar + Main)

### Phase 2: 핵심 UI 구현
- [ ] Glassmorphism 테마 적용
- [ ] Sidebar, MainContent 레이아웃
- [ ] 홈페이지 UI (URL 입력 폼)
- [ ] Glass 카드 컴포넌트

### Phase 3: 데이터베이스 설정
- [ ] Supabase 테이블 생성
- [ ] RLS 정책 설정
- [ ] 기본 프롬프트 데이터 삽입
- [ ] Supabase 클라이언트 설정

### Phase 4: AI 제안서 생성 기능
- [ ] URL 스크래핑 API
- [ ] OpenRouter API 연동
- [ ] 제안서 생성 API
- [ ] 생성 상태 표시 (로딩/성공/실패)
- [ ] Markdown 렌더링

### Phase 5: 제안서 관리
- [ ] 제안서 목록 페이지
- [ ] 제안서 상세 페이지
- [ ] 제안서 삭제, 다운로드

### Phase 6: 프롬프트 관리
- [ ] 프롬프트 설정 페이지
- [ ] 프롬프트 수정 기능

### Phase 7: 세션 관리
- [ ] 익명 세션 ID (localStorage)
- [ ] 세션별 제안서 필터링

### Phase 8: 테스트 및 최적화
- [ ] 기능 테스트
- [ ] 반응형 디자인
- [ ] 에러 처리 개선

### Phase 9: 배포
- [ ] Vercel 배포
- [ ] 환경 변수 설정
- [ ] 배포 후 테스트

---

## 9. 배포 전략 (Vercel)

### 9.1 환경 변수
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENROUTER_API_KEY=your_openrouter_api_key
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

### 9.2 배포 프로세스
```
Git Push → GitHub → Vercel Auto Build → Deploy
```

---

## 10. 프로젝트 디렉토리 구조

```
test002/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── proposals/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── settings/page.tsx
│   │   └── api/
│   │       ├── proposals/
│   │       │   ├── generate/route.ts
│   │       │   └── [id]/route.ts
│   │       ├── prompts/route.ts
│   │       └── scrape/route.ts
│   ├── components/
│   │   ├── layout/ (Sidebar, MainContent)
│   │   ├── ui/ (shadcn 컴포넌트)
│   │   └── features/ (UrlInputCard, ProposalCard 등)
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── openrouter.ts
│   │   ├── scraper.ts
│   │   └── session.ts
│   ├── types/index.ts
│   └── styles/globals.css
├── docs/
│   └── plan01.md
├── .env.local
├── package.json
├── tailwind.config.ts
└── next.config.js
```

---

## 11. 리스크 및 대응

| 리스크 | 대응 방안 |
|--------|----------|
| OpenRouter API 비용 | 사용량 모니터링, 토큰 제한 설정 |
| 웹 스크래핑 차단 | 직접 텍스트 입력 옵션 제공 |
| Supabase 무료 플랜 제한 | 사용량 확인, 필요시 유료 전환 |
| API 키 노출 | 서버 사이드 전용, 환경 변수 관리 |

---

## 12. 성공 기준 (MVP)

- [ ] URL 입력 후 제안서 정상 생성
- [ ] 프롬프트 수정 후 반영
- [ ] 생성된 제안서 저장/조회/삭제
- [ ] Vercel 배포 완료 및 공개 URL 접근 가능
- [ ] Glassmorphism + Monochrome 디자인 적용
- [ ] 모바일/데스크톱 반응형 지원
