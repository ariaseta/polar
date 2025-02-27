'use client'

import { DashboardBody } from '@/components/Layout/DashboardLayout'
import { InlineModal } from '@/components/Modal/InlineModal'
import { useModal } from '@/components/Modal/useModal'
import EditWebhookModal from '@/components/Settings/Webhook/EditWebhookModal'
import DeliveriesTable from '@/components/Settings/Webhook/WebhookDeliveriesTable'
import { useWebhookEndpoint } from '@/hooks/queries'
import {
  DataTablePaginationState,
  DataTableSortingState,
} from '@/utils/datatable'
import { schemas } from '@polar-sh/client'
import Button from '@polar-sh/ui/components/atoms/Button'
import { Checkbox } from '@polar-sh/ui/components/ui/checkbox'
import { useParams } from 'next/navigation'

export default function ClientPage({
  organization,
  pagination,
  sorting,
}: {
  organization: schemas['Organization']
  pagination: DataTablePaginationState
  sorting: DataTableSortingState
}) {
  const {
    isShown: isEditWeebhookEndpointModalShown,
    hide: hideEditWebhookEndpointModal,
    show: showEditWebhookEndpointModal,
  } = useModal()

  const { id }: { id: string } = useParams()

  const { data: endpoint } = useWebhookEndpoint(id)

  if (!endpoint) {
    return null
  }

  return (
    <DashboardBody title="Webhook">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-y-1">
          <h3>Endpoint</h3>
          <pre className="text-sm text-gray-950 dark:text-white">
            {endpoint.url}
          </pre>
        </div>

        <div className="flex flex-col gap-y-4">
          <h3>Events</h3>

          <div className="flex flex-col space-y-2">
            {endpoint.events.length > 0 ? (
              <>
                {endpoint.events.map((event) => (
                  <div
                    className="flex flex-row items-center space-x-3 space-y-0"
                    key={event}
                  >
                    <Checkbox checked={true} disabled={true} />
                    <span className="text-sm leading-none">{event}</span>
                  </div>
                ))}
              </>
            ) : (
              <span>This endpoint is not subscribing to any events</span>
            )}
          </div>
        </div>

        <Button
          className="self-start"
          asChild
          onClick={showEditWebhookEndpointModal}
        >
          Edit
        </Button>

        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-medium">Deliveries</h2>
        </div>
        <DeliveriesTable
          endpoint={endpoint}
          pagination={pagination}
          sorting={sorting}
          organization={organization}
        />
      </div>
      <InlineModal
        isShown={isEditWeebhookEndpointModalShown}
        hide={hideEditWebhookEndpointModal}
        modalContent={
          <EditWebhookModal
            organization={organization}
            endpoint={endpoint}
            hide={hideEditWebhookEndpointModal}
          />
        }
      />
    </DashboardBody>
  )
}
