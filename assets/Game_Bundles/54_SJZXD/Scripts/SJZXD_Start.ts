import { _decorator, Component, director, EventTouch, Node, sp } from 'cc';
import { SJZXD_UIManager } from './SJZXD_UIManager';
import { SJZXD_Constant } from './SJZXD_Constant';
import { Panel, UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import { SJZXD_AudioManager } from './SJZXD_AudioManager';
import { SJZXD_PoolManager } from './SJZXD_PoolManager';
import { SJZXD_GameData } from './SJZXD_GameData';
import { SJZXD_PlayerSkeleton, SJZXD_PlayerSkeletonName } from './SJZXD_PlayerSkeleton';
import { SJZXD_EventManager } from './SJZXD_EventManager';
import { ProjectEvent, ProjectEventManager } from '../../../Scripts/Framework/Managers/ProjectEventManager';
import { GameManager } from '../../../Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_Start')
export class SJZXD_Start extends Component {
    @property(Node)
    StartPlayer: Node = null;//主场景龙骨玩家
    @property(Node)
    CanvaseNode: Node = null;//主相机
    start() {
        ProjectEventManager.emit(ProjectEvent.游戏开始, "三角洲行动");
        director.getScene().on("退出游戏", () => {
            SJZXD_UIManager.Instance.node.destroy();//退出游戏的时候销毁常驻节点
            SJZXD_AudioManager.Instance.node.destroy();//退出游戏的时候销毁常驻节点
            SJZXD_PoolManager.Instance.node.destroy();//退出游戏的时候销毁常驻节点
        })
        this.Startincident();
    }

    OnBuuttonClick(event: EventTouch) {
        SJZXD_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "开始游戏":
                SJZXD_GameData.Instance.KnapsackData = [];//清空背包数据
                this.StartPlayer.getChildByName("武器").active = false;
                SJZXD_UIManager.Instance.SJZXD_Emit(SJZXD_EventManager.主页点击开始游戏);
                this.StartPlayer.getComponent(SJZXD_PlayerSkeleton).ChanggePlayerSkeleton(SJZXD_PlayerSkeletonName.开始游戏上楼梯, false, () => {
                    SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.LoadingPanel, ["SJZXD_Game"]);
                });
                break;
            case "仓库":
                SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.WarehousePanel);
                break;
            case "市场":
                SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.BazaarPanel);
                break;
            case "干员":
                SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.RolePanel);
                break;
            case "皮肤":
                SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.SkinPanel);
                break;
            case "研究所":
                SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.GraduateSchoolPanel);
                break;
            // case "返回主页":
            //     UIManager.ShowPanel(Panel.ReturnPanel);
            //     break;
            case "收藏室":
                SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.LoadingPanel, ["SJZXD_Boxroom"]);
                break;
            case "增强针":
                SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.EnhancePanel);
                break;
            case "返回主页":
                ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
                    UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                        ProjectEventManager.emit(ProjectEvent.返回主页, "三角洲行动");
                    });
                });
                break;
            case "游戏公告":
                SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.UpdatePanel);
                break;
        }
    }




    //初始事件
    Startincident() {
        if (SJZXD_GameData.Instance.GameData[0] == 1 && SJZXD_GameData.Instance.GameData[1] == 0) {//玩家上局失败撤离且未结算
            this.StartPlayer.getChildByName("武器").active = false;
            this.StartPlayer.getComponent(SJZXD_PlayerSkeleton).ChanggePlayerSkeleton(SJZXD_PlayerSkeletonName.失败主页复活, false, () => {
                this.StartPlayer.getComponent(SJZXD_PlayerSkeleton).ChanggePlayerSkeleton(SJZXD_PlayerSkeletonName.失败主页复活2, false, () => {
                    this.StartPlayer.getComponent(SJZXD_PlayerSkeleton).ChanggePlayerSkeleton(SJZXD_PlayerSkeletonName.待机);
                    this.StartPlayer.getChildByName("武器").active = true;
                    this.StartPlayer.getComponent(SJZXD_PlayerSkeleton).show();
                });
            });
        }
        //结算
        if (SJZXD_GameData.Instance.GameData[1] == 0) {
            SJZXD_GameData.Instance.GameData[1] = 1;
            SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.SettleAccountsPanel);
        }
        if (SJZXD_GameData.Instance.GameData[4] == 0) {//第一次进入游戏
            this.CanvaseNode.getChildByName("LoadingPanel").active = true;
            SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.LoadingPanel, ["SJZXD_Game"]);
        }
    }



}


