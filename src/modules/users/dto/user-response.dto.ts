export class UserResponseDTO {
  id: number;
  userName: string;
  displayName: string;
  email: string;
  role: string;
  department: string | null;
  leaveCredits: number;
}
