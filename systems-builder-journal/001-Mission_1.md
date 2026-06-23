# Mission 1 — The Journey of a Request

## Question

What happens when a browser talks to a server?

---

## My Initial Hypothesis

Requests probably stay in memory until they are processed.

Processing thousands simultaneously is expensive.

---

## What I Learned

- A runtime is simply an environment that understands and executes your code.
- The Mental Model
              Your Code
                  │
                  ▼
            JavaScript Engine
            (V8 - from Chrome)
                  │
                  ▼
            Node.js Runtime
      (APIs + Modules + Event Loop)
                  │
                  ▼
           Operating System
                  │
                  ▼
            Your Computer

- Node programs are powerful, power always comes with responsibility.
- A server is simply a program that stays alive waiting for requests.
-               Internet

                   │

                   ▼

┌───────────────────────────────────┐

           Your Computer

───────────────────────────────────

            Browser

                │

            HTTP Request

                │

──────── Port 3000 ────────

                │

            Node Server

            │

        Your JavaScript

            │

        HTTP Response

            │

         Browser

└───────────────────────────────────┘ 

---

## Remaining Questions

Who stores waiting requests?

How does Node know which request to process next?

How does the browser know where to send the request?