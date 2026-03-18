'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Download, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Proposal } from '@/types';

export default function ProposalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const res = await fetch(`/api/proposals/${params.id}`);
        const data = await res.json();
        setProposal(data.proposal);
      } catch {
        console.error('Failed to fetch');
      } finally {
        setLoading(false);
      }
    };
    fetchProposal();
  }, [params.id]);

  const handleDownload = () => {
    if (!proposal) return;
    const blob = new Blob([proposal.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${proposal.title || 'proposal'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async () => {
    if (!proposal) return;
    await fetch(`/api/proposals/${proposal.id}`, { method: 'DELETE' });
    router.push('/proposals');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-white/40" />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="py-20 text-center">
        <p className="text-white/40">제안서를 찾을 수 없습니다.</p>
        <Button
          onClick={() => router.push('/proposals')}
          className="mt-4 bg-white/10 text-white hover:bg-white/20"
        >
          목록으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-white/50 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-white">
              {proposal.title || '제목 없음'}
            </h1>
            <p className="text-sm text-white/40">{proposal.source_url}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="text-white/50 hover:bg-white/10 hover:text-white"
          >
            <Download className="mr-2 h-4 w-4" />
            다운로드
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-white/50 hover:bg-white/10 hover:text-red-400"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            삭제
          </Button>
        </div>
      </div>

      {/* 제안서 내용 */}
      <div className="glass rounded-2xl p-8">
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{proposal.content}</ReactMarkdown>
        </div>
      </div>

      {/* 메타 정보 */}
      <div className="glass rounded-xl p-4">
        <div className="flex flex-wrap gap-6 text-sm text-white/40">
          <div>
            <span className="text-white/30">생성일: </span>
            {new Date(proposal.created_at).toLocaleDateString('ko-KR', {
              year: 'numeric', month: 'long', day: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </div>
          <div>
            <span className="text-white/30">출처: </span>
            <a href={proposal.source_url} target="_blank" rel="noopener noreferrer" className="hover:text-white/60 underline">
              {proposal.source_url}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
