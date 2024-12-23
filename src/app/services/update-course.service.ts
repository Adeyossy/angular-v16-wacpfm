import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { QueryFieldFilterConstraint } from 'firebase/firestore';
import { Observable, of, map } from 'rxjs';
import { CacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class UpdateCourseService extends CacheService {
  
}
