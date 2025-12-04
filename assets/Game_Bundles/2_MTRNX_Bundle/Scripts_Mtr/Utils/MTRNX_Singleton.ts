export default class MTRNX_Singleton {
    public static GetInstance<T extends {}>(this: new () => T): T {
        if (!(<any>this).Instance) {
            (<any>this).Instance = new this();
        }
        return (<any>this).Instance;
    }
}