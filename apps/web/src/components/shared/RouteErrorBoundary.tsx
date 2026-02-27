import { Component, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

type Props = { children: ReactNode }
type InnerProps = Props & { locationKey: string }
type State = { hasError: boolean }

class ErrorBoundaryInner extends Component<InnerProps, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidUpdate(prevProps: InnerProps): void {
    if (this.state.hasError && prevProps.locationKey !== this.props.locationKey) {
      this.setState({ hasError: false })
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 text-surface-400">
          <p className="font-title-sm">Something went wrong loading this page.</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-md bg-ember-500 px-4 py-2 text-body-sm text-white hover:bg-ember-600 transition-colors"
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

export function RouteErrorBoundary({ children }: Props) {
  const location = useLocation()
  return <ErrorBoundaryInner locationKey={location.key}>{children}</ErrorBoundaryInner>
}
