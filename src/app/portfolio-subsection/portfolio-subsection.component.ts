import { Component, OnInit } from '@angular/core';
import { CardList } from '../widgets/card-list/card-list.component';
import { PortfolioService } from '../services/portfolio.service';
import { ActivatedRoute } from '@angular/router';
import { map, Observable, of } from 'rxjs';

@Component({
  selector: 'app-portfolio-subsection',
  templateUrl: './portfolio-subsection.component.html',
  styleUrls: ['./portfolio-subsection.component.css']
})
export class PortfolioSubsectionComponent implements OnInit {
  subsections$: Observable<CardList[]> = of([]);
  sectionId$: Observable<string> = of("")

  constructor (
    private portfolioService: PortfolioService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.sectionId$ = this.portfolioService.parseSectionFromRoute$(this.activatedRoute.paramMap);

    this.subsections$ = this.sectionId$.pipe(
      map(this.portfolioService.getSubsections),
      map(subsections => subsections.map(subsection => ({
        title: subsection.subsection, 
        subtitle: `${subsection.membership} items expected`, 
        text: ``
      })))
    )
  }
}
