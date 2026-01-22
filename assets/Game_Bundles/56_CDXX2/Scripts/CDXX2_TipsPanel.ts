import { _decorator, Component, EventTouch, Node, Sprite, SpriteFrame } from 'cc';
import { CDXX2_GameManager } from './CDXX2_GameManager';
const { ccclass, property } = _decorator;

//“战斗确认提示面板”把敌人头像和对应丹药图标显示出来，点“是”进入战斗，点“否”直接关闭。

@ccclass('CDXX2_TipsPanel')
export class CDXX2_TipsPanel extends Component {

    @property(Sprite)
    EnemyIcon: Sprite = null;

    @property(Sprite)
    DYIcon: Sprite[] = [];

    Show(enemyIcon: SpriteFrame, dyIcon: SpriteFrame) {
        this.node.active = true;
        this.EnemyIcon.spriteFrame = enemyIcon;
        this.DYIcon.forEach(item => {
            item.spriteFrame = dyIcon;
        });
    }

    OnClickButton(event: EventTouch) {
        switch (event.target.name) {
            case "是":
                this.node.active = false;
                CDXX2_GameManager.Instance.ShowBattlePanel();
                break;
            case "否":
                this.node.active = false;
                break;
        }
    }
}


