import { _decorator, BoxCollider2D, Collider2D, Component, Contact2DType, IPhysics2DContact, Node, Sprite, SpriteFrame, tween, v3 } from 'cc';
import { NBSYS_TouchMonitor } from '../NBSYS_TouchMonitor';
import { NBSYS_Cup } from './NBSYS_Cup';
import { NBSYS_GameData } from '../NBSYS_GameData';
import { NBSYS_Incident } from '../NBSYS_Incident';
import { NBSYS_SaoBei } from './NBSYS_SaoBei';
import { NBSYS_GameManager } from '../NBSYS_GameManager';
const { ccclass, property } = _decorator;

@ccclass('NBSYS_SaoZi')
export class NBSYS_SaoZi extends NBSYS_TouchMonitor {
    public substance: string = "";//勺子上的物质

    start() {
        super.start();

    }

    TouchMoveInCident() {
        if (this.Lasttarget?.getComponent(NBSYS_Cup)) {//如果是碰到材料杯子
            if (this.substance != "") {
                console.log("勺子中已有材料");
                return;
            }
            let Name = this.Lasttarget?.getComponent(NBSYS_Cup)?.substance
            if (Name && NBSYS_GameData.GetData(Name)?.vessel == "勺子") {
                console.log("勺子获取材料" + NBSYS_GameData.GetData(Name).Name);
                this.substance = NBSYS_GameData.GetData(Name).Name;
                this.PlayAnimation(true, this.Lasttarget);
            } else {
                console.log("材料不可取");
            }
        }
        if (this.Lasttarget?.getComponent(NBSYS_SaoBei)) {//如果是碰到烧杯
            if (this.substance == "") {
                console.log("勺中没有材料");
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
                .to(0.5, { worldPosition: target.getWorldPosition().clone().add(v3(0, 500, 0)), angle: 90 })
                .to(0.5, { worldPosition: target.getWorldPosition().clone().add(v3(0, 200, 0)) })
                .call(() => {
                    if (isGet) {
                        NBSYS_Incident.LoadSprite("Sprits/勺子材料/" + this.substance).then((sp: SpriteFrame) => {
                            this.node.getChildByName("粉末").getComponent(Sprite).spriteFrame = sp;
                        })

                    } else {
                        target?.getComponent(NBSYS_SaoBei).Add(this.substance, this.node.getWorldPosition().clone().add(v3(0, -200, 0)));
                        this.substance = "";
                        this.node.getChildByName("粉末").getComponent(Sprite).spriteFrame = null;
                    }
                })
                .to(0.5, { worldPosition: target.getWorldPosition().clone().add(v3(0, 500, 0)) })
                .to(0.5, { angle: 0 })
                .call(() => {
                    if (this.node.worldPosition.y > 1000) {
                        tween(this.node).by(0.5, { position: v3(0, -500, 0) }).start();
                    }
                    this.node.setParent(NBSYS_GameManager.Instance.Bg.getChildByName("顶层"));
                })
                .start();

        }
    }

}


