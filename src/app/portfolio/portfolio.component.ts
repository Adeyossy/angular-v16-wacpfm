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
  sections: CardList[] = [
    {
      title: "Section 3",
      subtitle: "Learning Plans and Rotations",
      text: ""
    },
    {
      title: "Section 4",
      subtitle: "Record of Education Supervision",
      text: ""
    },
    {
      title: "Section 5",
      subtitle: "Observations by Supervisors",
      text: ""
    },
    {
      title: "Section 6",
      subtitle: "Written Assignments",
      text: ""
    },
    {
      title: "Section 8",
      subtitle: "Emergency Medicine Certification",
      text: ""
    },
    {
      title: "Section 9",
      subtitle: "Professional and Scientific Meetings",
      text: ""
    },
    {
      title: "Section 10",
      subtitle: "End of Year Assessments",
      text: ""
    }
  ];

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

    this.sections = SECTIONS.filter(s => s.subsections.filter(sub => sub['membership'] > 0).length > 0).map(this.toCardList);
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
