import { FieldValue, serverTimestamp } from "firebase/firestore";
import { environment } from "src/environments/environment";
import { Upload } from "./candidate";

export const EXAMINERS = environment.examiner;
export type Geopolitical = "North Central" | "North East" | "North West" | "South West" | "South East" | "South South" | "";

export interface Examiner {
  userId: string; //
  userEmail: string; //
  examAlias: string; // e.g. second2024, first2025, second2025 etc based on 2 exams per year
  name: string; //
  contactPhoneNumber: string; //
  country: string; //
  dateOfBirth: string; //
  dateOfRegistration: FieldValue; //
  nameOfInstitution: string; //
  geopolitical: Geopolitical; //
  wacpMembershipStatus: string; //
  noOfMembershipResidents: number; //
  noOfFellowshipResidents: number; //
  noOfTrainers: number; //
  currentEmploymentStatus: string; //
  yearOfFellowship: number; //
  numberOfYearsAsFellow: number; //
  daeTrainingStatus: string; //
  daeCertificate: Upload[];
  trainerCertificationStatus: string; //
  invitationsInLast3Exams: number; //
  dissertationsSupervised: number; //
  casebooksSupervised: number; //
  publications: number; //
  trainingResponsibilities: string; //
  institutionsWorked: string; //
  collegeAGSMAttendance10: number; //
  attendanceAtFacultyTOT5: number; //
  trainingCentre: string; //
  wacpResponsibilities: boolean;
  firstYearAsExaminer: number; //
  timesPartakenInExam: number; //
  fellowshipSupervised: number; //
  fellowsSupervised: number; //
  previousMgtExperience: boolean; //
  specifyMgtExperience: string; //
  referees: Referee[]; //
}

export const NEW_EXAMINER: Examiner = {
  userEmail: "",
  userId: "",
  examAlias: "",
  name: "",
  contactPhoneNumber: "",
  country: "",
  geopolitical: "",
  dateOfBirth: "",
  dateOfRegistration: serverTimestamp(),
  nameOfInstitution: "",
  wacpMembershipStatus: "",
  trainingCentre: "",
  currentEmploymentStatus: "",
  wacpResponsibilities: false,
  yearOfFellowship: 0,
  firstYearAsExaminer: 0,
  timesPartakenInExam: 0,
  trainerCertificationStatus: "None",
  daeTrainingStatus: "Not done",
  daeCertificate: [],
  attendanceAtFacultyTOT5: 0,
  collegeAGSMAttendance10: 0,
  institutionsWorked: "",
  invitationsInLast3Exams: 0,
  noOfMembershipResidents: 0,
  noOfFellowshipResidents: 0,
  noOfTrainers: 0,
  numberOfYearsAsFellow: 0,
  dissertationsSupervised: 0,
  casebooksSupervised: 0,
  fellowshipSupervised: 0,
  fellowsSupervised: 0,
  publications: 0,
  previousMgtExperience: false,
  specifyMgtExperience: "",
  trainingResponsibilities: "",
  referees: []
};

/**
 * A referee is a subcollection under
 */
export interface Referee {
  id: string; // The userId of this referee if they are registered on the app
  name: string;
  institution: string;
  email: string;
  phoneNumber: string;
  examinerId: string;
  examinerEmail: string;
  response: "Correct" | "Not Correct" | "";
  reasonIfIncorrect: string;
}
