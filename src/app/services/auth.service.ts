import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AsyncSubject, Observable, concatMap, from, iif, map, of } from 'rxjs';
import { User, Auth, getAuth, createUserWithEmailAndPassword, UserCredential, signInWithEmailAndPassword, sendEmailVerification, AuthErrorCodes, sendPasswordResetEmail, signOut, updateProfile } from 'firebase/auth';
import { initializeApp, FirebaseOptions, FirebaseApp } from 'firebase/app';
import { DocumentReference, Firestore, Query, QueryFieldFilterConstraint, QuerySnapshot, WhereFilterOp, addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, onSnapshot, query, setDoc, updateDoc, where, writeBatch } from 'firebase/firestore';
import { UploadTask, deleteObject, getDownloadURL, getStorage, ref, uploadBytes, uploadBytesResumable } from 'firebase/storage';
import { AppUser, IndexType, USERS } from '../models/user';
import { UpdateCourse } from '../models/update_course';

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
            else observer.error(new Error(AuthErrorCodes.NULL_USER));
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
      concatMap(user => {
        if (user) {
          return updateProfile(user, { displayName: userName })
        }
        throw AuthErrorCodes.NULL_USER;
      })
    )
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
        if (user) return this.getFirestore$().pipe(
          concatMap(db => getDoc(doc(db, collectionName, user.uid))),
          map(doc => {
            if (doc.exists()) {
              const data = doc.data() as Type;
              if (collectionName === USERS) this.appUser = data as AppUser;
              return data;
            } else throw AuthErrorCodes.NULL_USER
          }
          )
        );
        else throw new Error(AuthErrorCodes.NULL_USER);
      })
    )
  }

  getAppUser$() {
    if (this.appUser !== null) return of(this.appUser);
    return this.getDocByUserId$<AppUser>(USERS);
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

  queryCollections$<Type>(collectionName: string, property: string,
    comparator: WhereFilterOp, value: string | boolean | number) {
    return this.getFirestore$().pipe(
      concatMap(db => getDocs(query(collection(db, collectionName),
        where(property, comparator, value)))),
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
      concatMap(user => {
        if (user) return this.queryCollections$<Type>(collectionName, "userId", "==", user.uid);
        else throw new Error(AuthErrorCodes.NULL_USER);
      })
    );
  }

  queryByUserEmail$<Type>(collectionName: string) {
    return this.getFirebaseUser$().pipe(
      concatMap(user => {
        if (user) return this.queryCollections$<Type>(collectionName, "userEmail", "==", user.email!);
        else throw new Error(AuthErrorCodes.NULL_USER);
      })
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
      concatMap(str => deleteObject(ref(str, encodeURI(url))))
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
}
