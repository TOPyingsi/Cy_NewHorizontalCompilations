import { _decorator, Component, director, instantiate, Node, Prefab, sp, Texture2D, v3 } from 'cc';
import { SJZXD_UIManager } from './SJZXD_UIManager';
import { SJZXD_EventManager } from './SJZXD_EventManager';
import { SJZXD_Incident } from './SJZXD_Incident';
import { SJZXD_GameData } from './SJZXD_GameData';
import { SJZXD_Constant } from './SJZXD_Constant';
const { ccclass, property } = _decorator;
export enum SJZXD_PlayerSkeletonName {
    待机 = "daiji",
    滑铲 = "huachan",
    开始游戏上楼梯 = "kaishimojin",
    跑 = "run",
    失败主页复活 = "shibai-fuhuo",
    失败主页复活2 = "shibai-fuhuo2",
    死亡 = "siwang",
    直升机出场 = "chuchang_zhishengji",
    杰峰出场 = "chuchang1_jiefeng",
    炼狱犬出场 = "chuchang2_lianyu",
    贤勾出场 = "chuchang3_xianzhe",
    不死勾出场 = "chuchang4-huonan",
}

export enum SJZXD_PlayerSKinName {
    修勾 = "juese",
    杰峰 = "juese1_jiefeng",
    贤勾 = "juese1_lianyu",
    炼狱犬 = "juese1_lianyu",
    不死勾 = "juese1_lianyu",
}
@ccclass('SJZXD_PlayerSkeleton')
export class SJZXD_PlayerSkeleton extends Component {
    @property(sp.Skeleton)
    public PlayerSkeleton: sp.Skeleton = null;
    private State: string = "";
    start() {
        SJZXD_UIManager.Instance.SJZXD_On(SJZXD_EventManager.龙骨_主角刷新, this.show, this)
        this.show();
    }


    //=更换主角骨骼动画
    ChanggePlayerSkeleton(Name: SJZXD_PlayerSkeletonName, isloop: boolean = true, callBack?: Function) {
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
        if (SJZXD_GameData.Instance.GameData[3] == 0) {//显示皮肤
            this.PlayerSkeleton.setSkin(SJZXD_Constant.getSkinNameByName(SJZXD_GameData.Instance.Skin).SkeletonName);
            //隐藏插槽
            this.PlayerSkeleton.setSlotTexture("toukui", new Texture2D());
            this.PlayerSkeleton.setSlotTexture("fangdanyi", new Texture2D());
        } else {//显示装备
            this.PlayerSkeleton.setSkin("juese");
            SJZXD_Incident.LoadTexture2D("Sprites/防具/" + SJZXD_GameData.Instance.PlayerData[1]).then((Tx2d: Texture2D) => {
                this.PlayerSkeleton.setSlotTexture("toukui", Tx2d);
            })
            SJZXD_Incident.LoadTexture2D("Sprites/防具/" + SJZXD_GameData.Instance.PlayerData[2]).then((Tx2d: Texture2D) => {
                this.PlayerSkeleton.setSlotTexture("fangdanyi", Tx2d);
            })
        }
        if (SJZXD_GameData.Instance.PlayerData[0] != "无") {
            if (this.node.getChildByName("武器")) {//如果本节点下有武器节点(只有渲染角色才有，游戏内角色没有该节点)
                this.node.getChildByName("武器").removeAllChildren();
                SJZXD_Incident.Loadprefab("Prefabs/武器/" + SJZXD_GameData.Instance.PlayerData[0]).then((prefab: Prefab) => {
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


