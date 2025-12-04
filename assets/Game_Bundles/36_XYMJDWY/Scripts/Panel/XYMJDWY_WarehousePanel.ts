import { _decorator, Component, director, instantiate, Label, Node, Prefab, UITransform } from 'cc';
import { XYMJDWY_Incident } from '../XYMJDWY_Incident';
import { XYMJDWY_GameData } from '../XYMJDWY_GameData';
import { XYMJDWY_WarehouseKnapsackSmallBox } from '../XYMJDWY_WarehouseKnapsackSmallBox';
import { XYMJDWY_WarehouseSmallBox } from '../XYMJDWY_WarehouseSmallBox';
import { XYMJDWY_AudioManager } from '../XYMJDWY_AudioManager';
import { XYMJDWY_Constant } from '../XYMJDWY_Constant';
const { ccclass, property } = _decorator;

@ccclass('XYMJDWY_WarehousePanel')
export class XYMJDWY_WarehousePanel extends Component {
    protected start(): void {
        director.getScene().on("刷新仓库背包", this.ShowKnapsack, this);
        director.getScene().on("选择背包按钮", this.SelectButtom, this);
    }
    SelectButtom(nd: Node) {

        this.node.getChildByPath("描述").getComponent(Label).string =
            nd.getComponent(XYMJDWY_WarehouseKnapsackSmallBox)._name + "\n" +
            XYMJDWY_Constant.GetDataByName(nd.getComponent(XYMJDWY_WarehouseKnapsackSmallBox)._name).describe;
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
        XYMJDWY_AudioManager.globalAudioPlay("点击");
        this.node.active = false;
    }

    //根据背包物品数量设置Content高度
    ResetContenthight() {
        let nd = this.node.getChildByPath("背包/Content");
        nd.getComponent(UITransform).height = XYMJDWY_GameData.Instance.KnapsackData.length * 190 + 20;
    }

    //动态刷新背包数据
    ShowKnapsack(Name: string, Num: number) {
        let isShow: boolean = false;
        let nd = this.node.getChildByPath("背包/Content");
        for (let i = 0; i < nd.children.length; i++) {
            if (nd.children[i].getComponent(XYMJDWY_WarehouseKnapsackSmallBox)._name == Name) {
                nd.children[i].getComponent(XYMJDWY_WarehouseKnapsackSmallBox).Init(Name, Num);
                isShow = true;
            }
        }
        if (!isShow) {
            XYMJDWY_Incident.Loadprefab("Prefabs/仓库背包小格子").then((pre: Prefab) => {
                let box = instantiate(pre);
                box.setParent(nd);
                box.getComponent(XYMJDWY_WarehouseKnapsackSmallBox).Init(Name, Num);
            })
        }
        this.ResetContenthight();
    }



    //重置背包数据
    ReSetKnapsack() {
        let nd = this.node.getChildByPath("背包/Content");
        nd.removeAllChildren();
        XYMJDWY_Incident.Loadprefab("Prefabs/仓库背包小格子").then((pre: Prefab) => {
            for (let i = 0; i < XYMJDWY_GameData.Instance.KnapsackData.length; i++) {
                let box = instantiate(pre);
                box.setParent(nd);
                box.getComponent(XYMJDWY_WarehouseKnapsackSmallBox).Init(XYMJDWY_GameData.Instance.KnapsackData[i].Name, XYMJDWY_GameData.Instance.KnapsackData[i].Num);
            }
            this.ResetContenthight();
        })
    }

    //重置仓库数据
    ReSetWarehouse() {
        let nd = this.node.getChildByPath("仓库/Content");
        nd.removeAllChildren();
        XYMJDWY_Incident.Loadprefab("Prefabs/仓库小格子").then((pre: Prefab) => {
            for (let i = 0; i < 40; i++) {
                let box = instantiate(pre);
                box.setParent(nd);
                box.getComponent(XYMJDWY_WarehouseSmallBox).Init(i);
            }
        })

    }


}


