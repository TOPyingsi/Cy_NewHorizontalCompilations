import { _decorator, Component, Node, v3, Event, Label, UIOpacity, math, Color, EventTouch, tween, Tween, SpriteFrame, Sprite } from 'cc';
import { PanelBase } from 'db://assets/Scripts/Framework/UI/PanelBase';
import { Tools } from 'db://assets/Scripts/Framework/Utils/Tools';
import { SJZGMMT_UIManager } from '../SJZGMMT_UIManager';
import { SJZGMMT_Constant } from '../SJZGMMT_Constant';
import { SJZGMMT_vessel } from '../SJZGMMT_vessel';
import { SJZGMMT_AudioManager } from '../SJZGMMT_AudioManager';
import { SJZGMMT_Office2Box } from '../SJZGMMT_Office2Box';

const { ccclass, property } = _decorator;

const v3_0 = v3(0, 0, 0);

@ccclass('SJZGMMT_OfficePanel2')
export class SJZGMMT_OfficePanel2 extends PanelBase {
    @property({ type: [SpriteFrame] })
    public SpriteFrames: SpriteFrame[] = [];
    @property({ type: [SpriteFrame] })
    public ShineSpriteFrames: SpriteFrame[] = [];
    private index: number = 0;//随机到的图样
    public static indexData: number[] = [-1, -1, -1, -1];//每个槽位内的数据
    private CallBack: Function = null;
    protected onLoad(): void {
    }
    protected start(): void {
        this.node.on("解开机关", this.Over, this)
    }
    Show(...args: any[]) {//参数0为成功回调
        super.Show(this.node.getChildByName("框"));
        this.CallBack = args[0];
        this.Init();
    }
    //初始化
    Init() {
        //随机化
        SJZGMMT_OfficePanel2.indexData = [-1, -1, -1, -1];
        let nd = this.node.getChildByPath("框/符文存放槽");
        let num = nd.children.length;
        for (let i = 0; i < num; i++) {
            nd.children[0].getComponent(SJZGMMT_Office2Box).Extrusion();
        }
        this.node.getChildByPath("框/符文").children[0].setSiblingIndex(Math.floor(Math.random() * num));
        this.node.getChildByPath("框/符文").children[1].setSiblingIndex(Math.floor(Math.random() * num));

        //图像随机化
        this.index = Math.floor(Math.random() * this.ShineSpriteFrames.length);
        for (let i = 0; i < 4; i++) {
            this.node.getChildByPath("框/符文/符文" + i).getComponent(Sprite).spriteFrame = this.SpriteFrames[this.index * 4 + i];
        }
        this.node.getChildByPath("框/龙纹/图").getComponent(Sprite).spriteFrame = this.ShineSpriteFrames[this.index];

    }
    Over() {
        if (SJZGMMT_OfficePanel2.indexData[0] == 0 && SJZGMMT_OfficePanel2.indexData[1] == 1 && SJZGMMT_OfficePanel2.indexData[2] == 2 && SJZGMMT_OfficePanel2.indexData[3] == 3) {
            this.PlayLongwen();
            SJZGMMT_AudioManager.globalAudioPlay("石门打开");
            this.PlayLongwen();
        } else {
            SJZGMMT_UIManager.Instance.ShowText("解开机关失败！");
            this.Close();
        }
    }
    private tween: Tween<UIOpacity> = null;
    //播放龙纹动画
    PlayLongwen() {
        let nd = this.node.getChildByPath("框/龙纹/图");
        nd.active = true;
        nd.getComponent(UIOpacity).opacity = 0;
        this.tween = tween(nd.getComponent(UIOpacity))
            .to(0.4, { opacity: 255 })
            .to(0.4, { opacity: 0 })
            .to(0.4, { opacity: 255 })
            .delay(1.5)
            .call(() => {
                if (this.CallBack) this.CallBack();
                this.Close();
            })
            .start();
    }


    //关闭
    Close() {
        if (this.tween) { this.tween.stop(); }
        this.node.getChildByPath("框/龙纹/图").active = false;
        SJZGMMT_UIManager.Instance.HidePanel(SJZGMMT_Constant.Panel.OfficePanel2);
    }
}


