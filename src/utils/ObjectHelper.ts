export default class ObjectHelper {
  public static cloneDeep<T>(obj: T): T {
    // tslint:disable:no-any
    let copy: T;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || 'object' !== typeof obj) { return obj; }

    // Handle Date
    if (obj instanceof Date) {
      copy = new Date() as any as T;
      (copy as any as Date).setTime(obj.getTime());
      return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
      copy = [] as any as T;
      for (let i = 0, len = obj.length; i < len; i++) {
        (copy as any as any[])[i] = this.cloneDeep(obj[i]);
      }
      return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
      copy = {} as any as T;
      for (const attr in obj) {
        if (obj.hasOwnProperty(attr)) { copy[attr] = this.cloneDeep(obj[attr]); }
      }
      return copy;
    }
    // tslint:enable:no-any

    throw new Error("Unable to copy obj! Its type isn't supported.");
  }
}
