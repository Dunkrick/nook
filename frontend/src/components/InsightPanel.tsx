import { useState, type FormEvent } from "react";
import { askWorkspace, type AskWorkspaceResponse } from "../services/workspaces";
import type { Artifact } from "../types/artifacts";
import { useCanvasCamera } from "../hooks/useCanvasCamera";
import { toRenderPosition } from "../lib/workspace";

interface InsightPanelProps {
    workspaceId: number;
    selectedCount: number;
    artifacts: Artifact[];
    onClose: () => void;
    onEvidenceClick: (artifactId: number) => void;
}

export default function InsightPanel({
    workspaceId,
    selectedCount,
    artifacts,
    onClose,
    onEvidenceClick,
}: InsightPanelProps) {
    const camera = useCanvasCamera();
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState<AskWorkspaceResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const trimmedQuestion = question.trim();
        if (!trimmedQuestion || selectedCount === 0 || isLoading) return;

        setIsLoading(true);
        setError(null);
        setAnswer(null);
        try {
            setAnswer(await askWorkspace(workspaceId, trimmedQuestion));
        } catch (requestError) {
            setError(requestError instanceof Error ? requestError.message : "Could not get an answer. Try again.");
        } finally {
            setIsLoading(false);
        }
    }

    function goToEvidence(artifactId: number) {
        const artifact = artifacts.find((item) => item.id === artifactId);
        if (!artifact) return;

        camera.centerOn(
            toRenderPosition({ x: artifact.x, y: artifact.y }),
            { width: window.innerWidth, height: window.innerHeight },
        );
        onEvidenceClick(artifactId);
    }

    return (
        <aside className="nook-insight-panel" aria-label="Ask your workspace">
            <header className="nook-insight-panel__header">
                <div>
                    <span className="nook-insight-panel__eyebrow">Workspace question</span>
                    <h2>Ask your workspace</h2>
                </div>
                <button type="button" className="nook-button nook-button--quiet" onClick={onClose}>
                    Close
                </button>
            </header>

            <p className="nook-insight-panel__working-hint">
                Ask about {selectedCount} selected artifact{selectedCount === 1 ? "" : "s"}. The answer uses workspace evidence.
            </p>

            <form className="nook-ask-form" onSubmit={handleSubmit}>
                <label htmlFor="nook-ask-question">Your question</label>
                <textarea
                    id="nook-ask-question"
                    value={question}
                    onChange={(event) => setQuestion(event.target.value)}
                    maxLength={300}
                    rows={3}
                    placeholder="What did I decide about the launch?"
                    required
                />
                <button type="submit" className="nook-button" disabled={!question.trim() || isLoading || selectedCount === 0}>
                    {isLoading ? "Asking…" : "Ask"}
                </button>
            </form>

            {isLoading && <p role="status" className="nook-ask-status">Searching workspace evidence…</p>}
            {error && <p role="alert" className="nook-ask-error">{error}</p>}
            {!isLoading && !error && !answer && (
                <p className="nook-ask-status">Ask a question to see an answer and its evidence.</p>
            )}
            {answer && (
                <div className="nook-ask-result" aria-live="polite">
                    <section>
                        <h3>Answer</h3>
                        <p>{answer.answer}</p>
                    </section>
                    {answer.keyPoints.length > 0 && (
                        <section>
                            <h3>Key points</h3>
                            <ul>{answer.keyPoints.map((point, index) => (
                                <li key={`${point.title}-${index}`}><strong>{point.title}</strong>: {point.summary}</li>
                            ))}</ul>
                        </section>
                    )}
                    {answer.evidence.length > 0 && (
                        <section>
                            <h3>Evidence</h3>
                            <ul>{answer.evidence.map((item) => {
                                const artifact = artifacts.find((candidate) => candidate.id === item.artifactId);
                                return (
                                    <li key={item.artifactId}>
                                        <button type="button" className="nook-ask-evidence" onClick={() => goToEvidence(item.artifactId)} disabled={!artifact}>
                                            Artifact {item.artifactId}
                                        </button>
                                        <span>{item.reason}</span>
                                    </li>
                                );
                            })}</ul>
                        </section>
                    )}
                    {answer.unresolvedItems.length > 0 && (
                        <section>
                            <h3>Unresolved</h3>
                            <ul>{answer.unresolvedItems.map((item) => <li key={item}>{item}</li>)}</ul>
                        </section>
                    )}
                </div>
            )}
        </aside>
    );
}
