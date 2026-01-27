import fs from 'fs';
import process from 'process';
import os from 'os';
import path from 'path';
import { glob } from 'glob';
import { SOURCE_DIR } from './constants';

export function isWSL() {
  if (process.platform !== 'linux') {
    return false;
  }

  if (os.release().toLowerCase().includes('microsoft')) {
    return true;
  }

  try {
    return fs.readFileSync('/proc/version', 'utf8').toLowerCase().includes('microsoft');
  } catch {
    return false;
  }
}

export function getPackageJson() {
  return require(path.resolve(process.cwd(), 'package.json'));
}

export function getPluginJson() {
  // First try the traditional location
  const rootPluginJson = path.resolve(process.cwd(), `${SOURCE_DIR}/plugin.json`);
  if (fs.existsSync(rootPluginJson)) {
    return require(rootPluginJson);
  }

  // For monorepo with nested plugins, find the first plugin.json (usually datasource)
  const nestedPlugins = glob.sync(`${SOURCE_DIR}/**/plugin.json`, { cwd: process.cwd() });
  if (nestedPlugins.length > 0) {
    return require(path.resolve(process.cwd(), nestedPlugins[0]));
  }

  throw new Error('No plugin.json found');
}

export function getCPConfigVersion() {
  const cprcJson = path.resolve(__dirname, '../', '.cprc.json');
  return fs.existsSync(cprcJson) ? require(cprcJson).version : { version: 'unknown' };
}

export function hasReadme() {
  return fs.existsSync(path.resolve(process.cwd(), SOURCE_DIR, 'README.md'));
}

// Support bundling nested plugins by finding all plugin.json files in src directory
// then checking for a sibling module.[jt]sx? file.
export async function getEntries(): Promise<Record<string, string>> {
  const pluginsJson = await glob('**/src/**/plugin.json', { absolute: true });

  const plugins = await Promise.all(
    pluginsJson.map((pluginJson) => {
      const folder = path.dirname(pluginJson);
      return glob(`${folder}/module.{ts,tsx,js,jsx}`, { absolute: true });
    })
  );

  return plugins.reduce((result, modules) => {
    return modules.reduce((result, module) => {
      const pluginPath = path.dirname(module);
      const pluginName = path.relative(process.cwd(), pluginPath).replace(/src\/?/i, '');
      const entryName = pluginName === '' ? 'module' : `${pluginName}/module`;

      result[entryName] = module;
      return result;
    }, result);
  }, {});
}
