import { environment } from "src/environments/environment";
import { Payment } from "./payment";

export const UPDATE_COURSES_RECORDS = environment.updateCourseRecord;

export type UpdateCourseType = "Membership" | "Fellowship" | "ToT";

export type UpdateCourseRecord = {
  id: string;
  updateCourseId: string;
  userId: string;
  userEmail: string;
  courseType: UpdateCourseType;
  paymentId: Payment | null;
  paymentEvidence?: string;
}