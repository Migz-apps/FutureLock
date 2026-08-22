# FutureLock testing

The test suite is intentionally split into fast, isolated tests and an opt-in database layer.

- Backend unit/controller/security tests are under `backend/vault/src/test/java`.
- `JwtServiceTest`, `AuthServiceTest`, `RateLimiterServiceTest`, and `AuthControllerTest` cover authentication behavior without a database or mail server.
- `SecurityEndpointTest` exercises the actual WebFlux security chain, JWT role enforcement, and CORS configuration.
- `PersistenceMappingContractTest` checks R2DBC table/column contracts against the SQL migration.
- `AuthApiDatabaseIntegrationTest` is the real HTTP → verification storage → R2DBC → PostgreSQL signup/login check. It runs only with `TEST_DB_URL` and cleans up its generated user.
- Frontend Vitest tests are under `frontend/src` and cover the shared API utility and `AuthContext` session flow.

## Database integration safety

Database-backed Spring context and integration tests require all three variables below. They must point to an isolated, disposable PostgreSQL database—not Supabase production and never the normal `DB_*` variables. Without `TEST_DB_URL`, those tests are skipped before a Spring context can load.

- `TEST_DB_URL`
- `TEST_DB_USERNAME`
- `TEST_DB_PASSWORD`

`application-test.yaml` deliberately reads only these test variables. Automated tests must never use `DB_URL`, `DB_USERNAME`, or `DB_PASSWORD`.

## Commands to run

From `backend/vault`:

```powershell
.\mvnw.cmd test
```

```sh
./mvnw test
```

From `frontend`:

```powershell
npm test
```

Run the live frontend-to-backend contract suite only against a disposable test deployment. It is skipped unless all values below are set:

- `RUN_BACKEND_INTEGRATION=true`
- `TEST_BACKEND_URL` — the locally running or dedicated test backend URL, never Render production
- `TEST_EMAIL` and `TEST_PASSWORD` — an existing disposable email-account test user

```powershell
$env:RUN_BACKEND_INTEGRATION='true'; $env:TEST_BACKEND_URL='http://localhost:8081'; $env:TEST_EMAIL='test@example.com'; $env:TEST_PASSWORD='test-password'; npm run test:integration
```

```sh
npm test
```

Full suite on PowerShell:

```powershell
Set-Location backend\vault; .\mvnw.cmd test; Set-Location ..\..\frontend; npm test
```

Run opt-in database-tagged backend tests only after setting `TEST_DB_*` to an isolated database:

```sh
./mvnw test -Dgroups=database-integration
```

No test should send email, contact Vercel, Render, Supabase production, WalletConnect, an RPC node, or a real blockchain.
