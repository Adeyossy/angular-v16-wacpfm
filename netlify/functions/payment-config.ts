import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const paystackConfig = {
  test_pk: process.env['PAYSTACK_TEST_PK'],
  live_pk: process.env['PAYSTACK_LIVE_PK'],
  test_sk: process.env['PAYSTACK_TEST_SK'],
  live_sk: process.env['PAYSTACK_LIVE_SK']
};


const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  return {
    statusCode: 200,
    body: JSON.stringify(paystackConfig)
  }
}

export { handler };