import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

export class JB100T_DayData {

    constructor(
        public title: string,
        public description: string,
        public to: number,
        public hu: number,
        public ma: number,
        public am: number,
        public flee: boolean,
        public day: number,
        public choices: Array<number>,
        public img: string = ""
    ) {

    }

    static clone(obj: JB100T_DayData): JB100T_DayData {
        return new JB100T_DayData(
            obj.title, obj.description, obj.to, obj.hu, obj.ma, obj.am, obj.flee, obj.day, obj.choices, obj.img
        )
    }
}


