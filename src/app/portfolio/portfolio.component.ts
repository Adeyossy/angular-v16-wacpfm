import { Component, OnInit } from '@angular/core';
import { CardList } from '../widgets/card-list/card-list.component';
import { PortfolioService } from '../services/portfolio.service';
import { PortfolioSection, SECTIONS } from '../models/portfolio-section';
import { concatMap, map, Observable, of } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { USERID_ROUTE_PARAM } from '../app-routing.module';
import { PortfolioSectionItem } from '../models/portfolio';

@Component({
  selector: 'app-portfolio',
  templateUrl: './portfolio.component.html',
  styleUrls: ['./portfolio.component.css']
})
export class PortfolioComponent implements OnInit {
  userId$ = of("");
  portfolioItems$: Observable<PortfolioSectionItem[]> = of([]);
  portfolioScore: number | undefined = undefined;
  sections: CardList[] = [];
  portfolioScoreTotal = 0;

  constructor (
    private portfolioService: PortfolioService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.userId$ = this.portfolioService.parseParamFromRoute$(
      this.activatedRoute.paramMap,
      USERID_ROUTE_PARAM
    ).pipe(
      concatMap(userId => {
        if (userId === "") {
          return this.portfolioService.getUser$().pipe(
            map(user => {
              this.portfolioItems$ = this.portfolioService.getPortfolioSections$(user.uid);
              return user.uid;
            })
          )
        } else {
          this.portfolioItems$ = this.portfolioService.getPortfolioSections$(userId)
          return of(userId)};
        }
      )
    );

    const applicableSections = this.portfolioService.getApplicableSections('membership');
    this.sections = applicableSections.map(this.toCardList);
    this.portfolioScoreTotal = applicableSections.length * 10;
    // const allItems = ;
  }

  toCardList = (section: PortfolioSection): CardList => {
    return {
      title: section.section,
      subtitle: section.description,
      text: "-"
    }
  }

  extractSectionId = (title: string) => title.split(' ')[1]

  getSectionScore = (items: PortfolioSectionItem[], sectionId: string) => {
    return this.portfolioService.calculateSectionScore(items, sectionId, 'membership')
  }

  getPortfolioScore = (items: PortfolioSectionItem[]) => {
    if (this.portfolioScore === undefined) {
      this.portfolioScore = this.portfolioService.calculatePortfolioScore(items, 'membership')
    }
    
    return this.portfolioScore;
  }
}
