import MalApi from "@/lib/malApi"
import { userStatusList, userStatusReverseMap } from "@/utils/constants"
import { getAnimeObj, getWatchedPercentage } from "@/utils/malService"
import { useEffect, useState } from "react"
import Loader from "./loader"
import Progressbar from "./progress-bar"
import ScoreSelect from "./score-select"
import SquareIcon from "./square-icon"

const Table = ({ animeList, malAccessToken }) => {
  const [animeDataList, setAnimeDataList] = useState([])
  const [loading, isLoading] = useState(true)

  useEffect(() => {
    let dataList = getAnimeObj(animeList)
    setAnimeDataList(dataList)
    isLoading(false)
  }, [])

  const handleWatchIncrement = async (e) => {
    e.preventDefault()

    // Get anime id
    const animeId = e.target.id

    // Increment watched episodes by one on click of plus
    let newList = []
    let prevWatchedEpisodes = 0
    let watchedEpisodes = 0
    let totalEpisodes = 0
    let currentStatus = undefined
    animeDataList.forEach((dataObj) => {
      if (parseInt(dataObj.id) === parseInt(animeId)) {
        prevWatchedEpisodes = dataObj.episodesWatched
        dataObj.incrementWatchedEpisodes()
        watchedEpisodes = dataObj.episodesWatched
        totalEpisodes = dataObj.totalEpisodes
        currentStatus = dataObj.userStatus
      }
      newList.push(dataObj)
    })
    setAnimeDataList(newList)

    // Call MAL api to update anime status
    const fieldsToUpdate = {
      num_watched_episodes: watchedEpisodes,
    }
    if (malAccessToken) {
      const malApi = new MalApi(malAccessToken)
      const res = await malApi.updateList(animeId, fieldsToUpdate)

      if (200 === res.status) {
        if (
          watchedEpisodes === totalEpisodes &&
          currentStatus !== "completed"
        ) {
          await changeCurrentUserStatus(animeId, "completed")
        } else if (
          parseInt(prevWatchedEpisodes) === 0 &&
          currentStatus !== "watching"
        ) {
          await changeCurrentUserStatus(animeId, "watching")
        }
        isLoading(false)
      } else {
        alert("Couldn't update animelist")
      }
    } else {
      alert("Couldn't fetch local user data")
    }
  }

  const handleWatchDecrement = async (e) => {
    e.preventDefault()

    // Get anime id
    const animeId = e.target.id

    // Decrement watched episodes by one on click of minus
    let newList = []
    let watchedEpisodes = 0
    animeDataList.forEach((dataObj) => {
      if (parseInt(dataObj.id) === parseInt(animeId)) {
        dataObj.decrementWatchedEpisodes()
        watchedEpisodes = dataObj.episodesWatched
      }
      newList.push(dataObj)
    })

    setAnimeDataList(newList)

    // call MAL api to update
    const fieldsToUpdate = {
      num_watched_episodes: watchedEpisodes,
    }
    if (malAccessToken) {
      const malApi = new MalApi(malAccessToken)
      const res = await malApi.updateList(animeId, fieldsToUpdate)

      if (200 === res.status) {
        isLoading(false)
      } else {
        alert("Couldn't update animelist")
      }
    } else {
      alert("Couldn't fetch access token from parent")
    }
  }

  const handleStatusChange = async (e) => {
    e.preventDefault()

    // Get target status
    const targetStatus = e.target.value
    // Get anime id
    const animeId = e.target.id

    await changeCurrentUserStatus(animeId, targetStatus)
  }

  const changeCurrentUserStatus = async (animeId, targetStatus) => {
    // Change status of anime in local list
    let newList = []
    animeDataList.forEach((dataObj) => {
      if (parseInt(dataObj.id) === parseInt(animeId)) {
        dataObj.setUserStatus(targetStatus)
      } else {
        newList.push(dataObj)
      }
    })
    setAnimeDataList(newList)

    // Update in MAL DB using API call
    const fieldsToUpdate = {
      status: targetStatus,
    }
    if (malAccessToken) {
      const malApi = new MalApi(malAccessToken)
      const res = await malApi.updateList(animeId, fieldsToUpdate)

      if (200 === res.status) {
        isLoading(false)
      } else {
        alert("Couldn't update animelist")
      }
    } else {
      alert("Couldn't fetch local user data")
    }
  }
  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="card">
          <div className="card-body">
            <table className="table">
              <thead style={{ textAlign: "center" }}>
                <tr>
                  <th scope="col"></th>
                  <th scope="col">Anime Title</th>
                  <th scope="col">Progress</th>
                  <th scope="col">Score</th>
                  <th scope="col">Type</th>
                  <th scope="col">Season</th>
                  <th scope="col">Change Status</th>
                </tr>
              </thead>
              <tbody>
                {animeDataList?.map((anime) => (
                  <tr key={anime.id} className="col">
                    <th>
                      {" "}
                      <SquareIcon
                        squareColor={anime.status.color}
                        title={anime.status.value}
                      />
                    </th>
                    <td
                      className="col-3"
                      style={{ paddingLeft: "0px", paddingRight: "0px" }}
                    >
                      {anime.title}
                    </td>
                    <td
                      className="col-3"
                      style={{ paddingLeft: "0px", paddingRight: "0px" }}
                    >
                      <div
                        className="row"
                        style={{ paddingLeft: "0px", paddingRight: "0px" }}
                      >
                        {/* Decrement watched episodes */}
                        <div className="col-1">
                          {anime.episodesWatched > 0 &&
                          anime.episodesWatched <= anime.totalEpisodes &&
                          (userStatusReverseMap[anime.userStatus] ===
                            "watching" ||
                            userStatusReverseMap[anime.userStatus] ===
                              "on_hold" ||
                            userStatusReverseMap[anime.userStatus] ===
                              "plan_to_watch") ? (
                            <button
                              type="button"
                              className="btn btn-sm"
                              onClick={handleWatchDecrement}
                            >
                              <i className="bi bi-dash" id={anime.id}></i>
                            </button>
                          ) : (
                            ""
                          )}
                        </div>
                        {/* End Decrement watched episodes */}

                        {/* Progress Bar */}
                        <div className="col-5" style={{ paddingRight: "0px" }}>
                          <Progressbar
                            fillPercentage={getWatchedPercentage(
                              anime.episodesWatched,
                              anime.totalEpisodes
                            )}
                          />
                        </div>
                        {/* End Progress Bar */}

                        {/* Increment watched episodes */}
                        <div
                          className="col-1"
                          style={{ paddingLeft: "0px", paddingRight: "0px" }}
                        >
                          {anime.episodesWatched >= 0 &&
                          anime.episodesWatched < anime.totalEpisodes &&
                          (userStatusReverseMap[anime.userStatus] ===
                            "watching" ||
                            userStatusReverseMap[anime.userStatus] ===
                              "on_hold" ||
                            userStatusReverseMap[anime.userStatus] ===
                              "plan_to_watch") ? (
                            <button
                              type="button"
                              className="btn btn-sm"
                              style={{ padding: "0px" }}
                              onClick={handleWatchIncrement}
                            >
                              <i className="bi bi-plus" id={anime.id}></i>
                            </button>
                          ) : (
                            ""
                          )}
                        </div>
                        {/* End Increment watched episodes */}

                        {/* Value of watched/total episodes */}
                        <div
                          className="col-4"
                          style={{ paddingLeft: "0px", paddingRight: "0px" }}
                        >
                          {anime.episodesWatched + "/" + anime.totalEpisodes}
                        </div>
                        {/* End Value of watched/total episodes */}
                      </div>
                    </td>
                    <td
                      className="col-2"
                      style={{ paddingLeft: "0px", paddingRight: "0px" }}
                    >
                      <ScoreSelect
                        selectedVal={anime.userScore}
                        animeID={anime.id}
                        malAccessToken={malAccessToken}
                        isLoading={isLoading}
                      />
                    </td>
                    <td
                      className="col-1"
                      style={{
                        textAlign: "center",
                        paddingLeft: "0px",
                        paddingRight: "0px",
                      }}
                    >
                      {anime.mediaType}
                    </td>
                    <td
                      className="col-1"
                      style={{
                        textAlign: "center",
                        paddingLeft: "0px",
                        paddingRight: "0px",
                      }}
                    >
                      {anime.startSeason + " " + anime.startSeasonYear}
                    </td>
                    <td className="col-2" style={{ paddingRight: "0px" }}>
                      <select
                        className="form-select"
                        id={anime.id}
                        value={userStatusReverseMap[anime.userStatus]}
                        onChange={handleStatusChange}
                      >
                        {userStatusList.map((userStatus) => (
                          <option
                            key={userStatus.apiValue}
                            value={userStatus.apiValue}
                          >
                            {userStatus.pageTitle}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}

export default Table
