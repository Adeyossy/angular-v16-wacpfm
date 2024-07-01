import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const data = {
  elders: process.env['ELDERS']
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  return {
    statusCode: 200,
    body: JSON.stringify(data)
  }
}

export { handler };