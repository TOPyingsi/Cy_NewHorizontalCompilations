import { _decorator, AudioSource, Color, Component, director, EventTouch, instantiate, Label, Node, Prefab, sp, Sprite, tween, UITransform, v3, Widget } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { SJZXD_UIManager } from '../SJZXD_UIManager';
import { SJZXD_Constant } from '../SJZXD_Constant';
import { SJZXD_GameData } from '../SJZXD_GameData';
import Banner from '../../../../Scripts/Banner';
import { SJZXD_Incident } from '../SJZXD_Incident';
import { SJZXD_AudioManager } from '../SJZXD_AudioManager';
import { SJZXD_PlayerSkeletonName } from '../SJZXD_PlayerSkeleton';
import { SJZXD_SkinBox } from '../SJZXD_SkinBox';
import { SJZXD_EventManager } from '../SJZXD_EventManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_RolePanel')
export class SJZXD_RolePanel extends PanelBase {
    @property(Prefab)
    public SkinBoxPre: Prefab = null;

    private SeletContent: Node = null;
    private seletcName: string = "修勾";
    private seletSkinName: string = "修勾";
    private Playerskeleton: sp.Skeleton = null;
    private weaponNode: Node = null;
    private UnitSkinData: { Name: string, Skin: string[] }[] = [
        { Name: "修勾", Skin: ["修勾", "老兵", "军阀", "天使", "摩尔科技"] },
        { Name: "杰峰", Skin: ["杰峰", "蓝翼", "白衣战士", "老兵", "军阀", "机甲修勾"] },
        { Name: "贤勾", Skin: ["贤勾", "天使", "特种部队", "未来战士", "机甲修勾", "摩尔科技"] },
        { Name: "炼狱犬", Skin: ["炼狱犬", "军阀", "特种部队", "老兵", "未来战士", "摩尔科技", "烈焰犬"] },
        { Name: "不死勾", Skin: ["不死勾", "未来战士", "机甲修勾", "白衣战士", "烈焰犬"] },
    ]
    private SkinContent: Node = null;
    protected onLoad(): void {
        this.SeletContent = this.node.getChildByPath("框/选择栏/Mask/Content");
        this.SkinContent = this.node.getChildByPath("框/皮肤选择栏/皮肤底框/Mask/Content");
        this.Playerskeleton = this.node.getChildByPath("框/动画/主角").getComponent(sp.Skeleton);
        this.weaponNode = this.node.getChildByPath("框/动画/武器");
        this.RefreshEquipSlider();

    }
    protected start(): void {
        this.node.on("皮肤_选中", this.OnSkinClick, this)
        SJZXD_UIManager.Instance.SJZXD_On(SJZXD_EventManager.开启强制显示皮肤, () => {
            if (SJZXD_GameData.Instance.GameData[3] == 1) {
                this.ShowEquip();
            }
        })
    }
    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
        this.ChanggeIndex("属性");
        this.OnSkinClick(this.UnitSkinData.find(e => e.Name == this.seletcName).Skin[0]);
        this.ShowPanel();
        this.InitWeaponNode();
        this.PlayOutAnimation();
        this.RefreshSkinPanel();
    }
    Onbuttomclick(event: EventTouch) {
        SJZXD_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "解锁":
                this.unlockAgen();
                break;
            case "升级":
                this.UpAngenLevel();
                break;
            case "出战":
                this.OnGoOutClick();
                break;
            case "返回":
                SJZXD_UIManager.Instance.HidePanel(SJZXD_Constant.Panel.RolePanel);
                break;
            case "属性按钮":
                this.ChanggeIndex("属性");
                break;
            case "皮肤按钮":
                this.ChanggeIndex("皮肤");
                break;
            case "显示装备":
                this.ShowEquip();
                break;
            case "选择皮肤":
                this.ChangeSkin();
                break;
            case "免费获得皮肤":
                this.FreeGetSkin();
                break;
            case "付费获得皮肤":
                this.BuyGetSkin();
                break;
        }
    }
    //选中角色
    OnSelectclick(event: EventTouch) {
        this.seletcName = event.target.name;
        switch (event.target.name) {
            case "修勾": break;
            case "杰峰": break;
            case "贤勾": break;
            case "炼狱犬": break;
            case "不死勾": break;
        }
        this.OnSkinClick(this.UnitSkinData.find(e => e.Name == this.seletcName).Skin[0]);
        this.ChanggeIndex("属性");
        this.ShowPanel();
        this.RefreshSkinPanel();
        this.PlayOutAnimation();
    }


    //根据选择刷新当前界面
    ShowPanel() {
        let AgenData = SJZXD_Constant.getAgentDataByName(this.seletcName);;
        let AgenLevel = SJZXD_GameData.Instance.GetAgentLevelByName(this.seletcName);
        this.SeletContent.children.forEach((element) => {
            element.getChildByName("选中框").active = element.name == this.seletcName;
            element.getChildByName("未解锁").active = SJZXD_GameData.Instance.GetAgentLevelByName(element.name) == 0;
        });
        this.node.getChildByPath("框/名字").getComponent(Label).string = this.seletcName;
        this.node.getChildByPath("框/星级").children.forEach((element, index) => {
            element.active = AgenData.星级 > index;
        });
        this.node.getChildByPath("框/等级/文本").getComponent(Label).string = `LV:${AgenLevel}`;
        this.TweenSprite(this.node.getChildByPath("框/属性/攻击/满级值"), (AgenData.攻击 * 2) / SJZXD_Constant.AgenMaxproperty[0]);
        this.TweenSprite(this.node.getChildByPath("框/属性/生命/满级值"), (AgenData.生命 * 2) / SJZXD_Constant.AgenMaxproperty[1]);
        this.TweenSprite(this.node.getChildByPath("框/属性/护甲/满级值"), (AgenData.护甲 * 2) / SJZXD_Constant.AgenMaxproperty[2]);
        this.TweenSprite(this.node.getChildByPath("框/属性/攻击/当前值"), (AgenData.攻击 * (1 + AgenLevel * 0.1)) / SJZXD_Constant.AgenMaxproperty[0]);
        this.TweenSprite(this.node.getChildByPath("框/属性/生命/当前值"), (AgenData.生命 * (1 + AgenLevel * 0.1)) / SJZXD_Constant.AgenMaxproperty[1]);
        this.TweenSprite(this.node.getChildByPath("框/属性/护甲/当前值"), (AgenData.护甲 * (1 + AgenLevel * 0.1)) / SJZXD_Constant.AgenMaxproperty[2]);
        this.node.getChildByPath("框/属性/攻击/数值文本").getComponent(Label).string = `${Math.floor(AgenData.攻击 * (1 + AgenLevel * 0.1))}`;
        this.node.getChildByPath("框/属性/生命/数值文本").getComponent(Label).string = `${Math.floor(AgenData.生命 * (1 + AgenLevel * 0.1))}`;
        this.node.getChildByPath("框/属性/护甲/数值文本").getComponent(Label).string = `${Math.floor(AgenData.护甲 * (1 + AgenLevel * 0.1))}`;
        this.node.getChildByPath("框/技能/被动描述文本").getComponent(Label).string = AgenData.被动技能描述;
        this.node.getChildByPath("框/技能/主动描述文本").getComponent(Label).string = AgenData.主动技能描述;
        this.node.getChildByPath("框/已满级").active = false;
        if (AgenLevel == 0) {
            this.node.getChildByPath("框/解锁和升级/解锁").active = true;
            this.node.getChildByPath("框/解锁和升级/升级").active = false;
        } else if (AgenLevel < 10) {
            this.node.getChildByPath("框/解锁和升级/解锁").active = false;
            this.node.getChildByPath("框/解锁和升级/升级").active = true;
        } else {
            this.node.getChildByPath("框/解锁和升级/解锁").active = false;
            this.node.getChildByPath("框/解锁和升级/升级").active = false;
            this.node.getChildByPath("框/已满级").active = true;
        }
        let num = SJZXD_GameData.Instance.getWarehouseNum("干员卡");
        this.node.getChildByPath("框/解锁和升级/解锁/数量").getComponent(Label).string = `${num}/1`
        if (num > 0) {
            this.node.getChildByPath("框/解锁和升级/解锁/视频角标").active = false;
            this.node.getChildByPath("框/解锁和升级/解锁/数量").getComponent(Label).color = new Color(0, 255, 0, 255);
        } else {
            this.node.getChildByPath("框/解锁和升级/解锁/视频角标").active = true;
            this.node.getChildByPath("框/解锁和升级/解锁/数量").getComponent(Label).color = new Color(255, 0, 0, 255);
        }
        this.node.getChildByPath("框/解锁和升级/升级/数量").getComponent(Label).string =
            SJZXD_Incident.GetMaxNum(SJZXD_Constant.UpgradeAgentMoney[AgenLevel]);
        this.node.getChildByPath("框/出战").active = (SJZXD_GameData.Instance.AgentSelect != this.seletcName
            && SJZXD_GameData.Instance.GetAgentLevelByName(this.seletcName) > 0
        );
    }


    //将一个Node的sprite的fillRange给Tween到指定值
    TweenSprite(Node: Node, value: number) {
        tween(Node.getComponent(Sprite))
            .to(0.5, { fillRange: value }, { easing: "backOut" })
            .start();
    }


    //点击解锁按钮
    public unlockAgen() {
        let num = SJZXD_GameData.Instance.getWarehouseNum("干员卡");
        if (num > 0) {//有干员卡
            SJZXD_GameData.Instance.SubWarehouseData("干员卡", 1);
            SJZXD_GameData.Instance.UpAgentLevel(this.seletcName);
            SJZXD_UIManager.Instance.ShowText("解锁干员成功！");
            this.ShowPanel();
        } else {
            Banner.Instance.ShowVideoAd(() => {
                SJZXD_GameData.Instance.UpAgentLevel(this.seletcName);
                SJZXD_UIManager.Instance.ShowText("解锁干员成功！");
            })
            this.ShowPanel();
        }
    }

    //点击升级按钮
    public UpAngenLevel() {
        let num = SJZXD_Constant.UpgradeAgentMoney[SJZXD_GameData.Instance.GetAgentLevelByName(this.seletcName)];
        if (SJZXD_GameData.Instance.Money >= num) {
            SJZXD_GameData.Instance.ChanggeMoney(-num);
            SJZXD_GameData.Instance.UpAgentLevel(this.seletcName);
            SJZXD_UIManager.Instance.ShowText("干员升级成功！");
            this.ShowPanel();
        } else {
            SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.GetCashPanel);
        }

    }

    //点击出战按钮
    OnGoOutClick() {
        SJZXD_GameData.Instance.AgentSelect = this.seletcName;
        SJZXD_UIManager.Instance.ShowText("切换干员成功！");
        this.OnSkinClick(this.UnitSkinData.find(e => e.Name == this.seletcName).Skin[0]);
        SJZXD_GameData.Instance.Skin = this.seletSkinName;
        SJZXD_UIManager.Instance.SJZXD_Emit(SJZXD_EventManager.龙骨_主角刷新);
        this.ShowPanel();
        this.RefreshSkinPanel();
    }

    //切换栏目
    ChanggeIndex(Name: string) {
        this.node.getChildByPath("框/技能").active = Name == "属性";
        this.node.getChildByPath("框/属性").active = Name == "属性";
        this.node.getChildByPath("框/解锁和升级").active = Name == "属性";
        this.node.getChildByPath("框/皮肤选择栏").active = Name == "皮肤";
        tween(this.node.getChildByPath("框/切换栏/选中"))
            .to(0.5, { position: Name == "属性" ? v3(65) : v3(315) }, { easing: "backOut" })
            .start();
    }


    //点击显示装备
    public ShowEquip() {
        SJZXD_GameData.Instance.GameData[3] = SJZXD_GameData.Instance.GameData[3] == 0 ? 1 : 0;
        SJZXD_UIManager.Instance.SJZXD_Emit(SJZXD_EventManager.龙骨_主角刷新);
        this.RefreshEquipSlider();
    }
    //刷新显示装备滑动条
    public RefreshEquipSlider() {
        tween(this.node.getChildByPath("框/显示装备/圆"))
            .to(0.25, { x: SJZXD_GameData.Instance.GameData[3] == 0 ? 65 : -65 })
            .start();
        this.node.getChildByPath("框/显示装备/绿色").active = SJZXD_GameData.Instance.GameData[3] == 0;
    }

    //初始化武器节点
    public InitWeaponNode() {
        if (SJZXD_GameData.Instance.PlayerData[0] != "无") {
            this.weaponNode.removeAllChildren();
            SJZXD_Incident.Loadprefab("Prefabs/武器/" + SJZXD_GameData.Instance.PlayerData[0]).then((prefab: Prefab) => {
                let wp = instantiate(prefab);
                wp.setParent(this.weaponNode);
                wp.layer = wp.parent.layer;
                wp.children.forEach((child) => {
                    child.layer = wp.parent.layer;
                });
            });
        }
    }

    //播放出场动画
    public PlayOutAnimation() {
        this.weaponNode.active = false;
        this.PlayStartAudio();
        let AnimationName: string = "";
        switch (this.seletcName) {
            case "杰峰": AnimationName = SJZXD_PlayerSkeletonName.杰峰出场; break;
            case "贤勾": AnimationName = SJZXD_PlayerSkeletonName.贤勾出场; break;
            case "炼狱犬": AnimationName = SJZXD_PlayerSkeletonName.炼狱犬出场; break;
            case "不死勾": AnimationName = SJZXD_PlayerSkeletonName.不死勾出场; break;
            default:
                AnimationName = SJZXD_PlayerSkeletonName.直升机出场;
                break;
        }
        this.Playerskeleton.setAnimation(0, AnimationName, false);
        this.Playerskeleton.setCompleteListener(() => {
            this.Playerskeleton.setAnimation(0, SJZXD_PlayerSkeletonName.待机, true);
            this.weaponNode.active = true;
        })

    }


    //刷新皮肤界面
    public RefreshSkinPanel() {
        let SkinNameList = this.UnitSkinData.find(e => e.Name == this.seletcName).Skin;
        this.SkinContent.children.forEach((child) => {
            child.active = false;
        });
        SkinNameList.forEach((e, index) => {
            if (this.SkinContent.getChildByName(e)) {
                this.SkinContent.getChildByName(e).active = true
                this.SkinContent.getChildByName(e).setSiblingIndex(index);
                if (index == 0) {
                    this.SkinContent.getChildByName(e).getComponent(SJZXD_SkinBox).ButtomClick();
                }
            } else {
                let SkinBox = instantiate(this.SkinBoxPre);
                SkinBox.name = e;
                SkinBox.parent = this.SkinContent;
                SkinBox.setSiblingIndex(index);
                SkinBox.getComponent(SJZXD_SkinBox).Init(e, this.node);
                if (index == 0) {
                    SkinBox.getComponent(SJZXD_SkinBox).ButtomClick();
                }
            }

        });
        this.SkinContent.getComponent(UITransform).width = SkinNameList.length * 282 + 20;
        this.SkinContent.getComponent(Widget).left = 0;
    }
    //选中某个皮肤
    OnSkinClick(SkinName: string) {
        this.Playerskeleton.setSkin(SJZXD_Constant.getSkinNameByName(SkinName).SkeletonName);
        this.PlayOutAnimation();
        this.seletSkinName = SkinName;
        this.ShowSkinPanel();

    }

    //刷新皮肤界面
    ShowSkinPanel() {
        this.node.getChildByPath("框/皮肤选择栏/描述框/描述").getComponent(Label).string = SJZXD_Constant.getSkinDataByName(this.seletSkinName).Description;
        this.node.getChildByPath("框/皮肤选择栏/选择皮肤").active = false;
        this.node.getChildByPath("框/皮肤选择栏/免费获得皮肤").active = false;
        this.node.getChildByPath("框/皮肤选择栏/付费获得皮肤").active = false;
        if (SJZXD_GameData.Instance.SkinData.indexOf(this.seletSkinName) != -1) {
            this.node.getChildByPath("框/皮肤选择栏/选择皮肤").active = true;
        } else {
            let price = SJZXD_Constant.getSkinDataByName(this.seletSkinName).Price;
            if (price == -1) {//广告激活
                this.node.getChildByPath("框/皮肤选择栏/免费获得皮肤").active = true;
            } else {
                this.node.getChildByPath("框/皮肤选择栏/付费获得皮肤").active = true;
                this.node.getChildByPath("框/皮肤选择栏/付费获得皮肤/价格").getComponent(Label).string = SJZXD_Incident.GetMaxNum(price)
            }
        }
        this.node.getChildByPath("框/皮肤选择栏/选择皮肤").active = !(SJZXD_GameData.Instance.Skin == this.seletSkinName);
    }

    //穿戴皮肤
    public ChangeSkin() {
        if (this.seletcName != SJZXD_GameData.Instance.AgentSelect) {
            SJZXD_UIManager.Instance.ShowText("请先选择出战该干员再选择皮肤！");
            return;
        }
        SJZXD_GameData.Instance.Skin = this.seletSkinName;
        this.ShowPanel();
        this.ShowSkinPanel();
        SJZXD_UIManager.Instance.SJZXD_Emit(SJZXD_EventManager.开启强制显示皮肤);
        director.getScene().emit(SJZXD_EventManager.穿戴皮肤, this.seletSkinName);
        SJZXD_UIManager.Instance.SJZXD_Emit(SJZXD_EventManager.龙骨_主角刷新);
        SJZXD_UIManager.Instance.ShowText("穿戴成功！");
    }


    //免费获得皮肤
    FreeGetSkin() {
        Banner.Instance.ShowVideoAd(() => {
            SJZXD_GameData.Instance.SkinData.push(this.seletSkinName);
            this.ShowSkinPanel();
            SJZXD_UIManager.Instance.ShowText("恭喜解锁皮肤！");
        })

    }

    //付费获得皮肤
    BuyGetSkin() {
        let price = SJZXD_Constant.getSkinDataByName(this.seletSkinName).Price;
        if (SJZXD_GameData.Instance.Money >= price) {
            SJZXD_GameData.Instance.ChanggeMoney(-price);
            SJZXD_GameData.Instance.SkinData.push(this.seletSkinName);
            this.ShowSkinPanel();
            SJZXD_UIManager.Instance.ShowText("恭喜解锁皮肤！");
        } else {
            SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.GetCashPanel);
        }
    }

    //播放出场音效
    PlayStartAudio() {
        this.node.getComponent(AudioSource).stop();
        this.node.getComponent(AudioSource).clip = SJZXD_AudioManager.AudioMap.get(this.seletcName + "出场音效");
        if (this.node.getComponent(AudioSource).clip) {
            this.node.getComponent(AudioSource).play();
        }
    }
}


