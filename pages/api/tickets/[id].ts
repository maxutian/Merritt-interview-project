import type { NextApiRequest, NextApiResponse } from 'next'
import { TICKETS } from '@/lib/mockData'
import { Ticket } from '@/types'

type TicketResponse = Ticket | { error: string }

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<TicketResponse>
) {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', ['PATCH'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const rawId = req.query.id
  const ticketId = Array.isArray(rawId) ? rawId[0] : rawId

  const ticket = TICKETS.find(entry => entry.id === ticketId)

  if (!ticket) {
    return res.status(404).json({ error: 'Ticket not found' })
  }

  if (req.body?.unread !== undefined && req.body.unread !== false) {
    return res.status(400).json({ error: 'Only unread=false is supported' })
  }

  setTimeout(() => {
    ticket.unread = false
    res.status(200).json({ ...ticket })
  }, 200)
}
