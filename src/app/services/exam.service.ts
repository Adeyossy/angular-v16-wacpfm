import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { EXAMINERS } from '../models/exam';
import { Examiner } from "../models/examiner";
import { map, Observable, of } from 'rxjs';
import { QueryFieldFilterConstraint } from 'firebase/firestore';
import { FellowshipExamRecord, MembershipExamRecord } from '../models/candidate';

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

  constructor(private authService: AuthService) {}

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

  queryItem$<Type>(collection: string, [where1, where2]: QueryFieldFilterConstraint[]) {
    if (this.cache[collection] && this.cache[collection].length) 
      return of(this.cache[collection]) as Observable<Type[]>;
    return this.authService.queriesCollections$<Type>(collection, [where1, where2]).pipe(
      map(data => {
        if (data.length) {
          this.cache[collection] = data;
        }
        return data;
      })
    )
  }

  getExaminer$<Type>() {
    if (this.cache[EXAMINERS]) return of(this.cache[EXAMINERS]) as Observable<Type>;
    return this.authService.getDocByUserId$<Type>(EXAMINERS);
  }
}
