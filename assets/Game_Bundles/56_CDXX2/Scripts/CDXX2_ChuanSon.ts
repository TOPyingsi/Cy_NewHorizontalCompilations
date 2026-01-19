import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CDXX2_ChuanSon')
export default class CDXX2_ChuanSon extends Component {
    @property(Node)
    TeleportPanel: Node = null; // 传送弹窗节点

    onLoad() {
        // 为自己（传送按钮）添加点击事件
        this.node.on(Node.EventType.TOUCH_END, this.onTransportClick, this);
    }

    onTransportClick() {
        // 点击传送按钮时显示传送弹窗
        if (this.TeleportPanel) {
            this.TeleportPanel.active = true;
        } else {
            console.warn('传送弹窗节点未设置');
        }
    }

    onDisable() {
        this.node.off(Node.EventType.TOUCH_END, this.onTransportClick, this);
    }
}

