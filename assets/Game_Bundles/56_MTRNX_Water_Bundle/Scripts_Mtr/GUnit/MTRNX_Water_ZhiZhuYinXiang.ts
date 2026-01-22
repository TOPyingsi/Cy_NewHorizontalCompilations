import { _decorator, BoxCollider2D, Component, Node, Prefab, v3, Vec3 } from 'cc';
import { MTRNX_Water_Unit } from '../MTRNX_Water_Unit';
import { MTRNX_Water_ResourceUtil } from '../Utils/MTRNX_Water_ResourceUtil';
import { MTRNX_Water_PoolManager } from '../Utils/MTRNX_Water_PoolManager';
import { MTRNX_Water_GameManager } from '../MTRNX_Water_GameManager';
import { MTRNX_Water_Gbullet } from './MTRNX_Water_Gbullet';
import { MTRNX_Water_AudioManager } from '../MTRNX_Water_AudioManager';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_Water_ZhiZhuYinXiang')
export class MTRNX_Water_ZhiZhuYinXiang extends MTRNX_Water_Unit {
    public Id: number = 11;//ID
    public IsHitFly: boolean = true;//受击是否被击飞

    public attack: number = 12;//攻击力
    public Hp: number = 200;//当前生命值
    public maxHp: number = 200;//最大生命值
    public speedBase: number = 2.5;//基础速度

    start(): void {
        super.start();
    }

    Attackincident() {
        //远程
        if (this.TargetNodes.length > 0) {
            let targetPoint = v3(this.TargetNodes[0].getWorldPosition().x, this.TargetNodes[0].getWorldPosition().y + this.TargetNodes[0].getComponent(BoxCollider2D).size.height / 3);
            MTRNX_Water_ResourceUtil.LoadPrefab("Bullet/Gbullet2").then((prefab: Prefab) => {
                let bullet: Node = MTRNX_Water_PoolManager.Instance.GetNode(prefab, MTRNX_Water_GameManager.Instance.GameNode.getChildByName("子弹层"));
                bullet.setWorldPosition(v3(this.node.worldPosition.x + this.boxcollider.size.width / 4, this.node.worldPosition.y + this.boxcollider.size.height - 20));
                bullet.getComponent(MTRNX_Water_Gbullet).init(targetPoint, this.forward.clone(), this.attack, 40, this.IsEnemy, true, 1, true, false);
                MTRNX_Water_AudioManager.AudioClipPlay("音响攻击音效");
            });
        }
    }
}


