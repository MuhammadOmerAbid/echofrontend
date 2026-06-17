"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, MapPin, ShieldCheck, AlertTriangle, XCircle } from "lucide-react";
import {
  getSettings, updateSettings, getAdminMe,
  addLocation, deleteLocation, getQAMetrics,
  type SettingsData, type LocationRow, type QAMetrics,
} from "@/lib/api";
import { isAuthenticated } from "@/lib/auth";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminPageSkeleton from "@/components/layout/AdminPageSkeleton";
import Card from "@/components/ui/Card";

const fieldCls =
  "w-full border text-sm px-4 py-2.5 rounded-xl outline-none transition-colors"
  + " bg-white focus:border-sage/50"
  + " border-[rgba(0,0,0,0.1)]"
  + " text-[#111210] placeholder:text-[#8c897f]";

const smFieldCls =
  "border text-sm px-3 py-2 rounded-lg outline-none transition-colors"
  + " bg-white focus:border-sage/50 border-[rgba(0,0,0,0.1)]"
  + " text-[#111210] placeholder:text-[#8c897f]";

function SaveBtn({ loading, label = "Save Changes" }: { loading?: boolean; label?: string }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="bg-sage hover:bg-sage2 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
    >
      {loading ? "Saving…" : label}
    </button>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const [settings, setSettings]       = useState<SettingsData | null>(null);
  const [institution, setIns]         = useState("");
  const [loading, setLoading]         = useState(true);
  const [locations, setLocations]     = useState<LocationRow[]>([]);

  const [instName, setInstName]       = useState("");
  const [instCity, setInstCity]       = useState("");
  const [instSaving, setInstSaving]   = useState(false);
  const [instMsg, setInstMsg]         = useState("");

  const [currPw, setCurrPw]           = useState("");
  const [newPw, setNewPw]             = useState("");
  const [confirmPw, setConfirmPw]     = useState("");
  const [pwSaving, setPwSaving]       = useState(false);
  const [pwMsg, setPwMsg]             = useState("");
  const [pwError, setPwError]         = useState("");

  const [locName, setLocName]         = useState("");
  const [locBuilding, setLocBuilding] = useState("");
  const [locX, setLocX]               = useState("1");
  const [locY, setLocY]               = useState("1");
  const [locAdding, setLocAdding]     = useState(false);
  const [locMsg, setLocMsg]           = useState("");
  const [locError, setLocError]       = useState("");
  const [deletingId, setDeletingId]   = useState<number | null>(null);
  const [qa, setQA]                   = useState<QAMetrics | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) { router.replace("/admin/login"); return; }
    Promise.all([getSettings(), getAdminMe(), getQAMetrics()])
      .then(([s, me, q]) => {
        setSettings(s);
        setInstName(s.institution_name);
        setInstCity(s.institution_city);
        setLocations(s.locations);
        setIns(me.institution);
        setQA(q);
      })
      .catch((err) => { if (err.message === "UNAUTHORIZED") router.replace("/admin/login"); })
      .finally(() => setLoading(false));
  }, [router]);

  async function saveInstitution(e: React.FormEvent) {
    e.preventDefault();
    setInstSaving(true); setInstMsg("");
    try {
      await updateSettings({ institution_name: instName, institution_city: instCity });
      setInstMsg("Saved successfully."); setIns(instName);
    } catch { setInstMsg("Save failed. Please try again."); }
    finally { setInstSaving(false); }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(""); setPwMsg("");
    if (newPw !== confirmPw) { setPwError("Passwords don't match."); return; }
    if (newPw.length < 6) { setPwError("New password must be at least 6 characters."); return; }
    setPwSaving(true);
    try {
      await updateSettings({ current_password: currPw, new_password: newPw });
      setPwMsg("Password updated successfully.");
      setCurrPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: any) { setPwError(err.message ?? "Failed to update password."); }
    finally { setPwSaving(false); }
  }

  async function handleAddLocation(e: React.FormEvent) {
    e.preventDefault();
    setLocError(""); setLocMsg("");
    const x = parseInt(locX); const y = parseInt(locY);
    if (!locName.trim()) { setLocError("Location name is required."); return; }
    if (isNaN(x) || x < 1 || x > 5 || isNaN(y) || y < 1 || y > 5) {
      setLocError("Grid coordinates must be between 1 and 5."); return;
    }
    setLocAdding(true);
    try {
      const res = await addLocation({ name: locName.trim(), building: locBuilding.trim(), x_grid: x, y_grid: y });
      setLocations(res.locations);
      setLocName(""); setLocBuilding(""); setLocX("1"); setLocY("1");
      setLocMsg("Location added.");
      setTimeout(() => setLocMsg(""), 2500);
    } catch (err: any) {
      setLocError(
        err.message?.includes("409") || err.message?.toLowerCase().includes("already")
          ? "A location with that name already exists."
          : err.message ?? "Failed to add location."
      );
    } finally { setLocAdding(false); }
  }

  async function handleDeleteLocation(id: number) {
    setDeletingId(id);
    try {
      const res = await deleteLocation(id);
      setLocations(res.locations);
    } catch { /* keep list unchanged on error */ }
    finally { setDeletingId(null); }
  }

  if (loading) return <AdminPageSkeleton />;

  return (
    <>
      <AdminSidebar institution={institution} />

      <main style={{ marginLeft: 252, marginRight: 16, marginTop: 16, marginBottom: 16, minHeight: "calc(100vh - 32px)", borderRadius: 20, background: "#ffffff", boxShadow: "0 4px 24px rgba(0,0,0,0.07), 0 0 0 1px rgba(0,0,0,0.06)", overflowY: "auto" }}>
        <div className="px-8 py-5" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <div className="font-sans font-medium uppercase mb-1" style={{ fontSize: 9, letterSpacing: "0.22em", color: "#8c897f" }}>
            System Settings
          </div>
          <h1 className="font-display font-bold" style={{ fontSize: 26, color: "#111210", lineHeight: 1.1 }}>
            Configuration <span style={{ color: "#e8580a" }}>Panel</span>
          </h1>
          <p className="font-sans font-light mt-1" style={{ fontSize: 12, color: "#8c897f" }}>
            Institution info · password management · categories · locations
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="px-8 py-6 space-y-5 max-w-3xl"
        >
          {/* QA Health Card */}
          {qa && (() => {
            const healthColor  = qa.health === "good" ? "#16a34a" : qa.health === "degraded" ? "#d97706" : "#dc2626";
            const healthBg     = qa.health === "good" ? "rgba(22,163,74,0.07)" : qa.health === "degraded" ? "rgba(217,119,6,0.07)" : "rgba(220,38,38,0.07)";
            const HealthIcon   = qa.health === "good" ? ShieldCheck : qa.health === "degraded" ? AlertTriangle : XCircle;
            const metrics = [
              { label: "Total Submissions", value: qa.total, warn: false },
              { label: "Processed",         value: `${qa.processed} (${qa.processed_rate_pct}%)`, warn: qa.processed_rate_pct < 95 },
              { label: "Unprocessed",       value: qa.unprocessed,              warn: qa.unprocessed > 0 },
              { label: "Empty Cleaned Text",value: qa.empty_clean_text,         warn: qa.empty_clean_text > 0 },
              { label: "Unknown Location",  value: qa.unknown_location_count,   warn: qa.unknown_location_count > 0 },
              { label: "Missing Keywords",  value: qa.missing_keywords,         warn: qa.missing_keywords > 0 },
              { label: "Sentiment Errors",  value: qa.sentiment_out_of_range,   warn: qa.sentiment_out_of_range > 0 },
              { label: "Duplicate Texts",   value: qa.duplicate_text_count,     warn: qa.duplicate_text_count > 0 },
            ];
            return (
              <Card title="Data Quality Report">
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", borderRadius: 12, background: healthBg, border: `1px solid ${healthColor}30`, marginBottom: 16 }}>
                  <HealthIcon size={18} color={healthColor} strokeWidth={2} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: healthColor, textTransform: "uppercase", letterSpacing: "0.12em" }}>
                      {qa.health === "good" ? "Pipeline Healthy" : qa.health === "degraded" ? "Pipeline Degraded" : "Pipeline Critical"}
                    </div>
                    <div style={{ fontSize: 11, color: "#8c897f", marginTop: 1 }}>
                      {qa.processed_rate_pct}% of submissions fully processed by NLP
                    </div>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {metrics.map(({ label, value, warn }) => (
                    <div key={label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderRadius: 10, background: warn ? "rgba(220,38,38,0.05)" : "#f7f5ef", border: `1px solid ${warn ? "rgba(220,38,38,0.15)" : "#e8e4db"}` }}>
                      <span style={{ fontSize: 11, color: "#8c897f" }}>{label}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: warn ? "#dc2626" : "#111210" }}>{value}</span>
                    </div>
                  ))}
                </div>
                {(qa.unprocessed > 0 || qa.unknown_location_count > 0) && (
                  <p style={{ fontSize: 11, color: "#8c897f", marginTop: 10, lineHeight: 1.6 }}>
                    Unprocessed rows are caught on the next admin page load. Unknown locations are legacy rows submitted before location validation was enforced.
                  </p>
                )}
              </Card>
            );
          })()}

          {/* Institution Info */}
          <Card title="Institution Information">
            <form onSubmit={saveInstitution} className="space-y-4">
              <div>
                <label className="block font-sans font-medium text-xs uppercase tracking-[0.18em] mb-2" style={{ color: "#8c897f" }}>
                  Institution Name
                </label>
                <input value={instName} onChange={(e) => setInstName(e.target.value)}
                  placeholder="e.g. FAST-NUCES Lahore" className={fieldCls} />
              </div>
              <div>
                <label className="block font-sans font-medium text-xs uppercase tracking-[0.18em] mb-2" style={{ color: "#8c897f" }}>
                  City (optional)
                </label>
                <input value={instCity} onChange={(e) => setInstCity(e.target.value)}
                  placeholder="e.g. Lahore" className={fieldCls} />
              </div>
              <div className="flex items-center gap-4">
                <SaveBtn loading={instSaving} />
                {instMsg && (
                  <span className="font-sans font-light text-sm" style={{ color: instMsg.includes("failed") ? "#dc2626" : "#e8580a" }}>
                    {instMsg}
                  </span>
                )}
              </div>
            </form>
          </Card>

          {/* Password Change */}
          <Card title="Change Admin Password">
            <form onSubmit={savePassword} className="space-y-4">
              <div>
                <label className="block font-sans font-medium text-xs uppercase tracking-[0.18em] mb-2" style={{ color: "#8c897f" }}>
                  Current Password
                </label>
                <input type="password" value={currPw} onChange={(e) => setCurrPw(e.target.value)}
                  placeholder="Enter current password" className={fieldCls} required />
              </div>
              <div>
                <label className="block font-sans font-medium text-xs uppercase tracking-[0.18em] mb-2" style={{ color: "#8c897f" }}>
                  New Password
                </label>
                <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)}
                  placeholder="Min. 6 characters" className={fieldCls} required />
                {newPw && (
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4].map((l) => (
                      <div key={l} className="h-1 flex-1 rounded-full transition-colors"
                        style={{ background: newPw.length >= l * 3 ? "#e8580a" : "#e8e4db" }} />
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block font-sans font-medium text-xs uppercase tracking-[0.18em] mb-2" style={{ color: "#8c897f" }}>
                  Confirm New Password
                </label>
                <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)}
                  placeholder="Repeat new password" className={fieldCls} required />
              </div>
              {pwError && (
                <div className="px-4 py-3 rounded-xl text-sm font-light"
                  style={{ background: "#fee2e2", color: "#dc2626", border: "1px solid #fecaca" }}>
                  {pwError}
                </div>
              )}
              <div className="flex items-center gap-4">
                <SaveBtn loading={pwSaving} label="Update Password" />
                {pwMsg && <span className="font-sans font-light text-sm" style={{ color: "#e8580a" }}>{pwMsg}</span>}
              </div>
            </form>
          </Card>

          {/* Categories — read-only */}
          {settings && (
            <Card title="Configured Categories">
              <p className="font-sans font-light text-sm mb-4" style={{ color: "#8c897f" }}>
                Categories are set during setup. Re-run the setup wizard to modify them.
              </p>
              <div className="space-y-2">
                {settings.categories.map((cat) => (
                  <div key={cat.id} className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background: "#f7f5ef", border: "1px solid #e8e4db" }}>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ background: cat.color }} />
                      <span className="font-sans font-medium text-sm" style={{ color: "#111210" }}>{cat.name}</span>
                    </div>
                    <span className="font-mono text-[10px]" style={{ color: "#8c897f" }}>{cat.color}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Locations — editable */}
          <Card title="Campus Locations">
            {/* Add form */}
            <form onSubmit={handleAddLocation} className="mb-5 p-4 rounded-xl"
              style={{ background: "rgba(232,88,10,0.04)", border: "1px solid rgba(232,88,10,0.12)" }}>
              <div className="font-sans font-medium uppercase mb-3" style={{ fontSize: 9, letterSpacing: "0.18em", color: "#e8580a" }}>
                Add New Location
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input value={locName} onChange={(e) => setLocName(e.target.value)}
                  placeholder="Location name *" className={`${smFieldCls} col-span-2`} />
                <input value={locBuilding} onChange={(e) => setLocBuilding(e.target.value)}
                  placeholder="Building / block (optional)" className={smFieldCls} />
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-[10px] font-medium mb-1" style={{ color: "#8c897f" }}>Grid X (1–5)</label>
                    <input type="number" min={1} max={5} value={locX}
                      onChange={(e) => setLocX(e.target.value)} className={`${smFieldCls} w-full`} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-medium mb-1" style={{ color: "#8c897f" }}>Grid Y (1–5)</label>
                    <input type="number" min={1} max={5} value={locY}
                      onChange={(e) => setLocY(e.target.value)} className={`${smFieldCls} w-full`} />
                  </div>
                </div>
              </div>
              {locError && <p className="text-xs mb-3 font-light" style={{ color: "#dc2626" }}>{locError}</p>}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={locAdding}
                  className="flex items-center gap-2 bg-sage hover:bg-sage2 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus size={14} />
                  {locAdding ? "Adding…" : "Add Location"}
                </button>
                {locMsg && <span className="text-sm font-light" style={{ color: "#e8580a" }}>{locMsg}</span>}
              </div>
            </form>

            {/* List */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {locations.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 gap-2" style={{ color: "#8c897f" }}>
                  <MapPin size={22} strokeWidth={1.4} />
                  <span className="text-sm font-light">No locations yet. Add one above.</span>
                </div>
              )}
              <AnimatePresence initial={false}>
                {locations.map((loc) => (
                  <motion.div key={loc.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ overflow: "hidden" }}
                  >
                    <div className="flex items-center justify-between px-4 py-3 rounded-xl"
                      style={{ background: "#f7f5ef", border: "1px solid #e8e4db" }}>
                      <div>
                        <div className="font-sans font-medium text-sm" style={{ color: "#111210" }}>{loc.name}</div>
                        {loc.building && (
                          <div className="font-sans font-light text-xs" style={{ color: "#8c897f" }}>{loc.building}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="font-mono text-[10px]" style={{ color: "#8c897f" }}>
                          ({loc.x_grid}, {loc.y_grid})
                        </div>
                        <button
                          onClick={() => handleDeleteLocation(loc.id)}
                          disabled={deletingId === loc.id}
                          className="p-1.5 rounded-lg transition-colors hover:bg-red-50 disabled:opacity-40"
                          title="Delete location"
                        >
                          <Trash2 size={13} color={deletingId === loc.id ? "#8c897f" : "#dc2626"} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <p className="font-sans font-light text-xs mt-3" style={{ color: "#8c897f" }}>
              {locations.length} location{locations.length !== 1 ? "s" : ""} · Grid coords map to the 5×5 campus heatmap
            </p>
          </Card>

          {/* Data & Privacy */}
          <Card title="Data & Privacy">
            <div className="space-y-3 font-sans font-light text-sm" style={{ color: "#5a5c58", lineHeight: 1.7 }}>
              <p>
                All data is stored locally in{" "}
                <code className="font-mono text-xs px-1.5 py-0.5 rounded" style={{ background: "#f0ede7", color: "#e8580a" }}>data/echo.db</code> (SQLite).
                No data ever leaves this machine.
              </p>
              <p>
                Student submissions are structurally anonymous. UUID4 tokens are generated per submission — random
                and not linked to any identity. Even the database owner cannot de-anonymise them.
              </p>
              <p>
                Rate limiting prevents spam (max 3 submissions/hour per browser session). Session IDs are random
                strings generated in the browser — never stored server-side beyond the rate-limit table.
              </p>
              <div className="flex gap-3 pt-2">
                {[
                  ["Encryption", "SQLite WAL mode"],
                  ["Auth", "bcrypt + JWT (1hr TTL)"],
                  ["Input", "bleach.clean + Pydantic"],
                ].map(([k, v]) => (
                  <div key={k} className="px-3 py-2 rounded-lg font-sans font-light text-xs" style={{ background: "#f0ede7", color: "#5a5c58" }}>
                    <span className="font-medium" style={{ color: "#e8580a" }}>{k}:</span> {v}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </main>
    </>
  );
}
