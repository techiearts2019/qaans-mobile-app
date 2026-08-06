// Dihadi API client — hits the FastAPI backend at EXPO_PUBLIC_BACKEND_URL/api/*
// Never call MySQL directly from the mobile app.

export type EmployeeStatus = "Active" | "Inactive" | "No Allocation";
export type ProjectStatus = "Active" | "Completed" | "On Hold";

export type Employee = {
  id: string;
  name: string;
  name_hi?: string | null;
  code: string;
  designation?: string | null;
  skill?: string | null;
  status: EmployeeStatus;
  photo?: string | null;
  primary_mobile?: string | null;
  email?: string | null;
  project_id?: string | null;
  project_name?: string | null;
};

export type EmployeeInput = {
  name: string;
  name_hi?: string;
  code: string;
  designation?: string;
  skill?: string;
  gender?: string;
  marital_status?: string;
  dob?: string;
  father_name?: string;
  nominee?: string;
  primary_mobile?: string;
  alt_mobile?: string;
  email?: string;
  date_of_joining?: string;
  date_of_exit?: string;
  current_address?: string;
  permanent_address?: string;
  aadhaar?: string;
  pan?: string;
  uan?: string;
  esi?: string;
  status?: EmployeeStatus;
  photo?: string;
  project_id?: string;
};

export type Project = {
  id: string;
  name: string;
  location?: string | null;
  start_date?: string | null;
  status: ProjectStatus;
  cover?: string | null;
  allocated_employee_ids: string[];
};

export type AttendanceEntry = {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  photo?: string | null;
  type: "Check-in" | "Check-out";
  time?: string | null;
  status?: "On Time" | "Late" | "Early Out" | null;
};

export type SalaryRow = {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_code: string;
  photo?: string | null;
  month: string;
  days_worked: number;
  daily_rate: number;
  deductions: number;
  status: "Paid" | "Pending" | "Processing";
  net: number;
};

export type AppNotification = {
  id: string;
  title: string;
  description?: string | null;
  time_label?: string | null;
  read: boolean;
  type: "attendance" | "employee" | "salary" | "system";
};

export type Supervisor = {
  id: string;
  name: string;
  code: string;
  email?: string | null;
  phone?: string | null;
  designation?: string | null;
  photo?: string | null;
  joining_date?: string | null;
};

const BASE = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api`;

async function request<T>(
  path: string,
  init?: RequestInit & { params?: Record<string, string | undefined> }
): Promise<T> {
  const { params, ...rest } = init ?? {};
  let url = `${BASE}${path}`;
  if (params) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") qs.append(k, v);
    });
    const s = qs.toString();
    if (s) url += `?${s}`;
  }
  const res = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(rest.headers || {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}: ${text}`);
  }
  return (await res.json()) as T;
}

export const api = {
  supervisor: () => request<Supervisor>("/supervisor/me"),

  listEmployees: (opts?: { status?: string; q?: string }) =>
    request<Employee[]>("/employees", { params: opts as never }),
  createEmployee: (payload: EmployeeInput) =>
    request<Employee>("/employees", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  getEmployee: (id: string) => request<Employee>(`/employees/${id}`),
  deleteEmployee: (id: string) =>
    request<{ ok: true }>(`/employees/${id}`, { method: "DELETE" }),

  listProjects: (opts?: { status?: string; q?: string }) =>
    request<Project[]>("/projects", { params: opts as never }),
  getProject: (id: string) => request<Project>(`/projects/${id}`),
  allocate: (projectId: string, employeeId: string) =>
    request<Project>(`/projects/${projectId}/allocate/${employeeId}`, {
      method: "POST",
    }),
  unallocate: (projectId: string, employeeId: string) =>
    request<Project>(`/projects/${projectId}/allocate/${employeeId}`, {
      method: "DELETE",
    }),

  todayAttendance: () => request<AttendanceEntry[]>("/attendance/today"),
  markAttendance: (payload: {
    employee_id: string;
    type: "Check-in" | "Check-out";
    time?: string;
    status?: string;
  }) =>
    request<AttendanceEntry>("/attendance/mark", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  salary: (month?: string) =>
    request<SalaryRow[]>("/salary", { params: { month } }),

  notifications: () => request<AppNotification[]>("/notifications"),
  markNotificationRead: (id: string) =>
    request<{ ok: true }>(`/notifications/${id}/read`, { method: "PATCH" }),
  markAllRead: () =>
    request<{ ok: true }>("/notifications/read-all", { method: "POST" }),
};
