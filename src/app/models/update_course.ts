import { environment } from "src/environments/environment";

export const UPDATE_COURSES = environment.updateCourse;
export const UPDATE_COURSES_LECTURES = "update_course_lectures";

export type UpdateCourseDetails = {
  theme: string;
  participants: string[];
  lectures: string[];
  certificate: string;
  cpd: string;
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
  membershipRelease: boolean;
  membershipCertificate: string;
  membershipCPD: string;
  membershipLectures: string[];
  membershipTheme: string;
  membershipParticipants: string;
  fellowshipRelease: boolean;
  fellowshipCertificate: string;
  fellowshipCPD: string;
  fellowshipLectures: string[];
  fellowshipTheme: string;
  fellowshipParticipants: string;
  totRelease: boolean;
  totCertificate: string;
  totCPD: string;
  totLectures: string[];
  totTheme: string;
  totParticipants: string;
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
  resourcePersons: string[];
}

export type UpdateCourseLecture = {
  updateCourseId: string;
  courseType: "Membership" | "Fellowship" | "ToT"
  lectureId: string;
  lectureTitle: string;
  lecturerName: string;
  lecturerId: string;
  startTime: string;
  endTime: string;
  materialLink: string[];
  videoLink: string;
}