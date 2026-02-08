import { _decorator, Component, Node, random, tween, v3, Vec3 } from 'cc';
import { SJZGMMT_AudioManager } from './SJZGMMT_AudioManager';

const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_MoneyEffects')
export class SJZGMMT_MoneyEffects extends Component {
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


    //设置
    SetData(Speed: number, Scope: number) {
        this.Speed = Speed;
        this.Scope = Scope;
    }

    //开始
    Begin(StarWorldPos: Vec3, EndWorldPos: Vec3, parent: Node) {
        this.node.setParent(parent);
        this.node.setWorldPosition(StarWorldPos);
        this.schedule(() => {
            if (this.index < this.cdnum) {
                this.Biu(this.node.children[this.index], StarWorldPos, EndWorldPos, parent);
                this.index++;
            }
        }, 1 / this.Speed)
        this.scheduleOnce(() => {
            SJZGMMT_AudioManager.globalAudioPlay("获得钞票");
        }, 1.3)
    }
    //发射
    Biu(nd: Node, StarWorldPos: Vec3, EndWorldPos: Vec3, parent: Node) {
        this.node.setParent(parent);
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
        if (this.node.children.length == 0) {
            this.node.destroy();
        }
    }
}


