export type ReportStatus = 'diterima' | 'dalam_review' | 'diproses' | 'selesai';

export interface Counselor {
  id: string;
  name: string;
  title: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface Report {
  id: string;
  report_code: string;
  access_code_hash: string;
  is_anonymous: boolean;
  reporter_name?: string | null;
  reporter_nim?: string | null;
  study_program: string;
  case_types: string[];
  description: string;
  incident_location: string;
  incident_time: string;
  status: ReportStatus;
  assigned_counselor_id?: string | null;
  counselor_recommendation?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ReportAttachment {
  id: string;
  report_id: string;
  storage_path: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

export interface ReportTimeline {
  id: string;
  report_id: string;
  status: ReportStatus;
  note: string;
  created_at: string;
  created_by?: string | null;
}

export interface Meeting {
  id: string;
  report_id: string;
  counselor_id?: string | null;
  scheduled_at: string;
  notes?: string | null;
  created_by?: string | null;
  created_at: string;
}

export interface ChatSession {
  id: string;
  report_id?: string | null;
  is_escalated: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  sender: 'user' | 'konselor' | 'system';
  body: string;
  created_at: string;
}

export interface MediationRequest {
  id: string;
  report_id?: string | null;
  service_type: string;
  message: string;
  status: string;
  created_at: string;
}

export interface TrackReportResult {
  id: string;
  report_code: string;
  status: ReportStatus;
  is_anonymous: boolean;
  study_program: string;
  case_types: string[];
  incident_location: string;
  incident_time: string;
  counselor_recommendation?: string | null;
  counselor_name?: string | null;
  counselor_title?: string | null;
  created_at: string;
  timeline: ReportTimeline[];
}

export interface SubmitReportInput {
  is_anonymous: boolean;
  reporter_name?: string;
  reporter_nim?: string;
  study_program: string;
  case_types: string[];
  description: string;
  incident_location: string;
  incident_time: string;
  attachments?: {
    file_name: string;
    mime_type: string;
    size_bytes: number;
    data_url?: string;
  }[];
}

export interface SubmitReportOutput {
  report_id: string;
  report_code: string;
  access_code: string;
  status: ReportStatus;
  created_at: string;
}
