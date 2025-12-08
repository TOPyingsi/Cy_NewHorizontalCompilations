import { _decorator, Component, director, instantiate, Label, Node, Prefab, UITransform } from 'cc';
import { XYMJXXB_Incident } from '../XYMJXXB_Incident';
import { XYMJXXB_GameData } from '../XYMJXXB_GameData';
import { XYMJXXB_WarehouseKnapsackSmallBox } from '../XYMJXXB_WarehouseKnapsackSmallBox';
import { XYMJXXB_WarehouseSmallBox } from '../XYMJXXB_WarehouseSmallBox';
import { XYMJXXB_AudioManager } from '../XYMJXXB_AudioManager';
import { XYMJXXB_Constant } from '../XYMJXXB_Constant';
const { ccclass, property } = _decorator;

@ccclass('XYMJXXB_WarehousePanel')
export class XYMJXXB_WarehousePanel extends Component {
    protected start(): void {
        director.getScene().on("刷新仓库背包", this.ShowKnapsack, this);
        director.getScene().on("选择背包按钮", this.SelectButtom, this);
    }
    SelectButtom(nd: Node) {

        this.node.getChildByPath("描述").getComponent(Label).string =
            nd.getComponent(XYMJXXB_WarehouseKnapsackSmallBox)._name + "\n" +
            XYMJXXB_Constant.GetDataByName(nd.getComponent(XYMJXXB_WarehouseKnapsackSmallBox)._name).describe;
    }
    protected onEnable(): void {
        this.Show();
    }
    //每次启动的时候执行
    Show() {
        this.ReSetKnapsack();
        this.ReSetWarehouse();
    }


    OnExit() {
        XYMJXXB_AudioManager.globalAudioPlay("点击");
        this.node.active = false;
    }

    //根据背包物品数量设置Content高度
    ResetContenthight() {
        let nd = this.node.getChildByPath("背包/Content");
        nd.getComponent(UITransform).height = XYMJXXB_GameData.Instance.KnapsackData.length * 190 + 20;
    }

    //动态刷新背包数据
    ShowKnapsack(Name: string, Num: number) {
        let isShow: boolean = false;
        let nd = this.node.getChildByPath("背包/Content");
        for (let i = 0; i < nd.children.length; i++) {
            if (nd.children[i].getComponent(XYMJXXB_WarehouseKnapsackSmallBox)._name == Name) {
                nd.children[i].getComponent(XYMJXXB_WarehouseKnapsackSmallBox).Init(Name, Num);
                isShow = true;
            }
        }
        if (!isShow) {
            XYMJXXB_Incident.Loadprefab("Prefabs/仓库背包小格子").then((pre: Prefab) => {
                let box = instantiate(pre);
                box.setParent(nd);
                box.getComponent(XYMJXXB_WarehouseKnapsackSmallBox).Init(Name, Num);
            })
        }
        this.ResetContenthight();
    }



    //重置背包数据
    ReSetKnapsack() {
        let nd = this.node.getChildByPath("背包/Content");
        nd.removeAllChildren();
        XYMJXXB_Incident.Loadprefab("Prefabs/仓库背包小格子").then((pre: Prefab) => {
            for (let i = 0; i < XYMJXXB_GameData.Instance.KnapsackData.length; i++) {
                let box = instantiate(pre);
                box.setParent(nd);
                box.getComponent(XYMJXXB_WarehouseKnapsackSmallBox).Init(XYMJXXB_GameData.Instance.KnapsackData[i].Name, XYMJXXB_GameData.Instance.KnapsackData[i].Num);
            }
            this.ResetContenthight();
        })
    }

    //重置仓库数据
    ReSetWarehouse() {
        let nd = this.node.getChildByPath("仓库/Content");
        nd.removeAllChildren();
        XYMJXXB_Incident.Loadprefab("Prefabs/仓库小格子").then((pre: Prefab) => {
            for (let i = 0; i < 40; i++) {
                let box = instantiate(pre);
                box.setParent(nd);
                box.getComponent(XYMJXXB_WarehouseSmallBox).Init(i);
            }
        })

    }


}


