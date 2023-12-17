import { Payment } from "./payment";

export type UpdateCourseRecord = {
  updateCourseId: string;
  userId: string;
  paidFor: { 
    courseType: "Membership" | "Fellowship" | "TOT"; 
    paymentInfo: Payment; 
    evidence?: string; 
  };
}