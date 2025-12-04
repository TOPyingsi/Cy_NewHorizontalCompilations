import { sys } from "cc";

export default class MTRNX_PrefsUtil {

    public jsonData: { [key: string]: any } = {};

    public static ClearData() {
        sys.localStorage.clear();
    }

    public static GetItem(key: string) {
        return sys.localStorage.getItem(key);
    }

    public static SetItem(key: string, value: any) {
        sys.localStorage.setItem(key, value.toString());
    }

    public static GetBool(key: string) {
        return Boolean(sys.localStorage.getItem(`${key}`));
    }

    public static SetBool(key: string, value: boolean) {
        sys.localStorage.setItem(key, Number(value).toString());
    }

    public static SetNumber(key: string, value: number) {
        sys.localStorage.setItem(key, value.toString());
    }

    public static GetNumber(key: string, defaultValue: number = 0) {
        if (!sys.localStorage.getItem(key) || !Number(sys.localStorage.getItem(key))) {
            return defaultValue;
        }
        return Number(sys.localStorage.getItem(key));
    }

}