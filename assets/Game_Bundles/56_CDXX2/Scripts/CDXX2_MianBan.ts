import { _decorator, Component, Node, Label, NodeEventType, EventTouch } from 'cc';
import { CDXX2_GameData } from './CDXX2_GameData';
import { CDXX2_Tool } from './CDXX2_Tool';
const { ccclass, property } = _decorator;

/**
 * 面板系统
 * 显示玩家各项属性数值
 */
@ccclass('CDXX2_MianBan')
export class CDXX2_MianBan extends Component {

    @property(Node)
    MianBanPopup: Node = null;  // 面板弹窗节点

    @property(Node)
    CloseBtn: Node = null;  // 退出按钮

    @property(Label)
    GongJiLabel: Label = null;  // 攻击

    @property(Label)
    ShengMingLabel: Label = null;  // 生命

    @property(Label)
    ZhanLiLabel: Label = null;  // 战力

    @property(Label)
    BeiLvLabel: Label = null;  // 倍率

    @property(Label)
    ShengMingJiaChengLabel: Label = null;  // 生命加成

    @property(Label)
    GongJiJiaChengLabel: Label = null;  // 攻击加成

    @property(Label)
    LunHuiCiShuLabel: Label = null;  // 轮回次数

    protected onLoad(): void {
        // 点击面板按钮打开弹窗
        this.node.on(NodeEventType.TOUCH_END, this.openPopup, this);

        // 绑定退出按钮事件
        if (this.CloseBtn) {
            this.CloseBtn.on(NodeEventType.TOUCH_END, (event: EventTouch) => {
                event.propagationStopped = true;
                this.closePopup();
            }, this);
        }
    }

    openPopup(): void {
        if (this.MianBanPopup) {
            this.MianBanPopup.active = true;
            this.refreshData();
        }
    }

    closePopup(): void {
        if (this.MianBanPopup) {
            this.MianBanPopup.active = false;
        }
    }

    // 刷新所有数据显示
    refreshData(): void {
        this.showGongJi();
        this.showShengMing();
        this.showZhanLi();
        this.showBeiLv();
        this.showShengMingJiaCheng();
        this.showGongJiJiaCheng();
        this.showLunHuiCiShu();
    }

    // 显示攻击
    showGongJi(): void {
        if (this.GongJiLabel) {
            const value = CDXX2_GameData.Instance.Harm;
            this.GongJiLabel.string = `攻击:${CDXX2_Tool.formatNumber(value, 3)}`;
        }
    }

    // 显示生命
    showShengMing(): void {
        if (this.ShengMingLabel) {
            const value = CDXX2_GameData.Instance.HP;
            this.ShengMingLabel.string = `生命:${CDXX2_Tool.formatNumber(value, 3)}`;
        }
    }

    // 显示战力
    showZhanLi(): void {
        if (this.ZhanLiLabel) {
            const value = CDXX2_GameData.Instance.ZL;
            this.ZhanLiLabel.string = `战力:${CDXX2_Tool.formatNumber(value, 3)}`;
        }
    }

    // 显示倍率
    showBeiLv(): void {
        if (this.BeiLvLabel) {
            const value = CDXX2_GameData.GetElixirMultiplier();
            this.BeiLvLabel.string = `倍率:${value}`;
        }
    }

    // 显示生命加成
    showShengMingJiaCheng(): void {
        if (this.ShengMingJiaChengLabel) {
            const value = CDXX2_GameData.Instance.userData["生命加成"] || 1;
            // 转换为百分比显示，如1.05显示为+5%
            const percent = Math.round((value - 1) * 100);
            this.ShengMingJiaChengLabel.string = `生命加成:+${percent}%`;
        }
    }

    // 显示攻击加成
    showGongJiJiaCheng(): void {
        if (this.GongJiJiaChengLabel) {
            const value = CDXX2_GameData.Instance.userData["攻击加成"] || 1;
            // 转换为百分比显示，如1.05显示为+5%
            const percent = Math.round((value - 1) * 100);
            this.GongJiJiaChengLabel.string = `攻击加成:+${percent}%`;
        }
    }

    // 显示轮回次数
    showLunHuiCiShu(): void {
        if (this.LunHuiCiShuLabel) {
            const value = CDXX2_GameData.Instance.userData["轮回次数"] || 0;
            this.LunHuiCiShuLabel.string = `轮回次数:${value}`;
        }
    }
}
