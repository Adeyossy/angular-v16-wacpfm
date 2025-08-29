import { FieldValue, serverTimestamp } from "firebase/firestore";
import { environment } from "src/environments/environment";
import { UpdateCourseType } from "./update_course_record";

export interface IndexType {
  [index: string]: string;
}

export const USERS = "users";
export const RESOURCE_PERSONS = environment.resourcePersons;

export type ExamCommittee = "host_examiner" | "chief_examiner";
export const EXAM_COMMITTEE: ExamCommittee[] = ["chief_examiner", "host_examiner"]

export interface UserInfo {
  userId: string; // corresponds to Firebase UserId
  firstname: string;
  middlename: string;
  lastname: string;
  gender: string;
  phoneNumber: string;
  whatsapp: string;
  email: string;
  country: string;
  zip: string;
  designation: string;
  practicePlace: string;
  college: string;
  dateOfRegistration: FieldValue; // add this timestamp on the server
}

export interface AppUser extends UserInfo {
  updateCourseRecords: string[];
  examinationRecords: string[];
  updateCourseRole: "admin" | "resource_person" | "college" | "participant" | "";
  examinationRole: ExamCommittee | "candidate" | "examiner" | "";
}

export const DEFAULT_NEW_APPUSER: AppUser = {
  userId: "",
  firstname: "",
  middlename: "",
  lastname: "",
  gender: "",
  phoneNumber: "",
  whatsapp: "",
  email: "",
  country: "",
  zip: "",
  designation: "",
  practicePlace: "",
  college: "",
  dateOfRegistration: serverTimestamp(),
  updateCourseRecords: [],
  examinationRecords: [],
  updateCourseRole: "",
  examinationRole: ""
}

export const RESOURCE_PERSON_TITLES = ["Prof.", "Dr."] as const;

export type ResourcePerson = {
  id: string;
  title: "Prof." | "Dr.";
  userId: string;
  userEmail: string;
  accountNumber: number;
  accountName: string;
  bankName: string;
  lectureId: string; // ids of the lecture from the update course lecture collection
  updateCourseId: string; // id of the update course being registered for
  courseType: UpdateCourseType
};

export const DEFAULT_RESOURCE_PERSON: ResourcePerson = {
  id: "",
  title: "Dr.",
  userId: "",
  userEmail: "",
  accountNumber: 0,
  accountName: "",
  bankName: "",
  lectureId: "",
  updateCourseId: "",
  courseType: "Membership"
}