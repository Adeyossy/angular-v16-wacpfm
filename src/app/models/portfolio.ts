import { FieldValue } from "firebase/firestore";

export interface Portfolio {
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