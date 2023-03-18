import React, { Component } from "react"

class SearchInput extends Component {
  render() {
    return (
      <form className="col-12 col-lg-auto mb-3 mb-lg-0 me-lg-3" role="search">
        <input
          type="search"
          className="form-control"
          placeholder="Search..."
          aria-label="Search"
        />
      </form>
    )
  }
}

export default SearchInput