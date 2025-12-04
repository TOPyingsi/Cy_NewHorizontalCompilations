import { _decorator, Component, director, instantiate, Label, Node, Prefab, UITransform } from 'cc';
import { XYMJ_Incident } from '../XYMJ_Incident';
import { XYMJ_GameData } from '../XYMJ_GameData';
import { XYMJ_WarehouseKnapsackSmallBox } from '../XYMJ_WarehouseKnapsackSmallBox';
import { XYMJ_WarehouseSmallBox } from '../XYMJ_WarehouseSmallBox';
import { XYMJ_AudioManager } from '../XYMJ_AudioManager';
import { XYMJ_Constant } from '../XYMJ_Constant';
const { ccclass, property } = _decorator;

@ccclass('XYMJ_WarehousePanel')
export class XYMJ_WarehousePanel extends Component {
    protected start(): void {
        director.getScene().on("刷新仓库背包", this.ShowKnapsack, this);
        director.getScene().on("选择背包按钮", this.SelectButtom, this);
    }
    SelectButtom(nd: Node) {

        this.node.getChildByPath("描述").getComponent(Label).string =
            nd.getComponent(XYMJ_WarehouseKnapsackSmallBox)._name + "\n" +
            XYMJ_Constant.GetDataByName(nd.getComponent(XYMJ_WarehouseKnapsackSmallBox)._name).describe;
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
        XYMJ_AudioManager.globalAudioPlay("点击");
        this.node.active = false;
    }

    //根据背包物品数量设置Content高度
    ResetContenthight() {
        let nd = this.node.getChildByPath("背包/Content");
        nd.getComponent(UITransform).height = XYMJ_GameData.Instance.KnapsackData.length * 190 + 20;
    }

    //动态刷新背包数据
    ShowKnapsack(Name: string, Num: number) {
        let isShow: boolean = false;
        let nd = this.node.getChildByPath("背包/Content");
        for (let i = 0; i < nd.children.length; i++) {
            if (nd.children[i].getComponent(XYMJ_WarehouseKnapsackSmallBox)._name == Name) {
                nd.children[i].getComponent(XYMJ_WarehouseKnapsackSmallBox).Init(Name, Num);
                isShow = true;
            }
        }
        if (!isShow) {
            XYMJ_Incident.Loadprefab("Prefabs/仓库背包小格子").then((pre: Prefab) => {
                let box = instantiate(pre);
                box.setParent(nd);
                box.getComponent(XYMJ_WarehouseKnapsackSmallBox).Init(Name, Num);
            })
        }
        this.ResetContenthight();
    }



    //重置背包数据
    ReSetKnapsack() {
        let nd = this.node.getChildByPath("背包/Content");
        nd.removeAllChildren();
        XYMJ_Incident.Loadprefab("Prefabs/仓库背包小格子").then((pre: Prefab) => {
            for (let i = 0; i < XYMJ_GameData.Instance.KnapsackData.length; i++) {
                let box = instantiate(pre);
                box.setParent(nd);
                box.getComponent(XYMJ_WarehouseKnapsackSmallBox).Init(XYMJ_GameData.Instance.KnapsackData[i].Name, XYMJ_GameData.Instance.KnapsackData[i].Num);
            }
            this.ResetContenthight();
        })
    }

    //重置仓库数据
    ReSetWarehouse() {
        let nd = this.node.getChildByPath("仓库/Content");
        nd.removeAllChildren();
        XYMJ_Incident.Loadprefab("Prefabs/仓库小格子").then((pre: Prefab) => {
            for (let i = 0; i < 40; i++) {
                let box = instantiate(pre);
                box.setParent(nd);
                box.getComponent(XYMJ_WarehouseSmallBox).Init(i);
            }
        })

    }


}


