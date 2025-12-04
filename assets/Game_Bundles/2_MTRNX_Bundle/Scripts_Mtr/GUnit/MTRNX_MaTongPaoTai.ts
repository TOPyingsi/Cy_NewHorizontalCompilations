import { _decorator, Animation, BoxCollider2D, Component, Node, Prefab, v2, v3, Vec3 } from 'cc';
import { MTRNX_Unit } from '../MTRNX_Unit';
import { MTRNX_Gbullet } from './MTRNX_Gbullet';
import { MTRNX_ResourceUtil } from '../Utils/MTRNX_ResourceUtil';
import { MTRNX_GameManager } from '../MTRNX_GameManager';
import { MTRNX_PoolManager } from '../Utils/MTRNX_PoolManager';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_MaTongPaoTai')
export class MTRNX_MaTongPaoTai extends MTRNX_Unit {
    public Id: number = 6;//ID
    public IsHitFly: boolean = true;//受击是否被击飞
    public IsEnemy: boolean = true;//是否为敌人

    public attack: number = 4;//攻击力
    public Hp: number = 150;//当前生命值
    public maxHp: number = 150;//最大生命值
    public speedBase: number = 2.5;//基础速度

    start(): void {
        super.start();
    }

    Attackincident() {
        //远程
        if (this.TargetNodes.length > 0) {
            let targetPoint = v3(this.TargetNodes[0].getWorldPosition().x, this.TargetNodes[0].getWorldPosition().y + this.TargetNodes[0].getComponent(BoxCollider2D).size.height / 3);
            MTRNX_ResourceUtil.LoadPrefab("Bullet/Gbullet3").then((prefab: Prefab) => {
                let bullet: Node = MTRNX_PoolManager.Instance.GetNode(prefab, MTRNX_GameManager.Instance.GameNode.getChildByName("子弹层"));
                bullet.setWorldPosition(this.node.getChildByName("shootPoint").worldPosition);
                bullet.getComponent(MTRNX_Gbullet).init(targetPoint, this.forward.clone(), this.attack, 40, this.IsEnemy, false, 10, false, true);
                if (!this.node.getChildByName("shootPoint").active) {
                    this.node.getChildByName("shootPoint").active = true;
                }
                MTRNX_AudioManager.AudioClipPlay("蜘蛛机枪马桶");

                let dir = targetPoint.subtract(bullet.worldPosition);
                //根据朝向计算出夹角弧度
                var angle = v2(dir.x, dir.y).signAngle(this.forward.clone());
                //将弧度转换为欧拉角
                var degree = angle / Math.PI * 180;
                //赋值给节点
                this.node.getChildByName("shootPoint").angle = degree * 2;
                this.node.getChildByName("shootPoint").getComponent(Animation).play("animation");
            });
        }
    }
}


