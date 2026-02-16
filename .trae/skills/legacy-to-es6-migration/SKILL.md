---
name: legacy-to-es6-migration
description: Use this skill when there is a legacy code from js
---

# SKILL: Legacy JS to ES6 Classes Migration

Convierte código JavaScript pre-ES6 (con patrones `.extends()`, `prototypePlus`, `constructorPlus`) a clases ES6 modernas manteniendo 100% compatibilidad.

---

## 🎯 TRIGGER PATTERNS

Usa este skill cuando veas:
- `var MyClass = BaseClass.extends({ ... })`
- `constructorPlus: function(props) { ... }`
- `prototypePlus: { ... }`
- Patrones de herencia custom pre-ES6
- `var self = this`, `var myself = this`
- `function() { }` en lugar de arrow functions
- Arrays estáticos como `MyClass.allInstances = []`

---

## 📋 CONVERSION RULES

### RULE 1: Constructor Migration
```javascript
// ANTES (Legacy)
var MyClass = BaseClass.extends({
    constructorPlus: function(props) {
        this.larvas = [];
        this.sound = new Audio('path.wav');
    }
});

// DESPUÉS (ES6)
class MyClass extends BaseClass {
    constructor(props) {
        super(props);
        this.larvas = [];
        this.sound = _$.lazyAudio('path.wav'); // Lazy loading cuando sea posible
    }
}
```

### RULE 2: Static Properties
```javascript
// ANTES (Legacy)
prototypePlus: {
    name: "Hatchery",
    HP: 1250,
    width: 128,
    cost: { mine: 300, time: 1200 }
}

// DESPUÉS (ES6)
class Hatchery extends BaseClass {
    static name = "Hatchery";
    static HP = 1250;
    static width = 128;
    static cost = { mine: 300, time: 1200 };
}
```

### RULE 3: Instance Methods
```javascript
// ANTES (Legacy)
prototypePlus: {
    recover: function() {
        if (this.life < this.get('HP')) this.life += 0.5;
    }
}

// DESPUÉS (ES6)
recover() {
    if (this.life < this.constructor.HP) {
        this.life += 0.5;
    }
}
```

### RULE 4: Getters for Dynamic Properties
```javascript
// ANTES (Legacy)
prototypePlus: {
    dieEffect: Burst.ZergBuildingBurst
}

// DESPUÉS (ES6) - Si puede cambiar dinámicamente:
get dieEffect() {
    return Burst.ZergBuildingBurst;
}

// O como static si nunca cambia:
static dieEffect = Burst.ZergBuildingBurst;
```

### RULE 5: Arrow Functions
```javascript
// ANTES (Legacy)
var myself = this;
setTimeout(function() {
    myself.dock();
}, 0);

// DESPUÉS (ES6)
setTimeout(() => {
    this.dock();
}, 0);
```

### RULE 6: Optional Chaining
```javascript
// ANTES (Legacy)
if (typeof Game !== 'undefined' && Game && Game.isPaused) return;

// DESPUÉS (ES6)
if (Game?.isPaused) return;
```

### RULE 7: Conditions in Items
```javascript
// ANTES (Legacy)
items: {
    '7': {
        name: 'Lair',
        condition: function() {
            return Building.ourBuildings.some(function(chara) {
                return chara.name == 'SpawningPool';
            });
        }
    }
}

// DESPUÉS (ES6) - Con cache para performance
static items = {
    '7': {
        name: 'Lair',
        condition: () => BuildingCache.has('SpawningPool')
    }
};
```

---

## ⚠️ CRITICAL: MANTENER COMPATIBILIDAD

### ACCESO A PROPIEDADES ESTÁTICAS

El código legacy accede a propiedades con `this.get('HP')`. Debes mantener esto:

```javascript
// Sistema get() debe buscar en:
get(prop) {
    // 1. Instancia primero
    let result = this[prop];
    
    // 2. Fallback a static de la clase
    if (result === undefined) {
        result = this.constructor[prop];
    }
    
    return result;
}
```

### ARRAYS ESTÁTICOS COMPARTIDOS

```javascript
// ANTES (Legacy)
Building.allBuildings = [];
Building.ourBuildings = [];

// DESPUÉS (ES6) - MANTENER en la clase
class Building extends Gobj {
    static allBuildings = [];
    static ourBuildings = [];
    static enemyBuildings = [];
}
```

### PROPIEDADES PRIVADAS

```javascript
// ANTES (Legacy)
var _private = { _timer: -1 };
this.getP = function(attr) {
    return attr ? _private[attr] : _private;
};

// DESPUÉS (ES6)
#privateData = { _timer: -1 };

getP(attr) {
    return attr ? this.#privateData[attr] : this.#privateData;
}

setP(attr, value) {
    this.#privateData[attr] = value;
}
```

---

## 🔧 PERFORMANCE OPTIMIZATIONS

### Cache de Búsquedas
```javascript
// ANTES (Legacy) - O(n) cada vez
condition: function() {
    return Building.ourBuildings.some(function(chara) {
        return chara.name == 'SpawningPool';
    });
}

// DESPUÉS (ES6) - Cache con TTL
class BuildingCache {
    static cache = new Map();
    
    static has(buildingName) {
        if (!this.cache.has(buildingName)) {
            const exists = Building.ourBuildings.some(b => b.name === buildingName);
            this.cache.set(buildingName, exists);
            setTimeout(() => this.cache.delete(buildingName), 100);
        }
        return this.cache.get(buildingName);
    }
}
```

### Lazy Audio Loading
```javascript
// ANTES (Legacy) - Carga inmediata
this.sound.attack = new Audio('bgm/Colony.attack.wav');

// DESPUÉS (ES6) - Lazy loading
this.sound.attack = _$.lazyAudio('bgm/Colony.attack.wav');
```

### Math.hypot para Distancias
```javascript
// ANTES (Legacy)
var dx = this.posX() - tx;
var dy = this.posY() - ty;
return Math.sqrt(dx * dx + dy * dy);

// DESPUÉS (ES6)
return Math.hypot(this.posX() - tx, this.posY() - ty);
```

---

## 📦 CENTRALIZED CONSTANTS

```javascript
// CREAR archivo de constantes
const BUILDING_STATS = {
    HATCHERY: {
        HP: 1250,
        MAN_PLUS: 10,
        COST: { mine: 300, time: 1200 }
    },
    LAIR: {
        HP: 1800,
        MAN_PLUS: 10,
        COST: { mine: 150, gas: 100, time: 1000 }
    }
};

// USAR en clases
class Hatchery extends ZergBuilding {
    static HP = BUILDING_STATS.HATCHERY.HP;
    static cost = BUILDING_STATS.HATCHERY.COST;
}
```

---

## ✅ VALIDATION CHECKLIST

Antes de considerar completa la migración:

- [ ] Todas las propiedades `prototypePlus` convertidas a `static` o métodos
- [ ] `constructorPlus` → `constructor` con `super(props)`
- [ ] `var self = this` eliminado, reemplazado por arrow functions
- [ ] `function() {}` → arrow functions donde sea posible
- [ ] `==` → `===` para comparaciones estrictas
- [ ] `!= undefined` → `!= null` o nullish coalescing `??`
- [ ] `typeof Game !== 'undefined' && Game` → `Game?.`
- [ ] Timers limpiados con `null` en vez de `0` o `-1`
- [ ] Audio con lazy loading cuando sea posible
- [ ] Búsquedas repetitivas optimizadas con cache
- [ ] Acceso a propiedades: `this.constructor.HP` en vez de `this.HP`
- [ ] Arrays estáticos movidos a `static` dentro de la clase
- [ ] Método `get()` actualizado para buscar en `constructor`

---

## 🚫 COMMON PITFALLS

### PITFALL 1: Acceso directo a propiedades estáticas
```javascript
// ❌ MAL - No funcionará si la propiedad es static
if (this.life < this.HP) { }

// ✅ BIEN - Acceso correcto
if (this.life < this.constructor.HP) { }

// ✅ MEJOR - Usando get() legacy
if (this.life < this.get('HP')) { }
```

### PITFALL 2: Timer cleanup
```javascript
// ❌ MAL - Puede causar bugs
this._timer = 0;

// ✅ BIEN - Más explícito
this._timer = null;
```

### PITFALL 3: Condiciones con multiple extends
```javascript
// ❌ MAL - Rompe el sistema de herencia mixins
class MyClass extends BaseClass.extends(Attackable) { }

// ✅ BIEN - Primero migra Attackable a class, luego:
class MyClass extends AttackableBase { }
```

### PITFALL 4: Audio en constructores
```javascript
// ❌ MAL - Crea instancias por cada objeto
constructor() {
    this.sound = new Audio('path.wav'); // ❌
}

// ✅ BIEN - Lazy loading o static
constructor() {
    this.sound = _$.lazyAudio('path.wav'); // ✅
}
```

---

## 📊 MIGRATION WORKFLOW

```
1. ANALYZE
   ├─ Identificar clase base y herencia
   ├─ Listar propiedades static vs instance
   └─ Detectar dependencias circulares

2. MIGRATE BASE FIRST
   ├─ Convertir clase padre primero
   ├─ Mantener sistema get() compatible
   └─ Probar que funciona

3. MIGRATE CHILDREN
   ├─ Convertir subclases una por una
   ├─ Usar constructor con super(props)
   └─ Mover propiedades a static

4. OPTIMIZE
   ├─ Añadir cache donde sea necesario
   ├─ Arrow functions
   └─ Optional chaining

5. TEST
   ├─ Verificar que nada se rompió
   ├─ Probar todas las funcionalidades
   └─ Performance checks
```

---

## 💡 EXAMPLE: FULL CLASS MIGRATION

```javascript
// ============= ANTES (Legacy) =============
var Building = Gobj.extends({
    constructorPlus: function(props) {
        this.id = Unit.currentID++;
        this.isEnemy = Boolean(props.isEnemy);
        this.life = this.get('HP');
        var myself = this;
        setTimeout(function() {
            Building.allBuildings.push(myself);
            myself.dock();
        }, 0);
    },
    prototypePlus: {
        name: "Building",
        HP: 1000,
        armor: 0,
        sight: 385,
        dock: function() {
            this.stop();
            this.status = "dock";
            var myself = this;
            this._timer = setInterval(function() {
                myself.animeFrame();
            }, 100);
        },
        lifeStatus: function() {
            var lifeRatio = this.life / this.get('HP');
            return ((lifeRatio > 0.7) ? "green" : (lifeRatio > 0.3) ? "yellow" : "red");
        }
    }
});
Building.allBuildings = [];

// ============= DESPUÉS (ES6) =============
class Building extends Gobj {
    static allBuildings = [];
    static ourBuildings = [];
    static enemyBuildings = [];
    
    static name = "Building";
    static HP = 1000;
    static armor = 0;
    static sight = 385;
    
    constructor(props) {
        super(props);
        
        this.id = Unit.currentID++;
        this.isEnemy = Boolean(props.isEnemy);
        this.life = this.constructor.HP;
        
        setTimeout(() => {
            Building.allBuildings.push(this);
            this.dock();
        }, 0);
    }
    
    dock() {
        this.stop();
        this.status = "dock";
        this._timer = setInterval(() => this.animeFrame(), 100);
    }
    
    lifeStatus() {
        const lifeRatio = this.life / this.constructor.HP;
        if (lifeRatio > 0.7) return "green";
        if (lifeRatio > 0.3) return "yellow";
        return "red";
    }
}
```

---

## 🎯 FINAL NOTES

- **SIEMPRE prueba después de cada migración**
- **NO cambies lógica**, solo sintaxis
- **Mantén compatibilidad** con `get()` y acceso dinámico
- **Optimiza después**, primero que funcione
- **Documenta** cambios importantes
- Si algo se rompe, **vuelve atrás** y analiza

**REMEMBER**: El objetivo es modernizar sin romper. Prioriza COMPATIBILIDAD sobre elegancia.