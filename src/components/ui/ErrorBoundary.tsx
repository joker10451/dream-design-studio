import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "./button";
import { logger } from "@/lib/logger";

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        logger.error("Uncaught error:", error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: undefined });
        window.location.href = "/";
    };

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center space-y-4">
                    <div className="bg-destructive/10 p-3 rounded-full">
                        <AlertTriangle className="h-10 w-10 text-destructive" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight">Упс! Что-то пошло не так.</h2>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        Произошла непредвиденная ошибка. Мы уже работаем над её исправлением.
                    </p>
                    {this.state.error && (
                        <pre className="mt-4 p-4 bg-muted rounded-lg text-xs overflow-auto max-w-full text-left">
                            {this.state.error.toString()}
                        </pre>
                    )}
                    <div className="flex gap-4 mt-6">
                        <Button onClick={() => window.location.reload()}>Попробовать снова</Button>
                        <Button variant="outline" onClick={this.handleReset}>
                            На главную
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
