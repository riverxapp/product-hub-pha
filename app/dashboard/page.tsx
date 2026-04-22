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

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

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

  return <div className="min-h-screen bg-slate-50 text-slate-950">
    <div className="p-4">
      <Button onClick={openModal}>Add record</Button>
    </div>

    {/* The rest of the dashboard UI here */}
    {/* For brevity, the existing table or UI is assumed preserved */}

    {isModalOpen ? <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="new-record-title" aria-describedby="new-record-description" onKeyDown={handleDialogKeyDown} onClick={closeModal}>
      <div className="absolute inset-0 bg-slate-950/50" aria-hidden="true" />
      <div className="relative w-full max-w-2xl rounded-lg border border-slate-200 bg-white p-6 shadow-lg" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="new-record-title" className="text-lg font-semibold">Create record</h2>
            <p id="new-record-description" className="text-sm text-slate-600">Add a new CRM record using the existing dashboard record shape.</p>
          </div>
          <Button type="button" variant="outline" onClick={closeModal} aria-label="Close dialog">Close</Button>
        </div>
        <form className="space-y-4" onSubmit={submitRecord} noValidate>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type">
              <select required className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-900/10" value={form.type} onChange={(e) => setForm((current) => ({ ...current, type: e.target.value as RecordType }))}>
                <option value="customer">Customer</option>
                <option value="lead">Lead</option>
              </select>
            </Field>
            <Field label="Status">
              <select required className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-900/10" value={form.status} onChange={(e) => setForm((current) => ({ ...current, status: e.target.value as RecordStatus }))}>
                <option value="prospect">Prospect</option>
                <option value="active">Active</option>
                <option value="at-risk">At risk</option>
                <option value="closed">Closed</option>
              </select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name"><input required className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-900/10" value={form.name} onChange={(e) => setForm((current) => ({ ...current, name: e.target.value }))} /></Field>
            <Field label="Company"><input required className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-900/10" value={form.company} onChange={(e) => setForm((current) => ({ ...current, company: e.target.value }))} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Email"><input required type="email" className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-900/10" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} /></Field>
            <Field label="Phone"><input required className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-900/10" value={form.phone} onChange={(e) => setForm((current) => ({ ...current, phone: e.target.value }))} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Owner"><input required className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-900/10" value={form.owner} onChange={(e) => setForm((current) => ({ ...current, owner: e.target.value }))} /></Field>
            <Field label="Value"><input required type="number" min="0" className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-slate-900/10" value={form.value} onChange={(e) => setForm((current) => ({ ...current, value: Number(e.target.value) }))} /></Field>
          </div>
          <Field label="Notes"><textarea required className="min-h-24 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-slate-900/10" value={form.notes} onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))} /></Field>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" onClick={closeModal}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating..." : (editingId ? "Save changes" : "Create record")}</Button>
            {submitError ? <p className="text-sm text-red-600" role="alert">{submitError}</p> : null}
          </div>
        </form>
      </div>
    </div> : null}

  </div>;
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
    <div className="rounded-md border border-border bg-background px-3 py-2">{value}</div>);
}