import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent {
  items = [
    {
      title: "Update Course",
      description: "",
      link: "/dashboard/updatecourse"
    },
    {
      title: "Exam",
      description: "",
      link: "/dashboard/exam"
    },
    {
      title: "Event",
      description: "",
      link: "/dashboard/event"
    }
  ]
}
