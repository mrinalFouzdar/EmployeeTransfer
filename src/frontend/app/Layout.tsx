import { NavLink, Outlet } from "react-router-dom";
import { ActorSwitcher } from "../shared/components/ActorSwitcher";

const NAV_ITEMS = [
  { to: "/", label: "My Requests", end: true },
  { to: "/new", label: "New Request" },
  { to: "/approvals", label: "Approvals" },
  { to: "/hr-review", label: "HR Review" },
];

function navLinkClasses(isActive: boolean): string {
  return `border-b-2 px-1 py-4 text-sm font-medium transition-colors ${
    isActive ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700"
  }`;
}

export function Layout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <span className="py-4 text-base font-semibold text-slate-900">One-Point Employee Portal</span>
            <nav className="flex gap-6">
              {NAV_ITEMS.map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => navLinkClasses(isActive)}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
          <ActorSwitcher />
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
