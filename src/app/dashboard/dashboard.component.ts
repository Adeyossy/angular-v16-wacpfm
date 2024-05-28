import { Component, OnDestroy, OnInit } from '@angular/core';
import { HelperService } from '../services/helper.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  showOnMobile = false;

  constructor(public helper: HelperService) {}

  ngOnInit(): void {
    this.helper.toggleDashboard(true);
  }

  ngOnDestroy(): void {
    this.helper.toggleDashboard(false);
  }
}
