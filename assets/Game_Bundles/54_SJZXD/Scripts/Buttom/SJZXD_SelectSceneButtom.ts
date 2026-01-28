import { _decorator, Component, director, Label, Node, Sprite, SpriteFrame } from 'cc';
import { SJZXD_UIManager } from '../SJZXD_UIManager';
import { SJZXD_Constant } from '../SJZXD_Constant';
import { SJZXD_EventManager } from '../SJZXD_EventManager';
import { SJZXD_Incident } from '../SJZXD_Incident';
import { SJZXD_AudioManager } from '../SJZXD_AudioManager';
import { SJZXD_GameManager } from '../SJZXD_GameManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_SelectSceneButtom')
export class SJZXD_SelectSceneButtom extends Component {
    start() {
        director.getScene().on(SJZXD_EventManager.主页_场景切换, this.changgeScene, this);
        // 重新进入场景更新地图
        this.changgeScene(SJZXD_GameManager.GameScene);
    }

    OnClick() {
        SJZXD_AudioManager.globalAudioPlay("点击");
        SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.SelectScenePanel)

    }

    changgeScene(Name: string) {
        this.node.getChildByPath("地图信息/地图名").getComponent(Label).string = Name;
        SJZXD_Incident.LoadSprite("Sprites/选关界面/关卡图/" + Name).then((sp: SpriteFrame) => {
            this.node.getChildByPath("地图框/Mask/地图").getComponent(Sprite).spriteFrame = sp;
        })
    }
}


