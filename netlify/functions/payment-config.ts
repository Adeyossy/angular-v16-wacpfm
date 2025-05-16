import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const paystackConfig = {
  test_pk: process.env['PAYSTACK_TEST_PK'],
  live_pk: process.env['PAYSTACK_LIVE_PK'],
  test_sk: process.env['PAYSTACK_TEST_SK'],
  live_sk: process.env['PAYSTACK_LIVE_SK']
};

const JNR_FEE = 25000 * 100;
const SNR_FEE = 25000 * 100;
const TOT_FEE = 15000 * 100;
const TOT_RESIDENT_FEE = 25000 * 100;

const calculateTotal = (fee: number) => {
  return Math.ceil((100 * (fee + 115000)) / 98.5);
}

export const BY_CATEGORY = {
  jnr: {
    amount: calculateTotal(JNR_FEE),
    name: "Membership",
    fee: JNR_FEE,
    items: ["Membership"]
  },
  snr: {
    amount: calculateTotal(SNR_FEE),
    name: "Fellowship",
    fee: SNR_FEE,
    items: ["Fellowship"]
  },
  tot: {
    amount: calculateTotal(TOT_FEE),
    name: "ToT",
    fee: TOT_FEE,
    items: ["ToT"]
  },
  'tot-resident': {
    amount: calculateTotal(TOT_RESIDENT_FEE),
    name: "ToT & Resident",
    fee: TOT_RESIDENT_FEE,
    items: ["Membership", "Fellowship", "ToT"]
  },
  developer: {
    amount: calculateTotal(300000),
    name: "Developer",
    fee: 300000,
    items: ["Membership"]
  }
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  return {
    statusCode: 200,
    body: JSON.stringify(Object.assign(paystackConfig, BY_CATEGORY))
  }
}

export { handler };