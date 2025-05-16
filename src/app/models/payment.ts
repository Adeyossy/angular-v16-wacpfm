import { UpdateCourseType } from "./update_course_record";

export const PAYMENTS = "payments";

export type Payment = {}

export interface PaystackInitResponse {
  status: boolean,
  message: string,
  data: {
    authorization_url: string,
    access_code: string,
    reference: string
  }
}

export interface PaystackResponse {
  status: boolean,
  message: string,
  data: {
    amount: number,
    authorization_url: string,
    customer: {
      firstname: "",
      lastname: "",
      email: ""
    },
    metadata: {
      custom_fields: [
        {
          display_name: "Category",
          variable_name: "category",
          value: UpdateCourseType
        },
        {
          display_name: "Fee",
          variable_name: "fee",
          value: number
        },
        {
          display_name: "Course ID",
          variable_name: "course_id",
          value: string
        }
      ]
    },
    reference: string,
    status: string
  }
}

export interface BasicResponse {
  data: {
    status: string,
    amount: number,
    customer: {
      email: string
    }
  }
}

export interface PaymentDetails {
  amount: number,
  name: UpdateCourseType,
  fee: number,
  items: UpdateCourseType[]
}

export interface PaystackConfig {
  test_pk: string,
  live_pk: string,
  test_sk: string,
  live_sk: string,
  jnr: PaymentDetails,
  snr: PaymentDetails,
  tot: PaymentDetails,
  'tot-resident': PaymentDetails,
  developer: PaymentDetails
};

export interface PaystackTransaction {
  id: string;
  reference: string;
  message: string;
  redirecturl: string;
  status: string;
  trans: string;
  transaction: string;
  trxref: string;
}

export interface CustomerResponse {
  status: boolean,
  message: string,
  data?: {
    email: string,
    firstname: string | null,
    lastname: string | null,
    transactions: PaystackTransaction[]
  }
}

export interface ParsedCustomerResponse {
  status: boolean,
  message: string,
  email: string
}