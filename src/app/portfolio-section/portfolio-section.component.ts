import { Component, OnInit } from '@angular/core';
import { CardList } from '../widgets/card-list/card-list.component';
import { concatMap, map, Observable, of } from 'rxjs';
import { PortfolioService } from '../services/portfolio.service';
import { ActivatedRoute } from '@angular/router';
import { PortfolioSectionItem } from '../models/portfolio';

@Component({
  selector: 'app-portfolio-section',
  templateUrl: './portfolio-section.component.html',
  styleUrls: ['./portfolio-section.component.css']
})
export class PortfolioSectionComponent implements OnInit {
  section = of("");
  sectionItems$: Observable<PortfolioSectionItem[]> = of([]);
  sectionItemsList: { [index: string]: CardList } = {};
  sectionItemsList$: Observable<CardList[]> = of([]);

  constructor (
    private portfolioService: PortfolioService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.section = this.activatedRoute.paramMap.pipe(
      map(paramMap => paramMap.get("section") ? paramMap.get("section")! : "")
    );

    this.sectionItems$ = this.section.pipe(
      concatMap(this.portfolioService.getUserPortfolioSection$)
    );

    this.sectionItemsList$ = this.sectionItems$.pipe(
      map(items => items.map(this.toCardList))
    );
  }

  toCardList = (sectionItem: PortfolioSectionItem): CardList => {
    const existing = this.sectionItemsList[sectionItem.id];
    if (existing) return existing;
    
    const cardList: CardList = {
      title: sectionItem.title,
      subtitle: sectionItem.description,
      text: sectionItem.category
    };
    this.sectionItemsList[sectionItem.id] = cardList;
    return cardList;
  }

  trackBy = (index: number, item: PortfolioSectionItem) => {
    return item.id;
  }
}
