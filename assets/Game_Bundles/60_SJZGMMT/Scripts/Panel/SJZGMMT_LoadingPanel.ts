import { _decorator, Component, director, Label, Node, Sprite } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { SJZGMMT_UIManager } from '../SJZGMMT_UIManager';
import { SJZGMMT_Constant } from '../SJZGMMT_Constant';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_LoadingPanel')
export class SJZGMMT_LoadingPanel extends PanelBase {
    @property(Sprite)
    LoadingFG: Sprite = null;
    @property(Label)
    LoadingLabel: Label = null;
    @property(Node)
    Logo: Node = null;
    //第一个参数为要转跳的场景
    Show(...args: any[]): void {
        SJZGMMT_UIManager.Instance.HideAllPanel();
        this.node.active = true;
        // this.LoadingLabel.string = `正在加载：${0}%`;

        const loadScene = (senceName, bundleName = null) => {
            director.loadScene(senceName, () => {
                this.scheduleOnce(() => {//延迟0.5关闭界面
                    SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.LoadingPanel);
                }, 1)
            });
            director.preloadScene(senceName, (completedCount: number, totalCount: number, item: any) => {
                if (this.LoadingFG) {
                    this.LoadingFG.fillRange = this.LoadingFG.fillRange > completedCount / totalCount ? this.LoadingFG.fillRange : completedCount / totalCount;
                }
                if (this.Logo) {
                    this.Logo.x = this.LoadingFG.fillRange * 920 - 460;
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


