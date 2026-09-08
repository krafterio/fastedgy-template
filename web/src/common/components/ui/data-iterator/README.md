# Data Iterator

Les composables d'itération (`useDataIterator`, `useDataTable`, `useDataGrid`, `usePageSize`,
`useSelection`, `useSortable`) vivent dans **vue-fastedgy** : ils sont génériques et parlent à
l'API FastEdgy. Ce dossier ne garde que les composants d'interface de la sélection.

## 🚀 Usage

```javascript
import { useDataIterator } from 'vue-fastedgy';

const {
  items,
  total,
  loading,
  loaded,
  error,
  hasMore,
  loadMore,
  currentPage,
  pageSize,
  totalPages,
  orderBy,
  toggleSort,
  getSortDirection,
  selectedItems,
  selectedCount,
  toggleSelection,
  selectAll,
  deselectAll,
  isSelected,
  refresh,
  exportData,
  importData,
} = useDataIterator('product', {
  fields: ['name', 'price', 'category.name'],
  defaultOrderBy: ['name:asc'],
  filter: [['active', 'is true']],
  enableSelection: true,
});
```

Le premier argument est le **nom de metadata** du modèle (singulier, snake_case) ou un api model
(`useProductApiModel()`), qui porte alors son préfixe et ses en-têtes.

## ⚙️ Options

| Option               | Type              | Default         | Description                                            |
| -------------------- | ----------------- | --------------- | ------------------------------------------------------ |
| `fields`             | `Array<String>`   | -               | Champs lus par l'appelant (`['name', 'type.name']`)    |
| `fieldsResolver`     | `Function\|Array` | -               | Variante calculée des champs                           |
| `pageSize`           | `Number`          | `50`            | Taille de page par défaut                              |
| `availablePageSizes` | `Array<Number>`   | `[25, 50, 100]` | Tailles disponibles                                    |
| `pageSizeKey`        | `String`          | `null`          | Où la taille de page est retenue, nulle part si absent |
| `defaultOrderBy`     | `Array<String>`   | `null`          | Tri par défaut `['field:asc']`                         |
| `exportFields`       | `Array<String>`   | -               | Champs à exporter (sinon les `fields`)                 |
| `filter`             | `Array\|Function` | `null`          | Filtres restrictifs (règles du Query Builder)          |
| `prefix`             | `String`          | `''`            | Préfixe API, quand le modèle est passé par son nom     |
| `headers`            | `Object`          | `null`          | En-têtes personnalisés des requêtes                    |
| `sortable`           | `Boolean`         | `undefined`     | Activer le drag & drop                                 |
| `orderable`          | `Boolean`         | `true`          | Activer le tri des colonnes                            |
| `enableSelection`    | `Boolean`         | `false`         | Activer la sélection                                   |
| `append`             | `Boolean`         | `false`         | Empiler les pages suivantes (`hasMore` / `loadMore`)   |

`useDataTable` et `useDataGrid` sont ce même itérateur avec les defaults de chaque affichage :
`DataTable.vue` et `DataGrid.vue` les appellent, ce sont eux qui portent l'interface.

## ✨ Sélection

```vue
<template>
  <tr v-for="item in items" :key="item.id">
    <td>
      <input type="checkbox" :checked="isSelected(item.id)" @change="toggleSelection(item.id)" />
    </td>
    <td>{{ item.name }}</td>
  </tr>

  <div v-if="selectedCount > 0">
    {{ selectedCount }} éléments sélectionnés
    <button @click="deselectAll">Tout désélectionner</button>
  </div>
</template>
```

- `isSelectionEnabled`: Boolean - Sélection activée ?
- `selectedItems`: Computed Array - IDs des items sélectionnés
- `selectedCount`: Computed Number - Nombre d'items sélectionnés
- `isAllSelected`: Computed Boolean - Tous les items de la page sont sélectionnés ?
- `toggleSelection(itemId)`: Function - Toggle la sélection d'un item
- `selectAll()`: Function - Sélectionner tous les items de la page
- `deselectAll()`: Function - Désélectionner tous les items
- `isSelected(itemId)`: Function - Vérifier si un item est sélectionné

## 🎬 Composant `SelectionActions`

Composant pour afficher des actions sur les éléments sélectionnés avec badge de compteur.

### Utilisation avec props

```vue
<script setup>
import { SelectionActions } from '@/common/components/ui/data-iterator';
import { Trash, Download, Archive } from '@lucide/vue';

const { selection } = useDataTable('products', {
  enableSelection: true,
});

const deleteSelected = (sel) => {
  console.log('Deleting:', sel.ids, sel.all);
  // API call to delete
};

const exportSelected = (sel) => {
  console.log('Exporting:', sel.ids);
  // API call to export
};
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
        handle: deleteSelected,
      },
      {
        name: 'Exporter',
        icon: Download,
        handle: exportSelected,
      },
      { separator: true },
      {
        name: 'Archiver',
        icon: Archive,
        handle: (sel) => console.log('Archive', sel.ids),
        disabled: false,
      },
    ]"
  />
</template>
```

### Utilisation avec slots

```vue
<script setup>
import { SelectionActions, SelectionAction, SelectionSeparator } from '@/common/components/ui/data-iterator';
import { Trash, Download, Archive } from '@lucide/vue';

const { selection } = useDataTable('products', {
  enableSelection: true,
});
</script>

<template>
  <SelectionActions :selection="selection" title="Actions">
    <SelectionAction name="Supprimer" :icon="Trash" @click="(sel) => deleteItems(sel.ids)" />
    <SelectionAction name="Exporter" :icon="Download" @click="(sel) => exportItems(sel.ids, sel.all)" />
    <SelectionSeparator />
    <SelectionAction name="Archiver" :icon="Archive" :disabled="false" @click="(sel) => archiveItems(sel.ids)" />
  </SelectionActions>
</template>
```

### Props

- **`selection`** _(Object, requis)_ : L'objet selection de `useSelection`
- **`title`** _(String, défaut: "Actions")_ : Titre du bouton dropdown (mode multi-actions)
- **`displayCount`** _(Boolean, défaut: true)_ : Afficher le badge avec le nombre de sélections
- **`actions`** _(Array)_ : Liste des actions (optionnel si slots utilisés)

### Structure d'une action

```javascript
{
    name: 'Action name',         // Requis
    icon: IconComponent,         // Optionnel (composant @lucide/vue)
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

| Feature                   | DataTable                        | DataGrid                |
| ------------------------- | -------------------------------- | ----------------------- |
| **Définition des champs** | Colonnes enrichies avec metadata | Array simple de strings |
| **Page size default**     | 100                              | 24                      |
| **Available page sizes**  | [25, 50, 100, 150, 200]          | [12, 24, 48, 96]        |
| **Import**                | ✅ (via iterator)                | ✅ (via iterator)       |
| **Export**                | ✅ (via iterator)                | ✅ (via iterator)       |
| **Tri (order by)**        | ✅ (via iterator)                | ✅ (via iterator)       |
| **Sélection**             | ✅ (via iterator)                | ✅ (via iterator)       |
