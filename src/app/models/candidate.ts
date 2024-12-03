import { FieldValue, serverTimestamp } from "firebase/firestore";
import { Subexam } from "./exam";
import { environment } from "src/environments/environment";

export const CANDIDATES = environment.candidates;

interface Upload {
  uploadDate: FieldValue;
  url: string;
  id: number; // Use the lastModified attribute of the file object as id?
  description: string;
  filetype: string;
  type: string; // could be a casebook, dissertation or PMR
}

export const DEFAULT_UPLOAD: Upload = {
  uploadDate: serverTimestamp(),
  url: "",
  id: 0,
  description: "",
  filetype: "",
  type: ""
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
  examId: string;
  examAlias: string;
}

export const NEW_CANDIDATE: Candidate = {
  userId: "",
  candidateId: "",
  gender: "",
  userEmail: "",
  wacpNo: "",
  dateOfBirth: "",
  dateOfRegistration: serverTimestamp(),
  category: "",
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
    url: "",
    type: ""
  },
  examAlias: "",
  examId: ""
};/**
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
  pmr: Subexam;
}

export interface FellowshipExamRecord extends Candidate {
  candidateId: string;
  dissertation: Dissertation[];
  casebooks: AcademicWriting[];
  defense: any;
  previousDissertations: number;
  previousPMRs: number;
}

export const NEW_FELLOWSHIP_CANDIDATE: FellowshipExamRecord = {
  ...(Object.assign({}, NEW_CANDIDATE)),
  dissertation: [],
  casebooks: [],
  defense: null,
  examId: "",
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

export interface Writing {
  title: string,
  description?: string,
  files: Upload[]
}

export const DEFAULT_WRITING: Writing = {
  title: "",
  description: "",
  files: [ Object.assign({}, DEFAULT_UPLOAD) ]
}

export interface AcademicWriting {
  candidateId: string;
  wacpNo: string;
  candidateEmail: string;
  examinerIds: string[];
  examinerEmails: string[];
  gradesByExaminer: Grade[];
  title: string;
  files: Upload[];
  type: "Dissertation" | "Casebook" | "PMR" | ""
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
  wacpNo: "",
  files: [],
  type: "Dissertation"
};

export interface PMR extends AcademicWriting {
}

