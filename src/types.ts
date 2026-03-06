export interface DeployConfig {
  /** SSH server connection details */
  server: {
    host: string;
    username: string;
    /** Path to SSH private key file */
    privateKeyPath: string;
    /** SSH port (default: 22) */
    port?: number;
  };

  /** Remote server paths */
  paths: {
    /** Base deployment directory (e.g., /var/www/myapp) */
    basePath: string;
    /** Releases subdirectory name (default: "releases") */
    releasesDir?: string;
    /** Current symlink name (default: "current") */
    currentLink?: string;
  };

  /** PM2 process name to restart after deployment */
  pm2Process: string;

  /** Number of releases to keep on server (default: 5) */
  releasesToKeep?: number;

  /** Files and directories to include in the deployment package */
  filesToTransfer?: string[];

  /** Build command to run locally before deploying (default: "npm run build") */
  buildCommand?: string;

  /** Install command for production deps in staging (default: "npm ci --omit=dev --ignore-scripts") */
  installCommand?: string;

  /** Path to shared .env file on server (default: "{basePath}/shared/.env") */
  sharedEnvPath?: string;

  /** Local project root directory (default: process.cwd()) */
  projectRoot?: string;

  /** Custom logger function */
  logger?: (emoji: string, message: string) => void;

  /** Lifecycle hooks */
  hooks?: {
    /** Called before build step */
    preBuild?: () => Promise<void> | void;
    /** Called after build step */
    postBuild?: () => Promise<void> | void;
    /** Called after extraction, before symlink switch */
    preSwitch?: (ssh: any, releasePath: string) => Promise<void> | void;
    /** Called after symlink switch, before PM2 restart */
    postSwitch?: (ssh: any, releasePath: string) => Promise<void> | void;
    /** Called after successful deployment */
    postDeploy?: (releaseName: string) => Promise<void> | void;
  };
}

export interface DeployOptions {
  /** Skip the local build step */
  skipBuild?: boolean;
  /** Force fresh dependency install (clear staging cache) */
  fresh?: boolean;
  /** Dry run — log actions without executing */
  dryRun?: boolean;
}

export interface DeployResult {
  success: boolean;
  releaseName: string;
  error?: string;
}
