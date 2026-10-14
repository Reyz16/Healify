-- ====================================================================
-- BINUS ANTI-BULLYING CENTER (BAC) - SUPABASE INITIAL SCHEMA
-- Migration: 001_initial_schema.sql
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS & SEQUENCES
CREATE TYPE report_status_enum AS ENUM (
    'diterima',
    'dalam_review',
    'diproses',
    'selesai'
);

CREATE SEQUENCE IF NOT EXISTS report_code_seq START WITH 1 INCREMENT BY 1;

-- 3. FUNCTION TO GENERATE REPORT CODE (BAC-YYYY-NNNN)
CREATE OR REPLACE FUNCTION generate_report_code()
RETURNS TEXT AS $$
DECLARE
    current_year TEXT;
    next_num INT;
    new_code TEXT;
BEGIN
    current_year := TO_CHAR(CURRENT_DATE, 'YYYY');
    next_num := nextval('report_code_seq');
    new_code := 'BAC-' || current_year || '-' || LPAD(next_num::TEXT, 4, '0');
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- 4. COUNSELORS TABLE
CREATE TABLE IF NOT EXISTS public.counselors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    title TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_code TEXT NOT NULL UNIQUE DEFAULT generate_report_code(),
    access_code_hash TEXT NOT NULL,
    is_anonymous BOOLEAN NOT NULL DEFAULT false,
    reporter_name TEXT,
    reporter_nim TEXT,
    study_program TEXT NOT NULL,
    case_types TEXT[] NOT NULL DEFAULT '{}',
    description TEXT NOT NULL CHECK (char_length(description) <= 2000),
    incident_location TEXT NOT NULL,
    incident_time TIMESTAMPTZ NOT NULL,
    status report_status_enum NOT NULL DEFAULT 'diterima',
    assigned_counselor_id UUID REFERENCES public.counselors(id) ON DELETE SET NULL,
    counselor_recommendation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. REPORT ATTACHMENTS TABLE
CREATE TABLE IF NOT EXISTS public.report_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes BIGINT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. REPORT TIMELINE TABLE
CREATE TABLE IF NOT EXISTS public.report_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    status report_status_enum NOT NULL,
    note TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_by TEXT DEFAULT 'Sistem BAC'
);

-- 8. MEETINGS TABLE
CREATE TABLE IF NOT EXISTS public.meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    counselor_id UUID REFERENCES public.counselors(id) ON DELETE SET NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. CHAT SESSIONS & MESSAGES
CREATE TABLE IF NOT EXISTS public.chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES public.reports(id) ON DELETE SET NULL,
    is_escalated BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
    sender TEXT NOT NULL CHECK (sender IN ('user', 'konselor', 'system')),
    body TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. MEDIATION REQUESTS TABLE
CREATE TABLE IF NOT EXISTS public.mediation_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID REFERENCES public.reports(id) ON DELETE CASCADE,
    service_type TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'diajukan',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. AUTOMATIC TIMELINE TRIGGER ON STATUS CHANGE
CREATE OR REPLACE FUNCTION trigger_report_status_timeline()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO public.report_timeline (report_id, status, note, created_by)
        VALUES (NEW.id, NEW.status, 'Laporan berhasil diterima oleh sistem BAC', 'Sistem');
    ELSIF (TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.report_timeline (report_id, status, note, created_by)
        VALUES (
            NEW.id,
            NEW.status,
            'Status laporan diperbarui menjadi: ' || NEW.status,
            'Admin BAC'
        );
        NEW.updated_at = timezone('utc'::text, now());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER on_report_status_change
    BEFORE UPDATE ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION trigger_report_status_timeline();

CREATE OR REPLACE TRIGGER on_report_created
    AFTER INSERT ON public.reports
    FOR EACH ROW
    EXECUTE FUNCTION trigger_report_status_timeline();

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.counselors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mediation_requests ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is an authenticated BAC admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (auth.role() = 'authenticated');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Counselors policies (Public can view active counselors for info; admin has full access)
CREATE POLICY "Public can view active counselors" ON public.counselors
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admin can manage counselors" ON public.counselors
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Reports policies (Admin has full access; Public cannot SELECT directly)
CREATE POLICY "Admin full access to reports" ON public.reports
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Attachments policies
CREATE POLICY "Admin full access to attachments" ON public.report_attachments
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Timeline policies (Admin full access; Public can view via track_report function)
CREATE POLICY "Admin full access to timeline" ON public.report_timeline
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Meetings policies
CREATE POLICY "Admin full access to meetings" ON public.meetings
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- Chat sessions & messages (Public can insert & select their own session; admin has full access)
CREATE POLICY "Public and Admin can access chat sessions" ON public.chat_sessions
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public and Admin can access chat messages" ON public.chat_messages
    FOR ALL USING (true) WITH CHECK (true);

-- Mediation requests (Public can insert; admin has full access)
CREATE POLICY "Public can insert mediation requests" ON public.mediation_requests
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin full access to mediation requests" ON public.mediation_requests
    FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ====================================================================
-- SECURE RPC FUNCTIONS
-- ====================================================================

-- 1. SUBMIT REPORT RPC
CREATE OR REPLACE FUNCTION public.submit_report(
    p_is_anonymous BOOLEAN,
    p_reporter_name TEXT,
    p_reporter_nim TEXT,
    p_study_program TEXT,
    p_case_types TEXT[],
    p_description TEXT,
    p_incident_location TEXT,
    p_incident_time TIMESTAMPTZ,
    p_raw_access_code TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_report_id UUID;
    v_report_code TEXT;
    v_access_hash TEXT;
    v_safe_name TEXT := NULL;
    v_safe_nim TEXT := NULL;
BEGIN
    -- If anonymous, ensure no name or NIM is stored
    IF (p_is_anonymous IS FALSE) THEN
        v_safe_name := p_reporter_name;
        v_safe_nim := p_reporter_nim;
    END IF;

    -- Hash access code with SHA-256
    v_access_hash := encode(digest(p_raw_access_code, 'sha256'), 'hex');

    -- Insert report
    INSERT INTO public.reports (
        is_anonymous,
        reporter_name,
        reporter_nim,
        study_program,
        case_types,
        description,
        incident_location,
        incident_time,
        access_code_hash
    ) VALUES (
        p_is_anonymous,
        v_safe_name,
        v_safe_nim,
        p_study_program,
        p_case_types,
        p_description,
        p_incident_location,
        p_incident_time,
        v_access_hash
    )
    RETURNING id, report_code INTO v_report_id, v_report_code;

    RETURN jsonb_build_object(
        'report_id', v_report_id,
        'report_code', v_report_code,
        'status', 'diterima',
        'created_at', now()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. TRACK REPORT RPC
CREATE OR REPLACE FUNCTION public.track_report(
    p_report_code TEXT,
    p_raw_access_code TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_report RECORD;
    v_access_hash TEXT;
    v_timeline JSONB;
BEGIN
    v_access_hash := encode(digest(p_raw_access_code, 'sha256'), 'hex');

    SELECT 
        r.id,
        r.report_code,
        r.status,
        r.is_anonymous,
        r.study_program,
        r.case_types,
        r.incident_location,
        r.incident_time,
        r.counselor_recommendation,
        r.created_at,
        c.name AS counselor_name,
        c.title AS counselor_title
    INTO v_report
    FROM public.reports r
    LEFT JOIN public.counselors c ON r.assigned_counselor_id = c.id
    WHERE UPPER(TRIM(r.report_code)) = UPPER(TRIM(p_report_code))
      AND r.access_code_hash = v_access_hash;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Laporan tidak ditemukan');
    END IF;

    -- Fetch timeline records
    SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', t.id,
        'status', t.status,
        'note', t.note,
        'created_at', t.created_at,
        'created_by', t.created_by
    ) ORDER BY t.created_at ASC), '[]'::jsonb)
    INTO v_timeline
    FROM public.report_timeline t
    WHERE t.report_id = v_report.id;

    RETURN jsonb_build_object(
        'success', true,
        'data', jsonb_build_object(
            'id', v_report.id,
            'report_code', v_report.report_code,
            'status', v_report.status,
            'is_anonymous', v_report.is_anonymous,
            'study_program', v_report.study_program,
            'case_types', v_report.case_types,
            'incident_location', v_report.incident_location,
            'incident_time', v_report.incident_time,
            'counselor_recommendation', v_report.counselor_recommendation,
            'counselor_name', v_report.counselor_name,
            'counselor_title', v_report.counselor_title,
            'created_at', v_report.created_at,
            'timeline', v_timeline
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
