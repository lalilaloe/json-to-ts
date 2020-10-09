import { InterfaceDescription, KeyMetaData, NameEntry, TypeStructure } from "./model";
import { findTypeById, isHash, isNonArrayUnion } from "./util";

function isKeyNameValid(keyName: string) {
  const regex = /^[a-zA-Z_][a-zA-Z\d_]*$/;
  return regex.test(keyName);
}

function parseKeyMetaData(key: string): KeyMetaData {
  const isOptional = key.endsWith("--?");

  if (isOptional) {
    return {
      isOptional,
      keyValue: key.slice(0, -3)
    };
  } else {
    return {
      isOptional,
      keyValue: key
    };
  }
}

function findNameById(id: string, names: NameEntry[]): string {
  return names.find(_ => _.id === id).name;
}

function removeNullFromUnion(unionTypeName: string) {
  const typeNames = unionTypeName.split(" | ");
  const nullIndex = typeNames.indexOf("null");
  typeNames.splice(nullIndex, 1);
  return typeNames.join(" | ");
}

function replaceTypeObjIdsWithNames(typeObj: { [index: string]: string }, names: NameEntry[]): object {
  return (
    Object.entries(typeObj)
      // quote key if is invalid and question mark if optional from array merging
      .map(([key, type]): [string, string, boolean] => {
        const { isOptional, keyValue } = parseKeyMetaData(key);
        const isValid = isKeyNameValid(keyValue);

        const validName = isValid ? keyValue : `'${keyValue}'`;

        return isOptional ? [`${validName}?`, type, isOptional] : [validName, type, isOptional];
      })
      // replace hashes with names referencing the hashes
      .map(([key, type, isOptional]): [string, string, boolean] => {
        if (!isHash(type)) {
          return [key, type, isOptional];
        }
        const newType = findNameById(type, names);
        return [key, newType, isOptional];
      })
      // if union has null, remove null and make type optional
      .map(([key, type, isOptional]): [string, string, boolean] => {
        if (!(isNonArrayUnion(type) && type.includes("null"))) {
          return [key, type, isOptional];
        }

        const newType = removeNullFromUnion(type);
        const newKey = isOptional ? key : `${key}?`; // if already optional dont add question mark
        return [newKey, newType, isOptional];
      })
      // make null optional and set type as any
      .map(([key, type, isOptional]): [string, string, boolean] => {
        if (type !== "null") {
          return [key, type, isOptional];
        }

        const newType = "any";
        const newKey = isOptional ? key : `${key}?`; // if already optional dont add question mark
        return [newKey, newType, isOptional];
      })
      .reduce((agg, [key, value]) => {
        agg[key] = value;
        return agg;
      }, {})
  );
}

export function getInterfaceStringFromDescription({ name, typeMap }: InterfaceDescription): string {
  const stringTypeMap = Object.entries(typeMap)
    .map(([key, name]) => `  ${key}: ${name};\n`)
    .reduce((a, b) => (a += b), "");

  let interfaceString = `interface ${name} {\n`;
  interfaceString += stringTypeMap;
  interfaceString += "}";

  return interfaceString;
}

const subClasses: any = {}

function isSubClass(name: string) {
  return Object.keys(subClasses).find(s => s === name)
}

export function getExplicitRef(key: string, typeName: string = '') {
  if (/[\[\]]/g.test(typeName)) {
    typeName = key.replace(/.*\[|]|\'/g, '') + '[]';
  } else {
    typeName = key.replace(/.*\[|]|\'/g, ''); // Get part between brackets ex. 'before[Between]'
  }
  key = key.replace(/\[.*\]|\'/g, ''); // Get part before brackets 
  return { key, typeName }
}

export function getClassStringFromDescription({ name, typeMap }: InterfaceDescription): string {
  const stringTypeMap = Object.entries(typeMap)
    .map(([key, typeName]) => { // TODO: move to function
      if (/\+/g.test(key)) { // In case of a subClass
        subClasses[typeName] = name
        return ''; // Discard property from parent
      }
      if (/[\[\]]/g.test(key)) { // In case of an explicitRef
        const explicitRef = getExplicitRef(key, typeName);
        key = explicitRef.key;
        typeName = explicitRef.typeName;
      }
      return `  ${key}: ${typeName};\n`;
    })
    .reduce((a, b) => (a += b), "");

  let classString = `class ${name} `;
  if (isSubClass(name)) {
    classString += `extends ${subClasses[name]} `
  }
  classString += '{\n' + stringTypeMap;
  classString += "}";

  return classString;
}

export function getInterfaceDescriptions(typeStructure: TypeStructure, names: NameEntry[]): InterfaceDescription[] {
  return names
    .map(({ id, name }) => {
      const typeDescription = findTypeById(id, typeStructure.types);
      if (typeDescription.typeObj) {
        const typeMap = replaceTypeObjIdsWithNames(typeDescription.typeObj, names);
        return { name, typeMap };
      } else {
        return null;
      }
    })
    .filter(_ => _ !== null);
}

export function getClassDescriptions(typeStructure: TypeStructure, names: NameEntry[]): InterfaceDescription[] {
  return names
    .map(({ id, name }) => {
      const typeDescription = findTypeById(id, typeStructure.types);
      if (typeDescription.typeObj) {
        const typeMap = replaceTypeObjIdsWithNames(typeDescription.typeObj, names);
        return { name, typeMap };
      } else {
        return null;
      }
    })
    .filter(_ => _ !== null);
}


