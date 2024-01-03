import { FieldValue } from "firebase/firestore";

export const USERS = "users";

export type AppUser = {
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
  dateOfRegistration: FieldValue; // add this timestamp on the server
  updateCourseRecords: string[];
  examinationRecords: string[];
  updateCourseRole: "admin" | "resource_person" | "college" | "participant" | "";
  examinationRole: "candidate" | "examiner" | "chief_examiner" | "";
}

export type ResourcePerson = {
  accountNumber: number;
  accountName: string;
  bankName: string;
  updateCourseLectureId: string; //id of the lecture from the update course lecture collection
} & AppUser;