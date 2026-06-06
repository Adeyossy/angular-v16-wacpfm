export type UpdateCourseType = "Membership" | "Fellowship" | "ToT";

export type PaymentCategory = "Membership" | "Fellowship" | "ToT" | "ToT & Resident";

export interface WebhookBody {
  event: string,
  data: {
    id: number,
    domain: string,
    status: string,
    reference: string,
    amount: number,
    message: null,
    gateway_response: string,
    paid_at: string,
    created_at: string,
    channel: string,
    currency: string,
    ip_address: string,
    metadata: {
      custom_fields: [
        {
          display_name: "Category",
          variable_name: "category",
          value: PaymentCategory
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
    log: {
      time_spent: number,
      attempts: number,
      authentication: string,
      errors: number,
      success: false,
      mobile: false,
      input: [],
      channel: null,
      history: Array<
        {
          type: string,
          message: string,
          time: number
        }
      >
    },
    fees: null,
    customer: {
      id: number,
      first_name: string,
      last_name: string,
      email: string,
      customer_code: string,
      phone: null,
      metadata: null,
      risk_action: string
    },
    authorization: {
      authorization_code: string,
      bin: string,
      last4: string,
      exp_month: string,
      exp_year: string,
      card_type: string,
      bank: string,
      country_code: string,
      brand: string,
      account_name: string
    },
    plan: {}
  }
}

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

export type UpdateCourseRecord = {
  id: string;
  updateCourseId: string;
  userId: string;
  userEmail: string;
  courseType: UpdateCourseType;
  paymentId: WebhookBody | null;
  paymentEvidence?: string;
  approved?: boolean; // true if approved, false if declined; missing if not yet attended to
  transaction?: PaystackTransaction;
  flaggedForFraud?: boolean;
  source?: "webhook" | "verify";
}
