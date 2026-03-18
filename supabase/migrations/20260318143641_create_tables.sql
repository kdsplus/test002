-- proposals 테이블
CREATE TABLE proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) NOT NULL,
  source_url TEXT NOT NULL,
  title VARCHAR(500),
  content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'completed',
  prompt_used TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_proposals_session_id ON proposals(session_id);
CREATE INDEX idx_proposals_created_at ON proposals(created_at DESC);

-- RLS 활성화
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to proposals" ON proposals
  FOR ALL USING (true) WITH CHECK (true);

-- prompt_templates 테이블
CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  prompt_text TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all access to prompt_templates" ON prompt_templates
  FOR ALL USING (true) WITH CHECK (true);

-- 기본 프롬프트 삽입
INSERT INTO prompt_templates (name, description, prompt_text, is_default) VALUES (
  '기본 제안서 템플릿',
  '일반적인 비즈니스 제안서 형식으로 생성합니다.',
  '당신은 전문 비즈니스 컨설턴트입니다. 아래 웹사이트의 내용을 분석하여 전문적인 제안서를 작성해주세요.

제안서는 다음 구조를 따라주세요:
1. 프로젝트 개요
2. 현황 분석
3. 제안 내용
4. 기대 효과
5. 실행 계획
6. 예산 및 일정

마크다운 형식으로 작성하고, 전문적이고 설득력 있는 톤을 유지해주세요.',
  true
);
