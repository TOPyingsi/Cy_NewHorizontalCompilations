import { _decorator, Component, director, EventTouch, Label, Node, NodeEventType, PageView, tween, v3, Vec3 } from 'cc';
import { TCS3D_GameData } from './TCS3D_GameData';
import { GameManager } from 'db://assets/Scripts/GameManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
const { ccclass, property } = _decorator;

@ccclass('TCS3D_UIGame')
export class TCS3D_UIGame extends Component {

    @property(Node)
    cameraNode: Node = null;

    @property(Label)
    UILabel: Label = null;

    @property(Node)
    winNode: Node = null;

    bodyLength: number = 1;
    score: number = 0;
    maxScore: number = 0;

    public static isGameOver: boolean = false;

    private lastMousePosition: Vec3 = new Vec3();
    private isDragging: boolean = false;

    start() {
        let cameraNode = this.node.getChildByName("CameraTouch");
        cameraNode.on(NodeEventType.TOUCH_START, this.onMouseDown, this);
        cameraNode.on(NodeEventType.TOUCH_MOVE, this.onMouseMove, this);
        cameraNode.on(NodeEventType.TOUCH_END, this.onMouseUp, this);

        this.UILabel.string = "当前长度：" + this.bodyLength.toString() +
            "米\n当前分数：" + this.score.toString() +
            "\n历史最高：" + TCS3D_GameData.Instance.maxScore.toString();

        director.getScene().on("贪吃蛇3D_得分", this.updateUI, this);

        director.getScene().on("贪吃蛇3D_胜利", this.Win, this);

        this.page = this.node.getChildByName("GameUI").getChildByName("新手教程").getComponentInChildren(PageView);

        ProjectEventManager.emit(ProjectEvent.游戏开始);

    }

    Win() {
        let cameraNode = this.node.getChildByName("CameraTouch");
        cameraNode.off(NodeEventType.TOUCH_START, this.onMouseDown, this);
        cameraNode.off(NodeEventType.TOUCH_MOVE, this.onMouseMove, this);
        cameraNode.off(NodeEventType.TOUCH_END, this.onMouseUp, this);

        TCS3D_UIGame.isGameOver = true;

        this.winNode.parent.active = true;

        let returnBtn = this.winNode.parent.getChildByName("返回主页");
        let restartBtn = this.winNode.parent.getChildByName("再来一局");

        let gameUI = this.node.getChildByName("GameUI");
        gameUI.active = false;

        let winUI = this.winNode.getChildByName("WinUI").getComponent(Label);
        winUI.string = "本局分数：" + this.score.toString() + "\n历史最高：" + TCS3D_GameData.Instance.maxScore.toString();

        tween(this.winNode)
            .to(1, { scale: v3(1, 1, 1) })
            .call(() => {
                returnBtn.active = true;
                restartBtn.active = true;

            })
            .start();
    }

    updateUI(score: number) {
        this.score += score;
        this.bodyLength = this.score / 5;

        if (this.score >= TCS3D_GameData.Instance.maxScore) {
            TCS3D_GameData.Instance.maxScore = this.score;
            TCS3D_GameData.DateSave();
        }

        this.UILabel.string = "当前长度：" + this.bodyLength.toString() +
            "米\n当前分数：" + this.score.toString() +
            "\n历史最高：" + TCS3D_GameData.Instance.maxScore.toString();

    }

    onButtonClick(event: EventTouch) {
        switch (event.target.name) {
            case "返回":
                ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
                    UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                        ProjectEventManager.emit(ProjectEvent.返回主页, "贪吃蛇3D");
                    });
                });
                break;
            case "更多模式":
                let moreMode = this.node.getChildByName("GameUI").getChildByName("更多模式");
                ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, moreMode);
                break;
            case "再来一局":
                let sceneName = director.getScene().name;
                director.loadScene(sceneName);
                break;
            case "返回主页":
                ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
                    UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                        ProjectEventManager.emit(ProjectEvent.返回主页, "贪吃蛇3D");
                    });
                });
                break;
            case "上一页":
                this.previous();
                break;
            case "下一页":
                this.next();
                break;
            case "关闭教程":
                this.page.node.parent.active = false;
                break;
            case "提示":
                this.page.node.parent.active = true;
                break;
        }
    }

    onMouseDown(event: EventTouch) {
        this.lastMousePosition.set(event.getLocationX(), event.getLocationY(), 0);
        this.isDragging = true;

    }

    onMouseMove(event: EventTouch) {
        if (this.isDragging) {
            //获取当前鼠标位置
            let currentMousePosition = new Vec3(event.getLocationX(), event.getLocationY(), 0);
            let deltaX = currentMousePosition.x - this.lastMousePosition.x;
            let deltaY = currentMousePosition.y - this.lastMousePosition.y;
            let pos = this.cameraNode.eulerAngles.add(v3(deltaY * 0.1, -deltaX * 0.1, 0));
            //限制旋转角度
            pos.x = Math.min(Math.max(pos.x, -40), 20);

            if (pos.x > -60 && pos.x < 20) {
                this.cameraNode.eulerAngles = pos;
            }
            else {
                this.cameraNode.eulerAngles = this.cameraNode.eulerAngles;
            }
            //设置上一次鼠标位置
            this.lastMousePosition.set(currentMousePosition.x, currentMousePosition.y, 0);

            director.getScene().emit("贪吃蛇3D_旋转相机", v3(0, -deltaX * 0.05, 0));

        }
    }

    onMouseUp(event: EventTouch) {
        this.isDragging = false;
    }

    page: PageView = null;
    next() {
        let curIndex = this.page.getCurrentPageIndex();
        if (curIndex === 2) {
            return;
        }

        this.page.scrollToPage(curIndex + 1);
    }

    previous() {
        let curIndex = this.page.getCurrentPageIndex();
        if (curIndex === 0) {
            return;
        }

        this.page.scrollToPage(curIndex - 1);
    }

    protected onDestroy(): void {
        TCS3D_GameData.DateSave();
    }
}


