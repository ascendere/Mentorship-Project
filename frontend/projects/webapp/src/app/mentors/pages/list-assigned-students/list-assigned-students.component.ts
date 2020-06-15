import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { MentorsService } from '../../../core/services/mentors.service';
import { StudentsService } from '../../../core/services/students.service';
import { TitleService } from '../../../core/services/title.service';
import { Mentor, Students } from '../../../models/models';

@Component({
  selector: 'sgm-list-assigned-students',
  templateUrl: './list-assigned-students.component.html'
})
export class ListAssignedStudentsComponent {

  constructor(
    private readonly title: TitleService,
    private readonly route: ActivatedRoute,
    private readonly mentorsService: MentorsService,
    private readonly studentsService: StudentsService
  ) { }

  public readonly mentorObs: Observable<Mentor> = this.route.params
    .pipe(
      switchMap(params => this.mentorsService.getMentorAndShare(params.mentorId)),
      tap(mentor => this.title.setTitle(`Estudiantes Asignados | ${mentor.displayName.toUpperCase()}`)),
    );

  public readonly studentsObs: Observable<Students> = this.route.params
    .pipe(switchMap(p => this.studentsService.getStudentsOfMentorAndShare(p.mentorId, p.periodId)));
}
