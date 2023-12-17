export type UpdateCourse = {
  updateCourseId: string;
  creator: string;
  registrationOpenDate: number;
  registrationCloseDate: number;
  startDate: number;
  endDate: number;
  membershipParticipants: string[];
  fellowshipParticipants: string[];
  totParticipants: string[];
  resourcePersons: string[];
}