import { _decorator, Component, Node, postProcess, tween, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TCS3D_Obstacle')
export class TCS3D_Obstacle extends Component {

    @property()
    public moveSpeed: number = 50;
    @property()
    public moveTime: number = 1;

    @property()
    public posX: number = 0;
    @property()
    public posY: number = 0;
    @property()
    public posZ: number = 0;

    sign: number = 1;

    //浮空板
    start() {
        switch (this.node.name) {
            case "obstacle":
                this.moveSelfBox();
                break;
            case "Hammer":
                this.moveSelfHammer();
                break;
            case "炫光":
                this.xuanguang();
                break;

        }
    }

    //平滑板
    moveSelfBox() {
        let movement = v3(this.posX, this.posY, this.posZ);
        tween(this.node)
            .by(this.moveTime, { position: movement.multiplyScalar(this.moveSpeed * this.sign) })
            .call(() => {
                this.sign = -this.sign;
                this.moveSelfBox();
            })
            .start();
    }

    moveSelfHammer() {
        tween(this.node)
            .by(this.moveTime, { eulerAngles: v3(this.posX, this.posY, this.posZ).multiplyScalar(this.moveSpeed * this.sign) })
            .call(() => {
                this.sign = -this.sign;

                this.moveSelfHammer();
            })
            .start();
    }

    xuanguang() {
        tween(this.node)
            .by(this.moveTime, { eulerAngles: v3(this.posX, this.posY, this.posZ).multiplyScalar(this.moveSpeed) })
            .call(() => {
                this.xuanguang();
            })
            .start();
    }
}

