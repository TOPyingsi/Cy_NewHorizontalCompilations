import { _decorator, Collider2D, Component, Contact2DType, director, IPhysics2DContact, Node, tween, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_SkinNPC')
export class HJMSJ_SkinNPC extends Component {

    public talkWindow: Node = null;
    private colider: Collider2D = null;
    start() {
        this.talkWindow = this.node.getChildByName("Talk");

        this.colider = this.getComponent(Collider2D);
        this.colider.on(Contact2DType.BEGIN_CONTACT, this.onTriggerEnter, this);
        this.colider.on(Contact2DType.END_CONTACT, this.onTriggerExit, this);

        this.talkWindow.scale = v3(0, 0, 0);
    }

    update(deltaTime: number) {

    }

    showTalkWindow(flag: boolean) {
        if (flag) {
            tween(this.talkWindow)
                .to(0.5, { scale: v3(1, 1, 1) }, { easing: "backInOut" })
                .start();
        }
        else {
            tween(this.talkWindow)
                .to(0.3, { scale: v3(0, 0, 0) })
                .start();
        }
    }

    onTriggerEnter(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.node.name == "Player") {
            this.showTalkWindow(true);
            director.getScene().emit("哈基米世界_对话", this.node.name);
        }
    }

    onTriggerExit(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.node.name == "Player") {
            this.showTalkWindow(false);
            director.getScene().emit("哈基米世界_离开对话");
        }
    }
}


