import { _decorator, Component, director, EventTouch, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_UIGame')
export class HJMSJ_UIGame extends Component {
    start() {
        director.getScene().on("哈基米世界_死亡", this.lost, this);
    }

    update(deltaTime: number) {

    }


    lost() {
        this.node.getChildByName("UI").active = false;
        this.node.getChildByName("失败").active = true;
        this.node.getChildByName("死亡背景").active = true;
    }

    OnNewCourseClick() {
        this.node.getChildByName("新手教程").active = true;

    }
}
