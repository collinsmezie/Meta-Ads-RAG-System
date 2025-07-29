import { NextRequest, NextResponse } from 'next/server';
import { RAGService } from '../../../services/ragService';

export async function POST(request: NextRequest) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();
  
  console.log(`🚀 [${requestId}] RAG API Request Started`);
  console.log(`📝 [${requestId}] Request Details:`, {
    method: 'POST',
    url: request.url,
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get('user-agent'),
    contentType: request.headers.get('content-type')
  });

  try {
    const { query } = await request.json();
    
    console.log(`📋 [${requestId}] Received Query: "${query}"`);
    
    if (!query || typeof query !== 'string') {
      console.error(`❌ [${requestId}] Invalid Query:`, { query, type: typeof query });
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    console.log(`🔧 [${requestId}] Initializing RAG Service`);
    const ragService = new RAGService();
    
    console.log(`⚡ [${requestId}] Processing Query with RAG Service`);
    const result = await ragService.processQuery(query, requestId);

    const processingTime = Date.now() - startTime;
    console.log(`✅ [${requestId}] RAG Processing Complete`, {
      processingTimeMs: processingTime,
      resultKeys: Object.keys(result),
      hasAnswer: !!result.answer,
      hasData: !!result.data,
      dataCount: result.data?.length || 0,
      hasChartData: !!result.chartData,
      hasSuggestions: !!result.suggestions,
      suggestionsCount: result.suggestions?.length || 0
    });

    return NextResponse.json(result);
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(`💥 [${requestId}] RAG API Error:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      processingTimeMs: processingTime
    });
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 