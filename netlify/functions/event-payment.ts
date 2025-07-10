import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { calculateTotal } from "src/app/models/update_course_record";

const paystackConfig = {
  test_pk: process.env['PAYSTACK_TEST_PK'],
  live_pk: process.env['PAYSTACK_LIVE_PK'],
  test_sk: process.env['PAYSTACK_TEST_SK'],
  live_sk: process.env['PAYSTACK_LIVE_SK'],
  payment: {
      amount: calculateTotal(10000 * 100),
      fee: 10000 * 100
    }
};

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  return {
    statusCode: 200,
    body: JSON.stringify(Object.assign(paystackConfig))
  }
}

export { handler };