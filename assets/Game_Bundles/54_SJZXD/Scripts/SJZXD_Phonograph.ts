import { _decorator, AudioClip, AudioSource, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SJZXD_Phonograph')
export class SJZXD_Phonograph extends Component {
    @property({ type: [AudioClip] })
    Audios: AudioClip[] = [];
    private _audioID: number = 0;
    private _audioSource: AudioSource = null;
    protected start(): void {
        this._audioSource = this.getComponent(AudioSource);
        this._audioID = Math.floor(Math.random() * this.Audios.length);
        this.OnClick();
    }
    OnClick() {
        this._audioID++;
        if (this._audioID >= this.Audios.length) {
            this._audioID = 0;
        }
        this._audioSource.stop();
        this._audioSource.clip = this.Audios[this._audioID];
        this._audioSource.play();
    }

}


