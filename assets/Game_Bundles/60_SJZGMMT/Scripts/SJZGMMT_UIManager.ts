import { _decorator, Component, director, easing, find, Input, input, instantiate, isValid, KeyCode, Label, Node, Prefab, SpriteFrame, tween, v3, Vec3 } from 'cc';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { SJZGMMT_Constant, SJZGMMT_PropDataItem } from './SJZGMMT_Constant';
import { SJZGMMT_Incident } from './SJZGMMT_Incident';
import { SJZGMMT_MoneyEffects } from './SJZGMMT_MoneyEffects';
import { SJZGMMT_GameData } from './SJZGMMT_GameData';
import { ProjectEvent, ProjectEventManager } from '../../../Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_UIManager')
export class SJZGMMT_UIManager extends Component {
    @property(Prefab)
    message_box: Prefab = null;
    private _panelDict: any = {}
    private _loadingPanelDict: any = {}
    private static _instance: SJZGMMT_UIManager;
    public static get Instance() {
        if (!this._instance) {
            this._instance = new SJZGMMT_UIManager();
        }

        return this._instance;
    }
    protected onLoad(): void {
        SJZGMMT_UIManager._instance = this;
    }
    start() {
        director.addPersistRootNode(this.node);
        // SJZGMMT_UIManager.Instance.Init();
        this.LoadAllSprite();
        input.on(Input.EventType.KEY_DOWN, (event) => {//注册作弊器
            let keyCode = event.keyCode;
            if (keyCode == KeyCode.KEY_P) {
                SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.CheatPanel);
            }
        });
        if (SJZGMMT_GameData.Instance.GameData[5] == 0) {
            //开启新手引导
            this.node.getChildByPath("Canvas/新手指引").active = true;
        }
    }



    //初始化所有主界面
    public Init(): Promise<void> {
        return new Promise((resolve, reject) => {
            // 获取所有面板路径
            const panelPaths: string[] = [
                SJZGMMT_Constant.Panel.LoadingPanel,
                SJZGMMT_Constant.Panel.WarehousePanel,
                SJZGMMT_Constant.Panel.RolePanel,
                SJZGMMT_Constant.Panel.BazaarPanel
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
                let scriptName = `SJZGMMT_` + panelPath.slice(idxSplit + 1);

                if (this._panelDict.hasOwnProperty(panelPath)) {
                    checkComplete();
                    continue;
                }

                this._loadingPanelDict[panelPath] = true;
                BundleManager.LoadUI("60_SJZGMMT", panelPath, (err: any, node: any) => {
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
        SJZGMMT_UIManager.Instance.SJZGMMT_Emit("关闭页面_" + panelPath)
    }

    //关闭所有界面(功能)
    public HideAllPanel() {
        for (let panelPath in this._panelDict) {
            // 排除LoadingPanel，不进行隐藏
            if (panelPath !== SJZGMMT_Constant.Panel.LoadingPanel) {
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
        let scriptName = `SJZGMMT_` + panelPath.slice(idxSplit + 1);

        if (!args) {
            args = [];
        }
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "三角洲古墓迷途")
        if (this._panelDict.hasOwnProperty(panelPath)) {
            let panel = this._panelDict[panelPath];
            if (isValid(panel)) {
                panel.parent = SJZGMMT_UIManager.Instance.node.getChildByPath("Canvas");
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
                SJZGMMT_UIManager.Instance.SJZGMMT_Emit("打开页面_" + panelPath)
                return;
            }
        }

        this._loadingPanelDict[panelPath] = true;
        BundleManager.LoadUI("60_SJZGMMT", panelPath, (err: any, node: any) => {
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
            SJZGMMT_UIManager.Instance.SJZGMMT_Emit("打开页面_" + panelPath)
            if (isCloseBeforeShow) {
                //如果在显示前又被关闭，则直接触发关闭掉
                this.HidePanel(panelPath);
            }
        }, SJZGMMT_UIManager.Instance.node.getChildByPath("Canvas"));

    }

    //产生钞票特效
    public ShowMoneyEffects(StarWorldPos: Vec3, EndWorldPos: Vec3) {
        SJZGMMT_Incident.Loadprefab("Prefabs/UI/钞票特效").then((pre: Prefab) => {
            let nd = instantiate(pre);
            nd.getComponent(SJZGMMT_MoneyEffects).Begin(StarWorldPos, EndWorldPos, SJZGMMT_UIManager.Instance.node.getChildByPath("Canvas"));
        })
    }
    public PropSprite: Map<string, SpriteFrame> = new Map<string, SpriteFrame>();
    //初始化所有图片
    LoadAllSprite() {
        SJZGMMT_Constant.PropData.forEach((propData: SJZGMMT_PropDataItem) => {
            SJZGMMT_Incident.LoadSprite("Sprites/Prop/" + propData.Name).then((sprite: SpriteFrame) => {
                if (this.PropSprite) {
                    this.PropSprite.set(propData.Name, sprite);
                }
            })
        })
    }
    //通过UImanager获取常用图片
    GetPropSprite(propName: string) {
        return new Promise((resolve, reject) => {
            if (this.PropSprite.has(propName)) {
                resolve && resolve(this.PropSprite.get(propName));
            } else {
                SJZGMMT_Incident.LoadSprite("Sprites/Prop/" + propName).then((sprite: SpriteFrame) => {
                    this.PropSprite.set(propName, sprite);
                    resolve && resolve(sprite);
                })
            }
        })
    }

    //弹出信息框
    public ShowText(txt: string) {
        let nd = instantiate(this.message_box);
        nd.parent = SJZGMMT_UIManager.Instance.node.getChildByPath("Canvas");
        nd.position = v3(0, 0, 0);
        nd.getChildByName("内容").getComponent(Label).string = txt;
        tween(nd).to(1.5, { position: v3(0, 200, 0) }, { easing: "backOut" }).call(() => { nd.destroy() }).start();
    }

    //跨场景监听事件
    public SJZGMMT_On(type: string, callback: Function, target?: any) {
        this.node.on(type, callback, target);
    }
    public SJZGMMT_Off(type: string, callback?: Function, target?: any) {
        this.node.off(type, callback, target);
    }
    public SJZGMMT_Emit(type: string, arg0?: any, arg1?: any, arg2?: any, arg3?: any, arg4?: any) {
        this.node.emit(type, arg0, arg1, arg2, arg3, arg4);
    }
}


