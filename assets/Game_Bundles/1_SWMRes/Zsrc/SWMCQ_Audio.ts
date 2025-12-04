import { _decorator, Component, AudioClip, AudioSource, director } from "cc";
import Banner from "../../../Scripts/Banner";


const { ccclass, property } = _decorator;

@ccclass("AudioM")
export default class AudioM extends Component {

    public static get Instance(): AudioM {
        return this.instance;
    }

    private static instance: AudioM;


    @property(AudioClip)
    audio: AudioClip = null;

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        AudioM.instance = this;
    }

    start() {
    }

    // update (dt) {}

    ButtonAudio() {
        this.getComponent(AudioSource).playOneShot(this.audio);
        if (Banner.RegionMask) Banner.Instance.ShowCustomAd();
    }
}
