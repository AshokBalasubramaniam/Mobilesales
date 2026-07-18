import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "./Button";

export interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

const classes = {
  container:
    "flex min-h-screen flex-col items-center justify-center gap-3 px-4 text-center",
  icon: "size-10 text-red-500",
  title: "text-lg font-semibold",
  description: "max-w-sm text-sm text-gray-500",
  button: "mt-2",
};

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("Uncaught error in component tree", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className={classes.container}>
          <AlertTriangle className={classes.icon} />
          <h1 className={classes.title}>Something went wrong</h1>
          <p className={classes.description}>
            An unexpected error occurred. Try reloading the page — if it
            keeps happening, please let us know what you were doing.
          </p>
          <Button
            className={classes.button}
            onClick={() => window.location.reload()}
          >
            Reload page
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
