import { useState } from "react";
import { useActor } from "../hooks/useActor";

function initials(id: string): string {
  if (!id) return "?";
  const parts = id.replace(/[^a-zA-Z0-9]/g, " ").trim().split(/\s+/);
  return (parts[0]?.[0] ?? "?").toUpperCase();
}

/** Dev-only placeholder for choosing "who you are" until real auth exists (see useActor). */
export function ActorSwitcher() {
  const [actor, setActor] = useActor();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm hover:bg-slate-100"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-semibold text-white">
          {initials(actor.id)}
        </span>
        <span className="text-slate-700">{actor.id || "Not signed in"}</span>
        {actor.role && (
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">{actor.role}</span>
        )}
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-slate-400">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-2 w-72 rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-400">Acting as (dev placeholder)</p>
          <label className="mb-2 block text-xs font-medium text-slate-600">
            Actor id
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. emp-alice, mgr-james, hr-priya"
              value={actor.id}
              onChange={(e) => setActor({ ...actor, id: e.target.value })}
            />
          </label>
          <label className="block text-xs font-medium text-slate-600">
            Role
            <select
              className="mt-1 w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={actor.role ?? ""}
              onChange={(e) => setActor({ ...actor, role: e.target.value || null })}
            >
              <option value="">(none)</option>
              <option value="HR">HR</option>
            </select>
          </label>
          <p className="mt-3 text-xs leading-relaxed text-slate-400">
            Placeholder identity — real authentication is <code>[Open]</code> per constitution.md.
          </p>
        </div>
      )}
    </div>
  );
}
