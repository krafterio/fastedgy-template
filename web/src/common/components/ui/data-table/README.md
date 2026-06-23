# DataTable Component

Generic data table component with full FastEdgy features support:

- Server-side pagination
- Multi-column sorting
- Filters via Query Builder
- Field selection (X-Fields)
- Customization slots
- Drag & drop reordering

## 📦 Installation

The component is already available in `@/common/components/data-table`.

```javascript
import { DataTable } from '@/common/components/data-table';
```

## 🚀 Basic Usage

```vue
<template>
  <DataTable model-name="retail_chains" :columns="columns" />
</template>

<script setup>
import { DataTable } from '@/common/components/data-table';

const columns = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'created_at', label: 'Created at', sortable: true, type: 'date' },
];
</script>
```

## 📋 Props

### `model-name` (required)

Type: `String`

API model name (e.g., `'retail_chains'`, `'tasks'`)

### `columns` (required)

Type: `Array<ColumnDef>`

Column definitions:

```javascript
{
  key: string,              // Field (supports dot notation: 'user.name')
  label: string,            // Column label
  sortable?: boolean | string, // Enable sorting (auto-detected from metadata if not specified)
                            // - true: uses column key for API sorting
                            // - false: disables sorting
                            // - string: custom API path for sorting (e.g., 'company.zip')
  type?: string,            // Type: 'string' | 'number' | 'date' | 'datetime' | 'boolean' | 'currency' (auto-detected from metadata if not specified)
  width?: string,           // CSS width (e.g., '80px')
  align?: string,           // Alignment: 'left' | 'center' | 'right'
  currency?: string         // Currency if type='currency' (default: 'EUR')
}
```

**🤖 Auto-detection from Metadata**:

- If `sortable` is not defined, it's automatically detected from FastEdgy metadata
- If `type` is not defined, it's automatically detected from FastEdgy metadata
- For **nested fields** (`user.name`), the system recursively follows relations via `target`
- You can always override manually by explicitly specifying `sortable` or `type`

**📝 Custom Sort Paths**:

When displaying nested data, you may need to sort by a different API path than the display field. Use a string value for `sortable`:

```javascript
const columns = [
  {
    key: 'companyZip', // Display field
    label: 'Code postal',
    sortable: 'company.zip', // API sort path (different from display key)
  },
  {
    key: 'name',
    label: 'Nom',
    sortable: true, // Uses 'name' for sorting (default behavior)
  },
  {
    key: 'logo',
    label: 'Logo',
    sortable: false, // Not sortable
  },
];
```

### `additional-fields`

Type: `Array<string>`
Default: `[]`

Additional fields to fetch via X-Fields but not displayed:

```vue
<DataTable :additional-fields="['logo', 'metadata']" />
```

### `page-size`

Type: `Number`
Default: `100`

Default number of items per page. The value selected by the user is automatically saved in localStorage and reused across all application pages.

### `available-page-sizes`

Type: `Array<number>`
Default: `[25, 50, 100, 150, 200]`

Options available in the page size selector:

```vue
<DataTable :available-page-sizes="[50, 100, 200, 500]" :page-size="100" />
```

### `default-order-by`

Type: `Array<string>`

Default sorting (supports multi-column sorting):

```javascript
['created_at:desc', 'name:asc'];
```

### `actions`

Type: `Array<ActionDef>`

Per-row actions available in a dropdown menu. Two approaches possible:

**Recommended approach: with `handler`** (direct function)

```javascript
const actions = [
  {
    label: 'Edit',
    icon: Edit,
    handler: (row) => editItem(row),
  },
  { separator: true }, // Dedicated separator
  {
    label: 'Delete',
    icon: Trash2,
    variant: 'destructive',
    handler: (row) => deleteItem(row),
  },
];
```

**Alternative approach: with `action`** (event emission)

```javascript
const actions = [
  {
    action: 'edit',
    label: 'Edit',
    icon: Edit
  },
  { separator: true },  // Dedicated separator
  {
    action: 'delete',
    label: 'Delete',
    icon: Trash2,
    variant: 'destructive'
  }
]

// Then in the template
<DataTable :actions="actions" @row-action="handleAction" />

// And the handler
const handleAction = ({ action, row }) => {
  if (action === 'edit') editItem(row)
  else if (action === 'delete') deleteItem(row)
}
```

**Action props**:

- `label` (string, required): Displayed text
- `icon` (Component, required): Lucide icon
- `handler` (Function, optional): Function called on click with `(row)` parameter
- `action` (string, optional): Identifier if using `row-action` event
- `variant` (string, optional): Style ('destructive' for dangerous actions)

**Separator item**:
To add a visual separator between actions, simply use `{ separator: true }` as an item in the array.

### `row-clickable`

Type: `Boolean`
Default: `false`

Make rows clickable (emits `row-click` event).

### `sortable`

Type: `Boolean | undefined`
Default: `undefined`

Enables drag & drop reordering.

**Behavior**:

- `true`: Enables drag & drop (uses `sortable_field` from metadata)
- `false`: Disables drag & drop
- `undefined`: Auto-detection via metadata (`metadata.sortable === true`)

**Auto-detection**:
If `sortable === undefined`, the component automatically checks if the model supports reordering:

1. Retrieves `metadata.sortable` (boolean)
2. If `true`, retrieves `metadata.sortable_field` (e.g., `"sequence"`)
3. Automatically enables drag & drop

**API Endpoint**:
Uses `PUT /api/dataset/resequence` with:

```javascript
{
  model_name: 'task',        // Metadata name
  ids: [3, 1, 2, 4],        // New order of IDs
  sequence_field: 'sequence' // From metadata.sortable_field
}
```

**Example**:

```vue
<DataTable model-name="task" :columns="columns" :sortable="true" :orderable="false" />
```

### `orderable`

Type: `Boolean`
Default: `true`

Enables column sorting (click on headers).

**Behavior**:

- `true`: Columns marked `sortable: true` are clickable to sort
- `false`: Disables column sorting (useful when `sortable=true` to avoid conflicts)

**Use cases**:

- `orderable=true` + `sortable=false`: Column sorting only (default)
- `orderable=false` + `sortable=true`: Manual reordering only
- Both `true`: Possible but may create confusion

### `export-filename`

Type: `String`
Default: `'export'`

Base name for export file (without extension or timestamp). The final file will be named `{export-filename}-{YYYY-MM-DD}.{format}`.

### `export-fields`

Type: `Array<string>`
Default: `null`

List of fields to export. If not defined, uses the table column fields. Useful for exporting more fields than displayed.

**Example**:

```vue
<DataTable
  model-name="retail_chain"
  :columns="[
    { key: 'name', label: 'Name' },
    { key: 'created_at', label: 'Date' },
  ]"
  :export-fields="['id', 'name', 'logo', 'created_at', 'updated_at']"
  export-filename="retail-chains"
/>
```

## 🎨 Slots

### `filters`

Slot for custom filters. Exposes `{ updateFilter }`:

```vue
<script setup>
import { ref } from 'vue';

const searchQuery = ref('');
</script>

<template>
  <DataTable>
    <template #filters="{ updateFilter }">
      <Input
        v-model="searchQuery"
        @input="updateFilter(searchQuery ? ['name', 'contains', searchQuery] : null)"
        placeholder="Search..."
      />

      <Button v-if="searchQuery" @click="searchQuery = ''"> Reset </Button>
    </template>
  </DataTable>
</template>
```

The `updateFilter(filter)` function accepts FastEdgy Query Builder syntax:

```javascript
// Simple filter
updateFilter(['name', 'contains', 'test']);

// Multiple filters with AND
updateFilter([
  '&',
  [
    ['name', 'contains', 'test'],
    ['status', '=', 'active'],
  ],
]);

// Multiple filters with OR
updateFilter([
  '|',
  [
    ['status', '=', 'todo'],
    ['status', '=', 'in_progress'],
  ],
]);

// Reset filter
updateFilter(null);
```

#### Helper component `SimpleSearchInput`

To simplify simple searches, use the `SimpleSearchInput` component:

```vue
<script setup>
import { DataTable, SimpleSearchInput } from '@/common/components/data-table';
</script>

<template>
  <DataTable>
    <template #filters="{ updateFilter }">
      <SimpleSearchInput
        :update-filter="updateFilter"
        :build-filter="(value) => ['name', 'contains', value]"
        placeholder="Search by name..."
      />
    </template>
  </DataTable>
</template>
```

**Props**:

- `update-filter` (Function, required): The `updateFilter` function exposed by the slot
- `build-filter` (Function, required): Function that builds the FastEdgy filter from the search value
- `placeholder` (String, default: 'Search...'): Input placeholder

**💡 Advantages**:

- ✅ **Ready to use**: Input + search icon + reset button
- ✅ **Zero boilerplate**: No need to manage `searchQuery`, the component handles it
- ✅ **Flexible**: Customize filter logic with `build-filter`

**`build-filter` examples**:

```javascript
// "contains" search
:build-filter="(value) => ['name', 'contains', value]"

// "startswith" search
:build-filter="(value) => ['email', 'startswith', value]"

// Multiple filter with AND
:build-filter="(value) => ['&', [
  ['name', 'contains', value],
  ['status', '=', 'active']
]]"
```

### `actions`

Slot for additional actions in the toolbar. Exposes `{ handleExport, refresh }`:

```vue
<DataTable model-name="retail_chain" :columns="columns" export-filename="retail-chains">
  <template #actions="{ handleExport, refresh }">
    <Button @click="handleExport('csv')">
      <Download class="w-4 h-4 mr-2" />
      Export CSV
    </Button>

    <Button @click="handleExport('xlsx')">
      <FileSpreadsheet class="w-4 h-4 mr-2" />
      Export Excel
    </Button>

    <Button variant="outline" @click="refresh">
      <RefreshCw class="w-4 h-4 mr-2" />
      Refresh
    </Button>
  </template>
</DataTable>
```

**💡 Note**:

- `handleExport(format)`: Exports and automatically downloads with the name defined in the `export-filename` prop
- `refresh()`: Refreshes data from the server

### `cell-{key}`

**Dynamic** slot to customize cell rendering. Exposes `{ row, value, column }`:

```vue
<template #cell-logo="{ row }">
  <img :src="getLogoUrl(row.logo)" :alt="row.name" class="w-10 h-10 object-contain" />
</template>

<template #cell-status="{ value }">
  <Badge :variant="value">{{ value }}</Badge>
</template>

<template #cell-actions="{ row }">
  <div class="flex gap-2">
    <Button size="sm" @click="edit(row)">Edit</Button>
    <Button size="sm" variant="destructive" @click="delete row">Delete</Button>
  </div>
</template>

<!-- Access to enriched metadata -->
<template #cell-price="{ value, column }">
  <span v-if="column.meta?.currency">
    {{ formatCurrency(value, column.meta.currency) }}
  </span>
  <span v-else>{{ value }}</span>
</template>
```

**🔗 Nested fields**:
For nested fields (e.g., `user.name`), use `__` (double underscore) instead of `.`:

```vue
<!-- Column key: 'user.name' -->
<template #cell-user__name="{ value }">
  <span class="font-medium">{{ value }}</span>
</template>

<!-- Column key: 'company.address.city' -->
<template #cell-company__address__city="{ value }">
  <Badge>{{ value }}</Badge>
</template>
```

**💡 Note**: If no slot is defined, the default rendering uses `formatCellValue()` with the type auto-detected from metadata.

### `empty`

Slot for empty state:

```vue
<template #empty>
  <div class="text-center p-10">
    <h3 class="text-lg font-medium">No data</h3>
    <p class="text-sm text-muted-foreground">Create your first item to get started</p>
    <Button @click="create">Create</Button>
  </div>
</template>
```

## 🔄 Sorting

Sorting is managed server-side via the `order_by` parameter:

- **Column clicks**: Columns with `sortable: true` allow sorting (asc → desc → reset)
- **URL synchronization**: Sorting is automatically added to query params (`?order_by=field:asc`)
- **Restoration**: On load, if `order_by` is present in URL, it's applied
- **Visual indicators**: Sorted columns display arrows (↑ asc, ↓ desc)
- **Multi-column support**: Format supports sorting on multiple columns (comma-separated)

**Sort format**:

```javascript
// In URL
?order_by=created_at:desc,name:asc

// In defaultOrderBy (prop)
['created_at:desc', 'name:asc']

// Single format (single column)
['name:asc']
```

## 🔄 Drag & Drop Reordering

When enabled, allows manual reordering of rows:

**Features**:

- Visual drag handle (⋮⋮) in dedicated column
- Smooth animation (200ms)
- Auto-save to server via `/api/dataset/resequence` endpoint
- Auto-refresh after successful reorder
- Loading state during save

**Requirements**:
Model must have:

- `metadata.sortable = true`
- `metadata.sortable_field` defined (e.g., `"sequence"`)

**Example**:

```vue
<DataTable model-name="task" :columns="columns" :sortable="true" :orderable="false" />
```

## 📊 Pagination

The pagination footer includes:

- **Item counter**: "Showing 1 to 100 of 500 results" (left)
- **Size selector**: Compact dropdown without label (default: 25, 50, 100, 150, 200) (right)
- **Navigation**: Previous/Next buttons + page numbers (max 5 visible pages) (right)

**URL Synchronization**:

- Parameters `p` (page) and `s` (size) are **automatically added to URL** (`?p=2&s=50`)
- On load, pagination is **restored from URL**
- Clean URLs: `p=1` is omitted for clarity

**URL Examples**:

```
/retail-chains              → p=1, s=100 (default)
/retail-chains?s=50         → p=1, s=50 (query param)
/retail-chains?p=3&s=25     → p=3, s=25
/retail-chains?p=2&s=75     → p=2, s=100 (75 invalid, fallback)
```

**Page size priority**:

1. **Query param** (`?s=50`) - absolute priority
2. **LocalStorage** (`datatable-page-size`) - user preference
3. **Default prop** (`page-size="100"`) - fallback

**Behavior**:

- When user changes page size, automatically returns to page 1
- Selected size is **saved in localStorage** and **synced with URL**
- This size is **automatically reused** across all DataTables in the application
- Data fetch is automatic on any change
- Validation: only sizes in `available-page-sizes` are accepted
- Customizable via `page-size` (default) and `available-page-sizes` (options) props

## 📤 Events

### `@row-click`

Emitted when a row is clicked (if `row-clickable` is `true`):

```vue
<DataTable row-clickable @row-click="handleRowClick" />

<script setup>
const handleRowClick = (row) => {
  console.log('Row clicked:', row);
};
</script>
```

### `@row-action`

Emitted when an action is triggered:

```vue
<DataTable :actions="actions" @row-action="handleAction" />

<script setup>
const handleAction = ({ action, row }) => {
  if (action === 'edit') {
    editItem(row);
  } else if (action === 'delete') {
    deleteItem(row);
  }
};
</script>
```

## 🔄 Exposed Methods

Use `ref` to access methods:

```vue
<template>
  <DataTable ref="tableRef" ... />
  <Button @click="refresh">Refresh</Button>
</template>

<script setup>
const tableRef = ref(null);

const refresh = () => {
  tableRef.value?.refresh();
};
</script>
```

### `refresh()`

Refreshes data from the server.

### `exportData(format)`

Exports data with current filters and sorting.

**Parameters**:

- `format`: `'csv'` | `'xlsx'` | `'json'` (default: `'csv'`)

**Returns**: `Promise<Blob>` - The exported file

**Recommended usage via `actions` slot**:

```vue
<DataTable model-name="retail_chain" :columns="columns" export-filename="retail-chains">
  <template #actions="{ handleExport }">
    <Button @click="handleExport('csv')">
      <Download class="w-4 h-4 mr-2" />
      Export CSV
    </Button>
  </template>
</DataTable>
```

**Advanced usage via ref** (if custom logic needed):

```vue
<template>
  <DataTable ref="tableRef" model-name="retail_chain" :columns="columns" />
  <Button @click="customExport">Custom export</Button>
</template>

<script setup>
import { ref } from 'vue';
import { DataTable, downloadBlob } from '@/common/components/data-table';

const tableRef = ref(null);

const customExport = async () => {
  const blob = await tableRef.value?.exportData('csv');
  // Custom logic...
  downloadBlob(blob, `custom-${Date.now()}.csv`);
};
</script>
```

**💡 Note**:

- Export uses the **same filters and sorting** as current display
- **Errors are automatically displayed** via toast
- Filename is defined via `export-filename` prop

## 🌟 Complete Examples

### Example with metadata auto-detection

```vue
<template>
  <DataTable model-name="retail_chain" :columns="columns">
    <!-- Custom cell for logo -->
    <template #cell-logo="{ row }">
      <img :src="row.logo" :alt="row.name" class="w-10 h-10 object-contain" />
    </template>

    <!-- Custom cell for status -->
    <template #cell-is_active="{ value }">
      <Badge :variant="value ? 'success' : 'secondary'">
        {{ value ? 'Active' : 'Inactive' }}
      </Badge>
    </template>
  </DataTable>
</template>

<script setup>
import { DataTable } from '@/common/components/data-table';
import { Badge } from '@/common/components/ui/badge';

// Simplified columns - sortable and type are auto-detected from metadata
const columns = [
  { key: 'logo', label: 'Logo' }, // type auto-detected
  { key: 'name', label: 'Name' }, // sortable auto-detected
  { key: 'is_active', label: 'Status' }, // boolean type auto-detected
  { key: 'created_at', label: 'Created at' }, // datetime type auto-detected, sortable auto
];
</script>
```

### Example with nested fields

```vue
<template>
  <DataTable model-name="job" :columns="columns">
    <!-- Custom cell for user.name (nested field) -->
    <template #cell-user__name="{ value, row }">
      <div class="flex items-center gap-2">
        <Avatar :src="row.user?.avatar" />
        <span class="font-medium">{{ value }}</span>
      </div>
    </template>

    <!-- Custom cell for company.address.city (deeply nested) -->
    <template #cell-company__address__city="{ value }">
      <Badge variant="outline">{{ value }}</Badge>
    </template>
  </DataTable>
</template>

<script setup>
import { DataTable } from '@/common/components/data-table';

const columns = [
  { key: 'title', label: 'Title' },
  { key: 'user.name', label: 'User' }, // Nested field
  { key: 'company.name', label: 'Company' }, // Nested field
  { key: 'company.address.city', label: 'City' }, // Deeply nested
  { key: 'created_at', label: 'Created at' },
];
</script>
```

### Example with filters and relations

```vue
<template>
  <DataTable
    model-name="job"
    :columns="columns"
    :additional-fields="['owner.avatar']"
    :actions="actions"
    :default-sort="{ field: 'created_at', direction: 'desc' }"
    @row-action="handleAction"
  >
    <template #filters="{ updateFilter }">
      <Select @update:model-value="updateStatusFilter(updateFilter, $event)">
        <SelectTrigger>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem :value="null">All</SelectItem>
          <SelectItem value="todo">To do</SelectItem>
          <SelectItem value="done">Done</SelectItem>
        </SelectContent>
      </Select>
    </template>

    <template #cell-status__name="{ row }">
      <Badge :style="{ backgroundColor: row.status.color }">
        {{ row.status.name }}
      </Badge>
    </template>

    <template #cell-owner__email="{ value }">
      <a :href="`mailto:${value}`" class="text-primary hover:underline">
        {{ value }}
      </a>
    </template>
  </DataTable>
</template>

<script setup>
const columns = [
  { key: 'id', label: 'ID', sortable: true, width: '80px' },
  { key: 'status.name', label: 'Status', sortable: true },
  { key: 'mission.name', label: 'Mission', sortable: true },
  { key: 'owner.email', label: 'Owner', sortable: true },
  { key: 'created_at', label: 'Created at', sortable: true, type: 'date' },
];

const actions = [
  { label: 'Edit', icon: Edit, handler: (row) => edit(row) },
  { separator: true },
  { label: 'Delete', icon: Trash2, variant: 'destructive', handler: (row) => deleteItem(row) },
];

const updateStatusFilter = (updateFilter, value) => {
  if (!value) {
    updateFilter(null);
    return;
  }
  updateFilter(['status.name', '=', value]);
};

const handleAction = ({ action, row }) => {
  // Handle actions
};
</script>
```

## 🔍 FastEdgy Features Used

- **Pagination**: `limit` and `offset` via `page` and `size`
  - Integrated page size selector (25, 50, 100, 150, 200 items, default: 100)
  - localStorage persistence for global reuse
  - Page number navigation
  - Displayed items counter
- **Sorting**: `order_by` with dot notation support
- **Filters**: `X-Filter` header with Query Builder
- **Field selection**: Automatic `X-Fields` header from columns
- **Relations**: Full nested fields support (e.g., `user.profile.name`)
- **Reordering**: Drag & drop with `/api/dataset/resequence` endpoint

## 📚 See Also

- [FastEdgy Query Builder Documentation](https://fastedgy.krafter.io/dev/features/query-builder/)
- [FastEdgy Fields Selector Documentation](https://fastedgy.krafter.io/dev/features/fields-selector/)
- [FastEdgy Pagination Documentation](https://fastedgy.krafter.io/dev/features/pagination/)
