import {HasOne} from '../interface/has_one.interface';
import {Observable} from "rxjs";
import {FirebaseConnection} from './firebase.connection';
import {Relation} from '../model.service';
import {BaseModel} from '../base_model';
import {MultiLocationUpdate} from './multi_location_update';

export class FirebaseHasOne<T> extends Observable<T> implements HasOne<T> {

  constructor(protected source: Observable<any>, protected model: BaseModel<any>, protected relation: Relation) {
    super();
  }

  link(key: string): Observable<any> {
    let model_ref = FirebaseConnection.getRef(this.model);

    let upd = new MultiLocationUpdate(model_ref.root);
    upd.add(model_ref.child(`r/${this.relation.call}/${key}`), true);

    if(this.relation.reverse.call) {
      let related = this.model.ms.model(this.relation.related);

      let reverse = related.get(key).getRelation(
        this.relation.reverse.call
      ).link(this.model.key());

      // Merge upd statements for atomic Firebase update when they both originate from firebase connections
      if(reverse instanceof MultiLocationUpdate) {
        upd.add(reverse);
      }

      // Otherwise we just combine two observables
      return Observable.combineLatest(upd, reverse);
    }

    return upd;
  }
}
