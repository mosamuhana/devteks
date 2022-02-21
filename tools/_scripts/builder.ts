import { green, red, bold } from "colorette"

import {
  getAllLibNames,
  readJsonFileSync,
  writeJsonFileSync,
  getPath,
  removeDir,
  execBuildLib,
  getNpmPkgVersion,
} from './utils';

export class Builder {
  main!: PackageInfo;
  data: Record<string, PackageInfo> = {};

  get names() { return Object.keys(this.data); }

  public build() {
    if (!this.main) this._init();

    removeDir(getPath('dist'));
    const ok = this._buildAll();
    if (!ok) {
      this._rollback();
    }
    removeDir(getPath('tmp'));
  }

  private _init() {
    const mainPath = getPath('package.json');
    const mainPackage = readJsonFileSync(mainPath);

    const mainPkg = mainPackage;
    const names = getAllLibNames();
    for (const name of names) {
      const path = getPath('libs', name, 'package.json');
      const oldPackage = readJsonFileSync(path);
      oldPackage.author = mainPkg.author;
      oldPackage.repository = mainPkg.repository;
      oldPackage.homepage = `${mainPkg.homepage}/tree/main/libs/${name}`;
      const newPackage = {...oldPackage};
      newPackage.version = mainPkg.version;
      this.data[name] = { name, path, oldPackage, newPackage };
    }

    this.main = {
      name: 'main',
      path: mainPath,
      oldPackage: mainPackage,
      newPackage: {...mainPackage},
    };
  }

  private _rollback() {
    const names = this.names;
    for (const name of names) {
      const info = this.data[name];
      writeJsonFileSync(info.path, info.oldPackage);
    }
  }

  private _buildAll() {
    const names = this.names;
    let n = 0;
    for (const name of names) {
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
    return n === names.length;
  }

  private _getVersions() {
    const pkgNames = this.names.map(k => this.data[k].name as string);
  }
}

interface PackageInfo {
  name: string;
  path: string;
  oldPackage: any;
  newPackage: any;
}
