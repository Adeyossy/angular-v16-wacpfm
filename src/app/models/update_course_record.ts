import { Payment } from "./payment";

export const UPDATE_COURSES_RECORDS = "update_course_records";

export type UpdateCourseRecord = {
  id: string;
  updateCourseId: string;
  userId: string;
  userEmail: string;
  courseType: "Membership" | "Fellowship" | "ToT";
  paymentId: Payment;
  paymentEvidence?: string;
}