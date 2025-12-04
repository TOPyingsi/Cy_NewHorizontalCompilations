import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('JJHZ_CardData')
export class JJHZ_CardData {

    private static cards = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    public static get Cards(): number[] {
        if (localStorage.getItem("JJHZ_Cards") == "" || localStorage.getItem("JJHZ_Cards") == null) localStorage.setItem("JJHZ_Cards", JSON.stringify(this.cards));
        this.cards = JSON.parse(localStorage.getItem("JJHZ_Cards"));
        return this.cards;
    }


    public static set Cards(value: number[]) {
        this.cards = value;
        localStorage.setItem("JJHZ_Cards", JSON.stringify(this.cards));
    }

}
