import { _decorator, Component, director, Label, Node, find, ProgressBar, Vec3, v3, Sprite } from 'cc';
import { XYRZZ_Panel, XYRZZ_UIManager } from '../XYRZZ_UIManager';
const { ccclass, property } = _decorator;

const pos: Vec3 = v3();

@ccclass('XYRZZ_LoadingPanel')
export class XYRZZ_LoadingPanel extends Component {

    progressBar: Sprite = null;
    refreshHead: boolean = false;
    progressLb: Label = null;

    Show(sceneName: string) {

        this.progressBar = find("ProgressBar/Bar", this.node).getComponent(Sprite);
        var progressLb = find("ProgressBar/Label", this.node).getComponent(Label);

        this.refreshHead = true;

        director.preloadScene(sceneName, (completedCount: number, totalCount: number, item: any) => {
            var progress = completedCount / totalCount;
            if (progress > this.progressBar.fillRange) {
                this.progressBar.fillRange = progress;
                progressLb.string = `${(progress * 100).toFixed()}%`;
            }
        }, () => {
            director.loadScene(sceneName, () => {
                XYRZZ_UIManager.Instance.HidePanel(XYRZZ_Panel.XYRZZ_LoadingPanel);
            });
        });
    }

    protected onDisable(): void {
        this.refreshHead = false;
    }


}