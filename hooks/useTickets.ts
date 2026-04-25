import { useCallback, useRef } from 'react'
import useSWR from 'swr'
import { Ticket } from '@/types'

const TICKETS_ENDPOINT = '/api/tickets'

async function fetcher(url: string): Promise<Ticket[]> {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`Failed to fetch tickets from ${url}`)
  }

  return response.json()
}

export function useTickets() {
  const { data, error, isLoading, mutate } = useSWR<Ticket[]>(
    TICKETS_ENDPOINT,
    fetcher
  )
  const pendingReadIdsRef = useRef<Set<string>>(new Set())

  const tickets = data ?? []
  const unreadCount = tickets.filter(ticket => ticket.unread).length

  const markTicketAsRead = useCallback(async (ticketId: string) => {
    const targetTicket = data?.find(ticket => ticket.id === ticketId)

    if (
      !targetTicket ||
      !targetTicket.unread ||
      pendingReadIdsRef.current.has(ticketId)
    ) {
      return
    }

    pendingReadIdsRef.current.add(ticketId)

    try {
      await mutate(
        async currentTickets => {
          const response = await fetch(`/api/tickets/${ticketId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ unread: false }),
          })

          if (!response.ok) {
            throw new Error(`Failed to mark ticket ${ticketId} as read`)
          }

          const updatedTicket: Ticket = await response.json()

          return (currentTickets ?? []).map(ticket =>
            ticket.id === ticketId ? updatedTicket : ticket
          )
        },
        {
          optimisticData: currentTickets =>
            (currentTickets ?? []).map(ticket =>
              ticket.id === ticketId ? { ...ticket, unread: false } : ticket
            ),
          rollbackOnError: true,
          populateCache: true,
          revalidate: false,
        }
      )
    } catch (error) {
      console.error('Failed to mark ticket as read', error)
    } finally {
      pendingReadIdsRef.current.delete(ticketId)
    }
  }, [data, mutate])

  return {
    tickets,
    unreadCount,
    isLoading,
    error,
    markTicketAsRead,
  }
}
