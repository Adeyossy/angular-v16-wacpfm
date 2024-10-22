import { FieldValue, serverTimestamp } from "firebase/firestore";
import { environment } from "src/environments/environment";

export const EXAMINERS = environment.examiner;
export const EXAMS = environment.exam;

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
  id: number; // Use the lastModified attribute of the file object as id?
  description: string;
  filetype: string;
}

export interface Candidate {
  userId: string;
  candidateId: string; // aka exam number
  gender: string;
  userEmail: string;
  wacpNo: string;
  dateOfBirth: string;
  dateOfRegistration: FieldValue;
  examType: string;
  presenceInTrainingCentre: string; // Yes or No
  nameOfTrainingCentre: string;
  previousOrals: number;
  physicalHandicap: string;
  otherHandicap: string;
  handicapAssistance: string;
  exclusivelyBreastfedBaby: string; // if female, response is Yes or No
  thirdTrimester: string; // if female, response is Yes or No
  examCentre: string;
  certificate: Upload; // certificate of training
}

export const NEW_CANDIDATE: Candidate = {
  userId: "",
  candidateId: "",
  gender: "",
  userEmail: "",
  wacpNo: "",
  dateOfBirth: "",
  dateOfRegistration: serverTimestamp(),
  examType: "",
  presenceInTrainingCentre: "",
  nameOfTrainingCentre: "",
  previousOrals: 0,
  physicalHandicap: "",
  otherHandicap: "",
  handicapAssistance: "",
  exclusivelyBreastfedBaby: "",
  thirdTrimester: "",
  examCentre: "",
  certificate: {
    description: "",
    filetype: "",
    id: 0,
    uploadDate: serverTimestamp(),
    url: ""
  }
}

type ExamSpecifics = {
  curriculum: string;
  examiners: string[];
  candidates: string[];
  pmrShareDate: number; // date PMR is shared with examiners
}

export interface Exam {
  id: string;
  alias: string; // format: lowercase full month-full year
  title: string;
  dateCreated: FieldValue; // date in milliseconds
  registrationStartDate: number; // date registration starts
  registrationCloseDate: number; // date registration ends
  firstExamDate: number; // first day of exams
  lastExamDate: number;
  membership: ExamSpecifics;
  fellowship: ExamSpecifics & {dissertationShareDate: number}; // date dissertation is shared with examiners
}

export const NEW_EXAM: Exam = {
  id: "",
  alias: "",
  title: "",
  dateCreated: serverTimestamp(),
  registrationStartDate: Date.now(),
  registrationCloseDate: Date.now(),
  firstExamDate: Date.now(),
  lastExamDate: Date.now(),
  membership: {
    curriculum: "Old", 
    examiners: [].slice(), 
    candidates: [].slice(), 
    pmrShareDate: Date.now()
  },
  fellowship: { 
    curriculum: "Old", 
    examiners: [].slice(), 
    candidates: [].slice(), 
    pmrShareDate: Date.now(),
    dissertationShareDate: Date.now()
  }
}

/**
 * Ideally, candidates should only have one record each for membership and fellowship exams if 
 * they did not fail.
 * 
 * This implies that any candidate that has a resit should have an increment by 1 in the number 
 * of previous dissertations, PMRs and orals taken. A check would have to be made for previous 
 * records.
 */
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