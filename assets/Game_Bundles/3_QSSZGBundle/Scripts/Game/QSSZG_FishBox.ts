import { _decorator, Component, Label, Node, ProgressBar, Sprite, SpriteFrame } from 'cc';
import { FishData } from '../QSSZG_GameData';
import { QSSZG_Constant } from '../Data/QSSZG_Constant';
import { QSSZG_Incident } from '../QSSZG_Incident';

import { QSSZG_GameManager } from './QSSZG_GameManager';
import { QSSZG_EventManager, QSSZG_MyEvent } from '../QSSZG_EventManager';
const { ccclass, property } = _decorator;

@ccclass('QSSZG_FishBox')
export class QSSZG_FishBox extends Component {
    public fishdata: FishData = null;
    protected start(): void {
        QSSZG_EventManager.on(QSSZG_MyEvent.DeleteFish, this.DeleteFish, this)
    }
    Init(fishdata: FishData) {
        this.fishdata = fishdata;
        this.Show();
    }
    Show() {
        if (!this.fishdata) return;
        let data = QSSZG_Constant.GetDataFromID(this.fishdata.id);
        this.node.getChildByPath("Name").getComponent(Label).string = data.Name;
        let spriteName: string = this.fishdata.id + (QSSZG_Constant.GetLevelFromData(this.fishdata) == true ? "_fish" : "_baby");
        QSSZG_Incident.LoadSprite("FishSprite/" + spriteName).then((sprite: SpriteFrame) => {
            this.node.getChildByPath("FishBg/sprite").getComponent(Sprite).spriteFrame = sprite;
        });
        this.node.getChildByPath("收益").getComponent(Label).string = "每秒获得收益$ " + QSSZG_Constant.GetearningsFromData(this.fishdata).toFixed(2);
        this.node.getChildByPath("经验底/描述").getComponent(Label).string = "XP:" + this.fishdata.Exp + "/" + data.MaxExp;
        this.node.getChildByPath("经验底").getComponent(ProgressBar).progress = this.fishdata.Exp / data.MaxExp;
        this.node.getChildByPath("价值").getComponent(Label).string = "$" + QSSZG_Constant.GetPriceFromData(this.fishdata).toFixed(2);
        this.schedule(() => {
            this.node.getChildByPath("收益").getComponent(Label).string = "每秒获得收益$ " + QSSZG_Constant.GetearningsFromData(this.fishdata).toFixed(2);
            this.node.getChildByPath("价值").getComponent(Label).string = "$" + QSSZG_Constant.GetPriceFromData(this.fishdata).toFixed(2);
            this.node.getChildByPath("经验底/描述").getComponent(Label).string = "XP:" + this.fishdata.Exp + "/" + data.MaxExp;
        }, 1)
    }
    //修改鱼塘
    OnChanggeaquariumClick() {
        let pre = QSSZG_GameManager.Instance.GetFishNodeForFishData(this.fishdata);
        if (pre) {
            QSSZG_GameManager.Instance.selectfish = this.fishdata;
            QSSZG_GameManager.Instance.selectfishNode = pre;
            QSSZG_GameManager.Instance.OnChanggeaquariumClick();
        } else {
            console.log("出现错误，没有找到对应鱼苗");
        }
    }
    //出售
    OnsellFishClick() {
        let pre = QSSZG_GameManager.Instance.GetFishNodeForFishData(this.fishdata);
        if (pre) {
            QSSZG_GameManager.Instance.selectfish = this.fishdata;
            QSSZG_GameManager.Instance.selectfishNode = pre;
            QSSZG_GameManager.Instance.sellFish();
            this.node.destroy();
        } else {
            console.log("出现错误，没有找到对应鱼苗");
        }
    }
    DeleteFish(Fishdata: FishData) {
        if (this.fishdata == Fishdata) {
            QSSZG_EventManager.off(QSSZG_MyEvent.DeleteFish);
            this.node.destroy();
        }
    }
}


