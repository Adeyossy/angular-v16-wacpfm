import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AsyncSubject, Observable, concatMap, from, map, of } from 'rxjs';
import { User, Auth, getAuth, createUserWithEmailAndPassword, UserCredential, signInWithEmailAndPassword, sendEmailVerification, AuthErrorCodes, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { initializeApp, FirebaseOptions, FirebaseApp } from 'firebase/app';
import { DocumentReference, Firestore, WhereFilterOp, addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { AppUser, USERS } from '../models/user';
import { UpdateCourse } from '../models/update_course';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  backendUrl = "/.netlify/functions";
  asyncSubject = new AsyncSubject<FirebaseOptions>();

  FIRESTORE_NULL_DOCUMENT = "firestore/document does not exist";

  constructor(private httpClient: HttpClient) {
    this.httpClient.get(`${this.backendUrl}/index`).subscribe(this.asyncSubject);
  }

  getFirebaseConfig$(): AsyncSubject<FirebaseOptions> {
    if (this.asyncSubject.closed)
      this.httpClient.get(`${this.backendUrl}/index`).subscribe(this.asyncSubject);
    return this.asyncSubject;
  }

  getFirebaseApp$(): Observable<FirebaseApp> {
    return this.getFirebaseConfig$().pipe(map(config => initializeApp(config)));
  }

  getFirebaseAuth$(): Observable<Auth> {
    return this.getFirebaseApp$().pipe(map(app => getAuth(app)));
  }

  getFirebaseUser$(): Observable<User | null> {
    return this.getFirebaseAuth$().pipe(
      concatMap(auth => new Observable<User | null>((observer) => {
        return auth.onAuthStateChanged(
          user => observer.next(user),
          error => observer.error(error),
          () => observer.complete()
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
      map(user => {
        if (user) return user.emailVerified;
        throw new Error(AuthErrorCodes.NULL_USER);
      })
    );
  }

  verifyEmail$() {
    // sendEmailVerification is missing actionCodeSettings
    // users should be able to enter a code to be verified
    return this.getFirebaseUser$().pipe(
      concatMap(user => {
        if (user) {
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
      concatMap(auth => sendPasswordResetEmail(auth, email))
    )
  }

  signOut$() {
    return this.getFirebaseAuth$().pipe(
      concatMap(auth => signOut(auth))
    );
  }

  getDocId$(collectionName: string) {
    return this.getFirestore$().pipe(
      map(db => doc(collection(db, collectionName)))
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
  addDocWithID$(collectionName: string, docId: string, data: AppUser, merge=false) {
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

  getDoc$(collectionName: string, docId: string) {
    return this.getFirestore$().pipe(
      concatMap(db => getDoc(doc(db, collectionName, docId)))
    );
  }

  getDocByUserId$(collectionName: string) {
    return this.getFirebaseUser$().pipe(
      concatMap(user => {
        if (user) return this.getFirestore$().pipe(
          concatMap(db => getDoc(doc(db, collectionName, user.uid)))
        );
        else throw new Error(AuthErrorCodes.NULL_USER);
      })
    )
  }

  getAppUser$() {
    return this.getDocByUserId$(USERS).pipe(
      map(doc => {
        if (doc.exists()) return doc.data() as AppUser;
        else throw new Error(this.FIRESTORE_NULL_DOCUMENT);
      })
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

  queryCollections$(collectionName: string, property: string,
    comparator: WhereFilterOp, value: string | boolean | number) {
    return this.getFirestore$().pipe(
      concatMap(db => getDocs(query(collection(db, collectionName),
        where(property, comparator, value))))
    );
  }

  queryByUserId$(collectionName: string) {
    return this.getFirebaseUser$().pipe(
      concatMap(user => {
        if (user) return this.queryCollections$(collectionName, "userId", "==", user.uid);
        else throw new Error(AuthErrorCodes.NULL_USER);
      })
    );
  }
}
