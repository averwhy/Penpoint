<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import {
        FlexRender,
        createSvelteTable,
        renderComponent,
        renderSnippet,
    } from "$lib/components/ui/data-table/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import * as Table from "$lib/components/ui/table/index.js";
    import { Event } from "$lib/models";
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
    import DataTableActions from "./event-requests-table-actions.svelte";
    import DataTableCheckbox from "./event-requests-table-checkbox.svelte";

    interface Props {
        data: Event[];
    }

    type EventRequestsColumn = {
        id: string;
        eventId: string;
        eventName: string;
        location: string;
        points: number;
        special_requests: string | null;
    };

    const { data }: Props = $props();

    const eventRequestsData: EventRequestsColumn[] = $derived(
        data.map(event => ({
            id: event.id,
            eventId: event.id,
            eventName: event.name,
            location: event.location,
            points: event.point_value,
            special_requests: event.special_requests,
        })),
    );

    const columns: ColumnDef<EventRequestsColumn>[] = [
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
            accessorKey: "eventName",
            header: "Event Name",
            cell: ({ row }) => {
                const nameSnippet = createRawSnippet<[{ name: string }]>(getName => {
                    const { name } = getName();
                    return {
                        render: () => `<div class="capitalize">${name}</div>`,
                    };
                });
                return renderSnippet(nameSnippet, {
                    name: row.original.eventName,
                });
            },
        },
        {
            accessorKey: "location",
            header: "Location",
            cell: ({ row }) => {
                const locationSnippet = createRawSnippet<[{ location: string }]>(getLocation => {
                    const { location } = getLocation();
                    return {
                        render: () => `<div class="capitalize">${location}</div>`,
                    };
                });
                return renderSnippet(locationSnippet, {
                    location: row.original.location,
                });
            },
        },
        {
            accessorKey: "points",
            header: "Points",
            cell: ({ row }) => {
                const pointsSnippet = createRawSnippet<[{ points: number }]>(getPoints => {
                    const { points } = getPoints();
                    return {
                        render: () => `<div>${points}</div>`,
                    };
                });
                return renderSnippet(pointsSnippet, {
                    points: row.original.points,
                });
            },
        },
        {
            accessorKey: "specialRequests",
            header: "Special Requests",
            cell: ({ row }) => {
                const requestsSnippet = createRawSnippet<[{ hasRequests: boolean }]>(getRequests => {
                    const { hasRequests } = getRequests();
                    return {
                        render: () =>
                            `<div class="text-sm text-muted-foreground">${hasRequests ? "Yes" : "None"}</div>`,
                    };
                });
                return renderSnippet(requestsSnippet, {
                    hasRequests: !!row.original.special_requests,
                });
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) =>
                renderComponent(DataTableActions, {
                    requestId: row.original.id,
                    eventId: row.original.eventId,
                    specialRequests: row.original.special_requests,
                }),
        },
    ];

    let pagination = $state<PaginationState>({ pageIndex: 0, pageSize: 10 });
    let sorting = $state<SortingState>([]);
    let columnFilters = $state<ColumnFiltersState>([]);
    let rowSelection = $state<RowSelectionState>({});
    let columnVisibility = $state<VisibilityState>({});

    const table = createSvelteTable({
        get data() {
            return eventRequestsData;
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
            placeholder="Filter events..."
            value={(table.getColumn("eventName")?.getFilterValue() as string) ?? ""}
            oninput={e => table.getColumn("eventName")?.setFilterValue(e.currentTarget.value)}
            onchange={e => {
                table.getColumn("eventName")?.setFilterValue(e.currentTarget.value);
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
                        bind:checked={() => column.getIsVisible(), v => column.toggleVisibility(!!v)}
                    >
                        {column.columnDef.header}
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
                        <Table.Cell colspan={columns.length} class="h-24 text-center"
                            >No results... maybe you can relax?</Table.Cell
                        >
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
