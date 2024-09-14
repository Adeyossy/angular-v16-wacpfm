import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { EXAMINERS, Examiner, FellowshipExamRecord, MembershipExamRecord } from '../models/exam';
import { map, of } from 'rxjs';

type Cache = {
  examiner: Examiner | null;
  membership_candidate: MembershipExamRecord | null;
  fellowship_candidate: FellowshipExamRecord | null;
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

  getExamItem$<Type>(collectionName: string, cacheKey: "examiner" | "membership_candidate" 
    | "fellowship_candidate") {
    let cachedItem = this.cache[cacheKey];
    if (cachedItem !== null) return of(cachedItem);
    return this.authService.getDocByUserId$<Type>(collectionName).pipe(
      map(examItem => {
        switch (cacheKey) {
          case "examiner":
            cachedItem = examItem as Examiner;
            return cachedItem;

          case "membership_candidate":
            cachedItem = examItem as MembershipExamRecord;
            return cachedItem;

          case "fellowship_candidate":
            cachedItem = examItem as FellowshipExamRecord;
            return cachedItem;
          
          default:
            return null;
        }
      })
    );
  }

  getFellowshipCandidate$() {}
}
