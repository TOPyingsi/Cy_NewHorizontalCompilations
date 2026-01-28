import { _decorator, Component, Node, NodeEventType, Label, EventTouch } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CDXX2_DanWei')
export class CDXX2_DanWei extends Component {

    @property(Node) TanChuang: Node = null;      // 弹窗根节点
    @property(Node) BtnRank: Node = null;      // “剑品质排行”按钮
    @property(Node) BtnExit: Node = null;      // “退出”按钮
    @property(Label) Label1: Label = null;      // 默认显示
    @property(Label) Label2: Label = null;      // 点排行后显示

    protected onLoad(): void {
        /* 单位节点点击 → 弹窗亮 */
        this.node.on(NodeEventType.TOUCH_END, () => this.TanChuang.active = true, this);

        // /* 排行按钮 → 切文案 */
        // this.BtnRank.on(NodeEventType.TOUCH_END, () => {
        //     this.Label1.node.active = false;
        //     this.Label2.node.active = true;
        // }, this);

        // /* 退出按钮 → 复位并灭窗 */
        // this.BtnExit.on(NodeEventType.TOUCH_END, () => {
        //     this.Label1.node.active = true;
        //     this.Label2.node.active = false;
        //     this.TanChuang.active  = false;
        // }, this);
    }

    CliCk(event: EventTouch) {
        switch (event.getCurrentTarget().name) {
            case "退出":
                this.Label1.node.active = true;
                this.Label2.node.active = false;
                this.TanChuang.active = false;
                this.BtnRank.active = true;
                break;
            case "剑品质排行":
                this.Label1.node.active = false;
                this.Label2.node.active = true;
                this.BtnRank.active = false;
                break;
        }
        console.log(11);
    }
}