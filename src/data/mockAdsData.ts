import { AdData } from '../types/ads';

export const mockAdsData: AdData[] = [
  // Campaign 1: Summer Sale
  {
    campaignId: "camp_001",
    campaignName: "Summer Sale 2024",
    adId: "ad_001",
    adName: "Beach Collection Banner",
    impressions: 15000,
    clicks: 450,
    spend: 2250,
    ctr: 3.0,
    cpc: 5.0,
    date: "2024-06-01"
  },
  {
    campaignId: "camp_001",
    campaignName: "Summer Sale 2024",
    adId: "ad_002",
    adName: "Swimwear Promo",
    impressions: 12000,
    clicks: 600,
    spend: 1800,
    ctr: 5.0,
    cpc: 3.0,
    date: "2024-06-05"
  },
  {
    campaignId: "camp_001",
    campaignName: "Summer Sale 2024",
    adId: "ad_003",
    adName: "Sunglasses Ad",
    impressions: 8000,
    clicks: 320,
    spend: 960,
    ctr: 4.0,
    cpc: 3.0,
    date: "2024-06-10"
  },

  // Campaign 2: Black Friday
  {
    campaignId: "camp_002",
    campaignName: "Black Friday 2024",
    adId: "ad_004",
    adName: "Electronics Deals",
    impressions: 25000,
    clicks: 1250,
    spend: 5000,
    ctr: 5.0,
    cpc: 4.0,
    date: "2024-11-20"
  },
  {
    campaignId: "camp_002",
    campaignName: "Black Friday 2024",
    adId: "ad_005",
    adName: "Fashion Discount",
    impressions: 18000,
    clicks: 720,
    spend: 2880,
    ctr: 4.0,
    cpc: 4.0,
    date: "2024-11-22"
  },
  {
    campaignId: "camp_002",
    campaignName: "Black Friday 2024",
    adId: "ad_006",
    adName: "Home & Garden",
    impressions: 22000,
    clicks: 880,
    spend: 3520,
    ctr: 4.0,
    cpc: 4.0,
    date: "2024-11-25"
  },

  // Campaign 3: Holiday Season
  {
    campaignId: "camp_003",
    campaignName: "Holiday Season 2024",
    adId: "ad_007",
    adName: "Gift Guide",
    impressions: 30000,
    clicks: 1500,
    spend: 6000,
    ctr: 5.0,
    cpc: 4.0,
    date: "2024-12-01"
  },
  {
    campaignId: "camp_003",
    campaignName: "Holiday Season 2024",
    adId: "ad_008",
    adName: "Christmas Decorations",
    impressions: 16000,
    clicks: 640,
    spend: 1920,
    ctr: 4.0,
    cpc: 3.0,
    date: "2024-12-05"
  },
  {
    campaignId: "camp_003",
    campaignName: "Holiday Season 2024",
    adId: "ad_009",
    adName: "New Year Sale",
    impressions: 20000,
    clicks: 1000,
    spend: 4000,
    ctr: 5.0,
    cpc: 4.0,
    date: "2024-12-28"
  },

  // Campaign 4: Spring Collection
  {
    campaignId: "camp_004",
    campaignName: "Spring Collection 2024",
    adId: "ad_010",
    adName: "Floral Dresses",
    impressions: 14000,
    clicks: 560,
    spend: 1680,
    ctr: 4.0,
    cpc: 3.0,
    date: "2024-03-15"
  },
  {
    campaignId: "camp_004",
    campaignName: "Spring Collection 2024",
    adId: "ad_011",
    adName: "Pastel Colors",
    impressions: 12000,
    clicks: 480,
    spend: 1440,
    ctr: 4.0,
    cpc: 3.0,
    date: "2024-03-20"
  },
  {
    campaignId: "camp_004",
    campaignName: "Spring Collection 2024",
    adId: "ad_012",
    adName: "Light Jackets",
    impressions: 10000,
    clicks: 400,
    spend: 1200,
    ctr: 4.0,
    cpc: 3.0,
    date: "2024-03-25"
  },

  // Campaign 5: Tech Launch
  {
    campaignId: "camp_005",
    campaignName: "Tech Launch 2024",
    adId: "ad_013",
    adName: "Smartphone Pro",
    impressions: 35000,
    clicks: 1750,
    spend: 8750,
    ctr: 5.0,
    cpc: 5.0,
    date: "2024-09-10"
  },
  {
    campaignId: "camp_005",
    campaignName: "Tech Launch 2024",
    adId: "ad_014",
    adName: "Laptop Series",
    impressions: 28000,
    clicks: 1120,
    spend: 5600,
    ctr: 4.0,
    cpc: 5.0,
    date: "2024-09-15"
  },
  {
    campaignId: "camp_005",
    campaignName: "Tech Launch 2024",
    adId: "ad_015",
    adName: "Accessories Bundle",
    impressions: 15000,
    clicks: 600,
    spend: 2400,
    ctr: 4.0,
    cpc: 4.0,
    date: "2024-09-20"
  },

  // Campaign 6: Fitness & Wellness
  {
    campaignId: "camp_006",
    campaignName: "Fitness & Wellness 2024",
    adId: "ad_016",
    adName: "Workout Equipment",
    impressions: 18000,
    clicks: 720,
    spend: 2160,
    ctr: 4.0,
    cpc: 3.0,
    date: "2024-01-15"
  },
  {
    campaignId: "camp_006",
    campaignName: "Fitness & Wellness 2024",
    adId: "ad_017",
    adName: "Nutrition Supplements",
    impressions: 16000,
    clicks: 640,
    spend: 1920,
    ctr: 4.0,
    cpc: 3.0,
    date: "2024-01-20"
  },
  {
    campaignId: "camp_006",
    campaignName: "Fitness & Wellness 2024",
    adId: "ad_018",
    adName: "Yoga Mats",
    impressions: 12000,
    clicks: 480,
    spend: 1440,
    ctr: 4.0,
    cpc: 3.0,
    date: "2024-01-25"
  },

  // Campaign 7: Back to School
  {
    campaignId: "camp_007",
    campaignName: "Back to School 2024",
    adId: "ad_019",
    adName: "School Supplies",
    impressions: 22000,
    clicks: 880,
    spend: 2640,
    ctr: 4.0,
    cpc: 3.0,
    date: "2024-08-15"
  },
  {
    campaignId: "camp_007",
    campaignName: "Back to School 2024",
    adId: "ad_020",
    adName: "Backpacks & Bags",
    impressions: 19000,
    clicks: 760,
    spend: 2280,
    ctr: 4.0,
    cpc: 3.0,
    date: "2024-08-20"
  },
  {
    campaignId: "camp_007",
    campaignName: "Back to School 2024",
    adId: "ad_021",
    adName: "Lunch Boxes",
    impressions: 15000,
    clicks: 600,
    spend: 1800,
    ctr: 4.0,
    cpc: 3.0,
    date: "2024-08-25"
  }
]; 