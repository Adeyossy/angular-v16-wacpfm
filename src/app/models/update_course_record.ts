import { Payment } from "./payment";

export const UPDATE_COURSES_RECORDS = "update_course_records";

export type UpdateCourseRecord = {
  updateCourseId: string;
  userId: string;
  userEmail: string;
  courseType: Array<"Membership" | "Fellowship" | "ToT" | "Hybrid">;
  paymentId: Payment;
  paymentEvidence?: string;
}