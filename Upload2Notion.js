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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
exports.Upload2Notion = void 0;
var obsidian_1 = require("obsidian");
var martian_1 = require("@tryfabric/martian");
var yamlFrontMatter = require("yaml-front-matter");
var yaml = require("yaml");
var Upload2Notion = /** @class */ (function () {
    function Upload2Notion(app) {
        this.app = app;
    }
    Upload2Notion.prototype.deletePage = function (notionID) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, obsidian_1.requestUrl)({
                            url: "https://api.notion.com/v1/blocks/".concat(notionID),
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Bearer ' + this.app.settings.notionAPI,
                                'Notion-Version': '2022-02-22',
                            },
                            body: ''
                        })];
                    case 1:
                        response = _a.sent();
                        return [2 /*return*/, response];
                }
            });
        });
    };
    // 因为需要解析notion的block进行对比，非常的麻烦，
    // 暂时就直接删除，新建一个page
    Upload2Notion.prototype.updatePage = function (notionID, title, allowTags, tags, childArr) {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.deletePage(notionID)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.createPage(title, allowTags, tags, childArr)];
                    case 2:
                        res = _a.sent();
                        return [2 /*return*/, res];
                }
            });
        });
    };
    Upload2Notion.prototype.createPage = function (title, allowTags, tags, childArr) {
        return __awaiter(this, void 0, void 0, function () {
            var bodyString, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        bodyString = {
                            parent: {
                                database_id: this.app.settings.databaseID
                            },
                            properties: {
                                Name: {
                                    title: [
                                        {
                                            text: {
                                                content: title,
                                            },
                                        },
                                    ],
                                },
                                Tags: {
                                    multi_select: allowTags && tags !== undefined ? tags.map(function (tag) {
                                        return { "name": tag };
                                    }) : [],
                                },
                            },
                            children: childArr,
                        };
                        if (this.app.settings.bannerUrl) {
                            bodyString.cover = {
                                type: "external",
                                external: {
                                    url: this.app.settings.bannerUrl
                                }
                            };
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, obsidian_1.requestUrl)({
                                url: "https://api.notion.com/v1/pages",
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    // 'User-Agent': 'obsidian.md',
                                    'Authorization': 'Bearer ' + this.app.settings.notionAPI,
                                    'Notion-Version': '2021-08-16',
                                },
                                body: JSON.stringify(bodyString),
                            })];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response];
                    case 3:
                        error_1 = _a.sent();
                        new obsidian_1.Notice("network error ".concat(error_1));
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Upload2Notion.prototype.syncMarkdownToNotion = function (title, allowTags, tags, markdown, nowFile, app, settings) {
        return __awaiter(this, void 0, void 0, function () {
            var res, yamlObj, __content, replaceZoteroLinks, file2Block, frontmasster, notionID;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        yamlObj = yamlFrontMatter.loadFront(markdown);
                        __content = yamlObj.__content;
                        replaceZoteroLinks = function (content) {
                            return content.replace(/\[([^\]]+)\]\(zotero:\/\/([^)]+)\)/g, '[$1](https://$2)');
                        };
                        // 在转换为 blocks 之前替换链接
                        __content = replaceZoteroLinks(__content);
                        file2Block = (0, martian_1.markdownToBlocks)(__content);
                        return [4 /*yield*/, ((_a = app.metadataCache.getFileCache(nowFile)) === null || _a === void 0 ? void 0 : _a.frontmatter)];
                    case 1:
                        frontmasster = _b.sent();
                        notionID = frontmasster ? frontmasster.notionID : null;
                        if (!notionID) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.updatePage(notionID, title, allowTags, tags, file2Block)];
                    case 2:
                        res = _b.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, this.createPage(title, allowTags, tags, file2Block)];
                    case 4:
                        res = _b.sent();
                        _b.label = 5;
                    case 5:
                        if (!(res.status === 200)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.updateYamlInfo(markdown, nowFile, res, app, settings)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        new obsidian_1.Notice("".concat(res.text));
                        _b.label = 8;
                    case 8: return [2 /*return*/, res];
                }
            });
        });
    };
    Upload2Notion.prototype.updateYamlInfo = function (yamlContent, nowFile, res, app, settings) {
        return __awaiter(this, void 0, void 0, function () {
            var yamlObj, _a, url, id, notionID, error_2, __content, yamlhead, yamlhead_remove_n, __content_remove_n, content, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        yamlObj = yamlFrontMatter.loadFront(yamlContent);
                        _a = res.json, url = _a.url, id = _a.id;
                        notionID = settings.notionID;
                        if (notionID !== "") {
                            // replace url str "www" to notionID
                            url = url.replace("www.notion.so", "".concat(notionID, ".notion.site"));
                        }
                        yamlObj.link = url;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, navigator.clipboard.writeText(url)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _b.sent();
                        new obsidian_1.Notice("\u590D\u5236\u94FE\u63A5\u5931\u8D25\uFF0C\u8BF7\u624B\u52A8\u590D\u5236".concat(error_2));
                        return [3 /*break*/, 4];
                    case 4:
                        yamlObj.notionID = id;
                        __content = yamlObj.__content;
                        delete yamlObj.__content;
                        yamlhead = yaml.stringify(yamlObj);
                        yamlhead_remove_n = yamlhead.replace(/\n$/, '');
                        __content_remove_n = __content.replace(/^\n/, '');
                        content = '---\n' + yamlhead_remove_n + '\n---\n' + __content_remove_n;
                        _b.label = 5;
                    case 5:
                        _b.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, nowFile.vault.modify(nowFile, content)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        error_3 = _b.sent();
                        new obsidian_1.Notice("write file error ".concat(error_3));
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    return Upload2Notion;
}());
exports.Upload2Notion = Upload2Notion;
