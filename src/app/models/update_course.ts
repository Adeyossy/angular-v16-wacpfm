export const UPDATE_COURSES = "update_courses";
export const UPDATE_COURSES_LECTURES = "update_course_lectures";

export type UpdateCourse = {
  updateCourseId: string;
  title: string;
  creator: string;
  registrationOpenDate: number;
  registrationCloseDate: number;
  startDate: number;
  endDate: number;
  membershipTheme: string;
  membershipParticipants: string[];
  fellowshipTheme: string;
  fellowshipParticipants: string[];
  totTheme: string;
  totParticipants: string[];
  resourcePersons: string[];
}

export type UpdateCourseLecture = {
  lectureId: string;
  lectureName: string;
  lecturerName: string;
  lecturerId: string;
  startTime: string;
  endTime: string;
}