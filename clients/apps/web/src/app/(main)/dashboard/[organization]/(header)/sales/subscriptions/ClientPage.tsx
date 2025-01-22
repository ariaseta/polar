'use client'

import { DashboardBody } from '@/components/Layout/DashboardLayout'
import { InlineModal } from '@/components/Modal/InlineModal'
import { useModal } from '@/components/Modal/useModal'
import { SubscriptionModal } from '@/components/Subscriptions/SubscriptionModal'
import { SubscriptionStatus as SubscriptionStatusComponent } from '@/components/Subscriptions/SubscriptionStatus'
import SubscriptionStatusSelect from '@/components/Subscriptions/SubscriptionStatusSelect'
import SubscriptionTiersSelect from '@/components/Subscriptions/SubscriptionTiersSelect'
import { useListSubscriptions, useProducts } from '@/hooks/queries'
import { getServerURL } from '@/utils/api'
import {
  DataTablePaginationState,
  DataTableSortingState,
  getAPIParams,
  serializeSearchParams,
} from '@/utils/datatable'
import { FileDownloadOutlined } from '@mui/icons-material'
import {
  Organization,
  Product,
  Subscription,
  SubscriptionStatus,
} from '@polar-sh/api'
import { RowSelectionState } from '@tanstack/react-table'
import { useRouter } from 'next/navigation'
import { FormattedDateTime } from 'polarkit/components/ui/atoms'
import Avatar from 'polarkit/components/ui/atoms/avatar'
import Button from 'polarkit/components/ui/atoms/button'
import {
  DataTable,
  DataTableColumnDef,
  DataTableColumnHeader,
} from 'polarkit/components/ui/atoms/datatable'
import React, { useEffect, useState } from 'react'

interface ClientPageProps {
  organization: Organization
  pagination: DataTablePaginationState
  sorting: DataTableSortingState
  productId?: string
  subscriptionStatus?:
    | Extract<SubscriptionStatus, 'active' | 'canceled'>
    | 'any'
}

const ClientPage: React.FC<ClientPageProps> = ({
  organization,
  pagination,
  sorting,
  productId,
  subscriptionStatus,
}) => {
  const [selectedSubscriptionState, setSelectedSubscriptionState] =
    useState<RowSelectionState>({})
  const { show: showModal, hide: hideModal, isShown: isModalShown } = useModal()

  const subscriptionTiers = useProducts(organization.id, { isRecurring: true })

  const filter = productId || 'all'
  const status = subscriptionStatus || 'active'
  const getSearchParams = (
    pagination: DataTablePaginationState,
    sorting: DataTableSortingState,
    filter: string,
    status: string,
  ) => {
    const params = serializeSearchParams(pagination, sorting)
    if (filter !== 'all') {
      params.append('product_id', filter)
    }

    params.append('status', status)
    return params
  }

  const router = useRouter()

  const setPagination = (
    updaterOrValue:
      | DataTablePaginationState
      | ((old: DataTablePaginationState) => DataTablePaginationState),
  ) => {
    const updatedPagination =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(pagination)
        : updaterOrValue

    router.push(
      `/dashboard/${organization.slug}/sales/subscriptions?${getSearchParams(
        updatedPagination,
        sorting,
        filter,
        status,
      )}`,
    )
  }

  const setSorting = (
    updaterOrValue:
      | DataTableSortingState
      | ((old: DataTableSortingState) => DataTableSortingState),
  ) => {
    const updatedSorting =
      typeof updaterOrValue === 'function'
        ? updaterOrValue(sorting)
        : updaterOrValue

    router.push(
      `/dashboard/${organization.slug}/sales/subscriptions?${getSearchParams(
        pagination,
        updatedSorting,
        filter,
        status,
      )}`,
    )
  }

  const setFilter = (filter: string) => {
    router.push(
      `/dashboard/${organization.slug}/sales/subscriptions?${getSearchParams(
        pagination,
        sorting,
        filter,
        status,
      )}`,
    )
  }

  const setStatus = (status: string) => {
    router.push(
      `/dashboard/${organization.slug}/sales/subscriptions?${getSearchParams(
        pagination,
        sorting,
        filter,
        status,
      )}`,
    )
  }

  const subscriptionsHook = useListSubscriptions(organization.id, {
    ...getAPIParams(pagination, sorting),
    ...(productId ? { productId } : {}),
    ...(status !== 'any'
      ? {
          active: status === 'active',
        }
      : {}),
  })

  const subscriptions = subscriptionsHook.data?.items || []
  const pageCount = subscriptionsHook.data?.pagination.max_page ?? 1

  const selectedSubscription = subscriptions.find(
    (subscription) => selectedSubscriptionState[subscription.id],
  )

  useEffect(() => {
    if (selectedSubscription) {
      showModal()
    } else {
      hideModal()
    }
  }, [selectedSubscription, showModal, hideModal])

  const columns: DataTableColumnDef<Subscription>[] = [
    {
      id: 'customer',
      accessorKey: 'customer',
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer" />
      ),
      cell: ({ row: { original: subscription } }) => {
        const customer = subscription.customer
        return (
          <div className="flex flex-row items-center gap-2">
            <Avatar
              avatar_url={customer.avatar_url}
              name={customer.name || customer.email}
            />
            <div className="fw-medium">{customer.email}</div>
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row: { original: subscription } }) => {
        return <SubscriptionStatusComponent subscription={subscription} />
      },
    },
    {
      accessorKey: 'started_at',
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Subscription Date" />
      ),
      cell: (props) => (
        <FormattedDateTime datetime={props.getValue() as string} />
      ),
    },
    {
      accessorKey: 'current_period_end',
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Renewal Date" />
      ),
      cell: (props) => {
        const datetime = props.getValue() as string | null
        return datetime &&
          props.row.original.status === 'active' &&
          !props.row.original.cancel_at_period_end ? (
          <FormattedDateTime datetime={datetime} />
        ) : (
          '—'
        )
      },
    },
    {
      accessorKey: 'product',
      id: 'product',
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Product" />
      ),
      cell: (props) => {
        const tier = props.getValue() as Product
        return (
          <>
            {tier.name}
            {tier.is_archived && (
              <span className="ml-2 shrink-0 rounded-lg border border-yellow-200 bg-yellow-100 px-1.5 text-xs text-yellow-600 dark:border-yellow-600 dark:bg-yellow-700 dark:text-yellow-300">
                Archived
              </span>
            )}
          </>
        )
      },
    },
  ]

  const onExport = () => {
    const url = new URL(
      `${getServerURL()}/v1/subscriptions/export?organization_id=${organization.id}`,
    )

    window.open(url, '_blank')
  }

  return (
    <DashboardBody>
      <div className="flex flex-col gap-8">
        <div className="flex w-full flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <div className="w-auto">
              <SubscriptionStatusSelect
                statuses={['active', 'canceled']}
                value={subscriptionStatus || 'any'}
                onChange={setStatus}
              />
            </div>
            <div className="w-auto">
              <SubscriptionTiersSelect
                products={subscriptionTiers.data?.items || []}
                value={productId || 'all'}
                onChange={setFilter}
              />
            </div>
          </div>
          <Button
            onClick={onExport}
            className="flex flex-row items-center"
            variant={'secondary'}
            wrapperClassNames="gap-x-2"
          >
            <FileDownloadOutlined fontSize="inherit" />
            <span>Export</span>
          </Button>
        </div>
        {subscriptions && pageCount !== undefined && (
          <DataTable
            columns={columns}
            data={subscriptions}
            pageCount={pageCount}
            pagination={pagination}
            onPaginationChange={setPagination}
            sorting={sorting}
            onSortingChange={setSorting}
            isLoading={subscriptionsHook}
            onRowSelectionChange={(row) => {
              setSelectedSubscriptionState(row)
            }}
            rowSelection={selectedSubscriptionState}
            getRowId={(row) => row.id.toString()}
            enableRowSelection
          />
        )}
      </div>
      <InlineModal
        modalContent={
          <SubscriptionModal
            organization={organization}
            subscription={selectedSubscription}
          />
        }
        isShown={isModalShown}
        hide={() => {
          setSelectedSubscriptionState({})
          hideModal()
        }}
      />
    </DashboardBody>
  )
}

export default ClientPage
