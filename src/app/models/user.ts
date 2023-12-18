export type AppUser = {
  userId: string; // corresponds to Firebase UserId
  firstname: string;
  middlename: string;
  lastname: string;
  gender: "Male" | "Female";
  phoneNumber: string;
  whatsapp: string;
  email: string;
  country: string;
  zip: string;
  dateOfRegistration: string; // add this timestamp on the server
  updateCourseRecords: string[];
  examinationRecords: string[];
  userRoles: Array<"candidate" | "resource_person" | "participant" | "admin" | "college">
}

export type ResourcePerson = {
  accountNumber: number;
  accountName: string;
  bankName: string;
  updateCourseLectureId: string; //id of the lecture from the update course lecture collection
} & AppUser;