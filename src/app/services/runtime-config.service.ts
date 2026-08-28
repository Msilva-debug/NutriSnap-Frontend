import { Injectable } from '@angular/core';

type RuntimeConfig = {
  apiBaseUrl: string;
};

const DEFAULT_RUNTIME_CONFIG: RuntimeConfig = {
  apiBaseUrl: defaultApiBaseUrl(),
};

function defaultApiBaseUrl(): string {
  const locationRef = globalThis.location;

  if (!locationRef?.protocol || !locationRef.hostname) {
    return 'http://localhost:8080';
  }

  return `${locationRef.protocol}//${locationRef.hostname}:8080`;
}

@Injectable({
  providedIn: 'root',
})
export class RuntimeConfigService {
  private config = { ...DEFAULT_RUNTIME_CONFIG };

  async load(): Promise<void> {
    try {
      const response = await fetch('/runtime-config.json', { cache: 'no-store' });

      if (!response.ok) {
        return;
      }

      const runtimeConfig = await response.json() as Partial<RuntimeConfig>;
      this.config = {
        ...this.config,
        apiBaseUrl: this.normalizeApiBaseUrl(runtimeConfig.apiBaseUrl),
      };
    } catch {
      this.config = { ...DEFAULT_RUNTIME_CONFIG };
    }
  }

  apiUrl(path = ''): string {
    const baseUrl = this.config.apiBaseUrl.replace(/\/$/, '');
    const suffix = path.startsWith('/') ? path : `/${path}`;

    return `${baseUrl}${suffix}`;
  }

  private normalizeApiBaseUrl(value?: string): string {
    return value?.trim() || DEFAULT_RUNTIME_CONFIG.apiBaseUrl;
  }
}
