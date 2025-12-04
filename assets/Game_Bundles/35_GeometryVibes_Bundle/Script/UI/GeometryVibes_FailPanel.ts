import { _decorator, Button, Component, Label, Node, ProgressBar, tween, Vec3 } from 'cc';
import { GeometryVibes_BasePanel } from '../Common/GeometryVibes_BasePanel';
import { GeometryVibes_UIManager } from '../Manager/GeometryVibes_UIManager';
import { GeometryVibes_DataManager } from '../Manager/GeometryVibes_DataManager';
import { GeometryVibes_GameManager } from '../Manager/GeometryVibes_GameManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('GeometryVibes_FailPanel')
export class GeometryVibes_FailPanel extends GeometryVibes_BasePanel {

    @property(Label)
    failTitle: Label = null; // "FAIL!"标题Label

    @property(Label)
    levelLabel: Label = null; // 关卡ID Label

    @property(ProgressBar)
    progressBar: ProgressBar = null; // 进度条组件

    @property(Label)
    progressLabel: Label = null; // 进度百分比Label

    @property(Button)
    restartButton: Button = null; // 重玩按钮

    @property(Button)
    mainMenuButton: Button = null; // 主界面按钮

    public init(): void {
        super.init();
        this.setupUI();
        ProjectEventManager.emit(ProjectEvent.弹出窗口, "几何冲刺");
    }

    // 设置UI内容
    private setupUI(): void {
        // 读取当前关卡和进度数据
        const currentLevel = GeometryVibes_DataManager.getInstance().getCurrentLevel();
        const currentProgress = GeometryVibes_DataManager.getInstance().getCurrentProgress();

        // 设置显示内容
        this.levelLabel.string = `关卡 ${currentLevel}`;
        this.updateProgress(currentProgress);

        // 绑定按钮事件
        this.addButtonClick(this.restartButton, this.onRestartClick, this);
        this.addButtonClick(this.mainMenuButton, this.onMainMenuClick, this);

        // 启动标题动画
        this.startTitleAnimation();
    }

    // 更新进度显示
    private updateProgress(progress: number): void {
        this.progressBar.progress = progress;
        this.progressLabel.string = `${(progress * 100).toFixed(1)}%`;
    }

    // 启动标题动画(循环缩放)
    private startTitleAnimation(): void {
        tween(this.failTitle.node)
            .repeatForever(
                tween()
                    .to(0.5, { scale: new Vec3(1.2, 1.2, 1) })
                    .to(0.5, { scale: new Vec3(1, 1, 1) })
            )
            .start();
    }

    // 重玩按钮点击事件
    private onRestartClick(): void {
         GeometryVibes_GameManager.getInstance().restartGame();
    }

    // 主界面按钮点击事件
    private onMainMenuClick(): void {
        GeometryVibes_GameManager.getInstance().backToMain();
    }
}
