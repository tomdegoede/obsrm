import { Observable } from 'rxjs/Observable';
import { Operator } from 'rxjs/Operator';
import {FirebaseListFactory, FirebaseListObservable} from "angularfire2";
import {ModelService} from './model.service';

export class FirebaseRelationListObservable<T> extends FirebaseListObservable<T> {
  // Cant use _ref because super is using it. Super should declare it protected.
  protected __ref: Firebase;

  constructor(_ref: Firebase, protected related_model_service: ModelService<any>, protected reverse: string) {
    super(null, _ref);
    this.__ref = _ref;
    this.source = FirebaseListFactory(_ref);
  }
  
  lift<T, R>(operator: Operator<T, R>): Observable<R> {
    const observable = new FirebaseRelationListObservable<R>(this.__ref, this.related_model_service, this.reverse);
    observable.source = this;
    observable.operator = operator;
    return observable;
  }

  push(val: any): FirebaseWithPromise<void> {
    // TODO get a ref to the parent model instead of assuming its the direct parent
    if(this.reverse) {
      if(val[this.reverse] === undefined) {
        val[this.reverse] = {};
      }
      val[this.reverse][this.__ref.parent().key()] = true;
    }

    let ref = super.push(true);

    this.related_model_service.updateOrCreate(
      val, ref.key()
    );
    
    return ref;
  }
}
