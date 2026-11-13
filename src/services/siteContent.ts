import { supabase, isSupabaseConfigured } from '../lib/supabase';

export type SiteContentKey = 'header' | 'hero' | 'footer' | 'homepage' | 'contact' | 'branding';
export type SiteContentMap = Record<string, any>;

export const SITE_CONTENT_DEFAULTS: Record<SiteContentKey, SiteContentMap> = {
  header: {
    schoolName: 'SKM High School', subtitle: 'Est. 1956 • Sarvoday Kelavani Mandal',
    links: [
      { name: 'Home', href: '#home', id: 'home', visible: true },
      { name: 'Announcements', href: '#announcements', id: 'announcements', visible: true },
      { name: 'Legacy', href: '#legacy', id: 'legacy', visible: true },
      { name: 'Academics', href: '#academics', id: 'academics', visible: true },
      { name: 'Faculty', href: '#teachers', id: 'teachers', visible: true },
      { name: 'Achievements', href: '#achievements', id: 'achievements', visible: true },
      { name: 'Facilities', href: '#facilities', id: 'facilities', visible: true },
      { name: 'Gallery', href: '#gallery', id: 'gallery', visible: true },
      { name: 'Contact', href: '#contact', id: 'contact', visible: true }
    ]
  },
  hero: { badge: 'Est. 1956 • Sarvoday Kelavani Mandal, Kanodar', headline: 'Empowering Minds, Shaping Futures Since 1956', subheadline: 'Providing quality, value-centric, and modern education in Kanodar.', primaryButton: 'View Announcements', secondaryButton: 'Explore Our Campus', backgroundImage: '' },
  footer: { schoolTitle: 'SKM High School & Higher Secondary School', locationLine: 'Kanodar, Gujarat • Est. 1956', trustLine: 'Managed by Sarvoday Kelavani Mandal, Kanodar', description: 'Empowering generations of students with academic distinction, moral integrity, scientific mindset, and vocational self-reliance.', copyright: 'SKM High School. All rights reserved.' },
  homepage: { announcementsTitle: 'Announcements & Notifications', managementTitle: 'Message from School Management', academicsTitle: 'Academic Programs & Streams', facultyTitle: 'Teachers & Faculty Directory', achievementsTitle: 'Our Achievements & Distinctions', facilitiesTitle: 'World-Class Campus Facilities', galleryTitle: 'Vibrant Moments at SKM Kanodar', admissionTitle: 'Apply for Admission', faqTitle: 'Frequently Asked Questions' },
  contact: { phone: '', email: '', address: '', officeHours: '' },
  branding: { logoUrl: '', primaryColor: '#d99a18', accentColor: '#0f2747', fontFamily: 'Inter' }
};

export async function getSiteContent(key: SiteContentKey): Promise<SiteContentMap> {
  if (!isSupabaseConfigured() || !supabase) return SITE_CONTENT_DEFAULTS[key];
  const { data, error } = await supabase.from('site_content').select('content').eq('content_key', key).eq('is_published', true).maybeSingle();
  if (error || !data?.content) return SITE_CONTENT_DEFAULTS[key];
  return { ...SITE_CONTENT_DEFAULTS[key], ...data.content };
}

export async function saveSiteContent(key: SiteContentKey, content: SiteContentMap, publish = true) {
  if (!isSupabaseConfigured() || !supabase) throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  const { error } = await supabase.from('site_content').upsert({ content_key: key, content, is_published: publish, updated_at: new Date().toISOString() }, { onConflict: 'content_key' });
  if (error) throw error;
}
