export interface SurveyData {
  clientId: string;
  foodName: string;
  location: string;
  category: string;
  tasteRating: number;
  priceRating: number;
  hygieneRating: number;
  qualityRating: number;
  overallRating: number;
  price: number;
  comment?: string;
  createdAt?: string;
}

export type SurveySyncStatus = 'pending' | 'synced' | 'failed';

export interface LocalSurvey {
  id?: number;
  clientId: string;
  data: SurveyData;
  status: SurveySyncStatus;
  createdAt: string;
  errorMessage?: string;
}

