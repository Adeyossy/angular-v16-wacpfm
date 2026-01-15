import { Component, OnInit } from '@angular/core';
import { concatMap, map, Observable, of } from 'rxjs';
import { DEFAULT_PORTFOLIO_SECTION_ITEM, PORTFOLIO_COLLECTION, PortfolioSectionItem } from '../models/portfolio';
import { PortfolioService } from '../services/portfolio.service';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-portfolio-section-item',
  templateUrl: './portfolio-section-item.component.html',
  styleUrls: ['./portfolio-section-item.component.css']
})
export class PortfolioSectionItemComponent implements OnInit {
  item$: Observable<PortfolioSectionItem> = of();
  itemId$: Observable<string> = of("");
  itemSavingStatus$: Observable<string> | null = null;

  constructor(
    private portfolioService: PortfolioService, 
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.itemId$ = this.activatedRoute.paramMap.pipe(
      map(paramMap => {
        const id = paramMap.get("itemId");
        return id ? id : "";
      })
    );

    this.item$ = this.itemId$.pipe(
      concatMap(this.portfolioService.getPortfolioSectionItem$),
      concatMap(item => item !== null ? 
        of(item) : 
        this.initialiseItem$()
      )
    );
  }

  updateItemId = (item: PortfolioSectionItem, id: string) => {
    item.id = id;
    return item;
  }

  updateItemUserDetails = (item: PortfolioSectionItem, user: User) => {
    item.userId = user.uid;
    item.email = user.email!;
    return item;
  }

  updateItemSection = (item: PortfolioSectionItem, section: string) => {
    item.section = section;
    return item;
  }

  initialiseItem$ = () => {
    const item = Object.assign({}, DEFAULT_PORTFOLIO_SECTION_ITEM);

    return this.itemId$.pipe(
      map(itemId => this.updateItemId(item, itemId)),
      concatMap(item => this.portfolioService.getUser$().pipe(
        map(user => this.updateItemUserDetails(item, user))
      )),
      concatMap(item => this.activatedRoute.paramMap.pipe(
        map(paramMap => paramMap.get("section") ? paramMap.get("section")! : ""),
        map(section => this.updateItemSection(item, section))
      ))
    );
  }

  getPath = (item: PortfolioSectionItem) => {
    return `${PORTFOLIO_COLLECTION}/${item.userId}/${item.id}`;
  }
  
  toSelectionState(items: string[], value: string) {
    return items.map(item => item.toLowerCase().trim() === value.toLowerCase().trim())
  }

  saveItem$ = (item: PortfolioSectionItem) => {
    this.itemSavingStatus$ = this.portfolioService.savePortfolioSectionItem$(item).pipe(
      map(_v => {
        const url = this.router.url.split("/");
        url.pop();
        
        this.router.navigateByUrl(url.join("/"));
        return "..";
      })
    );
  }
}
