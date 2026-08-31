import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth/hooks/useAuth';
import { PillarItem, PillarSelfReportLevel, SelfReportState } from '../types/onboarding.types';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { KnowledgePillarRow } from '../components/KnowledgePillarRow';
import { LoadingFallback } from '../../../components/LoadingFallback';

export function KnowledgeSelectionPage() {
  const { user, hasActiveTrack, refreshActiveTrack, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const trackId = searchParams.get('trackId');

  const [trackName, setTrackName] = useState<string>('');
  const [pillars, setPillars] = useState<PillarItem[]>([]);
  const [levels, setLevels] = useState<SelfReportState>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // If already enrolled, redirect to /app
  useEffect(() => {
    if (!authLoading && hasActiveTrack) {
      navigate('/app', { replace: true });
    }
  }, [hasActiveTrack, authLoading, navigate]);

  // Load track and pillars
  useEffect(() => {
    if (!trackId) {
      navigate('/onboarding/goal', { replace: true });
      return;
    }

    async function loadPillars() {
      try {
        setIsLoading(true);
        setServerError(null);

        // Fetch track details to verify it exists
        const { data: trackData, error: trackErr } = await supabase
          .from('tracks')
          .select('track_id, name')
          .eq('track_id', trackId)
          .maybeSingle();

        if (trackErr || !trackData) {
          console.warn('Track not found, redirecting to goal selection:', trackId);
          navigate('/onboarding/goal', { replace: true });
          return;
        }

        setTrackName(trackData.name);

        // Fetch pillars for this track ordered by order_index
        const { data: pillarRows, error: pillarErr } = await supabase
          .from('pillars')
          .select('pillar_id, track_id, name, description, order_index')
          .eq('track_id', trackId)
          .order('order_index', { ascending: true });

        if (pillarErr || !pillarRows || pillarRows.length === 0) {
          console.warn('No pillars found for track, redirecting to goal selection');
          navigate('/onboarding/goal', { replace: true });
          return;
        }

        setPillars(pillarRows as PillarItem[]);

        // Initialize default self-report level to 'dont_know' for all pillars
        const initialLevels: SelfReportState = {};
        pillarRows.forEach((p) => {
          initialLevels[p.pillar_id] = 'dont_know';
        });
        setLevels(initialLevels);
      } catch (err: any) {
        console.error('Error loading onboarding pillars:', err);
        setServerError('Unable to load starting knowledge assessment.');
      } finally {
        setIsLoading(false);
      }
    }

    loadPillars();
  }, [trackId, navigate]);

  const handleLevelChange = (pillarId: string, level: PillarSelfReportLevel) => {
    setLevels((prev) => ({
      ...prev,
      [pillarId]: level,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !trackId || isSubmitting) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      // 1. Prepare batch payload for user_pillar_self_report
      const selfReportPayload = pillars.map((p) => ({
        user_id: user.id,
        pillar_id: p.pillar_id,
        level: levels[p.pillar_id] || 'dont_know',
      }));

      // 2. Insert self-report rows FIRST
      const { error: selfReportErr } = await supabase
        .from('user_pillar_self_report')
        .upsert(selfReportPayload);

      if (selfReportErr) {
        throw new Error(`Self-report persistence failed: ${selfReportErr.message}`);
      }

      // 3. Insert active track enrollment row SECOND
      const { error: activeTrackErr } = await supabase
        .from('user_active_track')
        .insert({
          user_id: user.id,
          track_id: trackId,
        });

      if (activeTrackErr) {
        throw new Error(`Active track enrollment failed: ${activeTrackErr.message}`);
      }

      // 4. Synchronize AuthContext active track state
      await refreshActiveTrack();

      // 5. Navigate to /app
      navigate('/app', { replace: true });
    } catch (err: any) {
      console.error('Onboarding submission error:', err);
      setServerError(err.message || 'Failed to complete onboarding. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return <LoadingFallback />;
  }

  return (
    <OnboardingLayout
      title="Self-Report Starting Knowledge"
      subtitle={`Calibrate your suggested starting point for ${trackName || 'your track'}. All nodes remain available to explore.`}
      maxWidth="720px"
    >
      <form onSubmit={handleSubmit} style={styles.form}>
        {serverError && (
          <div style={styles.errorBanner} role="alert">
            {serverError}
          </div>
        )}

        <div style={styles.pillarList}>
          {pillars.map((pillar) => (
            <KnowledgePillarRow
              key={pillar.pillar_id}
              pillar={pillar}
              selectedLevel={levels[pillar.pillar_id] || 'dont_know'}
              onChange={(level) => handleLevelChange(pillar.pillar_id, level)}
            />
          ))}
        </div>

        <div style={styles.actions}>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              ...styles.submitButton,
              opacity: isSubmitting ? 0.7 : 1,
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
            }}
          >
            {isSubmitting ? 'Activating Track...' : 'Complete Onboarding & Enter Track'}
          </button>
        </div>
      </form>
    </OnboardingLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  pillarList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  errorBanner: {
    padding: '12px 16px',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: 'var(--radius-md)',
    color: 'var(--status-error)',
    fontSize: '14px',
    textAlign: 'center',
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    paddingTop: '12px',
  },
  submitButton: {
    padding: '14px 28px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#ffffff',
    backgroundColor: 'var(--accent-primary)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
};
