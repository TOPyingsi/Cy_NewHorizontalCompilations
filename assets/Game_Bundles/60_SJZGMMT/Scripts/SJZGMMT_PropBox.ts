import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { SJZGMMT_UIManager } from './SJZGMMT_UIManager';
import { SJZGMMT_GameData } from './SJZGMMT_GameData';
import { SJZGMMT_Constant } from './SJZGMMT_Constant';
import { SJZGMMT_Incident } from './SJZGMMT_Incident';
import { SJZGMMT_EventManager } from './SJZGMMT_EventManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_PropBox')
export class SJZGMMT_PropBox extends Component {
    public PropName: string = "";//道具名字
    public PropNum: number = 0;//道具数量
    private Quality: string = "";
    private _label: Label = null;
    private _Price: number = 0;
    private ismessageBox: boolean = false;//点击是否纯信息框
    private custompropnum: number = -1;//显示的数量（自定义数量）
    protected onLoad(): void {
        this._label = this.node.getChildByName("数量").getComponent(Label);
    }
    protected start(): void {
        SJZGMMT_UIManager.Instance.SJZGMMT_On(SJZGMMT_EventManager.仓库物品变动, (propName: string, num: number) => {
            if (propName == this.PropName) {
                this.refresh();
            }
        });
    }
    Show(Name: string, custompropnum: number = -1, ismessageBox: boolean = false) {
        this.custompropnum = custompropnum;
        this.ismessageBox = ismessageBox;
        this.PropName = Name;
        SJZGMMT_UIManager.Instance.GetPropSprite(this.PropName).then((sp: SpriteFrame) => {
            this.node.getChildByName("道具图").getComponent(Sprite).spriteFrame = sp;
        })
        this.Quality = SJZGMMT_Constant.QuaLityList[SJZGMMT_Constant.getPropDataByName(this.PropName).quality];
        SJZGMMT_Incident.LoadSprite("Sprites/仓库/" + this.Quality).then((sp: SpriteFrame) => {
            this.node.getChildByName("Bg").getComponent(Sprite).spriteFrame = sp;
        })
        this._Price = SJZGMMT_Constant.getPropDataByName(this.PropName).price;
        this.node.getChildByName("价值").getComponent(Label).string = SJZGMMT_Incident.GetMaxNum(this._Price);
        this.node.getChildByName("道具名").getComponent(Label).string = this.PropName;
        this.refresh();
    }
    refresh() {
        if (this.custompropnum != -1) {//自定义数量显示
            this._label.string = `X${this.custompropnum}`;
            return;
        }
        this.PropNum = SJZGMMT_GameData.Instance.getWarehouseNum(this.PropName);
        if (this.PropNum > 0) {
            this.node.active = true;
        } else {
            this.node.active = false;
        }
        this._label.string = `X${this.PropNum}`;


    }

    OnClick() {
        if (!this.ismessageBox) {
            SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.PropMessagePanel, [this.PropName]);
        } else {
            SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.PropMessagePanel2, [this.PropName]);
        }
    }

}


