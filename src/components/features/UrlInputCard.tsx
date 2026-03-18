'use client';

import { useState } from 'react';
import { Globe, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getSessionId } from '@/lib/session';
import type { Proposal } from '@/types';

interface UrlInputCardProps {
  onGenerated: (proposal: Proposal) => void;
}

export function UrlInputCard({ onGenerated }: UrlInputCardProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/proposals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          session_id: getSessionId(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '제안서 생성에 실패했습니다.');
      }

      onGenerated(data.proposal);
      setUrl('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-2xl p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
          <Globe className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">제안서 생성</h2>
          <p className="text-sm text-white/50">URL을 입력하면 AI가 제안서를 만들어 드립니다</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <Input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            className="flex-1 border-white/10 bg-white/5 text-white placeholder:text-white/30 focus-visible:ring-white/20"
          />
          <Button
            type="submit"
            disabled={loading || !url.trim()}
            className="bg-white/10 text-white hover:bg-white/20 disabled:opacity-30"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}

        {loading && (
          <div className="flex items-center gap-3 rounded-lg bg-white/5 px-4 py-3">
            <Loader2 className="h-4 w-4 animate-spin text-white/60" />
            <p className="text-sm text-white/60">
              웹페이지를 분석하고 제안서를 생성하고 있습니다...
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
