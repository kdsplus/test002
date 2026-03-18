'use client';

import { useState } from 'react';
import { UrlInputCard } from '@/components/features/UrlInputCard';
import { GeneratedProposalCard } from '@/components/features/GeneratedProposalCard';
import { RecentProposalsList } from '@/components/features/RecentProposalsList';
import type { Proposal } from '@/types';

export default function HomePage() {
  const [generatedProposal, setGeneratedProposal] = useState<Proposal | null>(null);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* 인사 헤더 */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold text-white">AI 제안서 생성기</h1>
        <p className="text-white/50 mt-1">URL을 입력하면 AI가 전문적인 제안서를 만들어 드립니다</p>
      </div>

      {/* URL 입력 */}
      <UrlInputCard onGenerated={setGeneratedProposal} />

      {/* 생성된 제안서 */}
      {generatedProposal && (
        <GeneratedProposalCard proposal={generatedProposal} />
      )}

      {/* 최근 제안서 목록 */}
      <RecentProposalsList />
    </div>
  );
}
