import { green, red, bold } from "colorette"

import {
  getAllLibNames,
  readJsonFileSync,
  writeJsonFileSync,
  getPath,
  removeDir,
  execBuildLib,
} from './utils';

export class Builder {
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
    this._init();
  }

  public build() {
    removeDir(getPath('dist'));
    const ok = this._buildAll();
    if (!ok) {
      this._rollback();
    }
    removeDir(getPath('tmp'));
  }

  private _init() {
    const mainPkg = this.main.oldPackage;
    this.names = getAllLibNames();
    for (const name of this.names) {
      const path = getPath('libs', name, 'package.json');
      const oldPackage = readJsonFileSync(path);
      oldPackage.author = mainPkg.author;
      oldPackage.repository = mainPkg.repository;
      oldPackage.homepage = `${mainPkg.homepage}/libs/${name}`;
      const newPackage = {...oldPackage};
      newPackage.version = mainPkg.version;
      this.data[name] = { name, path, oldPackage, newPackage };
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
      const ok = execBuildLib(name);
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
}

interface PackageInfo {
  name: string;
  path: string;
  oldPackage: any;
  newPackage: any;
}
