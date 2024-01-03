import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor() { }

  dateToMillis(date: Date) {
    return date.getTime();
  }

  millisToDate(millis: number) {
    return new Date(millis);
  }
}
