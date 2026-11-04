// Backend এর Role Enum এর সাথে Match করে
export type Role = 'ADMIN' | 'EMPLOYEE';

// Login Request এ যা পাঠাবো
export interface LoginRequest {
    username: string;
    password: string;
}

// Register Request এ যা পাঠাবো
export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

// Login/Register সফল হলে Backend থেকে যা পাবো
export interface AuthResponse {
    token: string;
    username: string;
    role: Role;
}

// Department এর Data Structure
export interface Department {
    id: number;
    name: string;
}

// Employee এর Data Structure (Backend এর EmployeeDTO এর সাথে Match করে)
export interface Employee {
    id: number;
    name: string;
    phone: string;
    designation: string;
    salary: number;
    joiningDate: string;
    username: string;
    email: string;
    departmentId: number;
    departmentName: string;
}

// Employee তৈরি/আপডেট করার জন্য Request Structure
export interface EmployeeRequest {
    userId: number;
    departmentId: number;
    name: string;
    phone: string;
    designation: string;
    salary: number;
    joiningDate: string;
}

// Backend থেকে Error আসলে এই Structure এ আসবে
export interface ErrorResponse {
    timestamp: string;
    status: number;
    message: string;
}

// AuthContext এ কী কী থাকবে তার গঠন
export interface AuthContextType {
    username: string | null;
    role: Role | null;
    isAuthenticated: boolean;
    login: (token: string, username: string, role: Role) => void;
    logout: () => void;
}


export interface DepartmentRequest {
    name: string;
}

export interface EmployeeUpdateRequest {
    departmentId: number;
    name: string;
    phone: string;
    designation: string;
    salary: number;
    joiningDate: string;
}

export interface UserSummary {
    id: number;
    username: string;
    email: string;
}

export type LeaveType = 'CASUAL' | 'SICK' | 'ANNUAL' | 'UNPAID';
export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveRequest {
    id: number;
    employeeId: number;
    employeeName: string;
    departmentName: string;
    startDate: string;
    endDate: string;
    leaveType: LeaveType;
    reason: string;
    status: LeaveStatus;
    appliedOn: string;
}

export interface CreateLeaveRequestInput {
    startDate: string;
    endDate: string;
    leaveType: LeaveType;
    reason: string;
}

export interface Attendance {
    id: number;
    employeeId: number;
    employeeName: string;
    departmentName: string;
    date: string;
    checkInTime: string;
    checkOutTime: string | null;
}

export interface DashboardStats {
    totalEmployees: number;
    totalDepartments: number;
    pendingLeaves: number;
    presentToday: number;
}