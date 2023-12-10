import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AsyncSubject, Observable, concatMap, from, map, of } from 'rxjs';
import { User, Auth, getAuth, createUserWithEmailAndPassword, UserCredential, signInWithEmailAndPassword, sendEmailVerification, AuthErrorCodes, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { initializeApp, FirebaseOptions, FirebaseApp } from 'firebase/app';
import { DocumentReference, Firestore, addDoc, collection, deleteDoc, getDoc, getFirestore, setDoc, updateDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  usersCollection = "users";
  updateCourseCollection = "update_courses";
  updateCourseRecordsCollection = "update_course_records";
  paymentsCollection = "payments";
  backendUrl = "/.netlify/functions";
  asyncSubject = new AsyncSubject<FirebaseOptions>();

  FIRESTORE_NULL_DOCUMENT = "firestore/document does not exist";

  constructor(private httpClient: HttpClient) { }

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
        if(user) {
          return sendEmailVerification(user)
        } else throw new Error(AuthErrorCodes.INVALID_EMAIL)
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

  addDoc$(collectionName: string, doc: any) {
    return this.getFirestore$().pipe(
      concatMap(db => addDoc(collection(db, collectionName), doc))
    )
  }

  /**
   * this method adds a document to firestore
   * @param docRef - the reference to the firestore document
   * @param doc - the document data to be stored
   * @returns Observable<void>
   */
  addDocWithRef$(docRef: DocumentReference, doc: any) {
    return this.getFirestore$().pipe(
      concatMap(db => setDoc(docRef, doc))
    );
  }

  getDoc$(docRef: DocumentReference, doc: any) {
    return this.getFirestore$().pipe(
      concatMap(db => getDoc(docRef)),
      map(docSnap => docSnap.exists() ? docSnap.data() : new Error(this.FIRESTORE_NULL_DOCUMENT))
    );
  }

  updateDoc$(docRef: DocumentReference, delta: any) {
    return this.getFirestore$().pipe(
      concatMap(db => updateDoc(docRef, delta))
    );
  }

  deleteDoc$(docRef: DocumentReference) {
    return this.getFirestore$().pipe(
      concatMap(db => deleteDoc(docRef))
    );
  }
}
