import { _decorator, Button, Component, Label, Node, ProgressBar, tween, Vec3 } from 'cc';
import { GeometryVibes_BasePanel } from '../Common/GeometryVibes_BasePanel';
import { GeometryVibes_UIManager } from '../Manager/GeometryVibes_UIManager';
import { GeometryVibes_DataManager, GeometryVibes_GameMode } from '../Manager/GeometryVibes_DataManager';
import { GeometryVibes_GameManager } from '../Manager/GeometryVibes_GameManager';
const { ccclass, property } = _decorator;

@ccclass('GeometryVibes_GameUI')
export class GeometryVibes_GameUI extends GeometryVibes_BasePanel {
    
    @property(Label)
    levelLabel: Label = null; 

    @property(Label)
    materlabel: Label = null; 

    @property(Button)
    pauseButton: Button = null; // 重玩按钮

    @property(ProgressBar)
    progressBar: ProgressBar = null;

    @property(Label)
    progressLabel: Label = null;

    private _isEndless: boolean = false;

    public init(): void {
        super.init();
        this.addButtonClick(this.pauseButton, this.onPauseClick, this);
        this._isEndless = GeometryVibes_DataManager.getInstance().getCurrentGameMode() == GeometryVibes_GameMode.ENDLESS
        if(this._isEndless){
            this.levelLabel.node.active = false;
            this.materlabel.node.parent.active = true;
            this.progressBar.node.active = false;
            this.progressLabel.node.active = false;
        }
        else{
            this.levelLabel.node.active = true;
             this.levelLabel.string = `关卡 ${GeometryVibes_DataManager.getInstance().getCurrentLevel()}`
            this.materlabel.node.parent.active = false;
            this.progressBar.node.active = true;
            this.progressLabel.node.active = true;
        }
        this.updateUI();
    }

    // 设置UI内容
    protected update(dt: number): void {
        if(GeometryVibes_DataManager.getInstance().getIsPaused()&&!GeometryVibes_DataManager.getInstance().getIsPassLevel())
            return;
        this.updateUI();
    }

    updateUI(){
        if(this._isEndless){
             // 设置显示内容
            this.materlabel.string = `${GeometryVibes_DataManager.getInstance().getCurrrentTotalMeters()}m`;
        }
        else{
             let progress = GeometryVibes_DataManager.getInstance().getCurrentProgress();
             if(progress>=1){
                this.progressLabel.string = `100%`;
                this.progressBar.progress = 1;
                return;
             }
            this.progressLabel.string = `${(GeometryVibes_DataManager.getInstance().getCurrentProgress() * 100).toFixed(1)}%`;
            this.progressBar.progress = GeometryVibes_DataManager.getInstance().getCurrentProgress();
        }
    }

   

    // 重玩按钮点击事件
    private onPauseClick(): void {
        // if( GeometryVibes_DataManager.getInstance().getIsPaused())return;
        GeometryVibes_DataManager.getInstance().setIsPausedClicked(true);
        GeometryVibes_GameManager.getInstance().pauseGame();

    }

}
