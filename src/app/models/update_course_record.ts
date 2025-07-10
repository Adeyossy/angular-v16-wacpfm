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

const JNR_FEE = 25000 * 100;
const SNR_FEE = 25000 * 100;
const TOT_FEE = 15000 * 100;
const TOT_RESIDENT_FEE = 25000 * 100;

export const calculateTotal = (fee: number) => {
  return Math.ceil((100 * (fee + 115000)) / 98.5);
}

export const BY_CATEGORY = {
  jnr: {
    amount: calculateTotal(JNR_FEE),
    name: "Membership",
    fee: JNR_FEE,
    items: ["Membership"]
  },
  snr: {
    amount: calculateTotal(SNR_FEE),
    name: "Fellowship",
    fee: SNR_FEE,
    items: ["Fellowship"]
  },
  tot: {
    amount: calculateTotal(TOT_FEE),
    name: "ToT",
    fee: TOT_FEE,
    items: ["ToT"]
  },
  'tot-resident': {
    amount: calculateTotal(TOT_RESIDENT_FEE),
    name: "ToT & Resident",
    fee: TOT_RESIDENT_FEE,
    items: ["Membership", "Fellowship", "ToT"]
  },
  developer: {
    amount: calculateTotal(300000),
    name: "Developer",
    fee: 300000,
    items: ["Membership"]
  }
}
