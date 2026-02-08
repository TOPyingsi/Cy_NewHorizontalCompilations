import { _decorator, Component, director, Label, Node, Sprite, SpriteFrame } from 'cc';
import { SJZGMMT_UIManager } from '../SJZGMMT_UIManager';
import { SJZGMMT_Constant } from '../SJZGMMT_Constant';
import { SJZGMMT_EventManager } from '../SJZGMMT_EventManager';
import { SJZGMMT_Incident } from '../SJZGMMT_Incident';
import { SJZGMMT_AudioManager } from '../SJZGMMT_AudioManager';
import { SJZGMMT_GameManager } from '../SJZGMMT_GameManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_SelectSceneButtom')
export class SJZGMMT_SelectSceneButtom extends Component {
    start() {
        director.getScene().on(SJZGMMT_EventManager.主页_场景切换, this.changgeScene, this);
        // 重新进入场景更新地图
        this.changgeScene(SJZGMMT_GameManager.GameScene);
    }

    OnClick() {
        SJZGMMT_AudioManager.globalAudioPlay("点击");
        SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.SelectScenePanel)

    }

    changgeScene(Name: string) {
        this.node.getChildByPath("地图信息/地图名").getComponent(Label).string = Name;
        SJZGMMT_Incident.LoadSprite("Sprites/选关界面/关卡图/" + Name).then((sp: SpriteFrame) => {
            this.node.getChildByPath("地图框/Mask/地图").getComponent(Sprite).spriteFrame = sp;
        })
    }
}


