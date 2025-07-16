import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AsyncSubject, Observable, concatMap, from, iif, map, of, zip } from 'rxjs';
import { User, Auth, getAuth, createUserWithEmailAndPassword, UserCredential, signInWithEmailAndPassword, sendEmailVerification, AuthErrorCodes, sendPasswordResetEmail, signOut, updateProfile, IdTokenResult } from 'firebase/auth';
import { initializeApp, FirebaseOptions, FirebaseApp } from 'firebase/app';
import { DocumentReference, Firestore, Query, QueryFieldFilterConstraint, QuerySnapshot, WhereFilterOp, addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, onSnapshot, query, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore';
import { UploadTask, deleteObject, getDownloadURL, getStorage, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage';
import { AppUser, DEFAULT_NEW_APPUSER, IndexType, USERS } from '../models/user';
import { UPDATE_COURSES, UpdateCourse } from '../models/update_course';
import { UPDATE_COURSES_RECORDS, UpdateCourseRecord } from '../models/update_course_record';
import { BasePaystackConfig, BasicResponse, CustomerResponse, EventPayment, ParsedCustomerResponse, PaystackConfig, PaystackInitResponse } from '../models/payment';

export interface RefinedData {
  user_email: string,
  record_email: string,
  first_name: string,
  middle_name: string,
  last_name: string,
  course_id: string,
  category: string,
  gender: string,
  country: string,
  designation: string,
  place_of_practice: string,
  college: string,
  has_paid: boolean | undefined
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  backendUrl = "/.netlify/functions";
  asyncSubject = new AsyncSubject<FirebaseOptions>();
  appUser: AppUser | null = null;

  FIRESTORE_NULL_DOCUMENT = "firestore/document does not exist";

  constructor(private httpClient: HttpClient) {
    this.httpClient.get(`${this.backendUrl}/index`).subscribe(this.asyncSubject);
  }

  /**
   * Fetches the firebase config object from the Netlify environment variables
   * @returns An observable of the Firebase app config object
   */
  getFirebaseConfig$(): AsyncSubject<FirebaseOptions> {
    if (this.asyncSubject.closed)
      this.httpClient.get(`${this.backendUrl}/index`).subscribe(this.asyncSubject);
    return this.asyncSubject;
  }

  /**
   * Fetches the emails of medical elders who should be given access to the faculty app
   * @returns An observable emails
   */
  fetchElders$(): Observable<IndexType> {
    return this.httpClient.get<IndexType>(`${this.backendUrl}/elders`);
  }

  fetchBasePaystackConfig$() {
    return this.httpClient.get<BasePaystackConfig>(`${this.backendUrl}/paystack-config`);
  }

  fetchPaystackConfig$() {
    return this.httpClient.get<PaystackConfig>(`${this.backendUrl}/payment-config`);
  }

  fetchEventPayment$() {
    return this.httpClient.get<EventPayment>(`${this.backendUrl}/event-payment`);
  }

  initialiseTransaction(data: unknown): Observable<PaystackInitResponse> {
    return this.httpClient.post<PaystackInitResponse>(`${this.backendUrl}/pay`, data);
  }

  verifyTransaction(data: {reference: string, secret_key: string}) {
    return this.httpClient.post<BasicResponse>(
      `${this.backendUrl}/verify`, data
    )
  }

  getPaystackCustomer(data: {email: string, secret_key: string}) {
    return this.httpClient.post<CustomerResponse>(
      `${this.backendUrl}/get-customer`, data
    )
  }

  getFirebaseApp$(): Observable<FirebaseApp> {
    return this.getFirebaseConfig$().pipe(map(config => initializeApp(config)));
  }

  getFirebaseAuth$(): Observable<Auth> {
    return this.getFirebaseApp$().pipe(map(app => getAuth(app)));
  }

  getFirebaseUser$(): Observable<User> {
    return this.getFirebaseAuth$().pipe(
      concatMap(auth => new Observable<User>((observer) => {
        return auth.onAuthStateChanged(
          user => {
            if (user !== null) observer.next(user);
            else {
              const nullUser: User = {
                emailVerified: false,
                isAnonymous: false,
                displayName: '',
                email: '',
                phoneNumber: '',
                photoURL: '',
                providerId: '',
                uid: '',
                metadata: {},
                providerData: [],
                refreshToken: '',
                tenantId: null,
                delete: function (): Promise<void> {
                  throw new Error('Function not implemented.');
                },
                getIdToken: function (forceRefresh?: boolean): Promise<string> {
                  throw new Error('Function not implemented.');
                },
                getIdTokenResult: function (forceRefresh?: boolean): Promise<IdTokenResult> {
                  throw new Error('Function not implemented.');
                },
                reload: function (): Promise<void> {
                  throw new Error('Function not implemented.');
                },
                toJSON: function (): object {
                  throw new Error('Function not implemented.');
                }
              }
              observer.next(nullUser)
            };
          },
          error => { observer.error(error) },
          () => { observer.complete() }
        )
      }))
    );
  }

  getFirestore$(): Observable<Firestore> {
    return this.getFirebaseApp$().pipe(
      map(app => getFirestore(app))
    );
  }

  signUp$(email: string, password: string): Observable<UserCredential> {
    return this.getFirebaseAuth$().pipe(
      concatMap(auth => createUserWithEmailAndPassword(auth, email, password))
    );
  }

  login$(email: string, password: string): Observable<UserCredential> {
    return this.getFirebaseAuth$().pipe(
      concatMap(auth => signInWithEmailAndPassword(auth, email, password))
    );
  }

  isEmailVerified$() {
    return this.getFirebaseUser$().pipe(
      map(user => user.emailVerified)
    );
  }

  verifyEmail$() {
    // sendEmailVerification is missing actionCodeSettings
    // users should be able to enter a code to be verified
    return this.getFirebaseUser$().pipe(
      concatMap(user => {
        if (user.uid) {
          console.log("url => ", window.location.origin);
          return sendEmailVerification(user, {
            url: `${window.location.origin}/profile/registration`
          });
        } else throw new Error(AuthErrorCodes.NULL_USER);
      })
    )
  }

  resetPassword$(email: string) {
    return this.getFirebaseAuth$().pipe(
      concatMap(auth => sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/access/login`
      }))
    )
  }

  signOut$() {
    return this.getFirebaseAuth$().pipe(
      concatMap(auth => signOut(auth))
    );
  }

  updateUserName(userName: string) {
    return this.getFirebaseUser$().pipe(
      concatMap(user => updateProfile(user, { displayName: userName }))
    )
  }

  getDocId$(collectionName: string) {
    return this.getFirestore$().pipe(
      map(db => doc(collection(db, collectionName)))
    )
  }

  getDocById$<Type>(collectionName: string, docId: string) {
    return this.getFirestore$().pipe(
      concatMap(db => getDoc(doc(db, collectionName, docId))),
      map(doc => doc.exists() ? doc.data() as Type : null)
    )
  }
  
  addDoc$(collectionName: string, data: any) {
    return this.getFirestore$().pipe(
      concatMap(db => addDoc(collection(db, collectionName), data))
    );
  }

  /**
   * this method adds a document with a pre-existing ID to a named firestore collection
   * @param collectionName - name of the collection
   * @param docId - string: id of the Document you want to upload
   * @param data - an object representing the data to be stored
   * @returns Observable<void>
   */
  addDocWithID$<Type extends { [x: string]: any }>(collectionName: string, docId: string,
    data: Type, merge = false) {
    return merge ? this.getFirestore$().pipe(
      concatMap(db => setDoc(doc(db, collectionName, docId), data, { merge: true }))
    ) :
      this.getFirestore$().pipe(
        concatMap(db => setDoc(doc(db, collectionName, docId), data))
      );
  }

  /**
   * this method adds a document with a pre-existing ID to a named firestore collection
   * @param docRef - DocumentReference: id of the Document you want to upload
   * @param data - an object representing the data to be stored
   * @returns Observable<void>
   */
  addDocWithRef$(docRef: DocumentReference, data: AppUser | UpdateCourse) {
    return this.getFirestore$().pipe(
      concatMap(db => setDoc(docRef, data))
    );
  }

  addDocsInBulk$<Type>(docs: Type[], collectionName: string) {
    return this.getFirestore$().pipe(
      concatMap(db => {
        const batch = writeBatch(db);
        docs.forEach(d => {
          let docRef = doc(collection(db, collectionName));
          batch.set(docRef, d as any);
        });
        return batch.commit();
      }),
      map(_void => "done")
    )
  }

  /**
   * Writes batch of documents to firebase cloud firestore with support for set, update and delete
   * operations.
   * @param refAndData Array of objects describing the document reference and data for cloud write
   * @returns Observable<string>
   */
  batchWriteDocs$(refAndData: {path: string, data: object, 
    type: "set" | "update" | "delete"}[]) {
    return this.getFirestore$().pipe(
      concatMap(db => {
        const batch = writeBatch(db);
        refAndData.forEach(rd => {
          let ref = doc(db, rd.path);
          if (rd.type === "set") {
            batch.set(ref, rd.data, {merge: true});
          } else {
            if (rd.type === "update") batch.update(ref, rd.data);
            else batch.delete(ref)
          }
        });
        return batch.commit();
      }),
      map(_void => "done")
    )
  }

  getDoc$<Type>(collectionName: string, docId: string) {
    return this.getFirestore$().pipe(
      concatMap(db => getDoc(doc(db, collectionName, docId))),
      map(doc => {
        if (doc.exists()) return doc.data() as Type;
        else throw new Error(this.FIRESTORE_NULL_DOCUMENT);
      })
    )
  }

  getDocUpdateId$(collectionName: string, docId: string) {
    return this.getFirestore$().pipe(
      concatMap(db => getDoc(doc(db, collectionName, docId)))
    )
  }

  getDocByUserId$<Type>(collectionName: string) {
    return this.getFirebaseUser$().pipe(
      concatMap(user => {
        if (user.uid) return this.getFirestore$().pipe(
          concatMap(db => getDoc(doc(db, collectionName, user.uid))),
          map(doc => {
            if (doc.exists()) {
              const data = doc.data() as Type;
              if (collectionName === USERS) this.appUser = data as AppUser;
              return data;
            } 
            
            return null;
          }
          )
        );
        else return of(null);
      })
    )
  }

  getAppUser$() {
    if (this.appUser !== null) return of(this.appUser);
    return this.getDocByUserId$<AppUser>(USERS).pipe(
      map(appUser => appUser !== null ? appUser : Object.assign({}, DEFAULT_NEW_APPUSER))
    );
  }

  updateDoc$(collectionName: string, docId: string, delta: any) {
    return this.getFirestore$().pipe(
      concatMap(db => updateDoc(doc(db, collectionName, docId), delta))
    );
  }

  deleteDoc$(collectionName: string, docId: string) {
    return this.getFirestore$().pipe(
      concatMap(db => deleteDoc(doc(db, collectionName, docId)))
    );
  }

  attachListener$(query: Query) {
    return new Observable<QuerySnapshot>((observer) => {
      return onSnapshot(query, {
        next(snapshot) {
          return observer.next(snapshot)
        },
        error(error) {
          return observer.error(error)
        },
      })
    })
  }

  queryCollectionsUnTyped$(collectionName: string, property: string,
    comparator: WhereFilterOp, value: string | boolean | number) {
    return this.getFirestore$().pipe(
      concatMap(db => getDocs(query(collection(db, collectionName),
        where(property, comparator, value))))
    );
  }

  queriesCollectionsUnTyped$(collectionName: string, [where1, where2]: QueryFieldFilterConstraint[]) {
    return this.getFirestore$().pipe(
      concatMap(db => getDocs(query(collection(db, collectionName), where1, where2)))
    );
  }

  queryCollections$<Type>(collectionName: string, where: QueryFieldFilterConstraint) {
    return this.getFirestore$().pipe(
      concatMap(db => getDocs(query(collection(db, collectionName), where))),
      map(docs => docs.docs.map(doc => doc.data() as Type))
    );
  }

  queriesCollections$<Type>(collectionName: string, [where1, where2]: QueryFieldFilterConstraint[]) {
    return this.getFirestore$().pipe(
      concatMap(db => getDocs(query(collection(db, collectionName), where1, where2))),
      map(snapshot => snapshot.docs.map(doc => doc.data() as Type))
    );
  }

  queryForListener$(collectionName: string, property: string,
    comparator: WhereFilterOp, value: string | boolean | number) {
    return this.getFirestore$().pipe(
      map(db => query(collection(db, collectionName),
        where(property, comparator, value))),
      concatMap(q => new Observable<QuerySnapshot>((observer) => {
        return onSnapshot(q, {
          next(snapshot) {
            return observer.next(snapshot)
          },
          error(error) {
            return observer.error(error)
          },
        })
      }))
    );
  }

  queriesForListener$(collectionName: string, [where1, where2]: QueryFieldFilterConstraint[]) {
    return this.getFirestore$().pipe(
      map(db => query(collection(db, collectionName),
        where1, where2)),
      concatMap(q => new Observable<QuerySnapshot>((observer) => {
        return onSnapshot(q, {
          next(snapshot) {
            return observer.next(snapshot)
          },
          error(error) {
            return observer.error(error)
          },
        })
      }))
    );
  }

  querySubCollection$(property: string, comparator: WhereFilterOp, value: string,
    path: string[]) {
    return this.getFirestore$().pipe(
      concatMap(db => getDocs(query(collection(db, path[0], path[1], path[2]),
        where(property, comparator, value))))
    );
  }

  queryByUserId$<Type>(collectionName: string) {
    return this.getFirebaseUser$().pipe(
      concatMap(user => this.queryCollections$<Type>(collectionName, where("userId", "==", user.uid)))
    );
  }

  queryByUserEmail$<Type>(collectionName: string) {
    return this.getFirebaseUser$().pipe(
      concatMap(user => this.queryCollections$<Type>(collectionName, where("userEmail", "==", user.email!)))
    );
  }

  uploadListener$(uploadTask: UploadTask) {
    return new Observable<string>((observer) => {
      return uploadTask.on('state_changed',
        (snapshot) => {
          observer.next((snapshot.bytesTransferred / snapshot.totalBytes).toFixed(2))
        },
        (error) => observer.error(error),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          observer.next(url);
          observer.complete();
        }
      )
    })
  }

  uploadFile$(folderName: string, file: File, userId: string) {
    return this.getFirebaseApp$().pipe(
      map(app => getStorage(app)),
      map(str => ref(str, `${folderName}/${userId}/${Date.now()}-${file.name}`)),
      concatMap(strRef => uploadBytes(strRef, file)),
      concatMap(result => getDownloadURL(result.ref))
    )
  }

  uploadFileResumably$<Type>(file: File, path: string) {
    // Use this for the lecturer's contents
    return this.getFirebaseApp$().pipe(
      map(app => getStorage(app)),
      map(str => ref(str, path)),
      map(strRef => uploadBytesResumable(strRef, file)),
      concatMap(this.uploadListener$)
    )
  }

  deleteFile$(url: string) {
    return this.getFirebaseApp$().pipe(
      map(app => getStorage(app)),
      concatMap(str => deleteObject(ref(str, url)))
    )
  }

  getCollection$<Type>(collectionName: string): Observable<Type[]> {
    return this.getFirestore$().pipe(
      concatMap(db => getDocs(collection(db, collectionName))),
      map(collection => collection.docs.map(doc => doc.data()) as Type[])
    )
  }

  getSubCollection$<Type>(path: [string, string]): Observable<Type[]> {
    return this.getFirestore$().pipe(
      concatMap(db => getDocs(collection(db, ...path))),
      map(collection => collection.docs.map(doc => doc.data()) as Type[])
    )
  }

  getCollectionListener$(collectionName: string) {
    return this.getFirestore$().pipe(
      map(db => collection(db, collectionName)),
      concatMap(q => this.attachListener$(q))
    )
  }

  getDetails$(courseId: string) {
    return this.queryCollections$<UpdateCourseRecord>(UPDATE_COURSES_RECORDS, where("updateCourseId",
      "==", courseId)).pipe(
        concatMap(records => zip(records.filter(record => record.userEmail !== "adeyossy1@gmail.com").
          filter(record => record.userEmail !== "adeyosolamustapha@outlook.com").filter(record => 
            record.userEmail !== "amustapha133@stu.ui.edu.ng")
          .map(record => this.queryCollections$<AppUser>(
          USERS, where("email", "==", record.userEmail)).pipe(
          map(([appUser]) => {
            return {
              user_email: appUser.email,
              record_email: record.userEmail,
              first_name: appUser.firstname,
              middle_name: appUser.middlename,
              last_name: appUser.lastname,
              course_id: record.updateCourseId,
              category: record.courseType,
              gender: appUser.gender,
              country: appUser.country,
              designation: appUser.designation,
              place_of_practice: appUser.practicePlace,
              college: appUser.college,
              has_paid: record.approved
            }
          })
        ))))
      )
  }
}
