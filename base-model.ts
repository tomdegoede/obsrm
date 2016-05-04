import {FirebaseObjectObservable} from "angularfire2";
import {ModelService} from '.';

export type ModelType<T extends BaseModel<T>> = T;

export abstract class BaseModel<T extends BaseModel<T>> {
  abstract path():string;

  protected _ref:Firebase;

  constructor(protected service:ModelService<T>) {

  }

  setRef(ref:Firebase) {
    this._ref = ref;
  }

  get ref() {
    return this._ref;
  }

  observable():FirebaseObjectObservable<any> {
    return this.service.database().object(
      this._ref
    );
  }

  child(path:string): Firebase {
    return this._ref.child(path);
  }

  private mergeObject(a, b) {
    // Object.assign breaks getters because it only copies values.
    // let o = Object.assign({}, a, b);

    let o:any = {};
    let p;

    for (let i in a) {
      if (p = Object.getOwnPropertyDescriptor(a, i)) {
        Object.defineProperty(o, i, p);
      }
    }
    for (let i in b) {
      if (p = Object.getOwnPropertyDescriptor(b, i)) {
        Object.defineProperty(o, i, p);
      }
    }

    let ap = Object.getPrototypeOf(a);
    let bp = Object.getPrototypeOf(b);

    if (ap || bp) {
      Object.setPrototypeOf(o, this.mergeObject(ap || {}, bp || {}));
    }

    return o;
  }

  withObservable():T & FirebaseObjectObservable<any> {
    return this.mergeObject(this, this.observable());
  }
}
