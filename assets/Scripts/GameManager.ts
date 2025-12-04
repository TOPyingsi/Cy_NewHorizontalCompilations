import { _decorator, Component, director, Node, PhysicsSystem2D, sys } from 'cc';
import { GameData } from './Framework/Managers/DataManager';
import Banner from './Banner';
import { PhysicsManager } from './Framework/Managers/PhysicsManager';
const { ccclass, property } = _decorator;

//所有游戏的总管理脚本
@ccclass('GameManager')
export class GameManager extends Component {

    static Instance: GameManager = null;

    //**是否显示所有的游戏 */
    static ShowAllGame: boolean = false;

    //**当前游戏的数据 */
    static GameData: GameData = null;

    //**游戏的总开始场景 */
    static StartScene: string = `Start`;

    protected onLoad(): void {
        GameManager.Instance = this;
        director.addPersistRootNode(this.node);
        PhysicsSystem2D.instance.debugDrawFlags = 0;

        this.InitPools();
    }

    start() {
        Banner.Instance.Init();
    }

    InitPools() {

    }

}