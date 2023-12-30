import { Payment } from "./payment";

export const UPDATE_COURSES_RECORDS = "update_course_records";

export type UpdateCourseRecord = {
  updateCourseId: string;
  userId: string;
  paidFor: { 
    courseType: "Membership" | "Fellowship" | "TOT"; 
    paymentInfo: Payment; 
    evidence?: string; 
  };
}