import { Injectable } from '@angular/core';
import { QueryFieldFilterConstraint } from 'firebase/firestore';
import { Observable, of, map } from 'rxjs';
import { AuthService } from './auth.service';
import { HelperService } from './helper.service';

type Cache = {
  [collection: string]: unknown[];
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {

  /**
   * Stores information on a collection.
   * The idea is to cache the result of values that do not change frequently
   */
  cache: Cache = {}

  constructor(protected authService: AuthService, protected helper: HelperService) {}

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
}
