# Nook System Architecture

This document maps out the architecture and design patterns of the Nook digital workspace, detailing how requests move through the stack and describing layer responsibilities.

---

## Layered Architecture Pattern

Nook follows a strict unidirectional, layered pattern dividing concerns between browser client layout management and backend data persistence.

```mermaid
graph TD
    subgraph BrowserClient [Browser Client]
        ApplicationLayer[Application Layer: Home.tsx]
        CompositionLayer[Composition Layer: Wall.tsx]
        PresentationLayer[Presentation Layer: Card.tsx & DraftCard.tsx]
        
        ApplicationLayer --> |Orchestrates State| CompositionLayer
        CompositionLayer --> |Coordinates Render| PresentationLayer
    end

    subgraph BackendService [Backend Service]
        NetworkAPI[Network API: Express routes]
        PrismaORM[Prisma ORM & PostgreSQL]
        
        PresentationLayer --> |HTTP Requests| NetworkAPI
        NetworkAPI --> |Persistence Queries| PrismaORM
    end
```

---

## Architectural Layers

### 1. Application Layer (`Home.tsx`)
* **Role**: Primary controller and coordinator of the screen's main page.
* **Responsibilities**:
  * Owns the core state hooks for the list of persisted notes (`cards`) and transient overlay drafts (`draftCard`).
  * Initiates initial database queries upon component mount (`useEffect`).
  * Integrates with Auth service wrappers to manage cookie/token deletion on logout.
  * Implements action-callbacks (`handleUpdateCard`, `handleDeleteCard`, `handleCommitDraft`) that translate client events into network requests.

### 2. Composition Layer (`Wall.tsx`)
* **Role**: Layout Orchestrator (Canvas Container).
* **Responsibilities**:
  * Defines the absolute coordinate grid space (representing the digital wall).
  * Captures mouse double-clicks on the blank wall to determine relative positioning coordinates:
    ```typescript
    x: e.clientX - rect.left
    y: e.clientY - rect.top
    ```
  * Iterates and maps over active cards and conditional draft overlays.
  * Directs clean callback signals up to the Application controller while isolating sub-components.

### 3. Presentation Layer (`Card.tsx` & `DraftCard.tsx`)
* **Role**: Pure UI elements (Visual block notes).
* **Responsibilities**:
  * **`Card.tsx`**: Renders text values and edit-mode input fields. Manages pointer capturing hooks (`setPointerCapture`) and state variables representing active drag-and-drop displacements (`dragOffset`).
  * **`DraftCard.tsx`**: Displays absolute text areas, forces cursor focus, and watches keyboard events (`Enter` and `Escape`) to commit or close drafts.
  * Implements `e.stopPropagation()` on double clicks to ensure that interacting with note actions doesn't trigger new drafts on the parent canvas.

### 4. Network API Layer (`services/` & Express routes)
* **Role**: Backend controller and route handler.
* **Responsibilities**:
  * **Frontend Services**: Wrapper classes utilizing `fetch` to build JSON request payloads and append token authorizations.
  * **Express Router**: Mounts authentication validation filters and processes payloads into service controllers.

### 5. Persistence Layer (`Prisma` & `PostgreSQL`)
* **Role**: Database controller.
* **Responsibilities**:
  * **Prisma**: Maps JavaScript structures to type-safe database queries.
  * **PostgreSQL**: Stores cards schema (user references, text content, coordinate points, and generation timestamps).

---

## Interaction Lifecycles

### 1. Creating a Note (Wall-First Flow)

```mermaid
sequenceDiagram
    actor User
    participant Wall as Wall.tsx
    participant Home as Home.tsx
    participant Backend as Express Route
    participant DB as Postgres (via Prisma)

    User->>Wall: Double-Click on Canvas
    Wall->>Home: onCreate(Position)
    Home->>Home: setDraftCard(x, y)
    Note over Wall: Renders DraftCard at position
    User->>Wall: Types text and presses Enter
    Wall->>Home: onCommitDraft(text)
    Home->>Backend: POST /cards { text, x, y }
    Backend->>DB: create(card data)
    DB-->>Backend: Return Card Record
    Backend-->>Home: Return Card Record
    Home->>Home: setCards([...current, savedCard])
    Home->>Home: setDraftCard(null)
    Note over Wall: Renders saved CardComponent
```

### 2. Moving a Note (Drag and Drop Flow)

```mermaid
sequenceDiagram
    actor User
    participant Card as Card.tsx
    participant Home as Home.tsx
    participant Backend as Express Route

    User->>Card: Pointer Down
    Card->>Card: setPointerCapture()
    User->>Card: Pointer Move
    Card->>Card: Update dragOffset (visual update)
    User->>Card: Pointer Up
    Card->>Card: releasePointerCapture()
    Card->>Home: onUpdate(id, { x, y })
    Home->>Backend: PATCH /cards/:id { x, y }
    Note over Card: Reset offset coordinates to 0,0
```
