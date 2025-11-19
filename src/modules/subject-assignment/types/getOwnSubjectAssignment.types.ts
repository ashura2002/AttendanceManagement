export interface SubjectAssignmentResponseShape {
  id: number;
  subject: {
    subjectName: string;
    controlNumber: number;
    subjectDescription: string;
    unit: number;
  };
  room: {
    roomName: string;
    building: {
      buildingName: string;
      location: string;
    };
  };
  startTime: string;
  endTime: string;
  days: string[];
  attendance: {
    timeIn: string | null;
    timeOut: string | null;
    totalHours: number;
    status: string;
    remarks: string;
  };
}
