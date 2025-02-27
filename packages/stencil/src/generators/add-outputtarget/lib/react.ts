import { STENCIL_OUTPUTTARGET_VERSION } from '../../../utils/versions';
import { addToGitignore } from '../../../utils/utillities';
import { getDistDir, getRelativePath } from '../../../utils/fileutils';
import * as ts from 'typescript';
import {
  addDependenciesToPackageJson,
  applyChangesToString,
  getWorkspaceLayout,
  readProjectConfiguration,
  Tree
} from '@nrwl/devkit';
import { libraryGenerator } from '@nrwl/react';
import { Linter } from '@nrwl/linter';
import { addToOutputTargets } from '../../../stencil-core-utils';
import { addImport } from '../../../utils/ast-utils';
import { AddOutputtargetSchematicSchema } from '../schema';

export async function prepareReactLibrary(host: Tree, options: AddOutputtargetSchematicSchema) {
  const { libsDir } = getWorkspaceLayout(host);
  const reactProjectName = `${options.projectName}-react`;

  const libraryTarget = await libraryGenerator(host, {
    name: reactProjectName,
    style: 'css',
    publishable: options.publishable,
    component: false,
    skipTsConfig: false,
    skipFormat: true,
    unitTestRunner: 'jest',
    linter: Linter.EsLint
  });

  await addDependenciesToPackageJson(host, {},
    {
      '@stencil/react-output-target': STENCIL_OUTPUTTARGET_VERSION['react']
    });

  host.write(
    `${libsDir}/${reactProjectName}/src/index.ts`,
    `export * from './generated/components';`
  );

  addToGitignore(host, `${libsDir}/${reactProjectName}/**/generated`);

  return libraryTarget;
}

export function addReactOutputtarget(
  tree: Tree,
  projectName: string,
  stencilProjectConfig,
  stencilConfigPath: string,
  stencilConfigSource: ts.SourceFile,
  packageName: string
) {
  const reactProjectConfig = readProjectConfiguration(tree, `${projectName}-react`);
  const realtivePath = getRelativePath(
    getDistDir(stencilProjectConfig.root),
    reactProjectConfig.root
  );

  const changes = applyChangesToString(
    stencilConfigSource.text, [
      ...addImport(stencilConfigSource, `import { reactOutputTarget } from '@stencil/react-output-target';`),
      ...addToOutputTargets(stencilConfigSource,
        `
      reactOutputTarget({
        componentCorePackage: '${packageName}',
        proxiesFile: '${realtivePath}/src/generated/components.ts',
        includeDefineCustomElements: true,
      })
      `
      )
    ]
  );
  tree.write(stencilConfigPath, changes);
}
