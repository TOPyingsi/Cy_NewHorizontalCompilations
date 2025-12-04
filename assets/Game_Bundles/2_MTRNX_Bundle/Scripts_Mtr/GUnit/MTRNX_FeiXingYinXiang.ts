import { _decorator, BoxCollider2D, Component, Node, Prefab, v2, v3, Vec3, WorldNode3DToLocalNodeUI } from 'cc';
import { MTRNX_Unit } from '../MTRNX_Unit';
import { MTRNX_ResourceUtil } from '../Utils/MTRNX_ResourceUtil';
import { MTRNX_PoolManager } from '../Utils/MTRNX_PoolManager';
import { MTRNX_GameManager } from '../MTRNX_GameManager';
import { MTRNX_Gbullet } from './MTRNX_Gbullet';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_FeiXingYinXiang')
export class MTRNX_FeiXingYinXiang extends MTRNX_Unit {
    public Id: number = 12;//ID
    public IsFlyUnit: boolean = true;//是否为飞行单位
    public attack: number = 10;//攻击力
    public Hp: number = 250;//当前生命值
    public maxHp: number = 250;//最大生命值
    public speedBase: number = 3;//基础速度

    start(): void {
        super.start();
        this.node.setPosition(this.node.position.x, this.node.position.y + 100);
    }

    Attackincident() {
        //远程
        if (this.TargetNodes.length > 0) {
            let targetPoint = v3(this.TargetNodes[0].getWorldPosition().x, this.TargetNodes[0].getWorldPosition().y + this.TargetNodes[0].getComponent(BoxCollider2D).size.height / 2);
            this.ChangeUnitScale();
            MTRNX_ResourceUtil.LoadPrefab("Bullet/Gbullet2").then((prefab: Prefab) => {
                let bullet: Node = MTRNX_PoolManager.Instance.GetNode(prefab, MTRNX_GameManager.Instance.GameNode.getChildByName("子弹层"));
                bullet.setWorldPosition(v3(this.node.worldPosition.x + this.boxcollider.size.width / 2, this.node.worldPosition.y + this.boxcollider.size.height / 2));
                bullet.setScale(this.node.getScale().x, 1, 1);
                bullet.getComponent(MTRNX_Gbullet).init(targetPoint, v2(this.node.getScale().x, 0), this.attack, 40, this.IsEnemy, true, 1, true, true);
                MTRNX_AudioManager.AudioClipPlay("音响攻击音效");
            });
        }
    }
}


