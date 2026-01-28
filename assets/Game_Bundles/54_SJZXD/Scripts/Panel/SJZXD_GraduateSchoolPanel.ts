import { _decorator, Color, Component, EventTouch, Label, Node, Sprite, SpriteFrame, tween } from 'cc';
import { PanelBase } from '../../../../Scripts/Framework/UI/PanelBase';
import { SJZXD_UIManager } from '../SJZXD_UIManager';
import { SJZXD_Constant } from '../SJZXD_Constant';
import { SJZXD_AudioManager } from '../SJZXD_AudioManager';
import { SJZXD_GameData } from '../SJZXD_GameData';
import { SJZXD_Incident } from '../SJZXD_Incident';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_GraduateSchoolPanel')
export class SJZXD_GraduateSchoolPanel extends PanelBase {
    @property({ type: [SpriteFrame] })
    public SpriteFrames: SpriteFrame[] = [];
    public Index: number = 0;//页数
    private describe: string[] = [
        "通过编辑DNA螺旋结构，我们能够从根本上强化有机体的细胞再生能力与组织韧性。升级此处，血条上限将获得永久性提升！",
        "哈弗氪开发的智能纳米武器，能在使得穿戴者的子弹拥有更高的伤害，升级此处，伤害用久提升！",
        "阿裟拉建立的预测模型能解构战场上的混沌信息流，计算出每一个“偶然”背后的数据痕迹。升级此处，让“巧合”变成常态！",
        "利用量子纠缠原理开发了亚空间压缩协议，能在不增加物理负重的前提下，拓展你的后勤容量，升级此处，背包容量用久提升！",];
    start() {
        this.ShowPanel();
    }
    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
    }
    OnButtonClick(event: EventTouch) {
        SJZXD_AudioManager.globalAudioPlay("点击");
        switch (event.target.name) {
            case "返回":
                SJZXD_UIManager.Instance.HidePanel(SJZXD_Constant.Panel.GraduateSchoolPanel);
                break;
            case "基因研究所": this.Index = 0; this.ShowPanel(); this.SelectframeMove(); break;
            case "武器研究所": this.Index = 1; this.ShowPanel(); this.SelectframeMove(); break;
            case "情报研究所": this.Index = 2; this.ShowPanel(); this.SelectframeMove(); break;
            case "仓储研究所": this.Index = 3; this.ShowPanel(); this.SelectframeMove(); break;
            case "升级":
                this.OnUplevelClick();
                break;
            case "所需道具":
                SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.PropMessagePanel2, [this.UpNeedData.Name])
                break;
        }
    }
    private UpNeedData: { price: number, Name: string, Num: number } = null;
    //刷新界面
    ShowPanel() {
        this.node.getChildByPath("框/升级信息底框/描述/文本").getComponent(Label).string = this.describe[this.Index];
        this.node.getChildByPath("框/升级信息底框/头像/等级").getComponent(Label).string = `LV:${SJZXD_GameData.Instance.LaboratoryLevel[this.Index]}`;
        this.node.getChildByPath("框/升级信息底框/头像/图标").getComponent(Sprite).spriteFrame = this.SpriteFrames[this.Index];
        let level = SJZXD_GameData.Instance.LaboratoryLevel[this.Index];
        switch (this.Index) {
            case 0:
                this.node.getChildByPath("框/升级效果").getComponent(Label).string =
                    `升级效果：生命值：${SJZXD_Constant.LaboratoryLevelData[this.Index][level]}->${SJZXD_Constant.LaboratoryLevelData[this.Index][level + 1]}`;
                break;
            case 1:
                this.node.getChildByPath("框/升级效果").getComponent(Label).string =
                    `升级效果：攻击力：${SJZXD_Constant.LaboratoryLevelData[this.Index][level]}->${SJZXD_Constant.LaboratoryLevelData[this.Index][level + 1]}`;
                break;
            case 2:
                this.node.getChildByPath("框/升级效果").getComponent(Label).string =
                    `升级效果：额外爆率：${SJZXD_Constant.LaboratoryLevelData[this.Index][level]}%->${SJZXD_Constant.LaboratoryLevelData[this.Index][level + 1]}%`;
                break;
            case 3:
                this.node.getChildByPath("框/升级效果").getComponent(Label).string =
                    `升级效果：背包额外空间：${SJZXD_Constant.LaboratoryLevelData[this.Index][level]}->${SJZXD_Constant.LaboratoryLevelData[this.Index][level + 1]}`;
                break;
        }
        if (level < 10) {
            this.UpNeedData = SJZXD_Constant.GetLaboratoryLevelUpData(this.Index);
            SJZXD_UIManager.Instance.GetPropSprite(this.UpNeedData.Name).then((sp: SpriteFrame) => {
                this.node.getChildByPath("框/所需材料/所需道具/道具图").getComponent(Sprite).spriteFrame = sp;
            })
            this.node.getChildByPath("框/所需材料/所需道具/道具名").getComponent(Label).string = this.UpNeedData.Name;
            this.node.getChildByPath("框/所需材料/所需道具/数量").getComponent(Label).string =
                `${SJZXD_GameData.Instance.getWarehouseNum(this.UpNeedData.Name)}/${this.UpNeedData.Num}`;
            this.node.getChildByPath("框/所需材料/所需道具/数量").getComponent(Label).color =
                SJZXD_GameData.Instance.getWarehouseNum(this.UpNeedData.Name) >= this.UpNeedData.Num ? new Color(0, 255, 0) : new Color(255, 0, 0);
            this.node.getChildByPath("框/所需材料/货币/数量").getComponent(Label).string = SJZXD_Incident.GetMaxNum(this.UpNeedData.price);
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
        if (SJZXD_GameData.Instance.getWarehouseNum(this.UpNeedData.Name) >= this.UpNeedData.Num) {
            if (SJZXD_GameData.Instance.Money >= this.UpNeedData.price) {
                SJZXD_GameData.Instance.ChanggeMoney(-this.UpNeedData.price);
                SJZXD_GameData.Instance.LaboratoryLevel[this.Index]++;
                SJZXD_GameData.Instance.SubWarehouseData(this.UpNeedData.Name, this.UpNeedData.Num);
                this.ShowPanel();
                SJZXD_UIManager.Instance.ShowText("升级成功！");
            } else {
                SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.GetCashPanel);
            }
        } else {
            SJZXD_UIManager.Instance.ShowText("材料不足，请去游戏中获得材料！");
        }
    }
}


