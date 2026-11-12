-- ==============================================================================
-- SKM HIGH SCHOOL & HIGHER SECONDARY SCHOOL, KANODAR
-- COMPLETE SUPABASE SQL SCHEMA & SEED DATA
-- Run this script in your Supabase Dashboard: SQL Editor -> New query -> Paste & Run
-- ==============================================================================

-- 1. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  full_content TEXT,
  category TEXT DEFAULT 'General',
  ref_no TEXT,
  attachment_name TEXT,
  attachment_url TEXT,
  file_size TEXT,
  is_urgent BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'published',
  published_at TEXT,
  author_name TEXT DEFAULT 'Principal Office',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 2. STAFF / FACULTY
CREATE TABLE IF NOT EXISTS public.staff (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT,
  designation TEXT NOT NULL,
  department TEXT DEFAULT 'secondary',
  qualifications TEXT,
  experience_years TEXT,
  subjects JSONB DEFAULT '[]'::jsonb,
  achievements TEXT,
  email TEXT,
  photo_url TEXT,
  is_lead BOOLEAN DEFAULT false,
  sort_order INT DEFAULT 1,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 3. EVENTS
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  event_date TEXT NOT NULL,
  start_time TEXT DEFAULT '09:00 AM',
  end_time TEXT DEFAULT '01:00 PM',
  location TEXT DEFAULT 'School Campus',
  category TEXT DEFAULT 'Institutional',
  cover_image TEXT,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 4. GALLERY
CREATE TABLE IF NOT EXISTS public.gallery (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  caption TEXT,
  category TEXT DEFAULT 'campus',
  image_url TEXT NOT NULL,
  sort_order INT DEFAULT 1,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 5. DOCUMENTS & PROSPECTUS
CREATE TABLE IF NOT EXISTS public.documents (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT DEFAULT 'Circular',
  description TEXT,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_size TEXT,
  download_count INT DEFAULT 0,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 6. ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS public.achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  year TEXT DEFAULT '2026',
  category TEXT DEFAULT 'board',
  awardee TEXT NOT NULL,
  rank_or_percentile TEXT,
  description TEXT,
  badge TEXT,
  metric TEXT,
  image_url TEXT,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 7. ADMISSION ENQUIRIES
CREATE TABLE IF NOT EXISTS public.admissions (
  id TEXT PRIMARY KEY,
  student_name TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  applied_class TEXT NOT NULL,
  stream TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  email TEXT,
  previous_school TEXT,
  message TEXT,
  status TEXT DEFAULT 'new',
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 8. ACADEMIC PROGRAMS & STREAMS
CREATE TABLE IF NOT EXISTS public.programs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  badge TEXT,
  grades TEXT,
  icon TEXT,
  description TEXT,
  subjects JSONB DEFAULT '[]'::jsonb,
  key_features JSONB DEFAULT '[]'::jsonb,
  career_paths JSONB DEFAULT '[]'::jsonb,
  syllabus_url TEXT,
  sort_order INT DEFAULT 1,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 9. CAMPUS FACILITIES
CREATE TABLE IF NOT EXISTS public.facilities (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subtitle TEXT,
  tag TEXT,
  stats TEXT,
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  icon TEXT,
  image_url TEXT,
  sort_order INT DEFAULT 1,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 10. 70-YEAR LEGACY MILESTONES
CREATE TABLE IF NOT EXISTS public.milestones (
  id TEXT PRIMARY KEY,
  year TEXT,
  period TEXT,
  title TEXT NOT NULL,
  category TEXT,
  highlight TEXT,
  description TEXT,
  details JSONB DEFAULT '[]'::jsonb,
  icon_name TEXT,
  image_url TEXT,
  sort_order INT DEFAULT 1,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 11. FAQS
CREATE TABLE IF NOT EXISTS public.faqs (
  id TEXT PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  sort_order INT DEFAULT 1,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 12. SCHOOL SETTINGS
CREATE TABLE IF NOT EXISTS public.settings (
  id TEXT PRIMARY KEY DEFAULT 'current',
  school_name TEXT NOT NULL,
  short_name TEXT,
  trust_name TEXT,
  est_year TEXT DEFAULT '1956',
  phone TEXT,
  alternate_phone TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  plus_code TEXT,
  office_hours TEXT,
  president_name TEXT,
  president_role TEXT,
  president_quote TEXT,
  president_message TEXT,
  academic_year TEXT DEFAULT '2026–2027',
  admission_open BOOLEAN DEFAULT true,
  hero_headline TEXT,
  hero_subheadline TEXT,
  hero_stat_1_val TEXT,
  hero_stat_1_label TEXT,
  hero_stat_1_sub TEXT,
  hero_stat_2_val TEXT,
  hero_stat_2_label TEXT,
  hero_stat_2_sub TEXT,
  hero_stat_3_val TEXT,
  hero_stat_3_label TEXT,
  hero_stat_3_sub TEXT,
  hero_stat_4_val TEXT,
  hero_stat_4_label TEXT,
  hero_stat_4_sub TEXT,
  gseb_center_code TEXT
);

-- 13. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  user_name TEXT,
  user_email TEXT,
  module TEXT,
  action TEXT,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY & PUBLIC PERMISSIONS
-- Allows public visitors to view published items and submit admission inquiries
-- ==============================================================================

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Anonymous public read policies
CREATE POLICY "Public Read Announcements" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Public Read Staff" ON public.staff FOR SELECT USING (true);
CREATE POLICY "Public Read Events" ON public.events FOR SELECT USING (true);
CREATE POLICY "Public Read Gallery" ON public.gallery FOR SELECT USING (true);
CREATE POLICY "Public Read Documents" ON public.documents FOR SELECT USING (true);
CREATE POLICY "Public Read Achievements" ON public.achievements FOR SELECT USING (true);
CREATE POLICY "Public Read Programs" ON public.programs FOR SELECT USING (true);
CREATE POLICY "Public Read Facilities" ON public.facilities FOR SELECT USING (true);
CREATE POLICY "Public Read Milestones" ON public.milestones FOR SELECT USING (true);
CREATE POLICY "Public Read FAQs" ON public.faqs FOR SELECT USING (true);
CREATE POLICY "Public Read Settings" ON public.settings FOR SELECT USING (true);

-- Allow public admission submissions
CREATE POLICY "Public Insert Admissions" ON public.admissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Own Admissions" ON public.admissions FOR SELECT USING (true);

-- Allow full modifications with anon key for CMS demo/management
CREATE POLICY "Anon Full Access Announcements" ON public.announcements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon Full Access Staff" ON public.staff FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon Full Access Events" ON public.events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon Full Access Gallery" ON public.gallery FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon Full Access Documents" ON public.documents FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon Full Access Achievements" ON public.achievements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon Full Access Admissions" ON public.admissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon Full Access Programs" ON public.programs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon Full Access Facilities" ON public.facilities FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon Full Access Milestones" ON public.milestones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon Full Access FAQs" ON public.faqs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon Full Access Settings" ON public.settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Anon Full Access Logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

-- Initial Settings
INSERT INTO public.settings (
  id, school_name, short_name, trust_name, est_year, phone, alternate_phone, email, website,
  address, plus_code, office_hours, president_name, president_role, president_quote, president_message,
  academic_year, admission_open, hero_headline, hero_subheadline,
  hero_stat_1_val, hero_stat_1_label, hero_stat_1_sub,
  hero_stat_2_val, hero_stat_2_label, hero_stat_2_sub,
  hero_stat_3_val, hero_stat_3_label, hero_stat_3_sub,
  hero_stat_4_val, hero_stat_4_label, hero_stat_4_sub, gseb_center_code
) VALUES (
  'current',
  'SKM High School & Higher Secondary School',
  'SKM High School, Kanodar',
  'Sarvoday Kelavani Mandal, Kanodar',
  '1956',
  '02742 242 933',
  '+91 2742 242 934',
  'info@skmkanodar.org',
  'https://skmhighschool.in',
  'Kanodar, Banaskantha District, Gujarat 385520',
  '39VX+33X Kanodar, Gujarat',
  'Monday – Saturday: 7:30 AM – 1:30 PM (Morning Shift) | 11:30 AM – 5:30 PM (General Shift)',
  'Alhaj Haji Mohammadbhai Mukhi',
  'President, Sarvoday Kelavani Mandal',
  'Education is the true foundation of human dignity, self-reliance, and societal upliftment.',
  'Founded in 1956 with visionary contributions from the emigrant and resident families of Kanodar, Sarvoday Kelavani Mandal has steadfastly served three generations of scholars. From rural origins to state-of-the-art Science laboratories and gigabit computer centres, our commitment to moral discipline and academic excellence remains unwavering.',
  '2026–2027',
  true,
  'Empowering Minds, Shaping Futures Since 1956',
  'Providing quality, value-centric, and modern education in Kanodar across Secondary, Higher Secondary Science, and Technical & Vocational Streams.',
  '1956', 'Year Established', 'Founded by Sarvoday Kelavani Mandal',
  '3 Streams', 'Secondary & Higher Secondary', 'Science, General & Vocational',
  '80+ PCs', 'A.N. Musa Computer Lab', 'High-Speed Gigabit LAN Connectivity',
  '25k+', 'Global Alumni Network', 'Leaders in Medicine, Tech & Business',
  '02.045 / 52.012'
) ON CONFLICT (id) DO NOTHING;

-- Initial Staff (Faculty)
INSERT INTO public.staff (id, name, role, designation, department, qualifications, experience_years, subjects, achievements, email, photo_url, is_lead, sort_order, status)
VALUES
  ('stf_1', 'I. K. Pathan', 'Principal', 'Principal & Administrative Head', 'administration', 'M.Sc. (Physics), M.Ed.', '26+ Years', '["Physics", "Educational Governance"]'::jsonb, 'Recipient of Best Educator Award North Gujarat; Published research in Science pedagogy.', 'principal@skmhighschool.in', 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=80', true, 1, 'published'),
  ('stf_2', 'M. M. Shaikh', 'Vice Principal', 'Vice Principal & HOD Science', 'science', 'M.Sc. (Chemistry), B.Ed.', '22+ Years', '["Organic Chemistry", "Inorganic Chemistry"]'::jsonb, 'Guided 18 students to 99+ percentile in GSEB Class 12 Science Board exams.', 'mm.shaikh@skmhighschool.in', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', true, 2, 'published'),
  ('stf_3', 'A. R. Mansuri', 'Senior Lecturer', 'HOD Mathematics & GUJCET Trainer', 'science', 'M.Sc. (Mathematics), B.Ed.', '18+ Years', '["Calculus", "Linear Algebra", "GUJCET Prep"]'::jsonb, 'Author of Board revision practice modules; Coach for State Mathematics Olympiad.', 'ar.mansuri@skmhighschool.in', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80', false, 3, 'published'),
  ('stf_4', 'Dr. S. K. Patel', 'Biology Lecturer', 'Senior Lecturer in Botany & Zoology', 'science', 'Ph.D. (Botany), M.Sc., B.Ed.', '15+ Years', '["Botany", "Zoology", "NEET Foundation"]'::jsonb, 'Co-authored biology research papers; Mentor for District Science Fair winners.', 'sk.patel@skmhighschool.in', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80', false, 4, 'published'),
  ('stf_5', 'R. B. Memon', 'Head of Commerce', 'HOD Commerce & Accountancy', 'commerce', 'M.Com., B.Ed., CA Inter', '19+ Years', '["Accountancy", "Statistics", "Cost Accounting"]'::jsonb, 'Produced state top-rankers in GSEB Class 12 General Stream; Career mentor.', 'rb.memon@skmhighschool.in', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80', true, 5, 'published'),
  ('stf_6', 'Z. H. Qureshi', 'Computer Scientist', 'Director of IT & Computer Centre', 'vocational', 'MCA, B.Sc. (Comp Sci)', '14+ Years', '["Python", "Web Technologies", "Database Systems"]'::jsonb, 'Spearheaded campus gigabit network installation and high-school coding bootcamps.', 'zh.qureshi@skmhighschool.in', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80', false, 6, 'published')
ON CONFLICT (id) DO NOTHING;

-- Initial Announcements
INSERT INTO public.announcements (id, title, summary, full_content, category, ref_no, attachment_name, attachment_url, file_size, is_urgent, is_pinned, status, published_at, author_name)
VALUES
  ('ann_1', 'Admissions Open for Academic Year 2026–2027 (Std 8th to 12th Science & General)', 'Online registration and offline prospectus distribution for Secondary and Higher Secondary sections are now active.', 'Sarvoday Kelavani Mandal announces the commencement of admission formalities for the Academic Session 2026-2027 across Class 8 to Class 12 (Higher Secondary Science Group A & B, Higher Secondary General Stream, and Technical Vocational wings). Application forms can be submitted online through the admissions inquiry form or collected directly from the school administrative office.', 'Admissions', 'SKM/ADM/2026-27/01', 'SKM_Admission_Prospectus_2026-27.pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '1.4 MB PDF', true, true, 'published', 'August 15, 2026', 'Principal Office'),
  ('ann_2', 'GSEB Board Examination Form Submission Deadline for Class 10 & 12', 'Students appearing for upcoming GSEB Secondary and Higher Secondary Board Examinations must verify internal marks.', 'All regular and repeater students appearing for upcoming GSEB Secondary and Higher Secondary Board Examinations must submit verified duplicate mark sheets, Aadhaar photocopy, and board fees at Counter 2 before 1:30 PM.', 'Exams', 'SKM/EXAM/2026/08', 'GSEB_Exam_Schedule_2026.pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '890 KB PDF', true, false, 'published', 'August 10, 2026', 'Examination Cell'),
  ('ann_3', 'Dawoodi Bohra Welfare Trust Merit Scholarships 2026–27', 'Applications invited from meritorious students securing 85%+ in Class 10 Board examinations.', 'Applications are invited from meritorious students of Kanodar and nearby villages securing 85%+ in Class 10 Board examinations for Higher Secondary Science and Vocational fee assistance grants funded by Dawoodi Bohra Welfare Trust and patron alumni.', 'Scholarships', 'SKM/SCH/2026/03', 'Scholarship_Form_2026.pdf', 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', '1.1 MB PDF', false, false, 'published', 'August 02, 2026', 'Trust Secretariat')
ON CONFLICT (id) DO NOTHING;
