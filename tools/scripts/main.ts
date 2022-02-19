import { writeFileSync, readFileSync } from 'fs';
import { cd, pwd, exec, set } from 'shelljs';
import { inc } from "semver"

import { getMainVersion } from './utils';

set('-e');

async function main() {
  const name = 'ngx-qrcode';
  console.log(`version: ${getMainVersion()}`);
}

if (require.main == module) {
  main();
}
