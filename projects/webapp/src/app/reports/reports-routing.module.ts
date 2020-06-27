import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccompanimentsReport } from './pages/accompaniments-report/accompaniments-reports.page';
import { PreloadAccompanimentsResolver } from './resolvers/preload-accompaniments.resolver';
import { PreloadMentorResolver } from './resolvers/preload-mentor.resolver';
import { PreloadStudentResolver } from './resolvers/preload-student.resolver';

const routes: Routes = [
  {
    path: 'acompañamientos/:mentorId/:studentId/:semesterKind',
    component: AccompanimentsReport,
    resolve: {
      mentor: PreloadMentorResolver,
      student: PreloadStudentResolver,
      accompaniments: PreloadAccompanimentsResolver,
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule {
  static pages = [
    AccompanimentsReport,
  ];

  static resolvers = [
    PreloadMentorResolver,
    PreloadStudentResolver,
    PreloadAccompanimentsResolver,
  ];
}
