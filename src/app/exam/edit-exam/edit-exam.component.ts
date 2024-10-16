import { Component, Input } from '@angular/core';
import { catchError, concatMap, map, Observable, of } from 'rxjs';
import { Exam, EXAMS } from 'src/app/models/exam';
import { AuthService } from 'src/app/services/auth.service';
import { HelperService } from 'src/app/services/helper.service';

@Component({
  selector: 'app-edit-exam',
  templateUrl: './edit-exam.component.html',
  styleUrls: ['./edit-exam.component.css']
})
export class EditExamComponent {
  @Input() exam$: Observable<Exam> = new Observable();
  updateTracker$: Observable<boolean> | null = null;

  constructor(private authService: AuthService, public helper: HelperService) {}

  update$() {
    this.updateTracker$ = this.exam$.pipe(
      concatMap(exam => this.authService.addDocWithID$(EXAMS, exam.id, 
        exam, true)),
      map(_void => true),
      catchError(_err => of(false))
    )
  }
}
