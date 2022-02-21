import { green, red, yellow, bold } from "colorette"
import { cmp } from 'semver';

import { PackageJson } from './common/types';
import { readJsonFile, writeJsonFile, getPath, getDirNames, execCommand } from './common/utils';

async function main() {
  try {
    const libsPath = getPath('libs');
    const mainPath = getPath('package.json');
    const names = await getDirNames(libsPath)
    const mainPackage: PackageJson = await readJsonFile(mainPath);
    const versions = await Promise.all(
      names.map(name => getPackageVersion(`@${mainPackage.name}/${name}`)),
    );
    const newVersion = incVersion(getMaxVersion(versions));
    const oldVersion = mainPackage.version;
    mainPackage.version = newVersion;
    await writeJsonFile(mainPath, mainPackage);
    if (oldVersion == newVersion) {
      console.log(bold(yellow('SUCCESS:')), yellow(`Version already updated ${oldVersion}`));
    } else {
      console.log(bold(green('SUCCESS:')), green(`Version incremented from ${oldVersion} to ${newVersion}`));
    }
  } catch (ex) {
    console.log(bold(red('FAILED:')), red(ex.message));
  }
}

const incVersion = (ver: string) => {
  let [major, minor, patch] = ver.split('.').map(x => parseInt(x));
  patch++;
  if (patch > 10) {
    patch = 0;
    minor++;
    if (minor > 10) {
      minor = 0;
      major++;
    }
  }
  return `${major}.${minor}.${patch}`;
}

const getMaxVersion = (versions: string[]) => {
  versions = versions.sort((a, b) => cmp(a, '>=', b) ? 1 : -1);
  return versions[versions.length - 1];
}

const getPackageVersion = async (pkg: string) => {
  const version = (await execCommand(`npm view ${pkg} version`)) ?? '';
  return version.trim().replace(/^\n*|\n*$/g, '');
};

if (require.main == module) {
  main();
}
