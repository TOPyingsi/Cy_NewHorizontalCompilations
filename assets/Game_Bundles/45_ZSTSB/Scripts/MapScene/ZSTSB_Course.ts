import { _decorator, Component, Node, NodeEventType } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ZSTSB_Course')
export class ZSTSB_Course extends Component {

    index: number = 0;

    onEnable() {
        this.node.on(NodeEventType.TOUCH_END, this.onClick, this);
    }

    onClick() {
        console.log("下一步教程");
        let length = this.node.children.length;
        this.index++;
        if (this.index >= length) {
            this.index = 0;
            this.node.children[length - 1].active = false;
            this.node.children[this.index].active = true;

            this.node.active = false;
            this.node.off(NodeEventType.TOUCH_END, this.onClick, this);
            return;
        }

        this.node.children[this.index - 1].active = false;
        this.node.children[this.index].active = true;

    }
}


