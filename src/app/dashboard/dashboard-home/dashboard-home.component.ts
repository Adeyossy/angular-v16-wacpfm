import { Component, OnInit } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { CardGrid } from 'src/app/widgets/card-grid/card-grid.component';

@Component({
  selector: 'app-dashboard-home',
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.css']
})
export class DashboardHomeComponent implements OnInit {
  userId$ = of("");
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
      link: "/dashboard/events"
    },
    {
      title: "Portfolio",
      description: "",
      link: "/dashboard/portfolio"
    }
  ];
  items$: Observable<CardGrid[]> = of([]);

  constructor (private authService: AuthService) {}

  ngOnInit(): void {
    this.userId$ = this.authService.getFirebaseUser$().pipe(
      map(user => user.uid)
    );

    this.items$ = this.userId$.pipe(
      map(this.modifyItems)
    )
  }

  modifyItems = (userId: string) => {
    return this.items.map(i => {
      if (i.title === "Portfolio") i.link = i.link.concat(`/${userId}`);
      return i;
    });
  }
}
