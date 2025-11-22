export interface SubjectAssignmentResponseShape {
  subjectAssignmentID: number;
  subjectName: string;
  controllNumber: number;
  subjectDescription: string;
  unit: number;
  roomName: string;
  building: string;
  startTime: string;
  endTime: string;
  remarks: string | undefined;
  TimeIn: string | undefined;
  TimeOut: string;
  AttendanceStatus: string;
}
