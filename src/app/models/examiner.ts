import { FieldValue, serverTimestamp } from "firebase/firestore";
import { environment } from "src/environments/environment";

export const EXAMINERS = environment.examiner;
export type Geopolitical = "North Central" | "North East" | "North West" | "South West" | "South East" | "South South" | "";

export interface Examiner {
  userId: string;
  userEmail: string;
  examId: string;
  name: string;
  contactPhoneNumber: string;
  country: string;
  dateOfBirth: string;
  dateOfRegistration: FieldValue;
  nameOfInstitution: string;
  geopolitical: Geopolitical;
  wacpMembershipStatus: string;
  residentDoctorsNo: number;
  trainingCentre: string;
  currentEmploymentStatus: string;
  wacpResponsibilities: boolean;
  yearOfFellowship: number;
  firstYearAsExaminer: number;
  timesPartakenInExam: number;
  trainerCertificationStatus: string;
  doctorsEducatorsTrainingStatus: string;
  dissertationsSupervised: number;
  prbSupervised: number;
  fellowshipSupervised: number;
  fellowsSupervised: number;
  publications: number;
  previousMgtExperience: boolean;
  specifyMgtExperience: string;
  trainingResponsibilities: string;
  residentsMentored: number;
  referees: Referee[];
}

export const NEW_EXAMINER: Examiner = {
  userEmail: "",
  userId: "",
  examId: "",
  name: "",
  contactPhoneNumber: "",
  country: "",
  geopolitical: "",
  dateOfBirth: "",
  dateOfRegistration: serverTimestamp(),
  nameOfInstitution: "",
  wacpMembershipStatus: "",
  residentDoctorsNo: 0,
  trainingCentre: "",
  currentEmploymentStatus: "",
  wacpResponsibilities: false,
  yearOfFellowship: 0,
  firstYearAsExaminer: 0,
  timesPartakenInExam: 0,
  trainerCertificationStatus: "None",
  doctorsEducatorsTrainingStatus: "Not done",
  dissertationsSupervised: 0,
  prbSupervised: 0,
  fellowshipSupervised: 0,
  fellowsSupervised: 0,
  publications: 0,
  previousMgtExperience: false,
  specifyMgtExperience: "",
  trainingResponsibilities: "",
  residentsMentored: 0,
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
