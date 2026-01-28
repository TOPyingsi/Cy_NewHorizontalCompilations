import { _decorator, Component, Label, Node, Sprite, SpriteFrame } from 'cc';
import { SJZXD_UIManager } from './SJZXD_UIManager';
import { SJZXD_GameData } from './SJZXD_GameData';
import { SJZXD_Constant } from './SJZXD_Constant';
import { SJZXD_Incident } from './SJZXD_Incident';
import { SJZXD_EventManager } from './SJZXD_EventManager';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_PropBox')
export class SJZXD_PropBox extends Component {
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
        SJZXD_UIManager.Instance.SJZXD_On(SJZXD_EventManager.仓库物品变动, (propName: string, num: number) => {
            if (propName == this.PropName) {
                this.refresh();
            }
        });
    }
    Show(Name: string, custompropnum: number = -1, ismessageBox: boolean = false) {
        this.custompropnum = custompropnum;
        this.ismessageBox = ismessageBox;
        this.PropName = Name;
        SJZXD_UIManager.Instance.GetPropSprite(this.PropName).then((sp: SpriteFrame) => {
            this.node.getChildByName("道具图").getComponent(Sprite).spriteFrame = sp;
        })
        this.Quality = SJZXD_Constant.QuaLityList[SJZXD_Constant.getPropDataByName(this.PropName).quality];
        SJZXD_Incident.LoadSprite("Sprites/仓库/" + this.Quality).then((sp: SpriteFrame) => {
            this.node.getChildByName("Bg").getComponent(Sprite).spriteFrame = sp;
        })
        this._Price = SJZXD_Constant.getPropDataByName(this.PropName).price;
        this.node.getChildByName("价值").getComponent(Label).string = SJZXD_Incident.GetMaxNum(this._Price);
        this.node.getChildByName("道具名").getComponent(Label).string = this.PropName;
        this.refresh();
    }
    refresh() {
        if (this.custompropnum != -1) {//自定义数量显示
            this._label.string = `X${this.custompropnum}`;
            return;
        }
        this.PropNum = SJZXD_GameData.Instance.getWarehouseNum(this.PropName);
        if (this.PropNum > 0) {
            this.node.active = true;
        } else {
            this.node.active = false;
        }
        this._label.string = `X${this.PropNum}`;


    }

    OnClick() {
        if (!this.ismessageBox) {
            SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.PropMessagePanel, [this.PropName]);
        } else {
            SJZXD_UIManager.Instance.ShowPanel(SJZXD_Constant.Panel.PropMessagePanel2, [this.PropName]);
        }
    }

}


