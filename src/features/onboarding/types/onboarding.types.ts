export type PillarSelfReportLevel = 'dont_know' | 'beginner' | 'intermediate' | 'advanced';

export interface TrackWithScope {
  track_id: string;
  name: string;
  description: string;
  pillarCount: number;
  nodeCount: number;
}

export interface PillarItem {
  pillar_id: string;
  track_id: string;
  name: string;
  description: string;
  order_index: number;
}

export type SelfReportState = Record<string, PillarSelfReportLevel>;
