import { FieldValue, serverTimestamp } from "firebase/firestore";
import { environment } from "src/environments/environment";
import { Upload } from "./candidate";

export const PORTFOLIO_COLLECTION = environment.portfolio;

export interface PortfolioSectionItem {
  id: string,
  userId: string,
  email: string,
  category: "Membership" | "Fellowship" | "",
  title: string,
  description: string,
  files: Upload[],
  grade: string,
  section: string,
  subsection: string,
  submission_timestamp: FieldValue,
  examinerId: string,
  examinerEmail: string
}

export const DEFAULT_PORTFOLIO_SECTION_ITEM: PortfolioSectionItem = {
  id: "",
  userId: "",
  email: "",
  category: "",
  title: "",
  description: "",
  files: [],
  grade: "",
  section: "",
  subsection: "",
  submission_timestamp: serverTimestamp(),
  examinerId: "",
  examinerEmail: ""
}