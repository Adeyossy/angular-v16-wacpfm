import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { arrayRemove, arrayUnion, FieldValue, QueryFieldFilterConstraint, where } from 'firebase/firestore';
import { Observable, of, map, concatMap, catchError } from 'rxjs';
import { CacheService } from './cache.service';
import { DEFAULT_UPDATE_COURSE, TRAINER_CERTIFICATIONS, TrainerCertification, UPDATE_COURSES, UpdateCourse } from '../models/update_course';
import { BY_CATEGORY, UPDATE_COURSES_RECORDS, UpdateCourseRecord, UpdateCourseType } from '../models/update_course_record';
import { CardList } from '../widgets/card-list/card-list.component';
import { BasicResponse, Category, DEFAULT_BASIC_RESPONSE, PaystackTransaction, Transaction } from '../models/payment';
import { environment } from 'src/environments/environment';
import { User } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class UpdateCourseService extends CacheService {
  shouldUpgradeDB = false;

  queryUpdateCourse$(where: QueryFieldFilterConstraint[]): Observable<UpdateCourse[]> {
    return this.queryItem$<UpdateCourse>(UPDATE_COURSES, where).pipe(
      map(courses => courses.map(this.defineMissing).map(this.participantsToArray)),
      concatMap(courses => this.shouldUpgradeDB ? this.upgradeDB(courses) : of(courses))
    );
  }

  participantsToArray = (course: UpdateCourse) => {
    if (typeof (course.membershipParticipants) === "string") {
      this.shouldUpgradeDB = true;
      course.membershipParticipants = course.membershipParticipants.split(", ");
    }

    if (typeof (course.fellowshipParticipants) === "string") {
      this.shouldUpgradeDB = true;
      course.fellowshipParticipants = course.fellowshipParticipants.split(", ");
    }

    if (typeof (course.totParticipants) === "string") {
      this.shouldUpgradeDB = true;
      course.totParticipants = course.totParticipants.split(", ");
    }
    console.log("shouldUpgradeDB =>", this.shouldUpgradeDB);
    return course;
  }

  defineMissing = (course: UpdateCourse): UpdateCourse => {
    const c: UpdateCourse = JSON.parse(JSON.stringify(DEFAULT_UPDATE_COURSE));

    return {
      creator: course.creator !== undefined ? course.creator : c.creator,
      endDate: course.endDate !== undefined ? course.endDate : c.endDate,
      fellowshipCertificate: course.fellowshipCertificate !== undefined ?
        course.fellowshipCertificate : c.fellowshipCertificate,
      fellowshipClassLink: course.fellowshipClassLink !== undefined ?
        course.fellowshipClassLink : c.fellowshipClassLink,
      fellowshipCPD: course.fellowshipCPD !== undefined ? course.fellowshipCPD : c.fellowshipCPD,
      fellowshipGroupLink: course.fellowshipGroupLink !== undefined ?
        course.fellowshipGroupLink : c.fellowshipGroupLink,
      fellowshipLectures: course.fellowshipLectures !== undefined ?
        course.fellowshipLectures : c.fellowshipLectures,
      fellowshipParticipants: course.fellowshipParticipants !== undefined ?
        course.fellowshipParticipants : c.fellowshipParticipants,
      fellowshipRelease: course.fellowshipRelease !== undefined ?
        course.fellowshipRelease : c.fellowshipRelease,
      fellowshipTheme: course.fellowshipTheme !== undefined ? course.fellowshipTheme :
        c.fellowshipTheme,
      membershipCertificate: course.membershipCertificate !== undefined ?
        course.membershipCertificate : c.membershipCertificate,
      membershipClassLink: course.membershipClassLink !== undefined ?
        course.membershipClassLink : c.membershipClassLink,
      membershipCPD: course.membershipCPD !== undefined ? course.membershipCPD : c.membershipCPD,
      membershipGroupLink: course.membershipGroupLink !== undefined ?
        course.membershipGroupLink : c.membershipGroupLink,
      membershipLectures: course.membershipLectures !== undefined ?
        course.membershipLectures : c.membershipLectures,
      membershipParticipants: course.membershipParticipants !== undefined ?
        course.membershipParticipants : c.membershipParticipants,
      membershipRelease: course.membershipRelease !== undefined ?
        course.membershipRelease : c.membershipRelease,
      membershipTheme: course.membershipTheme !== undefined ? course.membershipTheme :
        c.membershipTheme,
      registrationCloseDate: course.registrationCloseDate !== undefined ?
        course.registrationCloseDate : c.registrationCloseDate,
      registrationOpenDate: course.registrationOpenDate !== undefined ?
        course.registrationOpenDate : c.registrationOpenDate,
      resourcePersons: course.resourcePersons !== undefined ? course.resourcePersons :
        c.resourcePersons,
      startDate: course.startDate !== undefined ? course.startDate : c.startDate,
      title: course.title !== undefined ? course.title : c.title,
      totCertificate: course.totCertificate !== undefined ?
        course.totCertificate : c.totCertificate,
      totClassLink: course.totClassLink !== undefined ?
        course.totClassLink : c.totClassLink,
      totCPD: course.totCPD !== undefined ? course.totCPD : c.totCPD,
      totGroupLink: course.totGroupLink !== undefined ?
        course.totGroupLink : c.totGroupLink,
      totLectures: course.totLectures !== undefined ?
        course.totLectures : c.totLectures,
      totParticipants: course.totParticipants !== undefined ?
        course.totParticipants : c.totParticipants,
      totRelease: course.totRelease !== undefined ?
        course.totRelease : c.totRelease,
      totTheme: course.totTheme !== undefined ? course.totTheme :
        c.totTheme,
      updateCourseId: course.updateCourseId !== undefined ?
        course.updateCourseId : c.updateCourseId
    }
  }

  backup = (courses: UpdateCourse[]) => {
    return this.authService.batchWriteDocs$(
      courses.map(course => {
        return {
          data: course,
          path: `backup_${UPDATE_COURSES}_2/${course.updateCourseId}`,
          type: "set"
        }
      })
    )
  }

  writeUpgradeToDB = (courses: UpdateCourse[]) => {
    return this.authService.batchWriteDocs$(
      courses.map(course => {
        return {
          data: course,
          path: `${UPDATE_COURSES}/${course.updateCourseId}`,
          type: "update"
        }
      })
    ).pipe(map(_res => courses))
  }

  upgradeDB = (courses: UpdateCourse[]): Observable<UpdateCourse[]> => {
    console.log("Upgrading the collection in database");
    return this.backup(courses).pipe(
      map(res => {
        console.log("backup done");
        return courses.map(this.defineMissing).map(this.participantsToArray)
      }),
      concatMap(this.writeUpgradeToDB),
      map(res => {
        console.log("final result =>", res);
        console.log("done");
        this.resetCache(UPDATE_COURSES);
        return res;
      }),
      catchError(err => {
        console.log("err converting =>", err);
        return of([])
      })
    )
  }

  getPayments$(id: string) {
    return this.queryItem$<UpdateCourseRecord>(UPDATE_COURSES_RECORDS, [
      where("updateCourseId", "==", id)
    ])
  }

  getPaymentsList$(id: string): Observable<CardList[]> {
    return this.getPayments$(id).pipe(
      map(records => records.map(r => {
        return {
          title: r.userEmail,
          subtitle: r.courseType,
          text: ""
        }
      }))
    )
  }

  fetchTrainerCert$ = (updateCourseId: string) => {
    this.resetCache(TRAINER_CERTIFICATIONS);
    return this.queryItem$<TrainerCertification>(
      TRAINER_CERTIFICATIONS, [
      where("id", "==", updateCourseId)
    ]
    );
  }

  parseTransactionDetails = (transaction: Transaction, record: UpdateCourseRecord) => {
    const fields = transaction.metadata.custom_fields;
    fields.forEach((field) => {
      switch (field.variable_name) {
        case "category":
          record.courseType = field.value;
          break;

        case "course_id":
          record.updateCourseId = field.value;
          break;

        case "fee":
        // begin transfer

        default:
          break;
      }
    });

    return record;
  }

  transferCoursePayment$ = (updateCourse: UpdateCourse) => {
    return this.authService.createTransferRecipient$({
      account_number: updateCourse.account_number ? updateCourse.account_number : "",
      bank_code: updateCourse.bank_code ? updateCourse.bank_code : "",
      currency: updateCourse.currency ? updateCourse.currency : "",
      name: updateCourse.name ? updateCourse.name : "",
      type: updateCourse.type ? updateCourse.type : "nuban"
    }).pipe(
      // concatMap(transferRecipient => {})
    )
  }

  createApprovedRecord = (params: { user: User, uCourseId: string, category: string },
    response: BasicResponse, transaction: PaystackTransaction): UpdateCourseRecord[] => {
    return BY_CATEGORY[params.category as Category]
      .items.map(category => {
        let record: UpdateCourseRecord = {
          courseType: category as UpdateCourseType,
          updateCourseId: params.uCourseId,
          id: "",
          paymentId: response,
          userEmail: response.data.customer.email,
          userId: "",
          approved: response.data.customer.email.trim() === params.user.email?.trim(),
          transaction,
          paymentEvidence: "",
          flaggedForFraud: !(response.data.customer.email.trim() === params.user.email?.trim())
        }
        return record;
      });
  }

  getCategoryFromRecord = (courseType: UpdateCourseType): Category => {
    switch (courseType) {
      case "Membership":
        return "jnr";

      case "Fellowship":
        return "snr";

      case "ToT":
        return "tot";

      default:
        return "jnr";
    }
  }

  getCategoryAmount = (courseType: UpdateCourseType) => {
    return BY_CATEGORY[this.getCategoryFromRecord(courseType)].amount;
  }

  updateCourseUpdate = (records: UpdateCourseRecord[]) => {
    const update: { [p: string]: FieldValue } = {};
    records.forEach(r => {
      if (r.courseType === "Membership") update["membershipParticipants"] = arrayUnion(r.userEmail);
      if (r.courseType === "Fellowship") update["fellowshipParticipants"] = arrayUnion(r.userEmail);
      if (r.courseType === "ToT") update["totParticipants"] = arrayUnion(r.userEmail);
    });
    return update;
  }

  approveRecord$(record: UpdateCourseRecord) {
    return this.authService.batchWriteDocs$(
      [
        {
          path: `${UPDATE_COURSES_RECORDS}/${record.id}`,
          data: record,
          type: 'set'
        },
        {
          path: `${UPDATE_COURSES}/${record.updateCourseId}`,
          data: this.updateCourseUpdate([record]),
          type: 'update'
        }
      ]
    )
  }

  approveRecords$ = (records: UpdateCourseRecord[]) => {
    return this.authService.batchWriteDocs$([
      ...records.map(record => ({
        path: `${UPDATE_COURSES_RECORDS}/${record.id}`,
        data: record,
        type: 'update' as const
      })),
      {
        path: `${UPDATE_COURSES}/${records[0].updateCourseId}`,
        data: this.updateCourseUpdate(records),
        type: 'update'
      }
    ])
  }

  declineRecord$(record: UpdateCourseRecord) {
    return this.authService.batchWriteDocs$(
      [
        {
          path: `${UPDATE_COURSES_RECORDS}/${record.id}`,
          data: record,
          type: 'set'
        }
      ]
    )
  }

  declineRecords$ = (records: UpdateCourseRecord[]) => {
    return this.authService.batchWriteDocs$(
      records.map(record => ({
        path: `${UPDATE_COURSES_RECORDS}/${record.id}`,
        data: record,
        type: 'update'
      }))
    )
  }

  configToStatus$ = (response: BasicResponse, record: UpdateCourseRecord) => {
    return this.authService.fetchPaystackConfig$().pipe(
      concatMap(config => this.authService.getFirebaseUser$().pipe(
        map(user => Object.assign({ email: user.email! }, config))
      )),
      map(params => response && response.data && response.data.status === "success" &&
        response.data.amount === this.getCategoryAmount(record.courseType)
        && response.data.customer && response.data.customer.email.trim() ===
        params.email?.trim()),
      map(shouldApprove => shouldApprove ? response : DEFAULT_BASIC_RESPONSE)
    )
  }

  verification$ = (transaction: PaystackTransaction | Transaction, records: UpdateCourseRecord[]) => {
    return this.authService.verifyTransaction({
      reference: transaction.reference,
      secret_key: environment.secret_key
    }).pipe(
      concatMap(res => this.configToStatus$(res, records[0]))
    )
  }

  verifyFromRecord$ = (transaction: PaystackTransaction | Transaction, record: UpdateCourseRecord) => {
    // console.log("transaction in verifyTransaction => ", transaction);
    // console.log("transaction reference in verifyTransaction => ", transaction.reference);
    const amountPaid = this.getCategoryAmount(record.courseType);
    return this.authService.verifyTransaction({
      reference: transaction.reference,
      secret_key: environment.secret_key
    }).pipe(
      concatMap(response => {
        // console.log("response => ", response);
        return this.authService.fetchPaystackConfig$().pipe(
          concatMap(config => this.authService.getFirebaseUser$().pipe(
            map(user => Object.assign({ email: user.email! }, config))
          )),
          concatMap(params => {
            if (response && response.data && response.data.status === "success" &&
              response.data.amount === amountPaid
              && response.data.customer && response.data.customer.email.trim() ===
              params.email.trim()) {
              const data: UpdateCourseRecord = Object.assign(
                record, {
                paymentId: response,
                approved: true
              }
              );

              return this.approveRecord$(data);
            } else {
              return this.declineRecord$(Object.assign(
                record, {
                approved: false,
                paymentId: null
              }
              ));
            }
          }),
          catchError(err => {
            console.log("Caught error => ", err);
            // this.verifyAgain$ = null;
            return of("Verification Failed");
          })
        )
      })
    )
  }

  verifyFromRecords$ = (transaction: PaystackTransaction | Transaction, records: UpdateCourseRecord[]) => {
    return this.verification$(transaction, records).pipe(
      concatMap(response => {
        if (response.data.status !== "") {
          return this.approveRecords$(
            records.map(r => Object.assign(
              r, { paymentId: response, approved: true }
            ))
          );
        } else {
          return this.declineRecords$(
            records.map(r => Object.assign(
              r, { paymentId: null, approved: false }
            ))
          )
        }
      }),
      catchError((err) => {
        console.log("error verifying records =>", err)
        return of("")
      })
    );
  }

  verifyPaymentFromRecord$ = (record: UpdateCourseRecord) => {
    let transaction: PaystackTransaction = {
      id: "",
      message: "",
      redirecturl: "",
      reference: "",
      status: "",
      trans: "",
      transaction: "",
      trxref: ""
    };

    if (record.transaction !== undefined) {
      transaction = record.transaction
    }

    return this.verifyFromRecord$(
      transaction,
      record
    );
  }

  verifyPaymentFromRecords$ = (records: UpdateCourseRecord[]) => {
    let transaction: PaystackTransaction = {
      id: "",
      message: "",
      redirecturl: "",
      reference: "",
      status: "",
      trans: "",
      transaction: "",
      trxref: ""
    };

    const record = records[0];

    if (record.transaction !== undefined) {
      transaction = record.transaction
    }

    return this.verifyFromRecords$(
      transaction,
      records
    );
  }
}
