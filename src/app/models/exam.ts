import { FieldValue } from "firebase/firestore";

export interface Examiner {
  userId: string;
  dateOfBirth: number;
  geopolitical: "North Central" | "North East" | "North West" | "South West" | "South East" | "South South";
  wacpMembershipStatus: "Life member" | "Paid-up currently" | "Paid-up last year" | "Paid-up 2 years ago";
  residentDoctorsNo: number;
  trainingCentre: string;
  currentEmploymentStatus: "Employed" | "Retired";
  wacpResponsibilities: boolean;
  yearOfFellowship: number;
  firstYearAsExaminer: number;
  timesPartakenInExam: number;
  trainerCertificationStatus: "Current" | "Lapsed" | "None";
  doctorsEducatorsTrainingStatus: "Done" | "Not done" | "Equivalent";
  dissertationsSupervised: number;
  prbSupervised: number;
  fellowshipSupervised: number;
  fellowsSupervised: number;
  publications: number;
  previousMgtExperience: boolean;
  specifyMgtExperience: string;
  trainingResponsibilities: "IRTC" | "CMEC" | "Mentor";
  referees: string[];
}

export interface Referee {
  id: string;
  name: string;
  institution: string;
  email: string;
  phoneNumber: number;
  candidateId: number;
  response: "Correct" | "False";
  reasonIfIncorrect: string;
}

export interface Subexam {
  score: number;
  totalMarksObtainable: number;
  remarks: string;
  assessorId: string;
}

interface Upload {
  uploadDate: FieldValue;
  url: string;
  id: number;
  description: string;
  filetype: string;
}

export interface Candidate {
  userId: string;
  wacpNo: string;
  dateOfBirth: number;
  examType: "Membership" | "Fellowship";
  presenceInTrainingCentre: boolean;
  nameOfTrainingCentre: string;
  previousDissertations: number;
  previousPMRs: number;
  previousOrals: number;
  pmrTitle: string;
  pmrSupervisor1Name: string;
  pmrSupervisor2Name?: string;
  dissertationTitle: string;
  dissertationSupervisor1Name: string;
  dissertationSupervisor2Name?: string;
  dissertationSupervisor3Name?: string;
  physicalHandicap: "None" | "Use of a wheelchair" | "Use of walking frame or crutches" | `Visual acuity 
    worse than 3/60 despite correction` | `Severe hearing impairment despite hearing aid` | 
    "Others";
  otherHandicap: string;
  handicapAssistance: string;
  exclusivelyBreastfedBaby: boolean;
  thirdTrimester: boolean;
  examCentre: "Abuja" | "Accra" | "Ibadan";
  certificate: Upload;
  dissertation: Upload;
  pmr: Upload[];
  pmrPages: Upload[];
}

export interface Exam {
  id: string;
  alias: string;
  dateCreated: FieldValue; // date in milliseconds
  registrationStartDate: number;
  registrationCloseDate: number;
  firstExamDate: number;
  lastExamDate: number;
  examiners: string[];
  candidates: string[];
}

export interface FellowshipExam extends Exam {
  dissertationShareDate: number; // date dissertation is shared with examiners
  pmrShareDate: number; // date PMR is shared with examiners
}

export interface MembershipExamRecord { // DB name - membership_exam_records
  candidateId: string;
  theory: Subexam;
  osce: Subexam;
  logbook: Subexam;
  orals: Subexam;
  examId: string;
  examAlias: string;
}

export interface FellowshipExamRecord {
  candidateId: string;
  dissertationId: string;
  pmrId: string;
  defense: any;
  examId: string;
  examAlias: string;
}

export interface Grade {
  examinerId: string;
  examinerEmail: string;
  score: number;
  totalMarksObtainable: number;
  comment: string;
}

type SubGrade = {
  score: number;
  comment: string;
}

export interface DissertationGrade extends Grade {
  abstract: { title: "Abstract" } & SubGrade;
  preliminaryPages: { title: "Preliminary Pages" } & SubGrade;
  introduction: { title: "Chapter 1: Introduction" } & SubGrade;
  literatureReview: { title: "Chapter 2: Literature Review" } & SubGrade;
  method: { title: "Chapter 3: Method" } & SubGrade;
  results: { title: "Chapter 4: Results" } & SubGrade;
  discussion: { title: "Chapter 5: Discussion" } & SubGrade;
  references: { title: "References" } & SubGrade;
  appendices: { title: "Appendices" } & SubGrade;
}

export interface AcademicWriting {
  candidateId: string;
  wacpNo: string;
  candidateEmail: string;
  examinerIds: string[];
  examinerEmails: string[];
  gradesByExaminer: Grade[];
  title: string;
}

export interface Dissertation extends AcademicWriting {
  gradesByExaminer: DissertationGrade[];
  abstract: string;
}

export interface PMR extends AcademicWriting {
}