export interface Relation {
  model: string
  call: string
  related: string
  reverse?: Relation
}

let models = require('./models.json');

// 1.2 <3> 4.5
let relation_pairs: {left: Relation, right: Relation}[] = models.relations.map(relation => {
  return relation.match(/([^\.\s]+)\.([^\.\s]+)\s*(\<?\>?|=)\s*([^\.\s]+)\.([^\.\s]+)/);
}).filter(r => r).map(relation => {
  let left: Relation = {
    model: relation[1],
    call: relation[2],
    related: relation[4]
  };

  let right: Relation = {
    model: relation[4],
    call: relation[5],
    related: relation[1],
    reverse: left
  };

  left.reverse = right;

  return {
    left: left,
    right: right
  };
});

export function Model(type: string): any {
  let relations = relation_pairs.reduce((relations, relation_pair) => {
    if(relation_pair.left.model === type) {
      relations.push(relation_pair.left);
    }

    if(relation_pair.right.model === type) {
      relations.push(relation_pair.right);
    }

    return relations;
  }, []);

  return (constructor?: Function) => {
    constructor.prototype.relations = relations;
  }
}
