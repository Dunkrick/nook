import type { ArtifactType } from "../domain/artifacts.js";
import type { PromptEvidence } from "../llm/prompt.js";

export type EvalExpectation = "should-find" | "should-say-no-evidence";

export interface EvalFixture {
    id: string;
    question: string;
    evidence: PromptEvidence[];
    expectation: EvalExpectation;
}

const createdAt = new Date("2026-11-17T09:00:00.000Z");

function evidence(artifactId: number, type: ArtifactType, text: string): PromptEvidence {
    return { artifactId, type, createdAt, text };
}

export const evalFixtures: EvalFixture[] = [
    {
        id: "launch-date",
        question: "When did we ship the mobile onboarding update?",
        evidence: [evidence(401, "TEXT", "Release note: Mobile onboarding update shipped on 2026-11-17.")],
        expectation: "should-find",
    },
    {
        id: "staging-deploy",
        question: "Did the staging deployment finish?",
        evidence: [evidence(402, "TEXT", "Staging deployment completed on 2026-11-16 after smoke checks passed.")],
        expectation: "should-find",
    },
    {
        id: "open-webhook-issue",
        question: "What is unfinished about webhook delivery?",
        evidence: [evidence(403, "GITHUB_ISSUE", "nook/api issue #83. Title: Add retry to webhook processor. State: open. Body: Retry failed delivery with backoff.")],
        expectation: "should-find",
    },
    {
        id: "spacing-token",
        question: "What spacing token should cards use?",
        evidence: [evidence(404, "TEXT", "Design note: The card spacing token is --space-4, which equals 16px.")],
        expectation: "should-find",
    },
    {
        id: "preview-link",
        question: "Where can I preview the board cleanup branch?",
        evidence: [evidence(405, "LINK", "https://preview.nook.test/branch/board-cleanup")],
        expectation: "should-find",
    },
    {
        id: "closed-issue",
        question: "What happened to the dark mode issue?",
        evidence: [evidence(406, "GITHUB_ISSUE", "nook/web issue #91. Title: Add dark mode. State: closed. Body: Closed after the color token update shipped.")],
        expectation: "should-find",
    },
    {
        id: "team-follow-up",
        question: "Who needs to sync on mobile and backend work?",
        evidence: [evidence(407, "POLAROID", "Whiteboard caption: Priya to sync mobile with backend team on Nov 20.")],
        expectation: "should-find",
    },
    {
        id: "rollback-plan",
        question: "What is the rollback plan for the release?",
        evidence: [
            evidence(408, "TEXT", "Release checklist: Keep previous container revision available for rollback."),
            evidence(409, "GITHUB_ISSUE", "nook/ops issue #12. Title: Verify rollback drill. State: open. Body: Restore previous revision if health checks fail."),
        ],
        expectation: "should-find",
    },
    {
        id: "catering-menu",
        question: "What was the lunch catering menu?",
        evidence: [],
        expectation: "should-say-no-evidence",
    },
    {
        id: "mars-mission",
        question: "What was the final outcome of the Mars mission?",
        evidence: [],
        expectation: "should-say-no-evidence",
    },
];
