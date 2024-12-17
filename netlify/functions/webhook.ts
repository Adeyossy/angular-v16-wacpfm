import { Handler, HandlerContext, HandlerEvent } from "@netlify/functions";
// import { Response } from "@netlify/functions/dist/function/handler_response";

const baseHandler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  }
}