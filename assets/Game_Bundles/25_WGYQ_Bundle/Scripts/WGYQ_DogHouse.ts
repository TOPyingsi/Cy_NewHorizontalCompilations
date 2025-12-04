import { _decorator, Button, Component, EventTouch, Node, v3, Vec3 } from 'cc';
import { WGYQ_GameData } from './WGYQ_GameData';
import { WGYQ_Camera } from './WGYQ_Camera';
const { ccclass, property } = _decorator;

@ccclass('WGYQ_Dog')
export class WGYQ_Dog extends Component {

    @property(Node)
    button: Node;

    startPos: Vec3;

    start() {
        this.node.on(Node.EventType.TOUCH_START, this.TouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.TouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.TouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.TouchEnd, this);
    }

    update(deltaTime: number) {

    }

    TouchStart(event: EventTouch) {
        this.startPos = this.node.getPosition();
    }

    TouchMove(event: EventTouch) {
        let camera = WGYQ_Camera.Instance.node;
        let pos = v3(event.getUILocation().x, event.getUILocation().y).add3f(camera.getPosition().x, camera.getPosition().y, 0);
        this.node.setWorldPosition(pos);
    }

    TouchEnd(event: EventTouch) {
        if (this.startPos == this.node.getPosition()) return;
        this.button.active = true;
    }

    SetHouse() {
        this.button.active = false;
        let num = this.node.getSiblingIndex();
        let data = WGYQ_GameData.Instance.getArrayData("DogHouse");
        data[num] = this.node.getPosition();
        WGYQ_GameData.Instance.setArrayData("DogHouse", data);
    }

}
