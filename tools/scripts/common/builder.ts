import { green, red, bold, yellow } from "colorette"

import { PackageInfo, PackageJson } from './types';
import { readJsonFile, writeJsonFile, getPath, getDirNames, removeDir, execCommand } from './utils';

export class Builder {
  private data: Record<string, PackageInfo>;

  private get names() { return Object.keys(this.data); }

  public async build() {
    let time = Date.now();
    if (!this.data) {
      await this._init();
    }

    await removeDir(getPath('dist'));

    const results = await Promise.all(
      this.names.map(async name => {
        const { path, pkg } = this.data[name];
        let done = false;
        try {
          await writeJsonFile(path, pkg);
          done = await buildLib(name);
        } catch (ex) {}
        return { name, done };
      }),
    );

    for (const { name, done } of results) {
      const pkg = this.data[name].pkg;
      const pkgName = `@devteks/${pkg.name}@${pkg.version}`;
      if (done) {
        console.log(bold(green('SUCCESS:')), green(`${pkgName} build success.`));
      } else {
        console.log(bold(red('FAILED:')), red(`${pkgName} build failed.`));
      }
    }

    await removeDir(getPath('tmp'));

    time = (Date.now() - time) / 1000.0;
    console.log();
    console.log(bold(yellow('Time elapsed:')), yellow(`${time.toFixed(2)} seconds.`));
  }

  private async _init() {
    const libsPath = getPath('libs');
    const mainPath = getPath('package.json');
    const names = await getDirNames(libsPath)
    const mainPkg: PackageJson = await readJsonFile(mainPath);

    const results = await Promise.all(
      names.map(async (name) => {
        const path = getPath('libs', name, 'package.json');
        const pkg: PackageJson = await readJsonFile(path);
        return { name, path, pkg };
      })
    );

    const map: Record<string, PackageInfo> = {};
    for (const { name, path, pkg } of results) {
      pkg.author = mainPkg.author;
      pkg.repository = mainPkg.repository;
      pkg.homepage = `${mainPkg.homepage}/tree/main/libs/${name}`;
      pkg.version = mainPkg.version;
      map[name] = { name, path, pkg };
    }

    this.data = map;
  }
}

const buildLib = async (name: string) => {
  const result = (await execCommand(`npx nx build ${name}`)) ?? '';
  //return result.includes(`Successfully ran target build for project  ${name}`);
  return result.includes('Successfully ran target');
}
