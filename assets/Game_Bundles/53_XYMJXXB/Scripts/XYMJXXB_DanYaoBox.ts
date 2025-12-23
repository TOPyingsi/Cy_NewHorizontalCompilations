import { _decorator, Component, director, Label, Node, Sprite, SpriteFrame, UI } from 'cc';
import { XYMJXXB_Incident } from './XYMJXXB_Incident';
import { XYMJXXB_GameData } from './XYMJXXB_GameData';
import { UIManager } from '../../../Scripts/Framework/Managers/UIManager';

const { ccclass, property } = _decorator;

@ccclass('XYMJXXB_DanYaoBox')
export class XYMJXXB_DanYaoBox extends Component {
    public Name = "";

    start() {

    }
    OnClick() {
        this.Eat();
        UIManager.ShowTip("服用成功！");
    }

    Init(Name: string) {
        this.Name = Name;
        XYMJXXB_Incident.LoadSprite("Sprites/Prop/" + Name).then((sp: SpriteFrame) => {
            this.node.getChildByName("图片").getComponent(Sprite).spriteFrame = sp;
        });
        this.Show();
        let str = "";
        switch (this.Name) {
            case "凡品丹药_普通":
            case "凡品丹药_优质":
            case "凡品丹药_顶级":
            case "凡品丹药_极品":
            case "凡品丹药_超级":
            case "灵品丹药":
                str = "+生命";
                break;
            case "圣品丹药":
            case "仙品丹药":
                str = "+攻速";
                break;
            case "帝品丹药":
            case "神品丹药":
                str = "+移速";
                break;
        }
        this.node.getChildByName("加成").getComponent(Label).string = str;
    }

    Show() {
        let num = XYMJXXB_GameData.Instance.GetPropNum(this.Name);
        if (num <= 0) {
            this.node.active = false;
            return;
        }
        this.node.active = true;
        this.node.getChildByName("数量").getComponent(Label).string = "X" + XYMJXXB_GameData.Instance.GetPropNum(this.Name);
    }
    //吃掉一颗丹药
    Eat() {
        if (XYMJXXB_GameData.Instance.GetPropNum(this.Name) > 0) {
            switch (this.Name) {
                case "凡品丹药_普通":
                    XYMJXXB_GameData.Instance.AddHP += 1;
                    break;
                case "凡品丹药_优质":
                    XYMJXXB_GameData.Instance.AddHP += 2;
                    break;
                case "凡品丹药_顶级":
                    XYMJXXB_GameData.Instance.AddHP += 3;
                    break;
                case "凡品丹药_极品":
                    XYMJXXB_GameData.Instance.AddHP += 5;
                    break;
                case "凡品丹药_超级":
                    XYMJXXB_GameData.Instance.AddHP += 7;
                    break;
                case "灵品丹药":
                    XYMJXXB_GameData.Instance.AddHP += 10;
                    break;
                case "圣品丹药":
                    XYMJXXB_GameData.Instance.AddATKSpeed += 0.01;
                    break;
                case "帝品丹药":
                    XYMJXXB_GameData.Instance.AddMoveSpeed += 0.01;
                    break;
                case "仙品丹药":
                    XYMJXXB_GameData.Instance.AddATKSpeed += 0.05;
                    break;
                case "神品丹药":
                    XYMJXXB_GameData.Instance.AddMoveSpeed += 0.05;
                    break;
            }
            XYMJXXB_GameData.Instance.SubKnapsackData(this.Name, 1);
            director.getScene().emit("食用丹药");
            this.Show();
            director.getScene().emit("校园摸金_添加道具", this.Name);
        }
    }
    //吃掉所有丹药
    EatAll() {
        if (XYMJXXB_GameData.Instance.GetPropNum(this.Name) > 0) {
            this.Eat();
            this.EatAll();
        }
    }
}


