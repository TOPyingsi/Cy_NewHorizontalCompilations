import { _decorator, Component, director, instantiate, Label, Node, Prefab } from 'cc';
import { XGTS_DanYaoBox } from './XGTS_DanYaoBox';
import { XGTS_GameData } from './XGTS_GameData';
import { UIManager } from '../../../Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('XGTS_DanYaoPanel')
export class XGTS_DanYaoPanel extends Component {
    @property(Prefab)
    public DanYaoBox: Prefab = null;
    private data: string[] = ["凡品丹药_普通", "凡品丹药_优质", "凡品丹药_顶级", "凡品丹药_极品", "凡品丹药_超级",
        "灵品丹药", "圣品丹药", "帝品丹药", "仙品丹药", "神品丹药"];

    public Content: Node = null;
    private boxList: Node[] = [];
    start() {
        this.Content = this.node.getChildByPath("道具底/Mask/Conten");
        this.Init();
        director.getScene().on("获得丹药", this.Show, this);
        director.getScene().on("怪物死亡", this.GetXianDan, this);
        director.getScene().on("食用丹药", this.Show, this);

        this.Show();
    }

    //初始化
    Init() {
        this.data.forEach((element, randomIndex) => {
            let box = instantiate(this.DanYaoBox);
            box.getComponent(XGTS_DanYaoBox).Init(element);
            box.setParent(this.Content);
            this.boxList.push(box);
        });

    }
    Show() {
        this.boxList.forEach(element => {
            element.getComponent(XGTS_DanYaoBox).Show();
        });
        this.node.getChildByName("描述").getComponent(Label).string =
            `丹药加成：\n生命:${XGTS_GameData.Instance.AddHp.toFixed(2)}\n攻速:${XGTS_GameData.Instance.AddAtk.toFixed(2)}%\n移速:${XGTS_GameData.Instance.AddSpeed.toFixed(2)}%`
    }

    //一键吃丹
    YiJianChiDanClick() {
        director.getScene().emit("已一键吃完所有丹药！");
        this.boxList.forEach(element => {
            element.getComponent(XGTS_DanYaoBox).EatAll();
        });
    }


    //获得仙丹
    GetXianDan() {
        XGTS_GameData.Instance.elixirData[Math.floor(Math.random() * XGTS_GameData.Instance.elixirData.length)]++;
        UIManager.ShowTip("击杀敌人，获得丹药一枚！");
        this.Show();
    }
}


