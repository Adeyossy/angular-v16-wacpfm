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
  sectionItems: Observable<PortfolioSectionItem[]> = of([]);
  sectionItemsList: Observable<CardList[]> = of([]);

  constructor (
    private portfolioService: PortfolioService,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.section = this.activatedRoute.paramMap.pipe(
      map(paramMap => paramMap.get("section") ? paramMap.get("section")! : "")
    );

    this.sectionItems = this.section.pipe(
      concatMap(this.portfolioService.getUserPortfolioSection$)
    );

    this.sectionItemsList = this.sectionItems.pipe(
      map(items => items.map(this.toCardList))
    );
  }

  toCardList = (sectionItem: PortfolioSectionItem): CardList => {
    return {
      title: sectionItem.title,
      subtitle: sectionItem.description,
      text: sectionItem.category
    }
  }
}
