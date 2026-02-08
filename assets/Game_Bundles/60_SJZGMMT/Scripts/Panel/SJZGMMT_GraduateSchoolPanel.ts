import { _decorator, Color, Component, EventTouch, Label, Node, Sprite, SpriteFrame, tween } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { SJZGMMT_UIManager } from '../SJZGMMT_UIManager';
import { SJZGMMT_Constant } from '../SJZGMMT_Constant';
import { SJZGMMT_AudioManager } from '../SJZGMMT_AudioManager';
import { SJZGMMT_GameData } from '../SJZGMMT_GameData';
import { SJZGMMT_Incident } from '../SJZGMMT_Incident';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_GraduateSchoolPanel')
export class SJZGMMT_GraduateSchoolPanel extends PanelBase {
    @property({ type: [SpriteFrame] })
    public SpriteFrames: SpriteFrame[] = [];
    public Index: number = 0;//页数
    private describe: string[] = [
        "探得上古方士炼丹残卷，内载‘龙骨续生术’。依方淬炼秘药，可强髓壮骨，令血气如地河奔涌，生生不息。服之，命元根基永固，血量上限将获得永久性提升！",
        "偶获战国‘尸解匠’传承的锻兵异法。以墓中阴火淬金，佐以煞气滋养，能使刀锋枪刃侵筋蚀骨，破邪僵如腐纸。兵刃之威，永驻不衰。伤害用久提升！",
        "修习《陵谱观山诀》，可窥天地人鬼四象机锋。洞悉墓中气流、砖纹、烛变之兆，使那‘巧合’，成为你手中算定的因果！",
        "摸金校尉秘宝‘乾坤蜃囊’。此囊以百年蜃妖皮胎缝制，内藏须弥芥子之巧，方寸之地可纳千斤明器。行囊之限，自此由心，背包容量永久提升！",];
    start() {
        this.ShowPanel();
    }
    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
    }
    OnButtonClick(event: EventTouch) {
        SJZGMMT_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "返回":
                SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.GraduateSchoolPanel);
                break;
            case "基因研究所": this.Index = 0; this.ShowPanel(); this.SelectframeMove(); break;
            case "武器研究所": this.Index = 1; this.ShowPanel(); this.SelectframeMove(); break;
            case "情报研究所": this.Index = 2; this.ShowPanel(); this.SelectframeMove(); break;
            case "仓储研究所": this.Index = 3; this.ShowPanel(); this.SelectframeMove(); break;
            case "升级":
                this.OnUplevelClick();
                break;
            case "所需道具":
                SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.PropMessagePanel2, [this.UpNeedData.Name])
                break;
        }
    }
    private UpNeedData: { price: number, Name: string, Num: number } = null;
    //刷新界面
    ShowPanel() {
        this.node.getChildByPath("框/升级信息底框/描述/文本").getComponent(Label).string = this.describe[this.Index];
        this.node.getChildByPath("框/升级信息底框/头像/等级").getComponent(Label).string = `LV:${SJZGMMT_GameData.Instance.LaboratoryLevel[this.Index]}`;
        this.node.getChildByPath("框/升级信息底框/头像/图标").getComponent(Sprite).spriteFrame = this.SpriteFrames[this.Index];
        let level = SJZGMMT_GameData.Instance.LaboratoryLevel[this.Index];
        switch (this.Index) {
            case 0:
                this.node.getChildByPath("框/升级效果").getComponent(Label).string =
                    `升级效果：生命值：${SJZGMMT_Constant.LaboratoryLevelData[this.Index][level]}->${SJZGMMT_Constant.LaboratoryLevelData[this.Index][level + 1]}`;
                break;
            case 1:
                this.node.getChildByPath("框/升级效果").getComponent(Label).string =
                    `升级效果：攻击力：${SJZGMMT_Constant.LaboratoryLevelData[this.Index][level]}->${SJZGMMT_Constant.LaboratoryLevelData[this.Index][level + 1]}`;
                break;
            case 2:
                this.node.getChildByPath("框/升级效果").getComponent(Label).string =
                    `升级效果：额外爆率：${SJZGMMT_Constant.LaboratoryLevelData[this.Index][level]}%->${SJZGMMT_Constant.LaboratoryLevelData[this.Index][level + 1]}%`;
                break;
            case 3:
                this.node.getChildByPath("框/升级效果").getComponent(Label).string =
                    `升级效果：背包额外空间：${SJZGMMT_Constant.LaboratoryLevelData[this.Index][level]}->${SJZGMMT_Constant.LaboratoryLevelData[this.Index][level + 1]}`;
                break;
        }
        if (level < 10) {
            this.UpNeedData = SJZGMMT_Constant.GetLaboratoryLevelUpData(this.Index);
            SJZGMMT_UIManager.Instance.GetPropSprite(this.UpNeedData.Name).then((sp: SpriteFrame) => {
                this.node.getChildByPath("框/所需材料/所需道具/道具图").getComponent(Sprite).spriteFrame = sp;
            })
            this.node.getChildByPath("框/所需材料/所需道具/道具名").getComponent(Label).string = this.UpNeedData.Name;
            this.node.getChildByPath("框/所需材料/所需道具/数量").getComponent(Label).string =
                `${SJZGMMT_GameData.Instance.getWarehouseNum(this.UpNeedData.Name)}/${this.UpNeedData.Num}`;
            this.node.getChildByPath("框/所需材料/所需道具/数量").getComponent(Label).color =
                SJZGMMT_GameData.Instance.getWarehouseNum(this.UpNeedData.Name) >= this.UpNeedData.Num ? new Color(0, 255, 0) : new Color(255, 0, 0);
            this.node.getChildByPath("框/所需材料/货币/数量").getComponent(Label).string = SJZGMMT_Incident.GetMaxNum(this.UpNeedData.price);
            this.node.getChildByPath("框/所需材料").active = true;
            this.node.getChildByPath("框/升级").active = true;
            this.node.getChildByPath("框/已满级").active = false;
        } else {//已经满级
            this.node.getChildByPath("框/所需材料").active = false;
            this.node.getChildByPath("框/升级").active = false;
            this.node.getChildByPath("框/已满级").active = true;
        }

    }
    //挪动选择框
    SelectframeMove() {
        tween(this.node.getChildByPath("框/左框/选择框"))
            .to(0.2, { worldPosition: this.node.getChildByPath("框/左框").children[this.Index].getWorldPosition().clone() }, { easing: "backOut" })
            .call(() => {
                if (this.node.getChildByPath("框/左框/选择框").worldPosition.clone().subtract(this.node.getChildByPath("框/左框").children[this.Index].getWorldPosition()).length() > 0.1) {
                    this.SelectframeMove();//如果错位重新挪动
                }
            })
            .start();
    }
    OnUplevelClick() {
        if (SJZGMMT_GameData.Instance.getWarehouseNum(this.UpNeedData.Name) >= this.UpNeedData.Num) {
            if (SJZGMMT_GameData.Instance.Money >= this.UpNeedData.price) {
                SJZGMMT_GameData.Instance.ChanggeMoney(-this.UpNeedData.price);
                SJZGMMT_GameData.Instance.LaboratoryLevel[this.Index]++;
                SJZGMMT_GameData.Instance.SubWarehouseData(this.UpNeedData.Name, this.UpNeedData.Num);
                this.ShowPanel();
                SJZGMMT_UIManager.Instance.ShowText("升级成功！");
            } else {
                SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.GetCashPanel);
            }
        } else {
            SJZGMMT_UIManager.Instance.ShowText("材料不足，请去游戏中获得材料！");
        }
    }
}


