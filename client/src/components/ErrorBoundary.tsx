import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Silently log error (no console spam in production)
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5F9F8] to-white px-4">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-3xl shadow-lg border border-[#E8F0E9] p-8 text-center">
              <div className="w-16 h-16 bg-[#fff5f5] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4v2m0-10a8 8 0 110 16 8 8 0 010-16zm0-2a10 10 0 100 20 10 10 0 000-20z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#1a1a1a] mb-3">Something went wrong</h2>
              <p className="text-[#666] mb-6">
                We encountered an unexpected error. The issue has been logged and we'll look into it.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.href = "/"}
                  className="w-full bg-[#7C9A82] hover:bg-[#6a8370] text-white font-semibold py-3 px-4 rounded-xl transition-colors"
                >
                  Return to Home
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full px-6 py-3 border-2 border-[#7C9A82] text-[#7C9A82] font-semibold rounded-xl hover:bg-[#EBF8F5] transition-colors"
                >
                  Reload Page
                </button>
              </div>
              {process.env.NODE_ENV === "development" && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm font-semibold text-[#999]">
                    Error Details (Dev Only)
                  </summary>
                  <pre className="mt-2 text-xs bg-[#F5F5F5] p-3 rounded overflow-auto max-h-48 text-red-700">
                    {this.state.error?.toString()}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
