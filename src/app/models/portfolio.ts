import { FieldValue } from "firebase/firestore";
import { environment } from "src/environments/environment";

export const PORTFOLIO_COLLECTION = environment.portfolio;

export interface PortfolioSectionItem {
  id: string,
  userId: string,
  email: string,
  category: "Membership" | "Fellowship",
  title: string,
  description: string,
  url: string,
  grade: string,
  section: string,
  subsection: string,
  submission_timestamp: FieldValue,
  examinerId: string,
  examinerEmail: string
}