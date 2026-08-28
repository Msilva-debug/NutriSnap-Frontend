import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const envFile = resolve('.env');
const outputFile = resolve('public/runtime-config.json');

function parseEnv(content) {
  return Object.fromEntries(
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const [key, ...valueParts] = line.split('=');
        const value = valueParts.join('=').trim().replace(/^['"]|['"]$/g, '');
        return [key.trim(), value];
      }),
  );
}

const env = existsSync(envFile) ? parseEnv(readFileSync(envFile, 'utf8')) : {};
const config = {
  apiBaseUrl: env.APP_API_BASE_URL || 'http://localhost:8080/api',
};

mkdirSync(dirname(outputFile), { recursive: true });
writeFileSync(outputFile, `${JSON.stringify(config, null, 2)}\n`);
