import assert from "node:assert/strict";
import test from "node:test";
import { createEditorDraftStore, draftPrefix, legacyDraftKey } from "../examples/status-demo/editor-drafts.mjs";

function memory(entries = []) {
  const values = new Map(entries);
  return { get length() { return values.size; }, key: index => [...values.keys()][index] ?? null,
    getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
}
const project = name => ({ name, fields: [{ id:"field", target:"entity", entityId:"sun.sun",
  rawCard: { type:"conditional", conditions:[{condition:"state",entity:"sun.sun",state_not:["unknown"]}], card:{type:"entity",entity:"sun.sun",name:"  Sun  "} } }],
  surfaceSize:{columns:2,rows:3},gridCellSize:52,scriptFilename:"literal.js" });
const id = number => number.toString(16).padStart(32,"0");
const make = (storage, session, number) => createEditorDraftStore({ storage, session, createId:()=>id(number), now:()=>1792598400000 });

test("two tabs never overwrite each other's draft; reloaded tabs select their own recovery source", () => {
  const storage=memory(),sessionA=memory(),sessionB=memory(),a=make(storage,sessionA,1),b=make(storage,sessionB,2);
  a.save(project("A unsaved"));b.save(project("B unsaved"));a.save(project("A newest"));
  const reloadA=make(storage,sessionA,3),reloadB=make(storage,sessionB,4);
  assert.equal(reloadA.preferredId(),id(1));assert.equal(reloadB.preferredId(),id(2));
  assert.deepEqual(reloadA.read(reloadA.preferredId()).project,project("A newest"));
  assert.deepEqual(reloadB.read(reloadB.preferredId()).project,project("B unsaved"));
  assert.equal(storage.length,2);assert.equal(reloadA.list().filter(x=>x.current)[0].id,id(1));
  reloadA.save(reloadA.read(id(1)).project);b.save(project("B next"));
  assert.equal(reloadA.preferredId(),id(3));assert.equal(a.read(id(1)).project.name,"A newest");
  assert.equal(reloadA.read(id(3)).project.name,"A newest");assert.equal(b.read(id(2)).project.name,"B next");
});

test("duplicated session pointers fork on write and do not claim another tab's writable record", () => {
  const storage=memory(),session=memory(),a=make(storage,session,1);a.save(project("Original"));
  const copied=memory(Array.from({length:session.length},(_,i)=>[session.key(i),session.getItem(session.key(i))]));
  const duplicate=make(storage,copied,2);duplicate.save(project("Duplicate"));a.save(project("Original next"));
  assert.equal(duplicate.read(id(2)).project.name,"Duplicate");assert.equal(a.read(id(1)).project.name,"Original next");
  assert.equal(make(storage,copied,3).preferredId(),id(2));assert.equal(make(storage,session,4).preferredId(),id(1));
});

test("legacy draft stays byte-identical and can be copied into an independent draft without credentials", () => {
  const legacy=JSON.stringify({expertCardName:"Legacy",expertEditorFields:project("X").fields,expertGridCellSize:52,
    expertEditorSurfaceSize:{columns:0,rows:0},cardScriptFilename:"old.js",token:"never-copy",url:"private-admin"});
  const storage=memory([[legacyDraftKey,legacy]]),store=make(storage,memory(),1);
  assert.equal(store.preferredId(),"legacy");const loaded=store.read("legacy").project;store.save({...loaded,token:"never-copy"});
  assert.equal(storage.getItem(legacyDraftKey),legacy);assert.equal(store.read(id(1)).project.name,"Legacy");
  assert.ok(!storage.getItem(draftPrefix+id(1)).includes("never-copy"));assert.ok(!storage.getItem(draftPrefix+id(1)).includes("private-admin"));
});

test("unreadable records remain intact and do not hide other drafts; copies cannot mutate stored raw card data", () => {
  const storage=memory([[draftPrefix+id(9),"broken"],[legacyDraftKey,"broken legacy"]]),store=make(storage,memory(),1);
  store.save(project("Nested"));const loaded=store.read(id(1));loaded.project.fields[0].rawCard.card.name="changed";
  assert.equal(store.read(id(1)).project.fields[0].rawCard.card.name,"  Sun  ");assert.equal(store.list().length,1);
  assert.equal(storage.getItem(draftPrefix+id(9)),"broken");assert.equal(storage.getItem(legacyDraftKey),"broken legacy");
});

test("quota and invalid input cannot destroy drafts or advance the tab recovery pointer", () => {
  const storage=memory(),session=memory(),store=make(storage,session,1);store.save(project("Keep"));
  const prior=storage.getItem(draftPrefix+id(1)),write=storage.setItem;storage.setItem=()=>{throw new Error("quota");};
  assert.throws(()=>store.save(project("Failed")),/quota/);assert.equal(storage.getItem(draftPrefix+id(1)),prior);
  assert.equal(make(storage,session,2).preferredId(),id(1));storage.setItem=write;
  assert.throws(()=>store.save({name:"Bad",fields:[null]}));assert.equal(storage.getItem(draftPrefix+id(1)),prior);
});

test("without session storage, independent persistent drafts remain explicitly recoverable", () => {
  const storage=memory(),session={getItem(){throw Error("blocked");},setItem(){throw Error("blocked");}};
  const store=make(storage,session,1);store.save(project("Manual recovery"));
  const reload=make(storage,session,2);assert.equal(reload.preferredId(),undefined);
  assert.equal(reload.read(reload.list()[0].id).project.name,"Manual recovery");
});
