import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { EXAMINERS } from '../models/exam';
import { Examiner, NEW_EXAMINER } from "../models/examiner";
import { map, Observable, of } from 'rxjs';
import { QueryFieldFilterConstraint, where } from 'firebase/firestore';
import { Candidate, CANDIDATES, FellowshipExamRecord, MembershipExamRecord } from '../models/candidate';
import { HelperService } from './helper.service';

type Cache = {
  [collection: string]: unknown[];
}

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  // exam registration
  // exam information
  // exam progress
  examinerCache: Examiner | null = null;

  /**
   * Stores information on the current exam: the exam itself, examiner and/or candidate.
   * 
   * TODO: Link this cache to a particular exam using its alias so several exams can be cached
   * and not just the current one.
   */
  cache: Cache = {
    examiners: [],
    candidates: [],
    exams: []
  }

  accreditation = [
    "44 NAR, Hosp., Kaduna", "ABUTH, Zaria", "AKTH, Kano", "Askoro District Hospital, FCT",
    "ATBUTH, Bauchi", "BMC, Saki", "BUTH(ECWA Hospital), Jos", "BUTH (Baptist MC) Ogbomoso",
    "BMSH, Port Harcourt", "BSUTH, Makurdi", "OLA Catholic Hosp, Oluyuro,Ibadan",
    "Central Hospital, Benin City", "DASH, Lafia,  Jos", "ECWA Hospital, Egbe,Kogi State",
    "EKO Hospital, Ikeja, Lagos", "Eku Baptist Hospital, Eku", "EKSUTH, Ado-Ekiti",
    "Faith Mediplex Hosp, Edo State", "FMC, Keffi, Nassarawa State", "Fed Teach Hosp, Abakaliki",
    "FMC, Makurdi", "FMC, Abeokuta", "FMC, Asaba", "FMC, Bida, Niger State", "FMC, Ebute-Metta",
    "FMC, Lokoja", "FMC, Owerri", "Fed Teaching Hosp, Ido-Ekiti", "FMC, Owo", "FMC,( QEH),Umuahia",
    "Garki  Hospital, Abuja", "General Hospital, Marina, Lagos", "IMSUTH, Imo State",
    "ISTH, Irrua, Edo State", "Jericho Specialist Hosp, Oyo", "JUTH, Jos", "KSSH, Lokoja",
    "LASUTH, Ikeja, Lagos", "LAUTECH TH, Osogbo", "LAUTECH TH, Ogbomoso", "LUTH, Lagos",
    "Maitama District Hopsital, Abuja", "MMS Hosp., Kano", "NAUTH, Nnewi", "NHA, Abuja, FCT",
    "OAUTHC, Ile-Ife", "OOUTH, Sagamu", "OLA Catholic Hospital, Jos", "PSSH, Jos",
    "Sacred Heart  Hospital, Lantoro", "SDA, Hosp, Ile-Ife", "St. Gerard's Cath Hosp, Kaduna",
    "St. Mary's Catholic Hosp. Eleta, Ibadan", "St. Nicholas Hospital, Lagos",
    "State Specialist Hosp, Sekonu", "UATH, FCT, Abuja", "UBTH, Benin City",
    "UCH, Ibadan", "UCTH, Calabar", "UDUTH, Sokoto", "UITH, Ilorin",
    "UNILAG Medical Centre, Lagos", "UNTH (Ituku-Ozalla) Enugu", "UPTH, Port Harcourt",
    "UUTH, Uyo", "Blue Cross Hospital, Sierra Leone", "Liberia"
  ].sort();

  examVenues = ["Ibadan", "Abuja", "Accra"];

  constructor(private authService: AuthService, private helper: HelperService) { }

  getExamItem$<Type extends Examiner | MembershipExamRecord | FellowshipExamRecord>(
    collectionName: string, cacheKey: "examiner" | "membership_candidate" | "fellowship_candidate"
  ) {
    let cachedItem = this.cache[cacheKey];
    if (cachedItem !== null) return of(cachedItem);
    return this.authService.getDocByUserId$<Type>(collectionName).pipe(
      map(examItem => {
        switch (cacheKey) {
          case "examiner":
            cachedItem = [examItem] as Type[];
            return cachedItem;

          case "membership_candidate":
            cachedItem = [examItem] as Type[];
            return cachedItem;

          case "fellowship_candidate":
            cachedItem = [examItem] as Type[];
            return cachedItem;

          default:
            return null;
        }
      })
    );
  }

  /**
   * Fetch exam-related item from collection either from the cloud or from cache
   * @param collection name of the Firebase collection
   * @returns Observable of the Type based on the collection
   */
  getItem$<Type>(collection: string) {
    if (this.cache[collection] && this.cache[collection].length)
      return of(this.cache[collection]) as Observable<Type[]>;
    return this.authService.getDocByUserId$<Type>(collection).pipe(
      map(data => {
        this.cache[collection] = [data];
        return this.cache[collection];
      })
    )
  }

  queryToDocuments<Type>(data: Type[], collection: string) {
    // console.log(collection, " collection: convert query to document => ", data);
    if (data.length) {
      this.cache[collection] = data;
    }
    return data;
  }

  queryItem$<Type>(collection: string, [where1]: QueryFieldFilterConstraint[]): Observable<Type[]>
  queryItem$<Type>(collection: string, [where1, where2]: QueryFieldFilterConstraint[]):
    Observable<Type[]> {
    if (this.cache[collection] && this.cache[collection].length) {
      // console.log("Calling cache => collection: ", collection);
      return of(this.cache[collection]) as Observable<Type[]>;
    } else {
      if (where2 === undefined) {
        return this.authService.queryCollections$<Type>(collection, where1).pipe(
          map(data => this.queryToDocuments(data, collection))
        )
      } else return this.authService.queriesCollections$<Type>(collection, [where1, where2]).pipe(
        map(data => this.queryToDocuments(data, collection))
      )
    }
  }

  queryCandidate$<Type>(examAlias: string, candidateId: string, instance: Type) {
    return this.queryItem$<Type>(CANDIDATES, [
      where("examAlias", "==", examAlias),
      where("candidateId", "==", candidateId)
    ]).pipe(
      map(records => {
        if (records.length === 0) return Object.assign({}, instance);
        return records[0];
      })
    )
  }

  queryExaminer$<Type>(examAlias: string, candidateId: string) {
    return this.queryItem$<Type>(CANDIDATES, [
      where("examAlias", "==", examAlias),
      where("userId", "==", candidateId)
    ]).pipe(
      map(records => {
        if (records.length === 0) return JSON.parse(JSON.stringify(NEW_EXAMINER)) as Type;
        return records[0];
      })
    )
  }

  getExaminer$<Type>() {
    if (this.cache[EXAMINERS]) return of(this.cache[EXAMINERS]) as Observable<Type>;
    return this.authService.getDocByUserId$<Type>(EXAMINERS);
  }

  parseCandidateExamId(candidate: Candidate) {
    return candidate.candidateId.concat("_", candidate.examAlias);
  }

  parseExaminerExamId(examiner: Examiner) {
    return examiner.userId.concat("_", examiner.examAlias);
  }

  showDoneMessage() {
    this.helper.setDialog({
      title: "Registration Complete",
      message: "Your registration is complete. Click the button below to continue.",
      buttonText: "Continue",
      navUrl: "/dashboard/exam"
    });
    this.helper.toggleDialog(0);
  }

  alert() {
    this.helper.setDialog({
      title: "Missing Upload",
      message: "It seems you have not uploaded a required file. Maybe you picked a file but forgot to upload it?",
      buttonText: "Upload"
    });
    this.helper.toggleDialog(0);
  }
}
