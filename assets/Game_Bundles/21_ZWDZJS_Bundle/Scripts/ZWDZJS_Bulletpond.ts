import { _decorator, Component, instantiate, Node } from 'cc';
import ZWDZJS_GameManager from './ZWDZJS_GameManager';
const { ccclass, property } = _decorator;


const InstanceNumber: number = 20;//预生成每种子弹20个

@ccclass('ZWDZJS_Bulletpond')
export default class ZWDZJS_Bulletpond extends Component {
    //    //子弹池
    public BulletMap: Node[][] = [];
    private static _instance: ZWDZJS_Bulletpond = null;
    public static get Instance(): ZWDZJS_Bulletpond {
        if (!this._instance) {
            this._instance = new ZWDZJS_Bulletpond();
        }
        return this._instance;
    }
    onLoad() {
        ZWDZJS_Bulletpond._instance = this;
    }
    start() {
        this.Init();
    }
    //    //初始化
    Init() {
        for (let i = 0; i < ZWDZJS_GameManager.Instance.ZiDanPre.length; i++) {
            this.BulletMap.push(new Array<Node>);
            for (let j = 0; j < InstanceNumber; j++) {
                this.BulletMap[i].push(instantiate(ZWDZJS_GameManager.Instance.ZiDanPre[i]));
                this.BulletMap[i][j].active = false;
            }
            console.log(this.BulletMap);

        }
    }
    //    //获取子弹(参数是子弹id)
    Getbullet(index: number): Node {
        for (let i = 0; i < this.BulletMap[index].length; i++) {
            if (this.BulletMap[index][i].active == false) {
                this.BulletMap[index][i].active = true;
                return this.BulletMap[index][i];
            }
        }
        let pre = instantiate(ZWDZJS_GameManager.Instance.ZiDanPre[index]);
        this.BulletMap[index].push(pre)
        pre.active = true;
        return pre;
    }
}


