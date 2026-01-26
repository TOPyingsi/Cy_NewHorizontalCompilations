import { _decorator, Component, director, Label, Node, Sprite, SpriteFrame } from 'cc';
import { SJZXD_UIManager } from './SJZXD_UIManager';
import { SJZXD_GameData } from './SJZXD_GameData';
import { SJZXD_Constant } from './SJZXD_Constant';
import { SJZXD_EventManager } from './SJZXD_EventManager';
import { SJZXD_AudioManager } from './SJZXD_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_BoxroomSmallBox')
export class SJZXD_BoxroomSmallBox extends Component {
    @property()
    public Name: string = "";//道具名字
    start() {
        this.Show();
        director.getScene().on(SJZXD_EventManager.收藏馆物品变动, (Name: string) => {
            if (Name == this.Name) this.Show();
        });
    }

    //刷新显示
    Show() {
        let Level = SJZXD_GameData.Instance.GetBoxroomLevelByName(this.Name) - 1;
        this.node.getChildByName("加").active = false;
        SJZXD_UIManager.Instance.GetPropSprite(this.Name).then((sp: SpriteFrame) => {
            if (Level < 0) {
                this.node.getChildByName("道具图").getComponent(Sprite).spriteFrame = null;
            } else {
                this.node.getChildByName("道具图").getComponent(Sprite).spriteFrame = sp;
            }
        });
        this.node.getChildByName("框").children.forEach((element, index) => {
            element.active = index == Level;
            if (Level < 0 && index == 0) element.active = true;
        });
        if (this.node.getChildByName("飘带")) {
            this.node.getChildByName("飘带").children.forEach((element, index) => {
                element.active = index == Level;
                if (Level < 0 && index == 0) element.active = true;
            });
        }
        if (Level < 0) {//还没解锁
            if (SJZXD_GameData.Instance.getWarehouseNum(this.Name) > 0) {
                this.node.getChildByName("加").active = true;
            }
        }
        this.node.getChildByName("名字").getComponent(Label).string = this.Name;
    }
    //被单击
    OnClick() {
        SJZXD_AudioManager.globalAudioPlay("点击");
        let Level = SJZXD_GameData.Instance.GetBoxroomLevelByName(this.Name);
        if (Level == 0) {
            if (SJZXD_GameData.Instance.getWarehouseNum(this.Name) > 0) {
                SJZXD_GameData.Instance.UpBoxroomLevel(this.Name);
                SJZXD_GameData.Instance.SubWarehouseData(this.Name, 1);
                director.getScene().emit(SJZXD_EventManager.收藏馆物品变动, this.Name);
                SJZXD_UIManager.Instance.ShowText("物品放入成功！");
                SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.BoxroomUpPanel, [this.Name]);
            } else {
                SJZXD_UIManager.Instance.ShowText("仓库中没有该物品！");
            }
        } else {
            SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.BoxroomUpPanel, [this.Name]);
        }
    }

}


