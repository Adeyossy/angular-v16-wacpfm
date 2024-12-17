import middy from "@middy/core";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import urlEncodeBodyParser from "@middy/http-urlencode-body-parser";
import { Handler, HandlerContext, HandlerEvent } from "@netlify/functions";

const sk = process.env['PAYSTACK_TEST_SECRET_KEY'];

const verifyHandler: Handler = async (event: HandlerEvent, content: HandlerContext) => {
  const body = event.body ? JSON.parse(event.body) : null;
  if (body && body.hasOwnProperty('reference')) {
    const reference = body.reference as string;
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
      const data = await response.json();

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