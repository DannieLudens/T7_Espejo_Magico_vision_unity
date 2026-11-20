var Sm = Object.defineProperty;
var Im = (e, n, t) => n in e ? Sm(e, n, { enumerable: !0, configurable: !0, writable: !0, value: t }) : e[n] = t;
var te = (e, n, t) => Im(e, typeof n != "symbol" ? n + "" : n, t);
function _m(e) {
  return typeof e == "function" && typeof e.delegate == "function";
}
function Zr(e, n) {
  let t;
  const a = (...r) => (typeof t < "u" || (t = n.apply(a.thisArg, r)), t);
  return a.delegate = n, a.thisArg = e, a;
}
const cd = (e) => Object.entries(e);
function R(e, n, t) {
  const a = Array.isArray(n) ? n : [], r = typeof n == "function" ? n : t;
  if (!r)
    throw new TypeError("[Injectable] Received invalid arguments. The factory function must be either the second or third argument.");
  if (r.length !== a.length)
    throw new TypeError(`[Injectable] Function arity does not match the number of dependencies. Function has arity ${r.length}, but ${a.length} dependencies were specified.
Dependencies: ${JSON.stringify(a)}`);
  const i = (...o) => r(...o);
  return i.token = e, i.dependencies = a, i;
}
function ld(e, n) {
  const t = (...a) => new n(...a);
  return t.token = e, t.dependencies = n.dependencies, t;
}
function gr(e, n, t) {
  const a = Array.isArray(n) ? n : [], r = typeof n == "function" ? n : t;
  if (!r)
    throw new TypeError("[ConcatInjectable] Received invalid arguments. The factory function must be either the second or third argument.");
  if (r.length !== a.length)
    throw new TypeError(`[Injectable] Function arity does not match the number of dependencies. Function has arity ${r.length}, but ${a.length} dependencies were specified.
Dependencies: ${JSON.stringify(a)}`);
  const i = (o, ...s) => o.concat(r(...s));
  return i.token = e, i.dependencies = [e, ...a], i;
}
class je {
  constructor(n) {
    te(this, "injectables");
    te(this, "providesValue", (n, t) => this.provides(R(n, [], () => t)));
    te(this, "providesClass", (n, t) => this.provides(ld(n, t)));
    this.injectables = n;
  }
  provides(n) {
    return new je({ ...this.injectables, [n.token]: n });
  }
  getFactories(n) {
    let t;
    return t = Object.fromEntries(cd(this.injectables).map(([a, r]) => [
      a,
      Zr(n, () => r(...r.dependencies.map((i) => i === a ? n.get(i) : t[i] ? t[i]() : n.get(i))))
    ]));
  }
  getTokens() {
    return Object.keys(this.injectables);
  }
}
const dd = "$container";
class he {
  constructor(n) {
    te(this, "factories");
    te(this, "providesClass", (n, t) => this.providesService(ld(n, t)));
    te(this, "providesValue", (n, t) => this.providesService(R(n, [], () => t)));
    te(this, "appendValue", (n, t) => this.providesService(gr(n, () => t)));
    te(this, "appendClass", (n, t) => this.providesService(gr(n, () => this.providesClass(n, t).get(n))));
    te(this, "append", (n) => this.providesService(gr(n.token, () => this.providesService(n).get(n.token))));
    const t = {};
    for (const a in n) {
      const r = n[a];
      _m(r) ? (t[a] = r, r.thisArg = this) : t[a] = Zr(this, r);
    }
    this.factories = t;
  }
  static provides(n) {
    return n instanceof je ? new he({}).provides(n) : n instanceof he ? new he({}).provides(n) : new he({}).provides(n);
  }
  static providesValue(n, t) {
    return new he({}).providesValue(n, t);
  }
  static fromObject(n) {
    return cd(n).reduce((t, [a, r]) => t.providesValue(a, r), new he({}));
  }
  copy(n) {
    const t = { ...this.factories };
    return (n || []).forEach((a) => {
      t[a] = this.factories[a].delegate;
    }), new he(t);
  }
  get(n) {
    if (n === dd)
      return this;
    const t = this.factories[n];
    if (!t)
      throw new Error(`[Container::get] Could not find Service for Token "${String(n)}". This should've caused a compile-time error. If the Token is 'undefined', check all your calls to the Injectable function. Make sure you define dependencies using string literals or string constants that are definitely initialized before the call to Injectable.`);
    return t();
  }
  run(n) {
    if (n instanceof je) {
      const t = this.provides(n);
      for (const a of n.getTokens())
        t.get(a);
    } else
      this.provides(n).get(n.token);
    return this;
  }
  provides(n) {
    if (n instanceof je || n instanceof he) {
      const t = n instanceof je ? n.getFactories(this) : n.factories;
      return new he({
        ...this.factories,
        ...t
      });
    }
    return this.providesService(n);
  }
  providesService(n) {
    const t = n.token, a = n.dependencies, r = a.indexOf(t) === -1 ? void 0 : () => this.get(t), i = Zr(this, function() {
      return n(...a.map((s) => s === t ? r() : this.get(s)));
    }), o = { ...this.factories, [t]: i };
    return new he(o);
  }
}
function Cn(e) {
  return Object.fromEntries(Object.entries(e).filter(([n, t]) => t !== void 0));
}
const At = "__snap_camkit_override__", Am = [
  "wasmEndpointOverride",
  "logger",
  "logLevel",
  "userAgentFlavor"
];
Am.forEach((e) => {
  Nm(e);
});
function Nm(e) {
  typeof window > "u" || Object.defineProperty(window, `${At}${e}`, {
    get() {
      var n;
      return (n = Zi()) === null || n === void 0 ? void 0 : n[e];
    },
    set(n) {
      const t = Object.assign(Object.assign({}, Zi()), { [e]: n });
      Object.values(t).every((a) => typeof a > "u") ? sessionStorage.removeItem(At) : sessionStorage.setItem(At, JSON.stringify(t));
    },
    enumerable: !1,
    configurable: !0
  });
}
function Zi() {
  if (!sessionStorage)
    return;
  const e = sessionStorage.getItem(At);
  return e && JSON.parse(e);
}
var Jr = function(e, n) {
  return Jr = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(t, a) {
    t.__proto__ = a;
  } || function(t, a) {
    for (var r in a) Object.prototype.hasOwnProperty.call(a, r) && (t[r] = a[r]);
  }, Jr(e, n);
};
function Fe(e, n) {
  if (typeof n != "function" && n !== null)
    throw new TypeError("Class extends value " + String(n) + " is not a constructor or null");
  Jr(e, n);
  function t() {
    this.constructor = e;
  }
  e.prototype = n === null ? Object.create(n) : (t.prototype = n.prototype, new t());
}
function Om(e, n) {
  var t = {};
  for (var a in e) Object.prototype.hasOwnProperty.call(e, a) && n.indexOf(a) < 0 && (t[a] = e[a]);
  if (e != null && typeof Object.getOwnPropertySymbols == "function")
    for (var r = 0, a = Object.getOwnPropertySymbols(e); r < a.length; r++)
      n.indexOf(a[r]) < 0 && Object.prototype.propertyIsEnumerable.call(e, a[r]) && (t[a[r]] = e[a[r]]);
  return t;
}
function Q(e, n, t, a, r, i) {
  function o(S) {
    if (S !== void 0 && typeof S != "function") throw new TypeError("Function expected");
    return S;
  }
  for (var s = a.kind, u = s === "getter" ? "get" : s === "setter" ? "set" : "value", c = !n && e ? a.static ? e : e.prototype : null, d = n || (c ? Object.getOwnPropertyDescriptor(c, a.name) : {}), m, l = !1, f = t.length - 1; f >= 0; f--) {
    var E = {};
    for (var v in a) E[v] = v === "access" ? {} : a[v];
    for (var v in a.access) E.access[v] = a.access[v];
    E.addInitializer = function(S) {
      if (l) throw new TypeError("Cannot add initializers after decoration has completed");
      i.push(o(S || null));
    };
    var p = (0, t[f])(s === "accessor" ? { get: d.get, set: d.set } : d[u], E);
    if (s === "accessor") {
      if (p === void 0) continue;
      if (p === null || typeof p != "object") throw new TypeError("Object expected");
      (m = o(p.get)) && (d.get = m), (m = o(p.set)) && (d.set = m), (m = o(p.init)) && r.unshift(m);
    } else (m = o(p)) && (s === "field" ? r.unshift(m) : d[u] = m);
  }
  c && Object.defineProperty(c, a.name, d), l = !0;
}
function ft(e, n, t) {
  for (var a = arguments.length > 2, r = 0; r < n.length; r++)
    t = a ? n[r].call(e, t) : n[r].call(e);
  return a ? t : void 0;
}
function O(e, n, t, a) {
  function r(i) {
    return i instanceof t ? i : new t(function(o) {
      o(i);
    });
  }
  return new (t || (t = Promise))(function(i, o) {
    function s(d) {
      try {
        c(a.next(d));
      } catch (m) {
        o(m);
      }
    }
    function u(d) {
      try {
        c(a.throw(d));
      } catch (m) {
        o(m);
      }
    }
    function c(d) {
      d.done ? i(d.value) : r(d.value).then(s, u);
    }
    c((a = a.apply(e, n || [])).next());
  });
}
function fd(e, n) {
  var t = { label: 0, sent: function() {
    if (i[0] & 1) throw i[1];
    return i[1];
  }, trys: [], ops: [] }, a, r, i, o = Object.create((typeof Iterator == "function" ? Iterator : Object).prototype);
  return o.next = s(0), o.throw = s(1), o.return = s(2), typeof Symbol == "function" && (o[Symbol.iterator] = function() {
    return this;
  }), o;
  function s(c) {
    return function(d) {
      return u([c, d]);
    };
  }
  function u(c) {
    if (a) throw new TypeError("Generator is already executing.");
    for (; o && (o = 0, c[0] && (t = 0)), t; ) try {
      if (a = 1, r && (i = c[0] & 2 ? r.return : c[0] ? r.throw || ((i = r.return) && i.call(r), 0) : r.next) && !(i = i.call(r, c[1])).done) return i;
      switch (r = 0, i && (c = [c[0] & 2, i.value]), c[0]) {
        case 0:
        case 1:
          i = c;
          break;
        case 4:
          return t.label++, { value: c[1], done: !1 };
        case 5:
          t.label++, r = c[1], c = [0];
          continue;
        case 7:
          c = t.ops.pop(), t.trys.pop();
          continue;
        default:
          if (i = t.trys, !(i = i.length > 0 && i[i.length - 1]) && (c[0] === 6 || c[0] === 2)) {
            t = 0;
            continue;
          }
          if (c[0] === 3 && (!i || c[1] > i[0] && c[1] < i[3])) {
            t.label = c[1];
            break;
          }
          if (c[0] === 6 && t.label < i[1]) {
            t.label = i[1], i = c;
            break;
          }
          if (i && t.label < i[2]) {
            t.label = i[2], t.ops.push(c);
            break;
          }
          i[2] && t.ops.pop(), t.trys.pop();
          continue;
      }
      c = n.call(e, t);
    } catch (d) {
      c = [6, d], r = 0;
    } finally {
      a = i = 0;
    }
    if (c[0] & 5) throw c[1];
    return { value: c[0] ? c[1] : void 0, done: !0 };
  }
}
function Fn(e) {
  var n = typeof Symbol == "function" && Symbol.iterator, t = n && e[n], a = 0;
  if (t) return t.call(e);
  if (e && typeof e.length == "number") return {
    next: function() {
      return e && a >= e.length && (e = void 0), { value: e && e[a++], done: !e };
    }
  };
  throw new TypeError(n ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function Se(e, n) {
  var t = typeof Symbol == "function" && e[Symbol.iterator];
  if (!t) return e;
  var a = t.call(e), r, i = [], o;
  try {
    for (; (n === void 0 || n-- > 0) && !(r = a.next()).done; ) i.push(r.value);
  } catch (s) {
    o = { error: s };
  } finally {
    try {
      r && !r.done && (t = a.return) && t.call(a);
    } finally {
      if (o) throw o.error;
    }
  }
  return i;
}
function Re(e, n, t) {
  if (t || arguments.length === 2) for (var a = 0, r = n.length, i; a < r; a++)
    (i || !(a in n)) && (i || (i = Array.prototype.slice.call(n, 0, a)), i[a] = n[a]);
  return e.concat(i || Array.prototype.slice.call(n));
}
function Vn(e) {
  return this instanceof Vn ? (this.v = e, this) : new Vn(e);
}
function Rm(e, n, t) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var a = t.apply(e, n || []), r, i = [];
  return r = Object.create((typeof AsyncIterator == "function" ? AsyncIterator : Object).prototype), s("next"), s("throw"), s("return", o), r[Symbol.asyncIterator] = function() {
    return this;
  }, r;
  function o(f) {
    return function(E) {
      return Promise.resolve(E).then(f, m);
    };
  }
  function s(f, E) {
    a[f] && (r[f] = function(v) {
      return new Promise(function(p, S) {
        i.push([f, v, p, S]) > 1 || u(f, v);
      });
    }, E && (r[f] = E(r[f])));
  }
  function u(f, E) {
    try {
      c(a[f](E));
    } catch (v) {
      l(i[0][3], v);
    }
  }
  function c(f) {
    f.value instanceof Vn ? Promise.resolve(f.value.v).then(d, m) : l(i[0][2], f);
  }
  function d(f) {
    u("next", f);
  }
  function m(f) {
    u("throw", f);
  }
  function l(f, E) {
    f(E), i.shift(), i.length && u(i[0][0], i[0][1]);
  }
}
function km(e) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var n = e[Symbol.asyncIterator], t;
  return n ? n.call(e) : (e = typeof Fn == "function" ? Fn(e) : e[Symbol.iterator](), t = {}, a("next"), a("throw"), a("return"), t[Symbol.asyncIterator] = function() {
    return this;
  }, t);
  function a(i) {
    t[i] = e[i] && function(o) {
      return new Promise(function(s, u) {
        o = e[i](o), r(s, u, o.done, o.value);
      });
    };
  }
  function r(i, o, s, u) {
    Promise.resolve(u).then(function(c) {
      i({ value: c, done: s });
    }, o);
  }
}
function V(e) {
  return typeof e == "function";
}
function La(e) {
  var n = function(a) {
    Error.call(a), a.stack = new Error().stack;
  }, t = e(n);
  return t.prototype = Object.create(Error.prototype), t.prototype.constructor = t, t;
}
var br = La(function(e) {
  return function(t) {
    e(this), this.message = t ? t.length + ` errors occurred during unsubscription:
` + t.map(function(a, r) {
      return r + 1 + ") " + a.toString();
    }).join(`
  `) : "", this.name = "UnsubscriptionError", this.errors = t;
  };
});
function Ji(e, n) {
  if (e) {
    var t = e.indexOf(n);
    0 <= t && e.splice(t, 1);
  }
}
var mt = function() {
  function e(n) {
    this.initialTeardown = n, this.closed = !1, this._parentage = null, this._finalizers = null;
  }
  return e.prototype.unsubscribe = function() {
    var n, t, a, r, i;
    if (!this.closed) {
      this.closed = !0;
      var o = this._parentage;
      if (o)
        if (this._parentage = null, Array.isArray(o))
          try {
            for (var s = Fn(o), u = s.next(); !u.done; u = s.next()) {
              var c = u.value;
              c.remove(this);
            }
          } catch (v) {
            n = { error: v };
          } finally {
            try {
              u && !u.done && (t = s.return) && t.call(s);
            } finally {
              if (n) throw n.error;
            }
          }
        else
          o.remove(this);
      var d = this.initialTeardown;
      if (V(d))
        try {
          d();
        } catch (v) {
          i = v instanceof br ? v.errors : [v];
        }
      var m = this._finalizers;
      if (m) {
        this._finalizers = null;
        try {
          for (var l = Fn(m), f = l.next(); !f.done; f = l.next()) {
            var E = f.value;
            try {
              Ro(E);
            } catch (v) {
              i = i ?? [], v instanceof br ? i = Re(Re([], Se(i)), Se(v.errors)) : i.push(v);
            }
          }
        } catch (v) {
          a = { error: v };
        } finally {
          try {
            f && !f.done && (r = l.return) && r.call(l);
          } finally {
            if (a) throw a.error;
          }
        }
      }
      if (i)
        throw new br(i);
    }
  }, e.prototype.add = function(n) {
    var t;
    if (n && n !== this)
      if (this.closed)
        Ro(n);
      else {
        if (n instanceof e) {
          if (n.closed || n._hasParent(this))
            return;
          n._addParent(this);
        }
        (this._finalizers = (t = this._finalizers) !== null && t !== void 0 ? t : []).push(n);
      }
  }, e.prototype._hasParent = function(n) {
    var t = this._parentage;
    return t === n || Array.isArray(t) && t.includes(n);
  }, e.prototype._addParent = function(n) {
    var t = this._parentage;
    this._parentage = Array.isArray(t) ? (t.push(n), t) : t ? [t, n] : n;
  }, e.prototype._removeParent = function(n) {
    var t = this._parentage;
    t === n ? this._parentage = null : Array.isArray(t) && Ji(t, n);
  }, e.prototype.remove = function(n) {
    var t = this._finalizers;
    t && Ji(t, n), n instanceof e && n._removeParent(this);
  }, e.EMPTY = function() {
    var n = new e();
    return n.closed = !0, n;
  }(), e;
}(), md = mt.EMPTY;
function hd(e) {
  return e instanceof mt || e && "closed" in e && V(e.remove) && V(e.add) && V(e.unsubscribe);
}
function Ro(e) {
  V(e) ? e() : e.unsubscribe();
}
var Tm = {
  Promise: void 0
}, gm = {
  setTimeout: function(e, n) {
    for (var t = [], a = 2; a < arguments.length; a++)
      t[a - 2] = arguments[a];
    return setTimeout.apply(void 0, Re([e, n], Se(t)));
  },
  clearTimeout: function(e) {
    return clearTimeout(e);
  },
  delegate: void 0
};
function pd(e) {
  gm.setTimeout(function() {
    throw e;
  });
}
function Hn() {
}
function Nt(e) {
  e();
}
var Ca = function(e) {
  Fe(n, e);
  function n(t) {
    var a = e.call(this) || this;
    return a.isStopped = !1, t ? (a.destination = t, hd(t) && t.add(a)) : a.destination = Lm, a;
  }
  return n.create = function(t, a, r) {
    return new Kn(t, a, r);
  }, n.prototype.next = function(t) {
    this.isStopped || this._next(t);
  }, n.prototype.error = function(t) {
    this.isStopped || (this.isStopped = !0, this._error(t));
  }, n.prototype.complete = function() {
    this.isStopped || (this.isStopped = !0, this._complete());
  }, n.prototype.unsubscribe = function() {
    this.closed || (this.isStopped = !0, e.prototype.unsubscribe.call(this), this.destination = null);
  }, n.prototype._next = function(t) {
    this.destination.next(t);
  }, n.prototype._error = function(t) {
    try {
      this.destination.error(t);
    } finally {
      this.unsubscribe();
    }
  }, n.prototype._complete = function() {
    try {
      this.destination.complete();
    } finally {
      this.unsubscribe();
    }
  }, n;
}(mt), bm = function() {
  function e(n) {
    this.partialObserver = n;
  }
  return e.prototype.next = function(n) {
    var t = this.partialObserver;
    if (t.next)
      try {
        t.next(n);
      } catch (a) {
        Et(a);
      }
  }, e.prototype.error = function(n) {
    var t = this.partialObserver;
    if (t.error)
      try {
        t.error(n);
      } catch (a) {
        Et(a);
      }
    else
      Et(n);
  }, e.prototype.complete = function() {
    var n = this.partialObserver;
    if (n.complete)
      try {
        n.complete();
      } catch (t) {
        Et(t);
      }
  }, e;
}(), Kn = function(e) {
  Fe(n, e);
  function n(t, a, r) {
    var i = e.call(this) || this, o;
    return V(t) || !t ? o = {
      next: t ?? void 0,
      error: a ?? void 0,
      complete: r ?? void 0
    } : o = t, i.destination = new bm(o), i;
  }
  return n;
}(Ca);
function Et(e) {
  pd(e);
}
function Pm(e) {
  throw e;
}
var Lm = {
  closed: !0,
  next: Hn,
  error: Pm,
  complete: Hn
}, wa = function() {
  return typeof Symbol == "function" && Symbol.observable || "@@observable";
}();
function sn(e) {
  return e;
}
function Cm() {
  for (var e = [], n = 0; n < arguments.length; n++)
    e[n] = arguments[n];
  return vd(e);
}
function vd(e) {
  return e.length === 0 ? sn : e.length === 1 ? e[0] : function(t) {
    return e.reduce(function(a, r) {
      return r(a);
    }, t);
  };
}
var Y = function() {
  function e(n) {
    n && (this._subscribe = n);
  }
  return e.prototype.lift = function(n) {
    var t = new e();
    return t.source = this, t.operator = n, t;
  }, e.prototype.subscribe = function(n, t, a) {
    var r = this, i = Dm(n) ? n : new Kn(n, t, a);
    return Nt(function() {
      var o = r, s = o.operator, u = o.source;
      i.add(s ? s.call(i, u) : u ? r._subscribe(i) : r._trySubscribe(i));
    }), i;
  }, e.prototype._trySubscribe = function(n) {
    try {
      return this._subscribe(n);
    } catch (t) {
      n.error(t);
    }
  }, e.prototype.forEach = function(n, t) {
    var a = this;
    return t = ko(t), new t(function(r, i) {
      var o = new Kn({
        next: function(s) {
          try {
            n(s);
          } catch (u) {
            i(u), o.unsubscribe();
          }
        },
        error: i,
        complete: r
      });
      a.subscribe(o);
    });
  }, e.prototype._subscribe = function(n) {
    var t;
    return (t = this.source) === null || t === void 0 ? void 0 : t.subscribe(n);
  }, e.prototype[wa] = function() {
    return this;
  }, e.prototype.pipe = function() {
    for (var n = [], t = 0; t < arguments.length; t++)
      n[t] = arguments[t];
    return vd(n)(this);
  }, e.prototype.toPromise = function(n) {
    var t = this;
    return n = ko(n), new n(function(a, r) {
      var i;
      t.subscribe(function(o) {
        return i = o;
      }, function(o) {
        return r(o);
      }, function() {
        return a(i);
      });
    });
  }, e.create = function(n) {
    return new e(n);
  }, e;
}();
function ko(e) {
  var n;
  return (n = e ?? Tm.Promise) !== null && n !== void 0 ? n : Promise;
}
function wm(e) {
  return e && V(e.next) && V(e.error) && V(e.complete);
}
function Dm(e) {
  return e && e instanceof Ca || wm(e) && hd(e);
}
function ym(e) {
  return V(e == null ? void 0 : e.lift);
}
function z(e) {
  return function(n) {
    if (ym(n))
      return n.lift(function(t) {
        try {
          return e(t, this);
        } catch (a) {
          this.error(a);
        }
      });
    throw new TypeError("Unable to lift unknown Observable type");
  };
}
function H(e, n, t, a, r) {
  return new Um(e, n, t, a, r);
}
var Um = function(e) {
  Fe(n, e);
  function n(t, a, r, i, o, s) {
    var u = e.call(this, t) || this;
    return u.onFinalize = o, u.shouldUnsubscribe = s, u._next = a ? function(c) {
      try {
        a(c);
      } catch (d) {
        t.error(d);
      }
    } : e.prototype._next, u._error = i ? function(c) {
      try {
        i(c);
      } catch (d) {
        t.error(d);
      } finally {
        this.unsubscribe();
      }
    } : e.prototype._error, u._complete = r ? function() {
      try {
        r();
      } catch (c) {
        t.error(c);
      } finally {
        this.unsubscribe();
      }
    } : e.prototype._complete, u;
  }
  return n.prototype.unsubscribe = function() {
    var t;
    if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
      var a = this.closed;
      e.prototype.unsubscribe.call(this), !a && ((t = this.onFinalize) === null || t === void 0 || t.call(this));
    }
  }, n;
}(Ca), Mm = La(function(e) {
  return function() {
    e(this), this.name = "ObjectUnsubscribedError", this.message = "object unsubscribed";
  };
}), de = function(e) {
  Fe(n, e);
  function n() {
    var t = e.call(this) || this;
    return t.closed = !1, t.currentObservers = null, t.observers = [], t.isStopped = !1, t.hasError = !1, t.thrownError = null, t;
  }
  return n.prototype.lift = function(t) {
    var a = new To(this, this);
    return a.operator = t, a;
  }, n.prototype._throwIfClosed = function() {
    if (this.closed)
      throw new Mm();
  }, n.prototype.next = function(t) {
    var a = this;
    Nt(function() {
      var r, i;
      if (a._throwIfClosed(), !a.isStopped) {
        a.currentObservers || (a.currentObservers = Array.from(a.observers));
        try {
          for (var o = Fn(a.currentObservers), s = o.next(); !s.done; s = o.next()) {
            var u = s.value;
            u.next(t);
          }
        } catch (c) {
          r = { error: c };
        } finally {
          try {
            s && !s.done && (i = o.return) && i.call(o);
          } finally {
            if (r) throw r.error;
          }
        }
      }
    });
  }, n.prototype.error = function(t) {
    var a = this;
    Nt(function() {
      if (a._throwIfClosed(), !a.isStopped) {
        a.hasError = a.isStopped = !0, a.thrownError = t;
        for (var r = a.observers; r.length; )
          r.shift().error(t);
      }
    });
  }, n.prototype.complete = function() {
    var t = this;
    Nt(function() {
      if (t._throwIfClosed(), !t.isStopped) {
        t.isStopped = !0;
        for (var a = t.observers; a.length; )
          a.shift().complete();
      }
    });
  }, n.prototype.unsubscribe = function() {
    this.isStopped = this.closed = !0, this.observers = this.currentObservers = null;
  }, Object.defineProperty(n.prototype, "observed", {
    get: function() {
      var t;
      return ((t = this.observers) === null || t === void 0 ? void 0 : t.length) > 0;
    },
    enumerable: !1,
    configurable: !0
  }), n.prototype._trySubscribe = function(t) {
    return this._throwIfClosed(), e.prototype._trySubscribe.call(this, t);
  }, n.prototype._subscribe = function(t) {
    return this._throwIfClosed(), this._checkFinalizedStatuses(t), this._innerSubscribe(t);
  }, n.prototype._innerSubscribe = function(t) {
    var a = this, r = this, i = r.hasError, o = r.isStopped, s = r.observers;
    return i || o ? md : (this.currentObservers = null, s.push(t), new mt(function() {
      a.currentObservers = null, Ji(s, t);
    }));
  }, n.prototype._checkFinalizedStatuses = function(t) {
    var a = this, r = a.hasError, i = a.thrownError, o = a.isStopped;
    r ? t.error(i) : o && t.complete();
  }, n.prototype.asObservable = function() {
    var t = new Y();
    return t.source = this, t;
  }, n.create = function(t, a) {
    return new To(t, a);
  }, n;
}(Y), To = function(e) {
  Fe(n, e);
  function n(t, a) {
    var r = e.call(this) || this;
    return r.destination = t, r.source = a, r;
  }
  return n.prototype.next = function(t) {
    var a, r;
    (r = (a = this.destination) === null || a === void 0 ? void 0 : a.next) === null || r === void 0 || r.call(a, t);
  }, n.prototype.error = function(t) {
    var a, r;
    (r = (a = this.destination) === null || a === void 0 ? void 0 : a.error) === null || r === void 0 || r.call(a, t);
  }, n.prototype.complete = function() {
    var t, a;
    (a = (t = this.destination) === null || t === void 0 ? void 0 : t.complete) === null || a === void 0 || a.call(t);
  }, n.prototype._subscribe = function(t) {
    var a, r;
    return (r = (a = this.source) === null || a === void 0 ? void 0 : a.subscribe(t)) !== null && r !== void 0 ? r : md;
  }, n;
}(de), Vm = function(e) {
  Fe(n, e);
  function n(t) {
    var a = e.call(this) || this;
    return a._value = t, a;
  }
  return Object.defineProperty(n.prototype, "value", {
    get: function() {
      return this.getValue();
    },
    enumerable: !1,
    configurable: !0
  }), n.prototype._subscribe = function(t) {
    var a = e.prototype._subscribe.call(this, t);
    return !a.closed && t.next(this._value), a;
  }, n.prototype.getValue = function() {
    var t = this, a = t.hasError, r = t.thrownError, i = t._value;
    if (a)
      throw r;
    return this._throwIfClosed(), i;
  }, n.prototype.next = function(t) {
    e.prototype.next.call(this, this._value = t);
  }, n;
}(de), Da = {
  now: function() {
    return (Da.delegate || Date).now();
  },
  delegate: void 0
}, Gm = function(e) {
  Fe(n, e);
  function n(t, a, r) {
    t === void 0 && (t = 1 / 0), a === void 0 && (a = 1 / 0), r === void 0 && (r = Da);
    var i = e.call(this) || this;
    return i._bufferSize = t, i._windowTime = a, i._timestampProvider = r, i._buffer = [], i._infiniteTimeWindow = !0, i._infiniteTimeWindow = a === 1 / 0, i._bufferSize = Math.max(1, t), i._windowTime = Math.max(1, a), i;
  }
  return n.prototype.next = function(t) {
    var a = this, r = a.isStopped, i = a._buffer, o = a._infiniteTimeWindow, s = a._timestampProvider, u = a._windowTime;
    r || (i.push(t), !o && i.push(s.now() + u)), this._trimBuffer(), e.prototype.next.call(this, t);
  }, n.prototype._subscribe = function(t) {
    this._throwIfClosed(), this._trimBuffer();
    for (var a = this._innerSubscribe(t), r = this, i = r._infiniteTimeWindow, o = r._buffer, s = o.slice(), u = 0; u < s.length && !t.closed; u += i ? 1 : 2)
      t.next(s[u]);
    return this._checkFinalizedStatuses(t), a;
  }, n.prototype._trimBuffer = function() {
    var t = this, a = t._bufferSize, r = t._timestampProvider, i = t._buffer, o = t._infiniteTimeWindow, s = (o ? 1 : 2) * a;
    if (a < 1 / 0 && s < i.length && i.splice(0, i.length - s), !o) {
      for (var u = r.now(), c = 0, d = 1; d < i.length && i[d] <= u; d += 2)
        c = d;
      c && i.splice(0, c + 1);
    }
  }, n;
}(de), Bm = function(e) {
  Fe(n, e);
  function n(t, a) {
    return e.call(this) || this;
  }
  return n.prototype.schedule = function(t, a) {
    return this;
  }, n;
}(mt), go = {
  setInterval: function(e, n) {
    for (var t = [], a = 2; a < arguments.length; a++)
      t[a - 2] = arguments[a];
    return setInterval.apply(void 0, Re([e, n], Se(t)));
  },
  clearInterval: function(e) {
    return clearInterval(e);
  },
  delegate: void 0
}, Fm = function(e) {
  Fe(n, e);
  function n(t, a) {
    var r = e.call(this, t, a) || this;
    return r.scheduler = t, r.work = a, r.pending = !1, r;
  }
  return n.prototype.schedule = function(t, a) {
    var r;
    if (a === void 0 && (a = 0), this.closed)
      return this;
    this.state = t;
    var i = this.id, o = this.scheduler;
    return i != null && (this.id = this.recycleAsyncId(o, i, a)), this.pending = !0, this.delay = a, this.id = (r = this.id) !== null && r !== void 0 ? r : this.requestAsyncId(o, this.id, a), this;
  }, n.prototype.requestAsyncId = function(t, a, r) {
    return r === void 0 && (r = 0), go.setInterval(t.flush.bind(t, this), r);
  }, n.prototype.recycleAsyncId = function(t, a, r) {
    if (r === void 0 && (r = 0), r != null && this.delay === r && this.pending === !1)
      return a;
    a != null && go.clearInterval(a);
  }, n.prototype.execute = function(t, a) {
    if (this.closed)
      return new Error("executing a cancelled action");
    this.pending = !1;
    var r = this._execute(t, a);
    if (r)
      return r;
    this.pending === !1 && this.id != null && (this.id = this.recycleAsyncId(this.scheduler, this.id, null));
  }, n.prototype._execute = function(t, a) {
    var r = !1, i;
    try {
      this.work(t);
    } catch (o) {
      r = !0, i = o || new Error("Scheduled action threw falsy error");
    }
    if (r)
      return this.unsubscribe(), i;
  }, n.prototype.unsubscribe = function() {
    if (!this.closed) {
      var t = this, a = t.id, r = t.scheduler, i = r.actions;
      this.work = this.state = this.scheduler = null, this.pending = !1, Ji(i, this), a != null && (this.id = this.recycleAsyncId(r, a, null)), this.delay = null, e.prototype.unsubscribe.call(this);
    }
  }, n;
}(Bm), bo = function() {
  function e(n, t) {
    t === void 0 && (t = e.now), this.schedulerActionCtor = n, this.now = t;
  }
  return e.prototype.schedule = function(n, t, a) {
    return t === void 0 && (t = 0), new this.schedulerActionCtor(this, n).schedule(a, t);
  }, e.now = Da.now, e;
}(), Hm = function(e) {
  Fe(n, e);
  function n(t, a) {
    a === void 0 && (a = bo.now);
    var r = e.call(this, t, a) || this;
    return r.actions = [], r._active = !1, r;
  }
  return n.prototype.flush = function(t) {
    var a = this.actions;
    if (this._active) {
      a.push(t);
      return;
    }
    var r;
    this._active = !0;
    do
      if (r = t.execute(t.state, t.delay))
        break;
    while (t = a.shift());
    if (this._active = !1, r) {
      for (; t = a.shift(); )
        t.unsubscribe();
      throw r;
    }
  }, n;
}(bo), ya = new Hm(Fm), Km = ya, Ed = new Y(function(e) {
  return e.complete();
});
function Ym(e) {
  return e && V(e.schedule);
}
function Ua(e) {
  return e[e.length - 1];
}
function rr(e) {
  return V(Ua(e)) ? e.pop() : void 0;
}
function ht(e) {
  return Ym(Ua(e)) ? e.pop() : void 0;
}
function Wm(e, n) {
  return typeof Ua(e) == "number" ? e.pop() : n;
}
var Ma = function(e) {
  return e && typeof e.length == "number" && typeof e != "function";
};
function Sd(e) {
  return V(e == null ? void 0 : e.then);
}
function Id(e) {
  return V(e[wa]);
}
function _d(e) {
  return Symbol.asyncIterator && V(e == null ? void 0 : e[Symbol.asyncIterator]);
}
function Ad(e) {
  return new TypeError("You provided " + (e !== null && typeof e == "object" ? "an invalid object" : "'" + e + "'") + " where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.");
}
function zm() {
  return typeof Symbol != "function" || !Symbol.iterator ? "@@iterator" : Symbol.iterator;
}
var Nd = zm();
function Od(e) {
  return V(e == null ? void 0 : e[Nd]);
}
function Rd(e) {
  return Rm(this, arguments, function() {
    var t, a, r, i;
    return fd(this, function(o) {
      switch (o.label) {
        case 0:
          t = e.getReader(), o.label = 1;
        case 1:
          o.trys.push([1, , 9, 10]), o.label = 2;
        case 2:
          return [4, Vn(t.read())];
        case 3:
          return a = o.sent(), r = a.value, i = a.done, i ? [4, Vn(void 0)] : [3, 5];
        case 4:
          return [2, o.sent()];
        case 5:
          return [4, Vn(r)];
        case 6:
          return [4, o.sent()];
        case 7:
          return o.sent(), [3, 2];
        case 8:
          return [3, 10];
        case 9:
          return t.releaseLock(), [7];
        case 10:
          return [2];
      }
    });
  });
}
function kd(e) {
  return V(e == null ? void 0 : e.getReader);
}
function X(e) {
  if (e instanceof Y)
    return e;
  if (e != null) {
    if (Id(e))
      return qm(e);
    if (Ma(e))
      return $m(e);
    if (Sd(e))
      return Zm(e);
    if (_d(e))
      return Td(e);
    if (Od(e))
      return Jm(e);
    if (kd(e))
      return Xm(e);
  }
  throw Ad(e);
}
function qm(e) {
  return new Y(function(n) {
    var t = e[wa]();
    if (V(t.subscribe))
      return t.subscribe(n);
    throw new TypeError("Provided object does not correctly implement Symbol.observable");
  });
}
function $m(e) {
  return new Y(function(n) {
    for (var t = 0; t < e.length && !n.closed; t++)
      n.next(e[t]);
    n.complete();
  });
}
function Zm(e) {
  return new Y(function(n) {
    e.then(function(t) {
      n.closed || (n.next(t), n.complete());
    }, function(t) {
      return n.error(t);
    }).then(null, pd);
  });
}
function Jm(e) {
  return new Y(function(n) {
    var t, a;
    try {
      for (var r = Fn(e), i = r.next(); !i.done; i = r.next()) {
        var o = i.value;
        if (n.next(o), n.closed)
          return;
      }
    } catch (s) {
      t = { error: s };
    } finally {
      try {
        i && !i.done && (a = r.return) && a.call(r);
      } finally {
        if (t) throw t.error;
      }
    }
    n.complete();
  });
}
function Td(e) {
  return new Y(function(n) {
    Qm(e, n).catch(function(t) {
      return n.error(t);
    });
  });
}
function Xm(e) {
  return Td(Rd(e));
}
function Qm(e, n) {
  var t, a, r, i;
  return O(this, void 0, void 0, function() {
    var o, s;
    return fd(this, function(u) {
      switch (u.label) {
        case 0:
          u.trys.push([0, 5, 6, 11]), t = km(e), u.label = 1;
        case 1:
          return [4, t.next()];
        case 2:
          if (a = u.sent(), !!a.done) return [3, 4];
          if (o = a.value, n.next(o), n.closed)
            return [2];
          u.label = 3;
        case 3:
          return [3, 1];
        case 4:
          return [3, 11];
        case 5:
          return s = u.sent(), r = { error: s }, [3, 11];
        case 6:
          return u.trys.push([6, , 9, 10]), a && !a.done && (i = t.return) ? [4, i.call(t)] : [3, 8];
        case 7:
          u.sent(), u.label = 8;
        case 8:
          return [3, 10];
        case 9:
          if (r) throw r.error;
          return [7];
        case 10:
          return [7];
        case 11:
          return n.complete(), [2];
      }
    });
  });
}
function xe(e, n, t, a, r) {
  a === void 0 && (a = 0), r === void 0 && (r = !1);
  var i = n.schedule(function() {
    t(), r ? e.add(this.schedule(null, a)) : this.unsubscribe();
  }, a);
  if (e.add(i), !r)
    return i;
}
function gd(e, n) {
  return n === void 0 && (n = 0), z(function(t, a) {
    t.subscribe(H(a, function(r) {
      return xe(a, e, function() {
        return a.next(r);
      }, n);
    }, function() {
      return xe(a, e, function() {
        return a.complete();
      }, n);
    }, function(r) {
      return xe(a, e, function() {
        return a.error(r);
      }, n);
    }));
  });
}
function bd(e, n) {
  return n === void 0 && (n = 0), z(function(t, a) {
    a.add(e.schedule(function() {
      return t.subscribe(a);
    }, n));
  });
}
function jm(e, n) {
  return X(e).pipe(bd(n), gd(n));
}
function xm(e, n) {
  return X(e).pipe(bd(n), gd(n));
}
function eh(e, n) {
  return new Y(function(t) {
    var a = 0;
    return n.schedule(function() {
      a === e.length ? t.complete() : (t.next(e[a++]), t.closed || this.schedule());
    });
  });
}
function nh(e, n) {
  return new Y(function(t) {
    var a;
    return xe(t, n, function() {
      a = e[Nd](), xe(t, n, function() {
        var r, i, o;
        try {
          r = a.next(), i = r.value, o = r.done;
        } catch (s) {
          t.error(s);
          return;
        }
        o ? t.complete() : t.next(i);
      }, 0, !0);
    }), function() {
      return V(a == null ? void 0 : a.return) && a.return();
    };
  });
}
function Pd(e, n) {
  if (!e)
    throw new Error("Iterable cannot be null");
  return new Y(function(t) {
    xe(t, n, function() {
      var a = e[Symbol.asyncIterator]();
      xe(t, n, function() {
        a.next().then(function(r) {
          r.done ? t.complete() : t.next(r.value);
        });
      }, 0, !0);
    });
  });
}
function th(e, n) {
  return Pd(Rd(e), n);
}
function ih(e, n) {
  if (e != null) {
    if (Id(e))
      return jm(e, n);
    if (Ma(e))
      return eh(e, n);
    if (Sd(e))
      return xm(e, n);
    if (_d(e))
      return Pd(e, n);
    if (Od(e))
      return nh(e, n);
    if (kd(e))
      return th(e, n);
  }
  throw Ad(e);
}
function ce(e, n) {
  return n ? ih(e, n) : X(e);
}
function j() {
  for (var e = [], n = 0; n < arguments.length; n++)
    e[n] = arguments[n];
  var t = ht(e);
  return ce(e, t);
}
var rh = La(function(e) {
  return function() {
    e(this), this.name = "EmptyError", this.message = "no elements in sequence";
  };
});
function Yn(e, n) {
  var t = typeof n == "object";
  return new Promise(function(a, r) {
    var i = new Kn({
      next: function(o) {
        a(o), i.unsubscribe();
      },
      error: r,
      complete: function() {
        t ? a(n.defaultValue) : r(new rh());
      }
    });
    e.subscribe(i);
  });
}
function ah(e) {
  return e instanceof Date && !isNaN(e);
}
function g(e, n) {
  return z(function(t, a) {
    var r = 0;
    t.subscribe(H(a, function(i) {
      a.next(e.call(n, i, r++));
    }));
  });
}
var oh = Array.isArray;
function sh(e, n) {
  return oh(n) ? e.apply(void 0, Re([], Se(n))) : e(n);
}
function ar(e) {
  return g(function(n) {
    return sh(e, n);
  });
}
var uh = Array.isArray, ch = Object.getPrototypeOf, lh = Object.prototype, dh = Object.keys;
function Ld(e) {
  if (e.length === 1) {
    var n = e[0];
    if (uh(n))
      return { args: n, keys: null };
    if (fh(n)) {
      var t = dh(n);
      return {
        args: t.map(function(a) {
          return n[a];
        }),
        keys: t
      };
    }
  }
  return { args: e, keys: null };
}
function fh(e) {
  return e && typeof e == "object" && ch(e) === lh;
}
function Cd(e, n) {
  return e.reduce(function(t, a, r) {
    return t[a] = n[r], t;
  }, {});
}
function mh() {
  for (var e = [], n = 0; n < arguments.length; n++)
    e[n] = arguments[n];
  var t = ht(e), a = rr(e), r = Ld(e), i = r.args, o = r.keys;
  if (i.length === 0)
    return ce([], t);
  var s = new Y(wd(i, t, o ? function(u) {
    return Cd(o, u);
  } : sn));
  return a ? s.pipe(ar(a)) : s;
}
function wd(e, n, t) {
  return t === void 0 && (t = sn), function(a) {
    Po(n, function() {
      for (var r = e.length, i = new Array(r), o = r, s = r, u = function(d) {
        Po(n, function() {
          var m = ce(e[d], n), l = !1;
          m.subscribe(H(a, function(f) {
            i[d] = f, l || (l = !0, s--), s || a.next(t(i.slice()));
          }, function() {
            --o || a.complete();
          }));
        }, a);
      }, c = 0; c < r; c++)
        u(c);
    }, a);
  };
}
function Po(e, n, t) {
  e ? xe(t, e, n) : n();
}
function hh(e, n, t, a, r, i, o, s) {
  var u = [], c = 0, d = 0, m = !1, l = function() {
    m && !u.length && !c && n.complete();
  }, f = function(v) {
    return c < a ? E(v) : u.push(v);
  }, E = function(v) {
    c++;
    var p = !1;
    X(t(v, d++)).subscribe(H(n, function(S) {
      n.next(S);
    }, function() {
      p = !0;
    }, void 0, function() {
      if (p)
        try {
          c--;
          for (var S = function() {
            var _ = u.shift();
            o || E(_);
          }; u.length && c < a; )
            S();
          l();
        } catch (_) {
          n.error(_);
        }
    }));
  };
  return e.subscribe(H(n, f, function() {
    m = !0, l();
  })), function() {
  };
}
function se(e, n, t) {
  return t === void 0 && (t = 1 / 0), V(n) ? se(function(a, r) {
    return g(function(i, o) {
      return n(a, i, r, o);
    })(X(e(a, r)));
  }, t) : (typeof n == "number" && (t = n), z(function(a, r) {
    return hh(a, r, e, t);
  }));
}
function Dd(e) {
  return e === void 0 && (e = 1 / 0), se(sn, e);
}
function ph() {
  return Dd(1);
}
function Lo() {
  for (var e = [], n = 0; n < arguments.length; n++)
    e[n] = arguments[n];
  return ph()(ce(e, ht(e)));
}
function vh(e) {
  return new Y(function(n) {
    X(e()).subscribe(n);
  });
}
function yd() {
  for (var e = [], n = 0; n < arguments.length; n++)
    e[n] = arguments[n];
  var t = rr(e), a = Ld(e), r = a.args, i = a.keys, o = new Y(function(s) {
    var u = r.length;
    if (!u) {
      s.complete();
      return;
    }
    for (var c = new Array(u), d = u, m = u, l = function(E) {
      var v = !1;
      X(r[E]).subscribe(H(s, function(p) {
        v || (v = !0, m--), c[E] = p;
      }, function() {
        return d--;
      }, void 0, function() {
        (!d || !v) && (m || s.next(i ? Cd(i, c) : c), s.complete());
      }));
    }, f = 0; f < u; f++)
      l(f);
  });
  return t ? o.pipe(ar(t)) : o;
}
var Eh = ["addListener", "removeListener"], Sh = ["addEventListener", "removeEventListener"], Ih = ["on", "off"];
function wn(e, n, t, a) {
  if (V(t) && (a = t, t = void 0), a)
    return wn(e, n, t).pipe(ar(a));
  var r = Se(Nh(e) ? Sh.map(function(s) {
    return function(u) {
      return e[s](n, u, t);
    };
  }) : _h(e) ? Eh.map(Co(e, n)) : Ah(e) ? Ih.map(Co(e, n)) : [], 2), i = r[0], o = r[1];
  if (!i && Ma(e))
    return se(function(s) {
      return wn(s, n, t);
    })(X(e));
  if (!i)
    throw new TypeError("Invalid event target");
  return new Y(function(s) {
    var u = function() {
      for (var c = [], d = 0; d < arguments.length; d++)
        c[d] = arguments[d];
      return s.next(1 < c.length ? c : c[0]);
    };
    return i(u), function() {
      return o(u);
    };
  });
}
function Co(e, n) {
  return function(t) {
    return function(a) {
      return e[t](n, a);
    };
  };
}
function _h(e) {
  return V(e.addListener) && V(e.removeListener);
}
function Ah(e) {
  return V(e.on) && V(e.off);
}
function Nh(e) {
  return V(e.addEventListener) && V(e.removeEventListener);
}
function Oh(e, n, t) {
  return e === void 0 && (e = 0), t === void 0 && (t = Km), new Y(function(a) {
    var r = ah(e) ? +e - t.now() : e;
    r < 0 && (r = 0);
    var i = 0;
    return t.schedule(function() {
      a.closed || (a.next(i++), a.complete());
    }, r);
  });
}
function Ze() {
  for (var e = [], n = 0; n < arguments.length; n++)
    e[n] = arguments[n];
  var t = ht(e), a = Wm(e, 1 / 0), r = e;
  return r.length ? r.length === 1 ? X(r[0]) : Dd(a)(ce(r, t)) : Ed;
}
var Rh = new Y(Hn), kh = Array.isArray;
function Th(e) {
  return e.length === 1 && kh(e[0]) ? e[0] : e;
}
function re(e, n) {
  return z(function(t, a) {
    var r = 0;
    t.subscribe(H(a, function(i) {
      return e.call(n, i, r++) && a.next(i);
    }));
  });
}
function gh(e) {
  return function(n) {
    for (var t = [], a = function(i) {
      t.push(X(e[i]).subscribe(H(n, function(o) {
        if (t) {
          for (var s = 0; s < t.length; s++)
            s !== i && t[s].unsubscribe();
          t = null;
        }
        n.next(o);
      })));
    }, r = 0; t && !n.closed && r < e.length; r++)
      a(r);
  };
}
function bh(e) {
  return z(function(n, t) {
    var a = [];
    return n.subscribe(H(t, function(r) {
      return a.push(r);
    }, function() {
      t.next(a), t.complete();
    })), X(e).subscribe(H(t, function() {
      var r = a;
      a = [], t.next(r);
    }, Hn)), function() {
      a = null;
    };
  });
}
function tn(e) {
  return z(function(n, t) {
    var a = null, r = !1, i;
    a = n.subscribe(H(t, void 0, void 0, function(o) {
      i = X(e(o, tn(e)(n))), a ? (a.unsubscribe(), a = null, i.subscribe(t)) : r = !0;
    })), r && (a.unsubscribe(), a = null, i.subscribe(t));
  });
}
function Ph(e, n, t, a, r) {
  return function(i, o) {
    var s = t, u = n, c = 0;
    i.subscribe(H(o, function(d) {
      var m = c++;
      u = s ? e(u, d, m) : (s = !0, d), o.next(u);
    }, r));
  };
}
function Ud() {
  for (var e = [], n = 0; n < arguments.length; n++)
    e[n] = arguments[n];
  var t = rr(e);
  return t ? Cm(Ud.apply(void 0, Re([], Se(e))), ar(t)) : z(function(a, r) {
    wd(Re([a], Se(Th(e))))(r);
  });
}
function Md() {
  for (var e = [], n = 0; n < arguments.length; n++)
    e[n] = arguments[n];
  return Ud.apply(void 0, Re([], Se(e)));
}
function Lh(e, n) {
  return n === void 0 && (n = ya), z(function(t, a) {
    var r = null, i = null, o = null, s = function() {
      if (r) {
        r.unsubscribe(), r = null;
        var c = i;
        i = null, a.next(c);
      }
    };
    function u() {
      var c = o + e, d = n.now();
      if (d < c) {
        r = this.schedule(void 0, c - d), a.add(r);
        return;
      }
      s();
    }
    t.subscribe(H(a, function(c) {
      i = c, o = n.now(), r || (r = n.schedule(u, e), a.add(r));
    }, function() {
      s(), a.complete();
    }, void 0, function() {
      i = r = null;
    }));
  });
}
function Ae(e) {
  return e <= 0 ? function() {
    return Ed;
  } : z(function(n, t) {
    var a = 0;
    n.subscribe(H(t, function(r) {
      ++a <= e && (t.next(r), e <= a && t.complete());
    }));
  });
}
function Ch(e, n) {
  return z(function(t, a) {
    var r = 0, i = null, o = !1;
    t.subscribe(H(a, function(s) {
      i || (i = H(a, void 0, function() {
        i = null, o && a.complete();
      }), X(e(s, r++)).subscribe(i));
    }, function() {
      o = !0, !i && a.complete();
    }));
  });
}
function wh(e) {
  return z(function(n, t) {
    try {
      n.subscribe(t);
    } finally {
      t.add(e);
    }
  });
}
function Vd() {
  for (var e = [], n = 0; n < arguments.length; n++)
    e[n] = arguments[n];
  return e.length ? z(function(t, a) {
    gh(Re([t], Se(e)))(a);
  }) : sn;
}
function Dh(e) {
  e === void 0 && (e = 1 / 0);
  var n;
  e && typeof e == "object" ? n = e : n = {
    count: e
  };
  var t = n.count, a = t === void 0 ? 1 / 0 : t, r = n.delay, i = n.resetOnSuccess, o = i === void 0 ? !1 : i;
  return a <= 0 ? sn : z(function(s, u) {
    var c = 0, d, m = function() {
      var l = !1;
      d = s.subscribe(H(u, function(f) {
        o && (c = 0), u.next(f);
      }, void 0, function(f) {
        if (c++ < a) {
          var E = function() {
            d ? (d.unsubscribe(), d = null, m()) : l = !0;
          };
          if (r != null) {
            var v = typeof r == "number" ? Oh(r) : X(r(f, c)), p = H(u, function() {
              p.unsubscribe(), E();
            }, function() {
              u.complete();
            });
            v.subscribe(p);
          } else
            E();
        } else
          u.error(f);
      })), l && (d.unsubscribe(), d = null, m());
    };
    m();
  });
}
function yh(e, n) {
  return z(Ph(e, n, arguments.length >= 2, !0));
}
function Uh(e) {
  e === void 0 && (e = {});
  var n = e.connector, t = n === void 0 ? function() {
    return new de();
  } : n, a = e.resetOnError, r = a === void 0 ? !0 : a, i = e.resetOnComplete, o = i === void 0 ? !0 : i, s = e.resetOnRefCountZero, u = s === void 0 ? !0 : s;
  return function(c) {
    var d, m, l, f = 0, E = !1, v = !1, p = function() {
      m == null || m.unsubscribe(), m = void 0;
    }, S = function() {
      p(), d = l = void 0, E = v = !1;
    }, _ = function() {
      var A = d;
      S(), A == null || A.unsubscribe();
    };
    return z(function(A, N) {
      f++, !v && !E && p();
      var k = l = l ?? t();
      N.add(function() {
        f--, f === 0 && !v && !E && (m = Pr(_, u));
      }), k.subscribe(N), !d && f > 0 && (d = new Kn({
        next: function(C) {
          return k.next(C);
        },
        error: function(C) {
          v = !0, p(), m = Pr(S, r, C), k.error(C);
        },
        complete: function() {
          E = !0, p(), m = Pr(S, o), k.complete();
        }
      }), X(A).subscribe(d));
    })(c);
  };
}
function Pr(e, n) {
  for (var t = [], a = 2; a < arguments.length; a++)
    t[a - 2] = arguments[a];
  if (n === !0) {
    e();
    return;
  }
  if (n !== !1) {
    var r = new Kn({
      next: function() {
        r.unsubscribe(), e();
      }
    });
    return X(n.apply(void 0, Re([], Se(t)))).subscribe(r);
  }
}
function Lr(e, n, t) {
  var a, r = !1;
  return a = e, Uh({
    connector: function() {
      return new Gm(a, n, t);
    },
    resetOnError: !0,
    resetOnComplete: !1,
    resetOnRefCountZero: r
  });
}
function Mh() {
  for (var e = [], n = 0; n < arguments.length; n++)
    e[n] = arguments[n];
  var t = ht(e);
  return z(function(a, r) {
    (t ? Lo(e, a, t) : Lo(e, a)).subscribe(r);
  });
}
function An(e, n) {
  return z(function(t, a) {
    var r = null, i = 0, o = !1, s = function() {
      return o && !r && a.complete();
    };
    t.subscribe(H(a, function(u) {
      r == null || r.unsubscribe();
      var c = 0, d = i++;
      X(e(u, d)).subscribe(r = H(a, function(m) {
        return a.next(n ? n(u, m, d, c++) : m);
      }, function() {
        r = null, s();
      }));
    }, function() {
      o = !0, s();
    }));
  });
}
function rn(e) {
  return z(function(n, t) {
    X(e).subscribe(H(t, function() {
      return t.complete();
    }, Hn)), !t.closed && n.subscribe(t);
  });
}
function Ne(e, n, t) {
  var a = V(e) || n || t ? { next: e, error: n, complete: t } : e;
  return a ? z(function(r, i) {
    var o;
    (o = a.subscribe) === null || o === void 0 || o.call(a);
    var s = !0;
    r.subscribe(H(i, function(u) {
      var c;
      (c = a.next) === null || c === void 0 || c.call(a, u), i.next(u);
    }, function() {
      var u;
      s = !1, (u = a.complete) === null || u === void 0 || u.call(a), i.complete();
    }, function(u) {
      var c;
      s = !1, (c = a.error) === null || c === void 0 || c.call(a, u), i.error(u);
    }, function() {
      var u, c;
      s && ((u = a.unsubscribe) === null || u === void 0 || u.call(a)), (c = a.finalize) === null || c === void 0 || c.call(a);
    }));
  }) : sn;
}
function Vh() {
  for (var e = [], n = 0; n < arguments.length; n++)
    e[n] = arguments[n];
  var t = rr(e);
  return z(function(a, r) {
    for (var i = e.length, o = new Array(i), s = e.map(function() {
      return !1;
    }), u = !1, c = function(m) {
      X(e[m]).subscribe(H(r, function(l) {
        o[m] = l, !u && !s[m] && (s[m] = !0, (u = s.every(sn)) && (s = null));
      }, Hn));
    }, d = 0; d < i; d++)
      c(d);
    a.subscribe(H(r, function(m) {
      if (u) {
        var l = Re([m], Se(o));
        r.next(t ? t.apply(void 0, Re([], Se(l))) : l);
      }
    }));
  });
}
const or = (e) => Object.entries(e), Gh = (e) => Object.fromEntries(e);
let Gd = new de();
const st = {
  error: 3,
  warn: 2,
  info: 1,
  debug: 0
};
function Bd() {
  return Gd = new de();
}
function U(e) {
  return or(st).reduce((n, [t]) => (n[t] = (...a) => {
    Gd.next({
      time: /* @__PURE__ */ new Date(),
      module: e,
      level: t,
      messages: a
    });
  }, n), {});
}
function Bh(e) {
  if (!e || e === "noop")
    return Fd;
  if (e === "console")
    return console;
  for (const n of Object.keys(st))
    if (typeof e[n] != "function")
      throw new Error(`Logger method '${n}' is not available on the provided logger instance.`);
  return e;
}
const Fd = {
  error: () => {
  },
  warn: () => {
  },
  info: () => {
  },
  debug: () => {
  }
}, Cr = {
  lensPerformance: { cluster: 0, benchmarks: [], webglRendererInfo: "unknown" },
  logger: Fd,
  logLevel: "info",
  shouldUseWorker: !0,
  apiHostname: "camera-kit-api.snapar.com",
  userAgentFlavor: "release",
  fonts: [],
  lensHttpValidationStrategy: "strict",
  trustedTypesPolicyName: "snap-camera-kit"
}, ke = "configuration";
function Fh() {
  return /iPad|iPhone|iPod/.test(navigator.platform) || navigator.platform === "MacIntel" && navigator.maxTouchPoints > 2;
}
const Hh = (e) => {
  const n = Zi();
  return n && console.warn("Configuration overrides applied", n), R(ke, () => {
    var t;
    const a = Object.assign(Object.assign({}, e), { lensPerformance: e.lensPerformance instanceof Promise ? e.lensPerformance.catch(() => Cr.lensPerformance) : e.lensPerformance });
    return Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, Cr), { shouldUseWorker: Fh() ? !1 : Cr.shouldUseWorker }), Cn(a)), Cn(n ?? {})), { logger: Bh((t = a.logger) !== null && t !== void 0 ? t : n == null ? void 0 : n.logger) });
  });
};
function Kh(e) {
  const [n, t, ...a] = e.split(`
`);
  return [n, ...a].join(`
`);
}
function ne(e) {
  return (n, t) => {
    const a = new Error(n, { cause: t });
    return a.name = e, a.stack = a.stack && Kh(a.stack), a;
  };
}
const Yh = ne("LegalError"), Wh = ne("LensContentValidationError"), zh = ne("LensError"), wr = ne("CameraKitSourceError"), qh = ne("LensImagePickerError"), $h = ne("CacheKeyNotFoundError"), Zh = ne("ConfigurationError"), ut = ne("PlatformNotSupportedError"), Jh = ne("LensExecutionError"), Xh = ne("LensVideoPlaybackMutedError"), Qh = ne("LensAbortError"), jh = ne("PersistentStoreError"), xh = ne("LensAssetError"), ep = ne("BootstrapError"), np = ne("ArgumentValidationError"), sr = () => (e) => (n, t) => O(void 0, void 0, void 0, function* () {
  const a = yield e(n, t);
  let r;
  try {
    r = yield a.arrayBuffer();
  } catch {
    r = new ArrayBuffer(0);
  }
  return [r, a];
});
class Ie {
  constructor(n) {
    this.inner = n;
  }
  get handler() {
    return this.inner;
  }
  map(n) {
    const t = (a, r) => {
      var i;
      const o = new AbortController(), s = o.signal;
      let u = !1;
      const c = () => {
        var l;
        s.aborted || u || (o.abort(), (l = r == null ? void 0 : r.signal) === null || l === void 0 || l.removeEventListener("abort", c));
      };
      (i = r == null ? void 0 : r.signal) === null || i === void 0 || i.addEventListener("abort", c);
      const d = new Proxy(this.inner, {
        apply: (l, f, E) => {
          const [v, p] = E;
          p != null && p.isSideEffect && (u = !0);
          const S = [];
          s.addEventListener = new Proxy(s.addEventListener, {
            apply: (N, k, C) => (S.push(C[1]), Reflect.apply(N, k, C))
          });
          const _ = () => {
            var N;
            (N = p == null ? void 0 : p.signal) === null || N === void 0 || N.removeEventListener("abort", c), S.forEach((k) => s.removeEventListener("abort", k)), u = !0;
          }, A = Reflect.apply(l, f, [
            v,
            Object.assign(Object.assign({}, p), { isSideEffect: !1, signal: s })
          ]);
          return A.catch(() => {
          }).then(_), A;
        }
      }), m = n(d)(a, r);
      return m.catch(() => {
      }).then(c), m;
    };
    return new Ie(t);
  }
}
const tp = U("retryingHandler"), wo = (e, n) => {
  tp.warn("Retrying handler got failed response:", e, `Waited ${n} millis, attempting retry now.`);
}, ip = (e) => new Promise((n) => setTimeout(n, e)), rp = (e, n) => Math.round(Math.random() * (n - e) + e), ap = {
  backoffMultiple: 3,
  baseSleep: 500,
  maxSleep: 5 * 1e3,
  maxRetries: 10,
  retryPredicate: (e) => e instanceof Response ? !e.ok : !0
};
function Ot(e) {
  return e instanceof Request ? e.clone() : e;
}
const Hd = (e = {}) => {
  const n = Cn(e), { backoffMultiple: t, baseSleep: a, maxSleep: r, maxRetries: i, retryPredicate: o } = Object.assign(Object.assign({}, ap), n), s = (u) => O(void 0, void 0, void 0, function* () {
    const c = Math.min(r, rp(a, u * t));
    return yield ip(c), c;
  });
  return (u) => (c, d) => {
    const m = (l, f) => O(void 0, void 0, void 0, function* () {
      var E, v;
      try {
        const p = yield u(Ot(c), d);
        if (f < i && o(p, f)) {
          const S = yield s(l);
          return !((E = d == null ? void 0 : d.signal) === null || E === void 0) && E.aborted ? p : (wo(p, S), m(S, f + 1));
        }
        return p;
      } catch (p) {
        if (!(p instanceof Error))
          throw new Error(`Invalid type caught by retrying handler. Handlers may only throw Errors. Got ${JSON.stringify(p)}`);
        if (p.name === "AbortError")
          throw p;
        if (f < i && o(p, f)) {
          const S = yield s(l);
          if (!((v = d == null ? void 0 : d.signal) === null || v === void 0) && v.aborted)
            throw p;
          return wo(p, S), m(S, f + 1);
        }
        throw p;
      }
    });
    return m(a, 0);
  };
}, op = U("noCorsRetryingFetchHandler"), sp = (e) => {
  op.warn("NoCorsRetrying handler got failed response:", e, 'Retrying request with {mode: "no-cors"}.');
}, up = () => {
  const e = /* @__PURE__ */ new Map();
  return (n) => (t, a = {}) => O(void 0, void 0, void 0, function* () {
    var r;
    let i = typeof t == "string" ? t : t.url;
    try {
      i = new URL(i, location.origin).host;
    } catch {
    }
    try {
      return yield n(Ot(t), a);
    } catch (o) {
      if (o instanceof Error && o.name === "AbortError")
        throw o;
      sp(o);
      const s = (r = e.get(i)) !== null && r !== void 0 ? r : n(Ot(t), Object.assign(Object.assign({}, a), { mode: "no-cors" }));
      return e.set(i, s), yield s, e.delete(i), n(Ot(t), a);
    }
  });
};
function G(e) {
  return typeof e == "string";
}
function Xi(e) {
  return G(e) && encodeURIComponent(e) === e;
}
function Dn(e) {
  return typeof e == "number";
}
function Wn(e) {
  return Dn(e) && !Number.isNaN(e) && Number.isFinite(e);
}
function Kd(e) {
  return $(e) || Wn(e);
}
function qe(e, n) {
  return Array.isArray(n) && n.every((t) => e(t));
}
function cp(e) {
  return qe(Xi, e);
}
function Ye(e) {
  return $(e) || G(e);
}
function lp(e) {
  return e instanceof ArrayBuffer;
}
function Yd(e) {
  return e instanceof Object.getPrototypeOf(Uint8Array);
}
function $(e) {
  return typeof e > "u";
}
function Wd(e) {
  return e === "";
}
function K(e) {
  return typeof e == "object" && e !== null && !Array.isArray(e);
}
function Do(e) {
  return typeof e == "function";
}
function dp(e) {
  return e instanceof Date;
}
function yo(e) {
  return $(e) || dp(e);
}
function Va(e) {
  return (n) => {
    for (const t of Object.values(n))
      if (!e(t))
        return !1;
    return !0;
  };
}
function Uo(e) {
  if (!e)
    return !0;
  try {
    const n = new URL(e);
    return n.protocol === "https:" || n.protocol === "http:";
  } catch {
    return !1;
  }
}
function fp(e) {
  if (!e)
    return !1;
  const n = e;
  return typeof n.then == "function" && typeof n.catch == "function";
}
const mp = (e) => new Promise((n) => setTimeout(n, e)), hp = {
  createError: (e) => {
    const n = G(e) ? `for ${e}` : e instanceof Request ? `for ${e.url}` : "";
    return new Error(`Request ${n} timed out by client timeout handler.`);
  },
  timeout: 30 * 1e3
}, zd = (e = {}) => {
  const n = Cn(e), { createError: t, timeout: a } = Object.assign(Object.assign({}, hp), n);
  return (r) => (i, o) => Promise.race([r(i, o), mp(a).then(() => Promise.reject(t(i, o)))]);
}, Un = R("defaultFetchHandler", () => new Ie(fetch).map(zd({ timeout: 20 * 1e3 })).map(up()).map(Hd({
  maxRetries: 3,
  retryPredicate: (e) => !(e instanceof Response && (e.ok || e.status % 400 < 100))
})).handler);
function ur(e, n) {
  return n ? Object.assign(Object.assign({}, e), { priority: "low" }) : e;
}
const qd = R("remoteMediaAssetLoader", [Un.token], (e) => {
  const n = new Ie(e).map(sr()).handler;
  return function({ assetDescriptor: { assetId: a }, lowPriority: r }) {
    return O(this, void 0, void 0, function* () {
      const [i, o] = yield n(a, ur({ cache: "force-cache" }, r));
      if (!o.ok)
        throw o;
      return i;
    });
  };
});
var xn;
(function(e) {
  e[e.DEFAULT = 0] = "DEFAULT", e[e.LENS_CORE = 64] = "LENS_CORE", e[e.CAMERA_KIT_CORE = 65] = "CAMERA_KIT_CORE", e[e.LENS_CORE_CONFIG = 143] = "LENS_CORE_CONFIG", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(xn || (xn = {}));
function pp() {
  let e = 0, n = 0;
  for (let a = 0; a < 28; a += 7) {
    let r = this.buf[this.pos++];
    if (e |= (r & 127) << a, !(r & 128))
      return this.assertBounds(), [e, n];
  }
  let t = this.buf[this.pos++];
  if (e |= (t & 15) << 28, n = (t & 112) >> 4, !(t & 128))
    return this.assertBounds(), [e, n];
  for (let a = 3; a <= 31; a += 7) {
    let r = this.buf[this.pos++];
    if (n |= (r & 127) << a, !(r & 128))
      return this.assertBounds(), [e, n];
  }
  throw new Error("invalid varint");
}
function Dr(e, n, t) {
  for (let i = 0; i < 28; i = i + 7) {
    const o = e >>> i, s = !(!(o >>> 7) && n == 0), u = (s ? o | 128 : o) & 255;
    if (t.push(u), !s)
      return;
  }
  const a = e >>> 28 & 15 | (n & 7) << 4, r = !!(n >> 3);
  if (t.push((r ? a | 128 : a) & 255), !!r) {
    for (let i = 3; i < 31; i = i + 7) {
      const o = n >>> i, s = !!(o >>> 7), u = (s ? o | 128 : o) & 255;
      if (t.push(u), !s)
        return;
    }
    t.push(n >>> 31 & 1);
  }
}
const Rt = 4294967296;
function Mo(e) {
  const n = e[0] === "-";
  n && (e = e.slice(1));
  const t = 1e6;
  let a = 0, r = 0;
  function i(o, s) {
    const u = Number(e.slice(o, s));
    r *= t, a = a * t + u, a >= Rt && (r = r + (a / Rt | 0), a = a % Rt);
  }
  return i(-24, -18), i(-18, -12), i(-12, -6), i(-6), n ? Zd(a, r) : Ga(a, r);
}
function vp(e, n) {
  let t = Ga(e, n);
  const a = t.hi & 2147483648;
  a && (t = Zd(t.lo, t.hi));
  const r = $d(t.lo, t.hi);
  return a ? "-" + r : r;
}
function $d(e, n) {
  if ({ lo: e, hi: n } = Ep(e, n), n <= 2097151)
    return String(Rt * n + e);
  const t = e & 16777215, a = (e >>> 24 | n << 8) & 16777215, r = n >> 16 & 65535;
  let i = t + a * 6777216 + r * 6710656, o = a + r * 8147497, s = r * 2;
  const u = 1e7;
  return i >= u && (o += Math.floor(i / u), i %= u), o >= u && (s += Math.floor(o / u), o %= u), s.toString() + Vo(o) + Vo(i);
}
function Ep(e, n) {
  return { lo: e >>> 0, hi: n >>> 0 };
}
function Ga(e, n) {
  return { lo: e | 0, hi: n | 0 };
}
function Zd(e, n) {
  return n = ~n, e ? e = ~e + 1 : n += 1, Ga(e, n);
}
const Vo = (e) => {
  const n = String(e);
  return "0000000".slice(n.length) + n;
};
function Go(e, n) {
  if (e >= 0) {
    for (; e > 127; )
      n.push(e & 127 | 128), e = e >>> 7;
    n.push(e);
  } else {
    for (let t = 0; t < 9; t++)
      n.push(e & 127 | 128), e = e >> 7;
    n.push(1);
  }
}
function Sp() {
  let e = this.buf[this.pos++], n = e & 127;
  if (!(e & 128))
    return this.assertBounds(), n;
  if (e = this.buf[this.pos++], n |= (e & 127) << 7, !(e & 128))
    return this.assertBounds(), n;
  if (e = this.buf[this.pos++], n |= (e & 127) << 14, !(e & 128))
    return this.assertBounds(), n;
  if (e = this.buf[this.pos++], n |= (e & 127) << 21, !(e & 128))
    return this.assertBounds(), n;
  e = this.buf[this.pos++], n |= (e & 15) << 28;
  for (let t = 5; e & 128 && t < 10; t++)
    e = this.buf[this.pos++];
  if (e & 128)
    throw new Error("invalid varint");
  return this.assertBounds(), n >>> 0;
}
const Me = /* @__PURE__ */ Ip();
function Ip() {
  const e = new DataView(new ArrayBuffer(8));
  if (typeof BigInt == "function" && typeof e.getBigInt64 == "function" && typeof e.getBigUint64 == "function" && typeof e.setBigInt64 == "function" && typeof e.setBigUint64 == "function" && (!!globalThis.Deno || typeof process != "object" || typeof process.env != "object" || process.env.BUF_BIGINT_DISABLE !== "1")) {
    const t = BigInt("-9223372036854775808"), a = BigInt("9223372036854775807"), r = BigInt("0"), i = BigInt("18446744073709551615");
    return {
      zero: BigInt(0),
      supported: !0,
      parse(o) {
        const s = typeof o == "bigint" ? o : BigInt(o);
        if (s > a || s < t)
          throw new Error(`invalid int64: ${o}`);
        return s;
      },
      uParse(o) {
        const s = typeof o == "bigint" ? o : BigInt(o);
        if (s > i || s < r)
          throw new Error(`invalid uint64: ${o}`);
        return s;
      },
      enc(o) {
        return e.setBigInt64(0, this.parse(o), !0), {
          lo: e.getInt32(0, !0),
          hi: e.getInt32(4, !0)
        };
      },
      uEnc(o) {
        return e.setBigInt64(0, this.uParse(o), !0), {
          lo: e.getInt32(0, !0),
          hi: e.getInt32(4, !0)
        };
      },
      dec(o, s) {
        return e.setInt32(0, o, !0), e.setInt32(4, s, !0), e.getBigInt64(0, !0);
      },
      uDec(o, s) {
        return e.setInt32(0, o, !0), e.setInt32(4, s, !0), e.getBigUint64(0, !0);
      }
    };
  }
  return {
    zero: "0",
    supported: !1,
    parse(t) {
      return typeof t != "string" && (t = t.toString()), Bo(t), t;
    },
    uParse(t) {
      return typeof t != "string" && (t = t.toString()), Fo(t), t;
    },
    enc(t) {
      return typeof t != "string" && (t = t.toString()), Bo(t), Mo(t);
    },
    uEnc(t) {
      return typeof t != "string" && (t = t.toString()), Fo(t), Mo(t);
    },
    dec(t, a) {
      return vp(t, a);
    },
    uDec(t, a) {
      return $d(t, a);
    }
  };
}
function Bo(e) {
  if (!/^-?[0-9]+$/.test(e))
    throw new Error("invalid int64: " + e);
}
function Fo(e) {
  if (!/^[0-9]+$/.test(e))
    throw new Error("invalid uint64: " + e);
}
const yr = Symbol.for("@bufbuild/protobuf/text-encoding");
function Jd() {
  if (globalThis[yr] == null) {
    const e = new globalThis.TextEncoder(), n = new globalThis.TextDecoder();
    let t;
    globalThis[yr] = {
      encodeUtf8(a) {
        return e.encode(a);
      },
      decodeUtf8(a, r) {
        return r ? (t === void 0 && (t = new globalThis.TextDecoder("utf-8", { fatal: !0 })), t.decode(a)) : n.decode(a);
      },
      checkUtf8(a) {
        try {
          return encodeURIComponent(a), !0;
        } catch {
          return !1;
        }
      }
    };
  }
  return globalThis[yr];
}
var Xe;
(function(e) {
  e[e.Varint = 0] = "Varint", e[e.Bit64 = 1] = "Bit64", e[e.LengthDelimited = 2] = "LengthDelimited", e[e.StartGroup = 3] = "StartGroup", e[e.EndGroup = 4] = "EndGroup", e[e.Bit32 = 5] = "Bit32";
})(Xe || (Xe = {}));
const _p = 34028234663852886e22, Ap = -34028234663852886e22, Np = 4294967295, Op = 2147483647, Rp = -2147483648;
class I {
  constructor(n = Jd().encodeUtf8) {
    this.encodeUtf8 = n, this.stack = [], this.chunks = [], this.buf = [];
  }
  /**
   * Return all bytes written and reset this writer.
   */
  finish() {
    this.buf.length && (this.chunks.push(new Uint8Array(this.buf)), this.buf = []);
    let n = 0;
    for (let r = 0; r < this.chunks.length; r++)
      n += this.chunks[r].length;
    let t = new Uint8Array(n), a = 0;
    for (let r = 0; r < this.chunks.length; r++)
      t.set(this.chunks[r], a), a += this.chunks[r].length;
    return this.chunks = [], t;
  }
  /**
   * Start a new fork for length-delimited data like a message
   * or a packed repeated field.
   *
   * Must be joined later with `join()`.
   */
  fork() {
    return this.stack.push({ chunks: this.chunks, buf: this.buf }), this.chunks = [], this.buf = [], this;
  }
  /**
   * Join the last fork. Write its length and bytes, then
   * return to the previous state.
   */
  join() {
    let n = this.finish(), t = this.stack.pop();
    if (!t)
      throw new Error("invalid state, fork stack empty");
    return this.chunks = t.chunks, this.buf = t.buf, this.uint32(n.byteLength), this.raw(n);
  }
  /**
   * Writes a tag (field number and wire type).
   *
   * Equivalent to `uint32( (fieldNo << 3 | type) >>> 0 )`.
   *
   * Generated code should compute the tag ahead of time and call `uint32()`.
   */
  tag(n, t) {
    return this.uint32((n << 3 | t) >>> 0);
  }
  /**
   * Write a chunk of raw bytes.
   */
  raw(n) {
    return this.buf.length && (this.chunks.push(new Uint8Array(this.buf)), this.buf = []), this.chunks.push(n), this;
  }
  /**
   * Write a `uint32` value, an unsigned 32 bit varint.
   */
  uint32(n) {
    for (Ho(n); n > 127; )
      this.buf.push(n & 127 | 128), n = n >>> 7;
    return this.buf.push(n), this;
  }
  /**
   * Write a `int32` value, a signed 32 bit varint.
   */
  int32(n) {
    return Ur(n), Go(n, this.buf), this;
  }
  /**
   * Write a `bool` value, a varint.
   */
  bool(n) {
    return this.buf.push(n ? 1 : 0), this;
  }
  /**
   * Write a `bytes` value, length-delimited arbitrary data.
   */
  bytes(n) {
    return this.uint32(n.byteLength), this.raw(n);
  }
  /**
   * Write a `string` value, length-delimited data converted to UTF-8 text.
   */
  string(n) {
    let t = this.encodeUtf8(n);
    return this.uint32(t.byteLength), this.raw(t);
  }
  /**
   * Write a `float` value, 32-bit floating point number.
   */
  float(n) {
    kp(n);
    let t = new Uint8Array(4);
    return new DataView(t.buffer).setFloat32(0, n, !0), this.raw(t);
  }
  /**
   * Write a `double` value, a 64-bit floating point number.
   */
  double(n) {
    let t = new Uint8Array(8);
    return new DataView(t.buffer).setFloat64(0, n, !0), this.raw(t);
  }
  /**
   * Write a `fixed32` value, an unsigned, fixed-length 32-bit integer.
   */
  fixed32(n) {
    Ho(n);
    let t = new Uint8Array(4);
    return new DataView(t.buffer).setUint32(0, n, !0), this.raw(t);
  }
  /**
   * Write a `sfixed32` value, a signed, fixed-length 32-bit integer.
   */
  sfixed32(n) {
    Ur(n);
    let t = new Uint8Array(4);
    return new DataView(t.buffer).setInt32(0, n, !0), this.raw(t);
  }
  /**
   * Write a `sint32` value, a signed, zigzag-encoded 32-bit varint.
   */
  sint32(n) {
    return Ur(n), n = (n << 1 ^ n >> 31) >>> 0, Go(n, this.buf), this;
  }
  /**
   * Write a `sfixed64` value, a signed, fixed-length 64-bit integer.
   */
  sfixed64(n) {
    let t = new Uint8Array(8), a = new DataView(t.buffer), r = Me.enc(n);
    return a.setInt32(0, r.lo, !0), a.setInt32(4, r.hi, !0), this.raw(t);
  }
  /**
   * Write a `fixed64` value, an unsigned, fixed-length 64 bit integer.
   */
  fixed64(n) {
    let t = new Uint8Array(8), a = new DataView(t.buffer), r = Me.uEnc(n);
    return a.setInt32(0, r.lo, !0), a.setInt32(4, r.hi, !0), this.raw(t);
  }
  /**
   * Write a `int64` value, a signed 64-bit varint.
   */
  int64(n) {
    let t = Me.enc(n);
    return Dr(t.lo, t.hi, this.buf), this;
  }
  /**
   * Write a `sint64` value, a signed, zig-zag-encoded 64-bit varint.
   */
  sint64(n) {
    const t = Me.enc(n), a = t.hi >> 31, r = t.lo << 1 ^ a, i = (t.hi << 1 | t.lo >>> 31) ^ a;
    return Dr(r, i, this.buf), this;
  }
  /**
   * Write a `uint64` value, an unsigned 64-bit varint.
   */
  uint64(n) {
    const t = Me.uEnc(n);
    return Dr(t.lo, t.hi, this.buf), this;
  }
}
class h {
  constructor(n, t = Jd().decodeUtf8) {
    this.decodeUtf8 = t, this.varint64 = pp, this.uint32 = Sp, this.buf = n, this.len = n.length, this.pos = 0, this.view = new DataView(n.buffer, n.byteOffset, n.byteLength);
  }
  /**
   * Reads a tag - field number and wire type. Tags are uint32 varints; values
   * that do not fit in uint32 are rejected.
   */
  tag() {
    const n = this.pos, t = this.uint32(), a = this.pos - n;
    if (a > 5 || a == 5 && this.buf[this.pos - 1] > 15)
      throw new Error("illegal tag: varint overflows uint32");
    const r = t >>> 3, i = t & 7;
    if (r <= 0 || i > 5)
      throw new Error("illegal tag: field no " + r + " wire type " + i);
    return [r, i];
  }
  /**
   * Skip one element and return the skipped data.
   *
   * When skipping StartGroup, provide the tags field number to check for
   * matching field number in the EndGroup tag.
   */
  skip(n, t) {
    let a = this.pos;
    switch (n) {
      case Xe.Varint:
        for (; this.buf[this.pos++] & 128; )
          ;
        break;
      case Xe.Bit64:
        this.pos += 4;
      case Xe.Bit32:
        this.pos += 4;
        break;
      case Xe.LengthDelimited:
        let r = this.uint32();
        this.pos += r;
        break;
      case Xe.StartGroup:
        for (; ; ) {
          const [i, o] = this.tag();
          if (o === Xe.EndGroup) {
            if (t !== void 0 && i !== t)
              throw new Error("invalid end group tag");
            break;
          }
          this.skip(o, i);
        }
        break;
      default:
        throw new Error("cant skip wire type " + n);
    }
    return this.assertBounds(), this.buf.subarray(a, this.pos);
  }
  /**
   * Throws error if position in byte array is out of range.
   */
  assertBounds() {
    if (this.pos > this.len)
      throw new RangeError("premature EOF");
  }
  /**
   * Read a `int32` field, a signed 32 bit varint.
   */
  int32() {
    return this.uint32() | 0;
  }
  /**
   * Read a `sint32` field, a signed, zigzag-encoded 32-bit varint.
   */
  sint32() {
    let n = this.uint32();
    return n >>> 1 ^ -(n & 1);
  }
  /**
   * Read a `int64` field, a signed 64-bit varint.
   */
  int64() {
    return Me.dec(...this.varint64());
  }
  /**
   * Read a `uint64` field, an unsigned 64-bit varint.
   */
  uint64() {
    return Me.uDec(...this.varint64());
  }
  /**
   * Read a `sint64` field, a signed, zig-zag-encoded 64-bit varint.
   */
  sint64() {
    let [n, t] = this.varint64(), a = -(n & 1);
    return n = (n >>> 1 | (t & 1) << 31) ^ a, t = t >>> 1 ^ a, Me.dec(n, t);
  }
  /**
   * Read a `bool` field, a variant.
   */
  bool() {
    let [n, t] = this.varint64();
    return n !== 0 || t !== 0;
  }
  /**
   * Read a `fixed32` field, an unsigned, fixed-length 32-bit integer.
   */
  fixed32() {
    return this.view.getUint32((this.pos += 4) - 4, !0);
  }
  /**
   * Read a `sfixed32` field, a signed, fixed-length 32-bit integer.
   */
  sfixed32() {
    return this.view.getInt32((this.pos += 4) - 4, !0);
  }
  /**
   * Read a `fixed64` field, an unsigned, fixed-length 64 bit integer.
   */
  fixed64() {
    return Me.uDec(this.sfixed32(), this.sfixed32());
  }
  /**
   * Read a `fixed64` field, a signed, fixed-length 64-bit integer.
   */
  sfixed64() {
    return Me.dec(this.sfixed32(), this.sfixed32());
  }
  /**
   * Read a `float` field, 32-bit floating point number.
   */
  float() {
    return this.view.getFloat32((this.pos += 4) - 4, !0);
  }
  /**
   * Read a `double` field, a 64-bit floating point number.
   */
  double() {
    return this.view.getFloat64((this.pos += 8) - 8, !0);
  }
  /**
   * Read a `bytes` field, length-delimited arbitrary data.
   */
  bytes() {
    let n = this.uint32(), t = this.pos;
    return this.pos += n, this.assertBounds(), this.buf.subarray(t, t + n);
  }
  /**
   * Read a `string` field, length-delimited data converted to UTF-8 text. If
   * `strict` is true, throw on invalid UTF-8 instead of substituting U+FFFD.
   */
  string(n) {
    return this.decodeUtf8(this.bytes(), n);
  }
}
function Ur(e) {
  if (typeof e == "string")
    e = Number(e);
  else if (typeof e != "number")
    throw new Error("invalid int32: " + typeof e);
  if (!Number.isInteger(e) || e > Op || e < Rp)
    throw new Error("invalid int32: " + e);
}
function Ho(e) {
  if (typeof e == "string")
    e = Number(e);
  else if (typeof e != "number")
    throw new Error("invalid uint32: " + typeof e);
  if (!Number.isInteger(e) || e > Np || e < 0)
    throw new Error("invalid uint32: " + e);
}
function kp(e) {
  if (typeof e == "string") {
    const n = e;
    if (e = Number(e), Number.isNaN(e) && n !== "NaN")
      throw new Error("invalid float32: " + n);
  } else if (typeof e != "number")
    throw new Error("invalid float32: " + typeof e);
  if (Number.isFinite(e) && (e > _p || e < Ap))
    throw new Error("invalid float32: " + e);
}
function Ko() {
  return { typeUrl: "", value: new Uint8Array(0) };
}
const Ee = {
  encode(e, n = new I()) {
    return e.typeUrl !== "" && n.uint32(10).string(e.typeUrl), e.value.length !== 0 && n.uint32(18).bytes(e.value), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Ko();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.typeUrl = t.string();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.value = t.bytes();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Ee.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = Ko();
    return a.typeUrl = (n = e.typeUrl) !== null && n !== void 0 ? n : "", a.value = (t = e.value) !== null && t !== void 0 ? t : new Uint8Array(0), a;
  }
};
var Yo;
(function(e) {
  e[e.CAMERA_KIT_FLAVOR_UNSET = 0] = "CAMERA_KIT_FLAVOR_UNSET", e[e.CAMERA_KIT_FLAVOR_DEBUG = 1] = "CAMERA_KIT_FLAVOR_DEBUG", e[e.CAMERA_KIT_FLAVOR_RELEASE = 2] = "CAMERA_KIT_FLAVOR_RELEASE", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(Yo || (Yo = {}));
var Wo;
(function(e) {
  e[e.CAMERA_KIT_CONNECTIVITY_TYPE_UNSET = 0] = "CAMERA_KIT_CONNECTIVITY_TYPE_UNSET", e[e.CAMERA_KIT_CONNECTIVITY_TYPE_WIFI = 1] = "CAMERA_KIT_CONNECTIVITY_TYPE_WIFI", e[e.CAMERA_KIT_CONNECTIVITY_TYPE_MOBILE = 2] = "CAMERA_KIT_CONNECTIVITY_TYPE_MOBILE", e[e.CAMERA_KIT_CONNECTIVITY_TYPE_UNREACHABLE = 3] = "CAMERA_KIT_CONNECTIVITY_TYPE_UNREACHABLE", e[e.CAMERA_KIT_CONNECTIVITY_TYPE_BLUETOOTH = 4] = "CAMERA_KIT_CONNECTIVITY_TYPE_BLUETOOTH", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(Wo || (Wo = {}));
var zo;
(function(e) {
  e[e.CAMERA_KIT_ENVIRONMENT_UNSET = 0] = "CAMERA_KIT_ENVIRONMENT_UNSET", e[e.CAMERA_KIT_ENVIRONMENT_STAGING = 1] = "CAMERA_KIT_ENVIRONMENT_STAGING", e[e.CAMERA_KIT_ENVIRONMENT_PRODUCTION = 2] = "CAMERA_KIT_ENVIRONMENT_PRODUCTION", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(zo || (zo = {}));
function qo() {
  return {
    extensionName: "",
    extensionVersion: "",
    deviceCluster: "0",
    cameraKitVersion: "",
    lensCoreVersion: "",
    deviceModel: "",
    cameraKitFlavor: 0,
    appId: "",
    deviceConnectivity: 0,
    sessionId: "",
    cameraKitEnvironment: 0
  };
}
const kt = {
  encode(e, n = new I()) {
    return e.extensionName !== "" && n.uint32(10).string(e.extensionName), e.extensionVersion !== "" && n.uint32(18).string(e.extensionVersion), e.deviceCluster !== "0" && n.uint32(24).int64(e.deviceCluster), e.cameraKitVersion !== "" && n.uint32(34).string(e.cameraKitVersion), e.lensCoreVersion !== "" && n.uint32(42).string(e.lensCoreVersion), e.deviceModel !== "" && n.uint32(50).string(e.deviceModel), e.cameraKitFlavor !== 0 && n.uint32(56).int32(e.cameraKitFlavor), e.appId !== "" && n.uint32(66).string(e.appId), e.deviceConnectivity !== 0 && n.uint32(72).int32(e.deviceConnectivity), e.sessionId !== "" && n.uint32(82).string(e.sessionId), e.cameraKitEnvironment !== 0 && n.uint32(88).int32(e.cameraKitEnvironment), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = qo();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.extensionName = t.string();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.extensionVersion = t.string();
          continue;
        }
        case 3: {
          if (i !== 24)
            break;
          r.deviceCluster = t.int64().toString();
          continue;
        }
        case 4: {
          if (i !== 34)
            break;
          r.cameraKitVersion = t.string();
          continue;
        }
        case 5: {
          if (i !== 42)
            break;
          r.lensCoreVersion = t.string();
          continue;
        }
        case 6: {
          if (i !== 50)
            break;
          r.deviceModel = t.string();
          continue;
        }
        case 7: {
          if (i !== 56)
            break;
          r.cameraKitFlavor = t.int32();
          continue;
        }
        case 8: {
          if (i !== 66)
            break;
          r.appId = t.string();
          continue;
        }
        case 9: {
          if (i !== 72)
            break;
          r.deviceConnectivity = t.int32();
          continue;
        }
        case 10: {
          if (i !== 82)
            break;
          r.sessionId = t.string();
          continue;
        }
        case 11: {
          if (i !== 88)
            break;
          r.cameraKitEnvironment = t.int32();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return kt.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r, i, o, s, u, c, d, m;
    const l = qo();
    return l.extensionName = (n = e.extensionName) !== null && n !== void 0 ? n : "", l.extensionVersion = (t = e.extensionVersion) !== null && t !== void 0 ? t : "", l.deviceCluster = (a = e.deviceCluster) !== null && a !== void 0 ? a : "0", l.cameraKitVersion = (r = e.cameraKitVersion) !== null && r !== void 0 ? r : "", l.lensCoreVersion = (i = e.lensCoreVersion) !== null && i !== void 0 ? i : "", l.deviceModel = (o = e.deviceModel) !== null && o !== void 0 ? o : "", l.cameraKitFlavor = (s = e.cameraKitFlavor) !== null && s !== void 0 ? s : 0, l.appId = (u = e.appId) !== null && u !== void 0 ? u : "", l.deviceConnectivity = (c = e.deviceConnectivity) !== null && c !== void 0 ? c : 0, l.sessionId = (d = e.sessionId) !== null && d !== void 0 ? d : "", l.cameraKitEnvironment = (m = e.cameraKitEnvironment) !== null && m !== void 0 ? m : 0, l;
  }
};
function $o() {
  return { seconds: "0", nanos: 0 };
}
const pe = {
  encode(e, n = new I()) {
    return e.seconds !== "0" && n.uint32(8).int64(e.seconds), e.nanos !== 0 && n.uint32(16).int32(e.nanos), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = $o();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.seconds = t.int64().toString();
          continue;
        }
        case 2: {
          if (i !== 16)
            break;
          r.nanos = t.int32();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return pe.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = $o();
    return a.seconds = (n = e.seconds) !== null && n !== void 0 ? n : "0", a.nanos = (t = e.nanos) !== null && t !== void 0 ? t : 0, a;
  }
};
var en;
(function(e) {
  e[e.UNSET = 0] = "UNSET", e[e.TERMS_OF_SERVICE = 1] = "TERMS_OF_SERVICE", e[e.PRIVACY_POLICY = 2] = "PRIVACY_POLICY", e[e.LEARN_MORE = 3] = "LEARN_MORE", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(en || (en = {}));
function Zo() {
  return { documents: [], disabled: !1 };
}
const Gn = {
  encode(e, n = new I()) {
    for (const t of e.documents)
      Nn.encode(t, n.uint32(10).fork()).join();
    return e.disabled !== !1 && n.uint32(16).bool(e.disabled), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Zo();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.documents.push(Nn.decode(t, t.uint32()));
          continue;
        }
        case 2: {
          if (i !== 16)
            break;
          r.disabled = t.bool();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Gn.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = Zo();
    return a.documents = ((n = e.documents) === null || n === void 0 ? void 0 : n.map((r) => Nn.fromPartial(r))) || [], a.disabled = (t = e.disabled) !== null && t !== void 0 ? t : !1, a;
  }
};
function Jo() {
  return { type: 0, webUrl: "", version: "", timestamp: void 0 };
}
const Nn = {
  encode(e, n = new I()) {
    return e.type !== 0 && n.uint32(8).int32(e.type), e.webUrl !== "" && n.uint32(18).string(e.webUrl), e.version !== "" && n.uint32(26).string(e.version), e.timestamp !== void 0 && pe.encode(Tp(e.timestamp), n.uint32(34).fork()).join(), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Jo();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.type = t.int32();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.webUrl = t.string();
          continue;
        }
        case 3: {
          if (i !== 26)
            break;
          r.version = t.string();
          continue;
        }
        case 4: {
          if (i !== 34)
            break;
          r.timestamp = gp(pe.decode(t, t.uint32()));
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Nn.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r;
    const i = Jo();
    return i.type = (n = e.type) !== null && n !== void 0 ? n : 0, i.webUrl = (t = e.webUrl) !== null && t !== void 0 ? t : "", i.version = (a = e.version) !== null && a !== void 0 ? a : "", i.timestamp = (r = e.timestamp) !== null && r !== void 0 ? r : void 0, i;
  }
};
function Tp(e) {
  const n = Math.trunc(e.getTime() / 1e3).toString(), t = e.getTime() % 1e3 * 1e6;
  return { seconds: n, nanos: t };
}
function gp(e) {
  let n = (globalThis.Number(e.seconds) || 0) * 1e3;
  return n += (e.nanos || 0) / 1e6, new globalThis.Date(n);
}
var Xo;
(function(e) {
  e[e.CAMERA_FACING_UNSET = 0] = "CAMERA_FACING_UNSET", e[e.CAMERA_FACING_FRONT = 1] = "CAMERA_FACING_FRONT", e[e.CAMERA_FACING_BACK = 2] = "CAMERA_FACING_BACK", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(Xo || (Xo = {}));
var et;
(function(e) {
  e[e.DEVICE_DEPENDENT_ASSET_UNSET = 0] = "DEVICE_DEPENDENT_ASSET_UNSET", e[e.ASSET = 1] = "ASSET", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(et || (et = {}));
var zn;
(function(e) {
  e[e.PRELOAD_UNSET = 0] = "PRELOAD_UNSET", e[e.ON_DEMAND = 1] = "ON_DEMAND", e[e.REQUIRED = 2] = "REQUIRED", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(zn || (zn = {}));
function Qo() {
  return {
    id: "",
    name: "",
    vendorData: {},
    content: void 0,
    isThirdParty: !1,
    cameraFacingPreference: 0,
    featureMetadata: [],
    lensCreator: void 0,
    scannable: void 0
  };
}
const ve = {
  encode(e, n = new I()) {
    e.id !== "" && n.uint32(10).string(e.id), e.name !== "" && n.uint32(18).string(e.name), Object.entries(e.vendorData).forEach(([t, a]) => {
      Xr.encode({ key: t, value: a }, n.uint32(26).fork()).join();
    }), e.content !== void 0 && Tt.encode(e.content, n.uint32(34).fork()).join(), e.isThirdParty !== !1 && n.uint32(40).bool(e.isThirdParty), e.cameraFacingPreference !== 0 && n.uint32(48).int32(e.cameraFacingPreference);
    for (const t of e.featureMetadata)
      Ee.encode(t, n.uint32(58).fork()).join();
    return e.lensCreator !== void 0 && Pt.encode(e.lensCreator, n.uint32(66).fork()).join(), e.scannable !== void 0 && Lt.encode(e.scannable, n.uint32(74).fork()).join(), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Qo();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.id = t.string();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.name = t.string();
          continue;
        }
        case 3: {
          if (i !== 26)
            break;
          const o = Xr.decode(t, t.uint32());
          o.value !== void 0 && (r.vendorData[o.key] = o.value);
          continue;
        }
        case 4: {
          if (i !== 34)
            break;
          r.content = Tt.decode(t, t.uint32());
          continue;
        }
        case 5: {
          if (i !== 40)
            break;
          r.isThirdParty = t.bool();
          continue;
        }
        case 6: {
          if (i !== 48)
            break;
          r.cameraFacingPreference = t.int32();
          continue;
        }
        case 7: {
          if (i !== 58)
            break;
          r.featureMetadata.push(Ee.decode(t, t.uint32()));
          continue;
        }
        case 8: {
          if (i !== 66)
            break;
          r.lensCreator = Pt.decode(t, t.uint32());
          continue;
        }
        case 9: {
          if (i !== 74)
            break;
          r.scannable = Lt.decode(t, t.uint32());
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return ve.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r, i, o;
    const s = Qo();
    return s.id = (n = e.id) !== null && n !== void 0 ? n : "", s.name = (t = e.name) !== null && t !== void 0 ? t : "", s.vendorData = Object.entries((a = e.vendorData) !== null && a !== void 0 ? a : {}).reduce((u, [c, d]) => (d !== void 0 && (u[c] = globalThis.String(d)), u), {}), s.content = e.content !== void 0 && e.content !== null ? Tt.fromPartial(e.content) : void 0, s.isThirdParty = (r = e.isThirdParty) !== null && r !== void 0 ? r : !1, s.cameraFacingPreference = (i = e.cameraFacingPreference) !== null && i !== void 0 ? i : 0, s.featureMetadata = ((o = e.featureMetadata) === null || o === void 0 ? void 0 : o.map((u) => Ee.fromPartial(u))) || [], s.lensCreator = e.lensCreator !== void 0 && e.lensCreator !== null ? Pt.fromPartial(e.lensCreator) : void 0, s.scannable = e.scannable !== void 0 && e.scannable !== null ? Lt.fromPartial(e.scannable) : void 0, s;
  }
};
function jo() {
  return { key: "", value: "" };
}
const Xr = {
  encode(e, n = new I()) {
    return e.key !== "" && n.uint32(10).string(e.key), e.value !== "" && n.uint32(18).string(e.value), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = jo();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.key = t.string();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.value = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Xr.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = jo();
    return a.key = (n = e.key) !== null && n !== void 0 ? n : "", a.value = (t = e.value) !== null && t !== void 0 ? t : "", a;
  }
};
function xo() {
  return {
    lnsUrl: "",
    lnsSha256: "",
    iconUrl: "",
    preview: void 0,
    assetManifest: [],
    defaultHintId: "",
    hintTranslations: {},
    lnsUrlBolt: "",
    iconUrlBolt: ""
  };
}
const Tt = {
  encode(e, n = new I()) {
    e.lnsUrl !== "" && n.uint32(10).string(e.lnsUrl), e.lnsSha256 !== "" && n.uint32(18).string(e.lnsSha256), e.iconUrl !== "" && n.uint32(26).string(e.iconUrl), e.preview !== void 0 && bt.encode(e.preview, n.uint32(34).fork()).join();
    for (const t of e.assetManifest)
      gt.encode(t, n.uint32(42).fork()).join();
    return e.defaultHintId !== "" && n.uint32(50).string(e.defaultHintId), Object.entries(e.hintTranslations).forEach(([t, a]) => {
      Qr.encode({ key: t, value: a }, n.uint32(58).fork()).join();
    }), e.lnsUrlBolt !== "" && n.uint32(66).string(e.lnsUrlBolt), e.iconUrlBolt !== "" && n.uint32(74).string(e.iconUrlBolt), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = xo();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.lnsUrl = t.string();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.lnsSha256 = t.string();
          continue;
        }
        case 3: {
          if (i !== 26)
            break;
          r.iconUrl = t.string();
          continue;
        }
        case 4: {
          if (i !== 34)
            break;
          r.preview = bt.decode(t, t.uint32());
          continue;
        }
        case 5: {
          if (i !== 42)
            break;
          r.assetManifest.push(gt.decode(t, t.uint32()));
          continue;
        }
        case 6: {
          if (i !== 50)
            break;
          r.defaultHintId = t.string();
          continue;
        }
        case 7: {
          if (i !== 58)
            break;
          const o = Qr.decode(t, t.uint32());
          o.value !== void 0 && (r.hintTranslations[o.key] = o.value);
          continue;
        }
        case 8: {
          if (i !== 66)
            break;
          r.lnsUrlBolt = t.string();
          continue;
        }
        case 9: {
          if (i !== 74)
            break;
          r.iconUrlBolt = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Tt.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r, i, o, s, u;
    const c = xo();
    return c.lnsUrl = (n = e.lnsUrl) !== null && n !== void 0 ? n : "", c.lnsSha256 = (t = e.lnsSha256) !== null && t !== void 0 ? t : "", c.iconUrl = (a = e.iconUrl) !== null && a !== void 0 ? a : "", c.preview = e.preview !== void 0 && e.preview !== null ? bt.fromPartial(e.preview) : void 0, c.assetManifest = ((r = e.assetManifest) === null || r === void 0 ? void 0 : r.map((d) => gt.fromPartial(d))) || [], c.defaultHintId = (i = e.defaultHintId) !== null && i !== void 0 ? i : "", c.hintTranslations = Object.entries((o = e.hintTranslations) !== null && o !== void 0 ? o : {}).reduce((d, [m, l]) => (l !== void 0 && (d[m] = globalThis.String(l)), d), {}), c.lnsUrlBolt = (s = e.lnsUrlBolt) !== null && s !== void 0 ? s : "", c.iconUrlBolt = (u = e.iconUrlBolt) !== null && u !== void 0 ? u : "", c;
  }
};
function es() {
  return { key: "", value: "" };
}
const Qr = {
  encode(e, n = new I()) {
    return e.key !== "" && n.uint32(10).string(e.key), e.value !== "" && n.uint32(18).string(e.value), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = es();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.key = t.string();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.value = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Qr.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = es();
    return a.key = (n = e.key) !== null && n !== void 0 ? n : "", a.value = (t = e.value) !== null && t !== void 0 ? t : "", a;
  }
};
function ns() {
  return { type: 0, id: "", requestTiming: 0, assetUrl: "", assetChecksum: "" };
}
const gt = {
  encode(e, n = new I()) {
    return e.type !== 0 && n.uint32(8).int32(e.type), e.id !== "" && n.uint32(18).string(e.id), e.requestTiming !== 0 && n.uint32(24).int32(e.requestTiming), e.assetUrl !== "" && n.uint32(34).string(e.assetUrl), e.assetChecksum !== "" && n.uint32(42).string(e.assetChecksum), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = ns();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.type = t.int32();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.id = t.string();
          continue;
        }
        case 3: {
          if (i !== 24)
            break;
          r.requestTiming = t.int32();
          continue;
        }
        case 4: {
          if (i !== 34)
            break;
          r.assetUrl = t.string();
          continue;
        }
        case 5: {
          if (i !== 42)
            break;
          r.assetChecksum = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return gt.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r, i;
    const o = ns();
    return o.type = (n = e.type) !== null && n !== void 0 ? n : 0, o.id = (t = e.id) !== null && t !== void 0 ? t : "", o.requestTiming = (a = e.requestTiming) !== null && a !== void 0 ? a : 0, o.assetUrl = (r = e.assetUrl) !== null && r !== void 0 ? r : "", o.assetChecksum = (i = e.assetChecksum) !== null && i !== void 0 ? i : "", o;
  }
};
function ts() {
  return { imageUrl: "", imageSequenceSize: 0, imageSequenceWebpUrlPattern: "" };
}
const bt = {
  encode(e, n = new I()) {
    return e.imageUrl !== "" && n.uint32(10).string(e.imageUrl), e.imageSequenceSize !== 0 && n.uint32(16).int32(e.imageSequenceSize), e.imageSequenceWebpUrlPattern !== "" && n.uint32(26).string(e.imageSequenceWebpUrlPattern), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = ts();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.imageUrl = t.string();
          continue;
        }
        case 2: {
          if (i !== 16)
            break;
          r.imageSequenceSize = t.int32();
          continue;
        }
        case 3: {
          if (i !== 26)
            break;
          r.imageSequenceWebpUrlPattern = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return bt.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a;
    const r = ts();
    return r.imageUrl = (n = e.imageUrl) !== null && n !== void 0 ? n : "", r.imageSequenceSize = (t = e.imageSequenceSize) !== null && t !== void 0 ? t : 0, r.imageSequenceWebpUrlPattern = (a = e.imageSequenceWebpUrlPattern) !== null && a !== void 0 ? a : "", r;
  }
};
function is() {
  return { displayName: "" };
}
const Pt = {
  encode(e, n = new I()) {
    return e.displayName !== "" && n.uint32(10).string(e.displayName), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = is();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.displayName = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Pt.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = is();
    return t.displayName = (n = e.displayName) !== null && n !== void 0 ? n : "", t;
  }
};
function rs() {
  return { snapcodeImageUrl: "", snapcodeDeeplink: "" };
}
const Lt = {
  encode(e, n = new I()) {
    return e.snapcodeImageUrl !== "" && n.uint32(10).string(e.snapcodeImageUrl), e.snapcodeDeeplink !== "" && n.uint32(18).string(e.snapcodeDeeplink), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = rs();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.snapcodeImageUrl = t.string();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.snapcodeDeeplink = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Lt.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = rs();
    return a.snapcodeImageUrl = (n = e.snapcodeImageUrl) !== null && n !== void 0 ? n : "", a.snapcodeDeeplink = (t = e.snapcodeDeeplink) !== null && t !== void 0 ? t : "", a;
  }
};
function as() {
  return { name: "", timestamp: void 0, metric: void 0 };
}
const Ct = {
  encode(e, n = new I()) {
    var t;
    switch (e.name !== "" && n.uint32(10).string(e.name), e.timestamp !== void 0 && pe.encode(bp(e.timestamp), n.uint32(18).fork()).join(), (t = e.metric) === null || t === void 0 ? void 0 : t.$case) {
      case "count":
        n.uint32(24).uint64(e.metric.count);
        break;
      case "latencyMillis":
        n.uint32(32).uint64(e.metric.latencyMillis);
        break;
      case "histogram":
        n.uint32(40).int64(e.metric.histogram);
        break;
    }
    return n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = as();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.name = t.string();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.timestamp = Pp(pe.decode(t, t.uint32()));
          continue;
        }
        case 3: {
          if (i !== 24)
            break;
          r.metric = { $case: "count", count: t.uint64().toString() };
          continue;
        }
        case 4: {
          if (i !== 32)
            break;
          r.metric = { $case: "latencyMillis", latencyMillis: t.uint64().toString() };
          continue;
        }
        case 5: {
          if (i !== 40)
            break;
          r.metric = { $case: "histogram", histogram: t.int64().toString() };
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Ct.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r, i, o, s, u, c, d, m;
    const l = as();
    return l.name = (n = e.name) !== null && n !== void 0 ? n : "", l.timestamp = (t = e.timestamp) !== null && t !== void 0 ? t : void 0, ((a = e.metric) === null || a === void 0 ? void 0 : a.$case) === "count" && ((r = e.metric) === null || r === void 0 ? void 0 : r.count) !== void 0 && ((i = e.metric) === null || i === void 0 ? void 0 : i.count) !== null && (l.metric = { $case: "count", count: e.metric.count }), ((o = e.metric) === null || o === void 0 ? void 0 : o.$case) === "latencyMillis" && ((s = e.metric) === null || s === void 0 ? void 0 : s.latencyMillis) !== void 0 && ((u = e.metric) === null || u === void 0 ? void 0 : u.latencyMillis) !== null && (l.metric = { $case: "latencyMillis", latencyMillis: e.metric.latencyMillis }), ((c = e.metric) === null || c === void 0 ? void 0 : c.$case) === "histogram" && ((d = e.metric) === null || d === void 0 ? void 0 : d.histogram) !== void 0 && ((m = e.metric) === null || m === void 0 ? void 0 : m.histogram) !== null && (l.metric = { $case: "histogram", histogram: e.metric.histogram }), l;
  }
};
function os() {
  return { metrics: [] };
}
const wt = {
  encode(e, n = new I()) {
    for (const t of e.metrics)
      Ct.encode(t, n.uint32(10).fork()).join();
    return n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = os();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.metrics.push(Ct.decode(t, t.uint32()));
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return wt.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = os();
    return t.metrics = ((n = e.metrics) === null || n === void 0 ? void 0 : n.map((a) => Ct.fromPartial(a))) || [], t;
  }
};
function bp(e) {
  const n = Math.trunc(e.getTime() / 1e3).toString(), t = e.getTime() % 1e3 * 1e6;
  return { seconds: n, nanos: t };
}
function Pp(e) {
  let n = (globalThis.Number(e.seconds) || 0) * 1e3;
  return n += (e.nanos || 0) / 1e6, new globalThis.Date(n);
}
var ss;
(function(e) {
  e[e.OS_TYPE_UNSET = 0] = "OS_TYPE_UNSET", e[e.OS_TYPE_ANDROID = 1] = "OS_TYPE_ANDROID", e[e.OS_TYPE_IOS = 2] = "OS_TYPE_IOS", e[e.OS_TYPE_IPAD_OS = 3] = "OS_TYPE_IPAD_OS", e[e.OS_TYPE_MAC_OS = 4] = "OS_TYPE_MAC_OS", e[e.OS_TYPE_WINDOWS = 5] = "OS_TYPE_WINDOWS", e[e.OS_TYPE_LINUX = 6] = "OS_TYPE_LINUX", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(ss || (ss = {}));
var us;
(function(e) {
  e[e.CONNECTIVITY_TYPE_UNSET = 0] = "CONNECTIVITY_TYPE_UNSET", e[e.CONNECTIVITY_TYPE_WIFI = 1] = "CONNECTIVITY_TYPE_WIFI", e[e.CONNECTIVITY_TYPE_MOBILE = 2] = "CONNECTIVITY_TYPE_MOBILE", e[e.CONNECTIVITY_TYPE_UNREACHABLE = 3] = "CONNECTIVITY_TYPE_UNREACHABLE", e[e.CONNECTIVITY_TYPE_BLUETOOTH = 4] = "CONNECTIVITY_TYPE_BLUETOOTH", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(us || (us = {}));
function cs() {
  return { sessionId: "", locale: "", osType: 0, connectivityType: 0 };
}
const Dt = {
  encode(e, n = new I()) {
    return e.sessionId !== "" && n.uint32(10).string(e.sessionId), e.locale !== "" && n.uint32(18).string(e.locale), e.osType !== 0 && n.uint32(24).int32(e.osType), e.connectivityType !== 0 && n.uint32(32).int32(e.connectivityType), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = cs();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.sessionId = t.string();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.locale = t.string();
          continue;
        }
        case 3: {
          if (i !== 24)
            break;
          r.osType = t.int32();
          continue;
        }
        case 4: {
          if (i !== 32)
            break;
          r.connectivityType = t.int32();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Dt.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r;
    const i = cs();
    return i.sessionId = (n = e.sessionId) !== null && n !== void 0 ? n : "", i.locale = (t = e.locale) !== null && t !== void 0 ? t : "", i.osType = (a = e.osType) !== null && a !== void 0 ? a : 0, i.connectivityType = (r = e.connectivityType) !== null && r !== void 0 ? r : 0, i;
  }
};
function ls() {
  return { id: "", rankingData: void 0 };
}
const Xd = {
  encode(e, n = new I()) {
    return e.id !== "" && n.uint32(10).string(e.id), e.rankingData !== void 0 && Dt.encode(e.rankingData, n.uint32(18).fork()).join(), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = ls();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.id = t.string();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.rankingData = Dt.decode(t, t.uint32());
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Xd.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = ls();
    return t.id = (n = e.id) !== null && n !== void 0 ? n : "", t.rankingData = e.rankingData !== void 0 && e.rankingData !== null ? Dt.fromPartial(e.rankingData) : void 0, t;
  }
};
function ds() {
  return { id: "", lenses: [] };
}
const Qd = {
  encode(e, n = new I()) {
    e.id !== "" && n.uint32(10).string(e.id);
    for (const t of e.lenses)
      ve.encode(t, n.uint32(18).fork()).join();
    return n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = ds();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.id = t.string();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.lenses.push(ve.decode(t, t.uint32()));
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Qd.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = ds();
    return a.id = (n = e.id) !== null && n !== void 0 ? n : "", a.lenses = ((t = e.lenses) === null || t === void 0 ? void 0 : t.map((r) => ve.fromPartial(r))) || [], a;
  }
};
function fs() {
  return { lensId: "", groupId: "" };
}
const nt = {
  encode(e, n = new I()) {
    return e.lensId !== "" && n.uint32(10).string(e.lensId), e.groupId !== "" && n.uint32(18).string(e.groupId), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = fs();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.lensId = t.string();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.groupId = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return nt.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = fs();
    return a.lensId = (n = e.lensId) !== null && n !== void 0 ? n : "", a.groupId = (t = e.groupId) !== null && t !== void 0 ? t : "", a;
  }
};
function ms() {
  return { lens: void 0, groupId: "" };
}
const tt = {
  encode(e, n = new I()) {
    return e.lens !== void 0 && ve.encode(e.lens, n.uint32(10).fork()).join(), e.groupId !== "" && n.uint32(18).string(e.groupId), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = ms();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.lens = ve.decode(t, t.uint32());
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.groupId = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return tt.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = ms();
    return t.lens = e.lens !== void 0 && e.lens !== null ? ve.fromPartial(e.lens) : void 0, t.groupId = (n = e.groupId) !== null && n !== void 0 ? n : "", t;
  }
};
function hs() {
  return { getRequests: [] };
}
const jd = {
  encode(e, n = new I()) {
    for (const t of e.getRequests)
      nt.encode(t, n.uint32(10).fork()).join();
    return n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = hs();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.getRequests.push(nt.decode(t, t.uint32()));
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return jd.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = hs();
    return t.getRequests = ((n = e.getRequests) === null || n === void 0 ? void 0 : n.map((a) => nt.fromPartial(a))) || [], t;
  }
};
function ps() {
  return { getResponses: [] };
}
const xd = {
  encode(e, n = new I()) {
    for (const t of e.getResponses)
      tt.encode(t, n.uint32(10).fork()).join();
    return n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = ps();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.getResponses.push(tt.decode(t, t.uint32()));
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return xd.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = ps();
    return t.getResponses = ((n = e.getResponses) === null || n === void 0 ? void 0 : n.map((a) => tt.fromPartial(a))) || [], t;
  }
};
function vs() {
  return {};
}
const ef = {
  encode(e, n = new I()) {
    return n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = vs();
    for (; t.pos < a; ) {
      const i = t.uint32();
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return ef.fromPartial(e ?? {});
  },
  fromPartial(e) {
    return vs();
  }
};
function Es() {
  return { configs: {} };
}
const nf = {
  encode(e, n = new I()) {
    return Object.entries(e.configs).forEach(([t, a]) => {
      jr.encode({ key: t, value: a }, n.uint32(10).fork()).join();
    }), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Es();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          const o = jr.decode(t, t.uint32());
          o.value !== void 0 && (r.configs[o.key] = o.value);
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return nf.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = Es();
    return t.configs = Object.entries((n = e.configs) !== null && n !== void 0 ? n : {}).reduce((a, [r, i]) => (i !== void 0 && (a[r] = globalThis.String(i)), a), {}), t;
  }
};
function Ss() {
  return { key: "", value: "" };
}
const jr = {
  encode(e, n = new I()) {
    return e.key !== "" && n.uint32(10).string(e.key), e.value !== "" && n.uint32(18).string(e.value), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Ss();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.key = t.string();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.value = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return jr.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = Ss();
    return a.key = (n = e.key) !== null && n !== void 0 ? n : "", a.value = (t = e.value) !== null && t !== void 0 ? t : "", a;
  }
};
function Is() {
  return {};
}
const tf = {
  encode(e, n = new I()) {
    return n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Is();
    for (; t.pos < a; ) {
      const i = t.uint32();
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return tf.fromPartial(e ?? {});
  },
  fromPartial(e) {
    return Is();
  }
};
function _s() {
  return {
    appVendorUuidOptIn: !1,
    watermarkEnabled: !1,
    childrenProtectionActRestricted: !1,
    legalPrompt: void 0
  };
}
const Ba = {
  encode(e, n = new I()) {
    return e.appVendorUuidOptIn !== !1 && n.uint32(8).bool(e.appVendorUuidOptIn), e.watermarkEnabled !== !1 && n.uint32(16).bool(e.watermarkEnabled), e.childrenProtectionActRestricted !== !1 && n.uint32(24).bool(e.childrenProtectionActRestricted), e.legalPrompt !== void 0 && Gn.encode(e.legalPrompt, n.uint32(34).fork()).join(), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = _s();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.appVendorUuidOptIn = t.bool();
          continue;
        }
        case 2: {
          if (i !== 16)
            break;
          r.watermarkEnabled = t.bool();
          continue;
        }
        case 3: {
          if (i !== 24)
            break;
          r.childrenProtectionActRestricted = t.bool();
          continue;
        }
        case 4: {
          if (i !== 34)
            break;
          r.legalPrompt = Gn.decode(t, t.uint32());
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Ba.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a;
    const r = _s();
    return r.appVendorUuidOptIn = (n = e.appVendorUuidOptIn) !== null && n !== void 0 ? n : !1, r.watermarkEnabled = (t = e.watermarkEnabled) !== null && t !== void 0 ? t : !1, r.childrenProtectionActRestricted = (a = e.childrenProtectionActRestricted) !== null && a !== void 0 ? a : !1, r.legalPrompt = e.legalPrompt !== void 0 && e.legalPrompt !== null ? Gn.fromPartial(e.legalPrompt) : void 0, r;
  }
};
function As() {
  return { metrics: void 0 };
}
const rf = {
  encode(e, n = new I()) {
    return e.metrics !== void 0 && wt.encode(e.metrics, n.uint32(10).fork()).join(), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = As();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.metrics = wt.decode(t, t.uint32());
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return rf.fromPartial(e ?? {});
  },
  fromPartial(e) {
    const n = As();
    return n.metrics = e.metrics !== void 0 && e.metrics !== null ? wt.fromPartial(e.metrics) : void 0, n;
  }
};
function Ns() {
  return {};
}
const af = {
  encode(e, n = new I()) {
    return n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Ns();
    for (; t.pos < a; ) {
      const i = t.uint32();
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return af.fromPartial(e ?? {});
  },
  fromPartial(e) {
    return Ns();
  }
};
function Os() {
  return { batchEvents: void 0 };
}
const of = {
  encode(e, n = new I()) {
    return e.batchEvents !== void 0 && Ee.encode(e.batchEvents, n.uint32(10).fork()).join(), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Os();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.batchEvents = Ee.decode(t, t.uint32());
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return of.fromPartial(e ?? {});
  },
  fromPartial(e) {
    const n = Os();
    return n.batchEvents = e.batchEvents !== void 0 && e.batchEvents !== null ? Ee.fromPartial(e.batchEvents) : void 0, n;
  }
};
function Rs() {
  return {};
}
const sf = {
  encode(e, n = new I()) {
    return n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Rs();
    for (; t.pos < a; ) {
      const i = t.uint32();
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return sf.fromPartial(e ?? {});
  },
  fromPartial(e) {
    return Rs();
  }
};
function ks() {
  return { events: [], extensionEventBase: void 0 };
}
const uf = {
  encode(e, n = new I()) {
    for (const t of e.events)
      Ee.encode(t, n.uint32(10).fork()).join();
    return e.extensionEventBase !== void 0 && kt.encode(e.extensionEventBase, n.uint32(18).fork()).join(), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = ks();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.events.push(Ee.decode(t, t.uint32()));
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.extensionEventBase = kt.decode(t, t.uint32());
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return uf.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = ks();
    return t.events = ((n = e.events) === null || n === void 0 ? void 0 : n.map((a) => Ee.fromPartial(a))) || [], t.extensionEventBase = e.extensionEventBase !== void 0 && e.extensionEventBase !== null ? kt.fromPartial(e.extensionEventBase) : void 0, t;
  }
};
function Ts() {
  return {};
}
const cf = {
  encode(e, n = new I()) {
    return n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Ts();
    for (; t.pos < a; ) {
      const i = t.uint32();
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return cf.fromPartial(e ?? {});
  },
  fromPartial(e) {
    return Ts();
  }
}, Lp = {
  fullName: "com.snap.camerakit.v3.Lenses",
  methods: {
    getGroup: {
      name: "GetGroup",
      requestType: Xd,
      requestStream: !1,
      responseType: Qd,
      responseStream: !1,
      options: {
        idempotencyLevel: "NO_SIDE_EFFECTS",
        _unknownFields: {
          578365826: [
            new Uint8Array([
              43,
              18,
              41,
              47,
              99,
              111,
              109,
              46,
              115,
              110,
              97,
              112,
              46,
              99,
              97,
              109,
              101,
              114,
              97,
              107,
              105,
              116,
              46,
              118,
              51,
              46,
              76,
              101,
              110,
              115,
              101,
              115,
              47,
              103,
              114,
              111,
              117,
              112,
              115,
              47,
              123,
              105,
              100,
              125
            ])
          ]
        }
      }
    },
    getGroupLens: {
      name: "GetGroupLens",
      requestType: nt,
      requestStream: !1,
      responseType: tt,
      responseStream: !1,
      options: {
        idempotencyLevel: "NO_SIDE_EFFECTS",
        _unknownFields: {
          578365826: [
            new Uint8Array([
              66,
              18,
              64,
              47,
              99,
              111,
              109,
              46,
              115,
              110,
              97,
              112,
              46,
              99,
              97,
              109,
              101,
              114,
              97,
              107,
              105,
              116,
              46,
              118,
              51,
              46,
              76,
              101,
              110,
              115,
              101,
              115,
              47,
              103,
              114,
              111,
              117,
              112,
              115,
              47,
              123,
              103,
              114,
              111,
              117,
              112,
              95,
              105,
              100,
              125,
              47,
              108,
              101,
              110,
              115,
              101,
              115,
              47,
              123,
              108,
              101,
              110,
              115,
              95,
              105,
              100,
              125
            ])
          ]
        }
      }
    },
    batchGetGroupLens: {
      name: "BatchGetGroupLens",
      requestType: jd,
      requestStream: !1,
      responseType: xd,
      responseStream: !1,
      options: {
        idempotencyLevel: "NO_SIDE_EFFECTS",
        _unknownFields: {
          578365826: [
            new Uint8Array([
              58,
              34,
              53,
              47,
              99,
              111,
              109,
              46,
              115,
              110,
              97,
              112,
              46,
              99,
              97,
              109,
              101,
              114,
              97,
              107,
              105,
              116,
              46,
              118,
              51,
              46,
              76,
              101,
              110,
              115,
              101,
              115,
              47,
              103,
              114,
              111,
              117,
              112,
              115,
              95,
              108,
              101,
              110,
              115,
              101,
              115,
              47,
              98,
              97,
              116,
              99,
              104,
              95,
              103,
              101,
              116,
              58,
              1,
              42
            ])
          ]
        }
      }
    },
    getPlaceholderConfig: {
      name: "GetPlaceholderConfig",
      requestType: ef,
      requestStream: !1,
      responseType: nf,
      responseStream: !1,
      options: {
        idempotencyLevel: "NO_SIDE_EFFECTS",
        _unknownFields: {
          578365826: [
            new Uint8Array([
              50,
              18,
              48,
              47,
              99,
              111,
              109,
              46,
              115,
              110,
              97,
              112,
              46,
              99,
              97,
              109,
              101,
              114,
              97,
              107,
              105,
              116,
              46,
              118,
              51,
              46,
              76,
              101,
              110,
              115,
              101,
              115,
              47,
              112,
              108,
              97,
              99,
              101,
              104,
              111,
              108,
              100,
              101,
              114,
              95,
              99,
              111,
              110,
              102,
              105,
              103
            ])
          ]
        }
      }
    }
  }
}, Qi = {
  fullName: "com.snap.camerakit.v3.Metrics",
  methods: {
    setOperationalMetrics: {
      name: "SetOperationalMetrics",
      requestType: rf,
      requestStream: !1,
      responseType: af,
      responseStream: !1,
      options: {
        _unknownFields: {
          578365826: [
            new Uint8Array([
              63,
              34,
              58,
              47,
              99,
              111,
              109,
              46,
              115,
              110,
              97,
              112,
              46,
              99,
              97,
              109,
              101,
              114,
              97,
              107,
              105,
              116,
              46,
              118,
              51,
              46,
              77,
              101,
              116,
              114,
              105,
              99,
              115,
              47,
              109,
              101,
              116,
              114,
              105,
              99,
              115,
              47,
              111,
              112,
              101,
              114,
              97,
              116,
              105,
              111,
              110,
              97,
              108,
              95,
              109,
              101,
              116,
              114,
              105,
              99,
              115,
              58,
              1,
              42
            ])
          ]
        }
      }
    },
    setBusinessEvents: {
      name: "SetBusinessEvents",
      requestType: of,
      requestStream: !1,
      responseType: sf,
      responseStream: !1,
      options: {
        _unknownFields: {
          578365826: [
            new Uint8Array([
              59,
              34,
              54,
              47,
              99,
              111,
              109,
              46,
              115,
              110,
              97,
              112,
              46,
              99,
              97,
              109,
              101,
              114,
              97,
              107,
              105,
              116,
              46,
              118,
              51,
              46,
              77,
              101,
              116,
              114,
              105,
              99,
              115,
              47,
              109,
              101,
              116,
              114,
              105,
              99,
              115,
              47,
              98,
              117,
              115,
              105,
              110,
              101,
              115,
              115,
              95,
              101,
              118,
              101,
              110,
              116,
              115,
              58,
              1,
              42
            ])
          ]
        }
      }
    },
    setExtensionBusinessEvents: {
      name: "SetExtensionBusinessEvents",
      requestType: uf,
      requestStream: !1,
      responseType: cf,
      responseStream: !1,
      options: {
        _unknownFields: {
          578365826: [
            new Uint8Array([
              69,
              34,
              64,
              47,
              99,
              111,
              109,
              46,
              115,
              110,
              97,
              112,
              46,
              99,
              97,
              109,
              101,
              114,
              97,
              107,
              105,
              116,
              46,
              118,
              51,
              46,
              77,
              101,
              116,
              114,
              105,
              99,
              115,
              47,
              109,
              101,
              116,
              114,
              105,
              99,
              115,
              47,
              101,
              120,
              116,
              101,
              110,
              115,
              105,
              111,
              110,
              95,
              98,
              117,
              115,
              105,
              110,
              101,
              115,
              115,
              95,
              101,
              118,
              101,
              110,
              116,
              115,
              58,
              1,
              42
            ])
          ]
        }
      }
    },
    getInitializationConfig: {
      name: "GetInitializationConfig",
      requestType: tf,
      requestStream: !1,
      responseType: Ba,
      responseStream: !1,
      options: {
        idempotencyLevel: "NO_SIDE_EFFECTS",
        _unknownFields: {
          578365826: [
            new Uint8Array([
              62,
              18,
              60,
              47,
              99,
              111,
              109,
              46,
              115,
              110,
              97,
              112,
              46,
              99,
              97,
              109,
              101,
              114,
              97,
              107,
              105,
              116,
              46,
              118,
              51,
              46,
              77,
              101,
              116,
              114,
              105,
              99,
              115,
              47,
              109,
              101,
              116,
              114,
              105,
              99,
              115,
              47,
              105,
              110,
              105,
              116,
              105,
              97,
              108,
              105,
              122,
              97,
              116,
              105,
              111,
              110,
              95,
              99,
              111,
              110,
              102,
              105,
              103
            ])
          ]
        }
      }
    }
  }
};
var lf = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : typeof global < "u" ? global : typeof self < "u" ? self : {}, df = { exports: {} };
(function(e, n) {
  (function(t, a) {
    e.exports = a();
  })(lf, function() {
    return t = { 418: function(r, i) {
      (function(o, s) {
        for (var u in s) o[u] = s[u];
      })(i, function(o) {
        var s = {};
        function u(c) {
          if (s[c]) return s[c].exports;
          var d = s[c] = { i: c, l: !1, exports: {} };
          return o[c].call(d.exports, d, d.exports, u), d.l = !0, d.exports;
        }
        return u.m = o, u.c = s, u.i = function(c) {
          return c;
        }, u.d = function(c, d, m) {
          u.o(c, d) || Object.defineProperty(c, d, { configurable: !1, enumerable: !0, get: m });
        }, u.n = function(c) {
          var d = c && c.__esModule ? function() {
            return c.default;
          } : function() {
            return c;
          };
          return u.d(d, "a", d), d;
        }, u.o = function(c, d) {
          return Object.prototype.hasOwnProperty.call(c, d);
        }, u.p = "", u(u.s = 1);
      }([function(o, s, u) {
        Object.defineProperty(s, "__esModule", { value: !0 });
        var c = u(3), d = function() {
          function m(l, f) {
            l === void 0 && (l = {}), f === void 0 && (f = { splitValues: !1 });
            var E, v = this;
            this.headersMap = {}, l && (typeof Headers < "u" && l instanceof Headers ? c.getHeaderKeys(l).forEach(function(p) {
              c.getHeaderValues(l, p).forEach(function(S) {
                f.splitValues ? v.append(p, c.splitHeaderValue(S)) : v.append(p, S);
              });
            }) : typeof (E = l) == "object" && typeof E.headersMap == "object" && typeof E.forEach == "function" ? l.forEach(function(p, S) {
              v.append(p, S);
            }) : typeof Map < "u" && l instanceof Map ? l.forEach(function(p, S) {
              v.append(S, p);
            }) : typeof l == "string" ? this.appendFromString(l) : typeof l == "object" && Object.getOwnPropertyNames(l).forEach(function(p) {
              var S = l[p];
              Array.isArray(S) ? S.forEach(function(_) {
                v.append(p, _);
              }) : v.append(p, S);
            }));
          }
          return m.prototype.appendFromString = function(l) {
            for (var f = l.split(`\r
`), E = 0; E < f.length; E++) {
              var v = f[E], p = v.indexOf(":");
              if (p > 0) {
                var S = v.substring(0, p).trim(), _ = v.substring(p + 1).trim();
                this.append(S, _);
              }
            }
          }, m.prototype.delete = function(l, f) {
            var E = c.normalizeName(l);
            if (f === void 0) delete this.headersMap[E];
            else {
              var v = this.headersMap[E];
              if (v) {
                var p = v.indexOf(f);
                p >= 0 && v.splice(p, 1), v.length === 0 && delete this.headersMap[E];
              }
            }
          }, m.prototype.append = function(l, f) {
            var E = this, v = c.normalizeName(l);
            Array.isArray(this.headersMap[v]) || (this.headersMap[v] = []), Array.isArray(f) ? f.forEach(function(p) {
              E.headersMap[v].push(c.normalizeValue(p));
            }) : this.headersMap[v].push(c.normalizeValue(f));
          }, m.prototype.set = function(l, f) {
            var E = c.normalizeName(l);
            if (Array.isArray(f)) {
              var v = [];
              f.forEach(function(p) {
                v.push(c.normalizeValue(p));
              }), this.headersMap[E] = v;
            } else this.headersMap[E] = [c.normalizeValue(f)];
          }, m.prototype.has = function(l, f) {
            var E = this.headersMap[c.normalizeName(l)];
            if (!Array.isArray(E)) return !1;
            if (f !== void 0) {
              var v = c.normalizeValue(f);
              return E.indexOf(v) >= 0;
            }
            return !0;
          }, m.prototype.get = function(l) {
            var f = this.headersMap[c.normalizeName(l)];
            return f !== void 0 ? f.concat() : [];
          }, m.prototype.forEach = function(l) {
            var f = this;
            Object.getOwnPropertyNames(this.headersMap).forEach(function(E) {
              l(E, f.headersMap[E]);
            }, this);
          }, m.prototype.toHeaders = function() {
            if (typeof Headers < "u") {
              var l = new Headers();
              return this.forEach(function(f, E) {
                E.forEach(function(v) {
                  l.append(f, v);
                });
              }), l;
            }
            throw new Error("Headers class is not defined");
          }, m;
        }();
        s.BrowserHeaders = d;
      }, function(o, s, u) {
        Object.defineProperty(s, "__esModule", { value: !0 });
        var c = u(0);
        s.BrowserHeaders = c.BrowserHeaders;
      }, function(o, s, u) {
        Object.defineProperty(s, "__esModule", { value: !0 }), s.iterateHeaders = function(c, d) {
          for (var m = c[Symbol.iterator](), l = m.next(); !l.done; ) d(l.value[0]), l = m.next();
        }, s.iterateHeadersKeys = function(c, d) {
          for (var m = c.keys(), l = m.next(); !l.done; ) d(l.value), l = m.next();
        };
      }, function(o, s, u) {
        Object.defineProperty(s, "__esModule", { value: !0 });
        var c = u(2);
        s.normalizeName = function(d) {
          if (typeof d != "string" && (d = String(d)), /[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(d)) throw new TypeError("Invalid character in header field name");
          return d.toLowerCase();
        }, s.normalizeValue = function(d) {
          return typeof d != "string" && (d = String(d)), d;
        }, s.getHeaderValues = function(d, m) {
          var l = d;
          if (l instanceof Headers && l.getAll) return l.getAll(m);
          var f = l.get(m);
          return f && typeof f == "string" ? [f] : f;
        }, s.getHeaderKeys = function(d) {
          var m = d, l = {}, f = [];
          return m.keys ? c.iterateHeadersKeys(m, function(E) {
            l[E] || (l[E] = !0, f.push(E));
          }) : m.forEach ? m.forEach(function(E, v) {
            l[v] || (l[v] = !0, f.push(v));
          }) : c.iterateHeaders(m, function(E) {
            var v = E[0];
            l[v] || (l[v] = !0, f.push(v));
          }), f;
        }, s.splitHeaderValue = function(d) {
          var m = [];
          return d.split(", ").forEach(function(l) {
            l.split(",").forEach(function(f) {
              m.push(f);
            });
          }), m;
        };
      }]));
    }, 617: function(r, i, o) {
      Object.defineProperty(i, "__esModule", { value: !0 }), i.ChunkParser = i.ChunkType = i.encodeASCII = i.decodeASCII = void 0;
      var s, u = o(65);
      function c(p) {
        return (S = p) === 9 || S === 10 || S === 13 || p >= 32 && p <= 126;
        var S;
      }
      function d(p) {
        for (var S = 0; S !== p.length; ++S) if (!c(p[S])) throw new Error("Metadata is not valid (printable) ASCII");
        return String.fromCharCode.apply(String, Array.prototype.slice.call(p));
      }
      function m(p) {
        return (128 & p.getUint8(0)) == 128;
      }
      function l(p) {
        return p.getUint32(1, !1);
      }
      function f(p, S, _) {
        return p.byteLength - S >= _;
      }
      function E(p, S, _) {
        if (p.slice) return p.slice(S, _);
        var A = p.length;
        _ !== void 0 && (A = _);
        for (var N = new Uint8Array(A - S), k = 0, C = S; C < A; C++) N[k++] = p[C];
        return N;
      }
      i.decodeASCII = d, i.encodeASCII = function(p) {
        for (var S = new Uint8Array(p.length), _ = 0; _ !== p.length; ++_) {
          var A = p.charCodeAt(_);
          if (!c(A)) throw new Error("Metadata contains invalid ASCII");
          S[_] = A;
        }
        return S;
      }, function(p) {
        p[p.MESSAGE = 1] = "MESSAGE", p[p.TRAILERS = 2] = "TRAILERS";
      }(s = i.ChunkType || (i.ChunkType = {}));
      var v = function() {
        function p() {
          this.buffer = null, this.position = 0;
        }
        return p.prototype.parse = function(S, _) {
          if (S.length === 0 && _) return [];
          var A, N = [];
          if (this.buffer == null) this.buffer = S, this.position = 0;
          else if (this.position === this.buffer.byteLength) this.buffer = S, this.position = 0;
          else {
            var k = this.buffer.byteLength - this.position, C = new Uint8Array(k + S.byteLength), M = E(this.buffer, this.position);
            C.set(M, 0);
            var q = new Uint8Array(S);
            C.set(q, k), this.buffer = C, this.position = 0;
          }
          for (; ; ) {
            if (!f(this.buffer, this.position, 5)) return N;
            var w = E(this.buffer, this.position, this.position + 5), we = new DataView(w.buffer, w.byteOffset, w.byteLength), ge = l(we);
            if (!f(this.buffer, this.position, 5 + ge)) return N;
            var De = E(this.buffer, this.position + 5, this.position + 5 + ge);
            if (this.position += 5 + ge, m(we)) return N.push({ chunkType: s.TRAILERS, trailers: (A = De, new u.Metadata(d(A))) }), N;
            N.push({ chunkType: s.MESSAGE, data: De });
          }
        }, p;
      }();
      i.ChunkParser = v;
    }, 8: function(r, i) {
      var o;
      Object.defineProperty(i, "__esModule", { value: !0 }), i.httpStatusToCode = i.Code = void 0, function(s) {
        s[s.OK = 0] = "OK", s[s.Canceled = 1] = "Canceled", s[s.Unknown = 2] = "Unknown", s[s.InvalidArgument = 3] = "InvalidArgument", s[s.DeadlineExceeded = 4] = "DeadlineExceeded", s[s.NotFound = 5] = "NotFound", s[s.AlreadyExists = 6] = "AlreadyExists", s[s.PermissionDenied = 7] = "PermissionDenied", s[s.ResourceExhausted = 8] = "ResourceExhausted", s[s.FailedPrecondition = 9] = "FailedPrecondition", s[s.Aborted = 10] = "Aborted", s[s.OutOfRange = 11] = "OutOfRange", s[s.Unimplemented = 12] = "Unimplemented", s[s.Internal = 13] = "Internal", s[s.Unavailable = 14] = "Unavailable", s[s.DataLoss = 15] = "DataLoss", s[s.Unauthenticated = 16] = "Unauthenticated";
      }(o = i.Code || (i.Code = {})), i.httpStatusToCode = function(s) {
        switch (s) {
          case 0:
            return o.Internal;
          case 200:
            return o.OK;
          case 400:
            return o.InvalidArgument;
          case 401:
            return o.Unauthenticated;
          case 403:
            return o.PermissionDenied;
          case 404:
            return o.NotFound;
          case 409:
            return o.Aborted;
          case 412:
            return o.FailedPrecondition;
          case 429:
            return o.ResourceExhausted;
          case 499:
            return o.Canceled;
          case 500:
            return o.Unknown;
          case 501:
            return o.Unimplemented;
          case 503:
            return o.Unavailable;
          case 504:
            return o.DeadlineExceeded;
          default:
            return o.Unknown;
        }
      };
    }, 934: function(r, i, o) {
      Object.defineProperty(i, "__esModule", { value: !0 }), i.client = void 0;
      var s = o(65), u = o(617), c = o(8), d = o(346), m = o(57), l = o(882);
      i.client = function(v, p) {
        return new f(v, p);
      };
      var f = function() {
        function v(p, S) {
          this.started = !1, this.sentFirstMessage = !1, this.completed = !1, this.closed = !1, this.finishedSending = !1, this.onHeadersCallbacks = [], this.onMessageCallbacks = [], this.onEndCallbacks = [], this.parser = new u.ChunkParser(), this.methodDefinition = p, this.props = S, this.createTransport();
        }
        return v.prototype.createTransport = function() {
          var p = this.props.host + "/" + this.methodDefinition.service.serviceName + "/" + this.methodDefinition.methodName, S = { methodDefinition: this.methodDefinition, debug: this.props.debug || !1, url: p, onHeaders: this.onTransportHeaders.bind(this), onChunk: this.onTransportChunk.bind(this), onEnd: this.onTransportEnd.bind(this) };
          this.props.transport ? this.transport = this.props.transport(S) : this.transport = m.makeDefaultTransport(S);
        }, v.prototype.onTransportHeaders = function(p, S) {
          if (this.props.debug && d.debug("onHeaders", p, S), this.closed) this.props.debug && d.debug("grpc.onHeaders received after request was closed - ignoring");
          else if (S !== 0) {
            this.responseHeaders = p, this.props.debug && d.debug("onHeaders.responseHeaders", JSON.stringify(this.responseHeaders, null, 2));
            var _ = E(p);
            this.props.debug && d.debug("onHeaders.gRPCStatus", _);
            var A = _ && _ >= 0 ? _ : c.httpStatusToCode(S);
            this.props.debug && d.debug("onHeaders.code", A);
            var N = p.get("grpc-message") || [];
            if (this.props.debug && d.debug("onHeaders.gRPCMessage", N), this.rawOnHeaders(p), A !== c.Code.OK) {
              var k = this.decodeGRPCStatus(N[0]);
              this.rawOnError(A, k, p);
            }
          }
        }, v.prototype.onTransportChunk = function(p) {
          var S = this;
          if (this.closed) this.props.debug && d.debug("grpc.onChunk received after request was closed - ignoring");
          else {
            var _ = [];
            try {
              _ = this.parser.parse(p);
            } catch (A) {
              return this.props.debug && d.debug("onChunk.parsing error", A, A.message), void this.rawOnError(c.Code.Internal, "parsing error: " + A.message);
            }
            _.forEach(function(A) {
              if (A.chunkType === u.ChunkType.MESSAGE) {
                var N = S.methodDefinition.responseType.deserializeBinary(A.data);
                S.rawOnMessage(N);
              } else A.chunkType === u.ChunkType.TRAILERS && (S.responseHeaders ? (S.responseTrailers = new s.Metadata(A.trailers), S.props.debug && d.debug("onChunk.trailers", S.responseTrailers)) : (S.responseHeaders = new s.Metadata(A.trailers), S.rawOnHeaders(S.responseHeaders)));
            });
          }
        }, v.prototype.onTransportEnd = function() {
          if (this.props.debug && d.debug("grpc.onEnd"), this.closed) this.props.debug && d.debug("grpc.onEnd received after request was closed - ignoring");
          else if (this.responseTrailers !== void 0) {
            var p = E(this.responseTrailers);
            if (p !== null) {
              var S = this.responseTrailers.get("grpc-message"), _ = this.decodeGRPCStatus(S[0]);
              this.rawOnEnd(p, _, this.responseTrailers);
            } else this.rawOnError(c.Code.Internal, "Response closed without grpc-status (Trailers provided)");
          } else {
            if (this.responseHeaders === void 0) return void this.rawOnError(c.Code.Unknown, "Response closed without headers");
            var A = E(this.responseHeaders), N = this.responseHeaders.get("grpc-message");
            if (this.props.debug && d.debug("grpc.headers only response ", A, N), A === null) return void this.rawOnEnd(c.Code.Unknown, "Response closed without grpc-status (Headers only)", this.responseHeaders);
            var k = this.decodeGRPCStatus(N[0]);
            this.rawOnEnd(A, k, this.responseHeaders);
          }
        }, v.prototype.decodeGRPCStatus = function(p) {
          if (!p) return "";
          try {
            return decodeURIComponent(p);
          } catch {
            return p;
          }
        }, v.prototype.rawOnEnd = function(p, S, _) {
          var A = this;
          this.props.debug && d.debug("rawOnEnd", p, S, _), this.completed || (this.completed = !0, this.onEndCallbacks.forEach(function(N) {
            if (!A.closed) try {
              N(p, S, _);
            } catch (k) {
              setTimeout(function() {
                throw k;
              }, 0);
            }
          }));
        }, v.prototype.rawOnHeaders = function(p) {
          this.props.debug && d.debug("rawOnHeaders", p), this.completed || this.onHeadersCallbacks.forEach(function(S) {
            try {
              S(p);
            } catch (_) {
              setTimeout(function() {
                throw _;
              }, 0);
            }
          });
        }, v.prototype.rawOnError = function(p, S, _) {
          var A = this;
          _ === void 0 && (_ = new s.Metadata()), this.props.debug && d.debug("rawOnError", p, S), this.completed || (this.completed = !0, this.onEndCallbacks.forEach(function(N) {
            if (!A.closed) try {
              N(p, S, _);
            } catch (k) {
              setTimeout(function() {
                throw k;
              }, 0);
            }
          }));
        }, v.prototype.rawOnMessage = function(p) {
          var S = this;
          this.props.debug && d.debug("rawOnMessage", p.toObject()), this.completed || this.closed || this.onMessageCallbacks.forEach(function(_) {
            if (!S.closed) try {
              _(p);
            } catch (A) {
              setTimeout(function() {
                throw A;
              }, 0);
            }
          });
        }, v.prototype.onHeaders = function(p) {
          this.onHeadersCallbacks.push(p);
        }, v.prototype.onMessage = function(p) {
          this.onMessageCallbacks.push(p);
        }, v.prototype.onEnd = function(p) {
          this.onEndCallbacks.push(p);
        }, v.prototype.start = function(p) {
          if (this.started) throw new Error("Client already started - cannot .start()");
          this.started = !0;
          var S = new s.Metadata(p || {});
          S.set("content-type", "application/grpc-web+proto"), S.set("x-grpc-web", "1"), this.transport.start(S);
        }, v.prototype.send = function(p) {
          if (!this.started) throw new Error("Client not started - .start() must be called before .send()");
          if (this.closed) throw new Error("Client already closed - cannot .send()");
          if (this.finishedSending) throw new Error("Client already finished sending - cannot .send()");
          if (!this.methodDefinition.requestStream && this.sentFirstMessage) throw new Error("Message already sent for non-client-streaming method - cannot .send()");
          this.sentFirstMessage = !0;
          var S = l.frameRequest(p);
          this.transport.sendMessage(S);
        }, v.prototype.finishSend = function() {
          if (!this.started) throw new Error("Client not started - .finishSend() must be called before .close()");
          if (this.closed) throw new Error("Client already closed - cannot .send()");
          if (this.finishedSending) throw new Error("Client already finished sending - cannot .finishSend()");
          this.finishedSending = !0, this.transport.finishSend();
        }, v.prototype.close = function() {
          if (!this.started) throw new Error("Client not started - .start() must be called before .close()");
          if (this.closed) throw new Error("Client already closed - cannot .close()");
          this.closed = !0, this.props.debug && d.debug("request.abort aborting request"), this.transport.cancel();
        }, v;
      }();
      function E(v) {
        var p = v.get("grpc-status") || [];
        if (p.length > 0) try {
          var S = p[0];
          return parseInt(S, 10);
        } catch {
          return null;
        }
        return null;
      }
    }, 346: function(r, i) {
      Object.defineProperty(i, "__esModule", { value: !0 }), i.debug = void 0, i.debug = function() {
        for (var o = [], s = 0; s < arguments.length; s++) o[s] = arguments[s];
        console.debug ? console.debug.apply(null, o) : console.log.apply(null, o);
      };
    }, 607: function(r, i, o) {
      Object.defineProperty(i, "__esModule", { value: !0 }), i.grpc = void 0;
      var s, u = o(418), c = o(57), d = o(229), m = o(540), l = o(210), f = o(859), E = o(8), v = o(938), p = o(35), S = o(934);
      (s = i.grpc || (i.grpc = {})).setDefaultTransport = c.setDefaultTransportFactory, s.CrossBrowserHttpTransport = f.CrossBrowserHttpTransport, s.FetchReadableStreamTransport = d.FetchReadableStreamTransport, s.XhrTransport = l.XhrTransport, s.WebsocketTransport = m.WebsocketTransport, s.Code = E.Code, s.Metadata = u.BrowserHeaders, s.client = function(_, A) {
        return S.client(_, A);
      }, s.invoke = v.invoke, s.unary = p.unary;
    }, 938: function(r, i, o) {
      Object.defineProperty(i, "__esModule", { value: !0 }), i.invoke = void 0;
      var s = o(934);
      i.invoke = function(u, c) {
        if (u.requestStream) throw new Error(".invoke cannot be used with client-streaming methods. Use .client instead.");
        var d = s.client(u, { host: c.host, transport: c.transport, debug: c.debug });
        return c.onHeaders && d.onHeaders(c.onHeaders), c.onMessage && d.onMessage(c.onMessage), c.onEnd && d.onEnd(c.onEnd), d.start(c.metadata), d.send(c.request), d.finishSend(), { close: function() {
          d.close();
        } };
      };
    }, 65: function(r, i, o) {
      Object.defineProperty(i, "__esModule", { value: !0 }), i.Metadata = void 0;
      var s = o(418);
      Object.defineProperty(i, "Metadata", { enumerable: !0, get: function() {
        return s.BrowserHeaders;
      } });
    }, 57: function(r, i, o) {
      Object.defineProperty(i, "__esModule", { value: !0 }), i.makeDefaultTransport = i.setDefaultTransportFactory = void 0;
      var s = o(859), u = function(c) {
        return s.CrossBrowserHttpTransport({ withCredentials: !1 })(c);
      };
      i.setDefaultTransportFactory = function(c) {
        u = c;
      }, i.makeDefaultTransport = function(c) {
        return u(c);
      };
    }, 229: function(r, i, o) {
      var s = this && this.__assign || function() {
        return (s = Object.assign || function(m) {
          for (var l, f = 1, E = arguments.length; f < E; f++) for (var v in l = arguments[f]) Object.prototype.hasOwnProperty.call(l, v) && (m[v] = l[v]);
          return m;
        }).apply(this, arguments);
      };
      Object.defineProperty(i, "__esModule", { value: !0 }), i.detectFetchSupport = i.FetchReadableStreamTransport = void 0;
      var u = o(65), c = o(346);
      i.FetchReadableStreamTransport = function(m) {
        return function(l) {
          return function(f, E) {
            return f.debug && c.debug("fetchRequest", f), new d(f, E);
          }(l, m);
        };
      };
      var d = function() {
        function m(l, f) {
          this.cancelled = !1, this.controller = self.AbortController && new AbortController(), this.options = l, this.init = f;
        }
        return m.prototype.pump = function(l, f) {
          var E = this;
          if (this.reader = l, this.cancelled) return this.options.debug && c.debug("Fetch.pump.cancel at first pump"), void this.reader.cancel().catch(function(v) {
            E.options.debug && c.debug("Fetch.pump.reader.cancel exception", v);
          });
          this.reader.read().then(function(v) {
            if (v.done) return E.options.onEnd(), f;
            E.options.onChunk(v.value), E.pump(E.reader, f);
          }).catch(function(v) {
            E.cancelled ? E.options.debug && c.debug("Fetch.catch - request cancelled") : (E.cancelled = !0, E.options.debug && c.debug("Fetch.catch", v.message), E.options.onEnd(v));
          });
        }, m.prototype.send = function(l) {
          var f = this;
          fetch(this.options.url, s(s({}, this.init), { headers: this.metadata.toHeaders(), method: "POST", body: l, signal: this.controller && this.controller.signal })).then(function(E) {
            if (f.options.debug && c.debug("Fetch.response", E), f.options.onHeaders(new u.Metadata(E.headers), E.status), !E.body) return E;
            f.pump(E.body.getReader(), E);
          }).catch(function(E) {
            f.cancelled ? f.options.debug && c.debug("Fetch.catch - request cancelled") : (f.cancelled = !0, f.options.debug && c.debug("Fetch.catch", E.message), f.options.onEnd(E));
          });
        }, m.prototype.sendMessage = function(l) {
          this.send(l);
        }, m.prototype.finishSend = function() {
        }, m.prototype.start = function(l) {
          this.metadata = l;
        }, m.prototype.cancel = function() {
          var l = this;
          this.cancelled ? this.options.debug && c.debug("Fetch.cancel already cancelled") : (this.cancelled = !0, this.controller ? (this.options.debug && c.debug("Fetch.cancel.controller.abort"), this.controller.abort()) : this.options.debug && c.debug("Fetch.cancel.missing abort controller"), this.reader ? (this.options.debug && c.debug("Fetch.cancel.reader.cancel"), this.reader.cancel().catch(function(f) {
            l.options.debug && c.debug("Fetch.cancel.reader.cancel exception", f);
          })) : this.options.debug && c.debug("Fetch.cancel before reader"));
        }, m;
      }();
      i.detectFetchSupport = function() {
        return typeof Response < "u" && Response.prototype.hasOwnProperty("body") && typeof Headers == "function";
      };
    }, 859: function(r, i, o) {
      Object.defineProperty(i, "__esModule", { value: !0 }), i.CrossBrowserHttpTransport = void 0;
      var s = o(229), u = o(210);
      i.CrossBrowserHttpTransport = function(c) {
        if (s.detectFetchSupport()) {
          var d = { credentials: c.withCredentials ? "include" : "same-origin" };
          return s.FetchReadableStreamTransport(d);
        }
        return u.XhrTransport({ withCredentials: c.withCredentials });
      };
    }, 210: function(r, i, o) {
      var s, u = this && this.__extends || (s = function(p, S) {
        return (s = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function(_, A) {
          _.__proto__ = A;
        } || function(_, A) {
          for (var N in A) Object.prototype.hasOwnProperty.call(A, N) && (_[N] = A[N]);
        })(p, S);
      }, function(p, S) {
        function _() {
          this.constructor = p;
        }
        s(p, S), p.prototype = S === null ? Object.create(S) : (_.prototype = S.prototype, new _());
      });
      Object.defineProperty(i, "__esModule", { value: !0 }), i.stringToArrayBuffer = i.MozChunkedArrayBufferXHR = i.XHR = i.XhrTransport = void 0;
      var c = o(65), d = o(346), m = o(849);
      i.XhrTransport = function(p) {
        return function(S) {
          if (m.detectMozXHRSupport()) return new f(S, p);
          if (m.detectXHROverrideMimeTypeSupport()) return new l(S, p);
          throw new Error("This environment's XHR implementation cannot support binary transfer.");
        };
      };
      var l = function() {
        function p(S, _) {
          this.options = S, this.init = _;
        }
        return p.prototype.onProgressEvent = function() {
          this.options.debug && d.debug("XHR.onProgressEvent.length: ", this.xhr.response.length);
          var S = this.xhr.response.substr(this.index);
          this.index = this.xhr.response.length;
          var _ = v(S);
          this.options.onChunk(_);
        }, p.prototype.onLoadEvent = function() {
          this.options.debug && d.debug("XHR.onLoadEvent"), this.options.onEnd();
        }, p.prototype.onStateChange = function() {
          this.options.debug && d.debug("XHR.onStateChange", this.xhr.readyState), this.xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED && this.options.onHeaders(new c.Metadata(this.xhr.getAllResponseHeaders()), this.xhr.status);
        }, p.prototype.sendMessage = function(S) {
          this.xhr.send(S);
        }, p.prototype.finishSend = function() {
        }, p.prototype.start = function(S) {
          var _ = this;
          this.metadata = S;
          var A = new XMLHttpRequest();
          this.xhr = A, A.open("POST", this.options.url), this.configureXhr(), this.metadata.forEach(function(N, k) {
            A.setRequestHeader(N, k.join(", "));
          }), A.withCredentials = !!this.init.withCredentials, A.addEventListener("readystatechange", this.onStateChange.bind(this)), A.addEventListener("progress", this.onProgressEvent.bind(this)), A.addEventListener("loadend", this.onLoadEvent.bind(this)), A.addEventListener("error", function(N) {
            _.options.debug && d.debug("XHR.error", N), _.options.onEnd(N.error);
          });
        }, p.prototype.configureXhr = function() {
          this.xhr.responseType = "text", this.xhr.overrideMimeType("text/plain; charset=x-user-defined");
        }, p.prototype.cancel = function() {
          this.options.debug && d.debug("XHR.abort"), this.xhr.abort();
        }, p;
      }();
      i.XHR = l;
      var f = function(p) {
        function S() {
          return p !== null && p.apply(this, arguments) || this;
        }
        return u(S, p), S.prototype.configureXhr = function() {
          this.options.debug && d.debug("MozXHR.configureXhr: setting responseType to 'moz-chunked-arraybuffer'"), this.xhr.responseType = "moz-chunked-arraybuffer";
        }, S.prototype.onProgressEvent = function() {
          var _ = this.xhr.response;
          this.options.debug && d.debug("MozXHR.onProgressEvent: ", new Uint8Array(_)), this.options.onChunk(new Uint8Array(_));
        }, S;
      }(l);
      function E(p, S) {
        var _ = p.charCodeAt(S);
        if (_ >= 55296 && _ <= 56319) {
          var A = p.charCodeAt(S + 1);
          A >= 56320 && A <= 57343 && (_ = 65536 + (_ - 55296 << 10) + (A - 56320));
        }
        return _;
      }
      function v(p) {
        for (var S = new Uint8Array(p.length), _ = 0, A = 0; A < p.length; A++) {
          var N = String.prototype.codePointAt ? p.codePointAt(A) : E(p, A);
          S[_++] = 255 & N;
        }
        return S;
      }
      i.MozChunkedArrayBufferXHR = f, i.stringToArrayBuffer = v;
    }, 849: function(r, i) {
      var o;
      function s() {
        if (o !== void 0) return o;
        if (XMLHttpRequest) {
          o = new XMLHttpRequest();
          try {
            o.open("GET", "https://localhost");
          } catch {
          }
        }
        return o;
      }
      function u(c) {
        var d = s();
        if (!d) return !1;
        try {
          return d.responseType = c, d.responseType === c;
        } catch {
        }
        return !1;
      }
      Object.defineProperty(i, "__esModule", { value: !0 }), i.detectXHROverrideMimeTypeSupport = i.detectMozXHRSupport = i.xhrSupportsResponseType = void 0, i.xhrSupportsResponseType = u, i.detectMozXHRSupport = function() {
        return typeof XMLHttpRequest < "u" && u("moz-chunked-arraybuffer");
      }, i.detectXHROverrideMimeTypeSupport = function() {
        return typeof XMLHttpRequest < "u" && XMLHttpRequest.prototype.hasOwnProperty("overrideMimeType");
      };
    }, 540: function(r, i, o) {
      Object.defineProperty(i, "__esModule", { value: !0 }), i.WebsocketTransport = void 0;
      var s, u = o(346), c = o(617);
      (function(m) {
        m[m.FINISH_SEND = 1] = "FINISH_SEND";
      })(s || (s = {}));
      var d = new Uint8Array([1]);
      i.WebsocketTransport = function() {
        return function(m) {
          return function(l) {
            l.debug && u.debug("websocketRequest", l);
            var f, E = function(S) {
              if (S.substr(0, 8) === "https://") return "wss://" + S.substr(8);
              if (S.substr(0, 7) === "http://") return "ws://" + S.substr(7);
              throw new Error("Websocket transport constructed with non-https:// or http:// host.");
            }(l.url), v = [];
            function p(S) {
              if (S === s.FINISH_SEND) f.send(d);
              else {
                var _ = S, A = new Int8Array(_.byteLength + 1);
                A.set(new Uint8Array([0])), A.set(_, 1), f.send(A);
              }
            }
            return { sendMessage: function(S) {
              f && f.readyState !== f.CONNECTING ? p(S) : v.push(S);
            }, finishSend: function() {
              f && f.readyState !== f.CONNECTING ? p(s.FINISH_SEND) : v.push(s.FINISH_SEND);
            }, start: function(S) {
              (f = new WebSocket(E, ["grpc-websockets"])).binaryType = "arraybuffer", f.onopen = function() {
                var _;
                l.debug && u.debug("websocketRequest.onopen"), f.send((_ = "", S.forEach(function(A, N) {
                  _ += A + ": " + N.join(", ") + `\r
`;
                }), c.encodeASCII(_))), v.forEach(function(A) {
                  p(A);
                });
              }, f.onclose = function(_) {
                l.debug && u.debug("websocketRequest.onclose", _), l.onEnd();
              }, f.onerror = function(_) {
                l.debug && u.debug("websocketRequest.onerror", _);
              }, f.onmessage = function(_) {
                l.onChunk(new Uint8Array(_.data));
              };
            }, cancel: function() {
              l.debug && u.debug("websocket.abort"), f.close();
            } };
          }(m);
        };
      };
    }, 35: function(r, i, o) {
      Object.defineProperty(i, "__esModule", { value: !0 }), i.unary = void 0;
      var s = o(65), u = o(934);
      i.unary = function(c, d) {
        if (c.responseStream) throw new Error(".unary cannot be used with server-streaming methods. Use .invoke or .client instead.");
        if (c.requestStream) throw new Error(".unary cannot be used with client-streaming methods. Use .client instead.");
        var m = null, l = null, f = u.client(c, { host: d.host, transport: d.transport, debug: d.debug });
        return f.onHeaders(function(E) {
          m = E;
        }), f.onMessage(function(E) {
          l = E;
        }), f.onEnd(function(E, v, p) {
          d.onEnd({ status: E, statusMessage: v, headers: m || new s.Metadata(), message: l, trailers: p });
        }), f.start(d.metadata), f.send(d.request), f.finishSend(), { close: function() {
          f.close();
        } };
      };
    }, 882: function(r, i) {
      Object.defineProperty(i, "__esModule", { value: !0 }), i.frameRequest = void 0, i.frameRequest = function(o) {
        var s = o.serializeBinary(), u = new ArrayBuffer(s.byteLength + 5);
        return new DataView(u, 1, 4).setUint32(0, s.length, !1), new Uint8Array(u, 5).set(s), new Uint8Array(u);
      };
    } }, a = {}, function r(i) {
      if (a[i]) return a[i].exports;
      var o = a[i] = { exports: {} };
      return t[i].call(o.exports, o, o.exports, r), o.exports;
    }(607);
    var t, a;
  });
})(df);
var ct = df.exports;
class Fa {
  constructor(n) {
    this.value = n, this.ok = !0;
  }
  unwrap() {
    return this.value;
  }
  unwrapErr() {
    throw new Error("Ok Result cannot unwrapErr.");
  }
  map(n) {
    return new Fa(n(this.value));
  }
  flatMap(n) {
    return n(this.value);
  }
}
const Cp = (e) => new Fa(e);
class wp {
  constructor(n) {
    this.value = n, this.ok = !1;
  }
  unwrap() {
    throw this.value;
  }
  unwrapErr() {
    return this.value;
  }
  map() {
    return this;
  }
  flatMap() {
    return this;
  }
}
const Dp = (e) => new wp(e);
function cr(e) {
  let n;
  const t = (...a) => (typeof n < "u" || (n = e(...a)), n);
  return t.delegate = e, t;
}
const xr = { PACKAGE_VERSION: "1.17.0" }, lt = {
  version: "360",
  buildNumber: "9502452",
  baseUrl: "https://cf-st.sc-cdn.net/d/fnecGQnwvAjFSQD0zCmyy?go=IgsKCTIBBEgBUFxgAQ%3D%3D&uc=92"
};
function yp(e) {
  return K(e) && Array.isArray(e.brands) && e.brands.every((n) => K(n) && typeof n.brand == "string" && typeof n.version == "string") && typeof e.mobile == "boolean" && typeof e.platform == "string";
}
function Up(e) {
  const n = e.match(/;[^;]+?;([^\)]+?)\)/);
  if (n)
    return n[1].trim();
  const t = e.match(/\(([^;]+);/);
  return t ? t[1].trim() : "unknown";
}
function Mp() {
  var e, n, t;
  if (location.hostname !== "")
    return location.hostname;
  const a = location.ancestorOrigins === void 0 && typeof window < "u" ? [window.parent.origin, (n = (e = window.top) === null || e === void 0 ? void 0 : e.origin) !== null && n !== void 0 ? n : ""] : (t = location.ancestorOrigins) !== null && t !== void 0 ? t : [];
  for (let r of a)
    try {
      if (r = new URL(r).hostname, r)
        return r;
    } catch {
    }
  return "unknown";
}
function ff(e) {
  const n = /* @__PURE__ */ new Map([
    ["android", "android"],
    ["linux", "linux"],
    ["iphone os", "ios"],
    ["ipad", "ipados"],
    ["mac os", "macos"],
    ["macos", "macos"],
    ["windows", "windows"]
  ]), t = e.toLowerCase();
  for (const [a, r] of n.entries())
    if (t.includes(a))
      return r;
  return "unknown";
}
function Vp(e) {
  const n = e.match(/\s([\d][\d_.]*[\d])(;|\)|\s)/);
  return n != null ? n[1].replace(/_/g, ".") : "";
}
function Gp(e) {
  let n;
  if (/Chrome/.test(e)) {
    const r = e.match(/Chrome\/([\d.]+)/);
    n = {
      brand: "Chrome",
      version: r !== null ? r[1] : "unknown"
    };
  } else if (/Safari/.test(e)) {
    let r = e.match(/Version\/([\d.]+)/);
    r === null && (r = e.match(/Safari\/([\d.]+)/)), n = {
      brand: "Safari",
      version: r !== null ? r[1] : "unknown"
    };
  } else
    n = {
      brand: "Firefox",
      version: "0"
    };
  const t = !1, a = ff(e);
  return {
    brands: [n],
    mobile: t,
    platform: a
  };
}
function Bp(e) {
  const n = /* @__PURE__ */ new Map([
    ["Google Chrome", "Chrome"],
    ["Chrome", "Chrome"],
    ["Chromium", "Chrome"],
    ["Firefox", "Firefox"],
    ["Microsoft Edge", "Chrome"],
    ["Safari", "Safari"]
  ]), t = e.filter(({ brand: a }) => n.has(a)).map((a) => ({
    brand: n.get(a.brand),
    version: a.version
  }));
  return t.length === 0 ? [{ brand: "Firefox", version: "0" }] : t;
}
function Fp(e) {
  return {
    brands: Bp(e.brands),
    mobile: e.mobile,
    platform: ff(e.platform)
  };
}
const an = cr(function() {
  var n, t, a;
  const r = navigator.userAgent, i = yp(navigator.userAgentData) ? Fp(navigator.userAgentData) : Gp(r), o = Vp(r), s = Up(r), u = xr.PACKAGE_VERSION.replace(/[-+]\S+$/, ""), c = navigator.language, d = ((n = navigator.languages) !== null && n !== void 0 ? n : []).map((m, l) => {
    const f = Math.max(0, (10 - l) / 10);
    return `${m};q=${f.toFixed(1)}`;
  }).join(", ") || c;
  return {
    sdkShortVersion: u,
    sdkLongVersion: xr.PACKAGE_VERSION,
    lensCore: lt,
    browser: i.brands[0],
    osName: i.platform,
    osVersion: o,
    deviceModel: s,
    locale: c,
    fullLocale: d,
    origin: Mp(),
    connectionType: (a = (t = navigator.connection) === null || t === void 0 ? void 0 : t.type) !== null && a !== void 0 ? a : "unknown"
  };
}), Ha = cr(function() {
  var n;
  const { browser: t, deviceModel: a, origin: r, osName: i, osVersion: o, sdkShortVersion: s, lensCore: u } = an(), { userAgentFlavor: c } = (n = Zi()) !== null && n !== void 0 ? n : { userAgentFlavor: "release" };
  return `CameraKitWeb/${s} ${c === "release" ? "" : "DEBUG "}(${a}; ${i} ${o}) ${t.brand}/${t.version} Core/${u.version} AppId/${r}`;
}), Hp = (e) => (n) => (t, a) => {
  const r = a && a.headers ? new Headers(a.headers) : typeof t == "string" ? new Headers() : t.headers, i = e(r);
  return n(t, Object.assign(Object.assign({}, a), { headers: i }));
}, mf = R("cameraKitServiceFetchHandler", [ke, Un.token], ({ apiToken: e }, n) => new Ie(n).map(Hp((t) => (t.append("x-snap-client-user-agent", Ha()), t.append("authorization", `Bearer ${e}`), t))).handler);
function Ka(e) {
  var n;
  const t = (n = e.stack) !== null && n !== void 0 ? n : "";
  return e.cause ? `${t}
Caused by:
	${Ka(un(e.cause))}` : t;
}
function Ya(e) {
  const n = e.cause ? `; Caused by ${Ya(un(e.cause))}` : "";
  return `${e.name}: ${e.message}${n}`;
}
function un(e) {
  if (e instanceof Error)
    return e;
  try {
    return new Error(`Non-Error type exception thrown. Serialized error value: ${JSON.stringify(e)}`);
  } catch {
    return new Error("Non-Error type exception thrown. Original error value could not be serialized.");
  }
}
class ee extends CustomEvent {
  constructor(n, t, a = {}) {
    super(n, Object.assign(Object.assign({}, a), { detail: t }));
  }
}
class $n {
  constructor() {
    this.listeners = /* @__PURE__ */ new Map(), this.options = /* @__PURE__ */ new Map();
  }
  addEventListener(n, t, a) {
    var r;
    const i = t, o = (r = this.listeners.get(n)) !== null && r !== void 0 ? r : [];
    this.listeners.set(n, [...o, i]), a && this.options.set(i, a);
  }
  dispatchEvent(n) {
    const t = this.listeners.get(n.type);
    return t && t.forEach((a) => {
      var r;
      const i = (r = this.options.get(a)) !== null && r !== void 0 ? r : {};
      try {
        a(n);
      } catch (o) {
        window && window.dispatchEvent(new CustomEvent("error", { detail: o }));
      }
      i.once && this.removeEventListener(n.type, a);
    }), !0;
  }
  removeEventListener(n, t) {
    const a = t, r = this.listeners.get(n);
    r && (this.listeners.set(n, r.filter((i) => i !== a)), this.options.delete(a));
  }
}
const We = () => performance.now(), hf = (e) => e * 24 * 60 * 60, ji = "_", Mr = ".", Kp = new RegExp(`^${ji}+|${ji}+$`, "g");
class Wa {
  constructor(n, t = {}) {
    this.name = n, this.dimensions = t;
  }
  child(n, t, a = {}) {
    return new n(`${this.name}${ji}${t}`, a);
  }
}
function On(e) {
  return e.join(ji).replace(Kp, "");
}
function za(e) {
  return Object.keys(e).length === 0 ? "" : `${Mr}${Array.from(Object.entries(e)).map((n) => n.join(Mr)).join(Mr)}`;
}
class pt extends Wa {
  constructor(n, t = {}) {
    super(n, t), this.name = n, this.startTime = We(), this.stopped = !1, this.marks = /* @__PURE__ */ new Set(), this.measures = /* @__PURE__ */ new Set();
  }
  getMeasures() {
    return Array.from(this.measures.values()).concat(...Array.from(this.marks.values()).map((n) => n.getMeasures()));
  }
  mark(n, t = {}) {
    const a = new pt(On([this.name, n]), t);
    return this.stopped && a.stop(), this.marks.add(a), a;
  }
  measure(n, t) {
    if (this.stopped)
      return;
    const a = typeof n == "string" ? n : "", r = typeof n == "string" ? t : n, o = {
      name: On([this.name, a]),
      duration: We() - this.startTime,
      dimensions: r ?? this.dimensions
    };
    return this.measures.add(o), o;
  }
  clear() {
    this.measures.clear(), this.marks.forEach((n) => n.clear());
  }
  stop() {
    this.stopped = !0, this.marks.forEach((n) => n.stop());
  }
  stopAndReport(n) {
    return O(this, void 0, void 0, function* () {
      n.setOperationalMetrics(this), this.stop(), this.clear();
    });
  }
  toOperationalMetric() {
    const n = /* @__PURE__ */ new Date();
    return this.getMeasures().map((t) => ({
      name: `${t.name}${za(t.dimensions)}`,
      timestamp: n,
      metric: {
        $case: "latencyMillis",
        latencyMillis: `${Math.ceil(t.duration)}`
      }
    }));
  }
}
let Yp = 0;
const Wp = (e) => {
  if (e == null)
    return 0;
  const n = parseInt(e);
  return isNaN(n) ? 0 : n;
}, qa = (e, n) => {
  const t = Object.assign(Object.assign({}, n), { requestId: Yp++, timer: new pt("download_latency") });
  return e.dispatchEvent(new ee("started", t)), t;
}, $a = (e, n) => (e.dispatchEvent(new ee("completed", n)), n), Za = (e, n) => (e.dispatchEvent(new ee("errored", n)), n), Ja = (e) => (n) => ([t, a], r) => O(void 0, void 0, void 0, function* () {
  const { requestId: i } = qa(e, { dimensions: a });
  try {
    const o = yield n(t, r), s = o.status, u = Wp(o.headers.get("content-length"));
    return $a(e, { requestId: i, dimensions: a, status: s, sizeByte: u }), o;
  } catch (o) {
    throw Za(e, { requestId: i, dimensions: a, error: un(o) }), o;
  }
}), cn = R("requestStateEventTarget", () => new $n()), Xa = "grpc_call";
function zp(e) {
  return e === Qi.methods.setOperationalMetrics.name || e === Qi.methods.setBusinessEvents.name;
}
const vt = R("grpcHandlerFactory", [ke, mf.token, cn.token], (e, n, t) => {
  const a = `https://${e.apiHostname}`, r = new Ie(n).map(Ja(t)).handler, i = (o) => {
    let s;
    const u = globalThis.AbortController ? new AbortController() : void 0;
    let c = !1;
    return {
      sendMessage(d) {
        var m;
        const l = {
          headers: (m = s == null ? void 0 : s.toHeaders()) !== null && m !== void 0 ? m : {},
          method: "POST",
          body: d,
          signal: u == null ? void 0 : u.signal
        }, f = {
          requestType: Xa,
          methodName: o.methodDefinition.methodName
        };
        (zp(o.methodDefinition.methodName) ? n(o.url, l) : r([o.url, f], l)).then((v) => (o.onHeaders(new ct.grpc.Metadata(v.headers), v.status), v.arrayBuffer())).then((v) => {
          c || (o.onChunk(new Uint8Array(v)), o.onEnd());
        }).catch((v) => {
          c || (c = !0, o.onEnd(v));
        });
      },
      start(d) {
        s = d;
      },
      finishSend() {
      },
      cancel() {
        c || (c = !0, u == null || u.abort());
      }
    };
  };
  return (o) => O(void 0, void 0, void 0, function* () {
    return new Promise((s) => {
      ct.grpc.unary({
        methodName: o.methodName,
        service: { serviceName: o.serviceName },
        requestStream: !1,
        responseStream: !1,
        requestType: o.requestType,
        responseType: o.responseType
      }, {
        request: new o.requestType(),
        host: a,
        onEnd: (u) => {
          qp(u) ? s(Cp(u)) : s(Dp(u));
        },
        transport: i
      });
    });
  });
});
function qp(e) {
  return e.status === ct.grpc.Code.OK;
}
function ea(e, n) {
  return class {
    constructor() {
      Object.assign(this, e.fromPartial(n));
    }
    static deserializeBinary(a) {
      return new (ea(e, e.decode(a)))();
    }
    serializeBinary() {
      return e.encode(this).finish();
    }
    toObject() {
      return this;
    }
  };
}
function lr(e, n) {
  return Gh(or(e.methods).map(([t, a]) => [
    t,
    (r) => O(this, void 0, void 0, function* () {
      const i = ea(a.requestType, r), o = ea(a.responseType, {});
      return n({
        serviceName: e.fullName,
        methodName: a.name,
        requestType: i,
        responseType: o
      });
    })
  ]));
}
var pf = { exports: {} };
(function(e, n) {
  (function(a, r) {
    e.exports = r();
  })(lf, function() {
    return (
      /******/
      function(t) {
        var a = {};
        function r(i) {
          if (a[i])
            return a[i].exports;
          var o = a[i] = {
            /******/
            i,
            /******/
            l: !1,
            /******/
            exports: {}
            /******/
          };
          return t[i].call(o.exports, o, o.exports, r), o.l = !0, o.exports;
        }
        return r.m = t, r.c = a, r.i = function(i) {
          return i;
        }, r.d = function(i, o, s) {
          r.o(i, o) || Object.defineProperty(i, o, {
            /******/
            configurable: !1,
            /******/
            enumerable: !0,
            /******/
            get: s
            /******/
          });
        }, r.n = function(i) {
          var o = i && i.__esModule ? (
            /******/
            function() {
              return i.default;
            }
          ) : (
            /******/
            function() {
              return i;
            }
          );
          return r.d(o, "a", o), o;
        }, r.o = function(i, o) {
          return Object.prototype.hasOwnProperty.call(i, o);
        }, r.p = "", r(r.s = 1);
      }([
        /* 0 */
        /***/
        function(t, a, r) {
          Object.defineProperty(a, "__esModule", { value: !0 });
          var i = r(3);
          function o(u) {
            return typeof u == "object" && typeof u.headersMap == "object" && typeof u.forEach == "function";
          }
          var s = function() {
            function u(c, d) {
              c === void 0 && (c = {}), d === void 0 && (d = { splitValues: !1 });
              var m = this;
              if (this.headersMap = {}, c)
                if (typeof Headers < "u" && c instanceof Headers) {
                  var l = i.getHeaderKeys(c);
                  l.forEach(function(E) {
                    var v = i.getHeaderValues(c, E);
                    v.forEach(function(p) {
                      d.splitValues ? m.append(E, i.splitHeaderValue(p)) : m.append(E, p);
                    });
                  });
                } else if (o(c))
                  c.forEach(function(E, v) {
                    m.append(E, v);
                  });
                else if (typeof Map < "u" && c instanceof Map) {
                  var f = c;
                  f.forEach(function(E, v) {
                    m.append(v, E);
                  });
                } else typeof c == "string" ? this.appendFromString(c) : typeof c == "object" && Object.getOwnPropertyNames(c).forEach(function(E) {
                  var v = c, p = v[E];
                  Array.isArray(p) ? p.forEach(function(S) {
                    m.append(E, S);
                  }) : m.append(E, p);
                });
            }
            return u.prototype.appendFromString = function(c) {
              for (var d = c.split(`\r
`), m = 0; m < d.length; m++) {
                var l = d[m], f = l.indexOf(":");
                if (f > 0) {
                  var E = l.substring(0, f).trim(), v = l.substring(f + 1).trim();
                  this.append(E, v);
                }
              }
            }, u.prototype.delete = function(c, d) {
              var m = i.normalizeName(c);
              if (d === void 0)
                delete this.headersMap[m];
              else {
                var l = this.headersMap[m];
                if (l) {
                  var f = l.indexOf(d);
                  f >= 0 && l.splice(f, 1), l.length === 0 && delete this.headersMap[m];
                }
              }
            }, u.prototype.append = function(c, d) {
              var m = this, l = i.normalizeName(c);
              Array.isArray(this.headersMap[l]) || (this.headersMap[l] = []), Array.isArray(d) ? d.forEach(function(f) {
                m.headersMap[l].push(i.normalizeValue(f));
              }) : this.headersMap[l].push(i.normalizeValue(d));
            }, u.prototype.set = function(c, d) {
              var m = i.normalizeName(c);
              if (Array.isArray(d)) {
                var l = [];
                d.forEach(function(f) {
                  l.push(i.normalizeValue(f));
                }), this.headersMap[m] = l;
              } else
                this.headersMap[m] = [i.normalizeValue(d)];
            }, u.prototype.has = function(c, d) {
              var m = this.headersMap[i.normalizeName(c)], l = Array.isArray(m);
              if (!l)
                return !1;
              if (d !== void 0) {
                var f = i.normalizeValue(d);
                return m.indexOf(f) >= 0;
              } else
                return !0;
            }, u.prototype.get = function(c) {
              var d = this.headersMap[i.normalizeName(c)];
              return d !== void 0 ? d.concat() : [];
            }, u.prototype.forEach = function(c) {
              var d = this;
              Object.getOwnPropertyNames(this.headersMap).forEach(function(m) {
                c(m, d.headersMap[m]);
              }, this);
            }, u.prototype.toHeaders = function() {
              if (typeof Headers < "u") {
                var c = new Headers();
                return this.forEach(function(d, m) {
                  m.forEach(function(l) {
                    c.append(d, l);
                  });
                }), c;
              } else
                throw new Error("Headers class is not defined");
            }, u;
          }();
          a.BrowserHeaders = s;
        },
        /* 1 */
        /***/
        function(t, a, r) {
          Object.defineProperty(a, "__esModule", { value: !0 });
          var i = r(0);
          a.BrowserHeaders = i.BrowserHeaders;
        },
        /* 2 */
        /***/
        function(t, a, r) {
          Object.defineProperty(a, "__esModule", { value: !0 });
          function i(s, u) {
            for (var c = s[Symbol.iterator](), d = c.next(); !d.done; )
              u(d.value[0]), d = c.next();
          }
          a.iterateHeaders = i;
          function o(s, u) {
            for (var c = s.keys(), d = c.next(); !d.done; )
              u(d.value), d = c.next();
          }
          a.iterateHeadersKeys = o;
        },
        /* 3 */
        /***/
        function(t, a, r) {
          Object.defineProperty(a, "__esModule", { value: !0 });
          var i = r(2);
          function o(l) {
            if (typeof l != "string" && (l = String(l)), /[^a-z0-9\-#$%&'*+.\^_`|~]/i.test(l))
              throw new TypeError("Invalid character in header field name");
            return l.toLowerCase();
          }
          a.normalizeName = o;
          function s(l) {
            return typeof l != "string" && (l = String(l)), l;
          }
          a.normalizeValue = s;
          function u(l, f) {
            var E = l;
            if (E instanceof Headers && E.getAll)
              return E.getAll(f);
            var v = E.get(f);
            return v && typeof v == "string" ? [v] : v;
          }
          a.getHeaderValues = u;
          function c(l) {
            return l;
          }
          function d(l) {
            var f = l, E = {}, v = [];
            return f.keys ? i.iterateHeadersKeys(f, function(p) {
              E[p] || (E[p] = !0, v.push(p));
            }) : f.forEach ? f.forEach(function(p, S) {
              E[S] || (E[S] = !0, v.push(S));
            }) : i.iterateHeaders(f, function(p) {
              var S = p[0];
              E[S] || (E[S] = !0, v.push(S));
            }), v;
          }
          a.getHeaderKeys = d;
          function m(l) {
            var f = [], E = l.split(", ");
            return E.forEach(function(v) {
              v.split(",").forEach(function(p) {
                f.push(p);
              });
            }), f;
          }
          a.splitHeaderValue = m;
        }
        /******/
      ])
    );
  });
})(pf);
var vf = pf.exports;
function $p(e, ...n) {
  const t = () => {
    throw new Error("Iteratee must be a function or a valid property key of the item");
  }, a = /* @__PURE__ */ new Map();
  for (const r of n.flat()) {
    const i = typeof r == "object" && r !== null && e in r ? r[e] : t();
    a.set(i, r);
  }
  return Array.from(a.values());
}
var gs;
(function(e) {
  e[e.UNSET = 0] = "UNSET", e[e.USER = 1] = "USER", e[e.DEVICE = 2] = "DEVICE", e[e.WEB_CLIENT = 3] = "WEB_CLIENT", e[e.AD_ACCOUNT = 4] = "AD_ACCOUNT", e[e.USERNAME = 5] = "USERNAME", e[e.AD_MODERATION_AD = 6] = "AD_MODERATION_AD", e[e.WEB_SNAPCHAT_USER = 7] = "WEB_SNAPCHAT_USER", e[e.INTERNAL = 8] = "INTERNAL", e[e.AM_ORGANIZATION = 9] = "AM_ORGANIZATION", e[e.AM_MEMBER = 10] = "AM_MEMBER", e[e.AM_SESSION = 11] = "AM_SESSION", e[e.AM_PROFILE = 12] = "AM_PROFILE", e[e.AM_SNAPCHAT_USER = 13] = "AM_SNAPCHAT_USER", e[e.SNAPCHAT_ADVERTISING = 14] = "SNAPCHAT_ADVERTISING", e[e.AM_CLIENT = 15] = "AM_CLIENT", e[e.MISCHIEF = 16] = "MISCHIEF", e[e.ARES_VISITOR = 17] = "ARES_VISITOR", e[e.POD_NAME = 18] = "POD_NAME", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(gs || (gs = {}));
function bs() {
  return { type: 0, stringValue: "", loggingIdValue: "" };
}
const Be = {
  encode(e, n = new I()) {
    return e.type !== 0 && n.uint32(8).int32(e.type), e.stringValue !== "" && n.uint32(18).string(e.stringValue), e.loggingIdValue !== "" && n.uint32(26).string(e.loggingIdValue), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = bs();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.type = t.int32();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.stringValue = t.string();
          continue;
        }
        case 3: {
          if (i !== 26)
            break;
          r.loggingIdValue = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Be.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a;
    const r = bs();
    return r.type = (n = e.type) !== null && n !== void 0 ? n : 0, r.stringValue = (t = e.stringValue) !== null && t !== void 0 ? t : "", r.loggingIdValue = (a = e.loggingIdValue) !== null && a !== void 0 ? a : "", r;
  }
};
function Ps() {
  return { value: !1 };
}
const jn = {
  encode(e, n = new I()) {
    return e.value !== !1 && n.uint32(8).bool(e.value), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Ps();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.value = t.bool();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return jn.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = Ps();
    return t.value = (n = e.value) !== null && n !== void 0 ? n : !1, t;
  }
};
function Ls() {
  return { intValue: void 0, longValue: void 0, boolValue: void 0, floatValue: void 0 };
}
const yt = {
  encode(e, n = new I()) {
    return e.intValue !== void 0 && n.uint32(8).int32(e.intValue), e.longValue !== void 0 && n.uint32(16).int64(e.longValue), e.boolValue !== void 0 && n.uint32(24).bool(e.boolValue), e.floatValue !== void 0 && n.uint32(37).float(e.floatValue), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Ls();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.intValue = t.int32();
          continue;
        }
        case 2: {
          if (i !== 16)
            break;
          r.longValue = t.int64().toString();
          continue;
        }
        case 3: {
          if (i !== 24)
            break;
          r.boolValue = t.bool();
          continue;
        }
        case 4: {
          if (i !== 37)
            break;
          r.floatValue = t.float();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return yt.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r;
    const i = Ls();
    return i.intValue = (n = e.intValue) !== null && n !== void 0 ? n : void 0, i.longValue = (t = e.longValue) !== null && t !== void 0 ? t : void 0, i.boolValue = (a = e.boolValue) !== null && a !== void 0 ? a : void 0, i.floatValue = (r = e.floatValue) !== null && r !== void 0 ? r : void 0, i;
  }
};
function Cs() {
  return { benchmarkNames: [], expirationTimestamp: void 0 };
}
const Ut = {
  encode(e, n = new I()) {
    n.uint32(10).fork();
    for (const t of e.benchmarkNames)
      n.int32(t);
    return n.join(), e.expirationTimestamp !== void 0 && pe.encode(Zp(e.expirationTimestamp), n.uint32(18).fork()).join(), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Cs();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i === 8) {
            r.benchmarkNames.push(t.int32());
            continue;
          }
          if (i === 10) {
            const o = t.uint32() + t.pos;
            for (; t.pos < o; )
              r.benchmarkNames.push(t.int32());
            continue;
          }
          break;
        }
        case 2: {
          if (i !== 18)
            break;
          r.expirationTimestamp = Jp(pe.decode(t, t.uint32()));
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Ut.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = Cs();
    return a.benchmarkNames = ((n = e.benchmarkNames) === null || n === void 0 ? void 0 : n.map((r) => r)) || [], a.expirationTimestamp = (t = e.expirationTimestamp) !== null && t !== void 0 ? t : void 0, a;
  }
};
function ws() {
  return { name: 0, value: void 0 };
}
const Mt = {
  encode(e, n = new I()) {
    return e.name !== 0 && n.uint32(8).int32(e.name), e.value !== void 0 && yt.encode(e.value, n.uint32(18).fork()).join(), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = ws();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.name = t.int32();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.value = yt.decode(t, t.uint32());
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Mt.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = ws();
    return t.name = (n = e.name) !== null && n !== void 0 ? n : 0, t.value = e.value !== void 0 && e.value !== null ? yt.fromPartial(e.value) : void 0, t;
  }
};
function Zp(e) {
  const n = Math.trunc(e.getTime() / 1e3).toString(), t = e.getTime() % 1e3 * 1e6;
  return { seconds: n, nanos: t };
}
function Jp(e) {
  let n = (globalThis.Number(e.seconds) || 0) * 1e3;
  return n += (e.nanos || 0) / 1e6, new globalThis.Date(n);
}
var Ds;
(function(e) {
  e[e.UNKNOWN_EVENT_TYPE = 0] = "UNKNOWN_EVENT_TYPE", e[e.COLD_START = 1] = "COLD_START", e[e.WARM_START = 2] = "WARM_START", e[e.FOREGROUND_TRIGGER = 3] = "FOREGROUND_TRIGGER", e[e.BACKGROUND_TRIGGER = 4] = "BACKGROUND_TRIGGER", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(Ds || (Ds = {}));
var ys;
(function(e) {
  e[e.UNKNOWN_APP_STATE = 0] = "UNKNOWN_APP_STATE", e[e.FOREGROUND = 1] = "FOREGROUND", e[e.BACKGROUND = 2] = "BACKGROUND", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(ys || (ys = {}));
var Us;
(function(e) {
  e[e.DEFAULT_INSTRUMENTATION = 0] = "DEFAULT_INSTRUMENTATION", e[e.USER_AUTHENTICATION = 1] = "USER_AUTHENTICATION", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(Us || (Us = {}));
var Ms;
(function(e) {
  e[e.UNKNOWN_NETWORK_TYPE = 0] = "UNKNOWN_NETWORK_TYPE", e[e.CELLULAR = 1] = "CELLULAR", e[e.WIFI = 2] = "WIFI", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(Ms || (Ms = {}));
function Vs() {
  return {
    configResultsEtag: "",
    namespaces: [],
    ghostId: "",
    countryCode: "",
    screenWidth: 0,
    screenHeight: 0,
    connectivity: void 0,
    maxVideoWidthPx: 0,
    maxVideoHeightPx: 0,
    benchmarkResults: [],
    deltaSync: !1,
    userAgent: "",
    triggerEventType: 0,
    appState: 0,
    locale: "",
    deviceId: "",
    userId: "",
    clientIp: "",
    isUnAuthorized: !1,
    appLocale: "",
    instrumentation: 0,
    lastSuccessfulSync: "0",
    isLogout: !1,
    packageInstaller: "",
    syncTriggerBlizzardSessionId: "",
    syncExecutionBlizzardSessionId: "",
    cofSyncTriggerDelayFromStartupMs: 0,
    cofSyncExecutionDelayFromStartupMs: 0,
    syncTriggerTime: "0",
    decoderEncoderAvailability: void 0,
    snapkitAppId: "",
    lenscoreVersion: 0,
    ruid: void 0,
    configNames: [],
    includeTestUserTreatments: !1,
    disableExposureLogging: !1,
    lensClusterOrig4: 0,
    clientId: "",
    propertyOverrides: void 0,
    forLockscreenMode: !1,
    osBuildVersion: ""
  };
}
const Bn = {
  encode(e, n = new I()) {
    e.configResultsEtag !== "" && n.uint32(10).string(e.configResultsEtag), n.uint32(18).fork();
    for (const t of e.namespaces)
      n.int32(t);
    n.join(), e.ghostId !== "" && n.uint32(26).string(e.ghostId), e.countryCode !== "" && n.uint32(34).string(e.countryCode), e.screenWidth !== 0 && n.uint32(40).int32(e.screenWidth), e.screenHeight !== 0 && n.uint32(48).int32(e.screenHeight), e.connectivity !== void 0 && Gt.encode(e.connectivity, n.uint32(58).fork()).join(), e.maxVideoWidthPx !== 0 && n.uint32(64).int32(e.maxVideoWidthPx), e.maxVideoHeightPx !== 0 && n.uint32(72).int32(e.maxVideoHeightPx);
    for (const t of e.benchmarkResults)
      Mt.encode(t, n.uint32(82).fork()).join();
    e.deltaSync !== !1 && n.uint32(88).bool(e.deltaSync), e.userAgent !== "" && n.uint32(98).string(e.userAgent), e.triggerEventType !== 0 && n.uint32(104).int32(e.triggerEventType), e.appState !== 0 && n.uint32(112).int32(e.appState), e.locale !== "" && n.uint32(122).string(e.locale), e.deviceId !== "" && n.uint32(130).string(e.deviceId), e.userId !== "" && n.uint32(138).string(e.userId), e.clientIp !== "" && n.uint32(146).string(e.clientIp), e.isUnAuthorized !== !1 && n.uint32(152).bool(e.isUnAuthorized), e.appLocale !== "" && n.uint32(162).string(e.appLocale), e.instrumentation !== 0 && n.uint32(168).int32(e.instrumentation), e.lastSuccessfulSync !== "0" && n.uint32(176).int64(e.lastSuccessfulSync), e.isLogout !== !1 && n.uint32(184).bool(e.isLogout), e.packageInstaller !== "" && n.uint32(194).string(e.packageInstaller), e.syncTriggerBlizzardSessionId !== "" && n.uint32(202).string(e.syncTriggerBlizzardSessionId), e.syncExecutionBlizzardSessionId !== "" && n.uint32(210).string(e.syncExecutionBlizzardSessionId), e.cofSyncTriggerDelayFromStartupMs !== 0 && n.uint32(216).int32(e.cofSyncTriggerDelayFromStartupMs), e.cofSyncExecutionDelayFromStartupMs !== 0 && n.uint32(224).int32(e.cofSyncExecutionDelayFromStartupMs), e.syncTriggerTime !== "0" && n.uint32(232).int64(e.syncTriggerTime), e.decoderEncoderAvailability !== void 0 && Bt.encode(e.decoderEncoderAvailability, n.uint32(242).fork()).join(), e.snapkitAppId !== "" && n.uint32(250).string(e.snapkitAppId), e.lenscoreVersion !== 0 && n.uint32(256).int32(e.lenscoreVersion), e.ruid !== void 0 && Be.encode(e.ruid, n.uint32(266).fork()).join();
    for (const t of e.configNames)
      n.uint32(274).string(t);
    return e.includeTestUserTreatments !== !1 && n.uint32(288).bool(e.includeTestUserTreatments), e.disableExposureLogging !== !1 && n.uint32(296).bool(e.disableExposureLogging), e.lensClusterOrig4 !== 0 && n.uint32(304).int32(e.lensClusterOrig4), e.clientId !== "" && n.uint32(314).string(e.clientId), e.propertyOverrides !== void 0 && Vt.encode(e.propertyOverrides, n.uint32(322).fork()).join(), e.forLockscreenMode !== !1 && n.uint32(328).bool(e.forLockscreenMode), e.osBuildVersion !== "" && n.uint32(338).string(e.osBuildVersion), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Vs();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.configResultsEtag = t.string();
          continue;
        }
        case 2: {
          if (i === 16) {
            r.namespaces.push(t.int32());
            continue;
          }
          if (i === 18) {
            const o = t.uint32() + t.pos;
            for (; t.pos < o; )
              r.namespaces.push(t.int32());
            continue;
          }
          break;
        }
        case 3: {
          if (i !== 26)
            break;
          r.ghostId = t.string();
          continue;
        }
        case 4: {
          if (i !== 34)
            break;
          r.countryCode = t.string();
          continue;
        }
        case 5: {
          if (i !== 40)
            break;
          r.screenWidth = t.int32();
          continue;
        }
        case 6: {
          if (i !== 48)
            break;
          r.screenHeight = t.int32();
          continue;
        }
        case 7: {
          if (i !== 58)
            break;
          r.connectivity = Gt.decode(t, t.uint32());
          continue;
        }
        case 8: {
          if (i !== 64)
            break;
          r.maxVideoWidthPx = t.int32();
          continue;
        }
        case 9: {
          if (i !== 72)
            break;
          r.maxVideoHeightPx = t.int32();
          continue;
        }
        case 10: {
          if (i !== 82)
            break;
          r.benchmarkResults.push(Mt.decode(t, t.uint32()));
          continue;
        }
        case 11: {
          if (i !== 88)
            break;
          r.deltaSync = t.bool();
          continue;
        }
        case 12: {
          if (i !== 98)
            break;
          r.userAgent = t.string();
          continue;
        }
        case 13: {
          if (i !== 104)
            break;
          r.triggerEventType = t.int32();
          continue;
        }
        case 14: {
          if (i !== 112)
            break;
          r.appState = t.int32();
          continue;
        }
        case 15: {
          if (i !== 122)
            break;
          r.locale = t.string();
          continue;
        }
        case 16: {
          if (i !== 130)
            break;
          r.deviceId = t.string();
          continue;
        }
        case 17: {
          if (i !== 138)
            break;
          r.userId = t.string();
          continue;
        }
        case 18: {
          if (i !== 146)
            break;
          r.clientIp = t.string();
          continue;
        }
        case 19: {
          if (i !== 152)
            break;
          r.isUnAuthorized = t.bool();
          continue;
        }
        case 20: {
          if (i !== 162)
            break;
          r.appLocale = t.string();
          continue;
        }
        case 21: {
          if (i !== 168)
            break;
          r.instrumentation = t.int32();
          continue;
        }
        case 22: {
          if (i !== 176)
            break;
          r.lastSuccessfulSync = t.int64().toString();
          continue;
        }
        case 23: {
          if (i !== 184)
            break;
          r.isLogout = t.bool();
          continue;
        }
        case 24: {
          if (i !== 194)
            break;
          r.packageInstaller = t.string();
          continue;
        }
        case 25: {
          if (i !== 202)
            break;
          r.syncTriggerBlizzardSessionId = t.string();
          continue;
        }
        case 26: {
          if (i !== 210)
            break;
          r.syncExecutionBlizzardSessionId = t.string();
          continue;
        }
        case 27: {
          if (i !== 216)
            break;
          r.cofSyncTriggerDelayFromStartupMs = t.int32();
          continue;
        }
        case 28: {
          if (i !== 224)
            break;
          r.cofSyncExecutionDelayFromStartupMs = t.int32();
          continue;
        }
        case 29: {
          if (i !== 232)
            break;
          r.syncTriggerTime = t.int64().toString();
          continue;
        }
        case 30: {
          if (i !== 242)
            break;
          r.decoderEncoderAvailability = Bt.decode(t, t.uint32());
          continue;
        }
        case 31: {
          if (i !== 250)
            break;
          r.snapkitAppId = t.string();
          continue;
        }
        case 32: {
          if (i !== 256)
            break;
          r.lenscoreVersion = t.int32();
          continue;
        }
        case 33: {
          if (i !== 266)
            break;
          r.ruid = Be.decode(t, t.uint32());
          continue;
        }
        case 34: {
          if (i !== 274)
            break;
          r.configNames.push(t.string());
          continue;
        }
        case 36: {
          if (i !== 288)
            break;
          r.includeTestUserTreatments = t.bool();
          continue;
        }
        case 37: {
          if (i !== 296)
            break;
          r.disableExposureLogging = t.bool();
          continue;
        }
        case 38: {
          if (i !== 304)
            break;
          r.lensClusterOrig4 = t.int32();
          continue;
        }
        case 39: {
          if (i !== 314)
            break;
          r.clientId = t.string();
          continue;
        }
        case 40: {
          if (i !== 322)
            break;
          r.propertyOverrides = Vt.decode(t, t.uint32());
          continue;
        }
        case 41: {
          if (i !== 328)
            break;
          r.forLockscreenMode = t.bool();
          continue;
        }
        case 42: {
          if (i !== 338)
            break;
          r.osBuildVersion = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Bn.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r, i, o, s, u, c, d, m, l, f, E, v, p, S, _, A, N, k, C, M, q, w, we, ge, De, ln, dn, fn, mn, hn, pn, vn, En, Sn;
    const b = Vs();
    return b.configResultsEtag = (n = e.configResultsEtag) !== null && n !== void 0 ? n : "", b.namespaces = ((t = e.namespaces) === null || t === void 0 ? void 0 : t.map((Ke) => Ke)) || [], b.ghostId = (a = e.ghostId) !== null && a !== void 0 ? a : "", b.countryCode = (r = e.countryCode) !== null && r !== void 0 ? r : "", b.screenWidth = (i = e.screenWidth) !== null && i !== void 0 ? i : 0, b.screenHeight = (o = e.screenHeight) !== null && o !== void 0 ? o : 0, b.connectivity = e.connectivity !== void 0 && e.connectivity !== null ? Gt.fromPartial(e.connectivity) : void 0, b.maxVideoWidthPx = (s = e.maxVideoWidthPx) !== null && s !== void 0 ? s : 0, b.maxVideoHeightPx = (u = e.maxVideoHeightPx) !== null && u !== void 0 ? u : 0, b.benchmarkResults = ((c = e.benchmarkResults) === null || c === void 0 ? void 0 : c.map((Ke) => Mt.fromPartial(Ke))) || [], b.deltaSync = (d = e.deltaSync) !== null && d !== void 0 ? d : !1, b.userAgent = (m = e.userAgent) !== null && m !== void 0 ? m : "", b.triggerEventType = (l = e.triggerEventType) !== null && l !== void 0 ? l : 0, b.appState = (f = e.appState) !== null && f !== void 0 ? f : 0, b.locale = (E = e.locale) !== null && E !== void 0 ? E : "", b.deviceId = (v = e.deviceId) !== null && v !== void 0 ? v : "", b.userId = (p = e.userId) !== null && p !== void 0 ? p : "", b.clientIp = (S = e.clientIp) !== null && S !== void 0 ? S : "", b.isUnAuthorized = (_ = e.isUnAuthorized) !== null && _ !== void 0 ? _ : !1, b.appLocale = (A = e.appLocale) !== null && A !== void 0 ? A : "", b.instrumentation = (N = e.instrumentation) !== null && N !== void 0 ? N : 0, b.lastSuccessfulSync = (k = e.lastSuccessfulSync) !== null && k !== void 0 ? k : "0", b.isLogout = (C = e.isLogout) !== null && C !== void 0 ? C : !1, b.packageInstaller = (M = e.packageInstaller) !== null && M !== void 0 ? M : "", b.syncTriggerBlizzardSessionId = (q = e.syncTriggerBlizzardSessionId) !== null && q !== void 0 ? q : "", b.syncExecutionBlizzardSessionId = (w = e.syncExecutionBlizzardSessionId) !== null && w !== void 0 ? w : "", b.cofSyncTriggerDelayFromStartupMs = (we = e.cofSyncTriggerDelayFromStartupMs) !== null && we !== void 0 ? we : 0, b.cofSyncExecutionDelayFromStartupMs = (ge = e.cofSyncExecutionDelayFromStartupMs) !== null && ge !== void 0 ? ge : 0, b.syncTriggerTime = (De = e.syncTriggerTime) !== null && De !== void 0 ? De : "0", b.decoderEncoderAvailability = e.decoderEncoderAvailability !== void 0 && e.decoderEncoderAvailability !== null ? Bt.fromPartial(e.decoderEncoderAvailability) : void 0, b.snapkitAppId = (ln = e.snapkitAppId) !== null && ln !== void 0 ? ln : "", b.lenscoreVersion = (dn = e.lenscoreVersion) !== null && dn !== void 0 ? dn : 0, b.ruid = e.ruid !== void 0 && e.ruid !== null ? Be.fromPartial(e.ruid) : void 0, b.configNames = ((fn = e.configNames) === null || fn === void 0 ? void 0 : fn.map((Ke) => Ke)) || [], b.includeTestUserTreatments = (mn = e.includeTestUserTreatments) !== null && mn !== void 0 ? mn : !1, b.disableExposureLogging = (hn = e.disableExposureLogging) !== null && hn !== void 0 ? hn : !1, b.lensClusterOrig4 = (pn = e.lensClusterOrig4) !== null && pn !== void 0 ? pn : 0, b.clientId = (vn = e.clientId) !== null && vn !== void 0 ? vn : "", b.propertyOverrides = e.propertyOverrides !== void 0 && e.propertyOverrides !== null ? Vt.fromPartial(e.propertyOverrides) : void 0, b.forLockscreenMode = (En = e.forLockscreenMode) !== null && En !== void 0 ? En : !1, b.osBuildVersion = (Sn = e.osBuildVersion) !== null && Sn !== void 0 ? Sn : "", b;
  }
};
function Gs() {
  return { isWeb: !1 };
}
const Vt = {
  encode(e, n = new I()) {
    return e.isWeb !== !1 && n.uint32(8).bool(e.isWeb), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Gs();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.isWeb = t.bool();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Vt.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = Gs();
    return t.isWeb = (n = e.isWeb) !== null && n !== void 0 ? n : !1, t;
  }
};
function Bs() {
  return { networkType: 0, isMetered: void 0, isRoaming: void 0, carrier: "" };
}
const Gt = {
  encode(e, n = new I()) {
    return e.networkType !== 0 && n.uint32(8).int32(e.networkType), e.isMetered !== void 0 && jn.encode({ value: e.isMetered }, n.uint32(18).fork()).join(), e.isRoaming !== void 0 && jn.encode({ value: e.isRoaming }, n.uint32(26).fork()).join(), e.carrier !== "" && n.uint32(34).string(e.carrier), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Bs();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.networkType = t.int32();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.isMetered = jn.decode(t, t.uint32()).value;
          continue;
        }
        case 3: {
          if (i !== 26)
            break;
          r.isRoaming = jn.decode(t, t.uint32()).value;
          continue;
        }
        case 4: {
          if (i !== 34)
            break;
          r.carrier = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Gt.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r;
    const i = Bs();
    return i.networkType = (n = e.networkType) !== null && n !== void 0 ? n : 0, i.isMetered = (t = e.isMetered) !== null && t !== void 0 ? t : void 0, i.isRoaming = (a = e.isRoaming) !== null && a !== void 0 ? a : void 0, i.carrier = (r = e.carrier) !== null && r !== void 0 ? r : "", i;
  }
};
function Fs() {
  return { isSnapVp9DecoderAvailable: !1, isSnapAv1DecoderAvailable: !1 };
}
const Bt = {
  encode(e, n = new I()) {
    return e.isSnapVp9DecoderAvailable !== !1 && n.uint32(8).bool(e.isSnapVp9DecoderAvailable), e.isSnapAv1DecoderAvailable !== !1 && n.uint32(16).bool(e.isSnapAv1DecoderAvailable), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Fs();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.isSnapVp9DecoderAvailable = t.bool();
          continue;
        }
        case 2: {
          if (i !== 16)
            break;
          r.isSnapAv1DecoderAvailable = t.bool();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Bt.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = Fs();
    return a.isSnapVp9DecoderAvailable = (n = e.isSnapVp9DecoderAvailable) !== null && n !== void 0 ? n : !1, a.isSnapAv1DecoderAvailable = (t = e.isSnapAv1DecoderAvailable) !== null && t !== void 0 ? t : !1, a;
  }
};
function Hs() {
  return { key: "", value: "" };
}
const Ft = {
  encode(e, n = new I()) {
    return e.key !== "" && n.uint32(10).string(e.key), e.value !== "" && n.uint32(18).string(e.value), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Hs();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.key = t.string();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.value = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Ft.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = Hs();
    return a.key = (n = e.key) !== null && n !== void 0 ? n : "", a.value = (t = e.value) !== null && t !== void 0 ? t : "", a;
  }
};
function Ks() {
  return { records: [] };
}
const Ht = {
  encode(e, n = new I()) {
    for (const t of e.records)
      Ft.encode(t, n.uint32(10).fork()).join();
    return n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Ks();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.records.push(Ft.decode(t, t.uint32()));
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Ht.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = Ks();
    return t.records = ((n = e.records) === null || n === void 0 ? void 0 : n.map((a) => Ft.fromPartial(a))) || [], t;
  }
};
function Ys() {
  return { value: [] };
}
const Kt = {
  encode(e, n = new I()) {
    for (const t of e.value)
      n.uint32(10).string(t);
    return n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Ys();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.value.push(t.string());
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Kt.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = Ys();
    return t.value = ((n = e.value) === null || n === void 0 ? void 0 : n.map((a) => a)) || [], t;
  }
};
function Ws() {
  return {
    intValue: void 0,
    longValue: void 0,
    floatValue: void 0,
    doubleValue: void 0,
    boolValue: void 0,
    stringValue: void 0,
    anyValue: void 0,
    mapValue: void 0,
    intPairValue: void 0,
    stringArrayValue: void 0
  };
}
const Pe = {
  encode(e, n = new I()) {
    return e.intValue !== void 0 && n.uint32(8).int32(e.intValue), e.longValue !== void 0 && n.uint32(16).int64(e.longValue), e.floatValue !== void 0 && n.uint32(29).float(e.floatValue), e.doubleValue !== void 0 && n.uint32(73).double(e.doubleValue), e.boolValue !== void 0 && n.uint32(32).bool(e.boolValue), e.stringValue !== void 0 && n.uint32(42).string(e.stringValue), e.anyValue !== void 0 && Ee.encode(e.anyValue, n.uint32(50).fork()).join(), e.mapValue !== void 0 && Ht.encode(e.mapValue, n.uint32(58).fork()).join(), e.intPairValue !== void 0 && n.uint32(65).fixed64(e.intPairValue), e.stringArrayValue !== void 0 && Kt.encode(e.stringArrayValue, n.uint32(82).fork()).join(), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Ws();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.intValue = t.int32();
          continue;
        }
        case 2: {
          if (i !== 16)
            break;
          r.longValue = t.int64().toString();
          continue;
        }
        case 3: {
          if (i !== 29)
            break;
          r.floatValue = t.float();
          continue;
        }
        case 9: {
          if (i !== 73)
            break;
          r.doubleValue = t.double();
          continue;
        }
        case 4: {
          if (i !== 32)
            break;
          r.boolValue = t.bool();
          continue;
        }
        case 5: {
          if (i !== 42)
            break;
          r.stringValue = t.string();
          continue;
        }
        case 6: {
          if (i !== 50)
            break;
          r.anyValue = Ee.decode(t, t.uint32());
          continue;
        }
        case 7: {
          if (i !== 58)
            break;
          r.mapValue = Ht.decode(t, t.uint32());
          continue;
        }
        case 8: {
          if (i !== 65)
            break;
          r.intPairValue = t.fixed64().toString();
          continue;
        }
        case 10: {
          if (i !== 82)
            break;
          r.stringArrayValue = Kt.decode(t, t.uint32());
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Pe.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r, i, o, s;
    const u = Ws();
    return u.intValue = (n = e.intValue) !== null && n !== void 0 ? n : void 0, u.longValue = (t = e.longValue) !== null && t !== void 0 ? t : void 0, u.floatValue = (a = e.floatValue) !== null && a !== void 0 ? a : void 0, u.doubleValue = (r = e.doubleValue) !== null && r !== void 0 ? r : void 0, u.boolValue = (i = e.boolValue) !== null && i !== void 0 ? i : void 0, u.stringValue = (o = e.stringValue) !== null && o !== void 0 ? o : void 0, u.anyValue = e.anyValue !== void 0 && e.anyValue !== null ? Ee.fromPartial(e.anyValue) : void 0, u.mapValue = e.mapValue !== void 0 && e.mapValue !== null ? Ht.fromPartial(e.mapValue) : void 0, u.intPairValue = (s = e.intPairValue) !== null && s !== void 0 ? s : void 0, u.stringArrayValue = e.stringArrayValue !== void 0 && e.stringArrayValue !== null ? Kt.fromPartial(e.stringArrayValue) : void 0, u;
  }
};
var zs;
(function(e) {
  e[e.UNKNOWN_CONTEXT_PLATFORM = 0] = "UNKNOWN_CONTEXT_PLATFORM", e[e.IOS_PLATFORM = 1] = "IOS_PLATFORM", e[e.ANDROID_PLATFORM = 2] = "ANDROID_PLATFORM", e[e.SERVER_PLATFORM = 3] = "SERVER_PLATFORM", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(zs || (zs = {}));
var qs;
(function(e) {
  e[e.UNKNOWN_OPERATOR = 0] = "UNKNOWN_OPERATOR", e[e.AND = 1] = "AND", e[e.OR = 2] = "OR", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(qs || (qs = {}));
var $s;
(function(e) {
  e[e.UNKNOWN_PREDICATE_OPERATOR = 0] = "UNKNOWN_PREDICATE_OPERATOR", e[e.EQUAL = 1] = "EQUAL", e[e.NOT_EQUAL = 2] = "NOT_EQUAL", e[e.GREATER_THAN_OR_EQUAL_TO = 3] = "GREATER_THAN_OR_EQUAL_TO", e[e.LESS_THAN_OR_EQUAL_TO = 4] = "LESS_THAN_OR_EQUAL_TO", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})($s || ($s = {}));
var Zs;
(function(e) {
  e[e.UNSET = 0] = "UNSET", e[e.CLIENT = 1] = "CLIENT", e[e.SERVER = 2] = "SERVER", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(Zs || (Zs = {}));
var Js;
(function(e) {
  e[e.UNKNOWN_PROPERTY = 0] = "UNKNOWN_PROPERTY", e[e.BATTERY_LEVEL = 1] = "BATTERY_LEVEL", e[e.IS_OFFLINE = 2] = "IS_OFFLINE", e[e.IS_CHARGING = 3] = "IS_CHARGING", e[e.BANDWIDTH = 4] = "BANDWIDTH", e[e.DISK_SIZE = 5] = "DISK_SIZE", e[e.DISK_AVAILABLE = 6] = "DISK_AVAILABLE", e[e.MEDIA_TYPE_DEPRECATED = 7] = "MEDIA_TYPE_DEPRECATED", e[e.IS_PUBLIC_STORY = 8] = "IS_PUBLIC_STORY", e[e.IS_OFFICIAL_STORY = 9] = "IS_OFFICIAL_STORY", e[e.CAMERA_DIRECTION = 10] = "CAMERA_DIRECTION", e[e.CAMERA_CONTEXT = 11] = "CAMERA_CONTEXT", e[e.CAMERA_API = 12] = "CAMERA_API", e[e.CAMERA_FLASH_STATE = 13] = "CAMERA_FLASH_STATE", e[e.SNAP_SOURCE = 14] = "SNAP_SOURCE", e[e.LEGACY_MUSHROOM_CONTENT_TYPE = 15] = "LEGACY_MUSHROOM_CONTENT_TYPE", e[e.UPLOAD_BANDWIDTH = 16] = "UPLOAD_BANDWIDTH", e[e.CAMERA2_LEVEL = 17] = "CAMERA2_LEVEL", e[e.CAMERA_NIGHT_MODE_STATE = 18] = "CAMERA_NIGHT_MODE_STATE", e[e.USER_LANGUAGE = 19] = "USER_LANGUAGE", e[e.VIDEO_DURATION = 20] = "VIDEO_DURATION", e[e.REALTIME_MOBILE_NETWORK_GENERATION = 21] = "REALTIME_MOBILE_NETWORK_GENERATION", e[e.REALTIME_NETWORK_TYPE = 22] = "REALTIME_NETWORK_TYPE", e[e.REALTIME_NETWORK_IS_METERED = 23] = "REALTIME_NETWORK_IS_METERED", e[e.REALTIME_NETWORK_IS_ROAMING = 24] = "REALTIME_NETWORK_IS_ROAMING", e[e.CAMERA_IS_FIRST_CAPTURE = 25] = "CAMERA_IS_FIRST_CAPTURE", e[e.PICTURE_MODE = 26] = "PICTURE_MODE", e[e.BOLT_USE_CASE = 27] = "BOLT_USE_CASE", e[e.BOLT_CDN_EXPERIMENTATION_ID = 28] = "BOLT_CDN_EXPERIMENTATION_ID", e[e.MINS_SINCE_LAST_LENS_ACTIVATION = 29] = "MINS_SINCE_LAST_LENS_ACTIVATION", e[e.MINS_SINCE_LAST_SNAPPABLE_LENS_ACTIVATION = 30] = "MINS_SINCE_LAST_SNAPPABLE_LENS_ACTIVATION", e[e.DAYS_SINCE_LAST_LOGIN_OR_OPEN = 31] = "DAYS_SINCE_LAST_LOGIN_OR_OPEN", e[e.SPECTACLES_VERSION = 32] = "SPECTACLES_VERSION", e[e.STICKY_MAX_CONNECTION_TYPE = 33] = "STICKY_MAX_CONNECTION_TYPE", e[e.WITH_ANIMATED_OVERLAY = 34] = "WITH_ANIMATED_OVERLAY", e[e.ESTIMATED_DURATION_FOR_EVENT_MS = 35] = "ESTIMATED_DURATION_FOR_EVENT_MS", e[e.URL = 36] = "URL", e[e.MEDIA_SOURCE = 37] = "MEDIA_SOURCE", e[e.ASSET_TYPE = 38] = "ASSET_TYPE", e[e.BOLT_IS_CONTENT_POPULAR = 39] = "BOLT_IS_CONTENT_POPULAR", e[e.CAPTURE_MODE = 40] = "CAPTURE_MODE", e[e.VP9_SOFTWARE_DECODING_SUPPORTED = 41] = "VP9_SOFTWARE_DECODING_SUPPORTED", e[e.AV1_SOFTWARE_DECODING_SUPPORTED = 42] = "AV1_SOFTWARE_DECODING_SUPPORTED", e[e.WITH_MUSIC = 43] = "WITH_MUSIC", e[e.FEATURE_PROVIDED_SIZE = 44] = "FEATURE_PROVIDED_SIZE", e[e.MEDIA_TYPE = 45] = "MEDIA_TYPE", e[e.SCANNED_CATEGORY_IDS = 46] = "SCANNED_CATEGORY_IDS", e[e.CONTENT_VIEW_SOURCE = 47] = "CONTENT_VIEW_SOURCE", e[e.RECIPIENTS_SUPPORT_HEVC = 48] = "RECIPIENTS_SUPPORT_HEVC", e[e.COGNAC_APP_ID = 49] = "COGNAC_APP_ID", e[e.EMAIL_VERIFIED = 50] = "EMAIL_VERIFIED", e[e.PHONE_VERIFIED = 51] = "PHONE_VERIFIED", e[e.NOTIFICATION_PERM_GRANTED = 52] = "NOTIFICATION_PERM_GRANTED", e[e.CONTACT_PERM_GRANTED = 53] = "CONTACT_PERM_GRANTED", e[e.MUTUAL_FRIENDS_COUNT = 54] = "MUTUAL_FRIENDS_COUNT", e[e.GROUPS_COUNT = 55] = "GROUPS_COUNT", e[e.HAS_NON_TEAM_SNAPCHAT_CONVERSATIONS = 56] = "HAS_NON_TEAM_SNAPCHAT_CONVERSATIONS", e[e.PLAYBACK_ITEM_TYPE = 57] = "PLAYBACK_ITEM_TYPE", e[e.SUP_BOOLEAN_PROPERTY = 58] = "SUP_BOOLEAN_PROPERTY", e[e.SUP_INTEGER_PROPERTY = 59] = "SUP_INTEGER_PROPERTY", e[e.SUP_LONG_PROPERTY = 60] = "SUP_LONG_PROPERTY", e[e.SUP_STRING_PROPERTY = 61] = "SUP_STRING_PROPERTY", e[e.SUP_DOUBLE_PROPERTY = 62] = "SUP_DOUBLE_PROPERTY", e[e.SUP_MILLIS_PROPERTY_TO_NOW = 63] = "SUP_MILLIS_PROPERTY_TO_NOW", e[e.HAS_USED_SPECTACLES = 64] = "HAS_USED_SPECTACLES", e[e.SUP_SECS_PROPERTY_TO_NOW = 65] = "SUP_SECS_PROPERTY_TO_NOW", e[e.BOLT_CLIENT_APP_STATE = 66] = "BOLT_CLIENT_APP_STATE", e[e.EMAIL_SET = 67] = "EMAIL_SET", e[e.BITMOJI_SET = 68] = "BITMOJI_SET", e[e.QUICK_TAP_CAMERA_SUPPORTED_ENABLED = 69] = "QUICK_TAP_CAMERA_SUPPORTED_ENABLED", e[e.HAS_ADD_FRIENDS_REQUEST = 70] = "HAS_ADD_FRIENDS_REQUEST", e[e.APP_LAUNCH_FROM_PUSH = 71] = "APP_LAUNCH_FROM_PUSH", e[e.APP_LAUNCH_TYPE = 72] = "APP_LAUNCH_TYPE", e[e.BILLBOARD_CAMPAIGN_LOCAL_IMPRESSION_COUNT = 73] = "BILLBOARD_CAMPAIGN_LOCAL_IMPRESSION_COUNT", e[e.BILLBOARD_CAMPAIGN_LOCAL_LAST_IMPRESSION_TIME_SECS_TO_NOW = 74] = "BILLBOARD_CAMPAIGN_LOCAL_LAST_IMPRESSION_TIME_SECS_TO_NOW", e[e.BILLBOARD_CAMPAIGN_LOCAL_CONTINUOUS_DISMISS_COUNT = 75] = "BILLBOARD_CAMPAIGN_LOCAL_CONTINUOUS_DISMISS_COUNT", e[e.FST_NUM_IN_APP_WARNINGS = 76] = "FST_NUM_IN_APP_WARNINGS", e[e.FST_SHOULD_CHANGE_PASSWORD = 77] = "FST_SHOULD_CHANGE_PASSWORD", e[e.FST_IS_BACKGROUND_CHECK = 78] = "FST_IS_BACKGROUND_CHECK", e[e.AUDIO_RECORD_PERM_GRANTED = 79] = "AUDIO_RECORD_PERM_GRANTED", e[e.MUTUAL_FRIENDS_WITH_BIRTHDAY_COUNT = 80] = "MUTUAL_FRIENDS_WITH_BIRTHDAY_COUNT", e[e.BILLBOARD_CAMPAIGN_LOCAL_DISMISS_COUNT = 81] = "BILLBOARD_CAMPAIGN_LOCAL_DISMISS_COUNT", e[e.USE_VERTICAL_NAVIGATION = 82] = "USE_VERTICAL_NAVIGATION", e[e.FREEABLE_DISK_AVAILABLE = 83] = "FREEABLE_DISK_AVAILABLE", e[e.MEMORIES_COUNT = 84] = "MEMORIES_COUNT", e[e.DEVICE_MODEL = 85] = "DEVICE_MODEL", e[e.COUNTRY = 86] = "COUNTRY", e[e.OS = 87] = "OS", e[e.OS_VERSION = 88] = "OS_VERSION", e[e.APP_VERSION = 89] = "APP_VERSION", e[e.BUILD_FLAVOR = 90] = "BUILD_FLAVOR", e[e.USER_ID = 91] = "USER_ID", e[e.LOCALE = 92] = "LOCALE", e[e.DEVICE_CLUSTER = 93] = "DEVICE_CLUSTER", e[e.DEVICE_BRAND = 94] = "DEVICE_BRAND", e[e.IS_EMPLOYEE = 95] = "IS_EMPLOYEE", e[e.USERNAME = 96] = "USERNAME", e[e.IS_TEST_USER = 97] = "IS_TEST_USER", e[e.USER_PROFILE = 98] = "USER_PROFILE", e[e.SCREEN_WIDTH = 99] = "SCREEN_WIDTH", e[e.SCREEN_HEIGHT = 100] = "SCREEN_HEIGHT", e[e.HEVC_SUPPORT = 101] = "HEVC_SUPPORT", e[e.NETWORK_TYPE = 102] = "NETWORK_TYPE", e[e.MAX_VIDEO_WIDTH = 103] = "MAX_VIDEO_WIDTH", e[e.MAX_VIDEO_HEIGHT = 104] = "MAX_VIDEO_HEIGHT", e[e.IS_NETWORK_METERED = 105] = "IS_NETWORK_METERED", e[e.IS_ROAMING = 106] = "IS_ROAMING", e[e.APP_ENGAGEMENT_LEVEL = 107] = "APP_ENGAGEMENT_LEVEL", e[e.COMMUNICATION_ENGAGEMENT_LEVEL = 108] = "COMMUNICATION_ENGAGEMENT_LEVEL", e[e.FRIEND_STORY_ENGAGEMENT_LEVEL = 109] = "FRIEND_STORY_ENGAGEMENT_LEVEL", e[e.PUBLIC_USER_STORY_ENGAGEMENT_LEVEL = 110] = "PUBLIC_USER_STORY_ENGAGEMENT_LEVEL", e[e.PUBLISHER_STORY_ENGAGEMENT_LEVEL = 111] = "PUBLISHER_STORY_ENGAGEMENT_LEVEL", e[e.LENS_ENGAGEMENT_LEVEL = 112] = "LENS_ENGAGEMENT_LEVEL", e[e.NON_FRIEND_STORY_ENGAGEMENT_LEVEL = 113] = "NON_FRIEND_STORY_ENGAGEMENT_LEVEL", e[e.FOLLOWER_SIZE_LEVEL = 114] = "FOLLOWER_SIZE_LEVEL", e[e.DAYS_SINCE_CREATION = 115] = "DAYS_SINCE_CREATION", e[e.USER_PERSONA = 116] = "USER_PERSONA", e[e.USER_CREATION_TIME = 117] = "USER_CREATION_TIME", e[e.MOBILE_NETWORK_TYPE = 118] = "MOBILE_NETWORK_TYPE", e[e.AGGREGATED_USER_BANDWIDTH = 119] = "AGGREGATED_USER_BANDWIDTH", e[e.LENS_CLUSTER_BIASED = 120] = "LENS_CLUSTER_BIASED", e[e.LENS_CLUSTER_LOG = 121] = "LENS_CLUSTER_LOG", e[e.LENS_CLUSTER_ORIG = 122] = "LENS_CLUSTER_ORIG", e[e.LENS_CLUSTER_ORIG_4 = 123] = "LENS_CLUSTER_ORIG_4", e[e.LENS_CLUSTER_BIASED_LOG = 124] = "LENS_CLUSTER_BIASED_LOG", e[e.APP_LOCALE = 125] = "APP_LOCALE", e[e.DEVICE_COMMON_NAME = 126] = "DEVICE_COMMON_NAME", e[e.USER_FRIEND_COUNT = 127] = "USER_FRIEND_COUNT", e[e.L90_COUNTRY = 128] = "L90_COUNTRY", e[e.STUB = 129] = "STUB", e[e.IS_TRUE = 130] = "IS_TRUE", e[e.STORY_POST_RATIO = 131] = "STORY_POST_RATIO", e[e.GENDER = 132] = "GENDER", e[e.INFERRED_AGE_BUCKET = 133] = "INFERRED_AGE_BUCKET", e[e.STORIES = 134] = "STORIES", e[e.SENDS = 135] = "SENDS", e[e.SNAP_CREATE_L7 = 136] = "SNAP_CREATE_L7", e[e.STORY_POST_L7 = 137] = "STORY_POST_L7", e[e.COMMUNICATION_L7 = 138] = "COMMUNICATION_L7", e[e.DF_L7 = 139] = "DF_L7", e[e.APP_L7 = 140] = "APP_L7", e[e.DAYS_SINCE_CREATION_BUCKET = 141] = "DAYS_SINCE_CREATION_BUCKET", e[e.BIDIRECTIONAL_FRIEND_STATUS = 142] = "BIDIRECTIONAL_FRIEND_STATUS", e[e.STORY_POST_PREDICTION = 143] = "STORY_POST_PREDICTION", e[e.APP_OPENS = 144] = "APP_OPENS", e[e.LENS_SWIPES = 145] = "LENS_SWIPES", e[e.LENS_SNAPS = 146] = "LENS_SNAPS", e[e.LENS_OPS = 147] = "LENS_OPS", e[e.W1_APP_OPENS = 148] = "W1_APP_OPENS", e[e.W1_LENS_SWIPES = 149] = "W1_LENS_SWIPES", e[e.W1_LENS_SNAPS = 150] = "W1_LENS_SNAPS", e[e.W1_LENS_OPS = 151] = "W1_LENS_OPS", e[e.W2_APP_OPENS = 152] = "W2_APP_OPENS", e[e.W2_LENS_SWIPES = 153] = "W2_LENS_SWIPES", e[e.W2_LENS_SNAPS = 154] = "W2_LENS_SNAPS", e[e.W2_LENS_OPS = 155] = "W2_LENS_OPS", e[e.W34_APP_OPENS = 156] = "W34_APP_OPENS", e[e.W34_LENS_SWIPES = 157] = "W34_LENS_SWIPES", e[e.W34_LENS_SNAPS = 158] = "W34_LENS_SNAPS", e[e.W34_LENS_OPS = 159] = "W34_LENS_OPS", e[e.LENS_SWIPES_PREDICTION = 160] = "LENS_SWIPES_PREDICTION", e[e.REGISTRATION_COUNTRY = 161] = "REGISTRATION_COUNTRY", e[e.IP_ASN = 162] = "IP_ASN", e[e.IP_REGION = 163] = "IP_REGION", e[e.IP_CITY = 164] = "IP_CITY", e[e.HAS_USER_ID = 165] = "HAS_USER_ID", e[e.HAS_BITMOJI = 166] = "HAS_BITMOJI", e[e.NUM_APP_OPENS_LAST_8_DAYS = 167] = "NUM_APP_OPENS_LAST_8_DAYS", e[e.NUM_FEATURE_STORY_VIEW_DAYS_L7 = 168] = "NUM_FEATURE_STORY_VIEW_DAYS_L7", e[e.NUM_FEATURE_STORY_SYNC_DAYS_L7 = 169] = "NUM_FEATURE_STORY_SYNC_DAYS_L7", e[e.HEXAGON_NN_SUPPORTED_VERSION = 170] = "HEXAGON_NN_SUPPORTED_VERSION", e[e.NETWORK_QUALITY = 171] = "NETWORK_QUALITY", e[e.DEVICE_MEMORY_MB = 172] = "DEVICE_MEMORY_MB", e[e.DEVICE_GL_VERSION = 173] = "DEVICE_GL_VERSION", e[e.SNAP_PRO_STATUS = 174] = "SNAP_PRO_STATUS", e[e.DEVICE_VP9_DECODING_SUPPORT = 175] = "DEVICE_VP9_DECODING_SUPPORT", e[e.AVG_FRIEND_STORY_VIEW_COUNT_L7 = 176] = "AVG_FRIEND_STORY_VIEW_COUNT_L7", e[e.GAME_JOIN_TIME = 177] = "GAME_JOIN_TIME", e[e.GAME_LAST_ACTIVE_TIME = 178] = "GAME_LAST_ACTIVE_TIME", e[e.DAYS_SINCE_FIRST_GAME_ACTIVITY = 179] = "DAYS_SINCE_FIRST_GAME_ACTIVITY", e[e.DAYS_SINCE_LAST_GAME_ACTIVITY = 180] = "DAYS_SINCE_LAST_GAME_ACTIVITY", e[e.PF_PAGE_SESSIONS_WITH_LONG_IMP = 181] = "PF_PAGE_SESSIONS_WITH_LONG_IMP", e[e.WIRELESS_CARRIER = 182] = "WIRELESS_CARRIER", e[e.MINIS_JOIN_TIME = 183] = "MINIS_JOIN_TIME", e[e.MINIS_LAST_ACTIVE_TIME = 184] = "MINIS_LAST_ACTIVE_TIME", e[e.DAYS_SINCE_FIRST_MINIS_ACTIVITY = 185] = "DAYS_SINCE_FIRST_MINIS_ACTIVITY", e[e.DAYS_SINCE_LAST_MINIS_ACTIVITY = 186] = "DAYS_SINCE_LAST_MINIS_ACTIVITY", e[e.DEVICE_AV1_DECODING_SUPPORT = 187] = "DEVICE_AV1_DECODING_SUPPORT", e[e.APP_PACKAGE_INSTALLER = 188] = "APP_PACKAGE_INSTALLER", e[e.STORY_VIEWS_5TH_TAB_ENGAGEMENT_LEVEL = 189] = "STORY_VIEWS_5TH_TAB_ENGAGEMENT_LEVEL", e[e.REPORTED_AGE = 190] = "REPORTED_AGE", e[e.ANDROID_MOBILE_SERVICES_PROVIDER = 191] = "ANDROID_MOBILE_SERVICES_PROVIDER", e[e.IS_ACQUIRED_USER = 192] = "IS_ACQUIRED_USER", e[e.YDPI = 193] = "YDPI", e[e.BIDIRECTIONAL_FRIEND_STATUS_VELLUM = 194] = "BIDIRECTIONAL_FRIEND_STATUS_VELLUM", e[e.ORIGIN = 195] = "ORIGIN", e[e.LENSCORE_VERSION = 196] = "LENSCORE_VERSION", e[e.SNAPKIT_APP_ID = 197] = "SNAPKIT_APP_ID", e[e.GPU = 198] = "GPU", e[e.CHIPSET_NAME = 199] = "CHIPSET_NAME", e[e.CHIPSET_VERSION = 200] = "CHIPSET_VERSION", e[e.HAS_ZERO_IDFA = 201] = "HAS_ZERO_IDFA", e[e.LIMIT_AD_TRACKING = 202] = "LIMIT_AD_TRACKING", e[e.ATT_AUTH_STATUS = 203] = "ATT_AUTH_STATUS", e[e.CAMERA2_FRONT_SS_GAIN_OVER_TPA = 204] = "CAMERA2_FRONT_SS_GAIN_OVER_TPA", e[e.ATTACHMENT_TOOL_V2 = 205] = "ATTACHMENT_TOOL_V2", e[e.USER_PERSONA_V3 = 206] = "USER_PERSONA_V3", e[e.SNAPS_SEND_WITH_HEVC = 207] = "SNAPS_SEND_WITH_HEVC", e[e.SNAPS_SEND_WITHOUT_HEVC = 208] = "SNAPS_SEND_WITHOUT_HEVC", e[e.CAMERA2_NATIVE_CRASH_OVER_CAMERA1 = 209] = "CAMERA2_NATIVE_CRASH_OVER_CAMERA1", e[e.CAMERA2_G2S_LATENCY_OVER_CAMERA1 = 210] = "CAMERA2_G2S_LATENCY_OVER_CAMERA1", e[e.IS_INTERNAL = 211] = "IS_INTERNAL", e[e.IS_WEB = 212] = "IS_WEB", e[e.APP_OPEN_TO_MAP = 213] = "APP_OPEN_TO_MAP", e[e.APP_OPEN_TO_FRIENDSFEED = 214] = "APP_OPEN_TO_FRIENDSFEED", e[e.APP_OPEN_TO_LENSES = 215] = "APP_OPEN_TO_LENSES", e[e.APP_OPEN_TO_MEMORIES = 216] = "APP_OPEN_TO_MEMORIES", e[e.APP_OPEN_TO_COMMUNITY = 217] = "APP_OPEN_TO_COMMUNITY", e[e.APP_OPEN_TO_SPOTLIGHT = 218] = "APP_OPEN_TO_SPOTLIGHT", e[e.IS_IMPACTED_BY_PINC_893 = 219] = "IS_IMPACTED_BY_PINC_893", e[e.DAYS_BEFORE_BIRTHDAY = 220] = "DAYS_BEFORE_BIRTHDAY", e[e.HAS_BIPA = 221] = "HAS_BIPA", e[e.SPOTLIGHT_STORY_ENGAGEMENT_STATUS = 222] = "SPOTLIGHT_STORY_ENGAGEMENT_STATUS", e[e.INCLUSION_PANEL_MEMBER = 223] = "INCLUSION_PANEL_MEMBER", e[e.HEVC_HW_DECODER = 224] = "HEVC_HW_DECODER", e[e.HEVC_SW_DECODER = 225] = "HEVC_SW_DECODER", e[e.HASH_MURMUR3_128_MOD_100 = 226] = "HASH_MURMUR3_128_MOD_100", e[e.HAS_ACTIVE_SNAPCHAT_PLUS = 227] = "HAS_ACTIVE_SNAPCHAT_PLUS", e[e.SNAP_KIT_OAUTH_ID = 228] = "SNAP_KIT_OAUTH_ID", e[e.ORGANIZATION_TYPE = 229] = "ORGANIZATION_TYPE", e[e.CHUNK_UPLOAD_SUPPORT_REQUIRED = 230] = "CHUNK_UPLOAD_SUPPORT_REQUIRED", e[e.CLOUDFRONT_POP = 231] = "CLOUDFRONT_POP", e[e.BILLBOARD_CAMPAIGN_LOCAL_FIRST_IMPRESSION_TIME_SECS_TO_NOW = 232] = "BILLBOARD_CAMPAIGN_LOCAL_FIRST_IMPRESSION_TIME_SECS_TO_NOW", e[e.BILLBOARD_CAMPAIGN_LOCAL_CLICK_COUNT = 233] = "BILLBOARD_CAMPAIGN_LOCAL_CLICK_COUNT", e[e.BILLBOARD_CAMPAIGN_LOCAL_INTERACTION_COUNT = 234] = "BILLBOARD_CAMPAIGN_LOCAL_INTERACTION_COUNT", e[e.BILLBOARD_CAMPAIGN_LOCAL_LAST_INTERACTION_TIME_SECS_TO_NOW = 235] = "BILLBOARD_CAMPAIGN_LOCAL_LAST_INTERACTION_TIME_SECS_TO_NOW", e[e.FST_LOCK_SCREEN_WIDGET_BILLBOARD_LAUNCHED_FROM_PUSH = 236] = "FST_LOCK_SCREEN_WIDGET_BILLBOARD_LAUNCHED_FROM_PUSH", e[e.WEB_SCREEN_WIDTH = 237] = "WEB_SCREEN_WIDTH", e[e.WEB_SCREEN_HEIGHT = 238] = "WEB_SCREEN_HEIGHT", e[e.SUP_IOS_LOCK_SCREEN_WIDGET_ENABLED = 239] = "SUP_IOS_LOCK_SCREEN_WIDGET_ENABLED", e[e.SNAP_PRIVACY = 240] = "SNAP_PRIVACY", e[e.ADS_INTERFACES_IS_NEW_ORGANIZATION = 241] = "ADS_INTERFACES_IS_NEW_ORGANIZATION", e[e.SERVER_ONLY = 242] = "SERVER_ONLY", e[e.GHE_ORGANIZATION = 243] = "GHE_ORGANIZATION", e[e.GHE_REPOSITORY = 244] = "GHE_REPOSITORY", e[e.GHE_USER_EMAIL = 245] = "GHE_USER_EMAIL", e[e.BUILD_DEFINITION_ID = 246] = "BUILD_DEFINITION_ID", e[e.BUILD_DEFINITION_NAME = 247] = "BUILD_DEFINITION_NAME", e[e.LCA_PRINCIPAL = 248] = "LCA_PRINCIPAL", e[e.MEDIA_PERFORMANCE_CLASS = 249] = "MEDIA_PERFORMANCE_CLASS", e[e.COMMUNITY_COUNT = 250] = "COMMUNITY_COUNT", e[e.RECIPIENTS_SUPPORT_FMP4 = 251] = "RECIPIENTS_SUPPORT_FMP4", e[e.SCREEN_ASPECT_RATIO = 252] = "SCREEN_ASPECT_RATIO", e[e.USER_GROUP = 253] = "USER_GROUP", e[e.USER_HAS_DENIED_CAMERA_PERM = 254] = "USER_HAS_DENIED_CAMERA_PERM", e[e.CAMEOS_ENGAGEMENT_LEVEL = 255] = "CAMEOS_ENGAGEMENT_LEVEL", e[e.HAS_CAMEOS = 256] = "HAS_CAMEOS", e[e.IS_ACTIVE_LENS_VIDEO_CHAT_USER = 257] = "IS_ACTIVE_LENS_VIDEO_CHAT_USER", e[e.NUM_SPOTLIGHT_POSTS_L7 = 258] = "NUM_SPOTLIGHT_POSTS_L7", e[e.NUM_MAP_POSTS_L7 = 259] = "NUM_MAP_POSTS_L7", e[e.HAS_CREATED_PUBLIC_PROFILE = 260] = "HAS_CREATED_PUBLIC_PROFILE", e[e.HAS_PUBLIC_PROFILE_ACCESS_VIA_ROLE = 261] = "HAS_PUBLIC_PROFILE_ACCESS_VIA_ROLE", e[e.DAYS_SINCE_LAST_CAMERA_PERM_DENY = 262] = "DAYS_SINCE_LAST_CAMERA_PERM_DENY", e[e.DAYS_SINCE_AD_ORG_JOIN = 263] = "DAYS_SINCE_AD_ORG_JOIN", e[e.DAYS_SINCE_FIRST_AD_CREATE = 264] = "DAYS_SINCE_FIRST_AD_CREATE", e[e.ORGANIZATION_COUNTRY = 265] = "ORGANIZATION_COUNTRY", e[e.DAYS_SINCE_FIRST_DWEB_VISIT = 266] = "DAYS_SINCE_FIRST_DWEB_VISIT", e[e.DAYS_SINCE_LAST_DWEB_VISIT = 267] = "DAYS_SINCE_LAST_DWEB_VISIT", e[e.WEEKS_SINCE_USING_DWEB = 268] = "WEEKS_SINCE_USING_DWEB", e[e.HAS_LENS = 269] = "HAS_LENS", e[e.BILLBOARD_SERVER_IMPRESSION_COUNT = 270] = "BILLBOARD_SERVER_IMPRESSION_COUNT", e[e.BILLBOARD_SERVER_CLICK_COUNT = 271] = "BILLBOARD_SERVER_CLICK_COUNT", e[e.BILLBOARD_SERVER_DISMISS_COUNT = 272] = "BILLBOARD_SERVER_DISMISS_COUNT", e[e.BILLBOARD_SERVER_INTERACTION_COUNT = 273] = "BILLBOARD_SERVER_INTERACTION_COUNT", e[e.BILLBOARD_SERVER_FIRST_IMPRESSION_TIME_SECS_TO_NOW = 274] = "BILLBOARD_SERVER_FIRST_IMPRESSION_TIME_SECS_TO_NOW", e[e.BILLBOARD_SERVER_LAST_IMPRESSION_TIME_SECS_TO_NOW = 275] = "BILLBOARD_SERVER_LAST_IMPRESSION_TIME_SECS_TO_NOW", e[e.BILLBOARD_SERVER_FIRST_CLICK_TIME_SECS_TO_NOW = 276] = "BILLBOARD_SERVER_FIRST_CLICK_TIME_SECS_TO_NOW", e[e.BILLBOARD_SERVER_LAST_CLICK_TIME_SECS_TO_NOW = 277] = "BILLBOARD_SERVER_LAST_CLICK_TIME_SECS_TO_NOW", e[e.BILLBOARD_SERVER_FIRST_DISMISS_TIME_SECS_TO_NOW = 278] = "BILLBOARD_SERVER_FIRST_DISMISS_TIME_SECS_TO_NOW", e[e.BILLBOARD_SERVER_LAST_DISMISS_TIME_SECS_TO_NOW = 279] = "BILLBOARD_SERVER_LAST_DISMISS_TIME_SECS_TO_NOW", e[e.BILLBOARD_SERVER_FIRST_INTERACTION_TIME_SECS_TO_NOW = 280] = "BILLBOARD_SERVER_FIRST_INTERACTION_TIME_SECS_TO_NOW", e[e.BILLBOARD_SERVER_LAST_INTERACTION_TIME_SECS_TO_NOW = 281] = "BILLBOARD_SERVER_LAST_INTERACTION_TIME_SECS_TO_NOW", e[e.BILLBOARD_SERVER_CONTINUOUS_DISMISS_COUNT = 282] = "BILLBOARD_SERVER_CONTINUOUS_DISMISS_COUNT", e[e.BILLBOARD_CAMPAIGN_LOCAL_FIRST_CLICK_TIME_SECS_TO_NOW = 283] = "BILLBOARD_CAMPAIGN_LOCAL_FIRST_CLICK_TIME_SECS_TO_NOW", e[e.BILLBOARD_CAMPAIGN_LOCAL_LAST_CLICK_TIME_SECS_TO_NOW = 284] = "BILLBOARD_CAMPAIGN_LOCAL_LAST_CLICK_TIME_SECS_TO_NOW", e[e.BILLBOARD_CAMPAIGN_LOCAL_FIRST_DISMISS_TIME_SECS_TO_NOW = 285] = "BILLBOARD_CAMPAIGN_LOCAL_FIRST_DISMISS_TIME_SECS_TO_NOW", e[e.BILLBOARD_CAMPAIGN_LOCAL_LAST_DISMISS_TIME_SECS_TO_NOW = 286] = "BILLBOARD_CAMPAIGN_LOCAL_LAST_DISMISS_TIME_SECS_TO_NOW", e[e.BILLBOARD_CAMPAIGN_LOCAL_FIRST_INTERACTION_TIME_SECS_TO_NOW = 287] = "BILLBOARD_CAMPAIGN_LOCAL_FIRST_INTERACTION_TIME_SECS_TO_NOW", e[e.DAYS_SINCE_FIRST_AD_SPEND = 288] = "DAYS_SINCE_FIRST_AD_SPEND", e[e.DAYS_SINCE_LAST_AD_SPEND = 289] = "DAYS_SINCE_LAST_AD_SPEND", e[e.SPOTLIGHT_2_PLUS_STORY_SESSION_7D_STATUS_DETAILED = 290] = "SPOTLIGHT_2_PLUS_STORY_SESSION_7D_STATUS_DETAILED", e[e.SPOTLIGHT_5_PLUS_STORY_SESSION_7D_STATUS_DETAILED = 291] = "SPOTLIGHT_5_PLUS_STORY_SESSION_7D_STATUS_DETAILED", e[e.SPOTLIGHT_STORY_VIEW_7D_STATUS_DETAILED = 292] = "SPOTLIGHT_STORY_VIEW_7D_STATUS_DETAILED", e[e.LAST_USER_ACCEPTED_TOS = 293] = "LAST_USER_ACCEPTED_TOS", e[e.UPDATED_DEVICE_CLUSTER = 294] = "UPDATED_DEVICE_CLUSTER", e[e.CREATOR_TIER = 295] = "CREATOR_TIER", e[e.AV1_SW_DECODER = 296] = "AV1_SW_DECODER", e[e.AV1_HW_DECODER = 297] = "AV1_HW_DECODER", e[e.HAS_EXPLICIT_PUBLIC_PROFILE = 298] = "HAS_EXPLICIT_PUBLIC_PROFILE", e[e.LARGER_TEXT_DISPLAY_OPTION_ENABLED = 299] = "LARGER_TEXT_DISPLAY_OPTION_ENABLED", e[e.IS_PUBLIC_POSTING_PREFERRED_USER = 300] = "IS_PUBLIC_POSTING_PREFERRED_USER", e[e.RUID = 301] = "RUID", e[e.MUTABLE_USERNAME = 302] = "MUTABLE_USERNAME", e[e.BUDGET_GROUP_ID = 303] = "BUDGET_GROUP_ID", e[e.AB_POPULATION_RANGE_HASH_FUNC = 304] = "AB_POPULATION_RANGE_HASH_FUNC", e[e.AB_TREATMENT_RANGE_HASH_FUNC = 305] = "AB_TREATMENT_RANGE_HASH_FUNC", e[e.REGISTRATION_IP_REGION = 306] = "REGISTRATION_IP_REGION", e[e.RUID_TYPE = 307] = "RUID_TYPE", e[e.PLUS_INTERNAL_ONLY = 308] = "PLUS_INTERNAL_ONLY", e[e.COF_ROLLOUT_RANGE_HASH_FUNC = 309] = "COF_ROLLOUT_RANGE_HASH_FUNC", e[e.SUP_HAS_AI_SELFIE = 341] = "SUP_HAS_AI_SELFIE", e[e.SUP_HAS_DREAMS = 342] = "SUP_HAS_DREAMS", e[e.DAYS_SINCE_LAST_ACTIVITY = 343] = "DAYS_SINCE_LAST_ACTIVITY", e[e.CONTACT_PERM_OS_GRANTED = 344] = "CONTACT_PERM_OS_GRANTED", e[e.CONTACT_PERM_USER_GRANTED = 345] = "CONTACT_PERM_USER_GRANTED", e[e.LENS_CLUSTER_GPU_V2 = 346] = "LENS_CLUSTER_GPU_V2", e[e.CAN_ACCESS_ADS_TAB = 347] = "CAN_ACCESS_ADS_TAB", e[e.GOOGLE_CDN_POP = 348] = "GOOGLE_CDN_POP", e[e.NUM_STRONG_RELATIONSHIPS_V3 = 349] = "NUM_STRONG_RELATIONSHIPS_V3", e[e.NUM_CLOSE_PLUS_RELATIONSHIPS_V3 = 350] = "NUM_CLOSE_PLUS_RELATIONSHIPS_V3", e[e.NUM_ACQUAINTANCE_PLUS_RELATIONSHIPS_V3 = 351] = "NUM_ACQUAINTANCE_PLUS_RELATIONSHIPS_V3", e[e.DREAMS_ENGAGEMENT_STATUS = 352] = "DREAMS_ENGAGEMENT_STATUS", e[e.IS_LOW_LIGHT = 353] = "IS_LOW_LIGHT", e[e.GALLERY_HAS_2023_YEAR_END_STORY = 354] = "GALLERY_HAS_2023_YEAR_END_STORY", e[e.CHUNK_UPLOAD_PREFERENCE = 355] = "CHUNK_UPLOAD_PREFERENCE", e[e.ADMIN_USE_ONLY_IN_AB_TRAFFIC_SPLIT = 356] = "ADMIN_USE_ONLY_IN_AB_TRAFFIC_SPLIT", e[e.IS_IPHONE = 357] = "IS_IPHONE", e[e.IS_S11_COUNTRY = 358] = "IS_S11_COUNTRY", e[e.IS_S11_L90_COUNTRY = 359] = "IS_S11_L90_COUNTRY", e[e.NUM_ACTIVE_FRIENDS_L7 = 360] = "NUM_ACTIVE_FRIENDS_L7", e[e.NUM_BIDIRECTIONAL_COMMUNICATION_FRIENDS_L7 = 361] = "NUM_BIDIRECTIONAL_COMMUNICATION_FRIENDS_L7", e[e.FULLY_ROLLED_OUT_STUDIES_OPTIMIZATION_ENABLED = 362] = "FULLY_ROLLED_OUT_STUDIES_OPTIMIZATION_ENABLED", e[e.HAS_USER_ONBOARDED = 367] = "HAS_USER_ONBOARDED", e[e.ADS_STANDARD_AB_HASH_FUNC = 368] = "ADS_STANDARD_AB_HASH_FUNC", e[e.IS_TOP_STORY_POSTER = 369] = "IS_TOP_STORY_POSTER", e[e.COMMUNITY_COUNT_SERVER = 370] = "COMMUNITY_COUNT_SERVER", e[e.REPORT_VOLUME_LAST_14_DAYS = 371] = "REPORT_VOLUME_LAST_14_DAYS", e[e.IS_CONCURRENT_CAMERA_SUPPORTED = 372] = "IS_CONCURRENT_CAMERA_SUPPORTED", e[e.CONTACT_AUTHORIZATION_STATUS = 373] = "CONTACT_AUTHORIZATION_STATUS", e[e.DISCOVER_FEED_TYPE = 374] = "DISCOVER_FEED_TYPE", e[e.JOINED_VIA_USER_INVITE = 377] = "JOINED_VIA_USER_INVITE", e[e.STICKY_REGION = 378] = "STICKY_REGION", e[e.BIPA_REGION = 379] = "BIPA_REGION", e[e.GRADUAL_ROLLOUT_HASH_FUNC = 380] = "GRADUAL_ROLLOUT_HASH_FUNC", e[e.IS_COF_EDGE_CLIENT = 381] = "IS_COF_EDGE_CLIENT", e[e.COF_EDGE_CLIENT_VERSION = 382] = "COF_EDGE_CLIENT_VERSION", e[e.IS_DORMANT = 383] = "IS_DORMANT", e[e.HAS_FORMER_PHONE_NUMBER = 384] = "HAS_FORMER_PHONE_NUMBER", e[e.OS_BUILD_VERSION = 385] = "OS_BUILD_VERSION", e[e.SNAP_PROMOTE_DAYS_SINCE_FIRST_AD_CREATE = 386] = "SNAP_PROMOTE_DAYS_SINCE_FIRST_AD_CREATE", e[e.SNAP_PROMOTE_DAYS_SINCE_LAST_AD_CREATE = 387] = "SNAP_PROMOTE_DAYS_SINCE_LAST_AD_CREATE", e[e.SNAP_PROMOTE_DAYS_SINCE_FIRST_SPEND = 388] = "SNAP_PROMOTE_DAYS_SINCE_FIRST_SPEND", e[e.SNAP_PROMOTE_DAYS_SINCE_LAST_SPEND = 389] = "SNAP_PROMOTE_DAYS_SINCE_LAST_SPEND", e[e.SNAP_PROMOTE_TOTAL_SPEND_USD = 390] = "SNAP_PROMOTE_TOTAL_SPEND_USD", e[e.SNAP_PROMOTE_AVG_DAILY_SPEND_USD = 391] = "SNAP_PROMOTE_AVG_DAILY_SPEND_USD", e[e.SNAP_PROMOTE_LAST_OBJECTIVE = 392] = "SNAP_PROMOTE_LAST_OBJECTIVE", e[e.SNAP_PROMOTE_BUDGET_REMAINING = 393] = "SNAP_PROMOTE_BUDGET_REMAINING", e[e.IS_MONETIZATION_ELIGIBLE = 394] = "IS_MONETIZATION_ELIGIBLE", e[e.IS_OPTED_IN_DATA_SHARING = 395] = "IS_OPTED_IN_DATA_SHARING", e[e.ADS_BUDGET_AB_MACROSTATE_HASH_FUNC = 396] = "ADS_BUDGET_AB_MACROSTATE_HASH_FUNC", e[e.AB_TREATMENT = 397] = "AB_TREATMENT", e[e.DREAMS_IN_SNAPFEED_VIEW_ACTIVE_DAYS_L7 = 398] = "DREAMS_IN_SNAPFEED_VIEW_ACTIVE_DAYS_L7", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(Js || (Js = {}));
var Xs;
(function(e) {
  e[e.UNKNOWN_SIGNAL_TO_HASH = 0] = "UNKNOWN_SIGNAL_TO_HASH", e[e.HASH_SEED_AND_USER_ID = 1] = "HASH_SEED_AND_USER_ID", e[e.HASH_USER_ID_AND_NAMESPACE = 2] = "HASH_USER_ID_AND_NAMESPACE", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(Xs || (Xs = {}));
function Qs() {
  return {
    configId: "",
    value: void 0,
    targetingExpression: void 0,
    ttlSeconds: "0",
    configRuleUuidBytes: new Uint8Array(0),
    priority: 0,
    namespace: 0,
    studyName: "",
    experimentId: 0,
    delete: !1,
    servePlatforms: [],
    sequenceId: 0,
    ruidType: 0,
    segmentOrdinal: 0,
    generatedFromAbAllowlists: !1,
    internalFields: void 0,
    configIntId: 0
  };
}
const J = {
  encode(e, n = new I()) {
    e.configId !== "" && n.uint32(10).string(e.configId), e.value !== void 0 && Pe.encode(e.value, n.uint32(18).fork()).join(), e.targetingExpression !== void 0 && Ve.encode(e.targetingExpression, n.uint32(26).fork()).join(), e.ttlSeconds !== "0" && n.uint32(32).int64(e.ttlSeconds), e.configRuleUuidBytes.length !== 0 && n.uint32(42).bytes(e.configRuleUuidBytes), e.priority !== 0 && n.uint32(48).int32(e.priority), e.namespace !== 0 && n.uint32(56).int32(e.namespace), e.studyName !== "" && n.uint32(66).string(e.studyName), e.experimentId !== 0 && n.uint32(72).int32(e.experimentId), e.delete !== !1 && n.uint32(80).bool(e.delete), n.uint32(90).fork();
    for (const t of e.servePlatforms)
      n.int32(t);
    return n.join(), e.sequenceId !== 0 && n.uint32(96).int32(e.sequenceId), e.ruidType !== 0 && n.uint32(104).int32(e.ruidType), e.segmentOrdinal !== 0 && n.uint32(112).int32(e.segmentOrdinal), e.generatedFromAbAllowlists !== !1 && n.uint32(120).bool(e.generatedFromAbAllowlists), e.internalFields !== void 0 && Yt.encode(e.internalFields, n.uint32(130).fork()).join(), e.configIntId !== 0 && n.uint32(149).sfixed32(e.configIntId), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Qs();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.configId = t.string();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.value = Pe.decode(t, t.uint32());
          continue;
        }
        case 3: {
          if (i !== 26)
            break;
          r.targetingExpression = Ve.decode(t, t.uint32());
          continue;
        }
        case 4: {
          if (i !== 32)
            break;
          r.ttlSeconds = t.int64().toString();
          continue;
        }
        case 5: {
          if (i !== 42)
            break;
          r.configRuleUuidBytes = t.bytes();
          continue;
        }
        case 6: {
          if (i !== 48)
            break;
          r.priority = t.int32();
          continue;
        }
        case 7: {
          if (i !== 56)
            break;
          r.namespace = t.int32();
          continue;
        }
        case 8: {
          if (i !== 66)
            break;
          r.studyName = t.string();
          continue;
        }
        case 9: {
          if (i !== 72)
            break;
          r.experimentId = t.int32();
          continue;
        }
        case 10: {
          if (i !== 80)
            break;
          r.delete = t.bool();
          continue;
        }
        case 11: {
          if (i === 88) {
            r.servePlatforms.push(t.int32());
            continue;
          }
          if (i === 90) {
            const o = t.uint32() + t.pos;
            for (; t.pos < o; )
              r.servePlatforms.push(t.int32());
            continue;
          }
          break;
        }
        case 12: {
          if (i !== 96)
            break;
          r.sequenceId = t.int32();
          continue;
        }
        case 13: {
          if (i !== 104)
            break;
          r.ruidType = t.int32();
          continue;
        }
        case 14: {
          if (i !== 112)
            break;
          r.segmentOrdinal = t.int32();
          continue;
        }
        case 15: {
          if (i !== 120)
            break;
          r.generatedFromAbAllowlists = t.bool();
          continue;
        }
        case 16: {
          if (i !== 130)
            break;
          r.internalFields = Yt.decode(t, t.uint32());
          continue;
        }
        case 18: {
          if (i !== 149)
            break;
          r.configIntId = t.sfixed32();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return J.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r, i, o, s, u, c, d, m, l, f, E;
    const v = Qs();
    return v.configId = (n = e.configId) !== null && n !== void 0 ? n : "", v.value = e.value !== void 0 && e.value !== null ? Pe.fromPartial(e.value) : void 0, v.targetingExpression = e.targetingExpression !== void 0 && e.targetingExpression !== null ? Ve.fromPartial(e.targetingExpression) : void 0, v.ttlSeconds = (t = e.ttlSeconds) !== null && t !== void 0 ? t : "0", v.configRuleUuidBytes = (a = e.configRuleUuidBytes) !== null && a !== void 0 ? a : new Uint8Array(0), v.priority = (r = e.priority) !== null && r !== void 0 ? r : 0, v.namespace = (i = e.namespace) !== null && i !== void 0 ? i : 0, v.studyName = (o = e.studyName) !== null && o !== void 0 ? o : "", v.experimentId = (s = e.experimentId) !== null && s !== void 0 ? s : 0, v.delete = (u = e.delete) !== null && u !== void 0 ? u : !1, v.servePlatforms = ((c = e.servePlatforms) === null || c === void 0 ? void 0 : c.map((p) => p)) || [], v.sequenceId = (d = e.sequenceId) !== null && d !== void 0 ? d : 0, v.ruidType = (m = e.ruidType) !== null && m !== void 0 ? m : 0, v.segmentOrdinal = (l = e.segmentOrdinal) !== null && l !== void 0 ? l : 0, v.generatedFromAbAllowlists = (f = e.generatedFromAbAllowlists) !== null && f !== void 0 ? f : !1, v.internalFields = e.internalFields !== void 0 && e.internalFields !== null ? Yt.fromPartial(e.internalFields) : void 0, v.configIntId = (E = e.configIntId) !== null && E !== void 0 ? E : 0, v;
  }
};
function js() {
  return {
    configBitmapIndex: 0,
    configResultBitmapIndex: 0,
    hasServerPropertiesOnly: !1,
    globalPriority: 0,
    sequenceIds: [],
    studySegmentOrdinal: 0,
    experimentGuid: "0",
    isAbStudyStatusCompleted: !1,
    gradualRolloutId: "",
    gradualRolloutIsControl: !1,
    gradualRolloutIsDeleted: !1
  };
}
const Yt = {
  encode(e, n = new I()) {
    e.configBitmapIndex !== 0 && n.uint32(8).int32(e.configBitmapIndex), e.configResultBitmapIndex !== 0 && n.uint32(16).int32(e.configResultBitmapIndex), e.hasServerPropertiesOnly !== !1 && n.uint32(24).bool(e.hasServerPropertiesOnly), e.globalPriority !== 0 && n.uint32(32).int32(e.globalPriority);
    for (const t of e.sequenceIds)
      Wt.encode(t, n.uint32(42).fork()).join();
    return e.studySegmentOrdinal !== 0 && n.uint32(48).int32(e.studySegmentOrdinal), e.experimentGuid !== "0" && n.uint32(56).uint64(e.experimentGuid), e.isAbStudyStatusCompleted !== !1 && n.uint32(64).bool(e.isAbStudyStatusCompleted), e.gradualRolloutId !== "" && n.uint32(74).string(e.gradualRolloutId), e.gradualRolloutIsControl !== !1 && n.uint32(80).bool(e.gradualRolloutIsControl), e.gradualRolloutIsDeleted !== !1 && n.uint32(88).bool(e.gradualRolloutIsDeleted), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = js();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.configBitmapIndex = t.int32();
          continue;
        }
        case 2: {
          if (i !== 16)
            break;
          r.configResultBitmapIndex = t.int32();
          continue;
        }
        case 3: {
          if (i !== 24)
            break;
          r.hasServerPropertiesOnly = t.bool();
          continue;
        }
        case 4: {
          if (i !== 32)
            break;
          r.globalPriority = t.int32();
          continue;
        }
        case 5: {
          if (i !== 42)
            break;
          r.sequenceIds.push(Wt.decode(t, t.uint32()));
          continue;
        }
        case 6: {
          if (i !== 48)
            break;
          r.studySegmentOrdinal = t.int32();
          continue;
        }
        case 7: {
          if (i !== 56)
            break;
          r.experimentGuid = t.uint64().toString();
          continue;
        }
        case 8: {
          if (i !== 64)
            break;
          r.isAbStudyStatusCompleted = t.bool();
          continue;
        }
        case 9: {
          if (i !== 74)
            break;
          r.gradualRolloutId = t.string();
          continue;
        }
        case 10: {
          if (i !== 80)
            break;
          r.gradualRolloutIsControl = t.bool();
          continue;
        }
        case 11: {
          if (i !== 88)
            break;
          r.gradualRolloutIsDeleted = t.bool();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Yt.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r, i, o, s, u, c, d, m;
    const l = js();
    return l.configBitmapIndex = (n = e.configBitmapIndex) !== null && n !== void 0 ? n : 0, l.configResultBitmapIndex = (t = e.configResultBitmapIndex) !== null && t !== void 0 ? t : 0, l.hasServerPropertiesOnly = (a = e.hasServerPropertiesOnly) !== null && a !== void 0 ? a : !1, l.globalPriority = (r = e.globalPriority) !== null && r !== void 0 ? r : 0, l.sequenceIds = ((i = e.sequenceIds) === null || i === void 0 ? void 0 : i.map((f) => Wt.fromPartial(f))) || [], l.studySegmentOrdinal = (o = e.studySegmentOrdinal) !== null && o !== void 0 ? o : 0, l.experimentGuid = (s = e.experimentGuid) !== null && s !== void 0 ? s : "0", l.isAbStudyStatusCompleted = (u = e.isAbStudyStatusCompleted) !== null && u !== void 0 ? u : !1, l.gradualRolloutId = (c = e.gradualRolloutId) !== null && c !== void 0 ? c : "", l.gradualRolloutIsControl = (d = e.gradualRolloutIsControl) !== null && d !== void 0 ? d : !1, l.gradualRolloutIsDeleted = (m = e.gradualRolloutIsDeleted) !== null && m !== void 0 ? m : !1, l;
  }
};
function xs() {
  return { targetingExpression: void 0, sequenceId: 0 };
}
const Wt = {
  encode(e, n = new I()) {
    return e.targetingExpression !== void 0 && Ve.encode(e.targetingExpression, n.uint32(10).fork()).join(), e.sequenceId !== 0 && n.uint32(16).int32(e.sequenceId), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = xs();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.targetingExpression = Ve.decode(t, t.uint32());
          continue;
        }
        case 2: {
          if (i !== 16)
            break;
          r.sequenceId = t.int32();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Wt.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = xs();
    return t.targetingExpression = e.targetingExpression !== void 0 && e.targetingExpression !== null ? Ve.fromPartial(e.targetingExpression) : void 0, t.sequenceId = (n = e.sequenceId) !== null && n !== void 0 ? n : 0, t;
  }
};
function eu() {
  return {
    operator: 0,
    children: [],
    property: 0,
    predicateOperator: 0,
    value: void 0,
    propertyMetadata: void 0
  };
}
const Ve = {
  encode(e, n = new I()) {
    e.operator !== 0 && n.uint32(8).int32(e.operator);
    for (const t of e.children)
      Ve.encode(t, n.uint32(18).fork()).join();
    return e.property !== 0 && n.uint32(24).int32(e.property), e.predicateOperator !== 0 && n.uint32(32).int32(e.predicateOperator), e.value !== void 0 && Pe.encode(e.value, n.uint32(42).fork()).join(), e.propertyMetadata !== void 0 && zt.encode(e.propertyMetadata, n.uint32(50).fork()).join(), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = eu();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.operator = t.int32();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.children.push(Ve.decode(t, t.uint32()));
          continue;
        }
        case 3: {
          if (i !== 24)
            break;
          r.property = t.int32();
          continue;
        }
        case 4: {
          if (i !== 32)
            break;
          r.predicateOperator = t.int32();
          continue;
        }
        case 5: {
          if (i !== 42)
            break;
          r.value = Pe.decode(t, t.uint32());
          continue;
        }
        case 6: {
          if (i !== 50)
            break;
          r.propertyMetadata = zt.decode(t, t.uint32());
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Ve.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r;
    const i = eu();
    return i.operator = (n = e.operator) !== null && n !== void 0 ? n : 0, i.children = ((t = e.children) === null || t === void 0 ? void 0 : t.map((o) => Ve.fromPartial(o))) || [], i.property = (a = e.property) !== null && a !== void 0 ? a : 0, i.predicateOperator = (r = e.predicateOperator) !== null && r !== void 0 ? r : 0, i.value = e.value !== void 0 && e.value !== null ? Pe.fromPartial(e.value) : void 0, i.propertyMetadata = e.propertyMetadata !== void 0 && e.propertyMetadata !== null ? zt.fromPartial(e.propertyMetadata) : void 0, i;
  }
};
function nu() {
  return {
    itemId: 0,
    signalToHash: 0,
    abNamespaceForHashing: "",
    abSeedForHashing: "",
    ruidType: void 0,
    cofRolloutSeedForHashing: "",
    adsNonBudgetSegmentLayer: 0,
    adsBudgetAbMacrostateName: ""
  };
}
const zt = {
  encode(e, n = new I()) {
    return e.itemId !== 0 && n.uint32(8).int32(e.itemId), e.signalToHash !== 0 && n.uint32(16).int32(e.signalToHash), e.abNamespaceForHashing !== "" && n.uint32(26).string(e.abNamespaceForHashing), e.abSeedForHashing !== "" && n.uint32(34).string(e.abSeedForHashing), e.ruidType !== void 0 && n.uint32(40).int32(e.ruidType), e.cofRolloutSeedForHashing !== "" && n.uint32(50).string(e.cofRolloutSeedForHashing), e.adsNonBudgetSegmentLayer !== 0 && n.uint32(56).int32(e.adsNonBudgetSegmentLayer), e.adsBudgetAbMacrostateName !== "" && n.uint32(66).string(e.adsBudgetAbMacrostateName), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = nu();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.itemId = t.int32();
          continue;
        }
        case 2: {
          if (i !== 16)
            break;
          r.signalToHash = t.int32();
          continue;
        }
        case 3: {
          if (i !== 26)
            break;
          r.abNamespaceForHashing = t.string();
          continue;
        }
        case 4: {
          if (i !== 34)
            break;
          r.abSeedForHashing = t.string();
          continue;
        }
        case 5: {
          if (i !== 40)
            break;
          r.ruidType = t.int32();
          continue;
        }
        case 6: {
          if (i !== 50)
            break;
          r.cofRolloutSeedForHashing = t.string();
          continue;
        }
        case 7: {
          if (i !== 56)
            break;
          r.adsNonBudgetSegmentLayer = t.int32();
          continue;
        }
        case 8: {
          if (i !== 66)
            break;
          r.adsBudgetAbMacrostateName = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return zt.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r, i, o, s, u;
    const c = nu();
    return c.itemId = (n = e.itemId) !== null && n !== void 0 ? n : 0, c.signalToHash = (t = e.signalToHash) !== null && t !== void 0 ? t : 0, c.abNamespaceForHashing = (a = e.abNamespaceForHashing) !== null && a !== void 0 ? a : "", c.abSeedForHashing = (r = e.abSeedForHashing) !== null && r !== void 0 ? r : "", c.ruidType = (i = e.ruidType) !== null && i !== void 0 ? i : void 0, c.cofRolloutSeedForHashing = (o = e.cofRolloutSeedForHashing) !== null && o !== void 0 ? o : "", c.adsNonBudgetSegmentLayer = (s = e.adsNonBudgetSegmentLayer) !== null && s !== void 0 ? s : 0, c.adsBudgetAbMacrostateName = (u = e.adsBudgetAbMacrostateName) !== null && u !== void 0 ? u : "", c;
  }
};
function tu() {
  return { abResultChecksumInput: "" };
}
const qt = {
  encode(e, n = new I()) {
    return e.abResultChecksumInput !== "" && n.uint32(10).string(e.abResultChecksumInput), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = tu();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.abResultChecksumInput = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return qt.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = tu();
    return t.abResultChecksumInput = (n = e.abResultChecksumInput) !== null && n !== void 0 ? n : "", t;
  }
};
function iu() {
  return {
    configResults: [],
    configResultsEtag: "",
    benchmarkRequest: void 0,
    fullResults: !1,
    abResultChecksum: 0,
    iso3166Alpha2CountryCodeFromRequestIp: "",
    debugData: void 0,
    cofGrapheneContext: new Uint8Array(0)
  };
}
const it = {
  encode(e, n = new I()) {
    for (const t of e.configResults)
      J.encode(t, n.uint32(10).fork()).join();
    return e.configResultsEtag !== "" && n.uint32(18).string(e.configResultsEtag), e.benchmarkRequest !== void 0 && Ut.encode(e.benchmarkRequest, n.uint32(26).fork()).join(), e.fullResults !== !1 && n.uint32(32).bool(e.fullResults), e.abResultChecksum !== 0 && n.uint32(40).int32(e.abResultChecksum), e.iso3166Alpha2CountryCodeFromRequestIp !== "" && n.uint32(50).string(e.iso3166Alpha2CountryCodeFromRequestIp), e.debugData !== void 0 && qt.encode(e.debugData, n.uint32(58).fork()).join(), e.cofGrapheneContext.length !== 0 && n.uint32(106).bytes(e.cofGrapheneContext), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = iu();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.configResults.push(J.decode(t, t.uint32()));
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.configResultsEtag = t.string();
          continue;
        }
        case 3: {
          if (i !== 26)
            break;
          r.benchmarkRequest = Ut.decode(t, t.uint32());
          continue;
        }
        case 4: {
          if (i !== 32)
            break;
          r.fullResults = t.bool();
          continue;
        }
        case 5: {
          if (i !== 40)
            break;
          r.abResultChecksum = t.int32();
          continue;
        }
        case 6: {
          if (i !== 50)
            break;
          r.iso3166Alpha2CountryCodeFromRequestIp = t.string();
          continue;
        }
        case 7: {
          if (i !== 58)
            break;
          r.debugData = qt.decode(t, t.uint32());
          continue;
        }
        case 13: {
          if (i !== 106)
            break;
          r.cofGrapheneContext = t.bytes();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return it.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r, i, o;
    const s = iu();
    return s.configResults = ((n = e.configResults) === null || n === void 0 ? void 0 : n.map((u) => J.fromPartial(u))) || [], s.configResultsEtag = (t = e.configResultsEtag) !== null && t !== void 0 ? t : "", s.benchmarkRequest = e.benchmarkRequest !== void 0 && e.benchmarkRequest !== null ? Ut.fromPartial(e.benchmarkRequest) : void 0, s.fullResults = (a = e.fullResults) !== null && a !== void 0 ? a : !1, s.abResultChecksum = (r = e.abResultChecksum) !== null && r !== void 0 ? r : 0, s.iso3166Alpha2CountryCodeFromRequestIp = (i = e.iso3166Alpha2CountryCodeFromRequestIp) !== null && i !== void 0 ? i : "", s.debugData = e.debugData !== void 0 && e.debugData !== null ? qt.fromPartial(e.debugData) : void 0, s.cofGrapheneContext = (o = e.cofGrapheneContext) !== null && o !== void 0 ? o : new Uint8Array(0), s;
  }
};
var ru;
(function(e) {
  e[e.USER_WHITELISTED = 0] = "USER_WHITELISTED", e[e.USER_GROUP_WHITELISTED = 1] = "USER_GROUP_WHITELISTED", e[e.FILTER_CONDITIONS = 2] = "FILTER_CONDITIONS", e[e.SLICE_RANGE = 3] = "SLICE_RANGE", e[e.TRAFFIC_ALLOCATED = 4] = "TRAFFIC_ALLOCATED", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(ru || (ru = {}));
var au;
(function(e) {
  e[e.VALIDATE_REQUEST = 0] = "VALIDATE_REQUEST", e[e.REQUEST_ATLAS = 1] = "REQUEST_ATLAS", e[e.BUILD_TARGETING_INFO = 2] = "BUILD_TARGETING_INFO", e[e.QUERY_INDEX = 3] = "QUERY_INDEX", e[e.REQUEST_AB = 4] = "REQUEST_AB", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(au || (au = {}));
function ou() {
  return { abStep: 0, info: "" };
}
const $t = {
  encode(e, n = new I()) {
    return e.abStep !== 0 && n.uint32(8).int32(e.abStep), e.info !== "" && n.uint32(18).string(e.info), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = ou();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.abStep = t.int32();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.info = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return $t.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = ou();
    return a.abStep = (n = e.abStep) !== null && n !== void 0 ? n : 0, a.info = (t = e.info) !== null && t !== void 0 ? t : "", a;
  }
};
function su() {
  return { cofStep: 0, info: "" };
}
const Zt = {
  encode(e, n = new I()) {
    return e.cofStep !== 0 && n.uint32(8).int32(e.cofStep), e.info !== "" && n.uint32(18).string(e.info), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = su();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.cofStep = t.int32();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.info = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Zt.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = su();
    return a.cofStep = (n = e.cofStep) !== null && n !== void 0 ? n : 0, a.info = (t = e.info) !== null && t !== void 0 ? t : "", a;
  }
};
function uu() {
  return { lastCofStep: void 0, lastAbStep: void 0, budgetGroupId: 0 };
}
const Jt = {
  encode(e, n = new I()) {
    return e.lastCofStep !== void 0 && Zt.encode(e.lastCofStep, n.uint32(10).fork()).join(), e.lastAbStep !== void 0 && $t.encode(e.lastAbStep, n.uint32(18).fork()).join(), e.budgetGroupId !== 0 && n.uint32(24).uint32(e.budgetGroupId), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = uu();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.lastCofStep = Zt.decode(t, t.uint32());
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.lastAbStep = $t.decode(t, t.uint32());
          continue;
        }
        case 3: {
          if (i !== 24)
            break;
          r.budgetGroupId = t.uint32();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Jt.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = uu();
    return t.lastCofStep = e.lastCofStep !== void 0 && e.lastCofStep !== null ? Zt.fromPartial(e.lastCofStep) : void 0, t.lastAbStep = e.lastAbStep !== void 0 && e.lastAbStep !== null ? $t.fromPartial(e.lastAbStep) : void 0, t.budgetGroupId = (n = e.budgetGroupId) !== null && n !== void 0 ? n : 0, t;
  }
};
var cu;
(function(e) {
  e[e.MEDIA_QUALITY_TYPE_UNKNOWN = 0] = "MEDIA_QUALITY_TYPE_UNKNOWN", e[e.MEDIA_QUALITY_TYPE_LEVEL_1 = 100] = "MEDIA_QUALITY_TYPE_LEVEL_1", e[e.MEDIA_QUALITY_TYPE_LEVEL_2 = 200] = "MEDIA_QUALITY_TYPE_LEVEL_2", e[e.MEDIA_QUALITY_TYPE_LEVEL_3 = 300] = "MEDIA_QUALITY_TYPE_LEVEL_3", e[e.MEDIA_QUALITY_TYPE_LEVEL_4 = 400] = "MEDIA_QUALITY_TYPE_LEVEL_4", e[e.MEDIA_QUALITY_TYPE_LEVEL_5 = 500] = "MEDIA_QUALITY_TYPE_LEVEL_5", e[e.MEDIA_QUALITY_TYPE_LEVEL_6 = 600] = "MEDIA_QUALITY_TYPE_LEVEL_6", e[e.MEDIA_QUALITY_TYPE_LEVEL_7 = 700] = "MEDIA_QUALITY_TYPE_LEVEL_7", e[e.MEDIA_QUALITY_TYPE_LEVEL_MAX = 5e3] = "MEDIA_QUALITY_TYPE_LEVEL_MAX", e[e.MEDIA_QUALITY_TYPE_LEVEL_4_5 = 450] = "MEDIA_QUALITY_TYPE_LEVEL_4_5", e[e.MEDIA_QUALITY_TYPE_LEVEL_2_1 = 210] = "MEDIA_QUALITY_TYPE_LEVEL_2_1", e[e.MEDIA_QUALITY_TYPE_LEVEL_2_2 = 220] = "MEDIA_QUALITY_TYPE_LEVEL_2_2", e[e.MEDIA_QUALITY_TYPE_LEVEL_2_5 = 250] = "MEDIA_QUALITY_TYPE_LEVEL_2_5", e[e.MEDIA_QUALITY_TYPE_LEVEL_3_2 = 320] = "MEDIA_QUALITY_TYPE_LEVEL_3_2", e[e.MEDIA_QUALITY_TYPE_LEVEL_3_5 = 350] = "MEDIA_QUALITY_TYPE_LEVEL_3_5", e[e.MEDIA_QUALITY_TYPE_LEVEL_2_7 = 270] = "MEDIA_QUALITY_TYPE_LEVEL_2_7", e[e.MEDIA_QUALITY_TYPE_LEVEL_6_5 = 650] = "MEDIA_QUALITY_TYPE_LEVEL_6_5", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(cu || (cu = {}));
var lu;
(function(e) {
  e[e.UNKNOWN_VIDEO_PLAYBACK_TYPE = 0] = "UNKNOWN_VIDEO_PLAYBACK_TYPE", e[e.FASTSTART_DISABLED = 1] = "FASTSTART_DISABLED", e[e.FASTSTART_ENABLED = 2] = "FASTSTART_ENABLED", e[e.HTTP_STREAMING_DASH = 3] = "HTTP_STREAMING_DASH", e[e.HTTP_STREAMING_HLS = 4] = "HTTP_STREAMING_HLS", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(lu || (lu = {}));
var du;
(function(e) {
  e[e.CAN_EXTEND_MEDIA_CLAIM = 0] = "CAN_EXTEND_MEDIA_CLAIM", e[e.DO_NOT_CLAIM = 1] = "DO_NOT_CLAIM", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(du || (du = {}));
function fu() {
  return { mediaQualityType: 0, videoPlaybackType: 0 };
}
const Xt = {
  encode(e, n = new I()) {
    return e.mediaQualityType !== 0 && n.uint32(16).int32(e.mediaQualityType), e.videoPlaybackType !== 0 && n.uint32(8).int32(e.videoPlaybackType), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = fu();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 2: {
          if (i !== 16)
            break;
          r.mediaQualityType = t.int32();
          continue;
        }
        case 1: {
          if (i !== 8)
            break;
          r.videoPlaybackType = t.int32();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Xt.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = fu();
    return a.mediaQualityType = (n = e.mediaQualityType) !== null && n !== void 0 ? n : 0, a.videoPlaybackType = (t = e.videoPlaybackType) !== null && t !== void 0 ? t : 0, a;
  }
};
function mu() {
  return {
    mediaListId: "0",
    claimBehavior: 0,
    url: "",
    contentObject: new Uint8Array(0),
    localContentKey: "",
    localCacheKey: "",
    videoDescription: void 0,
    mediaType: 0
  };
}
const Qt = {
  encode(e, n = new I()) {
    return e.mediaListId !== "0" && n.uint32(48).int64(e.mediaListId), e.claimBehavior !== 0 && n.uint32(56).int32(e.claimBehavior), e.url !== "" && n.uint32(18).string(e.url), e.contentObject.length !== 0 && n.uint32(26).bytes(e.contentObject), e.localContentKey !== "" && n.uint32(74).string(e.localContentKey), e.localCacheKey !== "" && n.uint32(82).string(e.localCacheKey), e.videoDescription !== void 0 && Xt.encode(e.videoDescription, n.uint32(42).fork()).join(), e.mediaType !== 0 && n.uint32(64).int32(e.mediaType), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = mu();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 6: {
          if (i !== 48)
            break;
          r.mediaListId = t.int64().toString();
          continue;
        }
        case 7: {
          if (i !== 56)
            break;
          r.claimBehavior = t.int32();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.url = t.string();
          continue;
        }
        case 3: {
          if (i !== 26)
            break;
          r.contentObject = t.bytes();
          continue;
        }
        case 9: {
          if (i !== 74)
            break;
          r.localContentKey = t.string();
          continue;
        }
        case 10: {
          if (i !== 82)
            break;
          r.localCacheKey = t.string();
          continue;
        }
        case 5: {
          if (i !== 42)
            break;
          r.videoDescription = Xt.decode(t, t.uint32());
          continue;
        }
        case 8: {
          if (i !== 64)
            break;
          r.mediaType = t.int32();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Qt.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r, i, o, s;
    const u = mu();
    return u.mediaListId = (n = e.mediaListId) !== null && n !== void 0 ? n : "0", u.claimBehavior = (t = e.claimBehavior) !== null && t !== void 0 ? t : 0, u.url = (a = e.url) !== null && a !== void 0 ? a : "", u.contentObject = (r = e.contentObject) !== null && r !== void 0 ? r : new Uint8Array(0), u.localContentKey = (i = e.localContentKey) !== null && i !== void 0 ? i : "", u.localCacheKey = (o = e.localCacheKey) !== null && o !== void 0 ? o : "", u.videoDescription = e.videoDescription !== void 0 && e.videoDescription !== null ? Xt.fromPartial(e.videoDescription) : void 0, u.mediaType = (s = e.mediaType) !== null && s !== void 0 ? s : 0, u;
  }
};
function hu() {
  return { flashOn: !1, frontFacing: !1 };
}
const jt = {
  encode(e, n = new I()) {
    return e.flashOn !== !1 && n.uint32(8).bool(e.flashOn), e.frontFacing !== !1 && n.uint32(16).bool(e.frontFacing), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = hu();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.flashOn = t.bool();
          continue;
        }
        case 2: {
          if (i !== 16)
            break;
          r.frontFacing = t.bool();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return jt.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = hu();
    return a.flashOn = (n = e.flashOn) !== null && n !== void 0 ? n : !1, a.frontFacing = (t = e.frontFacing) !== null && t !== void 0 ? t : !1, a;
  }
};
function pu() {
  return { mediaListId: "0" };
}
const xt = {
  encode(e, n = new I()) {
    return e.mediaListId !== "0" && n.uint32(8).int64(e.mediaListId), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = pu();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.mediaListId = t.int64().toString();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return xt.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = pu();
    return t.mediaListId = (n = e.mediaListId) !== null && n !== void 0 ? n : "0", t;
  }
};
var vu;
(function(e) {
  e[e.VERTICAL = 0] = "VERTICAL", e[e.HORIZONTAL = 1] = "HORIZONTAL", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(vu || (vu = {}));
var Eu;
(function(e) {
  e[e.UNSET = 0] = "UNSET", e[e.UP = 1] = "UP", e[e.DOWN = 2] = "DOWN", e[e.LEFT = 3] = "LEFT", e[e.RIGHT = 4] = "RIGHT", e[e.UP_MIRRORED = 5] = "UP_MIRRORED", e[e.DOWN_MIRRORED = 6] = "DOWN_MIRRORED", e[e.LEFT_MIRRORED = 7] = "LEFT_MIRRORED", e[e.RIGHT_MIRRORED = 8] = "RIGHT_MIRRORED", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(Eu || (Eu = {}));
var Su;
(function(e) {
  e[e.IMAGE = 0] = "IMAGE", e[e.VIDEO = 1] = "VIDEO", e[e.GIF = 2] = "GIF", e[e.AUDIO = 3] = "AUDIO", e[e.UNKNOWN = 4] = "UNKNOWN", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(Su || (Su = {}));
var Iu;
(function(e) {
  e[e.GCS = 0] = "GCS", e[e.S3 = 1] = "S3", e[e.UNRECOGNIZED_VALUE = 2] = "UNRECOGNIZED_VALUE", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(Iu || (Iu = {}));
var _u;
(function(e) {
  e[e.UNSET = 0] = "UNSET", e[e.NONE = 1] = "NONE", e[e.UNKNOWN = 2] = "UNKNOWN", e[e.SNAPCHAT = 3] = "SNAPCHAT", e[e.TIKTOK = 4] = "TIKTOK", e[e.INSTAGRAM = 5] = "INSTAGRAM", e[e.CAPCUT = 6] = "CAPCUT", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(_u || (_u = {}));
var Au;
(function(e) {
  e[e.UNSET = 0] = "UNSET", e[e.NONE = 1] = "NONE", e[e.GEN_ML = 2] = "GEN_ML", e[e.UCO = 3] = "UCO", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(Au || (Au = {}));
function Nu() {
  return { codecFormat: 0 };
}
const ei = {
  encode(e, n = new I()) {
    return e.codecFormat !== 0 && n.uint32(8).int32(e.codecFormat), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Nu();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.codecFormat = t.int32();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return ei.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = Nu();
    return t.codecFormat = (n = e.codecFormat) !== null && n !== void 0 ? n : 0, t;
  }
};
function Ou() {
  return { codecFormat: 0 };
}
const ni = {
  encode(e, n = new I()) {
    return e.codecFormat !== 0 && n.uint32(8).int32(e.codecFormat), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Ou();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.codecFormat = t.int32();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return ni.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = Ou();
    return t.codecFormat = (n = e.codecFormat) !== null && n !== void 0 ? n : 0, t;
  }
};
function Ru() {
  return { codecFormat: 0, containerFormat: 0 };
}
const ti = {
  encode(e, n = new I()) {
    return e.codecFormat !== 0 && n.uint32(8).int32(e.codecFormat), e.containerFormat !== 0 && n.uint32(16).int32(e.containerFormat), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Ru();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.codecFormat = t.int32();
          continue;
        }
        case 2: {
          if (i !== 16)
            break;
          r.containerFormat = t.int32();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return ti.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = Ru();
    return a.codecFormat = (n = e.codecFormat) !== null && n !== void 0 ? n : 0, a.containerFormat = (t = e.containerFormat) !== null && t !== void 0 ? t : 0, a;
  }
};
function ku() {
  return {
    orientation: 0,
    dimensions: void 0,
    mediaDurationMs: 0,
    mediaId: void 0,
    encryptionInfoV1: void 0,
    encryptionInfoV2: void 0,
    masterKeyEncryptedEncryptionInfo: void 0,
    assetType: 0,
    captureCharacteristics: void 0,
    mediaOriginCamera: void 0,
    mediaOriginExternalStorage: void 0,
    mediaOriginPixy: void 0,
    mediaOriginSpectacles: void 0,
    mediaOriginAi: void 0,
    dreamsMetadata: void 0,
    additionalOrigins: [],
    displayOrientation: 0,
    audio: void 0,
    image: void 0,
    video: void 0,
    type: 0,
    legacyMediaSource: void 0,
    contentDescriptor: void 0,
    mediaUrl: "",
    hasSound: !1,
    zipped: !1,
    frontFacing: !1,
    mediaReference: void 0
  };
}
const ii = {
  encode(e, n = new I()) {
    e.orientation !== 0 && n.uint32(24).int32(e.orientation), e.dimensions !== void 0 && ri.encode(e.dimensions, n.uint32(42).fork()).join(), e.mediaDurationMs !== 0 && n.uint32(120).uint32(e.mediaDurationMs), e.mediaId !== void 0 && xt.encode(e.mediaId, n.uint32(146).fork()).join(), e.encryptionInfoV1 !== void 0 && ye.encode(e.encryptionInfoV1, n.uint32(34).fork()).join(), e.encryptionInfoV2 !== void 0 && ye.encode(e.encryptionInfoV2, n.uint32(154).fork()).join(), e.masterKeyEncryptedEncryptionInfo !== void 0 && ye.encode(e.masterKeyEncryptedEncryptionInfo, n.uint32(250).fork()).join(), e.assetType !== 0 && n.uint32(160).int32(e.assetType), e.captureCharacteristics !== void 0 && jt.encode(e.captureCharacteristics, n.uint32(170).fork()).join(), e.mediaOriginCamera !== void 0 && Rn.encode(e.mediaOriginCamera, n.uint32(210).fork()).join(), e.mediaOriginExternalStorage !== void 0 && gn.encode(e.mediaOriginExternalStorage, n.uint32(218).fork()).join(), e.mediaOriginPixy !== void 0 && kn.encode(e.mediaOriginPixy, n.uint32(226).fork()).join(), e.mediaOriginSpectacles !== void 0 && Tn.encode(e.mediaOriginSpectacles, n.uint32(234).fork()).join(), e.mediaOriginAi !== void 0 && bn.encode(e.mediaOriginAi, n.uint32(242).fork()).join(), e.dreamsMetadata !== void 0 && Pn.encode(e.dreamsMetadata, n.uint32(258).fork()).join();
    for (const t of e.additionalOrigins)
      si.encode(t, n.uint32(266).fork()).join();
    return e.displayOrientation !== 0 && n.uint32(176).int32(e.displayOrientation), e.audio !== void 0 && ei.encode(e.audio, n.uint32(186).fork()).join(), e.image !== void 0 && ni.encode(e.image, n.uint32(194).fork()).join(), e.video !== void 0 && ti.encode(e.video, n.uint32(202).fork()).join(), e.type !== 0 && n.uint32(16).int32(e.type), e.legacyMediaSource !== void 0 && ai.encode(e.legacyMediaSource, n.uint32(50).fork()).join(), e.contentDescriptor !== void 0 && n.uint32(58).bytes(e.contentDescriptor), e.mediaUrl !== "" && n.uint32(74).string(e.mediaUrl), e.hasSound !== !1 && n.uint32(96).bool(e.hasSound), e.zipped !== !1 && n.uint32(104).bool(e.zipped), e.frontFacing !== !1 && n.uint32(112).bool(e.frontFacing), e.mediaReference !== void 0 && Qt.encode(e.mediaReference, n.uint32(138).fork()).join(), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = ku();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 3: {
          if (i !== 24)
            break;
          r.orientation = t.int32();
          continue;
        }
        case 5: {
          if (i !== 42)
            break;
          r.dimensions = ri.decode(t, t.uint32());
          continue;
        }
        case 15: {
          if (i !== 120)
            break;
          r.mediaDurationMs = t.uint32();
          continue;
        }
        case 18: {
          if (i !== 146)
            break;
          r.mediaId = xt.decode(t, t.uint32());
          continue;
        }
        case 4: {
          if (i !== 34)
            break;
          r.encryptionInfoV1 = ye.decode(t, t.uint32());
          continue;
        }
        case 19: {
          if (i !== 154)
            break;
          r.encryptionInfoV2 = ye.decode(t, t.uint32());
          continue;
        }
        case 31: {
          if (i !== 250)
            break;
          r.masterKeyEncryptedEncryptionInfo = ye.decode(t, t.uint32());
          continue;
        }
        case 20: {
          if (i !== 160)
            break;
          r.assetType = t.int32();
          continue;
        }
        case 21: {
          if (i !== 170)
            break;
          r.captureCharacteristics = jt.decode(t, t.uint32());
          continue;
        }
        case 26: {
          if (i !== 210)
            break;
          r.mediaOriginCamera = Rn.decode(t, t.uint32());
          continue;
        }
        case 27: {
          if (i !== 218)
            break;
          r.mediaOriginExternalStorage = gn.decode(t, t.uint32());
          continue;
        }
        case 28: {
          if (i !== 226)
            break;
          r.mediaOriginPixy = kn.decode(t, t.uint32());
          continue;
        }
        case 29: {
          if (i !== 234)
            break;
          r.mediaOriginSpectacles = Tn.decode(t, t.uint32());
          continue;
        }
        case 30: {
          if (i !== 242)
            break;
          r.mediaOriginAi = bn.decode(t, t.uint32());
          continue;
        }
        case 32: {
          if (i !== 258)
            break;
          r.dreamsMetadata = Pn.decode(t, t.uint32());
          continue;
        }
        case 33: {
          if (i !== 266)
            break;
          r.additionalOrigins.push(si.decode(t, t.uint32()));
          continue;
        }
        case 22: {
          if (i !== 176)
            break;
          r.displayOrientation = t.int32();
          continue;
        }
        case 23: {
          if (i !== 186)
            break;
          r.audio = ei.decode(t, t.uint32());
          continue;
        }
        case 24: {
          if (i !== 194)
            break;
          r.image = ni.decode(t, t.uint32());
          continue;
        }
        case 25: {
          if (i !== 202)
            break;
          r.video = ti.decode(t, t.uint32());
          continue;
        }
        case 2: {
          if (i !== 16)
            break;
          r.type = t.int32();
          continue;
        }
        case 6: {
          if (i !== 50)
            break;
          r.legacyMediaSource = ai.decode(t, t.uint32());
          continue;
        }
        case 7: {
          if (i !== 58)
            break;
          r.contentDescriptor = t.bytes();
          continue;
        }
        case 9: {
          if (i !== 74)
            break;
          r.mediaUrl = t.string();
          continue;
        }
        case 12: {
          if (i !== 96)
            break;
          r.hasSound = t.bool();
          continue;
        }
        case 13: {
          if (i !== 104)
            break;
          r.zipped = t.bool();
          continue;
        }
        case 14: {
          if (i !== 112)
            break;
          r.frontFacing = t.bool();
          continue;
        }
        case 17: {
          if (i !== 138)
            break;
          r.mediaReference = Qt.decode(t, t.uint32());
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return ii.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r, i, o, s, u, c, d, m;
    const l = ku();
    return l.orientation = (n = e.orientation) !== null && n !== void 0 ? n : 0, l.dimensions = e.dimensions !== void 0 && e.dimensions !== null ? ri.fromPartial(e.dimensions) : void 0, l.mediaDurationMs = (t = e.mediaDurationMs) !== null && t !== void 0 ? t : 0, l.mediaId = e.mediaId !== void 0 && e.mediaId !== null ? xt.fromPartial(e.mediaId) : void 0, l.encryptionInfoV1 = e.encryptionInfoV1 !== void 0 && e.encryptionInfoV1 !== null ? ye.fromPartial(e.encryptionInfoV1) : void 0, l.encryptionInfoV2 = e.encryptionInfoV2 !== void 0 && e.encryptionInfoV2 !== null ? ye.fromPartial(e.encryptionInfoV2) : void 0, l.masterKeyEncryptedEncryptionInfo = e.masterKeyEncryptedEncryptionInfo !== void 0 && e.masterKeyEncryptedEncryptionInfo !== null ? ye.fromPartial(e.masterKeyEncryptedEncryptionInfo) : void 0, l.assetType = (a = e.assetType) !== null && a !== void 0 ? a : 0, l.captureCharacteristics = e.captureCharacteristics !== void 0 && e.captureCharacteristics !== null ? jt.fromPartial(e.captureCharacteristics) : void 0, l.mediaOriginCamera = e.mediaOriginCamera !== void 0 && e.mediaOriginCamera !== null ? Rn.fromPartial(e.mediaOriginCamera) : void 0, l.mediaOriginExternalStorage = e.mediaOriginExternalStorage !== void 0 && e.mediaOriginExternalStorage !== null ? gn.fromPartial(e.mediaOriginExternalStorage) : void 0, l.mediaOriginPixy = e.mediaOriginPixy !== void 0 && e.mediaOriginPixy !== null ? kn.fromPartial(e.mediaOriginPixy) : void 0, l.mediaOriginSpectacles = e.mediaOriginSpectacles !== void 0 && e.mediaOriginSpectacles !== null ? Tn.fromPartial(e.mediaOriginSpectacles) : void 0, l.mediaOriginAi = e.mediaOriginAi !== void 0 && e.mediaOriginAi !== null ? bn.fromPartial(e.mediaOriginAi) : void 0, l.dreamsMetadata = e.dreamsMetadata !== void 0 && e.dreamsMetadata !== null ? Pn.fromPartial(e.dreamsMetadata) : void 0, l.additionalOrigins = ((r = e.additionalOrigins) === null || r === void 0 ? void 0 : r.map((f) => si.fromPartial(f))) || [], l.displayOrientation = (i = e.displayOrientation) !== null && i !== void 0 ? i : 0, l.audio = e.audio !== void 0 && e.audio !== null ? ei.fromPartial(e.audio) : void 0, l.image = e.image !== void 0 && e.image !== null ? ni.fromPartial(e.image) : void 0, l.video = e.video !== void 0 && e.video !== null ? ti.fromPartial(e.video) : void 0, l.type = (o = e.type) !== null && o !== void 0 ? o : 0, l.legacyMediaSource = e.legacyMediaSource !== void 0 && e.legacyMediaSource !== null ? ai.fromPartial(e.legacyMediaSource) : void 0, l.contentDescriptor = (s = e.contentDescriptor) !== null && s !== void 0 ? s : void 0, l.mediaUrl = (u = e.mediaUrl) !== null && u !== void 0 ? u : "", l.hasSound = (c = e.hasSound) !== null && c !== void 0 ? c : !1, l.zipped = (d = e.zipped) !== null && d !== void 0 ? d : !1, l.frontFacing = (m = e.frontFacing) !== null && m !== void 0 ? m : !1, l.mediaReference = e.mediaReference !== void 0 && e.mediaReference !== null ? Qt.fromPartial(e.mediaReference) : void 0, l;
  }
};
function Tu() {
  return { width: 0, height: 0 };
}
const ri = {
  encode(e, n = new I()) {
    return e.width !== 0 && n.uint32(8).uint32(e.width), e.height !== 0 && n.uint32(16).uint32(e.height), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Tu();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.width = t.uint32();
          continue;
        }
        case 2: {
          if (i !== 16)
            break;
          r.height = t.uint32();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return ri.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = Tu();
    return a.width = (n = e.width) !== null && n !== void 0 ? n : 0, a.height = (t = e.height) !== null && t !== void 0 ? t : 0, a;
  }
};
function gu() {
  return { key: new Uint8Array(0), iv: new Uint8Array(0) };
}
const ye = {
  encode(e, n = new I()) {
    return e.key.length !== 0 && n.uint32(10).bytes(e.key), e.iv.length !== 0 && n.uint32(18).bytes(e.iv), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = gu();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.key = t.bytes();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.iv = t.bytes();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return ye.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = gu();
    return a.key = (n = e.key) !== null && n !== void 0 ? n : new Uint8Array(0), a.iv = (t = e.iv) !== null && t !== void 0 ? t : new Uint8Array(0), a;
  }
};
function bu() {
  return { sourceMediaId: "", directDownloadUrl: void 0 };
}
const ai = {
  encode(e, n = new I()) {
    return e.sourceMediaId !== "" && n.uint32(10).string(e.sourceMediaId), e.directDownloadUrl !== void 0 && oi.encode(e.directDownloadUrl, n.uint32(18).fork()).join(), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = bu();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.sourceMediaId = t.string();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.directDownloadUrl = oi.decode(t, t.uint32());
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return ai.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = bu();
    return t.sourceMediaId = (n = e.sourceMediaId) !== null && n !== void 0 ? n : "", t.directDownloadUrl = e.directDownloadUrl !== void 0 && e.directDownloadUrl !== null ? oi.fromPartial(e.directDownloadUrl) : void 0, t;
  }
};
function Pu() {
  return { url: "", expirySeconds: "0", type: 0, region: "" };
}
const oi = {
  encode(e, n = new I()) {
    return e.url !== "" && n.uint32(10).string(e.url), e.expirySeconds !== "0" && n.uint32(16).uint64(e.expirySeconds), e.type !== 0 && n.uint32(24).int32(e.type), e.region !== "" && n.uint32(34).string(e.region), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Pu();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.url = t.string();
          continue;
        }
        case 2: {
          if (i !== 16)
            break;
          r.expirySeconds = t.uint64().toString();
          continue;
        }
        case 3: {
          if (i !== 24)
            break;
          r.type = t.int32();
          continue;
        }
        case 4: {
          if (i !== 34)
            break;
          r.region = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return oi.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r;
    const i = Pu();
    return i.url = (n = e.url) !== null && n !== void 0 ? n : "", i.expirySeconds = (t = e.expirySeconds) !== null && t !== void 0 ? t : "0", i.type = (a = e.type) !== null && a !== void 0 ? a : 0, i.region = (r = e.region) !== null && r !== void 0 ? r : "", i;
  }
};
function Lu() {
  return {
    mediaOriginCamera: void 0,
    mediaOriginExternalStorage: void 0,
    mediaOriginPixy: void 0,
    mediaOriginSpectacles: void 0,
    mediaOriginAi: void 0,
    dreamsMetadata: void 0
  };
}
const si = {
  encode(e, n = new I()) {
    return e.mediaOriginCamera !== void 0 && Rn.encode(e.mediaOriginCamera, n.uint32(10).fork()).join(), e.mediaOriginExternalStorage !== void 0 && gn.encode(e.mediaOriginExternalStorage, n.uint32(18).fork()).join(), e.mediaOriginPixy !== void 0 && kn.encode(e.mediaOriginPixy, n.uint32(26).fork()).join(), e.mediaOriginSpectacles !== void 0 && Tn.encode(e.mediaOriginSpectacles, n.uint32(34).fork()).join(), e.mediaOriginAi !== void 0 && bn.encode(e.mediaOriginAi, n.uint32(42).fork()).join(), e.dreamsMetadata !== void 0 && Pn.encode(e.dreamsMetadata, n.uint32(50).fork()).join(), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Lu();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.mediaOriginCamera = Rn.decode(t, t.uint32());
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.mediaOriginExternalStorage = gn.decode(t, t.uint32());
          continue;
        }
        case 3: {
          if (i !== 26)
            break;
          r.mediaOriginPixy = kn.decode(t, t.uint32());
          continue;
        }
        case 4: {
          if (i !== 34)
            break;
          r.mediaOriginSpectacles = Tn.decode(t, t.uint32());
          continue;
        }
        case 5: {
          if (i !== 42)
            break;
          r.mediaOriginAi = bn.decode(t, t.uint32());
          continue;
        }
        case 6: {
          if (i !== 50)
            break;
          r.dreamsMetadata = Pn.decode(t, t.uint32());
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return si.fromPartial(e ?? {});
  },
  fromPartial(e) {
    const n = Lu();
    return n.mediaOriginCamera = e.mediaOriginCamera !== void 0 && e.mediaOriginCamera !== null ? Rn.fromPartial(e.mediaOriginCamera) : void 0, n.mediaOriginExternalStorage = e.mediaOriginExternalStorage !== void 0 && e.mediaOriginExternalStorage !== null ? gn.fromPartial(e.mediaOriginExternalStorage) : void 0, n.mediaOriginPixy = e.mediaOriginPixy !== void 0 && e.mediaOriginPixy !== null ? kn.fromPartial(e.mediaOriginPixy) : void 0, n.mediaOriginSpectacles = e.mediaOriginSpectacles !== void 0 && e.mediaOriginSpectacles !== null ? Tn.fromPartial(e.mediaOriginSpectacles) : void 0, n.mediaOriginAi = e.mediaOriginAi !== void 0 && e.mediaOriginAi !== null ? bn.fromPartial(e.mediaOriginAi) : void 0, n.dreamsMetadata = e.dreamsMetadata !== void 0 && e.dreamsMetadata !== null ? Pn.fromPartial(e.dreamsMetadata) : void 0, n;
  }
};
function Cu() {
  return {};
}
const Rn = {
  encode(e, n = new I()) {
    return n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Cu();
    for (; t.pos < a; ) {
      const i = t.uint32();
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Rn.fromPartial(e ?? {});
  },
  fromPartial(e) {
    return Cu();
  }
};
function wu() {
  return {};
}
const kn = {
  encode(e, n = new I()) {
    return n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = wu();
    for (; t.pos < a; ) {
      const i = t.uint32();
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return kn.fromPartial(e ?? {});
  },
  fromPartial(e) {
    return wu();
  }
};
function Du() {
  return {};
}
const Tn = {
  encode(e, n = new I()) {
    return n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Du();
    for (; t.pos < a; ) {
      const i = t.uint32();
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Tn.fromPartial(e ?? {});
  },
  fromPartial(e) {
    return Du();
  }
};
function yu() {
  return { creationTimestamp: "0", mediaSource: 0, insecureFileMetadata: void 0, originalLocalIds: [] };
}
const gn = {
  encode(e, n = new I()) {
    e.creationTimestamp !== "0" && n.uint32(8).uint64(e.creationTimestamp), e.mediaSource !== 0 && n.uint32(16).int32(e.mediaSource), e.insecureFileMetadata !== void 0 && ui.encode(e.insecureFileMetadata, n.uint32(42).fork()).join();
    for (const t of e.originalLocalIds)
      n.uint32(50).string(t);
    return n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = yu();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.creationTimestamp = t.uint64().toString();
          continue;
        }
        case 2: {
          if (i !== 16)
            break;
          r.mediaSource = t.int32();
          continue;
        }
        case 5: {
          if (i !== 42)
            break;
          r.insecureFileMetadata = ui.decode(t, t.uint32());
          continue;
        }
        case 6: {
          if (i !== 50)
            break;
          r.originalLocalIds.push(t.string());
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return gn.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a;
    const r = yu();
    return r.creationTimestamp = (n = e.creationTimestamp) !== null && n !== void 0 ? n : "0", r.mediaSource = (t = e.mediaSource) !== null && t !== void 0 ? t : 0, r.insecureFileMetadata = e.insecureFileMetadata !== void 0 && e.insecureFileMetadata !== null ? ui.fromPartial(e.insecureFileMetadata) : void 0, r.originalLocalIds = ((a = e.originalLocalIds) === null || a === void 0 ? void 0 : a.map((i) => i)) || [], r;
  }
};
function Uu() {
  return { lensId: [], musicTrackId: "0" };
}
const ui = {
  encode(e, n = new I()) {
    n.uint32(10).fork();
    for (const t of e.lensId)
      n.uint64(t);
    return n.join(), e.musicTrackId !== "0" && n.uint32(16).uint64(e.musicTrackId), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Uu();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i === 8) {
            r.lensId.push(t.uint64().toString());
            continue;
          }
          if (i === 10) {
            const o = t.uint32() + t.pos;
            for (; t.pos < o; )
              r.lensId.push(t.uint64().toString());
            continue;
          }
          break;
        }
        case 2: {
          if (i !== 16)
            break;
          r.musicTrackId = t.uint64().toString();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return ui.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = Uu();
    return a.lensId = ((n = e.lensId) === null || n === void 0 ? void 0 : n.map((r) => r)) || [], a.musicTrackId = (t = e.musicTrackId) !== null && t !== void 0 ? t : "0", a;
  }
};
function Mu() {
  return {};
}
const bn = {
  encode(e, n = new I()) {
    return n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Mu();
    for (; t.pos < a; ) {
      const i = t.uint32();
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return bn.fromPartial(e ?? {});
  },
  fromPartial(e) {
    return Mu();
  }
};
function Vu() {
  return { packId: "", templateId: "", contentType: [] };
}
const Pn = {
  encode(e, n = new I()) {
    e.packId !== "" && n.uint32(10).string(e.packId), e.templateId !== "" && n.uint32(18).string(e.templateId), n.uint32(26).fork();
    for (const t of e.contentType)
      n.int32(t);
    return n.join(), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Vu();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.packId = t.string();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.templateId = t.string();
          continue;
        }
        case 3: {
          if (i === 24) {
            r.contentType.push(t.int32());
            continue;
          }
          if (i === 26) {
            const o = t.uint32() + t.pos;
            for (; t.pos < o; )
              r.contentType.push(t.int32());
            continue;
          }
          break;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Pn.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a;
    const r = Vu();
    return r.packId = (n = e.packId) !== null && n !== void 0 ? n : "", r.templateId = (t = e.templateId) !== null && t !== void 0 ? t : "", r.contentType = ((a = e.contentType) === null || a === void 0 ? void 0 : a.map((i) => i)) || [], r;
  }
};
function Gu() {
  return {
    emailVerified: !1,
    phoneVerified: !1,
    notificationPermGranted: !1,
    contactPermGranted: !1,
    mutualFriendsCount: 0,
    groupsCount: 0,
    hasNonTeamSnapchatConversations: !1,
    emailSet: !1,
    bitmojiSet: !1,
    hasAddFriendsRequest: !1,
    appLaunchFromPush: !1,
    appLaunchType: 0,
    campaignLocalImpressionCount: 0,
    campaignLocalLastImpressionTimeSecsToNow: "0",
    campaignLocalContinuousDismissCount: 0,
    fstNumInAppWarnings: 0,
    fstShouldChangePassword: !1,
    audioRecordPermGranted: !1,
    mutualFriendsWithBirthdayCount: 0,
    campaignLocalDismissCount: 0,
    memoriesCount: 0,
    campaignLocalFirstImpressionTimeSecsToNow: "0",
    campaignLocalClickCount: 0,
    campaignLocalInteractionCount: 0,
    campaignLocalLastInteractionTimeSecsToNow: "0",
    lockScreenWidgetAppOpenFromPush: !1,
    communityCount: 0,
    campaignLocalFirstClickTimeSecsToNow: "0",
    campaignLocalLastClickTimeSecsToNow: "0",
    campaignLocalFirstDismissTimeSecsToNow: "0",
    campaignLocalLastDismissTimeSecsToNow: "0",
    campaignLocalFirstInteractionTimeSecsToNow: "0",
    serverImpressionCount: 0,
    serverClickCount: 0,
    serverDismissCount: 0,
    serverInteractionCount: 0,
    serverFirstImpressionTimeSecsToNow: "0",
    serverLastImpressionTimeSecsToNow: "0",
    serverFirstClickTimeSecsToNow: "0",
    serverLastClickTimeSecsToNow: "0",
    serverFirstDismissTimeSecsToNow: "0",
    serverLastDismissTimeSecsToNow: "0",
    serverFirstInteractionTimeSecsToNow: "0",
    serverLastInteractionTimeSecsToNow: "0",
    serverContinuousDismissCount: 0,
    contactPermOsGranted: !1,
    contactPermUserGranted: !1,
    contactPermOsAuthorizationStatus: 0
  };
}
const ci = {
  encode(e, n = new I()) {
    return e.emailVerified !== !1 && n.uint32(8).bool(e.emailVerified), e.phoneVerified !== !1 && n.uint32(16).bool(e.phoneVerified), e.notificationPermGranted !== !1 && n.uint32(24).bool(e.notificationPermGranted), e.contactPermGranted !== !1 && n.uint32(32).bool(e.contactPermGranted), e.mutualFriendsCount !== 0 && n.uint32(40).int32(e.mutualFriendsCount), e.groupsCount !== 0 && n.uint32(48).int32(e.groupsCount), e.hasNonTeamSnapchatConversations !== !1 && n.uint32(56).bool(e.hasNonTeamSnapchatConversations), e.emailSet !== !1 && n.uint32(64).bool(e.emailSet), e.bitmojiSet !== !1 && n.uint32(72).bool(e.bitmojiSet), e.hasAddFriendsRequest !== !1 && n.uint32(80).bool(e.hasAddFriendsRequest), e.appLaunchFromPush !== !1 && n.uint32(88).bool(e.appLaunchFromPush), e.appLaunchType !== 0 && n.uint32(96).int32(e.appLaunchType), e.campaignLocalImpressionCount !== 0 && n.uint32(104).int32(e.campaignLocalImpressionCount), e.campaignLocalLastImpressionTimeSecsToNow !== "0" && n.uint32(112).int64(e.campaignLocalLastImpressionTimeSecsToNow), e.campaignLocalContinuousDismissCount !== 0 && n.uint32(120).int32(e.campaignLocalContinuousDismissCount), e.fstNumInAppWarnings !== 0 && n.uint32(128).int32(e.fstNumInAppWarnings), e.fstShouldChangePassword !== !1 && n.uint32(136).bool(e.fstShouldChangePassword), e.audioRecordPermGranted !== !1 && n.uint32(144).bool(e.audioRecordPermGranted), e.mutualFriendsWithBirthdayCount !== 0 && n.uint32(152).int32(e.mutualFriendsWithBirthdayCount), e.campaignLocalDismissCount !== 0 && n.uint32(160).int32(e.campaignLocalDismissCount), e.memoriesCount !== 0 && n.uint32(168).int32(e.memoriesCount), e.campaignLocalFirstImpressionTimeSecsToNow !== "0" && n.uint32(176).int64(e.campaignLocalFirstImpressionTimeSecsToNow), e.campaignLocalClickCount !== 0 && n.uint32(184).int32(e.campaignLocalClickCount), e.campaignLocalInteractionCount !== 0 && n.uint32(192).int32(e.campaignLocalInteractionCount), e.campaignLocalLastInteractionTimeSecsToNow !== "0" && n.uint32(200).int64(e.campaignLocalLastInteractionTimeSecsToNow), e.lockScreenWidgetAppOpenFromPush !== !1 && n.uint32(208).bool(e.lockScreenWidgetAppOpenFromPush), e.communityCount !== 0 && n.uint32(216).int32(e.communityCount), e.campaignLocalFirstClickTimeSecsToNow !== "0" && n.uint32(224).int64(e.campaignLocalFirstClickTimeSecsToNow), e.campaignLocalLastClickTimeSecsToNow !== "0" && n.uint32(232).int64(e.campaignLocalLastClickTimeSecsToNow), e.campaignLocalFirstDismissTimeSecsToNow !== "0" && n.uint32(240).int64(e.campaignLocalFirstDismissTimeSecsToNow), e.campaignLocalLastDismissTimeSecsToNow !== "0" && n.uint32(248).int64(e.campaignLocalLastDismissTimeSecsToNow), e.campaignLocalFirstInteractionTimeSecsToNow !== "0" && n.uint32(256).int64(e.campaignLocalFirstInteractionTimeSecsToNow), e.serverImpressionCount !== 0 && n.uint32(264).int32(e.serverImpressionCount), e.serverClickCount !== 0 && n.uint32(272).int32(e.serverClickCount), e.serverDismissCount !== 0 && n.uint32(280).int32(e.serverDismissCount), e.serverInteractionCount !== 0 && n.uint32(288).int32(e.serverInteractionCount), e.serverFirstImpressionTimeSecsToNow !== "0" && n.uint32(296).int64(e.serverFirstImpressionTimeSecsToNow), e.serverLastImpressionTimeSecsToNow !== "0" && n.uint32(304).int64(e.serverLastImpressionTimeSecsToNow), e.serverFirstClickTimeSecsToNow !== "0" && n.uint32(312).int64(e.serverFirstClickTimeSecsToNow), e.serverLastClickTimeSecsToNow !== "0" && n.uint32(320).int64(e.serverLastClickTimeSecsToNow), e.serverFirstDismissTimeSecsToNow !== "0" && n.uint32(328).int64(e.serverFirstDismissTimeSecsToNow), e.serverLastDismissTimeSecsToNow !== "0" && n.uint32(336).int64(e.serverLastDismissTimeSecsToNow), e.serverFirstInteractionTimeSecsToNow !== "0" && n.uint32(344).int64(e.serverFirstInteractionTimeSecsToNow), e.serverLastInteractionTimeSecsToNow !== "0" && n.uint32(352).int64(e.serverLastInteractionTimeSecsToNow), e.serverContinuousDismissCount !== 0 && n.uint32(360).int32(e.serverContinuousDismissCount), e.contactPermOsGranted !== !1 && n.uint32(368).bool(e.contactPermOsGranted), e.contactPermUserGranted !== !1 && n.uint32(376).bool(e.contactPermUserGranted), e.contactPermOsAuthorizationStatus !== 0 && n.uint32(384).int32(e.contactPermOsAuthorizationStatus), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Gu();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.emailVerified = t.bool();
          continue;
        }
        case 2: {
          if (i !== 16)
            break;
          r.phoneVerified = t.bool();
          continue;
        }
        case 3: {
          if (i !== 24)
            break;
          r.notificationPermGranted = t.bool();
          continue;
        }
        case 4: {
          if (i !== 32)
            break;
          r.contactPermGranted = t.bool();
          continue;
        }
        case 5: {
          if (i !== 40)
            break;
          r.mutualFriendsCount = t.int32();
          continue;
        }
        case 6: {
          if (i !== 48)
            break;
          r.groupsCount = t.int32();
          continue;
        }
        case 7: {
          if (i !== 56)
            break;
          r.hasNonTeamSnapchatConversations = t.bool();
          continue;
        }
        case 8: {
          if (i !== 64)
            break;
          r.emailSet = t.bool();
          continue;
        }
        case 9: {
          if (i !== 72)
            break;
          r.bitmojiSet = t.bool();
          continue;
        }
        case 10: {
          if (i !== 80)
            break;
          r.hasAddFriendsRequest = t.bool();
          continue;
        }
        case 11: {
          if (i !== 88)
            break;
          r.appLaunchFromPush = t.bool();
          continue;
        }
        case 12: {
          if (i !== 96)
            break;
          r.appLaunchType = t.int32();
          continue;
        }
        case 13: {
          if (i !== 104)
            break;
          r.campaignLocalImpressionCount = t.int32();
          continue;
        }
        case 14: {
          if (i !== 112)
            break;
          r.campaignLocalLastImpressionTimeSecsToNow = t.int64().toString();
          continue;
        }
        case 15: {
          if (i !== 120)
            break;
          r.campaignLocalContinuousDismissCount = t.int32();
          continue;
        }
        case 16: {
          if (i !== 128)
            break;
          r.fstNumInAppWarnings = t.int32();
          continue;
        }
        case 17: {
          if (i !== 136)
            break;
          r.fstShouldChangePassword = t.bool();
          continue;
        }
        case 18: {
          if (i !== 144)
            break;
          r.audioRecordPermGranted = t.bool();
          continue;
        }
        case 19: {
          if (i !== 152)
            break;
          r.mutualFriendsWithBirthdayCount = t.int32();
          continue;
        }
        case 20: {
          if (i !== 160)
            break;
          r.campaignLocalDismissCount = t.int32();
          continue;
        }
        case 21: {
          if (i !== 168)
            break;
          r.memoriesCount = t.int32();
          continue;
        }
        case 22: {
          if (i !== 176)
            break;
          r.campaignLocalFirstImpressionTimeSecsToNow = t.int64().toString();
          continue;
        }
        case 23: {
          if (i !== 184)
            break;
          r.campaignLocalClickCount = t.int32();
          continue;
        }
        case 24: {
          if (i !== 192)
            break;
          r.campaignLocalInteractionCount = t.int32();
          continue;
        }
        case 25: {
          if (i !== 200)
            break;
          r.campaignLocalLastInteractionTimeSecsToNow = t.int64().toString();
          continue;
        }
        case 26: {
          if (i !== 208)
            break;
          r.lockScreenWidgetAppOpenFromPush = t.bool();
          continue;
        }
        case 27: {
          if (i !== 216)
            break;
          r.communityCount = t.int32();
          continue;
        }
        case 28: {
          if (i !== 224)
            break;
          r.campaignLocalFirstClickTimeSecsToNow = t.int64().toString();
          continue;
        }
        case 29: {
          if (i !== 232)
            break;
          r.campaignLocalLastClickTimeSecsToNow = t.int64().toString();
          continue;
        }
        case 30: {
          if (i !== 240)
            break;
          r.campaignLocalFirstDismissTimeSecsToNow = t.int64().toString();
          continue;
        }
        case 31: {
          if (i !== 248)
            break;
          r.campaignLocalLastDismissTimeSecsToNow = t.int64().toString();
          continue;
        }
        case 32: {
          if (i !== 256)
            break;
          r.campaignLocalFirstInteractionTimeSecsToNow = t.int64().toString();
          continue;
        }
        case 33: {
          if (i !== 264)
            break;
          r.serverImpressionCount = t.int32();
          continue;
        }
        case 34: {
          if (i !== 272)
            break;
          r.serverClickCount = t.int32();
          continue;
        }
        case 35: {
          if (i !== 280)
            break;
          r.serverDismissCount = t.int32();
          continue;
        }
        case 36: {
          if (i !== 288)
            break;
          r.serverInteractionCount = t.int32();
          continue;
        }
        case 37: {
          if (i !== 296)
            break;
          r.serverFirstImpressionTimeSecsToNow = t.int64().toString();
          continue;
        }
        case 38: {
          if (i !== 304)
            break;
          r.serverLastImpressionTimeSecsToNow = t.int64().toString();
          continue;
        }
        case 39: {
          if (i !== 312)
            break;
          r.serverFirstClickTimeSecsToNow = t.int64().toString();
          continue;
        }
        case 40: {
          if (i !== 320)
            break;
          r.serverLastClickTimeSecsToNow = t.int64().toString();
          continue;
        }
        case 41: {
          if (i !== 328)
            break;
          r.serverFirstDismissTimeSecsToNow = t.int64().toString();
          continue;
        }
        case 42: {
          if (i !== 336)
            break;
          r.serverLastDismissTimeSecsToNow = t.int64().toString();
          continue;
        }
        case 43: {
          if (i !== 344)
            break;
          r.serverFirstInteractionTimeSecsToNow = t.int64().toString();
          continue;
        }
        case 44: {
          if (i !== 352)
            break;
          r.serverLastInteractionTimeSecsToNow = t.int64().toString();
          continue;
        }
        case 45: {
          if (i !== 360)
            break;
          r.serverContinuousDismissCount = t.int32();
          continue;
        }
        case 46: {
          if (i !== 368)
            break;
          r.contactPermOsGranted = t.bool();
          continue;
        }
        case 47: {
          if (i !== 376)
            break;
          r.contactPermUserGranted = t.bool();
          continue;
        }
        case 48: {
          if (i !== 384)
            break;
          r.contactPermOsAuthorizationStatus = t.int32();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return ci.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r, i, o, s, u, c, d, m, l, f, E, v, p, S, _, A, N, k, C, M, q, w, we, ge, De, ln, dn, fn, mn, hn, pn, vn, En, Sn, b, Ke, Sr, Ir, _r, Ar, Nr, Or, Rr, kr, Tr;
    const T = Gu();
    return T.emailVerified = (n = e.emailVerified) !== null && n !== void 0 ? n : !1, T.phoneVerified = (t = e.phoneVerified) !== null && t !== void 0 ? t : !1, T.notificationPermGranted = (a = e.notificationPermGranted) !== null && a !== void 0 ? a : !1, T.contactPermGranted = (r = e.contactPermGranted) !== null && r !== void 0 ? r : !1, T.mutualFriendsCount = (i = e.mutualFriendsCount) !== null && i !== void 0 ? i : 0, T.groupsCount = (o = e.groupsCount) !== null && o !== void 0 ? o : 0, T.hasNonTeamSnapchatConversations = (s = e.hasNonTeamSnapchatConversations) !== null && s !== void 0 ? s : !1, T.emailSet = (u = e.emailSet) !== null && u !== void 0 ? u : !1, T.bitmojiSet = (c = e.bitmojiSet) !== null && c !== void 0 ? c : !1, T.hasAddFriendsRequest = (d = e.hasAddFriendsRequest) !== null && d !== void 0 ? d : !1, T.appLaunchFromPush = (m = e.appLaunchFromPush) !== null && m !== void 0 ? m : !1, T.appLaunchType = (l = e.appLaunchType) !== null && l !== void 0 ? l : 0, T.campaignLocalImpressionCount = (f = e.campaignLocalImpressionCount) !== null && f !== void 0 ? f : 0, T.campaignLocalLastImpressionTimeSecsToNow = (E = e.campaignLocalLastImpressionTimeSecsToNow) !== null && E !== void 0 ? E : "0", T.campaignLocalContinuousDismissCount = (v = e.campaignLocalContinuousDismissCount) !== null && v !== void 0 ? v : 0, T.fstNumInAppWarnings = (p = e.fstNumInAppWarnings) !== null && p !== void 0 ? p : 0, T.fstShouldChangePassword = (S = e.fstShouldChangePassword) !== null && S !== void 0 ? S : !1, T.audioRecordPermGranted = (_ = e.audioRecordPermGranted) !== null && _ !== void 0 ? _ : !1, T.mutualFriendsWithBirthdayCount = (A = e.mutualFriendsWithBirthdayCount) !== null && A !== void 0 ? A : 0, T.campaignLocalDismissCount = (N = e.campaignLocalDismissCount) !== null && N !== void 0 ? N : 0, T.memoriesCount = (k = e.memoriesCount) !== null && k !== void 0 ? k : 0, T.campaignLocalFirstImpressionTimeSecsToNow = (C = e.campaignLocalFirstImpressionTimeSecsToNow) !== null && C !== void 0 ? C : "0", T.campaignLocalClickCount = (M = e.campaignLocalClickCount) !== null && M !== void 0 ? M : 0, T.campaignLocalInteractionCount = (q = e.campaignLocalInteractionCount) !== null && q !== void 0 ? q : 0, T.campaignLocalLastInteractionTimeSecsToNow = (w = e.campaignLocalLastInteractionTimeSecsToNow) !== null && w !== void 0 ? w : "0", T.lockScreenWidgetAppOpenFromPush = (we = e.lockScreenWidgetAppOpenFromPush) !== null && we !== void 0 ? we : !1, T.communityCount = (ge = e.communityCount) !== null && ge !== void 0 ? ge : 0, T.campaignLocalFirstClickTimeSecsToNow = (De = e.campaignLocalFirstClickTimeSecsToNow) !== null && De !== void 0 ? De : "0", T.campaignLocalLastClickTimeSecsToNow = (ln = e.campaignLocalLastClickTimeSecsToNow) !== null && ln !== void 0 ? ln : "0", T.campaignLocalFirstDismissTimeSecsToNow = (dn = e.campaignLocalFirstDismissTimeSecsToNow) !== null && dn !== void 0 ? dn : "0", T.campaignLocalLastDismissTimeSecsToNow = (fn = e.campaignLocalLastDismissTimeSecsToNow) !== null && fn !== void 0 ? fn : "0", T.campaignLocalFirstInteractionTimeSecsToNow = (mn = e.campaignLocalFirstInteractionTimeSecsToNow) !== null && mn !== void 0 ? mn : "0", T.serverImpressionCount = (hn = e.serverImpressionCount) !== null && hn !== void 0 ? hn : 0, T.serverClickCount = (pn = e.serverClickCount) !== null && pn !== void 0 ? pn : 0, T.serverDismissCount = (vn = e.serverDismissCount) !== null && vn !== void 0 ? vn : 0, T.serverInteractionCount = (En = e.serverInteractionCount) !== null && En !== void 0 ? En : 0, T.serverFirstImpressionTimeSecsToNow = (Sn = e.serverFirstImpressionTimeSecsToNow) !== null && Sn !== void 0 ? Sn : "0", T.serverLastImpressionTimeSecsToNow = (b = e.serverLastImpressionTimeSecsToNow) !== null && b !== void 0 ? b : "0", T.serverFirstClickTimeSecsToNow = (Ke = e.serverFirstClickTimeSecsToNow) !== null && Ke !== void 0 ? Ke : "0", T.serverLastClickTimeSecsToNow = (Sr = e.serverLastClickTimeSecsToNow) !== null && Sr !== void 0 ? Sr : "0", T.serverFirstDismissTimeSecsToNow = (Ir = e.serverFirstDismissTimeSecsToNow) !== null && Ir !== void 0 ? Ir : "0", T.serverLastDismissTimeSecsToNow = (_r = e.serverLastDismissTimeSecsToNow) !== null && _r !== void 0 ? _r : "0", T.serverFirstInteractionTimeSecsToNow = (Ar = e.serverFirstInteractionTimeSecsToNow) !== null && Ar !== void 0 ? Ar : "0", T.serverLastInteractionTimeSecsToNow = (Nr = e.serverLastInteractionTimeSecsToNow) !== null && Nr !== void 0 ? Nr : "0", T.serverContinuousDismissCount = (Or = e.serverContinuousDismissCount) !== null && Or !== void 0 ? Or : 0, T.contactPermOsGranted = (Rr = e.contactPermOsGranted) !== null && Rr !== void 0 ? Rr : !1, T.contactPermUserGranted = (kr = e.contactPermUserGranted) !== null && kr !== void 0 ? kr : !1, T.contactPermOsAuthorizationStatus = (Tr = e.contactPermOsAuthorizationStatus) !== null && Tr !== void 0 ? Tr : 0, T;
  }
};
function Bu() {
  return { boltUseCase: 0, boltCdnExperimentationId: 0, boltIsContentPopular: !1, boltClientAppState: 0 };
}
const li = {
  encode(e, n = new I()) {
    return e.boltUseCase !== 0 && n.uint32(8).uint32(e.boltUseCase), e.boltCdnExperimentationId !== 0 && n.uint32(16).uint32(e.boltCdnExperimentationId), e.boltIsContentPopular !== !1 && n.uint32(24).bool(e.boltIsContentPopular), e.boltClientAppState !== 0 && n.uint32(32).int32(e.boltClientAppState), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Bu();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.boltUseCase = t.uint32();
          continue;
        }
        case 2: {
          if (i !== 16)
            break;
          r.boltCdnExperimentationId = t.uint32();
          continue;
        }
        case 3: {
          if (i !== 24)
            break;
          r.boltIsContentPopular = t.bool();
          continue;
        }
        case 4: {
          if (i !== 32)
            break;
          r.boltClientAppState = t.int32();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return li.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r;
    const i = Bu();
    return i.boltUseCase = (n = e.boltUseCase) !== null && n !== void 0 ? n : 0, i.boltCdnExperimentationId = (t = e.boltCdnExperimentationId) !== null && t !== void 0 ? t : 0, i.boltIsContentPopular = (a = e.boltIsContentPopular) !== null && a !== void 0 ? a : !1, i.boltClientAppState = (r = e.boltClientAppState) !== null && r !== void 0 ? r : 0, i;
  }
};
var Fu;
(function(e) {
  e[e.UNKNOWN_CAMERA_DIRECTION = 0] = "UNKNOWN_CAMERA_DIRECTION", e[e.FRONT = 1] = "FRONT", e[e.BACK = 2] = "BACK", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(Fu || (Fu = {}));
var Hu;
(function(e) {
  e[e.UNKNOWN_CAMERA_CONTEXT = 0] = "UNKNOWN_CAMERA_CONTEXT", e[e.MAIN = 1] = "MAIN", e[e.REPLY = 2] = "REPLY", e[e.PROFILE = 3] = "PROFILE", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(Hu || (Hu = {}));
var Ku;
(function(e) {
  e[e.UNKNOWN_CAMERA_API = 0] = "UNKNOWN_CAMERA_API", e[e.CAMERA_1 = 1] = "CAMERA_1", e[e.CAMERA_2 = 2] = "CAMERA_2", e[e.ARCORE = 3] = "ARCORE", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(Ku || (Ku = {}));
var Yu;
(function(e) {
  e[e.UNKNOWN_FLASH_STATE = 0] = "UNKNOWN_FLASH_STATE", e[e.FLASH_ON = 1] = "FLASH_ON", e[e.FLASH_OFF = 2] = "FLASH_OFF", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(Yu || (Yu = {}));
var Wu;
(function(e) {
  e[e.UNKNOWN_NIGHT_MODE_STATE = 0] = "UNKNOWN_NIGHT_MODE_STATE", e[e.NIGHT_MODE_ON = 1] = "NIGHT_MODE_ON", e[e.NIGHT_MODE_OFF = 2] = "NIGHT_MODE_OFF", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(Wu || (Wu = {}));
var zu;
(function(e) {
  e[e.UNKNOWN_PICTURE_MODE = 0] = "UNKNOWN_PICTURE_MODE", e[e.JPEG_PICTURE_MODE = 1] = "JPEG_PICTURE_MODE", e[e.GPU_PICTURE_MODE = 2] = "GPU_PICTURE_MODE", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(zu || (zu = {}));
var qu;
(function(e) {
  e[e.UNKNOWN_CAPTURE_MODE = 0] = "UNKNOWN_CAPTURE_MODE", e[e.DEFAULT_CAPTURE_MODE = 1] = "DEFAULT_CAPTURE_MODE", e[e.TIMELINE_CAPTURE_MODE = 2] = "TIMELINE_CAPTURE_MODE", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(qu || (qu = {}));
var $u;
(function(e) {
  e[e.UNKNOWN_CAMERA2_LEVEL = 0] = "UNKNOWN_CAMERA2_LEVEL", e[e.LEGACY = 1] = "LEGACY", e[e.LIMITED = 2] = "LIMITED", e[e.FULL = 3] = "FULL", e[e.LEVEL_3 = 4] = "LEVEL_3", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})($u || ($u = {}));
function Zu() {
  return {
    cameraDirection: 0,
    cameraContext: 0,
    cameraApi: 0,
    flashState: 0,
    camera2Level: 0,
    nightModeState: 0,
    isFirstCapture: !1,
    pictureMode: 0,
    captureMode: 0,
    hasLens: !1,
    isLowLight: !1,
    isConcurrentCameraSupported: !1
  };
}
const di = {
  encode(e, n = new I()) {
    return e.cameraDirection !== 0 && n.uint32(8).int32(e.cameraDirection), e.cameraContext !== 0 && n.uint32(16).int32(e.cameraContext), e.cameraApi !== 0 && n.uint32(24).int32(e.cameraApi), e.flashState !== 0 && n.uint32(32).int32(e.flashState), e.camera2Level !== 0 && n.uint32(40).int32(e.camera2Level), e.nightModeState !== 0 && n.uint32(48).int32(e.nightModeState), e.isFirstCapture !== !1 && n.uint32(56).bool(e.isFirstCapture), e.pictureMode !== 0 && n.uint32(64).int32(e.pictureMode), e.captureMode !== 0 && n.uint32(72).int32(e.captureMode), e.hasLens !== !1 && n.uint32(80).bool(e.hasLens), e.isLowLight !== !1 && n.uint32(88).bool(e.isLowLight), e.isConcurrentCameraSupported !== !1 && n.uint32(96).bool(e.isConcurrentCameraSupported), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Zu();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.cameraDirection = t.int32();
          continue;
        }
        case 2: {
          if (i !== 16)
            break;
          r.cameraContext = t.int32();
          continue;
        }
        case 3: {
          if (i !== 24)
            break;
          r.cameraApi = t.int32();
          continue;
        }
        case 4: {
          if (i !== 32)
            break;
          r.flashState = t.int32();
          continue;
        }
        case 5: {
          if (i !== 40)
            break;
          r.camera2Level = t.int32();
          continue;
        }
        case 6: {
          if (i !== 48)
            break;
          r.nightModeState = t.int32();
          continue;
        }
        case 7: {
          if (i !== 56)
            break;
          r.isFirstCapture = t.bool();
          continue;
        }
        case 8: {
          if (i !== 64)
            break;
          r.pictureMode = t.int32();
          continue;
        }
        case 9: {
          if (i !== 72)
            break;
          r.captureMode = t.int32();
          continue;
        }
        case 10: {
          if (i !== 80)
            break;
          r.hasLens = t.bool();
          continue;
        }
        case 11: {
          if (i !== 88)
            break;
          r.isLowLight = t.bool();
          continue;
        }
        case 12: {
          if (i !== 96)
            break;
          r.isConcurrentCameraSupported = t.bool();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return di.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r, i, o, s, u, c, d, m, l;
    const f = Zu();
    return f.cameraDirection = (n = e.cameraDirection) !== null && n !== void 0 ? n : 0, f.cameraContext = (t = e.cameraContext) !== null && t !== void 0 ? t : 0, f.cameraApi = (a = e.cameraApi) !== null && a !== void 0 ? a : 0, f.flashState = (r = e.flashState) !== null && r !== void 0 ? r : 0, f.camera2Level = (i = e.camera2Level) !== null && i !== void 0 ? i : 0, f.nightModeState = (o = e.nightModeState) !== null && o !== void 0 ? o : 0, f.isFirstCapture = (s = e.isFirstCapture) !== null && s !== void 0 ? s : !1, f.pictureMode = (u = e.pictureMode) !== null && u !== void 0 ? u : 0, f.captureMode = (c = e.captureMode) !== null && c !== void 0 ? c : 0, f.hasLens = (d = e.hasLens) !== null && d !== void 0 ? d : !1, f.isLowLight = (m = e.isLowLight) !== null && m !== void 0 ? m : !1, f.isConcurrentCameraSupported = (l = e.isConcurrentCameraSupported) !== null && l !== void 0 ? l : !1, f;
  }
};
function Ju() {
  return { cognacId: [] };
}
const fi = {
  encode(e, n = new I()) {
    for (const t of e.cognacId)
      n.uint32(10).string(t);
    return n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Ju();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.cognacId.push(t.string());
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return fi.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = Ju();
    return t.cognacId = ((n = e.cognacId) === null || n === void 0 ? void 0 : n.map((a) => a)) || [], t;
  }
};
var Xu;
(function(e) {
  e[e.UNKNOWN_ASSET_TYPE = 0] = "UNKNOWN_ASSET_TYPE", e[e.GENERIC_LARGE_ASSET_TYPE = 1] = "GENERIC_LARGE_ASSET_TYPE", e[e.GENERIC_SMALL_ASSET_TYPE = 2] = "GENERIC_SMALL_ASSET_TYPE", e[e.AD_REMOTE_ASSET = 3] = "AD_REMOTE_ASSET", e[e.AD_SNAP = 4] = "AD_SNAP", e[e.AD_WEB_VIEW_RESOURCE_CONTENT = 5] = "AD_WEB_VIEW_RESOURCE_CONTENT", e[e.ATTACHMENT_INFO = 6] = "ATTACHMENT_INFO", e[e.BITMOJI = 7] = "BITMOJI", e[e.BITMOJI_LENS_AVATAR_ASSET = 8] = "BITMOJI_LENS_AVATAR_ASSET", e[e.BITMOJI_LENS_METADATA = 9] = "BITMOJI_LENS_METADATA", e[e.CAPTION_METADATA = 10] = "CAPTION_METADATA", e[e.CAPTION_TYPEFACE = 11] = "CAPTION_TYPEFACE", e[e.CAPTION_VIEW_BITMAP = 12] = "CAPTION_VIEW_BITMAP", e[e.CHAT_MEDIA_THUMBNAIL = 13] = "CHAT_MEDIA_THUMBNAIL", e[e.COGNAC = 14] = "COGNAC", e[e.COGNAC_WEBVIEW = 15] = "COGNAC_WEBVIEW", e[e.COMMERCE = 16] = "COMMERCE", e[e.CONTEXT_FILTER_METADATA = 17] = "CONTEXT_FILTER_METADATA", e[e.CUSTOM_STICKERS = 18] = "CUSTOM_STICKERS", e[e.DISCOVER_FEED_THUMBNAIL = 19] = "DISCOVER_FEED_THUMBNAIL", e[e.DISCOVER_PUBLISHER_SNAP = 20] = "DISCOVER_PUBLISHER_SNAP", e[e.DISCOVER_STORY_SNAP = 21] = "DISCOVER_STORY_SNAP", e[e.DISCOVER_STORY_STREAMING_SNAP = 22] = "DISCOVER_STORY_STREAMING_SNAP", e[e.EMOJI = 23] = "EMOJI", e[e.EMOJI_BRUSH = 24] = "EMOJI_BRUSH", e[e.EXTERNAL_GEOFILTER = 25] = "EXTERNAL_GEOFILTER", e[e.EXTERNAL_STICKER = 26] = "EXTERNAL_STICKER", e[e.GEOFILTER_OVERLAY = 27] = "GEOFILTER_OVERLAY", e[e.IMAGELOADING_URL = 28] = "IMAGELOADING_URL", e[e.HELVETICA = 29] = "HELVETICA", e[e.INFO_STICKER = 30] = "INFO_STICKER", e[e.LENS_CONTENT = 31] = "LENS_CONTENT", e[e.LENS_ICON = 32] = "LENS_ICON", e[e.LENS_OVERLAY_IMAGE = 33] = "LENS_OVERLAY_IMAGE", e[e.LENS_REMOTE_ASSET = 34] = "LENS_REMOTE_ASSET", e[e.LOGIN_KIT_PRIVACT = 35] = "LOGIN_KIT_PRIVACT", e[e.MAPS_EGGHUNT = 36] = "MAPS_EGGHUNT", e[e.MAPS_KASHMIR = 37] = "MAPS_KASHMIR", e[e.MAPS_WORLDEFFECTS = 38] = "MAPS_WORLDEFFECTS", e[e.MEDIA_PACKAGE_COMPOSITE = 39] = "MEDIA_PACKAGE_COMPOSITE", e[e.MEDIA_PACKAGE_THUMB = 40] = "MEDIA_PACKAGE_THUMB", e[e.MEMORIES_EDITS = 41] = "MEMORIES_EDITS", e[e.MEMORIES_MEDIA = 42] = "MEMORIES_MEDIA", e[e.MEMORIES_MINI_THUMBNAIL = 43] = "MEMORIES_MINI_THUMBNAIL", e[e.MEMORIES_OVERLAY = 44] = "MEMORIES_OVERLAY", e[e.MEMORIES_THUMBNAIL = 45] = "MEMORIES_THUMBNAIL", e[e.NON_USER_BITMOJI = 46] = "NON_USER_BITMOJI", e[e.PAYMENTS = 47] = "PAYMENTS", e[e.PUBLISHER_SNAP_MEDIA = 48] = "PUBLISHER_SNAP_MEDIA", e[e.SHAZAM = 49] = "SHAZAM", e[e.SKY_MODEL = 50] = "SKY_MODEL", e[e.SNAP = 51] = "SNAP", e[e.SNAP_FIRST_FRAME = 52] = "SNAP_FIRST_FRAME", e[e.SNAP_LOADING_FRAME = 53] = "SNAP_LOADING_FRAME", e[e.SNAP_STICKER = 54] = "SNAP_STICKER", e[e.SPECTACLES = 55] = "SPECTACLES", e[e.STICKER_TAG = 56] = "STICKER_TAG", e[e.STICKERS_METADATA = 57] = "STICKERS_METADATA", e[e.STORY_SNAP = 58] = "STORY_SNAP", e[e.STORY_THUMB = 59] = "STORY_THUMB", e[e.TRACKING_DATA = 60] = "TRACKING_DATA", e[e.USER_GENERATED_ASSETS = 61] = "USER_GENERATED_ASSETS", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(Xu || (Xu = {}));
function Qu() {
  return { legacyMushroomContentType: 0 };
}
const mi = {
  encode(e, n = new I()) {
    return e.legacyMushroomContentType !== 0 && n.uint32(8).int32(e.legacyMushroomContentType), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Qu();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.legacyMushroomContentType = t.int32();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return mi.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = Qu();
    return t.legacyMushroomContentType = (n = e.legacyMushroomContentType) !== null && n !== void 0 ? n : 0, t;
  }
};
function ju() {
  return { withAnimatedOverlay: !1, withMusic: !1 };
}
const hi = {
  encode(e, n = new I()) {
    return e.withAnimatedOverlay !== !1 && n.uint32(8).bool(e.withAnimatedOverlay), e.withMusic !== !1 && n.uint32(16).bool(e.withMusic), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = ju();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.withAnimatedOverlay = t.bool();
          continue;
        }
        case 2: {
          if (i !== 16)
            break;
          r.withMusic = t.bool();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return hi.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = ju();
    return a.withAnimatedOverlay = (n = e.withAnimatedOverlay) !== null && n !== void 0 ? n : !1, a.withMusic = (t = e.withMusic) !== null && t !== void 0 ? t : !1, a;
  }
};
function xu() {
  return { discoverFeedSectionCacheInfo: void 0 };
}
const pi = {
  encode(e, n = new I()) {
    return e.discoverFeedSectionCacheInfo !== void 0 && vi.encode(e.discoverFeedSectionCacheInfo, n.uint32(10).fork()).join(), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = xu();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.discoverFeedSectionCacheInfo = vi.decode(t, t.uint32());
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return pi.fromPartial(e ?? {});
  },
  fromPartial(e) {
    const n = xu();
    return n.discoverFeedSectionCacheInfo = e.discoverFeedSectionCacheInfo !== void 0 && e.discoverFeedSectionCacheInfo !== null ? vi.fromPartial(e.discoverFeedSectionCacheInfo) : void 0, n;
  }
};
function ec() {
  return { feedType: 0 };
}
const vi = {
  encode(e, n = new I()) {
    return e.feedType !== 0 && n.uint32(8).int32(e.feedType), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = ec();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.feedType = t.int32();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return vi.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = ec();
    return t.feedType = (n = e.feedType) !== null && n !== void 0 ? n : 0, t;
  }
};
function nc() {
  return { lastLensActivatedTime: "0", lastSnappableLensActivatedTime: "0", isAnyEffectApplied: !1 };
}
const Ei = {
  encode(e, n = new I()) {
    return e.lastLensActivatedTime !== "0" && n.uint32(8).uint64(e.lastLensActivatedTime), e.lastSnappableLensActivatedTime !== "0" && n.uint32(16).uint64(e.lastSnappableLensActivatedTime), e.isAnyEffectApplied !== !1 && n.uint32(24).bool(e.isAnyEffectApplied), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = nc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.lastLensActivatedTime = t.uint64().toString();
          continue;
        }
        case 2: {
          if (i !== 16)
            break;
          r.lastSnappableLensActivatedTime = t.uint64().toString();
          continue;
        }
        case 3: {
          if (i !== 24)
            break;
          r.isAnyEffectApplied = t.bool();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Ei.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a;
    const r = nc();
    return r.lastLensActivatedTime = (n = e.lastLensActivatedTime) !== null && n !== void 0 ? n : "0", r.lastSnappableLensActivatedTime = (t = e.lastSnappableLensActivatedTime) !== null && t !== void 0 ? t : "0", r.isAnyEffectApplied = (a = e.isAnyEffectApplied) !== null && a !== void 0 ? a : !1, r;
  }
};
function tc() {
  return { mediaSource: 0, assetType: 0 };
}
const Si = {
  encode(e, n = new I()) {
    return e.mediaSource !== 0 && n.uint32(8).int32(e.mediaSource), e.assetType !== 0 && n.uint32(16).int32(e.assetType), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = tc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.mediaSource = t.int32();
          continue;
        }
        case 2: {
          if (i !== 16)
            break;
          r.assetType = t.int32();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Si.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = tc();
    return a.mediaSource = (n = e.mediaSource) !== null && n !== void 0 ? n : 0, a.assetType = (t = e.assetType) !== null && t !== void 0 ? t : 0, a;
  }
};
var ic;
(function(e) {
  e[e.MEDIA_TYPE_UNSET = 0] = "MEDIA_TYPE_UNSET", e[e.IMAGE = 1] = "IMAGE", e[e.VIDEO = 2] = "VIDEO", e[e.GIF = 3] = "GIF", e[e.AUDIO = 4] = "AUDIO", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(ic || (ic = {}));
function rc() {
  return { mediaDurationMs: 0, mediaType: 0 };
}
const Ii = {
  encode(e, n = new I()) {
    return e.mediaDurationMs !== 0 && n.uint32(8).uint32(e.mediaDurationMs), e.mediaType !== 0 && n.uint32(16).int32(e.mediaType), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = rc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.mediaDurationMs = t.uint32();
          continue;
        }
        case 2: {
          if (i !== 16)
            break;
          r.mediaType = t.int32();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Ii.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = rc();
    return a.mediaDurationMs = (n = e.mediaDurationMs) !== null && n !== void 0 ? n : 0, a.mediaType = (t = e.mediaType) !== null && t !== void 0 ? t : 0, a;
  }
};
function ac() {
  return { contentViewSource: 0, playbackItemType: 0, useVerticalNavigation: !1 };
}
const _i = {
  encode(e, n = new I()) {
    return e.contentViewSource !== 0 && n.uint32(8).int32(e.contentViewSource), e.playbackItemType !== 0 && n.uint32(16).int32(e.playbackItemType), e.useVerticalNavigation !== !1 && n.uint32(24).bool(e.useVerticalNavigation), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = ac();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.contentViewSource = t.int32();
          continue;
        }
        case 2: {
          if (i !== 16)
            break;
          r.playbackItemType = t.int32();
          continue;
        }
        case 3: {
          if (i !== 24)
            break;
          r.useVerticalNavigation = t.bool();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return _i.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a;
    const r = ac();
    return r.contentViewSource = (n = e.contentViewSource) !== null && n !== void 0 ? n : 0, r.playbackItemType = (t = e.playbackItemType) !== null && t !== void 0 ? t : 0, r.useVerticalNavigation = (a = e.useVerticalNavigation) !== null && a !== void 0 ? a : !1, r;
  }
};
function oc() {
  return { scannedCategoryIds: [] };
}
const Ai = {
  encode(e, n = new I()) {
    for (const t of e.scannedCategoryIds)
      n.uint32(10).string(t);
    return n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = oc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.scannedCategoryIds.push(t.string());
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Ai.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = oc();
    return t.scannedCategoryIds = ((n = e.scannedCategoryIds) === null || n === void 0 ? void 0 : n.map((a) => a)) || [], t;
  }
};
function sc() {
  return { userIds: [] };
}
const Ni = {
  encode(e, n = new I()) {
    for (const t of e.userIds)
      n.uint32(10).string(t);
    return n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = sc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.userIds.push(t.string());
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Ni.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = sc();
    return t.userIds = ((n = e.userIds) === null || n === void 0 ? void 0 : n.map((a) => a)) || [], t;
  }
};
function uc() {
  return { url: "" };
}
const Oi = {
  encode(e, n = new I()) {
    return e.url !== "" && n.uint32(10).string(e.url), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = uc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.url = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Oi.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = uc();
    return t.url = (n = e.url) !== null && n !== void 0 ? n : "", t;
  }
};
function cc() {
  return { oauthClientId: "" };
}
const Ri = {
  encode(e, n = new I()) {
    return e.oauthClientId !== "" && n.uint32(10).string(e.oauthClientId), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = cc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.oauthClientId = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Ri.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = cc();
    return t.oauthClientId = (n = e.oauthClientId) !== null && n !== void 0 ? n : "", t;
  }
};
var lc;
(function(e) {
  e[e.PREFERENCE_UNSET = 0] = "PREFERENCE_UNSET", e[e.GCS = 1] = "GCS", e[e.S3 = 2] = "S3", e[e.AUTO = 3] = "AUTO", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(lc || (lc = {}));
function dc() {
  return { chunkUploadSupportRequired: !1, cloudfrontPop: "", gcdnPop: "", chunkUploadPreference: 0 };
}
const ki = {
  encode(e, n = new I()) {
    return e.chunkUploadSupportRequired !== !1 && n.uint32(8).bool(e.chunkUploadSupportRequired), e.cloudfrontPop !== "" && n.uint32(18).string(e.cloudfrontPop), e.gcdnPop !== "" && n.uint32(26).string(e.gcdnPop), e.chunkUploadPreference !== 0 && n.uint32(32).int32(e.chunkUploadPreference), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = dc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.chunkUploadSupportRequired = t.bool();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.cloudfrontPop = t.string();
          continue;
        }
        case 3: {
          if (i !== 26)
            break;
          r.gcdnPop = t.string();
          continue;
        }
        case 4: {
          if (i !== 32)
            break;
          r.chunkUploadPreference = t.int32();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return ki.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r;
    const i = dc();
    return i.chunkUploadSupportRequired = (n = e.chunkUploadSupportRequired) !== null && n !== void 0 ? n : !1, i.cloudfrontPop = (t = e.cloudfrontPop) !== null && t !== void 0 ? t : "", i.gcdnPop = (a = e.gcdnPop) !== null && a !== void 0 ? a : "", i.chunkUploadPreference = (r = e.chunkUploadPreference) !== null && r !== void 0 ? r : 0, i;
  }
};
var fc;
(function(e) {
  e[e.UNKNOWN_STORY_TYPE = 0] = "UNKNOWN_STORY_TYPE", e[e.PUBLIC_USER_STORY = 1] = "PUBLIC_USER_STORY", e[e.OUR_STORY = 2] = "OUR_STORY", e[e.PUBLISHER_STORY = 3] = "PUBLISHER_STORY", e[e.FRIEND_STORY = 4] = "FRIEND_STORY", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(fc || (fc = {}));
var mc;
(function(e) {
  e[e.UNKNOWN_SPECTACLES_VERSION = 0] = "UNKNOWN_SPECTACLES_VERSION", e[e.V1 = 1] = "V1", e[e.V2 = 2] = "V2", e[e.V3 = 3] = "V3", e[e.V4 = 4] = "V4", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(mc || (mc = {}));
function hc() {
  return {
    mediaMetadata: void 0,
    storyMetadata: void 0,
    cameraSignals: void 0,
    snapSource: 0,
    contentManagerProvidedSignals: void 0,
    spectacleMetadata: void 0,
    boltSignals: void 0,
    lensesSignals: void 0,
    creativeToolsSignals: void 0,
    estimatedDurationForEventMs: 0,
    routingSignals: void 0,
    mdpMediaAttribution: void 0,
    size: 0,
    mediaSignals: void 0,
    perceptionSignals: void 0,
    operaSignals: void 0,
    recipientsSignals: void 0,
    billboardSignals: void 0,
    cognacSignals: void 0,
    hashSignals: void 0,
    edgeSignals: {},
    snapKitSignals: void 0,
    uploadSignals: void 0,
    ruids: [],
    discoverFeedSignals: void 0
  };
}
const Ln = {
  encode(e, n = new I()) {
    e.mediaMetadata !== void 0 && ii.encode(e.mediaMetadata, n.uint32(10).fork()).join(), e.storyMetadata !== void 0 && Ti.encode(e.storyMetadata, n.uint32(18).fork()).join(), e.cameraSignals !== void 0 && di.encode(e.cameraSignals, n.uint32(26).fork()).join(), e.snapSource !== 0 && n.uint32(32).int32(e.snapSource), e.contentManagerProvidedSignals !== void 0 && mi.encode(e.contentManagerProvidedSignals, n.uint32(42).fork()).join(), e.spectacleMetadata !== void 0 && gi.encode(e.spectacleMetadata, n.uint32(50).fork()).join(), e.boltSignals !== void 0 && li.encode(e.boltSignals, n.uint32(58).fork()).join(), e.lensesSignals !== void 0 && Ei.encode(e.lensesSignals, n.uint32(66).fork()).join(), e.creativeToolsSignals !== void 0 && hi.encode(e.creativeToolsSignals, n.uint32(74).fork()).join(), e.estimatedDurationForEventMs !== 0 && n.uint32(80).uint32(e.estimatedDurationForEventMs), e.routingSignals !== void 0 && Oi.encode(e.routingSignals, n.uint32(90).fork()).join(), e.mdpMediaAttribution !== void 0 && Si.encode(e.mdpMediaAttribution, n.uint32(98).fork()).join(), e.size !== 0 && n.uint32(104).uint32(e.size), e.mediaSignals !== void 0 && Ii.encode(e.mediaSignals, n.uint32(114).fork()).join(), e.perceptionSignals !== void 0 && Ai.encode(e.perceptionSignals, n.uint32(122).fork()).join(), e.operaSignals !== void 0 && _i.encode(e.operaSignals, n.uint32(130).fork()).join(), e.recipientsSignals !== void 0 && Ni.encode(e.recipientsSignals, n.uint32(138).fork()).join(), e.billboardSignals !== void 0 && ci.encode(e.billboardSignals, n.uint32(146).fork()).join(), e.cognacSignals !== void 0 && fi.encode(e.cognacSignals, n.uint32(154).fork()).join(), e.hashSignals !== void 0 && bi.encode(e.hashSignals, n.uint32(162).fork()).join(), Object.entries(e.edgeSignals).forEach(([t, a]) => {
      na.encode({ key: t, value: a }, n.uint32(170).fork()).join();
    }), e.snapKitSignals !== void 0 && Ri.encode(e.snapKitSignals, n.uint32(178).fork()).join(), e.uploadSignals !== void 0 && ki.encode(e.uploadSignals, n.uint32(186).fork()).join();
    for (const t of e.ruids)
      Be.encode(t, n.uint32(194).fork()).join();
    return e.discoverFeedSignals !== void 0 && pi.encode(e.discoverFeedSignals, n.uint32(202).fork()).join(), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = hc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.mediaMetadata = ii.decode(t, t.uint32());
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.storyMetadata = Ti.decode(t, t.uint32());
          continue;
        }
        case 3: {
          if (i !== 26)
            break;
          r.cameraSignals = di.decode(t, t.uint32());
          continue;
        }
        case 4: {
          if (i !== 32)
            break;
          r.snapSource = t.int32();
          continue;
        }
        case 5: {
          if (i !== 42)
            break;
          r.contentManagerProvidedSignals = mi.decode(t, t.uint32());
          continue;
        }
        case 6: {
          if (i !== 50)
            break;
          r.spectacleMetadata = gi.decode(t, t.uint32());
          continue;
        }
        case 7: {
          if (i !== 58)
            break;
          r.boltSignals = li.decode(t, t.uint32());
          continue;
        }
        case 8: {
          if (i !== 66)
            break;
          r.lensesSignals = Ei.decode(t, t.uint32());
          continue;
        }
        case 9: {
          if (i !== 74)
            break;
          r.creativeToolsSignals = hi.decode(t, t.uint32());
          continue;
        }
        case 10: {
          if (i !== 80)
            break;
          r.estimatedDurationForEventMs = t.uint32();
          continue;
        }
        case 11: {
          if (i !== 90)
            break;
          r.routingSignals = Oi.decode(t, t.uint32());
          continue;
        }
        case 12: {
          if (i !== 98)
            break;
          r.mdpMediaAttribution = Si.decode(t, t.uint32());
          continue;
        }
        case 13: {
          if (i !== 104)
            break;
          r.size = t.uint32();
          continue;
        }
        case 14: {
          if (i !== 114)
            break;
          r.mediaSignals = Ii.decode(t, t.uint32());
          continue;
        }
        case 15: {
          if (i !== 122)
            break;
          r.perceptionSignals = Ai.decode(t, t.uint32());
          continue;
        }
        case 16: {
          if (i !== 130)
            break;
          r.operaSignals = _i.decode(t, t.uint32());
          continue;
        }
        case 17: {
          if (i !== 138)
            break;
          r.recipientsSignals = Ni.decode(t, t.uint32());
          continue;
        }
        case 18: {
          if (i !== 146)
            break;
          r.billboardSignals = ci.decode(t, t.uint32());
          continue;
        }
        case 19: {
          if (i !== 154)
            break;
          r.cognacSignals = fi.decode(t, t.uint32());
          continue;
        }
        case 20: {
          if (i !== 162)
            break;
          r.hashSignals = bi.decode(t, t.uint32());
          continue;
        }
        case 21: {
          if (i !== 170)
            break;
          const o = na.decode(t, t.uint32());
          o.value !== void 0 && (r.edgeSignals[o.key] = o.value);
          continue;
        }
        case 22: {
          if (i !== 178)
            break;
          r.snapKitSignals = Ri.decode(t, t.uint32());
          continue;
        }
        case 23: {
          if (i !== 186)
            break;
          r.uploadSignals = ki.decode(t, t.uint32());
          continue;
        }
        case 24: {
          if (i !== 194)
            break;
          r.ruids.push(Be.decode(t, t.uint32()));
          continue;
        }
        case 25: {
          if (i !== 202)
            break;
          r.discoverFeedSignals = pi.decode(t, t.uint32());
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Ln.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r, i;
    const o = hc();
    return o.mediaMetadata = e.mediaMetadata !== void 0 && e.mediaMetadata !== null ? ii.fromPartial(e.mediaMetadata) : void 0, o.storyMetadata = e.storyMetadata !== void 0 && e.storyMetadata !== null ? Ti.fromPartial(e.storyMetadata) : void 0, o.cameraSignals = e.cameraSignals !== void 0 && e.cameraSignals !== null ? di.fromPartial(e.cameraSignals) : void 0, o.snapSource = (n = e.snapSource) !== null && n !== void 0 ? n : 0, o.contentManagerProvidedSignals = e.contentManagerProvidedSignals !== void 0 && e.contentManagerProvidedSignals !== null ? mi.fromPartial(e.contentManagerProvidedSignals) : void 0, o.spectacleMetadata = e.spectacleMetadata !== void 0 && e.spectacleMetadata !== null ? gi.fromPartial(e.spectacleMetadata) : void 0, o.boltSignals = e.boltSignals !== void 0 && e.boltSignals !== null ? li.fromPartial(e.boltSignals) : void 0, o.lensesSignals = e.lensesSignals !== void 0 && e.lensesSignals !== null ? Ei.fromPartial(e.lensesSignals) : void 0, o.creativeToolsSignals = e.creativeToolsSignals !== void 0 && e.creativeToolsSignals !== null ? hi.fromPartial(e.creativeToolsSignals) : void 0, o.estimatedDurationForEventMs = (t = e.estimatedDurationForEventMs) !== null && t !== void 0 ? t : 0, o.routingSignals = e.routingSignals !== void 0 && e.routingSignals !== null ? Oi.fromPartial(e.routingSignals) : void 0, o.mdpMediaAttribution = e.mdpMediaAttribution !== void 0 && e.mdpMediaAttribution !== null ? Si.fromPartial(e.mdpMediaAttribution) : void 0, o.size = (a = e.size) !== null && a !== void 0 ? a : 0, o.mediaSignals = e.mediaSignals !== void 0 && e.mediaSignals !== null ? Ii.fromPartial(e.mediaSignals) : void 0, o.perceptionSignals = e.perceptionSignals !== void 0 && e.perceptionSignals !== null ? Ai.fromPartial(e.perceptionSignals) : void 0, o.operaSignals = e.operaSignals !== void 0 && e.operaSignals !== null ? _i.fromPartial(e.operaSignals) : void 0, o.recipientsSignals = e.recipientsSignals !== void 0 && e.recipientsSignals !== null ? Ni.fromPartial(e.recipientsSignals) : void 0, o.billboardSignals = e.billboardSignals !== void 0 && e.billboardSignals !== null ? ci.fromPartial(e.billboardSignals) : void 0, o.cognacSignals = e.cognacSignals !== void 0 && e.cognacSignals !== null ? fi.fromPartial(e.cognacSignals) : void 0, o.hashSignals = e.hashSignals !== void 0 && e.hashSignals !== null ? bi.fromPartial(e.hashSignals) : void 0, o.edgeSignals = Object.entries((r = e.edgeSignals) !== null && r !== void 0 ? r : {}).reduce((s, [u, c]) => (c !== void 0 && (s[globalThis.Number(u)] = Pe.fromPartial(c)), s), {}), o.snapKitSignals = e.snapKitSignals !== void 0 && e.snapKitSignals !== null ? Ri.fromPartial(e.snapKitSignals) : void 0, o.uploadSignals = e.uploadSignals !== void 0 && e.uploadSignals !== null ? ki.fromPartial(e.uploadSignals) : void 0, o.ruids = ((i = e.ruids) === null || i === void 0 ? void 0 : i.map((s) => Be.fromPartial(s))) || [], o.discoverFeedSignals = e.discoverFeedSignals !== void 0 && e.discoverFeedSignals !== null ? pi.fromPartial(e.discoverFeedSignals) : void 0, o;
  }
};
function pc() {
  return { isPublicStory: !1, isOfficialStory: !1, storyType: 0 };
}
const Ti = {
  encode(e, n = new I()) {
    return e.isPublicStory !== !1 && n.uint32(8).bool(e.isPublicStory), e.isOfficialStory !== !1 && n.uint32(16).bool(e.isOfficialStory), e.storyType !== 0 && n.uint32(24).int32(e.storyType), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = pc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.isPublicStory = t.bool();
          continue;
        }
        case 2: {
          if (i !== 16)
            break;
          r.isOfficialStory = t.bool();
          continue;
        }
        case 3: {
          if (i !== 24)
            break;
          r.storyType = t.int32();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Ti.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a;
    const r = pc();
    return r.isPublicStory = (n = e.isPublicStory) !== null && n !== void 0 ? n : !1, r.isOfficialStory = (t = e.isOfficialStory) !== null && t !== void 0 ? t : !1, r.storyType = (a = e.storyType) !== null && a !== void 0 ? a : 0, r;
  }
};
function vc() {
  return { isSpectacle: !1, spectaclesVersion: 0 };
}
const gi = {
  encode(e, n = new I()) {
    return e.isSpectacle !== !1 && n.uint32(8).bool(e.isSpectacle), e.spectaclesVersion !== 0 && n.uint32(16).int32(e.spectaclesVersion), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = vc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.isSpectacle = t.bool();
          continue;
        }
        case 2: {
          if (i !== 16)
            break;
          r.spectaclesVersion = t.int32();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return gi.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = vc();
    return a.isSpectacle = (n = e.isSpectacle) !== null && n !== void 0 ? n : !1, a.spectaclesVersion = (t = e.spectaclesVersion) !== null && t !== void 0 ? t : 0, a;
  }
};
function Ec() {
  return { userId: new Uint8Array(0), seed: new Uint8Array(0), namespace: 0 };
}
const bi = {
  encode(e, n = new I()) {
    return e.userId.length !== 0 && n.uint32(10).bytes(e.userId), e.seed.length !== 0 && n.uint32(18).bytes(e.seed), e.namespace !== 0 && n.uint32(24).int32(e.namespace), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Ec();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.userId = t.bytes();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.seed = t.bytes();
          continue;
        }
        case 3: {
          if (i !== 24)
            break;
          r.namespace = t.int32();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return bi.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a;
    const r = Ec();
    return r.userId = (n = e.userId) !== null && n !== void 0 ? n : new Uint8Array(0), r.seed = (t = e.seed) !== null && t !== void 0 ? t : new Uint8Array(0), r.namespace = (a = e.namespace) !== null && a !== void 0 ? a : 0, r;
  }
};
function Sc() {
  return { key: 0, value: void 0 };
}
const na = {
  encode(e, n = new I()) {
    return e.key !== 0 && n.uint32(8).int32(e.key), e.value !== void 0 && Pe.encode(e.value, n.uint32(18).fork()).join(), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Sc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.key = t.int32();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.value = Pe.decode(t, t.uint32());
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return na.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = Sc();
    return t.key = (n = e.key) !== null && n !== void 0 ? n : 0, t.value = e.value !== void 0 && e.value !== null ? Pe.fromPartial(e.value) : void 0, t;
  }
};
function Ic() {
  return {
    configNames: [],
    namespaces: [],
    cofConfigNames: [],
    includeAllConfigs: !1,
    disableExposureLogging: !1,
    enableDebug: !1
  };
}
const Qa = {
  encode(e, n = new I()) {
    for (const t of e.configNames)
      n.uint32(10).string(t);
    n.uint32(18).fork();
    for (const t of e.namespaces)
      n.int32(t);
    n.join();
    for (const t of e.cofConfigNames)
      n.uint32(26).string(t);
    return e.includeAllConfigs !== !1 && n.uint32(32).bool(e.includeAllConfigs), e.disableExposureLogging !== !1 && n.uint32(40).bool(e.disableExposureLogging), e.enableDebug !== !1 && n.uint32(104).bool(e.enableDebug), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Ic();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.configNames.push(t.string());
          continue;
        }
        case 2: {
          if (i === 16) {
            r.namespaces.push(t.int32());
            continue;
          }
          if (i === 18) {
            const o = t.uint32() + t.pos;
            for (; t.pos < o; )
              r.namespaces.push(t.int32());
            continue;
          }
          break;
        }
        case 3: {
          if (i !== 26)
            break;
          r.cofConfigNames.push(t.string());
          continue;
        }
        case 4: {
          if (i !== 32)
            break;
          r.includeAllConfigs = t.bool();
          continue;
        }
        case 5: {
          if (i !== 40)
            break;
          r.disableExposureLogging = t.bool();
          continue;
        }
        case 13: {
          if (i !== 104)
            break;
          r.enableDebug = t.bool();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Qa.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r, i, o;
    const s = Ic();
    return s.configNames = ((n = e.configNames) === null || n === void 0 ? void 0 : n.map((u) => u)) || [], s.namespaces = ((t = e.namespaces) === null || t === void 0 ? void 0 : t.map((u) => u)) || [], s.cofConfigNames = ((a = e.cofConfigNames) === null || a === void 0 ? void 0 : a.map((u) => u)) || [], s.includeAllConfigs = (r = e.includeAllConfigs) !== null && r !== void 0 ? r : !1, s.disableExposureLogging = (i = e.disableExposureLogging) !== null && i !== void 0 ? i : !1, s.enableDebug = (o = e.enableDebug) !== null && o !== void 0 ? o : !1, s;
  }
};
function _c() {
  return { configResults: [], debugTrace: void 0 };
}
const Ef = {
  encode(e, n = new I()) {
    for (const t of e.configResults)
      J.encode(t, n.uint32(10).fork()).join();
    return e.debugTrace !== void 0 && Jt.encode(e.debugTrace, n.uint32(18).fork()).join(), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = _c();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.configResults.push(J.decode(t, t.uint32()));
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.debugTrace = Jt.decode(t, t.uint32());
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Ef.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = _c();
    return t.configResults = ((n = e.configResults) === null || n === void 0 ? void 0 : n.map((a) => J.fromPartial(a))) || [], t.debugTrace = e.debugTrace !== void 0 && e.debugTrace !== null ? Jt.fromPartial(e.debugTrace) : void 0, t;
  }
};
function Ac() {
  return { targetingParameters: void 0, overrides: [] };
}
const ja = {
  encode(e, n = new I()) {
    e.targetingParameters !== void 0 && Bn.encode(e.targetingParameters, n.uint32(10).fork()).join();
    for (const t of e.overrides)
      J.encode(t, n.uint32(18).fork()).join();
    return n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Ac();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.targetingParameters = Bn.decode(t, t.uint32());
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.overrides.push(J.decode(t, t.uint32()));
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return ja.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = Ac();
    return t.targetingParameters = e.targetingParameters !== void 0 && e.targetingParameters !== null ? Bn.fromPartial(e.targetingParameters) : void 0, t.overrides = ((n = e.overrides) === null || n === void 0 ? void 0 : n.map((a) => J.fromPartial(a))) || [], t;
  }
};
function Nc() {
  return { targetingResponse: void 0 };
}
const Sf = {
  encode(e, n = new I()) {
    return e.targetingResponse !== void 0 && it.encode(e.targetingResponse, n.uint32(10).fork()).join(), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Nc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.targetingResponse = it.decode(t, t.uint32());
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Sf.fromPartial(e ?? {});
  },
  fromPartial(e) {
    const n = Nc();
    return n.targetingResponse = e.targetingResponse !== void 0 && e.targetingResponse !== null ? it.fromPartial(e.targetingResponse) : void 0, n;
  }
};
function Oc() {
  return { configSetToken: "", userId: "", ttlSeconds: 0 };
}
const xa = {
  encode(e, n = new I()) {
    return e.configSetToken !== "" && n.uint32(10).string(e.configSetToken), e.userId !== "" && n.uint32(18).string(e.userId), e.ttlSeconds !== 0 && n.uint32(24).int32(e.ttlSeconds), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Oc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.configSetToken = t.string();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.userId = t.string();
          continue;
        }
        case 3: {
          if (i !== 24)
            break;
          r.ttlSeconds = t.int32();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return xa.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a;
    const r = Oc();
    return r.configSetToken = (n = e.configSetToken) !== null && n !== void 0 ? n : "", r.userId = (t = e.userId) !== null && t !== void 0 ? t : "", r.ttlSeconds = (a = e.ttlSeconds) !== null && a !== void 0 ? a : 0, r;
  }
};
function Rc() {
  return { debug: "" };
}
const If = {
  encode(e, n = new I()) {
    return e.debug !== "" && n.uint32(10).string(e.debug), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Rc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.debug = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return If.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = Rc();
    return t.debug = (n = e.debug) !== null && n !== void 0 ? n : "", t;
  }
};
function kc() {
  return { configSetToken: "", userId: "" };
}
const eo = {
  encode(e, n = new I()) {
    return e.configSetToken !== "" && n.uint32(10).string(e.configSetToken), e.userId !== "" && n.uint32(18).string(e.userId), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = kc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.configSetToken = t.string();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.userId = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return eo.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = kc();
    return a.configSetToken = (n = e.configSetToken) !== null && n !== void 0 ? n : "", a.userId = (t = e.userId) !== null && t !== void 0 ? t : "", a;
  }
};
function Tc() {
  return { debug: "" };
}
const _f = {
  encode(e, n = new I()) {
    return e.debug !== "" && n.uint32(10).string(e.debug), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Tc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.debug = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return _f.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = Tc();
    return t.debug = (n = e.debug) !== null && n !== void 0 ? n : "", t;
  }
};
function gc() {
  return { userId: "", targetingProperties: void 0, ttlSeconds: 0 };
}
const no = {
  encode(e, n = new I()) {
    return e.userId !== "" && n.uint32(10).string(e.userId), e.targetingProperties !== void 0 && Ln.encode(e.targetingProperties, n.uint32(18).fork()).join(), e.ttlSeconds !== 0 && n.uint32(24).int32(e.ttlSeconds), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = gc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.userId = t.string();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.targetingProperties = Ln.decode(t, t.uint32());
          continue;
        }
        case 3: {
          if (i !== 24)
            break;
          r.ttlSeconds = t.int32();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return no.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = gc();
    return a.userId = (n = e.userId) !== null && n !== void 0 ? n : "", a.targetingProperties = e.targetingProperties !== void 0 && e.targetingProperties !== null ? Ln.fromPartial(e.targetingProperties) : void 0, a.ttlSeconds = (t = e.ttlSeconds) !== null && t !== void 0 ? t : 0, a;
  }
};
function bc() {
  return { message: "" };
}
const Af = {
  encode(e, n = new I()) {
    return e.message !== "" && n.uint32(10).string(e.message), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = bc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.message = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Af.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = bc();
    return t.message = (n = e.message) !== null && n !== void 0 ? n : "", t;
  }
};
function Pc() {
  return { userId: "" };
}
const to = {
  encode(e, n = new I()) {
    return e.userId !== "" && n.uint32(10).string(e.userId), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Pc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.userId = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return to.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = Pc();
    return t.userId = (n = e.userId) !== null && n !== void 0 ? n : "", t;
  }
};
function Lc() {
  return { message: "" };
}
const Nf = {
  encode(e, n = new I()) {
    return e.message !== "" && n.uint32(10).string(e.message), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Lc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.message = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Nf.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = Lc();
    return t.message = (n = e.message) !== null && n !== void 0 ? n : "", t;
  }
};
function Cc() {
  return { userId: "" };
}
const io = {
  encode(e, n = new I()) {
    return e.userId !== "" && n.uint32(10).string(e.userId), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Cc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.userId = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return io.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = Cc();
    return t.userId = (n = e.userId) !== null && n !== void 0 ? n : "", t;
  }
};
function wc() {
  return { targetingProperties: void 0 };
}
const Of = {
  encode(e, n = new I()) {
    return e.targetingProperties !== void 0 && Ln.encode(e.targetingProperties, n.uint32(10).fork()).join(), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = wc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.targetingProperties = Ln.decode(t, t.uint32());
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Of.fromPartial(e ?? {});
  },
  fromPartial(e) {
    const n = wc();
    return n.targetingProperties = e.targetingProperties !== void 0 && e.targetingProperties !== null ? Ln.fromPartial(e.targetingProperties) : void 0, n;
  }
};
function Dc() {
  return { configName: "", namespace: 0 };
}
const Pi = {
  encode(e, n = new I()) {
    return e.configName !== "" && n.uint32(10).string(e.configName), e.namespace !== 0 && n.uint32(16).int32(e.namespace), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Dc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.configName = t.string();
          continue;
        }
        case 2: {
          if (i !== 16)
            break;
          r.namespace = t.int32();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Pi.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = Dc();
    return a.configName = (n = e.configName) !== null && n !== void 0 ? n : "", a.namespace = (t = e.namespace) !== null && t !== void 0 ? t : 0, a;
  }
};
function yc() {
  return { token: "", configNames: [], namespaces: [], disableExposureLogging: !1, getAllConfigs: !1 };
}
const ro = {
  encode(e, n = new I()) {
    e.token !== "" && n.uint32(10).string(e.token);
    for (const t of e.configNames)
      Pi.encode(t, n.uint32(18).fork()).join();
    n.uint32(26).fork();
    for (const t of e.namespaces)
      n.int32(t);
    return n.join(), e.disableExposureLogging !== !1 && n.uint32(32).bool(e.disableExposureLogging), e.getAllConfigs !== !1 && n.uint32(40).bool(e.getAllConfigs), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = yc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.token = t.string();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.configNames.push(Pi.decode(t, t.uint32()));
          continue;
        }
        case 3: {
          if (i === 24) {
            r.namespaces.push(t.int32());
            continue;
          }
          if (i === 26) {
            const o = t.uint32() + t.pos;
            for (; t.pos < o; )
              r.namespaces.push(t.int32());
            continue;
          }
          break;
        }
        case 4: {
          if (i !== 32)
            break;
          r.disableExposureLogging = t.bool();
          continue;
        }
        case 5: {
          if (i !== 40)
            break;
          r.getAllConfigs = t.bool();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return ro.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r, i;
    const o = yc();
    return o.token = (n = e.token) !== null && n !== void 0 ? n : "", o.configNames = ((t = e.configNames) === null || t === void 0 ? void 0 : t.map((s) => Pi.fromPartial(s))) || [], o.namespaces = ((a = e.namespaces) === null || a === void 0 ? void 0 : a.map((s) => s)) || [], o.disableExposureLogging = (r = e.disableExposureLogging) !== null && r !== void 0 ? r : !1, o.getAllConfigs = (i = e.getAllConfigs) !== null && i !== void 0 ? i : !1, o;
  }
};
function Uc() {
  return { configResults: [] };
}
const Rf = {
  encode(e, n = new I()) {
    for (const t of e.configResults)
      J.encode(t, n.uint32(10).fork()).join();
    return n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Uc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.configResults.push(J.decode(t, t.uint32()));
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Rf.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = Uc();
    return t.configResults = ((n = e.configResults) === null || n === void 0 ? void 0 : n.map((a) => J.fromPartial(a))) || [], t;
  }
};
function Mc() {
  return {};
}
const ao = {
  encode(e, n = new I()) {
    return n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Mc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return ao.fromPartial(e ?? {});
  },
  fromPartial(e) {
    return Mc();
  }
};
function Vc() {
  return { serializedBitmap: new Uint8Array(0) };
}
const kf = {
  encode(e, n = new I()) {
    return e.serializedBitmap.length !== 0 && n.uint32(10).bytes(e.serializedBitmap), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Vc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.serializedBitmap = t.bytes();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return kf.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = Vc();
    return t.serializedBitmap = (n = e.serializedBitmap) !== null && n !== void 0 ? n : new Uint8Array(0), t;
  }
};
function Gc() {
  return { sequenceIds: [] };
}
const oo = {
  encode(e, n = new I()) {
    n.uint32(10).fork();
    for (const t of e.sequenceIds)
      n.int32(t);
    return n.join(), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Gc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i === 8) {
            r.sequenceIds.push(t.int32());
            continue;
          }
          if (i === 10) {
            const o = t.uint32() + t.pos;
            for (; t.pos < o; )
              r.sequenceIds.push(t.int32());
            continue;
          }
          break;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return oo.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = Gc();
    return t.sequenceIds = ((n = e.sequenceIds) === null || n === void 0 ? void 0 : n.map((a) => a)) || [], t;
  }
};
function Bc() {
  return { sequenceId: 0, configResult: void 0 };
}
const Li = {
  encode(e, n = new I()) {
    return e.sequenceId !== 0 && n.uint32(8).int32(e.sequenceId), e.configResult !== void 0 && J.encode(e.configResult, n.uint32(18).fork()).join(), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Bc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 8)
            break;
          r.sequenceId = t.int32();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.configResult = J.decode(t, t.uint32());
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Li.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = Bc();
    return t.sequenceId = (n = e.sequenceId) !== null && n !== void 0 ? n : 0, t.configResult = e.configResult !== void 0 && e.configResult !== null ? J.fromPartial(e.configResult) : void 0, t;
  }
};
function Fc() {
  return { configResultWithSequenceIds: [] };
}
const Tf = {
  encode(e, n = new I()) {
    for (const t of e.configResultWithSequenceIds)
      Li.encode(t, n.uint32(10).fork()).join();
    return n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Fc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.configResultWithSequenceIds.push(Li.decode(t, t.uint32()));
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Tf.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = Fc();
    return t.configResultWithSequenceIds = ((n = e.configResultWithSequenceIds) === null || n === void 0 ? void 0 : n.map((a) => Li.fromPartial(a))) || [], t;
  }
};
function Hc() {
  return { token: "" };
}
const so = {
  encode(e, n = new I()) {
    return e.token !== "" && n.uint32(10).string(e.token), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Hc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.token = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return so.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = Hc();
    return t.token = (n = e.token) !== null && n !== void 0 ? n : "", t;
  }
};
function Kc() {
  return { idBitmap: new Uint8Array(0) };
}
const gf = {
  encode(e, n = new I()) {
    return e.idBitmap.length !== 0 && n.uint32(10).bytes(e.idBitmap), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Kc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.idBitmap = t.bytes();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return gf.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = Kc();
    return t.idBitmap = (n = e.idBitmap) !== null && n !== void 0 ? n : new Uint8Array(0), t;
  }
};
function Yc() {
  return { namespaces: [], edgeConfigClientVersion: "" };
}
const uo = {
  encode(e, n = new I()) {
    n.uint32(10).fork();
    for (const t of e.namespaces)
      n.int32(t);
    return n.join(), e.edgeConfigClientVersion !== "" && n.uint32(18).string(e.edgeConfigClientVersion), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Yc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i === 8) {
            r.namespaces.push(t.int32());
            continue;
          }
          if (i === 10) {
            const o = t.uint32() + t.pos;
            for (; t.pos < o; )
              r.namespaces.push(t.int32());
            continue;
          }
          break;
        }
        case 2: {
          if (i !== 18)
            break;
          r.edgeConfigClientVersion = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return uo.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = Yc();
    return a.namespaces = ((n = e.namespaces) === null || n === void 0 ? void 0 : n.map((r) => r)) || [], a.edgeConfigClientVersion = (t = e.edgeConfigClientVersion) !== null && t !== void 0 ? t : "", a;
  }
};
function Wc() {
  return { configResults: [] };
}
const bf = {
  encode(e, n = new I()) {
    for (const t of e.configResults)
      J.encode(t, n.uint32(10).fork()).join();
    return n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Wc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.configResults.push(J.decode(t, t.uint32()));
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return bf.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = Wc();
    return t.configResults = ((n = e.configResults) === null || n === void 0 ? void 0 : n.map((a) => J.fromPartial(a))) || [], t;
  }
};
function zc() {
  return { ruids: [], configNames: [], maxSnapshots: 0 };
}
const co = {
  encode(e, n = new I()) {
    for (const t of e.ruids)
      Be.encode(t, n.uint32(10).fork()).join();
    for (const t of e.configNames)
      n.uint32(18).string(t);
    return e.maxSnapshots !== 0 && n.uint32(24).int32(e.maxSnapshots), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = zc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.ruids.push(Be.decode(t, t.uint32()));
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.configNames.push(t.string());
          continue;
        }
        case 3: {
          if (i !== 24)
            break;
          r.maxSnapshots = t.int32();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return co.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a;
    const r = zc();
    return r.ruids = ((n = e.ruids) === null || n === void 0 ? void 0 : n.map((i) => Be.fromPartial(i))) || [], r.configNames = ((t = e.configNames) === null || t === void 0 ? void 0 : t.map((i) => i)) || [], r.maxSnapshots = (a = e.maxSnapshots) !== null && a !== void 0 ? a : 0, r;
  }
};
function qc() {
  return {};
}
const Pf = {
  encode(e, n = new I()) {
    return n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = qc();
    for (; t.pos < a; ) {
      const i = t.uint32();
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Pf.fromPartial(e ?? {});
  },
  fromPartial(e) {
    return qc();
  }
};
class Xp {
  constructor(n) {
    this.rpc = n, this.targetingQuery = this.targetingQuery.bind(this), this.getAbConfigValues = this.getAbConfigValues.bind(this), this.getConfigValuesByToken = this.getConfigValuesByToken.bind(this), this.getConfigResultsBySequenceIds = this.getConfigResultsBySequenceIds.bind(this), this.getCachedConfigResultSequenceIds = this.getCachedConfigResultSequenceIds.bind(this), this.getBitmapByToken = this.getBitmapByToken.bind(this), this.generateConfigSet = this.generateConfigSet.bind(this), this.pinConfigSet = this.pinConfigSet.bind(this), this.unpinConfigSet = this.unpinConfigSet.bind(this), this.getUnevaluatedConfigResultsWithAbTargeting = this.getUnevaluatedConfigResultsWithAbTargeting.bind(this), this.addRuidsForDebugging = this.addRuidsForDebugging.bind(this), this.pinTargetingProperties = this.pinTargetingProperties.bind(this), this.unpinTargetingProperties = this.unpinTargetingProperties.bind(this), this.getPinnedTargetingProperties = this.getPinnedTargetingProperties.bind(this);
  }
  targetingQuery(n, t) {
    return this.rpc.unary(Qp, Bn.fromPartial(n), t);
  }
  getAbConfigValues(n, t) {
    return this.rpc.unary(jp, Qa.fromPartial(n), t);
  }
  getConfigValuesByToken(n, t) {
    return this.rpc.unary(xp, ro.fromPartial(n), t);
  }
  getConfigResultsBySequenceIds(n, t) {
    return this.rpc.unary(e0, oo.fromPartial(n), t);
  }
  getCachedConfigResultSequenceIds(n, t) {
    return this.rpc.unary(n0, ao.fromPartial(n), t);
  }
  getBitmapByToken(n, t) {
    return this.rpc.unary(t0, so.fromPartial(n), t);
  }
  generateConfigSet(n, t) {
    return this.rpc.unary(i0, ja.fromPartial(n), t);
  }
  pinConfigSet(n, t) {
    return this.rpc.unary(r0, xa.fromPartial(n), t);
  }
  unpinConfigSet(n, t) {
    return this.rpc.unary(a0, eo.fromPartial(n), t);
  }
  getUnevaluatedConfigResultsWithAbTargeting(n, t) {
    return this.rpc.unary(o0, uo.fromPartial(n), t);
  }
  addRuidsForDebugging(n, t) {
    return this.rpc.unary(s0, co.fromPartial(n), t);
  }
  pinTargetingProperties(n, t) {
    return this.rpc.unary(u0, no.fromPartial(n), t);
  }
  unpinTargetingProperties(n, t) {
    return this.rpc.unary(c0, to.fromPartial(n), t);
  }
  getPinnedTargetingProperties(n, t) {
    return this.rpc.unary(l0, io.fromPartial(n), t);
  }
}
const me = { serviceName: "snapchat.cdp.cof.CircumstancesService" }, Qp = {
  methodName: "targetingQuery",
  service: me,
  requestStream: !1,
  responseStream: !1,
  requestType: {
    serializeBinary() {
      return Bn.encode(this).finish();
    }
  },
  responseType: {
    deserializeBinary(e) {
      const n = it.decode(e);
      return Object.assign(Object.assign({}, n), { toObject() {
        return n;
      } });
    }
  }
}, jp = {
  methodName: "getAbConfigValues",
  service: me,
  requestStream: !1,
  responseStream: !1,
  requestType: {
    serializeBinary() {
      return Qa.encode(this).finish();
    }
  },
  responseType: {
    deserializeBinary(e) {
      const n = Ef.decode(e);
      return Object.assign(Object.assign({}, n), { toObject() {
        return n;
      } });
    }
  }
}, xp = {
  methodName: "getConfigValuesByToken",
  service: me,
  requestStream: !1,
  responseStream: !1,
  requestType: {
    serializeBinary() {
      return ro.encode(this).finish();
    }
  },
  responseType: {
    deserializeBinary(e) {
      const n = Rf.decode(e);
      return Object.assign(Object.assign({}, n), { toObject() {
        return n;
      } });
    }
  }
}, e0 = {
  methodName: "getConfigResultsBySequenceIds",
  service: me,
  requestStream: !1,
  responseStream: !1,
  requestType: {
    serializeBinary() {
      return oo.encode(this).finish();
    }
  },
  responseType: {
    deserializeBinary(e) {
      const n = Tf.decode(e);
      return Object.assign(Object.assign({}, n), { toObject() {
        return n;
      } });
    }
  }
}, n0 = {
  methodName: "getCachedConfigResultSequenceIds",
  service: me,
  requestStream: !1,
  responseStream: !1,
  requestType: {
    serializeBinary() {
      return ao.encode(this).finish();
    }
  },
  responseType: {
    deserializeBinary(e) {
      const n = kf.decode(e);
      return Object.assign(Object.assign({}, n), { toObject() {
        return n;
      } });
    }
  }
}, t0 = {
  methodName: "getBitmapByToken",
  service: me,
  requestStream: !1,
  responseStream: !1,
  requestType: {
    serializeBinary() {
      return so.encode(this).finish();
    }
  },
  responseType: {
    deserializeBinary(e) {
      const n = gf.decode(e);
      return Object.assign(Object.assign({}, n), { toObject() {
        return n;
      } });
    }
  }
}, i0 = {
  methodName: "generateConfigSet",
  service: me,
  requestStream: !1,
  responseStream: !1,
  requestType: {
    serializeBinary() {
      return ja.encode(this).finish();
    }
  },
  responseType: {
    deserializeBinary(e) {
      const n = Sf.decode(e);
      return Object.assign(Object.assign({}, n), { toObject() {
        return n;
      } });
    }
  }
}, r0 = {
  methodName: "pinConfigSet",
  service: me,
  requestStream: !1,
  responseStream: !1,
  requestType: {
    serializeBinary() {
      return xa.encode(this).finish();
    }
  },
  responseType: {
    deserializeBinary(e) {
      const n = If.decode(e);
      return Object.assign(Object.assign({}, n), { toObject() {
        return n;
      } });
    }
  }
}, a0 = {
  methodName: "unpinConfigSet",
  service: me,
  requestStream: !1,
  responseStream: !1,
  requestType: {
    serializeBinary() {
      return eo.encode(this).finish();
    }
  },
  responseType: {
    deserializeBinary(e) {
      const n = _f.decode(e);
      return Object.assign(Object.assign({}, n), { toObject() {
        return n;
      } });
    }
  }
}, o0 = {
  methodName: "getUnevaluatedConfigResultsWithAbTargeting",
  service: me,
  requestStream: !1,
  responseStream: !1,
  requestType: {
    serializeBinary() {
      return uo.encode(this).finish();
    }
  },
  responseType: {
    deserializeBinary(e) {
      const n = bf.decode(e);
      return Object.assign(Object.assign({}, n), { toObject() {
        return n;
      } });
    }
  }
}, s0 = {
  methodName: "addRuidsForDebugging",
  service: me,
  requestStream: !1,
  responseStream: !1,
  requestType: {
    serializeBinary() {
      return co.encode(this).finish();
    }
  },
  responseType: {
    deserializeBinary(e) {
      const n = Pf.decode(e);
      return Object.assign(Object.assign({}, n), { toObject() {
        return n;
      } });
    }
  }
}, u0 = {
  methodName: "pinTargetingProperties",
  service: me,
  requestStream: !1,
  responseStream: !1,
  requestType: {
    serializeBinary() {
      return no.encode(this).finish();
    }
  },
  responseType: {
    deserializeBinary(e) {
      const n = Af.decode(e);
      return Object.assign(Object.assign({}, n), { toObject() {
        return n;
      } });
    }
  }
}, c0 = {
  methodName: "unpinTargetingProperties",
  service: me,
  requestStream: !1,
  responseStream: !1,
  requestType: {
    serializeBinary() {
      return to.encode(this).finish();
    }
  },
  responseType: {
    deserializeBinary(e) {
      const n = Nf.decode(e);
      return Object.assign(Object.assign({}, n), { toObject() {
        return n;
      } });
    }
  }
}, l0 = {
  methodName: "getPinnedTargetingProperties",
  service: me,
  requestStream: !1,
  responseStream: !1,
  requestType: {
    serializeBinary() {
      return io.encode(this).finish();
    }
  },
  responseType: {
    deserializeBinary(e) {
      const n = Of.decode(e);
      return Object.assign(Object.assign({}, n), { toObject() {
        return n;
      } });
    }
  }
};
class d0 {
  constructor(n, t) {
    this.host = n, this.options = t;
  }
  unary(n, t, a) {
    var r;
    const i = Object.assign(Object.assign({}, t), n.requestType), o = a && this.options.metadata ? new vf.BrowserHeaders(Object.assign(Object.assign({}, (r = this.options) === null || r === void 0 ? void 0 : r.metadata.headersMap), a == null ? void 0 : a.headersMap)) : a ?? this.options.metadata;
    return new Promise((s, u) => {
      var c;
      ct.grpc.unary(n, Object.assign(Object.assign({ request: i, host: this.host, metadata: o ?? {} }, this.options.transport !== void 0 ? { transport: this.options.transport } : {}), { debug: (c = this.options.debug) !== null && c !== void 0 ? c : !1, onEnd: function(d) {
        if (d.status === ct.grpc.Code.OK)
          s(d.message.toObject());
        else {
          const m = new f0(d.statusMessage, d.status, d.trailers);
          u(m);
        }
      } }));
    });
  }
}
class f0 extends globalThis.Error {
  constructor(n, t, a) {
    super(n), this.code = t, this.metadata = a;
  }
}
const Ci = U("responseCachingHandler"), m0 = (e) => $h(`Response for key ${e} not found in cache.`), h0 = (e, n) => new Error(`Network request and cache lookup for key ${e} both failed.`, { cause: n }), p0 = (e) => (n, t, a) => O(void 0, void 0, void 0, function* () {
  var r, i;
  try {
    const o = yield t.retrieve(n);
    if (!o)
      throw m0(n);
    return a({ isSideEffect: !0 }).then((s) => t.store(n, s)).catch((s) => {
      Ci.warn(`staleWhileRevalidateStrategy failed to retrieve and store key ${n}.`, s);
    }), (r = e == null ? void 0 : e.onHit) === null || r === void 0 || r.call(e), o;
  } catch (o) {
    (i = e == null ? void 0 : e.onMiss) === null || i === void 0 || i.call(e);
    try {
      const s = yield a();
      return t.store(n, s).catch((u) => {
        Ci.warn(`staleWhileRevalidateStrategy failed to store key ${n}.`, u);
      }), Ci.debug(`staleWhileRevalidateStrategy successfully fell back to network for key ${n} after cache error.`, o), s;
    } catch (s) {
      const u = un(s);
      throw u.cause = o, h0(n, u);
    }
  }
}), v0 = (e, n, t) => (a) => (r, i) => O(void 0, void 0, void 0, function* () {
  const o = (u = {}) => {
    const c = Object.assign(Object.assign({}, i), u);
    return a(r, c);
  };
  let s;
  try {
    s = n(r, i);
  } catch (u) {
    return Ci.warn("Cache lookup failed because the cache key could not be resolved.", u), o();
  }
  return t(s, e, o);
}), E0 = (e) => typeof e == "string" || typeof e == "number";
function Vr(e) {
  const n = new Promise((t, a) => {
    e.onsuccess = () => t(e.result), e.onerror = () => a(e.error);
  });
  return n.request = e, n;
}
function ta(e) {
  return new Promise((n, t) => {
    e.onsuccess = () => {
      const a = e.result;
      n(a ? {
        cursor: a,
        continue: () => (a.continue(), ta(e))
      } : { cursor: null, continue: () => Promise.reject() });
    }, e.onerror = () => t(e.error);
  });
}
class Zn {
  constructor(n) {
    var t;
    this.databaseName = `Snap.CameraKit.${n.databaseName}`, this.databaseVersion = n.databaseVersion, this.objectStore = (t = n.objectStore) !== null && t !== void 0 ? t : n.databaseName, this.db = this.openDatabase(indexedDB.open(this.databaseName, this.databaseVersion)), this.size = 0;
  }
  retrieve(n) {
    return this.simpleTransaction("readonly", (t) => t.get(n));
  }
  retrieveAll() {
    return O(this, void 0, void 0, function* () {
      const n = [], { store: t, done: a } = yield this.transaction("readonly");
      let r = yield ta(t.openCursor());
      for (; r.cursor; )
        n.push([r.cursor.primaryKey, r.cursor.value]), r = yield r.continue();
      return yield a, n;
    });
  }
  remove(n) {
    return O(this, void 0, void 0, function* () {
      yield this.simpleTransaction("readwrite", (t) => t.delete(n)), this.size--;
    });
  }
  removeAll() {
    return O(this, void 0, void 0, function* () {
      const n = [], { store: t, done: a } = yield this.transaction("readwrite");
      let r = yield ta(t.openCursor());
      const i = [];
      for (; r.cursor; )
        n.push(r.cursor.value), i.push(Vr(t.delete(r.cursor.key))), r = yield r.continue();
      return yield Promise.all(i.concat(a)), this.size = 0, n;
    });
  }
  store(n, t) {
    return O(this, void 0, void 0, function* () {
      const [a, r] = t === void 0 ? [void 0, n] : [n, t];
      if (!E0(a) && typeof a < "u")
        throw new TypeError(`IndexedDBPersistence failed to store a value. Invalid key type: ${typeof a}`);
      const i = yield this.simpleTransaction("readwrite", (o) => o.put(r, a));
      return this.size++, i;
    });
  }
  openDatabase(n) {
    return O(this, void 0, void 0, function* () {
      const t = Vr(n);
      t.request.onupgradeneeded = () => {
        try {
          t.request.result.createObjectStore(this.objectStore, { autoIncrement: !0 });
        } catch (r) {
          if (r instanceof DOMException && r.name === "ConstraintError")
            return;
          throw r;
        }
      };
      const a = yield t;
      return a.onclose = () => {
        this.db = this.openDatabase(indexedDB.open(this.databaseName, this.databaseVersion));
      }, a;
    });
  }
  simpleTransaction(n, t) {
    return O(this, void 0, void 0, function* () {
      const { store: a, done: r } = yield this.transaction(n), [i] = yield Promise.all([Vr(t(a)), r]);
      return i;
    });
  }
  transaction(n) {
    return O(this, void 0, void 0, function* () {
      const a = (yield this.db).transaction(this.objectStore, n), r = a.objectStore(this.objectStore), i = new Promise((o, s) => {
        a.oncomplete = () => o(), a.onerror = () => s(a.error), a.onabort = () => s(new DOMException("The transaction was aborted", "AbortError"));
      });
      return { tx: a, store: r, done: i };
    });
  }
}
const Gr = U("ExpiringPersistence");
class dr {
  constructor(n, t) {
    this.expiration = n, this.persistence = t, this.removeExpired().catch((a) => {
      Gr.warn("Failed to cleanup expired entries on startup.", a);
    });
  }
  get size() {
    return this.persistence.size;
  }
  retrieve(n) {
    var t;
    return O(this, void 0, void 0, function* () {
      const [a, r] = (t = yield this.persistence.retrieve(n)) !== null && t !== void 0 ? t : [];
      if (!(r === void 0 || a === void 0)) {
        if (Date.now() > a) {
          yield this.persistence.remove(n).catch((i) => {
            Gr.warn(`Key ${n} is expired, but removing it from persistence failed.`, i);
          });
          return;
        }
        return r;
      }
    });
  }
  retrieveAll() {
    return O(this, void 0, void 0, function* () {
      const n = Date.now();
      return (yield this.persistence.retrieveAll()).filter(([, [t]]) => t >= n).map(([, t]) => t);
    });
  }
  remove(n) {
    return this.persistence.remove(n);
  }
  removeAll() {
    return O(this, void 0, void 0, function* () {
      return (yield this.persistence.removeAll()).map(([, t]) => t);
    });
  }
  removeExpired() {
    return O(this, void 0, void 0, function* () {
      for (const [n, [t]] of yield this.persistence.retrieveAll())
        Date.now() >= t && (yield this.persistence.remove(n).catch((a) => Gr.warn(`Failed to remove expired key ${n}.`, a)));
    });
  }
  store(n, t) {
    const [a, r] = t === void 0 ? [void 0, n] : [n, t], i = Date.now() + this.expiration(r) * 1e3;
    return a === void 0 ? this.persistence.store([i, r]) : this.persistence.store(a, [i, r]);
  }
}
class S0 {
  constructor() {
    this.onHiddenHandlers = /* @__PURE__ */ new Set(), this.onVisibleHandlers = /* @__PURE__ */ new Set(), this.previousVisibilityState = document.visibilityState, this.visibilityTransition = !1, this.onVisibilityChange = this.onVisibilityChange.bind(this), this.isDuringVisibilityTransition = this.isDuringVisibilityTransition.bind(this), this.onPageHidden = this.onPageHidden.bind(this), this.onPageVisible = this.onPageVisible.bind(this), this.destroy = this.destroy.bind(this), document.addEventListener("visibilitychange", this.onVisibilityChange);
  }
  isDuringVisibilityTransition(n) {
    return n === this.visibilityTransition;
  }
  onPageHidden(n) {
    return this.onHiddenHandlers.add(n), () => this.onHiddenHandlers.delete(n);
  }
  onPageVisible(n) {
    return this.onVisibleHandlers.add(n), () => this.onVisibleHandlers.delete(n);
  }
  destroy() {
    document.removeEventListener("visibilitychange", this.onVisibilityChange), this.onHiddenHandlers.clear(), this.onVisibleHandlers.clear();
  }
  onVisibilityChange() {
    const n = this.previousVisibilityState === "visible" && document.visibilityState === "hidden" ? this.onHiddenHandlers : this.previousVisibilityState === "hidden" && document.visibilityState === "visible" ? this.onVisibleHandlers : /* @__PURE__ */ new Set();
    this.visibilityTransition = document.visibilityState;
    for (const t of n)
      try {
        t();
      } catch (a) {
        typeof window < "u" && window.dispatchEvent(new CustomEvent("error", { detail: a }));
      }
    this.previousVisibilityState = this.visibilityTransition, this.visibilityTransition = !1;
  }
}
const fr = R("pageVisibility", () => new S0()), $c = {
  encode(e, n = new I()) {
    e.serverUploadTs !== 0 && n.uint32(9).double(e.serverUploadTs);
    for (const t of e.serverAllUpdateEvents)
      Zc.encode(t, n.uint32(18).fork()).join();
    e.maxSequenceIdOnInstance !== "0" && n.uint32(24).uint64(e.maxSequenceIdOnInstance);
    for (const t of e.serverEvents)
      ia.encode(t, n.uint32(34).fork()).join();
    return n;
  },
  decode() {
    throw new Error("Not implemented.");
  },
  fromJSON() {
    throw new Error("Not implemented.");
  },
  toJSON() {
    throw new Error("Not implemented.");
  },
  create() {
    throw new Error("Not implemented.");
  },
  fromPartial(e) {
    var n, t, a, r;
    const i = I0();
    return i.serverUploadTs = (n = e.serverUploadTs) !== null && n !== void 0 ? n : 0, i.serverAllUpdateEvents = ((t = e.serverAllUpdateEvents) === null || t === void 0 ? void 0 : t.map((o) => Zc.fromPartial(o))) || [], i.maxSequenceIdOnInstance = (a = e.maxSequenceIdOnInstance) !== null && a !== void 0 ? a : "0", i.serverEvents = ((r = e.serverEvents) === null || r === void 0 ? void 0 : r.map((o) => ia.fromPartial(o))) || [], i;
  }
};
function I0() {
  return { serverUploadTs: 0, serverAllUpdateEvents: [], maxSequenceIdOnInstance: "0", serverEvents: [] };
}
const Zc = {
  encode(e, n = new I()) {
    return n;
  },
  decode() {
    throw new Error("Not implemented.");
  },
  fromJSON() {
    throw new Error("Not implemented.");
  },
  toJSON() {
    throw new Error("Not implemented.");
  },
  create() {
    throw new Error("Not implemented.");
  },
  fromPartial(e) {
    return _0();
  }
};
function _0() {
  return {};
}
const ia = {
  encode(e, n = new I()) {
    return e.eventName !== "" && n.uint32(10).string(e.eventName), e.serverTs !== 0 && n.uint32(25).double(e.serverTs), e.userId !== "" && n.uint32(34).string(e.userId), e.userAgent !== "" && n.uint32(42).string(e.userAgent), e.country !== "" && n.uint32(50).string(e.country), e.city !== "" && n.uint32(58).string(e.city), e.region !== "" && n.uint32(66).string(e.region), e.eventId !== "" && n.uint32(74).string(e.eventId), e.instanceId !== "" && n.uint32(82).string(e.instanceId), e.sequenceId !== "0" && n.uint32(88).uint64(e.sequenceId), e.osType !== "" && n.uint32(98).string(e.osType), e.osVersion !== "" && n.uint32(106).string(e.osVersion), e.appVersion !== "" && n.uint32(114).string(e.appVersion), e.appBuild !== "" && n.uint32(122).string(e.appBuild), e.serverUploadTs !== 0 && n.uint32(809).double(e.serverUploadTs), e.eventTime !== 0 && n.uint32(817).double(e.eventTime), e.serverReceiptTime !== 0 && n.uint32(825).double(e.serverReceiptTime), e.maxSequenceIdOnInstance !== "0" && n.uint32(832).uint64(e.maxSequenceIdOnInstance), e.userGuid !== "" && n.uint32(850).string(e.userGuid), e.collection !== 0 && n.uint32(872).int32(e.collection), e.serviceId !== "" && n.uint32(890).string(e.serviceId), e.appType !== 0 && n.uint32(912).int32(e.appType), e.spectrumInstanceId !== "" && n.uint32(930).string(e.spectrumInstanceId), e.spectrumSequenceId !== "0" && n.uint32(944).uint64(e.spectrumSequenceId), e.eventData !== void 0 && Jc.encode(e.eventData, n.uint32(802).fork()).join(), n;
  },
  decode() {
    throw new Error("Not implemented.");
  },
  fromJSON() {
    throw new Error("Not implemented.");
  },
  toJSON() {
    throw new Error("Not implemented.");
  },
  create() {
    throw new Error("Not implemented.");
  },
  fromPartial(e) {
    var n, t, a, r, i, o, s, u, c, d, m, l, f, E, v, p, S, _, A, N, k, C, M, q;
    const w = A0();
    return w.eventName = (n = e.eventName) !== null && n !== void 0 ? n : "", w.serverTs = (t = e.serverTs) !== null && t !== void 0 ? t : 0, w.userId = (a = e.userId) !== null && a !== void 0 ? a : "", w.userAgent = (r = e.userAgent) !== null && r !== void 0 ? r : "", w.country = (i = e.country) !== null && i !== void 0 ? i : "", w.city = (o = e.city) !== null && o !== void 0 ? o : "", w.region = (s = e.region) !== null && s !== void 0 ? s : "", w.eventId = (u = e.eventId) !== null && u !== void 0 ? u : "", w.instanceId = (c = e.instanceId) !== null && c !== void 0 ? c : "", w.sequenceId = (d = e.sequenceId) !== null && d !== void 0 ? d : "0", w.osType = (m = e.osType) !== null && m !== void 0 ? m : "", w.osVersion = (l = e.osVersion) !== null && l !== void 0 ? l : "", w.appVersion = (f = e.appVersion) !== null && f !== void 0 ? f : "", w.appBuild = (E = e.appBuild) !== null && E !== void 0 ? E : "", w.serverUploadTs = (v = e.serverUploadTs) !== null && v !== void 0 ? v : 0, w.eventTime = (p = e.eventTime) !== null && p !== void 0 ? p : 0, w.serverReceiptTime = (S = e.serverReceiptTime) !== null && S !== void 0 ? S : 0, w.maxSequenceIdOnInstance = (_ = e.maxSequenceIdOnInstance) !== null && _ !== void 0 ? _ : "0", w.userGuid = (A = e.userGuid) !== null && A !== void 0 ? A : "", w.collection = (N = e.collection) !== null && N !== void 0 ? N : 0, w.serviceId = (k = e.serviceId) !== null && k !== void 0 ? k : "", w.appType = (C = e.appType) !== null && C !== void 0 ? C : 0, w.spectrumInstanceId = (M = e.spectrumInstanceId) !== null && M !== void 0 ? M : "", w.spectrumSequenceId = (q = e.spectrumSequenceId) !== null && q !== void 0 ? q : "0", w.eventData = e.eventData !== void 0 && e.eventData !== null ? Jc.fromPartial(e.eventData) : void 0, w;
  }
};
function A0() {
  return {
    eventName: "",
    serverTs: 0,
    userId: "",
    userAgent: "",
    country: "",
    city: "",
    region: "",
    eventId: "",
    instanceId: "",
    sequenceId: "0",
    osType: "",
    osVersion: "",
    appVersion: "",
    appBuild: "",
    serverUploadTs: 0,
    eventTime: 0,
    serverReceiptTime: 0,
    maxSequenceIdOnInstance: "0",
    userGuid: "",
    collection: 0,
    serviceId: "",
    appType: 0,
    spectrumInstanceId: "",
    spectrumSequenceId: "0",
    eventData: void 0
  };
}
const Jc = {
  encode(e, n = new I()) {
    return e.cameraKitException !== void 0 && ua.encode(e.cameraKitException, n.uint32(1866).fork()).join(), e.cameraKitLensSpin !== void 0 && ra.encode(e.cameraKitLensSpin, n.uint32(1874).fork()).join(), e.cameraKitAssetDownload !== void 0 && sa.encode(e.cameraKitAssetDownload, n.uint32(1882).fork()).join(), e.cameraKitLensContentValidationFailed !== void 0 && la.encode(e.cameraKitLensContentValidationFailed, n.uint32(1922).fork()).join(), e.cameraKitLensDownload !== void 0 && oa.encode(e.cameraKitLensDownload, n.uint32(1930).fork()).join(), e.cameraKitAssetValidationFailed !== void 0 && da.encode(e.cameraKitAssetValidationFailed, n.uint32(1938).fork()).join(), e.cameraKitSession !== void 0 && ca.encode(e.cameraKitSession, n.uint32(2130).fork()).join(), e.cameraKitWebLensSwipe !== void 0 && aa.encode(e.cameraKitWebLensSwipe, n.uint32(3818).fork()).join(), e.cameraKitWebBenchmarkComplete !== void 0 && fa.encode(e.cameraKitWebBenchmarkComplete, n.uint32(3826).fork()).join(), e.cameraKitLegalPrompt !== void 0 && ma.encode(e.cameraKitLegalPrompt, n.uint32(3874).fork()).join(), n;
  },
  decode() {
    throw new Error("Not implemented.");
  },
  fromJSON() {
    throw new Error("Not implemented.");
  },
  toJSON() {
    throw new Error("Not implemented.");
  },
  create() {
    throw new Error("Not implemented.");
  },
  fromPartial(e) {
    const n = N0();
    return n.cameraKitException = e.cameraKitException !== void 0 && e.cameraKitException !== null ? ua.fromPartial(e.cameraKitException) : void 0, n.cameraKitLensSpin = e.cameraKitLensSpin !== void 0 && e.cameraKitLensSpin !== null ? ra.fromPartial(e.cameraKitLensSpin) : void 0, n.cameraKitAssetDownload = e.cameraKitAssetDownload !== void 0 && e.cameraKitAssetDownload !== null ? sa.fromPartial(e.cameraKitAssetDownload) : void 0, n.cameraKitLensContentValidationFailed = e.cameraKitLensContentValidationFailed !== void 0 && e.cameraKitLensContentValidationFailed !== null ? la.fromPartial(e.cameraKitLensContentValidationFailed) : void 0, n.cameraKitLensDownload = e.cameraKitLensDownload !== void 0 && e.cameraKitLensDownload !== null ? oa.fromPartial(e.cameraKitLensDownload) : void 0, n.cameraKitAssetValidationFailed = e.cameraKitAssetValidationFailed !== void 0 && e.cameraKitAssetValidationFailed !== null ? da.fromPartial(e.cameraKitAssetValidationFailed) : void 0, n.cameraKitSession = e.cameraKitSession !== void 0 && e.cameraKitSession !== null ? ca.fromPartial(e.cameraKitSession) : void 0, n.cameraKitWebLensSwipe = e.cameraKitWebLensSwipe !== void 0 && e.cameraKitWebLensSwipe !== null ? aa.fromPartial(e.cameraKitWebLensSwipe) : void 0, n.cameraKitWebBenchmarkComplete = e.cameraKitWebBenchmarkComplete !== void 0 && e.cameraKitWebBenchmarkComplete !== null ? fa.fromPartial(e.cameraKitWebBenchmarkComplete) : void 0, n.cameraKitLegalPrompt = e.cameraKitLegalPrompt !== void 0 && e.cameraKitLegalPrompt !== null ? ma.fromPartial(e.cameraKitLegalPrompt) : void 0, n;
  }
};
function N0() {
  return {
    cameraKitException: void 0,
    cameraKitLensSpin: void 0,
    cameraKitAssetDownload: void 0,
    cameraKitLensContentValidationFailed: void 0,
    cameraKitLensDownload: void 0,
    cameraKitAssetValidationFailed: void 0,
    cameraKitSession: void 0,
    cameraKitWebLensSwipe: void 0,
    cameraKitWebBenchmarkComplete: void 0,
    cameraKitLegalPrompt: void 0
  };
}
var Xc;
(function(e) {
  e[e.IOS_NATIVE = 0] = "IOS_NATIVE", e[e.IOS_WEB_DESKTOP = 1] = "IOS_WEB_DESKTOP", e[e.IOS_WEB_MOBILE = 2] = "IOS_WEB_MOBILE", e[e.ANDROID_NATIVE = 3] = "ANDROID_NATIVE", e[e.ANDROID_WEB_DESKTOP = 4] = "ANDROID_WEB_DESKTOP", e[e.ANDROID_WEB_MOBILE = 5] = "ANDROID_WEB_MOBILE", e[e.OSX_WEB_DESKTOP = 6] = "OSX_WEB_DESKTOP", e[e.OSX_WEB_MOBILE = 7] = "OSX_WEB_MOBILE", e[e.WINDOWS_WEB_DESKTOP = 8] = "WINDOWS_WEB_DESKTOP", e[e.WINDOWS_WEB_MOBILE = 9] = "WINDOWS_WEB_MOBILE", e[e.LINUX_WEB_DESKTOP = 10] = "LINUX_WEB_DESKTOP", e[e.LINUX_WEB_MOBILE = 11] = "LINUX_WEB_MOBILE", e[e.LENSSTUDIO = 12] = "LENSSTUDIO", e[e.SNAPCAMERA = 13] = "SNAPCAMERA", e[e.WEB_DESKTOP = 14] = "WEB_DESKTOP", e[e.WEB_MOBILE = 15] = "WEB_MOBILE", e[e.LENSSTUDIO_REMAKE = 16] = "LENSSTUDIO_REMAKE", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(Xc || (Xc = {}));
var Qc;
(function(e) {
  e[e.COLLECTION_UNUSED = 0] = "COLLECTION_UNUSED", e[e.GAE = 1] = "GAE", e[e.GCE_M = 2] = "GCE_M", e[e.GCE_S = 3] = "GCE_S", e[e.GCE_T = 4] = "GCE_T", e[e.GKE_M = 5] = "GKE_M", e[e.GKE_S = 6] = "GKE_S", e[e.GKE_T = 7] = "GKE_T", e[e.LOCAL = 8] = "LOCAL", e[e.GCE_ST = 9] = "GCE_ST", e[e.GKE_ST = 10] = "GKE_ST", e[e.GCE_C = 11] = "GCE_C", e[e.GCE_SC = 12] = "GCE_SC", e[e.GCE_TC = 13] = "GCE_TC", e[e.GCE_TSC = 14] = "GCE_TSC", e[e.GKE_C = 15] = "GKE_C", e[e.GKE_SC = 16] = "GKE_SC", e[e.GKE_TC = 17] = "GKE_TC", e[e.GKE_TSC = 18] = "GKE_TSC", e[e.GKE_W = 19] = "GKE_W", e[e.GKE_WT = 20] = "GKE_WT", e[e.GKE_WC = 21] = "GKE_WC", e[e.GKE_WSC = 22] = "GKE_WSC", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(Qc || (Qc = {}));
const ra = {
  encode(e, n = new I()) {
    return e.cameraKitEventBase !== void 0 && W.encode(e.cameraKitEventBase, n.uint32(10).fork()).join(), e.lensId !== "" && n.uint32(18).string(e.lensId), e.viewTimeSec !== 0 && n.uint32(25).double(e.viewTimeSec), e.lensGroupId !== "" && n.uint32(34).string(e.lensGroupId), n;
  },
  decode() {
    throw new Error("Not implemented.");
  },
  fromJSON() {
    throw new Error("Not implemented.");
  },
  toJSON() {
    throw new Error("Not implemented.");
  },
  create() {
    throw new Error("Not implemented.");
  },
  fromPartial(e) {
    var n, t, a;
    const r = O0();
    return r.cameraKitEventBase = e.cameraKitEventBase !== void 0 && e.cameraKitEventBase !== null ? W.fromPartial(e.cameraKitEventBase) : void 0, r.lensId = (n = e.lensId) !== null && n !== void 0 ? n : "", r.viewTimeSec = (t = e.viewTimeSec) !== null && t !== void 0 ? t : 0, r.lensGroupId = (a = e.lensGroupId) !== null && a !== void 0 ? a : "", r;
  }
};
function O0() {
  return { cameraKitEventBase: void 0, lensId: "", viewTimeSec: 0, lensGroupId: "" };
}
const aa = {
  encode(e, n = new I()) {
    return e.cameraKitEventBase !== void 0 && W.encode(e.cameraKitEventBase, n.uint32(10).fork()).join(), e.performanceCluster !== "0" && n.uint32(16).uint64(e.performanceCluster), e.webglRendererInfo !== "" && n.uint32(26).string(e.webglRendererInfo), e.lensId !== "" && n.uint32(34).string(e.lensId), e.lensFrameProcessingTimeMsAvg !== 0 && n.uint32(41).double(e.lensFrameProcessingTimeMsAvg), e.lensFrameProcessingTimeMsStd !== 0 && n.uint32(49).double(e.lensFrameProcessingTimeMsStd), e.viewTimeSec !== 0 && n.uint32(57).double(e.viewTimeSec), e.recordingTimeSec !== 0 && n.uint32(65).double(e.recordingTimeSec), e.applyDelaySec !== 0 && n.uint32(73).double(e.applyDelaySec), e.avgFps !== 0 && n.uint32(81).double(e.avgFps), e.isLensFirstWithinDay !== !1 && n.uint32(88).bool(e.isLensFirstWithinDay), e.isLensFirstWithinMonth !== !1 && n.uint32(96).bool(e.isLensFirstWithinMonth), e.lensGroupId !== "" && n.uint32(106).string(e.lensGroupId), n;
  },
  decode() {
    throw new Error("Not implemented.");
  },
  fromJSON() {
    throw new Error("Not implemented.");
  },
  toJSON() {
    throw new Error("Not implemented.");
  },
  create() {
    throw new Error("Not implemented.");
  },
  fromPartial(e) {
    var n, t, a, r, i, o, s, u, c, d, m, l;
    const f = R0();
    return f.cameraKitEventBase = e.cameraKitEventBase !== void 0 && e.cameraKitEventBase !== null ? W.fromPartial(e.cameraKitEventBase) : void 0, f.performanceCluster = (n = e.performanceCluster) !== null && n !== void 0 ? n : "0", f.webglRendererInfo = (t = e.webglRendererInfo) !== null && t !== void 0 ? t : "", f.lensId = (a = e.lensId) !== null && a !== void 0 ? a : "", f.lensFrameProcessingTimeMsAvg = (r = e.lensFrameProcessingTimeMsAvg) !== null && r !== void 0 ? r : 0, f.lensFrameProcessingTimeMsStd = (i = e.lensFrameProcessingTimeMsStd) !== null && i !== void 0 ? i : 0, f.viewTimeSec = (o = e.viewTimeSec) !== null && o !== void 0 ? o : 0, f.recordingTimeSec = (s = e.recordingTimeSec) !== null && s !== void 0 ? s : 0, f.applyDelaySec = (u = e.applyDelaySec) !== null && u !== void 0 ? u : 0, f.avgFps = (c = e.avgFps) !== null && c !== void 0 ? c : 0, f.isLensFirstWithinDay = (d = e.isLensFirstWithinDay) !== null && d !== void 0 ? d : !1, f.isLensFirstWithinMonth = (m = e.isLensFirstWithinMonth) !== null && m !== void 0 ? m : !1, f.lensGroupId = (l = e.lensGroupId) !== null && l !== void 0 ? l : "", f;
  }
};
function R0() {
  return {
    cameraKitEventBase: void 0,
    performanceCluster: "0",
    webglRendererInfo: "",
    lensId: "",
    lensFrameProcessingTimeMsAvg: 0,
    lensFrameProcessingTimeMsStd: 0,
    viewTimeSec: 0,
    recordingTimeSec: 0,
    applyDelaySec: 0,
    avgFps: 0,
    isLensFirstWithinDay: !1,
    isLensFirstWithinMonth: !1,
    lensGroupId: ""
  };
}
const oa = {
  encode(e, n = new I()) {
    return e.cameraKitEventBase !== void 0 && W.encode(e.cameraKitEventBase, n.uint32(10).fork()).join(), e.lensId !== "" && n.uint32(18).string(e.lensId), e.automaticDownload !== !1 && n.uint32(24).bool(e.automaticDownload), e.downloadTimeSec !== 0 && n.uint32(33).double(e.downloadTimeSec), e.sizeByte !== "0" && n.uint32(40).uint64(e.sizeByte), n;
  },
  decode() {
    throw new Error("Not implemented.");
  },
  fromJSON() {
    throw new Error("Not implemented.");
  },
  toJSON() {
    throw new Error("Not implemented.");
  },
  create() {
    throw new Error("Not implemented.");
  },
  fromPartial(e) {
    var n, t, a, r;
    const i = k0();
    return i.cameraKitEventBase = e.cameraKitEventBase !== void 0 && e.cameraKitEventBase !== null ? W.fromPartial(e.cameraKitEventBase) : void 0, i.lensId = (n = e.lensId) !== null && n !== void 0 ? n : "", i.automaticDownload = (t = e.automaticDownload) !== null && t !== void 0 ? t : !1, i.downloadTimeSec = (a = e.downloadTimeSec) !== null && a !== void 0 ? a : 0, i.sizeByte = (r = e.sizeByte) !== null && r !== void 0 ? r : "0", i;
  }
};
function k0() {
  return { cameraKitEventBase: void 0, lensId: "", automaticDownload: !1, downloadTimeSec: 0, sizeByte: "0" };
}
const sa = {
  encode(e, n = new I()) {
    return e.cameraKitEventBase !== void 0 && W.encode(e.cameraKitEventBase, n.uint32(10).fork()).join(), e.automaticDownload !== !1 && n.uint32(24).bool(e.automaticDownload), e.downloadTimeSec !== 0 && n.uint32(33).double(e.downloadTimeSec), e.sizeByte !== "0" && n.uint32(40).uint64(e.sizeByte), e.assetId !== "" && n.uint32(50).string(e.assetId), n;
  },
  decode() {
    throw new Error("Not implemented.");
  },
  fromJSON() {
    throw new Error("Not implemented.");
  },
  toJSON() {
    throw new Error("Not implemented.");
  },
  create() {
    throw new Error("Not implemented.");
  },
  fromPartial(e) {
    var n, t, a, r;
    const i = T0();
    return i.cameraKitEventBase = e.cameraKitEventBase !== void 0 && e.cameraKitEventBase !== null ? W.fromPartial(e.cameraKitEventBase) : void 0, i.automaticDownload = (n = e.automaticDownload) !== null && n !== void 0 ? n : !1, i.downloadTimeSec = (t = e.downloadTimeSec) !== null && t !== void 0 ? t : 0, i.sizeByte = (a = e.sizeByte) !== null && a !== void 0 ? a : "0", i.assetId = (r = e.assetId) !== null && r !== void 0 ? r : "", i;
  }
};
function T0() {
  return { cameraKitEventBase: void 0, automaticDownload: !1, downloadTimeSec: 0, sizeByte: "0", assetId: "" };
}
const ua = {
  encode(e, n = new I()) {
    return e.cameraKitEventBase !== void 0 && W.encode(e.cameraKitEventBase, n.uint32(10).fork()).join(), e.lensId !== "" && n.uint32(18).string(e.lensId), e.type !== "" && n.uint32(26).string(e.type), e.reason !== "" && n.uint32(34).string(e.reason), n;
  },
  decode() {
    throw new Error("Not implemented.");
  },
  fromJSON() {
    throw new Error("Not implemented.");
  },
  toJSON() {
    throw new Error("Not implemented.");
  },
  create() {
    throw new Error("Not implemented.");
  },
  fromPartial(e) {
    var n, t, a;
    const r = g0();
    return r.cameraKitEventBase = e.cameraKitEventBase !== void 0 && e.cameraKitEventBase !== null ? W.fromPartial(e.cameraKitEventBase) : void 0, r.lensId = (n = e.lensId) !== null && n !== void 0 ? n : "", r.type = (t = e.type) !== null && t !== void 0 ? t : "", r.reason = (a = e.reason) !== null && a !== void 0 ? a : "", r;
  }
};
function g0() {
  return { cameraKitEventBase: void 0, lensId: "", type: "", reason: "" };
}
const ca = {
  encode(e, n = new I()) {
    return e.cameraKitEventBase !== void 0 && W.encode(e.cameraKitEventBase, n.uint32(10).fork()).join(), e.dailySessionBucket !== 0 && n.uint32(16).int32(e.dailySessionBucket), e.isFirstWithinMonth !== !1 && n.uint32(24).bool(e.isFirstWithinMonth), e.day !== "0" && n.uint32(32).uint64(e.day), e.month !== "0" && n.uint32(40).uint64(e.month), e.year !== "0" && n.uint32(48).uint64(e.year), n;
  },
  decode() {
    throw new Error("Not implemented.");
  },
  fromJSON() {
    throw new Error("Not implemented.");
  },
  toJSON() {
    throw new Error("Not implemented.");
  },
  create() {
    throw new Error("Not implemented.");
  },
  fromPartial(e) {
    var n, t, a, r, i;
    const o = b0();
    return o.cameraKitEventBase = e.cameraKitEventBase !== void 0 && e.cameraKitEventBase !== null ? W.fromPartial(e.cameraKitEventBase) : void 0, o.dailySessionBucket = (n = e.dailySessionBucket) !== null && n !== void 0 ? n : 0, o.isFirstWithinMonth = (t = e.isFirstWithinMonth) !== null && t !== void 0 ? t : !1, o.day = (a = e.day) !== null && a !== void 0 ? a : "0", o.month = (r = e.month) !== null && r !== void 0 ? r : "0", o.year = (i = e.year) !== null && i !== void 0 ? i : "0", o;
  }
};
function b0() {
  return {
    cameraKitEventBase: void 0,
    dailySessionBucket: 0,
    isFirstWithinMonth: !1,
    day: "0",
    month: "0",
    year: "0"
  };
}
var fe;
(function(e) {
  e[e.NO_SESSION_BUCKET = 0] = "NO_SESSION_BUCKET", e[e.ONE_SESSION = 1] = "ONE_SESSION", e[e.TWO_SESSION = 2] = "TWO_SESSION", e[e.THREE_SESSION = 3] = "THREE_SESSION", e[e.FOUR_SESSION = 4] = "FOUR_SESSION", e[e.FIVE_SESSION = 5] = "FIVE_SESSION", e[e.SIX_SESSION = 6] = "SIX_SESSION", e[e.SEVEN_SESSION = 7] = "SEVEN_SESSION", e[e.EIGHT_SESSION = 8] = "EIGHT_SESSION", e[e.NINE_SESSION = 9] = "NINE_SESSION", e[e.TEN_OR_MORE_SESSION = 10] = "TEN_OR_MORE_SESSION", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(fe || (fe = {}));
const la = {
  encode(e, n = new I()) {
    return e.cameraKitEventBase !== void 0 && W.encode(e.cameraKitEventBase, n.uint32(10).fork()).join(), e.lensId !== "" && n.uint32(18).string(e.lensId), n;
  },
  decode() {
    throw new Error("Not implemented.");
  },
  fromJSON() {
    throw new Error("Not implemented.");
  },
  toJSON() {
    throw new Error("Not implemented.");
  },
  create() {
    throw new Error("Not implemented.");
  },
  fromPartial(e) {
    var n;
    const t = P0();
    return t.cameraKitEventBase = e.cameraKitEventBase !== void 0 && e.cameraKitEventBase !== null ? W.fromPartial(e.cameraKitEventBase) : void 0, t.lensId = (n = e.lensId) !== null && n !== void 0 ? n : "", t;
  }
};
function P0() {
  return { cameraKitEventBase: void 0, lensId: "" };
}
const da = {
  encode(e, n = new I()) {
    return e.cameraKitEventBase !== void 0 && W.encode(e.cameraKitEventBase, n.uint32(10).fork()).join(), e.assetId !== "" && n.uint32(26).string(e.assetId), n;
  },
  decode() {
    throw new Error("Not implemented.");
  },
  fromJSON() {
    throw new Error("Not implemented.");
  },
  toJSON() {
    throw new Error("Not implemented.");
  },
  create() {
    throw new Error("Not implemented.");
  },
  fromPartial(e) {
    var n;
    const t = L0();
    return t.cameraKitEventBase = e.cameraKitEventBase !== void 0 && e.cameraKitEventBase !== null ? W.fromPartial(e.cameraKitEventBase) : void 0, t.assetId = (n = e.assetId) !== null && n !== void 0 ? n : "", t;
  }
};
function L0() {
  return { cameraKitEventBase: void 0, assetId: "" };
}
const fa = {
  encode(e, n = new I()) {
    return e.cameraKitEventBase !== void 0 && W.encode(e.cameraKitEventBase, n.uint32(10).fork()).join(), e.benchmarkName !== "" && n.uint32(18).string(e.benchmarkName), e.benchmarkValue !== 0 && n.uint32(25).double(e.benchmarkValue), e.performanceCluster !== "0" && n.uint32(32).uint64(e.performanceCluster), e.webglRendererInfo !== "" && n.uint32(42).string(e.webglRendererInfo), n;
  },
  decode() {
    throw new Error("Not implemented.");
  },
  fromJSON() {
    throw new Error("Not implemented.");
  },
  toJSON() {
    throw new Error("Not implemented.");
  },
  create() {
    throw new Error("Not implemented.");
  },
  fromPartial(e) {
    var n, t, a, r;
    const i = C0();
    return i.cameraKitEventBase = e.cameraKitEventBase !== void 0 && e.cameraKitEventBase !== null ? W.fromPartial(e.cameraKitEventBase) : void 0, i.benchmarkName = (n = e.benchmarkName) !== null && n !== void 0 ? n : "", i.benchmarkValue = (t = e.benchmarkValue) !== null && t !== void 0 ? t : 0, i.performanceCluster = (a = e.performanceCluster) !== null && a !== void 0 ? a : "0", i.webglRendererInfo = (r = e.webglRendererInfo) !== null && r !== void 0 ? r : "", i;
  }
};
function C0() {
  return {
    cameraKitEventBase: void 0,
    benchmarkName: "",
    benchmarkValue: 0,
    performanceCluster: "0",
    webglRendererInfo: ""
  };
}
const ma = {
  encode(e, n = new I()) {
    return e.cameraKitEventBase !== void 0 && W.encode(e.cameraKitEventBase, n.uint32(10).fork()).join(), e.legalPromptId !== "" && n.uint32(18).string(e.legalPromptId), e.legalPromptResult !== 0 && n.uint32(24).int32(e.legalPromptResult), n;
  },
  decode() {
    throw new Error("Not implemented.");
  },
  fromJSON() {
    throw new Error("Not implemented.");
  },
  toJSON() {
    throw new Error("Not implemented.");
  },
  create() {
    throw new Error("Not implemented.");
  },
  fromPartial(e) {
    var n, t;
    const a = w0();
    return a.cameraKitEventBase = e.cameraKitEventBase !== void 0 && e.cameraKitEventBase !== null ? W.fromPartial(e.cameraKitEventBase) : void 0, a.legalPromptId = (n = e.legalPromptId) !== null && n !== void 0 ? n : "", a.legalPromptResult = (t = e.legalPromptResult) !== null && t !== void 0 ? t : 0, a;
  }
};
function w0() {
  return { cameraKitEventBase: void 0, legalPromptId: "", legalPromptResult: 0 };
}
const W = {
  encode(e, n = new I()) {
    return e.kitEventBase !== void 0 && ha.encode(e.kitEventBase, n.uint32(10).fork()).join(), e.deviceCluster !== "0" && n.uint32(16).uint64(e.deviceCluster), e.cameraKitVersion !== "" && n.uint32(26).string(e.cameraKitVersion), e.lensCoreVersion !== "" && n.uint32(34).string(e.lensCoreVersion), e.deviceModel !== "" && n.uint32(42).string(e.deviceModel), e.cameraKitVariant !== 0 && n.uint32(48).int32(e.cameraKitVariant), e.cameraKitFlavor !== 0 && n.uint32(56).int32(e.cameraKitFlavor), e.appId !== "" && n.uint32(66).string(e.appId), e.deviceConnectivity !== 0 && n.uint32(72).int32(e.deviceConnectivity), e.sessionId !== "" && n.uint32(82).string(e.sessionId), e.appVendorUuid !== "" && n.uint32(90).string(e.appVendorUuid), e.rankingRequestId !== "" && n.uint32(98).string(e.rankingRequestId), e.cameraKitEnvironment !== 0 && n.uint32(104).int32(e.cameraKitEnvironment), e.partnerUuid !== "" && n.uint32(114).string(e.partnerUuid), n;
  },
  decode() {
    throw new Error("Not implemented.");
  },
  fromJSON() {
    throw new Error("Not implemented.");
  },
  toJSON() {
    throw new Error("Not implemented.");
  },
  create() {
    throw new Error("Not implemented.");
  },
  fromPartial(e) {
    var n, t, a, r, i, o, s, u, c, d, m, l, f;
    const E = D0();
    return E.kitEventBase = e.kitEventBase !== void 0 && e.kitEventBase !== null ? ha.fromPartial(e.kitEventBase) : void 0, E.deviceCluster = (n = e.deviceCluster) !== null && n !== void 0 ? n : "0", E.cameraKitVersion = (t = e.cameraKitVersion) !== null && t !== void 0 ? t : "", E.lensCoreVersion = (a = e.lensCoreVersion) !== null && a !== void 0 ? a : "", E.deviceModel = (r = e.deviceModel) !== null && r !== void 0 ? r : "", E.cameraKitVariant = (i = e.cameraKitVariant) !== null && i !== void 0 ? i : 0, E.cameraKitFlavor = (o = e.cameraKitFlavor) !== null && o !== void 0 ? o : 0, E.appId = (s = e.appId) !== null && s !== void 0 ? s : "", E.deviceConnectivity = (u = e.deviceConnectivity) !== null && u !== void 0 ? u : 0, E.sessionId = (c = e.sessionId) !== null && c !== void 0 ? c : "", E.appVendorUuid = (d = e.appVendorUuid) !== null && d !== void 0 ? d : "", E.rankingRequestId = (m = e.rankingRequestId) !== null && m !== void 0 ? m : "", E.cameraKitEnvironment = (l = e.cameraKitEnvironment) !== null && l !== void 0 ? l : 0, E.partnerUuid = (f = e.partnerUuid) !== null && f !== void 0 ? f : "", E;
  }
};
function D0() {
  return {
    kitEventBase: void 0,
    deviceCluster: "0",
    cameraKitVersion: "",
    lensCoreVersion: "",
    deviceModel: "",
    cameraKitVariant: 0,
    cameraKitFlavor: 0,
    appId: "",
    deviceConnectivity: 0,
    sessionId: "",
    appVendorUuid: "",
    rankingRequestId: "",
    cameraKitEnvironment: 0,
    partnerUuid: ""
  };
}
const ha = {
  encode(e, n = new I()) {
    return e.oauthClientId !== "" && n.uint32(10).string(e.oauthClientId), e.locale !== "" && n.uint32(18).string(e.locale), e.kitUserAgent !== "" && n.uint32(26).string(e.kitUserAgent), e.ipAddress !== "" && n.uint32(34).string(e.ipAddress), e.osMinorVersion !== "" && n.uint32(42).string(e.osMinorVersion), e.kitVariant !== 0 && n.uint32(48).int32(e.kitVariant), e.kitVariantVersion !== "" && n.uint32(58).string(e.kitVariantVersion), e.kitClientTimestampMillis !== "0" && n.uint32(64).uint64(e.kitClientTimestampMillis), e.clientSequenceId !== "0" && n.uint32(72).uint64(e.clientSequenceId), e.maxClientSequenceIdOnInstance !== "0" && n.uint32(80).uint64(e.maxClientSequenceIdOnInstance), e.targetArchitecture !== "" && n.uint32(90).string(e.targetArchitecture), e.runningWithDebuggerAttached !== !1 && n.uint32(96).bool(e.runningWithDebuggerAttached), e.runningInTests !== !1 && n.uint32(104).bool(e.runningInTests), e.runningInSimulator !== !1 && n.uint32(112).bool(e.runningInSimulator), e.isAppPrerelease !== !1 && n.uint32(120).bool(e.isAppPrerelease), e.kitAppId !== "" && n.uint32(130).string(e.kitAppId), e.kitSessionId !== "" && n.uint32(138).string(e.kitSessionId), e.kitPluginType !== 0 && n.uint32(144).int32(e.kitPluginType), e.isFromReactNativePlugin !== !1 && n.uint32(152).bool(e.isFromReactNativePlugin), n;
  },
  decode() {
    throw new Error("Not implemented.");
  },
  fromJSON() {
    throw new Error("Not implemented.");
  },
  toJSON() {
    throw new Error("Not implemented.");
  },
  create() {
    throw new Error("Not implemented.");
  },
  fromPartial(e) {
    var n, t, a, r, i, o, s, u, c, d, m, l, f, E, v, p, S, _, A;
    const N = y0();
    return N.oauthClientId = (n = e.oauthClientId) !== null && n !== void 0 ? n : "", N.locale = (t = e.locale) !== null && t !== void 0 ? t : "", N.kitUserAgent = (a = e.kitUserAgent) !== null && a !== void 0 ? a : "", N.ipAddress = (r = e.ipAddress) !== null && r !== void 0 ? r : "", N.osMinorVersion = (i = e.osMinorVersion) !== null && i !== void 0 ? i : "", N.kitVariant = (o = e.kitVariant) !== null && o !== void 0 ? o : 0, N.kitVariantVersion = (s = e.kitVariantVersion) !== null && s !== void 0 ? s : "", N.kitClientTimestampMillis = (u = e.kitClientTimestampMillis) !== null && u !== void 0 ? u : "0", N.clientSequenceId = (c = e.clientSequenceId) !== null && c !== void 0 ? c : "0", N.maxClientSequenceIdOnInstance = (d = e.maxClientSequenceIdOnInstance) !== null && d !== void 0 ? d : "0", N.targetArchitecture = (m = e.targetArchitecture) !== null && m !== void 0 ? m : "", N.runningWithDebuggerAttached = (l = e.runningWithDebuggerAttached) !== null && l !== void 0 ? l : !1, N.runningInTests = (f = e.runningInTests) !== null && f !== void 0 ? f : !1, N.runningInSimulator = (E = e.runningInSimulator) !== null && E !== void 0 ? E : !1, N.isAppPrerelease = (v = e.isAppPrerelease) !== null && v !== void 0 ? v : !1, N.kitAppId = (p = e.kitAppId) !== null && p !== void 0 ? p : "", N.kitSessionId = (S = e.kitSessionId) !== null && S !== void 0 ? S : "", N.kitPluginType = (_ = e.kitPluginType) !== null && _ !== void 0 ? _ : 0, N.isFromReactNativePlugin = (A = e.isFromReactNativePlugin) !== null && A !== void 0 ? A : !1, N;
  }
};
function y0() {
  return {
    oauthClientId: "",
    locale: "",
    kitUserAgent: "",
    ipAddress: "",
    osMinorVersion: "",
    kitVariant: 0,
    kitVariantVersion: "",
    kitClientTimestampMillis: "0",
    clientSequenceId: "0",
    maxClientSequenceIdOnInstance: "0",
    targetArchitecture: "",
    runningWithDebuggerAttached: !1,
    runningInTests: !1,
    runningInSimulator: !1,
    isAppPrerelease: !1,
    kitAppId: "",
    kitSessionId: "",
    kitPluginType: 0,
    isFromReactNativePlugin: !1
  };
}
var rt;
(function(e) {
  e[e.CAMERA_KIT_LEGAL_PROMPT_MISSING = 0] = "CAMERA_KIT_LEGAL_PROMPT_MISSING", e[e.CAMERA_KIT_LEGAL_PROMPT_ACCEPTED = 1] = "CAMERA_KIT_LEGAL_PROMPT_ACCEPTED", e[e.CAMERA_KIT_LEGAL_PROMPT_DISMISSED = 2] = "CAMERA_KIT_LEGAL_PROMPT_DISMISSED", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(rt || (rt = {}));
var jc;
(function(e) {
  e[e.CAMERA_KIT_ENVIRONMENT_UNKNOWN = 0] = "CAMERA_KIT_ENVIRONMENT_UNKNOWN", e[e.CAMERA_KIT_ENVIRONMENT_STAGING = 1] = "CAMERA_KIT_ENVIRONMENT_STAGING", e[e.CAMERA_KIT_ENVIRONMENT_PRODUCTION = 2] = "CAMERA_KIT_ENVIRONMENT_PRODUCTION", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(jc || (jc = {}));
var Qe;
(function(e) {
  e[e.CAMERA_KIT_CONNECTIVITY_TYPE_UNKNOWN = 0] = "CAMERA_KIT_CONNECTIVITY_TYPE_UNKNOWN", e[e.CAMERA_KIT_CONNECTIVITY_TYPE_WIFI = 1] = "CAMERA_KIT_CONNECTIVITY_TYPE_WIFI", e[e.CAMERA_KIT_CONNECTIVITY_TYPE_MOBILE = 2] = "CAMERA_KIT_CONNECTIVITY_TYPE_MOBILE", e[e.CAMERA_KIT_CONNECTIVITY_TYPE_UNREACHABLE = 3] = "CAMERA_KIT_CONNECTIVITY_TYPE_UNREACHABLE", e[e.CAMERA_KIT_CONNECTIVITY_TYPE_BLUETOOTH = 4] = "CAMERA_KIT_CONNECTIVITY_TYPE_BLUETOOTH", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(Qe || (Qe = {}));
var pa;
(function(e) {
  e[e.CAMERA_KIT_FLAVOR_UNKNOWN = 0] = "CAMERA_KIT_FLAVOR_UNKNOWN", e[e.CAMERA_KIT_FLAVOR_DEBUG = 1] = "CAMERA_KIT_FLAVOR_DEBUG", e[e.CAMERA_KIT_FLAVOR_RELEASE = 2] = "CAMERA_KIT_FLAVOR_RELEASE", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(pa || (pa = {}));
var va;
(function(e) {
  e[e.CAMERA_KIT_VARIANT_UNKNOWN = 0] = "CAMERA_KIT_VARIANT_UNKNOWN", e[e.CAMERA_KIT_VARIANT_PARTNER = 1] = "CAMERA_KIT_VARIANT_PARTNER", e[e.CAMERA_KIT_VARIANT_PUBLIC = 2] = "CAMERA_KIT_VARIANT_PUBLIC", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(va || (va = {}));
var xc;
(function(e) {
  e[e.NO_PLUGIN = 0] = "NO_PLUGIN", e[e.UNITY = 1] = "UNITY", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(xc || (xc = {}));
var Ea;
(function(e) {
  e[e.UNKNOWN_KIT_TYPE = 0] = "UNKNOWN_KIT_TYPE", e[e.BITMOJI_KIT = 1] = "BITMOJI_KIT", e[e.CREATIVE_KIT = 2] = "CREATIVE_KIT", e[e.LOGIN_KIT = 3] = "LOGIN_KIT", e[e.STORY_KIT = 4] = "STORY_KIT", e[e.CAMERA_KIT = 5] = "CAMERA_KIT", e[e.SHOP_KIT = 6] = "SHOP_KIT", e[e.EULA_KIT = 7] = "EULA_KIT", e[e.PAYMENTS_KIT = 8] = "PAYMENTS_KIT", e[e.INVITE_KIT = 9] = "INVITE_KIT", e[e.CAMERA_KIT_WEB = 10] = "CAMERA_KIT_WEB", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(Ea || (Ea = {}));
const lo = (e, n, t = Number.POSITIVE_INFINITY) => {
  const a = [];
  let r = 0;
  const i = (o) => O(void 0, void 0, void 0, function* () {
    try {
      r++;
      const s = o.map();
      s instanceof Promise ? o.next(yield s) : s && o.next(s);
    } catch (s) {
      o.reject(s);
    } finally {
      r--;
    }
    for (; a.length > 0 && r < t; )
      i(a.shift());
  });
  return n && n.onPageHidden(() => {
    for (; a.length > 0; )
      i(a.shift());
  }), (o) => (s, u) => new Promise((c, d) => {
    const m = {
      map: () => e(s),
      next: (l) => o(l, u).then(c).catch(d),
      reject: d
    };
    r < t ? i(m) : a.push(m);
  });
}, el = ({ batchReduce: e, isBatchComplete: n, maxBatchAge: t, pageVisibility: a }) => {
  let r, i, o = () => {
  };
  const s = lo((c) => O(void 0, void 0, void 0, function* () {
    return i = yield e(i, c), i;
  }), a, 1), u = (c, d, m) => {
    const l = d ? e(i, d) : i;
    if (!l)
      return;
    const f = l instanceof Promise ? l.then((E) => c(E, m)).catch(() => {
    }) : c(l, m).catch(() => {
    });
    return i = void 0, clearTimeout(r), o(), f;
  };
  return (c) => (d, m) => O(void 0, void 0, void 0, function* () {
    if (a && a.isDuringVisibilityTransition("hidden")) {
      yield u(c, d, m);
      return;
    }
    if (i === void 0) {
      const f = () => u(c, void 0, m);
      r = setTimeout(f, t), a && (o = a.onPageHidden(f));
    }
    return s(() => O(void 0, void 0, void 0, function* () {
      i && n(i) && (yield u(c, void 0, m));
    }))(d, m);
  });
}, U0 = (e) => new Promise((n) => setTimeout(n, e)), M0 = (e, n) => {
  let t;
  const a = lo((r) => O(void 0, void 0, void 0, function* () {
    if (t !== void 0) {
      const i = e - (Date.now() - t);
      i > 0 && (yield U0(i));
    }
    return t = Date.now(), r;
  }), n, 1);
  return (r) => (i, o) => n && n.isDuringVisibilityTransition("hidden") ? r(i, o) : a(r)(i, o);
};
function Br(e) {
  var n;
  return ((n = e.metric) === null || n === void 0 ? void 0 : n.$case) === "count";
}
class Oe extends Wa {
  static count(n, t, a = {}) {
    const r = new Oe(n, a);
    return r.increment(t), r;
  }
  constructor(n, t = {}) {
    super(n, t), this.name = n, this.count = 0;
  }
  increment(n) {
    return this.count += n, this.count;
  }
  toOperationalMetric() {
    return [
      {
        name: `${this.name}${za(this.dimensions)}`,
        timestamp: /* @__PURE__ */ new Date(),
        metric: { $case: "count", count: `${Math.ceil(this.count)}` }
      }
    ];
  }
}
const V0 = 1e3, G0 = 10, B0 = 5e3, F0 = 100, H0 = 5e3;
class K0 {
  constructor(n, t) {
    this.grpcClient = n;
    const a = M0(V0, t);
    this.businessEventsHandler = new Ie((r) => O(this, void 0, void 0, function* () {
      yield this.grpcClient.setBusinessEvents(r);
    })).map(a).map(lo((r) => {
      const i = $c.fromPartial({ serverEvents: r });
      return {
        batchEvents: {
          typeUrl: "com.snapchat.analytics.blizzard.ServerEventBatch",
          value: $c.encode(i).finish()
        }
      };
    }, t)).map(el({
      batchReduce: (r, i) => {
        const o = r ?? [];
        return o.push(i), o;
      },
      isBatchComplete: (r) => r.length >= G0,
      maxBatchAge: B0,
      pageVisibility: t
    })).handler, this.operationalMetricsHandler = new Ie((r) => O(this, void 0, void 0, function* () {
      yield this.grpcClient.setOperationalMetrics({ metrics: r });
    })).map(a).map(el({
      batchReduce: (r, i) => {
        var o;
        const s = { metrics: (o = r == null ? void 0 : r.metrics) !== null && o !== void 0 ? o : [] };
        if (Br(i)) {
          const u = s.metrics.find((c) => Br(c) && c.name === i.name);
          if (u && Br(u))
            return u.metric.count = `${Number(u.metric.count) + Number(i.metric.count)}`, s;
        }
        return s.metrics.push(i), s;
      },
      isBatchComplete: (r) => r.metrics.length >= F0,
      maxBatchAge: H0,
      pageVisibility: t
    })).handler;
  }
  setBusinessEvents(n) {
    return O(this, void 0, void 0, function* () {
      yield this.businessEventsHandler(n);
    });
  }
  setOperationalMetrics(n) {
    return O(this, void 0, void 0, function* () {
      yield Promise.all(n.toOperationalMetric().map((t) => this.operationalMetricsHandler(t)));
    });
  }
}
const Y0 = /^(push2web|react_camera_kit)_/, Lf = R("externalMetricsSubject", () => new de()), Cf = R("externalMetrics", () => []), _e = R("metricsClient", [
  Lf.token,
  Cf.token,
  vt.token,
  fr.token
], (e, n, t, a) => {
  const r = new K0(lr(Qi, t), a);
  return Ze(e, ...n).pipe(re((o) => Y0.test(o.name))).subscribe({
    next: (o) => {
      r.setOperationalMetrics(o);
    }
  }), r;
}), xi = "cof", W0 = U("cofHandler"), wf = R("cofHandler", [ke, cn.token, _e.token], (e, n, t) => {
  const a = new dr(() => hf(365), new Zn({ databaseName: "COFCache" })), r = (i) => JSON.stringify(i);
  return new Ie((i, o) => O(void 0, void 0, void 0, function* () {
    var { signal: s, isSideEffect: u } = o, c = Om(o, ["signal", "isSideEffect"]);
    const d = new d0(`https://${e.apiHostname}`, {}), m = new Xp(d);
    return new Promise((l, f) => O(void 0, void 0, void 0, function* () {
      var E;
      s && s.addEventListener("abort", () => f(new Error("COF request aborted by handler chain.")));
      const v = yield a.retrieve(r(i)).catch((_) => (W0.warn("Unable to get COF response from cache.", _), {
        configResultsEtag: void 0,
        configResults: []
      })), p = {
        requestType: xi,
        delta: `${!!(v != null && v.configResultsEtag)}`
      }, { requestId: S } = qa(n, { dimensions: p });
      try {
        const _ = yield m.targetingQuery(Object.assign(Object.assign({}, i), { configResultsEtag: v == null ? void 0 : v.configResultsEtag, deltaSync: !!(v != null && v.configResultsEtag) }), new vf.BrowserHeaders(Object.assign({ authorization: `Bearer ${e.apiToken}`, "x-snap-client-user-agent": Ha() }, c)));
        delete _.toObject;
        const A = $p("configId", (E = v == null ? void 0 : v.configResults) !== null && E !== void 0 ? E : [], _.configResults).filter((C) => !C.delete), N = 200;
        let k = 0;
        try {
          k = new TextEncoder().encode(JSON.stringify(_)).byteLength;
        } finally {
          $a(n, {
            requestId: S,
            dimensions: p,
            status: N,
            sizeByte: k
          });
        }
        l(Object.assign(Object.assign({}, _), { configResults: A }));
      } catch (_) {
        Za(n, {
          requestId: S,
          dimensions: p,
          error: un(_)
        }), f(_);
      }
    }));
  })).map(Hd({ retryPredicate: (i) => i instanceof Error })).map(zd({ timeout: 20 * 1e3 })).map(v0(a, r, p0({
    onMiss: () => {
      t.setOperationalMetrics(Oe.count("cache_miss", 1, { request_type: xi }));
    }
  }))).handler;
}), z0 = {
  namespaces: [xn.LENS_CORE, xn.CAMERA_KIT_CORE, xn.LENS_CORE_CONFIG]
};
class q0 {
  constructor(n, t, a) {
    const r = Promise.resolve(n).then((i) => (i == null ? void 0 : i.cluster) === 0 || i == null ? void 0 : i.cluster);
    this.configById = ce(r).pipe(se((i) => ce(t(Object.assign(Object.assign({}, z0), { lensClusterOrig4: i })))), g((i) => {
      const o = /* @__PURE__ */ new Map();
      return i.configResults.forEach((s) => {
        var u;
        const c = (u = o.get(s.configId)) !== null && u !== void 0 ? u : [];
        c.push(s), o.set(s.configId, c);
      }), o;
    }), Lr(1)), this.initializationConfig = ce(a.getInitializationConfig({})).pipe(g((i) => {
      if (i.ok) {
        const o = i.unwrap();
        if (o.message)
          return o.message;
        throw new Error(`Failed to load initialization config. gRPC response successful, but message was null. gRPC status: ${o.statusMessage}`);
      }
      throw new Error(`Failed to load initialization config. gRPC status message: ${i.unwrapErr().statusMessage}`);
    }), Lr(1));
  }
  get(n) {
    return this.configById.pipe(g((t) => {
      var a;
      return (a = t.get(n)) !== null && a !== void 0 ? a : [];
    }));
  }
  getInitializationConfig() {
    return this.initializationConfig;
  }
  getGpuIndexConfig() {
    const n = "LENS_FEATURE_GPU_INDEX";
    return this.get(n).pipe(g((t) => {
      var a, r;
      if (t.length === 0)
        throw new Error(`Cannot find '${n}' config.`);
      return (r = (a = t[0].value) === null || a === void 0 ? void 0 : a.intValue) !== null && r !== void 0 ? r : -1;
    }), Lr(1));
  }
  getNamespace(n) {
    return this.configById.pipe(g((t) => Array.from(t.values()).filter((r) => r.some((i) => i.namespace === n)).flatMap((r) => r)));
  }
}
const He = R("remoteConfiguration", [ke, wf.token, vt.token], (e, n, t) => {
  const a = new q0(e.lensPerformance, n, lr(Qi, t));
  return a.get("").pipe(Ae(1)).subscribe(), a;
}), $0 = U("deviceDependentAssetLoader"), Z0 = (e) => K(e) && G(e.stringValue), J0 = (e) => K(e) && G(e.url) && (e.checksum === void 0 || G(e.checksum)), Df = R("deviceDependentAssetLoader", [Un.token, He.token], (e, n) => {
  const t = new Ie(e).map(sr()).handler;
  return function({ assetDescriptor: { assetId: r }, lowPriority: i }) {
    return O(this, void 0, void 0, function* () {
      const o = (s, u) => new Error(`Cannot load device-dependent asset ${r}. ${s}`, { cause: u });
      return Yn(n.get(r).pipe(tn((s) => {
        throw o("COF config failed to load.", s);
      }), g((s) => {
        if (s.length === 0)
          throw o("No COF config found corresponding to that assetId.");
        const [{ value: u }] = s;
        if (!Z0(u))
          throw o("COF config malformed (missing stringValue)");
        let c;
        try {
          c = JSON.parse(u.stringValue);
        } catch (d) {
          throw o("COF config malformed (JSON parse error)", d);
        }
        if (!J0(c))
          throw o("COF config malformed (missing URL)");
        return $0.info(`COF request for ${r}. url: ${c.url}. checksum: ${c.checksum}.`), c;
      }), se(({ url: s, checksum: u }) => O(this, void 0, void 0, function* () {
        const [c, d] = yield t(s, ur({ cache: "force-cache" }, i));
        if (!d.ok)
          throw d;
        return { data: c, checksum: u };
      }))));
    });
  };
}), yf = R("staticAssetLoader", [Un.token], (e) => {
  const n = new Ie(e).map(sr()).handler;
  return ({ assetDescriptor: { assetId: t }, assetManifest: a, lowPriority: r }) => O(void 0, void 0, void 0, function* () {
    var i;
    const o = (i = a == null ? void 0 : a.find((c) => c.id === t)) === null || i === void 0 ? void 0 : i.assetUrl;
    if (!o)
      throw new Error(`Cannot load lens asset ${t}. Static asset URL could not be found.`);
    const [s, u] = yield n(o, ur({ cache: "force-cache" }, r));
    if (!u.ok)
      throw u;
    return s;
  });
}), X0 = {
  LensDeserialization: 0,
  Validation: 1,
  Uncategorized: 2,
  LensExecution: 3,
  Abort: 4,
  Uninitialized: 5,
  VideoPlaybackFailed: 6,
  VideoPlaybackMuted: 7
}, Q0 = Object.fromEntries(Object.entries(X0).map((e) => [e[1], e[0]]));
function Uf(e, n) {
  var t, a, r, i, o;
  const s = un(e), u = new Error(s.message.split(`
`)[0], {
    cause: s.otherExceptions || !((t = s.cause) === null || t === void 0) && t.metadata ? {
      otherExceptions: s.otherExceptions,
      metadata: (a = s.cause) === null || a === void 0 ? void 0 : a.metadata
    } : void 0
  }), c = (i = (r = s.cause) === null || r === void 0 ? void 0 : r.type) === null || i === void 0 ? void 0 : i.value, d = `LensCore${(o = Q0[c]) !== null && o !== void 0 ? o : "Unknown"}Error`;
  if (u.name = d, u.isFrameError = n, s.stack) {
    const [m, ...l] = s.stack.split(`
`);
    u.stack && l.unshift(u.stack.split(`
`)[0]), u.stack = l.join(`
`);
  }
  return u;
}
const j0 = {
  addLens: null,
  clearAllLenses: null,
  imageToYuvBuffer: null,
  pauseCanvas: null,
  processAudioSampleBuffer: null,
  processFrame: null,
  removeLens: null,
  replaceLenses: null,
  setAudioParameters: null,
  setDeviceClass: null,
  setFPSLimit: null,
  setGpuIndex: null,
  setInputTransform: null,
  setOnFrameProcessedCallback: null,
  setRenderLoopMode: null,
  setRenderSize: null,
  setScreenRegions: null,
  teardown: null,
  useMediaElement: null,
  yuvBufferToBitmap: null
};
function nl(e, n) {
  return (t) => (a) => {
    const r = Uf(a, e);
    t(r), n.next(r);
  };
}
function Fr(e, n) {
  return function(...t) {
    try {
      return e.apply(this, t);
    } catch (a) {
      const r = Uf(a, !1);
      throw n.next(r), r;
    }
  };
}
const x0 = "errors", ev = (e) => {
  const n = new de(), t = n.asObservable(), a = nl(!1, n), r = nl(!0, n), i = {
    initialize(o) {
      return new Promise((s, u) => {
        var c;
        return e.initialize(Object.assign(Object.assign({}, o), { exceptionHandler: r((c = o.exceptionHandler) !== null && c !== void 0 ? c : () => {
        }), onSuccess: s, onFailure: a(u) }));
      });
    },
    provideRemoteAssetsResponse(o) {
      var s;
      return e.provideRemoteAssetsResponse(Object.assign(Object.assign({}, o), { onFailure: a((s = o.onFailure) !== null && s !== void 0 ? s : () => {
      }) }));
    },
    playCanvas(o) {
      return new Promise((s, u) => {
        e.playCanvas(Object.assign(Object.assign({}, o), { onReady: s, onFailure: a(u) }));
      });
    }
  };
  return new Proxy(e, {
    get: (o, s, u) => {
      if (s === x0)
        return t;
      if (s in i)
        return Fr(i[s], n);
      const c = Reflect.get(o, s, u);
      return c && (s in j0 ? Fr(function(d) {
        return new Promise((m, l) => c(Object.assign(Object.assign({}, d), { onSuccess: m, onFailure: a(l) })));
      }, n) : typeof c == "function" ? "values" in c ? c : Fr(c, n) : c);
    }
  });
};
function nv(e) {
  return new Promise((n, t) => {
    const a = document.createElement("script");
    a.src = e, a.async = !0, Ze(wn(a, "load").pipe(Ne(() => n(a))), wn(a, "error").pipe(Ne((r) => t(r)))).pipe(Ae(1)).subscribe(), document.body.appendChild(a);
  });
}
const tv = () => (e) => (n, t) => {
  var a;
  return (G(n) ? n : (a = n == null ? void 0 : n.url) !== null && a !== void 0 ? a : "").startsWith("https://lens-core-wasm.sc-corp.net/") ? e(n, Object.assign(Object.assign({}, t), { credentials: "include" })) : e(n, t);
}, tl = /* @__PURE__ */ new Map();
function Mf(e) {
  const n = tl.get(e);
  if (n)
    return n;
  const t = iv(e);
  return tl.set(e, t), t;
}
function iv(e) {
  const n = /* @__PURE__ */ new Set(), t = globalThis.trustedTypes, a = t == null ? void 0 : t.createPolicy(e, {
    createScriptURL: (r) => {
      if (n.has(r))
        return r;
      throw new TypeError("Blocked by Trusted Types: " + r);
    }
  });
  return {
    policyName: e,
    getTrustedUrls: () => [...n],
    trustUrl: (r) => {
      var i;
      return n.add(r), (i = a == null ? void 0 : a.createScriptURL(r)) !== null && i !== void 0 ? i : r;
    }
  };
}
const rv = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 15, 1, 13, 0, 65, 1, 253, 15, 65, 2, 253, 15, 253, 128, 2, 11])), av = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11])), il = 1024;
function ov() {
  var e, n;
  const t = (e = globalThis.document) === null || e === void 0 ? void 0 : e.createElement("canvas").getContext("webgl2");
  if (!t) {
    const i = !((n = globalThis.document) === null || n === void 0) && n.createElement("canvas").getContext("webgl") ? "platform_not_supported_only_webgl1" : typeof globalThis.WebGLRenderingContext == "function" ? "platform_not_supported_likely_no_hw_accel" : "platform_not_supported_no_webgl_browser_support";
    return {
      supported: !1,
      error: ut("CameraKit requires WebGL2, but this browser does not support WebGL2.", new Error(i))
    };
  }
  const a = t.getParameter(t.MAX_TEXTURE_SIZE), r = a >= il;
  return r ? { supported: r, maxTextureSize: a } : {
    supported: r,
    error: ut(`CameraKit requires WebGL's MAX_TEXTURE_SIZE exceed a minimum value of ${il}, but the browser's reported MAX_TEXTURE_SIZE is ${a}.`)
  };
}
function sv() {
  return O(this, void 0, void 0, function* () {
    if (globalThis.WebAssembly === void 0)
      return {
        supported: !1,
        error: ut("CameraKit requires WebAssembly, but this browser does not support WebAssembly.")
      };
    const [e, n] = yield Promise.all([
      av().then((t) => an().browser.brand === "Safari" ? !1 : t),
      rv()
    ]);
    return {
      supported: !0,
      wasmFeatures: {
        simd: e,
        relaxedSimd: n
      }
    };
  });
}
function Hr(e) {
  return {
    supported: !1,
    error: ut("Use of this feature requires WebXR support for immersive AR sessions, but this browser does not support immersive AR sessions.", e)
  };
}
function uv() {
  return O(this, void 0, void 0, function* () {
    try {
      return !isSecureContext || !navigator.xr ? Hr() : (yield navigator.xr.isSessionSupported("immersive-ar")) ? {
        supported: !0,
        sixDofSupported: !0,
        sceneDepthSupported: !0
      } : Hr();
    } catch (e) {
      return e instanceof Error && e.name === "SecurityError" ? {
        supported: !1,
        error: ut("Failed to check XR capabilities due to permissions or other issues.", e)
      } : Hr(e);
    }
  });
}
const fo = cr(function() {
  return O(this, void 0, void 0, function* () {
    return {
      webgl: ov(),
      wasm: yield sv(),
      webxr: yield uv()
    };
  });
}), cv = ["LensCoreWebAssembly.js", "LensCoreWebAssembly.wasm"];
function lv({ simd: e, relaxedSimd: n }, t) {
  return parseInt(t) >= 282 && n ? "rel-relaxed-simd-neh" : e ? "rel-simd-neh" : "rel-neh";
}
function dv(e) {
  return O(this, void 0, void 0, function* () {
    const n = e == null ? void 0 : e.replace(/[\/]+$/, ""), { wasm: t } = yield fo();
    if (!t.supported)
      throw t.error;
    const { lensCore: a } = an(), r = a.version, i = a.buildNumber, o = lv(t.wasmFeatures, r);
    return cv.map((s) => {
      if (n)
        return `${n}/${s}`;
      const { origin: u, pathname: c, search: d } = new URL(a.baseUrl);
      return `${u}${c}/${r}/${i}/${o}/${s}${d}`;
    });
  });
}
const fv = U("lensCoreFactory"), rl = (e, n) => n.find((t) => e.test(t)), mo = "lens_core_js", ho = "lens_core_wasm", ae = R("lensCore", [Un.token, ke, cn.token], (e, { lensCoreOverrideUrls: n, wasmEndpointOverride: t, trustedTypesPolicyName: a }, r) => O(void 0, void 0, void 0, function* () {
  var i, o;
  let s, u;
  const c = !!(n || t);
  let d = new Ie(e);
  c && (d = d.map(tv()));
  const m = d.map(Ja(r)).handler, l = Mf(a);
  if (n)
    s = l.trustUrl(n.js), u = n.wasm;
  else {
    const p = yield dv(t ?? void 0);
    if (s = (i = rl(/\.js/, p)) !== null && i !== void 0 ? i : "", u = (o = rl(/\.wasm/, p)) !== null && o !== void 0 ? o : "", !s || !u)
      throw new Error(`Cannot fetch required LensCore assets. Either the JS or WASM filename is missing from this list: ${p}.`);
    const S = yield m([
      s,
      { requestType: mo, customBuild: `${c}` }
    ]);
    s = l.trustUrl(URL.createObjectURL(yield S.blob()));
  }
  const f = yield nv(s), E = yield new Promise((v, p) => {
    let S;
    const _ = globalThis.createLensesModule(S = {
      mainScriptUrlOrBlob: s.toString(),
      instantiateWasm: (A, N) => {
        WebAssembly.instantiateStreaming(m([
          u,
          { requestType: ho, customBuild: `${c}` }
        ]), A).then(function({ instance: k, module: C }) {
          N(k, C), S.compiledModule = C, v(_);
        }).catch(p);
      }
    });
  });
  return f.remove(), lt.version != `${E.getCoreVersion()}` && fv.warn(`Loaded LensCore version (${E.getCoreVersion()}) differs from expected one (${lt.version})`), ev(E);
})), mv = {
  1: "st",
  2: "nd",
  3: "rd"
};
function hv(e, n, t, a) {
  var r;
  let i;
  try {
    i = JSON.stringify(a);
  } catch {
    i = String(a);
  }
  return {
    argPosition: `${t + 1}${(r = mv[t + 1]) !== null && r !== void 0 ? r : "th"}`,
    methodPath: `${Vf(e)}.${String(n)}()`,
    argString: i
  };
}
function Vf(e) {
  if (e === null)
    return "null";
  const n = typeof e;
  if (!["object", "function"].includes(n))
    return n;
  const t = e, a = t[Symbol.toStringTag];
  if (typeof a == "string")
    return a;
  if (n === "function" && Function.prototype.toString.call(t).startsWith("class"))
    return "class";
  const r = t.constructor.name;
  return typeof r == "string" && r !== "" ? r : n;
}
function be(...e) {
  return function(t, a) {
    return function(...r) {
      for (const [i, o] of e.entries())
        if (!o(r[i])) {
          const { argPosition: s, methodPath: u, argString: c } = hv(this, a.name, i, r[i]);
          throw np(`The ${s} argument to ${u} method has an invalid value: ${c}.`);
        }
      return t.apply(this, r);
    };
  };
}
function ie(e) {
  const n = (t) => e.error(t);
  return function(a, r) {
    return function(...i) {
      try {
        const o = a.apply(this, i);
        return o instanceof Promise && o.catch(n), o;
      } catch (o) {
        throw n(o), o;
      }
    };
  };
}
function $e(e) {
  throw new Error("Reached unreachable code at runtime.");
}
function Sa(e, n = "Assertion failed") {
  if (!e)
    throw n instanceof Error ? n : new Error(n);
}
function pv(e) {
  return qe(Gf, e);
}
function Gf(e) {
  return K(e) && G(e.id) && G(e.name) && ($(e.iconUrl) || G(e.iconUrl)) && K(e.vendorData) && Va(G)(e.vendorData) && Dn(e.cameraFacingPreference) && ($(e.preview) || vv(e.preview)) && ($(e.lensCreator) || Ev(e.lensCreator)) && ($(e.snapcode) || Sv(e.snapcode)) && _v(e.featureMetadata);
}
function vv(e) {
  return K(e) && G(e.imageUrl);
}
function Ev(e) {
  return K(e) && G(e.displayName);
}
function Sv(e) {
  return K(e) && G(e.imageUrl) && G(e.deepLink);
}
function Iv(e) {
  return K(e) && G(e.typeUrl) && Yd(e.value);
}
function _v(e) {
  return qe(Iv, e);
}
function Ia({ id: e, groupId: n, name: t, content: a, vendorData: r, cameraFacingPreference: i, lensCreator: o, scannable: s, featureMetadata: u }) {
  var c;
  return Sa(Uo(a == null ? void 0 : a.iconUrlBolt), "Unsafe icon URL"), Sa(Uo((c = a == null ? void 0 : a.preview) === null || c === void 0 ? void 0 : c.imageUrl), "Unsafe preview URL"), {
    id: e,
    groupId: n,
    name: t,
    iconUrl: a == null ? void 0 : a.iconUrlBolt,
    preview: a != null && a.preview ? { imageUrl: a.preview.imageUrl } : void 0,
    vendorData: r,
    cameraFacingPreference: i,
    lensCreator: o,
    snapcode: s ? { imageUrl: s.snapcodeImageUrl, deepLink: s.snapcodeDeeplink } : void 0,
    featureMetadata: u
  };
}
const Te = R("metricsEventTarget", () => new $n()), al = U("LensAssetRepository");
function ol(e) {
  return `${e.assetId}_${e.assetType.value}`;
}
function Av(e, n) {
  switch (n) {
    case et.ASSET:
      return e.AssetType.Static;
    case et.DEVICE_DEPENDENT_ASSET_UNSET:
    case et.UNRECOGNIZED:
      return e.AssetType.DeviceDependent;
    default:
      return $e();
  }
}
class Nv {
  constructor(n, t, a, r) {
    this.lensCore = n, this.assetLoaders = t, this.metrics = a, this.requestStateEventTarget = r, this.cachedAssetKeys = /* @__PURE__ */ new Set();
  }
  cacheAssets(n, t, a = [zn.REQUIRED], r = !1) {
    return O(this, void 0, void 0, function* () {
      const i = /* @__PURE__ */ new Set([
        zn.PRELOAD_UNSET,
        ...a
      ]), o = n.filter((s) => i.has(s.requestTiming)).map(({ id: s, type: u }) => ({
        assetId: s,
        assetType: Av(this.lensCore, u)
      }));
      if (o.length)
        return this.cacheAssetsByDescriptor(o, t, n, r);
    });
  }
  loadAsset(n) {
    var t, a;
    return O(this, void 0, void 0, function* () {
      const { assetDescriptor: { assetId: r, assetType: i }, lens: o } = n, [s, u] = (t = this.assetLoaders.get(i)) !== null && t !== void 0 ? t : [], c = s ?? "unknown", d = {
        requestType: "asset",
        assetId: r,
        assetType: c,
        lensId: (a = o == null ? void 0 : o.id) !== null && a !== void 0 ? a : "unknown"
      }, { requestId: m } = qa(this.requestStateEventTarget, { dimensions: d });
      try {
        if (!u)
          throw new Error(`Cannot get asset ${r}. Asset type ${c} is not supported.`);
        const l = yield u(n), f = "data" in l ? l.data : l, E = "checksum" in l ? l.checksum : void 0;
        if (f.byteLength === 0)
          throw new Error(`Got empty response for asset ${r} from ${c} loader.`);
        $a(this.requestStateEventTarget, {
          requestId: m,
          dimensions: d,
          status: 200,
          sizeByte: f.byteLength
        }), this.lensCore.provideRemoteAssetsResponse({
          assetId: r,
          assetBuffer: f,
          assetType: i,
          assetChecksum: E,
          onFailure: (v) => {
            /validation failed/.test(v.message) && this.metrics.dispatchEvent(new ee("assetValidationFailed", {
              name: "assetValidationFailed",
              assetId: r
            })), al.warn(`Failed to provide lens asset ${r}.`, v);
          }
        });
      } catch (l) {
        const f = new Error(`Failed to load lens asset ${r}.`, { cause: l });
        throw Za(this.requestStateEventTarget, { requestId: m, dimensions: d, error: f }), f;
      }
    });
  }
  cacheAssetsByDescriptor(n, t, a, r) {
    return O(this, void 0, void 0, function* () {
      yield Promise.all(n.filter((i) => !this.cachedAssetKeys.has(ol(i))).map((i) => O(this, void 0, void 0, function* () {
        var o;
        try {
          yield this.loadAsset({ assetDescriptor: i, lens: t, assetManifest: a, lowPriority: r }), this.cachedAssetKeys.add(ol(i));
        } catch (s) {
          const { assetId: u, assetType: c } = i, [d] = (o = this.assetLoaders.get(c)) !== null && o !== void 0 ? o : [];
          al.warn(`Failed to cache asset ${u} of type ${d ?? c.value}.`, s);
        }
      })));
    });
  }
}
const mr = R("lensAssetRepository", [
  ae.token,
  Df.token,
  qd.token,
  yf.token,
  Te.token,
  cn.token
], (e, n, t, a, r, i) => new Nv(e, /* @__PURE__ */ new Map([
  [e.AssetType.DeviceDependent, ["DeviceDependent", n]],
  [e.AssetType.RemoteMediaByUrl, ["RemoteMediaByUrl", t]],
  [e.AssetType.URL, ["URL", t]],
  [e.AssetType.Static, ["Static", a]]
]), r, i));
var sl;
(function(e) {
  e.UNSET = "UNSET", e.SHOP_KIT = "SHOP_KIT", e.LENS_WEB_BUILDER = "LENS_WEB_BUILDER", e.UNRECOGNIZED = "UNRECOGNIZED";
})(sl || (sl = {}));
var ul;
(function(e) {
  e.UNSET = "UNSET", e.UNKNOWN = "UNKNOWN", e.NOT_FOUND = "NOT_FOUND", e.INCOMPATIBLE_LENS_CORE_VERSION = "INCOMPATIBLE_LENS_CORE_VERSION", e.ARCHIVED_OR_INVISIBLE = "ARCHIVED_OR_INVISIBLE", e.CONTAINS_MUSIC = "CONTAINS_MUSIC", e.UNRECOGNIZED = "UNRECOGNIZED";
})(ul || (ul = {}));
function cl() {
  return { userAgent: "", locale: "" };
}
const Bf = {
  encode(e, n = new I()) {
    return e.userAgent !== "" && n.uint32(10).string(e.userAgent), e.locale !== "" && n.uint32(18).string(e.locale), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = cl();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.userAgent = t.string();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.locale = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Bf.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = cl();
    return a.userAgent = (n = e.userAgent) !== null && n !== void 0 ? n : "", a.locale = (t = e.locale) !== null && t !== void 0 ? t : "", a;
  }
};
function ll() {
  return { lenses: [] };
}
const Ff = {
  encode() {
    throw new Error("Not implemented.");
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = ll();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.lenses.push(ve.decode(t, t.uint32()));
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Ff.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = ll();
    return t.lenses = ((n = e.lenses) === null || n === void 0 ? void 0 : n.map((a) => ve.fromPartial(a))) || [], t;
  }
}, er = R("lensSources", () => []);
function dl(e, n, t) {
  return O(this, void 0, void 0, function* () {
    const a = e.find((i) => i.isGroupOwner(n));
    if (!a)
      throw new Error(`Cannot load lens ${t ? `${t} from ` : ""}group ${n}. No LensSource claimed ownership of that lens group.`);
    const r = t === void 0 ? yield a.loadLensGroup(n) : yield a.loadLens(t, n);
    return r instanceof ArrayBuffer || ArrayBuffer.isView(r) ? Ff.decode(r instanceof Uint8Array ? r : new Uint8Array(r)).lenses : [];
  });
}
const Xn = U("LensRepository"), Hf = {
  required: zn.REQUIRED,
  onDemand: zn.ON_DEMAND
};
function Ov(e) {
  return G(e) && Hf.hasOwnProperty(e);
}
function Rv(e) {
  return $(e) || qe(Ov, e);
}
let kv = (() => {
  var e;
  let n = [], t, a, r;
  return e = class {
    constructor(o, s, u) {
      this.lensFetchHandler = (ft(this, n), o), this.lensSources = s, this.lensAssetRepository = u, this.metadataCache = /* @__PURE__ */ new Map(), this.binariesCache = /* @__PURE__ */ new Map();
    }
    loadLens(o, s) {
      return O(this, void 0, void 0, function* () {
        const u = (yield dl(this.lensSources, s, o))[0];
        if (!u)
          throw new Error(`Cannot load lens. No lens with id ${o} was found in lens group ${s}.`);
        const c = Object.assign(Object.assign({}, u), { groupId: s });
        return this.metadataCache.set(u.id, c), Ia(c);
      });
    }
    loadLensGroups(o) {
      return O(this, void 0, void 0, function* () {
        return (yield Promise.all(o.map((u) => O(this, void 0, void 0, function* () {
          try {
            return (yield dl(this.lensSources, u)).map((c) => {
              const d = Object.assign(Object.assign({}, c), { groupId: u });
              return this.metadataCache.set(c.id, d), Ia(d);
            });
          } catch (c) {
            const d = un(c);
            return Xn.error(new Error(`Failed to load lens group ${u}.`, { cause: d })), d;
          }
        })))).reduce((u, c) => (c instanceof Error ? u.errors.push(c) : u.lenses.push(...c), u), { errors: [], lenses: [] });
      });
    }
    cacheLensContent(o, s = ["required", "onDemand"]) {
      return O(this, void 0, void 0, function* () {
        const u = s.map((c) => Hf[c]);
        yield Promise.all(o.map((c) => O(this, void 0, void 0, function* () {
          try {
            const { lensBuffer: d } = yield this.getLensContent(c, !0), { content: m } = this.metadataCache.get(c.id);
            this.binariesCache.set(c.id, d), yield this.lensAssetRepository.cacheAssets(m.assetManifest, c, u, !0);
          } catch (d) {
            Xn.warn(`Failed to cache lens ${c.id}.`, d);
          }
        })));
      });
    }
    getLensMetadata(o) {
      return this.metadataCache.get(o);
    }
    removeCachedLenses(o) {
      o.forEach((s) => this.binariesCache.delete(s.id));
    }
    getLensContent(o, s = !1) {
      var u;
      return O(this, void 0, void 0, function* () {
        const { content: c } = (u = this.metadataCache.get(o.id)) !== null && u !== void 0 ? u : {};
        if (!c)
          throw new Error(`Cannot find metadata for lens ${o.id}.`);
        const d = this.binariesCache.get(o.id);
        if (d)
          return {
            lensBuffer: d,
            lensChecksum: c.lnsSha256
          };
        const [m] = yield this.lensFetchHandler([
          new Request(c.lnsUrlBolt, ur({ cache: "force-cache" }, s)),
          {
            requestType: "lens_content",
            lensId: o.id
          }
        ]);
        return { lensBuffer: m, lensChecksum: c.lnsSha256 };
      });
    }
  }, t = [be(Xi, Xi), ie(Xn)], a = [be(cp), ie(Xn)], r = [be(pv, Rv), ie(Xn)], Q(e, null, t, { kind: "method", name: "loadLens", static: !1, private: !1, access: { has: (i) => "loadLens" in i, get: (i) => i.loadLens } }, null, n), Q(e, null, a, { kind: "method", name: "loadLensGroups", static: !1, private: !1, access: { has: (i) => "loadLensGroups" in i, get: (i) => i.loadLensGroups } }, null, n), Q(e, null, r, { kind: "method", name: "cacheLensContent", static: !1, private: !1, access: { has: (i) => "cacheLensContent" in i, get: (i) => i.cacheLensContent } }, null, n), e;
})();
const Jn = R("LensRepository", [
  cn.token,
  Un.token,
  er.token,
  mr.token
], (e, n, t, a) => {
  const r = new Ie(n).map(Ja(e)).map(sr()).handler;
  return new kv(r, t, a);
}), Tv = (e) => Object.fromEntries(e), Z = (e) => () => {
  const n = (t) => ({
    name: e,
    data: t
  });
  return Object.defineProperty(n, "name", { value: e }), n;
}, hr = (...e) => {
  const n = e.map((t) => [t.name, t]);
  return Tv(n);
};
function y(...e) {
  return re((n) => e.some((t) => n[0].name === t));
}
function fl(e, n) {
  return e.name === n;
}
class po {
  /**
   * Create a StateMachine with a defined set of Actions and States.
   *
   * The StateMachine begins in a given initial state with transitions to new states defined by a "reducer" function.
   *
   * Reducers are OperatorFunctions which map an Observable of `[Action, State]` pairs into an Observable of a new
   * state. They can be constructed using RxJS's `pipe` function. For example:
   *
   * ```ts
   * new StateMachine(actions, states, initialState, pipe(
   *   inStates('someState'),
   *   forActions('someAction'),
   *   map(([a, s]) => computeNewState(a, s)),
   * ))
   * ```
   *
   * Often it will be useful to break the reducer into separate behaviors to handle different actions:
   *
   * ```ts
   * new StateMachine(actions, states, initialState, state => {
   *   return merge(
   *     state.pipe(inStates('someState'), forAction('someAction'), map(computeNextState)),
   *     state.pipe(inStates('otherState'), forAction('otherAction'), map(computeOtherNextState)),
   *     // ...
   *   )
   * })
   * ```
   *
   * Reducers must return an output Observable<State> which, when the input Observable<[Action, State]> emits, either:
   *
   * - synchronously emits a single new state.
   * - emits nothing.
   *
   * To enforce this, reducer Observables race with a sync Observable containing the current state. If the reducer
   * Observable does not emit a new state synchronously, the current state is used (i.e. the state does not change).
   *
   * @param initialState
   * @param reducer
   * @returns
   */
  constructor(n, t, a, r) {
    te(this, "actions");
    te(this, "states");
    /**
     * After an Action is dispatched, passed to the StateMachine's reducer to produce a new state (or stay in the same
     * state), a pair of [Action, State] is emitted on this Observable.
     *
     * This can be used to observe every action dispatched to the StateMachine, along with the state that it produced.
     *
     * The most common use of the `events` Observable is to implement side-effects. It's very common for side-effects
     * to dispatch actions back to the StateMachine.
     *
     * ```ts
     * stateMachine.events.pipe(
     *   inStates('idle'),
     *   forActions('makeRequest'),
     *   switchMap(([{data: request}]) => fromFetch(request)),
     *   tap(response => stateMachine.dispatch('requestComplete', response)),
     * ).subscribe()
     * ```
     */
    te(this, "events");
    te(this, "actionsSubject");
    te(this, "eventsSubject");
    te(this, "state");
    this.actions = n, this.states = t, this.actionsSubject = new de(), this.eventsSubject = new de(), this.events = this.eventsSubject.asObservable(), this.state = new Vm(a), this.actionsSubject.pipe(Vh(this.state), se(([i, o]) => (
      // `NEVER` + `startWith` is needed for `raceWith` to work properly. If we instead used the more
      // typical `of([a, s])` we would encounter the following problem:
      //
      // `of` emits its value and completes synchronously (i.e. both in the same "frame," if you think in
      // marble diagrams). Assuming `reducer` does nothing to modify the completion behavior of its source
      // Observable, the Observable returned by `reducer` will also complete immediately. If we were to
      // pass that Observable to `raceWith` – whose output mirrors whichever input Observable is first to
      // emit, error, *or complete* – it would always win, even if it never emitted anything (because it
      // would already be complete).
      //
      // So instead we need an Observable that does not complete. We achieve this by using `NEVER` and
      // then starting it with `[a, s]`. Note that it's important to then use `take(1)` after `raceWith`
      // so that we don't leak Observables which never complete.
      Rh.pipe(Mh([i, o]), r, Vd(j(o)), Ne((s) => {
        s !== o && this.state.next(s);
      }), g((s) => [i, s]), Ae(1))
    ))).subscribe(this.eventsSubject);
  }
  dispatch(n, t) {
    const a = typeof n == "string" ? { name: n, data: t } : n;
    this.actionsSubject.next(a);
  }
  /**
   * Returns the current state.
   */
  getState() {
    return this.state.getValue();
  }
}
function _n(e) {
  return (n) => new Y((t) => {
    const a = e.events.subscribe(t);
    return a.add(n.subscribe({
      next: (r) => e.dispatch(r),
      error: (r) => t.error(r)
      // We purposely do not forward the `complete` notification.
      // We want the subscriber to remain subscribed to the stateMachine.events observable even if the
      // source Observable<Actions> completes.
    })), a;
  });
}
const Ge = (e) => () => Z(e)(), vo = (...e) => hr(...e);
function le(...e) {
  return re((n) => e.some((t) => n[1].name === t));
}
function yn(e, n) {
  return e.name === n;
}
function ml() {
  return { data: new Uint8Array(0) };
}
const wi = {
  encode(e, n = new I()) {
    return e.data.length !== 0 && n.uint32(10).bytes(e.data), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = ml();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.data = t.bytes();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return wi.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = ml();
    return t.data = (n = e.data) !== null && n !== void 0 ? n : new Uint8Array(0), t;
  }
};
function hl() {
  return { latitude: 0, longitude: 0 };
}
const Di = {
  encode(e, n = new I()) {
    return e.latitude !== 0 && n.uint32(9).double(e.latitude), e.longitude !== 0 && n.uint32(17).double(e.longitude), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = hl();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 9)
            break;
          r.latitude = t.double();
          continue;
        }
        case 2: {
          if (i !== 17)
            break;
          r.longitude = t.double();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Di.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = hl();
    return a.latitude = (n = e.latitude) !== null && n !== void 0 ? n : 0, a.longitude = (t = e.longitude) !== null && t !== void 0 ? t : 0, a;
  }
};
function pl() {
  return { radius: 0, center: void 0 };
}
const Ue = {
  encode(e, n = new I()) {
    return e.radius !== 0 && n.uint32(9).double(e.radius), e.center !== void 0 && Di.encode(e.center, n.uint32(18).fork()).join(), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = pl();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 9)
            break;
          r.radius = t.double();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.center = Di.decode(t, t.uint32());
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Ue.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = pl();
    return t.radius = (n = e.radius) !== null && n !== void 0 ? n : 0, t.center = e.center !== void 0 && e.center !== null ? Di.fromPartial(e.center) : void 0, t;
  }
};
function vl() {
  return { locations: [], activeLure: void 0, closestLure: void 0 };
}
const yi = {
  encode(e, n = new I()) {
    for (const t of e.locations)
      Ue.encode(t, n.uint32(10).fork()).join();
    return e.activeLure !== void 0 && Ue.encode(e.activeLure, n.uint32(18).fork()).join(), e.closestLure !== void 0 && Ue.encode(e.closestLure, n.uint32(26).fork()).join(), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = vl();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.locations.push(Ue.decode(t, t.uint32()));
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.activeLure = Ue.decode(t, t.uint32());
          continue;
        }
        case 3: {
          if (i !== 26)
            break;
          r.closestLure = Ue.decode(t, t.uint32());
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return yi.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = vl();
    return t.locations = ((n = e.locations) === null || n === void 0 ? void 0 : n.map((a) => Ue.fromPartial(a))) || [], t.activeLure = e.activeLure !== void 0 && e.activeLure !== null ? Ue.fromPartial(e.activeLure) : void 0, t.closestLure = e.closestLure !== void 0 && e.closestLure !== null ? Ue.fromPartial(e.closestLure) : void 0, t;
  }
};
function El() {
  return { store: new Uint8Array(0) };
}
const Ui = {
  encode(e, n = new I()) {
    return e.store.length !== 0 && n.uint32(10).bytes(e.store), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = El();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.store = t.bytes();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Ui.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = El();
    return t.store = (n = e.store) !== null && n !== void 0 ? n : new Uint8Array(0), t;
  }
};
var ue;
(function(e) {
  e.NOT_APPLICABLE = "NOT_APPLICABLE", e.SPOOKEY = "SPOOKEY", e.REGISTRY = "REGISTRY", e.FIDELIUS = "FIDELIUS", e.UNRECOGNIZED = "UNRECOGNIZED";
})(ue || (ue = {}));
function gv(e) {
  switch (e) {
    case 0:
    case "NOT_APPLICABLE":
      return ue.NOT_APPLICABLE;
    case 1:
    case "SPOOKEY":
      return ue.SPOOKEY;
    case 2:
    case "REGISTRY":
      return ue.REGISTRY;
    case 3:
    case "FIDELIUS":
      return ue.FIDELIUS;
    case -1:
    case "UNRECOGNIZED":
    default:
      return ue.UNRECOGNIZED;
  }
}
function bv(e) {
  switch (e) {
    case ue.NOT_APPLICABLE:
      return 0;
    case ue.SPOOKEY:
      return 1;
    case ue.REGISTRY:
      return 2;
    case ue.FIDELIUS:
      return 3;
    case ue.UNRECOGNIZED:
    default:
      return -1;
  }
}
var Sl;
(function(e) {
  e.NOT_APPLICABLE = "NOT_APPLICABLE", e.CONTEXT = "CONTEXT", e.INTERSTITIAL = "INTERSTITIAL", e.UNRECOGNIZED = "UNRECOGNIZED";
})(Sl || (Sl = {}));
function Il() {
  return {
    key: new Uint8Array(0),
    ivStore: {},
    isKeyServerEncrypted: !1,
    isKeyE2eEncrypted: !1,
    encryptionScheme: ue.NOT_APPLICABLE
  };
}
const Mi = {
  encode(e, n = new I()) {
    return e.key.length !== 0 && n.uint32(10).bytes(e.key), Object.entries(e.ivStore).forEach(([t, a]) => {
      _a.encode({ key: t, value: a }, n.uint32(18).fork()).join();
    }), e.isKeyServerEncrypted !== !1 && n.uint32(24).bool(e.isKeyServerEncrypted), e.isKeyE2eEncrypted !== !1 && n.uint32(32).bool(e.isKeyE2eEncrypted), e.encryptionScheme !== ue.NOT_APPLICABLE && n.uint32(40).int32(bv(e.encryptionScheme)), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Il();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.key = t.bytes();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          const o = _a.decode(t, t.uint32());
          o.value !== void 0 && (r.ivStore[o.key] = o.value);
          continue;
        }
        case 3: {
          if (i !== 24)
            break;
          r.isKeyServerEncrypted = t.bool();
          continue;
        }
        case 4: {
          if (i !== 32)
            break;
          r.isKeyE2eEncrypted = t.bool();
          continue;
        }
        case 5: {
          if (i !== 40)
            break;
          r.encryptionScheme = gv(t.int32());
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Mi.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r, i;
    const o = Il();
    return o.key = (n = e.key) !== null && n !== void 0 ? n : new Uint8Array(0), o.ivStore = Object.entries((t = e.ivStore) !== null && t !== void 0 ? t : {}).reduce((s, [u, c]) => (c !== void 0 && (s[u] = c), s), {}), o.isKeyServerEncrypted = (a = e.isKeyServerEncrypted) !== null && a !== void 0 ? a : !1, o.isKeyE2eEncrypted = (r = e.isKeyE2eEncrypted) !== null && r !== void 0 ? r : !1, o.encryptionScheme = (i = e.encryptionScheme) !== null && i !== void 0 ? i : ue.NOT_APPLICABLE, o;
  }
};
function _l() {
  return { key: "", value: new Uint8Array(0) };
}
const _a = {
  encode(e, n = new I()) {
    return e.key !== "" && n.uint32(10).string(e.key), e.value.length !== 0 && n.uint32(18).bytes(e.value), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = _l();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.key = t.string();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.value = t.bytes();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return _a.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = _l();
    return a.key = (n = e.key) !== null && n !== void 0 ? n : "", a.value = (t = e.value) !== null && t !== void 0 ? t : new Uint8Array(0), a;
  }
};
function Al() {
  return { store: {}, serializedStore: new Uint8Array(0) };
}
const at = {
  encode(e, n = new I()) {
    return Object.entries(e.store).forEach(([t, a]) => {
      Aa.encode({ key: t, value: a }, n.uint32(10).fork()).join();
    }), e.serializedStore.length !== 0 && n.uint32(18).bytes(e.serializedStore), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Al();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          const o = Aa.decode(t, t.uint32());
          o.value !== void 0 && (r.store[o.key] = o.value);
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.serializedStore = t.bytes();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return at.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = Al();
    return a.store = Object.entries((n = e.store) !== null && n !== void 0 ? n : {}).reduce((r, [i, o]) => (o !== void 0 && (r[i] = globalThis.String(o)), r), {}), a.serializedStore = (t = e.serializedStore) !== null && t !== void 0 ? t : new Uint8Array(0), a;
  }
};
function Nl() {
  return { key: "", value: "" };
}
const Aa = {
  encode(e, n = new I()) {
    return e.key !== "" && n.uint32(10).string(e.key), e.value !== "" && n.uint32(18).string(e.value), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Nl();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.key = t.string();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.value = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Aa.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = Nl();
    return a.key = (n = e.key) !== null && n !== void 0 ? n : "", a.value = (t = e.value) !== null && t !== void 0 ? t : "", a;
  }
};
function Ol() {
  return { playerData: {} };
}
const Vi = {
  encode(e, n = new I()) {
    return Object.entries(e.playerData).forEach(([t, a]) => {
      Na.encode({ key: t, value: a }, n.uint32(10).fork()).join();
    }), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Ol();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          const o = Na.decode(t, t.uint32());
          o.value !== void 0 && (r.playerData[o.key] = o.value);
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Vi.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = Ol();
    return t.playerData = Object.entries((n = e.playerData) !== null && n !== void 0 ? n : {}).reduce((a, [r, i]) => (i !== void 0 && (a[r] = at.fromPartial(i)), a), {}), t;
  }
};
function Rl() {
  return { key: "", value: void 0 };
}
const Na = {
  encode(e, n = new I()) {
    return e.key !== "" && n.uint32(10).string(e.key), e.value !== void 0 && at.encode(e.value, n.uint32(18).fork()).join(), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Rl();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.key = t.string();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.value = at.decode(t, t.uint32());
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Na.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = Rl();
    return t.key = (n = e.key) !== null && n !== void 0 ? n : "", t.value = e.value !== void 0 && e.value !== null ? at.fromPartial(e.value) : void 0, t;
  }
};
function kl() {
  return {
    id: "",
    sessionId: "",
    playerId: "",
    sessionData: void 0,
    createdTime: "0",
    expireTime: "0",
    version: 0,
    encryptionData: void 0,
    sessionDepth: 0
  };
}
const Gi = {
  encode(e, n = new I()) {
    return e.id !== "" && n.uint32(10).string(e.id), e.sessionId !== "" && n.uint32(18).string(e.sessionId), e.playerId !== "" && n.uint32(26).string(e.playerId), e.sessionData !== void 0 && Vi.encode(e.sessionData, n.uint32(34).fork()).join(), e.createdTime !== "0" && n.uint32(40).int64(e.createdTime), e.expireTime !== "0" && n.uint32(48).int64(e.expireTime), e.version !== 0 && n.uint32(56).int32(e.version), e.encryptionData !== void 0 && Mi.encode(e.encryptionData, n.uint32(66).fork()).join(), e.sessionDepth !== 0 && n.uint32(72).int32(e.sessionDepth), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = kl();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.id = t.string();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.sessionId = t.string();
          continue;
        }
        case 3: {
          if (i !== 26)
            break;
          r.playerId = t.string();
          continue;
        }
        case 4: {
          if (i !== 34)
            break;
          r.sessionData = Vi.decode(t, t.uint32());
          continue;
        }
        case 5: {
          if (i !== 40)
            break;
          r.createdTime = t.int64().toString();
          continue;
        }
        case 6: {
          if (i !== 48)
            break;
          r.expireTime = t.int64().toString();
          continue;
        }
        case 7: {
          if (i !== 56)
            break;
          r.version = t.int32();
          continue;
        }
        case 8: {
          if (i !== 66)
            break;
          r.encryptionData = Mi.decode(t, t.uint32());
          continue;
        }
        case 9: {
          if (i !== 72)
            break;
          r.sessionDepth = t.int32();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Gi.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r, i, o, s;
    const u = kl();
    return u.id = (n = e.id) !== null && n !== void 0 ? n : "", u.sessionId = (t = e.sessionId) !== null && t !== void 0 ? t : "", u.playerId = (a = e.playerId) !== null && a !== void 0 ? a : "", u.sessionData = e.sessionData !== void 0 && e.sessionData !== null ? Vi.fromPartial(e.sessionData) : void 0, u.createdTime = (r = e.createdTime) !== null && r !== void 0 ? r : "0", u.expireTime = (i = e.expireTime) !== null && i !== void 0 ? i : "0", u.version = (o = e.version) !== null && o !== void 0 ? o : 0, u.encryptionData = e.encryptionData !== void 0 && e.encryptionData !== null ? Mi.fromPartial(e.encryptionData) : void 0, u.sessionDepth = (s = e.sessionDepth) !== null && s !== void 0 ? s : 0, u;
  }
};
var P;
(function(e) {
  e.Invalid = "Invalid", e.Aquarius = "Aquarius", e.Aries = "Aries", e.Cancer = "Cancer", e.Capricorn = "Capricorn", e.Gemini = "Gemini", e.Leo = "Leo", e.Libra = "Libra", e.Pisces = "Pisces", e.Sagittarius = "Sagittarius", e.Scorpio = "Scorpio", e.Taurus = "Taurus", e.Virgo = "Virgo", e.UNRECOGNIZED = "UNRECOGNIZED";
})(P || (P = {}));
function Pv(e) {
  switch (e) {
    case 0:
    case "Invalid":
      return P.Invalid;
    case 1:
    case "Aquarius":
      return P.Aquarius;
    case 2:
    case "Aries":
      return P.Aries;
    case 3:
    case "Cancer":
      return P.Cancer;
    case 4:
    case "Capricorn":
      return P.Capricorn;
    case 5:
    case "Gemini":
      return P.Gemini;
    case 6:
    case "Leo":
      return P.Leo;
    case 7:
    case "Libra":
      return P.Libra;
    case 8:
    case "Pisces":
      return P.Pisces;
    case 9:
    case "Sagittarius":
      return P.Sagittarius;
    case 10:
    case "Scorpio":
      return P.Scorpio;
    case 11:
    case "Taurus":
      return P.Taurus;
    case 12:
    case "Virgo":
      return P.Virgo;
    case -1:
    case "UNRECOGNIZED":
    default:
      return P.UNRECOGNIZED;
  }
}
function Lv(e) {
  switch (e) {
    case P.Invalid:
      return 0;
    case P.Aquarius:
      return 1;
    case P.Aries:
      return 2;
    case P.Cancer:
      return 3;
    case P.Capricorn:
      return 4;
    case P.Gemini:
      return 5;
    case P.Leo:
      return 6;
    case P.Libra:
      return 7;
    case P.Pisces:
      return 8;
    case P.Sagittarius:
      return 9;
    case P.Scorpio:
      return 10;
    case P.Taurus:
      return 11;
    case P.Virgo:
      return 12;
    case P.UNRECOGNIZED:
    default:
      return -1;
  }
}
function Tl() {
  return { avatarId: "", selfieId: "" };
}
const Bi = {
  encode(e, n = new I()) {
    return e.avatarId !== "" && n.uint32(10).string(e.avatarId), e.selfieId !== "" && n.uint32(18).string(e.selfieId), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Tl();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.avatarId = t.string();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.selfieId = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Bi.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t;
    const a = Tl();
    return a.avatarId = (n = e.avatarId) !== null && n !== void 0 ? n : "", a.selfieId = (t = e.selfieId) !== null && t !== void 0 ? t : "", a;
  }
};
function gl() {
  return { friendshipStart: void 0, lastInteraction: void 0, streak: 0 };
}
const Fi = {
  encode(e, n = new I()) {
    return e.friendshipStart !== void 0 && pe.encode(Pl(e.friendshipStart), n.uint32(10).fork()).join(), e.lastInteraction !== void 0 && pe.encode(Pl(e.lastInteraction), n.uint32(18).fork()).join(), e.streak !== 0 && n.uint32(24).uint32(e.streak), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = gl();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.friendshipStart = Ll(pe.decode(t, t.uint32()));
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.lastInteraction = Ll(pe.decode(t, t.uint32()));
          continue;
        }
        case 3: {
          if (i !== 24)
            break;
          r.streak = t.uint32();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Fi.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a;
    const r = gl();
    return r.friendshipStart = (n = e.friendshipStart) !== null && n !== void 0 ? n : void 0, r.lastInteraction = (t = e.lastInteraction) !== null && t !== void 0 ? t : void 0, r.streak = (a = e.streak) !== null && a !== void 0 ? a : 0, r;
  }
};
function bl() {
  return {
    userId: "",
    username: "",
    birthdate: "",
    displayName: "",
    countrycode: "",
    score: "0",
    bitmojiInfo: void 0,
    friendInfo: void 0,
    zodiac: P.Invalid
  };
}
const Hi = {
  encode(e, n = new I()) {
    return e.userId !== "" && n.uint32(10).string(e.userId), e.username !== "" && n.uint32(18).string(e.username), e.birthdate !== "" && n.uint32(26).string(e.birthdate), e.displayName !== "" && n.uint32(34).string(e.displayName), e.countrycode !== "" && n.uint32(42).string(e.countrycode), e.score !== "0" && n.uint32(56).uint64(e.score), e.bitmojiInfo !== void 0 && Bi.encode(e.bitmojiInfo, n.uint32(66).fork()).join(), e.friendInfo !== void 0 && Fi.encode(e.friendInfo, n.uint32(74).fork()).join(), e.zodiac !== P.Invalid && n.uint32(80).int32(Lv(e.zodiac)), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = bl();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.userId = t.string();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.username = t.string();
          continue;
        }
        case 3: {
          if (i !== 26)
            break;
          r.birthdate = t.string();
          continue;
        }
        case 4: {
          if (i !== 34)
            break;
          r.displayName = t.string();
          continue;
        }
        case 5: {
          if (i !== 42)
            break;
          r.countrycode = t.string();
          continue;
        }
        case 7: {
          if (i !== 56)
            break;
          r.score = t.uint64().toString();
          continue;
        }
        case 8: {
          if (i !== 66)
            break;
          r.bitmojiInfo = Bi.decode(t, t.uint32());
          continue;
        }
        case 9: {
          if (i !== 74)
            break;
          r.friendInfo = Fi.decode(t, t.uint32());
          continue;
        }
        case 10: {
          if (i !== 80)
            break;
          r.zodiac = Pv(t.int32());
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Hi.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r, i, o, s;
    const u = bl();
    return u.userId = (n = e.userId) !== null && n !== void 0 ? n : "", u.username = (t = e.username) !== null && t !== void 0 ? t : "", u.birthdate = (a = e.birthdate) !== null && a !== void 0 ? a : "", u.displayName = (r = e.displayName) !== null && r !== void 0 ? r : "", u.countrycode = (i = e.countrycode) !== null && i !== void 0 ? i : "", u.score = (o = e.score) !== null && o !== void 0 ? o : "0", u.bitmojiInfo = e.bitmojiInfo !== void 0 && e.bitmojiInfo !== null ? Bi.fromPartial(e.bitmojiInfo) : void 0, u.friendInfo = e.friendInfo !== void 0 && e.friendInfo !== null ? Fi.fromPartial(e.friendInfo) : void 0, u.zodiac = (s = e.zodiac) !== null && s !== void 0 ? s : P.Invalid, u;
  }
};
function Pl(e) {
  const n = Math.trunc(e.getTime() / 1e3).toString(), t = e.getTime() % 1e3 * 1e6;
  return { seconds: n, nanos: t };
}
function Ll(e) {
  let n = (globalThis.Number(e.seconds) || 0) * 1e3;
  return n += (e.nanos || 0) / 1e6, new globalThis.Date(n);
}
var F;
(function(e) {
  e.LIVE_CAMERA = "LIVE_CAMERA", e.STORY_REPLY = "STORY_REPLY", e.CHAT_REPLY = "CHAT_REPLY", e.RESTART = "RESTART", e.PREVIEW_CANCEL = "PREVIEW_CANCEL", e.MAP = "MAP", e.BITMOJI_STICKERS = "BITMOJI_STICKERS", e.POST_CAPTURE_PREVIEW = "POST_CAPTURE_PREVIEW", e.POST_CAPTURE_TRANSCODING = "POST_CAPTURE_TRANSCODING", e.UNRECOGNIZED = "UNRECOGNIZED";
})(F || (F = {}));
function Cv(e) {
  switch (e) {
    case 0:
    case "LIVE_CAMERA":
      return F.LIVE_CAMERA;
    case 1:
    case "STORY_REPLY":
      return F.STORY_REPLY;
    case 2:
    case "CHAT_REPLY":
      return F.CHAT_REPLY;
    case 3:
    case "RESTART":
      return F.RESTART;
    case 4:
    case "PREVIEW_CANCEL":
      return F.PREVIEW_CANCEL;
    case 5:
    case "MAP":
      return F.MAP;
    case 6:
    case "BITMOJI_STICKERS":
      return F.BITMOJI_STICKERS;
    case 7:
    case "POST_CAPTURE_PREVIEW":
      return F.POST_CAPTURE_PREVIEW;
    case 8:
    case "POST_CAPTURE_TRANSCODING":
      return F.POST_CAPTURE_TRANSCODING;
    case -1:
    case "UNRECOGNIZED":
    default:
      return F.UNRECOGNIZED;
  }
}
function wv(e) {
  switch (e) {
    case F.LIVE_CAMERA:
      return 0;
    case F.STORY_REPLY:
      return 1;
    case F.CHAT_REPLY:
      return 2;
    case F.RESTART:
      return 3;
    case F.PREVIEW_CANCEL:
      return 4;
    case F.MAP:
      return 5;
    case F.BITMOJI_STICKERS:
      return 6;
    case F.POST_CAPTURE_PREVIEW:
      return 7;
    case F.POST_CAPTURE_TRANSCODING:
      return 8;
    case F.UNRECOGNIZED:
    default:
      return -1;
  }
}
var nn;
(function(e) {
  e.NONE = "NONE", e.EXPERIMENTAL = "EXPERIMENTAL", e.UNRECOGNIZED = "UNRECOGNIZED";
})(nn || (nn = {}));
function Cl(e) {
  switch (e) {
    case 0:
    case "NONE":
      return nn.NONE;
    case 1:
    case "EXPERIMENTAL":
      return nn.EXPERIMENTAL;
    case -1:
    case "UNRECOGNIZED":
    default:
      return nn.UNRECOGNIZED;
  }
}
function Dv(e) {
  switch (e) {
    case nn.NONE:
      return 0;
    case nn.EXPERIMENTAL:
      return 1;
    case nn.UNRECOGNIZED:
    default:
      return -1;
  }
}
var Le;
(function(e) {
  e.DEFAULT = "DEFAULT", e.REPLAY_STREAM = "REPLAY_STREAM", e.UNRECOGNIZED = "UNRECOGNIZED";
})(Le || (Le = {}));
function yv(e) {
  switch (e) {
    case 0:
    case "DEFAULT":
      return Le.DEFAULT;
    case 1:
    case "REPLAY_STREAM":
      return Le.REPLAY_STREAM;
    case -1:
    case "UNRECOGNIZED":
    default:
      return Le.UNRECOGNIZED;
  }
}
function Uv(e) {
  switch (e) {
    case Le.DEFAULT:
      return 0;
    case Le.REPLAY_STREAM:
      return 1;
    case Le.UNRECOGNIZED:
    default:
      return -1;
  }
}
var D;
(function(e) {
  e.ACTIVATION_SOURCE_UNSET = "ACTIVATION_SOURCE_UNSET", e.ACTIVATION_SOURCE_DEFAULT = "ACTIVATION_SOURCE_DEFAULT", e.CREATIVE = "CREATIVE", e.SCAN = "SCAN", e.SCAN_HISTORY = "SCAN_HISTORY", e.CHAT_FEED_PSA = "CHAT_FEED_PSA", e.GROWTH_NOTIFICATION = "GROWTH_NOTIFICATION", e.MASS_SNAP = "MASS_SNAP", e.SMART_CTA = "SMART_CTA", e.MASS_CHAT = "MASS_CHAT", e.BILLBOARD_FHP = "BILLBOARD_FHP", e.LENS_ACTIVITY_CENTER = "LENS_ACTIVITY_CENTER", e.AR_BAR = "AR_BAR", e.UNRECOGNIZED = "UNRECOGNIZED";
})(D || (D = {}));
function Mv(e) {
  switch (e) {
    case 0:
    case "ACTIVATION_SOURCE_UNSET":
      return D.ACTIVATION_SOURCE_UNSET;
    case 1:
    case "ACTIVATION_SOURCE_DEFAULT":
      return D.ACTIVATION_SOURCE_DEFAULT;
    case 2:
    case "CREATIVE":
      return D.CREATIVE;
    case 3:
    case "SCAN":
      return D.SCAN;
    case 4:
    case "SCAN_HISTORY":
      return D.SCAN_HISTORY;
    case 5:
    case "CHAT_FEED_PSA":
      return D.CHAT_FEED_PSA;
    case 6:
    case "GROWTH_NOTIFICATION":
      return D.GROWTH_NOTIFICATION;
    case 7:
    case "MASS_SNAP":
      return D.MASS_SNAP;
    case 8:
    case "SMART_CTA":
      return D.SMART_CTA;
    case 9:
    case "MASS_CHAT":
      return D.MASS_CHAT;
    case 10:
    case "BILLBOARD_FHP":
      return D.BILLBOARD_FHP;
    case 11:
    case "LENS_ACTIVITY_CENTER":
      return D.LENS_ACTIVITY_CENTER;
    case 12:
    case "AR_BAR":
      return D.AR_BAR;
    case -1:
    case "UNRECOGNIZED":
    default:
      return D.UNRECOGNIZED;
  }
}
function Vv(e) {
  switch (e) {
    case D.ACTIVATION_SOURCE_UNSET:
      return 0;
    case D.ACTIVATION_SOURCE_DEFAULT:
      return 1;
    case D.CREATIVE:
      return 2;
    case D.SCAN:
      return 3;
    case D.SCAN_HISTORY:
      return 4;
    case D.CHAT_FEED_PSA:
      return 5;
    case D.GROWTH_NOTIFICATION:
      return 6;
    case D.MASS_SNAP:
      return 7;
    case D.SMART_CTA:
      return 8;
    case D.MASS_CHAT:
      return 9;
    case D.BILLBOARD_FHP:
      return 10;
    case D.LENS_ACTIVITY_CENTER:
      return 11;
    case D.AR_BAR:
      return 12;
    case D.UNRECOGNIZED:
    default:
      return -1;
  }
}
function wl() {
  return {
    snappable: void 0,
    lures: void 0,
    userId: "",
    entryPoint: F.LIVE_CAMERA,
    userData: void 0,
    persistentStore: void 0,
    launchParams: void 0,
    apiDescriptors: [],
    renderConfig: Le.DEFAULT,
    activationSource: D.ACTIVATION_SOURCE_UNSET,
    overridenLaunchTime: void 0
  };
}
const Oa = {
  encode(e, n = new I()) {
    e.snappable !== void 0 && Gi.encode(e.snappable, n.uint32(10).fork()).join(), e.lures !== void 0 && yi.encode(e.lures, n.uint32(18).fork()).join(), e.userId !== "" && n.uint32(26).string(e.userId), e.entryPoint !== F.LIVE_CAMERA && n.uint32(32).int32(wv(e.entryPoint)), e.userData !== void 0 && Hi.encode(e.userData, n.uint32(42).fork()).join(), e.persistentStore !== void 0 && Ui.encode(e.persistentStore, n.uint32(50).fork()).join(), e.launchParams !== void 0 && wi.encode(e.launchParams, n.uint32(58).fork()).join(), n.uint32(66).fork();
    for (const t of e.apiDescriptors)
      n.int32(Dv(t));
    return n.join(), e.renderConfig !== Le.DEFAULT && n.uint32(72).int32(Uv(e.renderConfig)), e.activationSource !== D.ACTIVATION_SOURCE_UNSET && n.uint32(80).int32(Vv(e.activationSource)), e.overridenLaunchTime !== void 0 && pe.encode(Gv(e.overridenLaunchTime), n.uint32(90).fork()).join(), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = wl();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.snappable = Gi.decode(t, t.uint32());
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.lures = yi.decode(t, t.uint32());
          continue;
        }
        case 3: {
          if (i !== 26)
            break;
          r.userId = t.string();
          continue;
        }
        case 4: {
          if (i !== 32)
            break;
          r.entryPoint = Cv(t.int32());
          continue;
        }
        case 5: {
          if (i !== 42)
            break;
          r.userData = Hi.decode(t, t.uint32());
          continue;
        }
        case 6: {
          if (i !== 50)
            break;
          r.persistentStore = Ui.decode(t, t.uint32());
          continue;
        }
        case 7: {
          if (i !== 58)
            break;
          r.launchParams = wi.decode(t, t.uint32());
          continue;
        }
        case 8: {
          if (i === 64) {
            r.apiDescriptors.push(Cl(t.int32()));
            continue;
          }
          if (i === 66) {
            const o = t.uint32() + t.pos;
            for (; t.pos < o; )
              r.apiDescriptors.push(Cl(t.int32()));
            continue;
          }
          break;
        }
        case 9: {
          if (i !== 72)
            break;
          r.renderConfig = yv(t.int32());
          continue;
        }
        case 10: {
          if (i !== 80)
            break;
          r.activationSource = Mv(t.int32());
          continue;
        }
        case 11: {
          if (i !== 90)
            break;
          r.overridenLaunchTime = Bv(pe.decode(t, t.uint32()));
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Oa.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r, i, o;
    const s = wl();
    return s.snappable = e.snappable !== void 0 && e.snappable !== null ? Gi.fromPartial(e.snappable) : void 0, s.lures = e.lures !== void 0 && e.lures !== null ? yi.fromPartial(e.lures) : void 0, s.userId = (n = e.userId) !== null && n !== void 0 ? n : "", s.entryPoint = (t = e.entryPoint) !== null && t !== void 0 ? t : F.LIVE_CAMERA, s.userData = e.userData !== void 0 && e.userData !== null ? Hi.fromPartial(e.userData) : void 0, s.persistentStore = e.persistentStore !== void 0 && e.persistentStore !== null ? Ui.fromPartial(e.persistentStore) : void 0, s.launchParams = e.launchParams !== void 0 && e.launchParams !== null ? wi.fromPartial(e.launchParams) : void 0, s.apiDescriptors = ((a = e.apiDescriptors) === null || a === void 0 ? void 0 : a.map((u) => u)) || [], s.renderConfig = (r = e.renderConfig) !== null && r !== void 0 ? r : Le.DEFAULT, s.activationSource = (i = e.activationSource) !== null && i !== void 0 ? i : D.ACTIVATION_SOURCE_UNSET, s.overridenLaunchTime = (o = e.overridenLaunchTime) !== null && o !== void 0 ? o : void 0, s;
  }
};
function Gv(e) {
  const n = Math.trunc(e.getTime() / 1e3).toString(), t = e.getTime() % 1e3 * 1e6;
  return { seconds: n, nanos: t };
}
function Bv(e) {
  let n = (globalThis.Number(e.seconds) || 0) * 1e3;
  return n += (e.nanos || 0) / 1e6, new globalThis.Date(n);
}
const Kf = {
  aquarius: P.Aquarius,
  aries: P.Aries,
  cancer: P.Cancer,
  capricorn: P.Capricorn,
  gemini: P.Gemini,
  leo: P.Leo,
  libra: P.Libra,
  pisces: P.Pisces,
  sagittarius: P.Sagittarius,
  scorpio: P.Scorpio,
  taurus: P.Taurus,
  virgo: P.Virgo
}, Fv = new Set(Object.keys(Kf));
function Hv(e) {
  return Fv.has(e);
}
function Kv(e) {
  return $(e) || Yv(e);
}
function Yv(e) {
  return K(e) && Ye(e.userId) && Wv(e.userData) && Qv(e.launchParams);
}
function Wv(e) {
  return $(e) || zv(e);
}
function zv(e) {
  return K(e) && Ye(e.userId) && Ye(e.username) && Ye(e.birthdate) && Ye(e.displayName) && Ye(e.countrycode) && Ye(e.score) && qv(e.bitmojiInfo) && Zv(e.friendInfo) && Xv(e.zodiac);
}
function qv(e) {
  return $(e) || $v(e);
}
function $v(e) {
  return K(e) && Ye(e.avatarId) && Ye(e.selfieId);
}
function Zv(e) {
  return $(e) || Jv(e);
}
function Jv(e) {
  return K(e) && yo(e.friendshipStart) && yo(e.lastInteraction) && Kd(e.streak);
}
function Xv(e) {
  return $(e) || Hv(e);
}
function Qv(e) {
  return $(e) || jv(e);
}
function jv(e) {
  return K(e) && Va(xv)(e);
}
function xv(e) {
  return G(e) || Wn(e) || qe(G, e) || qe(Wn, e);
}
const eE = (e, n) => {
  var t;
  return Oa.encode(Oa.fromPartial(Object.assign(Object.assign({}, e), { userData: e.userData ? Object.assign(Object.assign({}, e.userData), { zodiac: !((t = e.userData) === null || t === void 0) && t.zodiac ? Kf[e.userData.zodiac] : void 0 }) : void 0, launchParams: e.launchParams ? nE(e.launchParams) : void 0, persistentStore: { store: new Uint8Array(n) } }))).finish().slice();
};
function nE(e) {
  return { data: new TextEncoder().encode(JSON.stringify(e)) };
}
class on {
  constructor(n) {
    this.matrix = n;
  }
}
on.MirrorX = new on([-1, 0, 0, 0, 1, 0, 1, 0, 1]);
on.MirrorY = new on([1, 0, 0, 0, -1, 0, 0, 1, 1]);
on.Identity = new on([1, 0, 0, 0, 1, 0, 0, 0, 1]);
function tE(e) {
  return e instanceof on;
}
const Eo = {
  cameraType: "user",
  fpsLimit: Number.POSITIVE_INFINITY
}, Kr = (e) => new Error(`${e}. This CameraKitSource is not attached to a CameraKitSession.`), iE = new Set(Object.keys({
  user: 0,
  environment: 0
}));
function rE(e) {
  return e instanceof So;
}
function aE(e) {
  return $(e) || oE(e);
}
function oE(e) {
  return K(e) && uE(e.cameraType) && Kd(e.fpsLimit);
}
function sE(e) {
  return iE.has(e);
}
function uE(e) {
  return $(e) || sE(e);
}
let So = (() => {
  var e;
  let n = [], t, a;
  return e = class Yf {
    constructor(i, o = {}, s = {}) {
      this.sourceInfo = (ft(this, n), i), this.subscriber = o, this.deviceInfo = Object.assign(Object.assign({}, Eo), Cn(s));
    }
    attach(i, o, s) {
      return O(this, void 0, void 0, function* () {
        if (this.lensCore)
          throw new Error("This CameraKitSource has already been attached to this CameraKitSession and cannot be reattached, even after detachment.");
        this.lensCore = i, yield i.useMediaElement({
          autoplayNewMedia: !1,
          autoplayPreviewCanvas: !1,
          media: this.sourceInfo.media,
          pauseExistingMedia: !1,
          replayTrackingData: this.sourceInfo.replayTrackingData,
          startOnFrontCamera: ["user", "front"].includes(this.deviceInfo.cameraType),
          useManualFrameProcessing: this.sourceInfo.useManualFrameProcessing
        });
        const u = this.deviceInfo.fpsLimit < Number.POSITIVE_INFINITY ? this.deviceInfo.fpsLimit : 0;
        yield i.setFPSLimit({ fps: u }), yield i.setRenderSize({ mode: "matchInputResolution" }), this.subscriber.onAttach && (yield this.subscriber.onAttach(this, i, s, o));
      });
    }
    copy(i = {}) {
      return new Yf(this.sourceInfo, this.subscriber, Object.assign(Object.assign({}, this.deviceInfo), i));
    }
    detach(i) {
      if (!this.lensCore)
        return Promise.reject(Kr("Cannot detach"));
      if (this.subscriber.onDetach)
        return this.subscriber.onDetach(i);
    }
    setRenderSize(i, o) {
      if (!this.lensCore)
        return Promise.reject(Kr("Cannot setRenderSize"));
      const s = { width: i, height: o };
      return this.lensCore.setRenderSize({ mode: "explicit", target: s });
    }
    setTransform(i) {
      if (!this.lensCore)
        return Promise.reject(Kr("Cannot setTransform"));
      const o = new Float32Array(i.matrix);
      return this.lensCore.setInputTransform({ matrix: o });
    }
  }, t = [be(Wn, Wn)], a = [be(tE)], Q(e, null, t, { kind: "method", name: "setRenderSize", static: !1, private: !1, access: { has: (r) => "setRenderSize" in r, get: (r) => r.setRenderSize } }, null, n), Q(e, null, a, { kind: "method", name: "setTransform", static: !1, private: !1, access: { has: (r) => "setTransform" in r, get: (r) => r.setTransform } }, null, n), e;
})();
function cE(e, n, t = ya) {
  return (a) => new Y((r) => {
    let i = 0;
    return a.pipe(Ne((o) => {
      i++, i <= e && r.next({ type: "initial", value: o });
    }), bh(a.pipe(Lh(n, t))), Ne((o) => {
      i > e && r.next({ type: "debounced", values: o.slice(e) }), i = 0;
    })).subscribe();
  });
}
const lE = Object.assign(Object.assign({}, Eo), { transform: on.Identity, disableSourceAudio: !1 });
function Dl(e) {
  e && (e.port.close(), e.port.onmessage = null, e.disconnect());
}
function yl(e) {
  return O(this, void 0, void 0, function* () {
    if (!(!e || e.state === "closed"))
      return e.close();
  });
}
function dE(e, n) {
  return e.pipe(cE(1, 1e3), g((t) => {
    if (t.type === "initial")
      n(new Error("The first audio processing error before debouncing.", { cause: t.value }));
    else if (t.type === "debounced") {
      const a = [...new Set(t.values.map(Ya))].join(`
`);
      n(new Error(`Debounced ${t.values.length} audio processing errors.`, {
        cause: new Error(a)
      }));
    }
  })).subscribe();
}
function fE(e, n = {}) {
  var t;
  const { facingMode: a } = e.getVideoTracks().length > 0 ? e.getVideoTracks()[0].getSettings() : { facingMode: void 0 }, r = a === "user" || a === "environment" ? a : void 0, i = Object.assign(Object.assign(Object.assign({}, lE), Cn(n)), { cameraType: (t = n.cameraType) !== null && t !== void 0 ? t : r }), o = e.getAudioTracks().length > 0 && !i.disableSourceAudio, s = 44100;
  let u, c, d, m;
  if (o) {
    const f = `
        class MicrophoneWorkletProcessor extends AudioWorkletProcessor {
            process(inputs, outputs, parameters) {
                this.port.postMessage({
                    eventType: 'data',
                    buffer: inputs
                });
                return true;
            }
        }
        registerProcessor('microphone-worklet', MicrophoneWorkletProcessor);`, E = new Blob([f], {
      type: "application/javascript"
    });
    m = URL.createObjectURL(E);
  }
  let l;
  return new So({ media: e }, {
    onAttach: (f, E, v) => O(this, void 0, void 0, function* () {
      if (yield f.setTransform(i.transform), o) {
        const p = new de();
        l = dE(p, v), yield E.setAudioParameters({
          parameters: {
            numChannels: 2,
            sampleRate: s
          }
        });
        try {
          Dl(d), c == null || c.disconnect(), yield yl(u);
        } catch (_) {
          v(un(_));
        }
        u = new AudioContext(), c = u.createMediaStreamSource(e);
        const S = c;
        u.audioWorklet.addModule(m).then(() => {
          u && (d = new AudioWorkletNode(u, "microphone-worklet"), S.connect(d), d.connect(u.destination), d.port.onmessage = (_) => {
            if (_.data.eventType === "data") {
              const A = _.data.buffer[0][0];
              if (!A)
                return;
              let N = [A];
              {
                const k = _.data.buffer[0].length > 1 ? _.data.buffer[0][1] : A.slice();
                N.push(k);
              }
              E.processAudioSampleBuffer({ input: N }).catch((k) => p.next(k));
            }
          });
        }).catch((_) => {
          v(_);
        });
      }
    }),
    onDetach: (f) => O(this, void 0, void 0, function* () {
      d && (Dl(d), d = void 0), c && (c.disconnect(), c = void 0), u && (yield yl(u).catch(f), u = void 0), l && (l.unsubscribe(), l = void 0);
    })
  }, i);
}
const mE = Object.assign(Object.assign({}, Eo), { trackingData: new ArrayBuffer(0) });
function hE(e, n = {}) {
  const { trackingData: t } = Object.assign(Object.assign({}, mE), Cn(n)), a = t.byteLength > 0 ? { buffer: t } : void 0;
  return new So({
    media: e,
    replayTrackingData: a
  }, {}, n);
}
const pr = R("logEntries", () => Bd().asObservable()), Ul = () => ({
  avgFps: 0,
  averageProcessingTime: 0,
  n: 0,
  processingTimeBuckets: new Uint32Array(Wf + 1),
  procFrameCount: 0,
  procFrameMean: 0,
  procFrameD2: 0
}), pE = 1, Wf = 200;
class vE {
  constructor(n) {
    this.instances = n, this.state = Object.assign({}, Ul()), this.instances.add(this);
  }
  update(n) {
    this.computeRunningStats(n);
  }
  measure() {
    let n = 0, t = 0;
    for (; n < this.state.processingTimeBuckets.length && (t += this.state.processingTimeBuckets[n], !(t >= (this.state.n + 1) / 2)); n++)
      ;
    return {
      avgFps: this.state.avgFps,
      lensFrameProcessingTimeMsAvg: this.state.procFrameMean,
      lensFrameProcessingTimeMsStd: Math.sqrt(this.state.procFrameD2 / this.state.procFrameCount),
      lensFrameProcessingTimeMsMedian: this.state.n > 0 ? n : 0,
      lensFrameProcessingN: this.state.n
    };
  }
  reset() {
    this.state = Object.assign({}, Ul());
  }
  end() {
    this.instances.delete(this);
  }
  computeRunningStats(n) {
    const t = n - this.state.procFrameMean;
    this.state.procFrameCount += 1, this.state.procFrameMean += t / this.state.procFrameCount;
    const a = n - this.state.procFrameMean;
    if (this.state.procFrameD2 += t * a, this.priorFrameCompletedTime === void 0)
      this.priorFrameCompletedTime = performance.now();
    else {
      const r = (performance.now() - this.priorFrameCompletedTime) / 1e3;
      r < pE && (this.state.avgFps = (this.state.avgFps + 1 / r) / 2), this.priorFrameCompletedTime = performance.now();
    }
    this.state.n++, this.state.processingTimeBuckets[Math.min(Math.round(n), Wf)]++;
  }
}
const Yr = U("RenderingMetrics");
let EE = (() => {
  var e;
  let n = [], t;
  return e = class {
    constructor(r) {
      this.measurementInstances = (ft(this, n), void 0), this.measurementInstances = /* @__PURE__ */ new Set(), this.subscription = r.subscribe({
        next: (i) => {
          try {
            for (const o of this.measurementInstances.values())
              o.update(i.processingTimeMs);
          } catch (o) {
            Yr.error(o);
          }
        },
        error: (i) => {
          Yr.error(i);
        }
      });
    }
    beginMeasurement() {
      return new vE(this.measurementInstances);
    }
    destroy() {
      this.subscription.unsubscribe();
    }
  }, t = [ie(Yr)], Q(e, null, t, { kind: "method", name: "beginMeasurement", static: !1, private: !1, access: { has: (a) => "beginMeasurement" in a, get: (a) => a.beginMeasurement } }, null, n), e;
})();
const SE = U("LensPersistenceStore"), zf = R("lensPersistenceStore", [ae.token], (e) => {
  const n = new Zn({ databaseName: "lensPersistenceStore" });
  return e.registerSavePersistentStoreCallback((t, a) => O(void 0, void 0, void 0, function* () {
    try {
      yield n.store(t, a);
    } catch (r) {
      SE.error(jh(`Error occurred while storing data for lens ${t}.`, r));
    }
  })), n;
});
function IE(e) {
  return (n) => (t) => n((r) => {
    const i = r.slice();
    return [i.shift()].concat(e.map((o) => {
      var s;
      return `${(s = t[o]) !== null && s !== void 0 ? s : ""}${i.shift()}`;
    })).concat(i).join("");
  });
}
const L = IE(["privacyPolicyUrl", "termsOfServiceUrl", "learnMoreUrl"]), nr = {
  "en-US": {
    legalPromptMessage: L((e) => e`By using Lenses, you acknowledge reading Snap’s <a href="${0}" target="_blank">Privacy Policy</a> and agree to Snap’s <a href="${0}" target="_blank">Terms of Service</a>. Some lenses use information about your face, hands and voice to work. <a href="${0}" target="_blank">Learn More</a>, and if you want to agree and continue, tap below.`),
    legalPromptAccept: "I Agree",
    legalPromptReject: "Dismiss",
    legalPromptTermsOfService: "Terms of Service",
    legalPromptVariantGMessage: "This feature uses information about face(s), hands and voice(s) detected by the camera and microphone to work. With this feature, you can apply fun and useful augmented reality effects on top of selfies and images. Our camera uses technology to locate certain features (like where your hands, eyes, and nose are) and uses that information to accurately position the feature with the image sensed by the camera. Any information that is collected will be deleted as soon as possible (typically soon after the app is closed) and always within no more than three years.<br/><br/>If you want to agree and continue, tap below.",
    legalPromptVariantGAdultOrChild: "Are you an adult or child?",
    legalPromptVariantGFindYourParent: "Please find your parent or legal guardian.",
    legalPromptVariantGIAmGuardian: "I am the child's guardian",
    legalPromptVariantGCancel: "Cancel",
    legalPromptVariantGAdult: "Adult",
    legalPromptVariantGChild: "Child"
  },
  ar: {
    legalPromptMessage: L((e) => e`باستخدامك للعدسات، فأنت تقر بقراءتك <a href="${0}" target="_blank">لسياسة الخصوصية</a> وتوافق على <a href="${0}" target="_blank">شروط الخدمة</a> الخاصة بسناب. تستخدم بعض العدسات معلومات عن وجهك ويديك وصوتك لكي تعمل. <a href="${0}" target="_blank">تعرّف على مزيد من المعلومات</a>، وإذا أردت الموافقة والاستمرار فالمس أدناه.`),
    legalPromptAccept: "أنا أوافق",
    legalPromptReject: "تجاهل",
    legalPromptTermsOfService: "شروط الخدمة",
    legalPromptVariantGMessage: "تستخدم هذه الميزة معلومات تتعلق بالوجه(الوجوه) واليدين والصوت(الأصوات) تكتشفها الكاميرا والميكروفون للعمل. وباستخدام هذه الميزة، يمكنك تطبيق تأثيرات الواقع المُعزّز الممتعة والمفيدة على صور السيلفي والصور. تستخدم الكاميرا لدينا التكنولوجيا لتحديد مكان ملامح معيَّنة (مثل مكان وجود يديك وعينيك وأنفك) وتستخدم هذه المعلومات لتحديد مكان الملامح بدقة مع الصورة التي تستشعرها الكاميرا. سيتم حذف أي معلومات يتم جمعها في أقرب وقت ممكن (عادةً بعد إغلاق التطبيق بفترة وجيزة) وخلال فترة لا تزيد عن ثلاث سنوات دائمًا.<br/><br/>إذا كنت تريد الموافقة والمتابعة، فالمس أدناه.",
    legalPromptVariantGAdultOrChild: "هل أنت شخص بالغ أم طفل؟",
    legalPromptVariantGFindYourParent: "يُرجى البحث عن وليّ أمرك أو الوصي القانوني.",
    legalPromptVariantGIAmGuardian: "أنا الوصي على الطفل",
    legalPromptVariantGCancel: "إلغاء",
    legalPromptVariantGAdult: "شخص بالغ",
    legalPromptVariantGChild: "طفل"
  },
  "bn-BD": {
    legalPromptMessage: L((e) => e`লেন্সগুলি ব্যবহার করার মাধ্যমে আপনি Snap-এর <a href="${0}" target="_blank">গোপনীয়তা নীতি</a> পড়েছেন এবং Snap-এর <a href="${0}" target="_blank">পরিষেবার শর্তাবলী</a>-তে সম্মত হচ্ছেন বলে স্বীকার করছেন। কিছু কিছু লেন্স কাজ করার জন্য আপনার মুখ, হাত ও কন্ঠস্বর ব্যবহার করে। <a href="${0}" target="_blank">আরো জানুন</a> এবং আপনি যদি সম্মত হতে ও চালিয়ে যেতে চান তবে নিচে ট্যাপ করুন।`),
    legalPromptAccept: "আমি সম্মতি দিচ্ছি",
    legalPromptReject: "খারিজ করুন",
    legalPromptTermsOfService: "পরিষেবার শর্তাবলী",
    legalPromptVariantGMessage: "কাজ করতে এই বৈশিষ্ট্যটি ক্যামেরা এবং মাইক্রোফোন দ্বারা শনাক্ত করা মুখ, হাত এবং কণ্ঠস্বর সম্পর্কে তথ্য ব্যবহার করে। এই বৈশিষ্ট্যটি দিয়ে আপনি সেলফি এবং ছবির উপর মজার এবং উপযোগী অগমেন্টেড রিয়ালিটির ইফেক্ট প্রয়োগ করতে পারবেন। আমাদের ক্যামেরা নির্দিষ্ট বৈশিষ্ট্যগুলি (যেমন আপনার হাত, চোখ এবং নাক কোথায়) শনাক্ত করতে প্রযুক্তি ব্যবহার করে এবং ক্যামেরা দ্বারা আঁচ করা ছবির সাথে বৈশিষ্ট্যটিকে সঠিকভাবে অবস্থান করতে সেই তথ্য ব্যবহার করে। সংগৃহীত যেকোনো তথ্য যত তাড়াতাড়ি সম্ভব মুছে ফেলা হবে (সাধারণত অ্যাপটি বন্ধ হওয়ার পরেই) এবং কোনো সময়েই তা তিন বছরের বেশি রাখা হবে না।<br/><br/>আপনি যদি সম্মত হতে চান এবং চালিয়ে যেতে চান তাহলে নিচে ট্যাপ করুন।",
    legalPromptVariantGAdultOrChild: "আপনি একজন প্রাপ্তবয়স্ক না শিশু?",
    legalPromptVariantGFindYourParent: "অনুগ্রহ করে আপনার পিতামাতা বা আইনি অভিভাবককে খুঁজুন।",
    legalPromptVariantGIAmGuardian: "আমি শিশুটির অভিভাবক",
    legalPromptVariantGCancel: "বাতিল করুন",
    legalPromptVariantGAdult: "প্রাপ্তবয়স্ক",
    legalPromptVariantGChild: "শিশু"
  },
  "bn-IN": {
    legalPromptMessage: L((e) => e`লেন্স ব্যবহার করে, আপনি Snap\'এর \"<a href="${0}" target="_blank">\"গোপনীয়তার নীতি</a> পড়েছেন এবং Snap\'এর <a href="${0}" target="_blank">পরিষেবার শর্তাবলী</a>-তে সম্মত হচ্ছেন বলে স্বীকার করছেন। কিছু কিছু লেন্স কাজ করার জন্য আপনার মুখ, হাত ও কন্ঠস্বরের তথ্য ব্যবহার করে। <a href="${0}" target="_blank">আরও জানুন</a> এবং আপনি সম্মত হলে ও চালিয়ে যেতে চাইলে নিচে ট্যাপ করুন।`),
    legalPromptAccept: "আমি সম্মত",
    legalPromptReject: "খারিজ করুন",
    legalPromptTermsOfService: "পরিষেবার শর্তাবলী",
    legalPromptVariantGMessage: "কাজ করার জন্য এই বৈশিষ্ট্যটি ক্যামেরা এবং মাইক্রোফোন দ্বারা শনাক্ত করা মুখ(গুলি), হাত এবং ভয়েস(গুলি) সম্পর্কিত তথ্য ব্যবহার করে৷ এই বৈশিষ্ট্যটির সাহায্যে, আপনি সেলফি এবং ছবিগুলির উপরে মজাদার এবং দরকারী অগমেন্টেড রিয়েলিটি প্রভাব প্রয়োগ করতে পারেন। আমাদের ক্যামেরা নির্দিষ্ট কিছু বৈশিষ্ট্য শনাক্ত করতে প্রযুক্তি ব্যবহার করে (যেমন আপনার হাত, চোখ এবং নাক কোথায়) এবং ক্যামেরা দ্বারা সংবেদিত ছবির সাথে বৈশিষ্ট্যটিকে ঠিক জায়গায় বসাতে সেই তথ্য ব্যবহার সবসময়ই তিন বছরের কম সময়ের মধ্যে। <br/><br/>আপনি যদি সম্মত থাকেন এবং চালিয়ে যেতে চান, নিচে ট্যাপ করুন।",
    legalPromptVariantGAdultOrChild: "আপনি কি একজন প্রাপ্তবয়স্ক না শিশু?",
    legalPromptVariantGFindYourParent: "অনুগ্রহ করে আপনার মা-বাবা বা আইনী অভিভাবককে খুঁজুন।",
    legalPromptVariantGIAmGuardian: "আমি শিশুটির অভিভাবক",
    legalPromptVariantGCancel: "বাতিল করুন",
    legalPromptVariantGAdult: "প্রাপ্তবয়স্ক",
    legalPromptVariantGChild: "শিশু"
  },
  "da-DK": {
    legalPromptMessage: L((e) => e`Når du anvender Linser, bekræfter du, at du har læst Snaps <a href="${0}" target="_blank">privatlivspolitik</a> og accepterer Snaps <a href="${0}" target="_blank">servicevilkår</a>. Nogle Linser bruger information om dit ansigt, dine hænder og din stemme for at fungere. <a href="${0}" target="_blank">Få mere at vide</a>, og tryk nedenfor, hvis du vil acceptere og fortsætte.`),
    legalPromptAccept: "Jeg er enig",
    legalPromptReject: "Afvis",
    legalPromptTermsOfService: "Servicevilkår",
    legalPromptVariantGMessage: "Denne funktion bruger oplysninger om ansigt(er), hænder og stemme(r), der registreres af kameraet og mikrofonen, for at kunne fungere. Med denne funktion kan du anvende sjove og nyttige augmented reality-effekter på selfies og billeder. Vores kamera bruger teknologi til at finde bestemte træk (f.eks. hvor dine hænder, øjne og næse er) og bruger disse oplysninger til nøjagtigt at placere trækket i billedet, der opfanges af kameraet. Alle oplysninger, der indsamles, slettes så hurtigst som muligt (typisk kort efter, at appen lukkes) og altid inden for højst tre år.<br/><br/>Tryk herunder, hvis du accepterer og vil fortsætte.",
    legalPromptVariantGAdultOrChild: "Er du voksen eller barn?",
    legalPromptVariantGFindYourParent: "Find din forælder eller værge.",
    legalPromptVariantGIAmGuardian: "Jeg er barnets værge",
    legalPromptVariantGCancel: "Annuller",
    legalPromptVariantGAdult: "Voksen",
    legalPromptVariantGChild: "Barn"
  },
  "de-DE": {
    legalPromptMessage: L((e) => e`Wenn du Linsen verwendet, versicherst du, dass du die <a href="${0}" target="_blank">Datenschutzbestimmungen</a> von Snap gelesen hast und den <a href="${0}" target="_blank">Servicebestimmungen</a> von Snap zustimmst. Manche Linsen verarbeiten Informationen zu deinem Gesicht, deinen Händen und deiner Stimme, um zu funktionieren. <a href="${0}" target="_blank">Hier erfährst du mehr.</a> Tippe unten, wenn du zustimmen und fortfahren möchtest.`),
    legalPromptAccept: "Zustimmen",
    legalPromptReject: "Ablehnen",
    legalPromptTermsOfService: "Servicebestimmungen",
    legalPromptVariantGMessage: "Diese Funktion verwendet Informationen über Gesichter, Hände und Stimmen, die von der Kamera und dem Mikrofon erkannt werden. Mit dieser Funktion kannst du lustige und nützliche Augmented Reality-Effekte auf Selfies und Bilder anwenden. Unsere Kamera nutzt Technologien, um bestimmte Merkmale zu lokalisieren (z. B. wo sich deine Hände, Augen und Nase befinden), und verwendet diese Informationen, um dieses Merkmal dann exakt über das von der Kamera erfasste Bild zu positionieren. Alle gesammelten Informationen werden so schnell wie möglich gelöscht (in der Regel kurz nach dem Schließen der App), spätestens aber innerhalb von drei Jahren.<br/><br/>Tippe unten, um zuzustimmen und fortzufahren.",
    legalPromptVariantGAdultOrChild: "Bist du erwachsen oder minderjährig?",
    legalPromptVariantGFindYourParent: "Bitte hole ein Elternteil oder Erziehungsberechtigten.",
    legalPromptVariantGIAmGuardian: "Ich bin der Erziehungsberechtigte des Kindes.",
    legalPromptVariantGCancel: "Abbrechen",
    legalPromptVariantGAdult: "Erwachsen",
    legalPromptVariantGChild: "Minderjährig"
  },
  "el-GR": {
    legalPromptMessage: L((e) => e`Χρησιμοποιώντας τους Φακούς, αναγνωρίζεις ότι έχεις διαβάσει την <a href="${0}" target="_blank">Πολιτική απορρήτου</a> του Snap και ότι συμφωνείς με τους <a href="${0}" target="_blank">Όρους υπηρεσίας</a> του Snap. Ορισμένοι Φακοί χρησιμοποιούν πληροφορίες σχετικά με το πρόσωπο, τα χέρια και τη φωνή σου για να λειτουργήσουν. <a href="${0}" target="_blank">Μάθε περισσότερα</a> και αν θέλεις να συμφωνήσεις και να συνεχίσεις, άγγιξε παρακάτω.`),
    legalPromptAccept: "Συμφωνώ",
    legalPromptReject: "Απόρριψη",
    legalPromptTermsOfService: "Όροι υπηρεσίας",
    legalPromptVariantGMessage: "Αυτή η λειτουργία χρησιμοποιεί πληροφορίες σχετικά με τα πρόσωπα, τα χέρια και τις φωνές που ανιχνεύονται από την κάμερα και το μικρόφωνο, προκειμένου να λειτουργήσει. Με αυτήν τη λειτουργία μπορείς να εφαρμόσεις διασκεδαστικά και χρήσιμα εφέ επαυξημένης πραγματικότητας σε σέλφι και εικόνες. Η κάμερά μας χρησιμοποιεί την τεχνολογία για να εντοπίσει ορισμένα χαρακτηριστικά (όπως που βρίσκονται τα χέρια, τα μάτια και η μύτη σου) και αξιοποιεί αυτές τις πληροφορίες για να τοποθετήσει με ακρίβεια τη λειτουργία στην εικόνα που καταγράφεται από την κάμερα. Όλες οι πληροφορίες που συλλέγονται διαγράφονται το συντομότερο δυνατό (συνήθως λίγο μετά το κλείσιμο της εφαρμογής) και σε κάθε περίπτωση σε όχι παραπάνω από τρία χρόνια.<br/><br/>Αν συμφωνείς και θέλεις να συνεχίσεις, άγγιξε παρακάτω.",
    legalPromptVariantGAdultOrChild: "Είσαι ενήλικας ή παιδί;",
    legalPromptVariantGFindYourParent: "Βρες τον γονέα ή τον νόμιμο κηδεμόνα σου.",
    legalPromptVariantGIAmGuardian: "Είμαι ο κηδεμόνας του παιδιού",
    legalPromptVariantGCancel: "Άκυρο",
    legalPromptVariantGAdult: "Ενήλικος",
    legalPromptVariantGChild: "Παιδί"
  },
  "en-GB": {
    legalPromptMessage: L((e) => e`By using Lenses, you acknowledge reading Snap\’s <a href="${0}" target="_blank">Privacy Policy</a> and agree to Snap\’s <a href="${0}" target="_blank">Terms of Service</a>. Some Lenses use information about your face, hands and voice to work. <a href="${0}" target="_blank">Learn More</a>, and if you want to agree and continue, tap below.`),
    legalPromptAccept: "I agree",
    legalPromptReject: "Dismiss",
    legalPromptTermsOfService: "Terms of Service",
    legalPromptVariantGMessage: "This feature uses information about face(s), hands and voice(s) detected by the camera and microphone to work. With this feature, you can apply fun and useful augmented reality effects on top of selfies and images. Our camera uses technology to locate certain features (like where your hands, eyes and nose are) and uses that information to accurately position the feature with the image sensed by the camera. Any information that is collected will be deleted as soon as possible (typically soon after the app is closed) and always within no more than three years.<br/><br/>If you want to agree and continue, tap below.",
    legalPromptVariantGAdultOrChild: "Are you an adult or child?",
    legalPromptVariantGFindYourParent: "Please find your parent or legal guardian.",
    legalPromptVariantGIAmGuardian: "I am the child’s guardian",
    legalPromptVariantGCancel: "Cancel",
    legalPromptVariantGAdult: "Adult",
    legalPromptVariantGChild: "Child"
  },
  es: {
    legalPromptMessage: L((e) => e`Al usar Lentes, confirmas que leíste la <a href="${0}" target="_blank">Política de privacidad</a> de Snap y aceptas las <a href="${0}" target="_blank">Condiciones de servicio</a>. Algunos Lentes funcionan usando información acerca de tu cara, tus manos y tu voz. <a href="${0}" target="_blank">Obtén más información</a> y, si quieres aceptar y continuar, toca a continuación.`),
    legalPromptAccept: "Acepto",
    legalPromptReject: "Ignorar",
    legalPromptTermsOfService: "Condiciones de servicio",
    legalPromptVariantGMessage: "Esta función utiliza información sobre caras, manos y voces detectadas por la cámara y el micrófono para funcionar. Con esta función, puedes aplicar divertidos y útiles efectos de realidad aumentada sobre selfies e imágenes. Nuestra cámara utiliza tecnología para localizar ciertos rasgos (como dónde están las manos, los ojos y la nariz) y utiliza dicha información para posicionar correctamente el rasgo sobre la imagen detectada por la cámara. Toda la información recopilada se eliminará tan pronto como sea posible (por lo general, poco después de que se cierre la app), siempre en un plazo menor a tres años.<br/><br/>Para aceptar y continuar, toca a continuación.",
    legalPromptVariantGAdultOrChild: "¿Eres mayor o menor de edad?",
    legalPromptVariantGFindYourParent: "Busca a tu padre, madre o tutor legal.",
    legalPromptVariantGIAmGuardian: "Soy el tutor legal del menor",
    legalPromptVariantGCancel: "Cancelar",
    legalPromptVariantGAdult: "Mayor de edad",
    legalPromptVariantGChild: "Menor de edad"
  },
  "es-AR": {
    legalPromptMessage: L((e) => e`Al usar los Lentes, confirmás que leíste la <a href="${0}" target="_blank">Política de privacidad</a> de Snap y que aceptás sus <a href="${0}" target="_blank">Condiciones de servicio</a>. Algunos Lentes usan información sobre tu cara, tus manos y tu voz para funcionar. <a href="${0}" target="_blank">Obtené más información</a>, y si querés aceptar y continuar, tocá el botón que aparece más abajo.`),
    legalPromptAccept: "Acepto",
    legalPromptReject: "Omitir",
    legalPromptTermsOfService: "Condiciones de servicio",
    legalPromptVariantGMessage: "Esta función utiliza la información sobre caras, manos y voces detectadas por la cámara y el micrófono. Con esta función, podés aplicar divertidos y útiles efectos de realidad aumentada sobre selfies e imágenes. Nuestra cámara utiliza tecnología para localizar ciertos rasgos (como dónde están las manos, los ojos y la nariz) y utiliza esa información para posicionar con precisión el rasgo con la imagen detectada por la cámara. Toda la información recopilada se eliminará lo antes posible (normalmente poco después de cerrar la aplicación) y siempre en un plazo máximo de tres años.<br/><br/>Si deseas aceptar y continuar, tocá a continuación.",
    legalPromptVariantGAdultOrChild: "¿Sos mayor o menor de edad?",
    legalPromptVariantGFindYourParent: "Buscá a tu padre, madre o tutor legal.",
    legalPromptVariantGIAmGuardian: "Soy el tutor legal del menor",
    legalPromptVariantGCancel: "Cancelar",
    legalPromptVariantGAdult: "Mayor de edad",
    legalPromptVariantGChild: "Menor de edad"
  },
  "es-ES": {
    legalPromptMessage: L((e) => e`Al usar las Lentes, reconoces haber leído la <a href="${0}" target="_blank">Política de privacidad</a> y aceptas los <a href="${0}" target="_blank">Términos del servicio</a> de Snap. Algunas Lentes funcionan utilizando información de tu cara, tus manos o tu voz. Puedes obtener <a href="${0}" target="_blank">más información</a>, y si quieres aceptar y continuar, toca el botón a continuación.`),
    legalPromptAccept: "Acepto",
    legalPromptReject: "Descartar",
    legalPromptTermsOfService: "Términos del servicio",
    legalPromptVariantGMessage: "Para su funcionamiento, esta función hace uso de los datos sobre la cara, las manos y las voces detectados por la cámara y el micrófono. Con ella, puedes aplicar efectos de realidad aumentada, tanto útiles como divertidos, en selfies e imágenes. Nuestra cámara utiliza la tecnología para localizar determinados elementos (como la posición de las manos, los ojos o la nariz) y utiliza esta información para colocar el elemento sobre la imagen de forma fiel, según lo detectado por la cámara. Cualquier información que se recopile se eliminará lo antes posible (normalmente, al cerrar la aplicación) y nunca se almacenará durante más de tres años.<br/><br/>Si quieres aceptar y continuar, toca a continuación.",
    legalPromptVariantGAdultOrChild: "¿Eres una persona adulta o eres menor?",
    legalPromptVariantGFindYourParent: "Habla con tu padre, madre o tutor/a legal.",
    legalPromptVariantGIAmGuardian: "Soy el tutor o tutora legal del menor",
    legalPromptVariantGCancel: "Cancelar",
    legalPromptVariantGAdult: "Adulto",
    legalPromptVariantGChild: "Menor"
  },
  "es-MX": {
    legalPromptMessage: L((e) => e`Al usar Lentes, confirmas que leíste la <a href="${0}" target="_blank">Política de privacidad</a> y aceptas los <a href="${0}" target="_blank">Términos y condiciones de servicio</a> de Snap. Algunos lentes usan información sobre tu cara, manos o voz para funcionar. <a href="${0}" target="_blank">Obtén más información</a> y, si quieres aceptarlo, toca a continuación.`),
    legalPromptAccept: "Acepto",
    legalPromptReject: "Ignorar",
    legalPromptTermsOfService: "Términos y condiciones de servicio",
    legalPromptVariantGMessage: "Esta característica utiliza información sobre la(s) cara(s), manos y voz o voces detectadas por la cámara y el micrófono para funcionar. Con ella, puedes aplicar efectos de realidad aumentada útiles y divertidos a selfies e imágenes. Nuestra cámara usa tecnología para localizar ciertos rasgos (como dónde están tus manos, ojos y nariz) y utiliza esa información para posicionar con precisión esta característica con la imagen que la cámara percibió. Toda la información que se recopile se eliminará lo más pronto posible (por lo general, poco después de cerrar la app) y nunca excederá los tres días.<br/><br/>Si quieres aceptar y proseguir, toca a continuación.",
    legalPromptVariantGAdultOrChild: "¿Eres mayor o menor de edad?",
    legalPromptVariantGFindYourParent: "Busca a tu madre, padre o quien tenga tu custodia legal.",
    legalPromptVariantGIAmGuardian: "Tengo la custodia de la persona menor",
    legalPromptVariantGCancel: "Cancelar",
    legalPromptVariantGAdult: "Persona adulta",
    legalPromptVariantGChild: "Persona menor"
  },
  "fi-FI": {
    legalPromptMessage: L((e) => e`Käyttämällä tehosteita ilmaiset lukeneesi Snapin <a href="${0}" target="_blank">tietosuojaselosteen</a> ja hyväksyväsi Snapin <a href="${0}" target="_blank">palveluehdot</a>. Jotkin tehosteet käyttävät toimintaan tietoja kasvoistasi, käsistäsi ja äänestäsi. <a href="${0}" target="_blank">Lisätietoja saat täältä</a>. Hyväksy ja jatka napauttamalla alla olevaa painiketta.`),
    legalPromptAccept: "Hyväksyn",
    legalPromptReject: "Hylkää",
    legalPromptTermsOfService: "Palveluehdot",
    legalPromptVariantGMessage: "Tämä ominaisuus käyttää toimiakseen tietoja kameran ja mikrofonin havaitsemista kasvoista, käsistä ja äänistä. Ominaisuudella voit lisätä hauskoja ja hyödyllisiä lisätyn todellisuuden efektejä selfieiden ja kuvien päälle. Kameramme käyttää teknologiaa tiettyjen piirteiden paikallistamiseen (kuten käsiesi, silmiesi ja nenäsi sijaintiin) ja käyttää näitä tietoja ominaisuuden asettamiseen oikeaan kohtaan kameran havaitsemassa kuvassa. Kaikki kerätyt tiedot poistetaan mahdollisimman pian (yleensä pian sovelluksen sulkemisen jälkeen) ja aina viimeistään kolmen vuoden kuluttua.<br/><br/>Jos haluat hyväksyä ja jatkaa, napauta painiketta alla. ",
    legalPromptVariantGAdultOrChild: "Oletko aikuinen vai lapsi?",
    legalPromptVariantGFindYourParent: "Etsi vanhempasi tai huoltajasi.",
    legalPromptVariantGIAmGuardian: "Olen lapsen huoltaja",
    legalPromptVariantGCancel: "Peruuta",
    legalPromptVariantGAdult: "Aikuinen",
    legalPromptVariantGChild: "Lapsi"
  },
  "fil-PH": {
    legalPromptMessage: L((e) => e`Sa pamamagitan ng paggamit sa Lenses, kinikilala mong binasa mo ang <a href="${0}" target="_blank">Privacy Policy</a> ng Snap at sumasang-ayon ka sa <a href="${0}" target="_blank">Terms of Service</a> ng Snap. Ang ilang lens ay gumagamit ng impormasyon tungkol sa iyong mukha , mga kamay at boses para gumana. <a href="${0}" target="_blank">Alamin Pa</a>, at kung gusto mong sumang-ayon at magpatuloy, mag-tap sa ibaba.`),
    legalPromptAccept: "Sang-ayon Ako",
    legalPromptReject: "I-dismiss",
    legalPromptTermsOfService: "Terms of Service",
    legalPromptVariantGMessage: "Ang feature na ito ay gumagamit ng impormasyon tungkol sa (mga) mukha, mga kamay at (mga) boses na nade-detect ng camera at microphone para gumana ito. Gamit ang feature na ito, pwede kang mag-apply ng nakakatuwa at kapaki-pakinabang na augmented reality effects sa ibabaw ng mga selfie at image. Gumagamit ang camera namin ng technology para matukoy ang mga partikular na anyo (tulad ng kung nasaan ang iyong mga kamay, mga mata, at ilong) at ginagamit nito ang impormasyong iyon para eksaktong mapwesto ang anyong iyon sa image na nase-sense ng camera. Ang anumang impormasyong kinokolekta ay ide-delete sa lalong madaling panahon (karaniwan ay maikling panahon lang matapos isara ang app) at palaging hindi lalampas nang tatlong taon.<br/><br/>Kung gusto mong sumang-ayon at magpatuloy, mag-tap sa ibaba.",
    legalPromptVariantGAdultOrChild: "Isa ka bang adult o bata?",
    legalPromptVariantGFindYourParent: "Pakihanap ang iyong magulang o legal guardian.",
    legalPromptVariantGIAmGuardian: "Ako ang guardian ng bata",
    legalPromptVariantGCancel: "I-cancel",
    legalPromptVariantGAdult: "Adult",
    legalPromptVariantGChild: "Bata"
  },
  "fr-FR": {
    legalPromptMessage: L((e) => e`En utilisant les Lenses, vous reconnaissez avoir lu la <a href="${0}" target="_blank">Politique de confidentialité</a> de Snap et vous acceptez les <a href="${0}" target="_blank">Conditions d\'utilisation du service</a> de Snap. Le fonctionnement de certaines Lenses requiert l\'utilisation d\'informations sur votre visage, vos mains et votre voix. <a href="${0}" target="_blank">En savoir plus</a>. Si vous acceptez ces conditions et souhaitez continuer, appuyez ci-dessous.`),
    legalPromptAccept: "J'accepte",
    legalPromptReject: "Ignorer",
    legalPromptTermsOfService: "Conditions d'utilisation du service",
    legalPromptVariantGMessage: "Pour fonctionner, cette fonctionnalité utilise des informations sur le ou les visages, les mains et la ou les voix détectés par l'appareil photo et le micro. Elle vous permet d'appliquer des effets en réalité augmentée amusants et utiles sur vos selfies et vos images. Notre appareil photo utilise une technologie qui localise certaines caractéristiques (comme l'emplacement de vos mains, de vos yeux et de votre nez) afin de positionner avec précision la fonctionnalité sur l'image détectée par l'appareil photo. Toutes les informations collectées sont supprimées dès que possible (généralement peu après la fermeture de l'application) et toujours dans un délai maximum de trois ans.<br/><br/>Si vous souhaitez accepter et continuer, appuyez ci-dessous.",
    legalPromptVariantGAdultOrChild: "Êtes-vous adulte ou mineur ?",
    legalPromptVariantGFindYourParent: "Veuillez appeler votre parent ou votre tuteur·rice.",
    legalPromptVariantGIAmGuardian: "Je suis le ou la tuteur·rice de l'enfant.",
    legalPromptVariantGCancel: "Annuler",
    legalPromptVariantGAdult: "Adulte",
    legalPromptVariantGChild: "Mineur"
  },
  "gu-IN": {
    legalPromptMessage: L((e) => e`લેન્સનો ઉપયોગ કરીને, તમે સ્વીકારો છો કે તમે Snapની <a href="${0}" target="_blank">પ્રાઇવસી પોલિસી</a> વાંચી છે અને Snapની <a href="${0}" target="_blank">સેવાની શરતો</a> સાથે સંમત છો. કેટલાક લેન્સ કામ કરી શકે તે માટે તે તમારા ચહેરા, હાથ અને અવાજનો ઉપયોગ કરે છે. <a href="${0}" target="_blank">વધુ જાણો</a>, અને જો તમે સંમત થવા માંગતા હો, તો નીચે ટૅપ કરો.`),
    legalPromptAccept: "હું સંમત છું",
    legalPromptReject: "બરતરફ કરો",
    legalPromptTermsOfService: "સેવાની શરતો",
    legalPromptVariantGMessage: "આ સુવિધા કામ કરી શકે તે માટે કૅમેરા અને માઇક્રોફોન દ્વારા શોધાયેલા ચહેરા(ઓ), હાથ અને અવાજ(જો) વિશેની માહિતીનો ઉપયોગ કરે છે. આ સુવિધા સાથે તમે સેલ્ફી અને ઇમેજની ઉપર મજેદાર અને ઉપયોગી ઑગ્મેંટેડ રિયાલીટી ઇફેક્ટ લાગુ કરી શકો છો. અમારા કૅમેરા અમુક લક્ષણો (જેમ કે તમારા હાથ, આંખો અને નાક ક્યાં છે તે)નું સ્થાન જાણવા માટે ટેક્નોલોજીનો ઉપયોગ કરે છે અને તે માહિતીનો ઉપયોગ તે લક્ષણને કૅમેરા દ્વારા શોધાયેલ ઇમેજ સાથે સ્થિત કરવા માટે કરે છે. એકત્રિત કરેલી કોઈ પણ માહિતી શક્ય તેટલી વહેલી તકે (સામાન્ય રીતે ઍપ બંધ કરવામાં આવે પછી તરત) અને હંમેશાં ત્રણ દિવસની અંદર ડિલીટ કરવામાં આવશે.<br/><br/>જો તમે સંમત થવા અને ચાલુ રાખવા માંગતા હો, તો નીચે ટૅપ કરો.",
    legalPromptVariantGAdultOrChild: "તમે વયસ્ક છો કે બાળક?",
    legalPromptVariantGFindYourParent: "કૃપા કરીને તમારા માતા-પિતા અથવા કાનૂની વાલીને શોધો.",
    legalPromptVariantGIAmGuardian: "હું બાળકના વાલી છું.",
    legalPromptVariantGCancel: "રદ કરો",
    legalPromptVariantGAdult: "વયસ્ક",
    legalPromptVariantGChild: "બાળક"
  },
  "hi-IN": {
    legalPromptMessage: L((e) => e`लेंस का इस्तेमाल करके, आप स्वीकार करते हैं कि आपने Snap की <a href="${0}" target="_blank">गोपनीयता नीति</a> को पढ़ लिया है और आप Snap की <a href="${0}" target="_blank">सेवा शर्तों</a> से सहमत हैं। कुछ लेंस काम करने के लिए आपके चेहरे, हाथों और आवाज़ का इस्तेमाल करते हैं। <a href="${0}" target="_blank">और जानें</a>, और अगर आप सहमत होते हैं और जारी रखना चाहते हैं, तो नीचे टैप करें।`),
    legalPromptAccept: "मैं सहमत हूं",
    legalPromptReject: "खारिज करें",
    legalPromptTermsOfService: "सेवा शर्तें",
    legalPromptVariantGMessage: "यह फ़ीचर काम करने के लिए कैमरा और माइक्रोफ़ोन द्वारा फ़ेस, हाथों और आवाज़(जों) के बारे में पहचानी गई जानकारी का इस्तेमाल करता है। इस फ़ीचर की मदद से आप सेल्फ़ी और इमेज के ऊपर मज़ेदार और उपयोगी ऑगमेंटेड रिएलिटी इफ़ेक्ट्स डाल सकते हैं। हमारा कैमरा कुछ फ़ीचर्स (जैसे कि, आपके हाथ, आंख और नाक की जगह) का पता लगाने के लिए टेक्नॉलॉजी का इस्तेमाल करता है और उस जानकारी के इस्तेमाल से खुद महसूस की गई इमेज पर फ़ीचर को सटीक जगह पर लाया जाता है। इकठ्ठा की गई किसी भी जानकारी को जल्द से जल्द (आमतौर पर ऐप बंद करते ही) और तीन सालों के अंदर हमेशा के लिए डिलीट कर दिया जाएगा।<br/><br/>अगर आप सहमत हैं और जारी रखना चाहते हैं, तो नीचे टैप करें।",
    legalPromptVariantGAdultOrChild: "क्या आप बच्चे हैं या व्यस्क?",
    legalPromptVariantGFindYourParent: "प्लीज़ अपने माता-पिता या कानूनी गार्जियन का पता लगाएं।",
    legalPromptVariantGIAmGuardian: "मैं बच्चे का गार्जियन हूं",
    legalPromptVariantGCancel: "रद्द करें",
    legalPromptVariantGAdult: "वयस्क",
    legalPromptVariantGChild: "बच्चा"
  },
  "id-ID": {
    legalPromptMessage: L((e) => e`Dengan menggunakan Lensa, kamu menyatakan bahwa kamu sudah membaca <a href="${0}" target="_blank">Kebijakan Privasi</a> Snap dan menyetujui <a href="${0}" target="_blank">Ketentuan Layanan</a> Snap. Beberapa lensa menggunakan informasi tentang wajah, tangan, dan suaramu agar bisa berfungsi dengan baik. <a href="${0}" target="_blank">Pelajari Selengkapnya</a>, dan silakan ketuk tombol di bawah jika kamu ingin menyetujuinya dan melanjutkan.`),
    legalPromptAccept: "Saya setuju",
    legalPromptReject: "Tutup",
    legalPromptTermsOfService: "Ketentuan Layanan",
    legalPromptVariantGMessage: "Agar bisa berfungsi, fitur ini menggunakan informasi terkait wajah, tangan, dan suara yang dideteksi oleh kamera serta mikrofon. Dengan fitur ini, efek augmented reality yang menyenangkan dan berguna dapat diterapkan ke selfie dan gambar. Kamera kami menggunakan teknologi untuk menemukan lokasi fitur tertentu (misalnya menemukan bagian tangan, mata, dan hidung), lalu menggunakan informasi tersebut untuk menempatkan fitur secara akurat di gambar yang dideteksi oleh kamera. Informasi apa pun yang dikumpulkan akan segera dihapus (biasanya setelah aplikasi ditutup) dan selalu disimpan tidak lebih dari tiga tahun.<br/><br/>Jika ingin menyetujui dan melanjutkan, ketuk tombol di bawah ini.",
    legalPromptVariantGAdultOrChild: "Apakah kamu orang dewasa atau anak-anak?",
    legalPromptVariantGFindYourParent: "Panggil orang tua atau wali resmi.",
    legalPromptVariantGIAmGuardian: "Saya wali si anak",
    legalPromptVariantGCancel: "Batal",
    legalPromptVariantGAdult: "Orang Dewasa",
    legalPromptVariantGChild: "Anak-Anak"
  },
  "it-IT": {
    legalPromptMessage: L((e) => e`Usando le Lenti, confermi di aver letto l\'<a href="${0}" target="_blank">Informativa sulla Privacy</a> di Snap Inc. e di accettare i <a href="${0}" target="_blank">Termini di Servizio</a> di Snap Inc. Alcune Lenti utilizzano informazioni sul tuo viso, le tue mani e la tua voce per funzionare. <a href="${0}" target="_blank">Scopri di più</a> e, se sei d\'accordo e vuoi continuare, tocca qui sotto.`),
    legalPromptAccept: "Accetto",
    legalPromptReject: "Ignora",
    legalPromptTermsOfService: "Termini di Servizio",
    legalPromptVariantGMessage: "Questa funzionalità utilizza le informazioni su viso, mani e voce rilevate dalla fotocamera e dal microfono per funzionare. Ti consente di applicare effetti in realtà aumentata divertenti e utili ai selfie e alle immagini. La nostra Fotocamera sfrutta una tecnologia specifica per individuare certe parti del corpo (ad esempio mani, occhi e naso) e usa questi dati per posizionarle in modo accurato sull'immagine rilevata. Qualsiasi informazione raccolta viene eliminata appena possibile (di solito poco dopo la chiusura dell'app) e, in ogni caso, entro 3 anni.<br/><br/>Se sei d'accordo e vuoi continuare, tocca qui sotto.",
    legalPromptVariantGAdultOrChild: "Sei un adulto o un minore?",
    legalPromptVariantGFindYourParent: "C'è bisogno di un genitore o tutore legale.",
    legalPromptVariantGIAmGuardian: "Sono il tutore del minore",
    legalPromptVariantGCancel: "Annulla",
    legalPromptVariantGAdult: "Adulto",
    legalPromptVariantGChild: "Minore"
  },
  "ja-JP": {
    legalPromptMessage: L((e) => e`レンズを使用することにより、Snap社の<a href="${0}" target="_blank">プライバシーポリシー</a>を読み、<a href="${0}" target="_blank">利用規約</a>に同意したことになります。レンズの中には、あなたの顔や手、声の情報を利用するものがあります。<a href="${0}" target="_blank">詳細はこちらからご覧いただき</a>、同意して利用を継続する場合には下をタップしてください。`),
    legalPromptAccept: "同意します",
    legalPromptReject: "閉じる",
    legalPromptTermsOfService: "利用規約",
    legalPromptVariantGMessage: "この機能はカメラとマイクを使って検知した顔や手、声の情報を利用します。この機能で、自撮りや画像に楽しく便利な拡張現実の効果を適用できます。Snapのカメラは特定の特徴（例えばあなたの手や目、鼻などの位置）をとらえるテクノロジーを使用し、その情報を利用してカメラによって感知した画像に特徴を適用します。収集した情報はいずれもすぐに消去され（通常アプリが閉じられてからすぐ）、3年を超えて保存されることはありません。<br/><br/>同意して続行するには下記をタップしてください。",
    legalPromptVariantGAdultOrChild: "大人ですか、子どもですか？",
    legalPromptVariantGFindYourParent: "親または保護者を探してください。",
    legalPromptVariantGIAmGuardian: "私はその子供の保護者です",
    legalPromptVariantGCancel: "キャンセル",
    legalPromptVariantGAdult: "大人",
    legalPromptVariantGChild: "子ども"
  },
  "kn-IN": {
    legalPromptMessage: L((e) => e`ಲೆನ್ಸ್‌ಗಳನ್ನು ಬಳಸುವ ಮೂಲಕ, Snap ನ <a href="${0}" target="_blank">ಗೌಪ್ಯತಾ ನೀತಿ</a> ಅನ್ನು ನೀವು ಓದಿದ್ದೀರಿ ಎಂದು ಅಂಗೀಕರಿಸುತ್ತೀರಿ ಮತ್ತು Snap ನ <a href="${0}" target="_blank">ಸೇವೆಯ ನಿಯಮಗಳು</a> ಅನ್ನು ಒಪ್ಪುತ್ತೀರಿ. ಕೆಲವು ಲೆನ್ಸ್‌ಗಳು ಕಾರ್ಯನಿರ್ವಹಿಸಲು ನಿಮ್ಮ ಮುಖ, ಕೈಗಳು ಮತ್ತು ಧ್ವನಿಯ ಮಾಹಿತಿಯನ್ನು ಬಳಸುತ್ತವೆ. <a href="${0}" target="_blank">ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ</a>, ಹಾಗೂ ಒಂದು ವೇಳೆ ನೀವು ಒಪ್ಪಿ ಮುಂದುವರಿಯಲು ಬಯಸಿದರೆ, ಕೆಳಗೆ ಟ್ಯಾಪ್ ಮಾಡಿ.`),
    legalPromptAccept: "ನಾನು ಒಪ್ಪುತ್ತೇನೆ",
    legalPromptReject: "ವಜಾಮಾಡಿ",
    legalPromptTermsOfService: "ಸೇವೆಯ ನಿಯಮಗಳು",
    legalPromptVariantGMessage: "ಈ ವೈಶಿಷ್ಟ್ಯವು ಕಾರ್ಯನಿರ್ವಹಿಸಲು ಕ್ಯಾಮರಾ ಮತ್ತು ಮೈಕ್ರೊಫೋನ್‌ನಿಂದ ಪತ್ತೆಯಾದ ಮುಖ(ಗಳು), ಕೈಗಳು ಮತ್ತು ಧ್ವನಿ(ಗಳು) ಕುರಿತು ಮಾಹಿತಿಯನ್ನು ಬಳಸುತ್ತದೆ. ಈ ವೈಶಿಷ್ಟ್ಯದೊಂದಿಗೆ, ನೀವು ಸೆಲ್ಫಿಗಳು ಮತ್ತು ಚಿತ್ರಗಳ ಮೇಲೆ ವಿನೋದ ಮತ್ತು ಉಪಯುಕ್ತ ಆಗ್ಮೆಂಟೆಡ್‌ ರಿಯಾಲಿಟಿ ಪರಿಣಾಮಗಳನ್ನು ಅನ್ವಯಿಸಬಹುದು. ನಮ್ಮ ಕ್ಯಾಮರಾ ಕೆಲವು ವೈಶಿಷ್ಟ್ಯಗಳನ್ನು (ನಿಮ್ಮ ಕೈಗಳು, ಕಣ್ಣುಗಳು ಮತ್ತು ಮೂಗು ಎಲ್ಲಿದೆ ಎಂದು) ಪತ್ತೆಹಚ್ಚಲು ತಂತ್ರಜ್ಞಾನವನ್ನು ಬಳಸುತ್ತದೆ ಮತ್ತು ಕ್ಯಾಮರಾದಿಂದ ಗ್ರಹಿಸಲ್ಪಟ್ಟ ಚಿತ್ರದೊಂದಿಗೆ ವೈಶಿಷ್ಟ್ಯವನ್ನು ನಿಖರವಾಗಿ ಇರಿಸಲು ಆ ಮಾಹಿತಿಯನ್ನು ಬಳಸುತ್ತದೆ. ಸಂಗ್ರಹಿಸಿದ ಯಾವುದೇ ಮಾಹಿತಿಯನ್ನು ಸಾಧ್ಯವಾದಷ್ಟು ಬೇಗ ಅಳಿಸಲಾಗುತ್ತದೆ (ಸಾಮಾನ್ಯವಾಗಿ ಆ್ಯಪ್‌ ಅನ್ನು ಮುಚ್ಚಿದ ನಂತರ) ಮತ್ತು ಎಂದಿಗೂ ಮೂರು ವರ್ಷಗಳ ನಂತರ ಇರಿಸಿಕೊಳ್ಳಲಾಗುವುದಿಲ್ಲ. <br/><br/> ನೀವು ಒಪ್ಪಿಕೊಳ್ಳಲು ಮತ್ತು ಮುಂದುವರಿಸಲು ಬಯಸಿದರೆ, ಕೆಳಗೆ ಟ್ಯಾಪ್ ಮಾಡಿ.",
    legalPromptVariantGAdultOrChild: "ನೀವು ವಯಸ್ಕರೇ ಅಥವಾ ಮಗುವೇ?",
    legalPromptVariantGFindYourParent: "ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೋಷಕರು ಅಥವಾ ಕಾನೂನು ಪಾಲಕರನ್ನು ಹುಡುಕಿ.",
    legalPromptVariantGIAmGuardian: "ನಾನು ಮಗುವಿನ ಪೋಷಕ",
    legalPromptVariantGCancel: "ರದ್ದುಮಾಡಿ",
    legalPromptVariantGAdult: "ವಯಸ್ಕ",
    legalPromptVariantGChild: "ಮಗು"
  },
  "ko-KR": {
    legalPromptMessage: L((e) => e`렌즈를 사용하면 Snap의 <a href="${0}" target="_blank">개인정보 보호정책</a>을 읽고 Snap의 <a href="${0}" target="_blank">이용 약관</a>에 동의하는 것으로 간주됩니다. 일부 렌즈는 회원님의 얼굴, 손 및 목소리 정보를 사용합니다. <a href="${0}" target="_blank">자세히 알아보고</a>, 동의 및 계속하려면 아래를 누르세요.`),
    legalPromptAccept: "동의함",
    legalPromptReject: "취소",
    legalPromptTermsOfService: "이용 약관",
    legalPromptVariantGMessage: "이 기능은 카메라와 마이크가 감지한 얼굴, 손, 음성에 대한 정보를 사용하여 작동합니다. 이 기능을 사용하면 셀카 및 이미지에 재미있고 유용한 증강 현실 효과를 적용할 수 있습니다. Snapchat 카메라는 특정 특징(예: 손, 눈 및 코의 위치)을 찾아내는 기술을 사용하며, 해당 정보를 바탕으로 카메라가 감지한 이미지에서 특징의 위치를 정확하게 파악합니다. 수집된 모든 정보는 가능한 한 빨리(일반적으로 앱 종료 직후) 삭제되며, 항상 3년 이내에 삭제됩니다.<br/><br/>동의하고 계속하려면 아래를 누르세요.",
    legalPromptVariantGAdultOrChild: "성인인가요, 아동인가요?",
    legalPromptVariantGFindYourParent: "부모님 또는 법적 보호자와 함께 진행하세요.",
    legalPromptVariantGIAmGuardian: "아동의 보호자입니다",
    legalPromptVariantGCancel: "취소",
    legalPromptVariantGAdult: "성인",
    legalPromptVariantGChild: "아동"
  },
  "ml-IN": {
    legalPromptMessage: L((e) => e`ലെൻസുകൾ ഉപയോഗിക്കുന്നതിലൂടെ നിങ്ങൾ Snap-ന്റെ <a href="${0}" target="_blank">സ്വകാര്യതാ നയം</a> വായിച്ചുവെന്ന് സമ്മതിക്കുകയും Snap-ന്റെ <a href="${0}" target="_blank">സേവന നിബന്ധനകൾ</a> അംഗീകരിക്കുകയും ചെയ്യുന്നു. പ്രവർത്തിക്കുന്നതിന് ചില ലെൻസുകൾ നിങ്ങളുടെ മുഖം, കൈകൾ, ശബ്ദം എന്നിവയേക്കുറിച്ചുള്ള വിവരങ്ങൾ ഉപയോഗിക്കുന്നു. <a href="${0}" target="_blank">കൂടുതലറിയുക</a>, അംഗീകരിച്ച് തുടരണമെങ്കിൽ ചുവടെ ടാപ്പ് ചെയ്യുക.`),
    legalPromptAccept: "ഞാൻ അംഗീകരിക്കുന്നു",
    legalPromptReject: "ഡിസ്‌മിസ് ചെയ്യുക",
    legalPromptTermsOfService: "സേവന വ്യവസ്ഥകൾ",
    legalPromptVariantGMessage: "ഈ ആപ്പ് അതിന്റെ പ്രവർത്തനത്തിന്, ക്യാമറയും മൈക്രോഫോണും കണ്ടെത്തുന്ന മുഖം(ങ്ങൾ), കൈകളും ശബ്ദവും(ങ്ങളും) എന്നിവയുമായി ബന്ധപ്പെട്ട വിവരങ്ങൾ ഉപയോഗിക്കുന്നു. ഈ ഫീച്ചർ ഉപയോഗിച്ച് നിങ്ങളുടെ സെൽഫികൾക്കും ചിത്രങ്ങൾക്കും മുകളിൽ, ഉപയോഗപ്രദമായ ഓഗ്‌മെന്റഡ് റിയാലിറ്റി ഇഫക്റ്റുകൾ നൽകാനാകും. ഞങ്ങളുടെ ക്യാമറ ചില ഫീച്ചറുകൾ ലൊക്കേറ്റ് ചെയ്യാൻ (ഉദാഹരണത്തിന് നിങ്ങളുടെ കൈകൾ, കണ്ണുകൾ, മൂക്ക് എന്നിവ എവിടെയാണ്) സാങ്കേതികവിദ്യ ഉപയോഗിക്കുന്നു, ക്യാമറ സെൻസ് ചെയ്ത ചിത്രത്തിൽ ഈ ഫീച്ചർ കൃത്യമായി പൊസിഷൻ ചെയ്യാൻ ഈ വിവരങ്ങൾ ഉപയോഗിക്കുകയും ചെയ്യുന്നു. ശേഖരിക്കുന്ന എല്ലാ വിവരങ്ങളും എത്രയും വേഗവും (സാധാരണയായി ആപ്പ് അടച്ചാൽ ഉടൻ) മൂന്ന് വർഷത്തിനുള്ളിലും (എല്ലായ്‌പ്പോഴും) ഇല്ലാതാക്കുന്നു.<br/><br/>അംഗീകരിച്ച് തുടരണമെന്നുണ്ടെങ്കിൽ ചുവടെ ടാപ്പ് ചെയ്യുക.",
    legalPromptVariantGAdultOrChild: "നിങ്ങൾ ഒരു കുട്ടിയാണോ അതോ മുതിർന്ന വ്യക്തിയാണോ?",
    legalPromptVariantGFindYourParent: "നിങ്ങളുടെ രക്ഷിതാവിനെയോ നിയമപരമായ രക്ഷിതാവിനെയോ കണ്ടെത്തുക.",
    legalPromptVariantGIAmGuardian: "ഞാൻ കുട്ടിയുടെ നിയമപരമായ രക്ഷിതാവാണ്",
    legalPromptVariantGCancel: "റദ്ദാക്കുക",
    legalPromptVariantGAdult: "മുതിർന്നവ്യക്തി",
    legalPromptVariantGChild: "കുട്ടി"
  },
  "mr-IN": {
    legalPromptMessage: L((e) => e`लेन्सेस वापरून, तुम्ही मान्य करता की तुम्ही Snap चे <a href="${0}" target="_blank">गोपनीयता धोरण</a> वाचले आहे आणि Snap च्या <a href="${0}" target="_blank">सेवा अटींना</a> सहमती देता. काही लेन्सेस कार्य करण्यासाठी तुमचा चेहरा, हात आणि आवाज याविषयी माहिती वापरतात. <a href="${0}" target="_blank">अधिक जाणून घ्या</a> आणि तुम्हाला सहमती देऊन चालू ठेवायचे असल्यास खाली टॅप करा.`),
    legalPromptAccept: "मी सहमत आहे",
    legalPromptReject: "दुर्लक्ष करा",
    legalPromptTermsOfService: "सेवा अटी",
    legalPromptVariantGMessage: "हे वैशिष्ट्य कार्य करण्यासाठी कॅमेरा आणि मायक्रोफोनद्वारे तपासलेली चेहरा(चेहरे), हात आणि आवाजाची माहिती वापरते. या वैशिष्ट्यासह, तुम्ही सेल्फी आणि इमेजवर मजेशीर आणि उपयोगी ऑग्मेंटेड रिॲलिटी प्रभाव लागू करू शकता. आमचा कॅमेरा काही फीचर्स (जसे की तुमचे हात, डोळे आणि नाक कुठे आहेत) शोधण्यासाठी तंत्रज्ञान वापरतो आणि कॅमेऱ्याद्वारे ओळखलेल्या इमेजसह फीचर नेमक्या ठिकाणी दाखवण्यासाठी ती माहिती वापरतो. गोळा केलेली कोणतीही माहिती शक्य तितक्या लवकर (सहसा ॲप बंद केल्यावर लगेच) आणि नेहमी तीन वर्षांच्या आत हटवली जाईल.<br/><br/>तुम्हाला सहमती देऊन पुढे चालू ठेवायचे असेल तर, खाली टॅप करा.",
    legalPromptVariantGAdultOrChild: "तुम्ही प्रौढ आहात किंवा लहान मूल आहात?",
    legalPromptVariantGFindYourParent: "कृपया तुमचे आईवडील किंवा कायदेशीर पालकांना शोधा.",
    legalPromptVariantGIAmGuardian: "मी मुलाचा पालक आहे",
    legalPromptVariantGCancel: "रद्द करा",
    legalPromptVariantGAdult: "प्रौढ",
    legalPromptVariantGChild: "मूल"
  },
  "ms-MY": {
    legalPromptMessage: L((e) => e`Dengan menggunakan Lensa, anda mengakui membaca <a href="${0}" target="_blank">Dasar Privasi</a> Snap dan bersetuju dengan <a href="${0}" target="_blank">Syarat Perkhidmatan</a> Snap. Sesetengan lensa menggunakan maklumat tentang muka anda, tangan dan suara untuk berfungsi. <a href="${0}" target="_blank">Ketahui Lebih Lanjut</a>, dan jika anda mahu bersetuju dan teruskan, ketik di bawah.`),
    legalPromptAccept: "Saya Setuju",
    legalPromptReject: "Abaikan",
    legalPromptTermsOfService: "Syarat Perkhidmatan",
    legalPromptVariantGMessage: "Ciri ini menggunakan maklumat muka, tangan dan suara yang dikesan oleh kamera dan mikrofon untuk berfungsi. Dengan ciri ini, anda boleh menggunakan kesan realiti tambahan yang menyeronokkan dan berguna selain swafoto dan gambar. Kamera kami menggunakan teknologi untuk mengesan ciri tertentu (seperti di mana tangan, mata dan hidung anda) dan menggunakan maklumat tersebut untuk meletakkan ciri dengan tepat dengan imej yang dikesan oleh kamera. Sebarang maklumat yang dikumpul akan dipadamkan dengan segera (kebiasaannya sejurus aplikasi ditutup) dan sentiasa dalam tempoh tidak lebih daripada tiga tahun.<br/><br/>Jika anda bersetuju dan ingin teruskan, ketik dibawah.",
    legalPromptVariantGAdultOrChild: "Adakah anda seorang dewasa atau kanak-kanak?",
    legalPromptVariantGFindYourParent: "Sila cari ibu bapa atau penjaga anda yang sah.",
    legalPromptVariantGIAmGuardian: "Saya penjaga kanak-kanak ini",
    legalPromptVariantGCancel: "Batal",
    legalPromptVariantGAdult: "Dewasa",
    legalPromptVariantGChild: "Kanak-kanak"
  },
  "nb-NO": {
    legalPromptMessage: L((e) => e`Ved å ta i bruk Linser bekrefter du at du har lest <a href="${0}" target="_blank">personvernbetingelsene</a> og at du godtar <a href="${0}" target="_blank">tjenestevilkårene</a> til Snap. Noen Linser bruker informasjon om ansiktet ditt, hendene dine og stemmen din for å fungere. <a href="${0}" target="_blank">Finn ut mer</a>. Hvis du godtar dette og vil gå videre, klikker du nedenfor.`),
    legalPromptAccept: "Jeg godtar",
    legalPromptReject: "Avvis",
    legalPromptTermsOfService: "Tjenestevilkår",
    legalPromptVariantGMessage: "Denne funksjonen bruker informasjon om ansikter, hender og stemmer som oppdages av kameraet og mikrofonen, for å fungere. Med denne funksjonen kan du legge til artige og nyttige effekter i utvidet virkelighet på selfier og bilder. Kameraet vårt bruker teknologi for å oppdage visse trekk (som hvor hendene, øynene og nesen er), og bruker denne informasjonen til å plassere funksjonen oppå bildet som kameraet har fanget opp. All informasjon som samles inn, blir slettet så snart som mulig (vanligvis rett etter at appen lukkes) og alltid innen maks tre år.<br/><br/>Hvis du ønsker å godta og fortsette, trykker du nedenfor.",
    legalPromptVariantGAdultOrChild: "Er du en voksen eller et barn?",
    legalPromptVariantGFindYourParent: "Finn en forelder eller foresatt.",
    legalPromptVariantGIAmGuardian: "Jeg er barnets foresatt",
    legalPromptVariantGCancel: "Avbryt",
    legalPromptVariantGAdult: "Voksen",
    legalPromptVariantGChild: "Barn"
  },
  "nl-NL": {
    legalPromptMessage: L((e) => e`Door Lenzen te gebruiken, geef je aan dat je het <a href="${0}" target="_blank">Privacybeleid</a> van Snap hebt gelezen en dat je akkoord gaat met de <a href="${0}" target="_blank">Servicevoorwaarden</a> van Snap. Sommige Lenzen gebruiken informatie over je gezicht, handen en stem om te functioneren. Lees <a href="${0}" target="_blank">meer informatie</a> en tik hieronder als je akkoord gaat en wilt doorgaan.`),
    legalPromptAccept: "Ik ga akkoord",
    legalPromptReject: "Annuleren",
    legalPromptTermsOfService: "Servicevoorwaarden",
    legalPromptVariantGMessage: "Voor de werking van deze functie wordt informatie over gezicht(en), handen en stem(men) gebruikt die door camera en microfoon worden gedetecteerd. Je kunt met deze functie leuke en nuttige augmented reality-effecten op selfies en afbeeldingen plaatsen. Onze camera gebruikt technologie om de locatie te bepalen van bepaalde kenmerken (bijvoorbeeld waar je handen, ogen en neus zich bevinden) en gebruikt die informatie om het kenmerk nauwkeurig te positioneren in de afbeelding die is gedetecteerd met de camera. De verzamelde informatie wordt zo snel mogelijk verwijderd (gewoonlijk kort nadat de app is gesloten) en altijd binnen een periode van maximaal drie jaar.<br/><br/>Tik hieronder als je hiermee akkoord gaat en wilt doorgaan.",
    legalPromptVariantGAdultOrChild: "Ben je een volwassene of een kind?",
    legalPromptVariantGFindYourParent: "Vraag toestemming aan een ouder of wettelijke voogd.",
    legalPromptVariantGIAmGuardian: "Ik ben de voogd van het kind",
    legalPromptVariantGCancel: "Annuleren",
    legalPromptVariantGAdult: "Volwassene",
    legalPromptVariantGChild: "Kind"
  },
  pa: {
    legalPromptMessage: L((e) => e`ਲੈਂਜ਼ਾਂ ਦੀ ਵਰਤੋਂ ਕਰਕੇ, ਤੁਸੀਂ ਇਸ ਗੱਲ ਨੂੰ ਸਵੀਕਾਰ ਕਰਦੇ ਹੋ ਕਿ ਤੁਸੀਂ Snap ਦੀ <a href="${0}" target="_blank">ਪਰਦੇਦਾਰੀ ਬਾਰੇ ਨੀਤੀ</a> ਨੂੰ ਪੜ੍ਹ ਲਿਆ ਹੈ ਅਤੇ ਤੁਸੀਂ Snap ਦੀਆਂ <a href="${0}" target="_blank">ਸੇਵਾ ਦੀਆਂ ਮਦਾਂ</a> ਨਾਲ ਸਹਿਮਤ ਹੋ। ਕੁਝ ਲੈਂਜ਼ ਕੰਮ ਕਰਨ ਲਈ ਤੁਹਾਡੇ ਚਿਹਰੇ, ਹੱਥਾਂ ਅਤੇ ਆਵਾਜ਼ ਨਾਲ ਸੰਬੰਧਿਤ ਜਾਣਕਾਰੀ ਦੀ ਵਰਤੋਂ ਕਰਦੇ ਹਨ। <a href="${0}" target="_blank">ਹੋਰ ਜਾਣੋ</a> ਅਤੇ ਜੇਕਰ ਤੁਸੀਂ ਸਹਿਮਤ ਹੋ ਅਤੇ ਜਾਰੀ ਰੱਖਣਾ ਚਾਹੁੰਦੇ ਹੋ, ਤਾਂ ਹੇਠਾਂ ਟੈਪ ਕਰੋ।`),
    legalPromptAccept: "ਮੈਂ ਸਹਿਮਤ ਹਾਂ",
    legalPromptReject: "ਖ਼ਾਰਜ ਕਰੋ",
    legalPromptTermsOfService: "ਸੇਵਾ ਦੀਆਂ ਮਦਾਂ",
    legalPromptVariantGMessage: "ਕੰਮ ਕਰਨ ਲਈ ਇਹ ਸੁਵਿਧਾ ਕੈਮਰੇ ਅਤੇ ਮਾਈਕ੍ਰੋਫ਼ੋਨ ਨਾਲ ਚਿਹਰੇ(ਚਿਹਰਿਆਂ), ਹੱਥਾਂ ਅਤੇ ਆਵਾਜ਼(ਆਵਾਜ਼ਾਂ) ਬਾਰੇ ਲਈ ਗਈ ਜਾਣਕਾਰੀ ਦੀ ਵਰਤੋਂ ਕਰਦੀ ਹੈ। ਇਸ ਸੁਵਿਧਾ ਨਾਲ, ਤੁਸੀਂ ਸੈਲਫ਼ੀਆਂ ਅਤੇ ਚਿੱਤਰਾਂ ਉੱਪਰ ਮਜ਼ੇਦਾਰ ਅਤੇ ਲਾਭਕਾਰੀ ਵਧਾਈ ਗਈ ਹਕੀਕਤ ਵਾਲੇ ਪ੍ਰਭਾਵ ਲਾਗੂ ਕਰ ਸਕਦੇ ਹੋ। ਸਾਡਾ ਕੈਮਰਾ ਕੁਝ ਸੁਵਿਧਾਵਾਂ (ਜਿਵੇਂ ਕਿ ਤੁਹਾਡੇ ਹੱਥ, ਅੱਖਾਂ ਅਤੇ ਨੱਕ ਕਿੱਥੇ ਹਨ) ਦਾ ਪਤਾ ਲਗਾਉਣ ਲਈ ਤਕਨਾਲੋਜੀ ਦੀ ਵਰਤੋਂ ਕਰਦਾ ਹੈ ਅਤੇ ਕੈਮਰੇ ਦੁਆਰਾ ਸੰਵੇਦਿਤ ਚਿੱਤਰ ਦੇ ਨਾਲ ਸੁਵਿਧਾ ਦੀ ਸਹੀ ਸਥਿਤੀ ਲਈ ਉਸ ਜਾਣਕਾਰੀ ਦੀ ਵਰਤੋਂ ਕਰਦਾ ਹੈ। ਇਕੱਠੀ ਕੀਤੀ ਜਾਣ ਵਾਲੀ ਕੋਈ ਵੀ ਜਾਣਕਾਰੀ ਜਿੰਨੀ ਜਲਦੀ ਹੋ ਸਕੇ ਮਿਟਾ ਦਿੱਤੀ ਜਾਵੇਗੀ (ਆਮ ਤੌਰ 'ਤੇ ਐਪ ਬੰਦ ਹੋਣ ਤੋਂ ਤੁਰੰਤ ਬਾਅਦ) ਅਤੇ ਹਮੇਸ਼ਾ ਤਿੰਨ ਸਾਲਾਂ ਦੇ ਅੰਦਰ।<br/><br/>ਜੇਕਰ ਤੁਸੀਂ ਸਹਿਮਤ ਹੋਣਾ ਅਤੇ ਜਾਰੀ ਰੱਖਣਾ ਚਾਹੁੰਦੇ ਹੋ, ਤਾਂ ਹੇਠਾਂ ਟੈਪ ਕਰੋ।",
    legalPromptVariantGAdultOrChild: "ਕੀ ਤੁਸੀਂ ਬਾਲਗ ਹੋ ਜਾਂ ਬੱਚਾ ਹੋ?",
    legalPromptVariantGFindYourParent: "ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਮਾਤਾ-ਪਿਤਾ ਜਾਂ ਕਾਨੂੰਨੀ ਸਰਪ੍ਰਸਤ ਲੱਭੋ।",
    legalPromptVariantGIAmGuardian: "ਮੈਂ ਬੱਚੇ ਦਾ ਸਰਪ੍ਰਸਤ ਹਾਂ",
    legalPromptVariantGCancel: "ਰੱਦ ਕਰੋ",
    legalPromptVariantGAdult: "ਬਾਲਗ",
    legalPromptVariantGChild: "ਬੱਚਾ"
  },
  "pl-PL": {
    legalPromptMessage: L((e) => e`Korzystając z nakładek, potwierdzasz zapoznanie się z <a href="${0}" target="_blank">Polityką prywatności</a> i akceptujesz <a href="${0}" target="_blank">Regulamin usługi</a>. Niektóre nakładki wykorzystują informacje o Twojej twarzy, dłoniach i głosie, aby działać poprawnie. <a href="${0}" target="_blank">Dowiedz się więcej</a>, a jeśli chcesz wyrazić zgodę i kontynuować, stuknij poniżej.`),
    legalPromptAccept: "Zgadzam się",
    legalPromptReject: "Odrzuć",
    legalPromptTermsOfService: "Regulamin",
    legalPromptVariantGMessage: "Ta funkcja wykorzystuje do działania informacje o twarzy (twarzach), rękach i głosie (głosach) wykrytych przez kamerę i mikrofon. Dzięki niej możesz nakładać na selfie i zdjęcia zabawne i przydatne efekty rozszerzonej rzeczywistości. Nasza kamera wykorzystuje technologię do lokalizowania określonych cech (takich jak miejsce, w którym znajdują się Twoje ręce, oczy i nos) i wykorzystuje te informacje do dokładnego umiejscowienia danej cechy na obrazie wykrywanym przez kamerę. Wszelkie zebrane informacje zostaną usunięte możliwie jak najszybciej (zazwyczaj wkrótce po zamknięciu aplikacji) i zawsze nie później niż w ciągu trzech lat.<br/><br/>Jeśli chcesz wyrazić zgodę i kontynuować, stuknij poniżej.",
    legalPromptVariantGAdultOrChild: "Jesteś osobą dorosłą czy dzieckiem?",
    legalPromptVariantGFindYourParent: "Zwróć się do swojego rodzica lub opiekuna prawnego.",
    legalPromptVariantGIAmGuardian: "Jestem opiekunem prawnym dziecka",
    legalPromptVariantGCancel: "Anuluj",
    legalPromptVariantGAdult: "Osoba dorosła",
    legalPromptVariantGChild: "Dziecko"
  },
  "pt-BR": {
    legalPromptMessage: L((e) => e`Ao usar as Lentes, você reconhece ter lido a <a href="${0}" target="_blank">Política de Privacidade</a> da Snap e concorda com os <a href="${0}" target="_blank">Termos de Serviço</a> da Snap. Algumas Lentes usam informações sobre seu rosto, mãos e voz para funcionar. <a href="${0}" target="_blank">Saiba mais</a> e, se quiser concordar e continuar, toque abaixo.`),
    legalPromptAccept: "Eu concordo",
    legalPromptReject: "Recusar",
    legalPromptTermsOfService: "Termos de Serviço",
    legalPromptVariantGMessage: "Este recurso usa informações sobre rosto(s), mãos e voz(es) detectados pela câmera e pelo microfone para funcionar. Com este recurso, você pode aplicar efeitos divertidos e úteis de realidade aumentada em selfies e imagens. Nossa câmera usa tecnologia para localizar certos recursos (como onde estão suas mãos, olhos e nariz) e usa esta informação para posicionar corretamente o recurso na imagem detectada pela câmera. Qualquer informação coletada será apagada o mais rápido possível (geralmente logo depois que o aplicativo é fechado) e sempre antes de três dias.<br/><br/>Se você quiser concordar e continuar, toque abaixo.",
    legalPromptVariantGAdultOrChild: "Você é adulto ou criança?",
    legalPromptVariantGFindYourParent: "Localize seu pai/mãe ou representante legal.",
    legalPromptVariantGIAmGuardian: "Sou representante da criança",
    legalPromptVariantGCancel: "Cancelar",
    legalPromptVariantGAdult: "Adulto",
    legalPromptVariantGChild: "Criança"
  },
  "pt-PT": {
    legalPromptMessage: L((e) => e`Ao utilizares as Lentes, confirmas a leitura da <a href="${0}" target="_blank">Política de Privacidade</a> da Snap e aceitas as <a href="${0}" target="_blank">Condições de Serviço</a> da Snap. Algumas Lentes utilizam informações sobre a tua cara, mãos e voz para funcionarem. <a href="${0}" target="_blank">Obtém mais informações</a> e, se quiseres aceitar e continuar, toca abaixo.`),
    legalPromptAccept: "Aceito",
    legalPromptReject: "Fechar",
    legalPromptTermsOfService: "Condições de Serviço",
    legalPromptVariantGMessage: "Esta funcionalidade utiliza informações relacionadas com caras, mãos e vozes detetadas pela câmara e o microfone para poder funcionar. Com esta funcionalidade, pode aplicar efeitos de realidade aumentada de forma divertida e útil a selfies e imagens. A nossa câmara recorre a tecnologia para localizar determinadas caraterísticas (como a localização das tuas mãos, dos olhos e do nariz) e utiliza essas informações para posicionar de forma precisa a caraterística na imagem captada pela câmara. Quaisquer informações recolhidas serão eliminadas logo que possível (normalmente pouco depois de a app ser fechada) e nunca após um máximo de três anos. <br/><br/>Se quiser aceitar e continuar, toque abaixo.",
    legalPromptVariantGAdultOrChild: "És um adulto ou uma criança?",
    legalPromptVariantGFindYourParent: "Recorre ao teus pais ou ao(à) teu(tua) representante legal",
    legalPromptVariantGIAmGuardian: "Sou o(a) representante da criança",
    legalPromptVariantGCancel: "Cancelar",
    legalPromptVariantGAdult: "Adulto",
    legalPromptVariantGChild: "Criança"
  },
  "ro-RO": {
    legalPromptMessage: L((e) => e`Dacă folosești lentile, confirmi că ai citit <a href="${0}" target="_blank">Politica de confidențialitate</a> Snap și că ești de acord cu <a href="${0}" target="_blank">Condițiile de utilizare</a> Snap. Unele lentile folosesc informații despre fața ta, despre mâinile tale și despre vocea ta pentru a funcționa. <a href="${0}" target="_blank">Află mai multe</a>, iar dacă dorești să accepți și să continui, atinge dedesubt.`),
    legalPromptAccept: "Accept",
    legalPromptReject: "Respinge",
    legalPromptTermsOfService: "Termeni de utilizare",
    legalPromptVariantGMessage: "Pentru a rula, funcția utilizează informații despre chipul tău, mâinile tale și vocea ta detectate de cameră și microfon. Cu ajutorul acestei funcții, poți să aplici efecte de realitate augumentată amuzante și utile peste selfie-uri și imagini. Camera noastră folosește tehnologia pentru a găsi anumite caracteristici (de exemplu, unde se află mâinile, ochii și nasul tău) și utilizează aceste informații pentru a poziționa corect funcția în imaginea detectată de cameră. Toate informațiile colectate sunt șterse cât mai curând posibil (de obicei, la scurt timp după ce se închide aplicația), limita maximă fiind de trei ani.<br/><br/>Dacă ești de acord și dorești să continui, atinge mai jos.",
    legalPromptVariantGAdultOrChild: "Ești adult sau copil?",
    legalPromptVariantGFindYourParent: "Este necesară prezența părintelui sau a tutorelui.",
    legalPromptVariantGIAmGuardian: "Sunt tutorele copilului",
    legalPromptVariantGCancel: "Anulează",
    legalPromptVariantGAdult: "Adult",
    legalPromptVariantGChild: "Copil"
  },
  "ru-RU": {
    legalPromptMessage: L((e) => e`Используя линзы, вы подтверждаете, что прочитали <a href="${0}" target="_blank">Политику конфиденциальности</a> Snap и принимаете <a href="${0}" target="_blank">Условия оказания услуг</a>. Для работы некоторых линз необходимы сведения о вашем лице, руках и голосе. <a href="${0}" target="_blank">Подробнее</a>. Если вы согласны продолжать, нажмите ниже.`),
    legalPromptAccept: "Принимаю",
    legalPromptReject: "Закрыть",
    legalPromptTermsOfService: "Условия оказания услуг",
    legalPromptVariantGMessage: "Для работы этой функции используется регистрируемая камерой и микрофоном информация о лицах, руках и голосах. С её помощью к селфи и изображениям можно применять забавные и полезные эффекты дополненной реальности. Наша камера использует технологию, чтобы определять расположение конкретных элементов (например, ваших рук, глаз и носа), и использует эту информацию для точного наложения функции на изображение, которое уловила камера. Вся полученная информация удаляется в кратчайшие сроки (как правило, вскоре после закрытия приложения), но не позднее, чем через три года.<br/><br/>Если вы согласны и хотите продолжить, нажмите ниже.",
    legalPromptVariantGAdultOrChild: "Вы ― взрослый или ребёнок?",
    legalPromptVariantGFindYourParent: "Позовите родителя или законного опекуна.",
    legalPromptVariantGIAmGuardian: "Я ― законный опекун ребёнка",
    legalPromptVariantGCancel: "Отмена",
    legalPromptVariantGAdult: "Взрослый",
    legalPromptVariantGChild: "Ребёнок"
  },
  "sv-SE": {
    legalPromptMessage: L((e) => e`Genom att använda linser intygar du att du har läst Snaps <a href="${0}" target="_blank">sekretessvillkor</a> och godkänner Snaps <a href="${0}" target="_blank">användarvillkor</a>. Vissa linser använder information om ditt ansikte, dina händer och din röst för att fungera. <a href="${0}" target="_blank">Läs mer</a> och om du vill godkänna och fortsätta så trycker du nedan.`),
    legalPromptAccept: "Jag godkänner",
    legalPromptReject: "Avvisa",
    legalPromptTermsOfService: "Användarvillkor",
    legalPromptVariantGMessage: "För att fungera använder funktionen information om ansikte(n), händer och röst(er) som upptäckts av kameran och mikrofonen. Funktionen gör att du kan tillämpa roliga och användbara AR-effekter över selfies och bilder. Med hjälp av teknik kan vår kamera lokalisera vissa särdrag (som dina händer, ögon och din näsa). Informationen används sedan för att korrekt positionera funktionen över bilden som kameran fångat upp. All information som samlats in raderas så snart som möjligt (vanligtvis inom kort efter att appen stängts) och alltid inom tre år.<br/><br/>Tryck nedan om du vill godkänna och fortsätta.",
    legalPromptVariantGAdultOrChild: "Är du vuxen eller ett barn?",
    legalPromptVariantGFindYourParent: "Leta upp din förälder eller vårdnadshavare",
    legalPromptVariantGIAmGuardian: "Jag är barnets vårdnadshavare",
    legalPromptVariantGCancel: "Avbryt",
    legalPromptVariantGAdult: "Vuxen",
    legalPromptVariantGChild: "Barn"
  },
  "ta-IN": {
    legalPromptMessage: L((e) => e`லென்ஸஸைப் பயன்படுத்துவதன் மூலம், நீங்கள் Snap இன் <a href="${0}" target="_blank">தனியுரிமைக் கொள்கையைப்</a> படித்துவிட்டதாக ஒப்புக்கொள்கிறீர்கள் மற்றும் Snap இன் <a href="${0}" target="_blank">சேவை நிபந்தனைகளை</a> ஏற்றுக்கொள்கிறீர்கள். சில லென்ஸஸ் வேலை செய்வதற்கு உங்கள் முகம், கைகள் மற்றும் குரலைப் பற்றிய தகவல்களைப் பயன்படுத்துகின்றன. <a href="${0}" target="_blank">மேலும் அறிக</a>, நீங்கள் ஒப்புக்கொண்டு தொடர விரும்பினால், கீழே தட்டுங்கள்.`),
    legalPromptAccept: "ஏற்கிறேன்",
    legalPromptReject: "நிராகரி",
    legalPromptTermsOfService: "சேவை நிபந்தனைகள்",
    legalPromptVariantGMessage: "இந்த அம்சம் வேலை செய்ய கேமரா மற்றும் மைக்ரோஃபோனால் கண்டறியப்படும் முகம் (முகங்கள்), கைகள் மற்றும் குரல்(கள்) பற்றிய தகவல்களைப் பயன்படுத்துகிறது. இந்த அம்சத்தின் மூலம் நீங்கள் செல்ஃபிக்கள் மற்றும் படங்களில் வேடிக்கையான மற்றும் பயனுள்ள இணைப்பு நிஜமாக்கத்தைப் பயன்படுத்தலாம். எங்கள் கேமரா சில அம்சங்களைக் கண்டறிய (எடுத்துக்காட்டாக, உங்கள் கைகள், கண்கள், மூக்கு போன்றவை எங்கு உள்ளன என்று கண்டறிய) தொழில்நுட்பத்தைப் பயன்படுத்துகிறது, கேமராவால் கண்காணிக்கப்படும் படத்தில் அம்சத்தைத் துல்லியமாக வைக்க அந்தத் தகவல்களைப் பயன்படுத்துகிறது. திரட்டப்படும் எந்தத் தகவலும் இயன்றவரை விரைவாக நீக்கப்படும் (பொதுவாக, செயலி மூடப்பட்டவுடன்). மேலும், இது எப்போதும் மூன்று ஆண்டுகளுக்கு மேல் சேமிக்கப்படுவதில்லை.<br/><br/>நீங்கள் ஏற்றுக்கொண்டு தொடர விரும்பினால், கீழே தட்டுங்கள்.",
    legalPromptVariantGAdultOrChild: "நீங்கள் வயதுவந்தவரா அல்லது சிறுவரா?",
    legalPromptVariantGFindYourParent: "உங்கள் பெற்றோர் அல்லது சட்டப்பூர்வப் பாதுகாவலரைக் கண்டறியுங்கள்.",
    legalPromptVariantGIAmGuardian: "நான் குழந்தையின் பாதுகாவலர்",
    legalPromptVariantGCancel: "ரத்துசெய்",
    legalPromptVariantGAdult: "வயதுவந்தவர்",
    legalPromptVariantGChild: "சிறுவர்"
  },
  "te-IN": {
    legalPromptMessage: L((e) => e`లెన్సెస్‌ను ఉపయోగించడం ద్వారా, మీరు Snap యొక్క <a href="${0}" target="_blank">గోప్యతా విధానాన్ని</a> చదివినట్లు అంగీకరిస్తున్నారు మరియు Snap <a href="${0}" target="_blank">సేవా నిబంధనలకు</a> అంగీకరిస్తున్నారు. కొన్ని లెన్సెస్ పని చేయడానికి మీ ముఖం, చేతులు మరియు వాయిస్ గురించిన సమాచారాన్ని ఉపయోగిస్తాయి. <a href="${0}" target="_blank">మరింత తెలుసుకోండి</a>, మీరు అంగీకరించి కొనసాగించాలనుకుంటే, దిగువన ట్యాప్ చేయండి.`),
    legalPromptAccept: "నేను అంగీకరిస్తున్నాను",
    legalPromptReject: "డిస్మిస్ చేయండి",
    legalPromptTermsOfService: "సేవా నిబంధనలు",
    legalPromptVariantGMessage: "ఈ ఫీచర్ పని చేయడానికి కెమెరా మరియు మైక్రోఫోన్ ద్వారా గుర్తించబడిన ముఖం(లు), చేతులు మరియు వాయిస్(ల) గురించిన సమాచారాన్ని ఉపయోగిస్తుంది. ఈ ఫీచర్‌తో, మీరు సెల్ఫీలు, చిత్రాల పైన ఆహ్లాదకరమైన మరియు ఉపయోగకరమైన ఆగ్మెంటేడ్ రియాలిటీ ప్రభావాలను వర్తింపజేసుకోవచ్చు. మా కెమెరా నిర్దిష్ట ఫీచర్‌లను (మీ చేతులు, కళ్ళు మరియు ముక్కు ఎక్కడ ఉన్నాయో) గుర్తించడానికి సాంకేతికతను ఉపయోగిస్తుంది మరియు కెమెరా ద్వారా గ్రహించబడిన చిత్రంతో ఫీచర్‌ను ఖచ్చితంగా ఉంచడానికి ఆ సమాచారాన్ని ఉపయోగిస్తుంది. సేకరించిన ఏదైనా సమాచారం వీలైనంత త్వరగా (సాధారణంగా యాప్ మూసివేయబడిన వెంటనే) మరియు ఎల్లప్పుడూ మూడు సంవత్సరాలలోపు డిలీట్ చేయబడుతుంది.<br/><br/>మీరు అంగీకరించి కొనసాగించాలనుకుంటే, దిగువున ట్యాప్ చేయండి.",
    legalPromptVariantGAdultOrChild: "మీరు పెద్దవారా లేదా చిన్నవారా?",
    legalPromptVariantGFindYourParent: "దయచేసి మీ తల్లిదండ్రులు లేదా చట్టపరమైన సంరక్షకుడిని కనుగొనండి.",
    legalPromptVariantGIAmGuardian: "నేను పిల్లవాడి సంరక్షకుడిని",
    legalPromptVariantGCancel: "రద్దు",
    legalPromptVariantGAdult: "వయోజనుడు",
    legalPromptVariantGChild: "పిల్లవాడు"
  },
  "th-TH": {
    legalPromptMessage: L((e) => e`การใช้เลนส์แสดงว่าคุณยอมรับว่าคุณได้อ่าน <a href="${0}" target="_blank">นโยบายความเป็นส่วนตัว</a> ของ Snap และตกลงยอมรับ <a href="${0}" target="_blank">ข้อกำหนดการให้บริการ</a> ของ Snap เลนส์บางรายการต้องใช้ข้อมูลเกี่ยวกับใบหน้า มือ และเสียงของคุณจึงจะสามารถทำงานได้ <a href="${0}" target="_blank">เรียนรู้เพิ่มเติม</a> และหากคุณต้องการตกลงยอมรับและดำเนินการต่อ ให้แตะที่ด้านล่าง`),
    legalPromptAccept: "ฉันตกลงยอมรับ",
    legalPromptReject: "เพิกเฉย",
    legalPromptTermsOfService: "ข้อกำหนดการให้บริการ",
    legalPromptVariantGMessage: "ฟีเจอร์นี้ใช้ข้อมูลเกี่ยวกับใบหน้า มือ และเสียงซึ่งตรวจจับโดยใช้กล้องและไมโครโฟน เมื่อใช้ฟีเจอร์นี้ คุณสามารถใช้เอฟเฟกต์ความเป็นจริงเสริม (AR) ที่ทั้งสนุกและมีประโยชน์เมื่อใช้กับภาพเซลฟีและรูปภาพ กล้องของเราใช้เทคโนโลยีเพื่อระบุตำแหน่งของฟีเจอร์บางอย่าง (เช่น ตำแหน่งของมือ ตา และจมูกของคุณ) และใช้ข้อมูลดังกล่าวเพื่อให้วางตำแหน่งฟีเจอร์ได้อย่างถูกต้องลงบนรูปภาพที่ตรวจจับโดยใช้กล้อง เราจะลบข้อมูลต่าง ๆ ที่รวบรวมไว้โดยเร็วที่สุดเท่าที่จะทำได้ (ส่วนใหญ่จะเป็นช่วงหลังจากที่ปิดแอปแล้วไม่นาน) และจะไม่เกินกว่าระยะเวลาสามปี<br/><br/>หากคุณต้องการตกลงยอมรับและดำเนินการต่อ ให้แตะที่ด้านล่างนี้",
    legalPromptVariantGAdultOrChild: "คุณเป็นผู้ใหญ่หรือเด็ก?",
    legalPromptVariantGFindYourParent: "โปรดค้นหาพ่อแม่หรือผู้ปกครองตามกฎหมายของคุณ",
    legalPromptVariantGIAmGuardian: "ฉันเป็นผู้ปกครองของเด็ก",
    legalPromptVariantGCancel: "ยกเลิก",
    legalPromptVariantGAdult: "ผู้ใหญ่",
    legalPromptVariantGChild: "เด็ก"
  },
  "tr-TR": {
    legalPromptMessage: L((e) => e`Lensleri kullanarak, Snap\'in <a href="${0}" target="_blank">Gizlilik Politikası</a> içeriğini okuduğunu doğrulamış ve Snap\'in <a href="${0}" target="_blank">Kullanım Şartları</a> içeriğini kabul etmiş olursun. Bazı lenslerin çalışması için yüzün, ellerin ve sesinle ilgili bilgiler kullanılır. <a href="${0}" target="_blank">Daha Fazlasını Öğren</a> ve kabul edip devam etmek istiyorsan aşağıya dokun.`),
    legalPromptAccept: "Kabul Ediyorum",
    legalPromptReject: "Yoksay",
    legalPromptTermsOfService: "Kullanım Şartları",
    legalPromptVariantGMessage: "Bu özelliğin çalışması için kamera ve mikrofon tarafından algılanan yüzler, eller ve sesler hakkındaki bilgiler kullanılır. Bu özellik sayesinde selfie'lerin ve görüntülerin üzerine eğlenceli ve kullanışlı artırılmış gerçeklik efektleri uygulayabilirsin. Kameramız, belirli özellikleri (ellerinin, gözlerinin ve burnunun nerede olduğu gibi) bulmak için teknolojiden yararlanır ve bu bilgileri, kamera tarafından algılanan görüntüyle özelliği doğru şekilde konumlandırmak için kullanır. Toplanan tüm bilgiler mümkün olan en kısa sürede (genellikle uygulama kapatıldıktan kısa süre sonra) ve mutlaka en fazla üç yıl içinde silinir.<br/><br/>Kabul edip devam etmek istiyorsan aşağıya dokun.",
    legalPromptVariantGAdultOrChild: "Yetişkin mi yoksa çocuk musun?",
    legalPromptVariantGFindYourParent: "Lütfen ebeveynini veya yasal vasini bul.",
    legalPromptVariantGIAmGuardian: "Ben çocuğun vasisiyim",
    legalPromptVariantGCancel: "İptal Et",
    legalPromptVariantGAdult: "Yetişkin",
    legalPromptVariantGChild: "Çocuk"
  },
  "ur-PK": {
    legalPromptMessage: L((e) => e`لینزز استعمال کرنے کا مطلب ہے کہ آپ Snap کی <a href="${0}" target="_blank">پرائیویسی پالیسی</a> پڑھنے کا اعتراف کرتے ہیں اور Snap کی <a href="${0}" target="_blank">سروس کی شرائط</a> سے متفق ہیں۔ کچھ لینزز کام کرنے کیلئے آپ کے چہرے، ہاتھوں اور آواز کے بارے میں معلومات استعمال کرتے ہیں۔ <a href="${0}" target="_blank">مزید جانیں</a> اور اگر آپ متفق ہیں اور جاری رکھنا چاہتے ہیں تو ذیل میں ٹیپ کریں۔`),
    legalPromptAccept: "میں متفق ہوں",
    legalPromptReject: "برخاست کریں",
    legalPromptTermsOfService: "سروس کی شرائط",
    legalPromptVariantGMessage: "یہ خصوصیت کام کرنے کیلئے چہرہ (چہرے)، ہاتھوں اور آوازوں کے بارے میں معلومات استعمال کرتی ہے جن کا پتا کیمرے اور مائیکرو فون کے ذریعے لگایا جاتا ہے۔ اس خصوصیت کے ساتھ، آپ سیلفیز اور تصاویر پر دلچسپ اور کارآمد افزودہ حقیقت کے ایفیکٹس کا اطلاق کر سکتے ہیں۔ ہمارا کیمرا مخصوص خصوصیات کے لوکیشن کا تعین کرنے (جیسے کہ آپ کے ہاتھ، آنکھیں اور ناک کہاں ہیں) کیلئے ٹیکنالوجی استعمال کرتا ہے اور ان معلومات کی مدد سے خصوصیت کو کیمرا کی جانب سے محسوس کی گئی تصویر کے ساتھ درست طور پر پوزیشن کرتا ہے۔ اکٹھی کی گئی کوئی بھی معلومات جلد از جلد ڈیلیٹ ہو جائیں گی (عموماً ایپ بند ہونے کے فوراً بعد) نیز ہر صورت میں تین سال کے اندر ڈیلیٹ ہو جائیں گی۔<br/><br/>اگر آپ اتفاق کرنا اور جاری رکھنا چاہتے ہیں تو ذیل میں ٹیپ کریں۔",
    legalPromptVariantGAdultOrChild: "کیا آپ ایک بالغ یا بچہ ہیں؟",
    legalPromptVariantGFindYourParent: "براہ کرم اپنے والد/والدہ یا قانونی سرپرست کو تلاش کریں۔",
    legalPromptVariantGIAmGuardian: "میں بچہ کا/کی سرپرست ہوں",
    legalPromptVariantGCancel: "منسوخ کریں",
    legalPromptVariantGAdult: "بالغ",
    legalPromptVariantGChild: "بچہ"
  },
  "vi-VN": {
    legalPromptMessage: L((e) => e`Bằng cách sử dụng Ống Kính, bạn xác nhận đã đọc <a href="${0}" target="_blank">Chính Sách Bảo Mật</a> của Snap và đồng ý với <a href="${0}" target="_blank">Điều Khoản Dịch Vụ</a>của Snap. Một số ống kính sử dụng thông tin về khuôn mặt, bàn tay và giọng nói của bạn để hoạt động. Bạn có thể <a href="${0}" target="_blank">Tìm Hiểu Thêm</a>, còn nếu bạn muốn đồng ý và tiếp tục, hãy chạm vào bên dưới.`),
    legalPromptAccept: "Tôi Đồng Ý",
    legalPromptReject: "Bỏ Qua",
    legalPromptTermsOfService: "Điều Khoản Dịch Vụ",
    legalPromptVariantGMessage: "Tính năng này hoạt động dựa trên việc sử dụng thông tin về khuôn mặt, bàn tay và giọng nói mà camera và micrô phát hiện được. Bạn có thể sử dụng tính năng này để áp dụng các hiệu ứng thực tế tăng cường thú vị và hữu ích lên ảnh tự sướng và hình ảnh. Camera của chúng tôi áp dụng công nghệ để tìm những đặc điểm nhất định (chẳng hạn như vị trí bàn tay, mắt và mũi của bạn), rồi sử dụng thông tin đó để xác định chính xác vị trí của đặc điểm trong hình ảnh mà camera chụp được. Chúng tôi sẽ xóa mọi thông tin được thu thập sớm nhất có thể (thường ngay sau khi bạn đóng ứng dụng) và luôn xóa trong khoảng thời gian không quá ba năm.<br/><br/>Nếu bạn muốn đồng ý và tiếp tục, hãy chạm vào bên dưới.",
    legalPromptVariantGAdultOrChild: "Bạn là người lớn hay trẻ em?",
    legalPromptVariantGFindYourParent: "Vui lòng tìm phụ huynh hoặc người giám hộ hợp pháp.",
    legalPromptVariantGIAmGuardian: "Tôi là người giám hộ của trẻ",
    legalPromptVariantGCancel: "Hủy Bỏ",
    legalPromptVariantGAdult: "Người lớn",
    legalPromptVariantGChild: "Trẻ em"
  },
  "zh-Hans": {
    legalPromptMessage: L((e) => e`使用特效镜头，即表示你确认已经阅读 Snap 的<a href="${0}" target="_blank">隐私政策</a>，并同意 Snap 的<a href="${0}" target="_blank">服务条款</a>。一些特效镜头需要使用有关你的脸、手和声音的信息才能正常工作。<a href="${0}" target="_blank">了解更多</a>，如果你同意并继续，请点击下面。`),
    legalPromptAccept: "我同意",
    legalPromptReject: "忽略",
    legalPromptTermsOfService: "服务条款",
    legalPromptVariantGMessage: "此功能会使用相机和麦克风检测到的面部、手部和声音信息。使用此功能，你可以对自拍照和图片应用有趣和有用的增强现实效果。我们的相机会使用技术，定位某些特征信息（例如：你的手、眼睛和鼻子的位置），并使用这些信息和相机感知到的图像来准确定位这些特征。收集的所有信息都将尽快删除（通常在应用关闭后不久），最久不会超过三年。<br/><br/>如果你同意并想继续，请点击下方。",
    legalPromptVariantGAdultOrChild: "你是成人还是儿童？",
    legalPromptVariantGFindYourParent: "请通知你的家长或法定监护人。",
    legalPromptVariantGIAmGuardian: "我是这名儿童的监护人",
    legalPromptVariantGCancel: "取消",
    legalPromptVariantGAdult: "成人",
    legalPromptVariantGChild: "儿童"
  },
  "zh-Hant": {
    legalPromptMessage: L((e) => e`使用特效鏡頭，代表你已閱讀 Snap 的<a href="${0}" target="_blank">隱私政策</a>並同意 Snap 的<a href="${0}" target="_blank">服務條款</a>。有些特效鏡頭需使用你的臉部、手部和聲音資訊才能運作。<a href="${0}" target="_blank">請按這裡以了解更多資訊</a>，如果你同意並想繼續使用功能，請點按下方。`),
    legalPromptAccept: "我同意",
    legalPromptReject: "略過",
    legalPromptTermsOfService: "服務條款",
    legalPromptVariantGMessage: "這個功能會使用相機和麥克風偵測到的臉部、手部和聲音資訊來進行運作。使用這個功能，你可以針對自拍照和圖片套用好玩和有作用的擴增實境效果。我們的相機會使用科技技術，定位某些特徵資訊 (例如：你的手、眼睛和鼻子的位置)，並使用這些資訊和相機感應到的影像來正確地定位這些特徵。所收集的資訊將盡快刪除 (通常會在應用程式關閉後)，最久不會超過三年。<br/><br/>如果你同意並想繼續使用此功能，請點按下方。",
    legalPromptVariantGAdultOrChild: "你是成人或兒童？",
    legalPromptVariantGFindYourParent: "請通知你的父母或法定監護人。",
    legalPromptVariantGIAmGuardian: "我是這個兒童的監護人",
    legalPromptVariantGCancel: "取消",
    legalPromptVariantGAdult: "成人",
    legalPromptVariantGChild: "兒童"
  }
}, Ml = {
  bn: "bn-BD",
  da: "da-DK",
  de: "de-DE",
  el: "el-GR",
  en: "en-US",
  es: "es-ES",
  fi: "fi-FI",
  fil: "fil-PH",
  fr: "fr-FR",
  gu: "gu-IN",
  hi: "hi-IN",
  id: "id-ID",
  it: "it-IT",
  ja: "ja-JP",
  kn: "kn-IN",
  ko: "ko-KR",
  ml: "ml-IN",
  mr: "mr-IN",
  ms: "ms-MY",
  nb: "nb-NO",
  nl: "nl-NL",
  pl: "pl-PL",
  pt: "pt-BR",
  ro: "ro-RO",
  ru: "ru-RU",
  sv: "sv-SE",
  ta: "ta-IN",
  te: "te-IN",
  th: "th-TH",
  tr: "tr-TR",
  ur: "ur-PK",
  vi: "vi-VN",
  zh: "zh-Hans"
}, _E = {
  "zh-TW": "zh-Hant",
  "zh-CN": "zh-Hans"
}, AE = (e) => e in nr, NE = "en-US";
function OE() {
  const e = an().locale;
  if (AE(e))
    return e;
  const n = _E[e];
  if (n && n in nr)
    return n;
  const t = e.split("-")[0];
  return t && t in nr ? t : t && t in Ml ? Ml[t] : NE;
}
const vr = OE();
function Ce(e) {
  return nr[vr][e];
}
const RE = `
dialog {
    display: flex;
    flex-direction: column;

    background-color: #fff;
    border: #efefef 1px solid;
    border-radius: 20px;
    box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.3);

    max-width: 80vw;
    max-height: 80vh;
    padding: 44px 0 24px 0;

    font-size: 16px;
    font-family: sans-serif;
    font-style: normal;
    font-weight: 600;
    line-height: 24px;
}

dialog::backdrop {
    background-color: rgba(0, 0, 0, 0.4);
}

.title {
    color: #16191C;
    padding: 0 32px;
    text-align: center;
}

.body {
    color: #656D78;
    font-size: 14px;
    font-weight: 500;
    margin-top: 16px;
    max-width: 350px;
    padding: 0 32px;
    overflow: auto;
}

a {
    color: rgb(78, 171, 248);
}

button {
    cursor: pointer;
}

button.dismiss {
    position: absolute;
    top: 7px;
    right: 7px;
    padding: 0;
    height: 36px;
    width: 36px;
    margin: 0;
    background-color: transparent;
    border: 0;
}

button.dismiss svg {
    fill: black;
}

.buttons {
    margin-top: 8px;
    padding: 0 32px;
}

.buttons button {
    background: #0FADFF;
    border: 0;
    border-radius: 25px;

    width: 100%;
    padding: 1rem;
    margin-top: 8px;

    color: #fff;
    font-weight: inherit;
    font-family: inherit;
    font-size: inherit;
    font-style: inherit;
}

.buttons button.secondary {
    background-color: transparent;
    color: #656D78;
}

// Proper filling of X button in High Contrast themes
@media (forced-colors: active) {
    button.dismiss svg {
        fill: ButtonText;
    }
}
`;
function kE(e) {
  return `
        <button class="dismiss" autofocus data-key=${e.key}>
            <svg xmlns="http://www.w3.org/2000/svg" role="img" width="36" height="36" viewBox="0 0 36 36">
                <title>${e.text}</title>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M12.6763 11.2621C12.2858 10.8716 11.6527 10.8716 11.2621 11.2621C10.8716 11.6527 10.8716 12.2858 11.2621 12.6763L16.5858 18L11.2621 23.3237C10.8716 23.7142 10.8716 24.3474 11.2621 24.7379C11.6527 25.1284 12.2858 25.1284 12.6764 24.7379L18 19.4142L23.3237 24.7379C23.7142 25.1284 24.3474 25.1284 24.7379 24.7379C25.1284 24.3474 25.1284 23.7142 24.7379 23.3237L19.4142 18L24.7379 12.6763C25.1284 12.2858 25.1284 11.6527 24.7379 11.2621C24.3474 10.8716 23.7142 10.8716 23.3237 11.2621L18 16.5858L12.6763 11.2621Z" fill-opacity="0.4"/>
            </svg>
        </button>`;
}
function TE(e) {
  return e ? `<div class="title" role="heading">${e}</div>` : "";
}
function gE(e) {
  return e ? `<div class="body">${e}</div>` : "";
}
function bE(e) {
  return `<button data-key="${e.key}"${e.isSecondary ? ' class="secondary"' : ""}>${e.text}</button>`;
}
function PE(e) {
  return e.length === 0 ? "" : `
        <div class="buttons">
        ${e.map((n) => bE(n)).join(`
`)}
        </div>`;
}
function St(e, n, t) {
  t && e.setAttribute(n, t);
}
function Io(e) {
  return new Promise((n) => {
    var t, a, r;
    const i = document.createElement("div");
    St(i, "data-testid", e.dataTestId);
    const o = i.attachShadow({ mode: "open" }), s = document.createElement("style");
    o.appendChild(s), s.innerHTML = RE;
    const u = document.createElement("dialog");
    St(u, "aria-label", (t = e.titleText) !== null && t !== void 0 ? t : e.title), St(u, "lang", e.lang), St(u, "dir", "auto"), o.appendChild(u), u.innerHTML = `
            ${kE({ key: "dismiss", text: (a = e.dismissButtonText) !== null && a !== void 0 ? a : "Dismiss" })}
            ${TE(e.title)}
            ${gE(e.body)}
            ${PE((r = e.buttons) !== null && r !== void 0 ? r : [])}
        `;
    const c = Array.from(u.querySelectorAll("button"));
    Ze(...c.map((d) => wn(d, "click").pipe(g(() => d.dataset.key))), wn(u, "cancel").pipe(g(() => "dismiss"))).pipe(Ae(1)).subscribe({ next: n, complete: () => i.remove() }), e.container.appendChild(i), u.showModal();
  });
}
const LE = (e) => {
  let n = 3735928559, t = 1103547991;
  for (let a = 0; a < e.length; a++) {
    const r = e.charCodeAt(a);
    n = Math.imul(n ^ r, 2654435761), t = Math.imul(t ^ r, 1597334677);
  }
  return n = Math.imul(n ^ n >>> 16, 2246822507) ^ Math.imul(t ^ t >>> 13, 3266489909), t = Math.imul(t ^ t >>> 16, 2246822507) ^ Math.imul(n ^ n >>> 13, 3266489909), (4294967296 * (2097151 & t) + (n >>> 0)).toString(16);
}, CE = `
<svg xmlns="http://www.w3.org/2000/svg" role="img" viewBox="0 0 32 32" height="48px">
    <g>
        <path
            d="M 30.898 23.477 C 30.77 23.045 30.148 22.743 30.148 22.743 C 30.092 22.71 30.039 22.684 29.994 22.663 C 28.962 22.161 28.048 21.561 27.277 20.876 C 26.659 20.325 26.128 19.719 25.701 19.074 C 25.182 18.288 24.937 17.632 24.831 17.275 C 24.773 17.043 24.782 16.951 24.831 16.832 C 24.873 16.731 24.99 16.632 25.049 16.588 C 25.397 16.341 25.96 15.976 26.303 15.75 C 26.602 15.556 26.859 15.389 27.009 15.283 C 27.494 14.944 27.824 14.596 28.02 14.223 C 28.275 13.74 28.303 13.208 28.107 12.684 C 27.84 11.978 27.184 11.556 26.35 11.556 C 26.163 11.556 25.974 11.577 25.785 11.62 C 25.308 11.723 24.852 11.894 24.474 12.042 C 24.446 12.054 24.416 12.032 24.418 12.002 C 24.457 11.059 24.502 9.79 24.399 8.584 C 24.306 7.493 24.082 6.576 23.717 5.776 C 23.351 4.972 22.874 4.376 22.5 3.947 C 22.143 3.536 21.519 2.936 20.577 2.394 C 19.251 1.631 17.742 1.244 16.09 1.244 C 14.443 1.244 12.934 1.631 11.605 2.394 C 10.607 2.966 9.97 3.614 9.678 3.947 C 9.304 4.376 8.827 4.972 8.46 5.776 C 8.096 6.576 7.872 7.496 7.778 8.584 C 7.673 9.792 7.715 10.96 7.76 11.999 C 7.762 12.03 7.732 12.051 7.704 12.039 C 7.325 11.892 6.87 11.72 6.393 11.617 C 6.204 11.575 6.012 11.554 5.828 11.554 C 4.994 11.554 4.337 11.976 4.071 12.682 C 3.875 13.205 3.903 13.738 4.157 14.221 C 4.354 14.594 4.685 14.941 5.169 15.281 C 5.318 15.387 5.575 15.553 5.874 15.748 C 6.211 15.968 6.758 16.323 7.108 16.569 C 7.152 16.599 7.299 16.712 7.346 16.827 C 7.397 16.951 7.404 17.045 7.341 17.289 C 7.234 17.648 6.989 18.298 6.479 19.069 C 6.052 19.715 5.522 20.32 4.902 20.871 C 4.132 21.556 3.218 22.157 2.186 22.658 C 2.137 22.682 2.078 22.712 2.015 22.748 C 2.015 22.748 1.399 23.064 1.282 23.472 C 1.109 24.075 1.567 24.64 2.036 24.943 C 2.8 25.438 3.732 25.703 4.272 25.849 C 4.421 25.889 4.559 25.926 4.683 25.964 C 4.76 25.989 4.956 26.062 5.038 26.17 C 5.143 26.306 5.155 26.473 5.192 26.66 C 5.253 26.977 5.384 27.373 5.774 27.643 C 6.204 27.941 6.75 27.962 7.444 27.99 C 8.168 28.018 9.07 28.054 10.1 28.394 C 10.579 28.553 11.011 28.818 11.514 29.128 C 12.56 29.773 13.864 30.578 16.09 30.578 C 18.318 30.578 19.629 29.768 20.685 29.119 C 21.183 28.811 21.612 28.546 22.08 28.391 C 23.11 28.049 24.011 28.014 24.735 27.988 C 25.427 27.962 25.974 27.941 26.404 27.641 C 26.822 27.35 26.943 26.918 26.997 26.59 C 27.027 26.428 27.046 26.285 27.14 26.165 C 27.219 26.064 27.399 25.992 27.483 25.964 C 27.609 25.924 27.751 25.886 27.906 25.844 C 28.445 25.698 29.123 25.527 29.945 25.061 C 30.933 24.511 31.001 23.82 30.898 23.477"
            fill="#ffffff"
            stroke="#00000000"
            stroke-width="1"
        />
    </g>
    <g>
        <path
            d="M 29.56 24.299 C 28.21 25.045 27.312 24.965 26.613 25.414 C 26.021 25.795 26.37 26.618 25.939 26.915 C 25.411 27.279 23.843 26.889 21.822 27.555 C 20.155 28.107 19.09 29.689 16.089 29.689 C 13.081 29.689 12.047 28.114 10.357 27.555 C 8.335 26.889 6.768 27.279 6.24 26.915 C 5.809 26.618 6.16 25.795 5.566 25.414 C 4.869 24.965 3.969 25.045 2.619 24.299 C 1.758 23.825 2.247 23.53 2.532 23.393 C 7.426 21.027 8.204 17.372 8.24 17.096 C 8.282 16.769 8.328 16.509 7.966 16.175 C 7.615 15.853 6.066 14.895 5.636 14.593 C 4.925 14.098 4.612 13.6 4.841 12.99 C 5 12.569 5.395 12.41 5.812 12.41 C 5.94 12.41 6.071 12.426 6.2 12.452 C 6.981 12.623 7.741 13.013 8.179 13.118 C 8.24 13.132 8.293 13.139 8.34 13.139 C 8.574 13.139 8.656 13.022 8.639 12.754 C 8.59 11.9 8.469 10.234 8.602 8.677 C 8.787 6.536 9.477 5.476 10.298 4.538 C 10.693 4.087 12.543 2.133 16.082 2.133 C 19.633 2.133 21.474 4.087 21.867 4.538 C 22.688 5.478 23.378 6.536 23.563 8.677 C 23.698 10.234 23.581 11.898 23.525 12.754 C 23.506 13.034 23.591 13.139 23.825 13.139 C 23.872 13.139 23.925 13.132 23.986 13.118 C 24.426 13.013 25.184 12.62 25.965 12.452 C 26.091 12.424 26.222 12.41 26.353 12.41 C 26.77 12.41 27.165 12.569 27.324 12.99 C 27.555 13.6 27.242 14.095 26.529 14.593 C 26.098 14.892 24.547 15.85 24.199 16.175 C 23.836 16.509 23.883 16.767 23.925 17.096 C 23.96 17.372 24.739 21.025 29.633 23.393 C 29.932 23.53 30.421 23.825 29.56 24.299 M 31.709 23.12 C 31.489 22.523 31.07 22.203 30.594 21.939 C 30.505 21.887 30.423 21.845 30.355 21.812 C 30.212 21.74 30.067 21.667 29.922 21.592 C 28.435 20.806 27.275 19.812 26.469 18.635 C 26.198 18.238 26.008 17.88 25.877 17.587 C 25.809 17.391 25.811 17.281 25.86 17.178 C 25.898 17.101 25.996 17.019 26.05 16.979 C 26.305 16.811 26.57 16.64 26.748 16.525 C 27.067 16.319 27.317 16.156 27.481 16.043 C 28.093 15.617 28.519 15.164 28.786 14.658 C 29.163 13.945 29.21 13.131 28.919 12.363 C 28.517 11.301 27.509 10.642 26.291 10.642 C 26.038 10.642 25.783 10.67 25.527 10.726 C 25.46 10.74 25.394 10.756 25.328 10.773 C 25.34 10.05 25.324 9.278 25.258 8.524 C 25.029 5.872 24.099 4.48 23.129 3.371 C 22.724 2.908 22.021 2.232 20.964 1.628 C 19.491 0.781 17.821 0.356 16 0.356 C 14.185 0.356 12.518 0.781 11.044 1.623 C 9.983 2.229 9.278 2.905 8.875 3.366 C 7.905 4.475 6.975 5.867 6.746 8.52 C 6.68 9.273 6.663 10.045 6.675 10.768 C 6.61 10.752 6.544 10.735 6.476 10.721 C 6.221 10.665 5.965 10.637 5.713 10.637 C 4.494 10.637 3.487 11.297 3.084 12.359 C 2.794 13.126 2.841 13.94 3.218 14.654 C 3.485 15.159 3.911 15.613 4.522 16.039 C 4.686 16.153 4.937 16.314 5.256 16.52 C 5.427 16.633 5.68 16.794 5.926 16.958 C 5.963 16.984 6.097 17.082 6.141 17.173 C 6.193 17.279 6.195 17.393 6.118 17.604 C 5.987 17.891 5.801 18.242 5.535 18.631 C 4.747 19.782 3.62 20.757 2.18 21.536 C 1.419 21.941 0.54 22.355 0.29 23.118 C 0.039 23.88 0.203 24.582 0.842 25.239 C 1.053 25.466 1.318 25.665 1.653 25.85 C 2.438 26.283 3.105 26.496 3.63 26.641 C 3.721 26.669 3.937 26.736 4.031 26.819 C 4.265 27.022 4.23 27.331 4.543 27.78 C 4.731 28.061 4.949 28.25 5.129 28.374 C 5.783 28.826 6.516 28.854 7.294 28.881 C 7.997 28.908 8.793 28.94 9.702 29.24 C 10.079 29.364 10.47 29.605 10.922 29.883 C 12.011 30.552 13.501 31.467 15.998 31.467 C 18.493 31.467 19.995 30.547 21.091 29.876 C 21.541 29.6 21.93 29.361 22.297 29.242 C 23.206 28.942 24.003 28.912 24.706 28.884 C 25.483 28.854 26.216 28.826 26.87 28.377 C 27.076 28.234 27.331 28.004 27.535 27.651 C 27.76 27.272 27.753 27.003 27.964 26.821 C 28.05 26.746 28.238 26.68 28.338 26.65 C 28.868 26.505 29.545 26.292 30.344 25.852 C 30.697 25.658 30.976 25.443 31.192 25.2 C 31.194 25.197 31.196 25.192 31.199 25.19 C 31.805 24.544 31.955 23.787 31.709 23.12"
            fill="#000000"
            stroke="#00000000"
            stroke-width="1"
        />
    </g>
</svg>`;
function Wr(e, n, t) {
  return O(this, void 0, void 0, function* () {
    return (yield Io({
      container: document.body,
      dataTestId: "tos-dialog",
      lang: vr,
      title: e,
      titleText: n,
      body: t,
      dismissButtonText: Ce("legalPromptReject"),
      buttons: [
        {
          text: Ce("legalPromptAccept"),
          key: "accept"
        }
      ]
    })) === "accept";
  });
}
function wE() {
  return Io({
    container: document.body,
    dataTestId: "adult-or-child-dialog",
    lang: vr,
    title: Ce("legalPromptVariantGAdultOrChild"),
    buttons: [
      {
        text: Ce("legalPromptVariantGAdult"),
        key: "adult"
      },
      {
        text: Ce("legalPromptVariantGChild"),
        key: "child"
      }
    ]
  });
}
function DE() {
  return Io({
    container: document.body,
    dataTestId: "find-guardian-dialog",
    lang: vr,
    title: Ce("legalPromptVariantGFindYourParent"),
    buttons: [
      {
        text: Ce("legalPromptVariantGIAmGuardian"),
        key: "guardian"
      },
      {
        text: Ce("legalPromptVariantGCancel"),
        key: "cancel",
        isSecondary: !0
      }
    ]
  });
}
const qf = R("legalPrompt", () => function(n, t, a, r) {
  const i = r ? Ce("legalPromptVariantGMessage") : Ce("legalPromptMessage")({
    privacyPolicyUrl: n.webUrl,
    termsOfServiceUrl: t.webUrl,
    learnMoreUrl: a.webUrl
  }), o = Ce("legalPromptTermsOfService"), s = r ? o : CE;
  return {
    contentHash: LE(i),
    show() {
      return O(this, void 0, void 0, function* () {
        if (!r)
          return Wr(s, o, i);
        for (; ; )
          switch (yield wE()) {
            case "child":
              switch (yield DE()) {
                case "cancel":
                  continue;
                case "guardian":
                  return Wr(s, o, i);
                case "dismiss":
                  return !1;
                default:
                  $e();
              }
            case "adult":
              return Wr(s, o, i);
            case "dismiss":
              return !1;
            default:
              $e();
          }
      });
    }
  };
}), Qn = U("LegalState"), yE = 12 * 60 * 60, Vl = "lastAcceptedTosContentHash", UE = () => {
  const e = vo(Ge("unknown")(), Ge("accepted")(), Ge("rejected")()), n = hr(Z("requestLegalPrompt")(), Z("accept")(), Z("reject")());
  return new po(n, e, e.unknown(), (t) => Ze(t.pipe(le("unknown"), y("accept"), g(() => e.accepted())), t.pipe(le("unknown"), y("reject"), g(() => e.rejected())), t.pipe(le("rejected"), y("requestLegalPrompt"), g(() => e.unknown()))));
}, zr = /* @__PURE__ */ new Date("2021-09-30T00:00:00+00:00"), Ra = Gn.fromPartial({
  documents: [
    Nn.fromPartial({
      type: en.PRIVACY_POLICY,
      webUrl: "https://values.snap.com/privacy/privacy-policy",
      version: "1",
      timestamp: zr
    }),
    Nn.fromPartial({
      type: en.TERMS_OF_SERVICE,
      webUrl: "https://snap.com/terms",
      version: "1",
      timestamp: zr
    }),
    Nn.fromPartial({
      type: en.LEARN_MORE,
      webUrl: "https://support.snapchat.com/article/camera-information-use",
      version: "1",
      timestamp: zr
    })
  ],
  disabled: !0
}), ME = Ba.fromPartial({}), VE = (e) => {
  var n, t;
  return ((t = (n = e.value) === null || n === void 0 ? void 0 : n.anyValue) === null || t === void 0 ? void 0 : t.value) instanceof Uint8Array;
}, GE = (e) => (n) => {
  var t;
  return (t = e.find((a) => a.type === n)) !== null && t !== void 0 ? t : Ra.documents.find((a) => a.type === n);
}, _o = R("legalState", [He.token, qf.token], (e, n) => {
  const t = new dr(() => yE, new Zn({ databaseName: "Legal" })), a = () => ce(t.retrieve(Vl).catch((o) => Qn.warn(o))), r = (o) => t.store(Vl, o).catch((s) => Qn.warn(s)), i = UE();
  return i.events.pipe(le("unknown"), y("requestLegalPrompt"), An(() => yd({
    cofConfig: e.get("CAMERA_KIT_LEGAL_PROMPT").pipe(g((o) => {
      const s = o.find(VE);
      return s ? Gn.decode(s.value.anyValue.value) : Ra;
    }), tn((o) => (Qn.error(o), j(Ra)))),
    initConfig: e.getInitializationConfig().pipe(tn((o) => (Qn.error(o), j(ME))))
  })), An(({ cofConfig: o, initConfig: s }) => {
    var u;
    if (!((u = s.legalPrompt) === null || u === void 0) && u.disabled || o.disabled)
      return j(i.actions.accept("disabled"));
    const c = GE(o.documents), d = n(c(en.PRIVACY_POLICY), c(en.TERMS_OF_SERVICE), c(en.LEARN_MORE), s.childrenProtectionActRestricted);
    return a().pipe(An((m) => d.contentHash === m ? j(!0) : d.show()), g((m) => m ? (r(d.contentHash), i.actions.accept(d.contentHash)) : i.actions.reject(d.contentHash)));
  }), _n(i)).subscribe({
    error: Qn.error
  }), i;
});
function BE(e) {
  return (n) => vh(() => {
    let t = !1;
    return n.pipe(Ne({
      complete: () => t = !0,
      error: () => t = !0
    }), wh(() => {
      t || e();
    }));
  });
}
const FE = U("fetchWatermarkLens"), Ao = "watermarks", HE = R("fetchWatermarkLens", [He.token, Jn.token], (e, n) => {
  e.getInitializationConfig().pipe(Ae(1)).subscribe({
    next: (t) => O(void 0, void 0, void 0, function* () {
      if (t.watermarkEnabled) {
        const a = yield n.loadLens("", Ao);
        yield n.cacheLensContent([a]);
      }
    }),
    error: FE.error
  });
}), $f = R("userDataAccessResolver", () => () => "unrestricted"), It = U("LensState"), KE = () => {
  const e = hr(Z("applyLens")(), Z("downloadComplete")(), Z("turnedOn")(), Z("resourcesLoaded")(), Z("firstFrameProcessed")(), Z("applyLensComplete")(), Z("applyLensFailed")(), Z("applyLensAborted")(), Z("removeLens")(), Z("turnedOff")(), Z("removeLensComplete")(), Z("removeLensFailed")()), n = vo(Ge("noLensApplied")(), Ge("applyingLens")(), Ge("lensApplied")());
  return new po(e, n, n.noLensApplied(), (t) => Ze(t.pipe(le("noLensApplied", "applyingLens", "lensApplied"), y("applyLens"), g(([a]) => n.applyingLens(a.data.lens))), t.pipe(le("applyingLens"), y("applyLensComplete"), g(([a]) => n.lensApplied(a.data))), t.pipe(le("applyingLens"), y("applyLensFailed"), g(() => n.noLensApplied())), t.pipe(le("lensApplied"), y("removeLensComplete"), g(() => n.noLensApplied()))));
}, Je = R("lensState", [
  ae.token,
  Jn.token,
  mr.token,
  zf.token,
  _o.token,
  _e.token,
  He.token,
  $f.token
], (e, n, t, a, r, i, o, s) => {
  const u = KE();
  let c = !0;
  return u.events.pipe(y("applyLens"), Ch(([d]) => j(r.actions.requestLegalPrompt()).pipe(_n(r), le("accepted", "rejected"), Ae(1), g(([, { name: m }]) => m === "accepted" ? d : u.actions.applyLensFailed({
    error: Yh(`Failed to apply lens ${d.data.lens.id}. Required legal terms were not accepted.`),
    lens: d.data.lens
  })))), An((d) => {
    if (d.name === "applyLensFailed")
      return j(d);
    const { lens: m } = d.data, l = (E) => {
      u.dispatch(E, m);
    }, f = new pt("lens").mark("apply", { first: `${c}` });
    return c = !1, yd({
      watermarkInput: o.getInitializationConfig().pipe(se((E) => E.watermarkEnabled ? ce(n.loadLens("", Ao)).pipe(se((v) => ce(n.getLensContent(v)).pipe(g(({ lensBuffer: p, lensChecksum: S }) => ({
        lensId: v.id,
        lensDataBuffer: p.slice(0),
        lensChecksum: S,
        launchData: new ArrayBuffer(0)
      }))))) : j(void 0))),
      lensInput: j(d.data).pipe(se(({ lens: E, launchData: v }) => ce(a.retrieve(E.id).catch(() => {
      })).pipe(g((p) => ({ lens: E, launchData: v, persistentStore: p })))), g(({ lens: E, launchData: v, persistentStore: p }) => {
        const S = n.getLensMetadata(E.id);
        if (!S)
          throw new Error(`Cannot apply lens ${E.id}. It has not been loaded by the Lens repository. Use CameraKit.lensRepository.loadLens (or loadLensGroups) to load lens metadata before calling CameraKitSession.applyLens.`);
        const { content: _, isThirdParty: A } = S;
        if (!_)
          throw new Error(`Cannot apply lens ${E.id}. Metadata retrieved for this lens does not include the lens content URL.`);
        return {
          lens: E,
          launchData: eE(v ?? {}, p ?? new ArrayBuffer(0)),
          content: _,
          isThirdParty: A
        };
      }), se(({ lens: E, launchData: v, content: p, isThirdParty: S }) => {
        const _ = f.mark("network");
        return ce(Promise.all([
          n.getLensContent(E).finally(() => _.measure("lens")),
          S ? s(E) : void 0,
          p.assetManifest.length > 0 ? t.cacheAssets(p.assetManifest, E).finally(() => _.measure("assets")) : Promise.resolve()
        ])).pipe(Ne(() => {
          _.measure(), u.dispatch("downloadComplete", E);
        }), g(([{ lensBuffer: A, lensChecksum: N }, k]) => {
          const C = A.slice(0);
          return {
            lensId: E.id,
            lensDataBuffer: C,
            lensChecksum: N,
            launchData: v,
            apiVisibility: S ? e.LensApiVisibility.Public : e.LensApiVisibility.Private,
            publicApiUserDataAccess: k === "restricted" ? e.UserDataAccess.Restricted : e.UserDataAccess.Unrestricted
          };
        }));
      }))
    }).pipe(rn(u.events.pipe(y("removeLens"))), se(({ lensInput: E, watermarkInput: v }) => new Y((p) => {
      const S = f.mark("core");
      e.replaceLenses({
        lenses: [
          Object.assign(Object.assign({}, E), { onTurnOn: () => l("turnedOn"), onResourcesLoaded: () => l("resourcesLoaded"), onFirstFrameProcessed: () => {
            S.measure("first-frame"), f.measure("success"), f.stopAndReport(i), l("firstFrameProcessed");
          }, onTurnOff: () => l("turnedOff") }),
          ...v ? [v] : []
        ]
      }).then(() => {
        S.measure("success"), p.next(u.actions.applyLensComplete(m)), p.complete();
      }).catch((_) => {
        S.measure("failure"), f.measure("failure"), f.stopAndReport(i);
        const A = `Failed to apply lens ${E.lensId}.`, N = /validation failed/.test(_.message) ? Wh(A, _) : zh(A, _);
        p.next(u.actions.applyLensFailed({ error: N, lens: m })), p.complete();
      });
    })), tn((E) => (f.measure("failure"), f.stopAndReport(i), j(u.actions.applyLensFailed({ error: E, lens: m })))), BE(() => {
      f.measure("abort"), f.stopAndReport(i);
    }));
  }), _n(u)).subscribe({
    error: It.error
  }), u.events.pipe(le("lensApplied", "noLensApplied"), y("removeLens"), se(() => new Y((d) => {
    e.clearAllLenses().then(() => {
      d.next(u.actions.removeLensComplete()), d.complete();
    }).catch((m) => {
      const l = new Error("Failed to remove lenses.", { cause: m });
      d.next(u.actions.removeLensFailed(l)), d.complete();
    });
  })), _n(u)).subscribe({
    error: It.error
  }), u.events.pipe(le("applyingLens"), y("removeLens"), An(([d]) => u.events.pipe(le("lensApplied"), rn(u.events.pipe(y("applyLens"))), g(() => d))), _n(u)).subscribe({
    error: It.error
  }), u.events.subscribe(([d, m]) => {
    const l = YE(d);
    It.debug(`Action: "${d.name}", state: "${m.name}"${l ? ", data: " + JSON.stringify(l) : ""}`);
  }), u;
});
function YE(e) {
  switch (e.name) {
    case "applyLens":
      return { lensId: e.data.lens.id };
    case "applyLensFailed":
      return { lensId: e.data.lens.id, error: e.data.error.message };
    case "downloadComplete":
    case "turnedOn":
    case "resourcesLoaded":
    case "firstFrameProcessed":
    case "applyLensComplete":
    case "applyLensAborted":
    case "turnedOff":
      return { lensId: e.data.id };
    case "removeLens":
    case "removeLensComplete":
      return;
    case "removeLensFailed":
      return { error: e.data.message };
    default:
      $e();
  }
}
const WE = () => {
  const e = hr(Z("suspend")(), Z("resume")(), Z("destroy")()), n = vo(Ge("inactive")(), Ge("active")(), Ge("destroyed")());
  return new po(e, n, Ge("inactive")()(), (t) => Ze(t.pipe(y("resume"), g(([a]) => n.active(a.data))), t.pipe(y("suspend"), g(() => n.inactive())), t.pipe(y("destroy"), g(() => n.destroyed()))));
}, Er = R("sessionState", () => WE()), zE = U("LensKeyboard");
class qE {
  constructor(n) {
    this.lensState = n, this.active = !1, this.text = void 0, this.reply = () => {
    }, this.onElementKeyPress = this.onElementKeyPress.bind(this), this.events = new $n(), this.element = document.createElement("textarea"), this.element.addEventListener("keypress", this.onElementKeyPress), this.uriHandler = {
      uri: "app://textInput/",
      handleRequest: (t, a) => {
        if (t.uri === "app://textInput/requestKeyboard") {
          const r = JSON.parse(new TextDecoder().decode(t.data));
          this.element.value = r.text, this.text = r.text, this.reply = a, this.active = !0, this.notifyClient(), this.element.focus();
        } else t.uri === "app://textInput/dismissKeyboard" ? (this.active = !1, this.sendReply({ keyboardOpen: !1 }), this.notifyClient()) : zE.error(new Error(`Unhandled lens keyboard request '${t.uri}'.`));
      }
    }, n.events.pipe(y("turnedOff")).subscribe(() => {
      this.dismiss();
    });
  }
  dismiss() {
    this.active = !1, this.element.value = "", this.text = "", this.sendReply({ keyboardOpen: !1 }), this.notifyClient();
  }
  getElement() {
    return this.element;
  }
  sendInputToLens(n) {
    this.element.value = n, this.text = n, this.sendReply({
      text: n,
      start: n.length,
      end: n.length,
      done: !0,
      shouldNotify: !0
    });
  }
  addEventListener(n, t, a) {
    this.events.addEventListener(n, t, a);
  }
  removeEventListener(n, t) {
    this.events.removeEventListener(n, t);
  }
  toPublicInterface() {
    return {
      addEventListener: this.addEventListener.bind(this),
      removeEventListener: this.removeEventListener.bind(this),
      sendInputToLens: this.sendInputToLens.bind(this),
      dismiss: this.dismiss.bind(this),
      getElement: this.getElement.bind(this)
    };
  }
  destroy() {
    this.element.removeEventListener("keypress", this.onElementKeyPress);
  }
  sendReply(n) {
    this.reply({
      code: 200,
      description: "",
      contentType: "application/json",
      data: new TextEncoder().encode(JSON.stringify(n))
    });
  }
  notifyClient() {
    var n;
    const t = this.lensState.getState();
    yn(t, "noLensApplied") || this.events.dispatchEvent(new ee("active", {
      element: this.element,
      active: this.active,
      text: (n = this.text) !== null && n !== void 0 ? n : "",
      lens: t.data
    }));
  }
  onElementKeyPress(n) {
    n.code === "Enter" && !n.shiftKey && (n.preventDefault(), this.sendInputToLens(this.element.value));
  }
}
const No = R("lensKeyboard", [Je.token], (e) => new qE(e)), $E = (e) => !1;
function ZE(e) {
  if (!(e instanceof Error))
    return !1;
  switch (e.name) {
    case "LensAbortError":
    case "LensExecutionError":
    case "LensImagePickerError":
    case "LensVideoPlaybackMutedError":
      return !0;
    default:
      return $E();
  }
}
const JE = U("FrameEvents"), Zf = R("frameEvents", [ae.token], (e) => {
  const n = new de();
  return e.setOnFrameProcessedCallback({
    onFrameProcessed: (t) => {
      n.next(t);
    }
  }).catch((t) => JE.error(`Failed registering setOnFrameProcessedCallback with error: ${t.message}`)), n.asObservable();
}), Jf = {
  roundButton: "round_button",
  topBar: "top_bar",
  keyboard: "keyboard",
  safeRender: "safe_render",
  captureExitButton: "capture_exit_button"
};
function XE(e) {
  if (!K(e))
    return !1;
  for (const [n, t] of Object.entries(e))
    if (!(n in Jf) || !jE(t))
      return !1;
  return !0;
}
const Mn = 1e-6, QE = (e) => typeof e == "number" && Number.isFinite(e);
function jE(e) {
  if (!K(e))
    return !1;
  const n = e.x, t = e.y, a = e.width, r = e.height;
  if (![n, t, a, r].every(QE) || a < 0 || r < 0)
    return !1;
  const i = n + a, o = t + r;
  return !(n < -Mn || t < -Mn || n > 1 + Mn || t > 1 + Mn || i > 1 + Mn || o > 1 + Mn);
}
function xE(e) {
  const n = {};
  for (const [t, a] of Object.entries(e)) {
    const r = Jf[t];
    n[r] = {
      normalizedRect: {
        origin: {
          x: a.x,
          y: a.y
        },
        size: {
          width: a.width,
          height: a.height
        }
      }
    };
  }
  return n;
}
const oe = U("CameraKitSession");
function eS(e) {
  return rE(e) || Xf(e) || Qf(e);
}
function Xf(e) {
  return e instanceof MediaStream;
}
function Qf(e) {
  return e instanceof HTMLVideoElement;
}
function Gl(e) {
  return $(e) || e === "live" || e === "capture";
}
let nS = (() => {
  var e;
  let n = [], t, a, r, i, o, s, u, c, d, m;
  return e = class {
    constructor(f, E, v, p, S, _, A) {
      this.innerKeyboard = (ft(this, n), f), this.lensCore = E, this.sessionState = v, this.lensState = p, this.frameEvents = A, this.events = new $n(), this.keyboard = f.toPublicInterface();
      const N = this.lensCore.getOutputCanvases();
      this.output = {
        live: N[this.lensCore.CanvasType.Preview.value],
        capture: N[this.lensCore.CanvasType.Capture.value]
      }, this.playing = {
        live: !1,
        capture: !1
      }, this.metrics = new EE(A);
      const k = _.onPageHidden(() => this.sessionState.dispatch("suspend", this)), C = _.onPageVisible(() => this.sessionState.dispatch("resume", this));
      this.removePageVisibilityHandlers = () => {
        k(), C();
      }, this.subscriptions = [
        E.errors.pipe(re((M) => M.name === "LensCoreAbortError")).subscribe(() => this.destroy()),
        E.errors.pipe(re((M) => M.name !== "LensCoreAbortError" && M.name !== "LensCoreVideoPlaybackFailedError" && M.name !== "LensCoreVideoPlaybackMutedError" && M.isFrameError)).subscribe(() => this.removeLens()),
        S.pipe(re((M) => M.level === "error"), g((M) => M.messages.find((q) => q instanceof Error)), re(ZE)).subscribe((M) => {
          const q = p.getState();
          yn(q, "noLensApplied") ? oe.warn("Lens error occurred even though there is no active lens.", M) : this.events.dispatchEvent(new ee("error", { error: M, lens: q.data }));
        })
      ];
    }
    applyLens(f, E) {
      return O(this, void 0, void 0, function* () {
        const v = this.lensState.actions.applyLens({ lens: f, launchData: E });
        return Yn(j(v).pipe(_n(this.lensState), rn(this.lensState.events.pipe(y("applyLens"), re(([p]) => p !== v))), Ne(([p]) => {
          if (fl(p, "applyLensFailed") && p.data.lens.id === f.id)
            throw p.data.error;
        }), le("lensApplied"), g(() => !0)), { defaultValue: !1 });
      });
    }
    removeLens() {
      return O(this, void 0, void 0, function* () {
        return yn(this.lensState.getState(), "noLensApplied") ? !0 : Yn(j(this.lensState.actions.removeLens()).pipe(_n(this.lensState), Ne(([f]) => {
          if (fl(f, "removeLensFailed"))
            throw f.data;
        }), le("noLensApplied"), rn(this.lensState.events.pipe(y("applyLens"))), g(() => !0)), { defaultValue: !1 });
      });
    }
    play(f = "live") {
      return O(this, void 0, void 0, function* () {
        if (this.playing[f])
          return;
        this.playing[f] = !0;
        const E = this.renderTargetToCanvasType(f);
        return this.lensCore.playCanvas({ type: E }).catch((v) => {
          throw this.playing[f] = !1, v;
        });
      });
    }
    pause(f = "live") {
      return O(this, void 0, void 0, function* () {
        if (this.playing[f] === !1)
          return;
        this.playing[f] = !1;
        const E = this.renderTargetToCanvasType(f);
        return this.lensCore.pauseCanvas({ type: E }).catch((v) => {
          throw this.playing[f] = !0, v;
        });
      });
    }
    mute(f = !1) {
      this.lensCore.setAllSoundsMuted({
        muted: !0,
        fade: f
      });
    }
    unmute(f = !1) {
      this.lensCore.setAllSoundsMuted({
        muted: !1,
        fade: f
      });
    }
    setSource(f, E = {}) {
      return O(this, void 0, void 0, function* () {
        yield this.safelyDetachSource();
        const v = Xf(f) ? fE(f, E) : Qf(f) ? hE(f, E) : f, p = this.playing;
        return this.playing = {
          live: !1,
          capture: !1
        }, yield v.attach(this.lensCore, this.frameEvents, (S) => {
          oe.error(wr("Error occurred during source attachment.", S));
        }), this.source = v, p.live && (yield this.play("live")), p.capture && (yield this.play("capture")), v;
      });
    }
    setFPSLimit(f) {
      return O(this, void 0, void 0, function* () {
        const E = f < Number.POSITIVE_INFINITY ? f : 0;
        return this.lensCore.setFPSLimit({ fps: E });
      });
    }
    setScreenRegions(f) {
      return O(this, void 0, void 0, function* () {
        yield this.lensCore.setScreenRegions({
          regions: xE(f)
        });
      });
    }
    destroy() {
      return O(this, void 0, void 0, function* () {
        try {
          yield this.lensCore.clearAllLenses(), yield this.lensCore.teardown();
        } catch (f) {
          oe.warn("An error occurred in LensCore during the session termination process.", f);
        }
        this.subscriptions.forEach((f) => f.unsubscribe()), yield this.safelyDetachSource(), this.removePageVisibilityHandlers(), this.sessionState.dispatch("destroy", void 0), this.innerKeyboard.destroy(), this.metrics.destroy();
      });
    }
    renderTargetToCanvasType(f) {
      return f === "capture" ? this.lensCore.CanvasType.Capture : this.lensCore.CanvasType.Preview;
    }
    safelyDetachSource() {
      return O(this, void 0, void 0, function* () {
        if (this.source)
          try {
            yield this.source.detach((f) => {
              oe.error(wr("Error occurred during source detachment.", f));
            });
          } catch (f) {
            oe.error(wr(`Detaching prior source of type ${Vf(this.source)} failed.`, f));
          }
      });
    }
  }, t = [be(Gf, Kv), ie(oe)], a = [ie(oe)], r = [be(Gl), ie(oe)], i = [be(Gl), ie(oe)], o = [ie(oe)], s = [ie(oe)], u = [be(eS, aE), ie(oe)], c = [be(Wn), ie(oe)], d = [be(XE), ie(oe)], m = [ie(oe)], Q(e, null, t, { kind: "method", name: "applyLens", static: !1, private: !1, access: { has: (l) => "applyLens" in l, get: (l) => l.applyLens } }, null, n), Q(e, null, a, { kind: "method", name: "removeLens", static: !1, private: !1, access: { has: (l) => "removeLens" in l, get: (l) => l.removeLens } }, null, n), Q(e, null, r, { kind: "method", name: "play", static: !1, private: !1, access: { has: (l) => "play" in l, get: (l) => l.play } }, null, n), Q(e, null, i, { kind: "method", name: "pause", static: !1, private: !1, access: { has: (l) => "pause" in l, get: (l) => l.pause } }, null, n), Q(e, null, o, { kind: "method", name: "mute", static: !1, private: !1, access: { has: (l) => "mute" in l, get: (l) => l.mute } }, null, n), Q(e, null, s, { kind: "method", name: "unmute", static: !1, private: !1, access: { has: (l) => "unmute" in l, get: (l) => l.unmute } }, null, n), Q(e, null, u, { kind: "method", name: "setSource", static: !1, private: !1, access: { has: (l) => "setSource" in l, get: (l) => l.setSource } }, null, n), Q(e, null, c, { kind: "method", name: "setFPSLimit", static: !1, private: !1, access: { has: (l) => "setFPSLimit" in l, get: (l) => l.setFPSLimit } }, null, n), Q(e, null, d, { kind: "method", name: "setScreenRegions", static: !1, private: !1, access: { has: (l) => "setScreenRegions" in l, get: (l) => l.setScreenRegions } }, null, n), Q(e, null, m, { kind: "method", name: "destroy", static: !1, private: !1, access: { has: (l) => "destroy" in l, get: (l) => l.destroy } }, null, n), e;
})();
const ka = R("CameraKitSession", [
  ae.token,
  pr.token,
  No.token,
  Er.token,
  Je.token,
  fr.token,
  Zf.token
], (e, n, t, a, r, i, o) => new nS(t, e, a, r, n, i, o)), Bl = U("LensAssetProvider"), Fl = 3, tS = R("registerLensAssetsProvider", [
  ae.token,
  Jn.token,
  mr.token,
  Je.token
], (e, n, t, a) => {
  const r = /* @__PURE__ */ new Map();
  e.setRemoteAssetsProvider((i) => O(void 0, void 0, void 0, function* () {
    var o, s, u, c, d;
    const { assetId: m, assetType: l, lensId: f } = i;
    try {
      if (((o = r.get(m)) !== null && o !== void 0 ? o : 0) > Fl)
        throw new Error(`Maximum consecutive asset load errors reached for asset ${m}`);
      const E = f ?? ((s = a.getState().data) === null || s === void 0 ? void 0 : s.id), v = E ? n.getLensMetadata(E) : void 0;
      yield t.loadAsset({
        assetDescriptor: i,
        lens: v && Ia(v),
        assetManifest: (c = (u = v == null ? void 0 : v.content) === null || u === void 0 ? void 0 : u.assetManifest) !== null && c !== void 0 ? c : [],
        lowPriority: !1
      }), r.set(m, 0);
    } catch (E) {
      e.provideRemoteAssetsResponse({
        assetId: m,
        assetType: l
      });
      const v = ((d = r.get(m)) !== null && d !== void 0 ? d : 0) + 1;
      r.set(m, v), v <= Fl ? Bl.error(xh(`Error occurred while handling lens asset ${m} request.`, E)) : Bl.warn(`Maximum consecutive asset load errors reached for asset ${m}`);
    }
  }));
});
var tr;
(function(e) {
  e[e.METHOD_UNSET = 0] = "METHOD_UNSET", e[e.GET = 1] = "GET", e[e.POST = 2] = "POST", e[e.PUT = 3] = "PUT", e[e.DELETE = 4] = "DELETE", e[e.PATCH = 5] = "PATCH", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(tr || (tr = {}));
var dt;
(function(e) {
  e[e.LOCATION_UNSET = 0] = "LOCATION_UNSET", e[e.QUERY = 1] = "QUERY", e[e.HEADER = 2] = "HEADER", e[e.PATH = 3] = "PATH", e[e.UNRECOGNIZED = -1] = "UNRECOGNIZED";
})(dt || (dt = {}));
function Hl() {
  return {};
}
const jf = {
  encode(e, n = new I()) {
    return n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Hl();
    for (; t.pos < a; ) {
      const i = t.uint32();
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return jf.fromPartial(e ?? {});
  },
  fromPartial(e) {
    return Hl();
  }
};
function Kl() {
  return { remoteApiSpecs: [] };
}
const xf = {
  encode(e, n = new I()) {
    for (const t of e.remoteApiSpecs)
      Ki.encode(t, n.uint32(10).fork()).join();
    return n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Kl();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.remoteApiSpecs.push(Ki.decode(t, t.uint32()));
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return xf.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = Kl();
    return t.remoteApiSpecs = ((n = e.remoteApiSpecs) === null || n === void 0 ? void 0 : n.map((a) => Ki.fromPartial(a))) || [], t;
  }
};
function Yl() {
  return {
    id: "",
    host: "",
    endpoints: [],
    tlsRequired: !1,
    maxRequestSizeBytes: 0,
    maxResponseSizeBytes: 0,
    maxResponseTimeMillis: 0
  };
}
const Ki = {
  encode(e, n = new I()) {
    e.id !== "" && n.uint32(10).string(e.id), e.host !== "" && n.uint32(18).string(e.host);
    for (const t of e.endpoints)
      Yi.encode(t, n.uint32(26).fork()).join();
    return e.tlsRequired !== !1 && n.uint32(32).bool(e.tlsRequired), e.maxRequestSizeBytes !== 0 && n.uint32(40).int32(e.maxRequestSizeBytes), e.maxResponseSizeBytes !== 0 && n.uint32(48).int32(e.maxResponseSizeBytes), e.maxResponseTimeMillis !== 0 && n.uint32(56).int32(e.maxResponseTimeMillis), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Yl();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.id = t.string();
          continue;
        }
        case 2: {
          if (i !== 18)
            break;
          r.host = t.string();
          continue;
        }
        case 3: {
          if (i !== 26)
            break;
          r.endpoints.push(Yi.decode(t, t.uint32()));
          continue;
        }
        case 4: {
          if (i !== 32)
            break;
          r.tlsRequired = t.bool();
          continue;
        }
        case 5: {
          if (i !== 40)
            break;
          r.maxRequestSizeBytes = t.int32();
          continue;
        }
        case 6: {
          if (i !== 48)
            break;
          r.maxResponseSizeBytes = t.int32();
          continue;
        }
        case 7: {
          if (i !== 56)
            break;
          r.maxResponseTimeMillis = t.int32();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Ki.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r, i, o, s;
    const u = Yl();
    return u.id = (n = e.id) !== null && n !== void 0 ? n : "", u.host = (t = e.host) !== null && t !== void 0 ? t : "", u.endpoints = ((a = e.endpoints) === null || a === void 0 ? void 0 : a.map((c) => Yi.fromPartial(c))) || [], u.tlsRequired = (r = e.tlsRequired) !== null && r !== void 0 ? r : !1, u.maxRequestSizeBytes = (i = e.maxRequestSizeBytes) !== null && i !== void 0 ? i : 0, u.maxResponseSizeBytes = (o = e.maxResponseSizeBytes) !== null && o !== void 0 ? o : 0, u.maxResponseTimeMillis = (s = e.maxResponseTimeMillis) !== null && s !== void 0 ? s : 0, u;
  }
};
function Wl() {
  return { path: "", methods: [], parameters: [], refId: "" };
}
const Yi = {
  encode(e, n = new I()) {
    e.path !== "" && n.uint32(10).string(e.path), n.uint32(18).fork();
    for (const t of e.methods)
      n.int32(t);
    n.join();
    for (const t of e.parameters)
      Wi.encode(t, n.uint32(26).fork()).join();
    return e.refId !== "" && n.uint32(34).string(e.refId), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Wl();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.path = t.string();
          continue;
        }
        case 2: {
          if (i === 16) {
            r.methods.push(t.int32());
            continue;
          }
          if (i === 18) {
            const o = t.uint32() + t.pos;
            for (; t.pos < o; )
              r.methods.push(t.int32());
            continue;
          }
          break;
        }
        case 3: {
          if (i !== 26)
            break;
          r.parameters.push(Wi.decode(t, t.uint32()));
          continue;
        }
        case 4: {
          if (i !== 34)
            break;
          r.refId = t.string();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Yi.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r;
    const i = Wl();
    return i.path = (n = e.path) !== null && n !== void 0 ? n : "", i.methods = ((t = e.methods) === null || t === void 0 ? void 0 : t.map((o) => o)) || [], i.parameters = ((a = e.parameters) === null || a === void 0 ? void 0 : a.map((o) => Wi.fromPartial(o))) || [], i.refId = (r = e.refId) !== null && r !== void 0 ? r : "", i;
  }
};
function zl() {
  return { name: "", location: 0, optional: !1, externalName: "", defaultValue: "", constant: !1 };
}
const Wi = {
  encode(e, n = new I()) {
    return e.name !== "" && n.uint32(10).string(e.name), e.location !== 0 && n.uint32(16).int32(e.location), e.optional !== !1 && n.uint32(24).bool(e.optional), e.externalName !== "" && n.uint32(34).string(e.externalName), e.defaultValue !== "" && n.uint32(42).string(e.defaultValue), e.constant !== !1 && n.uint32(48).bool(e.constant), n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = zl();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.name = t.string();
          continue;
        }
        case 2: {
          if (i !== 16)
            break;
          r.location = t.int32();
          continue;
        }
        case 3: {
          if (i !== 24)
            break;
          r.optional = t.bool();
          continue;
        }
        case 4: {
          if (i !== 34)
            break;
          r.externalName = t.string();
          continue;
        }
        case 5: {
          if (i !== 42)
            break;
          r.defaultValue = t.string();
          continue;
        }
        case 6: {
          if (i !== 48)
            break;
          r.constant = t.bool();
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return Wi.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n, t, a, r, i, o;
    const s = zl();
    return s.name = (n = e.name) !== null && n !== void 0 ? n : "", s.location = (t = e.location) !== null && t !== void 0 ? t : 0, s.optional = (a = e.optional) !== null && a !== void 0 ? a : !1, s.externalName = (r = e.externalName) !== null && r !== void 0 ? r : "", s.defaultValue = (i = e.defaultValue) !== null && i !== void 0 ? i : "", s.constant = (o = e.constant) !== null && o !== void 0 ? o : !1, s;
  }
}, iS = {
  fullName: "com.snap.camerakit.v3.RemoteApiSpecs",
  methods: {
    getRemoteApiSpecs: {
      name: "GetRemoteApiSpecs",
      requestType: jf,
      requestStream: !1,
      responseType: xf,
      responseStream: !1,
      options: { idempotencyLevel: "NO_SIDE_EFFECTS" }
    }
  }
}, em = R("remoteApiSpecsClient", [vt.token], (e) => lr(iS, e));
function nm(e, ...n) {
  var t;
  for (const a of n)
    (t = e.get(a)) === null || t === void 0 || t(), e.delete(a);
}
function ql(e, ...n) {
  for (const t of n) {
    const a = e.get(t);
    a && (nm(a.cancellationHandlers, ...a.cancellationHandlers.keys()), e.delete(t));
  }
}
function tm({ uri: e, lensState: n, sessionState: t, createLensRequestState: a, processRequest: r, processInternalError: i }) {
  const o = new de(), s = new de(), u = /* @__PURE__ */ new Map(), c = n.events.pipe(y("turnedOff"), Ne(([l]) => ql(u, l.data.id))), d = o.pipe(g(({ request: l, lens: f, reply: E }) => {
    if (!u.has(f.id)) {
      const p = a == null ? void 0 : a(l, f), S = {
        cancellationHandlers: /* @__PURE__ */ new Map(),
        custom: p
      };
      u.set(f.id, S);
    }
    const v = u.get(f.id);
    return {
      request: l,
      reply: E,
      lens: f,
      state: v.custom,
      setCancellationHandler: (p) => {
        v.cancellationHandlers.set(l.identifier, p);
      }
    };
  }), Ne(r)), m = s.pipe(Ne((l) => {
    var f;
    const E = (f = u.get(l.lens.id)) === null || f === void 0 ? void 0 : f.cancellationHandlers;
    E && nm(E, l.request.requestId);
  }));
  return Ze(c, d, m).pipe(tn((l, f) => (i(l), f)), Dh(), rn(t.events.pipe(y("destroy")))).subscribe({
    complete: () => ql(u, ...u.keys())
  }), {
    uri: e,
    handleRequest(l, f, E) {
      o.next({ request: l, reply: f, lens: E });
    },
    cancelRequest(l, f) {
      s.next({ request: l, lens: f });
    }
  };
}
const im = "RequestValidationError", ze = ne(im);
function rS(e, n, t = "strict") {
  var a;
  if (t === "deny")
    throw ze("All lens HTTP requests are denied by the current validation strategy.");
  if (t === "unrestricted")
    return;
  const r = new URL(e.uri);
  for (const i of n) {
    if (r.host !== i.host || r.protocol !== (i.tlsRequired ? "https:" : "http:"))
      continue;
    if (t === "host")
      return;
    const o = r.pathname.replace(/^\/|\/$/g, "");
    for (const s of i.endpoints) {
      const u = s.path.replace(/^\/|\/$/g, "");
      if (!o.startsWith(u))
        continue;
      const c = (a = tr[e.method]) !== null && a !== void 0 ? a : tr.UNRECOGNIZED;
      if (s.methods.includes(c)) {
        if (aS(o.split(u)[1], s.parameters), t === "route")
          return;
        oS(e.metadata, s.parameters), sS(r.searchParams, s.parameters);
        return;
      }
    }
  }
  throw ze("The request does not match any of the Remote API specifications.");
}
function aS(e, n) {
  const t = e.split("/").filter(Boolean);
  let a = 0;
  for (const r of n) {
    if (r.location !== dt.PATH)
      continue;
    const i = t[a], o = t[a + 1];
    if (r.constant)
      if (i === r.name && o === r.defaultValue)
        a += 2;
      else
        throw ze(`Expected constant parameter '${r.name}' with value '${r.defaultValue}' at position ${a}, but found '${i}' and '${o}'.`);
    else if (r.optional)
      i === r.name && (o !== void 0 ? a += 2 : a += 1);
    else if (i === r.name && o !== void 0)
      a += 2;
    else
      throw ze(`Expected parameter '${r.name}' with a value at position ${a}, but found '${i}' and '${o}'.`);
  }
  if (a !== t.length) {
    const r = t.slice(a).join("/");
    throw ze(`Unexpected extra path components starting at position ${a}: '${r}'.`);
  }
}
function oS(e, n) {
  for (const t of n) {
    if (t.location !== dt.HEADER)
      continue;
    const a = e[t.name];
    if (t.constant) {
      if (a !== t.defaultValue)
        throw ze(`Expected constant header '${t.name}' with value '${t.defaultValue}', but found '${a ?? "undefined"}'.`);
    } else if (!t.optional) {
      if (a == null || Wd(a))
        throw ze(`Required header '${t.name}' is missing or empty.`);
    }
  }
}
function sS(e, n) {
  for (const t of n) {
    if (t.location !== dt.QUERY)
      continue;
    const a = e.get(t.name);
    if (t.constant) {
      if (a !== t.defaultValue)
        throw ze(`Expected constant query parameter '${t.name}' with value '${t.defaultValue}', but found '${a ?? "undefined"}'.`);
    } else if (!t.optional) {
      if (a == null || Wd(a))
        throw ze(`Required query parameter '${t.name}' is missing or empty.`);
    }
  }
}
const zi = U("lensHttpHandler"), Ta = "LensHttpHandlerError", $l = ne(Ta), uS = [
  "Accept-Ranges",
  "Cache-Control",
  "Content-Language",
  "Content-Length",
  "Content-Type",
  "Date",
  "ETag",
  "Expires",
  "Last-Modified",
  "Location"
], cS = ["x-sc-lenses-remote-api-spec-id"];
function lS(e, n, t, a, r = "strict") {
  let i;
  return tm({
    uri: ["http://", "https://"],
    lensState: e,
    sessionState: n,
    processRequest({ request: o, lens: s, reply: u, setCancellationHandler: c }) {
      return O(this, void 0, void 0, function* () {
        i = i ?? dS(t);
        const d = yield i;
        fS(o, s, u, c, d, a, r);
      });
    },
    processInternalError(o) {
      zi.error(o);
    }
  });
}
function dS(e) {
  var n, t;
  return O(this, void 0, void 0, function* () {
    const a = yield e.getRemoteApiSpecs({});
    if (!a.ok)
      throw new Error("Failed getting Remote API specs.", { cause: a.unwrapErr() });
    return (t = (n = a.unwrap().message) === null || n === void 0 ? void 0 : n.remoteApiSpecs) !== null && t !== void 0 ? t : [];
  });
}
function fS(e, n, t, a, r, i, o = "strict") {
  return O(this, void 0, void 0, function* () {
    try {
      rS(e, r, o);
      const { url: s, init: u } = mS(e), c = new AbortController();
      u.signal = c.signal, a(() => c.abort());
      let d;
      if (i) {
        const m = "lensHttpHandler";
        try {
          const { uri: l, identifier: f, method: E, metadata: v, data: p } = e, S = i(s, u, {
            url: l,
            identifier: f,
            method: E,
            data: p,
            headers: v,
            lens: n
          });
          if (!fp(S))
            throw $l(`The '${m}' callback provided to Camera Kit must return a Promise.`);
          d = yield S;
        } catch (l) {
          throw l = l instanceof Error && l.name === Ta ? l : $l(`The '${m}' callback provided to Camera Kit configuration failed.`, l), l;
        }
      } else
        d = yield fetch(s, u);
      t(yield hS(d));
    } catch (s) {
      s instanceof Error && s.name === Ta ? (zi.warn(s), t(qr("LensHttpHandlerError", "The lens HTTP request handler provided to Camera Kit failed."))) : s instanceof Error && s.name === im ? (zi.warn(s), t(qr("RequestValidationError", s.message))) : (zi.error(s), t(qr("UnknownError", "An unknown error occurred.")));
    }
  });
}
function qr(e, n) {
  return {
    code: 400,
    description: "",
    contentType: "text/plain",
    metadata: {
      "x-camera-kit-error-type": e
    },
    data: new TextEncoder().encode(n)
  };
}
function mS({ uri: e, method: n, metadata: t, data: a }) {
  const r = new Headers(t);
  for (const i of cS)
    r.delete(i);
  return {
    url: e,
    init: {
      headers: Object.fromEntries(r.entries()),
      body: n !== "GET" && n !== "HEAD" && n !== void 0 ? a : void 0,
      method: n
    }
  };
}
function hS(e) {
  var n;
  return O(this, void 0, void 0, function* () {
    const t = {};
    for (const a of uS) {
      const r = e.headers.get(a);
      r && (t[a.toLowerCase()] = r);
    }
    return {
      code: e.status,
      description: "",
      contentType: (n = e.headers.get("Content-Type")) !== null && n !== void 0 ? n : "",
      metadata: t,
      data: yield e.arrayBuffer()
    };
  });
}
const ga = "://";
function rm(e) {
  const n = e.indexOf(ga), t = e.slice(0, n), a = e.slice(n + ga.length);
  return { scheme: t, route: a };
}
function Zl(e) {
  return G(e) && e.includes(ga);
}
function pS(e) {
  return K(e) && (Zl(e.uri) || qe(Zl, e.uri)) && Do(e.handleRequest) && ($(e.cancelRequest) || Do(e.cancelRequest));
}
function vS(e) {
  return qe(pS, e);
}
function ES(e) {
  return K(e) && Dn(e.code) && G(e.description) && G(e.contentType) && (lp(e.data) || Yd(e.data)) && ($(e.metadata) || Va(G)(e.metadata));
}
const am = R("UriHandlers", () => []);
function Jl() {
  return { apiSpecIds: [] };
}
const om = {
  encode(e, n = new I()) {
    for (const t of e.apiSpecIds)
      n.uint32(10).string(t);
    return n;
  },
  decode(e, n) {
    const t = e instanceof h ? e : new h(e);
    let a = n === void 0 ? t.len : t.pos + n;
    const r = Jl();
    for (; t.pos < a; ) {
      const i = t.uint32();
      switch (i >>> 3) {
        case 1: {
          if (i !== 10)
            break;
          r.apiSpecIds.push(t.string());
          continue;
        }
      }
      if ((i & 7) === 4 || i === 0)
        break;
      t.skip(i & 7);
    }
    return r;
  },
  create(e) {
    return om.fromPartial(e ?? {});
  },
  fromPartial(e) {
    var n;
    const t = Jl();
    return t.apiSpecIds = ((n = e.apiSpecIds) === null || n === void 0 ? void 0 : n.map((a) => a)) || [], t;
  }
};
var Xl;
(function(e) {
  e.HTTP_METHOD_UNSET = "HTTP_METHOD_UNSET", e.HTTP_METHOD_GET = "HTTP_METHOD_GET", e.HTTP_METHOD_POST = "HTTP_METHOD_POST", e.HTTP_METHOD_PUT = "HTTP_METHOD_PUT", e.HTTP_METHOD_DELETE = "HTTP_METHOD_DELETE", e.HTTP_METHOD_PATCH = "HTTP_METHOD_PATCH", e.UNRECOGNIZED = "UNRECOGNIZED";
})(Xl || (Xl = {}));
var B;
(function(e) {
  e.RESPONSE_CODE_UNSET = "RESPONSE_CODE_UNSET", e.SUCCESS = "SUCCESS", e.REDIRECTED = "REDIRECTED", e.BAD_REQUEST = "BAD_REQUEST", e.ACCESS_DENIED = "ACCESS_DENIED", e.NOT_FOUND = "NOT_FOUND", e.TIMEOUT = "TIMEOUT", e.REQUEST_TOO_LARGE = "REQUEST_TOO_LARGE", e.SERVER_ERROR = "SERVER_ERROR", e.CANCELLED = "CANCELLED", e.PROXY_ERROR = "PROXY_ERROR", e.UNRECOGNIZED = "UNRECOGNIZED";
})(B || (B = {}));
function SS(e) {
  switch (e) {
    case B.RESPONSE_CODE_UNSET:
      return 0;
    case B.SUCCESS:
      return 1;
    case B.REDIRECTED:
      return 2;
    case B.BAD_REQUEST:
      return 3;
    case B.ACCESS_DENIED:
      return 4;
    case B.NOT_FOUND:
      return 5;
    case B.TIMEOUT:
      return 6;
    case B.REQUEST_TOO_LARGE:
      return 7;
    case B.SERVER_ERROR:
      return 8;
    case B.CANCELLED:
      return 9;
    case B.PROXY_ERROR:
      return 10;
    case B.UNRECOGNIZED:
    default:
      return -1;
  }
}
var Ql;
(function(e) {
  e.GRANT_TYPE_UNSET = "GRANT_TYPE_UNSET", e.AUTHORIZATION_CODE = "AUTHORIZATION_CODE", e.AUTHORIZATION_CODE_WITH_PKCE = "AUTHORIZATION_CODE_WITH_PKCE", e.IMPLICIT = "IMPLICIT", e.CLIENT_CREDENTIALS = "CLIENT_CREDENTIALS", e.UNRECOGNIZED = "UNRECOGNIZED";
})(Ql || (Ql = {}));
var jl;
(function(e) {
  e.ERROR_TYPE_UNSET = "ERROR_TYPE_UNSET", e.INVALID_REQUEST = "INVALID_REQUEST", e.INVALID_CLIENT = "INVALID_CLIENT", e.INVALID_GRANT = "INVALID_GRANT", e.UNAUTHORIZED_CLIENT = "UNAUTHORIZED_CLIENT", e.UNSUPPORTED_GRANT_TYPE = "UNSUPPORTED_GRANT_TYPE", e.INVALID_SCOPE = "INVALID_SCOPE", e.UNRECOGNIZED = "UNRECOGNIZED";
})(jl || (jl = {}));
const qi = U("RemoteApiServices"), IS = 200, _S = ":sc_lens_api_status", AS = "application/octet-stream", NS = "type.googleapis.com/com.snap.camerakit.v3.features.RemoteApiInfo", OS = "af3f69c8-2e62-441f-8b1c-d3956f7b336c", RS = {
  success: B.SUCCESS,
  redirected: B.REDIRECTED,
  badRequest: B.BAD_REQUEST,
  accessDenied: B.ACCESS_DENIED,
  notFound: B.NOT_FOUND,
  timeout: B.TIMEOUT,
  requestTooLarge: B.REQUEST_TOO_LARGE,
  serverError: B.SERVER_ERROR,
  cancelled: B.CANCELLED,
  proxyError: B.PROXY_ERROR
}, sm = R("remoteApiServices", () => []);
function kS(e, n, t) {
  for (const a of e)
    try {
      return a.getRequestHandler(n, t);
    } catch (r) {
      qi.warn("Client's Remote API request handler factory threw an error.", r);
    }
}
function TS(e, n, t, a, r) {
  const i = /* @__PURE__ */ new Map();
  for (const o of e) {
    const s = i.get(o.apiSpecId) || [];
    i.set(o.apiSpecId, [...s, o]);
  }
  return tm({
    uri: "app://remote-api/performApiRequest",
    lensState: t,
    sessionState: n,
    createLensRequestState(o, s) {
      var u, c;
      return {
        supportedSpecIds: /* @__PURE__ */ new Set([
          ...((c = (u = a.getLensMetadata(s.id)) === null || u === void 0 ? void 0 : u.featureMetadata) !== null && c !== void 0 ? c : []).filter((d) => d.typeUrl === NS).flatMap((d) => om.decode(d.value).apiSpecIds),
          OS
        ])
      };
    },
    processRequest({ request: o, reply: s, lens: u, setCancellationHandler: c, state: d }) {
      var m;
      const { route: l } = rm(o.uri), [f, E] = l.split("/").slice(2), [v] = E.split("?"), p = { specId: f }, S = (k) => {
        r.setOperationalMetrics(Oe.count(On(["lens", "remote-api", k]), 1, p));
      };
      if (S("requests"), !(d != null && d.supportedSpecIds.has(f)))
        return;
      const _ = {
        apiSpecId: f,
        body: o.data,
        endpointId: v,
        parameters: o.metadata
      };
      let A = kS((m = i.get(f)) !== null && m !== void 0 ? m : [], _, u);
      if (!A)
        return;
      S("handled-requests");
      let N;
      try {
        N = A((k) => {
          var C;
          S("responses");
          const M = (C = RS[k.status]) !== null && C !== void 0 ? C : B.UNRECOGNIZED, q = {
            code: IS,
            description: "",
            contentType: AS,
            data: k.body,
            metadata: Object.assign(Object.assign({}, k.metadata), { [_S]: SS(M).toString() })
          };
          s(q);
        });
      } catch (k) {
        qi.warn("Client's Remote API request handler threw an error.", k);
      }
      typeof N == "function" && c(() => {
        try {
          N();
        } catch (k) {
          qi.warn("Client's Remote API request cancellation handler threw an error.", k);
        }
      });
    },
    processInternalError(o) {
      qi.error(o), r.setOperationalMetrics(Oe.count(On(["lens", "remote-api", "errors"]), 1));
    }
  });
}
const xl = U("uriHandlersRegister"), gS = R("registerUriHandlers", [
  ke,
  ae.token,
  Je.token,
  am.token,
  No.token,
  sm.token,
  Jn.token,
  Er.token,
  _e.token,
  em.token
], (e, n, t, a, r, i, o, s, u, c) => {
  if (!vS(a))
    throw new Error("Expected an array of UriHandler objects");
  const d = [
    lS(t, s, c, e.lensHttpHandler, e.lensHttpValidationStrategy),
    ...a,
    r.uriHandler,
    TS(i, s, t, o, u)
  ];
  for (const { uri: m, handleRequest: l, cancelRequest: f } of d) {
    const E = Array.isArray(m) ? m : [m];
    for (const { scheme: v, route: p } of E.map(rm))
      n.registerUriListener(v, p, {
        handleRequest: (S) => {
          const _ = (N) => {
            if (!ES(N))
              throw new Error("Expected UriResponse object");
            n.provideUriResponse(S.identifier, N);
          }, A = t.getState();
          if (yn(A, "noLensApplied")) {
            xl.warn(`Got a URI request for ${S.uri}, but there is no active lens. The request will not be processed.`);
            return;
          }
          l(S, _, A.data);
        },
        cancelRequest: (S) => {
          if (f) {
            const _ = t.getState();
            if (yn(_, "noLensApplied")) {
              xl.warn(`Got a URI cancel request for ${S.uri}, but there is no active lens. The cancel request will not be processed.`);
              return;
            }
            f(S, _.data);
          }
        }
      });
  }
}), bS = or(st).map(([e]) => e), PS = `

----------------- Context -----------------

`, LS = bS.reduce((e, n) => Math.max(e, n.length), 0);
function CS(e) {
  const n = [];
  for (const { entry: t, count: a, lastTime: r } of e) {
    const i = t.time.toISOString(), o = t.level.padStart(LS), s = t.messages.map(wS).join(" ");
    let u = a > 1 ? ` (Repeated ${a} times with the last occurrence at ${r.toISOString()})` : "";
    n.push(`${i} [${t.module}] ${o}: ${s}${u}`);
  }
  return n.join(`
`);
}
function wS(e) {
  return e instanceof Error ? Ya(e) : e instanceof Date ? e.toISOString() : e + "";
}
function ed(e, n, t, a) {
  e.pipe(yh(({ entries: r }, i) => {
    const o = r[r.length - 1];
    return o && o.entry.messages.join() === i.messages.join() && o.entry.level === i.level ? (o.count += 1, o.lastTime = i.time) : r.push({
      entry: i,
      count: 1,
      lastTime: i.time
    }), {
      entries: r.slice(-15),
      recent: i
    };
  }, { entries: [], recent: { time: /* @__PURE__ */ new Date(), module: "any", level: "debug", messages: [] } }), re(({ recent: r }) => r.level === "error"), g(({ entries: r, recent: i }) => ({
    context: r,
    error: i.messages.find((o) => o instanceof Error)
  })), re(({ error: r }) => !!r)).subscribe(({ error: r, context: i }) => {
    const o = a == null ? void 0 : a.getState(), s = o && !yn(o, "noLensApplied") ? o.data.id : "none";
    n.dispatchEvent(new ee("exception", {
      name: "exception",
      lensId: s,
      type: r.name,
      reason: `${Ka(r)}${PS}${CS(i)}`
    })), t.setOperationalMetrics(Oe.count("handled_exception", 1, { type: r.name }));
  });
}
const ba = R("reportGlobalException", [pr.token, Te.token, _e.token], (e, n, t) => {
  const a = new de();
  return ed(e.pipe(rn(a)), n, t), {
    attachLensContext: (r) => {
      a.next(), ed(e, n, t, r);
    }
  };
}), DS = R("reportSessionException", [ba.token, Je.token], (e, n) => {
  e.attachLensContext(n);
});
class qn extends Wa {
  static level(n, t, a = {}) {
    const r = new qn(n, a);
    return r.add(t), r;
  }
  constructor(n, t = {}) {
    super(n, t), this.name = n, this.levels = [];
  }
  add(n) {
    this.levels.push(n);
  }
  toOperationalMetric() {
    const n = /* @__PURE__ */ new Date(), t = `${this.name}${za(this.dimensions)}`;
    return this.levels.map((a) => ({
      name: t,
      timestamp: n,
      metric: { $case: "histogram", histogram: `${Math.ceil(a)}` }
    }));
  }
}
const yS = ["gflops"], US = R("reportBenchmarks", [Te.token, _e.token, ke], (e, n, t) => O(void 0, void 0, void 0, function* () {
  if (t.lensPerformance === void 0)
    return;
  const a = yield t.lensPerformance, r = {
    name: "benchmarkComplete",
    performanceCluster: `${a.cluster}`,
    webglRendererInfo: a.webglRendererInfo
  }, i = { performance_cluster: a.cluster.toString() };
  for (const o of a.benchmarks) {
    if (!yS.includes(o.name))
      continue;
    const s = Object.assign(Object.assign({}, r), { benchmarkName: o.name, benchmarkValue: o.value });
    e.dispatchEvent(new ee("benchmarkComplete", s)), n.setOperationalMetrics(qn.level(`benchmark.${o.name}`, o.value, i));
  }
})), um = (e) => (n, t, a) => {
  let r = e;
  const i = new $n(), o = (u) => {
    r = a(r, u), i.dispatchEvent(new ee("state", r));
  };
  let s = !1;
  return i.addEventListener = new Proxy(i.addEventListener, {
    apply: (u, c, d) => {
      if (s)
        throw new Error("Cannot add another event listener. The TypedEventTarget returned by scan only supports a single listener, and one has already been added.");
      s = !0, t.forEach((m) => n.addEventListener(m, o)), u.apply(c, d);
    }
  }), i.removeEventListener = new Proxy(i.removeEventListener, {
    apply: (u, c, d) => {
      t.forEach((m) => n.removeEventListener(m, o)), u.apply(c, d);
    }
  }), i;
}, MS = [
  "asset",
  "lens_content",
  mo,
  ho,
  xi,
  Xa
], VS = (e) => {
  switch (e.requestType) {
    case xi:
      return [["delta", e.delta]];
    case Xa:
      return [["method", e.methodName]];
    case mo:
    case ho:
      return [["custom", e.customBuild]];
    default:
      return [];
  }
}, GS = (e) => e.requestType === "asset" ? e.assetType : e.requestType, BS = (e) => {
  switch (e.type) {
    case "started":
    case "errored":
      return 0;
    case "completed":
      return e.detail.sizeByte / 1024;
    default:
      $e();
  }
}, FS = (e) => {
  switch (e.type) {
    case "started":
    case "errored":
      return "0";
    case "completed":
      return e.detail.status.toString();
    default:
      $e();
  }
}, HS = (e) => {
  const n = e;
  return MS.includes(n.requestType);
}, KS = R("reportHttpMetrics", [_e.token, cn.token], (e, n) => {
  um({ name: "inProgress", inProgress: /* @__PURE__ */ new Map() })(n, ["started", "completed", "errored"], (t, a) => {
    var r;
    const { inProgress: i } = t, { dimensions: o, requestId: s } = a.detail;
    if (!HS(o))
      return t;
    switch (a.type) {
      case "started":
        const u = a.detail.timer;
        return i.set(s, { timer: u }), { name: "inProgress", inProgress: i };
      case "completed":
      case "errored":
        const c = i.get(s);
        if (!c)
          return t;
        i.delete(s);
        const d = BS(a), m = FS(a), l = {
          content_type: GS(o),
          network_type: (r = an().connectionType) !== null && r !== void 0 ? r : "unknown",
          status: m
        };
        for (const [f, E] of VS(o))
          l[f] = E;
        return c.timer.measure(l), {
          name: "completed",
          inProgress: t.inProgress,
          dimensions: l,
          downloadSizeKb: d,
          timer: c.timer
        };
      default:
        $e();
    }
  }).addEventListener("state", ({ detail: t }) => {
    if (t.name !== "completed")
      return;
    const { dimensions: a, timer: r, downloadSizeKb: i } = t;
    e.setOperationalMetrics(Oe.count("download_finished", 1, a)), e.setOperationalMetrics(qn.level("download_size_kb", i, a)), e.setOperationalMetrics(r);
  });
}), YS = R("reportLegalState", [_o.token, Te.token, _e.token], (e, n, t) => {
  e.events.pipe(y("accept", "reject"), g(([{ data: a, name: r }]) => ({
    name: "legalPrompt",
    legalPromptId: a,
    legalPromptResult: r === "accept" ? rt.CAMERA_KIT_LEGAL_PROMPT_ACCEPTED : rt.CAMERA_KIT_LEGAL_PROMPT_DISMISSED
  }))).subscribe({
    next: (a) => {
      n.dispatchEvent(new ee("legalPrompt", a)), t.setOperationalMetrics(Oe.count("legal_prompt_interaction", 1, {
        accepted: (a.legalPromptResult === rt.CAMERA_KIT_LEGAL_PROMPT_ACCEPTED).toString()
      }));
    }
  });
}), WS = ["lens_content", "asset"], zS = (e) => {
  const n = e.requestType;
  return typeof n == "string" && WS.includes(n);
}, qS = R("reportLensAndAssetDownload", [Te.token, _e.token, cn.token], (e, n, t) => {
  um({ name: "inProgress", inProgress: /* @__PURE__ */ new Map() })(t, ["started", "completed", "errored"], (a, r) => {
    var i;
    const { inProgress: o } = a, { dimensions: s, requestId: u } = r.detail;
    if (!zS(s))
      return a;
    switch (r.type) {
      case "started":
        const c = r.detail.timer;
        return o.set(u, { timer: c }), { name: "inProgress", inProgress: o };
      case "completed":
        const d = o.get(u);
        if (!d)
          return a;
        o.delete(u);
        const { duration: m } = (i = d.timer.measure()) !== null && i !== void 0 ? i : { duration: 0 }, l = m / 1e3, { sizeByte: f } = r.detail;
        switch (s.requestType) {
          case "lens_content":
            return {
              name: "completed",
              inProgress: o,
              event: new ee("lensDownload", {
                name: "lensDownload",
                lensId: s.lensId,
                automaticDownload: !1,
                sizeByte: `${Math.ceil(f)}`,
                downloadTimeSec: l
              })
            };
          case "asset":
            return {
              name: "completed",
              inProgress: o,
              event: new ee("assetDownload", {
                name: "assetDownload",
                assetId: s.assetId,
                automaticDownload: !1,
                sizeByte: `${Math.ceil(f)}`,
                downloadTimeSec: l
              })
            };
          default:
            $e();
        }
      case "errored":
        if (!o.get(u))
          return a;
        o.delete(u);
        const v = r.detail.error;
        return {
          name: "completed",
          inProgress: o,
          event: new ee("exception", {
            name: "exception",
            lensId: s.lensId,
            type: s.requestType === "lens_content" ? "lens" : "asset",
            reason: Ka(v)
          })
        };
      default:
        $e();
    }
  }).addEventListener("state", ({ detail: a }) => {
    a.name === "completed" && (e.dispatchEvent(a.event), a.event.detail.name === "exception" && n.setOperationalMetrics(Oe.count("handled_exception", 1, { type: a.event.detail.type })));
  });
}), $S = R("reportLensValidationFailed", [Je.token, Te.token], (e, n) => {
  e.events.pipe(y("applyLensFailed"), re(([t]) => t.data.error.name === "LensContentValidationError")).subscribe({
    next: ([{ data: t }]) => {
      const { lens: a } = t, r = {
        name: "lensContentValidationFailed",
        lensId: a.id
      };
      n.dispatchEvent(new ee("lensContentValidationFailed", r));
    }
  });
}), cm = "America/Los_Angeles", ot = new Intl.DateTimeFormat("en-US", {
  timeZone: cm,
  year: "numeric",
  month: "numeric",
  day: "numeric"
}), ir = new Intl.DateTimeFormat("en-US", {
  timeZone: cm,
  year: "numeric",
  month: "numeric"
}), ZS = 0.1;
function JS(e, n) {
  return O(this, void 0, void 0, function* () {
    let t = !1, a = !1;
    try {
      const r = yield n.retrieve(e), i = /* @__PURE__ */ new Date();
      r ? (t = ot.format(r) !== ot.format(i), a = ir.format(r) !== ir.format(i)) : (t = !0, a = !0), yield n.store(e, i);
    } catch (r) {
      console.error(`Error handling persistence for lensId ${e}: ${r}`), t = !1, a = !1;
    }
    return { isLensFirstWithinDay: t, isLensFirstWithinMonth: a };
  });
}
const XS = R("reportLensView", [
  ka.token,
  Je.token,
  Er.token,
  Te.token,
  _e.token,
  ke
], (e, n, t, a, r, i) => O(void 0, void 0, void 0, function* () {
  var o;
  const { cluster: s, webglRendererInfo: u } = (o = yield i.lensPerformance) !== null && o !== void 0 ? o : {
    cluster: 0,
    webglRendererInfo: "unknown"
  }, c = new dr(() => 60 * 24 * 60 * 60, new Zn({ databaseName: "recentLensViews" }));
  Ze(n.events.pipe(y("downloadComplete"), g(([d]) => d.data)), n.events.pipe(le("lensApplied"), An(([, d]) => t.events.pipe(y("resume"), rn(n.events.pipe(y("removeLens"))), g(() => d.data))))).pipe(g((d) => [We(), d.id, d.groupId]), se(([d, m, l]) => {
    const f = yn(n.getState(), "lensApplied"), E = f ? j(0) : n.events.pipe(y("resourcesLoaded"), re(([p]) => p.data.id === m), Ae(1), g(() => (We() - d) / 1e3)), v = (f ? j([We(), e.metrics.beginMeasurement()]) : n.events.pipe(y("turnedOn"), re(([p]) => p.data.id === m), g(() => [We(), e.metrics.beginMeasurement()]))).pipe(Ae(1), se(([p, S]) => n.events.pipe(y("turnedOff"), re(([_]) => _.data.id === m), Vd(t.events.pipe(y("suspend"))), g(() => (S.end(), Object.assign({ viewTimeSec: (We() - p) / 1e3 }, S.measure()))))));
    return E.pipe(Md(v, ce(JS(m, c))), rn(n.events.pipe(y("turnedOn"), re(([p]) => p.data.id !== m))), Ae(1), g(([p, S, _]) => Object.assign(Object.assign({
      applyDelaySec: p,
      lensId: m,
      lensGroupId: l
    }, S), _)));
  })).subscribe({
    next: ({ applyDelaySec: d, lensId: m, lensGroupId: l, viewTimeSec: f, avgFps: E, lensFrameProcessingTimeMsAvg: v, lensFrameProcessingTimeMsStd: p, lensFrameProcessingTimeMsMedian: S, lensFrameProcessingN: _, isLensFirstWithinDay: A, isLensFirstWithinMonth: N }) => O(void 0, void 0, void 0, function* () {
      if (f < ZS)
        return;
      const k = {
        name: "lensView",
        applyDelaySec: d,
        avgFps: E,
        lensId: m,
        lensGroupId: l,
        lensFrameProcessingTimeMsAvg: v,
        lensFrameProcessingTimeMsStd: p,
        recordingTimeSec: 0,
        viewTimeSec: f,
        isLensFirstWithinDay: A,
        isLensFirstWithinMonth: N,
        performanceCluster: `${s}`,
        webglRendererInfo: u
      };
      a.dispatchEvent(new ee("lensView", k)), r.setOperationalMetrics(qn.level("lens_view", f * 1e3)), _ >= 30 && r.setOperationalMetrics(qn.level("lens_view_frame-processing-time", S, {
        performance_cluster: s.toString()
      }));
    })
  });
})), QS = 0.1, jS = R("reportLensWait", [Je.token, Te.token], (e, n) => {
  e.events.pipe(y("applyLens"), se(([t]) => {
    const a = t.data.lens.id, r = t.data.lens.groupId, i = We();
    return e.events.pipe(y("firstFrameProcessed", "applyLens"), Ae(1), g(() => [
      (We() - i) / 1e3,
      a,
      r
    ]));
  })).subscribe({
    next: ([t, a, r]) => {
      if (t < QS)
        return;
      const i = {
        name: "lensWait",
        lensId: a,
        viewTimeSec: t,
        lensGroupId: r
      };
      n.dispatchEvent(new ee("lensWait", i));
    }
  });
}), xS = R("reportUserSession", [Te.token], (e) => O(void 0, void 0, void 0, function* () {
  var n, t;
  const a = "userSessionInfo", r = new Zn({ databaseName: "SessionHistory" }), i = /* @__PURE__ */ new Date(), o = ot.format(i), s = ot.formatToParts(i), { day: u, month: c, year: d } = s.reduce((_, { type: A, value: N }) => Object.assign(Object.assign({}, _), { [A]: parseInt(N) }), {}), m = yield r.retrieve(a), l = m == null ? void 0 : m.mostRecentSessionStartDate, f = l ? ot.format(l) : null, E = /* @__PURE__ */ new Map([
    [1, fe.ONE_SESSION],
    [2, fe.TWO_SESSION],
    [3, fe.THREE_SESSION],
    [4, fe.FOUR_SESSION],
    [5, fe.FIVE_SESSION],
    [6, fe.SIX_SESSION],
    [7, fe.SEVEN_SESSION],
    [8, fe.EIGHT_SESSION],
    [9, fe.NINE_SESSION]
  ]);
  let v = (n = m == null ? void 0 : m.dailySessionBucket) !== null && n !== void 0 ? n : fe.NO_SESSION_BUCKET, p = !1;
  f === o ? (v = (t = E.get(v + 1)) !== null && t !== void 0 ? t : fe.TEN_OR_MORE_SESSION, yield r.store(a, {
    mostRecentSessionStartDate: i,
    dailySessionBucket: v
  })) : (p = !l || ir.format(l) !== ir.format(i), yield r.store(a, {
    mostRecentSessionStartDate: i,
    dailySessionBucket: v = fe.ONE_SESSION
  }));
  const S = {
    name: "session",
    dailySessionBucket: v,
    isFirstWithinMonth: p,
    month: `${c}`,
    day: `${u}`,
    year: `${d}`
  };
  e.dispatchEvent(new ee("session", S));
})), eI = R("reportPlatformCapabilities", [_e.token], (e) => O(void 0, void 0, void 0, function* () {
  const { webgl: n, wasm: t, webxr: a } = yield fo();
  e.setOperationalMetrics(Oe.count(On(["platform", "webgl"]), n.supported ? 1 : 0)), e.setOperationalMetrics(Oe.count(On(["platform", "wasm"]), t.supported ? 1 : 0)), e.setOperationalMetrics(Oe.count(On(["platform", "webxr"]), a.supported ? 1 : 0));
})), nI = new je({}).provides(KS).provides(US).provides(qS).provides(YS).provides(eI), tI = new je({}).provides(xS).provides(XS).provides(jS).provides(DS).provides($S), Oo = (() => {
  if (typeof self > "u") return !1;
  if ("top" in self && self !== top) try {
    top.window.document._ = 0;
  } catch {
    return !1;
  }
  return "showOpenFilePicker" in self;
})(), iI = Oo ? Promise.resolve().then(function() {
  return sI;
}) : Promise.resolve().then(function() {
  return mI;
});
async function rI(...e) {
  return (await iI).default(...e);
}
Oo ? Promise.resolve().then(function() {
  return cI;
}) : Promise.resolve().then(function() {
  return pI;
});
Oo ? Promise.resolve().then(function() {
  return dI;
}) : Promise.resolve().then(function() {
  return EI;
});
const aI = async (e) => {
  const n = await e.getFile();
  return n.handle = e, n;
};
var oI = async (e = [{}]) => {
  Array.isArray(e) || (e = [e]);
  const n = [];
  e.forEach((r, i) => {
    n[i] = { description: r.description || "Files", accept: {} }, r.mimeTypes ? r.mimeTypes.map((o) => {
      n[i].accept[o] = r.extensions || [];
    }) : n[i].accept["*/*"] = r.extensions || [];
  });
  const t = await window.showOpenFilePicker({ id: e[0].id, startIn: e[0].startIn, types: n, multiple: e[0].multiple || !1, excludeAcceptAllOption: e[0].excludeAcceptAllOption || !1 }), a = await Promise.all(t.map(aI));
  return e[0].multiple ? a : a[0];
}, sI = { __proto__: null, default: oI };
function $i(e) {
  function n(t) {
    if (Object(t) !== t) return Promise.reject(new TypeError(t + " is not an object."));
    var a = t.done;
    return Promise.resolve(t.value).then(function(r) {
      return { value: r, done: a };
    });
  }
  return $i = function(t) {
    this.s = t, this.n = t.next;
  }, $i.prototype = { s: null, n: null, next: function() {
    return n(this.n.apply(this.s, arguments));
  }, return: function(t) {
    var a = this.s.return;
    return a === void 0 ? Promise.resolve({ value: t, done: !0 }) : n(a.apply(this.s, arguments));
  }, throw: function(t) {
    var a = this.s.return;
    return a === void 0 ? Promise.reject(t) : n(a.apply(this.s, arguments));
  } }, new $i(e);
}
const lm = async (e, n, t = e.name, a) => {
  const r = [], i = [];
  var o, s = !1, u = !1;
  try {
    for (var c, d = function(m) {
      var l, f, E, v = 2;
      for (typeof Symbol < "u" && (f = Symbol.asyncIterator, E = Symbol.iterator); v--; ) {
        if (f && (l = m[f]) != null) return l.call(m);
        if (E && (l = m[E]) != null) return new $i(l.call(m));
        f = "@@asyncIterator", E = "@@iterator";
      }
      throw new TypeError("Object is not async iterable");
    }(e.values()); s = !(c = await d.next()).done; s = !1) {
      const m = c.value, l = `${t}/${m.name}`;
      m.kind === "file" ? i.push(m.getFile().then((f) => (f.directoryHandle = e, f.handle = m, Object.defineProperty(f, "webkitRelativePath", { configurable: !0, enumerable: !0, get: () => l })))) : m.kind !== "directory" || !n || a && a(m) || r.push(lm(m, n, l, a));
    }
  } catch (m) {
    u = !0, o = m;
  } finally {
    try {
      s && d.return != null && await d.return();
    } finally {
      if (u) throw o;
    }
  }
  return [...(await Promise.all(r)).flat(), ...await Promise.all(i)];
};
var uI = async (e = {}) => {
  e.recursive = e.recursive || !1, e.mode = e.mode || "read";
  const n = await window.showDirectoryPicker({ id: e.id, startIn: e.startIn, mode: e.mode });
  return (await (await n.values()).next()).done ? [n] : lm(n, e.recursive, void 0, e.skipDirectory);
}, cI = { __proto__: null, default: uI }, lI = async (e, n = [{}], t = null, a = !1, r = null) => {
  Array.isArray(n) || (n = [n]), n[0].fileName = n[0].fileName || "Untitled";
  const i = [];
  let o = null;
  if (e instanceof Blob && e.type ? o = e.type : e.headers && e.headers.get("content-type") && (o = e.headers.get("content-type")), n.forEach((c, d) => {
    i[d] = { description: c.description || "Files", accept: {} }, c.mimeTypes ? (d === 0 && o && c.mimeTypes.push(o), c.mimeTypes.map((m) => {
      i[d].accept[m] = c.extensions || [];
    })) : o ? i[d].accept[o] = c.extensions || [] : i[d].accept["*/*"] = c.extensions || [];
  }), t) try {
    await t.getFile();
  } catch (c) {
    if (t = null, a) throw c;
  }
  const s = t || await window.showSaveFilePicker({ suggestedName: n[0].fileName, id: n[0].id, startIn: n[0].startIn, types: i, excludeAcceptAllOption: n[0].excludeAcceptAllOption || !1 });
  !t && r && r(s);
  const u = await s.createWritable();
  return "stream" in e ? (await e.stream().pipeTo(u), s) : "body" in e ? (await e.body.pipeTo(u), s) : (await u.write(await e), await u.close(), s);
}, dI = { __proto__: null, default: lI }, fI = async (e = [{}]) => (Array.isArray(e) || (e = [e]), new Promise((n, t) => {
  const a = document.createElement("input");
  a.type = "file";
  const r = [...e.map((i) => i.mimeTypes || []), ...e.map((i) => i.extensions || [])].join();
  a.multiple = e[0].multiple || !1, a.accept = r || "", a.style.display = "none", document.body.append(a), a.addEventListener("cancel", () => {
    a.remove(), t(new DOMException("The user aborted a request.", "AbortError"));
  }), a.addEventListener("change", () => {
    a.remove(), n(a.multiple ? Array.from(a.files) : a.files[0]);
  }), "showPicker" in HTMLInputElement.prototype ? a.showPicker() : a.click();
})), mI = { __proto__: null, default: fI }, hI = async (e = [{}]) => (Array.isArray(e) || (e = [e]), e[0].recursive = e[0].recursive || !1, new Promise((n, t) => {
  const a = document.createElement("input");
  a.type = "file", a.webkitdirectory = !0, a.style.display = "none", document.body.append(a), a.addEventListener("cancel", () => {
    a.remove(), t(new DOMException("The user aborted a request.", "AbortError"));
  }), a.addEventListener("change", () => {
    a.remove();
    let r = Array.from(a.files);
    e[0].recursive ? e[0].recursive && e[0].skipDirectory && (r = r.filter((i) => i.webkitRelativePath.split("/").every((o) => !e[0].skipDirectory({ name: o, kind: "directory" })))) : r = r.filter((i) => i.webkitRelativePath.split("/").length === 2), n(r);
  }), "showPicker" in HTMLInputElement.prototype ? a.showPicker() : a.click();
})), pI = { __proto__: null, default: hI }, vI = async (e, n = {}) => {
  Array.isArray(n) && (n = n[0]);
  const t = document.createElement("a");
  let a = e;
  "body" in e && (a = await async function(o, s) {
    const u = o.getReader(), c = new ReadableStream({ start: (l) => async function f() {
      return u.read().then(({ done: E, value: v }) => {
        if (!E) return l.enqueue(v), f();
        l.close();
      });
    }() }), d = new Response(c), m = await d.blob();
    return u.releaseLock(), new Blob([m], { type: s });
  }(e.body, e.headers.get("content-type"))), t.download = n.fileName || "Untitled", t.href = URL.createObjectURL(await a);
  const r = () => {
    typeof i == "function" && i();
  }, i = n.legacySetup && n.legacySetup(r, () => i(), t);
  return t.addEventListener("click", () => {
    setTimeout(() => URL.revokeObjectURL(t.href), 3e4), r();
  }), t.click(), null;
}, EI = { __proto__: null, default: vI };
const SI = 65496, II = 65505, _I = 1165519206, AI = 18761, NI = 274;
var nd;
(function(e) {
  e[e.TopLeft = 1] = "TopLeft", e[e.TopRight = 2] = "TopRight", e[e.BottomRight = 3] = "BottomRight", e[e.BottomLeft = 4] = "BottomLeft", e[e.LeftTop = 5] = "LeftTop", e[e.RightTop = 6] = "RightTop", e[e.RightBottom = 7] = "RightBottom", e[e.LeftBottom = 8] = "LeftBottom";
})(nd || (nd = {}));
function OI(e) {
  const n = new DataView(e);
  if (n.getUint16(0, !1) !== SI)
    return;
  const t = n.byteLength;
  let a = 2;
  for (; a < t; ) {
    if (n.getUint16(a + 2, !1) <= 8)
      return;
    let r = n.getUint16(a, !1);
    if (a += 2, r === II) {
      if (n.getUint32(a += 2, !1) !== _I)
        return;
      let i = n.getUint16(a += 6, !1) === AI;
      a += n.getUint32(a + 4, i);
      let o = n.getUint16(a, i);
      a += 2;
      for (let s = 0; s < o; s++)
        if (n.getUint16(a + s * 12, i) === NI)
          return n.getUint16(a + s * 12 + 8, i);
    } else {
      if ((r & 65280) !== 65280)
        break;
      a += n.getUint16(a, !1);
    }
  }
}
const Pa = U("lensClientInterfaceImagePicker"), td = {
  image: [
    "image/avif",
    "image/bmp",
    "image/gif",
    "image/jpeg",
    "image/png",
    "image/svg+xml",
    "image/tiff",
    "image/webp"
  ],
  video: [
    "video/3gpp",
    "video/3gpp2",
    "video/mp2t",
    "video/mp4",
    "video/mpeg",
    "video/ogg",
    "video/quicktime",
    "video/webm",
    "video/x-msvideo"
  ]
};
function* RI(e) {
  const n = typeof document < "u" ? document.createElement("video") : void 0;
  for (const t of e)
    n != null && n.canPlayType(t) && (yield t);
}
function kI(e) {
  return new Promise((n, t) => {
    const a = new FileReader();
    a.addEventListener("load", (r) => {
      n(r.target.result);
    }), a.addEventListener("error", (r) => {
      t(r.target.error);
    }), a.readAsArrayBuffer(e);
  });
}
function TI({ ImageEnabled: e, VideoEnabled: n }) {
  const t = [];
  if (e === "1" && t.push(...td.image), n === "1" && t.push(...RI(td.video)), t.length === 0)
    throw new Error("Unknown media type requested.");
  return t;
}
function gI(e, n) {
  var t;
  const a = {
    1: n.ExternalMediaOrientation.CW0,
    2: n.ExternalMediaOrientation.CW0,
    3: n.ExternalMediaOrientation.CW180,
    4: n.ExternalMediaOrientation.CW180,
    5: n.ExternalMediaOrientation.CW90,
    6: n.ExternalMediaOrientation.CW90,
    7: n.ExternalMediaOrientation.CW270,
    8: n.ExternalMediaOrientation.CW270
  };
  try {
    return a[(t = OI(e)) !== null && t !== void 0 ? t : 1];
  } catch (r) {
    return Pa.info("Error occurred while reading EXIF orientation tag.", r), n.ExternalMediaOrientation.CW0;
  }
}
function bI(e, n, t) {
  return O(this, void 0, void 0, function* () {
    const a = TI(e);
    Pa.debug(`Opening file dialog for MIME types: ${a}`);
    const r = yield t({ mimeTypes: a }, rI);
    if (Array.isArray(r))
      throw new Error("Multiple files are not supported.");
    Pa.debug(`Selected file MIME type: ${r.type}`);
    const i = yield kI(r);
    r.type.startsWith("image/") ? n.provideExternalImage({
      data: i,
      orientation: gI(i, n),
      faceRects: [
        {
          origin: {
            x: 0,
            y: 0
          },
          size: {
            width: 1,
            height: 1
          }
        }
      ]
    }) : n.provideExternalVideo({
      data: i,
      orientation: n.ExternalMediaOrientation.CW0
    });
  });
}
const dm = R("filePicker", () => (e, n) => n(e)), id = U("lensClientInterface"), PI = R("registerLensClientInterfaceHandler", [ae.token, dm.token], (e, n) => {
  if (!e.setClientInterfaceRequestHandler) {
    id.warn("Current LensCore version doesn't support lens client interface requests");
    return;
  }
  e.setClientInterfaceRequestHandler(({ data: t, interfaceControl: a, interfaceAction: r }) => O(void 0, void 0, void 0, function* () {
    a === e.InterfaceControl.ImagePicker && r === e.InterfaceAction.Show && (yield bI(t, e, n).catch((i) => {
      id.error(qh("Error occurred while attempting to select an image file for the lens request.", i));
    }));
  }));
});
function fm(e) {
  if (e.stringValue)
    return { stringValue: e.stringValue };
  if (e.boolValue)
    return { boolValue: e.boolValue };
  if (e.intValue)
    return { intValue: e.intValue };
  if (e.longValue)
    return { longValue: Number(e.longValue) };
  if (e.floatValue)
    return { floatValue: e.floatValue };
  if (e.anyValue)
    return { anyValue: { typeUrl: e.anyValue.typeUrl, value: e.anyValue.value } };
}
const LI = U("setPreloadedConfiguration"), rd = [], CI = R("setPreloadedConfiguration", [ae.token, He.token], (e, n) => {
  rd.length !== 0 && mh(rd.map((t) => n.get(t))).pipe(Ae(1)).subscribe({
    next: (t) => {
      const a = t.flat().flatMap(({ configId: r, value: i }) => {
        if (!i)
          return [];
        const o = fm(i);
        return o ? [{ configId: r, value: o }] : [];
      });
      e.setPreloadedConfiguration(a);
    },
    error: LI.error
  });
}), ad = U("registerConfigurationProvider"), wI = R("registerConfigurationProvider", [ae.token, He.token], (e, n) => {
  if (!e.setConfigurationProvider)
    return ad.warn("LensCore version does not support on-demand configuration.");
  e.setConfigurationProvider(({ configId: t }) => O(void 0, void 0, void 0, function* () {
    try {
      const a = yield Yn(n.get(t));
      if (a.length === 0)
        return;
      const { configId: r, value: i } = a[0];
      if (!i)
        return;
      const o = fm(i);
      return o ? { configId: r, value: o } : void 0;
    } catch (a) {
      ad.error(new Error(`Failed to resolve config "${t}" on demand.`, { cause: a }));
      return;
    }
  }));
});
function DI(e) {
  return K(e) && yI(e.weather);
}
function yI(e) {
  return K(e) && G(e.locationName) && Dn(e.celsius) && Dn(e.fahrenheit) && !$(e.hourlyForecasts) && qe(UI, e.hourlyForecasts);
}
function UI(e) {
  return K(e) && Dn(e.celsius) && Dn(e.fahrenheit) && G(e.displayTime) && G(e.weatherCondition) && G(e.localizedWeatherCondition);
}
const mm = R("geoDataProvider", () => () => {
}), MI = U("registerGeoDataProvider"), VI = R("registerGeoDataProvider", [ae.token, mm.token], (e, n) => {
  if (!e.setGeoDataProvider) {
    MI.warn("setGeoDataProvider is not defined.");
    return;
  }
  e.setGeoDataProvider(() => {
    const t = n();
    if (t) {
      if (!DI(t))
        throw new Error("Expected GeoData object.");
      e.provideGeoData({ geoData: t });
    }
  });
}), hm = R("LensAnalyticEventsHandler", () => () => {
}), GI = U("registerLensAnalyticEventsHandler"), BI = R("registerLensAnalyticsHandler", [ae.token, hm.token], (e, n) => {
  if (!e.setAnalyticsEventsHandler) {
    GI.warn("Current LensCore version doesn't support lens analytics events.");
    return;
  }
  e.setAnalyticsEventsHandler(n);
}), In = U("CameraKit"), FI = ["lensView", "lensWait"];
let HI = (() => {
  var e;
  let n = [], t, a;
  return e = class {
    constructor(i, o, s, u, c, d) {
      this.lensRepository = (ft(this, n), i), this.lensCore = o, this.pageVisibility = s, this.container = u, this.remoteConfig = c, this.metrics = new $n(), this.sessions = [], this.lenses = { repository: this.lensRepository }, FI.forEach((m) => {
        d.addEventListener(m, (l) => this.metrics.dispatchEvent(l));
      });
    }
    createSession({ liveRenderTarget: i, renderWhileTabHidden: o } = {}) {
      return O(this, void 0, void 0, function* () {
        const s = (l) => {
          l.name === "LensCoreAbortError" ? In.error(Qh("Unrecoverable error occurred during lens execution. The CameraKitSession will be destroyed.", l)) : l.name === "LensCoreVideoPlaybackMutedError" ? In.error(Xh("Video playback was muted due to browser autoplay policies. Please prompt the user to interact with the page and unmute audio.", l)) : l.name === "LensCoreVideoPlaybackFailedError" ? In.warn("Video playback failed.", l) : In.error(Jh("Error occurred during lens execution. The lens cannot be rendered and will be removed from the CameraKitSession.", l));
        }, u = this.container.get(ke), c = Mf(u.trustedTypesPolicyName);
        if (yield this.lensCore.initialize({
          canvas: i,
          shouldUseWorker: !o && u.shouldUseWorker,
          exceptionHandler: s,
          trustedTypes: {
            policyName: c.policyName,
            getTrustedUrls: c.getTrustedUrls,
            trustUrl: c.trustUrl
          }
        }), this.lensCore.setGpuIndex)
          try {
            yield this.lensCore.setGpuIndex({
              gpuIndex: yield Yn(this.remoteConfig.getGpuIndexConfig())
            });
          } catch (l) {
            In.error(new Error("Cannot set GPU index.", { cause: l }));
          }
        if (u.fonts.length > 0)
          if (this.lensCore.setSystemFontFamilies)
            this.lensCore.setSystemFontFamilies({
              fontFamilies: u.fonts.map((l) => typeof l == "string" ? [{ name: "Embedded", data: new ArrayBuffer(0) }] : [Object.assign(Object.assign({}, l), { data: l.data.slice(0) })])
            });
          else {
            const l = u.fonts.filter((f) => typeof f != "string");
            l.length > 0 && this.lensCore.setSystemFonts({
              fonts: l.map((f) => Object.assign(Object.assign({}, f), { data: f.data.slice(0) }))
            });
          }
        yield this.lensCore.setRenderLoopMode({
          mode: o ? this.lensCore.RenderLoopMode.SetTimeout : this.lensCore.RenderLoopMode.RequestAnimationFrame
        });
        const m = this.container.copy().provides(Er).provides(Je).provides(No).provides(Zf).provides(ka).run(tS).run(PI).run(VI).run(wI).run(CI).run(BI).run(tI).run(gS).get(ka.token);
        return this.sessions.push(m), m;
      });
    }
    destroy() {
      return O(this, void 0, void 0, function* () {
        Bd(), this.pageVisibility.destroy(), yield Promise.all(this.sessions.map((i) => i.destroy())), this.sessions = [];
      });
    }
  }, t = [ie(In)], a = [ie(In)], Q(e, null, t, { kind: "method", name: "createSession", static: !1, private: !1, access: { has: (r) => "createSession" in r, get: (r) => r.createSession } }, null, n), Q(e, null, a, { kind: "method", name: "destroy", static: !1, private: !1, access: { has: (r) => "destroy" in r, get: (r) => r.destroy } }, null, n), e;
})();
const od = R("CameraKit", [
  Jn.token,
  Te.token,
  ae.token,
  fr.token,
  He.token,
  dd
], (e, n, t, a, r, i) => new HI(e, t, a, i, r, n));
function KI() {
  return O(this, void 0, void 0, function* () {
    const { wasm: e, webgl: n } = yield fo();
    if (!e.supported)
      throw e.error;
    if (!n.supported)
      throw n.error;
  });
}
var x = [];
for (var $r = 0; $r < 256; ++$r)
  x.push(($r + 256).toString(16).slice(1));
function YI(e, n = 0) {
  return (x[e[n + 0]] + x[e[n + 1]] + x[e[n + 2]] + x[e[n + 3]] + "-" + x[e[n + 4]] + x[e[n + 5]] + "-" + x[e[n + 6]] + x[e[n + 7]] + "-" + x[e[n + 8]] + x[e[n + 9]] + "-" + x[e[n + 10]] + x[e[n + 11]] + x[e[n + 12]] + x[e[n + 13]] + x[e[n + 14]] + x[e[n + 15]]).toLowerCase();
}
var _t, WI = new Uint8Array(16);
function zI() {
  if (!_t && (_t = typeof crypto < "u" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto), !_t))
    throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
  return _t(WI);
}
var qI = typeof crypto < "u" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
const sd = {
  randomUUID: qI
};
function pm(e, n, t) {
  if (sd.randomUUID && !e)
    return sd.randomUUID();
  e = e || {};
  var a = e.random || (e.rng || zI)();
  return a[6] = a[6] & 15 | 64, a[8] = a[8] & 63 | 128, YI(a);
}
const vm = U("BusinessEventsReporter"), $I = {
  cellular: Qe.CAMERA_KIT_CONNECTIVITY_TYPE_MOBILE,
  bluetooth: Qe.CAMERA_KIT_CONNECTIVITY_TYPE_BLUETOOTH,
  wifi: Qe.CAMERA_KIT_CONNECTIVITY_TYPE_WIFI,
  unknown: Qe.CAMERA_KIT_CONNECTIVITY_TYPE_UNKNOWN,
  none: Qe.CAMERA_KIT_CONNECTIVITY_TYPE_UNREACHABLE
}, ud = "vendorUuid", ZI = hf(60), JI = (e) => O(void 0, void 0, void 0, function* () {
  try {
    const n = yield e.retrieve(ud);
    if (n)
      return n;
    const t = pm();
    return yield e.store(ud, t), t;
  } catch {
    throw new Error("Failed to generate vendor UUID");
  }
});
function XI(e, n, t, a) {
  const r = pm();
  vm.info(`Session ID: ${r}`);
  let i = 1;
  const o = (c, d, m) => {
    var l;
    const { sdkShortVersion: f, sdkLongVersion: E, lensCore: v, locale: p, origin: S, deviceModel: _, connectionType: A } = an(), N = (l = $I[A]) !== null && l !== void 0 ? l : Qe.CAMERA_KIT_CONNECTIVITY_TYPE_UNKNOWN;
    return Object.assign(Object.assign({}, c), { cameraKitEventBase: W.fromPartial({
      kitEventBase: ha.fromPartial({
        locale: p,
        kitVariant: Ea.CAMERA_KIT_WEB,
        kitVariantVersion: f,
        kitClientTimestampMillis: `${Date.now()}`
      }),
      deviceCluster: "0",
      cameraKitVersion: E,
      lensCoreVersion: v.version,
      deviceModel: _,
      cameraKitVariant: va.CAMERA_KIT_VARIANT_PARTNER,
      cameraKitFlavor: pa.CAMERA_KIT_FLAVOR_DEBUG,
      appId: S,
      deviceConnectivity: N,
      sessionId: r,
      appVendorUuid: d,
      partnerUuid: m
    }) });
  }, s = (c, d) => {
    const { osName: m, osVersion: l } = an();
    return n.setBusinessEvents(ia.fromPartial({
      eventName: c,
      osType: m,
      osVersion: l,
      maxSequenceIdOnInstance: "0",
      sequenceId: `${i++}`,
      eventData: d
    }));
  }, u = or(t).map(([c, d]) => wn(e, c).pipe(g((m) => ({ event: m, createEventData: d }))));
  Ze(...u).pipe(Md(a)).subscribe(([{ event: c, createEventData: d }, { appVendorUuid: m, partnerUuid: l }]) => {
    const [f, E] = d(o(c.detail, m, l));
    s(f, E);
  });
}
function QI(e, n) {
  const t = new dr(() => ZI, new Zn({ databaseName: "VendorAnalytics" }));
  return n.getInitializationConfig().pipe(Ae(1), An(({ appVendorUuidOptIn: a }) => {
    const r = e.analyticsId;
    return a ? ce(JI(t)).pipe(g((i) => ({ appVendorUuid: i, partnerUuid: r }))) : j({ appVendorUuid: void 0, partnerUuid: r });
  }), tn((a) => (vm.warn("Failed to retrieve or generate vendor UUID.", a), j({ appVendorUuid: void 0, partnerUuid: e.analyticsId }))));
}
const jI = R("businessEventsReporter", [
  Te.token,
  _e.token,
  ke,
  He.token
], (e, n, t, a) => {
  const r = QI(t, a);
  XI(e, n, {
    assetDownload: (i) => [
      "CAMERA_KIT_ASSET_DOWNLOAD",
      { cameraKitAssetDownload: sa.fromPartial(i) }
    ],
    assetValidationFailed: (i) => [
      "CAMERA_KIT_ASSET_VALIDATION_FAILED",
      {
        cameraKitAssetValidationFailed: da.fromPartial(i)
      }
    ],
    benchmarkComplete: (i) => [
      "CAMERA_KIT_WEB_BENCHMARK_COMPLETE",
      {
        cameraKitWebBenchmarkComplete: fa.fromPartial(i)
      }
    ],
    exception: (i) => [
      "CAMERA_KIT_EXCEPTION",
      { cameraKitException: ua.fromPartial(i) }
    ],
    legalPrompt: (i) => [
      "CAMERA_KIT_LEGAL_PROMPT",
      { cameraKitLegalPrompt: ma.fromPartial(i) }
    ],
    lensDownload: (i) => [
      "CAMERA_KIT_LENS_DOWNLOAD",
      { cameraKitLensDownload: oa.fromPartial(i) }
    ],
    lensView: (i) => [
      "CAMERA_KIT_WEB_LENS_SWIPE",
      { cameraKitWebLensSwipe: aa.fromPartial(i) }
    ],
    lensWait: (i) => [
      "CAMERA_KIT_LENS_SPIN",
      { cameraKitLensSpin: ra.fromPartial(i) }
    ],
    lensContentValidationFailed: (i) => [
      "CAMERA_KIT_LENS_CONTENT_VALIDATION_FAILED",
      {
        cameraKitLensContentValidationFailed: la.fromPartial(i)
      }
    ],
    session: (i) => [
      "CAMERA_KIT_SESSION",
      { cameraKitSession: ca.fromPartial(i) }
    ]
  }, r);
}), xI = R("registerLogEntriesSubscriber", [ke, pr.token], (e, n) => {
  n.pipe(re((t) => st[t.level] >= st[e.logLevel])).subscribe((t) => {
    const a = e.logger[t.level];
    a(`[CameraKit.${t.module}]`, ...t.messages);
  });
}), Em = R("lensesClient", [vt.token], (e) => lr(Lp, e)), e_ = U("CameraKitLensSource"), n_ = (e) => {
  var n, t;
  return ((t = (n = e.value) === null || n === void 0 ? void 0 : n.anyValue) === null || t === void 0 ? void 0 : t.value) instanceof Uint8Array;
}, t_ = {
  id: "60515300902",
  name: "Watermark",
  content: {
    lnsSha256: "3EDEAEBCD51A547FF4D1F5708FBD6F4D628AD736BEE07AB3844B14E6C69EC510",
    lnsUrlBolt: "https://bolt-gcdn.sc-cdn.net/3/L6uAe5Fhyg0ZFf3RLsCVZ?bo=EhgaABoAMgF9OgEEQgYIkbHPpgZIAlASYAE%3D&uc=18"
  }
}, i_ = R(er.token, [er.token, Em.token, He.token], (e, n, t) => [
  {
    isGroupOwner(a) {
      return a === Ao;
    },
    loadLens() {
      return O(this, void 0, void 0, function* () {
        const a = yield Yn(t.get("CAMERA_KIT_WATERMARK_LENS").pipe(g((r) => {
          var i;
          const o = (i = r.find(n_)) === null || i === void 0 ? void 0 : i.value.anyValue.value;
          if (!o)
            throw new Error("Failed to read watermark Lens from COF response.");
          return o;
        }), tn((r) => (e_.error(r), j(ve.encode(ve.fromPartial(t_)).finish())))));
        return new I().uint32(10).bytes(a).finish();
      });
    },
    loadLensGroup() {
      return O(this, void 0, void 0, function* () {
        throw new Error("Not implemented.");
      });
    }
  },
  ...e,
  {
    isGroupOwner() {
      return !0;
    },
    loadLens(a, r) {
      var i;
      return O(this, void 0, void 0, function* () {
        const o = yield n.getGroupLens({ lensId: a, groupId: r });
        if (!o.ok) {
          const u = o.unwrapErr();
          throw new Error(`Cannot load lens lens ${a} from group ${r}. An error occured in the gRPC client:
	[${u.status}] ${u.statusMessage}`);
        }
        const s = o.unwrap();
        if (!(!((i = s.message) === null || i === void 0) && i.lens))
          throw new Error(`Cannot load lens ${a} from group ${r}. The response did not contain a lens.
	${JSON.stringify(o)} for requestId ${s.headers.get("x-request-id")}`);
        return ve.encode(s.message.lens, new I().uint32(10).fork()).join().finish();
      });
    },
    loadLensGroup(a) {
      var r;
      return O(this, void 0, void 0, function* () {
        const i = yield n.getGroup({ id: a });
        if (!i.ok) {
          const u = i.unwrapErr();
          throw new Error(`Cannot load lens group ${a}. An error occurred in the gRPC client:
	[${u.status}] ${u.statusMessage}`);
        }
        const o = i.unwrap();
        if (!(!((r = o.message) === null || r === void 0) && r.lenses))
          throw new Error(`Cannot load lens group ${a}. The response contained no lenses 
	${JSON.stringify(o)} for requestId ${o.headers.get("x-request-id")}`);
        const s = new I();
        return o.message.lenses.forEach((u) => ve.encode(u, s.uint32(10).fork()).join()), s.finish();
      });
    }
  }
]), r_ = U("bootstrapCameraKit"), a_ = [
  "ConfigurationError",
  "PlatformNotSupportedError"
];
function o_(e) {
  return e instanceof Error ? !a_.some((n) => e.name === n) : !0;
}
function h_(e, n) {
  return O(this, void 0, void 0, function* () {
    console.info(`Camera Kit SDK: ${xr.PACKAGE_VERSION} (${lt.version}/${lt.buildNumber})`);
    try {
      const t = new pt("bootstrap_time");
      Sa(Xi(e.apiToken), Zh("Invalid or unsafe apiToken provided."));
      const a = Hh(e), r = he.provides(a).provides($f).provides(dm).provides(Un).provides(qd).provides(er).provides(sm).provides(am).provides(mm).provides(Cf).provides(Lf).provides(hm), i = n ? n(r) : r, o = he.provides(i).provides(fr).provides(mf).provides(cn).provides(vt).provides(_e).provides(pr).run(xI).provides(Te).provides(ba).provides(wf).provides(He).provides(qf).provides(_o).run(nI).run(jI);
      o.get(ba.token), yield KI();
      const s = yield o.provides(ae).get(ae.token), u = o.provides(R(ae.token, () => s)).provides(Em).provides(em).provides(i_).provides(zf).provides(Df).provides(yf).provides(mr).provides(Jn).provides(od).run(HE), c = u.get(od.token);
      return t.measure(), u.get(_e.token).setOperationalMetrics(t), c;
    } catch (t) {
      throw o_(t) && (t = ep("Error occurred during Camera Kit bootstrapping.", t)), r_.error(t), t;
    }
  });
}
const s_ = cr(function() {
  return Bf.encode({
    userAgent: Ha(),
    locale: an().fullLocale
  }).finish();
});
s_();
export {
  on as Transform2D,
  h_ as bootstrapCameraKit,
  fE as createMediaStreamSource
};
