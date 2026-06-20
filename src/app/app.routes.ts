/**
 * @file 遅延ロード（loadComponent）を使ったルーティング設定。
 * 既定は /today にリダイレクト。ルートは today / roadmap / goals / coach / settings の 5 つ。
 */
import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'today', pathMatch: 'full' },
  {
    path: 'today',
    loadComponent: () => import('./pages/today/today').then(m => m.Today),
  },
  {
    path: 'roadmap',
    loadComponent: () => import('./pages/roadmap/roadmap').then(m => m.Roadmap),
  },
  {
    path: 'goals',
    loadComponent: () => import('./pages/goals/goals').then(m => m.Goals),
  },
  {
    path: 'coach',
    loadComponent: () => import('./pages/coach/coach').then(m => m.Coach),
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings').then(m => m.Settings),
  },
  { path: '**', redirectTo: 'today' },
];
