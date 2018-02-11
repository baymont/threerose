export default class ObjectHelper {
    public static deepCopy<T>(obj: T): T {
        let copy: T;
    
        // Handle the 3 simple types, and null or undefined
        if (null == obj || "object" != typeof obj) return obj;
    
        // Handle Date
        if (obj instanceof Date) {
            copy = new Date() as any as T;
            (copy as any as Date).setTime(obj.getTime());
            return copy;
        }
    
        // Handle Array
        if (obj instanceof Array) {
            copy = [] as any as T;
            for (var i = 0, len = obj.length; i < len; i++) {
                (copy as any as Array<any>)[i] = this.deepCopy(obj[i]);
            }
            return copy;
        }
    
        // Handle Object
        if (obj instanceof Object) {
            copy = {} as any as T;
            for (var attr in obj) {
                if (obj.hasOwnProperty(attr)) copy[attr] = this.deepCopy(obj[attr]);
            }
            return copy;
        }
    
        throw new Error("Unable to copy obj! Its type isn't supported.");
    }
}