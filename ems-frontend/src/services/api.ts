import api from '../api/axiosConfig';
import type { 
  Attendance, 
  AuthResponse, 
  CreateLeaveRequestInput, 
  DashboardStats, 
  Department, 
  DepartmentRequest, 
  Employee, 
  EmployeeRequest, 
  EmployeeUpdateRequest, 
  LeaveRequest, 
  LoginRequest, 
  RegisterRequest, 
  UserSummary 
} from '../types';

interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}

// ==================== AUTH SERVICES ====================
export const authService = {
  login: (data: LoginRequest) => 
    api.post<AuthResponse>('/auth/login', data),

  register: (data: RegisterRequest) => 
    api.post<AuthResponse>('/auth/register', data),

  changePassword: (data: PasswordChangeRequest) => 
    api.put<{ message: string }>('/auth/change-password', data),
};

// ==================== EMPLOYEE SERVICES ====================
export const employeeService = {
  getMyProfile: () => 
    api.get<Employee>('/employees/me'),

  getAll: () => 
    api.get<Employee[]>('/employees'),

  getUnassignedUsers: () => 
    api.get<UserSummary[]>('/employees/unassigned-users'),

  create: (data: EmployeeRequest) => 
    api.post<Employee>('/employees', data),

  update: (id: number, data: EmployeeUpdateRequest) => 
    api.put<Employee>(`/employees/${id}`, data),

  delete: (id: number) => 
    api.delete<void>(`/employees/${id}`),
};

// ==================== DEPARTMENT SERVICES ====================
export const departmentService = {
  getAll: () => 
    api.get<Department[]>('/departments'),

  create: (data: DepartmentRequest) => 
    api.post<Department>('/departments', data),

  update: (id: number, data: DepartmentRequest) => 
    api.put<Department>(`/departments/${id}`, data),

  delete: (id: number) => 
    api.delete<void>(`/departments/${id}`),
};

// ==================== LEAVE SERVICES ====================
export const leaveService = {
  getMyLeaves: () => 
    api.get<LeaveRequest[]>('/leaves/me'),

  getAll: () => 
    api.get<LeaveRequest[]>('/leaves'),

  applyLeave: (data: CreateLeaveRequestInput) => 
    api.post<LeaveRequest>('/leaves', data),

  approve: (id: number) => 
    api.put<LeaveRequest>(`/leaves/${id}/status`, { status: 'APPROVED' }),

  reject: (id: number) => 
    api.put<LeaveRequest>(`/leaves/${id}/status`, { status: 'REJECTED' }),
};

// ==================== ATTENDANCE SERVICES ====================
export const attendanceService = {
  getMyLogs: () => 
    api.get<Attendance[]>('/attendance/me'),

  getAllLogs: () => 
    api.get<Attendance[]>('/attendance'),

  checkIn: () => 
    api.post<Attendance>('/attendance/check-in'),

  checkOut: () => 
    api.put<Attendance>('/attendance/check-out'),
};

// ==================== DASHBOARD STATS ====================
export const dashboardService = {
  getStats: () => 
    api.get<DashboardStats>('/dashboard/stats'),
};

export default api;