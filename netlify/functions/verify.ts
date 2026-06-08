import middy from "@middy/core";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import urlEncodeBodyParser from "@middy/http-urlencode-body-parser";
import { Handler, HandlerContext, HandlerEvent } from "@netlify/functions";
import { BasicResponse } from "src/app/models/payment";

// const sk = process.env['PAYSTACK_TEST_SECRET_KEY'];

const verifyHandler: Handler = async (event: HandlerEvent, content: HandlerContext) => {
  const body = event.body ? JSON.parse(event.body) : null;
  console.log("event.body =>", event.body);
  if (body && body.hasOwnProperty('reference')) {
    const reference = body.reference as string;
    console.log("reference =>", reference);
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
      const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, 
        options);
      let data: BasicResponse = await response.json();
      console.log("response =>", data);
      console.log("response.data =>", data.data);
      console.log("response.data.amount =>", data.data.amount);
      if (reference.includes("-") || reference.includes("_")) {
        // const paystackResponse: BasicResponse = JSON.parse(data);
        if (data.data.amount === 1670051) {
          data.data.amount = 1639594
        } 
        
        if (data.data.amount === 2685280) {
          data.data.amount = 2654823;
        }
      }

      return {
        statusCode: 200,
        body: JSON.stringify(data)
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
      body: JSON.stringify('Error with verification')
    }
  }
}

const handler = middy(verifyHandler)
.use(httpHeaderNormalizer())
.use(urlEncodeBodyParser({
  disableContentTypeError: true
}));

export { handler };