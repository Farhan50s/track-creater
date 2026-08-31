import { RouteObject } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { RoutePlaceholder } from '../components/RoutePlaceholder';
import { ProtectedRoute } from '../components/guards/ProtectedRoute';
import { PublicOnlyRoute } from '../components/guards/PublicOnlyRoute';
import { OnboardingGuard } from '../components/guards/OnboardingGuard';
import { OnboardingRouteGuard } from '../components/guards/OnboardingRouteGuard';
import { LoginForm } from '../features/auth/components/LoginForm';
import { SignupForm } from '../features/auth/components/SignupForm';
import { ForgotPasswordForm } from '../features/auth/components/ForgotPasswordForm';
import { GoalSelectionPage } from '../features/onboarding/pages/GoalSelectionPage';
import { KnowledgeSelectionPage } from '../features/onboarding/pages/KnowledgeSelectionPage';
import { TrackOverviewPage } from '../features/track/pages/TrackOverviewPage';
import { PillarViewPage } from '../features/track/pages/PillarViewPage';
import { SkillDetailPage } from '../features/skill/pages/SkillDetailPage';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppShell />,
    children: [
      {
        index: true,
        element: (
          <RoutePlaceholder
            screenName="Landing"
            routePath="/"
            description="Public landing page introducing Track Creator and the Progressive Mastery concept."
          />
        ),
      },
      {
        path: 'signup',
        element: (
          <PublicOnlyRoute>
            <SignupForm />
          </PublicOnlyRoute>
        ),
      },
      {
        path: 'login',
        element: (
          <PublicOnlyRoute>
            <LoginForm />
          </PublicOnlyRoute>
        ),
      },
      {
        path: 'forgot-password',
        element: <ForgotPasswordForm />,
      },
      {
        path: 'onboarding',
        element: (
          <ProtectedRoute>
            <OnboardingRouteGuard />
          </ProtectedRoute>
        ),
        children: [
          {
            path: 'goal',
            element: <GoalSelectionPage />,
          },
          {
            path: 'knowledge',
            element: <KnowledgeSelectionPage />,
          },
        ],
      },
      {
        path: 'app',
        element: (
          <ProtectedRoute>
            <OnboardingGuard />
          </ProtectedRoute>
        ),
        children: [
          {
            index: true,
            element: (
              <RoutePlaceholder
                screenName="Home / Dashboard"
                routePath="/app"
                description="Active learning panel with per-pillar focus and rule-based recommendation."
              />
            ),
          },
          {
            path: 'track',
            children: [
              {
                index: true,
                element: <TrackOverviewPage />,
              },
              {
                path: ':pillarId',
                element: <PillarViewPage />,
              },
            ],
          },
          {
            path: 'node/:nodeId',
            children: [
              {
                index: true,
                element: <SkillDetailPage />,
              },
              {
                path: 'quiz',
                element: (
                  <RoutePlaceholder
                    screenName="Quiz Flow"
                    routePath="/app/node/:nodeId/quiz"
                    description="Deterministic 5-question MCQ checkpoint (4/5 required to pass)."
                  />
                ),
              },
            ],
          },
          {
            path: 'profile',
            element: (
              <RoutePlaceholder
                screenName="Account Settings"
                routePath="/app/profile"
                description="User profile and account settings."
              />
            ),
          },
        ],
      },
      {
        path: '*',
        element: (
          <RoutePlaceholder
            screenName="404 — Page Not Found"
            routePath="*"
            description="The requested route does not exist."
          />
        ),
      },
    ],
  },
];
