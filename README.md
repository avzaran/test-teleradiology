# Teleradiology Portal

This example project provides a simple demonstration of a patient portal for uploading MRI images and receiving second opinions.

## Structure

- `server/` – Express backend with file upload endpoints
- `client/` – React front‑end built with Vite

## Running

1. Install dependencies for both server and client:
   ```bash
   (cd server && npm install)
   (cd client && npm install)
   ```
2. Start the server:
   ```bash
   npm --prefix server start
   ```
3. Start the client in another terminal:
   ```bash
   npm --prefix client run dev
   ```

The React app will be available at `http://localhost:5173` and will communicate with the server on port `3001`.
