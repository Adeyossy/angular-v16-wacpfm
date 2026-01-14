import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { PORTFOLIO_COLLECTION, PortfolioSectionItem } from '../models/portfolio';
import { where } from 'firebase/firestore';
import { concatMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PortfolioService {

  constructor(private authService: AuthService) { }

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
