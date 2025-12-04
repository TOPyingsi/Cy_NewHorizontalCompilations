import { _decorator, Component, Node, Slider, ProgressBar, director, SpriteFrame, Sprite, UITransform } from 'cc';
import { BHPD_GameMgr } from '../BHPD_GameMgr';
import { ZSTSB_Incident } from '../../ZSTSB_Incident';
const { ccclass, property } = _decorator;

@ccclass('BHPD_ScaleSlider')
export class BHPD_ScaleSlider extends Component {
    @property(ProgressBar)
    progressBar: ProgressBar = null;

    @property(Slider)
    slider: Slider = null;

    start() {

        director.getScene().on("八花拼豆_进度条图片", this.changeSliderSprite, this);

        // 初始化时同步slider和progressBar的值
        if (this.slider && this.progressBar) {
            this.slider.progress = 0;
            this.progressBar.progress = this.slider.progress;

            // 添加滑动事件监听
            // this.slider.node.on('slide', this.onSliderChanged, this);
        }
    }

    preMapName: string = "";
    changeSliderSprite() {
        let handle = this.slider.node.getChildByName("Handle");
        handle.getComponent(Sprite).sizeMode = Sprite.SizeMode.TRIMMED;

        const mapName = BHPD_GameMgr.instance.curMapID;

        if (this.preMapName === mapName) {
            return;
        }

        const path = "Sprites/八花拼豆/关卡/" + mapName + "最终";
        ZSTSB_Incident.LoadSprite(path).then((sp: SpriteFrame) => {

            handle.getComponent(Sprite).spriteFrame = sp;

            let uiTrans = handle.getComponent(UITransform);
            uiTrans.width = uiTrans.width / 4;
            uiTrans.height = uiTrans.height / 4;

            this.preMapName = mapName;
        });
    }

    /**
     * 当滑动条值改变时调用此方法
     * @param slider 滑动条组件
     */
    onSliderChanged() {
        console.log("改变Slider的值", this.slider.progress);

        if (this.progressBar) {
            this.progressBar.progress = this.slider.progress;
            director.getScene().emit("八花拼豆_放缩", this.slider.progress)
        }
    }

    /**
     * 直接设置滑动条和进度条的值
     * @param value 进度值 (0-1)
     */
    setProgress(value: number) {
        if (this.slider) {
            this.slider.progress = value;
        }
        if (this.progressBar) {
            this.progressBar.progress = value;
        }
    }
}