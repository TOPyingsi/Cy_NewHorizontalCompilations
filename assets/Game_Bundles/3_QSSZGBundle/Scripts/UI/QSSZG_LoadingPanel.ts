import { _decorator, Component, director, Label, Node, find, ProgressBar, Vec3, v3 } from 'cc';
import { QSSZG_Panel, QSSZG_ShowPanel } from '../Game/QSSZG_ShowPanel';
const { ccclass, property } = _decorator;

const pos: Vec3 = v3();

@ccclass('QSSZG_LoadingPanel')
export class QSSZG_LoadingPanel extends Component {

    progressBar: ProgressBar = null;
    refreshHead: boolean = false;
    progressLb: Label = null;

    Show(sceneName: string) {

        this.progressBar = find("ProgressBar", this.node).getComponent(ProgressBar);
        var progressLb = find("ProgressBar/Label", this.node).getComponent(Label);

        this.refreshHead = true;

        director.preloadScene(sceneName, (completedCount: number, totalCount: number, item: any) => {
            var progress = completedCount / totalCount;
            if (progress > this.progressBar.progress) {
                this.progressBar.progress = progress * 2.5;
                progressLb.string = `${(progress * 100).toFixed()}%`;
            }
        }, () => {
            director.loadScene(sceneName, () => {
                QSSZG_ShowPanel.Instance.HidePanel(QSSZG_Panel.LoadingPanel);
            });
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