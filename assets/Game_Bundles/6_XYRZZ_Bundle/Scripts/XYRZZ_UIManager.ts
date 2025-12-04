import { _decorator, AudioSource, Component, error, find, instantiate, isValid, Label, Node, Prefab, resources, tween, UITransform, v2, v3 } from 'cc';
import { XYRZZ_ResourceUtil } from './Utils/XYRZZ_ResourceUtil';
import { XYRZZ_AudioManager } from './XYRZZ_AudioManager';
import { XYRZZ_PoolManager } from './Utils/XYRZZ_PoolManager';

import { XYRZZ_EventManager, XYRZZ_MyEvent } from './XYRZZ_EventManager';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
const { ccclass, property } = _decorator;

export enum XYRZZ_Panel {
    XYRZZ_PrivacyPanel = "Prefabs/XYRZZ_PrivacyPanel",
    XYRZZ_LoadingPanel = "Prefabs/XYRZZ_LoadingPanel",
    XYRZZ_FigurePanel = "Prefabs/XYRZZ_FigurePanel",//人物界面
    XYRZZ_FishingRodPanel = "Prefabs/XYRZZ_FishingRodPanel",//鱼竿界面
    XYRZZ_FishingRodMessage = "Prefabs/XYRZZ_FishingRodMessage",//鱼竿属性界面
    XYRZZ_FishingPoleMessage = "Prefabs/XYRZZ_FishingPoleMessage",//钓法属性界面
    XYRZZ_ConnectorPanel = "Prefabs/XYRZZ_ConnectorPanel",//连点器升级界面
    XYRZZ_FishingPanel = "Prefabs/XYRZZ_FishingPanel",//钓法界面
    XYRZZ_AutomationPanel = "Prefabs/XYRZZ_AutomationPanel",//获取自动点击界面
    XYRZZ_UpLevelPanel = "Prefabs/XYRZZ_UpLevelPanel",//升级界面
    XYRZZ_KnapsackPanel = "Prefabs/XYRZZ_KnapsackPanel",//背包界面
    XYRZZ_PropMessage = "Prefabs/XYRZZ_PropMessage",//道具详细界面
    XYRZZ_Handbook = "Prefabs/XYRZZ_Handbook",//图鉴界面
    XYRZZ_SelectScenePanel = "Prefabs/XYRZZ_SelectScenePanel",//选关界面
    XYRZZ_CombatPanel = "Prefabs/XYRZZ_CombatPanel",//战斗界面
    XYRZZ_SellFishPanel = "Prefabs/XYRZZ_SellFishPanel",//结算卖鱼界面
    XYRZZ_NoviciatePanel = "Prefabs/XYRZZ_NoviciatePanel",//新手礼包界面
    XYRZZ_TaskPanel = "Prefabs/XYRZZ_TaskPanel",//任务界面
    XYRZZ_TreasureboxPanel = "Prefabs/XYRZZ_TreasureboxPanel"//天降宝箱界面
}

@ccclass('XYRZZ_UIManager')
export class XYRZZ_UIManager extends Component {
    private static _instance: XYRZZ_UIManager = null;
    public static get Instance() {
        if (!this._instance) {
            this._instance = new XYRZZ_UIManager();
        }
        return this._instance;
    }

    public static HopHint(str: string) {
        BundleManager.GetBundle("6_XYRZZ_Bundle").load("Prefabs/提示", Prefab, (err, data) => {
            let pre = XYRZZ_PoolManager.Instance.GetNode(data, find("Canvas"));
            pre.getChildByName("文本").getComponent(Label).string = str;
            pre.getChildByName("文本").getComponent(Label).updateRenderData();
            let width: number = pre.getChildByName("文本").getComponent(UITransform).width + 200;
            if (width < 300) width = 300;
            pre.getChildByName("水墨框").getComponent(UITransform).width = width;
            pre.active = true;
            pre.setPosition(v3(0, 0, 0));
            tween(pre)
                .to(1, { position: v3(0, 150, 0) })
                .call(() => {
                    XYRZZ_PoolManager.Instance.PutNode(pre);
                })
                .start();
        }
        )
    }
    //#region 界面管理

    private _panelDict: any = {}
    private _loadingPanelDict: any = {}
    private _arrPopupDialog: any = []

    public isPanelShowing(panelPath: string) {
        if (!this._panelDict.hasOwnProperty(panelPath)) {
            return false;
        }

        let panel = this._panelDict[panelPath];

        return isValid(panel) && panel.active && panel.parent;
    }

    public ShowPanel(panelPath: XYRZZ_Panel, args?: any, cb?: Function) {
        if (this._loadingPanelDict[panelPath]) {
            return;
        }

        let idxSplit = panelPath.lastIndexOf('/');
        let scriptName = panelPath.slice(idxSplit + 1);

        if (!args) {
            args = [];
        }

        if (this._panelDict.hasOwnProperty(panelPath)) {
            let panel = this._panelDict[panelPath];
            if (isValid(panel)) {
                panel.parent = find("Canvas");
                panel.active = true;
                let script = panel.getComponent(scriptName);
                let script2 = panel.getComponent(scriptName.charAt(0).toUpperCase() + scriptName.slice(1));
                XYRZZ_EventManager.Scene.emit("Show_" + panelPath);
                if (script && script.Show) {
                    script.Show.apply(script, args);
                    cb && cb(script);
                } else if (script2 && script2.Show) {
                    script2.Show.apply(script2, args);
                    cb && cb(script2);
                } else {
                    throw `查找不到脚本文件${scriptName}`;
                }

                return;
            }
        }

        this._loadingPanelDict[panelPath] = true;
        XYRZZ_UIManager.LoadUI(panelPath, (err: any, node: any) => {
            //判断是否有可能在显示前已经被关掉了？
            let isCloseBeforeShow = false;
            if (!this._loadingPanelDict[panelPath]) {
                isCloseBeforeShow = true;
            }

            this._loadingPanelDict[panelPath] = false;

            // node.getComponent(UITransformComponent).priority = panelPriority;

            this._panelDict[panelPath] = node;

            let script: any = node.getComponent(scriptName);

            let script2: any = node.getComponent(scriptName.charAt(0).toUpperCase() + scriptName.slice(1));
            XYRZZ_EventManager.Scene.emit("Show_" + panelPath);
            if (script && script.Show) {
                script.Show.apply(script, args);
                cb && cb(script);
            } else if (script2 && script2.Show) {
                script2.Show.apply(script2, args);
                cb && cb(script2);
            } else {
                throw `查找不到脚本文件${scriptName} 或者脚本中没有 Show() 方法...`;
            }

            if (isCloseBeforeShow) {
                //如果在显示前又被关闭，则直接触发关闭掉
                this.HidePanel(panelPath);
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
    public static Load(url: string, type: any, cb: Function = () => { }) {
        BundleManager.GetBundle("6_XYRZZ_Bundle").load(url, (err: any, res: any) => {
            if (err) {
                console.error(res);
                error(err.message || err);
                cb(err, res);
                return;
            }

            cb && cb(null, res);
        })
    }
    public HidePanel(panelPath: string, callback?: Function) {
        XYRZZ_EventManager.Scene.emit("Hide_" + panelPath);
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
    }

    public RefreshPanel(panelPath: string, args?: any) {
        let idxSplit = panelPath.lastIndexOf('/');
        let scriptName = panelPath.slice(idxSplit + 1);

        if (!args) {
            args = [];
        }

        if (this._panelDict.hasOwnProperty(panelPath)) {
            let panel = this._panelDict[panelPath];
            if (isValid(panel)) {
                panel.parent = find("Canvas");
                panel.active = true;
                let script = panel.getComponent(scriptName);
                let script2 = panel.getComponent(scriptName.charAt(0).toUpperCase() + scriptName.slice(1));

                if (script && script.Refresh) {
                    script.Refresh.apply(script, args);
                } else if (script2 && script2.Refresh) {
                    script2.Refresh.apply(script2, args);
                } else {
                    throw `查找不到脚本文件${scriptName}`;
                }

                return;
            }
        }
    }

    /**
     * 将弹窗加入弹出窗队列
     * @param {string} panelPath 
     * @param {string} scriptName 
     * @param {*} param 
     */
    public pushToPopupSeq(panelPath: string, scriptName: string, param: any) {
        let popupDialog = {
            panelPath: panelPath,
            scriptName: scriptName,
            param: param,
            isShow: false
        };

        this._arrPopupDialog.push(popupDialog);

        this._checkPopupSeq();
    }

    /**
     * 将弹窗加入弹出窗队列
     * @param {number} index 
     * @param {string} panelPath 
     * @param {string} scriptName 
     * @param {*} param 
     */
    public insertToPopupSeq(index: number, panelPath: string, param: any) {
        let popupDialog = {
            panelPath: panelPath,
            param: param,
            isShow: false
        };

        this._arrPopupDialog.splice(index, 0, popupDialog);
        //this._checkPopupSeq();
    }

    /**
     * 将弹窗从弹出窗队列中移除
     * @param {string} panelPath 
     */
    public shiftFromPopupSeq(panelPath: string) {
        this.HidePanel(panelPath, () => {
            if (this._arrPopupDialog[0] && this._arrPopupDialog[0].panelPath === panelPath) {
                this._arrPopupDialog.shift();
                this._checkPopupSeq();
            }
        })
    }

    /**
     * 检查当前是否需要弹窗
     */
    private _checkPopupSeq() {
        if (this._arrPopupDialog.length > 0) {
            let first = this._arrPopupDialog[0];

            if (!first.isShow) {
                this.ShowPanel(first.panelPath, first.param);
                this._arrPopupDialog[0].isShow = true;
            }
        }
    }

    //#endregion


}

