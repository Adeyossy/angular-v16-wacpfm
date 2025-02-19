import { Injectable } from '@angular/core';
import { QueryFieldFilterConstraint, WhereFilterOp, where } from 'firebase/firestore';
import { Observable, of, map } from 'rxjs';
import { AuthService } from './auth.service';
import { HelperService } from './helper.service';
import { EXAMS } from '../models/exam';

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

  /**
   * Caches results of firestore queries for local use
   * @param data array of Type to be cached from query
   * @param collection firestore collection containing the data, used as the key in cache
   * @returns data passed to the method
   */
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

  /**
   * Queries the cache first for the requested document. If not found in cache,
   * firestore collection is queried and the query result returned without caching it, 
   * for compatibility purposes.
   * @param collection firestore collection to query; Also used as key for cache
   * @param key property of the expected document to query by
   * @param compare comparator of the type WhereFilterOp specifying equality or inequality operator
   * @param value value of the key argument to query for
   * @returns Observable<Type[]>
   */
  queryCacheFirst$<Type extends {[key: string]: string | number}>(collection: string, 
    key: string, compare: WhereFilterOp, value: string | number) {
    const cache = this.cache[collection] as Type[];
    let item: Type | undefined = cache?.find(c => c[key] == value);
    if (item !== undefined) return of([item]);
    else return this.authService.queryCollections$<Type>(collection, where(key, compare, value));
  }

  /**
   * Reset the cache when there's a write to the collection parameter
   * @param collection firestore collection name which acts as the key for the cache
   */
  resetCache(collection: string) {
    this.cache[collection] = [];
  }
}
