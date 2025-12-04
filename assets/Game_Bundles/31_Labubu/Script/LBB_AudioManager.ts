import { _decorator, AudioClip, Component, Director, director } from 'cc';
import { PLAY_AUDIO } from './LBB_Event';
import { AUDIO_ENUM, EVENT_ENUM, SCENE_ENUM } from './LBB_Enum';
import { AudioManager } from 'db://assets/Scripts/Framework/Managers/AudioManager';
const { ccclass, property } = _decorator;

@ccclass('LBB_AudioManager')
export class LBB_AudioManager extends Component {

    @property(AudioClip) button: AudioClip = null;
    @property(AudioClip) gameBGM: AudioClip = null;
    @property(AudioClip) wearMask: AudioClip = null;
    @property(AudioClip) elect: AudioClip = null;
    @property(AudioClip) monitor: AudioClip = null;
    @property(AudioClip) role1BGM: AudioClip = null;
    @property(AudioClip) role2BGM: AudioClip = null;
    @property(AudioClip) attack: AudioClip = null;
    @property(AudioClip) wrong: AudioClip = null;
    @property(AudioClip) win: AudioClip = null;
    @property(AudioClip) fail: AudioClip = null;

    protected onLoad(): void {
        director.addPersistRootNode(this.node);

        director.on(Director.EVENT_AFTER_SCENE_LAUNCH, this.EVENT_AFTER_SCENE_LAUNCH, this);
        PLAY_AUDIO.on(EVENT_ENUM.PLAY_AUDIO, this.PLAY_AUDIO, this);
    }

    EVENT_AFTER_SCENE_LAUNCH() {
        const currentScene = director.getScene()?.name;
        console.log("当前场景", currentScene);
        if (currentScene == SCENE_ENUM.GAME) {
            AudioManager.Instance.StopBGM();
            AudioManager.Instance.PlayBGM(this.gameBGM);
        } else if (currentScene == SCENE_ENUM.LBB) {
            AudioManager.Instance.StopBGM();
        }
    }

    PLAY_AUDIO(type: AUDIO_ENUM) {
        console.log("播放音频", type);
        switch (type) {
            case AUDIO_ENUM.BUTTON:
                AudioManager.Instance.PlaySFX(this.button);
                break;
            case AUDIO_ENUM.ElectFlow:
                AudioManager.Instance.PlaySFX(this.elect);
                break;
            case AUDIO_ENUM.WEAR_MASK:
                AudioManager.Instance.PlaySFX(this.wearMask);
                break;
            case AUDIO_ENUM.MONITOR:
                AudioManager.Instance.PlaySFX(this.monitor);
                break;
            case AUDIO_ENUM.ROLE1:
                AudioManager.Instance.PlaySFX(this.role1BGM);
                break;
            case AUDIO_ENUM.ROLE2:
                AudioManager.Instance.PlaySFX(this.role2BGM);
                break;
            case AUDIO_ENUM.WRONG:
                AudioManager.Instance.PlaySFX(this.wrong);
                break;
            case AUDIO_ENUM.ATTACK:
                AudioManager.Instance.PlaySFX(this.attack);
                break;
        }
    }
}


