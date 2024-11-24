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

type ExamSpecifics = {
  curriculum: string;
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
  examiners: string[]; // invited examiners
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
    candidates: [].slice(), 
    pmrShareDate: Date.now()
  },
  fellowship: { 
    curriculum: "Old", 
    candidates: [].slice(), 
    pmrShareDate: Date.now(),
    dissertationShareDate: Date.now()
  },
  examiners: []
}

