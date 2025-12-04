import { _decorator, Collider2D, Component, Contact2DType, Node, v3, Vec3 } from 'cc';
import { HJMSJ_Player } from '../Player/HJMSJ_Player';
import { HJMSJ_GameMgr } from '../HJMSJ_GameMgr';
const { ccclass, property } = _decorator;

@ccclass('HJMSJ_SnowBall')
export class HJMSJ_SnowBall extends Component {

    @property()
    moveSpeed: number = 1;
    @property()
    ATK: number = 1;

    private Dir: Vec3 = v3(0, 0, 0);

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
            let offset = v3(this.Dir.x * this.moveSpeed * deltaTime, this.Dir.y * this.moveSpeed * deltaTime, 0);
            this.node.worldPosition = this.node.worldPosition.add(offset);
        }
    }

    init(Dir: Vec3) {
        this.isInit = true;
        this.Dir = Dir;

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


