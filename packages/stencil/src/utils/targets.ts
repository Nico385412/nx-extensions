import { TargetConfiguration } from '@nrwl/devkit';
import { LibrarySchema } from '../generators/library/schema';
import { PWASchema } from '../generators/ionic-pwa/schema';
import { ApplicationSchema } from '../generators/application/schema';
import { MakeLibBuildableSchema } from '../generators/make-lib-buildable/schema';
import { ProjectType } from '@nrwl/workspace';

export function getDefaultTargets(
  projectType: ProjectType,
  options:
    | LibrarySchema
    | PWASchema
    | ApplicationSchema
    | MakeLibBuildableSchema
): { [key: string]: TargetConfiguration } {
  return {
    build: getBuildTarget(projectType, options),
    serve: getServeTarget(projectType, options),
    test: getTestTarget(projectType, options),
    e2e: getE2eTarget(projectType, options)
  };
}

export function getBuildTarget(
  projectType: ProjectType,
  options:
    | LibrarySchema
    | PWASchema
    | ApplicationSchema
    | MakeLibBuildableSchema
): TargetConfiguration {
  const tsconfigAddition = projectType === ProjectType.Application ? 'app' : 'lib';
  return {
    executor: '@nxext/stencil:build',
    outputs: ['{options.outputPath}'],
    options: {
      projectType,
      tsConfig: `${options.projectRoot}/tsconfig.${tsconfigAddition}.json`,
      configPath: `${options.projectRoot}/stencil.config.ts`,
      outputPath: `dist/${options.projectRoot}`
    },
    configurations: {
      production: {
        dev: false
      }
    }
  };
}

export function getTestTarget(
  projectType: ProjectType,
  options:
    | LibrarySchema
    | PWASchema
    | ApplicationSchema
    | MakeLibBuildableSchema
): TargetConfiguration {
  const tsconfigAddition = projectType === ProjectType.Application ? 'app' : 'lib';
  return {
    executor: '@nxext/stencil:test',
    outputs: ['{options.outputPath}'],
    options: {
      projectType,
      tsConfig: `${options.projectRoot}/tsconfig.${tsconfigAddition}.json`,
      configPath: `${options.projectRoot}/stencil.config.ts`,
      outputPath: `dist/${options.projectRoot}`
    }
  };
}

export function getE2eTarget(
  projectType: ProjectType,
  options:
    | LibrarySchema
    | PWASchema
    | ApplicationSchema
    | MakeLibBuildableSchema
): TargetConfiguration {
  const tsconfigAddition = projectType === ProjectType.Application ? 'app' : 'lib';
  return {
    executor: '@nxext/stencil:e2e',
    outputs: ['{options.outputPath}'],
    options: {
      projectType,
      tsConfig: `${options.projectRoot}/tsconfig.${tsconfigAddition}.json`,
      configPath: `${options.projectRoot}/stencil.config.ts`,
      outputPath: `dist/${options.projectRoot}`
    }
  };
}

export function getServeTarget(
  projectType: ProjectType,
  options:
    | LibrarySchema
    | PWASchema
    | ApplicationSchema
    | MakeLibBuildableSchema
): TargetConfiguration {
  const tsconfigAddition = projectType === ProjectType.Application ? 'app' : 'lib';
  return {
    executor: `@nxext/stencil:build`,
    outputs: ['{options.outputPath}'],
    options: {
      projectType,
      tsConfig: `${options.projectRoot}/tsconfig.${tsconfigAddition}.json`,
      configPath: `${options.projectRoot}/stencil.config.ts`,
      outputPath: `dist/${options.projectRoot}`,
      serve: true,
      watch: true
    }
  };
}
