# ZenFit

ZenFit is a full-stack fitness and wellness platform where admins curate programs, trainers run live or recorded sessions, and users can book slots, attend meetings, receive feedback, and handle payments inside a single experience. The repository is a monorepo that contains both the backend (Node.js + Express + MongoDB) API and the Angular frontend.

## Repository structure

```
ZenFit/
├── backend/   # Node.js + Express + TypeScript API, Socket.IO, MongoDB, Stripe, Resend
├── frontend/  # Angular 20 SPA with NgRx, Angular Material, TailwindCSS 4
└── README.md  # You are here
```

## Tech stack

| Layer      | Technologies |
|------------|--------------|
| Backend    | Node.js 22, Express 5, TypeScript, MongoDB (Mongoose), Redis (Socket.IO adapter), InversifyJS DI, Stripe, AWS S3, Resend API, JWT & Google OAuth |
| Frontend   | Angular 20, NgRx Store/Effects, Angular Material, PrimeNG, TailwindCSS 4, RxJS, Socket.IO client, SweetAlert2, ApexCharts |
| DevOps     | Docker, Docker Compose, GitHub Actions, AWS EC2, Docker Hub/ECR, Vercel/Render |

## Highlighted features

1. **Authentication & Authorization** — Email/password, JWT-based access, refresh tokens, HTTP-only cookies, Google OAuth, and OTP verification via Resend.
2. **Program lifecycle** — Admin review workflow with pending/approved/rejected tabs, backend-driven pagination/search, and bulk moderation tools.
3. **Booking & Scheduling** — Users book program slots, trainers manage schedules; cancellations propagate to users with real-time notifications and transparent cancellation reasons.
4. **Live & async sessions** — WebRTC signaling through Socket.IO, meeting creation triggers real-time notifications to booked users.
5. **Trainer feedback loop** — Trainers submit session feedback; users view contextual feedback within their past sessions.
6. **Payments & transactions** — Stripe integration, AWS S3 uploads for assets, transaction history page with search/filter/pagination.
7. **Notifications system** — Inline alert-style UI, mark-all-as-read functionality, backed by Redis for scalability.
8. **Logging & UI Polish** — Winston logging, loading skeletons for better UX, and improved security tab handling for OAuth users.

## Prerequisites

- Node.js >= 22.x and npm >= 10.x
- Angular CLI (`npm install -g @angular/cli`)
- MongoDB instance (local or Atlas)
- Redis (for queues/sessions/notifications)
- Stripe account + test keys
- AWS S3 bucket & credentials (for media uploads)
- Resend API Key (for email services)
- Optional: Docker & Docker Compose for containerized runs

## Environment variables

Create `backend/.env` using the template below (values are examples):

```ini
PORT=5001
MONGODB_URL=mongodb://localhost:27017/zenfit
NODE=development
RESEND_API_KEY=re_xxx_xxxx
JWT_SECRET=change_me
ACCESS_TOKEN_SECRET=change_me_access
REFRESH_TOKEN_SECRET=change_me_refresh
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_CALLBACK_URL=http://localhost:5001/api/v1/auth/google/callback
FRONTEND_URL=http://localhost:4200,http://bitcore.zenfit.space
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_S3_BUCKET=zenfit-assets
STRIPE_TEST_SECRET_KEY=sk_test_xxx
STRIPE_WEB_HOOK=whsec_xxx
REDIS_URL=redis://localhost:6379
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
         - "5001:5001"
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

Frontend can be hosted separately (Vercel, Render) and configured to talk to the backend’s public URL.

## CI/CD pipeline (GitHub Actions → Docker Hub → AWS EC2)

1. Trigger: push to `main` affecting `backend/**`.
2. Build stage: checkout repo, install deps, run tests/lint, compile TypeScript.
3. Docker stage: build image, tag with short SHA and `latest`, push to Docker Hub/ECR using repository secrets (`DOCKER_USERNAME`, `DOCKER_PASSWORD`).
4. Deploy stage: SSH into EC2 (`EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY` secrets), pull the new image, run `docker compose up -d`, prune old images.

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
          node-version: "22"
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

- **Backend**: Integrates with Winston for daily log rotation and ESLint for code quality.
- **Frontend**: Karma/Jasmine unit tests via `ng test`. ESLint rules are active for Angular components.
- **Static analysis**: TypeScript strict mode, DTOs, and interfaces are enforced across the project.

## Contribution guidelines

1. Create a feature branch from `main`.
2. Run lint + unit tests for both backend and frontend components.
3. Update documentation (this README or component-specific docs) as needed.
4. Submit a PR with a clear description and screenshots where applicable.

## Support & contact

- For infrastructure questions (AWS, Docker, CI/CD), consult `/backend/Dockerfile` and the GitHub Actions workflow.
- Domain logic: Check service-specific implementations or contact module owners.

Happy building! 🚀
