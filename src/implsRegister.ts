import * as fs from "fs";

export type Constructor<T> = { new (...args: any[]): T };
export type AbstractClass<T> = abstract new (...args: any[]) => T;
export interface ImplsClassesRegisterTable {
  findAndRegisterImplsClasses<SUPERCLASS>(
    implsLocatedDirPath: string,
    CLASS: Constructor<SUPERCLASS> | AbstractClass<SUPERCLASS> | Function,
  ): Promise<void>;
  findAndRegisterImplsClassesBatch(
    implsLocatedFolder: string,
    CLASSs: Array<Constructor<any> | AbstractClass<any> | Function>,
  ): Promise<void>;
  getImplClassByName<SUPERCLASS, SUBCLASS extends SUPERCLASS>(
    superClass: Function | AbstractClass<SUPERCLASS> | Constructor<SUPERCLASS>,
    implClassName?: string,
  ): Constructor<SUBCLASS>;
  getClassImpls<T, K extends T>(superClass: Function|Constructor<T>|AbstractClass<T>): Array<Constructor<K>>;
}

/** Find all subclasses under path, record className in table for future mapping
 *  className is treated as implementation Id
 *  which should be known by use case to restore a instance
 */
export class ImplsClassesRegisterTableImpl implements ImplsClassesRegisterTable {
  registerTable: { [key: string]: { [key: string]: { new (...args: any): any } } } = {};
  constructor() {}


  private register(superClassName: string, registeredCLASS: { new (...args: any): any }, moduleFileName?: string) {
    if (!this.registerTable[superClassName]) this.registerTable[superClassName] = {};
    const subclassesTable = this.registerTable[superClassName];

    const subClassName = registeredCLASS.name;
    if (subclassesTable[subClassName])
      throw new Error(
        `CLASS '${subClassName}' already registered, two classes should not use same name since it will be regarded as impl id.`,
      );

    subclassesTable[subClassName] = registeredCLASS;
    // //  console.log(`CLASS '${subClassName}' registered as Impl of superClass ${superClassName}. ${moduleFileName?`Module fileName:'${moduleFileName}'`:''}`);
  }

  async findAndRegisterImplsClasses<SUPERCLASS>(implsLocatedFolder: string, CLASS: Constructor<SUPERCLASS> | AbstractClass<SUPERCLASS>) {
    let parentClassName = CLASS.name;
    if (!implsLocatedFolder.endsWith("/")) implsLocatedFolder += "/";
    if (!fs.existsSync(implsLocatedFolder)) throw new Error(`FilePath not existed, path provided: '${implsLocatedFolder}'`);

    const dir = fs.readdirSync(implsLocatedFolder);
    // console.group(`Checked dir ${implsLocatedFolder} to find subclasses of ${parentClassName}, ${dir.length} dirents found.`);
    // check each file, register those subclasses of input CLASS
    for (let dirent of dir) {
      const moduleFilePath = implsLocatedFolder + dirent; // checking file path
      console.group(`Checking dirent path '${moduleFilePath}'`);
      /** if is a module file, then check each exported element
       *  If found as a subclass of input CLASS, register it with its class name
       *  else continue to next file
       */
      if (fs.lstatSync(moduleFilePath).isFile()) {
        // if not a js file, skip
        if (!dirent.endsWith(".js") && !dirent.endsWith(".ts")) {
          // //  console.log(`Dirent '${dirent}' not a js file, skip.`);
          continue;
        }

        await new Promise(async (reslv1, rejlv1) => {
          try {
            // console.group(`Checking file '${moduleFilePath}'`);
            await new Promise((reslv2, rejlv2) => {
              import(moduleFilePath).then((exportedModule) => {
                // console.group(`${Object.keys(exportedModule).length} exported elements found.`);
                for (let [elementKey, elementValue] of Object.entries(exportedModule)) {
                  // //  console.log(`Checking element: '${elementKey}'`);
                  if (typeof elementValue !== "function") {
                    // a class type is a function
                    // //  console.log(`Element '${elementKey}' is not a function thus not a Class, skip.`);
                    continue;
                  }
                  // Subclass found when the element has a prototype name same with CLASS name
                  // console.group(`Element '${elementKey}' found as a function. Checking its prototype.`);
                  const prototypeChain = this.findAllPrototypeNames(elementValue);
                  if (prototypeChain.includes(parentClassName)) {
                    // //  console.log(`Element '${elementKey}' found having prototpe of ${Object.getPrototypeOf(elementValue).name}, is a subclass. Registerd.`);
                    try {
                      this.register(parentClassName, elementValue as { new () }, dirent);
                    } catch (error) {
                      rejlv2(error);
                    }
                  } else {
                    // //  console.log(`Element '${elementKey}' found having prototpe of ${Object.getPrototypeOf(elementValue).name}, not a subclass, skip.`);
                  }
                  // console.groupEnd();
                }
                // console.groupEnd();
                reslv2(1);
              });
            });
            // console.groupEnd();
            reslv1(1);
          } catch (error) {
            rejlv1(error);
          }
        });
      } else {
        // if is a folder, do a recusively find
        // console.group(`Path found as dir, recusively checking dir '${moduleFilePath}'`);
        await this.findAndRegisterImplsClasses(moduleFilePath, CLASS);
        // console.groupEnd();
      }
      // console.groupEnd();
    }
    // console.groupEnd();
  }

  async findAndRegisterImplsClassesBatch(implsLocatedFolder: string, CLASSes: Array<Constructor<any> | AbstractClass<any>>) {
    // for (let CLASS of CLASSs) {
    //   await this.findAndRegisterImplsClasses(implsLocatedFolder, CLASS);
    // }

    let parentClassesNames = CLASSes.map((c) => c.name);
    if (!implsLocatedFolder.endsWith("/")) implsLocatedFolder += "/";
    if (!fs.existsSync(implsLocatedFolder)) throw new Error(`FilePath not existed, path provided: '${implsLocatedFolder}'`);

    const dir = fs.readdirSync(implsLocatedFolder);
    // console.group(`Checked dir ${implsLocatedFolder} to find subclasses of ${parentClassName}, ${dir.length} dirents found.`);
    // check each file, register those subclasses of input CLASS
    for (let dirent of dir) {
      const moduleFilePath = implsLocatedFolder + dirent; // checking file path
      // console.group(`Checking dirent path '${moduleFilePath}'`);
      /** if is a module file, then check each exported element
       *  If found as a subclass of input CLASS, register it with its class name
       *  else continue to next file
       */
      if (fs.lstatSync(moduleFilePath).isFile()) {
        // if not a js file, skip
        if (!dirent.endsWith(".js") && !dirent.endsWith(".ts")) {
          // //  console.log(`Dirent '${dirent}' not a js file, skip.`);
          console.groupEnd();
          continue;
        }

        await new Promise(async (reslv1, rejlv1) => {
          try {
            // console.group(`Checking file '${moduleFilePath}'`);
            await new Promise((reslv2, rejlv2) => {
              import(moduleFilePath).then((exportedModule) => {
                // console.group(`${Object.keys(exportedModule).length} exported elements found.`);
                for (let [elementKey, elementValue] of Object.entries(exportedModule)) {
                  // //  console.log(`Checking element: '${elementKey}'`);
                  if (typeof elementValue !== "function") {
                    // a class type is a function
                    // //  console.log(`Element '${elementKey}' is not a function thus not a Class, skip.`);
                    continue;
                  }
                  // Subclass found when the element has a prototype name same with CLASS name
                  // console.group(`Element '${elementKey}' found as a function. Checking its prototype.`);
                  const prototypeNames = this.findAllPrototypeNames(elementValue);
                  const matchedPrototypeName = prototypeNames.find((p) => parentClassesNames.includes(p));
                  if (matchedPrototypeName) {
                    // //  console.log(`Element '${elementKey}' found having prototpe of ${Object.getPrototypeOf(elementValue).name}, is a subclass. Registerd.`);
                    try {
                      this.register(matchedPrototypeName, elementValue as { new () }, dirent);
                    } catch (error) {
                      rejlv2(error);
                    }
                  } else {
                    // //  console.log(`Element '${elementKey}' found having prototpe of ${Object.getPrototypeOf(elementValue).name}, not a subclass, skip.`);
                  }
                  // console.groupEnd();
                }
                // console.groupEnd();
                reslv2(1);
              });
            });
            // console.groupEnd();
            reslv1(1);
          } catch (error) {
            rejlv1(error);
          }
        });
      } else {
        // if is a folder, do a recusively find
        // console.group(`Path found as dir, recusively checking dir '${moduleFilePath}'`);
        await this.findAndRegisterImplsClassesBatch(moduleFilePath, CLASSes);
        // console.groupEnd();
      }
      console.groupEnd();
    }
    // console.groupEnd();
  }

  private findAllPrototypeNames(exportedModuleValue: Function): string[] {
    let results: string[] = [];
    let checkingClass = exportedModuleValue;
    while (Object.getPrototypeOf(checkingClass) && Object.getPrototypeOf(checkingClass).name !== "") {
      results.push(Object.getPrototypeOf(checkingClass).name);
      checkingClass = Object.getPrototypeOf(checkingClass);
    }
    return results;
  }

  getImplClassByName<SUPERCLASS, SUBCLASS extends SUPERCLASS>(
    superClass: Constructor<SUPERCLASS> | AbstractClass<SUPERCLASS>,
    subClassName: string,
  ): Constructor<SUBCLASS> {
    let superClassName = superClass.name;
    const subclassesTable = this.registerTable[superClassName];
    if (!subclassesTable) throw new Error(`Super Class ${superClassName} never registered, cannot be found in register table.`);
    // // if not subClassName found return first impl
    // if (!subClassName && Object.values(subclassesTable)[0]) {
    //   return Object.values(subclassesTable)[0];
    // }
    const subclass = subclassesTable[subClassName];
    if (!subclass)
      throw new Error(`Sub Class ${subClassName} never registered under ${superClassName}, cannot be found in register table.`);
    return subclass;
  }

  getClassImpls<T, K>(superClass: Function|Constructor<T>|AbstractClass<T>): Constructor<K>[] {
    const superClassName = superClass.name;
    const implsClasses = this.registerTable[superClassName];
    if (!implsClasses) throw new Error(`No implements found of superclass ${superClassName}`);
    return Object.values(implsClasses);
  }
}
