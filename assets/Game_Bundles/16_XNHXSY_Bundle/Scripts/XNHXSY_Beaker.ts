import { _decorator, Component, Label, log, Node, Sprite, SpriteFrame } from 'cc';
import { XNHXSY_GameData } from './XNHXSY_GameData';
import { XNHXSY_GameManager } from './XNHXSY_GameManager';
import { XNHXSY_Incident } from './XNHXSY_Incident';
const { ccclass, property } = _decorator;

@ccclass('XNHXSY_Beaker')
export class XNHXSY_Beaker extends Component {
    @property(Label)
    public CupText: Label = null;

    public ReactionData: string[] = [];//烧杯内容
    start() {

    }

    //刷新烧杯内物质文本
    ShowText() {
        this.CupText.string = "烧杯环境:\n";
        this.ReactionData.forEach((text) => {
            this.CupText.string += text + "\n"
        })
    }

    //刷新烧杯内物质
    ShowCup() {
        let cups = this.node.parent.getChildByName("烧杯材料");
        cups.children.forEach((cd) => { cd.getComponent(Sprite).spriteFrame = null })
        let reaction: string[] = [];
        this.ReactionData.forEach((cd) => { if (cd != "高温") reaction.push(cd) })
        cups.children.forEach((cd, index) => {
            if (reaction.length > index) {
                let name = reaction[index];
                XNHXSY_Incident.LoadSprite("Sprite/化学瓶中物体/" + name).then((sp: SpriteFrame) => {
                    cd.getComponent(Sprite).spriteFrame = sp;
                })
            }
        })

    }
    //烧杯添加元素
    Add(data: string) {
        if (this.ReactionData.indexOf(data) == -1) {
            this.ReactionData.push(data);
        }
        console.log(this.ReactionData);
        this.Reaction();
        this.ShowText();
        this.ShowCup();
        if (XNHXSY_GameManager.GameScene == 0 && data == "Co") {
            if (XNHXSY_GameManager.Instance.courseIndex == 2) {
                XNHXSY_GameManager.Instance.UINode.getChildByName("小手1").active = false;
                XNHXSY_GameManager.Instance.UINode.getChildByName("小手2").active = true;
                XNHXSY_GameManager.Instance.courseIndex = 3;
            }
        }
        if (XNHXSY_GameManager.GameScene == 0 && data == "o2") {
            if (XNHXSY_GameManager.Instance.courseIndex == 3) {
                XNHXSY_GameManager.Instance.UINode.getChildByName("小手2").active = false;
                XNHXSY_GameManager.Instance.UINode.getChildByName("小手3").active = true;
                XNHXSY_GameManager.Instance.courseIndex = 4;
            }
        }
    }
    Sub(data: string) {
        let index = this.ReactionData.indexOf(data)
        if (index != -1) {
            this.ReactionData.splice(index, 1);
            console.log(this.ReactionData);
        } else {
            console.log("烧杯中没有" + data + ",无法删除！");
        }
        this.ShowText();
        this.ShowCup();
    }

    //烧杯反应
    Reaction() {
        XNHXSY_GameData.CompoundData.forEach((data) => {
            let isCanReaction: boolean = true;
            data.材料.forEach((dt) => {
                if (this.ReactionData.indexOf(dt) == -1) {
                    isCanReaction = false;
                }
            })
            if (isCanReaction) {
                //移出材料
                data.材料.forEach((dt) => {
                    if (dt != "高温") {
                        this.ReactionData.splice(this.ReactionData.indexOf(dt), 1);
                    }
                })
                //添加合成材料
                this.Add(data.合成物);
            }
        })
        XNHXSY_GameManager.Instance.IsReaction();
    }

    //烧杯清除
    ReStart() {
        this.ReactionData.forEach((cd) => {
            if (cd != "高温") {
                this.Sub(cd);
            }
        })

    }
}


