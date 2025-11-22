export interface AttendanceLogResponse {
  id: number;
  date: Object;
  timeIn: string;
  timeOut: string;
  subjectName: string;
  totalHours: number;
  attendanceStatus: string;
  user?: string;
}
