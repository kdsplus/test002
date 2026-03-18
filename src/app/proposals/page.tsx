'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileText, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getSessionId } from '@/lib/session';
import type { Proposal } from '@/types';

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProposals = async () => {
      try {
        const sessionId = getSessionId();
        if (!sessionId) return;
        const res = await fetch(`/api/proposals?session_id=${sessionId}`);
        const data = await res.json();
        setProposals(data.proposals || []);
      } catch {
        console.error('Failed to fetch');
      } finally {
        setLoading(false);
      }
    };
    fetchProposals();
  }, []);

  const handleDelete = async (id: string) => {
    await fetch(`/api/proposals/${id}`, { method: 'DELETE' });
    setProposals(prev => prev.filter(p => p.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">제안서 목록</h1>
        <p className="text-white/50 mt-1">생성된 모든 제안서를 확인하세요</p>
      </div>

      {proposals.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-white/20 mb-4" />
          <p className="text-white/40">아직 생성된 제안서가 없습니다</p>
          <Link href="/">
            <Button className="mt-4 bg-white/10 text-white hover:bg-white/20">
              첫 제안서 만들기
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {proposals.map((proposal) => (
            <div
              key={proposal.id}
              className="glass group rounded-xl p-5 transition-colors hover:bg-white/[0.08]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="truncate text-base font-medium text-white">
                      {proposal.title || '제목 없음'}
                    </h3>
                    <Badge variant="secondary" className="bg-white/10 text-white/60 text-xs">
                      {proposal.status === 'completed' ? '완료' : '생성중'}
                    </Badge>
                  </div>
                  <p className="truncate text-sm text-white/40">{proposal.source_url}</p>
                  <p className="text-xs text-white/30 mt-1">
                    {new Date(proposal.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="flex gap-1">
                  <Link href={`/proposals/${proposal.id}`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white/30 hover:bg-white/10 hover:text-white"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(proposal.id)}
                    className="text-white/30 hover:bg-white/10 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
