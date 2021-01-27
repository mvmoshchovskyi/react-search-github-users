import React, { useState, useEffect } from 'react'
import mockUser from './mockData.js/mockUser'
import mockRepos from './mockData.js/mockRepos'
import mockFollowers from './mockData.js/mockFollowers'
import axios from 'axios'

const rootUrl = 'https://api.github.com'

const GithubContext = React.createContext()

//Provider. consumer - GithubContext.Provider

const GithubProvider = ({ children }) => {
  const [githubUser, setGithubUser] = useState(mockUser)
  const [repos, setRepos] = useState(mockRepos)
  const [followers, setfollowerd] = useState(mockFollowers)

  //reques loading
  const [requests, setRequests] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState({ throw: false, msg: '' })

  const searchGithubUser = async (user) => {
    toggleError()
    setIsLoading(true)
    const response = await axios(`${rootUrl}/users/${user}`).catch((err) =>
      console.log(err)
    )
    if (response) {
      setGithubUser(response.data)
      const { login, followers_url } = response.data
      await Promise.allSettled([
        axios(`${rootUrl}/users/${login}/repos?per_page=100`),
        axios(`${followers_url}?per_page=100`),
      ]).then((results) => {
        const [repos, followers] = results
        const status = 'fulfilled'
        if (repos.status === status) {
          setRepos(repos.value.data)
        }
        if (followers.status === status) {
          setRepos(repos.value.data)
        }
      }).catch(console.log('err'))
    } else {
      toggleError(true, 'there is no user whith this name')
    }
    checkRequest()
    setIsLoading(false)
  }
  const checkRequest = () => {
    axios(`${rootUrl}/rate_limit`)
      .then(({ data }) => {
        let {
          rate: { remaining },
        } = data
        // remaining=0
        setRequests(remaining)
        if (remaining === 0) {
          toggleError(true, 'sory you have exeeded your hourly limit!')
        }
      })
      .catch((err) => console.log(err))
  }
  function toggleError(show = false, msg = '') {
    setError({ show, msg })
  }
  useEffect(checkRequest, [])
  return (
    <GithubContext.Provider
      value={{
        searchGithubUser,
        githubUser,
        repos,
        followers,
        requests,
        error,
        isLoading,
      }}
    >
      {children}
    </GithubContext.Provider>
  )
}
export { GithubProvider, GithubContext }
