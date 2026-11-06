/// <reference types="vite/client" />

declare const __SITE_URL__: string;
declare const __ROBOTS_ALLOW__: boolean;
declare const __BUILD_YEAR__: number;

interface ImportMetaEnv {
  /** Public URL of the brief endpoint (your own backend). Never a secret. */
  readonly VITE_BRIEF_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
