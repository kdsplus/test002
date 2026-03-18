'use client';

import { useEffect, useState } from 'react';
import { Save, RotateCcw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { PromptTemplate } from '@/types';

export function PromptEditor() {
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [selected, setSelected] = useState<PromptTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const res = await fetch('/api/prompts');
      const data = await res.json();
      const promptList = data.prompts || [];
      setPrompts(promptList);
      if (promptList.length > 0) {
        setSelected(promptList[0]);
      }
    } catch {
      toast.error('프롬프트를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/prompts/${selected.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: selected.name,
          description: selected.description,
          prompt_text: selected.prompt_text,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('프롬프트가 저장되었습니다.');
    } catch {
      toast.error('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const original = prompts.find(p => p.id === selected?.id);
    if (original) setSelected({ ...original });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-white/40" />
      </div>
    );
  }

  if (!selected) {
    return (
      <div className="text-center py-12">
        <p className="text-white/40">등록된 프롬프트가 없습니다.</p>
        <p className="text-sm text-white/30 mt-1">
          Supabase에 기본 프롬프트를 추가해주세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 프롬프트 선택 */}
      {prompts.length > 1 && (
        <div className="flex gap-2 flex-wrap">
          {prompts.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
                selected.id === p.id
                  ? 'bg-white/15 text-white'
                  : 'bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60'
              }`}
            >
              {p.name}
              {p.is_default && (
                <span className="ml-1.5 text-xs text-white/30">(기본)</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 편집 폼 */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-white/70">프롬프트 이름</Label>
          <Input
            value={selected.name}
            onChange={(e) => setSelected({ ...selected, name: e.target.value })}
            className="border-white/10 bg-white/5 text-white placeholder:text-white/30"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white/70">프롬프트 내용</Label>
          <Textarea
            value={selected.prompt_text}
            onChange={(e) => setSelected({ ...selected, prompt_text: e.target.value })}
            rows={12}
            className="border-white/10 bg-white/5 text-white placeholder:text-white/30 font-mono text-sm"
          />
          <p className="text-xs text-white/30">
            AI에게 전달할 지시문입니다. 웹사이트 내용은 자동으로 추가됩니다.
          </p>
        </div>
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-white/10 text-white hover:bg-white/20"
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          저장
        </Button>
        <Button
          variant="ghost"
          onClick={handleReset}
          className="text-white/50 hover:bg-white/10 hover:text-white"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          되돌리기
        </Button>
      </div>
    </div>
  );
}
