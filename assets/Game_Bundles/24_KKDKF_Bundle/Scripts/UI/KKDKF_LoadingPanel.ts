import { _decorator, Component, director, Label, Node, find, ProgressBar, Vec3, v3 } from 'cc';
import { KKDKF_Panel, KKDKF_UIManager } from '../KKDKF_UIManager';
const { ccclass, property } = _decorator;

const pos: Vec3 = v3();

@ccclass('KKDKF_LoadingPanel')
export class KKDKF_LoadingPanel extends Component {

    progressBar: ProgressBar = null;
    refreshHead: boolean = false;
    progressLb: Label = null;

    Show(sceneName: string) {

        this.progressBar = find("ProgressBar", this.node).getComponent(ProgressBar);
        var progressLb = find("ProgressBar/Label", this.node).getComponent(Label);

        this.refreshHead = true;
        director.loadScene(sceneName);
        director.preloadScene(sceneName, (completedCount: number, totalCount: number, item: any) => {
            var progress = completedCount / totalCount;
            if (progress > this.progressBar?.progress) {
                this.progressBar.progress = progress;
                progressLb.string = `${(progress * 100).toFixed()}%`;
            }
        }, () => {

        });
    }

    protected onDisable(): void {
        this.refreshHead = false;
    }

    protected update(dt: number): void {
        if (this.refreshHead) {
            pos.set(this.progressBar.progress * this.progressBar.totalLength - this.progressBar.totalLength / 2, 0, 0);

        }
    }
}