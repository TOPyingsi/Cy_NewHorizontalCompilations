import { _decorator, Component, director, Label, Node, Sprite } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { SJZXD_UIManager } from '../SJZXD_UIManager';
import { SJZXD_Constant } from '../SJZXD_Constant';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_LoadingPanel')
export class SJZXD_LoadingPanel extends PanelBase {
    @property(Sprite)
    LoadingFG: Sprite = null;
    @property(Label)
    LoadingLabel: Label = null;
    //第一个参数为要转跳的场景
    Show(...args: any[]): void {
        SJZXD_UIManager.Instance.HideAllPanel();
        this.node.active = true;
        // this.LoadingLabel.string = `正在加载：${0}%`;

        const loadScene = (senceName, bundleName = null) => {
            director.loadScene(senceName, () => {
                this.scheduleOnce(() => {//延迟0.5关闭界面
                    SJZXD_UIManager.Instance.HidePanel(SJZXD_Constant.Panel.LoadingPanel);
                }, 1)
            });
            director.preloadScene(senceName, (completedCount: number, totalCount: number, item: any) => {
                if (this.LoadingFG) {
                    this.LoadingFG.fillRange = this.LoadingFG.fillRange > completedCount / totalCount ? this.LoadingFG.fillRange : completedCount / totalCount;
                }
                if (this.LoadingLabel) {
                    this.LoadingLabel.string = `正在加载：${Math.ceil(completedCount / totalCount * 100)}%`;
                }
            }, () => {
            });
        }
        if (args[0]) {
            loadScene(args[0]);
        }
    }

    Hide(endCb: Function = null): void {
        this.node.active = false;
        endCb && endCb();
    }
}


