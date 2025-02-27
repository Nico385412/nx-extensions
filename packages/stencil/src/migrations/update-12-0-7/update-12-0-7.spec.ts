import { Tree, updateJson, readJson } from '@nrwl/devkit';
import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { default as update } from './update-12-0-7';

describe('update-12-0-7', () => {
  let tree: Tree;

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
  });

  it(`should update generator definition`, async () => {
    updateJson(tree, 'workspace.json', workspaceJson => {
      workspaceJson.projects.app = {
        "root": "apps/app",
        "targets": {
          "build": {
            "builder": "@nxext/stencil:build",
            "outputs": ["{options.outputPath}"],
            "options": {
              "projectType": "application",
              "tsConfig": "apps/app/tsconfig.app.json",
              "configPath": "apps/app/stencil.config.ts"
            },
            "configurations": {
              "production": {
                "dev": false
              }
            }
          },
          "serve": {
            "builder": "@nxext/stencil:build",
            "outputs": ["{options.outputPath}"],
            "options": {
              "projectType": "application",
              "tsConfig": "apps/app/tsconfig.app.json",
              "configPath": "apps/app/stencil.config.ts",
              "serve": true,
              "watch": true
            }
          },
          "test": {
            "builder": "@nxext/stencil:test",
            "outputs": ["{options.outputPath}"],
            "options": {
              "projectType": "application",
              "tsConfig": "apps/app/tsconfig.app.json",
              "configPath": "apps/app/stencil.config.ts"
            }
          },
          "e2e": {
            "builder": "@nxext/stencil:e2e",
            "outputs": ["{options.outputPath}"],
            "options": {
              "projectType": "application",
              "tsConfig": "apps/app/tsconfig.app.json",
              "configPath": "apps/app/stencil.config.ts"
            }
          }
        }
      }

      return workspaceJson;
    });

    await update(tree);
    const workspaceJson = readJson(tree, 'workspace.json');

    expect(workspaceJson.projects.app.targets.build.options?.outputPath)
      .toEqual("dist/apps/app");
    expect(workspaceJson.projects.app.targets.test.options?.outputPath)
      .toEqual("dist/apps/app");
    expect(workspaceJson.projects.app.targets.e2e.options?.outputPath)
      .toEqual("dist/apps/app");
    expect(workspaceJson.projects.app.targets.serve.options?.outputPath)
      .toEqual("dist/apps/app");
  });
});
