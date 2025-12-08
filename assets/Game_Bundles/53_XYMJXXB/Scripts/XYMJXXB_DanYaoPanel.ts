import { _decorator, Component, director, instantiate, Label, Node, Prefab } from 'cc';
import { XYMJXXB_DanYaoBox } from './XYMJXXB_DanYaoBox';
import { XYMJXXB_GameData } from './XYMJXXB_GameData';
const { ccclass, property } = _decorator;

@ccclass('XYMJXXB_DanYaoPanel')
export class XYMJXXB_DanYaoPanel extends Component {
    @property(Prefab)
    public DanYaoBox: Prefab = null;
    private data: string[] = ["凡品丹药_普通", "凡品丹药_优质", "凡品丹药_顶级", "凡品丹药_极品", "凡品丹药_超级",
        "灵品丹药", "圣品丹药", "帝品丹药", "仙品丹药", "神品丹药"];

    public Content: Node = null;
    private boxList: Node[] = [];
    start() {
        this.Content = this.node.getChildByPath("框/Mask/Content");
        this.Init();
        director.getScene().on("刷新仓库背包", this.Show, this);
        this.Show();
    }

    //初始化
    Init() {
        this.data.forEach((element, randomIndex) => {
            let box = instantiate(this.DanYaoBox);
            box.getComponent(XYMJXXB_DanYaoBox).Init(element);
            box.setParent(this.Content);
            this.boxList.push(box);
        });

    }
    Show() {
        this.boxList.forEach(element => {
            element.getComponent(XYMJXXB_DanYaoBox).Show();
        });
        this.node.getChildByName("丹药加成").getComponent(Label).string =
            `丹药加成：\n生命:${XYMJXXB_GameData.Instance.AddHP.toFixed(2)}\n攻速:${XYMJXXB_GameData.Instance.AddATKSpeed.toFixed(2)}%\n移速:${XYMJXXB_GameData.Instance.AddMoveSpeed.toFixed(2)}%`
    }

    //一键吃丹
    YiJianChiDanClick() {
        director.getScene().emit("已一键吃完所有丹药！");
        this.boxList.forEach(element => {
            element.getComponent(XYMJXXB_DanYaoBox).EatAll();
        });
    }

}


