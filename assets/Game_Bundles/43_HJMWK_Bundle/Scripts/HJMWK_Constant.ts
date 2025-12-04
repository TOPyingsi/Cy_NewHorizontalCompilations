export enum HJMWK_SKIN {
    哈基米,
    皇家卫队长,
    魅影战甲,
}

export enum HJMWK_CURRENCY {
    红宝石,
    绿宝石,
    金币,
    钻石,
}

export enum HJMWK_PROPERTY {
    挖矿伤害,
    挖矿速度,
    移动速度,
}

export enum HJMWK_PROP {
    木镐,
    石镐,
    铁镐,
    石英镐,
    合金镐,
    金镐,
    莹石镐,
    钻石镐,
    水方镐,
    火方镐,
    刚玉镐,
    巨人镐,
    星尘镐,
    星泪镐,
    晶簇镐,
    泰坦镐,
    炎晶镐,
    烈炎镐,
    熔火镐,
    精金镐,
    血镰镐,
    赤丹镐,
    赤金镐,
    霓虹镐,
    龙岩镐,
    龙晶镐,
}

export enum HJMWK_CUBE {
    null,
    土块,
    石块,
    煤块,
    铜块,
    铁块,
    青金块,
    红石块,
    绿钻,
    金块,
    红宝石,
    钻石,
    紫水晶,
}

export const HJMWK_GradePrice: HJMWK_Upgrade[] = [
    {
        currency: HJMWK_CURRENCY.红宝石,
        need: 800,
    } as HJMWK_Upgrade,
    {
        currency: HJMWK_CURRENCY.红宝石,
        need: 1280,
    } as HJMWK_Upgrade,
    {
        currency: HJMWK_CURRENCY.绿宝石,
        need: 800,
    } as HJMWK_Upgrade,
    {
        currency: HJMWK_CURRENCY.绿宝石,
        need: 1280,
    } as HJMWK_Upgrade,
    {
        currency: HJMWK_CURRENCY.金币,
        need: 800,
    } as HJMWK_Upgrade,
    {
        currency: HJMWK_CURRENCY.金币,
        need: 1280,
    } as HJMWK_Upgrade,
    {
        currency: HJMWK_CURRENCY.钻石,
        need: 20,
    } as HJMWK_Upgrade,
    {
        currency: HJMWK_CURRENCY.钻石,
        need: 800,
    } as HJMWK_Upgrade,
    {
        currency: HJMWK_CURRENCY.钻石,
        need: 1280,
    } as HJMWK_Upgrade,
    {
        currency: HJMWK_CURRENCY.钻石,
        need: 10000,
    } as HJMWK_Upgrade
];

export class HJMWK_Upgrade {
    public currency: HJMWK_CURRENCY;
    public need: number;

    constructor(currency: HJMWK_CURRENCY, need: number) {
        this.currency = currency;
        this.need = need;
    }
}

