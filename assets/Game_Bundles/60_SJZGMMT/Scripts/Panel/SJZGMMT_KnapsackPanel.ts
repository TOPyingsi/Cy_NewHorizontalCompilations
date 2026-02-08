import { _decorator, Component, director, EventTouch, instantiate, Label, Node, Prefab, UITransform, Widget } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { SJZGMMT_UIManager } from '../SJZGMMT_UIManager';
import { SJZGMMT_Constant } from '../SJZGMMT_Constant';
import { SJZGMMT_GameData } from '../SJZGMMT_GameData';
import { SJZGMMT_Incident } from '../SJZGMMT_Incident';
import { SJZGMMT_GameManager } from '../SJZGMMT_GameManager';
import { SJZGMMT_GetPropBox } from '../SJZGMMT_GetPropBox';
import { SJZGMMT_PoolManager } from '../SJZGMMT_PoolManager';
import { SJZGMMT_EventManager } from '../SJZGMMT_EventManager';
import { SJZGMMT_KnapsackPropBox } from '../SJZGMMT_KnapsackPropBox';
import { SJZGMMT_AudioManager } from '../SJZGMMT_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_KnapsackPanel')
export class SJZGMMT_KnapsackPanel extends PanelBase {
    @property(Prefab)
    KnapsackPropBox: Prefab = null;
    @property(Node)
    KnapsackPropContent: Node = null;


    @property(Node)
    SearchPropContent: Node = null;
    private SelectKnapsackPropBox: Node = null;
    protected start(): void {
        SJZGMMT_UIManager.Instance.SJZGMMT_On(SJZGMMT_EventManager.道具搜索完毕, this.Sendmessage, this);
        SJZGMMT_UIManager.Instance.SJZGMMT_On(SJZGMMT_EventManager.搜索框移除小框, this.Subpropdata, this);

        SJZGMMT_UIManager.Instance.SJZGMMT_On(SJZGMMT_EventManager.背包添加物品, this.AddKnapsackProp, this);
        SJZGMMT_UIManager.Instance.SJZGMMT_On(SJZGMMT_EventManager.背包物品选中, this.SelectProp, this);
        SJZGMMT_UIManager.Instance.SJZGMMT_On(SJZGMMT_EventManager.背包删除所有物品, this.DropAllProp, this);
        director.getScene().on(SJZGMMT_EventManager.背包扩容, this.ShowData, this);
        SJZGMMT_UIManager.Instance.SJZGMMT_On(SJZGMMT_EventManager.表情包展示, this.ShowFace, this);
    }
    protected update(dt: number): void {
        if (this.FaceCD > 0) this.FaceCD -= dt;
    }
    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
        if (args && args[0]) {//带参显示资源
            this.node.getChildByPath("框/资源").active = true;
            this.node.getChildByPath("框/整理装备").x = -270;
            this.ShowKnapsackProp(args[0]);
        } else {
            this.node.getChildByPath("框/资源").active = false;
            this.node.getChildByPath("框/整理装备").x = 0;
        }
    }
    protected onEnable(): void {
        this.HideFace();
        if (SJZGMMT_GameData.Instance.KnapsackData.length == 0) {
            this.ShowData();
        }
    }

    OnButtonClick(event: EventTouch) {
        SJZGMMT_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "关闭":
                this.SearchPropBoxList = [];//重置待刷新列表
                SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.KnapsackPanel);
                break;
            case "丢弃":
                this.DropProp();
                break;
        }
    }

    //刷新界面显示
    ShowData() {
        this.node.getChildByPath("框/整理装备/总重量").getComponent(Label).string =
            `重量: ${SJZGMMT_GameData.Instance.GetKnapsackWeight()}/${SJZGMMT_GameManager.Instance.knapsackCapacity}`;
        this.node.getChildByPath("框/整理装备/总价值").getComponent(Label).string = SJZGMMT_Incident.GetMaxNum(this.GetKnapsackPrice());
    }



    //计算当前背包中所有物体的价值
    public GetKnapsackPrice(): number {
        let Price: number = 0;
        for (let i = 0; i < SJZGMMT_GameData.Instance.KnapsackData.length; i++) {
            Price += SJZGMMT_Constant.getPropDataByName(SJZGMMT_GameData.Instance.KnapsackData[i])?.price;
        }
        return Price;
    }

    private SearchPropBoxList: SJZGMMT_GetPropBox[] = [];//待刷新节点列表
    private data: { Name: string, Isobserve: boolean }[] = null;
    //刷新背包的资源区
    ShowKnapsackProp(data: { Name: string, Isobserve: boolean }[]) {
        if (data == null) {
            SJZGMMT_UIManager.Instance.ShowText("你已远离搜索区！");
            return;
        }
        this.data = data;
        let len = this.SearchPropContent.children.length;
        for (let index = len - 1; index >= 0; index--) {
            SJZGMMT_PoolManager.Instance.Put(this.SearchPropContent.children[index]);
        }

        for (let i = 0; i < data.length; i++) {
            let propBox = SJZGMMT_PoolManager.Instance.Get("搜索框");
            propBox.setParent(this.SearchPropContent);
            if (data[i].Isobserve == false) {
                this.SearchPropBoxList.push(propBox.getComponent(SJZGMMT_GetPropBox));
            }
            propBox.getComponent(SJZGMMT_GetPropBox).Init(data[i]);
        }
        this.Sendmessage();//开始搜索
    }
    //背包添加物品
    AddKnapsackProp(Name: string) {
        this.ShowData();
        let nd = SJZGMMT_PoolManager.Instance.Get("背包道具格");
        nd.setParent(this.KnapsackPropContent);
        nd.getComponent(SJZGMMT_KnapsackPropBox).Init(Name);
        this.KnapsackPropContent.getComponent(UITransform).height = 10 + this.KnapsackPropContent.children.length * 145;
        this.KnapsackPropContent.getComponent(Widget).top = 0;
    }

    //逐个发送刷新信息
    Sendmessage() {
        if (this.SearchPropBoxList.length > 0) {
            this.SearchPropBoxList[0].StartSearch();
            this.SearchPropBoxList.splice(0, 1);
        }
    }
    Subpropdata(propdata: { Name: string, Isobserve: boolean }) {
        this.data.splice(this.data.indexOf(propdata), 1);
    }

    //选中
    public SelectProp(node: Node) {
        this.SelectKnapsackPropBox = node;
    }
    //丢弃
    public DropProp() {
        if (this.SelectKnapsackPropBox) {
            if (this.SelectKnapsackPropBox?.getComponent(SJZGMMT_KnapsackPropBox)?.PropData?.Name) {
                SJZGMMT_PoolManager.Instance.Put(this.SelectKnapsackPropBox);
                SJZGMMT_GameData.Instance.SubKnapsackData(this.SelectKnapsackPropBox.getComponent(SJZGMMT_KnapsackPropBox).PropData.Name, 1);
                this.SelectKnapsackPropBox = null;
                this.ShowData();
            }
        } else {
            SJZGMMT_UIManager.Instance.ShowText("请选择要丢弃的道具！");
        }
    }
    //背包全丢弃
    public DropAllProp() {
        this.SelectKnapsackPropBox = null;
        this.KnapsackPropContent.removeAllChildren();
        this.KnapsackPropContent.getComponent(UITransform).height = 20
    }

    FaceCD: number = 0;//4秒最多展示一次
    //展示表情包
    ShowFace(FaceName: string) {
        if (this.FaceCD > 0) return;
        this.FaceCD = 4;
        this.node.getChildByPath("框/表情包/" + FaceName).active = true;
        this.scheduleOnce(() => {
            this.HideFace();
        }, 3)
        //播放音效
        SJZGMMT_AudioManager.globalAudioPlay(FaceName);
    }


    //隐藏表情包
    HideFace() {
        this.node.getChildByPath("框/表情包").children.forEach(element => {
            element.active = false;
        });
    }
}


