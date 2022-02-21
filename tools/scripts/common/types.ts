export interface PackageJson {
  name: string;
  version: string;
  license: string;
  author: any;
  repository: any;
  homepage: string;
}

export interface PackageInfo {
  name: string;
  path: string;
  pkg: PackageJson;
}
