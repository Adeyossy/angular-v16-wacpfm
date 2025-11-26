import { environment } from "src/environments/environment";
import { UpdateCourseType } from "./update_course_record";

export const UPDATE_COURSES = environment.updateCourse;
export const UPDATE_COURSES_LECTURES = environment.updateCourseLecture;
export const TRAINER_CERTIFICATIONS = environment.trainerCert;

export type UpdateCourseDetails = {
  theme: string;
  participants: string[];
  lectures: string[];
  certificate: string;
  cpd: string;
  releaseResources: boolean;
  groupLink: string,
  classLink: string[]
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
  membershipParticipants: string | string[];
  membershipGroupLink: string;
  membershipClassLink: string[];
  fellowshipRelease: boolean;
  fellowshipCertificate: string;
  fellowshipCPD: string;
  fellowshipLectures: string[];
  fellowshipTheme: string;
  fellowshipParticipants: string | string[];
  fellowshipGroupLink: string;
  fellowshipClassLink: string[];
  totRelease: boolean;
  totCertificate: string;
  totCPD: string;
  totLectures: string[];
  totTheme: string;
  totParticipants: string | string[];
  totGroupLink: string;
  totClassLink: string[];
  resourcePersons: string[];
  type?: "nuban" | "ghipss" | "mobile_money" | "basa";
  name?: string;
  account_number?: string;
  bank_code?: string;
  currency?: string;
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

export interface Lecture {
  lectureId: string;
  lectureTitle: string;
  lecturerId: string;
  lecturerName: string;
  lecturerEmail: string;
  startTime: string;
  endTime: string;
  materialLink: string[];
  videoLink: string;
}

export interface UpdateCourseLecture extends Lecture {
  updateCourseId: string;
  courseType: UpdateCourseType;
}

export const DEFAULT_UPDATE_COURSE: UpdateCourse = {
  updateCourseId: "",
  title: "",
  creator: "",
  registrationOpenDate: Date.now(),
  registrationCloseDate: Date.now() + (60 * 60 * 1000),
  startDate: Date.now(),
  endDate: Date.now() + (60 * 60 * 1000),
  membershipRelease: false,
  membershipCertificate: "",
  membershipCPD: "",
  membershipLectures: [],
  membershipTheme: "",
  membershipParticipants: [],
  membershipGroupLink: "",
  membershipClassLink: [],
  fellowshipRelease: false,
  fellowshipCertificate: "",
  fellowshipCPD: "",
  fellowshipLectures: [],
  fellowshipTheme: "",
  fellowshipParticipants: [],
  fellowshipGroupLink: "",
  fellowshipClassLink: [],
  totRelease: false,
  totCertificate: "",
  totCPD: "",
  totLectures: [],
  totTheme: "",
  totParticipants: [],
  totGroupLink: "",
  totClassLink: [],
  resourcePersons: []
}

export const DEFAULT_LECTURE: UpdateCourseLecture = {
  courseType: "Membership",
  lectureId: "",
  lecturerId: "",
  lecturerEmail: "",
  lecturerName: "",
  lectureTitle: "",
  updateCourseId: "",
  startTime: Date.now().toString(),
  endTime: String(Date.now() + (60 * 60 * 1000)),
  materialLink: [],
  videoLink: ""
}

/**
 * Models a training certification with list of eligible trainers and the URL of the certificate
 * to be modified.
 * 
 * The id and the updateCourseId are the same but included for redundancy in case of poor memory
 * recall in the future about their relationship.
 */
export interface TrainerCertification {
  id: string,
  updateCourseId: string,
  certificateURL: string,
  trainers: string[]
}

export const DEFAULT_NEW_TRAINER_CERTIFICATION: TrainerCertification = {
  id: "",
  updateCourseId: "",
  certificateURL: "",
  trainers: []
}
