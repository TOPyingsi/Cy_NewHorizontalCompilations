import { _decorator, Component, instantiate, Node, Prefab, screen, Size, tween, Vec3, view, Widget } from 'cc';
import { DWBQB_UISelect } from './DWBQB_UISelect';
import { ProjectEvent, ProjectEventManager } from 'db://assets/Scripts/Framework/Managers/ProjectEventManager';
import { Panel, UIManager } from 'db://assets/Scripts/Framework/Managers/UIManager';
import { GameManager } from 'db://assets/Scripts/GameManager';
const { ccclass, property } = _decorator;

@ccclass('DWBQB_UIDisplay')
export class DWBQB_UIDisplay extends Component {

    @property(Node)
    more: Node;

    private _isUIDisplay: boolean = false;
    private ovoleftUI: boolean = true;
    private _isCowSpawned: boolean = false;
    private _isBearSpawned: boolean = false;
    private _isTigerSpawned: boolean = false;
    private _isMonkeySpawned: boolean = false;
    @property([Prefab])
    private rolePrefabs: Prefab[] = [];
    private spawnedRole: Node[] = [];

    protected onLoad(): void {
        ProjectEventManager.emit(ProjectEvent.初始化更多模式按钮, this.more);
        ProjectEventManager.emit(ProjectEvent.游戏开始, "OUO表情");
    }

    start() {

    }
    update(deltaTime: number) {

    }
    //控制UI的显示和隐藏，按钮触发。
    onUIDisplay() {
        const right = this._isUIDisplay ? -150 : 0;
        const rightDown = this._isUIDisplay ? -720 : 0;
        const left = this._isUIDisplay ? -150 : 0;
        // let rightUI = this.node.getChildByName("右UI");
        let rightUI = this.node.getChildByName("右UI").getComponent(Widget);
        let rightDownUI = this.node.getChildByName("右下UI").getComponent(Widget);
        let leftUI = this.node.getChildByName("左UI").getComponent(Widget);
        this._isUIDisplay = !this._isUIDisplay;
        tween(rightUI)
            .to(0.3, { right: right }, { easing: 'quadInOut', })
            .start();
        tween(rightDownUI)
            .to(0.3, { right: rightDown }, { easing: 'quadInOut', })
            .start();
        this.onLeftUI(leftUI, left);
    }

    onLeftUI(targetUI: Widget, left: number) {
        if (this.ovoleftUI) {
            tween(targetUI)
                .to(0.3, { left: left }, { easing: 'quadInOut', })
                .start();
            this.node.getChildByName("左UI").getChildByName("Node").getComponent(DWBQB_UISelect).AllClose();
        }
        if (!this.ovoleftUI) {
            tween(targetUI)
                .to(0.3, { left: -150 }, { easing: 'quadInOut', })
                .start();
            this.node.getChildByName("左UI").getChildByName("Node").getComponent(DWBQB_UISelect).AllClose();
        }
    }

    cow() {
        if (this._isCowSpawned) return;
        this.onUIDisplay();
        this.ovoleftUI = false;
        this._isCowSpawned = true;
        this._isBearSpawned = false;
        this._isTigerSpawned = false;
        this._isMonkeySpawned = false;
        this.spawnedRole.forEach(role => {
            if (role.isValid) {
                role.destroy();
            }
        });
        this.spawnedRole = [];
        let roleNode = instantiate(this.rolePrefabs[1]);
        this.spawnedRole.push(roleNode);
        this.node.parent.addChild(roleNode);
        roleNode.setSiblingIndex(this.node.parent.children.length - 2);
        roleNode.setPosition(0, 16.34, 0);
        this.node.parent.getChildByName("大脸").active = false;
    }
    bear() {
        if (this._isBearSpawned) return;
        this.onUIDisplay();
        this.ovoleftUI = false;
        this._isBearSpawned = true;
        this._isCowSpawned = false;
        this._isTigerSpawned = false;
        this._isMonkeySpawned = false;
        this.spawnedRole.forEach(role => {
            if (role.isValid) {
                role.destroy();
            }
        });
        this.spawnedRole = [];
        let roleNode = instantiate(this.rolePrefabs[0]);
        this.spawnedRole.push(roleNode);
        this.node.parent.addChild(roleNode);
        roleNode.setSiblingIndex(this.node.parent.children.length - 2);
        roleNode.setPosition(0, 16.34, 0);
        this.node.parent.getChildByName("大脸").active = false;
    }
    tiger() {
        if (this._isTigerSpawned) return;
        this.onUIDisplay();
        this.ovoleftUI = false;
        this._isTigerSpawned = true;
        this._isCowSpawned = false;
        this._isBearSpawned = false;
        this._isMonkeySpawned = false;
        this.spawnedRole.forEach(role => {
            if (role.isValid) {
                role.destroy();
            }
        });
        this.spawnedRole = [];
        let roleNode = instantiate(this.rolePrefabs[3]);
        this.spawnedRole.push(roleNode);
        this.node.parent.addChild(roleNode);
        roleNode.setSiblingIndex(this.node.parent.children.length - 2);
        roleNode.setPosition(0, 16.34, 0);
        this.node.parent.getChildByName("大脸").active = false;
    }
    monkey() {
        if (this._isMonkeySpawned) return;
        this.onUIDisplay();
        this.ovoleftUI = false;
        this._isMonkeySpawned = true;
        this._isCowSpawned = false;
        this._isBearSpawned = false;
        this._isTigerSpawned = false;
        this.spawnedRole.forEach(role => {
            if (role.isValid) {
                role.destroy();
            }
        });
        this.spawnedRole = [];
        let roleNode = instantiate(this.rolePrefabs[2]);
        this.spawnedRole.push(roleNode);
        this.node.parent.addChild(roleNode);
        roleNode.setSiblingIndex(this.node.parent.children.length - 2);
        roleNode.setPosition(0, 16.34, 0);
        this.node.parent.getChildByName("大脸").active = false;
    }
    ovo() {
        this.ovoleftUI = true;
        this._isCowSpawned = false;
        this._isBearSpawned = false;
        this._isTigerSpawned = false;
        this._isMonkeySpawned = false;
        this.onUIDisplay();
        this.node.parent.getChildByName("大脸").active = true;
        this.spawnedRole.forEach(role => {
            if (role.isValid) {
                role.destroy();
            }
        });
        this.spawnedRole = [];
    }

    startWindows() {
        this.node.getChildByName("开局弹窗").active = false;
    }

    Back() {
        ProjectEventManager.emit(ProjectEvent.返回主页按钮事件, () => {
            UIManager.ShowPanel(Panel.LoadingPanel, GameManager.StartScene, () => {
                ProjectEventManager.emit(ProjectEvent.返回主页, "OUO表情");
            });
        });
    }

}


