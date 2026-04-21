import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type CRMEntityType = "customer" | "lead";
type CRMRecord = {
  id: string;
  type: CRMEntityType;
  name: string;
  email: string;
  status: string;
  notes?: string;
  company?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
};

type CRMInput = Partial<Pick<CRMRecord, "type" | "name" | "email" | "status" | "notes" | "company" | "phone">> & {
  id?: string;
};

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "crm.json");

async function ensureStore() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify({ records: [] }, null, 2), "utf8");
  }
}

async function readRecords(): Promise<CRMRecord[]> {
  await ensureStore();
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw) as { records?: CRMRecord[] } | CRMRecord[];
    if (Array.isArray(parsed)) return parsed;
    return Array.isArray(parsed.records) ? parsed.records : [];
  } catch {
    return [];
  }
}

async function writeRecords(records: CRMRecord[]) {
  await ensureStore();
  await fs.writeFile(DATA_FILE, JSON.stringify({ records }, null, 2), "utf8");
}

function json(message: string, status: number, data?: unknown) {
  return NextResponse.json({ ok: status < 400, message, data }, { status });
}

function normalizeType(value: unknown): CRMEntityType | null {
  return value === "customer" || value === "lead" ? value : null;
}

function validateInput(input: CRMInput, isUpdate = false) {
  const type = normalizeType(input.type);
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim() : "";
  const status = typeof input.status === "string" ? input.status.trim() : "";
  const notes = typeof input.notes === "string" ? input.notes.trim() : "";
  const company = typeof input.company === "string" ? input.company.trim() : "";
  const phone = typeof input.phone === "string" ? input.phone.trim() : "";

  if (!isUpdate) {
    if (!type) return "type must be either customer or lead";
    if (!name) return "name is required";
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "valid email is required";
  } else {
    if (input.type !== undefined && !type) return "type must be either customer or lead";
    if (input.email !== undefined && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "valid email is required";
  }

  return {
    type: type ?? undefined,
    name: name || undefined,
    email: email || undefined,
    status: status || undefined,
    notes: notes || undefined,
    company: company || undefined,
    phone: phone || undefined,
  };
}

function applyPartial(record: CRMRecord, input: ReturnType<typeof validateInput>) {
  return {
    ...record,
    ...(input.type ? { type: input.type } : null),
    ...(input.name ? { name: input.name } : null),
    ...(input.email ? { email: input.email } : null),
    ...(input.status ? { status: input.status } : null),
    ...(input.notes !== undefined ? { notes: input.notes } : null),
    ...(input.company !== undefined ? { company: input.company } : null),
    ...(input.phone !== undefined ? { phone: input.phone } : null),
    updatedAt: new Date().toISOString(),
  };
}

export async function GET() {
  const records = await readRecords();
  return json("CRM records loaded", 200, { records });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as CRMInput | null;
  if (!body) return json("Invalid JSON body", 400);

  const validation = validateInput(body, false);
  if (typeof validation === "string") return json(validation, 400);

  const now = new Date().toISOString();
  const record: CRMRecord = {
    id: crypto.randomUUID(),
    type: validation.type!,
    name: validation.name!,
    email: validation.email!,
    status: validation.status ?? (validation.type === "lead" ? "new" : "active"),
    notes: validation.notes,
    company: validation.company,
    phone: validation.phone,
    createdAt: now,
    updatedAt: now,
  };

  const records = await readRecords();
  records.unshift(record);
  await writeRecords(records);

  return json("CRM record created", 201, { record });
}

export async function PUT(request: Request) {
  const body = (await request.json().catch(() => null)) as CRMInput | null;
  if (!body?.id) return json("id is required", 400);

  const records = await readRecords();
  const index = records.findIndex((record) => record.id === body.id);
  if (index === -1) return json("CRM record not found", 404);

  const validation = validateInput(body, true);
  if (typeof validation === "string") return json(validation, 400);

  const nextRecord = applyPartial(records[index], validation);
  records[index] = nextRecord;
  await writeRecords(records);

  return json("CRM record updated", 200, { record: nextRecord });
}

export async function PATCH(request: Request) {
  return PUT(request);
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  let body: CRMInput | null = null;
  if (!id) {
    body = (await request.json().catch(() => null)) as CRMInput | null;
  }

  const recordId = id ?? body?.id;
  if (!recordId) return json("id is required", 400);

  const records = await readRecords();
  const nextRecords = records.filter((record) => record.id !== recordId);
  if (nextRecords.length === records.length) return json("CRM record not found", 404);

  await writeRecords(nextRecords);
  return json("CRM record deleted", 200, { id: recordId });
}
