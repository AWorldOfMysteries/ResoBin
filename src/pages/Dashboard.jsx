import axios from 'axios'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'

import { courseChecksumAPI } from 'api/courses'
import { Menu } from 'components/menu'
import { LoaderAnimation } from 'components/shared'
import { toastError } from 'components/toast'
import PageTransition from 'hoc/PageTransition'
import { useScrollToTop } from 'hooks'
import { DashboardRoutes } from 'routes'
import { getProfileAction, selectAuthLoading } from 'store/authSlice'
import {
  getCourseList,
  getCourseSlots,
  selectChecksum,
  selectCourseAPILoading,
  updateChecksum,
} from 'store/courseSlice'

const Dashboard = () => {
  useScrollToTop()
  const location = useLocation()
  const page = location.pathname.split('/')[1] || '/'
  const dispatch = useDispatch()
  const checksum = useSelector(selectChecksum)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // ? Fetch user profile
    dispatch(getProfileAction())

    const getChecksum = async (prevChecksum) =>
      axios
        .get(courseChecksumAPI)
        .then(({ data }) => {
          // TODO: This is a hack to get the menu to update
          if (data.checksum !== prevChecksum) {
            dispatch(updateChecksum(data))
            dispatch(getCourseList())
            dispatch(getCourseSlots())
          }
          return setLoading(false)
        })
        .catch((error) => {
          toastError(error.message)
        })

    setLoading(true)
    getChecksum(checksum)
  }, [checksum, dispatch])

  const loadingAPI = [
    useSelector(selectCourseAPILoading),
    useSelector(selectAuthLoading),
  ]

  return loadingAPI.includes(true) || loading ? (
    <LoaderAnimation fixed />
  ) : (
    <>
      <Menu />

      {/* Add transition effect to route changes */}
      <PageTransition page={page}>
        <DashboardRoutes />
      </PageTransition>
    </>
  )
}

export default Dashboard
