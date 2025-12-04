import { _decorator, Component, director, Label, Node, Sprite, SpriteFrame } from 'cc';
import { XYMJDWY_Incident } from './XYMJDWY_Incident';
import { XYMJDWY_GameData } from './XYMJDWY_GameData';
import { UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import { XYMJDWY_WarehouseKnapsackSmallBox } from './XYMJDWY_WarehouseKnapsackSmallBox';
import { XYMJDWY_AudioManager } from './XYMJDWY_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJDWY_WarehouseSmallBox')
export class XYMJDWY_WarehouseSmallBox extends Component {
    private SelectData: Node = null;//选中的背包节点
    private pos: number = -1;//位置
    start() {
        director.getScene().on("选择背包按钮", this.SelectButtom, this);
    }
    //背包按钮被选中
    SelectButtom(nd: Node) {
        this.SelectData = nd;
    }
    //初始化
    Init(pos: number) {
        this.pos = pos;
        if (XYMJDWY_GameData.Instance.WarehouseData[pos]) {
            let data = XYMJDWY_GameData.Instance.WarehouseData[pos];
            XYMJDWY_Incident.LoadSprite("Sprites/Prop/" + data.Name).then((sp: SpriteFrame) => {
                this.node.getChildByName("图片").getComponent(Sprite).spriteFrame = sp;
            })
            this.node.getChildByName("数量").getComponent(Label).string = data.Num + ``;
        }
    }
    OnClick() {
        XYMJDWY_AudioManager.globalAudioPlay("点击");
        let data = XYMJDWY_GameData.Instance.WarehouseData[this.pos];
        if (data) {//如果仓库有东西
            if (this.SelectData?.isValid) {//如果背包选中
                let SelectData = { Name: this.SelectData.getComponent(XYMJDWY_WarehouseKnapsackSmallBox).name, Num: this.SelectData.getComponent(XYMJDWY_WarehouseKnapsackSmallBox)._num }
                if (data.Name == SelectData.Name) { //如果背包和仓库是同一种东西
                    XYMJDWY_GameData.Instance.WarehouseData[this.pos].Num += SelectData.Num;
                    XYMJDWY_GameData.Instance.SubKnapsackData(SelectData.Name, SelectData.Num);
                    this.Init(this.pos);
                    return;
                }
            }
            if (XYMJDWY_GameData.Instance.pushKnapsackData(data.Name, 1)) {
                XYMJDWY_GameData.Instance.SubWarehouseData(this.pos, 1);
                this.node.getChildByName("数量").getComponent(Label).string = XYMJDWY_GameData.Instance.WarehouseData[this.pos]?.Num + ``;
                if (XYMJDWY_GameData.Instance.WarehouseData[this.pos] == null) {
                    this.node.getChildByName("图片").getComponent(Sprite).spriteFrame = null;
                    this.node.getChildByName("数量").getComponent(Label).string = ``;
                }
            } else {
                UIManager.ShowTip("背包已满，无法移入背包！");
            }

        } else {
            if (this.SelectData?.isValid) {//如果背包有选中节点且仓库为空
                let data = { Name: this.SelectData.getComponent(XYMJDWY_WarehouseKnapsackSmallBox).name, Num: this.SelectData.getComponent(XYMJDWY_WarehouseKnapsackSmallBox)._num }
                XYMJDWY_GameData.Instance.SubKnapsackData(data.Name, data.Num);
                XYMJDWY_GameData.Instance.WarehouseData[this.pos] = data;
                this.Init(this.pos);
            }

        }

    }
}


