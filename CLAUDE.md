# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Skill Sprint CIC** is an interactive Business Model Canvas application for a Community Interest Company focused on youth employment. The project is a single-page web application built with vanilla JavaScript, HTML, and CSS that enables real-time editing of business model canvas content with persistence and GitHub publishing capabilities.xx

## Architecture

### Single-Page Application Structure

This is a self-contained HTML file (`index.html`) with embedded CSS and JavaScript. There are two versions:

- **index.html** - Modern design with black/white minimalist aesthetic, password protection, and GitHub publishing
- **skill_sprint_traditional_canvas.html** - Original colorful gradient design without authentication

### Key Architectural Components

1. **State Management**: Uses browser `localStorage` for client-side persistence
   - Canvas data stored as JSON in `localStorage` key: `skillSprintCanvas`
   - GitHub configuration stored separately: `githubToken`, `githubUsername`, `githubRepo`
   - Authentication state in `sessionStorage`: `skillSprintAuth`

2. **Authentication System**:
   - Password: "jobshapedobject" (SHA-256 hash stored in code)
   - Session-based authentication (persists during browser session)
   - Password required for edit mode; view-only mode available without authentication

3. **GitHub Integration**:
   - Direct GitHub API integration for publishing changes
   - Updates `index.html` file via GitHub Contents API
   - Requires personal access token with "Contents: Read and write" permission
   - Auto-saves to GitHub with timestamped commit messages

4. **Canvas Data Structure**:
   ```javascript
   {
     header: {title, subtitle},
     intro: {title, description, footer},
     canvasTitle: {title, subtitle},
     missionCards: [{title, description}, ...],
     [sectionId]: [{title, description}, ...]
   }
   ```

### Business Model Canvas Sections

The canvas follows the standard Business Model Canvas format with 9 sections:
- Key Partners, Key Activities, Value Propositions (center), Customer Relationships, Customer Segments
- Key Resources, Channels
- Cost Structure, Revenue Streams

Each section uses CSS Grid positioning to match the traditional canvas layout.

## Development Workflow

### Local Development

Simply open `index.html` in a browser - no build process required. The application works entirely client-side.

### Testing Changes

1. Open `index.html` in browser
2. Enter password "jobshapedobject" to enable edit mode
3. Make changes through the UI
4. Changes auto-save to browser localStorage
5. Use "Save & Publish to GitHub" to deploy (requires GitHub configuration)

### GitHub Publishing

The app can publish itself to GitHub Pages:
1. Configure GitHub settings via sidebar (⚙️ button)
2. Enter: username, repository name, personal access token
3. Click "Save & Publish to GitHub" to deploy changes
4. Changes go live on GitHub Pages within 1-2 minutes

### Making Code Changes

When editing the HTML/CSS/JavaScript directly:

1. **CSS Changes**: Styles are in `<style>` tag (lines 34-919 in index.html)
   - Modern version uses black/white color scheme
   - Traditional version uses purple/gradient scheme

2. **JavaScript Changes**: Code is in `<script>` tag (lines 1358-2301 in index.html)
   - Key functions: `saveCanvasData()`, `loadCanvasData()`, `saveAndPublishToGitHub()`
   - Authentication functions: `validatePassword()`, `lockEditMode()`, `unlockEditMode()`

3. **Content Changes**: Can be done via UI or directly in HTML
   - Initial content is in HTML structure (lines 922-1125)
   - UI changes override and persist to localStorage

## Important Implementation Details

### Password Protection
- Password hash: `1feb5334d184e393d997e5cd92951f013b1d8ceffce37e329419586b86fe400d`
- Uses SHA-256 hashing for comparison
- To change password: update `CORRECT_PASSWORD_HASH` constant with new SHA-256 hash

### GitHub API Implementation
- File updates require SHA of current file (obtained via GET request)
- Content must be base64 encoded before sending
- Uses `PUT` method to update existing files
- 30-second timeout protection on publish operations

### Responsive Design
- Desktop: Full 5-column grid layout
- Tablet (< 1200px): Smaller font sizes, adjusted padding
- Mobile (< 900px): 2-column grid with reorganized sections
- Mobile (< 600px): Further size reductions

### Data Persistence Strategy
- Primary: Browser localStorage (instant, local-only)
- Secondary: GitHub repository (requires manual publish, globally accessible)
- No backend database - fully client-side application

## Common Tasks

### Add New Canvas Section
1. Add HTML structure in `business-model-canvas` grid
2. Add CSS grid positioning rules
3. Update `saveCanvasData()` and `loadCanvasData()` functions
4. Add section header with icon and title

### Modify Color Scheme
- Main gradient: Search for `#667eea` and `#764ba2` (modern version uses black/white)
- Section colors: Modify `.section-header` border-bottom-color rules
- Content items: Modify `.content-item` background gradients

### Change Password
1. Generate SHA-256 hash of new password
2. Update `CORRECT_PASSWORD_HASH` constant
3. Document new password securely

### Add New GitHub Publishing Features
- Main function: `saveAndPublishToGitHub()` (lines 1572-1632)
- GitHub API helpers: `updateGitHubFile()`, `getFileSHA()`
- Consider rate limits (60 requests/hour unauthenticated, 5000/hour authenticated)

## File Locations

- Main application: `index.html`
- Alternative version: `skill_sprint_traditional_canvas.html`
- Documentation: `README.md`
- License: `LICENSE` (MIT)

## GitHub Pages Deployment

The repository is configured for GitHub Pages deployment. When changes are published:
1. The `index.html` file is updated in the repository
2. GitHub Pages automatically rebuilds within 1-2 minutes
3. Changes appear at the configured GitHub Pages URL

No separate build or deployment pipeline is required.
