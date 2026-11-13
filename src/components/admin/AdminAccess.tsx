import React, { useEffect, useState } from "react";
import { Loader2, RefreshCw, Shield, UserCheck, UserX } from "lucide-react";
import { supabase, isSupabaseConfigured } from "../../lib/supabase";

type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: "super_admin" | "content_admin" | "viewer";
  is_active: boolean;
  created_at: string;
};
export const AdminAccess: React.FC<{
  isDark: boolean;
  notify: (message: string, type?: "success" | "error") => void;
}> = ({ isDark, notify }) => {
  const [rows, setRows] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    if (!supabase || !isSupabaseConfigured()) {
      setLoading(false);
      notify("Configure Supabase before managing admin accounts.", "error");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("admin_profiles")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) notify(error.message, "error");
    else setRows((data || []) as Profile[]);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);
  const update = async (id: string, patch: Partial<Profile>) => {
    if (!supabase) return;
    const { error } = await supabase
      .from("admin_profiles")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id);
    if (error) notify(error.message, "error");
    else {
      notify("Administrator profile updated.");
      load();
    }
  };
  const panel = `rounded-2xl border ${isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"}`;
  return (
    <div className="space-y-5 max-w-6xl">
      <div className="flex justify-between gap-3 items-start">
        <div>
          <h2 className="text-xl font-extrabold">Administrator Access</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage Supabase Auth users that have an administrator profile.
          </p>
        </div>
        <button
          onClick={load}
          className="rounded-xl border px-3 py-2 text-sm flex items-center gap-2"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>
      <div className={`${panel} p-4 text-sm`}>
        <p className="font-bold flex items-center gap-2">
          <Shield size={17} className="text-amber-500" />
          Adding a new administrator
        </p>
        <ol className="list-decimal pl-5 mt-2 space-y-1 text-slate-500">
          <li>Create/invite the user in Supabase → Authentication → Users.</li>
          <li>Copy their Auth User UID.</li>
          <li>
            Insert a matching row in <code>admin_profiles</code> with their
            email, full name and role (see SETUP_GUIDE.md).
          </li>
          <li>
            They can then sign in at <code>/admin</code>.
          </li>
        </ol>
      </div>
      <div className={`${panel} overflow-hidden`}>
        <div className="p-4 border-b border-slate-200/20 font-bold">
          Registered administrators ({rows.length})
        </div>
        {loading ? (
          <div className="p-10 flex justify-center">
            <Loader2 className="animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            No administrator profiles found. Bootstrap the first Super Admin
            using the SQL guide.
          </div>
        ) : (
          <div className="divide-y divide-slate-200/10">
            {rows.map((r) => (
              <div
                key={r.id}
                className="p-4 flex flex-col md:flex-row md:items-center gap-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{r.full_name}</p>
                  <p className="text-xs text-slate-500">{r.email}</p>
                  <p className="text-[10px] text-slate-500 mt-1">UID: {r.id}</p>
                </div>
                <select
                  value={r.role}
                  onChange={(e) =>
                    update(r.id, { role: e.target.value as Profile["role"] })
                  }
                  className={`rounded-lg border px-3 py-2 text-xs ${isDark ? "bg-slate-950 border-slate-700" : "bg-white border-slate-200"}`}
                >
                  <option value="super_admin">Super Admin</option>
                  <option value="content_admin">Content Admin</option>
                  <option value="viewer">Viewer</option>
                </select>
                <button
                  onClick={() => update(r.id, { is_active: !r.is_active })}
                  className={`rounded-lg px-3 py-2 text-xs font-bold inline-flex items-center gap-2 ${r.is_active ? "bg-emerald-500/10 text-emerald-600" : "bg-rose-500/10 text-rose-600"}`}
                >
                  {r.is_active ? (
                    <>
                      <UserCheck size={14} />
                      Active
                    </>
                  ) : (
                    <>
                      <UserX size={14} />
                      Disabled
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
