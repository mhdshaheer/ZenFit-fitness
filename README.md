# ZenFit

ZenFit is a full-stack fitness and wellness platform where admins curate programs, trainers run live or recorded sessions, and users can book slots, attend meetings, receive feedback, and handle payments inside a single experience. The repository is a monorepo that contains both the backend (Node.js + Express + MongoDB) API and the Angular frontend.

## Repository structure

```
ZenFit/
├── backend/   # Node.js + Express + TypeScript API, Socket.IO, MongoDB, Stripe
├── frontend/  # Angular 20 SPA with NgRx, Angular Material, TailwindCSS
└── README.md  # You are here
```

## Tech stack

| Layer      | Technologies |
|------------|--------------|
| Backend    | Node.js 20, Express 5, TypeScript, MongoDB (Mongoose), Redis, Socket.IO, InversifyJS DI, Stripe, AWS S3, Nodemailer, JWT & Google OAuth |
| Frontend   | Angular 20, NgRx Store/Effects, Angular Material, PrimeNG, TailwindCSS/PostCSS, RxJS, Socket.IO client, SweetAlert2 |
| DevOps     | Docker, Docker Compose, GitHub Actions, AWS EC2, Docker Hub/ECR, Vercel (optional for frontend) |

## Highlighted features

1. **Authentication & Authorization** — Email/password, JWT-based access, refresh tokens, HTTP-only cookies, Google OAuth, role-based policies (admin/trainer/user).
2. **Program lifecycle** — Admin review workflow with pending/approved/rejected tabs, backend-driven pagination/search, and bulk moderation tools.
3. **Booking & Scheduling** — Users book program slots, trainers manage schedules; cancellations propagate to users with real-time notifications.
4. **Live & async sessions** — WebRTC signaling through Socket.IO, meeting creation triggers real-time notifications to booked users.
5. **Trainer feedback loop** — Trainers submit session feedback; users view contextual feedback within their past sessions.
6. **Payments & transactions** — Stripe integration, AWS S3 uploads for assets, transaction history page with search/filter/pagination.
7. **Notifications system** — Inline alert-style UI, mark-all-as-read endpoint, Redis pub/sub ready.
8. **Logging & monitoring** — Winston with daily rotate transports, rate limiting, session management, typed DTOs and validators.

## Prerequisites

- Node.js >= 20.x and npm >= 10.x
- Angular CLI (`npm install -g @angular/cli`)
- MongoDB instance (local or Atlas)
- Redis (for queues/sessions/notifications)
- Stripe account + test keys
- AWS S3 bucket & credentials (for media uploads)
- Optional: Docker & Docker Compose for containerized runs

## Environment variables

Create `backend/.env` using the template below (values are examples):

```ini
PORT=5000
MONGODB_URL=mongodb://localhost:27017/zenfit
NODE=development
MAIL_USER=zenfit@example.com
MAIL_PASSWORD=supersecret
JWT_SECRET=change_me
ACCESS_TOKEN_SECRET=change_me_access
REFRESH_TOKEN_SECRET=change_me_refresh
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:5000/api/v1/auth/google/callback
FRONTEND_URL=http://localhost:4200
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=zenfit-assets
STRIPE_TEST_SECRET_KEY=sk_test_xxx
STRIPE_WEB_HOOK=whsec_xxx
ACCESS_TOKEN_MAX_AGE=900000
REFRESH_TOKEN_MAX_AGE=604800000
```

Frontend environment files live under `frontend/src/environments/`. Update `environment.ts` / `environment.prod.ts` with backend API URLs, Stripe publishable keys, and Socket endpoints.

## Local development

### Backend API

```bash
cd backend
npm install
npm run dev  # watches TypeScript via ts-node-dev
```

Scripts:

| Script        | Description |
|---------------|-------------|
| `npm run dev` | Start development server with auto-restart |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start`   | Run compiled server (`node dist/server.js`) |
| `npm run lint`| ESLint with TypeScript rules |

### Frontend SPA

```bash
cd frontend
npm install
npm start   # alias for ng serve
```

Scripts:

| Script        | Description |
|---------------|-------------|
| `npm start`   | `ng serve` with live reload on http://localhost:4200 |
| `npm run build` | Production build to `dist/` |
| `npm test`    | Karma + Jasmine unit tests |
| `npm run lint`| Angular ESLint checks |

## Running with Docker

1. Build and tag backend image:
   ```bash
   cd backend
   docker build -t zenfit-backend:local .
   ```
2. (Optional) build frontend image or deploy via Vercel.
3. Use Docker Compose on the server to pull `mydockeruser/zenfit-backend:latest` and run alongside Mongo/Redis:
   ```yaml
   services:
     backend:
       image: mydockeruser/zenfit-backend:latest
       env_file: .env
       ports:
         - "5000:5000"
       depends_on:
         - mongo
         - redis
     mongo:
       image: mongo:7
       volumes:
         - mongo-data:/data/db
     redis:
       image: redis:7
   volumes:
     mongo-data:
   ```

Frontend can be hosted separately (Vercel, S3+CloudFront) and configured to talk to the backend’s public URL.

## CI/CD pipeline (GitHub Actions → Docker Hub → AWS EC2)

1. Trigger: push to `main` affecting `backend/**`.
2. Build stage: checkout repo, install deps, run tests/lint, compile TypeScript.
3. Docker stage: build image, tag with short SHA and `latest`, push to Docker Hub/ECR using repository secrets (`DOCKER_USERNAME`, `DOCKER_PASSWORD`).
4. Deploy stage: SSH into EC2 (`EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY` secrets), pull the new image, run `docker compose up -d`, prune old images.
5. Optional: notify Slack/Teams or GitHub Deployments.

Sample workflow snippet (`.github/workflows/backend-ci-cd.yml`):
```yaml
name: Backend CI/CD
on:
  push:
    branches: [ main ]
    paths:
      - "backend/**"
jobs:
  build-test-deploy:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm ci
      - run: npm run build
      - uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      - run: |
          IMAGE=mydockeruser/zenfit-backend
          TAG=${GITHUB_SHA::7}
          docker build -t $IMAGE:$TAG -t $IMAGE:latest .
          docker push $IMAGE:$TAG
          docker push $IMAGE:latest
      - uses: appleboy/ssh-action@v1.1.1
        with:
          host: ${{ secrets.EC2_HOST }}
          username: ${{ secrets.EC2_USER }}
          key: ${{ secrets.EC2_SSH_KEY }}
          script: |
            cd /opt/zenfit
            docker pull mydockeruser/zenfit-backend:latest
            docker compose up -d
            docker image prune -f
```

## Testing & quality

- **Backend**: Add Jest/Vitest or integration tests and call them via `npm test` inside the workflow. ESLint is configured (see `backend/eslint.config.mjs`).
- **Frontend**: Karma/Jasmine unit tests via `ng test`, E2E tooling can be added (e.g., Cypress/Playwright). ESLint rules live in `frontend/eslint.config.js`.
- **Static analysis**: TypeScript strict mode, DTOs, and interfaces enforce consistency across services.

## Contribution guidelines

1. Create a feature branch from `main` (`feat/*`, `fix/*`).
2. Run lint + unit tests for both backend and frontend components touched.
3. Update documentation (this README or component-specific docs) when behavior changes.
4. Submit a PR with a clear description, screenshots (for UI changes), and test notes.
5. Ensure CI passes before requesting review.

## Support & contact

- For infrastructure questions (AWS, Docker, CI/CD), consult `/backend/Dockerfile`, `frontend/vercel.json`, and the GitHub Actions workflow.
- For domain logic questions, see service-specific README sections within feature PRs or contact the respective module owner.

Happy building! 🚀
