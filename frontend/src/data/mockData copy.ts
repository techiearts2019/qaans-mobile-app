export type EmployeeStatus = "Active" | "Inactive" | "No Allocation";

export type Employee = {
  id: string;
  name: string;
  nameHi: string;
  code: string;
  designation: string;
  status: EmployeeStatus;
  photo: string;
  phone: string;
  email?: string;
};

export const employees: Employee[] = [
  {
    id: "e1",
    name: "Ramesh Kumar",
    nameHi: "रमेश कुमार",
    code: "DHD-1042",
    designation: "Site Supervisor",
    status: "Active",
    photo:
      "https://images.unsplash.com/photo-1646227655685-a530813759b3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwzfHx3b3JrZXIlMjBwb3J0cmFpdHxlbnwwfHx8fDE3ODI1NTEzODB8MA&ixlib=rb-4.1.0&q=85",
    phone: "+91 98231 45678",
    email: "ramesh.k@dihadi.in",
  },
  {
    id: "e2",
    name: "Sunita Devi",
    nameHi: "सुनीता देवी",
    code: "DHD-1043",
    designation: "Helper",
    status: "Active",
    photo:
      "https://images.pexels.com/photos/12576220/pexels-photo-12576220.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    phone: "+91 98112 33445",
  },
  {
    id: "e3",
    name: "Mohan Singh",
    nameHi: "मोहन सिंह",
    code: "DHD-1044",
    designation: "Mason",
    status: "No Allocation",
    photo:
      "https://images.pexels.com/photos/9227535/pexels-photo-9227535.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    phone: "+91 97650 12000",
  },
  {
    id: "e4",
    name: "Anil Yadav",
    nameHi: "अनिल यादव",
    code: "DHD-1045",
    designation: "Electrician",
    status: "Inactive",
    photo:
      "https://images.unsplash.com/photo-1679679811837-c28b2586f533?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwyfHx3b3JrZXIlMjBwb3J0cmFpdHxlbnwwfHx8fDE3ODI1NTEzODB8MA&ixlib=rb-4.1.0&q=85",
    phone: "+91 96007 23498",
  },
  {
    id: "e5",
    name: "Priya Sharma",
    nameHi: "प्रिया शर्मा",
    code: "DHD-1046",
    designation: "Office Assistant",
    status: "Active",
    photo:
      "https://images.pexels.com/photos/37556467/pexels-photo-37556467.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940",
    phone: "+91 95002 78122",
    email: "priya.s@dihadi.in",
  },
];

export type AttendanceEntry = {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  photo: string;
  type: "Check-in" | "Check-out";
  time: string;
  status: "On Time" | "Late" | "Early Out";
};

export const todayAttendance: AttendanceEntry[] = [
  {
    id: "a1",
    employeeId: "e1",
    employeeName: "Ramesh Kumar",
    employeeCode: "DHD-1042",
    photo: employees[0].photo,
    type: "Check-in",
    time: "08:42 AM",
    status: "On Time",
  },
  {
    id: "a2",
    employeeId: "e2",
    employeeName: "Sunita Devi",
    employeeCode: "DHD-1043",
    photo: employees[1].photo,
    type: "Check-in",
    time: "09:05 AM",
    status: "Late",
  },
  {
    id: "a3",
    employeeId: "e5",
    employeeName: "Priya Sharma",
    employeeCode: "DHD-1046",
    photo: employees[4].photo,
    type: "Check-in",
    time: "08:55 AM",
    status: "On Time",
  },
];

export type AppNotification = {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "attendance" | "employee" | "salary" | "system";
};

export const notifications: AppNotification[] = [
  {
    id: "n1",
    title: "Attendance marked",
    description: "Ramesh Kumar checked in at 08:42 AM",
    time: "10 mins ago",
    read: false,
    type: "attendance",
  },
  {
    id: "n2",
    title: "New employee added",
    description: "Priya Sharma (DHD-1046) has been added to your team",
    time: "1 hour ago",
    read: false,
    type: "employee",
  },
  {
    id: "n3",
    title: "Salary processed",
    description: "December salary cycle completed for 48 employees",
    time: "Yesterday",
    read: true,
    type: "salary",
  },
  {
    id: "n4",
    title: "Attendance marked",
    description: "Sunita Devi checked in at 09:05 AM (Late)",
    time: "Yesterday",
    read: true,
    type: "attendance",
  },
  {
    id: "n5",
    title: "Employee records updated",
    description: "Mohan Singh's allocation has been updated",
    time: "2 days ago",
    read: true,
    type: "employee",
  },
];

export const designations = [
  "Beldar",
  "Carpenter",
  "Electrician",
  "Fabricator",
  "Helper",
  "House Keeping",
  "Office Assistant",
  "Others",
  "Painter",
  "Plumber",
  "POP & Gypsum Mason",
  "Tile & Stone Mason",
  "Staff",
  "Stone Polisher",
  "Site Supervisor",
  "Senior Supervisor",
  "Upholster",
  "Worker",
  "Welder"
];

export const skills = [
  "Bricklaying",
  "Wiring",
  "Plumbing",
  "Carpentry",
  "Welding",
  "Painting",
  "General Labour",
  "Helper",
  "Semi Skilled",
  "Skilled"
  "Supervision",
];

export const genders = ["Male", "Female", "Other"];
export const maritalStatuses = ["Single", "Married", "Divorced", "Widowed"];

export type ProjectStatus = "Active" | "Completed" | "On Hold";

export type Project = {
  id: string;
  name: string;
  location: string;
  startDate: string;
  status: ProjectStatus;
  allocatedEmployeeIds: string[];
  cover: string;
};

export const projects: Project[] = [
  {
    id: "p1",
    name: "Skyline Tower A",
    location: "Sector 62, Noida",
    startDate: "12 Jan 2026",
    status: "Active",
    allocatedEmployeeIds: ["e1", "e2", "e5"],
    cover:
      "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=60",
  },
  {
    id: "p2",
    name: "Greenfield Mall Renovation",
    location: "MG Road, Gurgaon",
    startDate: "03 Nov 2025",
    status: "Active",
    allocatedEmployeeIds: ["e4"],
    cover:
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=900&q=60",
  },
  {
    id: "p3",
    name: "Riverside Villas Phase 2",
    location: "Yamuna Expressway",
    startDate: "20 Aug 2025",
    status: "On Hold",
    allocatedEmployeeIds: [],
    cover:
      "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=900&q=60",
  },
  {
    id: "p4",
    name: "Metro Line Extension",
    location: "Dwarka, Delhi",
    startDate: "05 Feb 2025",
    status: "Completed",
    allocatedEmployeeIds: [],
    cover:
      "https://images.unsplash.com/photo-1487958449943-2429e8be8625?auto=format&fit=crop&w=900&q=60",
  },
];

export function projectFor(employeeId: string): Project | undefined {
  return projects.find((p) => p.allocatedEmployeeIds.includes(employeeId));
}

export const supervisor = {
  name: "Rajesh Verma",
  code: "SUP-0007",
  email: "rajesh.verma@dihadi.in",
  phone: "+91 99999 88888",
  designation: "Senior Supervisor",
  joiningDate: "12 Jan 2022",
  photo:
    "https://images.unsplash.com/photo-1679679811837-c28b2586f533?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NTJ8MHwxfHNlYXJjaHwyfHx3b3JrZXIlMjBwb3J0cmFpdHxlbnwwfHx8fDE3ODI1NTEzODB8MA&ixlib=rb-4.1.0&q=85",
};
