import { Component, type ReactNode } from 'react'

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
    error: Error | null
    errorInfo: { componentStack: string } | null
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
        console.error('ErrorBoundary caught:', error, errorInfo)
        this.setState({ errorInfo })
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-6 m-4">
                    <div className="card border-[hsl(var(--destructive))] bg-[hsl(var(--destructive)/0.05)] p-6">
                        <h2 className="font-cinzel text-lg font-bold text-[hsl(var(--destructive))] mb-4">
                            Erreur
                        </h2>
                        <p className="text-ink mb-3 font-mono text-sm whitespace-pre-wrap">
                            {this.state.error?.message}
                        </p>
                        <details className="mt-4">
                            <summary className="cursor-pointer font-semibold text-ink-muted text-sm hover:text-ink">
                                Stack trace
                            </summary>
                            <pre className="text-xs overflow-auto max-h-[300px] bg-muted p-3 rounded-lg mt-2 font-mono whitespace-pre-wrap">
                                {this.state.error?.stack}
                            </pre>
                        </details>
                        <details className="mt-3">
                            <summary className="cursor-pointer font-semibold text-ink-muted text-sm hover:text-ink">
                                Component stack
                            </summary>
                            <pre className="text-xs overflow-auto max-h-[300px] bg-muted p-3 rounded-lg mt-2 font-mono whitespace-pre-wrap">
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </details>
                        <button
                            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                            className="btn btn-primary mt-5"
                        >
                            Réessayer
                        </button>
                    </div>
                </div>
            )
        }
        return this.props.children
    }
}
