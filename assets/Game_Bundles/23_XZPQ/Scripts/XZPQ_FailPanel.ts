
import { _decorator, Component, Node, tween, Vec3, director, game, v3, AudioSource, Tween, Label } from 'cc';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import { XZPQ_GameManager } from './XZPQ_GameManager';

const { ccclass, property } = _decorator;

@ccclass('XZPQ_FailPanel')
export class XZPQ_FailPanel extends PanelBase {

    label: Label = null;

    Show(): void {
        super.Show();
    }

    protected onEnable(): void {
        this.label = this.getComponentInChildren(Label);
        if (XZPQ_GameManager.Instance.gameType === "小强") {
            this.label.string = "早上6:37,蟑螂爸爸和蟑螂妈妈在孩子们的房间里发现了一个背包。疑犯已经被通缉，保安的手里拿着一个带监控的平板电脑，监控清晰的显示大黄和小紫在房子里走来走去,最后向保安走去。";
        }
        else {
            this.label.string = "早上6:37,猪爸爸和猪妈妈在孩子们的房间里发现了一个背包。疑犯已经被通缉保安的手里拿着一个带监控的平板电脑监控清晰的显示佩奇和乔治在房子里走来走去，最后向保安走去。";
        }
    }
}
