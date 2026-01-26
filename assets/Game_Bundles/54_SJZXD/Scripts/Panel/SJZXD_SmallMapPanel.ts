import { _decorator, Color, Component, director, EventTouch, Label, Node, Sprite, SpriteFrame } from 'cc';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import { SJZXD_UIManager } from '../SJZXD_UIManager';
import { SJZXD_Constant } from '../SJZXD_Constant';
import { SJZXD_GameManager } from '../SJZXD_GameManager';
import { SJZXD_Incident } from '../SJZXD_Incident';

const { ccclass, property } = _decorator;

@ccclass('SJZXD_SmallMapPanel')
export class SJZXD_SmallMapPanel extends PanelBase {
    private MapSprite: Sprite = null;
    private PlayyerSpriteNode: Node = null;

    protected onLoad(): void {
        this.MapSprite = this.node.getChildByPath("框/Map").getComponent(Sprite);
        this.PlayyerSpriteNode = this.node.getChildByPath("框/Player");
    }
    Show(...args: any[]): void {
        super.Show(this.node.getChildByName("框"));
        this.LoadMap();
    }

    //加载地图
    LoadMap() {
        SJZXD_Incident.LoadSprite("Sprites/小地图/" + SJZXD_GameManager.GameScene).then((sp: SpriteFrame) => {
            this.MapSprite.spriteFrame = sp;
        })
        this.ShowPlayerPos();

    }
    //角色位置刷新 
    ShowPlayerPos() {
        if (SJZXD_GameManager.Instance.PlayerNode) {
            this.PlayyerSpriteNode.position = SJZXD_GameManager.Instance.PlayerNode.position.clone().multiplyScalar(0.17);
        }
    }
    OnExit() {
        SJZXD_UIManager.Instance.HidePanel(SJZXD_Constant.Panel.SmallMapPanel)

    }

}


