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
    return this.thenable.catch.apply(this.thenable, arguments);
  }

  then(onResolve?: (a: any)=>any, onReject?: (a: Error)=>any): firebase.Thenable<any> {
    return this.thenable.then.apply(this.thenable, arguments);
  }

  endAt(value: number|string|boolean|any, key?: string): firebase.database.Query {
    return this.reference.endAt.apply(this.reference, arguments);
  }

  equalTo(value: number|string|boolean|any, key?: string): firebase.database.Query {
    return this.reference.equalTo.apply(this.reference, arguments);
  }

  limitToFirst(limit: number): firebase.database.Query {
    return this.reference.limitToFirst.apply(this.reference, arguments);
  }

  limitToLast(limit: number): firebase.database.Query {
    return this.reference.limitToLast.apply(this.reference, arguments);
  }

  off(eventType?: string, callback?: (a: firebase.database.DataSnapshot, b?: (string|any))=>any, context?: Object|any): any {
    return this.reference.off.apply(this.reference, arguments);
  }

  on(eventType: string, callback: (a: (firebase.database.DataSnapshot|any), b?: string)=>any, cancelCallbackOrContext?: Object|any, context?: Object|any): (a: (firebase.database.DataSnapshot|any), b?: string)=>any {
    return this.reference.on.apply(this.reference, arguments);
  }

  once(eventType: string, successCallback?: (a: firebase.database.DataSnapshot, b?: string)=>any, failureCallbackOrContext?: Object|any, context?: Object|any): firebase.Promise<any> {
    return this.reference.once.apply(this.reference, arguments);
  }

  orderByChild(path: string): firebase.database.Query {
    return this.reference.orderByChild.apply(this.reference, arguments);
  }

  orderByKey(): firebase.database.Query {
    return this.reference.orderByKey.apply(this.reference, arguments);
  }

  orderByPriority(): firebase.database.Query {
    return this.reference.orderByPriority.apply(this.reference, arguments);
  }

  orderByValue(): firebase.database.Query {
    return this.reference.orderByValue.apply(this.reference, arguments);
  }

  startAt(value: number|string|boolean|any, key?: string): firebase.database.Query {
    return this.reference.startAt.apply(this.reference, arguments);
  }

  child(path: string): firebase.database.Reference {
    return this.reference.child.apply(this.reference, arguments);
  }

  onDisconnect(): firebase.database.OnDisconnect {
    return this.reference.onDisconnect.apply(this.reference, arguments);
  }

  push(value?: any, onComplete?: (a: (Error|any))=>any): firebase.database.ThenableReference {
    return this.reference.push.apply(this.reference, arguments);
  }

  remove(onComplete?: (a: (Error|any))=>any): firebase.Promise<any> {
    return this.reference.remove.apply(this.reference, arguments);
  }

  set(value: any, onComplete?: (a: (Error|any))=>any): firebase.Promise<any> {
    return this.reference.set.apply(this.reference, arguments);
  }

  setPriority(priority: string|number|any, onComplete: (a: (Error|any))=>any): firebase.Promise<any> {
    return this.reference.setPriority.apply(this.reference, arguments);
  }

  setWithPriority(newVal: any, newPriority: string|number|any, onComplete?: (a: (Error|any))=>any): firebase.Promise<any> {
    return this.reference.setWithPriority.apply(this.reference, arguments);
  }

  transaction(transactionUpdate: (a: any)=>any, onComplete?: (a: (Error|any), b: boolean, c: (firebase.database.DataSnapshot|any))=>any, applyLocally?: boolean): firebase.Promise<any> {
    return this.reference.transaction.apply(this.reference, arguments);
  }

  update(values: Object, onComplete?: (a: (Error|any))=>any): firebase.Promise<any> {
    return this.reference.update.apply(this.reference, arguments);
  }
}
