import { _decorator, Animation, Component, Node, toDegree, v2, v3 } from 'cc';
import { MTRNX_ZArmedUnit } from './MTRNX_ZArmedUnit';
import { MTRNX_PoolManager } from '../Utils/MTRNX_PoolManager';
import { MTRNX_ZBullet } from './MTRNX_ZBullet';
import { MTRNX_Gbullet } from '../GUnit/MTRNX_Gbullet';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';
import { MTRNX_GameManager } from '../MTRNX_GameManager';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_ZWeapon')
export class MTRNX_ZWeapon extends Component {

    @property
    damage = 0;
    @property
    speed = 0;
    @property
    maxCD = 0;
    @property
    traceLevel = 0;
    @property
    dispersion = 0;
    @property
    isSword = false;

    cd = 0;
    self: MTRNX_ZArmedUnit;
    ani: Animation;

    start() {
        this.self = this.node.parent.parent.getComponent(MTRNX_ZArmedUnit);
        this.ani = this.node.getComponent(Animation);
        this.schedule(() => {
            this.cd++;
        }, 1);
    }

    protected onEnable(): void {
        this.cd = this.maxCD;
    }

    update(deltaTime: number) {
        if (this.self.shootList.length > 0 && !this.isSword) {
            var target = this.self.shootList[0].node;
            var dir = target.getWorldPosition().subtract(this.node.getWorldPosition()).normalize();
            //根据朝向计算出夹角弧度
            var angle = v2(dir.x, dir.y).signAngle(this.self.forward.clone());
            //将弧度转换为欧拉角
            var degree = toDegree(angle);
            this.node.angle = degree;
        }
        else this.node.angle = 0;
    }

    WeaponIdleEnd() {
        if (this.cd >= this.maxCD && (this.isSword ? this.self.canAttack : this.self.canShoot)) {
            this.ani.play(this.node.name + "attack");
        }
    }

    WeaponAttackEnd() {
        this.cd = 0;
        this.ani.play(this.node.name + "idle");
    }

    Shoot() {
        var target = this.self.shootList[0];
        var bullet = MTRNX_PoolManager.Instance.GetNode(this.self.bullets[this.self.weapons.children.indexOf(this.node)], MTRNX_GameManager.Instance.GameNode.getChildByName("子弹层")) as Node;
        bullet.setWorldPosition(this.node.getChildByName("ShootPoint").getWorldPosition());
        var src = bullet.getComponent(MTRNX_ZBullet);
        if (src) {
            src.self = this.self;
            src.init(target ? target.node : null, this.damage, this.speed, this.self.IsEnemy, this.traceLevel, this.dispersion);
        }
        else {
            bullet.getComponent(MTRNX_Gbullet).init(this.node.getChildByName("ShootPoint").getWorldPosition().add(v3(1, 0, 0).multiplyScalar(this.self.IsEnemy ? -1 : 1)), this.self.forward.clone(), this.damage, this.speed, this.self.IsEnemy, true, 1, true, false);
        }
    }

    Hit() {
        for (let i = 0; i < this.self.attackList.length; i++) {
            const element = this.self.attackList[i];
            element.Hurt(this.damage);
        }
    }

    AudioPlay(name: string) {
        MTRNX_AudioManager.AudioClipPlay(name);
    }
}


