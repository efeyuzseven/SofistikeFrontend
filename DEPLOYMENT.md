# AWS test deployment

The test frontend runs on AWS ECS/Fargate behind the shared D1 Tech ALB:

- URL: `https://sofistike-test.d1-tech.com`
- Health: `https://sofistike-test.d1-tech.com/api/health`
- ECS service: `sofistike-frontend-test`
- ECR repository: `sofistike-frontend`

Every push to `main-prod` runs lint, type checking, formatting checks and a
production build before publishing an immutable image and rolling out ECS.

The server-side Next.js routes use this runtime backend URL:
`https://api-sofistike-test.d1-tech.com`.

Shared AWS infrastructure is declared in the backend repository at
`deploy/aws/sofistike-test.yml`.
