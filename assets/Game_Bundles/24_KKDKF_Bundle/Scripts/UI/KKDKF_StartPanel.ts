import { _decorator, Component, director, find, game, native, Node, tween, v3, Vec3 } from 'cc';
import { KKDKF_AudioManager } from '../KKDKF_AudioManager';
import { KKDKF_LoadingPanel } from './KKDKF_LoadingPanel';
const { ccclass, property } = _decorator;

@ccclass('KKDKF_StartPanel')
export class KKDKF_StartPanel extends Component {
    public static IsOnCe: boolean = true;//是否第一次到主页
    start() {
        //------广告-------------------------------------------------
        //-------------------------------------------------

        game.frameRate = 59;
        KKDKF_AudioManager.Init();
        this.OnStartGameButtonClick();
    }

    OnStartGameButtonClick() {
        this.node.getChildByName("LoadingPanel").active = true;
        this.node.getChildByName("LoadingPanel").getComponent(KKDKF_LoadingPanel).Show("KKDKF_Game");

    }



}


