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

export const DEFAULT_SUBEXAM: Subexam = {
  score: -1,
  totalMarksObtainable: -1,
  remarks: "",
  assessorId: ""
}

type ExamSpecifics = {
  curriculum: string;
  candidates: string[];
  pmrShareDate: number; // date PMR is shared with examiners
}

export interface Exam {
  id: string;
  alias: string; // format: first|second{year} e.g. first2024
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
  alias: "first2024",
  title: "For testing purposes only",
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

export const EXAM_DESCRIPTION = {
  membership: {
    old: ["Theory", "OSCE", "Logbook", "Orals"],
    new: ["Theory", "OSCE", "Logbook", "Orals", "PMR"]
  },
  fellowship: {
    old: ["Dissertation", "Casebook", "Orals"],
    new: ["Dissertation", "PMR", "Portfolio", "Orals"]
  }
}
