import { _decorator, AudioClip, AudioSource, Component, director, log, Node, resources } from 'cc';


const { ccclass, property } = _decorator;

@ccclass('GML_AudioManager')
export class GML_AudioManager extends Component {
    private static instance: GML_AudioManager;

    @property(AudioClip)
    audioClips: AudioClip[] = [];

    public MusicAudioSource: AudioSource = null;
    public SoundAudioSource: AudioSource = null;
    private clips: Map<string, AudioClip>;

    // 单例模式
    public static getInstance(): GML_AudioManager {
        if (!GML_AudioManager.instance) {
            // 查找场景中是否已存在GameManager节点
            const existingNode = director.getScene().getChildByName('GameManager');
            if (existingNode) {
                GML_AudioManager.instance = existingNode.getComponent(GML_AudioManager);
            } else {
                // 如果不存在，则创建新节点并添加组件
                const gameManagerNode = new Node('GameManager');
                director.getScene().addChild(gameManagerNode);
                GML_AudioManager.instance = gameManagerNode.addComponent(GML_AudioManager);
            }
        }
        return GML_AudioManager.instance;
    }

    protected onLoad(): void {
        GML_AudioManager.instance = this;
        this.init(this.audioClips, this.getComponents(AudioSource)[0], this.getComponents(AudioSource)[1]);
    }


    public init(clips: AudioClip[], musicAudioSource: AudioSource, soundAudioSource: AudioSource) {
        this.clips = new Map();
        clips.forEach(clip => {
            this.clips.set(clip.name, clip);
        });

        this.MusicAudioSource = musicAudioSource;
        this.SoundAudioSource = soundAudioSource;

        if (this.MusicAudioSource) {
            this.MusicAudioSource.volume = 0.4;
        }
        if (this.SoundAudioSource) {
            this.SoundAudioSource.volume = 1;
        }
    }

    playSound(clipName: string) {
        const clip = this.clips.get(clipName);
        if (clip) {
            this.SoundAudioSource.playOneShot(clip);
        }
    }

    stopSound() {
        if (this.SoundAudioSource) {
            this.SoundAudioSource.stop();
        }
    }

    playLongSound(clipName: string) {
        const clip = this.clips.get(clipName);
        if (clip) {
            this.SoundAudioSource.loop = true;
            if (!this.SoundAudioSource.clip || this.SoundAudioSource.clip.name != clipName) {
                this.SoundAudioSource.stop();
                this.SoundAudioSource.clip = clip;
            }

            this.SoundAudioSource.play();
        }
    }

    stopLongSound() {
        if (this.SoundAudioSource) {
            this.SoundAudioSource.stop();
            this.SoundAudioSource.loop = false;
        }
    }

    playMusic(clipName: string) {
        const clip = this.clips.get(clipName);
        if (clip) {
            if (this.MusicAudioSource.clip && this.MusicAudioSource.clip.name == clipName && this.MusicAudioSource.playing) {
                return;
            }
            if (!this.MusicAudioSource.clip || this.MusicAudioSource.clip.name != clipName) {
                this.MusicAudioSource.stop();
                this.MusicAudioSource.clip = clip;
            }

            this.MusicAudioSource.play();
        }
    }



    stopMusic() {
        if (this.MusicAudioSource) {
            this.MusicAudioSource.stop();
        }
    }
}




