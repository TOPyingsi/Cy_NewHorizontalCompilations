import { _decorator, Animation, Component, Node, tween, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('ZWDZJS_TimeDie')
export class ZWDZJS_TimeDie extends Component {
    Init(time: number) {
        this.scheduleOnce(() => {
            this.node.getComponent(Animation).play("樱桃炸弹火焰熄灭");
            tween(this.node)
                .by(0.5, { position: v3(0, 100, 0) })
                .start();
        }, time - 0.5)
        this.scheduleOnce(() => {
            this.node.destroy();
        }, time)
    }


}


