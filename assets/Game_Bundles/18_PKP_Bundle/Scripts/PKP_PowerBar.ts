import { _decorator, Component, Node, ProgressBar } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PKP_PowerBar')
export class PKP_PowerBar extends Component {
    @property(Node)
    public progressBarNode: Node = null;
    private vec: number = 1;

    start() {

    }

    update(deltaTime: number) {
        this.powerBarUpdate(deltaTime);
    }

    // 进度条来回移动
    public powerBarUpdate(deltaTime: number) {
        if (this.progressBarNode.getComponent(ProgressBar).progress >= 0.98) {
            this.vec = -1;
        } else if (this.progressBarNode.getComponent(ProgressBar).progress <= 0.02) {
            this.vec = 1;
        }
        this.progressBarNode.getComponent(ProgressBar).progress += this.vec * deltaTime;
    }
}

