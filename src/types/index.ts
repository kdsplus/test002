export interface Proposal {
  id: string;
  session_id: string;
  source_url: string;
  title: string | null;
  content: string;
  status: 'generating' | 'completed' | 'failed';
  prompt_used: string | null;
  created_at: string;
  updated_at: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  description: string | null;
  prompt_text: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface GenerateRequest {
  url: string;
  prompt_id?: string;
  custom_prompt?: string;
}

export interface GenerateResponse {
  proposal: Proposal;
}
