import { createTestUILib } from '../../utils/testing';
import { uniq } from '@nrwl/nx-plugin/testing';
import { names, Tree } from '@nrwl/devkit';
import { outputtargetGenerator } from './add-outputtarget';
import { AddOutputtargetSchematicSchema } from './schema';

describe('schematics:add-outputtarget', () => {
  let tree: Tree;
  const projectName = uniq('testproject');
  const options = { projectName: projectName, publishable: false, skipFormat: false };
  const reactOptions: AddOutputtargetSchematicSchema = {
    ...options,
    unitTestRunner: 'none',
    outputType: 'react'
  };
  const angularOptions: AddOutputtargetSchematicSchema = {
    ...options,
    unitTestRunner: 'none',
    outputType: 'angular'
  };
  const vueOptions: AddOutputtargetSchematicSchema = {
    ...options,
    unitTestRunner: 'none',
    outputType: 'vue'
  };

  beforeEach(async () => {
    tree = await createTestUILib(projectName);
  });

  describe('using react', () => {
    it('should not generate default react library', async () => {
      await outputtargetGenerator(tree, reactOptions);

      expect(
        tree.exists(
          `libs/${projectName}-react/src/lib/${projectName}-react.tsx`
        )
      ).toBeFalsy();
      expect(
        tree.exists(
          `libs/${projectName}-react/src/lib/${projectName}-react.spec.tsx`
        )
      ).toBeFalsy();
      expect(
        tree.exists(
          `libs/${projectName}-react/src/lib/${projectName}-react.css`
        )
      ).toBeFalsy();

      const indexFile: Buffer = tree.read(
        `libs/${projectName}-react/src/index.ts`
      );
      expect(indexFile.toString()).toMatch(
        `export * from './generated/components';`
      );
    });

    it('should add reactOutputTarget', async () => {
      await outputtargetGenerator(tree, reactOptions);

      expect(
        tree.read(
          `libs/${projectName}/stencil.config.ts`
        ).includes(`import { reactOutputTarget } from '@stencil/react-output-target';`)
      ).toBeTruthy();

      expect(
        tree.read(
          `libs/${projectName}/stencil.config.ts`
        ).includes(`reactOutputTarget({`)
      ).toBeTruthy();
    });
  });

  describe('using angular', () => {
    it('should generate default angular library', async () => {
      await outputtargetGenerator(tree, angularOptions);

      const fileName = names(projectName + '-angular').fileName;
      expect(
        tree.exists(
          `libs/${projectName}-angular/src/lib/${fileName}.module.ts`
        )
      ).toBeTruthy();
    });

    it('should add angularOutputTarget', async () => {
      await outputtargetGenerator(tree, angularOptions);

      expect(
        tree.read(
          `libs/${projectName}/stencil.config.ts`
        ).includes(`import { angularOutputTarget, ValueAccessorConfig } from '@stencil/angular-output-target';`)
      ).toBeTruthy();

      expect(
        tree.read(
          `libs/${projectName}/stencil.config.ts`
        ).includes(`const angularValueAccessorBindings: ValueAccessorConfig[] = [];`)
      ).toBeTruthy();

      expect(
        tree.read(
          `libs/${projectName}/stencil.config.ts`
        ).includes(`angularOutputTarget({`)
      ).toBeTruthy();
    });
  });

  describe('using vue', () => {
    it('should add vueOutputTarget', async () => {
      await outputtargetGenerator(tree, vueOptions);

      expect(
        tree.read(
          `libs/${projectName}/stencil.config.ts`
        ).includes(`import { vueOutputTarget, ComponentModelConfig } from '@stencil/vue-output-target';`)
      ).toBeTruthy();

      expect(
        tree.read(
          `libs/${projectName}/stencil.config.ts`
        ).includes(`const vueComponentModels: ComponentModelConfig[] = [];`)
      ).toBeTruthy();

      expect(
        tree.read(
          `libs/${projectName}/stencil.config.ts`
        ).includes(`vueOutputTarget({`)
      ).toBeTruthy();
    });
  });
});
