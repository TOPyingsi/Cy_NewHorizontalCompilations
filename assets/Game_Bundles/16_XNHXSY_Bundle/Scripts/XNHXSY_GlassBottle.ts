import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { XNHXSY_TouchMonitor } from './XNHXSY_TouchMonitor';
import { XNHXSY_GameData } from './XNHXSY_GameData';
import { XNHXSY_GameManager } from './XNHXSY_GameManager';
import { XNHXSY_Incident } from './XNHXSY_Incident';
const { ccclass, property } = _decorator;

@ccclass('XNHXSY_GlassBottle')
export class XNHXSY_GlassBottle extends XNHXSY_TouchMonitor {

    public Data: { Name: string, CnName: string, density: number, solubility: number, FreezingPoint: number, BoilingPoint: number } = null;
    start() {
        super.start();

    }

    //初始化
    Init() {
        this.Data = XNHXSY_GameData.MateerData[this.ID];
        this.node.getChildByName("名字").getComponent(Label).string = this.Data.Name;
        //加载图片
        XNHXSY_Incident.LoadSprite("Sprite/化学物品/" + this.Data.Name).then((sp: SpriteFrame) => {
            this.node.getComponent(Sprite).spriteFrame = sp;
        });
    }

    //事件接口,拖拽到某位置放开触发_触发事件
    TouchMoveInCident() {
        XNHXSY_GameManager.Instance.Beaker.Add(this.Data.Name);
        this.restoration();
    }
    TouchOnClick() {
        if (XNHXSY_GameManager.Instance.courseIndex == 0) {
            XNHXSY_GameManager.Instance.UINode.getChildByName("小手0").active = false;
            XNHXSY_GameManager.Instance.courseIndex = 1;
        }
        let text = `元素名：${this.Data.Name}\n中文名:${this.Data.CnName}\n密度:${this.Data.density}\n溶解度:${this.Data.solubility}\n冰点:${this.Data.FreezingPoint}\n熔点:${this.Data.BoilingPoint}`
        XNHXSY_GameData.CompoundData.forEach((data) => {
            let index = data.材料.indexOf(this.Data.Name);
            if (index != -1) {
                text += "\n" + XNHXSY_GameData.GetCompoundDataText(data);
            }
        })


        XNHXSY_GameManager.Instance.OpenTip(text);

    }
}


