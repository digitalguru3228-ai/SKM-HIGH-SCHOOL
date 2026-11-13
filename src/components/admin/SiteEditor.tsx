import React, { useEffect, useState } from "react";
import {
  Check,
  Eye,
  Globe,
  Image,
  Layout,
  Loader2,
  Menu,
  Save,
  Settings2,
} from "lucide-react";
import {
  getSiteContent,
  saveSiteContent,
  SITE_CONTENT_DEFAULTS,
  SiteContentKey,
} from "../../services/siteContent";

const groups: {
  key: SiteContentKey;
  title: string;
  description: string;
  icon: React.ElementType;
  fields: {
    key: string;
    label: string;
    multiline?: boolean;
    placeholder?: string;
  }[];
}[] = [
  {
    key: "header",
    title: "Navbar & Header",
    description:
      "School identity and navigation links. Edit labels, destinations and visibility.",
    icon: Menu,
    fields: [
      { key: "schoolName", label: "School name" },
      { key: "subtitle", label: "Header subtitle" },
      {
        key: "linksText",
        label: "Navigation links (one per line: Label | #section)",
        multiline: true,
        placeholder: "Home | #home\nAbout | #about",
      },
    ],
  },
  {
    key: "hero",
    title: "Homepage Hero",
    description: "Main banner content, CTA labels and background image URL.",
    icon: Layout,
    fields: [
      { key: "badge", label: "Top badge" },
      { key: "headline", label: "Main headline" },
      { key: "subheadline", label: "Supporting text", multiline: true },
      { key: "primaryButton", label: "Primary button label" },
      { key: "secondaryButton", label: "Secondary button label" },
      { key: "backgroundImage", label: "Background image URL" },
    ],
  },
  {
    key: "homepage",
    title: "Homepage Sections",
    description: "Section headings shown across the homepage.",
    icon: Settings2,
    fields: [
      { key: "announcementsTitle", label: "Announcements heading" },
      { key: "managementTitle", label: "Management message heading" },
      { key: "academicsTitle", label: "Academics heading" },
      { key: "facultyTitle", label: "Faculty heading" },
      { key: "achievementsTitle", label: "Achievements heading" },
      { key: "facilitiesTitle", label: "Facilities heading" },
      { key: "galleryTitle", label: "Gallery heading" },
      { key: "admissionTitle", label: "Admissions heading" },
      { key: "faqTitle", label: "FAQ heading" },
    ],
  },
  {
    key: "footer",
    title: "Footer",
    description: "Footer branding and closing message.",
    icon: Globe,
    fields: [
      { key: "schoolTitle", label: "Footer school title" },
      { key: "locationLine", label: "Location line" },
      { key: "trustLine", label: "Trust / management line" },
      { key: "description", label: "Footer description", multiline: true },
      { key: "copyright", label: "Copyright text" },
    ],
  },
  {
    key: "contact",
    title: "Contact Details",
    description: "CMS-managed contact details for use across the site.",
    icon: Globe,
    fields: [
      { key: "phone", label: "Phone" },
      { key: "email", label: "Email" },
      { key: "address", label: "Address", multiline: true },
      { key: "officeHours", label: "Office hours" },
    ],
  },
  {
    key: "branding",
    title: "Branding & Theme",
    description:
      "Logo URL updates the live header/footer mark. Theme colour and font values are saved as CMS settings.",
    icon: Image,
    fields: [
      { key: "logoUrl", label: "Logo image URL" },
      { key: "primaryColor", label: "Primary colour (hex)" },
      { key: "accentColor", label: "Accent colour (hex)" },
      { key: "fontFamily", label: "Font family" },
    ],
  },
];

export const SiteEditor: React.FC<{
  isDark: boolean;
  notify: (message: string, type?: "success" | "error") => void;
}> = ({ isDark, notify }) => {
  const [selected, setSelected] = useState<SiteContentKey>("header");
  const [values, setValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [published, setPublished] = useState(true);
  const group = groups.find((g) => g.key === selected)!;
  const inputClass = `w-full rounded-xl border px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500/30 ${isDark ? "bg-slate-950 border-slate-700 text-white" : "bg-white border-slate-200 text-slate-900"}`;

  useEffect(() => {
    let live = true;
    setLoading(true);
    getSiteContent(selected)
      .then((data) => {
        if (live) {
          const next = { ...data };
          if (selected === "header")
            next.linksText = (data.links || [])
              .map((l: any) => `${l.name} | ${l.href}`)
              .join("\n");
          setValues(next);
        }
      })
      .catch(() => notify("Could not load content from Supabase.", "error"))
      .finally(() => live && setLoading(false));
    return () => {
      live = false;
    };
  }, [selected]);

  const save = async () => {
    setSaving(true);
    try {
      const next = { ...values };
      if (selected === "header" && typeof next.linksText === "string") {
        next.links = next.linksText
          .split("\n")
          .map((line: string) => line.split("|"))
          .filter((p: string[]) => p.length >= 2 && p[0].trim() && p[1].trim())
          .map((p: string[]) => ({
            name: p[0].trim(),
            href: p[1].trim(),
            id: p[1].trim().replace(/^#/, ""),
            visible: true,
          }));
        delete next.linksText;
      }
      await saveSiteContent(selected, next, published);
      notify(`${group.title} saved to Supabase.`, "success");
    } catch (e: any) {
      notify(
        e?.message || "Save failed. Check Supabase table and permissions.",
        "error",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold">Website Content Studio</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage global website content. Published values are read by the
            public website from Supabase.
          </p>
        </div>
        <span className="text-xs rounded-full px-3 py-1.5 bg-emerald-500/10 text-emerald-600 font-bold">
          Supabase CMS
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[230px_1fr] gap-4">
        <aside
          className={`rounded-2xl border p-2 space-y-1 h-fit ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
        >
          {groups.map((g) => {
            const Icon = g.icon;
            return (
              <button
                key={g.key}
                onClick={() => setSelected(g.key)}
                className={`w-full flex items-center gap-3 text-left rounded-xl px-3 py-3 text-sm font-semibold ${selected === g.key ? "bg-amber-500 text-white" : isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-50"}`}
              >
                <Icon size={17} />
                {g.title}
              </button>
            );
          })}
        </aside>
        <section
          className={`rounded-2xl border p-5 sm:p-6 ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`}
        >
          <div className="mb-5">
            <h3 className="text-lg font-bold">{group.title}</h3>
            <p className="text-sm text-slate-500 mt-1">{group.description}</p>
          </div>
          {loading ? (
            <div className="py-16 flex justify-center">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.fields.map((f) => (
                <label
                  key={f.key}
                  className={
                    f.multiline ? "md:col-span-2 space-y-1.5" : "space-y-1.5"
                  }
                >
                  <span className="text-xs font-bold text-slate-500">
                    {f.label}
                  </span>
                  {f.multiline ? (
                    <textarea
                      rows={f.key === "linksText" ? 8 : 3}
                      className={inputClass}
                      placeholder={f.placeholder}
                      value={values[f.key] || ""}
                      onChange={(e) =>
                        setValues((v: any) => ({
                          ...v,
                          [f.key]: e.target.value,
                        }))
                      }
                    />
                  ) : (
                    <input
                      className={inputClass}
                      value={values[f.key] || ""}
                      onChange={(e) =>
                        setValues((v: any) => ({
                          ...v,
                          [f.key]: e.target.value,
                        }))
                      }
                    />
                  )}
                </label>
              ))}
            </div>
          )}
          <div className="mt-6 pt-4 border-t border-slate-200/20 flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="accent-amber-500"
              />{" "}
              Publish immediately
            </label>
            <button
              disabled={saving || loading}
              onClick={save}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 px-5 py-2.5 text-sm font-bold text-slate-950"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Save to Supabase
            </button>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            Note: the SQL migration must be applied and your logged-in Supabase
            user must have an authorized admin profile before saving.
          </p>
        </section>
      </div>
    </div>
  );
};
