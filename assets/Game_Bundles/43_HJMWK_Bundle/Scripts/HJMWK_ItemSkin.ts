import { _decorator, Component, director, Enum, EventTouch, Node } from 'cc';
import { HJMWK_SKIN } from './HJMWK_Constant';
import { HJMWK_GameData } from './HJMWK_GameData';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import Banner from 'db://assets/Scripts/Banner';
const { ccclass, property } = _decorator;

@ccclass('HJMWK_ItemSkin')
export class HJMWK_ItemSkin extends Component {
    @property({ type: Enum(HJMWK_SKIN) })
    Skin: HJMWK_SKIN = HJMWK_SKIN.哈基咪;

    @property(Node)
    Buttons: Node[] = [];

    protected onLoad(): void {
        director.getScene().on("HJMWK_ItemSkin", this.show, this);
        this.show();
    }

    show() {
        const skin: string = Tools.GetEnumKeyByValue(HJMWK_SKIN, this.Skin);
        if (skin === HJMWK_GameData.Instance.CurSkin) {
            this.showButton(0);
        } else if (HJMWK_GameData.Instance.Skins.find(e => e === skin)) {
            this.showButton(1);
        } else {
            this.showButton(2);
        }
    }

    showButton(index: number) {
        for (let i: number = 0; i < this.Buttons.length; i++) {
            this.Buttons[i].active = i == index;
        }
    }

    Click(target: EventTouch) {
        switch (target.getCurrentTarget().name) {
            case "立即使用":
                HJMWK_GameData.Instance.CurSkin = Tools.GetEnumKeyByValue(HJMWK_SKIN, this.Skin);
                director.getScene().emit("HJMWK_ItemSkin");
                director.getScene().emit("HJMWK_ChangeSkin");
                HJMWK_GameData.DateSave();
                break;
            case "视频解锁":
                Banner.Instance.ShowVideoAd(() => {
                    HJMWK_GameData.Instance.Skins.push(Tools.GetEnumKeyByValue(HJMWK_SKIN, this.Skin));
                    HJMWK_GameData.Instance.CurSkin = Tools.GetEnumKeyByValue(HJMWK_SKIN, this.Skin);
                    director.getScene().emit("HJMWK_ItemSkin");
                    director.getScene().emit("HJMWK_ChangeSkin");
                    HJMWK_GameData.DateSave();
                })
                break;
        }
    }
}


