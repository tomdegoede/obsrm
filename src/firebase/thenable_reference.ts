export class ThenableReference implements firebase.database.ThenableReference {
  get key() {
    return this.reference.key;
  }
  get root() {
    return this.reference.root;
  }
  get parent() {
    return this.reference.parent;
  }
  get ref() {
    return this.reference.ref;
  }

  constructor(private thenable: firebase.Thenable<any>, private reference: firebase.database.Reference) {
    
  }

  catch(onReject?: (a: Error)=>any): any {
    return this.thenable.catch.apply(this, arguments);
  }

  then(onResolve?: (a: any)=>any, onReject?: (a: Error)=>any): firebase.Thenable<any> {
    return this.thenable.then.apply(this, arguments);
  }

  endAt(value: number|string|boolean|any, key?: string): firebase.database.Query {
    return this.reference.endAt.apply(this, arguments);
  }

  equalTo(value: number|string|boolean|any, key?: string): firebase.database.Query {
    return this.reference.equalTo.apply(this, arguments);
  }

  limitToFirst(limit: number): firebase.database.Query {
    return this.reference.limitToFirst.apply(this, arguments);
  }

  limitToLast(limit: number): firebase.database.Query {
    return this.reference.limitToLast.apply(this, arguments);
  }

  off(eventType?: string, callback?: (a: firebase.database.DataSnapshot, b?: (string|any))=>any, context?: Object|any): any {
    return this.reference.off.apply(this, arguments);
  }

  on(eventType: string, callback: (a: (firebase.database.DataSnapshot|any), b?: string)=>any, cancelCallbackOrContext?: Object|any, context?: Object|any): (a: (firebase.database.DataSnapshot|any), b?: string)=>any {
    return this.reference.on.apply(this, arguments);
  }

  once(eventType: string, successCallback?: (a: firebase.database.DataSnapshot, b?: string)=>any, failureCallbackOrContext?: Object|any, context?: Object|any): firebase.Promise<any> {
    return this.reference.once.apply(this, arguments);
  }

  orderByChild(path: string): firebase.database.Query {
    return this.reference.orderByChild.apply(this, arguments);
  }

  orderByKey(): firebase.database.Query {
    return this.reference.orderByKey.apply(this, arguments);
  }

  orderByPriority(): firebase.database.Query {
    return this.reference.orderByPriority.apply(this, arguments);
  }

  orderByValue(): firebase.database.Query {
    return this.reference.orderByValue.apply(this, arguments);
  }

  startAt(value: number|string|boolean|any, key?: string): firebase.database.Query {
    return this.reference.startAt.apply(this, arguments);
  }

  child(path: string): firebase.database.Reference {
    return this.reference.child.apply(this, arguments);
  }

  onDisconnect(): firebase.database.OnDisconnect {
    return this.reference.onDisconnect.apply(this, arguments);
  }

  push(value?: any, onComplete?: (a: (Error|any))=>any): firebase.database.ThenableReference {
    return this.reference.push.apply(this, arguments);
  }

  remove(onComplete?: (a: (Error|any))=>any): firebase.Promise<any> {
    return this.reference.remove.apply(this, arguments);
  }

  set(value: any, onComplete?: (a: (Error|any))=>any): firebase.Promise<any> {
    return this.reference.set.apply(this, arguments);
  }

  setPriority(priority: string|number|any, onComplete: (a: (Error|any))=>any): firebase.Promise<any> {
    return this.reference.setPriority.apply(this, arguments);
  }

  setWithPriority(newVal: any, newPriority: string|number|any, onComplete?: (a: (Error|any))=>any): firebase.Promise<any> {
    return this.reference.setWithPriority.apply(this, arguments);
  }

  transaction(transactionUpdate: (a: any)=>any, onComplete?: (a: (Error|any), b: boolean, c: (firebase.database.DataSnapshot|any))=>any, applyLocally?: boolean): firebase.Promise<any> {
    return this.reference.transaction.apply(this, arguments);
  }

  update(values: Object, onComplete?: (a: (Error|any))=>any): firebase.Promise<any> {
    return this.reference.update.apply(this, arguments);
  }
}
