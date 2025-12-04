import { _decorator, Animation, AudioSource, Component, director, EventTouch, instantiate, Node, Prefab, size, Sprite, SpriteFrame, tween, UITransform, v3 } from 'cc';
import { JJHZ_GameManager } from '../Game/JJHZ_GameManager';
import { JJHZ_Incident } from '../JJHZ_Incident';
import { JJHZ_SceneButtom } from './JJHZ_SceneButtom';
import { JJHZ_GameData } from '../JJHZ_GameData';
import Banner from '../../../../Scripts/Banner';
import { Panel, UIManager } from '../../../../Scripts/Framework/Managers/UIManager';
import { GameManager } from '../../../../Scripts/GameManager';
import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
const { ccclass, property } = _decorator;

@ccclass('JJHZ_MoreGame')
export class JJHZ_MoreGame extends Component {
    @property(Node)
    BG: Node = null;
    @property(Node)
    Content: Node = null;
    public index: number = 0;//当前选中



    //本地
    public ThisLocality: string[] = [
        "节奏盒子暗夜模式2版",
        "节奏盒子deadinside版",
        "节奏盒子腐化版",
        "节奏盒子寄生虫版",
    ];

    start() {
        JJHZ_GameData.ReadDate();
        if (!Banner.IsShowServerBundle) {
            this.InitButtom([3, 4, 10]);
        } else {
            this.InitButtom([3, 11, 14, 17, 4, 12, 15, 18, 13, 16, 1, 10]);
        }
        this.index = 3;
    }

    //生成按钮（参数为生成列表）
    InitButtom(LoadList: number[]) {
        JJHZ_Incident.Loadprefab("Res/选关按钮").then((prefab: Prefab) => {
            LoadList.forEach((cd, index) => {
                let nd = instantiate(prefab);
                nd.getComponent(JJHZ_SceneButtom).Scene = cd;
                nd.setParent(this.Content);
                nd.getComponent(JJHZ_SceneButtom).Init();
            })
        })
        this.Content.getComponent(UITransform).contentSize = size(497, LoadList.length * 247 + 30);
    }

    OnGoGame() {

        JJHZ_GameManager.GameScene = this.index;

        if (!Banner.IsShowServerBundle) {
            UIManager.ShowPanel(Panel.LoadingPanel, ["JJHZ_Game"]);
        } else {
            BundleManager.LoadBundles(["4_JJHZ_Bundle2"], () => {
                UIManager.ShowPanel(Panel.LoadingPanel, ["JJHZ_Game"]);
            }, () => {
                UIManager.ShowTip("网络异常，请稍后重试");
                UIManager.HidePanel(Panel.LoadingPanel);
            });

        }


    }
}


// case "小鱼人战争": director.loadScene("XYRZZ_Start"); break;
// case "猫猫突围": director.loadScene("Start"); break;
// case "沙威玛传奇": director.loadScene("SWM_Scene"); break;
// case "马桶人杀戮": director.loadScene("Start_Mtr"); break;
// case "轻松水族馆": director.loadScene("QSSZG_Start"); break;
