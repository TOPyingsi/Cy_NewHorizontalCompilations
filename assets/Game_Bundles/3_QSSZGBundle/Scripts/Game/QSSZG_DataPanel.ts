import { _decorator, Component, Label, Node, ProgressBar, Sprite, SpriteFrame } from 'cc';
import { FishData } from '../QSSZG_GameData';
import { QSSZG_Constant } from '../Data/QSSZG_Constant';
import { QSSZG_Incident } from '../QSSZG_Incident';
import { QSSZG_GameManager } from './QSSZG_GameManager';

const { ccclass, property } = _decorator;

@ccclass('QSSZG_DataPanel')
export class QSSZG_DataPanel extends Component {
    public fishdata: FishData = null;//鱼数据
    start() {
        this.schedule(() => {
            if (this.fishdata) {
                this.Show();
            }
        }, 1)
    }
    Init(fishdata: FishData) {
        this.fishdata = fishdata;
        this.Show();
    }
    Show() {
        if (!this.fishdata) return;
        let data = QSSZG_Constant.GetDataFromID(this.fishdata.id);
        this.node.getChildByPath("名字/文本").getComponent(Label).string = data.Name;
        let spriteName: string = "FishSprite/" + this.fishdata.id + (QSSZG_Constant.GetLevelFromData(this.fishdata) == true ? "_fish" : "_baby");
        QSSZG_Incident.LoadSprite(spriteName).then((sprite: SpriteFrame) => {
            this.node.getChildByPath("图片框/鱼图").getComponent(Sprite).spriteFrame = sprite;
        });
        this.node.getChildByPath("每秒收益").getComponent(Label).string = "每秒获得收益$ " + QSSZG_Constant.GetearningsFromData(this.fishdata).toFixed(2);
        this.node.getChildByPath("经验底/描述").getComponent(Label).string = "XP:" + this.fishdata.Exp + "/" + data.MaxExp;
        this.node.getChildByPath("经验底").getComponent(ProgressBar).progress = this.fishdata.Exp / data.MaxExp;
        this.node.getChildByPath("价值").getComponent(Label).string = "$" + QSSZG_Constant.GetPriceFromData(this.fishdata).toFixed(2);
    }
    OnsellFishClick() {
        QSSZG_GameManager.Instance.sellFish();
        this.node.active = false;
    }
    OnChanggeaquariumClick() {
        QSSZG_GameManager.Instance.OnChanggeaquariumClick();
    }
}


