import { cd, exec, set, rm } from 'shelljs';
import { green, red, yellow, bold } from "colorette"

import {
  ROOT_PATH,
  isBuildSuccess,
  getAllLibNames,
  incVersionPatch,
  setLibVersion,
  removeDir,
  readJsonFileSync,
  writeJsonFileSync,
  getPath,
} from './utils';

set('-e');

//export async function build(libNames: string[])
export async function build() {
  removeDir(getPath('dist'));
  cd(ROOT_PATH);

  const libNames: string[] = getAllLibNames();
  const mainPackagePath = getPath('package.json');
  const mainPackage = readJsonFileSync(mainPackagePath);
  const oldPackageMap: Record<string, any> = {};

  let n = 0;
  for (const name of libNames) {
    const libPath = getPath('libs', name);
    const libPackage = readJsonFileSync(libPath);
    oldPackageMap[name] = libPackage;
    const newLibPackage = updateLibPackage(mainPackage, libPackage);
    writeJsonFileSync(libPath, newLibPackage);
    const ok = buildLib(name);
    if (ok) {
      n++;
      console.log(bold(green('SUCCESS:')), green(`${name} build success.`));
    } else {
      console.log(bold(red('FAILED:')), red(`${name} build failed.`));
      break;
    }
  }

  console.log('');
  if (libNames.length === n) {
    console.log(green('DONE'));
  } else {
    for (const name of libNames) {
      const libPath = getPath('libs', name);
      const pkg = oldPackageMap[name] as any;
      writeJsonFileSync(libPath, pkg);
    }
    console.log(red('ERROR:'), red(`failed`));
  }

  removeDir(getPath('tmp'));
}

function updateLibPackage(mainPackage: any, libPackage: any) {
  const pkg = {...libPackage};
  pkg.version = mainPackage.version;
  return pkg;
}

function buildLib(name: string) {
  let result: string = '';
  try {
    result = exec(`npx nx build ${name}`, { silent: true }).stdout;
  } catch (ex) {}
  return isBuildSuccess(result, name);
}

function run() {
  build();
  /*
  const args = getArgs();
  if (args.length === 0) {
    console.warn(yellow('List lib names.'));
    return;
  }
  build(args);
  */
}

if (require.main == module) {
  run();
}

class Builder {
  main: PackageInfo;
  names: string[] = getAllLibNames();
  data: Record<string, PackageInfo> = {};

  constructor() {
    const mainPath = getPath('package.json');
    const mainPackage = readJsonFileSync(mainPath);
    this.main = {
      name: 'main',
      path: mainPath,
      oldPackage: mainPackage,
      newPackage: {...mainPackage},
    };
    this.init();
  }

  private init() {
    const mainPkg = this.main.oldPackage;
    this.names = getAllLibNames();
    for (const name of this.names) {
      const path = getPath('libs', name);
      const oldPackage = readJsonFileSync(path);
      oldPackage.author = mainPkg.author;
      oldPackage.repository = mainPkg.repository;
      oldPackage.homepage = `${mainPkg.homepage}/libs/${name}`;
      const newPackage = {...oldPackage};
      newPackage.version = mainPkg.version;
      this.data[name] = { name, path, oldPackage, newPackage };
    }
  }

  public build() {
    const ok = this._buildAll();
    if (!ok) {
      this._rollback();
    }
  }

  private _rollback() {
    for (const name of this.names) {
      const info = this.data[name];
      writeJsonFileSync(info.path, info.oldPackage);
    }
  }

  private _buildAll() {
    let n = 0;
    for (const name of this.names) {
      const info = this.data[name];
      writeJsonFileSync(info.path, info.newPackage);
      const ok = this._buildLib(name);
      if (ok) {
        n++;
        console.log(bold(green('SUCCESS:')), green(`${name} build success.`));
      } else {
        console.log(bold(red('FAILED:')), red(`${name} build failed.`));
        break;
      }
    }
    return n === this.names.length;
  }

  private _buildLib(name: string) {
    let result: string = '';
    try {
      result = exec(`npx nx build ${name}`, { silent: true }).stdout;
    } catch (ex) {}
    return isBuildSuccess(result, name);
  }
}

interface PackageInfo {
  name: string;
  path: string;
  oldPackage: any;
  newPackage: any;
}
