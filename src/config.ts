import fs from 'fs';
import path from 'path';
import type { DeployConfig } from './types';

const CONFIG_FILES = ['deploy.config.js', 'deploy.config.mjs', 'deploy.config.ts'];

export async function loadConfig(projectRoot: string): Promise<DeployConfig | null> {
  for (const file of CONFIG_FILES) {
    const configPath = path.join(projectRoot, file);
    if (fs.existsSync(configPath)) {
      const mod = await import(configPath);
      return mod.default || mod;
    }
  }
  return null;
}

export function loadConfigFromEnv(overrides: Partial<DeployConfig> = {}): DeployConfig {
  const env = process.env;

  if (!env.SERVER_HOST || !env.SERVER_USERNAME || !env.SERVER_PRIVATE_KEY) {
    throw new Error(
      'Missing required environment variables: SERVER_HOST, SERVER_USERNAME, SERVER_PRIVATE_KEY'
    );
  }

  if (!env.SERVER_BASE_PATH) {
    throw new Error('Missing required environment variable: SERVER_BASE_PATH');
  }

  if (!env.SERVER_PM2_PROCESS) {
    throw new Error('Missing required environment variable: SERVER_PM2_PROCESS');
  }

  const privateKeyPath = env.SERVER_PRIVATE_KEY.trim();
  if (!fs.existsSync(privateKeyPath)) {
    throw new Error(`Private key file not found: ${privateKeyPath}`);
  }

  return {
    server: {
      host: env.SERVER_HOST.trim(),
      username: env.SERVER_USERNAME.trim(),
      privateKeyPath,
      port: env.SERVER_PORT ? parseInt(env.SERVER_PORT, 10) : 22,
    },
    paths: {
      basePath: env.SERVER_BASE_PATH.trim(),
      releasesDir: env.SERVER_RELEASES_DIR || 'releases',
      currentLink: env.SERVER_CURRENT_LINK || 'current',
    },
    pm2Process: env.SERVER_PM2_PROCESS.trim(),
    releasesToKeep: env.RELEASES_TO_KEEP ? parseInt(env.RELEASES_TO_KEEP, 10) : 5,
    ...overrides,
  };
}
