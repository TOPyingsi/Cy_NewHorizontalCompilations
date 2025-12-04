import { _decorator, Button, Label, Color, Component, EventHandler, find, misc, Node, Sprite, SpriteFrame } from 'cc';

import { BundleManager } from '../../../../Scripts/Framework/Managers/BundleManager';
import { MTRNX_GameManager } from '../MTRNX_GameManager';
import { MTRNX_Constant, MTRNX_GameMode, MTRNX_JKType } from '../Data/MTRNX_Constant';
import { MTRNX_AudioManager } from '../MTRNX_AudioManager';
import { MTRNX_Panel, MTRNX_UIManager } from '../MTRNX_UIManager';

const { ccclass, property } = _decorator;

@ccclass('MTRNX_LvItem')
export class MTRNX_LvItem extends Component {

    sprite: Sprite = null;
    titleLb: Label = null;
    containLb: Label = null;
    descLb: Label = null;
    unlockNd: Node = null;
    lockLabel: Label = null;

    index: number = 0;
    unlock: boolean = false;
    cb: Function = null;

    protected onLoad(): void {
        this.sprite = this.node.getChildByName("sprit").getComponent(Sprite);
        this.titleLb = this.node.getChildByName("TitleLabel").getComponent(Label);
        this.containLb = this.node.getChildByName("ContainLabel").getComponent(Label);
        this.descLb = this.node.getChildByName("DescLabel").getComponent(Label);
        this.unlockNd = find("Button/Label", this.node);
        this.lockLabel = find("Button/UnlockLabel", this.node).getComponent(Label);
    }

    Init(index: number, data: any, cb: Function) {
        BundleManager.LoadSpriteFrame("2_MTRNX_Bundle", `Icons/Lv_${index + 1}`).then((sp: SpriteFrame) => {
            this.sprite.spriteFrame = sp;
        })

        this.index = index;
        this.cb = cb;

        this.titleLb.string = `${data.Title}`;
        let contains = MTRNX_GameManager.GameMode == MTRNX_GameMode.Normal ? MTRNX_Constant.SceneJKData[data.Lv] : MTRNX_Constant.SceneEndlessJKData[data.Lv];
        let containsStr = "";
        for (let i = 0; i < contains[0].length; i++) {
            containsStr += `${MTRNX_JKType[contains[0][i]]} `;
        }
        for (let i = 0; i < contains[1].length; i++) {
            containsStr += `${MTRNX_JKType[contains[1][i]]} `;
        }
        // this.containLb.string = `${containsStr}`;
        this.descLb.string = `${data.Desc}`;

        this.Refresh();
    }

    Refresh() {
        const lv = this.index + 1;
        this.unlock = false;
        if (MTRNX_GameManager.GameMode == MTRNX_GameMode.Normal) {
            this.unlock = MTRNX_GameManager.GetLvUnlock(lv);
        }

        if (MTRNX_GameManager.GameMode == MTRNX_GameMode.Endless) {
            this.unlock = MTRNX_GameManager.GetEndlessLvUnlock(lv);
        }

        this.unlockNd.active = this.unlock;
        this.lockLabel.node.active = !this.unlock;
        if (!this.unlock) {
            this.lockLabel.string = `${MTRNX_Constant.LvUnlockKeyCost[lv]}     解锁`;
        }
    }

    OnButtonClick() {
        MTRNX_AudioManager.AudioClipPlay("按钮点击");
        const lv = this.index + 1;
        if (this.unlock) {
            this.cb && this.cb(this.index);
        } else {
            if (MTRNX_GameManager.Key >= MTRNX_Constant.LvUnlockKeyCost[lv]) {
                MTRNX_GameManager.Key -= MTRNX_Constant.LvUnlockKeyCost[lv];
                if (MTRNX_GameManager.GameMode == MTRNX_GameMode.Normal) MTRNX_GameManager.SetLvUnlock(lv);
                if (MTRNX_GameManager.GameMode == MTRNX_GameMode.Endless) MTRNX_GameManager.SetEndlessLvUnlock(lv);

                this.Refresh();
            } else {
                MTRNX_UIManager.Instance.ShowPanel(MTRNX_Panel.TipPanel, [MTRNX_GameManager.GameMode == MTRNX_GameMode.Normal ? MTRNX_Constant.Tip.KeyLow : MTRNX_Constant.Tip.EndlessKeyLow]);
            }
        }
    }
}