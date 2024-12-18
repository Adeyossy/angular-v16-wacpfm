import middy from "@middy/core";
import httpCors from "@middy/http-cors";
import httpHeaderNormalizer from "@middy/http-header-normalizer";
import urlEncodeBodyParser from "@middy/http-urlencode-body-parser";
import { Handler, HandlerContext, HandlerEvent } from "@netlify/functions";
import { initializeApp } from "firebase/app";
import { addDoc, collection, doc, getFirestore, writeBatch } from "firebase/firestore";
import { PaystackResponse } from "src/app/models/payment";
import { BY_CATEGORY, UPDATE_COURSES_RECORDS, UpdateCourseRecord, UpdateCourseType } from "src/app/models/update_course_record";
// import { Response } from "@netlify/functions/dist/function/handler_response";

const firebaseConfig = {
  apiKey: process.env['API_KEY'],
  authDomain: process.env['AUTH_DOMAIN'],
  projectId: process.env['PROJECT_ID'],
  storageBucket: process.env['STORAGE_BUCKET'],
  messagingSenderId: process.env['MESSAGING_SENDER_ID'],
  appId: process.env['APP_ID']
};

const baseHandler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  if (event.body) {
    const body = JSON.parse(event.body) as unknown as PaystackResponse;
    console.log("webhook request body =>", event.body);
    console.log("parsed webhook request body =>", body);
    
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const customFields = body.data.metadata.custom_fields;
    const category = customFields.find(field => field.variable_name === "category");
    const reference = body.data.reference;
    const [userId, updateCourseId, timestamp] = reference.split("_");
    const amount = body.data.amount;
    let courseType: UpdateCourseType[] = [];
    if (amount === BY_CATEGORY.jnr.amount) courseType = ["Membership"];
    else if (amount === BY_CATEGORY.snr.amount) courseType = ["Fellowship"];
        else if (amount === BY_CATEGORY.tot.amount) courseType = ["ToT"];
            else if (amount === BY_CATEGORY['tot-resident'].amount) courseType = ["Membership", "Fellowship", "ToT"];
                else courseType = [];
    
    const batch = writeBatch(db);
    courseType.forEach(type => {
      const document = doc(collection(db, "update_course_records"));
      let record: UpdateCourseRecord = {
        courseType: type,
        id: document.id,
        paymentId: body,
        updateCourseId: updateCourseId,
        userEmail: body.data.customer.email,
        userId: userId,
        approved: true,
        paymentEvidence: ""
      }
      batch.set(document, record);
    });

    try {
      const status = await batch.commit();
      
      return {
        statusCode: 200
      }
    } catch (error) {
      console.log('fetch error => ', error);
      return {
        statusCode: 500,
        body: JSON.stringify('An error occurred')
      }
    }
    
    // customFields.forEach(field => {})
    // let promise;
    // if (category !== undefined) {
    //   switch(category.value) {
    //     case "Membership":
    //       promise = addDoc(collection(db, UPDATE_COURSES_RECORDS),)
    //   }
    // }
  }

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*"
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