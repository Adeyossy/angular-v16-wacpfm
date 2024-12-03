import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { where } from 'firebase/firestore';
import { concatMap, map, Observable, of } from 'rxjs';
import { AcademicWriting, CANDIDATES, Dissertation, FellowshipExamRecord, NEW_FELLOWSHIP_CANDIDATE } from 'src/app/models/candidate';
import { ExamService } from 'src/app/services/exam.service';

@Component({
  selector: 'app-edit-fellowship',
  templateUrl: './edit-fellowship.component.html',
  styleUrls: ['./edit-fellowship.component.css']
})
export class EditFellowshipComponent implements OnInit {
  fellowship$: Observable<FellowshipExamRecord> = of();

  constructor(private examService: ExamService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.fellowship$ = this.route.paramMap.pipe(
      concatMap(params => {
        const examAlias = params.get("examAlias");
        const candidateId = params.get("candidateId");
        return this.examService.queryItem$<FellowshipExamRecord>(CANDIDATES, [
          where("examAlias", "==", examAlias),
          where("candidateId", "==", candidateId)
        ]);
      }),
      map(records => {
        if (records.length === 0) return Object.assign({}, NEW_FELLOWSHIP_CANDIDATE);
        return records[0];
      })
    );
  }

  toCardList = (upload: AcademicWriting, index: number) => {
    return { title: upload.title, subtitle: upload.type, text: `${index}` }
  }
}
