export interface AdData {
  campaignId: string;
  campaignName: string;
  adId: string;
  adName: string;
  impressions: number;
  clicks: number;
  spend: number;
  ctr: number; // click-through rate
  cpc: number; // cost per click
  date: string; // ISO string
}

export interface QueryResult {
  answer: string;
  data?: AdData[];
  chartData?: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor?: string;
      borderColor?: string;
    }[];
  };
  suggestions?: string[];
} 