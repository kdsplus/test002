'use client';

import { FileText, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { Proposal } from '@/types';
import Link from 'next/link';

interface GeneratedProposalCardProps {
  proposal: Proposal;
}

export function GeneratedProposalCard({ proposal }: GeneratedProposalCardProps) {
  const handleDownload = () => {
    const blob = new Blob([proposal.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${proposal.title || 'proposal'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="glass rounded-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
            <FileText className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">
              {proposal.title || '생성된 제안서'}
            </h2>
            <p className="text-sm text-white/50">{proposal.source_url}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="text-white/50 hover:bg-white/10 hover:text-white"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Link href={`/proposals/${proposal.id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/50 hover:bg-white/10 hover:text-white"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="prose prose-invert prose-sm max-w-none pr-4">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{proposal.content}</ReactMarkdown>
        </div>
      </ScrollArea>
    </div>
  );
}
