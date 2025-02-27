import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { readJsonInTree, serializeJson } from '@nrwl/workspace';
import * as path from 'path';
import { createTestUILib } from '../utils/testing';
import { SupportedStyles } from '../../stencil-core-utils';

describe('update-0-1-0', () => {
  let initialTree: Tree;
  let schematicRunner: SchematicTestRunner;

  beforeEach(async () => {
    schematicRunner = new SchematicTestRunner(
      '@nxext/stencil',
      path.join(__dirname, '../../../migrations.json')
    );
  });

  Object.keys(SupportedStyles).forEach((style) => {
    it(`should update component schematics config with ${style}`, async () => {
      const projectName = 'testlib';
      initialTree = await createTestUILib(projectName, SupportedStyles[style]);
      initialTree.overwrite(
        'workspace.json',
        serializeJson({
          version: 1,
          projects: {
            testlib: {
              projectType: 'library',
              root: 'libs/testlib',
              sourceRoot: 'libs/testlib/src',
              architect: {
                build: {
                  builder: '@nxext/stencil:build',
                  options: {
                    projectType: 'library',
                    configPath: 'libs/testlib/stencil.config.ts',
                  },
                },
                test: {
                  builder: '@nxext/stencil:test',
                  options: {
                    projectType: 'library',
                    configPath: 'libs/testlib/stencil.config.ts',
                  },
                },
                e2e: {
                  builder: '@nxext/stencil:e2e',
                  options: {
                    projectType: 'library',
                    configPath: 'libs/testlib/stencil.config.ts',
                  },
                },
                serve: {
                  builder: '@nxext/stencil:serve',
                  options: {
                    projectType: 'library',
                    configPath: 'libs/testlib/stencil.config.ts',
                  },
                },
              },
            },
          },
          cli: {
            defaultCollection: '@nxext/stencil',
          },
          schematics: {
            '@nrwl/workspace': {
              library: {
                linter: 'eslint',
              },
            },
            '@nrwl/cypress': {
              'cypress-project': {
                linter: 'eslint',
              },
            },
            '@nrwl/react': {
              application: {
                linter: 'eslint',
              },
              library: {
                linter: 'eslint',
              },
              'storybook-configuration': {
                linter: 'eslint',
              },
            },
            '@nrwl/next': {
              application: {
                linter: 'eslint',
              },
            },
            '@nrwl/web': {
              application: {
                linter: 'eslint',
              },
            },
            '@nrwl/node': {
              application: {
                linter: 'eslint',
              },
              library: {
                linter: 'eslint',
              },
            },
            '@nrwl/nx-plugin': {
              plugin: {
                linter: 'eslint',
              },
            },
            '@nrwl/nest': {
              application: {
                linter: 'eslint',
              },
            },
            '@nrwl/express': {
              application: {
                linter: 'eslint',
              },
              library: {
                linter: 'eslint',
              },
            },
          },
        })
      );

      initialTree = await schematicRunner
        .runSchematicAsync('update-0-1-0', {}, initialTree)
        .toPromise();

      const workspaceJson = readJsonInTree(initialTree, '/workspace.json');

      expect(workspaceJson.projects[projectName].schematics).toMatchObject({
        '@nxext/stencil:component': {
          style: style,
          storybook: false,
        },
      });
    });
  });
});
