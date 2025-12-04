import { _decorator, Component, director, Label, Node, Sprite, SpriteFrame } from 'cc';
import { XYMJ_Incident } from './XYMJ_Incident';
import { XYMJ_GameData } from './XYMJ_GameData';
import { UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import { XYMJ_WarehouseKnapsackSmallBox } from './XYMJ_WarehouseKnapsackSmallBox';
import { XYMJ_AudioManager } from './XYMJ_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('XYMJ_WarehouseSmallBox')
export class XYMJ_WarehouseSmallBox extends Component {
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
        if (XYMJ_GameData.Instance.WarehouseData[pos]) {
            let data = XYMJ_GameData.Instance.WarehouseData[pos];
            XYMJ_Incident.LoadSprite("Sprites/Prop/" + data.Name).then((sp: SpriteFrame) => {
                this.node.getChildByName("图片").getComponent(Sprite).spriteFrame = sp;
            })
            this.node.getChildByName("数量").getComponent(Label).string = data.Num + ``;
        }
    }
    OnClick() {
        XYMJ_AudioManager.globalAudioPlay("点击");
        let data = XYMJ_GameData.Instance.WarehouseData[this.pos];
        if (data) {//如果仓库有东西
            if (this.SelectData?.isValid) {//如果背包选中
                let SelectData = { Name: this.SelectData.getComponent(XYMJ_WarehouseKnapsackSmallBox).name, Num: this.SelectData.getComponent(XYMJ_WarehouseKnapsackSmallBox)._num }
                if (data.Name == SelectData.Name) { //如果背包和仓库是同一种东西
                    XYMJ_GameData.Instance.WarehouseData[this.pos].Num += SelectData.Num;
                    XYMJ_GameData.Instance.SubKnapsackData(SelectData.Name, SelectData.Num);
                    this.Init(this.pos);
                    return;
                }
            }
            if (XYMJ_GameData.Instance.pushKnapsackData(data.Name, 1)) {
                XYMJ_GameData.Instance.SubWarehouseData(this.pos, 1);
                this.node.getChildByName("数量").getComponent(Label).string = XYMJ_GameData.Instance.WarehouseData[this.pos]?.Num + ``;
                if (XYMJ_GameData.Instance.WarehouseData[this.pos] == null) {
                    this.node.getChildByName("图片").getComponent(Sprite).spriteFrame = null;
                    this.node.getChildByName("数量").getComponent(Label).string = ``;
                }
            } else {
                UIManager.ShowTip("背包已满，无法移入背包！");
            }

        } else {
            if (this.SelectData?.isValid) {//如果背包有选中节点且仓库为空
                let data = { Name: this.SelectData.getComponent(XYMJ_WarehouseKnapsackSmallBox).name, Num: this.SelectData.getComponent(XYMJ_WarehouseKnapsackSmallBox)._num }
                XYMJ_GameData.Instance.SubKnapsackData(data.Name, data.Num);
                XYMJ_GameData.Instance.WarehouseData[this.pos] = data;
                this.Init(this.pos);
            }

        }

    }
}


