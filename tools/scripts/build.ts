import { Builder } from './common/builder';

export async function build() {
  const builder = new Builder();
  await builder.build();
}

if (require.main == module) {
  build();
}
