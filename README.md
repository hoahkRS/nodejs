# Node.js Project — Build and Run

## Requirements
- Node.js 20.x or 22.x (LTS recommended)
- npm 10+ (or pnpm 9+ via Corepack)
- Git

Check versions:
```sh
node -v
npm -v
```
mongodb://localhost:27017/nodejs_test
## Quick Start
```sh
# clone
git clone <repo-url>
cd <project-folder>

# choose a package manager
# npm
npm ci || npm install

# pnpm (optional)
corepack enable
corepack prepare pnpm@latest --activate
pnpm install
```

## Build
- JavaScript only: no build step needed unless a bundler is used.
- TypeScript or bundler: add a build script, then run it.

Example scripts (package.json):
```json
{
    "scripts": {
        "dev": "node ./src/index.js",
        "build": "tsc -p tsconfig.json",
        "start": "node ./dist/index.js",
        "test": "node --test",
        "lint": "eslint .",
        "format": "prettier -w ."
    },
    "engines": { "node": ">=20 <=22" }
}
```

Run build:
```sh
npm run build
# or
pnpm build
```

## Run
- Development:
```sh
npm run dev
# or
pnpm dev
```

- Production:
```sh
npm run start
# or
pnpm start
```

## Environment Variables
```sh
# .env.example
PORT=3000
NODE_ENV=development
# add project-specific variables here
```
Usage:
```sh
cp .env.example .env
```

## Node Version Management
- Cross‑platform: use an .nvmrc file:
```sh
# .nvmrc
22
```
- macOS/Linux:
```sh
nvm use
```
- Windows:
- nvm-windows: nvm use 22
- Volta: volta pin node@22

## Lint, Format, Test
```sh
npm run lint
npm run format
npm test
```
Recommended dev dependencies:
```sh
npm i -D eslint prettier @eslint/js
```

## Docker (optional)
```dockerfile
# Dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm","start"]
```
Build and run:
```sh
docker build -t my-node-app .
docker run -p 3000:3000 my-node-app
```

## CI (GitHub Actions example)
```yaml
name: ci
on: [push, pull_request]
jobs:
    node:
        runs-on: ubuntu-latest
        strategy:
            matrix: { node: [20, 22] }
        steps:
            - uses: actions/checkout@v4
            - uses: actions/setup-node@v4
                with: { node-version: ${{ matrix.node }} }
            - run: npm ci
            - run: npm run build --if-present
            - run: npm test
```

## Troubleshooting
- Version mismatch: ensure Node matches .nvmrc/engines.
- Clean install: delete node_modules and package-lock.json (or pnpm-lock.yaml), then reinstall.
- Windows: use PowerShell or Git Bash; avoid paths with spaces for some tools.

Notes
- Replace script commands to match your stack (tsc, webpack, vite, nest, next, etc.).
- Ensure src entry points align with dev/start scripts.
- Add .gitignore for node_modules, dist, .env.
