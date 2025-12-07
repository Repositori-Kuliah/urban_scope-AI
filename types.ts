// UrbanScope Types

export interface Facility {
  id: number;
  name: string;
  type: string;
  region: string;
  rating: number;
  description?: string;
  technology?: string[];
  stats?: {
    beds?: number;
    chairs?: number;
    complaints?: number;
    reports?: number;
  };
}

export interface RegionData {
    region: string;
    score: number;
    priority: 'High' | 'Medium' | 'Low';
    review_count: number;
    facility_count: number;
    action: string;
    coords: [number, number];
}

export interface ReviewResponse {
  summary: string;
  issues: string[];
  securityConcerns: string[];
  refactoredCode: string;
}