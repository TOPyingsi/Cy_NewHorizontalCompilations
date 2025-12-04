import { _decorator, Button, Component, director, EventTouch, instantiate, Label, Node, Prefab, Size, Sprite, SpriteFrame, v3, Vec2, view, View } from 'cc';
import { accessoriesData, FishData, QSSZG_GameData } from '../QSSZG_GameData';
import { QSSZG_Incident } from '../QSSZG_Incident';
import { QSSZG_Constant } from '../Data/QSSZG_Constant';
import { QSSZG_Fish } from './QSSZG_Fish';
import { QSSZG_PoolManager } from '../Utils/QSSZG_PoolManager';
import { QSSZG_Food } from './QSSZG_Food';
import { QSSZG_DataPanel } from './QSSZG_DataPanel';
import { QSSZG_EventManager, QSSZG_MyEvent } from '../QSSZG_EventManager';
import { QSSZG_Tool } from '../Utils/QSSZG_Tool';
import { QSSZG_FishBag } from './QSSZG_FishBag';
import { QSSZG_accessories } from './QSSZG_accessories';
import { QSSZG_AudioManager } from '../QSSZG_AudioManager';
import { QSSZG_Panel, QSSZG_ShowPanel } from './QSSZG_ShowPanel';
import { GameManager } from '../../../../Scripts/GameManager';
import Banner from '../../../../Scripts/Banner';
import { ProjectEvent, ProjectEventManager } from '../../../../Scripts/Framework/Managers/ProjectEventManager';
import { Panel, UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('QSSZG_GameManager')
export class QSSZG_GameManager extends Component {
    private static _instance: QSSZG_GameManager = null;
    public static get Instance(): QSSZG_GameManager {
        if (!this._instance) {
            this._instance = new QSSZG_GameManager();
        }
        return this._instance;
    }
    public static ViewSize: Size = view.getVisibleSize();
    @property(Node)
    Canvas: Node = null;
    @property(Node)
    UI: Node = null;
    @property(Node)
    FoodPanel: Node = null;
    @property({ type: [Prefab] })
    public PreFabs: Prefab[] = [];//0鱼饵
    public ViewData: Size;
    public selectfish: FishData = null;//当前选中的鱼
    public selectfishNode: Node = null;//当前选中的鱼的Node
    public selectaccessories: accessoriesData = null;//当前选中的装饰
    public selectaccessoriesNode: Node = null;//当前选中的装饰的Node
    public earnings: number = 0;//秒收益
    private MoneyLabel: Label = null;
    public aquariumID: number = 0;//当前所在的鱼塘
    protected onLoad(): void {
        QSSZG_GameManager._instance = this;
        this.ViewData = View.instance.getVisibleSize();
        QSSZG_AudioManager.Init();
    }
    start() {
        ProjectEventManager.emit(ProjectEvent.游戏开始, "轻松水族馆");
        ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.UI.getChildByName("更多游戏"));
        this.MoneyLabel = this.UI.getChildByPath("钱/文本").getComponent(Label);
        this.loadData();
        this.schedule(() => {
            this.secondInclude();
            console.log("当前每秒收益:" + this.earnings);
        }, 1)
        this.Show_aquariumButton();
        this.Changgeaquarium(0);
        this.scheduleOnce(() => { QSSZG_AudioManager.playLoopAudio("背景音乐"); }, 0.5)
        QSSZG_ShowPanel.Instance.ShowPanel(QSSZG_Panel.教程界面);
    }

    private temporaryMoney: number = 0;
    protected update(dt: number): void {
        this.temporaryMoney += (QSSZG_GameData.Instance.Money - this.temporaryMoney) * 0.1;
        this.MoneyLabel.string = "$" + this.temporaryMoney.toFixed(2);//逐帧修改显示金钱
    }
    OnButtonClick(btn: EventTouch) {
        QSSZG_AudioManager.AudioPlay("点击", 0);
        let isNativ: boolean = false;
        switch (btn.target.name) {
            case "+1000000元":
                QSSZG_GameData.Instance.Money += 1000000;
                break;
            case "存档":
                QSSZG_GameData.DateSave();
                UIManager.ShowTip("存档成功！");
                break;
            case "鱼全满级":
                QSSZG_GameData.Instance.aquariumDate.forEach(cd => { cd.forEach(cd => { cd.Exp += 1000000; }) })
                break;
            case "商店":
                ProjectEventManager.emit(ProjectEvent.弹出窗口, "轻松水族馆");
                isNativ = true;
                QSSZG_ShowPanel.Instance.ShowPanel(QSSZG_Panel.商店界面);
                this.Off_SelectAccessories();
                this.Off_SelectFish();
                break;
            case "图鉴":
                ProjectEventManager.emit(ProjectEvent.弹出窗口, "轻松水族馆");
                isNativ = true;
                QSSZG_ShowPanel.Instance.ShowPanel(QSSZG_Panel.图鉴界面);
                this.Off_SelectAccessories();
                this.Off_SelectFish();
                break;
            case "统计":
                ProjectEventManager.emit(ProjectEvent.弹出窗口, "轻松水族馆");
                isNativ = true;
                QSSZG_ShowPanel.Instance.ShowPanel(QSSZG_Panel.统计界面);
                this.Off_SelectAccessories();
                this.Off_SelectFish();
                break;
            case "教程":
                ProjectEventManager.emit(ProjectEvent.弹出窗口, "轻松水族馆");
                isNativ = true;
                QSSZG_ShowPanel.Instance.ShowPanel(QSSZG_Panel.教程界面);
                this.Off_SelectAccessories();
                this.Off_SelectFish();
                break;
            case "淡水1":
                this.Changgeaquarium(0);
                break;
            case "淡水2":
                this.Changgeaquarium(1);
                break;
            case "淡水3":
                this.Changgeaquarium(2);
                break;
            case "咸水1":
                this.Changgeaquarium(3);
                break;
            case "咸水2":
                this.Changgeaquarium(4);
                break;
            case "咸水3":
                this.Changgeaquarium(5);
                break;
            case "pause":
                ProjectEventManager.emit(ProjectEvent.弹出窗口, "轻松水族馆");
                isNativ = true;
                this.UI.getChildByName("暂停界面").active = true;
                Banner.Instance.ShowCustomAd();
                break;
            case "继续游戏":
                this.UI.getChildByName("暂停界面").active = false;
                break;
            case "返回主页":
                QSSZG_AudioManager.AudioSource.stop();
                QSSZG_AudioManager.StopLoopAudio("背景音乐");
                ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
                    UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                        ProjectEventManager.emit(ProjectEvent.返回主页, "轻松水族馆");
                    });
                });
                break;
        }
        if (Banner.RegionMask && isNativ) {
            Banner.Instance.ShowCustomAd();
        }
    }

    //秒事件
    secondInclude() {
        QSSZG_GameData.Instance.Money += this.earnings;
        for (let i = 0; i < 6; i++) {
            if (i != this.aquariumID) {
                QSSZG_GameData.Instance.aquariumDate[i].forEach(cd => { cd.Exp += 1; })
            }
        }
    }
    //读取数据
    loadData() {
        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < QSSZG_GameData.Instance.aquariumDate[i].length; j++) {
                this.LoadFish(QSSZG_GameData.Instance.aquariumDate[i][j]);
            }
            for (let j = 0; j < QSSZG_GameData.Instance.accessoriesData[i].length; j++) {
                this.Loadaccessories(QSSZG_GameData.Instance.accessoriesData[i][j]);
            }
        }
    }
    //刷新容量文本
    Show_capacityText() {
        this.UI.getChildByName("容量显示").getComponent(Label).string = "鱼缸容量:" + QSSZG_GameData.Instance.aquariumDate[this.aquariumID].length
            + "/" + (QSSZG_GameData.Instance.aquariumLevel[this.aquariumID] * 5 + 20);
    }
    //刷新切换鱼缸按钮
    Show_aquariumButton() {
        QSSZG_GameData.Instance.aquariumLevel.forEach((num, index) => {
            if (num >= 0) {
                this.UI.getChildByName("鱼缸选择").children[index].active = true;
            }
        })

    }
    //生成鱼
    LoadFish(FishData: FishData) {
        QSSZG_Incident.Loadprefab(QSSZG_Constant.PrefabPath.Fish).then((prefab: Prefab) => {
            let pre = instantiate(prefab);
            pre.getComponent(QSSZG_Fish).Init(FishData);
            this.earnings += QSSZG_Constant.GetearningsFromData(FishData);
            this.Show_capacityText();
        })
    }
    //生成装饰
    Loadaccessories(accessoriesData: accessoriesData) {
        QSSZG_Incident.Loadprefab(QSSZG_Constant.PrefabPath.装饰).then((prefab: Prefab) => {
            let pre = instantiate(prefab);
            pre.getComponent(QSSZG_accessories).Init(accessoriesData);
        })
    }
    //生成鱼饵
    LoadFishing_Lure(pos: Vec2) {
        let pre = QSSZG_PoolManager.Instance.GetNode(this.PreFabs[0], this.FoodPanel);
        pre.getComponent(QSSZG_Food).Init(QSSZG_GameData.Instance.LevelData.鱼饵等级);
        pre.setWorldPosition(v3(pos.x, pos.y, 0));
        QSSZG_AudioManager.AudioPlay("放置鱼食", 0);
    }

    //选中鱼
    SelectFish(fishdata: FishData, fishnode: Node) {
        QSSZG_AudioManager.AudioPlay("点击", 0);
        this.Off_SelectFish();
        this.Off_SelectAccessories();
        this.selectfishNode = fishnode;
        this.selectfish = fishdata;
        this.UI.getChildByName("数据界面").active = true;
        this.UI.getChildByName("数据界面").getComponent(QSSZG_DataPanel).Init(this.selectfish);
        //高亮
        this.selectfishNode.getChildByName("Mask").active = true;
        this.selectfishNode.setParent(this.Canvas.getChildByName("TOP"));
    }
    //取消选中鱼
    Off_SelectFish() {
        if (this.selectfishNode) {
            //f
            this.selectfishNode.setParent(this.Canvas.getChildByPath("aquarium/aquarium" + this.aquariumID));
            this.selectfishNode.getChildByName("Mask").active = false;
        }
        if (this.selectfish) {
            this.selectfish = null;
            this.selectfishNode = null;
            this.UI.getChildByName("数据界面").active = false;
        }
    }
    //选中装饰
    SelectAccessories(accessoriesdata: accessoriesData, accessoriesNode: Node) {
        QSSZG_AudioManager.AudioPlay("点击", 0);
        this.Off_SelectFish();
        this.Off_SelectAccessories();
        this.selectaccessories = accessoriesdata;
        this.selectaccessoriesNode = accessoriesNode;
        //高亮
        this.selectaccessoriesNode.getChildByPath("sprite/Mask").active = true;
        //按钮区显示
        this.selectaccessoriesNode.getChildByName("按钮区").active = true;
        this.selectaccessoriesNode.setParent(this.Canvas.getChildByName("TOP"));
    }
    //取消选装饰
    Off_SelectAccessories() {
        if (this.selectaccessoriesNode) {
            //f
            this.selectaccessoriesNode.setParent(this.Canvas.getChildByPath("accessories/accessories" + this.aquariumID));
            this.selectaccessoriesNode.getChildByPath("sprite/Mask").active = false;
            this.selectaccessoriesNode.getChildByName("按钮区").active = false;
        }
        if (this.selectaccessories) {
            this.selectaccessories = null;
            this.selectaccessoriesNode = null;
        }
    }
    //重新计算当前所有鱼的秒收益(计算量大)
    Getearnings(): number {
        let num = 0;
        QSSZG_GameData.Instance.aquariumDate.forEach(data => {
            data.forEach((cd: FishData) => {
                num += QSSZG_Constant.GetearningsFromData(cd);
            })
        })
        return num;
    }

    //购买鱼包
    Buy_FishBag(Name: string) {
        let index = QSSZG_Constant.ShoppingName[0].indexOf(Name);
        let array: number[] = QSSZG_Tool.GetRandomNFromM(QSSZG_Constant.FishbagData[index].length - 1, 4);
        QSSZG_Incident.Loadprefab(QSSZG_Constant.PrefabPath.鱼包).then((data: Prefab) => {
            for (let i = 0; i < 4; i++) {
                let pre = instantiate(data);
                pre.setParent(this.UI.getChildByPath("鱼包界面/content"));
                pre.getComponent(QSSZG_FishBag).FishID = QSSZG_Constant.FishbagData[index][array[i]];
                pre.getComponent(QSSZG_FishBag).Init();
            }
            this.UI.getChildByPath("鱼包界面").active = true;
        });
    }

    //出售选中鱼
    sellFish() {
        QSSZG_GameData.Instance.Money += QSSZG_Constant.GetPriceFromData(this.selectfish);
        this.DeletFish();
    }

    //删除选中的鱼
    DeletFish() {
        QSSZG_EventManager.Scene.emit(QSSZG_MyEvent.DeleteFish, this.selectfish);
        this.earnings -= QSSZG_Constant.GetearningsFromData(this.selectfish);
        let idnex = QSSZG_GameData.Instance.aquariumDate[this.aquariumID].indexOf(this.selectfish);
        QSSZG_GameData.Instance.aquariumDate[this.aquariumID].splice(idnex, 1);
        this.selectfishNode.destroy();
        this.selectfish = null
        this.selectfishNode = null;
        this.Show_capacityText();
        this.UI.getChildByName("数据界面").active = false;
    }
    //删除选中的装饰
    Deletaccessories() {
        let idnex = QSSZG_GameData.Instance.accessoriesData[this.aquariumID].indexOf(this.selectaccessories);
        QSSZG_GameData.Instance.accessoriesData[this.aquariumID].splice(idnex, 1);
        this.selectaccessoriesNode.destroy();
        this.selectaccessories = null
        this.selectaccessoriesNode = null;
        this.UI.getChildByName("数据界面").active = false;
    }
    //切换鱼塘
    Changgeaquarium(index: number) {
        this.Off_SelectFish();
        this.Off_SelectAccessories();
        this.Canvas.getChildByName("aquarium").children.forEach(cd => {
            cd.active = false;
        })
        this.Canvas.getChildByName("aquarium").getChildByName("aquarium" + index).active = true;
        this.Canvas.getChildByName("accessories").children.forEach(cd => {
            cd.active = false;
        })
        this.Canvas.getChildByName("accessories").getChildByName("accessories" + index).active = true;
        this.UI.getChildByName("数据界面").active = false;
        this.aquariumID = index;
        this.Remove_Food();
        this.ChanggeBackGround(QSSZG_GameData.Instance.BgData[this.aquariumID]);
        this.Show_capacityText();
        this.UI.getChildByName("鱼缸选择").children.forEach((cd, id) => {
            if (id == index) {
                cd.getComponent(Sprite).grayscale = false;
                cd.getComponent(Button).enabled = false;
            } else {
                cd.getComponent(Sprite).grayscale = true;
                cd.getComponent(Button).enabled = true;
            }
        })
    }

    //切换鱼塘背景
    ChanggeBackGround(id: number) {
        QSSZG_GameData.Instance.BgData[this.aquariumID] = id;
        QSSZG_Incident.LoadSprite("Sprite/Back_Dowm/" + QSSZG_Constant.ShoppingName[1][id]).then((sp: SpriteFrame) => {
            this.Canvas.getChildByName("BG").getComponent(Sprite).spriteFrame = sp;
        })
    }
    //销毁所有鱼食
    Remove_Food() {
        let pre = this.Canvas.getChildByName("Food");
        for (let i = 0; pre.children.length > 0; i++) {
            pre.children[0].getComponent(QSSZG_Food).Des();
        }
    }
    //根据fishdata获得对应的Node（当前场景）
    GetFishNodeForFishData(fishdata: FishData): Node {
        let pre = this.Canvas.getChildByName("aquarium").getChildByName("aquarium" + this.aquariumID);
        for (let i = 0; i < pre.children.length; i++) {
            if (pre.children[i].getComponent(QSSZG_Fish).FishData == fishdata) {
                return pre.children[i];
            }
        }
        return null;
    }
    //转移鱼苗
    OnChanggeaquariumClick() {
        let selectdata: number[] = [];
        if (this.selectfish.aquariumID < 3) {
            selectdata = [0, 1, 2];
        } else {
            selectdata = [3, 4, 5];
        }
        QSSZG_ShowPanel.Instance.ShowPanel(QSSZG_Panel.切换鱼缸选择界面, [selectdata, "鱼"]);
    }
}


