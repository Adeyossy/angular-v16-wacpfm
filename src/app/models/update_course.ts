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
  membershipLectures: string[];
  membershipTheme: string;
  membershipParticipants: string[];
  fellowshipLectures: string[];
  fellowshipTheme: string;
  fellowshipParticipants: string[];
  totLectures: string[];
  totTheme: string;
  totParticipants: string[];
  totUpdateParticipants: string[];
  resourcePersons: string[];
}

export type UpdateCourseLecture = {
  updateCourseId: string;
  courseType: "Membership" | "Fellowship" | "ToT" | "Hybrid"
  lectureId: string;
  lectureTitle: string;
  lecturerName: string;
  lecturerId: string;
  startTime: string;
  endTime: string;
  materialLink: string;
  videoLink: string;
}