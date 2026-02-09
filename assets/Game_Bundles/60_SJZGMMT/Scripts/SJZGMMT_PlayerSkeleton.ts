import { _decorator, Component, director, instantiate, Node, Prefab, sp, Texture2D, v3 } from 'cc';
import { SJZGMMT_UIManager } from './SJZGMMT_UIManager';
import { SJZGMMT_EventManager } from './SJZGMMT_EventManager';
import { SJZGMMT_Incident } from './SJZGMMT_Incident';
import { SJZGMMT_GameData } from './SJZGMMT_GameData';
import { SJZGMMT_Constant } from './SJZGMMT_Constant';
const { ccclass, property } = _decorator;
export enum SJZGMMT_PlayerSkeletonName {
    待机 = "daiji",
    滑铲 = "huachan",
    开始游戏上楼梯 = "kaishimojin",
    跑 = "run",
    失败主页复活 = "shibai-fuhuo",
    失败主页复活2 = "shibai-fuhuo2",
    死亡 = "siwang",
    直升机出场 = "chuchang_zhishengji",
    游侠出场 = "chuchang1_youxia",
    巫医出场 = "chuchang3_wuyi",
    先锋出场 = "chuchang2_xianfeng",
    道士出场 = "chuchang4_daoshi",
    释放摸金罗盘 = "jineng_tansuo",
}

export enum SJZGMMT_PlayerSKinName {
    修勾 = "juese",
    游侠 = "juese1_youxia",
    先锋 = "juese2_xianfeng",
    巫医 = "juese3_wuyi",
    道士 = "juese4_daoshi",
}
@ccclass('SJZGMMT_PlayerSkeleton')
export class SJZGMMT_PlayerSkeleton extends Component {
    @property(sp.Skeleton)
    public PlayerSkeleton: sp.Skeleton = null;
    private State: string = "";
    start() {
        SJZGMMT_UIManager.Instance.SJZGMMT_On(SJZGMMT_EventManager.龙骨_主角刷新, this.show, this)
        this.show();
    }


    //=更换主角骨骼动画
    ChanggePlayerSkeleton(Name: SJZGMMT_PlayerSkeletonName, isloop: boolean = true, callBack?: Function) {
        this.State = Name;
        this.PlayerSkeleton.setAnimation(0, this.State, isloop);
        if (!isloop) {
            // 监听动画播放进度
            this.PlayerSkeleton.setCompleteListener((trackEntry) => {
                this.PlayerSkeleton.setCompleteListener((trackEntry) => { })
                callBack && callBack();
            })
        }
    }
    show() {
        if (SJZGMMT_GameData.Instance.GameData[3] == 0) {//显示皮肤
            this.PlayerSkeleton.setSkin(SJZGMMT_Constant.getSkinNameByName(SJZGMMT_GameData.Instance.Skin).SkeletonName);
            //隐藏插槽
            SJZGMMT_Incident.LoadTexture2D("Sprites/防具/无").then((Tx2d: Texture2D) => {
                this.PlayerSkeleton.setSlotTexture("toukui", Tx2d);
                this.PlayerSkeleton.setSlotTexture("fangdanyi", Tx2d);
            })
        } else {//显示装备
            this.PlayerSkeleton.setSkin("juese");
            SJZGMMT_Incident.LoadTexture2D("Sprites/防具/" + SJZGMMT_GameData.Instance.PlayerData[1]).then((Tx2d: Texture2D) => {
                this.PlayerSkeleton.setSlotTexture("toukui", Tx2d);
            })
            SJZGMMT_Incident.LoadTexture2D("Sprites/防具/" + SJZGMMT_GameData.Instance.PlayerData[2]).then((Tx2d: Texture2D) => {
                this.PlayerSkeleton.setSlotTexture("fangdanyi", Tx2d);
            })
        }
        if (SJZGMMT_GameData.Instance.PlayerData[0] != "无") {
            if (this.node.getChildByName("武器")) {//如果本节点下有武器节点(只有渲染角色才有，游戏内角色没有该节点)
                SJZGMMT_Incident.Loadprefab("Prefabs/武器/" + SJZGMMT_GameData.Instance.PlayerData[0]).then((prefab: Prefab) => {
                    this.node.getChildByName("武器").removeAllChildren();
                    let wp = instantiate(prefab);
                    wp.setParent(this.node.getChildByName("武器"));
                    wp.layer = wp.parent.layer;
                    wp.children.forEach((child) => {
                        child.layer = wp.parent.layer;
                    });
                });
            }
        } else {
            this.node.getChildByName("武器").removeAllChildren();
        }

    }
}


