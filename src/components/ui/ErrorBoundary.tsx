import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Home, RefreshCw, AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReload = () => {
        window.location.reload();
    };

    private handleHome = () => {
        window.location.href = '/';
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-[50vh] p-4">
                    <Card className="w-full max-w-md border-red-200 bg-red-50/50 backdrop-blur-sm shadow-xl">
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 bg-red-100 p-3 rounded-full w-fit">
                                <AlertTriangle className="h-8 w-8 text-red-600" />
                            </div>
                            <CardTitle className="text-2xl text-red-800">Oops, une erreur est survenue !</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            <p className="text-gray-600">
                                L'application a rencontré un problème inattendu. Nous avons enregistré l'erreur.
                            </p>
                            {this.state.error && (
                                <div className="bg-white/50 p-2 rounded text-xs font-mono text-red-500 overflow-auto max-h-32 text-left">
                                    {this.state.error.message}
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-center gap-4">
                            <Button onClick={this.handleHome} variant="outline" className="gap-2">
                                <Home className="h-4 w-4" />
                                Accueil
                            </Button>
                            <Button onClick={this.handleReload} variant="default" className="gap-2 bg-red-600 hover:bg-red-700">
                                <RefreshCw className="h-4 w-4" />
                                Recharger
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
