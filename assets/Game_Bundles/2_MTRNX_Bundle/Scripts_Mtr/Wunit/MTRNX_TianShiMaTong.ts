import { _decorator, CircleCollider2D, Collider, Collider2D, Component, Contact2DType, instantiate, IPhysics2DContact, log, Node, Prefab, resources, v3 } from 'cc';
import { MTRNX_Unit } from '../MTRNX_Unit';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';
import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
const { ccclass, property } = _decorator;

@ccclass('MTRNX_TianShiMaTong')
export class MTRNX_TianShiMaTong extends MTRNX_Unit {
    public Id: number = 17;//ID
    public IsEnemy: boolean = true;//是否为敌人
    public IsHitFly: boolean = false;//受击是否被击飞
    public IsInTheAir: boolean = true;//是否浮空
    public attack: number = 40;//攻击力
    public Hp: number = 250;//当前生命值
    public maxHp: number = 250;//最大生命值
    public speedBase: number = 1;//基础速度
    start() {
        super.start();
        this.node.getComponents(CircleCollider2D)[1].on(Contact2DType.BEGIN_CONTACT, (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) => {
            if (otherCollider.node.getComponent(MTRNX_Unit) && this.IsEnemy == otherCollider.node.getComponent(MTRNX_Unit).IsEnemy
                && otherCollider.node.getComponent(MTRNX_Unit).State != 2) {//检测单位是不是友方
                otherCollider.node.getComponent(MTRNX_Unit).Buff_recover(10, 999);
                if (!otherCollider.node.getChildByName("回血特效")) {
                    BundleManager.GetBundle("2_MTRNX_Bundle").load("Prefabs/Effects/回血特效", Prefab, (err, event) => {
                        if (err) {
                            console.log("没有找到回血特效预制体");
                            return;
                        }
                        let pre = instantiate(event);
                        pre.setParent(otherCollider.node);
                        pre.setPosition(v3(0, 0, 0));
                    })
                }
            }
        })
    }
    Attackincident() {
        MTRNX_AudioManager.AudioClipPlay("攻击");
        super.Attackincident();
    }

}


