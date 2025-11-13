# Data Iterator

Composable de base pour l'itération de données avec pagination côté serveur, filtres et tri.

## 🎯 Objectif

`useDataIterator` est un composable mutualisé qui regroupe toute la logique commune entre `DataTable` et `DataGrid`:
- Pagination côté serveur
- Filtres (restrictifs + personnalisés)
- Tri (order by)
- Export de données
- Import de données
- Réorganisation (drag & drop)
- **Sélection de records** (nouvelle fonctionnalité)

## 📦 Structure

```
data-iterator/
├── useDataIterator.js      # Composable principal
├── usePageSize.js          # Gestion de la taille de page avec localStorage
├── useSortable.js          # Gestion du drag & drop / reséquençage
├── useSelection.js         # Gestion de la sélection de records
├── SelectionActions.vue    # Composant d'actions sur sélection
├── SelectionAction.vue     # Sous-composant d'action
├── SelectionSeparator.vue  # Sous-composant séparateur
├── index.js                # Exports
└── README.md               # Documentation
```

### Composables modulaires

- **`useDataIterator`**: Composable principal qui orchestre la logique d'itération
- **`usePageSize`**: Gère la taille de page avec persistance dans localStorage et URL
- **`useSortable`**: Gère la fonctionnalité de drag & drop pour réorganiser les items
- **`useSelection`**: Gère la sélection de records (individuelle, page, tous les records)

### Composants UI

- **`SelectionActions`**: Bouton/dropdown pour afficher des actions sur les éléments sélectionnés
- **`SelectionAction`**: Sous-composant pour définir une action (utilisation slots)
- **`SelectionSeparator`**: Sous-composant pour ajouter un séparateur entre actions

## 🚀 Usage

### Import

```javascript
import { useDataIterator } from '@/common/components/data-iterator'
```

### Exemple basique

```javascript
const iterator = useDataIterator('products', {
    fieldsResolver: ['name', 'price', 'category'],
    pageSize: 50,
    availablePageSizes: [25, 50, 100],
    defaultOrderBy: ['name:asc'],
    filter: [{ field: 'active', operator: 'eq', value: true }],
    enableSelection: true, // Activer la sélection
})

// Accès aux données
const {
    items,
    total,
    loading,
    error,

    // Pagination
    currentPage,
    pageSize,
    totalPages,

    // Tri
    orderBy,
    toggleSort,
    getSortDirection,

    // Sélection
    selectedItems,
    selectedCount,
    toggleSelection,
    selectAll,
    deselectAll,
    isSelected,

    // Méthodes
    refresh,
    exportData,
    importData,
} = iterator
```

## ⚙️ Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `fieldsResolver` | `Function\|Array` | - | Fonction retournant les champs à récupérer ou array statique |
| `pageSize` | `Number` | `50` | Taille de page par défaut |
| `availablePageSizes` | `Array<Number>` | `[25, 50, 100]` | Tailles disponibles |
| `defaultOrderBy` | `Array<String>` | `null` | Tri par défaut `['field:asc']` |
| `exportFields` | `Array<String>` | - | Champs à exporter (sinon utilise les fields) |
| `filter` | `Array\|Function` | `null` | Filtres restrictifs |
| `prefix` | `String` | `"/{app}"` | Préfixe API |
| `headers` | `Object` | `null` | Headers personnalisés pour les requêtes API |
| `sortable` | `Boolean` | `undefined` | Activer le drag & drop |
| `orderable` | `Boolean` | `true` | Activer le tri des colonnes |
| `enableSelection` | `Boolean` | `false` | Activer la sélection |

## 🔄 Utilisation dans les composables spécialisés

### useDataTable

```javascript
export function useDataTable(modelName, options = {}) {
    const metadataStore = useMetadataStore();

    // Enrichir les colonnes avec metadata
    const enrichedColumns = computed(() => {
        // ... logique d'enrichissement
    });

    // Résolveur de champs pour l'itérateur
    const fieldsResolver = () => {
        return enrichedColumns.value.map(col => col.key);
    };

    // Utiliser l'itérateur avec les defaults de DataTable
    const iterator = useDataIterator(modelName, {
        ...options,
        fieldsResolver,
        pageSize: options.pageSize || 100,
        availablePageSizes: options.availablePageSizes || [25, 50, 100, 150, 200],
    });

    return {
        ...iterator,
        columns: enrichedColumns, // Spécifique à DataTable
    };
}
```

### useDataGrid

```javascript
export function useDataGrid(modelName, options = {}) {
    // Résolveur simple pour DataGrid
    const fieldsResolver = () => {
        return options.fields || [];
    };

    // Utiliser l'itérateur avec les defaults de DataGrid
    return useDataIterator(modelName, {
        ...options,
        fieldsResolver,
        pageSize: options.pageSize || 24,
        availablePageSizes: options.availablePageSizes || [12, 24, 48, 96],
    });
}
```

## ✨ Fonctionnalité de sélection

La sélection de records est maintenant intégrée dans `useDataIterator`:

```javascript
// Activer la sélection
const iterator = useDataIterator('products', {
    fieldsResolver: ['name', 'price'],
    enableSelection: true,
})

// Dans le template
<template>
  <tr v-for="item in items" :key="item.id">
    <td>
      <input
        type="checkbox"
        :checked="isSelected(item.id)"
        @change="toggleSelection(item.id)"
      />
    </td>
    <td>{{ item.name }}</td>
  </tr>

  <!-- Actions groupées -->
  <div v-if="selectedCount > 0">
    {{ selectedCount }} items sélectionnés
    <button @click="deselectAll">Tout désélectionner</button>
  </div>
</template>
```

### API de sélection

- `isSelectionEnabled`: Boolean - Sélection activée ?
- `selectedItems`: Computed Array - IDs des items sélectionnés
- `selectedCount`: Computed Number - Nombre d'items sélectionnés
- `isAllSelected`: Computed Boolean - Tous les items de la page sont sélectionnés ?
- `toggleSelection(itemId)`: Function - Toggle la sélection d'un item
- `selectAll()`: Function - Sélectionner tous les items de la page
- `deselectAll()`: Function - Désélectionner tous les items
- `isSelected(itemId)`: Function - Vérifier si un item est sélectionné

## 🎨 Avantages

1. **Code mutualisé**: ~90% du code est maintenant partagé
2. **Maintenabilité**: Une seule source de vérité pour la logique commune
3. **Cohérence**: Comportement identique entre DataTable et DataGrid
4. **Extensibilité**: Facile d'ajouter de nouvelles fonctionnalités (ex: sélection)
5. **Override facile**: Les defaults peuvent être overridés par les composables spécialisés

## 🔧 Composables modulaires

### `usePageSize`

Gère la taille de page avec persistance dans localStorage et synchronisation avec l'URL.

```javascript
import { usePageSize } from '@/common/components/data-iterator'

const pageSize = usePageSize(
    route.query.s,              // Valeur depuis l'URL
    [25, 50, 100],              // Tailles disponibles
    50                          // Taille par défaut
)

// pageSize est un ref qui se synchronise automatiquement avec localStorage et l'URL
console.log(pageSize.value) // 50
```

### `useSortable`

Gère la fonctionnalité de drag & drop pour réorganiser les items.

```javascript
import { useSortable } from '@/common/components/data-iterator'

const metadata = metadataStore.getMetadata('products')
const { isSortable, sortableField, resequence } = useSortable(
    'products',     // Nom du modèle
    metadata,       // Metadata du modèle
    true            // Configuration sortable (peut être undefined)
)

// Vérifier si le modèle est sortable
if (isSortable.value) {
    // Réorganiser les items
    await resequence([3, 1, 2, 4]) // Nouvel ordre des IDs
}

// Obtenir le champ de séquence
console.log(sortableField.value) // 'sequence' (par défaut) ou champ personnalisé
```

**Configuration**:
- Si `sortable` est `undefined`: utilise `metadata.sortable`
- Si `sortable` est `true`: force l'activation
- Si `sortable` est `false`: désactive

**Champ de séquence**:
- Par défaut: `'sequence'`
- Personnalisable via `metadata.sortable_field`

### `useSelection`

Gère la sélection de records avec support pour sélection individuelle, page complète et tous les records.

```javascript
import { useSelection } from '@/common/components/data-iterator'

const items = ref([
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
])
const total = ref(100)

const { isSelectionEnabled, selection } = useSelection({
    enabled: true,      // Activer la sélection
    items,              // Ref des items actuels
    total,              // Ref du nombre total
})

// Sélectionner un item
selection.toggle(1)

// Vérifier si un item est sélectionné
if (selection.has(1)) {
    console.log('Item 1 is selected')
}

// Ajouter plusieurs items
selection.add([1, 2, 3])

// Retirer des items
selection.remove([2, 3])

// Sélectionner tous les items visibles
selection.selectAllVisible()

// Vérifier si tous les items visibles sont sélectionnés
if (selection.isAllVisibleSelected) {
    console.log('All visible items are selected')
}

// Passer en mode "tout sélectionner" (tous les records, même non visibles)
if (selection.shouldShowSelectAllButton) {
    selection.toggleAll() // Active le mode "all"
}

// Accéder aux IDs sélectionnés
console.log(selection.ids) // [1, 2, 3]

// Nombre d'items sélectionnés
console.log(selection.count) // 3 (ou total si mode "all")

// Effacer la sélection
selection.clear()
```

**API de l'objet `selection`**:
- **`ids`** *(get/set)*: Array des IDs sélectionnés
- **`all`** *(get/set)*: Boolean, mode "tous les records"
- **`count`** *(get)*: Nombre d'items sélectionnés
- **`isAllVisibleSelected`** *(get)*: Tous les items visibles sont-ils sélectionnés ?
- **`shouldShowSelectAllButton`** *(get)*: Doit-on afficher le bouton "Tout" ?
- **`add(ids)`**: Ajouter un ou plusieurs IDs
- **`remove(ids)`**: Retirer un ou plusieurs IDs
- **`has(id)`**: Vérifier si un ID est sélectionné
- **`clear()`**: Réinitialiser la sélection
- **`toggle(id)`**: Basculer la sélection d'un item
- **`selectAllVisible()`**: Sélectionner tous les items visibles
- **`toggleAll()`**: Basculer le mode "tous les records"

**Comportement "Select All"**:
1. L'utilisateur coche tous les items de la page → `isAllVisibleSelected = true`
2. Si d'autres pages existent → `shouldShowSelectAllButton = true` → Afficher le bouton "Tout"
3. L'utilisateur clique sur "Tout" → `all = true` → Tous les records sont considérés sélectionnés
4. En mode `all = true`, `selection.has(id)` retourne toujours `true`

## 🎬 Composant `SelectionActions`

Composant pour afficher des actions sur les éléments sélectionnés avec badge de compteur.

### Utilisation avec props

```vue
<script setup>
import { SelectionActions } from '@/common/components/data-iterator'
import { Trash, Download, Archive } from 'lucide-vue-next'

const { selection } = useDataTable('products', {
    enableSelection: true
})

const deleteSelected = (sel) => {
    console.log('Deleting:', sel.ids, sel.all)
    // API call to delete
}

const exportSelected = (sel) => {
    console.log('Exporting:', sel.ids)
    // API call to export
}
</script>

<template>
    <SelectionActions
        :selection="selection"
        title="Actions"
        :display-count="true"
        :actions="[
            {
                name: 'Supprimer',
                icon: Trash,
                handle: deleteSelected
            },
            {
                name: 'Exporter',
                icon: Download,
                handle: exportSelected
            },
            { separator: true },
            {
                name: 'Archiver',
                icon: Archive,
                handle: (sel) => console.log('Archive', sel.ids),
                disabled: false
            }
        ]"
    />
</template>
```

### Utilisation avec slots

```vue
<script setup>
import {
    SelectionActions,
    SelectionAction,
    SelectionSeparator
} from '@/common/components/data-iterator'
import { Trash, Download, Archive } from 'lucide-vue-next'

const { selection } = useDataTable('products', {
    enableSelection: true
})
</script>

<template>
    <SelectionActions :selection="selection" title="Actions">
        <SelectionAction
            name="Supprimer"
            :icon="Trash"
            @click="(sel) => deleteItems(sel.ids)"
        />
        <SelectionAction
            name="Exporter"
            :icon="Download"
            @click="(sel) => exportItems(sel.ids, sel.all)"
        />
        <SelectionSeparator />
        <SelectionAction
            name="Archiver"
            :icon="Archive"
            :disabled="false"
            @click="(sel) => archiveItems(sel.ids)"
        />
    </SelectionActions>
</template>
```

### Props

- **`selection`** *(Object, requis)* : L'objet selection de `useSelection`
- **`title`** *(String, défaut: "Actions")* : Titre du bouton dropdown (mode multi-actions)
- **`displayCount`** *(Boolean, défaut: true)* : Afficher le badge avec le nombre de sélections
- **`actions`** *(Array)* : Liste des actions (optionnel si slots utilisés)

### Structure d'une action

```javascript
{
    name: 'Action name',         // Requis
    icon: IconComponent,         // Optionnel (composant lucide-vue-next)
    handle: (selection) => {},   // Requis - Fonction callback recevant selection
    disabled: false,             // Optionnel
    separator: false             // Optionnel - Si true, affiche un séparateur
}
```

### Comportement d'affichage

**1 seule action** : Affiche un simple bouton
```
[Icon] Action Name  20  X
```

**Plusieurs actions** : Affiche un dropdown
```
[Icon] Actions  20 | X  ▼
  └─ [Icon] Action 1
     [Icon] Action 2
     ──────────────
     [Icon] Action 3 (disabled)
```

- L'**icône principale** (optionnelle) s'affiche à gauche
- Le **badge rond** affiche le nombre d'éléments sélectionnés
- Le **bouton X** séparé permet de réinitialiser la sélection (`selection.clear()`)
- L'icône X change de couleur au survol pour indiquer qu'elle est cliquable

### Personnalisation de l'icône principale

**Mode simple** : L'icône est définie dans l'action
```javascript
{
    name: 'Supprimer',
    icon: Trash,  // Icône affichée
    handle: (sel) => deleteItems(sel.ids)
}
```

**Mode dropdown** : Utilisez le slot `icon`
```vue
<SelectionActions :selection="selection">
    <template #icon>
        <Settings class="w-4 h-4" />
    </template>

    <SelectionAction name="Action 1" @click="..." />
    <SelectionAction name="Action 2" @click="..." />
</SelectionActions>
```

## 🔍 Différences DataTable vs DataGrid

| Feature | DataTable | DataGrid |
|---------|-----------|----------|
| **Définition des champs** | Colonnes enrichies avec metadata | Array simple de strings |
| **Page size default** | 100 | 24 |
| **Available page sizes** | [25, 50, 100, 150, 200] | [12, 24, 48, 96] |
| **Import** | ✅ (via iterator) | ✅ (via iterator) |
| **Export** | ✅ (via iterator) | ✅ (via iterator) |
| **Tri (order by)** | ✅ (via iterator) | ✅ (via iterator) |
| **Sélection** | ✅ (via iterator) | ✅ (via iterator) |

## 📝 Migration

Les composables `useDataTable` et `useDataGrid` conservent leur API publique.
Aucun changement n'est nécessaire dans les composants qui les utilisent.
