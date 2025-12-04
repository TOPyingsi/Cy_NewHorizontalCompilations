import { _decorator, Collider2D, Component, Contact2DType, Enum, find, IPhysics2DContact, Node, Vec2, Vec3 } from 'cc';
import { TLWLSJ_Constant, TLWLSJ_ENEMYNAME } from './TLWLSJ_Constant';
import { TLWLSJ_MapController } from './TLWLSJ_MapController';
import { TLWLSJ_Tool } from './TLWLSJ_Tool';
const { ccclass, property } = _decorator;

@ccclass('TLWLSJ_EnemyInitController')
export class TLWLSJ_EnemyInitController extends Component {
    @property(Node)
    InitPos: Node[] = [];

    @property({ displayName: "两个小怪之间的间隔范围" })
    DelayTimeClamp: Vec2 = new Vec2();

    @property({ displayName: "间隔" })
    DelayTime: number = 5;

    @property({ type: Enum(TLWLSJ_ENEMYNAME) })
    EnemyName: TLWLSJ_ENEMYNAME[] = [];

    AllName: string[][] = [];

    Collider2D: Collider2D = null;

    protected onLoad(): void {
        const sensor: Node = find("交互", this.node);
        if (sensor) this.Collider2D = sensor.getComponent(Collider2D);

        if (this.Collider2D) {
            if (this.Collider2D) {
                this.Collider2D.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            }
        }
    }

    loadAllName(): string[][] {
        if (this.EnemyName.length <= 0) return this.AllName;
        let names: string[] = [];
        let Name = this.EnemyName.shift();
        while (Name != TLWLSJ_ENEMYNAME.分割) {
            names.push(TLWLSJ_Tool.GetEnumKeyByValue(TLWLSJ_ENEMYNAME, Name));
            if (this.EnemyName.length <= 0) break;
            Name = this.EnemyName.shift();
        }
        if (names.length > 0) this.AllName.push(names);
        this.loadAllName();
    }

    getPos(): Vec3 {
        const index = TLWLSJ_Tool.GetRandomInt(0, this.InitPos.length);
        return this.InitPos[index].getWorldPosition();
    }

    getDelayTime(): number {
        return TLWLSJ_Tool.GetRandom(this.DelayTimeClamp.x, this.DelayTimeClamp.y);
    }

    onBeginContact(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        if (otherCollider.group == TLWLSJ_Constant.TLWLSJ_Group.PLAYER) {
            this.loadAllName();
            TLWLSJ_MapController.Instance.getEnemyData(this);
            this.scheduleOnce(() => { TLWLSJ_MapController.Instance.createEnemy(); }, 2);
            this.Collider2D.enabled = false;
        }

    }
}


