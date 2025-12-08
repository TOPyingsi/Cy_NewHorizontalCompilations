import { _decorator, Component, director, Label, Node, Sprite, SpriteFrame } from 'cc';
import { UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import { BundleManager } from '../../../Scripts/Framework/Managers/BundleManager';
import { XGTS_GameData } from './XGTS_GameData';
const { ccclass, property } = _decorator;

@ccclass('XGTS_DanYaoBox')
export class XGTS_DanYaoBox extends Component {
    public Name = "";
    private data: string[] = ["凡品丹药_普通", "凡品丹药_优质", "凡品丹药_顶级", "凡品丹药_极品", "凡品丹药_超级",
        "灵品丹药", "圣品丹药", "帝品丹药", "仙品丹药", "神品丹药"];
    start() {

    }
    OnClick() {
        this.Eat();
        UIManager.ShowTip("服用成功！");
    }

    Init(Name: string) {
        this.Name = Name;
        BundleManager.GetBundle("50_XGTS").load("Res/吃丹/丹药/" + Name + "/spriteFrame", SpriteFrame, (err, data) => {
            if (err) {
                return;
            }
            this.node.getChildByName("图片").getComponent(Sprite).spriteFrame = data;
        })

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
        let num = XGTS_GameData.Instance.elixirData[this.data.indexOf(this.Name)];
        if (num <= 0) {
            this.node.active = false;
            return;
        }
        this.node.active = true;
        this.node.getChildByName("数量").getComponent(Label).string = "X" + num;
    }
    //吃掉一颗丹药
    Eat() {
        if (XGTS_GameData.Instance.elixirData[this.data.indexOf(this.Name)] > 0) {
            switch (this.Name) {
                case "凡品丹药_普通":
                    XGTS_GameData.Instance.AddHp += 1;
                    break;
                case "凡品丹药_优质":
                    XGTS_GameData.Instance.AddHp += 2;
                    break;
                case "凡品丹药_顶级":
                    XGTS_GameData.Instance.AddHp += 3;
                    break;
                case "凡品丹药_极品":
                    XGTS_GameData.Instance.AddHp += 5;
                    break;
                case "凡品丹药_超级":
                    XGTS_GameData.Instance.AddHp += 7;
                    break;
                case "灵品丹药":
                    XGTS_GameData.Instance.AddHp += 10;
                    break;
                case "圣品丹药":
                    XGTS_GameData.Instance.AddAtk += 0.01;
                    break;
                case "帝品丹药":
                    XGTS_GameData.Instance.AddSpeed += 0.01;
                    break;
                case "仙品丹药":
                    XGTS_GameData.Instance.AddAtk += 0.05;
                    break;
                case "神品丹药":
                    XGTS_GameData.Instance.AddSpeed += 0.05;
                    break;
            }
            XGTS_GameData.Instance.elixirData[this.data.indexOf(this.Name)]--;
            director.getScene().emit("食用丹药");
            this.Show();
        }
    }
    //吃掉所有丹药
    EatAll() {
        if (XGTS_GameData.Instance.elixirData[this.data.indexOf(this.Name)] > 0) {
            this.Eat();
            this.EatAll();
        }
    }


}


