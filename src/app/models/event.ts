import { environment } from "src/environments/environment";

export const EVENTS_COLLECTION = environment.event;
export const EVENT_FEES_COLLECTION = environment.eventFee;
export const EVENT_LECTURES_COLLECTION = environment.eventLecture;

/**
 * Models an event carried out by an organisation.
 * The id of the event is derived from its acronym + first date e.g. (hma_09_08_2025).
 * acronym is a 3-letter string for the event.
 * 
 * The year, month, day are based on the first day of the course and are useful for 
 * querying the database. Acronym is useful as the category of a event if an organisation
 * hosts multiple events.
 */
export interface Event {
  id: string,
  acronym: string,
  year: string,
  month: string,
  day: string, 
  title: string,
  summary: string,
  edition: string,
  maximum_capacity?: number,
  expected_capacity: number,
  registration_opens: number,
  registration_closes: number,
  first_day: number,
  last_day: number,
  course_duration: number,
  organisation_id: string,
  organisation_email: string,
  organisation_phone: string,
  accept_payment: boolean,
  fees: string[], // details of payments to be made on the platform
  objectives: string[],
  other_info: unknown[],
  platform: string, // could be Jitsi, Zoom or Zoho depending on the organisation
  verification_protocol: string,
  registered_participants: string[],
  paid_participants: string[],
  whatsapp: string //URL for QR code image for whatsapp group.
}

export const DEFAULT_NEW_EVENT: Event = {
  id: "",
  acronym: "",
  year: "",
  month: "",
  day: "",
  title: "",
  summary: "",
  edition: "",
  expected_capacity: 0,
  registration_opens: 0,
  registration_closes: 0,
  first_day: 0,
  last_day: 0,
  course_duration: 0, // duration of course in seconds
  organisation_id: "",
  organisation_email: "",
  organisation_phone: "",
  accept_payment: false,
  fees: [], // list of fee ids linking to fees collection/database
  objectives: [],
  other_info: [],
  platform: "",
  verification_protocol: "",
  registered_participants: [],
  paid_participants: [],
  whatsapp: ""
}