import { useCallback, useState } from "react"
import { PaginatedRequestParams, PaginatedResponse, Transaction } from "../utils/types"
import { PaginatedTransactionsResult } from "./types"
import { useCustomFetch } from "./useCustomFetch"

export function usePaginatedTransactions(): PaginatedTransactionsResult {
  const { fetchWithoutCache, loading } = useCustomFetch()
  const [paginatedTransactions, setPaginatedTransactions] = useState<PaginatedResponse<
    Transaction[]
  > | null>(null)

  const fetchAll = useCallback(async () => {
    // BUG7: Old approval values are being cached, use fetchWithoutCache
    // Alternatively, to reduce unnecessary wait times, invalidate the data after the checkboxes are clicked
    const response = await fetchWithoutCache<PaginatedResponse<Transaction[]>, PaginatedRequestParams>(
      "paginatedTransactions",
      {
        page: paginatedTransactions === null ? 0 : paginatedTransactions.nextPage,
      }
    )
    setPaginatedTransactions((previousResponse) => {
      if (response === null || previousResponse === null) {
        return response
      }
      if (
        response.data[response.data.length - 1].id !==
        previousResponse.data[previousResponse.data.length - 1].id
      )
        return { data: [...previousResponse.data, ...response.data], nextPage: response.nextPage }

      return { data: previousResponse.data, nextPage: response.nextPage }
    })
  }, [fetchWithoutCache, paginatedTransactions])

  const invalidateData = useCallback(() => {
    setPaginatedTransactions(null)
  }, [])

  return { data: paginatedTransactions, loading, fetchAll, invalidateData }
}
