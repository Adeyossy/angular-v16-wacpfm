import { Component, OnInit } from '@angular/core';
import { CardList } from '../widgets/card-list/card-list.component';
import { concatMap, map, Observable, of } from 'rxjs';
import { PortfolioService } from '../services/portfolio.service';
import { ActivatedRoute, Router } from '@angular/router';
import { PortfolioSectionItem } from '../models/portfolio';
import { FieldValue, serverTimestamp, Timestamp } from 'firebase/firestore';
import { USERID_ROUTE_PARAM } from '../app-routing.module';

@Component({
  selector: 'app-portfolio-section',
  templateUrl: './portfolio-section.component.html',
  styleUrls: ['./portfolio-section.component.css']
})
export class PortfolioSectionComponent implements OnInit {
  userId$ = of("");
  userIdParam$ = of("");
  section = of("");
  sectionItems$: Observable<PortfolioSectionItem[]> = of([]);
  sectionItemsList: { [index: string]: CardList } = {};
  sectionItemsList$: Observable<CardList[]> = of([]);
  sectionItemsGroupsList$: Observable<{subsection: string, items: PortfolioSectionItem[]}[]> = of([]);
  newItem$: Observable<string> | null = null;

  constructor (
    private portfolioService: PortfolioService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.section = this.activatedRoute.paramMap.pipe(
      map(paramMap => paramMap.get("section") ? paramMap.get("section")! : "")
    );

    this.userId$ = this.portfolioService.getUser$().pipe(
      map(user => user.uid)
    );
    
    this.userIdParam$ = this.portfolioService.parseParamFromRoute$(
      this.activatedRoute.paramMap, USERID_ROUTE_PARAM
    );

    this.sectionItems$ = this.section.pipe(
      concatMap(section => this.userId$.pipe(
        concatMap(userId => this.portfolioService.getPortfolioSection$(section, userId))
      ))
    );

    this.sectionItemsList$ = this.sectionItems$.pipe(
      map(items => items.map(this.toCardList))
    );

    this.sectionItemsGroupsList$ = this.section.pipe(
      concatMap(section => this.userId$.pipe(
        concatMap(userId => this.portfolioService.getPortfolioSection$(section, userId)),
        map(items => this.groupBySubsections(items, section).sort((a, b) => b.items.length - a.items.length))
      ))
    );
  }

  toCardList = (sectionItem: PortfolioSectionItem): CardList => {
    const timestamp = sectionItem.submission_timestamp as unknown as Timestamp;
    
    return {
      title: sectionItem.subsection,
      subtitle: timestamp.toDate().toLocaleString("en-NG"),
      text: sectionItem.category
    };
  }

  cachedToCardList = (sectionItem: PortfolioSectionItem): CardList => {
    const existing = this.sectionItemsList[sectionItem.id];
    if (existing) return existing;

    const timestamp = sectionItem.submission_timestamp as unknown as Timestamp;
    
    const cardList: CardList = {
      title: sectionItem.subsection,
      subtitle: timestamp.toDate().toLocaleString("en-NG"),
      text: sectionItem.category
    };
    this.sectionItemsList[sectionItem.id] = cardList;
    return cardList;
  }

  groupBySubsections = (sectionItems: PortfolioSectionItem[], sectionId: string) => {
    const subsections = this.portfolioService.getSubsections(sectionId);
    return subsections.map(subsection => ({
      subsection: subsection.subsection,
      items: sectionItems.filter(
        sectionItem => sectionItem.section === sectionId && 
        sectionItem.subsection === subsection.subsection
      )
    }));
  }

  addNewItem$ = () => {
    this.newItem$ = this.portfolioService.createPortfolioSectionItemRef$().pipe(
      map(id => {
        this.router.navigate([this.router.url, id]);
        return id;
      })
    );
  }

  navigate = (shouldNavigate: boolean, url: string) => {
    if (shouldNavigate) this.router.navigate([this.router.url, url]);
  }
}
