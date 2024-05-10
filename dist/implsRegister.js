"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImplsClassesRegisterTableImpl = void 0;
var fs = require("fs");
/** Find all subclasses under path, record className in table for future mapping
 *  className is treated as implementation Id
 *  which should be known by use case to restore a instance
 */
var ImplsClassesRegisterTableImpl = /** @class */ (function () {
    function ImplsClassesRegisterTableImpl() {
        this.registerTable = {};
    }
    ImplsClassesRegisterTableImpl.prototype.register = function (superClassName, registeredCLASS, moduleFileName) {
        if (!this.registerTable[superClassName])
            this.registerTable[superClassName] = {};
        var subclassesTable = this.registerTable[superClassName];
        var subClassName = registeredCLASS.name;
        if (subclassesTable[subClassName])
            throw new Error("CLASS '".concat(subClassName, "' already registered, two classes should not use same name since it will be regarded as impl id."));
        subclassesTable[subClassName] = registeredCLASS;
        // //  console.log(`CLASS '${subClassName}' registered as Impl of superClass ${superClassName}. ${moduleFileName?`Module fileName:'${moduleFileName}'`:''}`);
    };
    ImplsClassesRegisterTableImpl.prototype.findAndRegisterImplsClasses = function (implsLocatedFolder, CLASS) {
        return __awaiter(this, void 0, void 0, function () {
            var parentClassName, dir, _loop_1, this_1, _i, dir_1, dirent;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parentClassName = CLASS.name;
                        if (!implsLocatedFolder.endsWith("/"))
                            implsLocatedFolder += "/";
                        if (!fs.existsSync(implsLocatedFolder))
                            throw new Error("FilePath not existed, path provided: '".concat(implsLocatedFolder, "'"));
                        dir = fs.readdirSync(implsLocatedFolder);
                        _loop_1 = function (dirent) {
                            var moduleFilePath;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        moduleFilePath = implsLocatedFolder + dirent;
                                        console.group("Checking dirent path '".concat(moduleFilePath, "'"));
                                        if (!fs.lstatSync(moduleFilePath).isFile()) return [3 /*break*/, 2];
                                        // if not a js file, skip
                                        if (!dirent.endsWith(".js") && !dirent.endsWith(".ts")) {
                                            return [2 /*return*/, "continue"];
                                        }
                                        return [4 /*yield*/, new Promise(function (reslv1, rejlv1) { return __awaiter(_this, void 0, void 0, function () {
                                                var error_1;
                                                var _this = this;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            _a.trys.push([0, 2, , 3]);
                                                            // console.group(`Checking file '${moduleFilePath}'`);
                                                            return [4 /*yield*/, new Promise(function (reslv2, rejlv2) {
                                                                    Promise.resolve("".concat(moduleFilePath)).then(function (s) { return require(s); }).then(function (exportedModule) {
                                                                        // console.group(`${Object.keys(exportedModule).length} exported elements found.`);
                                                                        for (var _i = 0, _a = Object.entries(exportedModule); _i < _a.length; _i++) {
                                                                            var _b = _a[_i], elementKey = _b[0], elementValue = _b[1];
                                                                            // //  console.log(`Checking element: '${elementKey}'`);
                                                                            if (typeof elementValue !== "function") {
                                                                                // a class type is a function
                                                                                // //  console.log(`Element '${elementKey}' is not a function thus not a Class, skip.`);
                                                                                continue;
                                                                            }
                                                                            // Subclass found when the element has a prototype name same with CLASS name
                                                                            // console.group(`Element '${elementKey}' found as a function. Checking its prototype.`);
                                                                            var prototypeChain = _this.findAllPrototypeNames(elementValue);
                                                                            if (prototypeChain.includes(parentClassName)) {
                                                                                // //  console.log(`Element '${elementKey}' found having prototpe of ${Object.getPrototypeOf(elementValue).name}, is a subclass. Registerd.`);
                                                                                try {
                                                                                    _this.register(parentClassName, elementValue, dirent);
                                                                                }
                                                                                catch (error) {
                                                                                    rejlv2(error);
                                                                                }
                                                                            }
                                                                            else {
                                                                                // //  console.log(`Element '${elementKey}' found having prototpe of ${Object.getPrototypeOf(elementValue).name}, not a subclass, skip.`);
                                                                            }
                                                                            // console.groupEnd();
                                                                        }
                                                                        // console.groupEnd();
                                                                        reslv2(1);
                                                                    });
                                                                })];
                                                        case 1:
                                                            // console.group(`Checking file '${moduleFilePath}'`);
                                                            _a.sent();
                                                            // console.groupEnd();
                                                            reslv1(1);
                                                            return [3 /*break*/, 3];
                                                        case 2:
                                                            error_1 = _a.sent();
                                                            rejlv1(error_1);
                                                            return [3 /*break*/, 3];
                                                        case 3: return [2 /*return*/];
                                                    }
                                                });
                                            }); })];
                                    case 1:
                                        _b.sent();
                                        return [3 /*break*/, 4];
                                    case 2: 
                                    // if is a folder, do a recusively find
                                    // console.group(`Path found as dir, recusively checking dir '${moduleFilePath}'`);
                                    return [4 /*yield*/, this_1.findAndRegisterImplsClasses(moduleFilePath, CLASS)];
                                    case 3:
                                        // if is a folder, do a recusively find
                                        // console.group(`Path found as dir, recusively checking dir '${moduleFilePath}'`);
                                        _b.sent();
                                        _b.label = 4;
                                    case 4: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _i = 0, dir_1 = dir;
                        _a.label = 1;
                    case 1:
                        if (!(_i < dir_1.length)) return [3 /*break*/, 4];
                        dirent = dir_1[_i];
                        return [5 /*yield**/, _loop_1(dirent)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ImplsClassesRegisterTableImpl.prototype.findAndRegisterImplsClassesBatch = function (implsLocatedFolder, CLASSes) {
        return __awaiter(this, void 0, void 0, function () {
            var parentClassesNames, dir, _loop_2, this_2, _i, dir_2, dirent;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parentClassesNames = CLASSes.map(function (c) { return c.name; });
                        if (!implsLocatedFolder.endsWith("/"))
                            implsLocatedFolder += "/";
                        if (!fs.existsSync(implsLocatedFolder))
                            throw new Error("FilePath not existed, path provided: '".concat(implsLocatedFolder, "'"));
                        dir = fs.readdirSync(implsLocatedFolder);
                        _loop_2 = function (dirent) {
                            var moduleFilePath;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        moduleFilePath = implsLocatedFolder + dirent;
                                        if (!fs.lstatSync(moduleFilePath).isFile()) return [3 /*break*/, 2];
                                        // if not a js file, skip
                                        if (!dirent.endsWith(".js") && !dirent.endsWith(".ts")) {
                                            // //  console.log(`Dirent '${dirent}' not a js file, skip.`);
                                            console.groupEnd();
                                            return [2 /*return*/, "continue"];
                                        }
                                        return [4 /*yield*/, new Promise(function (reslv1, rejlv1) { return __awaiter(_this, void 0, void 0, function () {
                                                var error_2;
                                                var _this = this;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            _a.trys.push([0, 2, , 3]);
                                                            // console.group(`Checking file '${moduleFilePath}'`);
                                                            return [4 /*yield*/, new Promise(function (reslv2, rejlv2) {
                                                                    Promise.resolve("".concat(moduleFilePath)).then(function (s) { return require(s); }).then(function (exportedModule) {
                                                                        // console.group(`${Object.keys(exportedModule).length} exported elements found.`);
                                                                        for (var _i = 0, _a = Object.entries(exportedModule); _i < _a.length; _i++) {
                                                                            var _b = _a[_i], elementKey = _b[0], elementValue = _b[1];
                                                                            // //  console.log(`Checking element: '${elementKey}'`);
                                                                            if (typeof elementValue !== "function") {
                                                                                // a class type is a function
                                                                                // //  console.log(`Element '${elementKey}' is not a function thus not a Class, skip.`);
                                                                                continue;
                                                                            }
                                                                            // Subclass found when the element has a prototype name same with CLASS name
                                                                            // console.group(`Element '${elementKey}' found as a function. Checking its prototype.`);
                                                                            var prototypeNames = _this.findAllPrototypeNames(elementValue);
                                                                            var matchedPrototypeName = prototypeNames.find(function (p) { return parentClassesNames.includes(p); });
                                                                            if (matchedPrototypeName) {
                                                                                // //  console.log(`Element '${elementKey}' found having prototpe of ${Object.getPrototypeOf(elementValue).name}, is a subclass. Registerd.`);
                                                                                try {
                                                                                    _this.register(matchedPrototypeName, elementValue, dirent);
                                                                                }
                                                                                catch (error) {
                                                                                    rejlv2(error);
                                                                                }
                                                                            }
                                                                            else {
                                                                                // //  console.log(`Element '${elementKey}' found having prototpe of ${Object.getPrototypeOf(elementValue).name}, not a subclass, skip.`);
                                                                            }
                                                                            // console.groupEnd();
                                                                        }
                                                                        // console.groupEnd();
                                                                        reslv2(1);
                                                                    });
                                                                })];
                                                        case 1:
                                                            // console.group(`Checking file '${moduleFilePath}'`);
                                                            _a.sent();
                                                            // console.groupEnd();
                                                            reslv1(1);
                                                            return [3 /*break*/, 3];
                                                        case 2:
                                                            error_2 = _a.sent();
                                                            rejlv1(error_2);
                                                            return [3 /*break*/, 3];
                                                        case 3: return [2 /*return*/];
                                                    }
                                                });
                                            }); })];
                                    case 1:
                                        _b.sent();
                                        return [3 /*break*/, 4];
                                    case 2: 
                                    // if is a folder, do a recusively find
                                    // console.group(`Path found as dir, recusively checking dir '${moduleFilePath}'`);
                                    return [4 /*yield*/, this_2.findAndRegisterImplsClassesBatch(moduleFilePath, CLASSes)];
                                    case 3:
                                        // if is a folder, do a recusively find
                                        // console.group(`Path found as dir, recusively checking dir '${moduleFilePath}'`);
                                        _b.sent();
                                        _b.label = 4;
                                    case 4:
                                        console.groupEnd();
                                        return [2 /*return*/];
                                }
                            });
                        };
                        this_2 = this;
                        _i = 0, dir_2 = dir;
                        _a.label = 1;
                    case 1:
                        if (!(_i < dir_2.length)) return [3 /*break*/, 4];
                        dirent = dir_2[_i];
                        return [5 /*yield**/, _loop_2(dirent)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ImplsClassesRegisterTableImpl.prototype.findAllPrototypeNames = function (exportedModuleValue) {
        var results = [];
        var checkingClass = exportedModuleValue;
        while (Object.getPrototypeOf(checkingClass) && Object.getPrototypeOf(checkingClass).name !== "") {
            results.push(Object.getPrototypeOf(checkingClass).name);
            checkingClass = Object.getPrototypeOf(checkingClass);
        }
        return results;
    };
    ImplsClassesRegisterTableImpl.prototype.getImplClassByName = function (superClass, subClassName) {
        var superClassName = superClass.name;
        var subclassesTable = this.registerTable[superClassName];
        if (!subclassesTable)
            throw new Error("Super Class ".concat(superClassName, " never registered, cannot be found in register table."));
        // // if not subClassName found return first impl
        // if (!subClassName && Object.values(subclassesTable)[0]) {
        //   return Object.values(subclassesTable)[0];
        // }
        var subclass = subclassesTable[subClassName];
        if (!subclass)
            throw new Error("Sub Class ".concat(subClassName, " never registered under ").concat(superClassName, ", cannot be found in register table."));
        return subclass;
    };
    ImplsClassesRegisterTableImpl.prototype.getClassImpls = function (superClass) {
        var superClassName = superClass.name;
        var implsClasses = this.registerTable[superClassName];
        if (!implsClasses)
            throw new Error("No implements found of superclass ".concat(superClassName));
        return Object.values(implsClasses);
    };
    return ImplsClassesRegisterTableImpl;
}());
exports.ImplsClassesRegisterTableImpl = ImplsClassesRegisterTableImpl;
