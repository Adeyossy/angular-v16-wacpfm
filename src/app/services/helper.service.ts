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

  getDateString(millis: number) {
    const date = new Date(millis);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDay();
    // return `${year}-${month}-${day}`;
    return date.toISOString().substring(0, 10);
  }

  getTodaysDate() {
    return this.getDateString(Date.now());
  }
}
