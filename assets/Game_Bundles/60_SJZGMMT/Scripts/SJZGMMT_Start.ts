import { _decorator, Component, director, EventTouch, Node, sp } from 'cc';
import { SJZGMMT_UIManager } from './SJZGMMT_UIManager';
import { SJZGMMT_Constant } from './SJZGMMT_Constant';
import { Panel, UIManager } from '../../../Scripts/Framework/Managers/UIManager';
import { SJZGMMT_AudioManager } from './SJZGMMT_AudioManager';
import { SJZGMMT_PoolManager } from './SJZGMMT_PoolManager';
import { SJZGMMT_GameData } from './SJZGMMT_GameData';
import { SJZGMMT_PlayerSkeleton, SJZGMMT_PlayerSkeletonName } from './SJZGMMT_PlayerSkeleton';
import { SJZGMMT_EventManager } from './SJZGMMT_EventManager';
import { ProjectEvent, ProjectEventManager } from '../../../Scripts/Framework/Managers/ProjectEventManager';
import { GameManager } from '../../../Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_Start')
export class SJZGMMT_Start extends Component {


    @property(Node)
    StartPlayer: Node = null;//主场景龙骨玩家
    @property(Node)
    CanvaseNode: Node = null;//主相机
    start() {
        ProjectEventManager.emit(ProjectEvent.游戏开始, "三角洲古墓迷途");
        director.getScene().on("退出游戏", () => {
            SJZGMMT_UIManager.Instance.node.destroy();//退出游戏的时候销毁常驻节点
            SJZGMMT_AudioManager.Instance.node.destroy();//退出游戏的时候销毁常驻节点
            SJZGMMT_PoolManager.Instance.node.destroy();//退出游戏的时候销毁常驻节点
        })
        this.Startincident();


    }

    OnBuuttonClick(event: EventTouch) {
        SJZGMMT_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "开始游戏":
                SJZGMMT_GameData.Instance.KnapsackData = [];//清空背包数据
                this.StartPlayer.getChildByName("武器").active = false;
                SJZGMMT_UIManager.Instance.SJZGMMT_Emit(SJZGMMT_EventManager.主页点击开始游戏);
                // this.StartPlayer.getComponent(SJZGMMT_PlayerSkeleton).ChanggePlayerSkeleton(SJZGMMT_PlayerSkeletonName.开始游戏上楼梯, false, () => {

                // });
                SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.LoadingPanel, ["SJZGMMT_Game"]);
                break;
            case "仓库":
                SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.WarehousePanel);
                break;
            case "市场":
                SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.BazaarPanel);
                break;
            case "干员":
                SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.RolePanel);
                break;
            case "皮肤":
                SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.SkinPanel);
                break;
            case "研究所":
                SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.GraduateSchoolPanel);
                break;
            case "收藏室":
                SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.LoadingPanel, ["SJZGMMT_Boxroom"]);
                break;
            case "增强针":
                SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.EnhancePanel);
                break;
            case "返回主页":
                ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
                    UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                        ProjectEventManager.emit(ProjectEvent.返回主页, "三角洲古墓迷途");
                    });
                });
                break;
            case "游戏公告":
                SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.UpdatePanel);
                break;
        }
    }




    //初始事件
    Startincident() {
        // if (SJZGMMT_GameData.Instance.GameData[0] == 1 && SJZGMMT_GameData.Instance.GameData[1] == 0) {//玩家上局失败撤离且未结算
        //     this.StartPlayer.getChildByName("武器").active = false;
        //     this.StartPlayer.getComponent(SJZGMMT_PlayerSkeleton).ChanggePlayerSkeleton(SJZGMMT_PlayerSkeletonName.失败主页复活, false, () => {
        //         this.StartPlayer.getComponent(SJZGMMT_PlayerSkeleton).ChanggePlayerSkeleton(SJZGMMT_PlayerSkeletonName.失败主页复活2, false, () => {
        //             this.StartPlayer.getComponent(SJZGMMT_PlayerSkeleton).ChanggePlayerSkeleton(SJZGMMT_PlayerSkeletonName.待机);
        //             this.StartPlayer.getChildByName("武器").active = true;
        //             this.StartPlayer.getComponent(SJZGMMT_PlayerSkeleton).show();
        //         });
        //     });
        // }
        //结算
        if (SJZGMMT_GameData.Instance.GameData[1] == 0) {
            SJZGMMT_GameData.Instance.GameData[1] = 1;
            SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.SettleAccountsPanel);
        }
        if (SJZGMMT_GameData.Instance.GameData[4] == 0) {//第一次进入游戏
            this.CanvaseNode.getChildByName("LoadingPanel").active = true;
            SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.LoadingPanel, ["SJZGMMT_Game"]);
        }
    }



}


