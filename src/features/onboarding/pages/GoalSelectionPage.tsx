import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../auth/hooks/useAuth';
import { TrackWithScope } from '../types/onboarding.types';
import { OnboardingLayout } from '../components/OnboardingLayout';
import { GoalSelectionCard } from '../components/GoalSelectionCard';
import { LoadingFallback } from '../../../components/LoadingFallback';

export function GoalSelectionPage() {
  const { user, hasActiveTrack, refreshActiveTrack, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [tracks, setTracks] = useState<TrackWithScope[]>([]);
  const [activeTrackId, setActiveTrackId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTracksAndCurrentEnrolment() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch current active track if user is logged in
        let currentTrackId: string | null = null;
        if (user) {
          const { data: activeRes } = await supabase
            .from('user_active_track')
            .select('track_id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (activeRes) {
            currentTrackId = activeRes.track_id;
            setActiveTrackId(currentTrackId);
          }
        }

        // Fetch tracks, pillars, and skill_nodes in parallel
        const [tracksRes, pillarsRes, nodesRes] = await Promise.all([
          supabase.from('tracks').select('track_id, name, description'),
          supabase.from('pillars').select('pillar_id, track_id'),
          supabase.from('skill_nodes').select(`
            node_id,
            parent_subtopic_id,
            parent_topic_id,
            subtopics:parent_subtopic_id (
              topics:topic_id (
                pillars:pillar_id (
                  track_id
                )
              )
            ),
            topics:parent_topic_id (
              pillars:pillar_id (
                track_id
              )
            )
          `),
        ]);

        if (tracksRes.error) throw tracksRes.error;
        if (pillarsRes.error) throw pillarsRes.error;

        const rawTracks = tracksRes.data || [];
        const rawPillars = pillarsRes.data || [];
        const rawNodes = nodesRes.data || [];

        // Count pillars per track
        const pillarCountMap = new Map<string, number>();
        rawPillars.forEach((p) => {
          pillarCountMap.set(p.track_id, (pillarCountMap.get(p.track_id) || 0) + 1);
        });

        // Count nodes per track
        const nodeCountMap = new Map<string, number>();
        rawNodes.forEach((node: any) => {
          let nodeTrackId: string | null = null;
          if (node.subtopics?.topics?.pillars?.track_id) {
            nodeTrackId = node.subtopics.topics.pillars.track_id;
          } else if (node.topics?.pillars?.track_id) {
            nodeTrackId = node.topics.pillars.track_id;
          }
          if (nodeTrackId) {
            nodeCountMap.set(nodeTrackId, (nodeCountMap.get(nodeTrackId) || 0) + 1);
          }
        });

        const formattedTracks: TrackWithScope[] = rawTracks.map((t) => ({
          track_id: t.track_id,
          name: t.name,
          description: t.description,
          pillarCount: pillarCountMap.get(t.track_id) || 0,
          nodeCount: nodeCountMap.get(t.track_id) || 0,
        }));

        // Prioritize real production tracks over development test tracks
        const productionTracks = formattedTracks.filter((t) => t.track_id !== 'track-creator-test');
        setTracks(productionTracks.length > 0 ? productionTracks : formattedTracks);
      } catch (err: any) {
        console.error('Error loading tracks:', err);
        setError('Unable to load available role tracks. Please refresh.');
      } finally {
        setIsLoading(false);
      }
    }

    loadTracksAndCurrentEnrolment();
  }, [user]);

  const handleSelectTrack = (trackId: string) => {
    navigate(`/onboarding/knowledge?trackId=${encodeURIComponent(trackId)}`);
  };

  const handleSwitchTrack = async (targetTrackId: string) => {
    if (!user) return;
    try {
      setIsSwitching(true);
      setError(null);

      // Perform upsert on user_active_track
      const { error: upsertErr } = await supabase
        .from('user_active_track')
        .upsert(
          {
            user_id: user.id,
            track_id: targetTrackId,
            selected_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        );

      if (upsertErr) throw upsertErr;

      // Update local and context state
      setActiveTrackId(targetTrackId);
      await refreshActiveTrack();

      // Navigate cleanly to /app displaying the newly active track
      navigate('/app', { replace: true });
    } catch (err: any) {
      console.error('Error switching track:', err);
      setError(err.message || 'Failed to switch track. Please try again.');
    } finally {
      setIsSwitching(false);
    }
  };

  if (authLoading || isLoading) {
    return <LoadingFallback />;
  }

  return (
    <OnboardingLayout
      title={hasActiveTrack ? 'Switch Career Track' : 'Choose Your Role Goal'}
      subtitle={
        hasActiveTrack
          ? 'Switch between career tracks at any time. Your completion history across all tracks is permanently preserved.'
          : 'Select a structured learning roadmap. Each track is designed for progressive mastery from core foundations to advanced application.'
      }
    >
      {error && (
        <div style={styles.errorBanner} role="alert">
          {error}
        </div>
      )}

      <div style={styles.grid}>
        {tracks.map((track) => (
          <GoalSelectionCard
            key={track.track_id}
            track={track}
            isActiveTrack={activeTrackId === track.track_id}
            hasEnrolledTrack={hasActiveTrack}
            isSwitching={isSwitching}
            onSelect={handleSelectTrack}
            onSwitchTrack={handleSwitchTrack}
          />
        ))}
      </div>
    </OnboardingLayout>
  );
}

const styles: Record<string, React.CSSProperties> = {
  grid: {
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
    marginBottom: '20px',
    textAlign: 'center',
  },
};
