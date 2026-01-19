import { _decorator, Node, Component, Enum, find, Label, SpriteFrame, Sprite, tween, v3 } from 'cc';
import { CDXX2_Tool } from './CDXX2_Tool';
import { CDXX2_ENEMY, CDXX2_ENEMY_CONFIG } from './CDXX2_Constant';
import { CDXX2_GameManager } from './CDXX2_GameManager';
import { CDXX2_GameData } from './CDXX2_GameData';
import { CDXX2_EventManager, CDXX2_MyEvent } from './CDXX2_EventManager';
import { CDXX2_EnemyManager } from './CDXX2_EnemyManager';

const { ccclass, property } = _decorator;

//“敌人条目”把配置表里的血量、名字读出来展示
//点击后把敌人图标与丹药图标传给提示面板并记录为当前要挑战的敌人；若是“初级妖兽”还会首次播放呼吸式引导动画。

@ccclass('CDXX2_ItemEnemy')
export class CDXX2_ItemEnemy extends Component {

    @property({ type: Enum(CDXX2_ENEMY) })
    Enemy: CDXX2_ENEMY = CDXX2_ENEMY.初级妖兽;

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
        if (this.Enemy == CDXX2_ENEMY.初级妖兽) {
            this._tips = find("Tips", this.node);
            CDXX2_EventManager.on(CDXX2_MyEvent.CDXX2_TIPS_SHOW, this.ShowTips, this);
        }
    }


    Show() {
        const key = CDXX2_Tool.GetEnumKeyByValue(CDXX2_ENEMY, this.Enemy);
        const conf = CDXX2_ENEMY_CONFIG.get(key);

        const hpFmt = CDXX2_Tool.formatNumber(conf.HP, 0);   // 血量
        const atkFmt = CDXX2_Tool.formatNumber(conf.Harm, 0);   // 攻击力（Harm 字段）

        this.HPLabel.string = `血量${hpFmt}攻击${atkFmt}`;
        this.NameLabel.string = key;
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
        if (this.Enemy == CDXX2_ENEMY.初级妖兽 && this._tips.active) this._tips.active = false;

        const touchPos = this.node.getWorldPosition();   // 点击世界坐标
        let count = 0;
        CDXX2_EnemyManager.Instance.CreateEnemy(this.Enemy, touchPos);
        this.schedule(() => {
            CDXX2_EnemyManager.Instance.CreateEnemy(this.Enemy, touchPos);
            if (++count >= 5) this.unscheduleAllCallbacks(); // 5 只结束
        }, 1.4, 3);  // 每 0.2 秒 1 次，共 5 次
    }

    // Click() {
    //     if (this.Enemy == CDXX2_ENEMY.初级妖兽 && this._tips.active) this._tips.active = false;
    //     CDXX2_GameManager.Instance.ShowTipsPanel(this._enemyIcon, this.DYIcon);
    //     CDXX2_GameData.Instance.CurEnemy = this.Enemy;
    // }
}


