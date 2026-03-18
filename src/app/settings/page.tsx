import { Settings } from 'lucide-react';
import { PromptEditor } from '@/components/features/PromptEditor';

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
          <Settings className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">프롬프트 설정</h1>
          <p className="text-white/50 mt-1">AI 제안서 생성에 사용되는 프롬프트를 관리합니다</p>
        </div>
      </div>

      <div className="glass rounded-2xl p-6">
        <PromptEditor />
      </div>
    </div>
  );
}
