export const UPDATE_COURSES = "update_courses";
export const UPDATE_COURSES_LECTURES = "update_course_lectures";

export type UpdateCourseDetails = {
  theme: string;
  participants: string[];
  lectures: string[];
  certificate: string;
  releaseResources: boolean;
}

export type UpdateCourse = {
  updateCourseId: string;
  title: string;
  creator: string;
  registrationOpenDate: number;
  registrationCloseDate: number;
  startDate: number;
  endDate: number;
  membershipCertificate: string;
  membershipLectures: string[];
  membershipTheme: string;
  membershipParticipants: string[];
  fellowshipCertificate: string;
  fellowshipLectures: string[];
  fellowshipTheme: string;
  fellowshipParticipants: string[];
  totCertificate: string;
  totLectures: string[];
  totTheme: string;
  totParticipants: string[];
  totUpdateParticipants: string[];
  resourcePersons: string[];
}

export type UpdateCourseRev = {
  updateCourseId: string;
  title: string;
  creator: string;
  registrationOpenDate: number;
  registrationCloseDate: number;
  startDate: number;
  endDate: number;
  membership: UpdateCourseDetails;
  fellowship: UpdateCourseDetails;
  tot: UpdateCourseDetails;
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