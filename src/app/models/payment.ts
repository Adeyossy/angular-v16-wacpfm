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

export interface PaystackConfig {
  test_pk: string,
  live_pk: string,
  test_sk: string,
  live_sk: string
};