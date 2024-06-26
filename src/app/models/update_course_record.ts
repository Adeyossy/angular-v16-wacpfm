import { environment } from "src/environments/environment";
import { Payment } from "./payment";

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