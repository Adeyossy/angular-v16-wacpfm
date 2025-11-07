import { Handler, HandlerContext, HandlerEvent } from "@netlify/functions";

const testTransferApproval: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  return {
    statusCode: 200
  }
}

export { testTransferApproval };