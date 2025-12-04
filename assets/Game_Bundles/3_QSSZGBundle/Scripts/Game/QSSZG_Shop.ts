import { _decorator, Button, Component, EventTouch, Label, Node, Sprite, SpriteFrame, tween, v3 } from 'cc';
import { QSSZG_Constant } from '../Data/QSSZG_Constant';
import { accessoriesData, QSSZG_GameData } from '../QSSZG_GameData';
import { QSSZG_GameManager } from './QSSZG_GameManager';
import { QSSZG_Incident } from '../QSSZG_Incident';
import { QSSZG_AudioManager } from '../QSSZG_AudioManager';
import { QSSZG_Panel, QSSZG_ShowPanel } from './QSSZG_ShowPanel';
import { UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
const { ccclass, property } = _decorator;

@ccclass('QSSZG_Shop')
export class QSSZG_Shop extends Component {
    @property({ type: [SpriteFrame] })
    public sprits: SpriteFrame[] = [];//0暗色按钮1亮色按钮
    public Index: number = 0;
    Show() {
        this.Windows_InorOut(true);
        //初始化界面
        this.Init(this.Index);
    }

    update(deltaTime: number) {

    }
    OnButtonClick(btn: EventTouch) {
        QSSZG_AudioManager.AudioPlay("点击", 0);
        switch (btn.target.name) {
            case "关闭":
                this.Windows_InorOut(false);
                break;
            case "鱼苗包":
                this.Select(0);
                break;
            case "鹅卵石":
                this.Select(1);
                break;
            case "升级":
                this.Select(2);
                break;
            case "装饰品":
                this.Select(3);
                break;
            case "淡水小可爱":
            case "河塘鱼鱼":
            case "珊瑚伙伴":
            case "深海住民":
            case "巨型憨憨":
                this.Buy_Fish(btn.target.name);
                break;
            case "淡水鱼缸1": this.Buy_aquarium(0); break;
            case "淡水鱼缸2": this.Buy_aquarium(1); break;
            case "淡水鱼缸3": this.Buy_aquarium(2); break;
            case "深水鱼缸1": this.Buy_aquarium(3); break;
            case "深水鱼缸2": this.Buy_aquarium(4); break;
            case "深水鱼缸3": this.Buy_aquarium(5); break;
            case "鱼粮": this.Buy_Food(); break;
            case "海底":
            case "冬季":
            case "薰衣草":
            case "苔藓牧场":
            case "草莓田":
            case "海水泡沫":
            case "冰淇淋圣代":
            case "闹鬼墓地":
            case "核辐射":
            case "岩浆":
            case "黄金":
            case "彩虹":
                this.Buy_BackGround(QSSZG_Constant.ShoppingName[1].indexOf(btn.target.name));
                break;
            case "绿藻球":
            case "迷你舰艇":
            case "盆栽艺术":
            case "金字塔":
            case "城堡":
            case "火山":
            case "神龛":
            case "宝藏箱":
                this.Buy_accessories(QSSZG_Constant.ShoppingName[2].indexOf(btn.target.name));
                break;

        }
    }
    //选中
    Select(index: number) {
        this.node.getChildByPath("Node/顶部选择栏").children.forEach((cd) => {
            cd.getComponent(Sprite).spriteFrame = this.sprits[1];
        })
        this.node.getChildByPath("Node/顶部选择栏").children[index].getComponent(Sprite).spriteFrame = this.sprits[0];
        this.node.getChildByPath("Node/下栏").children.forEach((cd) => {
            cd.active = false;
        })
        this.node.getChildByPath("Node/下栏").children[index].active = true;
        this.Index = index;
        this.Init(this.Index)
    }

    //初始化
    Init(index: number) {
        if (index == 0) {
            this.node.getChildByPath("Node/下栏/鱼苗包").children.forEach((cd, index) => {
                cd.getChildByName("Price").getComponent(Label).string = "$ " + QSSZG_Constant.ShoppingPrice[0][index];
            })
        }
        if (index == 1) {
            this.node.getChildByPath("Node/下栏/鹅卵石").children.forEach((cd, index) => {
                if (QSSZG_GameData.Instance.ShopData[index] == 0) {
                    cd.getChildByName("Price").getComponent(Label).string = "$ " + QSSZG_Constant.ShoppingPrice[1][index];
                    cd.children[3].children[0].getComponent(Label).string = "购买";
                } else {
                    cd.getChildByName("Price").getComponent(Label).string = "已拥有";
                    cd.children[3].children[0].getComponent(Label).string = "装备";
                }
            })
        }
        if (index == 2) {
            this.node.getChildByPath("Node/下栏/升级/ScrollView/view/content/鱼缸升级").children.forEach((cd, index) => {
                let Level = QSSZG_GameData.Instance.aquariumLevel[index];
                let price = QSSZG_Constant.ShoppingPrice[3][index] * QSSZG_Constant.Shoppingpricescale[Level < 0 ? 0 : Level];
                cd.getChildByName("Price").getComponent(Label).string = "$ " + price;
                cd.getChildByName("Name").getComponent(Label).string = cd.name + "\n容量：" + (20 + ((Level < 0 ? 0 : Level) * 5));
                if (Level < 0) {
                    cd.children[3].children[0].getComponent(Label).string = "购买";
                }
                if (Level >= 0 && Level < 4) {
                    cd.children[3].children[0].getComponent(Label).string = "升级";
                }
                if (Level == 4) {
                    cd.children[3].children[0].getComponent(Label).string = "已满级";
                    cd.children[3].getComponent(Button).enabled = false;
                    cd.children[3].getComponent(Sprite).grayscale = true;
                }
            })
            let pre = this.node.getChildByPath("Node/下栏/升级/ScrollView/view/content/鱼粮升级/鱼粮");
            pre.getChildByName("Price").getComponent(Label).string = "$ " + QSSZG_Constant.ShoppingPrice[2][QSSZG_GameData.Instance.LevelData.鱼饵等级];
            if (QSSZG_GameData.Instance.LevelData.鱼饵等级 >= 5) {
                pre.getChildByName("Price").getComponent(Label).string = "已满级";
                pre.children[3].getComponent(Button).enabled = false;
                pre.children[3].getComponent(Sprite).grayscale = true;
            }
            let Level = QSSZG_GameData.Instance.LevelData.鱼饵等级;
            QSSZG_Incident.LoadSprite("Sprite/Shop/Food_Can" + ((Level + 1) > 5 ? 5 : (Level + 1)))
                .then((sp: SpriteFrame) => {
                    pre.getChildByName("sprite").getComponent(Sprite).spriteFrame = sp;
                })
        }
        if (index == 3) {
            //装饰品
            this.node.getChildByPath("Node/下栏/装饰品/ScrollView/view/content").children.forEach((cd, index) => {
                cd.getChildByName("Price").getComponent(Label).string = "$ " + QSSZG_Constant.ShoppingPrice[4][index];
            })
        }
    }

    //窗口滑出
    Windows_InorOut(isIn: boolean) {
        if (isIn) {
            this.node.setPosition(0, -1200, 0);
            tween(this.node)
                .to(0.4, { position: v3(0, 0, 0) }, { easing: "backOut" })
                .start();
        } else {
            tween(this.node)
                .to(0.4, { position: v3(0, -1200, 0) }, { easing: "backIn" })
                .call(() => {
                    QSSZG_ShowPanel.Instance.HidePanel(QSSZG_Panel.商店界面);
                })
                .start();
        }
    }
    //购买鱼苗
    Buy_Fish(Name: string) {
        if ((Name == "淡水小可爱" || Name == "河塘鱼鱼") && (QSSZG_GameManager.Instance.aquariumID == 3 || QSSZG_GameManager.Instance.aquariumID == 4
            || QSSZG_GameManager.Instance.aquariumID == 5)) {
            UIManager.ShowTip("该鱼塘不可养殖淡水鱼！");
            return;
        }
        if ((Name == "珊瑚伙伴" || Name == "深海住民" || Name == "巨型憨憨") && (QSSZG_GameManager.Instance.aquariumID == 0 || QSSZG_GameManager.Instance.aquariumID == 1
            || QSSZG_GameManager.Instance.aquariumID == 2)) {
            UIManager.ShowTip("该鱼塘不可养殖咸水鱼！");
            return;
        }
        if (QSSZG_GameData.Instance.aquariumDate[QSSZG_GameManager.Instance.aquariumID].length + 4 > (QSSZG_GameData.Instance.aquariumLevel[QSSZG_GameManager.Instance.aquariumID] * 5 + 20)) {
            UIManager.ShowTip("该鱼塘养不下这么多鱼了！");
            return;
        }
        let price = QSSZG_Constant.NameToPrice(Name);
        if (QSSZG_GameData.Instance.Money >= price) {
            QSSZG_GameData.Instance.Money -= price;
            QSSZG_GameManager.Instance.Buy_FishBag(Name);
            this.Windows_InorOut(false);
        } else {
            QSSZG_ShowPanel.Instance.ShowPanel(QSSZG_Panel.广告界面);
        }
    }
    //购买鱼缸
    Buy_aquarium(index: number) {
        let Level = QSSZG_GameData.Instance.aquariumLevel[index];
        let price = QSSZG_Constant.ShoppingPrice[3][index] * QSSZG_Constant.Shoppingpricescale[Level < 0 ? 0 : Level];
        if (QSSZG_GameData.Instance.Money >= price) {
            QSSZG_GameData.Instance.aquariumLevel[index]++;
            QSSZG_GameData.Instance.Money -= price;
            this.Init(this.Index);
            QSSZG_GameManager.Instance.Show_capacityText();
            QSSZG_GameManager.Instance.Show_aquariumButton();
            QSSZG_AudioManager.AudioPlay("升级音效", 0);
        } else {
            QSSZG_ShowPanel.Instance.ShowPanel(QSSZG_Panel.广告界面);
        }
    }
    //升级鱼粮
    Buy_Food() {
        let Level = QSSZG_GameData.Instance.LevelData.鱼饵等级;
        let price = QSSZG_Constant.ShoppingPrice[2][Level];
        if (QSSZG_GameData.Instance.Money >= price) {
            QSSZG_GameData.Instance.Money -= price;
            QSSZG_GameData.Instance.LevelData.鱼饵等级 += 1;
            QSSZG_AudioManager.AudioPlay("升级音效", 0);
            this.Init(this.Index);
        } else {
            QSSZG_ShowPanel.Instance.ShowPanel(QSSZG_Panel.广告界面);
        }
    }
    //购买背景
    Buy_BackGround(id: number) {
        if (QSSZG_GameData.Instance.ShopData[id] == 1) {
            QSSZG_GameManager.Instance.ChanggeBackGround(id);
        } else {
            if (QSSZG_GameData.Instance.Money >= QSSZG_Constant.ShoppingPrice[1][id]) {
                QSSZG_GameData.Instance.Money -= QSSZG_Constant.ShoppingPrice[1][id];
                QSSZG_GameData.Instance.ShopData[id] = 1;
                this.Init(this.Index);
                QSSZG_AudioManager.AudioPlay("升级音效", 0);
            } else {
                QSSZG_ShowPanel.Instance.ShowPanel(QSSZG_Panel.广告界面);
            }
        }
    }
    //购买装饰品
    Buy_accessories(id: number) {
        if (QSSZG_GameData.Instance.Money >= QSSZG_Constant.ShoppingPrice[4][id]) {
            QSSZG_GameData.Instance.Money -= QSSZG_Constant.ShoppingPrice[4][id];
            UIManager.ShowTip("购买成功！");
            QSSZG_GameManager.Instance.Loadaccessories(new accessoriesData(id, QSSZG_GameManager.Instance.aquariumID, true,
                QSSZG_GameManager.ViewSize.width / 2, 150
            ));
            QSSZG_AudioManager.AudioPlay("升级音效", 0);
            this.Windows_InorOut(false);
        } else {
            QSSZG_ShowPanel.Instance.ShowPanel(QSSZG_Panel.广告界面);
        }
    }
}


