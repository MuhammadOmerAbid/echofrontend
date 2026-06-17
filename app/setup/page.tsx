"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { completeSetup } from "@/lib/api";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import ErrorBox from "@/components/ui/ErrorBox";

interface LocationRow {
  name: string;
  building: string;
  x_grid: number;
  y_grid: number;
}

const DEFAULT_LOCS: LocationRow[] = [
  { name: "Main Library",      building: "Library Block",    x_grid: 3, y_grid: 1 },
  { name: "CS Lab",            building: "Engineering Block", x_grid: 1, y_grid: 2 },
  { name: "Cafeteria",         building: "Student Center",   x_grid: 2, y_grid: 3 },
  { name: "Admin Block",       building: "Admin Building",   x_grid: 4, y_grid: 1 },
  { name: "Sports Ground",     building: "Grounds",          x_grid: 1, y_grid: 4 },
  { name: "Prayer Hall",       building: "Student Center",   x_grid: 3, y_grid: 3 },
  { name: "Lecture Hall A",    building: "Academic Block",   x_grid: 2, y_grid: 1 },
  { name: "Lecture Hall B",    building: "Academic Block",   x_grid: 2, y_grid: 2 },
  { name: "Girls Common Room", building: "Student Center",   x_grid: 4, y_grid: 3 },
  { name: "Main Gate",         building: "Entrance",         x_grid: 1, y_grid: 1 },
];

const STEPS = ["Institution", "Locations", "Password"];

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep]         = useState(1);
  const [name, setName]         = useState("");
  const [city, setCity]         = useState("");
  const [locs, setLocs]         = useState<LocationRow[]>(DEFAULT_LOCS);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  function addLoc() {
    setLocs([...locs, { name: "", building: "", x_grid: 0, y_grid: 0 }]);
  }

  function removeLoc(i: number) {
    setLocs(locs.filter((_, idx) => idx !== i));
  }

  function updateLoc(i: number, field: keyof LocationRow, val: string | number) {
    const u = [...locs];
    (u[i] as any)[field] = val;
    setLocs(u);
  }

  async function finish() {
    if (password !== confirm)  { setError("Passwords don't match."); return; }
    if (password.length < 6)   { setError("Password must be at least 6 characters."); return; }
    setError("");
    setLoading(true);
    try {
      await completeSetup({
        institution_name: name,
        institution_city: city,
        password,
        locations: locs.filter((l) => l.name.trim()),
      });
      router.push("/admin/login");
    } catch (err: any) {
      setError(err.message ?? "Setup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-6 py-12">
      <div className="font-serif italic text-ink text-2xl mb-10">
        <em className="text-sage2 not-italic">Ec</em>ho
      </div>

      {/* Stepper */}
      <div className="flex items-center gap-3 mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-3">
            <div className={`flex items-center gap-2 ${step > i + 1 ? "opacity-60" : ""}`}>
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-medium transition-colors ${
                  step === i + 1 ? "bg-sage text-white" : step > i + 1 ? "bg-sage/40 text-white" : "bg-black/10 text-stone"
                }`}
              >
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <span className={`text-[11px] font-medium ${step === i + 1 ? "text-ink" : "text-stone"}`}>{s}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-8 h-px ${step > i + 1 ? "bg-sage/40" : "bg-black/10"}`} />
            )}
          </div>
        ))}
      </div>

      <div className="w-full max-w-lg">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35 }} className="space-y-5">
              <div>
                <h2 className="font-display font-bold text-ink text-2xl mb-1">Name your campus.</h2>
                <p className="text-stone text-sm font-light">This appears in the admin dashboard header.</p>
              </div>
              <Input label="Institution Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. FAST-NUCES Lahore" />
              <Input label="City (optional)" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Lahore" />
              {error && <ErrorBox message={error} />}
              <Button fullWidth size="lg" onClick={() => { if (!name.trim()) { setError("Institution name is required."); return; } setError(""); setStep(2); }}>
                Next: Locations →
              </Button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35 }} className="space-y-4">
              <div>
                <h2 className="font-display font-bold text-ink text-2xl mb-1">Campus locations.</h2>
                <p className="text-stone text-sm font-light">Students will select from these when submitting.</p>
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {locs.map((l, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <input value={l.name} onChange={(e) => updateLoc(i, "name", e.target.value)} placeholder="Location name"
                      className="flex-1 bg-white border border-black/10 text-ink text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-sage placeholder:text-stone/60 transition-colors" />
                    <input value={l.building} onChange={(e) => updateLoc(i, "building", e.target.value)} placeholder="Building"
                      className="flex-1 bg-white border border-black/10 text-ink text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-sage placeholder:text-stone/60 transition-colors" />
                    <button onClick={() => removeLoc(i)} className="text-stone hover:text-red-600 text-sm px-2 transition-colors">✕</button>
                  </div>
                ))}
              </div>
              <button onClick={addLoc} className="text-sage text-sm hover:text-sage2 transition-colors">+ Add location</button>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(1)}>← Back</Button>
                <Button fullWidth onClick={() => setStep(3)}>Next: Password →</Button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.35 }} className="space-y-5">
              <div>
                <h2 className="font-display font-bold text-ink text-2xl mb-1">Set admin password.</h2>
                <p className="text-stone text-sm font-light">Only this password can access the dashboard.</p>
              </div>
              <div>
                <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" />
                {password && (
                  <div className="mt-2 flex gap-1">
                    {[1, 2, 3, 4].map((l) => (
                      <div key={l} className={`h-1 flex-1 rounded-full transition-colors ${password.length >= l * 3 ? "bg-sage" : "bg-black/10"}`} />
                    ))}
                  </div>
                )}
              </div>
              <Input label="Confirm Password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" />
              {error && <ErrorBox message={error} />}
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setStep(2)}>← Back</Button>
                <Button fullWidth loading={loading} onClick={finish}>Complete Setup →</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
