import "../assets/nook-tokens.css";

export default function EmptyWorkspace() {
    return (
    <div style={{ 
          top: "50%", 
          left: "50%", 
          transform: "translate(-50%, -50%)", 
          textAlign: "center",
          color: "var(--nook-text-primary)",
          opacity: 0.6
        }}>
          <div style={{
            width: "260px",
            height: "140px",
            border: "2px dashed var(--nook-color-charcoal)",
            borderRadius: "var(--nook-radius-xl)",
            margin: "0 auto var(--nook-space-4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.4
          }}>
            <span style={{ fontSize: "24px" }}>[]</span>
          </div>
          <p style={{ fontSize: "var(--nook-text-h3)", fontWeight: "var(--nook-weight-medium)", margin: 0 }}>
            Double-click anywhere to begin.
          </p>
          <p style={{ marginTop: "var(--nook-space-2)" }}>
            Capture ideas, plans, reminders, or anything worth remembering.
          </p>
        </div>
    );
};