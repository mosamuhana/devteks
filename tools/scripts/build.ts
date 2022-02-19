import { set } from 'shelljs';

import { Builder } from './builder';

set('-e');

export function build() {
  const builder = new Builder();
  builder.build();
}

function run() {
  build();
}

if (require.main == module) {
  run();
}
