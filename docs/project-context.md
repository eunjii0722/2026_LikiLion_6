# Project Context

## Current Branch

- `product-mvp-workflow`

## Goal

Build one product-like MVP instead of a mixed demo.

The app is now focused on a single flow:

`Google Form response -> Google Sheets row saved -> Gmail confirmation email sent -> automation activated`

## What Was Cleaned Up

- Removed the `/demo` route from the app router.
- Deleted the demo-only screens under `src/app/components/demo/`.
- Removed mixed scenarios like KakaoTalk, Naver reservations, Instagram DMs, and order tracking from the visible product flow.
- Unified the main screens around the Google Forms + Sheets + Gmail flow.
- Added a local product store for MVP state and sample runs.
- Switched to a dedicated `localStorage` key so old mixed data does not bleed into the new MVP.

## Key Files

- `src/app/productStore.ts`
- `src/app/components/HomeScreen.tsx`
- `src/app/components/InputScreen.tsx`
- `src/app/components/AnalysisScreen.tsx`
- `src/app/components/WorkflowScreen.tsx`
- `src/app/components/TestResultScreen.tsx`
- `src/app/routes.tsx`
- `src/app/components/Layout.tsx`

## Current Behavior

- Home screen presents the MVP as one clear product flow.
- Input screen accepts a form automation prompt and falls back to a local parser if the backend parse call fails.
- Workflow screen creates a local workflow, attempts the backend create call, and records a test run.
- Result screen reads the saved workflow and shows the test run state.
- Home screen shows saved automations and active state from local storage.

## Verification

- `npm run build` passes.

## Notes

- The backend integration still exists in `src/api.ts`, but the MVP no longer depends on the demo flow.
- The app should stay centered on one product story unless the user explicitly asks for more scenarios.
