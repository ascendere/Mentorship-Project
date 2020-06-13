import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IsAdminGuard } from '../core/guards/is-admin.guard';
import { IsMentorGuard } from '../core/guards/is-mentor.guard';
import { ValidPeriodOfMentorGuard } from '../core/guards/valid-period-of-mentor.guard';
import { CurrentPeriodActiveGuard } from './guards/current-period-active.guard';
import { IsStudentGuard } from './guards/is-student.guard';
import { RedirectCurrentGuard } from './guards/redirect-current-period.guard';
import { SignedInGuard } from './guards/signed-in.guard';
import { UnconfirmedAccompanimentExistsGuard } from './guards/unconfirmed-accompaniment-exists.guard';
import { ValidPeriodOfAccompanimentGuard } from './guards/valid-period-of-accompaniment.guard';
import { ValidPeriodOfStudentGuard } from './guards/valid-period-of-student.guard';
import { ValidPeriodGuard } from './guards/valid-period.guard';
import { AccompanimentsRegistryPage } from './pages/accompaniments-registry/accompaniments-registry.page';
import { AccompanimentsAnalyticsPage } from './pages/analytics/accompaniments-analytics/accompaniments-analytics.page';
import { AnalyticsPage } from './pages/analytics/analytics.page';
import { MentorsAnalyticsPage } from './pages/analytics/mentors-analytics/mentors-analytics.page';
import { DashboardHomePage } from './pages/dashboard-home/dashboard-home.page';
import { DashboardShell } from './pages/dashboard.page';
import { RegisterAccompanimentPage } from './pages/register-accompaniment/register-accompaniment.page';
import { ReviewAccompanimentPage } from './pages/review-accompaniment/review-accompaniment.page';
import { ViewAccompanimentPage } from './pages/view-accompaniment/view-accompaniment.page';
import { ActivePeriodResolver } from './resolvers/active-period.resolver';
import { ExportAccompanimentsResolver } from './resolvers/export-accompaniments.resolver';
import { InfoAccompanimentResolver } from './resolvers/info-accompaniment.resolver';
import { InfoMentorResolver } from './resolvers/info-mentor.resolver';
import { InfoStudentResolver } from './resolvers/info-student.resolver';
import { ListStudentsResolver } from './resolvers/list-students.resolver';

const routes: Routes = [

  // ==================
  // Redirect actual period
  // ==================
  { path: '', canActivate: [SignedInGuard, RedirectCurrentGuard] },

  // ==================
  // Sign in feature
  // ==================
  { path: 'ingresar', loadChildren: () => import('../sign-in/sign-in.module').then(m => m.SignInModule) },

  // ==================
  // Dashboard shell
  // ==================
  {
    path: ':periodId',
    component: DashboardShell,
    resolve: { activePeriod: ActivePeriodResolver },
    canActivate: [SignedInGuard, ValidPeriodGuard],
    runGuardsAndResolvers: 'always',
    children: [
      // dashboard home page
      { path: '', component: DashboardHomePage },

      // analytics page
      {
        path: 'analiticas',
        component: AnalyticsPage,
        canActivate: [IsAdminGuard],
        children: [
          { path: 'acompañamientos', component: AccompanimentsAnalyticsPage },
          { path: 'mentores', component: MentorsAnalyticsPage },
          { path: '**', redirectTo: 'acompañamientos' }
        ]
      },

      // ==================
      // Upload information feature
      // ==================
      {
        path: 'subir-informacion', loadChildren: () => import('../upload/upload.module').then(m => m.UploadModule),
        canActivate: [IsAdminGuard, CurrentPeriodActiveGuard]
      },

      // ==================
      // Mentors feature
      // ==================
      { path: 'mentores', loadChildren: () => import('./../mentors/mentors.module').then(m => m.MentorsModule) },
      { path: 'ver-mentores', redirectTo: 'mentores' },
      { path: 'ver-estudiantes/:mentorId', redirectTo: 'mentores/:mentorId' },

      // =====================
      // Student Feature
      // =====================
      { path: 'estudiantes', loadChildren: () => import('./../students/students.module').then(m => m.StudentsModule) },
      { path: 'historial-acompañamientos/:mentorId/:studentId', redirectTo: 'estudiantes/:studentId' },


      // view all information of an accompaniment
      {
        path: 'ver-acompañamiento/:mentorId/:accompanimentId',
        component: ViewAccompanimentPage,
        resolve: { accompaniment: InfoAccompanimentResolver },
        canActivate: [
          IsMentorGuard,
          ValidPeriodOfMentorGuard,
          ValidPeriodOfAccompanimentGuard
        ]
      },

      // where users will validate an accompaniment
      {
        path: 'calificar-acompañamiento/:studentId/:accompanimentId/:reviewKey',
        component: ReviewAccompanimentPage,
        resolve: { accompaniment: InfoAccompanimentResolver },
        canActivate: [
          IsStudentGuard,
          UnconfirmedAccompanimentExistsGuard,
          CurrentPeriodActiveGuard,
          ValidPeriodOfStudentGuard,
          ValidPeriodOfAccompanimentGuard
        ]
      },

      // register a new accompaniment
      {
        path: 'registrar-acompañamiento/:mentorId',
        component: RegisterAccompanimentPage,
        resolve: {
          mentor: InfoMentorResolver,
          students: ListStudentsResolver
        },
        canActivate: [
          IsMentorGuard,
          CurrentPeriodActiveGuard,
          ValidPeriodOfMentorGuard
        ]
      }
    ]
  },

  // view accompaniment registry of specific semester
  {
    path: 'ficha-acompañamiento/:mentorId/:studentId/:semesterKind',
    component: AccompanimentsRegistryPage,
    resolve: {
      mentor: InfoMentorResolver,
      student: InfoStudentResolver,
      accompaniments: ExportAccompanimentsResolver
    }
  },

  { path: '**', redirectTo: '/panel-control' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardModuleRoutingModule { }
