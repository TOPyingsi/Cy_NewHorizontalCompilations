import { _decorator, Component, Node, Sprite, tween, UIOpacity } from 'cc';
import { NBSYS_TouchMonitor } from '../NBSYS_TouchMonitor';
import { NBSYS_GameData } from '../NBSYS_GameData';
import { NBSYS_GameManager } from '../NBSYS_GameManager';
const { ccclass, property } = _decorator;

@ccclass('NBSYS_QiNan')
export class NBSYS_QiNan extends NBSYS_TouchMonitor {
    @property()
    Name: string = "";
    public substance: string[] = [];//气囊内的物质
    public environment: string[] = [];//气囊的环境

    public IsDie: boolean = false;//是否已经破碎
    public Switch: boolean = false;
    start(): void {
        super.start();

    }
    TouchMoveInCident() {


    }
    //加入蜡烛
    Add_Candle() {
        if (this.IsDie) return;
        this.node.getChildByName("蜡烛").active = true;
        this.node.getChildByName("烧杯门").active = true;
        this.environment.push("高温");
        this.judge_reaction();
    }
    //开关气囊
    SwitchClick() {
        if (this.IsDie) return;
        this.Switch = !this.Switch;
        if (this.Switch == true) {
            this.node.getChildByName("气囊开").active = true;
            this.node.getChildByName("气囊关").active = false;
            this.substance.push("空气");
        } else {
            this.node.getChildByName("气囊开").active = false;
            this.node.getChildByName("气囊关").active = true;
            this.substance.splice(this.substance.indexOf("空气"), 1);
        }

        this.judge_reaction();
    }

    //判断反应
    judge_reaction() {
        NBSYS_GameData.Chemical_reaction.forEach((data) => {

            if (this.containsAllElements(this.substance, data.所需材料)) {
                if ((data.所需环境.length > 0)) {
                    if (this.containsAllElements(this.environment, data.所需环境)) {
                        console.log("反应咯" + data.反应);

                        this.React(data.反应);
                    }
                } else {
                    console.log("反应咯" + data.反应);
                    this.React(data.反应);
                }
            }
        })

    }
    containsAllElements(arr1: string[], arr2: string[]): boolean {
        // 遍历 arr2 中的每个元素
        for (const element of arr2) {
            // 如果 arr1 中不包含当前元素，返回 false
            if (!arr1.includes(element)) {
                return false;
            }
        }
        // 如果所有元素都存在于 arr1 中，返回 true
        return true;
    }
    //产生反应
    React(name: string) {
        this.node.getChildByName("粉尘爆炸").active = true;
        tween(this.node.getChildByName("气体层").getComponent(UIOpacity))
            .to(4, { opacity: 255 })
            .call(() => {
                NBSYS_GameManager.Instance.Camera_Shark();
                NBSYS_GameManager.Instance.PlayAudio(0);
                this.scheduleOnce(() => {
                    this.node.getChildByName("气体层").active = false;
                    this.node.getChildByName("烧杯门").active = false;
                    this.node.getChildByName("破碎超大烧杯").active = true;
                    this.node.getChildByName("超大烧杯").active = false;
                    this.node.getChildByName("粉尘爆炸").active = false;
                    this.node.getChildByName("蜡烛").active = false;
                    this.IsDie = true;
                }, 1.5)
            })
            .start();
        if (NBSYS_GameData.Template.find((dt) => { return dt.Name == name }).Winner.indexOf(name) != -1) {
            NBSYS_GameManager.Instance.GameWinner();
        }
    }
}


