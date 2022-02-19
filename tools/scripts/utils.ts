import { join } from 'path';
import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs';
import { inc } from "semver"
import { cd, exec, set, rm } from 'shelljs';

export const ROOT_PATH = join(__dirname, '../../');
export const LIBS_PATH = join(ROOT_PATH, 'libs');
export const getPath = (...args: string[]) => args.length ? join(ROOT_PATH, ...args) : ROOT_PATH;
export const libPath = (name: string) => join(ROOT_PATH, 'libs', name);
export const libDistPath = (name: string) => join(ROOT_PATH, 'dist', 'libs', name);
export const libPackageJsonPath = (name: string) => join(ROOT_PATH, 'libs', name, 'package.json');
const MAIN_PACKAGE_JSON = join(ROOT_PATH, 'package.json');

export const getArgs = () => {
  const args = [...process.argv];
  return args.slice(2).map(x => x.trim()).filter(x => !!x);
};

export const isBuildSuccess = (content: string, name?: string) => {
  const prefix = 'Successfully ran target build for project';
  // Successfully ran target build for project ngx-qrcode
  return content.includes(name ? `${prefix} ${name}` : prefix);
};

export const getAllLibNames = () => {
  const files = readdirSync(LIBS_PATH);
  return files.filter(file => statSync(join(LIBS_PATH, file)).isDirectory());
};

export const readJsonFileSync = (filePath: string) => JSON.parse(readFileSync(filePath, 'utf8'));
export const writeJsonFileSync = (filePath: string, data: any) => writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

export const readLibPackageJson = (name: string) => readJsonFileSync(libPackageJsonPath(name));
export const writeLibPackageJson = (name: string, packageJson: any) => writeJsonFileSync(libPackageJsonPath(name), packageJson);

//const getVersion = (packageJsonPath: string): string => readJsonFileSync(packageJsonPath).version;

const setVersion = (file: string, version: string) => {
  const d = readJsonFileSync(file);
  d.version = version;
  writeJsonFileSync(file, d);
}

export const setLibVersion = (name: string, version: string) => setVersion(libPackageJsonPath(name), version);

//const getLibVersion = (name: string) => getVersion(libPackageJsonPath(name));

//const getMainVersion = () => getVersion(MAIN_PACKAGE_JSON);
export const incVersionPatch = (version: string) => inc(version, 'patch') as string;

const incMainVersion = () => {
  const d = readJsonFileSync(MAIN_PACKAGE_JSON);
  d.version = incVersionPatch(d.version);
  writeJsonFileSync(MAIN_PACKAGE_JSON, d);
};

export const removeDir = (dir: string) => {
  try {
    rm('-rf', dir);
    return true;
  } catch (ex) {}
  return false;
};

export const updatePackage = () => {

};
