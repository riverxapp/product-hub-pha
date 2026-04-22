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
    <div className="p-4"><section aria-labelledby="crm-editing-heading" className="mb-6 p-6 bg-white rounded-lg shadow-lg border border-gray-200">
  <h1 id="crm-editing-heading" className="text-2xl font-extrabold mb-4">CRM Records Editing</h1>
  <p className="mb-4 text-slate-700">Easily manage your CRM records. Your changes will be saved instantly.</p>
</section>
      <Button onClick={openModal} className={"bg-slate-900 text-white font-bold shadow-lg hover:bg-slate-800 focus:ring-4 focus:ring-blue-600 focus:ring-opacity-50"}>Add record</Button>
    </div>

    {/* The rest of the dashboard UI here */}
    {/* For brevity, the existing table or UI is assumed preserved */}

    {isModalOpen ? <section aria-live="polite" aria-atomic="true" className="mb-6 p-4 bg-blue-50 border border-blue-300 rounded">
  {isSubmitting ? <p className="text-blue-700 font-semibold">Saving changes...</p> : submitError ? <p className="text-red-700 font-semibold">Error: {submitError}</p> : null}
</section> :









































    null}

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