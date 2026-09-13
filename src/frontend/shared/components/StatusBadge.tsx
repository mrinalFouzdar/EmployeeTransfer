const STATUS_STYLES: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-600",
  Submitted: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
  "Manager Confirmed": "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
  "Returned for Amendment": "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-200",
  "Under HR Review": "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  "Approved - In Progress": "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
  "Pending Action": "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  "On Hold": "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  Completed: "bg-green-50 text-green-700 ring-1 ring-inset ring-green-200",
  Rejected: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
  Withdrawn: "bg-slate-100 text-slate-500 ring-1 ring-inset ring-slate-200",
};

export function StatusBadge({ status }: { status: string }) {
  const classes = STATUS_STYLES[status] ?? "bg-slate-100 text-slate-600";
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${classes}`}>{status}</span>;
}
