export type AppUser = {
  userId: string;
  firstname: string;
  middlename: string;
  lastname: string;
  gender: "Male" | "Female";
  phoneNumber: string;
  whatsapp: string;
  email: string;
  country: string;
  zip: string;
  dateOfRegistration: string;
  updateCourseRecords: string[];
  examinationRecords: string[];
}