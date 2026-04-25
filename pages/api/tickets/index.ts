import type { NextApiRequest, NextApiResponse } from 'next'
import { TICKETS } from '@/lib/mockData'
import { Ticket } from '@/types'

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Ticket[]>
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).end()
  }

  setTimeout(() => {
    res.status(200).json(TICKETS.map(ticket => ({ ...ticket })))
  }, 200)
}
