import { cd, exec, set } from 'shelljs';
import { green, bold, yellow } from "colorette"

import { ROOT_PATH, getArgs } from './utils';

set('-e');

export async function commit(message: string) {
  cd(ROOT_PATH);
  try {
    exec(`git add -A`, { silent: true });
  } catch (ex) {}
  try {
    exec(`git push origin main`, { silent: true });
  } catch (ex) {}
  console.log(bold(green('COMMIT SUCCESS:')), green(`${message}`));
}

function run() {
  const args = getArgs();
  const msg = args.length > 0 ? args[0] : null;
  if (!msg) {
    console.log(yellow('commit "<commit message>"'));
  } else {
    commit(msg);
  }
}

if (require.main == module) {
  run();
}
