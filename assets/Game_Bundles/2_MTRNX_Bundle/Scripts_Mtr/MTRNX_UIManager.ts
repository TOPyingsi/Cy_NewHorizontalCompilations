import { _decorator, AudioSource, Component, director, EventHandler, find, game, instantiate, isValid, JsonAsset, Label, log, Node, Prefab, resources, size, Sprite, SpriteAtlas, SpriteFrame, tween, v2, v3, Vec2, Vec3 } from 'cc';

import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import Banner, { BannerMode } from '../../../Scripts/Banner';
import { UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import { MTRNX_ResourceUtil } from './Utils/MTRNX_ResourceUtil';

const { ccclass, property } = _decorator;

export enum MTRNX_Panel {
    PrivacyPanel = "Prefabs/UI/PrivacyPanel_Main",
    SelectLvPanel = "Prefabs/UI/MTRNX_SelectLvPanel",
    GamePanel = "Prefabs/UI/MTRNX_GamePanel_Mtr",
    LoadingPanel = "Prefabs/UI/MTRNX_LoadingPanel",
    DialogPanel = "Prefabs/UI/MTRNX_DialogPanel_Mtr",
    TipPanel = "Prefabs/UI/MTRNX_TipPanel_Main",
    RewardPanel = "Prefabs/UI/MTRNX_RewardPanel",
    Shopping = "Prefabs/UI/MTRNX_Shoping",
    ChallengePanel = "Prefabs/UI/MTRNX_ChallengePanel",
    miniGameSelect = "Prefabs/UI/MTRNX_miniGameSelect",
    SuperShop = "Prefabs/UI/MTRNX_SuperShop",
    LotteryPanel = "Prefabs/UI/MTRNX_LotteryPanel",
    acquireMoneyPanel = "Prefabs/UI/MTRNX_acquireMoneyPanel",
    evolutionPanel = "Prefabs/UI/MTRNX_evolutionPanel",
    limitPanel = "Prefabs/UI/MTRNX_limitPanel",
    SeletGamePanel = "Prefabs/UI/MTRNX_SeletGamePanel",
}

@ccclass('MTRNX_UIManager')
export class MTRNX_UIManager extends Component {
    private static _instance: MTRNX_UIManager = null;
    public static get Instance() {
        if (!this._instance) {
            this._instance = new MTRNX_UIManager();
        }
        return this._instance;
    }


    public static HopHint(str: string) {
        UIManager.ShowTip(str);
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

    public ShowPanel(panelPath: MTRNX_Panel, args?: any, cb?: Function) {
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
        MTRNX_ResourceUtil.LoadUI(panelPath, (err: any, node: any) => {
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
    //弹出宝箱
    Treasure_box() {
        if (Banner.Mode == BannerMode.测试包) {
            return;
        }
        BundleManager.GetBundle("2_MTRNX_Bundle").load("Prefabs/UI/宝箱", Prefab, (err, event) => {
            if (err) {
                console.log("没有找到宝箱资源");
                return;
            }
            let pre = instantiate(event);
            pre.setParent(find("Canvas"));
        })

    }

}

