import { AdData, QueryResult } from '../types/ads';
import { mockAdsData } from '../data/mockAdsData';
import { format, parseISO, isWithinInterval, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import OpenAI from 'openai';

export class RAGService {
  private data: AdData[];
  private openai: OpenAI | null = null;

  constructor() {
    this.data = mockAdsData;
    
    // Initialize OpenAI only if API key is available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  async processQuery(query: string, requestId?: string): Promise<QueryResult> {
    const reqId = requestId || `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    
    console.log(`🔍 [${reqId}] RAG Service: Starting query processing`);
    console.log(`📝 [${reqId}] RAG Service: Query received: "${query}"`);
    console.log(`🔧 [${reqId}] RAG Service: OpenAI available: ${!!this.openai}`);

    try {
      // Step 1: Use AI to analyze the query intent (or fallback)
      console.log(`🎯 [${reqId}] RAG Service: Step 1 - Analyzing query intent`);
      const intentAnalysis = await this.analyzeQueryIntent(query, reqId);
      console.log(`✅ [${reqId}] RAG Service: Intent analysis complete:`, intentAnalysis);
      
      // Step 2: Filter data based on AI-extracted intent
      console.log(`🔍 [${reqId}] RAG Service: Step 2 - Filtering data by intent`);
      const filteredData = this.filterDataByIntent(intentAnalysis, reqId);
      console.log(`✅ [${reqId}] RAG Service: Data filtering complete. Found ${filteredData.length} records`);
      
      // Step 3: Use AI to generate insights (or fallback)
      console.log(`💡 [${reqId}] RAG Service: Step 3 - Generating insights`);
      const insights = await this.generateInsights(query, intentAnalysis, filteredData, reqId);
      console.log(`✅ [${reqId}] RAG Service: Insights generated (${insights.length} characters)`);
      
      // Step 4: Generate AI-powered suggestions (or fallback)
      console.log(`💭 [${reqId}] RAG Service: Step 4 - Generating suggestions`);
      const suggestions = await this.generateSuggestions(query, intentAnalysis, reqId);
      console.log(`✅ [${reqId}] RAG Service: Suggestions generated (${suggestions.length} items)`);
      
      // Step 5: Generate chart data
      console.log(`📊 [${reqId}] RAG Service: Step 5 - Generating chart data`);
      const chartData = this.generateChartData(filteredData, intentAnalysis, reqId);
      console.log(`✅ [${reqId}] RAG Service: Chart data generated:`, chartData ? 'Available' : 'None');

      const processingTime = Date.now() - startTime;
      console.log(`🎉 [${reqId}] RAG Service: Processing complete in ${processingTime}ms`);

      return {
        answer: insights,
        data: filteredData,
        chartData,
        suggestions
      };
    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error(`💥 [${reqId}] RAG Service: Error processing query:`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        processingTimeMs: processingTime
      });
      
      return {
        answer: "I'm sorry, I couldn't process your query. Please try rephrasing your question.",
        suggestions: [
          "Which ad performed best in June?",
          "Show me the highest CTR campaigns",
          "What was our total spend last month?",
          "Which campaign had the most impressions?"
        ]
      };
    }
  }

  private async analyzeQueryIntent(query: string, requestId?: string): Promise<any> {
    const reqId = requestId || 'unknown';
    console.log(`🎯 [${reqId}] Intent Analysis: Starting analysis for query: "${query}"`);
    
    // If OpenAI is available, use AI
    if (this.openai) {
      console.log(`🤖 [${reqId}] Intent Analysis: Using AI-powered intent analysis`);
      try {
        const prompt = `
        Analyze the following query about Meta Ads data and extract the intent.
        
        Query: ${query}
        
        Extract and return a JSON object with the following structure:
        {
          "time_period": "specific month name (e.g., 'june', 'december') or 'all_time' or 'last_month' or 'last_week'",
          "metric": "ctr" | "cpc" | "impressions" | "clicks" | "spend" | "performance",
          "comparison": "best" | "worst" | "average" | "total",
          "campaign": "campaign name if mentioned (e.g., 'black friday', 'summer sale') or null",
          "intent": "brief description of what the user wants to know"
        }
        
        Available campaigns: Summer Sale, Black Friday, Holiday Season, Spring Collection, Tech Launch, Fitness & Wellness, Back to School
        Available months: January, March, June, August, September, November, December
        
        Return only the JSON object, no additional text.
        `;

        console.log(`📤 [${reqId}] Intent Analysis: Sending request to OpenAI`);
        const result = await this.openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that analyzes queries about Meta Ads performance data and extracts structured intent information."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.1,
          max_tokens: 300
        });

        const response = result.choices[0]?.message?.content?.trim() || '';
        console.log(`📥 [${reqId}] Intent Analysis: Received AI response (${response.length} characters)`);
        
        // Parse the JSON response from AI
        const intent = JSON.parse(response);
        console.log(`✅ [${reqId}] Intent Analysis: Successfully parsed AI response:`, intent);
        
        // Convert time period to date range
        intent.timeRange = this.convertTimePeriodToRange(intent.time_period);
        console.log(`🕒 [${reqId}] Intent Analysis: Time range converted:`, intent.timeRange);
        
        return intent;
      } catch (error) {
        console.error(`❌ [${reqId}] Intent Analysis: AI analysis failed:`, error);
        console.log(`🔄 [${reqId}] Intent Analysis: Falling back to basic parsing`);
        // Fallback to basic parsing
        return this.fallbackIntentParsing(query, reqId);
      }
    } else {
      console.log(`🔄 [${reqId}] Intent Analysis: OpenAI not available, using fallback parsing`);
      // Use fallback parsing when OpenAI is not available
      return this.fallbackIntentParsing(query, reqId);
    }
  }

  private convertTimePeriodToRange(timePeriod: string): any {
    const now = new Date();
    
    switch (timePeriod.toLowerCase()) {
      case 'june':
        return { start: new Date(2024, 5, 1), end: new Date(2024, 5, 30) };
      case 'december':
        return { start: new Date(2024, 11, 1), end: new Date(2024, 11, 31) };
      case 'november':
        return { start: new Date(2024, 10, 1), end: new Date(2024, 10, 30) };
      case 'september':
        return { start: new Date(2024, 8, 1), end: new Date(2024, 8, 30) };
      case 'march':
        return { start: new Date(2024, 2, 1), end: new Date(2024, 2, 31) };
      case 'january':
        return { start: new Date(2024, 0, 1), end: new Date(2024, 0, 31) };
      case 'august':
        return { start: new Date(2024, 7, 1), end: new Date(2024, 7, 31) };
      case 'last_month':
        return { 
          start: new Date(now.getFullYear(), now.getMonth() - 1, 1), 
          end: new Date(now.getFullYear(), now.getMonth(), 0) 
        };
      case 'last_week':
        return { 
          start: startOfWeek(now, { weekStartsOn: 1 }), 
          end: endOfWeek(now, { weekStartsOn: 1 }) 
        };
      default:
        return null; // all_time
    }
  }

  private fallbackIntentParsing(query: string, requestId?: string): any {
    const lowerQuery = query.toLowerCase();
    
    // Basic fallback parsing
    let timePeriod = 'all_time';
    if (lowerQuery.includes('june')) timePeriod = 'june';
    else if (lowerQuery.includes('december')) timePeriod = 'december';
    else if (lowerQuery.includes('november')) timePeriod = 'november';
    else if (lowerQuery.includes('september')) timePeriod = 'september';
    else if (lowerQuery.includes('march')) timePeriod = 'march';
    else if (lowerQuery.includes('january')) timePeriod = 'january';
    else if (lowerQuery.includes('august')) timePeriod = 'august';
    else if (lowerQuery.includes('last month')) timePeriod = 'last_month';
    else if (lowerQuery.includes('last week')) timePeriod = 'last_week';

    let metric = 'performance';
    if (lowerQuery.includes('ctr')) metric = 'ctr';
    else if (lowerQuery.includes('cpc')) metric = 'cpc';
    else if (lowerQuery.includes('impressions')) metric = 'impressions';
    else if (lowerQuery.includes('clicks')) metric = 'clicks';
    else if (lowerQuery.includes('spend')) metric = 'spend';

    let comparison = 'best';
    if (lowerQuery.includes('worst') || lowerQuery.includes('lowest')) comparison = 'worst';
    else if (lowerQuery.includes('average')) comparison = 'average';
    else if (lowerQuery.includes('total')) comparison = 'total';

    let campaign = null;
    const campaigns = ['summer sale', 'black friday', 'holiday season', 'spring collection', 'tech launch', 'fitness', 'back to school'];
    for (const camp of campaigns) {
      if (lowerQuery.includes(camp)) {
        campaign = camp;
        break;
      }
    }

    return {
      time_period: timePeriod,
      metric,
      comparison,
      campaign,
      intent: `User wants to know about ${comparison} ${metric} ${campaign ? `for ${campaign}` : ''} ${timePeriod !== 'all_time' ? `in ${timePeriod}` : ''}`,
      timeRange: this.convertTimePeriodToRange(timePeriod)
    };
  }

  private filterDataByIntent(intent: any, requestId?: string): AdData[] {
    const reqId = requestId || 'unknown';
    console.log(`🔍 [${reqId}] Data Filtering: Starting with ${this.data.length} total records`);
    console.log(`🎯 [${reqId}] Data Filtering: Intent received:`, intent);
    
    let filtered = this.data;

    // Filter by time
    if (intent.timeRange) {
      console.log(`🕒 [${reqId}] Data Filtering: Applying time filter:`, intent.timeRange);
      const beforeTimeFilter = filtered.length;
      filtered = filtered.filter(ad => {
        const adDate = parseISO(ad.date);
        return isWithinInterval(adDate, { start: intent.timeRange.start, end: intent.timeRange.end });
      });
      console.log(`📅 [${reqId}] Data Filtering: Time filter applied. Records: ${beforeTimeFilter} → ${filtered.length}`);
    } else {
      console.log(`🕒 [${reqId}] Data Filtering: No time filter applied`);
    }

    // Filter by campaign
    if (intent.campaign) {
      console.log(`🎯 [${reqId}] Data Filtering: Applying campaign filter: "${intent.campaign}"`);
      const beforeCampaignFilter = filtered.length;
      filtered = filtered.filter(ad => 
        ad.campaignName.toLowerCase().includes(intent.campaign.toLowerCase())
      );
      console.log(`📊 [${reqId}] Data Filtering: Campaign filter applied. Records: ${beforeCampaignFilter} → ${filtered.length}`);
    } else {
      console.log(`🎯 [${reqId}] Data Filtering: No campaign filter applied`);
    }

    console.log(`✅ [${reqId}] Data Filtering: Final result - ${filtered.length} records`);
    return filtered;
  }

  private async generateInsights(query: string, intent: any, filteredData: AdData[], requestId?: string): Promise<string> {
    const reqId = requestId || 'unknown';
    console.log(`💡 [${reqId}] Insights Generation: Starting with ${filteredData.length} filtered records`);
    
    // If OpenAI is available, use AI
    if (this.openai) {
      console.log(`🤖 [${reqId}] Insights Generation: Using AI-powered insight generation`);
      try {
        // Prepare data summary for AI
        console.log(`📊 [${reqId}] Insights Generation: Preparing data summary`);
        const dataSummary = this.prepareDataSummary(filteredData, intent);
        console.log(`📋 [${reqId}] Insights Generation: Data summary prepared (${dataSummary.length} characters)`);
        
        const prompt = `
        Generate a natural language insight based on the following Meta Ads data and user query.
        
        User Query: ${query}
        Query Intent: ${intent.intent}
        Filtered Data: ${dataSummary}
        
        Create a helpful, conversational response that:
        1. Answers the user's question directly
        2. Includes relevant metrics (CTR, impressions, spend, etc.)
        3. Provides context about the time period and campaigns
        4. Uses natural, business-friendly language
        5. Is concise but informative
        
        If no data is found, explain why and suggest alternative queries.
        
        Response:
        `;

        console.log(`📤 [${reqId}] Insights Generation: Sending request to OpenAI`);
        const result = await this.openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that analyzes Meta Ads performance data and provides insights in natural language."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.3,
          max_tokens: 500
        });

        const insight = result.choices[0]?.message?.content?.trim() || this.generateFallbackInsight(filteredData, intent, reqId);
        console.log(`✅ [${reqId}] Insights Generation: AI insight generated (${insight.length} characters)`);
        return insight;
      } catch (error) {
        console.error(`❌ [${reqId}] Insights Generation: AI generation failed:`, error);
        console.log(`🔄 [${reqId}] Insights Generation: Falling back to basic insight generation`);
        return this.generateFallbackInsight(filteredData, intent, reqId);
      }
    } else {
      console.log(`🔄 [${reqId}] Insights Generation: OpenAI not available, using fallback generation`);
      // Use fallback insight generation
      return this.generateFallbackInsight(filteredData, intent, reqId);
    }
  }

  private prepareDataSummary(filteredData: AdData[], intent: any): string {
    if (filteredData.length === 0) {
      return "No data found for the specified criteria.";
    }

    const totalImpressions = filteredData.reduce((sum, ad) => sum + ad.impressions, 0);
    const totalClicks = filteredData.reduce((sum, ad) => sum + ad.clicks, 0);
    const totalSpend = filteredData.reduce((sum, ad) => sum + ad.spend, 0);
    const avgCTR = totalClicks / totalImpressions * 100;
    const avgCPC = totalSpend / totalClicks;

    const bestAd = filteredData.reduce((best, current) => 
      current.ctr > best.ctr ? current : best
    );

    const worstAd = filteredData.reduce((worst, current) => 
      current.ctr < worst.ctr ? current : worst
    );

    return `
    Data Summary:
    - Number of ads: ${filteredData.length}
    - Total impressions: ${totalImpressions.toLocaleString()}
    - Total clicks: ${totalClicks.toLocaleString()}
    - Total spend: $${totalSpend.toLocaleString()}
    - Average CTR: ${avgCTR.toFixed(1)}%
    - Average CPC: $${avgCPC.toFixed(2)}
    - Best performing ad: ${bestAd.adName} (CTR: ${bestAd.ctr.toFixed(1)}%)
    - Worst performing ad: ${worstAd.adName} (CTR: ${worstAd.ctr.toFixed(1)}%)
    
    Individual ads:
    ${filteredData.map(ad => 
      `- ${ad.adName} (${ad.campaignName}): ${ad.impressions.toLocaleString()} impressions, ${ad.clicks.toLocaleString()} clicks, ${ad.ctr.toFixed(1)}% CTR, $${ad.spend.toLocaleString()} spend`
    ).join('\n')}
    `;
  }

  private generateFallbackInsight(filteredData: AdData[], intent: any, requestId?: string): string {
    if (filteredData.length === 0) {
      return "No data found for your query. Please try a different time period or campaign.";
    }

    const totalImpressions = filteredData.reduce((sum, ad) => sum + ad.impressions, 0);
    const totalClicks = filteredData.reduce((sum, ad) => sum + ad.clicks, 0);
    const totalSpend = filteredData.reduce((sum, ad) => sum + ad.spend, 0);
    const avgCTR = totalClicks / totalImpressions * 100;

    const bestAd = filteredData.reduce((best, current) => 
      current.ctr > best.ctr ? current : best
    );

    const timeInfo = intent.time_period === 'all_time' ? 'all time' : `in ${intent.time_period}`;
    
    if (intent.comparison === 'best') {
      return `Your best-performing ad ${timeInfo} was "${bestAd.adName}" with a CTR of ${bestAd.ctr.toFixed(1)}%, ${bestAd.impressions.toLocaleString()} impressions, and a total spend of $${bestAd.spend.toLocaleString()}.`;
    } else if (intent.comparison === 'worst') {
      const worstAd = filteredData.reduce((worst, current) => 
        current.ctr < worst.ctr ? current : worst
      );
      return `Your lowest-performing ad ${timeInfo} was "${worstAd.adName}" with a CTR of ${worstAd.ctr.toFixed(1)}%, ${worstAd.impressions.toLocaleString()} impressions, and a total spend of $${worstAd.spend.toLocaleString()}.`;
    } else {
      return `I found ${filteredData.length} ads matching your criteria ${timeInfo}. Total impressions: ${totalImpressions.toLocaleString()}, total clicks: ${totalClicks.toLocaleString()}, total spend: $${totalSpend.toLocaleString()}, average CTR: ${avgCTR.toFixed(1)}%.`;
    }
  }

  private async generateSuggestions(query: string, intent: any, requestId?: string): Promise<string[]> {
    const reqId = requestId || 'unknown';
    console.log(`💭 [${reqId}] Suggestions Generation: Starting for query: "${query}"`);
    
    // If OpenAI is available, use AI
    if (this.openai) {
      console.log(`🤖 [${reqId}] Suggestions Generation: Using AI-powered suggestions`);
      try {
        const suggestionPrompt = `
        Based on the user's query: "${query}"
        And their intent: "${intent.intent}"
        
        Generate 4 helpful follow-up questions that the user might want to ask next.
        Make them specific and relevant to the current context.
        
        Return only the questions, one per line, no numbering or additional text.
        `;

        console.log(`📤 [${reqId}] Suggestions Generation: Sending request to OpenAI`);
        const result = await this.openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a helpful assistant that suggests relevant follow-up questions about Meta Ads performance data."
            },
            {
              role: "user",
              content: suggestionPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 200
        });

        const suggestions = result.choices[0]?.message?.content?.split('\n').filter(s => s.trim()) || [];
        const finalSuggestions = suggestions.slice(0, 4);
        console.log(`✅ [${reqId}] Suggestions Generation: AI suggestions generated (${finalSuggestions.length} items)`);
        return finalSuggestions;
      } catch (error) {
        console.error(`❌ [${reqId}] Suggestions Generation: AI generation failed:`, error);
        console.log(`🔄 [${reqId}] Suggestions Generation: Falling back to basic suggestions`);
        return this.getFallbackSuggestions(intent, reqId);
      }
    } else {
      console.log(`🔄 [${reqId}] Suggestions Generation: OpenAI not available, using fallback suggestions`);
      // Use fallback suggestions
      return this.getFallbackSuggestions(intent, reqId);
    }
  }

  private getFallbackSuggestions(intent: any, requestId?: string): string[] {
    const suggestions = [
      "Which ad had the highest CTR last month?",
      "Show me the total spend for Black Friday campaigns",
      "What was our average CPC in June?",
      "Which campaign had the most impressions?"
    ];

    // Add contextual suggestions based on the current query
    if (intent.time_period && intent.time_period !== 'all_time') {
      suggestions.unshift(`What was our best-performing ad in ${intent.time_period}?`);
      suggestions.unshift(`Show me the total spend for ${intent.time_period}`);
    }

    if (intent.campaign) {
      suggestions.unshift(`How did the ${intent.campaign} campaign perform overall?`);
      suggestions.unshift(`What was the average CTR for ${intent.campaign}?`);
    }

    return suggestions.slice(0, 4);
  }

  private generateChartData(data: AdData[], intent: any, requestId?: string): any {
    const reqId = requestId || 'unknown';
    console.log(`📊 [${reqId}] Chart Generation: Starting with ${data.length} records`);
    
    if (data.length === 0) {
      console.log(`❌ [${reqId}] Chart Generation: No data available, returning null`);
      return null;
    }

    // Group by date for time series
    console.log(`📅 [${reqId}] Chart Generation: Grouping data by date`);
    const groupedByDate = data.reduce((acc, ad) => {
      const date = format(parseISO(ad.date), 'MMM dd');
      if (!acc[date]) acc[date] = [];
      acc[date].push(ad);
      return acc;
    }, {} as Record<string, AdData[]>);

    const labels = Object.keys(groupedByDate).sort();
    console.log(`📈 [${reqId}] Chart Generation: Generated ${labels.length} date labels:`, labels);
    
    const impressionsData = labels.map(date => 
      groupedByDate[date].reduce((sum, ad) => sum + ad.impressions, 0)
    );
    const spendData = labels.map(date => 
      groupedByDate[date].reduce((sum, ad) => sum + ad.spend, 0)
    );
    const ctrData = labels.map(date => {
      const dayAds = groupedByDate[date];
      const totalImpressions = dayAds.reduce((sum, ad) => sum + ad.impressions, 0);
      const totalClicks = dayAds.reduce((sum, ad) => sum + ad.clicks, 0);
      return totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    });

    const chartData = {
      labels,
      datasets: [
        {
          label: 'Impressions',
          data: impressionsData,
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          yAxisID: 'y'
        },
        {
          label: 'Spend ($)',
          data: spendData,
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          yAxisID: 'y1'
        },
        {
          label: 'CTR (%)',
          data: ctrData,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          yAxisID: 'y2'
        }
      ]
    };

    console.log(`✅ [${reqId}] Chart Generation: Chart data generated successfully`, {
      labelsCount: labels.length,
      datasetsCount: chartData.datasets.length,
      hasImpressionsData: impressionsData.some(d => d > 0),
      hasSpendData: spendData.some(d => d > 0),
      hasCTRData: ctrData.some(d => d > 0)
    });

    return chartData;
  }
} 