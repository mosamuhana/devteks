import { Builder } from './builder';

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
