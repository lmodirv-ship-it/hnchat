'use client';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { trackError } from '@/lib/analytics';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

async function logErrorToSupabase(error: Error, componentStack?: string | null) {
  try {
    await fetch('/api/error-logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        error_type: error.name || 'RuntimeError',
        message: error.message || 'Unknown error',
        path: typeof window !== 'undefined' ? window.location.pathname : undefined,
        stack: componentStack ?? error.stack ?? undefined,
        severity: 'critical',
        metadata: { source: 'ErrorBoundary' },
      }),
    });
  } catch {
    // Silently fail — don't crash the error handler
  }
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    trackError(error.name, error.message, errorInfo.componentStack ?? undefined);
    console.error('[ErrorBoundary]', error, errorInfo);
    logErrorToSupabase(error, errorInfo.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-white mb-2">حدث خطأ غير متوقع</h1>
            <p className="text-gray-400 mb-6 text-sm">
              {this.state.error?.message || 'Something went wrong. Please try again.'}
            </p>
            <button
              onClick={this.handleReset}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => window.location.href = '/home-feed'}
              className="ml-3 bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
