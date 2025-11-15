import { Handler, HandlerContext, HandlerEvent } from "@netlify/functions";
import { createHmac } from "node:crypto";

const testTransferApproval: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const textEncoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(process.env["PAYSTACK_TEST_SK"]),
    { name: "HMAC", hash: "SHA-512" },
    true,
    ["verify"]
  );

  const signature = Buffer.from(event.headers["x-paystack-signature"] as string, "hex");
  const data = Buffer.from(JSON.stringify(event.body), "hex");

  const hash = await crypto.subtle.verify(
    { name: "HMAC", hash: "SHA-512" },
    cryptoKey,
    signature,
    data
  );

  const hmac = createHmac("sha512", process.env["PAYSTACK_TEST_SK"] as string)
  .update(JSON.stringify(event.body))
  .digest("hex");

  const isEqual = hmac === event.headers["x-paystack-signature"];
  console.log("hash =>", hash);
  console.log("hmac =>", isEqual);

  return {
    statusCode: 200,
    response: {native: hash, node: isEqual}
  }
}

export { testTransferApproval };