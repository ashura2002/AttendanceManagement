export interface AttendanceLogResponse {
  id: number;
  date: Object;
  timeIn: string;
  timeOut: string;
  totalHours: number;
  attendanceStatus: string;
}
