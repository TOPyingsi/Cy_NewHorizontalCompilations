import { _decorator, Component, director, Label, Node, Sprite, SpriteFrame } from 'cc';
import { SJZGMMT_UIManager } from './SJZGMMT_UIManager';
import { SJZGMMT_GameData } from './SJZGMMT_GameData';
import { SJZGMMT_Constant } from './SJZGMMT_Constant';
import { SJZGMMT_EventManager } from './SJZGMMT_EventManager';
import { SJZGMMT_AudioManager } from './SJZGMMT_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_BoxroomSmallBox')
export class SJZGMMT_BoxroomSmallBox extends Component {
    @property()
    public Name: string = "";//道具名字
    start() {
        this.Show();
        director.getScene().on(SJZGMMT_EventManager.收藏馆物品变动, (Name: string) => {
            if (Name == this.Name) this.Show();
        });
    }

    //刷新显示
    Show() {
        let Level = SJZGMMT_GameData.Instance.GetBoxroomLevelByName(this.Name) - 1;
        this.node.getChildByName("加").active = false;
        SJZGMMT_UIManager.Instance.GetPropSprite(this.Name).then((sp: SpriteFrame) => {
            this.node.getChildByName("道具图").getComponent(Sprite).spriteFrame = sp;
            this.node.getChildByName("道具图").getComponent(Sprite).grayscale = Level < 0;
        });
        if (Level < 0) {//还没解锁
            if (SJZGMMT_GameData.Instance.getWarehouseNum(this.Name) > 0) {
                this.node.getChildByName("加").active = true;
            }
        }
        this.node.getChildByName("名字").getComponent(Label).string = this.Name;
        this.node.getChildByName("Level").children.forEach((element, index) => {
            element.active = index == Level;
        });
    }
    //被单击
    OnClick() {
        SJZGMMT_AudioManager.globalAudioPlay("点击");
        let Level = SJZGMMT_GameData.Instance.GetBoxroomLevelByName(this.Name);
        if (Level == 0) {
            if (SJZGMMT_GameData.Instance.getWarehouseNum(this.Name) > 0) {
                SJZGMMT_GameData.Instance.UpBoxroomLevel(this.Name);
                SJZGMMT_GameData.Instance.SubWarehouseData(this.Name, 1);
                director.getScene().emit(SJZGMMT_EventManager.收藏馆物品变动, this.Name);
                SJZGMMT_UIManager.Instance.ShowText("物品放入成功！");
                SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.BoxroomUpPanel, [this.Name]);
            } else {
                SJZGMMT_UIManager.Instance.ShowText("仓库中没有该物品！");
            }
        } else {
            SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.BoxroomUpPanel, [this.Name]);
        }
    }

}


