import { FieldValue, serverTimestamp } from "firebase/firestore";
import { DEFAULT_SUBEXAM, Subexam } from "./exam";
import { environment } from "src/environments/environment";

export const CANDIDATES = environment.candidates;

export interface Upload {
  uploadDate: number;
  url: string;
  id: number; // Use the lastModified attribute of the file object as id?
  description: string;
  filetype: string;
  type: WritingType; // could be a casebook, dissertation or PMR
}

export const DEFAULT_UPLOAD: Upload = {
  uploadDate: Date.now(),
  url: "",
  id: 0,
  description: "",
  filetype: "",
  type: ""
}

export interface PreviousAttempt {
  month: string,
  modulesPassed: string[]
}

/**
 * A base model of a candidate for the WACP exam.
 * DO NOT USE DIRECTLY. Use the subclasses instead.
 */
export interface Candidate {
  userId: string;
  candidateId: string; // aka exam number
  gender: string;
  userEmail: string;
  wacpNo: string;
  dateOfBirth: string;
  dateOfRegistration: FieldValue;
  category: string; /** exam category: either membership or fellowship */
  curriculum: string;
  nameOfTrainingCentre: string;
  previousAttemptsDetails: PreviousAttempt[];
  physicalHandicap: string;
  otherHandicap: string;
  handicapAssistance: string;
  exclusivelyBreastfedBaby: string; // if female, response is Yes or No
  thirdTrimester: string; // if female, response is Yes or No
  examCentre: string;
  certificates: Upload[]; // certificate of training
  examNo: string;
  examAlias: string;
}

export const NEW_CANDIDATE: Candidate = {
  userId: "",
  candidateId: "",
  gender: "",
  userEmail: "",
  wacpNo: "WP//",
  dateOfBirth: "",
  dateOfRegistration: serverTimestamp(),
  category: "",
  curriculum: "",
  nameOfTrainingCentre: "",
  previousAttemptsDetails: [],
  physicalHandicap: "",
  otherHandicap: "",
  handicapAssistance: "",
  exclusivelyBreastfedBaby: "",
  thirdTrimester: "",
  examCentre: "",
  certificates: [],
  examAlias: "",
  examNo: ""
};

/**
 * Ideally, candidates should only have one record each for membership and fellowship exams if
 * they did not fail.
 *
 * This implies that any candidate that has a resit should have an increment by 1 in the number
 * of previous dissertations, PMRs and orals taken. A check would have to be made for previous
 * records.
 */
export interface MembershipExamRecord extends Candidate {
  theory: Subexam;
  osce: Subexam;
  logbook: Subexam;
  orals: Subexam;
  pmrs: AcademicWriting[]; // if curriculum is new
  isTheoryBanked: string; // yes or no
  bankedTheoryDate: string;
}

export const NEW_MEMBERSHIP_CANDIDATE: MembershipExamRecord = {
  ...(Object.assign({}, NEW_CANDIDATE)),
  theory: Object.assign({}, DEFAULT_SUBEXAM),
  osce: Object.assign({}, DEFAULT_SUBEXAM),
  logbook: Object.assign({}, DEFAULT_SUBEXAM),
  orals: Object.assign({}, DEFAULT_SUBEXAM),
  pmrs: [],
  isTheoryBanked: "",
  bankedTheoryDate: ""
}

export interface FellowshipExamRecord extends Candidate {
  dissertations: Dissertation[];
  casebooks: AcademicWriting[]; // Will be used for PMRs in the new curriculum
  defense: any; // Will be used in new curriculum?
  previousDissertations: number;
  previousPMRs: number;
}

export const NEW_FELLOWSHIP_CANDIDATE: FellowshipExamRecord = {
  ...(Object.assign({}, NEW_CANDIDATE)),
  dissertations: [],
  casebooks: [],
  defense: null,
  examNo: "",
  examAlias: "",
  previousDissertations: 0,
  previousPMRs: 0
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
};

export interface DissertationGrade extends Grade {
  abstract: { title: "Abstract"; } & SubGrade;
  preliminaryPages: { title: "Preliminary Pages"; } & SubGrade;
  introduction: { title: "Chapter 1: Introduction"; } & SubGrade;
  literatureReview: { title: "Chapter 2: Literature Review"; } & SubGrade;
  method: { title: "Chapter 3: Method"; } & SubGrade;
  results: { title: "Chapter 4: Results"; } & SubGrade;
  discussion: { title: "Chapter 5: Discussion"; } & SubGrade;
  references: { title: "References"; } & SubGrade;
  appendices: { title: "Appendices"; } & SubGrade;
}

export type WritingType = "casebooks" | "pmrs" | "dissertations" | "";

export interface Writing {
  title: string,
  description?: string,
  files: Upload[],
  type: WritingType
}

export const DEFAULT_WRITING: Writing = {
  title: "",
  description: "",
  files: [ Object.assign({}, DEFAULT_UPLOAD) ],
  type: ""
}

export interface AcademicWriting {
  candidateId: string;
  wacpNo: string;
  candidateEmail: string;
  examinerIds: string[];
  examinerEmails: string[];
  examAlias: string;
  gradesByExaminer: Grade[];
  title: string;
  description?: string;
  files: Upload[];
  type: WritingType
}

export const DEFAULT_ACADEMIC_WRITING: AcademicWriting = {
  title: "(click to edit)",
  description: "",
  gradesByExaminer: [].slice(),
  candidateEmail: "",
  candidateId: "",
  examinerEmails: [].slice(),
  examinerIds: [].slice(),
  examAlias: "",
  wacpNo: "",
  files: [].slice(),
  type: "casebooks"
};

export interface Dissertation extends AcademicWriting {
  gradesByExaminer: DissertationGrade[];
  abstract: string;
}

export const DISSERTATION: Dissertation = {
  abstract: "",
  title: "(click to edit)",
  gradesByExaminer: [].slice(),
  candidateEmail: "",
  candidateId: "",
  examinerEmails: [].slice(),
  examinerIds: [].slice(),
  examAlias: "",
  wacpNo: "",
  files: [].slice(),
  type: "dissertations"
};

export interface PMR extends AcademicWriting {
}

