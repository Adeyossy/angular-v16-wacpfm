import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { DEFAULT_PORTFOLIO_SECTION_ITEM, PORTFOLIO_COLLECTION, PortfolioSectionItem } from '../models/portfolio';
import { where } from 'firebase/firestore';
import { concatMap, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {

  constructor(private authService: AuthService) { }

  getPortfolioSectionItem$ = (itemId: string) => {
    return this.authService.getDocById$<PortfolioSectionItem>(PORTFOLIO_COLLECTION, itemId).pipe(
      map(item => item !== null ? 
        item : 
        JSON.parse(JSON.stringify(DEFAULT_PORTFOLIO_SECTION_ITEM)) as PortfolioSectionItem
      )
    );
  }

  getPortfolioSection$ = (section: string, userId: string) => {
    return this.authService.queriesCollections$<PortfolioSectionItem>(
      PORTFOLIO_COLLECTION,
      [
        where("section", "==", section),
        where("userId", "==", userId)
      ]
    )
  };

  getUserPortfolioSection$ = (section: string) => {
    return this.authService.getFirebaseUser$().pipe(
      concatMap(user => this.getPortfolioSection$(section, user.email!))
    );
  }

  getPortfolioSections$ = (userId: string) => {
    return this.authService.queryCollections$<PortfolioSectionItem>(
      PORTFOLIO_COLLECTION,
      where("userId", "==", userId)
    );
  }

  getUserPortfolioSections$ = () => {
    return this.authService.getFirebaseUser$().pipe(
      concatMap(user => this.getPortfolioSections$(user.email!))
    );
  }
}
