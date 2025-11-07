import { Handler, HandlerContext, HandlerEvent } from "@netlify/functions";

const transferApproval: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  return {
    statusCode: 200
  }
}

export { transferApproval };