#!/usr/bin/env node

import { deploy } from './deploy';
import { loadConfig, loadConfigFromEnv } from './config';
import type { DeployConfig } from './types';

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
  @philiprehberger/next-deploy

  Release-based SSH deployment for Next.js apps.

  Usage: next-deploy [options]

  Options:
    --skip-build    Skip the local build step
    --fresh         Force fresh dependency install (clear cache)
    --dry-run       Log actions without executing
    --help, -h      Show this help message

  Configuration:
    Create a deploy.config.js (or .mjs/.ts) in your project root,
    or set environment variables:

    SERVER_HOST          SSH host
    SERVER_USERNAME      SSH username
    SERVER_PRIVATE_KEY   Path to SSH private key
    SERVER_BASE_PATH     Remote base path (e.g., /var/www/myapp)
    SERVER_PM2_PROCESS   PM2 process name
    SERVER_PORT          SSH port (default: 22)
    RELEASES_TO_KEEP     Number of releases to keep (default: 5)

  Server Structure:
    {basePath}/
    ├── releases/
    │   ├── 20251212112502/
    │   └── ...
    ├── current -> releases/{latest}/
    └── shared/
        └── .env
`);
    process.exit(0);
  }

  const skipBuild = args.includes('--skip-build');
  const fresh = args.includes('--fresh');
  const dryRun = args.includes('--dry-run');
  const projectRoot = process.cwd();

  let config: DeployConfig;

  // Try loading config file first, fall back to env vars
  const fileConfig = await loadConfig(projectRoot);
  if (fileConfig) {
    config = { ...fileConfig, projectRoot: fileConfig.projectRoot || projectRoot };
  } else {
    try {
      config = loadConfigFromEnv({ projectRoot });
    } catch (err) {
      console.error(`❌ ${(err as Error).message}`);
      console.error('\nRun next-deploy --help for usage information.');
      process.exit(1);
    }
  }

  const result = await deploy(config, { skipBuild, fresh, dryRun });

  if (!result.success) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
