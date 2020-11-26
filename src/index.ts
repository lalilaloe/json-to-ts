import { shim } from "es7-shim/es7-shim";
import { getDescriptions, getExplicitRef, getStringFromDescription } from "./get-interfaces";
import { getNames, normalizeInvalidTypeName, pascalCase } from "./get-names";
import { getTypeStructure, optimizeTypeStructure } from "./get-type-structure";
import { Options } from "./model";
import { isArray, isObject } from "./util";
shim();

export default function JsonToTS(json: any, userOptions?: Options): string[] {
  const defaultOptions: Options = {
    rootName: "RootObject",
    useInterface: true,
  };
  const options = {
    ...defaultOptions,
    ...userOptions,
  };

  /**
   * Parsing currently works with (Objects) and (Array of Objects) not and primitive types and mixed arrays etc..
   * so we shall validate, so we dont start parsing non Object type
   */
  const isArrayOfObjects = isArray(json) && json.length > 0 && json.reduce((a, b) => a && isObject(b), true);

  if (!(isObject(json) || isArrayOfObjects)) {
    throw new Error("Only (Object) and (Array of Object) are supported");
  }

  const typeStructure = getTypeStructure(json);
  /**
   * due to merging array types some types are switched out for merged ones
   * so we delete the unused ones here
   */
  optimizeTypeStructure(typeStructure);

  const names = getNames(typeStructure, options.rootName);

  if (options.useInterface) {
    const interfaceDescriptions = getDescriptions(typeStructure, names);
    return interfaceDescriptions
      .map((description) => getStringFromDescription(description, false, interfaceDescriptions))
      .filter((d) => d);
  } else {
    // TODO: move to function
    // Fixes creating duplicate classes with references ex. property[RefClass]
    const classDescriptions = getDescriptions(typeStructure, names);
    const explicitRefs = classDescriptions.filter((d) => {
      return Object.keys(d.typeMap).find((key) => /[\[\]]/g.test(key));
    });
    if (explicitRefs && explicitRefs.length) {
      for (const ref of explicitRefs) {
        const keysWithExplicitRef = Object.keys(ref.typeMap).filter((key) => /[\[\]]/g.test(key));
        for (const propertyKey of keysWithExplicitRef) {
          const nameOfIncorrectClass = pascalCase(normalizeInvalidTypeName(propertyKey));
          const indexOfIncorrectRef = classDescriptions.indexOf(
            classDescriptions.find((c) => c && c.name === nameOfIncorrectClass)
          );
          if (classDescriptions[indexOfIncorrectRef]) {
            if (Object.keys(classDescriptions[indexOfIncorrectRef].typeMap).length) {
              // In case only the name is incorrect, but does contain properties. It is processed as a new class
              const { key, typeName } = getExplicitRef(propertyKey, "");
              classDescriptions[indexOfIncorrectRef].name = typeName; // Give correct name
            } else {
              // TODO: Give warning if referenced class is not found
              delete classDescriptions[indexOfIncorrectRef]; // If name is incorrect and no properties exist, ex. property[RefClass] = {}. prevent making duplicate classes
            }
          }
          //console.log(nameOfIncorrectClass)
        }
      }
    }

    return classDescriptions
      .map((description) => getStringFromDescription(description, true, classDescriptions))
      .filter((d) => d);
  }
}

(<any>JsonToTS).default = JsonToTS;
module.exports = JsonToTS;
