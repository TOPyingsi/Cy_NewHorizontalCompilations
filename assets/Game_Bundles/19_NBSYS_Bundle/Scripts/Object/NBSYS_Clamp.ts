import { _decorator, Collider2D, Component, IPhysics2DContact, Node, Sprite, SpriteFrame, tween, v3 } from 'cc';
import { NBSYS_TouchMonitor } from '../NBSYS_TouchMonitor';
import { NBSYS_Cup } from './NBSYS_Cup';
import { NBSYS_GameData } from '../NBSYS_GameData';
import { NBSYS_SaoBei } from './NBSYS_SaoBei';
import { NBSYS_GameManager } from '../NBSYS_GameManager';
import { NBSYS_Incident } from '../NBSYS_Incident';
import { NBSYS_alcohol_burner } from './NBSYS_alcohol_burner';
const { ccclass, property } = _decorator;

@ccclass('NBSYS_Clamp')
export class NBSYS_Clamp extends NBSYS_TouchMonitor {
    public substance: string = "";//夹子上的物质
    start() {
        super.start();
    }

    //进入碰撞
    OnCollider(selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        super.OnCollider(selfCollider, otherCollider, contact);
        if (otherCollider.node.name == "酒精灯" && otherCollider.node.getComponent(NBSYS_alcohol_burner)?.IsBurn == true) {
            if (this.substance == "铜片") {
                this.substance = "烧过的铜片";
                NBSYS_Incident.LoadSprite("Sprits/勺子材料/" + this.substance).then((sp: SpriteFrame) => {
                    this.node.getChildByName("物质").getComponent(Sprite).spriteFrame = sp;
                })
            }
        }
    }
    TouchMoveInCident() {
        if (this.Lasttarget?.getComponent(NBSYS_Cup)) {//如果是碰到材料杯子
            if (this.substance != "") {
                console.log("夹子上已有材料");
                return;
            }
            let Name = this.Lasttarget?.getComponent(NBSYS_Cup)?.substance
            if (Name && NBSYS_GameData.GetData(Name)?.vessel == "夹子") {
                console.log("夹子获取材料" + NBSYS_GameData.GetData(Name).Name);
                this.substance = NBSYS_GameData.GetData(Name).Name;
                this.PlayAnimation(true, this.Lasttarget);
            } else {
                console.log("材料不可取");
            }
        }

        if (this.Lasttarget?.getComponent(NBSYS_SaoBei)) {//如果是碰到烧杯
            if (this.substance == "") {
                console.log("夹子为空");
                return;
            }
            this.PlayAnimation(false, this.Lasttarget);
        }

    }
    //入瓶动画（参数：是否获取，否为置入）
    PlayAnimation(isGet: boolean, target: Node) {
        let Startpos = this.InitPoint.clone();
        this.node.setParent(NBSYS_GameManager.Instance.Bg.getChildByName("底层"));
        if (target) {
            tween(this.node)
                .to(0.5, { worldPosition: target.getWorldPosition().clone().add(v3(0, 250, 0)) })
                .to(0.5, { worldPosition: target.getWorldPosition().clone().add(v3(0, 90, 0)) })
                .call(() => {
                    if (isGet) {
                        NBSYS_Incident.LoadSprite("Sprits/勺子材料/" + this.substance).then((sp: SpriteFrame) => {
                            this.node.getChildByName("物质").getComponent(Sprite).spriteFrame = sp;
                        })
                    } else {
                        target?.getComponent(NBSYS_SaoBei).Add(this.substance, this.node.getWorldPosition().clone().add(v3(0, -100, 0)));
                        this.substance = "";
                        this.node.getChildByName("物质").getComponent(Sprite).spriteFrame = null;
                    }

                })
                .to(0.5, { worldPosition: target.getWorldPosition().clone().add(v3(0, 300, 0)) })
                .to(0.5, { angle: 0 })
                .call(() => {
                    this.node.setParent(NBSYS_GameManager.Instance.Bg.getChildByName("顶层"));
                })
                .start();

        }
    }
}


