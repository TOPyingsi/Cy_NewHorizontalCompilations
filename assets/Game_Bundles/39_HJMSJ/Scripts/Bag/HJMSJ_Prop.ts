import { _decorator, Component, Node, tween, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_Prop')
export class HJMSJ_Prop extends Component {

    public propName: string = "金苹果";
    public propNum: number = 1;

    start() {
        this.moveSelf();
    }

    update(deltaTime: number) {

    }

    //, position: v3(0, 20 * this.sign, 0)
    sign: number = 1;
    moveSelf() {
        // tween(this.node.getChildByName("propSprite"))
        //     .to(0.5, { scale: v3(1.2, 1.2, 1.2) })
        //     .to(0.5, { scale: v3(1, 1, 1) })
        //     .union()
        //     .repeatForever()
        //     .start();

        tween(this.node)
            .by(1, { position: v3(0, 20 * this.sign, 0) })
            .call(() => {
                this.sign = -this.sign;
                this.moveSelf();
            })
            .start();
    }
}


