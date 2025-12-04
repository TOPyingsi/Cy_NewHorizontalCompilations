import { _decorator, Collider2D, Component, Contact2DType, Node, ParticleSystem2D, v3, Vec3 } from 'cc';
import { HJMSJ_Player } from '../Player/HJMSJ_Player';
import { HJMSJ_GameMgr } from '../HJMSJ_GameMgr';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_IceBall')
export class HJMSJ_IceBall extends Component {

    @property()
    moveSpeed: number = 1;
    @property()
    ATK: number = 1;
    @property()
    flyTime: number = 2;

    private Dir: Vec3 = v3(0, 0, 0);

    private particle: ParticleSystem2D = null;

    private timer: number = 0;
    private isInit: boolean = false;
    private isDestory: boolean = false;
    private colider: Collider2D = null;

    private playerNode: Node = null;
    start() {
        this.colider = this.getComponent(Collider2D);
        this.colider.on(Contact2DType.BEGIN_CONTACT, this.onStartContact, this);
        this.playerNode = HJMSJ_GameMgr.instance.playerNode;
    }

    update(deltaTime: number) {
        if (this.isDestory) {
            return;
        }

        if (this.isInit) {
            this.timer += deltaTime;
            if (this.timer <= this.flyTime) {
                this.node.worldPosition = this.node.worldPosition.add(v3(0, this.Dir.y * this.moveSpeed * this.timer, 0));
            }
            else {
                this.isInit = false;
                this.timer = 0;
            }
        }
    }

    init(Dir: Vec3) {
        this.scheduleOnce(() => {
            this.isInit = true;
            this.Dir = Dir;
            this.particle = this.node.getChildByName("火焰").getComponent(ParticleSystem2D);
            this.particle.resetSystem();
        }, 0.5);

        this.scheduleOnce(() => {
            this.isInit = false;
            this.node.destroy();
        }, 10);
    }

    onStartContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: any) {
        if (otherCollider.node.name == "Player") {
            this.isDestory = true;
            let playerTs = otherCollider.node.getComponent(HJMSJ_Player);
            playerTs.onAttack(-this.ATK, this.getPlayerDir());
            this.node.destroy();
        }
    }

    getPlayerDir(): Vec3 {
        let distance = this.node.worldPosition.clone().subtract(this.playerNode.worldPosition.clone());
        let dir = distance.clone().normalize().negative();
        return dir;
    }
}


