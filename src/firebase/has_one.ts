import {HasOne} from '../interface/has_one.interface';
import {Observable} from "rxjs";
import {FirebaseConnection} from './firebase.connection';
import {Relation} from '../model.service';
import {BaseModel} from '../base_model';
import {MultiLocationUpdate} from './multi_location_update';

export class FirebaseHasOne<T extends BaseModel<any>> extends Observable<T> implements HasOne<T> {

  constructor(protected source: Observable<any>, protected model: BaseModel<any>, protected relation: Relation) {
    super();
  }

  updateOrCreate(val: {}): MultiLocationUpdate|Observable<any> {
    let model_ref = FirebaseConnection.getRef(this.model);
    let related = this.model.ms.model(this.relation.related);

    return this.take(1).map(r => {
      let key = r ? r.key() : model_ref.child(`r/${this.relation.call}`).push().key;

      let create = related.updateOrCreate(val, key);

      // Existed so no need to link
      if(r) {
        return create;
      }

      let link = this.link(key);

      // Merge upd statements for atomic Firebase update when they both originate from firebase connections
      if(create instanceof MultiLocationUpdate && link instanceof MultiLocationUpdate) {
        return create.add(link);
      }

      return Observable.combineLatest(create, link)
        .map(v => v[0]);
    }).switch();
  }

  link(key: string): MultiLocationUpdate|Observable<any> {
    let model_ref = FirebaseConnection.getRef(this.model);

    let upd = new MultiLocationUpdate(model_ref.root);
    upd.add(model_ref.child(`r/${this.relation.call}/${key}`), true);

    if(this.relation.reverse.call) {
      let related = this.model.ms.model(this.relation.related);

      let reverse = related.get(key).getRelation(
        this.relation.reverse.call
      ).link(this.model.key());

      // TODO prevent infinite recursion by only calling reverse once
      // Use link inside the collection method after this

      // Merge upd statements for atomic Firebase update when they both originate from firebase connections
      if(reverse instanceof MultiLocationUpdate) {
        return upd.add(reverse);
      }

      // Otherwise we just combine two observables
      return Observable.combineLatest(upd, reverse);
    }

    return upd;
  }
}
