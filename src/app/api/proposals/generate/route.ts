import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { generateWithAI } from '@/lib/openrouter';
import { scrapeUrl } from '@/lib/scraper';

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase가 설정되지 않았습니다. .env.local 파일을 확인해주세요.' },
        { status: 503 }
      );
    }

    const { url, session_id, prompt_id, custom_prompt } = await request.json();

    if (!url || !session_id) {
      return NextResponse.json({ error: 'URL과 세션 ID가 필요합니다.' }, { status: 400 });
    }

    // 1. URL 스크래핑
    let scrapedContent: string;
    try {
      scrapedContent = await scrapeUrl(url);
    } catch {
      return NextResponse.json({ error: '해당 URL의 내용을 가져올 수 없습니다.' }, { status: 400 });
    }

    // 2. 프롬프트 가져오기
    let promptText = custom_prompt;
    if (!promptText && prompt_id) {
      const { data: prompt } = await supabase
        .from('prompt_templates')
        .select('prompt_text')
        .eq('id', prompt_id)
        .single();
      promptText = prompt?.prompt_text;
    }
    if (!promptText) {
      const { data: defaultPrompt } = await supabase
        .from('prompt_templates')
        .select('prompt_text')
        .eq('is_default', true)
        .single();
      promptText = defaultPrompt?.prompt_text || getDefaultPrompt();
    }

    // 3. AI 생성
    const fullPrompt = `${promptText}\n\n---\n\n웹사이트 내용:\n${scrapedContent}`;
    const generatedContent = await generateWithAI([
      { role: 'user', content: fullPrompt }
    ]);

    // 4. 제목 추출 (첫 번째 줄 또는 # 헤딩)
    const titleMatch = generatedContent.match(/^#\s+(.+)/m);
    const title = titleMatch ? titleMatch[1] : generatedContent.split('\n')[0].substring(0, 100);

    // 5. Supabase에 저장
    const { data: proposal, error } = await supabase
      .from('proposals')
      .insert({
        session_id,
        source_url: url,
        title,
        content: generatedContent,
        status: 'completed',
        prompt_used: promptText,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ proposal });
  } catch (error) {
    console.error('Generate error:', error);
    return NextResponse.json(
      { error: '제안서 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

function getDefaultPrompt(): string {
  return `당신은 전문 비즈니스 컨설턴트입니다. 아래 웹사이트의 내용을 분석하여 전문적인 제안서를 작성해주세요.

제안서는 다음 구조를 따라주세요:
1. 프로젝트 개요
2. 현황 분석
3. 제안 내용
4. 기대 효과
5. 실행 계획
6. 예산 및 일정

마크다운 형식으로 작성하고, 전문적이고 설득력 있는 톤을 유지해주세요.`;
}
