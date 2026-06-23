# DataGrid Component

Composant générique d'affichage en grille avec support complet des fonctionnalités FastEdgy :

- Pagination côté serveur
- Tri via dropdown
- Filtres via Query Builder
- Sélection de champs (X-Fields)
- Slots de personnalisation
- Drag & drop pour réorganisation

## 📦 Installation

Le composant est déjà disponible dans `@/common/components/data-grid`.

```javascript
import { DataGrid } from '@/common/components/data-grid';
```

## 🚀 Usage basique

```vue
<template>
  <DataGrid
    model-name="aliments"
    :fields="['id', 'name', 'image']"
    :sort-options="sortOptions"
    default-sort="name:asc"
    :grid-cols="4"
    @item-click="handleClick"
  >
    <template #item-content="{ item }">
      <div class="h-32 bg-muted flex items-center justify-center">
        <img :src="item.image" :alt="item.name" class="w-full h-full object-cover" />
      </div>
      <div class="p-4">
        <h3 class="font-semibold">{{ item.name }}</h3>
      </div>
    </template>

    <template #item-actions="{ item }">
      <DropdownMenuItem @click="edit(item)">
        <Edit class="w-4 h-4" />
        Modifier
      </DropdownMenuItem>
    </template>
  </DataGrid>
</template>

<script setup>
import { DataGrid } from '@/common/components/data-grid';
import { DropdownMenuItem } from '@/common/components/ui/dropdown-menu';
import { Edit } from 'lucide-vue-next';

const sortOptions = [
  { label: 'Nom', value: 'name:asc' },
  { label: 'Date de création', value: 'created_at:asc' },
];

const handleClick = (item) => {
  console.log('Clicked:', item);
};

const edit = (item) => {
  console.log('Edit:', item);
};
</script>
```

## 📋 Props

### `model-name` (requis)

Type: `String`

Nom du modèle API (ex: `'loyalty_card_template'`, `'product'`)

### `fields` (requis)

Type: `Array<string>`

Liste des champs à récupérer depuis l'API :

```javascript
:fields="['id', 'name', 'logo', 'color', 'created_at']"
```

**Note**: Le champ `id` est automatiquement ajouté s'il n'est pas présent.

### `sort-options`

Type: `Array<SortOption>`
Default: `[]`

Options de tri disponibles dans le dropdown. **Pas besoin de doubler les champs** - chaque champ est unique et cliquable pour changer l'ordre :

```javascript
const sortOptions = [
  { label: 'Nom', value: 'name:asc' },
  { label: 'Date de création', value: 'created_at:asc' },
];
```

**Comportement** :

- Au clic sur un champ : toggle entre asc (↑) et desc (↓)
- Le bouton affiche l'icône de direction actuelle
- Seul le label du champ est nécessaire (sans "(A-Z)" ou "(Z-A)")

**Structure d'une option** :

- `label` (string, requis): Nom du champ (ex: `'Nom'`, `'Date de création'`)
- `value` (string, requis): Format `field:direction` - la direction par défaut au premier clic (ex: `'name:asc'`)

### `default-sort`

Type: `String`
Default: `null`

Tri par défaut au format `field:direction` :

```vue
<DataGrid default-sort="created_at:desc" />
```

### `page-size`

Type: `Number`
Default: `24`

Nombre d'éléments par page par défaut. La valeur sélectionnée est automatiquement sauvegardée dans localStorage.

### `available-page-sizes`

Type: `Array<number>`
Default: `[12, 24, 48, 96]`

Options disponibles dans le sélecteur de taille de page :

```vue
<DataGrid :available-page-sizes="[24, 48, 96]" :page-size="48" />
```

### `sortable`

Type: `Boolean | undefined`
Default: `undefined`

Active le drag & drop pour réorganiser les éléments.

**Comportement** :

- `true`: Active le drag & drop
- `false`: Désactive le drag & drop
- `undefined`: Auto-détection via metadata (`metadata.sortable === true`)

**Auto-détection** :
Si `sortable === undefined`, le composant vérifie automatiquement si le modèle supporte la réorganisation via les métadonnées FastEdgy.

### `export-filename`

Type: `String`
Default: `'export'`

Nom de base du fichier d'export (sans extension ni timestamp).

### `export-fields`

Type: `Array<string>`
Default: `null`

Liste des champs à exporter. Si non défini, utilise les champs de `fields`.

### `filter`

Type: `Array`
Default: `null`

Filtre restrictif toujours appliqué (combiné avec les filtres custom) :

```vue
<DataGrid :filter="[['is_active', '=', true]]" />
```

### `grid-cols`

Type: `Number`
Default: `4`

Nombre de colonnes dans la grille (pour les grands écrans). La grille est **progressive et fluide** avec des breakpoints optimisés :

**Pour `grid-cols="6"` :**

- **< 640px** : 1 colonne
- **≥ 640px (sm)** : 2 colonnes
- **≥ 768px (md)** : 3 colonnes
- **≥ 1024px (lg)** : 4 colonnes
- **≥ 1280px (xl)** : 5 colonnes
- **≥ 1536px (2xl)** : 6 colonnes

**Pour `grid-cols="4"` :**

- **< 640px** : 1 colonne
- **≥ 640px (sm)** : 2 colonnes
- **≥ 768px (md)** : 3 colonnes
- **≥ 1024px (lg)** : 4 colonnes

La progression s'adapte automatiquement au nombre de colonnes défini.

## 🎨 Slots

### `item-content` (requis)

Slot pour personnaliser le contenu de chaque carte. Expose `{ item }`.

**La Card est intégrée automatiquement** - vous n'avez qu'à fournir le contenu :

```vue
<template #item-content="{ item }">
  <div class="h-40 bg-muted flex items-center justify-center">
    <img :src="item.logo" :alt="item.name" class="w-full h-full object-cover" />
  </div>
  <div class="p-4">
    <h3 class="font-semibold">{{ item.name }}</h3>
    <p class="text-sm text-muted-foreground">{{ item.description }}</p>
  </div>
</template>
```

**Fonctionnalités intégrées** :

- ✅ Card avec `cursor-pointer` automatique
- ✅ Événement `@item-click` émis au clic sur la carte
- ✅ Dropdown menu (si `item-actions` slot fourni)
- ✅ Poignée de drag (si `sortable` activé, visible au survol en haut à gauche)

### `item-actions` (optionnel)

Slot pour les actions du dropdown menu. Expose `{ item }`.

**Le DropdownMenu est géré automatiquement** - vous fournissez uniquement les items :

```vue
<template #item-actions="{ item }">
  <DropdownMenuItem @click="edit(item)">
    <Edit class="w-4 h-4" />
    Modifier
  </DropdownMenuItem>
  <DropdownMenuSeparator />
  <DropdownMenuItem @click="deleteItem(item)" class="text-destructive focus:text-destructive">
    <Trash2 class="w-4 h-4" />
    Supprimer
  </DropdownMenuItem>
</template>
```

**Note** : Le bouton du dropdown (⋮) apparaît automatiquement en haut à droite au survol si ce slot est fourni.

### `filters`

Slot pour filtres personnalisés. Expose `{ updateFilter }` :

```vue
<template #filters="{ updateFilter }">
  <SimpleSearchInput
    :update-filter="updateFilter"
    :build-filter="(value) => ['name', 'contains', value]"
    placeholder="Rechercher..."
  />
</template>
```

### `actions`

Slot pour actions supplémentaires dans la toolbar. Expose `{ handleExport, refresh }` :

```vue
<template #actions="{ handleExport, refresh }">
  <Button @click="handleExport('csv')">
    <Download class="w-4 h-4 mr-2" />
    Exporter CSV
  </Button>

  <Button variant="outline" @click="refresh">
    <RefreshCw class="w-4 h-4 mr-2" />
    Rafraîchir
  </Button>
</template>
```

### `empty`

Slot pour l'état vide :

```vue
<template #empty>
  <div class="text-center p-10">
    <h3 class="text-lg font-medium">Aucune donnée</h3>
    <p class="text-sm text-muted-foreground">Créez votre premier élément pour commencer</p>
    <Button @click="create">Créer</Button>
  </div>
</template>
```

## 🔍 Composant helper : SimpleSearchInput

Pour simplifier les recherches simples, utilisez le composant `SimpleSearchInput` :

```vue
<script setup>
import { DataGrid, SimpleSearchInput } from '@/common/components/data-grid';
</script>

<template>
  <DataGrid>
    <template #filters="{ updateFilter }">
      <SimpleSearchInput
        :update-filter="updateFilter"
        :build-filter="(value) => ['name', 'contains', value]"
        placeholder="Rechercher par nom..."
      />
    </template>
  </DataGrid>
</template>
```

**Props** :

- `update-filter` (Function, requis): La fonction `updateFilter` exposée par le slot
- `build-filter` (Function, requis): Fonction qui construit le filtre FastEdgy depuis la valeur de recherche
- `placeholder` (String, default: 'Search...'): Placeholder de l'input

## 🔄 Tri

Le tri est géré via un **dropdown intelligent** qui affiche chaque champ une seule fois :

```javascript
const sortOptions = [
  { label: 'Nom', value: 'name:asc' },
  { label: 'Date de création', value: 'created_at:asc' },
];
```

**Fonctionnement** :

1. Cliquer sur un champ → trie par ce champ (asc par défaut)
2. Re-cliquer sur le même champ → inverse la direction (asc ↔ desc)
3. Le bouton affiche le champ actuel + son icône de direction (↑ ou ↓)
4. Les champs non sélectionnés affichent l'icône ⇅

**Comportement** :

- ✅ Synchronisation avec l'URL (`?order_by=name:asc`)
- ✅ Restauration au chargement si présent dans l'URL
- ✅ Indicateurs visuels clairs (↑ asc, ↓ desc, ⇅ non sélectionné)

## 🔄 Drag & Drop

Lorsque activé, permet la réorganisation manuelle des éléments :

**Fonctionnalités** :

- Poignée visuelle (⋮⋮) en haut à droite de chaque carte (visible au survol)
- Animation fluide (200ms)
- Sauvegarde auto sur le serveur via `/api/dataset/resequence`
- Rafraîchissement auto après succès
- État de chargement pendant la sauvegarde

**Prérequis** :
Le modèle doit avoir :

- `metadata.sortable = true`
- `metadata.sortable_field` défini (ex: `"sequence"`)

**Exemple** :

```vue
<DataGrid model-name="product" :fields="fields" :sortable="true" />
```

## 📊 Pagination

Le footer de pagination inclut :

- **Compteur d'éléments**: "Showing 1 to 24 of 150 results" (gauche)
- **Sélecteur de taille**: Dropdown compact (défaut: 12, 24, 48, 96) (droite)
- **Navigation**: Boutons Précédent/Suivant + numéros de pages (max 5 pages visibles) (droite)

**Synchronisation URL** :

- Paramètres `p` (page) et `s` (taille) automatiquement ajoutés à l'URL
- Restauration au chargement
- URLs propres: `p=1` omis

**Priorité taille de page** :

1. **Query param** (`?s=48`) - priorité absolue
2. **LocalStorage** (`datagrid-page-size`) - préférence utilisateur
3. **Prop par défaut** (`page-size="24"`) - fallback

## 🔄 Méthodes exposées

Utilisez `ref` pour accéder aux méthodes :

```vue
<template>
  <DataGrid ref="gridRef" ... />
  <Button @click="refresh">Rafraîchir</Button>
</template>

<script setup>
const gridRef = ref(null);

const refresh = () => {
  gridRef.value?.refresh();
};
</script>
```

### `refresh()`

Rafraîchit les données depuis le serveur.

### `exportData(format)`

Exporte les données avec les filtres et tri actuels.

**Paramètres** :

- `format`: `'csv'` | `'xlsx'` | `'json'` (défaut: `'csv'`)

**Retourne**: `Promise<Blob>` - Le fichier exporté

### `total`

Propriété exposée contenant le nombre total d'éléments.

## 📤 Événements

### `@item-click`

Émis lors du clic sur une carte :

```vue
<DataGrid @item-click="handleItemClick" />

<script setup>
const handleItemClick = (item) => {
  console.log('Item clicked:', item);
  // Naviguer, ouvrir un dialog, etc.
};
</script>
```

## 🌟 Exemple complet

```vue
<template>
  <DataGrid
    model-name="aliments"
    :fields="['id', 'name', 'image', 'created_at']"
    :sort-options="sortOptions"
    default-sort="name:asc"
    :grid-cols="6"
    :page-size="24"
    export-filename="aliments"
    @item-click="openEditDialog"
  >
    <template #filters="{ updateFilter }">
      <SimpleSearchInput
        :update-filter="updateFilter"
        :build-filter="(value) => ['name', 'icontains', value]"
        placeholder="Rechercher un aliment..."
      />
    </template>

    <template #actions="{ handleExport, refresh }">
      <Button variant="outline" @click="handleExport('xlsx')">
        <Download class="w-4 h-4" />
        Exporter
      </Button>

      <Button @click="openCreateDialog">
        <Plus class="w-4 h-4" />
        Ajouter
      </Button>
    </template>

    <template #item-content="{ item }">
      <div class="h-40 bg-muted flex items-center justify-center">
        <img v-if="item.image" :src="getImageUrl(item.image)" :alt="item.name" class="w-full h-full object-cover" />
        <ShoppingCart v-else class="w-12 h-12 text-muted-foreground" />
      </div>
      <div class="p-4">
        <h3 class="font-semibold truncate mb-1">{{ item.name }}</h3>
        <p class="text-xs text-muted-foreground">{{ formatDate(item.created_at) }}</p>
      </div>
    </template>

    <template #item-actions="{ item }">
      <DropdownMenuItem @click="openEditDialog(item)">
        <Edit class="w-4 h-4" />
        Modifier
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem @click="deleteItem(item)" class="text-destructive focus:text-destructive">
        <Trash2 class="w-4 h-4" />
        Supprimer
      </DropdownMenuItem>
    </template>

    <template #empty>
      <div class="text-center">
        <ShoppingCart class="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p class="text-lg font-medium mb-2">Aucun aliment</p>
        <p class="text-sm text-muted-foreground mb-4">Créez votre premier aliment pour commencer</p>
        <Button @click="openCreateDialog">
          <Plus class="w-4 h-4 mr-2" />
          Créer un aliment
        </Button>
      </div>
    </template>
  </DataGrid>
</template>

<script setup>
import { DataGrid, SimpleSearchInput } from '@/common/components/data-grid';
import { Button } from '@/common/components/ui/button';
import { DropdownMenuItem, DropdownMenuSeparator } from '@/common/components/ui/dropdown-menu';
import { Download, Plus, Edit, Trash2, ShoppingCart } from 'lucide-vue-next';

const sortOptions = [
  { label: 'Nom', value: 'name:asc' },
  { label: 'Date de création', value: 'created_at:asc' },
];

const openEditDialog = (item) => {
  console.log('Edit:', item);
};

const deleteItem = (item) => {
  console.log('Delete:', item);
};

const openCreateDialog = () => {
  console.log('Create new');
};

const getImageUrl = (path) => (path ? `/storage/download/${path}` : null);

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('fr-FR');
};
</script>
```

## 🔍 Fonctionnalités FastEdgy utilisées

- **Pagination**: `limit` et `offset` via `page` et `size`
- **Tri**: `order_by` avec support de la notation dot
- **Filtres**: Header `X-Filter` avec Query Builder
- **Sélection de champs**: Header automatique `X-Fields` depuis fields
- **Réorganisation**: Drag & drop avec endpoint `/api/dataset/resequence`
