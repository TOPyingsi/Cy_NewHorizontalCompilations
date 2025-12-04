import { _decorator, Component, find, instantiate, isValid, JsonAsset, Node, Prefab, Vec2 } from 'cc';
import { BundleManager } from 'db://assets/Scripts/Framework/Managers/BundleManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { SJZ_PoolManager } from '../SJZ_PoolManager';
const { ccclass, property } = _decorator;

@ccclass('SJZ_UIManager')
export class SJZ_UIManager extends Component {
    @property(JsonAsset)
    SceneDate: JsonAsset | null = null;
    private _panelDict: any = {}
    private _loadingPanelDict: any = {}
    private _arrPopupDialog: any = []
    private static _instance: SJZ_UIManager;
    public static get Instance() {
        if (!this._instance) {
            this._instance = new SJZ_UIManager();
        }

        return this._instance;
    }

    public isPanelShowing(panelPath: string) {
        if (!this._panelDict.hasOwnProperty(panelPath)) {
            return false;
        }

        let panel = this._panelDict[panelPath];

        return isValid(panel) && panel.active && panel.parent;
    }

    public ShowPanel(panelPath: string, args?: any, cb?: Function) {
        if (this._loadingPanelDict[panelPath]) {
            return;
        }

        let idxSplit = panelPath.lastIndexOf('/');
        let scriptName = `SJZ_` + panelPath.slice(idxSplit + 1);

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
        BundleManager.LoadUI(GameManager.GameData.DefaultBundle, panelPath, (err: any, node: any) => {
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

            if (isCloseBeforeShow) {
                //如果在显示前又被关闭，则直接触发关闭掉
                this.HidePanel(panelPath);
            }
        });

    }

    public ShowBundlePanel(bundleName: string, panelPath: string, args?: any, cb?: Function) {
        if (this._loadingPanelDict[`${bundleName}/${panelPath}`]) {
            return;
        }

        let idxSplit = panelPath.lastIndexOf('/');
        let scriptName = panelPath.slice(idxSplit + 1);

        if (!args) {
            args = [];
        }

        if (this._panelDict.hasOwnProperty(`${bundleName}/${panelPath}`)) {
            let panel = this._panelDict[`${bundleName}/${panelPath}`];
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

        this._loadingPanelDict[`${bundleName}/${panelPath}`] = true;

        BundleManager.LoadPrefab(bundleName, panelPath).then((prefab: Prefab) => {
            let node: Node = instantiate(prefab);
            node.setPosition(0, 0, 0);
            find("Canvas").addChild(node);

            //判断是否有可能在显示前已经被关掉了？
            let isCloseBeforeShow = false;
            if (!this._loadingPanelDict[`${bundleName}/${panelPath}`]) {
                isCloseBeforeShow = true;
            }

            this._loadingPanelDict[`${bundleName}/${panelPath}`] = false;

            this._panelDict[`${bundleName}/${panelPath}`] = node;

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
                this.HidePanel(`${bundleName}/${panelPath}`);
            }
        })
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

    public static ShowBroadcast(content: string, path: string, position: Vec2, delay: number = 0.75, tweenType: number = 2) {
        // SJZ_PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, XGTW_Constant.Path.Broadcast, find("Canvas")).then(node => node.getComponent(XGTW_Broadcast).Show(content, path, position, delay, tweenType));
    }
}