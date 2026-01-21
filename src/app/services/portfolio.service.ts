import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { DEFAULT_PORTFOLIO_SECTION_ITEM, PORTFOLIO_COLLECTION, PortfolioSectionItem } from '../models/portfolio';
import { doc, where } from 'firebase/firestore';
import { concatMap, map, Observable } from 'rxjs';
import { SECTIONS } from '../models/portfolio-section';
import { ParamMap } from '@angular/router';

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

  parseParamFromRoute$ = (paramMap$: Observable<ParamMap>, param: string) => {
    return paramMap$.pipe(
      map(paramMap => {
        const value = paramMap.get(param);
        return value !== null ? value : "";
      })
    );
  }

  parseSectionFromRoute$ = (paramMap$: Observable<ParamMap>) => {
    return paramMap$.pipe(
      map(paramMap => {
        const sectionId = paramMap.get("section");
        return sectionId !== null ? sectionId : ""
      })
    );
  }

  getApplicableSections = (category: 'membership'| 'fellowship') => {
    return SECTIONS.filter(s => s.subsections.filter(sub => sub[category] > 0).length > 0);
  }

  getSection = (sectionId: string, category: 'membership' | 'fellowship') => {
    const sections = this.getApplicableSections(category).filter(section => section.id === sectionId);
    if (sections.length === 0) return null;
    return sections[0]
  }

  getSubsections = (sectionId: string, category: 'membership' | 'fellowship') => {
    const section = this.getSection(sectionId, category);
    if (section === null) return []
    return section.subsections;
  }

  getSubsection = (sectionId: string, subsection: string, category: 'membership' | 'fellowship') => {
    return this.getSubsections(sectionId, category).find(sub => sub.subsection === subsection);
  }

  getNonzeroCategorySubsections = (sectionId: string, category: "membership" | "fellowship") => {
    return this.getSubsections(sectionId, category).filter(subsection => subsection[category] > 0);
  }

  getNonzeroCategorySubsection = (
    sectionId: string, 
    category: "membership" | "fellowship",
    subsection: string
  ) => {
    return this.getSubsections(sectionId, category).find(
      sub => sub.subsection === subsection && sub[category] > 0
    );
  }

  getNonzeroMembershipSubsections = (sectionId: string) => {
    return this.getSubsections(sectionId, 'membership').filter(subsection => subsection.membership > 0);
  }

  getNonzeroMembershipSubsection = (sectionId: string, subsection: string) => {
    return this.getNonzeroMembershipSubsections(sectionId)
    .find(sub => sub.subsection === subsection && sub.membership > 0);
  }

  calculateSubsectionScore = (
    subsectionItems: PortfolioSectionItem[],
    sectionId: string,
    subsection: string,
    category: "membership" | "fellowship"
  ): number => {
    // Get the candidate's portfolio items and filter to the specific subsection and category
    const portfolioSubsection = subsectionItems.filter(
      psi => psi.section === sectionId && 
      psi.subsection === subsection && 
      psi.category.toLowerCase() === category
    );

    const candidateSubsectionCount = portfolioSubsection.length;

    const expectedSubsectionCount = this.getNonzeroCategorySubsection(
      sectionId,
      category,
      subsection
    );

    if (expectedSubsectionCount !== undefined) {
      const diff = candidateSubsectionCount - expectedSubsectionCount[category];
      
      if (diff >= 0) {
        return 10;
      } else {
        if (diff < 0 && diff >= -2) {
          return 6;
        } else {
          return 0;
        }
      }
    } else return 0; // throw "nonzero category subsection could not be found";
  }

  calculateSectionScore = (
    sectionItems: PortfolioSectionItem[],
    sectionId: string,
    category: "membership" | "fellowship"
  ) => {
    const subsectionScores = this.getNonzeroCategorySubsections(sectionId, category)
    .map(subsection => {
      const subsectionText = subsection.subsection;
      const candidateSubsectionItems = sectionItems.filter(
        si => si.subsection === subsectionText
      )
      return this.calculateSubsectionScore(
        candidateSubsectionItems,
        sectionId,
        subsectionText,
        category
      );
    });

    // Calculate the total score for all subsections under this section.
    const totalScore = subsectionScores.reduce((previous, current) => previous + current, 0);
    
    // Section score is an average of subsection scores. A section has maximum of 10.
    const sectionScore = totalScore / subsectionScores.length;
    return sectionScore;
  }

  calculatePortfolioScore = (
    portfolioSectionItems: PortfolioSectionItem[],
    category: "membership" | "fellowship"
  ) => {
    const sectionScores = this.getApplicableSections(category).map(section => {
      const id = section.id;
      const candidateSectionItems = portfolioSectionItems.filter(
        psi => psi.section === id && psi.category.toLowerCase() === category
      );
      return this.calculateSectionScore(candidateSectionItems, id, category);
    });

    const sumOfAllSections = sectionScores.reduce((pre, curr) => pre + curr);
    return sumOfAllSections;
  }
}
