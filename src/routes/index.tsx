import { RouteObject } from 'react-router-dom';
import { AppShell } from '../components/AppShell';
import { RoutePlaceholder } from '../components/RoutePlaceholder';
import { ProtectedRoute } from '../components/guards/ProtectedRoute';
import { PublicOnlyRoute } from '../components/guards/PublicOnlyRoute';
import { OnboardingGuard } from '../components/guards/OnboardingGuard';
import { LoginForm } from '../features/auth/components/LoginForm';
import { SignupForm } from '../features/auth/components/SignupForm';
import { ForgotPasswordForm } from '../features/auth/components/ForgotPasswordForm';

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
        element: <ProtectedRoute />,
        children: [
          {
            path: 'goal',
            element: (
              <RoutePlaceholder
                screenName="Onboarding — Goal Selection"
                routePath="/onboarding/goal"
                description="Role template selection screen (2-3 curated templates)."
              />
            ),
          },
          {
            path: 'knowledge',
            element: (
              <RoutePlaceholder
                screenName="Onboarding — Starting Knowledge"
                routePath="/onboarding/knowledge"
                description="Self-reported familiarity assessment per pillar."
              />
            ),
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
                element: (
                  <RoutePlaceholder
                    screenName="Track Overview"
                    routePath="/app/track"
                    description="Full track progress overview across all pillars."
                  />
                ),
              },
              {
                path: ':pillarId',
                element: (
                  <RoutePlaceholder
                    screenName="Pillar View"
                    routePath="/app/track/:pillarId"
                    description="Expandable vertical tree for a specific pillar."
                  />
                ),
              },
            ],
          },
          {
            path: 'node/:nodeId',
            children: [
              {
                index: true,
                element: (
                  <RoutePlaceholder
                    screenName="Skill Detail"
                    routePath="/app/node/:nodeId"
                    description="Core skill learning surface with definition, overview/deep-dive, prerequisites, and resources."
                  />
                ),
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
