/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {DocumentData, Filter, getFirestore, WithFieldValue}
  from "firebase-admin/firestore";
import { https, setGlobalOptions } from "firebase-functions";
import crypto from "node:crypto";
import { onRequest } from "firebase-functions/https";
// import * as logger from "firebase-functions/logger";
import { defineSecret } from "firebase-functions/params";
import { PaymentCategory, UpdateCourseRecord, WebhookBody } from "./types/all";

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

const writeDocument = (
  collection: string,
  data: WithFieldValue<DocumentData>
) => {
  getFirestore().doc("")
  return getFirestore().collection(collection);
};

const checkDocumentExists = async (
  collection: string,
  course_id: string,
  email: string
) => {
  const query = getFirestore().collection(collection).where(
    Filter.and(
      Filter.where("userEmail", "==", email), 
      Filter.where("updateCourseId", "==", course_id)
    )
  );

  const snapshot = await query.get();
  return snapshot.docs.map(doc => doc.data() as UpdateCourseRecord);
};

const parseRequestBody = (body: WebhookBody) => {
  const metadataArray = body.data.metadata.custom_fields.map(
    field => [field.variable_name, field.value]
  );

  const metadata: {
    category: PaymentCategory,
    fee: number,
    course_id: string
  } = Object.fromEntries(metadataArray);

  return metadata;
}

const handler = async (
  request: https.Request,
  response: Express.Response
) => {
  const secret = defineSecret("PAYSTACK_TEST_SK");
  // 1. Accept paystack request
  const body: WebhookBody = request.body;
  const hash = crypto.createHmac(
    "sha512",
    secret.value()
  ).update(
    JSON.stringify(body)
  ).digest("hex");
  // console.log("hash =>", hash);
  const requestHeader = request.headers["x-paystack-signature"];
  // console.log("req headers =>", requestHeader);
  // console.log("hash === requestHeader =>", hash === requestHeader);
  // console.log("body =>", body);
  if (hash === requestHeader) {
    // Retrieve the request's body
    // Do something with event
    const metadata = parseRequestBody(body);
    const courseId = metadata.course_id || "";
    const docs = await checkDocumentExists(
      "test_update_course_records", 
      courseId, 
      body.data.customer.email
    );

    if (docs.length) {
      docs.map
    }
  }

  // 2. Parse request body


  // 3. Confirm signature
  // 4. Write document to firestore
};

exports.webhook = onRequest(handler);

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
