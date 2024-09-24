import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { EXAMINERS, Examiner, FellowshipExamRecord, MembershipExamRecord } from '../models/exam';
import { map, Observable, of } from 'rxjs';

type Cache = {
  [collection: string]: unknown;
}

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  // exam registration
  // exam information
  // exam progress
  examinerCache: Examiner | null = null;
  cache: Cache = {
    examiner: null,
    membership_candidate: null,
    fellowship_candidate: null
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
            cachedItem = examItem as Type;
            return cachedItem;

          case "membership_candidate":
            cachedItem = examItem as Type;
            return cachedItem;

          case "fellowship_candidate":
            cachedItem = examItem as Type;
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
    if (this.cache[collection]) return of(this.cache[collection]) as Observable<Type>;
    return this.authService.getDocByUserId$<Type>(collection).pipe(
      map(data => {
        this.cache[collection] = data;
        return data;
      })
    )
  }

  getExaminer$<Type>() {
    if (this.cache[EXAMINERS]) return of(this.cache[EXAMINERS]) as Observable<Type>;
    return this.authService.getDocByUserId$<Type>(EXAMINERS);
  }
}
