import middy from "@middy/core";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import urlEncodeBodyParser from "@middy/http-urlencode-body-parser";
import { Handler, HandlerContext, HandlerEvent } from "@netlify/functions";
import { TransactionParamsWithSK } from "src/app/models/payment";

// const sk = process.env['PAYSTACK_TEST_SECRET_KEY'];

const verifyHandler: Handler = async (event: HandlerEvent, content: HandlerContext) => {
  const body = event.body ? JSON.parse(event.body) as TransactionParamsWithSK : null;
  console.log("event.body =>", event.body);
  if (body) {
    const queries = Object.entries(body.params).map(([k, v]) => `${k}=${v}`).join("&");
    console.log("queries =>", queries);
    
    const secret_key = body.hasOwnProperty('secret_key') ? body.secret_key : '';
    const sk = process.env[secret_key];
    const options = {
      method: 'GET',
      port: 443,
      headers: {
        Authorization: `Bearer ${sk}`
      }
    }
    
    try {
      const response = await fetch(`https://api.paystack.co/transaction?${queries}`, 
        options);
      const data = await response.json();
      const d = JSON.stringify(data);
      console.log("data =>", d)

      return {
        statusCode: 200,
        body: JSON.stringify(d)
      }

    } catch (error) {
      console.log('fetch error => ', error);
      return {
        statusCode: 500,
        body: JSON.stringify('An error occurred')
      }
    }
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify('Error fetching customer')
    }
  }
}

const handler = middy(verifyHandler)
.use(httpHeaderNormalizer())
.use(urlEncodeBodyParser({
  disableContentTypeError: true
}));

export { handler };