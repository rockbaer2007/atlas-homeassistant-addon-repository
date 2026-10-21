import assert from "node:assert/strict";
import test from "node:test";
import { createEditorDraftStore, draftPrefix, legacyDraftKey, pendingDraftKey } from "../examples/status-demo/editor-drafts.mjs";

function memory(entries = []) {
  const values = new Map(entries);
  return { get length() { return values.size; }, key: index => [...values.keys()][index] ?? null,
    getItem: key => values.get(key) ?? null, setItem: (key, value) => values.set(key, value), removeItem: key => values.delete(key) };
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
  const store=make(storage,session,1);assert.equal(store.save(project("Manual recovery")).sessionRecoveryAvailable,false);
  const reload=make(storage,session,2);assert.equal(reload.preferredId(),undefined);
  assert.equal(reload.read(reload.list()[0].id).project.name,"Manual recovery");
});

test("interrupted record write offers only the matching tab intent, retaining the confirmed predecessor", () => {
  const storage=memory(),sessionA=memory(),sessionB=memory();
  make(storage,sessionA,1).save(project("A confirmed"));
  make(storage,sessionB,2).save(project("B confirmed"));
  const original=storage.setItem;
  storage.setItem=(key,value)=>{original(key,value);if(key===draftPrefix+id(3))throw Error("process terminated after record write");};
  assert.throws(()=>make(storage,sessionA,3).save(project("A next")),/terminated/);
  storage.setItem=original;
  const restoredA=make(storage,sessionA,4),restoredB=make(storage,sessionB,5);
  assert.equal(restoredA.preferredId(),id(3));assert.equal(restoredA.recovery().name,"A next");
  assert.deepEqual(restoredA.read(id(3)).project,project("A next"));
  assert.deepEqual(restoredA.read(id(1)).project,project("A confirmed"));
  assert.equal(restoredB.preferredId(),id(2));assert.equal(restoredB.recovery(),undefined);
  assert.equal(make(storage,memory(),6).preferredId(),undefined);
  assert.equal(restoredA.list().find(x=>x.current).id,id(3));
  restoredA.save(restoredA.read(id(3)).project);
  assert.equal(restoredA.preferredId(),id(4));assert.equal(restoredA.recovery(),undefined);
  assert.equal(sessionA.getItem(pendingDraftKey),null);
  assert.deepEqual(restoredA.read(id(3)).project,project("A next"));
});

test("absent, broken, mismatched and foreign pending records never replace the confirmed selection", () => {
  const storage=memory(),session=memory();make(storage,session,1).save(project("Keep"));
  make(storage,memory(),2).save(project("Foreign"));
  const stamp=JSON.parse(storage.getItem(draftPrefix+id(2))).updatedAt;
  for(const marker of ["broken",JSON.stringify({version:2,id:id(2),previousId:id(1),updatedAt:stamp}),
    JSON.stringify({version:1,id:id(2),previousId:id(9),updatedAt:stamp}),
    JSON.stringify({version:1,id:id(9),previousId:id(1),updatedAt:stamp}),
    JSON.stringify({version:1,id:id(2),previousId:id(1),updatedAt:"2000-01-01T00:00:00.000Z"})]) {
    session.setItem(pendingDraftKey,marker);const reload=make(storage,session,3);
    assert.equal(reload.preferredId(),id(1));assert.equal(reload.recovery(),undefined);
    assert.equal(session.getItem(pendingDraftKey),marker);
  }
  storage.setItem(draftPrefix+id(9),"broken");
  session.setItem(pendingDraftKey,JSON.stringify({version:1,id:id(9),previousId:id(1),updatedAt:stamp}));
  assert.equal(make(storage,session,3).preferredId(),id(1));
});

test("pre-write failure keeps predecessor; a post-pointer crash creates no false recovery offer", () => {
  const storage=memory(),session=memory();make(storage,session,1).save(project("Keep"));
  const write=storage.setItem;storage.setItem=()=>{throw Error("quota");};
  assert.throws(()=>make(storage,session,2).save(project("Not written")),/quota/);
  assert.equal(make(storage,session,3).preferredId(),id(1));storage.setItem=write;
  session.removeItem=()=>{throw Error("process ended after pointer");};
  make(storage,session,4).save(project("Confirmed next"));
  const reload=make(storage,session,5);assert.equal(reload.preferredId(),id(4));
  assert.equal(reload.recovery(),undefined);
});

test("first write and unavailable pointer updates retain an explicitly recoverable intent without relying on wall-clock order", () => {
  const storage=memory(),session=memory(),set=session.setItem;
  session.setItem=(key,value)=>{if(key===legacyDraftKey+".tab")throw Error("pointer blocked");set(key,value);};
  assert.equal(make(storage,session,1).save(project("First interrupted")).sessionRecoveryAvailable,false);
  const reload=make(storage,session,2);assert.equal(reload.preferredId(),id(1));
  assert.equal(reload.recovery().name,"First interrupted");
  assert.ok(!session.getItem(pendingDraftKey).includes("fields"));
  session.setItem=set;reload.save(project("Confirmed"));
  const store=createEditorDraftStore({storage,session,createId:()=>id(3),now:()=>1});
  const write=storage.setItem;storage.setItem=(key,value)=>{write(key,value);throw Error("crash");};
  assert.throws(()=>store.save(project("Later generation with earlier clock")),/crash/);
  assert.equal(make(storage,session,4).preferredId(),id(3));
});

test("successful local save confirms intent and pointer without persisting transient warning state", () => {
  const storage=memory(),session=memory(),store=make(storage,session,1);
  const result=store.save(project("Confirmed"));assert.equal(result.sessionRecoveryAvailable,true);
  assert.deepEqual(result.project,project("Confirmed"));assert.equal(session.getItem(pendingDraftKey),null);
  assert.equal(Object.hasOwn(JSON.parse(storage.getItem(draftPrefix+id(1))),"sessionRecoveryAvailable"),false);
});

for(const failure of ["quota","blocked","read-blocked","silent-write","missing-session"])test(`session ${failure} reports partial recovery while preserving the complete local record`, () => {
  const storage=memory();let session=memory();
  if(failure==="missing-session")session=undefined;
  else if(failure==="read-blocked")session.getItem=()=>{throw Error("read blocked");};
  else if(failure==="silent-write")session.setItem=()=>{};
  else session.setItem=()=>{throw Object.assign(Error(failure),{name:failure==="quota"?"QuotaExceededError":"SecurityError"});};
  const store=make(storage,session,1),result=store.save(project("Preserved"));
  assert.equal(result.sessionRecoveryAvailable,false);assert.deepEqual(result.project,project("Preserved"));
  assert.deepEqual(make(storage,memory(),2).read(id(1)).project,project("Preserved"));
});

test("failed intent is reported even if an existing same-size pointer can still be updated", () => {
  const storage=memory(),session=memory();make(storage,session,1).save(project("Old"));
  const set=session.setItem;session.setItem=(key,value)=>{if(key===pendingDraftKey)throw Error("intent quota");set(key,value);};
  const result=make(storage,session,2).save(project("New"));assert.equal(result.sessionRecoveryAvailable,false);
  assert.equal(make(storage,session,3).preferredId(),id(2));
  assert.equal(JSON.parse(storage.getItem(draftPrefix+id(1))).project.name,"Old");
});

test("cleanup-only failure is harmless; a restored session clears partial status on the next successful save", () => {
  const storage=memory(),session=memory(),store=make(storage,session,1),set=session.setItem;
  session.setItem=()=>{throw Error("blocked");};assert.equal(store.save(project("Partial")).sessionRecoveryAvailable,false);
  session.setItem=set;session.removeItem=()=>{throw Error("cleanup blocked");};
  assert.equal(store.save(project("Complete")).sessionRecoveryAvailable,true);
  assert.equal(make(storage,session,2).recovery(),undefined);
  assert.deepEqual(make(storage,session,2).read(id(1)).project,project("Complete"));
  const original=storage.getItem(draftPrefix+id(1));storage.setItem=()=>{throw Error("local quota");};
  assert.throws(()=>store.save(project("Not saved")),/local quota/);
  assert.equal(storage.getItem(draftPrefix+id(1)),original);
});
