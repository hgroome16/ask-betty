'use strict';
// Every inherited browser record is namespaced to this independent demo.
const bettyStorageGet=Storage.prototype.getItem,bettyStorageSet=Storage.prototype.setItem,bettyStorageRemove=Storage.prototype.removeItem;
Storage.prototype.getItem=function(k){return bettyStorageGet.call(this,'ask-betty:'+k)};Storage.prototype.setItem=function(k,v){return bettyStorageSet.call(this,'ask-betty:'+k,v)};Storage.prototype.removeItem=function(k){return bettyStorageRemove.call(this,'ask-betty:'+k)};
