import { Component, ErrorInfo, ReactNode } from 'react'; //ErrorInfo → extra information about where the error happened

interface Props {
  children: ReactNode;
  fallback?: ReactNode;//optional UI shown when an error happens
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);//Runs after the error is caught Used for:logging
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 text-red-600">
          <h2>Something went wrong.</h2>
          {this.state.error?.message && (
            <p className="text-sm text-gray-600">{this.state.error.message}</p>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
