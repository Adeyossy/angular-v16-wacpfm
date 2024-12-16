import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const paystackConfig = {
  test_pk: process.env['PAYSTACK_TEST_PUBLIC_KEY'],
  live_pk: process.env['PAYSTACK_LIVE_PUBLIC_KEY'],
  test_sk: process.env['PAYSTACK_TEST_SECRET_KEY'],
  live_sk: process.env['PAYSTACK_LIVE_SECRET_KEY']
};


const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  return {
    statusCode: 200,
    body: JSON.stringify(paystackConfig)
  }
}

export { handler };