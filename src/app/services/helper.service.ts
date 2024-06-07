import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class HelperService {
  showSidebarOnMobile = false;
  isDashboard = false;
  isDialogShown = -1;
  dialog = {
    title: "",
    message: "",
    buttonText: ""
  }

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

  millisToHour(millis: string) {
    return new Date(parseInt(millis)).getHours().toString().concat(":00");
  }

  toggleDashboard(state: boolean) {
    this.isDashboard = state;
  }

  toggleSidebar(state: boolean) {
    this.showSidebarOnMobile = state;
  }

  toggleDialog(state: number) {
    this.isDialogShown = state;
  }

  setDialog(dialog: {title: string, message: string, buttonText: string}) {
    this.dialog = dialog;
  }
}
