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

export interface Transaction {
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

export interface TransactionParams {
  customer?: number,
  from: string,
  status: "success" | "failed" | "reversed",
  perPage?: number
}

export interface TransactionParamsWithSK {
  secret_key: string;
  params: TransactionParams;
}

export interface TransactionResponse {
  status: boolean,
  message: string,
  data: Transaction[]
}

export const DEFAULT_NEW_TRANSACTION_RESPONSE: TransactionResponse = {
  status: false,
  message: "",
  data: []
}

export interface PaystackResponse {
  status: boolean,
  message: string,
  data: Transaction
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

export interface EventPaymentDetails {
  amount: number,
  fee: number
}

export interface PaymentDetails {
  amount: number,
  name: UpdateCourseType,
  fee: number,
  items: UpdateCourseType[]
}

export interface BasePaystackConfig {
  test_pk: string,
  live_pk: string,
  test_sk: string,
  live_sk: string
};

export interface PaystackConfig extends BasePaystackConfig {
  jnr: PaymentDetails,
  snr: PaymentDetails,
  tot: PaymentDetails,
  'tot-resident': PaymentDetails,
  developer: PaymentDetails
};

export interface EventPayment extends BasePaystackConfig {
  payment: EventPaymentDetails;
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

export interface CustomerResponse {
  status: boolean,
  message: string,
  data?: {
    email: string,
    firstname: string | null,
    lastname: string | null,
    transactions: PaystackTransaction[],
    id: number
  }
}

export interface ParsedCustomerResponse {
  status: boolean,
  message: string,
  email: string
}

export interface AccountDetails {
  status: boolean,
  message: string,
  data: {
    account_number: string,
    account_name: string,
    bank_id: number
  }
}

export interface CreateTransferRecipientBody {
  type: "nuban" | "ghipss" | "mobile_money" | "basa",
  name: string,
  account_number: string,
  bank_code: string,
  currency: string
}

export interface TransferRecipient {
  status: boolean,
  message: string,
  data: {
    active: boolean,
    createdAt: string,
    currency: string,
    domain: string,
    id: number,
    integration: number,
    name: string,
    recipient_code: string,
    type: string,
    updatedAt: string,
    is_deleted: boolean,
    details: {
      authorization_code: null,
      account_number: string,
      account_name: null,
      bank_code: string,
      bank_name: string
    }
  }
}

export const DEFAULT_TRANSFER_RECIPIENT: TransferRecipient = {
  status: false,
  message: "",
  data: {
    active: false,
    createdAt: "",
    currency: "",
    domain: "",
    id: -1,
    integration: -1,
    name: "",
    recipient_code: "",
    type: "",
    updatedAt: "",
    is_deleted: false,
    details: {
      authorization_code: null,
      account_number: "",
      account_name: null,
      bank_code: "",
      bank_name: ""
    }
  }
};

export interface NewTransactionOptions {
  /**
   * Your Paystack public key. You can find this on your dashboard in Settings > API Keys & Webhooks
   */
  key: string;
  /**
   * The amount of the transaction in kobo
   */
  amount: number;
  /**
   * The currency of the transaction. Available options in PaystackPop.CURRENCIES object
   */
  currency?: string;
  /**
   * The email address of the customer
   */
  email: string;
  /**
   * The first name of the customer
   */
  firstName?: string;
  /**
   * The last name of the customer
   */
  lastName?: string;
  /**
   * The phone number of the customer
   */
  phone?: string;
  /**
   * A valid Paystack customer code. If provided, this overrides all the customer information above
   */
  customerCode?: string;
  /**
   * An array of payment channels to use. By default, all options available in in PaystackPop.CHANNELS are used
   */
  channels?: Array<"card" | "apple_pay" | "bank_transfer" | "ussd" | "mobile_money" | "eft" | "qr">;
  /**
   * A valid Paystack payment request id
   */
  paymentRequest?: string;
  /**
   * A valid Paystack payment page id
   */
  paymentPage?: string;
  /**
   * A valid object of extra information that you want to be saved to the transaction. To show this on the dashboard, see https://www.npmjs.com/package/@paystack/inline-js#tip-seeing-your-metadata-on-the-dashboard
   */
  metadata?: {
    custom_fields?: Array<{
      display_name: string;
      variable_name: string;
      value?: string | number;
    }>;
  };
  /**
   * Unique case sensitive transaction reference. Only -,., = and alphanumeric characters allowed.
   */
  reference?: string;
  /**
   * A valid Paystack split code e.g. SPL_qQsdYLXddd
   */
  split_code?: string;
  /**
   * A valid Paystack subaccount code e.g. ACCT_8f4s1eq7ml6rlzj
   */
  subaccountCode?: string;
  /**
   * Who bears Paystack charges? account or subaccount (defaults to account).
   */
  bearer?: "account" | "all" | "subaccount" | "all-proportional";
  /**
   * A flat fee (in kobo) to charge the subaccount for this transaction.
   * This overrides the split percentage set when the subaccount was created.
   */
  transactionCharge?: number;
  /**
   * A valid Paystack plan code e.g. PLN_cujsmvoyq2209ws
   */
  planCode?: string;
  /**
   * The number of subscriptions to create for this plan
   */
  subscriptionCount?: number;
  /**
   * Interval for the plan. Valid intervals are hourly, daily, weekly, monthly, annually
   */
  planInterval?: "hourly" | "daily" | "weekly" | "monthly" | "annually";
  /**
   * The number of times to charge for this subscription
   */
  subscriptionLimit?: number;
  /**
   * The start date for the subscription (after the first charge)
   */
  subscriptionStartDate?: string;
  /**
   * Called when the customer successfully completes a transaction
   *
   * @param tranx
   * @returns
   */
  onSuccess?: (tranx: {
    /**
     * transaction id from API
     */
    id: string;
    /**
     * transaction reference
     */
    reference: string;
    /**
     * message from API
     */
    message: string;
    /**
     * The redirect URL configured on you paystach dashboard along with the transaction reference
     */
    redirecturl: string;
    /**
     * The status of the transaction
     */
    status: "success";
    /**
     * The transaction ID
     */
    trans: string;
    /**
     * The transaction ID
     */
    transaction: string;
    /**
     * transaction reference
     */
    trxref: string;
  }) => void;
  /**
   * Called when the transaction is successful loaded and the customer can see the checkout form
   *
   * @param tranx
   * @returns
   */
  onLoad?: (tranx: {
    /**
     * customer object from API
     */
    customer: Record<string, string>;
    /**
     * transaction access code
     */
    accessCode: string;
  }) => void;
  /**
   * Called when the customer cancels the transaction
   *
   * @returns
   */
  onCancel?: () => void;
  /**
   * Called when the transaction was not successfully loaded
   *
   * @returns
   */
  onError?: (
    /**
     * error response from API
     */
    error: {
      type: "setup";
      message: string;
    },
  ) => void;
}