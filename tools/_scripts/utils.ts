import { join } from 'path';
import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { exec, rm } from 'shelljs';
import { inc } from 'semver';

const ROOT_PATH = join(__dirname, '../../');

export const getPath = (...args: string[]) => args.length ? join(ROOT_PATH, ...args) : ROOT_PATH;

const execCommand = (cmd: string) => {
  try {
    return exec(cmd, { silent: true }).stdout ?? '';
  } catch (ex) {}
  return undefined;
}

export const execBuildLib = (name: string) => {
  const result = execCommand(`npx nx build ${name}`) ?? '';
  //return result.includes(`Successfully ran target build for project  ${name}`);
  return result.includes('Successfully ran target');
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

export const getNpmPkgVersion = (pkg: string) => {
  return (execCommand(`npm view ${pkg} version`) ?? '')
    .trim().replace(/^\n*|\n*$/g, '');
};
