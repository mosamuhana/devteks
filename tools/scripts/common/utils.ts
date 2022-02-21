import { join } from 'path';
import { readdir, stat, readFile, writeFile } from 'fs/promises';
import { exec, rm } from 'shelljs';

const ROOT_PATH = process.cwd();

export const getPath = (...args: string[]) => args.length ? join(ROOT_PATH, ...args) : ROOT_PATH;

export const execCommand = (cmd: string) => {
  return new Promise<string | undefined>(resolve => {
    try {
      const result = exec(cmd, { silent: true }).stdout ?? '';
      resolve(result);
    } catch (ex) {}
    resolve(undefined);
  });
}

export const getDirNames = async (dirPath: string) => {
  const files = await readdir(dirPath);
  const promises = files.map(async (file) => {
    const s = await stat(join(dirPath, file));
    return s.isDirectory() ? file : null;
  });
  const dirs = await Promise.all(promises);
  return dirs.filter(x => !!x);
};

export const readJsonFile = async (filePath: string) => JSON.parse(await readFile(filePath, 'utf8'));

export const writeJsonFile = async (filePath: string, data: any) => await writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');

export const removeDir = async (dir: string) => {
  return new Promise<boolean>(resolve => {
    try {
      rm('-rf', dir);
      return resolve(true);
    } catch (ex) {
      return resolve(false);
    }
  });
};
