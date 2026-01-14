import { Component, OnInit } from '@angular/core';
import { concatMap, map, Observable, of } from 'rxjs';
import { PortfolioSectionItem } from '../models/portfolio';
import { PortfolioService } from '../services/portfolio.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-portfolio-section-item',
  templateUrl: './portfolio-section-item.component.html',
  styleUrls: ['./portfolio-section-item.component.css']
})
export class PortfolioSectionItemComponent implements OnInit {
  item$: Observable<PortfolioSectionItem> = of();

  constructor(
    private portfolioService: PortfolioService, 
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const itemId$ = this.activatedRoute.paramMap.pipe(
      map(paramMap => {
        const id = paramMap.get("itemId");
        return id ? id : "";
      })
    );

    this.item$ = itemId$.pipe(
      concatMap(this.portfolioService.getPortfolioSectionItem$)
    );
  }
}
