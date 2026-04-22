"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RecordStatus = "active" | "prospect" | "at-risk" | "closed";
type RecordType = "customer" | "lead";

type CrmRecord = {
  id: string;
  type: RecordType;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: RecordStatus;
  owner: string;
  value: number;
  notes: string;
  updatedAt: string;
};

const initialRecords: CrmRecord[] = [
  {
    id: "cust-101",
    type: "customer",
    name: "Avery Chen",
    company: "Northstar Labs",
    email: "avery@northstarlabs.com",
    phone: "+1 (555) 012-9001",
    status: "active",
    owner: "Mia",
    value: 42000,
    notes: "Renewal due next quarter.",
    updatedAt: "2026-04-20"
  },
  {
    id: "lead-204",
    type: "lead",
    name: "Jordan Patel",
    company: "Helio Systems",
    email: "jordan@helio.systems",
    phone: "+1 (555) 013-4409",
    status: "prospect",
    owner: "Noah",
    value: 18000,
    notes: "Requested product demo and pricing.",
    updatedAt: "2026-04-19"
  }
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function badgeClass(status: RecordStatus) {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "prospect":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "at-risk":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "closed":
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

function recentActivity(records: CrmRecord[]) {
  // Generate simplistic recent activity data
  return records
    .slice()
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, 5)
    .map((record) => ({
      id: record.id,
      description: `${record.name} (${record.company}) updated on ${record.updatedAt}`,
      updatedAt: record.updatedAt
    }));
}

function pipelineStatusSummary(records: CrmRecord[]) {
  // Count records by status
  const summary: Record<RecordStatus, number> = {
    active: 0,
    prospect: 0,
    "at-risk": 0,
    closed: 0,
  };
  for (const r of records) {
    summary[r.status] = (summary[r.status] ?? 0) + 1;
  }
  return summary;
}

export default function DashboardPage() {
  const [records, setRecords] = React.useState<CrmRecord[]>(initialRecords);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<Omit<CrmRecord, "id" | "updatedAt">>({
    type: "lead",
    name: "",
    company: "",
    email: "",
    phone: "",
    status: "prospect",
    owner: "",
    value: 0,
    notes: ""
  });

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<string>("");

  const totals = React.useMemo(() => {
    const customers = records.filter((record) => record.type === "customer").length;
    const leads = records.filter((record) => record.type === "lead").length;
    const pipeline = records.reduce((sum, record) => sum + record.value, 0);
    return { customers, leads, pipeline };
  }, [records]);

  const filteredRecords = React.useMemo(() => {
    if (!filter.trim()) return records;
    const filterLower = filter.trim().toLowerCase();
    return records.filter((r) =>
      r.name.toLowerCase().includes(filterLower) ||
      r.company.toLowerCase().includes(filterLower) ||
      r.email.toLowerCase().includes(filterLower) ||
      r.owner.toLowerCase().includes(filterLower)
    );
  }, [records, filter]);

  const activity = React.useMemo(() => recentActivity(records), [records]);
  const pipelineSummary = React.useMemo(() => pipelineStatusSummary(records), [records]);

  function resetForm() {
    setEditingId(null);
    setForm({
      type: "lead",
      name: "",
      company: "",
      email: "",
      phone: "",
      status: "prospect",
      owner: "",
      value: 0,
      notes: ""
    });
  }

  function openModal() {
    resetForm();
    setIsModalOpen(true);
  }

  function closeModal() {
    setIsModalOpen(false);
    setSubmitError(null);
    setIsSubmitting(false);
  }

  function handleDialogKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeModal();
    }
  }

  function submitRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const payload: CrmRecord = {
      ...form,
      id: editingId ?? `record-${Date.now()}`,
      updatedAt: new Date().toISOString().slice(0, 10)
    };

    setRecords((current) =>
      editingId ?
        current.map((record) => record.id === editingId ? payload : record) :
        [payload, ...current]
    );

    setIsSubmitting(false);
    closeModal();
  }

  function editRecord(record: CrmRecord) {
    setEditingId(record.id);
    setForm({
      type: record.type,
      name: record.name,
      company: record.company,
      email: record.email,
      phone: record.phone,
      status: record.status,
      owner: record.owner,
      value: record.value,
      notes: record.notes
    });
    setIsModalOpen(true);
  }

  function deleteRecord(id: string) {
    setRecords((current) => current.filter((record) => record.id !== id));
    if (editingId === id) resetForm();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 px-4 py-6 md:px-8 lg:px-12">
      {/* Header / Hero */}
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold mb-2">CRM Dashboard</h1>
        <p className="text-lg text-slate-700 max-w-xl">
          Track and manage your customers and leads effectively with the tools below.
        </p>
        <div className="mt-4">
          <Button onClick={openModal} className="bg-slate-900 text-white font-bold shadow-lg hover:bg-slate-800 focus:ring-4 focus:ring-blue-600 focus:ring-opacity-50">
            Add New Record
          </Button>
        </div>
      </header>

      {/* KPI Summary Cards */}
      <section aria-label="Key Performance Indicators" className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <KpiCard label="Customers" value={totals.customers} icon="👥" />
        <KpiCard label="Leads" value={totals.leads} icon="📣" />
        <KpiCard label="Pipeline Value" value={formatCurrency(totals.pipeline)} icon="💰" />
      </section>

      <div className="flex flex-col lg:flex-row lg:space-x-8">
        {/* Record Overview */}
        <section className="flex-1 mb-8 lg:mb-0">
          <h2 className="text-xl font-semibold mb-4">Records Overview</h2>
          <input
            type="search"
            aria-label="Search records"
            placeholder="Search by name, company, email or owner"
            className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          {filteredRecords.length === 0 ? (
            <p className="text-sm text-slate-600">No matching records found.</p>
          ) : (
            <div className="overflow-x-auto border rounded-md bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2 hidden sm:table-cell">Company</th>
                    <th className="px-3 py-2 hidden md:table-cell">Email</th>
                    <th className="px-3 py-2 hidden lg:table-cell">Status</th>
                    <th className="px-3 py-2">Owner</th>
                    <th className="px-3 py-2 hidden sm:table-cell text-right">Value</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="border-t hover:bg-gray-50">
                      <td className="px-3 py-2 font-medium">{record.name}</td>
                      <td className="px-3 py-2 hidden sm:table-cell">{record.company}</td>
                      <td className="px-3 py-2 hidden md:table-cell">{record.email}</td>
                      <td className="px-3 py-2 hidden lg:table-cell">
                        <span className={cn("inline-block rounded-md border px-2 py-0.5 text-xs font-semibold leading-5", badgeClass(record.status))}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-3 py-2">{record.owner}</td>
                      <td className="px-3 py-2 hidden sm:table-cell text-right">{formatCurrency(record.value)}</td>
                      <td className="px-3 py-2 space-x-2">
                        <Button size="sm" variant="outline" onClick={() => editRecord(record)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => deleteRecord(record.id)}>
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="w-full max-w-md flex-shrink-0 space-y-8">
          {/* Recent Activity */}
          <section aria-labelledby="recent-activity-heading" className="bg-white rounded-lg p-6 shadow border border-gray-200">
            <h2 id="recent-activity-heading" className="text-xl font-semibold mb-4">Recent Activity</h2>
            {activity.length === 0 ? (
              <p className="text-sm text-slate-600">No recent activity.</p>
            ) : (
              <ul className="space-y-3 text-sm text-slate-700">
                {activity.map((act) => (
                  <li key={act.id} className="border-b border-gray-100 last:border-0 pb-2">
                    {act.description}
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Pipeline / Status Breakdown */}
          <section aria-labelledby="pipeline-status-heading" className="bg-white rounded-lg p-6 shadow border border-gray-200">
            <h2 id="pipeline-status-heading" className="text-xl font-semibold mb-4">Pipeline Status Breakdown</h2>
            <ul className="space-y-2 text-sm text-slate-700">
              {Object.entries(pipelineSummary).map(([status, count]) => (
                <li key={status} className="flex items-center space-x-3">
                  <span className={cn("inline-block w-4 h-4 rounded-full border", badgeClass(status as RecordStatus))} />
                  <span className="capitalize">{status}</span>
                  <span className="ml-auto font-semibold">{count}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* CRM Editing Actions */}
          <section aria-labelledby="crm-actions-heading" className="bg-white rounded-lg p-6 shadow border border-gray-200">
            <h2 id="crm-actions-heading" className="text-xl font-semibold mb-4">Actions</h2>
            <div className="flex flex-col space-y-3">
              <Button onClick={openModal} className="bg-slate-900 text-white font-bold shadow hover:bg-slate-800 focus:ring-4 focus:ring-blue-600 focus:ring-opacity-50">
                Add New Record
              </Button>
              {editingId && (
                <Button onClick={() => { resetForm(); setIsModalOpen(false); }} variant="outline">
                  Cancel Edit
                </Button>
              )}
            </div>
          </section>
        </aside>
      </div>

      {/* Modal Form */}
      {isModalOpen && (
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="form-heading"
          tabIndex={-1}
          onKeyDown={handleDialogKeyDown}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4"
        >
          <div className="bg-white rounded-md max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-lg p-6">
            <h2 id="form-heading" className="text-xl font-semibold mb-4">
              {editingId ? "Edit Record" : "Add Record"}
            </h2>
            <form onSubmit={submitRecord} className="space-y-4" noValidate>
              <Field label="Type">
                <select
                  required
                  value={form.type}
                  onChange={(e) => setForm(f => ({ ...f, type: e.target.value as RecordType }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="lead">Lead</option>
                  <option value="customer">Customer</option>
                </select>
              </Field>

              <Field label="Name">
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </Field>

              <Field label="Company">
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm(f => ({ ...f, company: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </Field>

              <Field label="Phone">
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </Field>

              <Field label="Status">
                <select
                  required
                  value={form.status}
                  onChange={(e) => setForm(f => ({ ...f, status: e.target.value as RecordStatus }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="prospect">Prospect</option>
                  <option value="at-risk">At-Risk</option>
                  <option value="closed">Closed</option>
                </select>
              </Field>

              <Field label="Owner">
                <input
                  type="text"
                  value={form.owner}
                  onChange={(e) => setForm(f => ({ ...f, owner: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </Field>

              <Field label="Value">
                <input
                  type="number"
                  min={0}
                  value={form.value}
                  onChange={(e) => setForm(f => ({ ...f, value: Number(e.target.value) }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </Field>

              <Field label="Notes">
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                  rows={3}
                />
              </Field>

              <div className="flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={closeModal} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : editingId ? "Save Changes" : "Add Record"}
                </Button>
              </div>
            </form>
            {submitError && (
              <p className="mt-4 text-red-600 font-semibold" role="alert">
                Error: {submitError}
              </p>
            )}
          </div>
        </section>
      )}

      {isModalOpen && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black opacity-30"
          onClick={closeModal}
        />
      )}
    </div>
  );
}

function Field({
  label,
  children
}: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5 text-sm font-medium">
      <span>{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode | string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow flex items-center space-x-4">
      <div className="text-3xl">{icon}</div>
      <div>
        <div className="text-sm text-slate-500">{label}</div>
        <div className="text-xl font-semibold">{value}</div>
      </div>
    </div>
  );
}