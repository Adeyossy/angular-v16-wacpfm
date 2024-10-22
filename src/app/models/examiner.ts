import { environment } from "src/environments/environment";

export const EXAMINERS = environment.examiner;
export type Geopolitical = "North Central" | "North East" | "North West" | "South West" | "South East" | "South South" | "";

export interface Examiner {
  userId: string;
  userEmail: string;
  name: string;
  contactPhoneNumber: string;
  country: string;
  dateOfBirth: string;
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
  referees: Referee;
}

export interface Referee {
  id: string;
  name: string;
  institution: string;
  email: string;
  phoneNumber: number;
  candidateId: string;
  response: "Correct" | "Not Correct" | "";
  reasonIfIncorrect: string;
}
