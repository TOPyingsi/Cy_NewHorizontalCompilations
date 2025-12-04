import { _decorator, Component, ParticleSystem2D, Sprite, SpriteFrame, v3, Vec3 } from 'cc';
import { QSSZG_PoolManager } from '../Utils/QSSZG_PoolManager';
const { ccclass, property } = _decorator;

@ccclass('QSSZG_Food')
export class QSSZG_Food extends Component {
    DownSpeedPos: Vec3 = v3(0, 0.2, 0);
    public Level: number = 0;
    public Hp: number = 3;
    @property({ type: [SpriteFrame] })
    public sprits: SpriteFrame[] = [];
    @property(ParticleSystem2D)
    public ParticleSystem: ParticleSystem2D = null;

    Init(Level: number) {
        this.Level = Level;
        this.Hp = 3;
        //切换皮肤
        this.node.getComponent(Sprite).spriteFrame = this.sprits[this.Level];
        this.ParticleSystem.spriteFrame = this.sprits[this.Level];
        this.schedule(this.Des, 12);

    }
    protected update(dt: number): void {
        this.node.setPosition(this.node.position.subtract(this.DownSpeedPos));
    }


    //被吃
    Be_Eaten() {
        this.Hp--;
        if (this.Hp <= 0) {
            this.Des();
        } else {
            this.ParticleSystem.resetSystem();
        }
    }
    //销毁
    Des() {
        this.unschedule(this.Des);
        this.ParticleSystem.stopSystem();
        QSSZG_PoolManager.Instance.PutNode(this.node);
    }
}


