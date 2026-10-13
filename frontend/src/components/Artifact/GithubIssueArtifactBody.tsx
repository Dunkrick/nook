import type { GithubIssueArtifact } from "../../types/artifacts";

interface GithubIssueArtifactBodyProps {
    content: GithubIssueArtifact["content"];
}

export default function GithubIssueArtifactBody({
    content,
}: GithubIssueArtifactBodyProps) {
    return (
        <article className="nook-github-issue">
            <div className="nook-github-issue__meta">
                <span>{content.repository}#{content.issueNumber}</span>
                <span
                    className={`nook-github-issue__status nook-github-issue__status--${content.state}`}
                >
                    {content.state}
                </span>
            </div>

            <a
                className="nook-github-issue__title"
                href={content.url}
                target="_blank"
                rel="noopener noreferrer"
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => event.stopPropagation()}
            >
                {content.title}
            </a>

            {content.body && (
                <p className="nook-github-issue__body">{content.body}</p>
            )}

            <span className="nook-github-issue__author">
                Opened by {content.author}
            </span>
        </article>
    );
}