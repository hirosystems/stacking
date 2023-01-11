import { readFile } from 'fs/promises';
import sortPackageJson from 'sort-package-json';

async function checkIsSorted() {
  const packageJsonText = (await readFile('package.json')).toString();
  const sortedPackageJsonText = sortPackageJson(packageJsonText);

  if (packageJsonText !== sortedPackageJsonText) {
    return `Contents of \`package.json\` are not sorted with \`sort-package-json\`. Please sort \`package.json\` using,

\`\`\`bash
pnpm sort-package-json
\`\`\`
`;
  }
}

async function checkIsNotUsingRanges() {
  function isVersionRange(version: string): boolean {
    // Should catch most cases when a version range is used, although may raise
    // false positives, for example, when using a url or a repo name
    // containing a hyphen. The second regex tests whether two dots are used,
    // since a version such as "2" corresponds to the range "2.x.x".
    //
    // More info available at
    // https://github.com/npm/node-semver#advanced-range-syntax
    return /^[\^~>]|-/.test(version) || !/^[^.]*\.[^.]*\.[^.]*$/.test(version);
  }

  const packageJsonText = (await readFile('package.json')).toString();
  const packageJson = JSON.parse(packageJsonText);

  const dependencies = packageJson.dependencies;
  const devDependencies = packageJson.devDependencies;

  const dependenciesWithVersionRanges: Array<[string, string]> = [];
  for (let [dependency, version] of Object.entries(dependencies) as Array<[string, string]>) {
    if (isVersionRange(version)) {
      dependenciesWithVersionRanges.push([dependency, version]);
    }
  }

  const devDependenciesWithVersionRanges: Array<[string, string]> = [];
  for (let [devDependency, version] of Object.entries(devDependencies) as Array<[string, string]>) {
    if (isVersionRange(version)) {
      devDependenciesWithVersionRanges.push([devDependency, version]);
    }
  }

  if (dependenciesWithVersionRanges.length > 0 || devDependenciesWithVersionRanges.length > 0) {
    let message =
      'File `package.json` seems to have dependencies with version ranges. Please set a specific version for the following dependencies,\n\n';
    if (dependenciesWithVersionRanges.length > 0) {
      message += `dependencies:
${dependenciesWithVersionRanges.map(entry => `  ${entry[0]}: ${entry[1]}` + '\n')}`;
    }
    if (devDependenciesWithVersionRanges.length > 0) {
      message += `devDependencies:
${devDependenciesWithVersionRanges.map(entry => `  ${entry[0]}: ${entry[1]}` + '\n')}`;
    }
    // remove trailing newline
    message = message.slice(0, -1);
    return message;
  }
}

let hasError = false;

[await checkIsSorted(), await checkIsNotUsingRanges()].forEach(msg => {
  if (msg) {
    hasError = true;
    console.error(msg);
  }
});

if (hasError) process.exit(1);
