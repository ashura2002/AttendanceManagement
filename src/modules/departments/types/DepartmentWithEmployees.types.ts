
// for custom shape respnse
export interface DepartmentWithEmployees {
  id: number;
  departmentName: string;
  description: string;
  totalEmployees: number;
  employees: { displayName: string; email: string }[];
}
