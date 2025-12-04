import { _decorator, Component, director, EventTouch, Node } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('HJMSJ_Start')
export class HJMSJ_Start extends Component {

    start() {

    }

    update(deltaTime: number) {

    }

    onBtnClick(event: EventTouch) {
        switch (event.target.name) {
            case "开始游戏":
                director.loadScene("HJMSJ_Game");
                break;
        }
    }
}


