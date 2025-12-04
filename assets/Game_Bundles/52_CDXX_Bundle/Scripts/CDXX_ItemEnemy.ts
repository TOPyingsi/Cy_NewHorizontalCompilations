import { _decorator, Node, Component, Enum, find, Label, SpriteFrame, Sprite, tween, v3 } from 'cc';
import { CDXX_Tool } from './CDXX_Tool';
import { CDXX_ENEMY, CDXX_ENEMY_CONFIG } from './CDXX_Constant';
import { CDXX_GameManager } from './CDXX_GameManager';
import { CDXX_GameData } from './CDXX_GameData';
import { CDXX_EventManager, CDXX_MyEvent } from './CDXX_EventManager';

const { ccclass, property } = _decorator;

@ccclass('CDXX_ItemEnemy')
export class CDXX_ItemEnemy extends Component {

    @property({ type: Enum(CDXX_ENEMY) })
    Enemy: CDXX_ENEMY = CDXX_ENEMY.初级妖兽;

    @property(SpriteFrame)
    DYIcon: SpriteFrame = null;

    HPLabel: Label = null;
    NameLabel: Label = null;

    private _enemyIcon: SpriteFrame = null;
    private _tips: Node = null;

    protected onLoad(): void {
        this.HPLabel = find("HP", this.node).getComponent(Label);
        this.NameLabel = find("Name", this.node).getComponent(Label);
        this._enemyIcon = find("Icon", this.node).getComponent(Sprite).spriteFrame;

        this.Show();
        this.node.on(Node.EventType.TOUCH_END, this.Click, this)
        if (this.Enemy == CDXX_ENEMY.初级妖兽) {
            this._tips = find("Tips", this.node);
            CDXX_EventManager.on(CDXX_MyEvent.CDXX_TIPS_SHOW, this.ShowTips, this);
        }
    }


    Show() {
        const hp: number = CDXX_ENEMY_CONFIG.get(CDXX_Tool.GetEnumKeyByValue(CDXX_ENEMY, this.Enemy)).HP;
        this.HPLabel.string = "HP " + CDXX_Tool.formatNumber(hp, 0);
        this.NameLabel.string = CDXX_Tool.GetEnumKeyByValue(CDXX_ENEMY, this.Enemy);
    }

    ShowTips() {
        this._tips.active = true;
        tween(this._tips)
            .by(0.5, { scale: v3(-0.3, -0.3, -0.3) }, { easing: `sineIn` })
            .by(0.5, { scale: v3(0.3, 0.3, 0.3) }, { easing: `sineIn` })
            .delay(1)
            .union()
            .repeatForever()
            .start();
    }

    Click() {
        if (this.Enemy == CDXX_ENEMY.初级妖兽 && this._tips.active) this._tips.active = false;
        CDXX_GameManager.Instance.ShowTipsPanel(this._enemyIcon, this.DYIcon);
        CDXX_GameData.Instance.CurEnemy = this.Enemy;
    }
}


