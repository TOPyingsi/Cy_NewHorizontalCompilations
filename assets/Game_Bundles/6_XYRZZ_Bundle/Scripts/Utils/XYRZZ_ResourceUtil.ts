import { _decorator, Prefab, Node, SpriteComponent, SpriteFrame, resources, error, instantiate, isValid, find, TextAsset, JsonAsset, director } from "cc";
const { ccclass } = _decorator;

@ccclass("XYRZZ_ResourceUtil")
export class XYRZZ_ResourceUtil {
    public static Load(url: string, type: any, cb: Function = () => { }) {
        resources.load(url, (err: any, res: any) => {
            if (err) {
                console.error(res);
                error(err.message || err);
                cb(err, res);
                return;
            }

            cb && cb(null, res);
        })
    }

    public static LoadPrefab(path: string) {
        return new Promise((resolve, reject) => {
            this.Load(`Prefabs/${path}`, Prefab, (err: any, prefab: Prefab) => {
                if (err) {
                    console.error('Prefab 加载失败：', `Prefabs/${path}`);
                    reject && reject();
                    return;
                }

                resolve && resolve(prefab);
            });
        });
    }

    public static Instantiate(path: string, parent?: Node, cb?: Function) {
        this.Load(`Prefabs/${path}`, Prefab, function (err: any, prefab: Prefab) {
            if (err) {
                error(err.message || err);
                return;
            }

            let node = instantiate(prefab);

            if (parent && isValid(parent)) {
                node.setParent(parent);
            } else {
                node.setParent(node.layer == 1 << 25 ? find("Canvas") : director.getScene());
            }

            cb && cb();
            return node;
        });
    }

    public static LoadEffect(path: string) {
        return new Promise((resolve, reject) => {
            this.Load(`Effects/${path}`, Prefab, (err: any, prefab: Prefab) => {
                if (err) {
                    console.error('Effect 加载失败：', `Effects/${path}`);
                    reject && reject();
                    return;
                }

                resolve && resolve(prefab);
            });
        });
    }

    public static LoadModelRes(modulePath: string) {
        return new Promise((resolve, reject) => {
            this.Load(`Models/${modulePath}`, Prefab, (err: any, prefab: Prefab) => {
                if (err) {
                    console.error("Model 加载失败：", `Models/${modulePath}`);
                    reject && reject();
                    return;
                }

                resolve && resolve(prefab);
            })
        })
    }

    public static LoadModelResArr(path: string, arrName: Array<string>, progressCb: any, completeCb: any) {
        let arrUrls = arrName.map((item) => {
            return `${path}/${item}`;
        })

        resources.load(arrUrls, Prefab, progressCb, completeCb);
    }

    public static LoadSpriteFrame(name: string) {
        return new Promise((resolve, reject) => {
            this.Load(`Sprites/${name}/spriteFrame`, SpriteFrame, (err: any, spriteFrame: SpriteFrame) => {
                if (err) {
                    console.error('SpriteFrame 加载失败：', name, err);
                    reject && reject();
                    return;
                }

                resolve && resolve(spriteFrame);
            })
        })
    }

    public static SetSpriteFrame(path: string, sprite: SpriteComponent, cb: Function = () => { }) {
        this.Load(`Sprites/${path}/spriteFrame`, SpriteFrame, (err: any, spriteFrame: SpriteFrame) => {
            if (err) {
                console.error('设置 SpriteFrame 失败：', path, err);
                cb(err);
                return;
            }

            if (sprite && isValid(sprite)) {
                sprite.spriteFrame = spriteFrame;
                cb(null);
            }
        });
    }

    public static LoadUI(path: string, cb?: Function, parent?: Node) {
        this.Load(path, Prefab, (err: any, prefab: Prefab) => {
            if (err) {
                console.error(`加载 UI 失败：${path}`);
                return;
            }
            let node: Node = instantiate(prefab);
            node.setPosition(0, 0, 0);
            if (!parent) {
                parent = find("Canvas") as Node;
            }

            parent.addChild(node);
            cb && cb(null, node);
        });
    }

    public static LoadJson(name: string) {
        return new Promise((resolve, reject) => {
            this.Load(`Datas/${name}`, JsonAsset, (err: any, json: JsonAsset) => {
                if (err) {
                    reject && reject();
                    return;
                }

                resolve && resolve(json);
            })
        })
    }

    public static LoadText(name: string, cb: Function) {
        this.Load(`Datas/${name}`, null, function (err: any, content: TextAsset) {
            if (err) {
                error(err.message || err);
                return;
            }

            let text: string = content.text;
            cb(err, text);
        });
    }

    public static getData(fileName: string, cb: Function) {
        resources.load(`datas/${fileName}`, function (err: any, content: any) {
            if (err) {
                console.error(err.message || err);
                return;
            }

            var text = content.text;
            if (!text) {
                resources.load(content.nativeUrl, function (err: any, content: any) {
                    text = content;
                    cb(err, text);
                });
                return;
            }

            cb(err, text);
        });
    }

    /**
     * 获取关卡数据
     * @param level 关卡
     * @param cb 回调函数
     */
    public static GetMap(level: number, cb: Function) {
        let levelStr: string = 'map';
        //前面补0
        if (level >= 100) {
            levelStr += level;
        } else if (level >= 10) {
            levelStr += '0' + level;
        } else {
            levelStr += '00' + level;
        }

        this.Load(`map/config/${levelStr}`, null, (err: {}, txtAsset: any) => {
            if (err) {
                cb(err, txtAsset);
                return;
            }

            let content: string = '';
            if (txtAsset._file) {
                //@ts-ignore
                if (window['LZString']) {
                    //@ts-ignore
                    content = window['LZString'].decompressFromEncodedURIComponent(txtAsset._file);
                }
                var objJson = JSON.parse(content);
                cb(null, objJson);
            } else if (txtAsset.text) {
                //@ts-ignore
                if (window['LZString']) {
                    //@ts-ignore
                    content = window['LZString'].decompressFromEncodedURIComponent(txtAsset.text);
                }
                var objJson = JSON.parse(content);
                cb(null, objJson);
            } else if (txtAsset.json) {
                cb(null, txtAsset.json);
            } else {
                cb('failed');
            }
        });
    }

    public static GetMapObj(type: string, arrName: Array<string>, progressCb?: any, completeCb?: any) {
        let arrUrls: string[] = [];
        for (let idx = 0; idx < arrName.length; idx++) {
            arrUrls.push(`map/${type}/${arrName[idx]}`)
        }

        resources.load(arrUrls, Prefab, progressCb, completeCb);
    }
}