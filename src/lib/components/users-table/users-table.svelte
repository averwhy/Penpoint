<script lang="ts">
    import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
    import {
        type ColumnDef,
        type ColumnFiltersState,
        type PaginationState,
        type RowSelectionState,
        type SortingState,
        type VisibilityState,
        getCoreRowModel,
        getFilteredRowModel,
        getPaginationRowModel,
        getSortedRowModel,
    } from "@tanstack/table-core";
    import { createRawSnippet } from "svelte";
    import DataTableCheckbox from "$lib/components/users-table/users-table-checkbox.svelte";
    import DataTableActions from "$lib/components/users-table/users-table-actions.svelte";
    import DateWithRelativeTooltip from "$lib/components/date-with-relative-tooltip.svelte";
    import * as Table from "$lib/components/ui/table/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import {
        FlexRender,
        createSvelteTable,
        renderComponent,
        renderSnippet,
    } from "$lib/components/ui/data-table/index.js";
    import { User } from "$lib/models";
    import { email } from "zod";

    interface Props {
        data: User[];
    }

    type UserColumn = {
        id: string;
        name: string;
        email: string;
        role: string;
        last_login: Date;
        created_at: Date;
    };

    const { data }: Props = $props();

    const usersData = $derived(
        data.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            last_login: user.last_login,
            created_at: user.created_at,
        })),
    );

    const columns: ColumnDef<UserColumn>[] = [
        {
            id: "select",
            header: ({ table }) =>
                renderComponent(DataTableCheckbox, {
                    checked: table.getIsAllPageRowsSelected(),
                    indeterminate: table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected(),
                    onCheckedChange: value => table.toggleAllPageRowsSelected(!!value),
                    "aria-label": "Select all",
                }),
            cell: ({ row }) =>
                renderComponent(DataTableCheckbox, {
                    checked: row.getIsSelected(),
                    onCheckedChange: value => row.toggleSelected(!!value),
                    "aria-label": "Select row",
                }),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => {
                const nameSnippet = createRawSnippet<[{ name: string }]>(getName => {
                    const { name } = getName();
                    return {
                        render: () => `<div class="capitalize">${name}</div>`,
                    };
                });
                return renderSnippet(nameSnippet, {
                    name: row.original.name,
                });
            },
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => {
                const roleSnippet = createRawSnippet<[{ role: string }]>(getRole => {
                    const { role } = getRole();
                    return {
                        render: () => `<div class="capitalize">${role}</div>`,
                    };
                });
                return renderSnippet(roleSnippet, {
                    role: row.original.role,
                });
            },
        },
        {
            accessorKey: "last_login",
            header: "Last Login",
            cell: ({ row }) =>
                renderComponent(DateWithRelativeTooltip, {
                    date: row.original.last_login,
                    reverse: true,
                }),
        },
        {
            accessorKey: "created_at",
            header: "Created At",
            cell: ({ row }) =>
                renderComponent(DateWithRelativeTooltip, {
                    date: row.original.created_at,
                }),
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => renderComponent(DataTableActions, { id: row.original.id, email: row.original.email }),
        },
    ];

    let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
    let sorting = $state<SortingState>([]);
    let columnFilters = $state<ColumnFiltersState>([]);
    let rowSelection = $state<RowSelectionState>({});
    let columnVisibility = $state<VisibilityState>({});

    const table = createSvelteTable({
        get data() {
            return usersData;
        },
        columns,
        state: {
            get pagination() {
                return pagination;
            },
            get sorting() {
                return sorting;
            },
            get columnVisibility() {
                return columnVisibility;
            },
            get rowSelection() {
                return rowSelection;
            },
            get columnFilters() {
                return columnFilters;
            },
        },
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onPaginationChange: updater => {
            if (typeof updater === "function") {
                pagination = updater(pagination);
            } else {
                pagination = updater;
            }
        },
        onSortingChange: updater => {
            if (typeof updater === "function") {
                sorting = updater(sorting);
            } else {
                sorting = updater;
            }
        },
        onColumnFiltersChange: updater => {
            if (typeof updater === "function") {
                columnFilters = updater(columnFilters);
            } else {
                columnFilters = updater;
            }
        },
        onColumnVisibilityChange: updater => {
            if (typeof updater === "function") {
                columnVisibility = updater(columnVisibility);
            } else {
                columnVisibility = updater;
            }
        },
        onRowSelectionChange: updater => {
            if (typeof updater === "function") {
                rowSelection = updater(rowSelection);
            } else {
                rowSelection = updater;
            }
        },
    });
</script>

<div class="w-full">
    <div class="flex items-center py-4">
        <Input
            placeholder="Filter users..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            oninput={e => table.getColumn("name")?.setFilterValue(e.currentTarget.value)}
            onchange={e => {
                table.getColumn("name")?.setFilterValue(e.currentTarget.value);
            }}
            class="max-w-sm"
        />
        <DropdownMenu.Root>
            <DropdownMenu.Trigger>
                {#snippet child({ props })}
                    <Button {...props} variant="outline" class="ml-auto">
                        Columns <ChevronDownIcon class="ml-2 size-4" />
                    </Button>
                {/snippet}
            </DropdownMenu.Trigger>
            <DropdownMenu.Content align="end">
                {#each table.getAllColumns().filter(col => col.getCanHide()) as column (column)}
                    <DropdownMenu.CheckboxItem
                        class="capitalize"
                        bind:checked={() => column.getIsVisible(), v => column.toggleVisibility(!!v)}
                    >
                        {column.id}
                    </DropdownMenu.CheckboxItem>
                {/each}
            </DropdownMenu.Content>
        </DropdownMenu.Root>
    </div>
    <div class="rounded-md border">
        <Table.Root>
            <Table.Header>
                {#each table.getHeaderGroups() as headerGroup (headerGroup.id)}
                    <Table.Row>
                        {#each headerGroup.headers as header (header.id)}
                            <Table.Head class="[&:has([role=checkbox])]:pl-3">
                                {#if !header.isPlaceholder}
                                    <FlexRender
                                        content={header.column.columnDef.header}
                                        context={header.getContext()}
                                    />
                                {/if}
                            </Table.Head>
                        {/each}
                    </Table.Row>
                {/each}
            </Table.Header>
            <Table.Body>
                {#each table.getRowModel().rows as row (row.id)}
                    <Table.Row data-state={row.getIsSelected() && "selected"}>
                        {#each row.getVisibleCells() as cell (cell.id)}
                            <Table.Cell class="[&:has([role=checkbox])]:pl-3">
                                <FlexRender content={cell.column.columnDef.cell} context={cell.getContext()} />
                            </Table.Cell>
                        {/each}
                    </Table.Row>
                {:else}
                    <Table.Row>
                        <Table.Cell colspan={columns.length} class="h-24 text-center">No results... gulp.</Table.Cell>
                    </Table.Row>
                {/each}
            </Table.Body>
        </Table.Root>
    </div>
    <div class="flex items-center justify-end space-x-2 pt-4">
        <div class="text-muted-foreground flex-1 text-sm">
            {table.getFilteredSelectedRowModel().rows.length} of
            {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div class="space-x-2">
            <Button
                variant="outline"
                size="sm"
                onclick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
            >
                Previous
            </Button>
            <Button variant="outline" size="sm" onclick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                Next
            </Button>
        </div>
    </div>
</div>
