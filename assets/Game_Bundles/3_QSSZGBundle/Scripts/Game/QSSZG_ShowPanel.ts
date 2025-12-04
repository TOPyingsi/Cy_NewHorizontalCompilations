import { _decorator, Component, Enum, find, instantiate, isValid, Node, Prefab } from 'cc';
import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
const { ccclass, property } = _decorator;


export enum QSSZG_Panel {
    教程界面 = "Res/Prefabs/FishGame/QSSZG_Course",
    商店界面 = "Res/Prefabs/FishGame/QSSZG_Shop",
    图鉴界面 = "Res/Prefabs/FishGame/QSSZG_handbook",
    统计界面 = "Res/Prefabs/FishGame/QSSZG_statistics",
    切换鱼缸选择界面 = "Res/Prefabs/FishGame/QSSZG_SelectPanel",
    广告界面 = "Res/Prefabs/FishGame/QSSZG_GetMoney",
    LoadingPanel = "Res/Prefabs/QSSZG_LoadingPanel",
}

@ccclass('QSSZG_ShowPanel')
export class QSSZG_ShowPanel extends Component {
    private static _instance: QSSZG_ShowPanel;
    public static get Instance() {
        if (!this._instance) {
            this._instance = new QSSZG_ShowPanel();
        }

        return this._instance;
    }
    protected onLoad(): void {
        QSSZG_ShowPanel._instance = this;
    }
    private _panelDict: any = {}
    private _loadingPanelDict: any = {}
    private _arrPopupDialog: any = []
    public ShowPanel(panelPath: string, args?: any, cb?: Function) {
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
        QSSZG_ShowPanel.LoadUI(panelPath, (err: any, node: any) => {
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

        // if(panelPath == Constant.Panel.WinPanel || panelPath == Constant.Panel.FailPanel){//结算
        //     TreasureBox.ShowTreasureBox();
        // }

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
        BundleManager.GetBundle("3_QSSZGBundle").load(url, type, (err: any, res: any) => {
            if (err) {
                console.error(err.message || err);
                cb(err, res);
                return;
            }

            cb && cb(null, res);
        })
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
}


