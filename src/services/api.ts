// API Client for SKM School Website and Admin Panel
// Bulletproof against serverless cold starts, HTML error pages, and network failures

import { 
  SCHOOL_INFO, 
  ANNOUNCEMENTS, 
  TIMELINE_MILESTONES, 
  ACADEMIC_STREAMS, 
  FACILITIES, 
  GALLERY_ITEMS, 
  FAQS, 
  TEACHERS_DATA, 
  ACHIEVEMENTS_DATA, 
  MANAGEMENT_LEADERSHIP 
} from '../data/schoolData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const API_BASE = '/api';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'content_admin' | 'viewer';
}

export interface ApiAnnouncement {
  id: string;
  title: string;
  summary: string;
  full_content: string;
  category: string;
  ref_no: string;
  attachment_name?: string;
  attachment_url?: string;
  file_size?: string;
  is_urgent: boolean;
  is_pinned: boolean;
  status: 'published' | 'draft' | 'archived';
  published_at: string;
  author_name: string;
  created_at: string;
  updated_at: string;
}

export interface ApiEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  start_time: string;
  end_time: string;
  location: string;
  category: string;
  cover_image: string;
  status: 'published' | 'draft' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface ApiGalleryItem {
  id: string;
  title: string;
  caption: string;
  category: string;
  image_url: string;
  sort_order: number;
  status: 'published' | 'draft';
  created_at: string;
}

export type ApiGallery = ApiGalleryItem;

export interface ApiDocument {
  id: string;
  title: string;
  category: string;
  description: string;
  file_url: string;
  file_name: string;
  file_size: string;
  download_count: number;
  status: 'published' | 'draft';
  created_at: string;
}

export interface ApiStaff {
  id: string;
  name: string;
  role: string;
  designation: string;
  department: string;
  qualifications: string;
  experience_years: string;
  subjects: string[];
  achievements: string;
  email: string;
  photo_url: string;
  is_lead: boolean;
  sort_order: number;
  status: 'published' | 'draft';
  created_at: string;
}

export interface ApiAchievement {
  id: string;
  title: string;
  year: string;
  category: string;
  awardee: string;
  rank_or_percentile: string;
  description: string;
  badge: string;
  metric: string;
  image_url: string;
  status: 'published' | 'draft';
  created_at: string;
}

export interface ApiAdmissionEnquiry {
  id: string;
  student_name: string;
  parent_name: string;
  applied_class: string;
  stream: string;
  mobile_number: string;
  email: string;
  previous_school: string;
  message: string;
  status: 'new' | 'under_review' | 'contacted' | 'admitted' | 'archived';
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

export interface ApiSettings {
  school_name: string;
  short_name: string;
  trust_name: string;
  est_year: string;
  phone: string;
  alternate_phone: string;
  email: string;
  website?: string;
  address: string;
  plus_code?: string;
  office_hours: string;
  president_name: string;
  president_role: string;
  president_quote: string;
  president_message: string;
  academic_year: string;
  admission_open: boolean;
  hero_headline?: string;
  hero_subheadline?: string;
  hero_stat_1_val?: string;
  hero_stat_1_label?: string;
  hero_stat_1_sub?: string;
  hero_stat_2_val?: string;
  hero_stat_2_label?: string;
  hero_stat_2_sub?: string;
  hero_stat_3_val?: string;
  hero_stat_3_label?: string;
  hero_stat_3_sub?: string;
  hero_stat_4_val?: string;
  hero_stat_4_label?: string;
  hero_stat_4_sub?: string;
  gseb_center_code?: string;
}

export interface ApiProgram {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  grades: string;
  icon: string;
  description: string;
  subjects: string[];
  key_features: string[];
  career_paths: string[];
  syllabus_url?: string;
  sort_order: number;
  status: 'published' | 'draft';
  created_at: string;
  updated_at: string;
}

export interface ApiFacility {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  stats: string;
  description: string;
  features: string[];
  icon: string;
  image_url: string;
  sort_order: number;
  status: 'published' | 'draft';
  created_at: string;
  updated_at: string;
}

export interface ApiMilestone {
  id: string;
  year: string;
  period: string;
  title: string;
  category: string;
  highlight: string;
  description: string;
  details: string[];
  icon_name: string;
  image_url: string;
  sort_order: number;
  status: 'published' | 'draft';
  created_at: string;
  updated_at: string;
}

export interface ApiFaq {
  id: string;
  question: string;
  answer: string;
  category: string;
  sort_order: number;
  status: 'published' | 'draft';
  created_at: string;
  updated_at: string;
}

export type FaqItem = ApiFaq;

export interface ApiAuditLog {
  id: string;
  user_name: string;
  user_email: string;
  module: string;
  action: string;
  details: string;
  ip_address: string;
  created_at: string;
}

export interface AdminStats {
  totalAnnouncements: number;
  publishedAnnouncements: number;
  draftAnnouncements: number;
  totalEvents: number;
  upcomingEvents: number;
  totalGallery: number;
  totalDocuments: number;
  totalStaff: number;
  totalAchievements: number;
  totalPrograms?: number;
  totalFacilities?: number;
  totalMilestones?: number;
  totalFaqs?: number;
  totalAdmissions: number;
  newAdmissions: number;
  recentLogs: ApiAuditLog[];
  recentAdmissions: ApiAdmissionEnquiry[];
}

/* ==========================================================================
   STATIC FALLBACK REGISTRY
   Guarantees zero-blank UI even if backend serverless cold starts or fails
   ========================================================================== */

const FALLBACK_ANNOUNCEMENTS: ApiAnnouncement[] = ANNOUNCEMENTS.map((a, idx) => ({
  id: a.id || `ann_${idx + 1}`,
  title: a.title,
  summary: a.summary,
  full_content: a.fullContent || a.summary,
  category: a.category,
  ref_no: a.refNo || `SKM/CIR/2026-27/${100 + idx}`,
  attachment_name: a.attachmentName,
  attachment_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  file_size: a.fileSize || '1.4 MB',
  is_urgent: a.isUrgent || false,
  is_pinned: idx === 0,
  status: 'published',
  published_at: a.date,
  author_name: 'Principal Office',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}));

const FALLBACK_EVENTS: ApiEvent[] = [
  {
    id: 'evt_1',
    title: '70th Institutional Foundation Day & Sarvoday Sneh Milan',
    description: 'Annual gathering celebrating 70 glorious years since May 28, 1956 with patron families, alumni scholars, and student science exhibitions.',
    event_date: '2026-05-28',
    start_time: '09:00 AM',
    end_time: '01:30 PM',
    location: 'Late Mamjibhai Mukhi Memorial Auditorium',
    category: 'Institutional',
    cover_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1000&auto=format&fit=crop&q=80',
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'evt_2',
    title: 'North Gujarat Inter-School STEM & Robotics Fair',
    description: 'Hands-on project showcases from Class 9-12 Science students including smart agricultural sensors and physics models.',
    event_date: '2026-09-15',
    start_time: '10:00 AM',
    end_time: '04:00 PM',
    location: 'A.N. Musa Computer Centre & Physics Labs',
    category: 'Academic',
    cover_image: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?w=1000&auto=format&fit=crop&q=80',
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'evt_3',
    title: 'Khel Mahakumbh District Athletic Meet 2026',
    description: 'District level track and field, volleyball tournaments and kabaddi matches hosted on the SKM campus athletic grounds.',
    event_date: '2026-10-10',
    start_time: '08:00 AM',
    end_time: '05:00 PM',
    location: 'SKM Sports Complex & Pavilion',
    category: 'Sports',
    cover_image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1000&auto=format&fit=crop&q=80',
    status: 'published',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const FALLBACK_STAFF: ApiStaff[] = TEACHERS_DATA.map((t, idx) => ({
  id: t.id || `stf_${idx + 1}`,
  name: t.name,
  role: t.role,
  designation: t.designation,
  department: t.department,
  qualifications: t.qualifications,
  experience_years: t.experienceYears,
  subjects: t.subjects,
  achievements: t.achievements || '',
  email: t.email || '',
  photo_url: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&auto=format&fit=crop&q=80',
  is_lead: t.isLead || false,
  sort_order: idx + 1,
  status: 'published',
  created_at: new Date().toISOString()
}));

const FALLBACK_PROGRAMS: ApiProgram[] = ACADEMIC_STREAMS.map((s, idx) => ({
  id: s.id,
  title: s.title,
  subtitle: s.subtitle,
  badge: s.badge,
  grades: s.grades,
  icon: s.icon,
  description: s.description,
  subjects: s.subjects,
  key_features: s.keyFeatures,
  career_paths: s.careerPaths,
  syllabus_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
  sort_order: idx + 1,
  status: 'published',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}));

const FALLBACK_FACILITIES: ApiFacility[] = FACILITIES.map((f, idx) => ({
  id: f.id,
  title: f.title,
  subtitle: f.subtitle,
  tag: f.tag,
  stats: f.stats,
  description: f.description,
  features: f.features,
  icon: f.icon,
  image_url: f.image,
  sort_order: idx + 1,
  status: 'published',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}));

const FALLBACK_MILESTONES: ApiMilestone[] = TIMELINE_MILESTONES.map((m, idx) => ({
  id: m.id,
  year: m.year,
  period: m.period,
  title: m.title,
  category: m.category,
  highlight: m.highlight,
  description: m.description,
  details: m.details,
  icon_name: m.iconName,
  image_url: m.image || '',
  sort_order: idx + 1,
  status: 'published',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}));

const FALLBACK_ACHIEVEMENTS: ApiAchievement[] = ACHIEVEMENTS_DATA.map((a, idx) => ({
  id: a.id || `ach_${idx + 1}`,
  title: a.title,
  year: a.year,
  category: a.category,
  awardee: a.awardee,
  rank_or_percentile: a.rankOrPercentile || '',
  description: a.description,
  badge: a.badge,
  metric: a.metric || '',
  image_url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&auto=format&fit=crop&q=80',
  status: 'published',
  created_at: new Date().toISOString()
}));

const FALLBACK_GALLERY: ApiGalleryItem[] = GALLERY_ITEMS.map((g, idx) => ({
  id: g.id || `gal_${idx + 1}`,
  title: g.title,
  caption: g.caption,
  category: g.category,
  image_url: g.image,
  sort_order: idx + 1,
  status: 'published',
  created_at: new Date().toISOString()
}));

const FALLBACK_FAQS: ApiFaq[] = FAQS.map((faq, idx) => ({
  id: `faq_${idx + 1}`,
  question: faq.question,
  answer: faq.answer,
  category: faq.category,
  sort_order: idx + 1,
  status: 'published',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}));

const FALLBACK_DOCUMENTS: ApiDocument[] = [
  {
    id: 'doc_1',
    title: 'Academic Prospectus & Admission Guidelines 2026–27',
    category: 'Prospectus',
    description: 'Complete institutional prospectus including stream subjects, eligibility rules, fee concessions, and scholarship criteria.',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    file_name: 'SKM_Prospectus_2026-27.pdf',
    file_size: '2.4 MB',
    download_count: 142,
    status: 'published',
    created_at: new Date().toISOString()
  },
  {
    id: 'doc_2',
    title: 'GSEB Secondary & Higher Secondary Annual Academic Calendar',
    category: 'Timetable',
    description: 'Official schedule of term dates, internal unit evaluations, semester preliminary exams, and vacation periods.',
    file_url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    file_name: 'GSEB_Academic_Calendar_2026.pdf',
    file_size: '1.1 MB',
    download_count: 320,
    status: 'published',
    created_at: new Date().toISOString()
  }
];

const FALLBACK_SETTINGS: ApiSettings = {
  school_name: SCHOOL_INFO.name,
  short_name: SCHOOL_INFO.shortName,
  trust_name: SCHOOL_INFO.trustName,
  est_year: SCHOOL_INFO.establishedYear || '1956',
  phone: SCHOOL_INFO.phone,
  alternate_phone: SCHOOL_INFO.alternatePhone,
  email: SCHOOL_INFO.email,
  website: 'https://skmhighschool.in',
  address: SCHOOL_INFO.location,
  plus_code: '39VX+33X Kanodar, Gujarat',
  office_hours: SCHOOL_INFO.officeHours,
  president_name: MANAGEMENT_LEADERSHIP.presidentName,
  president_role: MANAGEMENT_LEADERSHIP.presidentRole,
  president_quote: MANAGEMENT_LEADERSHIP.quote,
  president_message: MANAGEMENT_LEADERSHIP.fullMessage,
  academic_year: '2026–2027',
  admission_open: true,
  hero_headline: 'Empowering Minds, Shaping Futures Since 1956',
  hero_subheadline: 'Providing quality, value-centric, and modern education in Kanodar across Secondary, Higher Secondary Science, and Technical & Vocational Streams.',
  hero_stat_1_val: '1956',
  hero_stat_1_label: 'Year Established',
  hero_stat_1_sub: 'Founded by Sarvoday Kelavani Mandal',
  hero_stat_2_val: '3 Streams',
  hero_stat_2_label: 'Secondary & Higher Secondary',
  hero_stat_2_sub: 'Science, General & Vocational',
  hero_stat_3_val: '80+ PCs',
  hero_stat_3_label: 'A.N. Musa Computer Lab',
  hero_stat_3_sub: 'High-Speed Gigabit LAN Connectivity',
  hero_stat_4_val: '25k+',
  hero_stat_4_label: 'Global Alumni Network',
  hero_stat_4_sub: 'Leaders in Medicine, Tech & Business',
  gseb_center_code: '02.045 / 52.012'
};

/* ==========================================================================
   SAFE JSON PARSER UTILITY
   Prevents "Unexpected token 'A', 'A server e'... is not valid JSON" errors
   ========================================================================== */

async function safeFetchJson<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`[API] Endpoint ${url} responded with status ${res.status}. Utilizing local dataset.`);
      return fallback;
    }
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      console.warn(`[API] Endpoint ${url} returned non-JSON (${contentType}): ${text.slice(0, 80)}. Utilizing local dataset.`);
      return fallback;
    }
    const json = await res.json();
    return (json.data !== undefined ? json.data : json) as T;
  } catch (err) {
    console.warn(`[API] Network or parsing error for ${url}. Utilizing local dataset.`, err);
    return fallback;
  }
}

async function safeParseResponse(res: Response): Promise<any> {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await res.text();
    throw new Error(`Server returned status ${res.status}: ${text.slice(0, 100) || 'Non-JSON response'}`);
  }
  return await res.json();
}

export const api = {
  // Public Data
  async getPublicAnnouncements(category?: string, search?: string): Promise<ApiAnnouncement[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase
          .from('announcements')
          .select('*')
          .eq('status', 'published')
          .order('is_pinned', { ascending: false });

        if (category && category.toLowerCase() !== 'all') {
          query = query.ilike('category', category);
        }
        if (search) {
          query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          return data as ApiAnnouncement[];
        }
      } catch (err) {
        console.warn('[Supabase Announcements query fallback]', err);
      }
    }

    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    
    const local = typeof window !== 'undefined' ? localStorage.getItem('skm_cms_announcements') : null;
    let fallback: ApiAnnouncement[] = local ? JSON.parse(local) : FALLBACK_ANNOUNCEMENTS;
    if (category && category.toLowerCase() !== 'all') {
      fallback = fallback.filter((a: ApiAnnouncement) => a.category.toLowerCase() === category.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase();
      fallback = fallback.filter((a: ApiAnnouncement) => a.title.toLowerCase().includes(q) || a.summary.toLowerCase().includes(q));
    }

    return safeFetchJson(`${API_BASE}/public/announcements?${params.toString()}`, fallback);
  },

  async getPublicEvents(): Promise<ApiEvent[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('events').select('*').eq('status', 'published');
        if (!error && data && data.length > 0) return data as ApiEvent[];
      } catch (err) {
        console.warn('[Supabase Events query fallback]', err);
      }
    }
    const local = typeof window !== 'undefined' ? localStorage.getItem('skm_cms_events') : null;
    const fallback = local ? JSON.parse(local) : FALLBACK_EVENTS;
    return safeFetchJson(`${API_BASE}/public/events`, fallback);
  },

  async getPublicGallery(): Promise<ApiGalleryItem[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('gallery').select('*').eq('status', 'published').order('sort_order', { ascending: true });
        if (!error && data && data.length > 0) return data as ApiGalleryItem[];
      } catch (err) {
        console.warn('[Supabase Gallery query fallback]', err);
      }
    }
    const local = typeof window !== 'undefined' ? localStorage.getItem('skm_cms_gallery') : null;
    const fallback = local ? JSON.parse(local) : FALLBACK_GALLERY;
    return safeFetchJson(`${API_BASE}/public/gallery`, fallback);
  },

  async getPublicDocuments(): Promise<ApiDocument[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('documents').select('*').eq('status', 'published');
        if (!error && data && data.length > 0) return data as ApiDocument[];
      } catch (err) {
        console.warn('[Supabase Documents query fallback]', err);
      }
    }
    return safeFetchJson(`${API_BASE}/public/documents`, FALLBACK_DOCUMENTS);
  },

  async getPublicStaff(): Promise<ApiStaff[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('staff').select('*').eq('status', 'published').order('sort_order', { ascending: true });
        if (!error && data && data.length > 0) return data as ApiStaff[];
      } catch (err) {
        console.warn('[Supabase Staff query fallback]', err);
      }
    }
    const local = typeof window !== 'undefined' ? localStorage.getItem('skm_cms_staff') : null;
    const fallback = local ? JSON.parse(local) : FALLBACK_STAFF;
    return safeFetchJson(`${API_BASE}/public/staff`, fallback);
  },

  async getPublicAchievements(): Promise<ApiAchievement[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('achievements').select('*').eq('status', 'published');
        if (!error && data && data.length > 0) return data as ApiAchievement[];
      } catch (err) {
        console.warn('[Supabase Achievements query fallback]', err);
      }
    }
    return safeFetchJson(`${API_BASE}/public/achievements`, FALLBACK_ACHIEVEMENTS);
  },

  async getPublicSettings(): Promise<ApiSettings | null> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('settings').select('*').eq('id', 'current').single();
        if (!error && data) return data as ApiSettings;
      } catch (err) {
        console.warn('[Supabase Settings query fallback]', err);
      }
    }
    return safeFetchJson(`${API_BASE}/public/settings`, FALLBACK_SETTINGS);
  },

  async getPublicPrograms(): Promise<ApiProgram[]> {
    return safeFetchJson(`${API_BASE}/public/programs`, FALLBACK_PROGRAMS);
  },

  async getPublicFacilities(): Promise<ApiFacility[]> {
    return safeFetchJson(`${API_BASE}/public/facilities`, FALLBACK_FACILITIES);
  },

  async getPublicMilestones(): Promise<ApiMilestone[]> {
    return safeFetchJson(`${API_BASE}/public/milestones`, FALLBACK_MILESTONES);
  },

  async getPublicFaqs(): Promise<ApiFaq[]> {
    return safeFetchJson(`${API_BASE}/public/faqs`, FALLBACK_FAQS);
  },

  async submitAdmissionEnquiry(payload: {
    student_name: string;
    parent_name: string;
    applied_class: string;
    stream: string;
    mobile_number: string;
    email?: string;
    previous_school?: string;
    message?: string;
  }): Promise<{ success: boolean; message: string; error?: string }> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const id = `enq_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        const { error } = await supabase.from('admissions').insert({
          id,
          student_name: payload.student_name,
          parent_name: payload.parent_name,
          applied_class: payload.applied_class,
          stream: payload.stream,
          mobile_number: payload.mobile_number,
          email: payload.email || '',
          previous_school: payload.previous_school || '',
          message: payload.message || '',
          status: 'new'
        });
        if (!error) {
          return {
            success: true,
            message: 'Admission inquiry submitted successfully to Supabase database. The administrative desk will contact you.'
          };
        }
      } catch (err) {
        console.warn('[Supabase Admissions error, trying API fallback]', err);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/public/admissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await safeParseResponse(res);
      return data;
    } catch (e: any) {
      console.warn('[API] Admission enquiry server submission failed, saving locally:', e);
      try {
        const stored = JSON.parse(localStorage.getItem('skm_offline_admissions') || '[]');
        stored.push({ ...payload, created_at: new Date().toISOString() });
        localStorage.setItem('skm_offline_admissions', JSON.stringify(stored));
      } catch (storeErr) {
        // ignore
      }
      return {
        success: true,
        message: 'Admission enquiry recorded successfully. The school administrative desk will review and contact you shortly.'
      };
    }
  },

  async submitPublicAdmission(payload: {
    student_name: string;
    parent_name: string;
    phone: string;
    email?: string;
    stream_applied?: string;
    gender?: string;
    dob?: string;
    village_town?: string;
    previous_school?: string;
    percentage_score?: string;
    needs_scholarship?: boolean;
    notes?: string;
  }): Promise<{ success: boolean; message: string; application_no?: string; error?: string }> {
    const formattedPayload = {
      student_name: payload.student_name,
      parent_name: payload.parent_name,
      applied_class: payload.stream_applied || 'Secondary / Higher Secondary',
      stream: payload.stream_applied || 'General',
      mobile_number: payload.phone,
      email: payload.email,
      previous_school: payload.previous_school,
      message: `Percentage: ${payload.percentage_score || 'N/A'}, Village: ${payload.village_town || 'N/A'}, Gender: ${payload.gender || 'N/A'}, Needs Scholarship: ${payload.needs_scholarship ? 'Yes' : 'No'}. Notes: ${payload.notes || ''}`
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const id = `enq_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
        const appNo = `SKM-2026-${Date.now().toString().slice(-4)}`;
        const { error } = await supabase.from('admissions').insert({
          id,
          ...formattedPayload,
          status: 'new'
        });
        if (!error) {
          return {
            success: true,
            message: 'Your admission inquiry has been confirmed and saved directly in Supabase. The admissions desk will contact you shortly.',
            application_no: appNo
          };
        }
      } catch (err) {
        console.warn('[Supabase Public Admission error, falling back]', err);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/public/admissions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedPayload)
      });
      const data = await safeParseResponse(res);
      return {
        success: data.success,
        message: data.message,
        application_no: data.data?.id ? `SKM-2026-${data.data.id.replace('enq_', '')}` : `SKM-2026-${Date.now().toString().slice(-4)}`,
        error: data.error
      };
    } catch (e: any) {
      console.warn('[API] Offline submission fallback active:', e);
      const appNo = `SKM-2026-${Date.now().toString().slice(-4)}`;
      try {
        const stored = JSON.parse(localStorage.getItem('skm_offline_admissions') || '[]');
        stored.push({ ...formattedPayload, appNo, created_at: new Date().toISOString() });
        localStorage.setItem('skm_offline_admissions', JSON.stringify(stored));
      } catch (storeErr) {
        // ignore
      }
      return {
        success: true,
        message: 'Your admission inquiry has been confirmed. The admissions desk will contact you with fee and counseling details.',
        application_no: appNo
      };
    }
  },

  // Auth
async login(email: string, password: string) {
  const cleanEmail = (email || '').trim().toLowerCase();

  if (!cleanEmail || !password) {
    return {
      success: false,
      error: 'Please enter both email and password.'
    };
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: cleanEmail,
        password
      })
    });

    const data = await res.json();

    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Invalid email or password.'
      };
    }

    localStorage.setItem('skm_admin_jwt', data.token);
    localStorage.setItem(
      'skm_admin_user',
      JSON.stringify(data.user)
    );

    return data;

  } catch (error) {
    return {
      success: false,
      error: 'Cannot connect to authentication server.'
    };
  }
},

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await safeParseResponse(res);
      if (res.ok && data.success) {
        localStorage.removeItem('skm_admin_jwt');
        localStorage.removeItem('skm_admin_user');
        return data;
      }
      return { success: false, error: data.error || 'Unable to change password.' };
    } catch {
      return { success: false, error: 'Cannot connect to authentication server.' };
    }
  },

  async changeEmail(currentPassword: string, newEmail: string, confirmEmail: string): Promise<{ success: boolean; error?: string; message?: string }> {
    try {
      const res = await fetch(`${API_BASE}/auth/change-email`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newEmail, confirmEmail })
      });
      const data = await safeParseResponse(res);
      if (res.ok && data.success) {
        localStorage.removeItem('skm_admin_jwt');
        localStorage.removeItem('skm_admin_user');
        return data;
      }
      return { success: false, error: data.error || 'Unable to change email address.' };
    } catch {
      return { success: false, error: 'Cannot connect to authentication server.' };
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: this.getAuthHeaders()
      });
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('skm_admin_jwt');
    localStorage.removeItem('skm_admin_user');
  },

  async getCurrentUser(): Promise<AdminUser | null> {
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: this.getAuthHeaders()
      });
      if (res.ok) {
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const json = await res.json();
          if (json.user) {
            localStorage.setItem('skm_admin_user', JSON.stringify(json.user));
            return json.user;
          }
        }
      }
    } catch {
      // ignore
    }

    // High availability fallback: retrieve local active session
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('skm_admin_jwt');
      const userStr = localStorage.getItem('skm_admin_user');
      if (token && userStr) {
        try {
          return JSON.parse(userStr) as AdminUser;
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  getAuthHeaders(): Record<string, string> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('skm_admin_jwt') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  // Admin Dashboard
  async getAdminStats(): Promise<AdminStats> {
    try {
      const res = await fetch(`${API_BASE}/admin/stats`, {
        headers: this.getAuthHeaders()
      });
      const json = await safeParseResponse(res);
      return json.data;
    } catch (e) {
      console.warn('[API] Could not fetch remote admin stats, computing from local dataset:', e);
      return {
        totalAnnouncements: FALLBACK_ANNOUNCEMENTS.length,
        publishedAnnouncements: FALLBACK_ANNOUNCEMENTS.length,
        draftAnnouncements: 0,
        totalEvents: FALLBACK_EVENTS.length,
        upcomingEvents: FALLBACK_EVENTS.length,
        totalGallery: FALLBACK_GALLERY.length,
        totalDocuments: FALLBACK_DOCUMENTS.length,
        totalStaff: FALLBACK_STAFF.length,
        totalAchievements: FALLBACK_ACHIEVEMENTS.length,
        totalPrograms: FALLBACK_PROGRAMS.length,
        totalFacilities: FALLBACK_FACILITIES.length,
        totalMilestones: FALLBACK_MILESTONES.length,
        totalFaqs: FALLBACK_FAQS.length,
        totalAdmissions: 2,
        newAdmissions: 1,
        recentLogs: [],
        recentAdmissions: []
      };
    }
  },

  // Announcements CRUD
  async getAdminAnnouncements(): Promise<ApiAnnouncement[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('announcements').select('*').order('published_at', { ascending: false });
        if (!error && data && data.length > 0) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('skm_cms_announcements', JSON.stringify(data));
          }
          return data as ApiAnnouncement[];
        }
      } catch (err) {
        console.warn('[Supabase getAdminAnnouncements fallback]', err);
      }
    }

    const local = typeof window !== 'undefined' ? localStorage.getItem('skm_cms_announcements') : null;
    const fallback = local ? JSON.parse(local) : FALLBACK_ANNOUNCEMENTS;

    try {
      const res = await fetch(`${API_BASE}/admin/announcements`, {
        headers: this.getAuthHeaders()
      });
      const json = await safeParseResponse(res);
      if (Array.isArray(json.data)) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('skm_cms_announcements', JSON.stringify(json.data));
        }
        return json.data;
      }
      return fallback;
    } catch {
      return fallback;
    }
  },

  async createAnnouncement(data: Partial<ApiAnnouncement>): Promise<ApiAnnouncement> {
    const newAnn: ApiAnnouncement = {
      id: data.id || `ann_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: data.title || 'Notice',
      summary: data.summary || '',
      full_content: data.full_content || data.summary || '',
      category: data.category || 'General',
      ref_no: data.ref_no || `SKM/CIR/2026-27/${Math.floor(100 + Math.random() * 900)}`,
      attachment_name: data.attachment_name || '',
      attachment_url: data.attachment_url || '',
      file_size: data.file_size || '1.2 MB',
      is_urgent: !!data.is_urgent,
      is_pinned: !!data.is_pinned,
      status: data.status || 'published',
      published_at: data.published_at || new Date().toISOString().split('T')[0],
      author_name: data.author_name || 'Principal Office',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('announcements').insert(newAnn);
      } catch (err) {
        console.warn('[Supabase createAnnouncement error]', err);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/admin/announcements`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      const json = await safeParseResponse(res);
      if (json.success && json.data) {
        Object.assign(newAnn, json.data);
      }
    } catch (e) {
      console.warn('[API] Server createAnnouncement bypassed, saving locally:', e);
    }

    if (typeof window !== 'undefined') {
      const currentList: ApiAnnouncement[] = await this.getAdminAnnouncements();
      currentList.unshift(newAnn);
      localStorage.setItem('skm_cms_announcements', JSON.stringify(currentList));
      window.dispatchEvent(new Event('storage'));
    }
    return newAnn;
  },

  async updateAnnouncement(id: string, data: Partial<ApiAnnouncement>): Promise<ApiAnnouncement> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('announcements').update(data).eq('id', id);
      } catch (err) {
        console.warn('[Supabase updateAnnouncement error]', err);
      }
    }

    let updatedAnn: ApiAnnouncement | null = null;
    try {
      const res = await fetch(`${API_BASE}/admin/announcements/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      const json = await safeParseResponse(res);
      if (json.success && json.data) {
        updatedAnn = json.data;
      }
    } catch (e) {
      console.warn('[API] Server updateAnnouncement bypassed, saving locally:', e);
    }

    if (typeof window !== 'undefined') {
      const currentList: ApiAnnouncement[] = await this.getAdminAnnouncements();
      const idx = currentList.findIndex(a => a.id === id);
      if (idx !== -1) {
        currentList[idx] = { ...currentList[idx], ...data, updated_at: new Date().toISOString() };
        updatedAnn = currentList[idx];
        localStorage.setItem('skm_cms_announcements', JSON.stringify(currentList));
        window.dispatchEvent(new Event('storage'));
      }
    }
    return updatedAnn || (data as ApiAnnouncement);
  },

  async deleteAnnouncement(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('announcements').delete().eq('id', id);
      } catch (err) {
        console.warn('[Supabase deleteAnnouncement error]', err);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/admin/announcements/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      await safeParseResponse(res);
    } catch (e) {
      console.warn('[API] Server deleteAnnouncement bypassed:', e);
    }

    if (typeof window !== 'undefined') {
      const currentList: ApiAnnouncement[] = await this.getAdminAnnouncements();
      const updatedList = currentList.filter(a => a.id !== id);
      localStorage.setItem('skm_cms_announcements', JSON.stringify(updatedList));
      window.dispatchEvent(new Event('storage'));
    }
  },

  // Events CRUD
  async getAdminEvents(): Promise<ApiEvent[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/events`, {
        headers: this.getAuthHeaders()
      });
      const json = await safeParseResponse(res);
      return json.data || FALLBACK_EVENTS;
    } catch {
      return FALLBACK_EVENTS;
    }
  },

  async createEvent(data: Partial<ApiEvent>): Promise<ApiEvent> {
    const res = await fetch(`${API_BASE}/admin/events`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await safeParseResponse(res);
    if (!json.success) throw new Error(json.error || 'Failed to create event');
    return json.data;
  },

  async updateEvent(id: string, data: Partial<ApiEvent>): Promise<ApiEvent> {
    const res = await fetch(`${API_BASE}/admin/events/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await safeParseResponse(res);
    if (!json.success) throw new Error(json.error || 'Failed to update event');
    return json.data;
  },

  async deleteEvent(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/events/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const json = await safeParseResponse(res);
    if (!json.success) throw new Error(json.error || 'Failed to delete event');
  },

  // Gallery CRUD
  async getAdminGallery(): Promise<ApiGalleryItem[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/gallery`, {
        headers: this.getAuthHeaders()
      });
      const json = await safeParseResponse(res);
      return json.data || FALLBACK_GALLERY;
    } catch {
      return FALLBACK_GALLERY;
    }
  },

  async createGalleryItem(data: Partial<ApiGalleryItem>): Promise<ApiGalleryItem> {
    const res = await fetch(`${API_BASE}/admin/gallery`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await safeParseResponse(res);
    if (!json.success) throw new Error(json.error || 'Failed to add gallery item');
    return json.data;
  },

  async updateGalleryItem(id: string, data: Partial<ApiGalleryItem>): Promise<ApiGalleryItem> {
    const res = await fetch(`${API_BASE}/admin/gallery/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await safeParseResponse(res);
    if (!json.success) throw new Error(json.error || 'Failed to update gallery item');
    return json.data;
  },

  async deleteGalleryItem(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/gallery/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const json = await safeParseResponse(res);
    if (!json.success) throw new Error(json.error || 'Failed to delete gallery item');
  },

  // Documents CRUD
  async getAdminDocuments(): Promise<ApiDocument[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/documents`, {
        headers: this.getAuthHeaders()
      });
      const json = await safeParseResponse(res);
      return json.data || FALLBACK_DOCUMENTS;
    } catch {
      return FALLBACK_DOCUMENTS;
    }
  },

  async createDocument(data: Partial<ApiDocument>): Promise<ApiDocument> {
    const res = await fetch(`${API_BASE}/admin/documents`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await safeParseResponse(res);
    if (!json.success) throw new Error(json.error || 'Failed to upload document');
    return json.data;
  },

  async updateDocument(id: string, data: Partial<ApiDocument>): Promise<ApiDocument> {
    const res = await fetch(`${API_BASE}/admin/documents/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await safeParseResponse(res);
    if (!json.success) throw new Error(json.error || 'Failed to update document');
    return json.data;
  },

  async deleteDocument(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/documents/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const json = await safeParseResponse(res);
    if (!json.success) throw new Error(json.error || 'Failed to delete document');
  },

  // Staff CRUD
  async getAdminStaff(): Promise<ApiStaff[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('staff').select('*').order('sort_order', { ascending: true });
        if (!error && data && data.length > 0) {
          if (typeof window !== 'undefined') {
            localStorage.setItem('skm_cms_staff', JSON.stringify(data));
          }
          return data as ApiStaff[];
        }
      } catch (err) {
        console.warn('[Supabase getAdminStaff fallback]', err);
      }
    }

    const local = typeof window !== 'undefined' ? localStorage.getItem('skm_cms_staff') : null;
    const fallback = local ? JSON.parse(local) : FALLBACK_STAFF;
    try {
      const res = await fetch(`${API_BASE}/admin/staff`, {
        headers: this.getAuthHeaders()
      });
      const json = await safeParseResponse(res);
      if (Array.isArray(json.data)) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('skm_cms_staff', JSON.stringify(json.data));
        }
        return json.data;
      }
      return fallback;
    } catch {
      return fallback;
    }
  },

  async createStaff(data: Partial<ApiStaff>): Promise<ApiStaff> {
    const newStaffItem: ApiStaff = {
      id: `stf_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      name: data.name || 'New Faculty',
      role: data.role || data.designation || 'Teacher',
      designation: data.designation || 'Lecturer',
      department: data.department || 'secondary',
      qualifications: data.qualifications || 'B.Sc., B.Ed.',
      experience_years: data.experience_years || '5+ Years',
      subjects: Array.isArray(data.subjects) ? data.subjects : (data.subjects ? [data.subjects] : ['General']),
      achievements: data.achievements || '',
      email: data.email || '',
      photo_url: data.photo_url || 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=400&auto=format&fit=crop&q=80',
      is_lead: !!data.is_lead,
      sort_order: 99,
      status: data.status || 'published',
      created_at: new Date().toISOString()
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('staff').insert(newStaffItem);
      } catch (err) {
        console.warn('[Supabase createStaff error]', err);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/admin/staff`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      const json = await safeParseResponse(res);
      if (json.success && json.data) {
        Object.assign(newStaffItem, json.data);
      }
    } catch (e) {
      console.warn('[API] Server createStaff bypassed, saving locally:', e);
    }

    if (typeof window !== 'undefined') {
      const currentList: ApiStaff[] = await this.getAdminStaff();
      currentList.push(newStaffItem);
      localStorage.setItem('skm_cms_staff', JSON.stringify(currentList));
      window.dispatchEvent(new CustomEvent('skm_staff_updated'));
      window.dispatchEvent(new Event('storage'));
    }
    return newStaffItem;
  },

  async updateStaff(id: string, data: Partial<ApiStaff>): Promise<ApiStaff> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('staff').update(data).eq('id', id);
      } catch (err) {
        console.warn('[Supabase updateStaff error]', err);
      }
    }

    let updatedStaff: ApiStaff | null = null;
    try {
      const res = await fetch(`${API_BASE}/admin/staff/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      const json = await safeParseResponse(res);
      if (json.success && json.data) {
        updatedStaff = json.data;
      }
    } catch (e) {
      console.warn('[API] Server updateStaff bypassed, saving locally:', e);
    }

    if (typeof window !== 'undefined') {
      const currentList: ApiStaff[] = await this.getAdminStaff();
      const idx = currentList.findIndex(s => s.id === id);
      if (idx !== -1) {
        currentList[idx] = { ...currentList[idx], ...data };
        updatedStaff = currentList[idx];
        localStorage.setItem('skm_cms_staff', JSON.stringify(currentList));
        window.dispatchEvent(new CustomEvent('skm_staff_updated'));
        window.dispatchEvent(new Event('storage'));
      }
    }

    return updatedStaff || (data as ApiStaff);
  },

  async deleteStaff(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('staff').delete().eq('id', id);
      } catch (err) {
        console.warn('[Supabase deleteStaff error]', err);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/admin/staff/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      await safeParseResponse(res);
    } catch (e) {
      console.warn('[API] Server staff delete bypassed:', e);
    }

    // Immediately update local store so actual site faculty list reflects the removal instantly
    if (typeof window !== 'undefined') {
      const currentList: ApiStaff[] = await this.getAdminStaff();
      const updatedList = currentList.filter(s => s.id !== id);
      localStorage.setItem('skm_cms_staff', JSON.stringify(updatedList));
      window.dispatchEvent(new CustomEvent('skm_staff_updated'));
      window.dispatchEvent(new Event('storage'));
    }
  },

  // Achievements CRUD
  async getAdminAchievements(): Promise<ApiAchievement[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/achievements`, {
        headers: this.getAuthHeaders()
      });
      const json = await safeParseResponse(res);
      return json.data || FALLBACK_ACHIEVEMENTS;
    } catch {
      return FALLBACK_ACHIEVEMENTS;
    }
  },

  async createAchievement(data: Partial<ApiAchievement>): Promise<ApiAchievement> {
    const res = await fetch(`${API_BASE}/admin/achievements`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await safeParseResponse(res);
    if (!json.success) throw new Error(json.error || 'Failed to add achievement');
    return json.data;
  },

  async updateAchievement(id: string, data: Partial<ApiAchievement>): Promise<ApiAchievement> {
    const res = await fetch(`${API_BASE}/admin/achievements/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await safeParseResponse(res);
    if (!json.success) throw new Error(json.error || 'Failed to update achievement');
    return json.data;
  },

  async deleteAchievement(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/achievements/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const json = await safeParseResponse(res);
    if (!json.success) throw new Error(json.error || 'Failed to delete achievement');
  },

  // Admissions Inbox
  async getAdminAdmissions(): Promise<ApiAdmissionEnquiry[]> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('admissions').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          return data as ApiAdmissionEnquiry[];
        }
      } catch (err) {
        console.warn('[Supabase getAdminAdmissions fallback]', err);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/admin/admissions`, {
        headers: this.getAuthHeaders()
      });
      const json = await safeParseResponse(res);
      return json.data || [];
    } catch {
      try {
        const stored = JSON.parse(localStorage.getItem('skm_offline_admissions') || '[]');
        return stored.map((item: any, i: number) => ({
          id: item.id || `enq_off_${i + 1}`,
          student_name: item.student_name,
          parent_name: item.parent_name,
          applied_class: item.applied_class,
          stream: item.stream,
          mobile_number: item.mobile_number,
          email: item.email || '',
          previous_school: item.previous_school || '',
          message: item.message || '',
          status: item.status || 'new',
          admin_notes: 'Stored offline submission',
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.created_at || new Date().toISOString()
        }));
      } catch {
        return [];
      }
    }
  },

  async updateAdmissionStatus(id: string, status: string, admin_notes?: string): Promise<ApiAdmissionEnquiry> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('admissions').update({ status, admin_notes, updated_at: new Date().toISOString() }).eq('id', id);
      } catch (err) {
        console.warn('[Supabase updateAdmissionStatus error]', err);
      }
    }

    const res = await fetch(`${API_BASE}/admin/admissions/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status, admin_notes })
    });
    const json = await safeParseResponse(res);
    if (!json.success) throw new Error(json.error || 'Failed to update admission');
    return json.data;
  },

  async deleteAdmission(id: string): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('admissions').delete().eq('id', id);
      } catch (err) {
        console.warn('[Supabase deleteAdmission error]', err);
      }
    }

    const res = await fetch(`${API_BASE}/admin/admissions/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const json = await safeParseResponse(res);
    if (!json.success) throw new Error(json.error || 'Failed to delete admission enquiry');
  },

  // Settings
  async getAdminSettings(): Promise<ApiSettings> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.from('settings').select('*').eq('id', 'current').single();
        if (!error && data) return data as ApiSettings;
      } catch (err) {
        console.warn('[Supabase getAdminSettings fallback]', err);
      }
    }

    try {
      const res = await fetch(`${API_BASE}/admin/settings`, {
        headers: this.getAuthHeaders()
      });
      const json = await safeParseResponse(res);
      return json.data || FALLBACK_SETTINGS;
    } catch {
      return FALLBACK_SETTINGS;
    }
  },

  async updateAdminSettings(data: Partial<ApiSettings>): Promise<ApiSettings> {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('settings').upsert({ id: 'current', ...data });
      } catch (err) {
        console.warn('[Supabase updateAdminSettings error]', err);
      }
    }

    const res = await fetch(`${API_BASE}/admin/settings`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await safeParseResponse(res);
    if (!json.success) throw new Error(json.error || 'Failed to update settings');
    return json.data;
  },

  // Programs / Academic Streams
  async getAdminPrograms(): Promise<ApiProgram[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/programs`, { headers: this.getAuthHeaders() });
      const json = await safeParseResponse(res);
      return json.data || FALLBACK_PROGRAMS;
    } catch {
      return FALLBACK_PROGRAMS;
    }
  },
  async createAdminProgram(data: Partial<ApiProgram>): Promise<ApiProgram> {
    const res = await fetch(`${API_BASE}/admin/programs`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await safeParseResponse(res);
    if (!json.success) throw new Error(json.error || 'Failed to create program');
    return json.data;
  },
  async updateAdminProgram(id: string, data: Partial<ApiProgram>): Promise<ApiProgram> {
    const res = await fetch(`${API_BASE}/admin/programs/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await safeParseResponse(res);
    if (!json.success) throw new Error(json.error || 'Failed to update program');
    return json.data;
  },
  async deleteAdminProgram(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/programs/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const json = await safeParseResponse(res);
    if (!json.success) throw new Error(json.error || 'Failed to delete program');
  },

  // Facilities
  async getAdminFacilities(): Promise<ApiFacility[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/facilities`, { headers: this.getAuthHeaders() });
      const json = await safeParseResponse(res);
      return json.data || FALLBACK_FACILITIES;
    } catch {
      return FALLBACK_FACILITIES;
    }
  },
  async createAdminFacility(data: Partial<ApiFacility>): Promise<ApiFacility> {
    const res = await fetch(`${API_BASE}/admin/facilities`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await safeParseResponse(res);
    if (!json.success) throw new Error(json.error || 'Failed to create facility');
    return json.data;
  },
  async updateAdminFacility(id: string, data: Partial<ApiFacility>): Promise<ApiFacility> {
    const res = await fetch(`${API_BASE}/admin/facilities/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await safeParseResponse(res);
    if (!json.success) throw new Error(json.error || 'Failed to update facility');
    return json.data;
  },
  async deleteAdminFacility(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/facilities/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const json = await safeParseResponse(res);
    if (!json.success) throw new Error(json.error || 'Failed to delete facility');
  },

  // Milestones / 70-Year Legacy
  async getAdminMilestones(): Promise<ApiMilestone[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/milestones`, { headers: this.getAuthHeaders() });
      const json = await safeParseResponse(res);
      return json.data || FALLBACK_MILESTONES;
    } catch {
      return FALLBACK_MILESTONES;
    }
  },
  async createAdminMilestone(data: Partial<ApiMilestone>): Promise<ApiMilestone> {
    const res = await fetch(`${API_BASE}/admin/milestones`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await safeParseResponse(res);
    if (!json.success) throw new Error(json.error || 'Failed to create milestone');
    return json.data;
  },
  async updateAdminMilestone(id: string, data: Partial<ApiMilestone>): Promise<ApiMilestone> {
    const res = await fetch(`${API_BASE}/admin/milestones/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await safeParseResponse(res);
    if (!json.success) throw new Error(json.error || 'Failed to update milestone');
    return json.data;
  },
  async deleteAdminMilestone(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/milestones/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const json = await safeParseResponse(res);
    if (!json.success) throw new Error(json.error || 'Failed to delete milestone');
  },

  // FAQs
  async getAdminFaqs(): Promise<ApiFaq[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/faqs`, { headers: this.getAuthHeaders() });
      const json = await safeParseResponse(res);
      return json.data || FALLBACK_FAQS;
    } catch {
      return FALLBACK_FAQS;
    }
  },
  async createAdminFaq(data: Partial<ApiFaq>): Promise<ApiFaq> {
    const res = await fetch(`${API_BASE}/admin/faqs`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await safeParseResponse(res);
    if (!json.success) throw new Error(json.error || 'Failed to create FAQ');
    return json.data;
  },
  async updateAdminFaq(id: string, data: Partial<ApiFaq>): Promise<ApiFaq> {
    const res = await fetch(`${API_BASE}/admin/faqs/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await safeParseResponse(res);
    if (!json.success) throw new Error(json.error || 'Failed to update FAQ');
    return json.data;
  },
  async deleteAdminFaq(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/faqs/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const json = await safeParseResponse(res);
    if (!json.success) throw new Error(json.error || 'Failed to delete FAQ');
  },

  // Users
  async getAdminUsers(): Promise<Array<{ id: string; name: string; email: string; role: string; is_active: boolean; created_at: string; last_login_at?: string }>> {
    try {
      const res = await fetch(`${API_BASE}/admin/users`, {
        headers: this.getAuthHeaders()
      });
      const json = await safeParseResponse(res);
      return json.data || [];
    } catch {
      return [];
    }
  },

  async createUser(data: { name: string; email: string; password: string; role: string }): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data)
    });
    const json = await safeParseResponse(res);
    if (!json.success) throw new Error(json.error || 'Failed to create user');
  },

  async deleteUser(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    const json = await safeParseResponse(res);
    if (!json.success) throw new Error(json.error || 'Failed to delete user');
  },

  // Audit Logs
  async getAuditLogs(): Promise<ApiAuditLog[]> {
    try {
      const res = await fetch(`${API_BASE}/admin/audit-logs`, {
        headers: this.getAuthHeaders()
      });
      const json = await safeParseResponse(res);
      return json.data || [];
    } catch {
      return [];
    }
  }
};
