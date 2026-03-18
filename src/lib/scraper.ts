import * as cheerio from 'cheerio';

export async function scrapeUrl(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; AIProposalBot/1.0)',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // 불필요한 요소 제거
  $('script, style, nav, footer, header, iframe, noscript').remove();

  // 메인 콘텐츠 추출
  const title = $('title').text().trim();
  const metaDescription = $('meta[name="description"]').attr('content') || '';

  // 본문 텍스트 추출
  const bodyText = $('body')
    .find('h1, h2, h3, h4, h5, h6, p, li, td, th, blockquote, pre, article')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(text => text.length > 0)
    .join('\n');

  // 최대 길이 제한 (토큰 절약)
  const maxLength = 8000;
  const content = bodyText.length > maxLength
    ? bodyText.substring(0, maxLength) + '...'
    : bodyText;

  return `제목: ${title}\n설명: ${metaDescription}\n\n본문:\n${content}`;
}
