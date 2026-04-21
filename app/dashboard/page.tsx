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
}];


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

  const totals = React.useMemo(() => {
    const customers = records.filter((record) => record.type === "customer").length;
    const leads = records.filter((record) => record.type === "lead").length;
    const pipeline = records.reduce((sum, record) => sum + record.value, 0);
    return { customers, leads, pipeline };
  }, [records]);

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

  function submitRecord(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
    resetForm();
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
  }

  function deleteRecord(id: string) {
    setRecords((current) => current.filter((record) => record.id !== id));
    if (editingId === id) resetForm();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8"><header className="rounded-lg border border-border bg-card p-4 shadow-sm sm:p-6" aria-label="Dashboard header">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                  CRM Dashboard
                </p>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Customers and leads</h1>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  Track pipeline activity, manage contacts, and keep customer records current from a single place.
                </p>
              </div>
              <nav className="flex flex-wrap items-center gap-2" aria-label="Dashboard navigation">
                <Button type="button" variant="outline" className="h-9">
                  Overview
                </Button>
                <Button type="button" variant="outline" className="h-9">
                  Customers
                </Button>
                <Button type="button" variant="outline" className="h-9">
                  Leads
                </Button>
                <Button type="button" className="h-9">
                  New record
                </Button>
              </nav>
            </div>
          </header>
        <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
                CRM Dashboard
              </p>
              <h1 className="text-3xl font-semibold tracking-tight">Customers and leads</h1>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Track pipeline activity, manage contacts, and keep customer records current from a single place.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-sm">
              <Stat label="Customers" value={totals.customers} />
              <Stat label="Leads" value={totals.leads} />
              <Stat label="Pipeline" value={formatCurrency(totals.pipeline)} />
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Records</h2>
                <p className="text-sm text-muted-foreground">Customers and leads stored in memory for this session.</p>
              </div>
              <Button type="button" variant="outline" onClick={resetForm}>
                New record
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-border text-muted-foreground">
                  <tr>
                    <th className="py-3 pr-4 font-medium">Name</th>
                    <th className="py-3 pr-4 font-medium">Type</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3 pr-4 font-medium">Owner</th>
                    <th className="py-3 pr-4 font-medium">Value</th>
                    <th className="py-3 pr-4 font-medium">Updated</th>
                    <th className="py-3 pr-0 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => <tr key={record.id} className="border-b border-border/60 align-top">
                      <td className="py-4 pr-4">
                        <div className="font-medium">{record.name}</div>
                        <div className="text-muted-foreground">{record.company}</div>
                        <div className="text-xs text-muted-foreground">{record.email}</div>
                      </td>
                      <td className="py-4 pr-4 capitalize">{record.type}</td>
                      <td className="py-4 pr-4">
                        <span className={cn("inline-flex rounded-full border px-2.5 py-1 text-xs font-medium", badgeClass(record.status))}>
                          {record.status}
                        </span>
                      </td>
                      <td className="py-4 pr-4">{record.owner}</td>
                      <td className="py-4 pr-4">{formatCurrency(record.value)}</td>
                      <td className="py-4 pr-4">{record.updatedAt}</td>
                      <td className="py-4 pr-0">
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" onClick={() => editRecord(record)}>
                            Edit
                          </Button>
                          <Button type="button" variant="destructive" onClick={() => deleteRecord(record.id)}>
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="text-lg font-semibold">{editingId ? "Edit record" : "Create record"}</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Maintain customer and lead details with a simple production-ready workflow.
            </p>
            <form className="space-y-4" onSubmit={submitRecord}>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Type">
                  <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.type} onChange={(e) => setForm((current) => ({ ...current, type: e.target.value as RecordType }))}>
                    <option value="customer">Customer</option>
                    <option value="lead">Lead</option>
                  </select>
                </Field>
                <Field label="Status">
                  <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.status} onChange={(e) => setForm((current) => ({ ...current, status: e.target.value as RecordStatus }))}>
                    <option value="prospect">Prospect</option>
                    <option value="active">Active</option>
                    <option value="at-risk">At risk</option>
                    <option value="closed">Closed</option>
                  </select>
                </Field>
              </div>
              {(["name", "company", "email", "phone", "owner"] as const).map((key) => <Field key={key} label={key.charAt(0).toUpperCase() + key.slice(1)}>
                  <input className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form[key]} onChange={(e) => setForm((current) => ({ ...current, [key]: e.target.value }))} />
                </Field>)}
              <Field label="Value">
                <input type="number" min="0" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.value} onChange={(e) => setForm((current) => ({ ...current, value: Number(e.target.value) }))} />
              </Field>
              <Field label="Notes">
                <textarea className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.notes} onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))} />
              </Field>
              <div className="flex gap-2">
                <Button type="submit">{editingId ? "Save changes" : "Create record"}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Reset
                </Button>
              </div>
            </form>
          </div>
        </section>
      </main>
    </div>);

}

function Field({
  label,
  children



}: {label: string;children: React.ReactNode;}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium">{label}</span>
      {children}
    </label>);

}

function Stat({ label, value }: {label: string;value: React.ReactNode;}) {
  return (
    <div className="rounded-md border border-border bg-background px-3 py-2">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-base font-semibold">{value}</div>
    </div>);

}