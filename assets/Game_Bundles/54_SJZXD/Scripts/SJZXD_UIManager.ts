import { _decorator, Component, director, easing, find, Input, input, instantiate, isValid, KeyCode, Label, Node, Prefab, SpriteFrame, tween, v3, Vec3 } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { SJZXD_Constant, SJZXD_PropDataItem } from './SJZXD_Constant';
import { SJZXD_Incident } from './SJZXD_Incident';
import { SJZXD_MoneyEffects } from './SJZXD_MoneyEffects';
import { SJZXD_GameData } from './SJZXD_GameData';
import { SJZXD_EventManager } from './SJZXD_EventManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_UIManager')
export class SJZXD_UIManager extends Component {
    @property(Prefab)
    message_box: Prefab = null;
    private _panelDict: any = {}
    private _loadingPanelDict: any = {}
    private static _instance: SJZXD_UIManager;
    public static get Instance() {
        if (!this._instance) {
            this._instance = new SJZXD_UIManager();
        }

        return this._instance;
    }
    protected onLoad(): void {
        SJZXD_UIManager._instance = this;
    }
    start() {
        director.addPersistRootNode(this.node);
        // SJZXD_UIManager.Instance.Init();
        this.LoadAllSprite();
        this.schedule(() => {
            SJZXD_GameData.DateSave();
        }, 5);
        input.on(Input.EventType.KEY_DOWN, (event) => {//注册作弊器
            let keyCode = event.keyCode;
            if (keyCode == KeyCode.KEY_P) {
                SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.CheatPanel);
            }
        });
        if (SJZXD_GameData.Instance.GameData[5] == 0) {
            //开启新手引导
            this.node.getChildByPath("Canvas/新手指引").active = true;
        }
    }



    //初始化所有主界面
    public Init(): Promise<void> {
        return new Promise((resolve, reject) => {
            // 获取所有面板路径
            const panelPaths: string[] = [
                SJZXD_Constant.Panel.LoadingPanel,
                SJZXD_Constant.Panel.WarehousePanel,
                SJZXD_Constant.Panel.RolePanel,
                SJZXD_Constant.Panel.BazaarPanel
            ];
            if (panelPaths.length === 0) {
                resolve();
                return;
            }
            let loadedCount = 0;
            const totalPanels = panelPaths.length;
            const checkComplete = () => {
                loadedCount++;
                if (loadedCount >= totalPanels) {
                    console.log("所有UI加载完毕");
                    resolve();
                }
            };
            // 遍历所有面板路径并预加载
            for (const panelPath of panelPaths) {
                if (this._loadingPanelDict[panelPath]) {
                    checkComplete();
                    continue;
                }

                let idxSplit = panelPath.lastIndexOf('/');
                let scriptName = `SJZXD_` + panelPath.slice(idxSplit + 1);

                if (this._panelDict.hasOwnProperty(panelPath)) {
                    checkComplete();
                    continue;
                }

                this._loadingPanelDict[panelPath] = true;
                BundleManager.LoadUI("54_SJZXD", panelPath, (err: any, node: any) => {
                    this._loadingPanelDict[panelPath] = false;
                    if (err) {
                        console.error(`预加载面板失败: ${panelPath}`, err);
                        checkComplete();
                        return;
                    }
                    // 将面板添加到字典但不激活
                    this._panelDict[panelPath] = node;
                    node.parent = null;
                    node.active = false;
                    checkComplete();
                });
            }
        });
    }
    //*** 路径 或者 Bundle名称/路径 */
    public HidePanel(panelPath: string, callback?: Function) {
        if (this._panelDict.hasOwnProperty(panelPath)) {
            let panel = this._panelDict[panelPath];
            if (panel && isValid(panel)) {
                let ani = panel.getComponent('animationUI');
                if (ani) {
                    ani.close(() => {
                        panel.parent = null;
                        if (callback && typeof callback === 'function') {
                            callback();
                        }
                    });
                } else {
                    panel.parent = null;
                    if (callback && typeof callback === 'function') {
                        callback();
                    }
                }
            } else if (callback && typeof callback === 'function') {
                callback();
            }
        }

        this._loadingPanelDict[panelPath] = false;
        SJZXD_UIManager.Instance.SJZXD_Emit("关闭页面_" + panelPath)
    }

    //关闭所有界面(功能)
    public HideAllPanel() {
        for (let panelPath in this._panelDict) {
            // 排除LoadingPanel，不进行隐藏
            if (panelPath !== SJZXD_Constant.Panel.LoadingPanel) {
                let panel = this._panelDict[panelPath];
                if (panel && isValid(panel)) {
                    let ani = panel.getComponent('animationUI');
                    if (ani) {
                        ani.close(() => {
                            panel.parent = null;
                        });
                    } else {
                        panel.parent = null;
                        panel.active = false;
                    }
                }
            }
        }
    }

    public ShowPanel(panelPath: string, args?: any, cb?: Function) {
        if (this._loadingPanelDict[panelPath]) {
            return;
        }

        let idxSplit = panelPath.lastIndexOf('/');
        let scriptName = `SJZXD_` + panelPath.slice(idxSplit + 1);

        if (!args) {
            args = [];
        }

        if (this._panelDict.hasOwnProperty(panelPath)) {
            let panel = this._panelDict[panelPath];
            if (isValid(panel)) {
                panel.parent = SJZXD_UIManager.Instance.node.getChildByPath("Canvas");
                panel.active = true;
                // panel.setSiblingIndex(panel.parent.children.length);
                let script = panel.getComponent(scriptName);
                let script2 = panel.getComponent(scriptName.charAt(0).toUpperCase() + scriptName.slice(1));

                if (script && script.Show) {
                    script.Show.apply(script, args);
                    cb && cb(script);
                } else if (script2 && script2.Show) {
                    script2.Show.apply(script2, args);
                    cb && cb(script2);
                } else {
                    throw `查找不到脚本文件${scriptName}`;
                }
                SJZXD_UIManager.Instance.SJZXD_Emit("打开页面_" + panelPath)
                return;
            }
        }

        this._loadingPanelDict[panelPath] = true;
        BundleManager.LoadUI("54_SJZXD", panelPath, (err: any, node: any) => {
            //判断是否有可能在显示前已经被关掉了？
            let isCloseBeforeShow = false;
            if (!this._loadingPanelDict[panelPath]) {
                isCloseBeforeShow = true;
            }

            this._loadingPanelDict[panelPath] = false;

            this._panelDict[panelPath] = node;

            let script: any = node.getComponent(scriptName);

            let script2: any = node.getComponent(scriptName.charAt(0).toUpperCase() + scriptName.slice(1));

            if (script && script.Show) {
                script.Show.apply(script, args);
                cb && cb(script);
            } else if (script2 && script2.Show) {
                script2.Show.apply(script2, args);
                cb && cb(script2);
            } else {
                throw `查找不到脚本文件${scriptName} 或者脚本中没有 Show() 方法...`;
            }
            SJZXD_UIManager.Instance.SJZXD_Emit("打开页面_" + panelPath)
            if (isCloseBeforeShow) {
                //如果在显示前又被关闭，则直接触发关闭掉
                this.HidePanel(panelPath);
            }
        }, SJZXD_UIManager.Instance.node.getChildByPath("Canvas"));

    }

    //产生钞票特效
    public ShowMoneyEffects(StarWorldPos: Vec3, EndWorldPos: Vec3) {
        SJZXD_Incident.Loadprefab("Prefabs/UI/钞票特效").then((pre: Prefab) => {
            let nd = instantiate(pre);
            nd.getComponent(SJZXD_MoneyEffects).Begin(StarWorldPos, EndWorldPos, SJZXD_UIManager.Instance.node.getChildByPath("Canvas"));
        })
    }
    public PropSprite: Map<string, SpriteFrame> = new Map<string, SpriteFrame>();
    //初始化所有图片
    LoadAllSprite() {
        SJZXD_Constant.PropData.forEach((propData: SJZXD_PropDataItem) => {
            SJZXD_Incident.LoadSprite("Sprites/Prop/" + propData.Name).then((sprite: SpriteFrame) => {
                this.PropSprite.set(propData.Name, sprite);
            })
        })
    }
    //通过UImanager获取常用图片
    GetPropSprite(propName: string) {
        return new Promise((resolve, reject) => {
            if (this.PropSprite.has(propName)) {
                resolve && resolve(this.PropSprite.get(propName));
            } else {
                SJZXD_Incident.LoadSprite("Sprites/Prop/" + propName).then((sprite: SpriteFrame) => {
                    this.PropSprite.set(propName, sprite);
                    resolve && resolve(sprite);
                })
            }
        })
    }

    //弹出信息框
    public ShowText(txt: string) {
        let nd = instantiate(this.message_box);
        nd.parent = SJZXD_UIManager.Instance.node.getChildByPath("Canvas");
        nd.position = v3(0, 0, 0);
        nd.getChildByName("内容").getComponent(Label).string = txt;
        tween(nd).to(1.5, { position: v3(0, 200, 0) }, { easing: "backOut" }).call(() => { nd.destroy() }).start();
    }

    //跨场景监听事件
    public SJZXD_On(type: string, callback: Function, target?: any) {
        this.node.on(type, callback, target);
    }
    public SJZXD_Off(type: string, callback?: Function, target?: any) {
        this.node.off(type, callback, target);
    }
    public SJZXD_Emit(type: string, arg0?: any, arg1?: any, arg2?: any, arg3?: any, arg4?: any) {
        this.node.emit(type, arg0, arg1, arg2, arg3, arg4);
    }
}


