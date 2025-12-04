import { _decorator, BoxCollider2D, Component, Node, Prefab, v3, Vec3 } from 'cc';
import { MTRNX_Unit } from '../MTRNX_Unit';
import { MTRNX_ResourceUtil } from '../Utils/MTRNX_ResourceUtil';
import { MTRNX_PoolManager } from '../Utils/MTRNX_PoolManager';
import { MTRNX_GameManager } from '../MTRNX_GameManager';
import { MTRNX_Gbullet } from './MTRNX_Gbullet';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_ZhongXingYinXiangRen')
export class MTRNX_ZhongXingYinXiangRen extends MTRNX_Unit {
    public Id: number = 10;//ID
    public IsHitFly: boolean = true;//受击是否被击飞
    public IsSingleAtk: boolean = false;//是否为单体攻击

    public attack: number = 15;//攻击力
    public Hp: number = 350;//当前生命值
    public maxHp: number = 350;//最大生命值
    public speedBase: number = 3;//基础速度

    start(): void {
        super.start();
    }

    Attackincident() {
        super.Attackincident();//近战
        MTRNX_AudioManager.AudioClipPlay("捶地");
        //远程
        if (this.TargetNodes.length > 0) {
            let targetPoint = v3(this.TargetNodes[0].getWorldPosition().x, this.TargetNodes[0].getWorldPosition().y + this.TargetNodes[0].getComponent(BoxCollider2D).size.height / 3);
            MTRNX_ResourceUtil.LoadPrefab("Bullet/Gbullet").then((prefab: Prefab) => {
                let bullet: Node = MTRNX_PoolManager.Instance.GetNode(prefab, MTRNX_GameManager.Instance.GameNode.getChildByName("子弹层"));
                bullet.setWorldPosition(v3(this.node.worldPosition.x + this.boxcollider.size.width / 4, this.node.worldPosition.y + this.boxcollider.size.height / 2));
                bullet.getComponent(MTRNX_Gbullet).init(targetPoint, this.forward.clone(), this.attack, 10, this.IsEnemy, true, 0.8, false, false);
                MTRNX_AudioManager.AudioClipPlay("音响攻击音效");
            });
        }
    }
}


