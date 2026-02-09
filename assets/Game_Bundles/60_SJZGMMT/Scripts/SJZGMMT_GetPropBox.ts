import { _decorator, Color, Component, director, Label, Node, Sprite, SpriteFrame, Tween, tween, v3 } from 'cc';
import { SJZGMMT_Constant, SJZGMMT_PropDataItem, SJZGMMT_Quality } from './SJZGMMT_Constant';
import { SJZGMMT_Incident } from './SJZGMMT_Incident';
import { SJZGMMT_UIManager } from './SJZGMMT_UIManager';
import { SJZGMMT_EventManager } from './SJZGMMT_EventManager';
import { SJZGMMT_GameData } from './SJZGMMT_GameData';
import { SJZGMMT_GameManager } from './SJZGMMT_GameManager';
import { SJZGMMT_PoolManager } from './SJZGMMT_PoolManager';
import { SJZGMMT_AudioManager } from './SJZGMMT_AudioManager';
const { ccclass, property } = _decorator;

@ccclass('SJZGMMT_GetPropBox')
export class SJZGMMT_GetPropBox extends Component {
    public Name: string = "";
    public Quality: string = "";
    private Isobserve: boolean = false;
    private propdata: { Name: string, Isobserve: boolean } = null;
    private PropData: SJZGMMT_PropDataItem = null;
    private static _searchTime: number[] = [1, 1.3, 1.5, 1.8, 2.2, 2.8, 3.5];
    private static _color: Color[] = [
        new Color(255, 255, 255, 150),
        new Color(0, 255, 0, 150),
        new Color(0, 150, 255, 150),
        new Color(255, 0, 220, 150),
        new Color(255, 220, 0, 150),
        new Color(255, 0, 0, 150),
        new Color(255, 255, 255, 150)
    ]
    Init(propdata: { Name: string, Isobserve: boolean }) {
        this.Isobserve = propdata.Isobserve;
        this.Name = propdata.Name;
        this.propdata = propdata;
        this.PropData = SJZGMMT_Constant.getPropDataByName(this.Name);
        this.node.getChildByName("放大镜").active = false;
        this.node.getChildByName("特效").active = false;
        let data = SJZGMMT_Constant.getPropDataByName(this.Name);
        this.node.getChildByPath("道具图/名字").getComponent(Label).string = data.Name;
        this.node.getChildByPath("道具图/价值").getComponent(Label).string = SJZGMMT_Incident.GetMaxNum(data.price);
        SJZGMMT_UIManager.Instance.GetPropSprite(this.Name).then((sp: SpriteFrame) => {
            this.node.getChildByName("道具图").getComponent(Sprite).spriteFrame = sp;
        })
        this.Quality = SJZGMMT_Constant.QuaLityList[SJZGMMT_Constant.getPropDataByName(this.Name).quality];
        SJZGMMT_Incident.LoadSprite("Sprites/仓库/" + this.Quality).then((sp: SpriteFrame) => {
            this.node.getChildByName("品质框").getComponent(Sprite).spriteFrame = sp;
        })
        this.IsSearchEnd();
    }
    start() {

    }
    protected onEnable(): void {
        this.node.getChildByName("特效").children.forEach(item => {//特效初始化清楚
            item.scale = v3(0.5, 0.5, 1);
        });
    }

    //判断是否搜索完毕显示
    IsSearchEnd() {
        if (this.Isobserve) {
            this.node.getChildByName("品质框").active = true;
            this.node.getChildByName("道具图").active = true;
        } else {
            this.node.getChildByName("品质框").active = false;
            this.node.getChildByName("道具图").active = false;
        }
    }

    //开始搜索
    StartSearch() {
        this.node.getChildByName("放大镜").active = true;
        this.scheduleOnce(() => {
            this.node.getChildByName("放大镜").active = false;
            this.PlayEffect();
            this.PlayAudio();
            this.Isobserve = true;
            this.IsSearchEnd();
            this.IsExpression();
            this.propdata.Isobserve = true;
            SJZGMMT_UIManager.Instance.SJZGMMT_Emit(SJZGMMT_EventManager.道具搜索完毕);
            console.log("道具搜索完毕");
        }, SJZGMMT_GetPropBox._searchTime[this.PropData.quality])
    }


    //播放特效
    public PlayEffect() {
        let nd = this.node.getChildByName("特效");
        this.node.getChildByName("特效").children.forEach(item => {
            Tween.stopAllByTarget(item);
            item.scale = v3(0.5, 0.5, 1);
            item.getComponent(Sprite).color = SJZGMMT_GetPropBox._color[this.PropData.quality];
        });
        this.node.getChildByName("特效").active = true;
        this.node.getChildByName("特效").children.forEach((item, index) => {
            tween(item)
                .delay(index * 0.1 - 0.1)
                .to(0.5, { scale: v3(1 + (index * 0.07), 1 + (index * 0.07), 1) }, { easing: "backOut" })
                .call(() => {
                    item.scale = v3(0.5, 0.5, 1);
                })
                .start();
        });
    }

    //点击
    OnClick() {
        if (!this.propdata.Isobserve) return;
        if (SJZGMMT_GameData.Instance.GetKnapsackWeight() + this.PropData.weight > SJZGMMT_GameManager.Instance.knapsackCapacity) {
            SJZGMMT_UIManager.Instance.ShowText("背包容量已满！");
            if (SJZGMMT_GameManager.Instance.IsAddknapsackCapacity == false) {//如果背包没扩容过弹出扩容界面
                SJZGMMT_UIManager.Instance.ShowPanel(SJZGMMT_Constant.Panel.AddknapsackCapacityPanel);
            }
        } else {
            if (SJZGMMT_GameData.Instance.pushKnapsackData(this.Name)) {//已经成功添加到背包
                SJZGMMT_PoolManager.Instance.Put(this.node);
                SJZGMMT_UIManager.Instance.SJZGMMT_Emit(SJZGMMT_EventManager.搜索框移除小框, this.propdata);
            } else {
                SJZGMMT_UIManager.Instance.ShowText("添加背包失败");
            }
        }
    }
    //播放音效
    PlayAudio() {
        if (this.Quality == "白色" || this.Quality == "绿色" || this.Quality == "蓝色") {
            SJZGMMT_AudioManager.globalAudioPlay("蓝");
        }
        if (this.Quality == "紫色" || this.Quality == "金色") {
            SJZGMMT_AudioManager.globalAudioPlay("紫");
        }
        if (this.Quality == "红色" || this.Quality == "炫彩") {
            SJZGMMT_AudioManager.globalAudioPlay("红");
        }
    }

    //判断表情包
    public IsExpression() {
        let num = Math.floor(Math.random() * 100);
        if (this.Quality == "红色") num += 100;
        if (num < 60) return;
        if (this.Quality == "白色" || this.Quality == "绿色" || this.Quality == "蓝色") {
            SJZGMMT_UIManager.Instance.SJZGMMT_Emit(SJZGMMT_EventManager.表情包展示, "难过")
        }
        if (this.Quality == "紫色" || this.Quality == "金色") {

            SJZGMMT_UIManager.Instance.SJZGMMT_Emit(SJZGMMT_EventManager.表情包展示, "一般")
        }
        if (this.Quality == "红色" || this.Quality == "炫彩") {
            SJZGMMT_UIManager.Instance.SJZGMMT_Emit(SJZGMMT_EventManager.表情包展示, "开心")
        }
    }

    protected onDisable(): void {
        this.unscheduleAllCallbacks();
    }


}


