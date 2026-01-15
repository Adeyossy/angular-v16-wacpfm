import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { DEFAULT_PORTFOLIO_SECTION_ITEM, PORTFOLIO_COLLECTION, PortfolioSectionItem } from '../models/portfolio';
import { doc, where } from 'firebase/firestore';
import { concatMap, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {

  constructor(private authService: AuthService) { }

  createPortfolioSectionItemRef$ = () => {
    return this.authService.getDocId$(PORTFOLIO_COLLECTION).pipe(
      map(doc => doc.id)
    );
  }

  getUser$ = () => {
    return this.authService.getFirebaseUser$();
  }

  getPortfolioSectionItem$ = (itemId: string) => {
    return this.authService.getDocById$<PortfolioSectionItem>(PORTFOLIO_COLLECTION, itemId);
  }

  savePortfolioSectionItem$ = (item: PortfolioSectionItem) => {
    return this.authService.addDocWithID$(PORTFOLIO_COLLECTION, item.id, item, true);
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
      concatMap(user => this.getPortfolioSection$(section.toString(), user.uid))
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
