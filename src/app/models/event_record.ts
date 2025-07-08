import { FieldValue, serverTimestamp } from "firebase/firestore";
import { AppUser, UserInfo } from "./user";

export const EVENT_RECORDS_COLLECTION = "event_records";

/**
 * The ID of a record is a combination of the email and eventId.
 * Keep in mind a special case of events with subcategories. How should that be handled?
 */
export interface EventRecord extends UserInfo {
  id: string,
  eventId: string,
  paymentData: unknown,
  transaction: unknown,
  amountPaid: number,
  approved?: boolean
}

export const DEFAULT_NEW_EVENT_RECORD: EventRecord = {
  id: "",
  userId: "", // corresponds to Firebase UserId
  firstname: "",
  middlename: "",
  lastname: "",
  gender: "",
  phoneNumber: "",
  whatsapp: "",
  email: "",
  country: "",
  zip: "",
  designation: "",
  practicePlace: "",
  college: "",
  dateOfRegistration: serverTimestamp(), // add this timestamp on the server,
  eventId: "",
  paymentData: null,
  transaction: null,
  amountPaid: -1
}