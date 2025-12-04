import { _decorator, find, Node, tween, Tween, UIOpacity, v2, v3, view } from 'cc';
import { XGTW_Constant } from '../Const/XGTW_Constant';
import PrefsManager from '../../../../../Scripts/Framework/Managers/PrefsManager';
import { EasingType } from '../../../../../Scripts/Framework/Utils/TweenUtil';
import { PoolManager } from 'db://assets/Scripts/Framework/Managers/PoolManager';
import { XGTW_DataManager } from './XGTW_DataManager';
import XGTW_AchievementItem from '../../UI/XGTW_AchievementItem';
import { GameManager } from 'db://assets/Scripts/GameManager';
export enum XGTW_AchievementType {
    Common,//普通
    Rare,//稀有
    Epic,//史诗
    Legendary,//传说
    Ancient,//远古
    Mythic,//神话
}
export enum XGTW_EAchievement {
    小试牛刀 = "小试牛刀",
    菜就多练 = "菜就多练",
    不讲武德 = "不讲武德",
    这里不是披萨塔 = "这里不是披萨塔",
    根本死不掉 = "根本死不掉",
    这才值钱 = "这才值钱",
    根本花不完 = "根本花不完",
    RPK专家 = "RPK专家",
    AX50专家 = "AX50专家",
}

export class XGTW_AchievementManager {
    static AchievementMap: Map<string, XGTW_AchievementData> = new Map();
    static CheckAchievement(Name: string) {
        return;
        if (this.AchievementMap.has(Name) && this.AchievementMap.get(Name).Done) return;
        switch (Name) {
            case "小试牛刀":
                if (this.AchievementMap.has(Name) && XGTW_DataManager.Money >= 300000) {
                    //解锁
                    this.AchievementMap.get(Name).Done = true;
                    this.ShowAchievementTip(Name);
                }
                break;
            case "菜就多练":
                this.GetAchievementTimes(XGTW_EAchievement.菜就多练);
                if (this.AchievementMap.has(Name) && this.GetAchievementTimes(XGTW_EAchievement.菜就多练) >= 10) {
                    //解锁
                    this.AchievementMap.get(Name).Done = true;
                    this.ShowAchievementTip(Name);
                }
                break;
            case "不讲武德":
                if (this.AchievementMap.has(Name) && this.GetAchievementTimes(XGTW_EAchievement.不讲武德) >= 1) {
                    //解锁
                    this.AchievementMap.get(Name).Done = true;
                    this.ShowAchievementTip(Name);
                }
                break;
            case "这里不是披萨塔":
                if (this.AchievementMap.has(Name) && this.GetAchievementTimes(XGTW_EAchievement.这里不是披萨塔) >= 50) {
                    //解锁
                    this.AchievementMap.get(Name).Done = true;
                    this.ShowAchievementTip(Name);
                }
                break;
            case "根本死不掉":
                if (this.AchievementMap.has(Name) && this.GetAchievementTimes(XGTW_EAchievement.根本死不掉) >= 20) {
                    //解锁
                    this.AchievementMap.get(Name).Done = true;
                    this.ShowAchievementTip(Name);
                }
                break;
            case "这才值钱":
                if (this.AchievementMap.has(Name) && this.GetAchievementTimes(XGTW_EAchievement.这才值钱) >= 50) {
                    //解锁
                    this.AchievementMap.get(Name).Done = true;
                    this.ShowAchievementTip(Name);
                }
                break;
            case "根本花不完":
                if (this.AchievementMap.has(Name) && XGTW_DataManager.Money >= 10000000) {
                    //解锁
                    this.AchievementMap.get(Name).Done = true;
                    this.ShowAchievementTip(Name);
                }
                break;
            case "RPK专家":
                if (this.AchievementMap.has(Name) && this.GetAchievementTimes(XGTW_EAchievement.RPK专家) >= 50) {
                    //解锁
                    this.AchievementMap.get(Name).Done = true;
                    this.ShowAchievementTip(Name);
                }
                break;
            case "AX50专家":
                if (this.AchievementMap.has(Name) && this.GetAchievementTimes(XGTW_EAchievement.AX50专家) >= 50) {
                    //解锁
                    this.AchievementMap.get(Name).Done = true;
                    this.ShowAchievementTip(Name);
                }
                break;
        }

    }
    static AddAchievementTimes(name: XGTW_EAchievement) {
        PrefsManager.SetNumber(`${XGTW_Constant.Key.AchievementTimes}_${name}`, this.GetAchievementTimes(name) + 1);
        this.CheckAchievement(name);
    }
    static GetAchievementTimes(name: XGTW_EAchievement) {
        return PrefsManager.GetNumber(`${XGTW_Constant.Key.AchievementTimes}_${name}`, 0);
    }
    static ShowAchievementTip(name: string) {
        if (!this.AchievementMap.has(name)) return;
        console.log(`解锁成就：${name}`);
        let data = this.AchievementMap.get(name);
        let position = v3(view.getVisibleSize().width / 2 - 150, view.getVisibleSize().height / 2 + 256);
        PoolManager.GetNodeByBundle(GameManager.GameData.DefaultBundle, "Prefabs/UI/AchievementItem", find("Canvas")).then((node: Node) => {
            let item = node.getComponent(XGTW_AchievementItem);
            item.InitTip(data);
            Tween.stopAllByTarget(node);
            node.setPosition(position);
            node.addComponent(UIOpacity).opacity = 255;
            tween(node)
                .to(1, { position: v3(node.position.x, node.position.y - 450) }, { easing: EasingType.elasticInOut })
                .delay(1)
                .call(() => {
                    PoolManager.PutNode(node);
                })
                .start();
            tween(node.getComponent(UIOpacity))
                .delay(2)
                .to(0.5, { opacity: 0 }, { easing: EasingType.quartIn })
                .start()
        });
    }
}

export class XGTW_AchievementData {
    constructor(Name: string, Desc: string, Type: XGTW_AchievementType) {
        this.Name = Name;
        this.Desc = Desc;
        this.Type = Type;
    }
    Name: string;
    Desc: string;
    Type: XGTW_AchievementType;
    public get Done(): boolean { return PrefsManager.GetBool(this.Name, false); }
    public set Done(value: boolean) { PrefsManager.SetBool(this.Name, value) }
}