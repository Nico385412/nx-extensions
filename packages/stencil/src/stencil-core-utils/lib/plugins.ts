import * as ts from 'typescript';
import { readTsSourceFile } from '../../utils/ast-utils';
import { applyChangesToString, ChangeType, StringChange, Tree } from '@nrwl/devkit';
import { findNodes } from '@nrwl/workspace/src/utils/ast-utils';

function addCodeIntoArray(
  source: ts.SourceFile,
  identifier: string,
  toInsert: string
): StringChange[] {
  const nodes = findNodes(source, ts.SyntaxKind.ObjectLiteralExpression);
  let node = nodes[0];
  const matchingProperties: ts.ObjectLiteralElement[] = (node as ts.ObjectLiteralExpression).properties
    .filter((prop: ts.ObjectLiteralElementLike) => prop.kind == ts.SyntaxKind.PropertyAssignment)
    .filter((prop: ts.PropertyAssignment) => {
      if (prop.name.kind === ts.SyntaxKind.Identifier) {
        return (prop.name as ts.Identifier).getText(source) == identifier;
      }

      return false;
    });

  if (!matchingProperties) {
    return [];
  }

  if (matchingProperties.length == 0) {
    // We haven't found the field in the metadata declaration. Insert a new field.
    const expr = node as ts.ObjectLiteralExpression;
    let position: number;
    let toInsert2: string;
    if (expr.properties.length == 0) {
      position = expr.getEnd() - 1;
      toInsert2 = `  ${identifier}: [${toInsert}]\n`;
    } else {
      node = expr.properties[expr.properties.length - 1];
      position = node.getEnd();
      // Get the indentation of the last element, if any.
      const text = node.getFullText(source);
      if (text.match('^\r?\r?\n')) {
        toInsert2 = `,${
          text.match(/^\r?\n\s+/)[0]
        }${identifier}: [${toInsert}]`;
      } else {
        toInsert2 = `, ${identifier}: [${toInsert}]`;
      }
    }
    return [
      {
        type: ChangeType.Insert,
        index: position,
        text: `\n${toInsert2}\n`
      }
    ];
  }

  const assignment = matchingProperties[0] as ts.PropertyAssignment;
  if (assignment.initializer.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
    return [];
  }

  const lastItem = getLastEntryOfOutputtargetArray(assignment);

  let toInsert2 = `, ${toInsert}`;
  if (lastItem.getText() === ',') {
    toInsert2 = toInsert;
  }

  return [
    {
      type: ChangeType.Insert,
      index: lastItem.getEnd(),
      text: `\n${toInsert2}\n`
    }
  ];
}

function getLastEntryOfOutputtargetArray(node: ts.Node): ts.Node {
  const arrayEntryList = node.getChildren()[2].getChildren()[1].getChildren();
  return arrayEntryList
    .sort(
      (first: ts.Node, second: ts.Node) => first.getStart() - second.getStart()
    )
    .pop();
}

export function addToOutputTargets(
  source: ts.SourceFile,
  toInsert: string
): StringChange[] {
  const outputTargetsIdentifier = 'outputTargets';
  return addCodeIntoArray(source, outputTargetsIdentifier, toInsert);
}

export function addToOutputTargetsInTree(
  host: Tree,
  outputTargets: string[],
  stencilConfigPath: string
): void {
  const stencilConfigSource: ts.SourceFile = readTsSourceFile(
    host,
    stencilConfigPath
  );

  const changes = applyChangesToString(stencilConfigSource.text, addToOutputTargets(
    stencilConfigSource,
    outputTargets.join(',')
  ));

  host.write(stencilConfigPath, changes);
}

export function addToPlugins(
  source: ts.SourceFile,
  toInsert: string
): StringChange[] {
  const pluginsIdentifier = 'plugins';
  return addCodeIntoArray(source, pluginsIdentifier, toInsert);
}
