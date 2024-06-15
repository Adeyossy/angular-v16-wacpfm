import { FieldValue } from "firebase/firestore";

export const USERS = "users";
export const RESOURCE_PERSONS = "resource_persons";

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
  designation: string;
  practicePlace: string;
  college: string;
  dateOfRegistration: FieldValue; // add this timestamp on the server
  updateCourseRecords: string[];
  examinationRecords: string[];
  updateCourseRole: "admin" | "resource_person" | "college" | "participant" | "";
  examinationRole: "candidate" | "examiner" | "chief_examiner" | "";
}

export type ResourcePerson = {
  userId: string;
  userEmail: string;
  accountNumber: number;
  accountName: string;
  bankName: string;
  lectureId: string; // ids of the lecture from the update course lecture collection
};