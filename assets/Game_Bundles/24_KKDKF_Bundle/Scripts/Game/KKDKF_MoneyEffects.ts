import { _decorator, Component, Node, random, tween, v3, Vec3 } from 'cc';
import { KKDKF_GameManager } from './KKDKF_GameManager';
const { ccclass, property } = _decorator;

@ccclass('KKDKF_MoneyEffects')
export class KKDKF_MoneyEffects extends Component {
    @property()
    Speed: number = 10;
    @property()
    Scope: number = 50;

    public cdnum: number = 0;
    public index: number = 0;
    start() {
        this.cdnum = this.node.children.length;
        this.node.children.forEach((cd) => {
            cd.active = false;
        })
    }

    update(deltaTime: number) {

    }
    //设置
    SetData(Speed: number, Scope: number) {
        this.Speed = Speed;
        this.Scope = Scope;
    }
    //开始
    Begin(StarWorldPos: Vec3, EndWorldPos: Vec3) {
        this.node.setParent(KKDKF_GameManager.Instance.UI);
        this.node.setWorldPosition(StarWorldPos);
        this.schedule(() => {
            if (this.index < this.cdnum) {
                this.Biu(this.node.children[0], StarWorldPos, EndWorldPos);
                this.index++;
            }
        }, 1 / this.Speed)
    }
    //发射
    Biu(nd: Node, StarWorldPos: Vec3, EndWorldPos: Vec3) {
        nd.setParent(KKDKF_GameManager.Instance.UI);
        nd.setWorldPosition(StarWorldPos);
        let randomX: number = nd.worldPosition.x + random() * (this.Scope * 2 - this.Scope);
        let randomY: number = nd.worldPosition.y + random() * (this.Scope * 2 - this.Scope);
        nd.active = true;
        tween(nd)
            .to(0.3, { worldPosition: v3(randomX, randomY) })
            .to(1, { worldPosition: EndWorldPos, scale: v3(0.4, 0.4) }, { easing: "cubicOut" })
            .call(() => {
                nd.destroy();
            })
            .start();
        if (this.node.children.length == 1) {
            this.node.destroy();
        }
    }
}


