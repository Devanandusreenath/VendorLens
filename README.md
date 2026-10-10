# VendorLens
## AI-Powered Supplier Discovery & Claim Investigation

VendorLens is an AI-assisted supplier research and investigation platform designed to help users discover potential suppliers, investigate business claims, and organize evidence for further verification.

The platform combines supplier search capabilities with optional semantic claim analysis to help users examine information systematically. Search results and AI-generated assessments are treated as research aids, not as proof that a supplier or claim is legitimate.

**Project Status:** MVP / Active Development

---

## 1. Project Overview

Finding and evaluating suppliers can involve searching multiple sources, reviewing company information, checking business claims, and comparing available evidence.

VendorLens aims to streamline this workflow by providing a single platform for supplier discovery and claim investigation.

The application can use SerpApi for live search and optionally use the Gemini API for semantic claim analysis, depending on the implemented backend functionality and available API credentials.

### Main objectives

- Discover potential suppliers using online search.
- Organize supplier information for investigation.
- Break an investigation into individual claims.
- Support AI-assisted semantic analysis of claims.
- Help users identify information that requires further verification.
- Reduce repetitive manual research.
- Maintain a clear distinction between search evidence and verified facts.

---

## 2. Key Features

### 2.1 Supplier Discovery

VendorLens uses SerpApi to search for potential suppliers when the integration is configured.

Potential capabilities include:

- Search for suppliers by product or service.
- Discover candidate companies.
- Retrieve available search results.
- Review source links and snippets.
- Organize results for further investigation.

**Requirement:** A valid SerpApi API key is needed for live supplier searches.

Search results may be incomplete, outdated, misleading, or unrelated. A search result alone does not verify a supplier's identity, legitimacy, quality, or business claims.

### 2.2 Claim Investigation

VendorLens is designed to help investigate claims associated with suppliers or businesses.

An investigation may contain multiple claims, with the backend configured to allow up to 15 claims per investigation.

Potential examples include:

- A company claims to manufacture a particular product.
- A supplier claims to operate from a particular location.
- A business claims to hold a particular certification.
- A supplier claims to have a specific manufacturing capacity.
- A company claims to serve particular markets.

These are examples of investigation topics, not claims about any actual supplier.

### 2.3 AI-Assisted Semantic Analysis

The backend can optionally use Gemini for semantic claim analysis.

Configured model:

`gemini-3.1-flash-lite`

The purpose of semantic analysis is to help interpret claim wording and relevant information. AI-generated assessments should be treated as preliminary analysis rather than independent verification.

A model response does not replace authoritative documentation, direct supplier confirmation, or independent checks.

### 2.4 Evidence-Oriented Research

VendorLens aims to support structured research using information returned by search providers and other configured sources.

Useful evidence-handling practices include:

- Preserving the source URL.
- Recording the retrieved information.
- Separating a supplier's own statements from independent evidence.
- Identifying missing information.
- Highlighting contradictory information for human review.
- Avoiding unsupported conclusions.

The exact evidence storage and verification workflow depend on the current backend implementation.

### 2.5 Investigation Limits

The backend configuration includes a maximum of 15 claims per investigation.

```env
MAX_CLAIMS_PER_INVESTIGATION=15
```

The backend must explicitly read and enforce this setting for the limit to take effect.

---

## 3. Technology Stack

| Component | Technology |
|---|---|
| Frontend | Existing project frontend; commonly React and TypeScript in this setup |
| Frontend development server | Vite, where configured |
| Backend | Python API backend, according to the project implementation |
| Supplier search | SerpApi |
| Optional semantic analysis | Google Gemini API |
| Database | SQLite, based on the configured database filename |
| API communication | HTTP/REST, where implemented |
| Configuration | Environment variables in `.env` |

The exact framework versions, backend entry point, endpoint paths, and frontend libraries should be confirmed from the current repository files. Do not assume that an optional feature is working merely because its environment variable exists.

---

## 4. Project Architecture

The intended high-level architecture is:

```text
┌────────────────────────────────────┐
│           Frontend UI              │
│                                    │
│ Supplier Search                    │
│ Investigation Management           │
│ Claim Review                        │
│ Evidence Presentation              │
└──────────────────┬─────────────────┘
                   │
                   │ HTTP / REST API
                   ▼
┌────────────────────────────────────┐
│           Backend API              │
│                                    │
│ Request Validation                 │
│ Investigation Workflow             │
│ Supplier Search Integration        │
│ Optional Semantic Analysis         │
│ Database Operations                │
└──────────┬────────────────┬────────┘
           │                │
           ▼                ▼
┌──────────────────┐  ┌──────────────────┐
│     SerpApi      │  │   Gemini API     │
│ Supplier Search  │  │ Optional Claim   │
│                  │  │ Analysis         │
└──────────────────┘  └──────────────────┘
           │
           ▼
┌────────────────────────────────────┐
│          SQLite Database           │
│                                    │
│ Investigation Data                 │
│ Stored Application Records         │
└────────────────────────────────────┘
```

This diagram illustrates the intended integrations. The exact database tables, API routes, and workflow stages depend on the actual source code.

---

## 5. Folder Structure

A typical organization for this project may look like the following:

```text
VendorLens/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.local
│
├── backend/
│   ├── app/
│   ├── requirements.txt
│   └── .env
│
├── .gitignore
└── README.md
```

Your actual repository may use different names or have the frontend and backend in separate directories.

### Important files

- `README.md`: Project documentation.
- `package.json`: Frontend dependencies and scripts, if the frontend uses Node.js.
- `requirements.txt`: Backend Python dependencies, if present.
- `.env`: Backend environment configuration.
- `.env.local`: Optional frontend environment configuration.
- `vendorlens.db`: Local SQLite database file, based on the configured database path.

Keep `.env` and `.env.local` out of version control.

---

## 6. Prerequisites

Before running VendorLens, check whether the following are installed and available:

- Python, if the backend uses Python.
- Node.js and npm, if the frontend uses Node.js.
- Git, if you are cloning or managing the repository.
- A valid SerpApi API key for live supplier search.
- A valid Gemini API key if semantic claim analysis is enabled.

Check Python:

```bat
python --version
```

Check Node.js:

```bat
node --version
```

Check npm:

```bat
npm --version
```

If the project uses different frameworks or commands, follow the instructions in the repository's existing dependency and configuration files.

---

## 7. Backend Environment Configuration

Create a file named `.env` in the backend root directory.

For example:

```text
VendorLens/
└── backend/
    ├── app/
    ├── requirements.txt
    └── .env
```

Use this exact configuration:

```env
# Required for live supplier searches. Add your own key from https://serpapi.com/
SERPAPI_API_KEY=

# Optional semantic claim analysis. Keep keys server-side only.
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.1-flash-lite

# Local frontend origins; regex allows other localhost development ports.
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173
CORS_ORIGIN_REGEX=^https?://(localhost|127\.0\.0\.1)(:\d+)?$

# Relative paths are resolved from this backend folder.
DATABASE_PATH=vendorlens.db
MAX_CLAIMS_PER_INVESTIGATION=15
SERPAPI_TIMEOUT_SECONDS=30
SERPAPI_RETRIES=1
```

### 7.1 `SERPAPI_API_KEY`

Used for live supplier searches through SerpApi.

Replace the empty value with your own key:

```env
SERPAPI_API_KEY=your_actual_serpapi_key
```

Do not commit the key to a public repository.

If the key is missing, live supplier search may fail or be unavailable, depending on how the backend handles missing credentials.

### 7.2 `GEMINI_API_KEY`

Optional key for semantic claim analysis:

```env
GEMINI_API_KEY=your_actual_gemini_key
```

Leave it empty if you do not use Gemini.

The application should handle an absent optional key gracefully if semantic analysis is intended to be optional.

### 7.3 `GEMINI_MODEL`

```env
GEMINI_MODEL=gemini-3.1-flash-lite
```

Specifies the Gemini model name used by the integration, provided the backend reads this variable and the model is available to the configured API account.

### 7.4 `CORS_ORIGINS`

```env
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173
```

Lists the permitted local frontend origins.

Common development ports represented here are:

- Port 3000.
- Port 5173.
- Port 4173.

If your frontend runs on another port, add its exact origin and restart the backend.

An origin includes the scheme, hostname, and optional port. It does not include a page path.

### 7.5 `CORS_ORIGIN_REGEX`

```env
CORS_ORIGIN_REGEX=^https?://(localhost|127\.0\.0\.1)(:\d+)?$
```

Intended to allow HTTP or HTTPS localhost origins with optional ports.

This is a regular expression, not a list. The backend must pass it to its CORS middleware or otherwise apply it for the setting to have an effect.

### 7.6 `DATABASE_PATH`

```env
DATABASE_PATH=vendorlens.db
```

Specifies the database filename.

The project configuration states that relative paths are resolved from the backend folder. Confirm that the database initialization code follows this rule.

The file may be created automatically if the application implements automatic SQLite initialization.

### 7.7 `MAX_CLAIMS_PER_INVESTIGATION`

```env
MAX_CLAIMS_PER_INVESTIGATION=15
```

Sets the intended maximum number of claims per investigation to 15.

The backend must enforce this limit during request validation or investigation processing.

### 7.8 `SERPAPI_TIMEOUT_SECONDS`

```env
SERPAPI_TIMEOUT_SECONDS=30
```

Sets the intended timeout for SerpApi requests to 30 seconds.

The backend must read this variable and pass it to the HTTP request implementation.

### 7.9 `SERPAPI_RETRIES`

```env
SERPAPI_RETRIES=1
```

Configures the intended number of retries for SerpApi requests.

The precise retry behavior depends on the implementation. Confirm whether the setting represents additional retries or total attempts.

---

## 8. Frontend Environment Configuration

If your frontend needs to know the backend API address, configure it in the frontend root directory, next to `package.json`.

For a Vite frontend, create:

`frontend/.env.local`

Example:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Use the actual backend URL and port for your project.

The frontend API code must read the configured variable, for example:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
```

This example applies to Vite-based frontend projects. If your project uses another framework or an existing API configuration mechanism, follow that implementation instead.

Restart the frontend development server after changing environment variables.

**Security:** Never place `SERPAPI_API_KEY` or `GEMINI_API_KEY` in frontend variables prefixed with `VITE_`. Vite exposes those variables to browser-side code.

---

## 9. Installing Dependencies

### Backend

Open a terminal in the backend directory.

If the repository contains `requirements.txt`, create and activate a virtual environment:

```bat
python -m venv .venv
```

Activate it on Windows:

```bat
.venv\Scripts\activate
```

Install dependencies:

```bat
python -m pip install -r requirements.txt
```

If the repository uses a different dependency manager, follow its existing setup instructions.

### Frontend

Open a separate terminal in the frontend directory.

If the project contains `package.json`, install the dependencies:

```bat
npm install
```

If the project uses another package manager, use the lockfile and package manager intended for the repository.

---

## 10. Running VendorLens

The exact startup command depends on the actual backend entry point and frontend scripts.

### Backend

If the project is a FastAPI application and its entry point is `app.main:app`, the command may be:

```bat
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Run this from the backend directory with its virtual environment activated.

This command is valid only if `app.main:app` exists in your repository.

If the application uses a different entry point, use that instead.

### Frontend

For a frontend with a Vite development script:

```bat
npm run dev
```

Open the local URL displayed in the terminal.

### Keep both processes running

If the project has separate frontend and backend servers:

- Terminal 1 runs the backend.
- Terminal 2 runs the frontend.

If the backend starts successfully, check its health endpoint or API documentation if those routes are implemented.

Do not assume a particular API URL exists without checking the backend's registered routes.

---

## 11. Supplier Discovery Workflow

The intended supplier discovery workflow is:

1. The user enters a supplier-related search query.
2. The frontend submits the request to the backend.
3. The backend validates the request.
4. The backend sends a search request to SerpApi if configured.
5. The backend receives available search results.
6. The results are processed according to the application logic.
7. The frontend displays the returned information.
8. The user reviews the sources and investigates relevant claims.

### Important considerations

- Search results can be incomplete or outdated.
- A search result is not proof of company legitimacy.
- Search snippets may omit context.
- Business names may refer to different organizations.
- Supplier information should be cross-checked against reliable sources.

---

## 12. Claim Investigation Workflow

The intended claim investigation workflow is:

1. The user starts an investigation.
2. The user identifies claims to examine.
3. The backend validates the investigation and its claims.
4. The application retrieves relevant information from configured sources.
5. Optional Gemini analysis interprets claims and supporting information.
6. The application presents results for review.
7. The user checks the source evidence and identifies unresolved questions.

The configured limit is 15 claims per investigation.

An AI-generated assessment should not be presented as a confirmed fact unless the evidence independently supports it.

---

## 13. Example Investigation

Consider a hypothetical supplier that claims to manufacture industrial safety equipment.

An investigation might examine:

| Claim | Suggested verification |
|---|---|
| The supplier manufactures the product | Check manufacturer documentation and production evidence |
| The supplier operates from a stated location | Check official company records and contact details |
| The supplier holds a certification | Verify the certificate with the issuing organization |
| The supplier has a stated production capacity | Request documentation or independently corroborated evidence |

This is an illustrative example, not a report about a real company.

### Evidence handling

A useful investigation record should distinguish:

- The original claim.
- The source where the claim appeared.
- Independent supporting evidence.
- Contradictory evidence.
- Information that could not be verified.
- The next action required.

Do not infer that a claim is false merely because evidence is missing. Equally, do not infer that it is true because a search result repeats it.

---

## 14. Database

The configuration uses SQLite:

```env
DATABASE_PATH=vendorlens.db
```

The expected database filename is `vendorlens.db`, with relative paths intended to resolve from the backend folder.

The actual database schema and stored entities must be confirmed from the backend source code.

Depending on the implementation, the database may store investigation records, claims, search metadata, or other application data.

### Database considerations

- Confirm where the database file is created.
- Confirm that the application initializes its schema.
- Verify that records persist after restarting the backend.
- Avoid committing local databases containing private or sensitive information.
- Back up important investigation records.

---

## 15. Testing Checklist

Before using VendorLens for an investigation, verify the following.

### Backend

- [ ] The backend starts without errors.
- [ ] Dependencies install successfully.
- [ ] Environment variables are loaded.
- [ ] The database is initialized correctly.
- [ ] API requests are validated.
- [ ] The investigation claim limit is enforced.
- [ ] Missing optional Gemini credentials are handled appropriately.
- [ ] SerpApi errors and timeouts are handled appropriately.

### Frontend

- [ ] The frontend starts successfully.
- [ ] The frontend points to the correct backend URL.
- [ ] Requests use the correct API paths.
- [ ] Loading and error states are displayed.
- [ ] Search results are rendered correctly.
- [ ] Investigation results are displayed clearly.

### Supplier search

- [ ] A valid SerpApi key is configured.
- [ ] Search requests return expected responses.
- [ ] Search failures are handled gracefully.
- [ ] Source URLs are available when returned by the provider.
- [ ] Search snippets are not automatically treated as verified facts.

### Semantic analysis

- [ ] A valid Gemini key is configured if required.
- [ ] The configured model is accessible.
- [ ] Missing credentials produce a clear message or fallback.
- [ ] AI-generated conclusions are presented with appropriate limitations.
- [ ] The application does not claim independent verification solely because an AI model agrees with a claim.

### Database

- [ ] The database file is created at the expected location.
- [ ] Records persist across application restarts.
- [ ] Database errors are handled.
- [ ] Sensitive data is appropriately protected.

---

## 16. Troubleshooting

### Problem: Supplier search fails

**Possible causes:**

- Missing or invalid SerpApi API key.
- API quota or account restrictions.
- Network failure.
- Request timeout.
- Incorrect backend configuration.

**What to check:**

1. Confirm `SERPAPI_API_KEY` is set in the backend `.env`.
2. Confirm the backend loads the environment file.
3. Check backend logs.
4. Verify that the SerpApi integration reads `SERPAPI_TIMEOUT_SECONDS`.
5. Confirm the key is valid and the service is available.

### Problem: Gemini analysis is unavailable

**Possible causes:**

- `GEMINI_API_KEY` is empty.
- The configured model is unavailable to the account.
- The backend does not load the environment variables.
- The request fails or exceeds a timeout.

**What to check:**

1. Confirm the API key if semantic analysis is required.
2. Confirm `GEMINI_MODEL` matches a model available to the account.
3. Check backend logs for the underlying error.
4. Verify that the application handles optional analysis failures.

### Problem: CORS error

**Possible cause:** The frontend origin is not allowed by the backend.

**What to check:**

1. Inspect the frontend URL in the browser.
2. Add the exact origin to `CORS_ORIGINS`, if necessary.
3. Confirm that the backend reads `CORS_ORIGINS` and `CORS_ORIGIN_REGEX`.
4. Restart the backend.

### Problem: `404 Not Found`

**Possible cause:** The requested endpoint is not registered at that URL.

**What to check:**

1. Inspect the backend route definitions.
2. Check the exact API path called by the frontend.
3. Verify the HTTP method.
4. Confirm that the intended backend is running on the expected port.

A 404 error is not normally fixed by changing an API key.

### Problem: Environment variables do not take effect

**Possible causes:**

- The `.env` file is in the wrong directory.
- The backend does not load `.env`.
- The variable name differs from the one used in code.
- The development server has not been restarted.

**What to check:**

1. Confirm `.env` is in the backend root.
2. Inspect the configuration and startup code.
3. Confirm the exact variable names.
4. Restart the backend after making changes.

### Problem: Database file cannot be found

**Possible causes:**

- The database path is resolved from a different working directory.
- The application has not initialized the database.
- The application uses another configured database location.

**What to check:**

1. Confirm `DATABASE_PATH=vendorlens.db`.
2. Inspect the database initialization code.
3. Check the working directory and backend logs.
4. Confirm whether the database file is created automatically.

---

## 17. Security and Responsible Use

VendorLens processes supplier information and may use external search and AI services.

Follow these practices:

- Keep API keys on the server.
- Never commit secrets to Git.
- Keep `.env` excluded from version control.
- Avoid logging API keys or sensitive credentials.
- Validate incoming requests.
- Apply appropriate timeouts and retry limits.
- Treat external search results as untrusted data.
- Review AI-generated analysis before acting on it.
- Avoid storing unnecessary personal or confidential information.
- Verify supplier credentials with authoritative sources.

Supplier evaluations can have financial and operational consequences. Do not use an unverified AI assessment as the sole basis for a procurement decision.

---

## 18. Future Enhancements

Potential future improvements include:

- More supplier search filters.
- Supplier comparison dashboards.
- Official registry integrations.
- Certification verification workflows.
- Source reliability indicators.
- Evidence timelines.
- Duplicate company detection.
- Investigation history and audit logs.
- Exportable investigation reports.
- Improved claim contradiction detection.
- Better error handling and retry strategies.
- Automated tests and CI workflows.
- Authentication and role-based access control.
- More robust database migrations.
- Monitoring and usage analytics.

These are proposed improvements and should not be considered existing features unless implemented in the repository.

---

## 19. Contributing

A suggested contribution workflow:

1. Create a feature branch.
2. Implement the change.
3. Add or update tests.
4. Update documentation and environment-variable references.
5. Test the affected workflow.
6. Submit a pull request describing the change.

Do not include real API keys or sensitive investigation data in code, commits, or screenshots.

---

## 20. License

Add a license file if you plan to distribute VendorLens publicly or allow others to reuse the project.

Until a license is specified, do not assume that unrestricted reuse or redistribution is permitted.

---

## 21. Quick Start Summary

### Backend `.env`

Create the file in the backend root:

```env
SERPAPI_API_KEY=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.1-flash-lite

CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173,http://127.0.0.1:4173
CORS_ORIGIN_REGEX=^https?://(localhost|127\.0\.0\.1)(:\d+)?$

DATABASE_PATH=vendorlens.db
MAX_CLAIMS_PER_INVESTIGATION=15
SERPAPI_TIMEOUT_SECONDS=30
SERPAPI_RETRIES=1
```

Replace the empty API-key values with your actual keys when those integrations are required.

### Backend installation

If the backend uses Python and provides `requirements.txt`:

```bat
python -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
```

Start the backend using the entry point documented in your repository.

### Frontend `.env.local`

If the frontend uses Vite, create `frontend/.env.local`:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Adjust the address and port to match the actual backend.

### Frontend installation and startup

If the frontend uses npm:

```bat
npm install
npm run dev
```

Open the URL displayed by the frontend development server.

Keep the backend and frontend running while testing the application.

---

**VendorLens — Discover suppliers. Investigate claims. Make evidence-informed decisions.**
