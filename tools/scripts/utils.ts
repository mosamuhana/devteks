import { join } from 'path';
import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { exec, rm } from 'shelljs';

const ROOT_PATH = join(__dirname, '../../');

export const getPath = (...args: string[]) => args.length ? join(ROOT_PATH, ...args) : ROOT_PATH;

export const execBuildLib = (name: string) => {
  let result: string = '';
  try {
    result = exec(`npx nx build ${name}`, { silent: true }).stdout ?? '';
  } catch (ex) {}
  return result.includes(`Successfully ran target build for project  ${name}`);
}

export const getAllLibNames = () => {
  const libsPath = getPath('libs');
  const files = readdirSync(libsPath);
  return files.filter(file => statSync(join(libsPath, file)).isDirectory());
};

export const readJsonFileSync = (filePath: string) => JSON.parse(readFileSync(filePath, 'utf8'));
export const writeJsonFileSync = (filePath: string, data: any) => writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

export const removeDir = (dir: string) => {
  try {
    rm('-rf', dir);
    return true;
  } catch (ex) {}
  return false;
};
