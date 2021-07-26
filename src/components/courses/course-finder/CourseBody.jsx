import debounce from 'lodash/debounce'
import { useState, useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import styled from 'styled-components/macro'

import { CourseList, CourseSearch } from 'components/courses/course-finder'
import { FilterAside, FilterFloatButton } from 'components/filter'
import { toastError } from 'components/toast'
import { useViewportContext } from 'context/ViewportContext'
import { searchAsync } from 'helpers'
import {
  selectCourseList,
  selectCourseSearch,
  setSearch,
} from 'store/courseSlice'
import { breakpoints } from 'styles/responsive'

const Container = styled.div`
  width: 100%;
`

const searchFields = ['Code', 'Title', 'Description']

const CourseBody = () => {
  const dispatch = useDispatch()

  // ? responsive layout state
  const { width } = useViewportContext()

  // ? show or hide dropdown filters state
  const [showFilter, setShowFilter] = useState(false)

  // ? total course data
  const courseData = useSelector(selectCourseList)

  // ? filtered course data
  // const [search, setSearch] = useState('')
  const search = useSelector(selectCourseSearch)
  const [courseDataFiltered, setCourseDataFiltered] = useState([])

  // ? search input state
  const handleChange = (event) => dispatch(setSearch(event.currentTarget.value))

  // ? loading status while searching
  const [loadingResults, setLoadingSearchResults] = useState(true)

  // ? searching courses asynchronously
  const searchCourses = (searchParams) => {
    searchAsync(searchParams)
      .then(setCourseDataFiltered)
      .then(() => setLoadingSearchResults(false))
      .catch((error) => {
        toastError(error.message)
        setLoadingSearchResults(false)
      })
  }

  // ? debounce search input change to provide smoother search experience
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const searchCoursesDebounced = useCallback(debounce(searchCourses, 400), [])

  useEffect(() => {
    setLoadingSearchResults(true)
    searchCoursesDebounced({
      dataSrc: courseData,
      dataKeys: searchFields,
      keywords: search,
    })
  }, [courseData, search, searchCoursesDebounced])

  return (
    <Container>
      <CourseSearch
        loading={loadingResults}
        value={search}
        onChange={handleChange}
        showFilter={width < breakpoints.lg && showFilter}
        filterState={null}
      />

      <FilterAside showFilter={width >= breakpoints.lg} />
      <FilterFloatButton
        showFilter={showFilter}
        setShowFilter={setShowFilter}
      />

      <CourseList courses={courseDataFiltered} loading={loadingResults} />
    </Container>
  )
}

export default CourseBody
