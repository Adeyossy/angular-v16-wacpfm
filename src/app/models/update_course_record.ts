import { environment } from "src/environments/environment";
import { Payment, PaystackTransaction } from "./payment";

export const UPDATE_COURSES_RECORDS = environment.updateCourseRecord;
export const UPDATE_COURSE_TYPES = ["Membership", "Fellowship", "ToT"] as const;

export type UpdateCourseType = "Membership" | "Fellowship" | "ToT";

export type UpdateCourseRecord = {
  id: string;
  updateCourseId: string;
  userId: string;
  userEmail: string;
  courseType: UpdateCourseType;
  paymentId: Payment | null;
  paymentEvidence?: string;
  approved?: boolean; // true if approved, false if declined; missing if not yet attended to
  transaction?: PaystackTransaction;
  flaggedForFraud?: boolean;
}

export const DEFAULT_COURSE_RECORD: UpdateCourseRecord = {
  courseType: 'Membership',
  id: "",
  paymentId: "",
  updateCourseId: "",
  userEmail: "",
  userId: "",
  paymentEvidence: ""
};

export const BY_CATEGORY = {
  jnr: {
    amount: 25945.37 * 100,
    name: "Membership",
    fee: 25000 * 100,
    items: ["Membership"]
  },
  snr: {
    amount: 25954.37 * 100,
    name: "Fellowship",
    fee: 25000 * 100,
    items: ["Fellowship"]
  },
  tot: {
    amount: 10945.37 * 100,
    name: "ToT",
    fee: 10000 * 100,
    items: ["ToT"]
  },
  'tot-resident': {
    amount: 20945.37 * 100,
    name: "ToT & Resident",
    fee: 20000 * 100,
    items: ["Membership", "Fellowship", "ToT"]
  },
  developer: {
    amount: 100*100,
    name: "Developer",
    fee: 20000 * 100,
    items: ["Membership"]
  }
}
