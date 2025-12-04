import { _decorator, Component, director, EventTouch, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('XSHY_Start')
export class XSHY_Start extends Component {
    start() {

    }



    OnbuttonClick(Btn: EventTouch) {
        switch (Btn.target.name) {
            case "对战":
                director.loadScene("XSHY_Game");
                break;

        }
    }

}


