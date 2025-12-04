import { _decorator, Component, EventTouch, Node, Sprite, SpriteFrame } from 'cc';
import { CDXX_GameManager } from './CDXX_GameManager';
const { ccclass, property } = _decorator;

@ccclass('CDXX_TipsPanel')
export class CDXX_TipsPanel extends Component {

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
                CDXX_GameManager.Instance.ShowBattlePanel();
                break;
            case "否":
                this.node.active = false;
                break;
        }
    }
}


