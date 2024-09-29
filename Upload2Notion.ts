import { Notice, requestUrl,TFile,normalizePath, App } from "obsidian";
import { Client } from "@notionhq/client";
import { markdownToBlocks,  } from "@tryfabric/martian";
import * as yamlFrontMatter from "yaml-front-matter";
import * as yaml from "yaml"
import MyPlugin from "main";
export class Upload2Notion {
	app: MyPlugin;
	notion: Client;
	agent: any;
	constructor(app: MyPlugin) {
		this.app = app;
	}

	async deletePage(notionID:string){
		const response = await requestUrl({
			url: `https://api.notion.com/v1/blocks/${notionID}`,
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + this.app.settings.notionAPI,
				'Notion-Version': '2022-02-22',
			},
			body: ''
		})
		return response;
	}

	// 因为需要解析notion的block进行对比，非常的麻烦，
	// 暂时就直接删除，新建一个page
	async updatePage(notionID:string, title:string, allowTags:boolean, tags:string[], childArr:any) {
		await this.deletePage(notionID)
		const res = await this.createPage(title, allowTags, tags, childArr)
		return res
	}

	async createPage(title:string, allowTags:boolean, tags:string[], childArr: any) {
		const bodyString:any = {
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
					multi_select: allowTags && tags !== undefined ? tags.map(tag => {
						return {"name": tag}
					}) : [],
				},
			},
			children: childArr,
		}

		if(this.app.settings.bannerUrl) {
			bodyString.cover = {
				type: "external",
				external: {
					url: this.app.settings.bannerUrl
				}
			}
		}

		try {
			const response = await requestUrl({
				url: `https://api.notion.com/v1/pages`,
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					// 'User-Agent': 'obsidian.md',
					'Authorization': 'Bearer ' + this.app.settings.notionAPI,
					'Notion-Version': '2021-08-16',
				},
				body: JSON.stringify(bodyString),
			})
			return response;
		} catch (error) {
				new Notice(`network error ${error}`)
		}
	}

	async syncMarkdownToNotion(title:string, allowTags:boolean, tags:string[], markdown: string, nowFile: TFile, app:App, settings:any): Promise<any> {
		let res:any;
		const yamlObj:any = yamlFrontMatter.loadFront(markdown);
		let __content = yamlObj.__content;

		// 添加这个函数来替换 zotero:// 链接
		const replaceZoteroLinks = (content: string): string => {
			return content.replace(/\[([^\]]+)\]\(zotero:\/\/([^)]+)\)/g, '[$1](https://$2)');
		};

		// 在转换为 blocks 之前替换链接
		__content = replaceZoteroLinks(__content);

		const file2Block = markdownToBlocks(__content);

		// 从文档内容中读取 Notion ID
		const notionIdMatch = __content.match(/Notion ID: ([a-f0-9-]+)/);
		const notionID = notionIdMatch ? notionIdMatch[1] : null;

		if(notionID){
				res = await this.updatePage(notionID, title, allowTags, tags, file2Block);
		} else {
			 	res = await this.createPage(title, allowTags, tags, file2Block);
			}
		if (res.status === 200) {
			await this.updateYamlInfo(markdown, nowFile, res, app, settings)
		} else {
			new Notice(`${res.text}`)
		}
		return res
	}

	async updateYamlInfo(yamlContent: string, nowFile: TFile, res: any, app: App, settings: any) {
		let {url, id} = res.json;
		const {notionID} = settings;
		if (notionID !== "") {
			url = url.replace("www.notion.so", `${notionID}.notion.site`);
		}

		try {
			await navigator.clipboard.writeText(url);
		} catch (error) {
			new Notice(`复制链接失败，请手动复制${error}`);
		}

		const fileContent = await nowFile.vault.read(nowFile);
		
		// 定义标记，用于识别需要更新的区域
		const startMarker = "<!-- NOTION-SYNC-START -->";
		const endMarker = "<!-- NOTION-SYNC-END -->";

		// 查找标记之间的内容
		const regex = new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`);
		const notionInfoBlock = `${startMarker}
Notion URL: ${url}
Notion ID: ${id}
${endMarker}`;

		let newContent;
		if (regex.test(fileContent)) {
			// 如果找到了标记，替换其中的内容
			newContent = fileContent.replace(regex, notionInfoBlock);
		} else {
			// 如果没有找到标记，在文件末尾添加
			newContent = `${fileContent}\n\n${notionInfoBlock}`;
		}

		try {
			await nowFile.vault.modify(nowFile, newContent);
		} catch (error) {
			new Notice(`写入文件错误 ${error}`);
		}
	}
}
