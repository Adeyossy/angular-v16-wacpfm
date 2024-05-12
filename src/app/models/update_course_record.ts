import { Payment } from "./payment";

export const UPDATE_COURSES_RECORDS = "update_course_records";

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