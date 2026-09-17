# ADR-0012: Serving Signed Image URLs as JSON instead of HTTP 302 Redirects

## Status

Accepted (implemented)

## Context

Nook supports private media artifacts (Polaroids) stored securely in Google Cloud Storage (GCS).

To prevent Cloud Run from proxying large image binaries, images are retrieved using short-lived signed URLs. However, the media endpoints require authentication (JWT) and ownership verification to prevent unauthorized users from generating valid URLs.

Initially, `GET /artifacts/:id/image` authenticated the request and issued an HTTP `302 Found` redirect to the signed GCS URL.

In the React frontend, `PolaroidArtifactBody` requested this endpoint using `fetch()` with an `Authorization: Bearer <token>` header and attempted to follow the redirect to create a client-side `Blob` URL.

### The Problem

This approach produced browser CORS failures:
```
Access to fetch at 'https://storage.googleapis.com/...' (redirected from 'https://nook-backend-...run.app/artifacts/57/image')
from origin 'https://nookmy.vercel.app' has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present.
net::ERR_FAILED 200 (OK)
```

**Root Cause**:
1. **Cross-Origin Redirect Tainting (WHATWG Fetch Standard)**: When a browser follows a cross-origin redirect (from `nook-backend-...run.app` to `storage.googleapis.com`), security specifications require the browser to strip original request headers and replace the `Origin` header with `Origin: null` to avoid confused deputy attacks.
2. **CORS Rejection at Storage Layer**: GCS receives `Origin: null`. Because `null` does not match the configured allowed origins (`https://nookmy.vercel.app`), GCS omits the `Access-Control-Allow-Origin` header in the 200 OK response.
3. **Browser Execution Block**: The browser detects a cross-origin response without a matching `Access-Control-Allow-Origin` and blocks the frontend from reading the stream.

---

## Decision

1. The backend endpoint `GET /artifacts/:id/image` returns an HTTP `200 OK` JSON response containing the signed URL:
   ```json
   {
     "url": "https://storage.googleapis.com/nook-media-...?GoogleAccessId=...&Signature=..."
   }
   ```
2. The frontend requests the endpoint via standard authenticated JSON `fetch()`, receives the signed URL, and directly renders it in the DOM:
   ```tsx
   <img src={imageUrl} alt="Saved photo" />
   ```

---

## Consequences

- **Zero CORS friction**: Native `<img>` tags loading public signed URLs do not trigger CORS preflights or cross-origin redirect taint checks.
- **Zero Blob memory overhead**: Eliminates `response.blob()`, `URL.createObjectURL()`, and lifecycle management with `URL.revokeObjectURL()`.
- **Browser-native performance**: Enables progressive streaming, hardware-accelerated decoding, and browser HTTP disk caching.
- **Strict Security**: The backend still enforces JWT authentication and workspace ownership before issuing the short-lived signed URL.
