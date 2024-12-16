import { Handler, HandlerContext, HandlerEvent } from "@netlify/functions";
import middy from "@middy/core";
import urlEncodeBodyParser from "@middy/http-urlencode-body-parser";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import { HandlerResponse } from "@netlify/functions/dist/function/handler_response";
import { environment } from "src/environments/environment";
import httpCors from "@middy/http-cors";


const baseHandler: Handler = async (event: HandlerEvent, context: HandlerContext): Promise<HandlerResponse> => {
  console.log("pay endpoint event.body => ", event.body);
  const body = event.body ? JSON.parse(event.body) : null;
  
  if (body) {
    const email = body.hasOwnProperty('email') ? body.email : '';
    const amount = body.hasOwnProperty('amount') ? body.amount : '';
    const reference = body.hasOwnProperty('reference') ? body.reference : '';
    const secret_key = body.hasOwnProperty('secret_key') ? body.secret_key : '';
    const sk = process.env[secret_key];
    // const callback_url = body.hasOwnProperty('callback_url') ? body.callback_url : '';

    const params = JSON.stringify({
      "email": email,
      "amount": amount,
      "currency": "NGN",
      "reference": reference
    });

    console.log("secret key => ", sk);

    const options = {
      method: 'POST',
      port: 443,
      headers: {
        Authorization: `Bearer ${sk}`,
        'Content-Type': 'application/json'
      },
      body: params
    }

    try {
      const response = await fetch('https://api.paystack.co/transaction/initialize', options);
      const data = await response.json();

      return {
        statusCode: 200,
        body: JSON.stringify(data)
      }

    } catch (error) {
      // console.log('fetch error => ', error);
      return {
        statusCode: 500,
        body: JSON.stringify('An error occurred')
      }
    }
  } else {
    return {
      statusCode: 400,
      body: JSON.stringify('Incorrect fields')
    }
  }

}

const handler = middy(baseHandler)
.use(httpCors())
.use(httpHeaderNormalizer())
.use(urlEncodeBodyParser({
  disableContentTypeError: true
}));

export { handler }