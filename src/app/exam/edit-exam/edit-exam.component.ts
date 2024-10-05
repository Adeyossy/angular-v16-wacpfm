import { Component, Input } from '@angular/core';
import { catchError, concatMap, map, Observable, of } from 'rxjs';
import { Exam, EXAMS } from 'src/app/models/exam';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-edit-exam',
  templateUrl: './edit-exam.component.html',
  styleUrls: ['./edit-exam.component.css']
})
export class EditExamComponent {
  @Input() exam$: Observable<Exam> = new Observable();
  updateTracker$: Observable<boolean> | null = null;

  constructor(private authService: AuthService) {}

  update$() {
    this.updateTracker$ = this.exam$.pipe(
      concatMap(exam => this.authService.addDocWithID$(EXAMS, exam.id, 
        exam, true)),
      map(_void => true),
      catchError(_err => of(false))
    )
  }
}
