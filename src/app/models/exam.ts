import { FieldValue } from "firebase/firestore";
import { environment } from "src/environments/environment";

export const EXAMINERS = environment.examiner;
export const EXAMS = environment.exam;

export type Geopolitical = "North Central" | "North East" | "North West" | "South West" | "South East" | "South South" | "";

export interface Examiner {
  userId: string;
  userEmail: string;
  name: string;
  contactPhoneNumber: string;
  country: string;
  dateOfBirth: string;
  nameOfInstitution: string;
  geopolitical: "North Central" | "North East" | "North West" | "South West" | "South East" | "South South" | "";
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

/**
 * Models the individual components under each exam
 */
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
  candidateId: string;
  userEmail: string;
  wacpNo: string;
  dateOfBirth: number;
  dateOfRegistration: FieldValue;
  examType: "Membership" | "Fellowship";
  presenceInTrainingCentre: boolean;
  nameOfTrainingCentre: string;
  previousOrals: number;
  physicalHandicap: "None" | "Use of a wheelchair" | "Use of walking frame or crutches" | `Visual acuity 
    worse than 3/60 despite correction` | `Severe hearing impairment despite hearing aid` | 
    "Others";
  otherHandicap: string;
  handicapAssistance: string;
  exclusivelyBreastfedBaby: boolean; // if female
  thirdTrimester: boolean; // if female
  examCentre: "Abuja" | "Accra" | "Ibadan";
  certificate: Upload; // certificate of training (fellowship only?)
}

type ExamSpecifics = {
  curriculum: string;
  examiners: string[];
  candidates: string[];
}

export interface Exam {
  id: string;
  alias: string;
  title: string;
  dateCreated: FieldValue; // date in milliseconds
  registrationStartDate: string; // date registration starts
  registrationCloseDate: string; // date registration ends
  firstExamDate: string; // first day of exams
  lastExamDate: string;
  membership: ExamSpecifics;
  fellowship: ExamSpecifics;
}

/**
 * Ideally, candidates should only have one record each for membership and fellowship exams if 
 * they did not fail.
 * 
 * This implies that any candidate that has a resit should have an increment by 1 in the number 
 * of previous dissertations, PMRs and orals taken. A check would have to be made for previous 
 * records.
 */
export interface FellowshipExam extends Exam {
  dissertationShareDate: number; // date dissertation is shared with examiners
  pmrShareDate: number; // date PMR is shared with examiners
}

export interface MembershipExamRecord extends Candidate { // DB name - membership_exam_records
  theory: Subexam;
  osce: Subexam;
  logbook: Subexam;
  orals: Subexam;
  pmr: Subexam;
  examId: string;
  examAlias: string;
}

export interface FellowshipExamRecord extends Candidate {
  candidateId: string;
  dissertation: Dissertation[];
  pmrs: AcademicWriting[];
  defense: any;
  examId: string;
  examAlias: string;
  previousDissertations: number;
  previousPMRs: number;
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

const dissertation: Dissertation = {
  abstract: "",
  title: "",
  gradesByExaminer: [],
  candidateEmail: "",
  candidateId: "",
  examinerEmails: [],
  examinerIds: [],
  wacpNo: ""
}

export interface PMR extends AcademicWriting {
}