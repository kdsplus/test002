'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSessionId } from '@/lib/session';
import type { Proposal } from '@/types';

export function RecentProposalsList() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProposals = async () => {
    try {
      const sessionId = getSessionId();
      if (!sessionId) return;

      const res = await fetch(`/api/proposals?session_id=${sessionId}`);
      const data = await res.json();
      setProposals(data.proposals || []);
    } catch {
      console.error('Failed to fetch proposals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/proposals/${id}`, { method: 'DELETE' });
      setProposals(prev => prev.filter(p => p.id !== id));
    } catch {
      console.error('Failed to delete proposal');
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Clock className="h-5 w-5 text-white/50" />
          <h2 className="text-lg font-semibold text-white">최근 제안서</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-white/5" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <Clock className="h-5 w-5 text-white/50" />
        <h2 className="text-lg font-semibold text-white">최근 제안서</h2>
      </div>

      {proposals.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <FileText className="h-10 w-10 text-white/20 mb-3" />
          <p className="text-sm text-white/40">아직 생성된 제안서가 없습니다</p>
          <p className="text-xs text-white/30 mt-1">URL을 입력하여 첫 제안서를 만들어 보세요</p>
        </div>
      ) : (
        <div className="space-y-2">
          {proposals.slice(0, 5).map((proposal) => (
            <div
              key={proposal.id}
              className="group flex items-center justify-between rounded-lg bg-white/5 px-4 py-3 transition-colors hover:bg-white/10"
            >
              <Link href={`/proposals/${proposal.id}`} className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {proposal.title || '제목 없음'}
                </p>
                <p className="truncate text-xs text-white/40 mt-0.5">
                  {proposal.source_url}
                </p>
              </Link>
              <div className="flex items-center gap-2 ml-3">
                <span className="text-xs text-white/30">
                  {new Date(proposal.created_at).toLocaleDateString('ko-KR')}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(proposal.id)}
                  className="h-7 w-7 p-0 text-white/20 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/10 hover:text-red-400"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
