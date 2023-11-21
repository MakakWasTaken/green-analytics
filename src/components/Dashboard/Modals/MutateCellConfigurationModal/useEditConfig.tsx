import axios from 'axios'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import useSWR from 'swr'

const useEditConfig = () => {
  const [config, setConfig] = useState<any>()
  const [loading, setLoading] = useState(false)

  const loadConfig = useCallback(async () => {
    try {
      setLoading(true)

      const response = await axios.get('/editCellConfiguration.json')

      setConfig(response.data)
    } catch (err: any) {
      toast.error(err.message || err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadConfig()
  }, [loadConfig])

  return {
    config,
    loading,
  }
}

export default useEditConfig
